import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Topbar } from "../topbar";
import { TopbarItem } from "../topbar-item";

/**
 * `overflow="menu"` (gh#914). Measured on a consumer (godx-jp/id#1797) at 320px with 200% text:
 * under the default `"scroll"` the bar was a 32px scroll window over 320px of controls, so the
 * account, locale and theme cells were technically reachable and practically not.
 *
 * jsdom does no layout, so each case states the geometry the browser would report — a bar whose
 * content is wider than its box, or one that fits — and asserts what Topbar does with it.
 */
function geometry({ client, scroll }: { client: number; scroll: number }) {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.dataset.slot === "topbar" ? client : 0;
  });
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.dataset.slot === "topbar" ? scroll : 0;
  });
}

const bar = (
  <Topbar
    overflow="menu"
    start={<TopbarItem aria-label="Search">S</TopbarItem>}
    end={
      <>
        <TopbarItem aria-label="Notifications">N</TopbarItem>
        <TopbarItem aria-label="Account">A</TopbarItem>
      </>
    }
  />
);

afterEach(() => vi.restoreAllMocks());

/** The "more" cell, found by its hook rather than its label, which follows the active locale. */
const moreCell = () => document.querySelector<HTMLElement>("[data-topbar-overflow-trigger]");

describe("Topbar overflow=menu (gh#914)", () => {
  it("keeps the clusters in the bar when they fit", () => {
    geometry({ client: 800, scroll: 800 });
    render(bar);
    expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument();
    expect(moreCell()).toBeNull();
  });

  it("collapses to ONE more cell when they do not, and renders each control exactly once", () => {
    geometry({ client: 32, scroll: 336 });
    const { container } = render(bar);
    const topbar = container.querySelector('[data-slot="topbar"]')!;

    expect(topbar).toHaveAttribute("data-collapsed");
    const more = moreCell()!;
    expect(topbar.contains(more)).toBe(true);
    // A translated name, never the raw catalog key.
    expect(more.getAttribute("aria-label")).toMatch(/^(More|その他|Thêm)$/);
    expect(screen.queryByRole("button", { name: "Account" })).toBeNull();

    fireEvent.click(more);
    // Moved, not copied: one Account, one Notifications, one Search — and none left in the bar.
    for (const name of ["Search", "Notifications", "Account"]) {
      expect(screen.getAllByRole("button", { name })).toHaveLength(1);
      expect(topbar.contains(screen.getByRole("button", { name }))).toBe(false);
    }
  });

  it("leaves the default scroll bar and the children escape hatch alone", () => {
    geometry({ client: 32, scroll: 336 });
    const { container } = render(
      <>
        <Topbar end={<TopbarItem aria-label="Account">A</TopbarItem>} />
        <Topbar overflow="menu">
          <TopbarItem aria-label="Custom">C</TopbarItem>
        </Topbar>
      </>,
    );
    expect(container.querySelectorAll("[data-collapsed]")).toHaveLength(0);
    expect(moreCell()).toBeNull();
  });
});
