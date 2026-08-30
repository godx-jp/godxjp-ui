import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { ruleSelector } from "@/test/css-selector";

/** Prettier wraps long selectors across lines — compare on a whitespace-normalized copy. */
const navigationCss = readFileSync(
  resolve(process.cwd(), "src/styles/navigation-layout.css"),
  "utf8",
)
  .replace(/\s+/g, " ")
  .trim();

/** The same file unnormalized — `ruleSelector` anchors on the declaration under the brace. */
const navigationCssRaw = readFileSync(
  resolve(process.cwd(), "src/styles/navigation-layout.css"),
  "utf8",
);

/**
 * The two shipped rules that actually implement gh#175, with their selectors taken OUT of the
 * stylesheet: the root's flexbox shrink floor (what `min-w-0` used to ride along as) and the
 * strip's width cap plus own-overflow scroll (what `max-w-full` used to). Running them with
 * `.matches()` proves the rules reach the rendered nodes — a class name only proves a string.
 */
const shrinkFloorSelector = ruleSelector(
  navigationCssRaw,
  /\[data-slot="tabs"\] \{\s*\n\s*min-inline-size: 0;/,
);
const widthCapSelector = ruleSelector(
  navigationCssRaw,
  /\[data-slot="tabs-list"\] \{\s*\n\s*max-inline-size:/,
);

/**
 * Regression coverage for gh#175 — two confirmed Tabs framework defects:
 *
 *  1) Fallback selection could target a DISABLED first item — both when the component owns the
 *     initial value (no defaultValue) and when a stale/disabled `defaultValue` is passed. Must
 *     skip disabled items and land on the first ENABLED one; select nothing when all are disabled.
 *  2) The horizontal tablist had no overflow handling, so long localized labels in a narrow
 *     container clipped/overflowed instead of scrolling.
 */

const FIRST_DISABLED = [
  { value: "a", label: "無効な項目", content: "パネルA", disabled: true },
  { value: "b", label: "概要", content: "パネルB" },
  { value: "c", label: "詳細", content: "パネルC" },
];

const ALL_DISABLED = [
  { value: "a", label: "無効A", content: "PanelA", disabled: true },
  { value: "b", label: "無効B", content: "PanelB", disabled: true },
];

describe("Tabs — fallback selection skips disabled items (gh#175)", () => {
  it("uncontrolled: no defaultValue given selects the first ENABLED item, not the disabled first item", () => {
    render(<Tabs items={FIRST_DISABLED} />);
    expect(screen.getByText("パネルB")).toBeInTheDocument();
    expect(screen.queryByText("パネルA")).toBeNull();
    expect(screen.getByRole("tab", { name: "概要" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "無効な項目" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("uncontrolled: a defaultValue naming a DISABLED item falls back to the first enabled item", () => {
    render(<Tabs items={FIRST_DISABLED} defaultValue="a" />);
    expect(screen.getByText("パネルB")).toBeInTheDocument();
    expect(screen.queryByText("パネルA")).toBeNull();
  });

  it("uncontrolled: a defaultValue naming an UNKNOWN key falls back to the first enabled item", () => {
    render(<Tabs items={FIRST_DISABLED} defaultValue="does-not-exist" />);
    expect(screen.getByText("パネルB")).toBeInTheDocument();
  });

  it("uncontrolled: a valid defaultValue naming an enabled non-first item is still honored", () => {
    render(<Tabs items={FIRST_DISABLED} defaultValue="c" />);
    expect(screen.getByText("パネルC")).toBeInTheDocument();
    expect(screen.queryByText("パネルB")).toBeNull();
  });

  it("uncontrolled: selects NOTHING when every item is disabled", () => {
    render(<Tabs items={ALL_DISABLED} />);
    expect(screen.queryByText("PanelA")).toBeNull();
    expect(screen.queryByText("PanelB")).toBeNull();
    for (const tab of screen.getAllByRole("tab")) {
      expect(tab).toHaveAttribute("aria-selected", "false");
    }
  });

  it("controlled: parent state starting undefined resolves to the first enabled item, matching uncontrolled", () => {
    function Controlled() {
      const [value, setValue] = React.useState<string | undefined>(undefined);
      return <Tabs items={FIRST_DISABLED} value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    expect(screen.getByText("パネルB")).toBeInTheDocument();
    expect(screen.queryByText("パネルA")).toBeNull();
  });

  it("controlled: once resolved, clicking an enabled tab updates parent state and the disabled tab stays inert", async () => {
    const user = userEvent.setup();
    function Controlled() {
      // Starts already on the fallback-resolved tab (as a real controlled app would be, one
      // render after the fallback fires) — keeps `value` defined for the component's whole
      // lifetime so this test doesn't trip Radix's unrelated controlled/uncontrolled dev warning.
      const [value, setValue] = React.useState("b");
      return <Tabs items={FIRST_DISABLED} value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    await user.click(screen.getByRole("tab", { name: "詳細" }));
    expect(screen.getByText("パネルC")).toBeInTheDocument();

    const disabledTab = screen.getByRole("tab", { name: "無効な項目" });
    expect(disabledTab).toBeDisabled();
    await user.click(disabledTab);
    expect(screen.getByText("パネルC")).toBeInTheDocument(); // unchanged — still on "詳細"
  });

  it("keyboard: Tab still moves focus to the first ENABLED trigger, skipping the disabled one", async () => {
    const user = userEvent.setup();
    render(<Tabs items={FIRST_DISABLED} />);
    await user.tab();
    expect(document.activeElement).toHaveAccessibleName("概要");
  });

  it('RTL: fallback selection + activation behave the same under dir="rtl"', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <Tabs items={FIRST_DISABLED} />
      </div>,
    );
    expect(screen.getByText("パネルB")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "詳細" }));
    expect(screen.getByText("パネルC")).toBeInTheDocument();
  });
});

describe("Tabs — horizontal tablist scrolls instead of clipping long labels (gh#175)", () => {
  it("horizontal tablist (default orientation) is width-bounded, shrinkable and scrolls its own overflow", () => {
    const { container } = render(<Tabs items={FIRST_DISABLED} />);
    const tablist = screen.getByRole("tablist");
    expect(tablist).toHaveAttribute("data-orientation", "horizontal");
    // The shrink floor lives on the ROOT: without it the strip's intrinsic width forces every
    // ancestor wider instead of letting the strip scroll.
    expect(container.querySelector('[data-slot="tabs"]')!.matches(shrinkFloorSelector)).toBe(true);
    // …and the cap plus own-overflow scroll are the strip's own rule, token-driven.
    expect(tablist.matches(widthCapSelector)).toBe(true);
    expect(navigationCss).toContain("max-inline-size: var(--tabs-list-max-inline-size)");
    expect(navigationCss).toContain("overflow-x: var(--tabs-list-overflow)");
    expect(tablist.className).toContain("data-[orientation=horizontal]:overflow-x-auto");
  });

  it("hides the scrollbar chrome while keeping it scrollable (scrollbar-width:none + WebKit rule)", () => {
    render(<Tabs items={FIRST_DISABLED} />);
    const tablist = screen.getByRole("tablist");
    expect(tablist.className).toContain("data-[orientation=horizontal]:[scrollbar-width:none]");
    expect(tablist.className).toContain(
      "[&[data-orientation=horizontal]::-webkit-scrollbar]:hidden",
    );
  });

  it("variant=line keeps the same scroll affordance as the default pill variant", () => {
    render(<Tabs items={FIRST_DISABLED} variant="line" />);
    expect(screen.getByRole("tablist").className).toContain(
      "data-[orientation=horizontal]:overflow-x-auto",
    );
  });

  it("variant=card keeps the same scroll affordance as the default pill variant", () => {
    render(<Tabs items={FIRST_DISABLED} variant="card" />);
    expect(screen.getByRole("tablist").className).toContain(
      "data-[orientation=horizontal]:overflow-x-auto",
    );
  });

  it("the Tabs root is a shrinkable flex container so it never forces an ancestor wider", () => {
    const { container } = render(<Tabs items={FIRST_DISABLED} />);
    const root = container.querySelector('[data-slot="tabs"]');
    expect(root?.className).toContain("flex");
    // The shrink floor used to be a `min-w-0` Tailwind literal on the component. Tokenizing the
    // tab box (#319) moved it — and only it — into styles/navigation-layout.css, keyed off the
    // very same data-slot, so the floor still applies to exactly this element. It is asserted on
    // the stylesheet because a service theme must never be able to reach it: unlike the strip↔panel
    // gap next to it, `min-inline-size: 0` is the flexbox shrink idiom, not a tunable constant.
    expect(navigationCss).toContain(
      '[data-slot="tabs"] { min-inline-size: 0; gap: var(--tabs-root-gap); }',
    );
  });

  it("vertical orientation keeps the horizontal-only scroll utility ATTRIBUTE-GATED (data-[orientation=horizontal]:*), so it never applies to the vertical rail", () => {
    render(<Tabs items={FIRST_DISABLED} orientation="vertical" />);
    const tablist = screen.getByRole("tablist");
    expect(tablist).toHaveAttribute("data-orientation", "vertical");
    // The class is still authored with the `data-[orientation=horizontal]:` variant — it is a
    // no-op CSS selector when data-orientation="vertical" (verified visually: see PR description).
    expect(tablist.className).toContain("data-[orientation=horizontal]:overflow-x-auto");
  });

  it("compound (manual TabsList) API gets the same overflow handling as the items API", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
        <TabsContent value="two">Second</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tablist").className).toContain(
      "data-[orientation=horizontal]:overflow-x-auto",
    );
  });
});
