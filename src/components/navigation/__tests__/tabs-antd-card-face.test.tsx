import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs } from "../tabs";

/**
 * THE CARD FACE, AND THE GLYPH IN IT — four deviations from antd, all reported from a screenshot
 * and all measured in Chromium on `/isolate/navigation-tabs` before being fixed.
 *
 *   1. A card tab STRETCHED. The base trigger is `flex-1`; antd's `nav-list` is a plain
 *      `display: flex` with no grow, so a card tab is content-width. Measured: three tabs in a
 *      942px strip came out 311px each for labels needing ~70px, and with `justify-center` the
 *      label and its × floated in the middle — the × sat 90px from the tab's own trailing edge
 *      (179px on a two-tab strip) where antd's is 8px. It also made the face read as a
 *      free-standing bordered box instead of a tab, which is what the report actually said.
 *
 *   2. The ACTIVE face painted a BLUE border on all four edges — measured
 *      `oklab(0.536747 -0.0539504 -0.134581 / 0.25)`, i.e. `border-primary/25`, against
 *      `rgb(215, 212, 209)` (`--border`) on its inactive siblings. That utility is the PILL
 *      variant's selected hairline and was scoped to `group-data-[variant=default]/tabs-list:`
 *      — but card variants forward `data-variant="default"` on the LIST on purpose, so the guard
 *      never held. Worse than the wrong hue: it also overrode the block-end edge that is supposed
 *      to merge into the panel, so the active tab was a closed box.
 *
 *   3. `placement="bottom"` was UPSIDE DOWN: radius still on the top corners, the merged edge
 *      still the bottom one, the rail still along the bottom — all three facing away from the
 *      panel, which for `bottom` sits above the strip.
 *
 *   4. A consumer `closeIcon` escaped the icon-size contract entirely: the size rule keyed on
 *      `.ui-tabs-tab-remove-icon`, a class only the DEFAULT × carries. Measured, the default × is
 *      12px and `closeIcon={<Trash2 />}` rendered at 24px — lucide's own default, 2x the tab's
 *      glyph, inside a 16px-tall tab.
 *
 * WHY THESE ARE SOURCE ASSERTIONS. Every one of the four is geometry or paint, and jsdom does
 * neither — it has no layout and no colours, so a render test can only see the class list, which
 * is the implementation rather than the contract. What IS checkable deterministically is the
 * statement each fix makes: the per-placement table covers all four placements and always opens
 * the edge facing the panel, the rail flips with the placement, and the icon rule selects the
 * WRAPPER'S CHILD so it cannot be escaped. The browser half lives in the isolate route that
 * `check:contrast` and `check:frame-axe` load.
 */

const ROOT = process.cwd();
const tabsSource = readFileSync(join(ROOT, "src/components/navigation/tabs.tsx"), "utf8");
const navigationCss = readFileSync(join(ROOT, "src/styles/navigation-layout.css"), "utf8");

/** The `CARD_FACE` table body, as authored. */
function cardFace(): string {
  const start = tabsSource.indexOf("const CARD_FACE");
  expect(start, "CARD_FACE table not found in tabs.tsx").toBeGreaterThan(-1);
  return tabsSource.slice(start, tabsSource.indexOf("\n  };", start));
}

/**
 * antd's `genCardStyle`, as the four blocks it actually ships. The edge named here is the one
 * antd repaints in `colorBgContainer` on the ACTIVE tab — always the edge facing the panel.
 */
const ANTD_CARD_MATRIX = [
  { placement: "top", opens: "b", antd: "borderBottomColor" },
  { placement: "bottom", opens: "t", antd: "borderTopColor" },
  // antd keeps left/right PHYSICAL (`_skip_check_: true`) and mirrors them in a second RTL sheet;
  // `start`/`end` are logical here, so the logical utility IS the port and needs no mirror.
  { placement: "start", opens: "e", antd: "borderRightColor" },
  { placement: "end", opens: "s", antd: "borderLeftColor" },
] as const;

describe("card face — antd genCardStyle, all four placements", () => {
  const table = cardFace();

  for (const { placement, opens, antd } of ANTD_CARD_MATRIX) {
    it(`${placement}: the active face opens the edge facing the panel (antd ${antd})`, () => {
      const row = table
        .split("\n")
        .join(" ")
        .match(new RegExp(`\\b${placement}:\\s*("[^"]*"|\\s*"[^"]*")`));
      expect(row, `no CARD_FACE row for placement="${placement}"`).not.toBeNull();
      const utilities = row![1]!;

      // The merged edge, and ONLY that edge.
      expect(utilities).toContain(`data-[state=active]:border-${opens}-`);
      for (const other of ["t", "b", "s", "e"].filter((edge) => edge !== opens)) {
        expect(
          utilities,
          `${placement} must not repaint the ${other} edge — only the one facing the panel`,
        ).not.toContain(`data-[state=active]:border-${other}-`);
      }
    });
  }

  it("every placement in the union has a row — a new one cannot silently inherit `top`", () => {
    // `bottom` shipped wrong precisely because the face was one hardcoded line written for `top`.
    const union = tabsSource.match(/CARD_FACE:\s*Record<\s*TabsPlacementProp\s*,\s*string\s*>/);
    expect(union, "CARD_FACE must be keyed by the placement union, so TS demands every case")
      .not.toBeNull();
    for (const { placement } of ANTD_CARD_MATRIX) {
      expect(table).toContain(`${placement}:`);
    }
  });

  it("the radius rounds the corners AWAY from the panel", () => {
    expect(table).toMatch(/top:\s*"rounded-\[var\(--tabs-card-radius\)_var\(--tabs-card-radius\)_0_0\]/);
    expect(table).toMatch(/rounded-\[0_0_var\(--tabs-card-radius\)_var\(--tabs-card-radius\)\]/);
    expect(table).toContain("rounded-s-[var(--tabs-card-radius)] rounded-e-none");
    expect(table).toContain("rounded-e-[var(--tabs-card-radius)] rounded-s-none");
  });

  it("a card tab is CONTENT-WIDTH, not an equal share of the strip", () => {
    // antd: `nav-list { display: flex }`, no `flex-grow` on the tab. The base trigger here is
    // `flex-1`, so the card branch has to cancel it or every tab stretches.
    const branch = tabsSource.slice(tabsSource.indexOf("              card &&"));
    expect(branch.slice(0, 400)).toContain("flex-none");
  });

  it("the PILL's selected hairline is scoped to the default ROOT, not just the default list", () => {
    // THE ONE THAT ACTUALLY CAUSED THE BLUE BORDER. `border-primary/25` is the pill variant's
    // selected hairline and was guarded by `group-data-[variant=default]/tabs-list:` alone — but
    // `card`/`editable-card` forward `data-variant="default"` on the LIST deliberately (so a
    // hand-composed <TabsList> keeps the pill chrome), which means the list guard is TRUE for
    // card tabs and the utility applied. It also outranks the card branch's own border colour, so
    // it won on all four edges including the one that merges into the panel.
    //
    // The guard has to name the ROOT too. Asserted here rather than in the gh#248 file because
    // that one's guards are written with `includes`, which cannot tell a tightening from a
    // loosening — exactly the property that let this through.
    for (const utility of tabsSource.match(/[\w[\]/=:.-]*border-primary[\w[\]/=:.-]*/g) ?? []) {
      expect(
        utility,
        `"${utility}" must require the ROOT to be default, or it leaks onto card tabs`,
      ).toContain("group-data-[variant=default]/tabs:");
    }
  });

  it("the rail runs along the edge facing the panel, and flips for `bottom`", () => {
    // Inset shadow, not a border — the reason is recorded beside the rule. Negative block offset
    // draws the band at the bottom (placement=top); positive draws it at the top (placement=bottom).
    expect(navigationCss).toContain(
      "box-shadow: inset 0 calc(-1 * var(--tabs-card-rail-border-width)) 0 hsl(var(--border));",
    );
    const bottomRail = navigationCss.indexOf('[data-variant="card"][data-placement="bottom"]');
    expect(bottomRail, "no placement=bottom rail rule").toBeGreaterThan(-1);
    const rule = navigationCss.slice(bottomRail, navigationCss.indexOf("\n  }", bottomRail));
    expect(rule).toContain("box-shadow: inset 0 var(--tabs-card-rail-border-width) 0");
    expect(rule, "the bottom rail must not reuse the negative (downward) offset").not.toContain(
      "calc(-1 * var(--tabs-card-rail-border-width))",
    );
  });
});

describe("the remove glyph obeys one size contract, whoever supplies it", () => {
  it("the size rule selects the WRAPPER'S CHILD, so `closeIcon` cannot escape it", () => {
    const start = navigationCss.indexOf(".ui-tabs-tab-remove-icon,");
    expect(
      start,
      "the size rule must not key on .ui-tabs-tab-remove-icon alone — that class only lands on the default ×",
    ).toBeGreaterThan(-1);
    const rule = navigationCss.slice(start, navigationCss.indexOf("\n  }", start));
    expect(rule).toContain(".ui-tabs-tab-remove > :is(svg, img)");
    expect(rule).toContain("inline-size: var(--tabs-tab-remove-icon-size)");
    expect(rule).toContain("block-size: var(--tabs-tab-remove-icon-size)");
  });

  it("a consumer `closeIcon` really is rendered INSIDE that wrapper", () => {
    // The CSS above is only worth anything if the icon lands where the selector looks. This is the
    // half jsdom CAN check: structure, not size.
    render(
      <Tabs
        variant="editable-card"
        defaultValue="a"
        closeIcon={<svg data-testid="consumer-glyph" />}
        onEdit={() => undefined}
        items={[
          { value: "a", label: "A", content: <p>a</p> },
          { value: "b", label: "B", content: <p>b</p> },
        ]}
      />,
    );
    const glyph = screen.getAllByTestId("consumer-glyph")[0]!;
    expect(glyph.parentElement).toHaveAttribute("data-slot", "tabs-tab-remove");
    expect(glyph.parentElement?.classList.contains("ui-tabs-tab-remove")).toBe(true);
  });
});

describe("the line bar sits ON the hairline (one line, not two)", () => {
  it("the horizontal inset adds back the block padding the strip took for the focus ring", () => {
    const start = navigationCss.indexOf(
      '[data-slot="tabs-list"][data-variant="line"][data-orientation="horizontal"]\n    [data-slot="tabs-trigger"]::after',
    );
    expect(start, "no horizontal line indicator rule").toBeGreaterThan(-1);
    const rule = navigationCss.slice(start, navigationCss.indexOf("\n  }", start));

    // The gap was 3px of block padding + the 1px hairline = 4px, measured on all 13 line strips
    // of the tabs page. The bar stops at the padding-box edge: one pixel further and it is outside
    // the scrollport `overflow-y: hidden` creates, which is the gh#376 clip.
    expect(rule).toContain("--tabs-list-line-space-inset");
    expect(rule).toContain("--tabs-list-focus-ring-space-inset");
    // The consumer knob is added, never replaced.
    expect(rule).toContain("var(--tabs-indicator-offset)");
  });

  it("it is written as the SAME expression the strip's padding is built from", () => {
    // Two independently written copies of "3px" would drift the moment either changed. The list's
    // `py-` and this inset must read the same two tokens.
    const list = tabsSource.slice(tabsSource.indexOf('variant === "line" &&'));
    const listPadding = list.slice(0, 900);
    for (const token of ["--tabs-list-line-space-inset", "--tabs-list-focus-ring-space-inset"]) {
      expect(listPadding, `the line strip's padding must read ${token}`).toContain(token);
    }
  });
});
