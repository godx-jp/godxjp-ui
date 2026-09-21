import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../test/css-selector";

const root = join(import.meta.dirname, "../..");

const navStyles = readFileSync(join(root, "styles/navigation-layout.css"), "utf8");
const navTokens = readFileSync(join(root, "tokens/components/navigation.css"), "utf8");
const toggleTokens = readFileSync(join(root, "tokens/components/toggle.css"), "utf8");
const tabsSource = readFileSync(join(root, "components/navigation/tabs.tsx"), "utf8");

function tokenValue(css: string, token: string): string | undefined {
  // Normalised, because this compares two files' values for equality and prettier wraps whichever
  // declaration happens to be longer. `--tabs-count-font-size` and `--toggle-count-font-size` are
  // the same wiring; only one of them was long enough to wrap after gh#834's call-site fallbacks.
  return css
    .match(new RegExp(`^\\s*${token}:\\s*([^;]+);`, "m"))?.[1]
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

/**
 * The declaration block of the first rule whose selector list contains `needle`.
 *
 * `needle` is written on ONE line and matched across any whitespace run (gh#769). Measured before
 * this change: reflowing navigation-layout.css at printWidth 60 turned 11 of this file's 24 cases
 * red, all of them reporting missing rules that were present and unchanged — the exact failure
 * #767 opened with, still live here.
 */
function ruleContaining(css: string, needle: string): string {
  const at = anchorIndex(css, needle);
  if (at === -1) return "";
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("}", open));
}

/** A slice starting at `needle`, found however the formatter wrapped it. */
function sliceFrom(css: string, needle: string): string {
  const at = anchorIndex(css, needle);
  expect(at, `rule not found: ${needle}`).toBeGreaterThan(-1);
  return css.slice(at);
}

/**
 * THE SEAM (gh#762). Measured in Chromium at 1440px on `/isolate/navigation-card-tabs`, this is
 * what these rules produce — and what a regression would move:
 *
 *   before (28.0.0, `variant="card"` over a `<Card>`)   after (`bodied`)
 *   gap active tab → panel        8px                    -1px (the shared border row)
 *   lines across the seam         2 (rail + Card border) 1, and 0 across the ACTIVE tab
 *   panel corners under the strip 9.708px                0px
 *   panel surface / active tab    --card / --background  the same --tabs-panel-background
 *
 * The pixel evidence, sampled from the screenshot at DPR 2: down the active tab's column the
 * seam rows read 253,253,252 throughout (no line at all); down an inactive tab's column and past
 * the last tab they read 238,237,236 for exactly two device rows (one CSS px).
 */
describe("Tabs bodied — the trailing control's edge (gh#766)", () => {
  /**
   * Measured in Chromium at 1440px on a bodied `editable-card` strip with three buttons in the
   * end slot, against the consumer's own built css:
   *
   *   body content starts            17px inside the object (1px border + 16px inset)
   *   last bar button ended at        0px  → two 1px borders on the same x, read as "sliced off"
   *   last bar button ends at (now)  17px  → 1399px, the same column as the body's content
   *
   * The tabs are deliberately NOT moved: a tab's inline border merges into the body's, which is
   * what makes strip and body one outline. Only `extra` is content rather than perimeter.
   */
  it("insets the end slot to the body's content column, not to its border", () => {
    const rule = ruleContaining(
      navStyles,
      '[data-placement="top"] .ui-tabs-extra[data-side="end"]',
    );
    expect(rule).toMatch(
      /margin-inline-end:\s*calc\(\s*var\(--tabs-panel-space-inset\)\s*\+\s*var\(--tabs-panel-border-width\)\s*\)/,
    );
  });

  it("insets a start slot on the same terms", () => {
    const rule = ruleContaining(
      navStyles,
      '[data-placement="top"] .ui-tabs-extra[data-side="start"]',
    );
    expect(rule).toMatch(/margin-inline-start:\s*calc\(/);
  });

  it("leaves the tabs flush, so the perimeter stays one outline", () => {
    // A rule that moved the LIST would break the merge the whole `bodied` shape is built on.
    const bodied = sliceFrom(navStyles, '[data-slot="tabs"][data-bodied="true"] {');
    expect(bodied).not.toMatch(/\.ui-tabs-extra[^{]*\{[^}]*margin-inline:(?!-)/);
    expect(bodied).not.toMatch(
      /\[data-bodied="true"\][^{]*\[data-slot="tabs-list"\][^{]*\{[^}]*margin-inline-start/,
    );
  });

  it("does not move a strip that has no body", () => {
    // Every rule here is gated on `[data-bodied="true"]`; an ungated `.ui-tabs-extra` margin
    // would shift every existing strip in every consumer at once.
    const extraRules = navStyles.matchAll(/([^\n}]*\.ui-tabs-extra[^{]*)\{([^}]*)\}/g);
    for (const [, selector, body] of extraRules) {
      if (/margin-inline/.test(body)) {
        expect(selector).toContain('[data-bodied="true"]');
      }
    }
  });
});

describe("Tabs bodied — the joined body (gh#762)", () => {
  it("closes the strip↔panel gap instead of tweaking it per consumer", () => {
    // `--tabs-root-gap` is right for every other variant; a body is not a gap tweak, so the
    // bodied ROOT re-points the knob rather than the panel carrying a negative margin for it.
    expect(ruleContaining(navStyles, '[data-slot="tabs"][data-bodied="true"] {')).toMatch(
      /--tabs-root-gap:\s*0px;/,
    );
  });

  it("gives the panel a real body — border, radius, surface and an inset", () => {
    const body = ruleContaining(navStyles, '[data-bodied="true"] > [data-slot="tabs-panel"],');
    expect(body).toMatch(
      /border:\s*var\(--tabs-panel-border-width\)\s+solid\s+hsl\(var\(--border\)\)/,
    );
    expect(body).toMatch(/border-radius:\s*var\(--tabs-panel-radius\)/);
    expect(body).toMatch(
      /background:\s*hsl\(\s*var\(\s*--tabs-panel-background,\s*var\(--background\)\s*\)\s*\)/,
    );
    expect(body).toMatch(/padding:\s*var\(--tabs-panel-space-inset\)/);
  });

  it("drops the LIST's rail, so the seam is one line and not two", () => {
    // The body's own border is the rail now. It has to beat the four placement rail rules, which
    // are (0,4,0) — and their `[dir="rtl"]` mirrors, which are (0,5,0).
    const suppressed = navStyles.match(
      /\[data-slot="tabs"\]\[data-bodied="true"\]\[data-variant="card"\]\s+\[data-slot="tabs-list"\][\s\S]*?\{([^}]*)\}/,
    );
    expect(suppressed?.[1]).toMatch(/box-shadow:\s*none/);
    for (const variant of ["card", "editable-card"]) {
      // Whitespace-tolerant: prettier wraps the longer of the two selectors across three lines.
      expect(navStyles).toMatch(
        new RegExp(
          `\\[dir="rtl"\\]\\s+\\[data-slot="tabs"\\]\\[data-bodied="true"\\]\\[data-variant="${variant}"\\]`,
        ),
      );
    }
  });

  it.each([
    ["top", "margin-block-start", ["border-start-start-radius", "border-start-end-radius"]],
    ["bottom", "margin-block-end", ["border-end-start-radius", "border-end-end-radius"]],
    ["start", "margin-inline-start", ["border-start-start-radius", "border-end-start-radius"]],
    ["end", "margin-inline-end", ["border-start-end-radius", "border-end-end-radius"]],
  ])(
    "squares the %s corners and pulls that edge onto the tabs' own",
    (placement, margin, corners) => {
      const rule = ruleContaining(
        navStyles,
        `[data-bodied="true"][data-placement="${placement}"] > [data-slot="tabs-panel"],`,
      );
      // Exactly one border width of pull — the tabs' joined edge and the body's edge then
      // occupy the SAME device row, which is what makes it one outline instead of two.
      expect(rule).toMatch(
        new RegExp(
          `${margin}:\\s*calc\\(\\s*-1\\s*\\*\\s*var\\(--tabs-panel-border-width\\)\\s*\\)`,
        ),
      );
      for (const corner of corners) expect(rule).toMatch(new RegExp(`${corner}:\\s*0;`));
    },
  );

  it("uses LOGICAL corner properties, so start/end mirror under dir=rtl with no second rule", () => {
    const bodiedBlock = sliceFrom(navStyles, '[data-bodied="true"][data-placement=');
    expect(bodiedBlock.slice(0, 2000)).not.toMatch(
      /border-(top|bottom)-(left|right)-radius|margin-(top|bottom|left|right):/,
    );
  });

  it("paints the merged tab edge from the SAME knob as the body", () => {
    // Two declarations of one colour is how a retinted body leaves a hairline of the old
    // surface across the join. All four placements read the knob, and so does the active fill.
    const merges = tabsSource.match(
      /data-\[state=active\]:border-[btse]-\[hsl\(var\(--tabs-panel-background,var\(--background\)\)\)\]/g,
    );
    expect(merges).toHaveLength(4);
    expect(tabsSource).toContain(
      "data-[state=active]:bg-[hsl(var(--tabs-panel-background,var(--background)))]",
    );
  });

  it("keeps --tabs-panel-background a role-mirror knob (docs/TOKENS.md)", () => {
    expect(tokenValue(navTokens, "--tabs-panel-background")).toBe("initial");
  });

  it("derives the body's border and radius from the tab's own, not from new constants", () => {
    expect(tokenValue(navTokens, "--tabs-panel-border-width")).toBe(
      "var(--tabs-card-rail-border-width)",
    );
    expect(tokenValue(navTokens, "--tabs-panel-radius")).toBe("var(--tabs-card-radius)");
  });

  it("re-states the seam structurally under forced colors, where a merged edge cannot merge", () => {
    const forced = sliceFrom(navStyles, '[data-bodied="true"] > [data-slot="tabs-panel"],');
    expect(forced).toMatch(/@media \(forced-colors: active\)/);
    expect(forced).toMatch(/border-block-end-style:\s*none/);
    expect(forced).toMatch(/border-block-start-style:\s*none/);
  });
});

/**
 * THE TAB COUNTER PILL. It must be the same object a counted Button and a counted Toggle draw —
 * that is the whole reason `useCounterPill` is shared rather than a second counting API written
 * beside it (gh#762, on gh#312/gh#734's vocabulary).
 */
describe("Tabs counter pill ↔ Toggle counter pill (gh#762)", () => {
  it.each([
    ["--tabs-count-min-width", "--toggle-count-min-width"],
    ["--tabs-count-space-inline", "--toggle-count-space-inline"],
    ["--tabs-count-font-size", "--toggle-count-font-size"],
    ["--tabs-count-radius", "--toggle-count-radius"],
  ])("%s carries Toggle's %s value", (mine, theirs) => {
    const other = tokenValue(toggleTokens, theirs);
    expect(other, `${theirs} disappeared from toggle.css`).toBeDefined();
    expect(tokenValue(navTokens, mine)).toBe(other);
  });

  it("uses the same digit metrics (tabular-nums, unit line-height)", () => {
    const pill = ruleContaining(navStyles, ".ui-tabs-count {");
    expect(pill).toMatch(/font-variant-numeric:\s*tabular-nums/);
    expect(pill).toMatch(/line-height:\s*1;/);
  });

  it("keeps every pill COLOUR knob a role-mirror knob", () => {
    for (const token of [
      "--tabs-count-background",
      "--tabs-count-color",
      "--tabs-count-card-background",
      "--tabs-count-active-background",
      "--tabs-count-active-color",
    ]) {
      expect(tokenValue(navTokens, token), `${token} must be declared initial`).toBe("initial");
      // Tolerant at every joint, not merely collapsed: Prettier may break INSIDE `hsl(`/`var(`,
      // and a collapse turns that break into a space the expected substring does not have.
      expect(navStyles, `${token} needs its role default at the call site`).toMatch(
        new RegExp(`var\\(\\s*${token},\\s*hsl\\(\\s*var\\(\\s*--`),
      );
    }
  });

  it("lifts the pill off a CARD tab, whose resting fill is the pill's own default", () => {
    // Measured before this rule: pill --muted on a tab --muted = 1.00:1, invisible (the gh#602
    // failure, third control). After: 1.09:1 against the tab, 5.65:1 for the digits on the pill.
    expect(navStyles).toMatch(
      /\[data-variant="card"\]\s*\[data-slot="tabs-trigger"\]:not\(\[data-state="active"\]\)\s*\.ui-tabs-count/,
    );
  });

  it("encodes the selected count with more than a hue change (WCAG 1.4.1)", () => {
    const selected = ruleContaining(
      navStyles,
      '[data-slot="tabs-trigger"][data-state="active"] .ui-tabs-count {',
    );
    expect(selected).toMatch(/background:/);
    expect(selected).toMatch(/color:/);
    expect(navStyles).toMatch(/outline:\s*var\(--tabs-count-forced-outline-width\)/);
  });
});
