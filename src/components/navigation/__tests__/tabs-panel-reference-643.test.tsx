import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

/**
 * A TAB NEVER POINTS AT A PANEL THAT IS NOT THERE.
 *
 * `Tabs`, `TabsList` and `TabsTrigger` are three separate public exports and nothing in their
 * types asks for a fourth, so a saved-view ribbon — a strip that swaps a grid rendered elsewhere
 * on the page — composes exactly those three. React Aria's `useTab` writes an unconditional
 * `aria-controls="<id>-tabpanel-<key>"`, so that strip shipped a reference to an id that never
 * enters the document.
 *
 * Measured on `/showcase/table-view-tabs` (gh#643): axe `aria-valid-attr-value`, 1 node at each of
 * 320 / 375 / 1440 — "Invalid ARIA attribute value:
 * aria-controls=react-aria…-tabpanel-pending". A screen reader offers a region to jump to and
 * there is nothing there. Exactly one node, because `useTab` writes the attribute only on the
 * SELECTED tab (react-aria 3.52.1) — which is asserted below, so a release that starts writing it
 * on every tab lands here rather than in a consumer's nightly.
 *
 * Asserted on the ATTRIBUTE rather than through axe: `vitest-axe` was removed in #492 and the
 * frame gate lives in `scripts/check-frame-axe.mjs`, which needs a browser.
 */
describe("Tabs · aria-controls (gh#643)", () => {
  it("omits aria-controls on a strip that declares no panel", () => {
    renderWithUi(
      <Tabs aria-label="保存ビュー" defaultValue="a" variant="line">
        <TabsList variant="line">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    for (const name of ["A", "B"]) {
      expect(screen.getByRole("tab", { name })).not.toHaveAttribute("aria-controls");
    }
  });

  it("still points the selected tab at its panel when panels are declared", () => {
    renderWithUi(
      <Tabs aria-label="View" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );

    // The selected tab is the one the rule reaches, and its panel is in the document.
    const selected = screen.getByRole("tab", { name: "A" });
    const controls = selected.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls as string)).not.toBeNull();
    // RAC leaves the unselected tab without one, panel declared or not — the reason a single node
    // was reported per viewport, and the reason a DECLARED panel is the right unit to register.
    expect(screen.getByRole("tab", { name: "B" })).not.toHaveAttribute("aria-controls");
  });

  it("points at its panel in the items form too", () => {
    renderWithUi(
      <Tabs
        aria-label="View"
        defaultValue="a"
        items={[
          { value: "a", label: "A", content: "Panel A" },
          { value: "b", label: "B", content: "Panel B" },
        ]}
      />,
    );

    const controls = screen.getByRole("tab", { name: "A" }).getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls as string)).not.toBeNull();
  });
});
