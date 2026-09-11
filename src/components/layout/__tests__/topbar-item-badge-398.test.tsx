/**
 * gh#398 — TopbarItem publishes the count affordance its own use cases name ("notifications bell"),
 * so a bar cell no longer needs `relative` + `absolute -end-0.5 -top-0.5` at the call site.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Bell } from "lucide-react";
import { describe, expect, it } from "vitest";

import { TopbarItem } from "../topbar-item";
import { renderWithUi, screen } from "@/test/render";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");
const badgeOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="topbar-item-badge"]');

describe("TopbarItem badge (gh#398)", () => {
  it("renders no badge node at all when the prop is absent", () => {
    const { container } = renderWithUi(
      <TopbarItem aria-label="通知">
        <Bell />
      </TopbarItem>,
    );
    expect(badgeOf(container)).toBeNull();
  });

  it("overlays the count on the glyph inside the same cell", () => {
    const { container } = renderWithUi(
      <TopbarItem aria-label="12 件の未読通知" badge={12}>
        <Bell />
      </TopbarItem>,
    );
    const badge = badgeOf(container);
    expect(badge).toHaveTextContent("12");
    expect(badge).toHaveClass("ui-topbar-item-badge");
    // Inside the cell, so the overlay cannot widen the bar's end cluster.
    expect(screen.getByRole("button", { name: "12 件の未読通知" })).toContainElement(
      badge as HTMLElement,
    );
  });

  it("treats an empty badge as absent", () => {
    const { container } = renderWithUi(
      <TopbarItem aria-label="通知" badge="">
        <Bell />
      </TopbarItem>,
    );
    expect(badgeOf(container)).toBeNull();
  });

  it("reflects only the non-default tone, like the Sidebar row's badge", () => {
    const { container: quiet } = renderWithUi(
      <TopbarItem aria-label="通知" badge={3}>
        <Bell />
      </TopbarItem>,
    );
    expect(badgeOf(quiet)).not.toHaveAttribute("data-tone");

    const { container: loud } = renderWithUi(
      <TopbarItem aria-label="通知" badge={3} badgeTone="destructive">
        <Bell />
      </TopbarItem>,
    );
    expect(badgeOf(loud)).toHaveAttribute("data-tone", "destructive");
  });

  it("is ignored under asChild, where Slot borrows the child's single element", () => {
    const { container } = renderWithUi(
      <TopbarItem asChild badge={5}>
        <a href="/notifications" aria-label="通知">
          <Bell />
        </a>
      </TopbarItem>,
    );
    expect(container.querySelector("a")).toHaveClass("ui-topbar-item");
    expect(badgeOf(container)).toBeNull();
  });

  it("anchors the pill to the glyph through tokens, on logical axes", () => {
    const tokens = read("../../../tokens/components/shell.css");
    const layout = read("../../../styles/shell-layout.css");

    for (const token of [
      "--topbar-item-badge-offset-block",
      "--topbar-item-badge-offset-inline",
      "--topbar-item-badge-size",
      "--topbar-item-badge-font-size",
      "--topbar-item-badge-background",
      "--topbar-item-badge-destructive-background",
    ]) {
      expect(tokens).toContain(`${token}:`);
    }
    // The cell only becomes a positioning context when it carries a badge.
    expect(layout).toMatch(
      /\.ui-topbar-item:has\(> \[data-slot="topbar-item-badge"\]\) \{\s*position: relative;/,
    );
    // Logical inset properties only — the pill must move corner with the writing direction.
    const rule = layout.slice(
      layout.indexOf(".ui-topbar-item-badge {"),
      layout.indexOf("}", layout.indexOf(".ui-topbar-item-badge {")),
    );
    expect(rule).toContain("inset-block-start:");
    expect(rule).toContain("inset-inline-end:");
    expect(rule).not.toMatch(/\b(?:top|right|left|bottom):/);
  });
});
