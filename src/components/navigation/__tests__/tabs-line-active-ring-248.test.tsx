import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * The `line` variant must NOT keep a ring around the SELECTED trigger, while the keyboard focus
 * ring stays fully intact (WCAG 2.4.7). Both states used to be painted with the same Tailwind
 * `ring-*` utilities at equal specificity, so the 1px `ring-primary/25` selected ring simply
 * swallowed the focus ring. Browser evidence (Chromium, /frame/navigation-tabs):
 *   before — active line trigger box-shadow `oklab(… / 0.25) 0 0 0 1px` in BOTH states.
 *   after  — selected only: box-shadow entirely transparent + a 2px rgb(0,119,199) `::after` bar.
 *
 * SECOND PASS, WHEN THE LIBRARY TOOK SC 2.4.13 (AAA). Scoping the selected ring to the default
 * list fixed the LINE variant and left the same collision standing on the default one: `ring-1`
 * writes `--tw-ring-shadow` in the UTILITIES layer, which outranks the `components`-layer feed in
 * styles/focus-ring.css, so a focused ACTIVE default tab measured `oklab(… / 0.25) 0 0 0 1px` and
 * nothing else — a 1px indicator at 25% alpha, failing both clauses of 2.4.13 while every other
 * control carried a full 2px ring. The selected hairline therefore moved OFF the ring and onto the
 * trigger's own (already present, already transparent) border, which frees `--tw-ring-shadow`
 * entirely. Measured after: `rgb(0,119,199) 0 0 0 2px, rgba(0,119,199,0.12) 0 0 0 4px` on the
 * focused active tab, with the selected hairline in `border-color` and `shadow-sm` still lifting.
 *
 * The invariant these tests hold is therefore stronger than "no ring on a line trigger": the
 * SELECTED state must never be painted with anything that writes the ring box-shadow, on any
 * variant, because that is the channel the focus indicator uses.
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

  it("never paints a second, hand-rolled underline on a line trigger", () => {
    // The line variant's bar is the token-owned `::after` in navigation-layout.css. A `border-b-*`
    // here would be a second, untokenized indicator. The selected hairline the DEFAULT list uses
    // (`border-primary/25`) is not one: it is scoped to that list and is an all-round border, not
    // an underline — so this checks the underline utilities and the SCOPE, not the substring.
    render(<Tabs items={ITEMS} variant="line" />);
    const utilities = classOf(screen.getByRole("tab", { name: "概要" })).split(/\s+/);
    for (const utility of utilities) {
      // `border-b-[1-9]`, not `border-b-\d`: the line trigger legitimately carries `border-b-0`,
      // which REMOVES a bottom border rather than drawing one.
      expect(utility, `"${utility}" would underline a line trigger`).not.toMatch(
        /(^|:)border-b-[1-9]/,
      );
      if (/(^|:)border-primary/.test(utility)) {
        expect(
          utility.startsWith("group-data-[variant=default]/tabs-list:"),
          `selected-state border "${utility}" must be scoped to the default/card list`,
        ).toBe(true);
      }
    }
  });

  it("keeps the focus indicator UNSCOPED so every variant shows one", () => {
    render(<Tabs items={ITEMS} variant="line" />);
    const className = classOf(screen.getByRole("tab", { name: "概要" }));
    // The indicator is the marker class, unconditional and variant-blind — it is what puts this
    // trigger in the single source (styles/focus-ring.css). It replaced a `focus-visible:outline-1`
    // that only ever existed as the survivor of the ring collision above; with the ring painting
    // again, a 1px currentColor line between the border and the ring is a second mark for one
    // state.
    expect(className.split(/\s+/)).toContain("ui-focus-ring");
    // Anything else that touches focus must stay unscoped for the same WCAG 2.4.7 reason.
    for (const utility of className.split(/\s+/).filter((u) => u.includes("focus-visible:"))) {
      expect(
        utility.startsWith("focus-visible:"),
        `focus utility "${utility}" must not be variant-scoped — WCAG 2.4.7 applies to every variant`,
      ).toBe(true);
    }
  });

  it("keeps the selected hairline on the default variant — as a BORDER, never a ring", () => {
    render(<Tabs items={ITEMS} variant="default" />);
    const className = classOf(screen.getByRole("tab", { name: "概要" }));
    // Same colour and width as the ring it replaced, so the selected chrome is unchanged — and
    // the trigger already carries a transparent border at that width, so nothing moves.
    expect(className).toContain(
      "group-data-[variant=default]/tabs-list:data-[state=active]:border-primary/25",
    );
    // And the channel the focus ring needs stays free. A `ring-*` utility on the SELECTED state
    // writes --tw-ring-shadow in the utilities layer and silently deletes the focus indicator on
    // the active tab — measured, not theorised. This is the assertion that catches its return.
    for (const utility of className.split(/\s+/)) {
      expect(
        /data-\[state=active\]:ring-/.test(utility),
        `"${utility}" paints the SELECTED state through the ring box-shadow, which is the focus ` +
          `indicator's channel (SC 2.4.13)`,
      ).toBe(false);
    }
  });

  it("the selected-state ring never returns on ANY variant", () => {
    // The line variant was fixed first and the default one kept the bug for a release. State the
    // invariant once, for every variant, so the next fix cannot be half a fix.
    for (const variant of ["default", "card", "line"] as const) {
      const { unmount } = render(<Tabs items={ITEMS} variant={variant} />);
      const className = classOf(screen.getByRole("tab", { name: "概要" }));
      expect(
        className,
        `variant="${variant}" paints the selected state with a ring utility`,
      ).not.toMatch(/data-\[state=active\]:ring-/);
      unmount();
    }
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
    expect(navigationCss).not.toMatch(/\[data-slot="tabs-trigger"\]::after[^}]*\bright:/);
  });

  it("only shows the bar for the ACTIVE trigger of a line list", () => {
    expect(navigationCss).toContain(
      '[data-slot="tabs-list"][data-variant="line"] [data-slot="tabs-trigger"][data-state="active"]::after { opacity: 1; }',
    );
  });
});
