import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

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
    render(<Tabs items={FIRST_DISABLED} />);
    const tablist = screen.getByRole("tablist");
    expect(tablist).toHaveAttribute("data-orientation", "horizontal");
    expect(tablist.className).toContain("min-w-0");
    expect(tablist.className).toContain("max-w-full");
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

  it("the Tabs root is a shrinkable flex container (min-w-0) so it never forces an ancestor wider", () => {
    const { container } = render(<Tabs items={FIRST_DISABLED} />);
    expect(container.querySelector('[data-slot="tabs"]')?.className).toContain("min-w-0");
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
