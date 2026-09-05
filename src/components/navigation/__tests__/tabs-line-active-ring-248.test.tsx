import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * gh#248 — the `line` variant must NOT keep a ring around the SELECTED trigger, while the
 * `:focus-visible` keyboard ring stays fully intact (WCAG 2.4.7). Both states used to be painted
 * with the same Tailwind `ring-*` utilities at equal specificity, so the 1px `ring-primary/25`
 * selected ring simply swallowed the 3px focus ring. Browser evidence (Chromium, /frame/navigation-tabs):
 *   before — active line trigger box-shadow `oklab(… / 0.25) 0 0 0 1px` in BOTH states.
 *   after  — selected only: box-shadow entirely transparent + a 2px rgb(0,119,199) `::after` bar;
 *            keyboard-focused: box-shadow `oklab(… / 0.5) 0 0 0 3px` + `outline: solid 1px`.
 * These assertions codify the invariants that produced that result.
 */
/** Prettier wraps long selectors across lines — compare on a whitespace-normalized copy. */
const navigationCss = readFileSync(
  resolve(process.cwd(), "src/styles/navigation-layout.css"),
  "utf8",
)
  .replace(/\s+/g, " ")
  .trim();
const navigationTokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/navigation.css"),
  "utf8",
);

const ITEMS = [
  { value: "a", label: "概要", content: "パネルA" },
  { value: "b", label: "詳細", content: "パネルB" },
];

function classOf(el: Element) {
  return el.getAttribute("class") ?? "";
}

/** Every whitespace-separated utility in a class string that touches the `ring` box-shadow. */
function ringUtilities(className: string) {
  return className.split(/\s+/).filter((u) => /(^|:)ring(-|$)/.test(u));
}

describe("Tabs line variant — no active ring (gh#248)", () => {
  it("forwards variant=line to the list so every line rule actually reaches the triggers", () => {
    render(<Tabs items={ITEMS} variant="line" />);
    // Before the fix the items API styled the list through className only, leaving
    // data-variant="default" — so the `group-data-[variant=line]/tabs-list:` rules never matched.
    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "line");
  });

  it("keeps data-variant=default for the default and card variants (unchanged chrome)", () => {
    const { unmount } = render(<Tabs items={ITEMS} variant="default" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "default");
    unmount();
    render(<Tabs items={ITEMS} variant="card" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "default");
  });

  it("scopes EVERY ring utility on the trigger to the default/card lists — never the line list", () => {
    render(<Tabs items={ITEMS} variant="line" />);
    const active = screen.getByRole("tab", { name: "概要" });
    expect(active).toHaveAttribute("data-state", "active");

    for (const utility of ringUtilities(classOf(active))) {
      const isSelectedStateRing = utility.includes("data-[state=active]");
      if (!isSelectedStateRing) continue;
      expect(
        utility.startsWith("group-data-[variant=default]/tabs-list:"),
        `selected-state ring utility "${utility}" must be scoped to the default/card list`,
      ).toBe(true);
    }
    // …and the selected-state ring must never be emitted unscoped.
    expect(classOf(active)).not.toMatch(/(?<!\/tabs-list:)data-\[state=active\]:ring-/);
  });

  it("never paints a second, hand-rolled underline (border-b-2 / border-primary) on a line trigger", () => {
    render(<Tabs items={ITEMS} variant="line" />);
    const active = screen.getByRole("tab", { name: "概要" });
    expect(classOf(active)).not.toContain("border-b-2");
    expect(classOf(active)).not.toContain("border-primary");
  });

  it("keeps the focus-visible ring UNSCOPED so every variant shows a keyboard focus indicator", () => {
    render(<Tabs items={ITEMS} variant="line" />);
    const className = classOf(screen.getByRole("tab", { name: "概要" }));
    const focusUtilities = className.split(/\s+/).filter((u) => u.includes("focus-visible:"));
    expect(focusUtilities.length).toBeGreaterThan(0);
    for (const utility of focusUtilities) {
      expect(
        utility.startsWith("focus-visible:"),
        `focus utility "${utility}" must not be variant-scoped — WCAG 2.4.7 applies to every variant`,
      ).toBe(true);
    }
    expect(className).toContain("ui-focus-ring");
  });

  it("keeps the selected ring on the default variant (card/default chrome unchanged)", () => {
    render(<Tabs items={ITEMS} variant="default" />);
    const className = classOf(screen.getByRole("tab", { name: "概要" }));
    expect(className).toContain(
      "group-data-[variant=default]/tabs-list:data-[state=active]:ring-1",
    );
    expect(className).toContain(
      "group-data-[variant=default]/tabs-list:data-[state=active]:ring-primary/25",
    );
  });

  it("keyboard selection still works in the line variant (roving focus + activation)", async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} variant="line" />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "概要" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "詳細" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "詳細" })).toHaveAttribute("data-state", "active");
  });

  it("has no axe violations in the line variant (composed form)", async () => {
    await expectNoA11yViolations(
      <Tabs defaultValue="one">
        <TabsList variant="line">
          <TabsTrigger value="one">概要</TabsTrigger>
          <TabsTrigger value="two">詳細</TabsTrigger>
        </TabsList>
        <TabsContent value="one">パネルA</TabsContent>
        <TabsContent value="two">パネルB</TabsContent>
      </Tabs>,
    );
  });
});

describe("Tabs line indicator — token-owned (gh#248)", () => {
  it("declares the indicator knobs, with the colour as a role-mirror `initial`", () => {
    expect(navigationTokens).toMatch(/--tabs-indicator-background:\s*initial;/);
    expect(navigationTokens).toMatch(/--tabs-indicator-size:\s*2px;/);
    expect(navigationTokens).toMatch(/--tabs-indicator-offset:\s*0px;/);
  });

  it("paints the bar from the tokens with the --primary role resolved at the CALL SITE", () => {
    expect(navigationCss).toContain(
      "background: var(--tabs-indicator-background, hsl(var(--primary)));",
    );
    expect(navigationCss).toContain("block-size: var(--tabs-indicator-size);");
    expect(navigationCss).toContain("inline-size: var(--tabs-indicator-size);");
  });

  it("positions the bar with LOGICAL insets so the vertical rail flips under dir=rtl", () => {
    expect(navigationCss).toContain("inset-block-end: calc(-1 * var(--tabs-indicator-offset));");
    expect(navigationCss).toContain("inset-inline-end: calc(-1 * var(--tabs-indicator-offset));");
    // The old physical `after:-right-1` utility never flipped in RTL — verified in Chromium:
    // vertical rail computes right:0 in LTR and left:0 under dir="rtl".
    expect(navigationCss).not.toMatch(/\[data-slot="tabs-trigger"\]::after[^}]*\bright:/);
  });

  it("only shows the bar for the ACTIVE trigger of a line list", () => {
    expect(navigationCss).toContain(
      '[data-slot="tabs-list"][data-variant="line"] [data-slot="tabs-trigger"][data-state="active"]::after { opacity: 1; }',
    );
  });
});
