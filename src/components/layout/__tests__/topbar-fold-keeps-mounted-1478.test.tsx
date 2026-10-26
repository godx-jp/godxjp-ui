import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, renderWithUi, screen, userEvent } from "@/test/render";

import { CommandPalette } from "../../data-entry/command-palette";
import { Topbar } from "../topbar";
import { TopbarItem } from "../topbar-item";

/**
 * gh#1478 — `overflow="menu"` moved its clusters INTO the "more" PopoverContent, which exists only
 * while the menu is open, so folding UNMOUNTED every control: a CommandPalette in `start` lost its
 * ⌘K listener (measured on a consumer at 1024px: 30 presses in 15s, no dialog) and every control
 * remounted on each fold. jsdom does no layout, so the geometry is stated as the browser reports it.
 */
let width = { client: 32, scroll: 336 };
function geometry() {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.dataset.slot === "topbar" ? width.client : 0;
  });
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.dataset.slot === "topbar" ? width.scroll : 0;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  width = { client: 32, scroll: 336 };
});

const groups = [{ id: "pages", label: "Pages", items: [{ id: "/a", label: "Alpha" }] }];
const labels = {
  open: "Open palette",
  title: "Palette",
  description: "Find",
  placeholder: "Search",
  empty: "None",
  loading: "Loading",
};

let mounts = 0;
function Counted() {
  React.useEffect(() => {
    mounts += 1;
  }, []);
  return <TopbarItem aria-label="Account">A</TopbarItem>;
}

const moreCell = () => document.querySelector<HTMLElement>("[data-topbar-overflow-trigger]")!;

describe("Topbar overflow=menu keeps folded controls mounted (gh#1478)", () => {
  it("Ctrl+K opens a CommandPalette that lives in a folded, CLOSED bar", async () => {
    geometry();
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <Topbar
        overflow="menu"
        start={<CommandPalette groups={groups} labels={labels} onSelect={vi.fn()} />}
        end={<TopbarItem aria-label="Account">A</TopbarItem>}
      />,
    );
    expect(container.querySelector('[data-slot="topbar"]')).toHaveAttribute(
      "data-collapsed",
      "true",
    );
    // Folded and closed: the controls are not in the accessibility tree…
    expect(screen.queryByRole("button", { name: "Account" })).toBeNull();
    // …but they are mounted, so the palette's global shortcut still works.
    await user.keyboard("{Control>}k{/Control}");
    expect(await screen.findByRole("dialog", { name: "Palette" })).toBeInTheDocument();
  });

  it("opening the menu MOVES the same controls into it — still exactly one of each", () => {
    geometry();
    const { container } = renderWithUi(
      <Topbar
        overflow="menu"
        start={<TopbarItem aria-label="Search">S</TopbarItem>}
        end={<TopbarItem aria-label="Account">A</TopbarItem>}
      />,
    );
    const topbar = container.querySelector('[data-slot="topbar"]')!;
    fireEvent.click(moreCell());
    for (const name of ["Search", "Account"]) {
      expect(screen.getAllByRole("button", { name })).toHaveLength(1);
      expect(topbar.contains(screen.getByRole("button", { name }))).toBe(false);
    }
  });

  it("folding and unfolding do not remount a control", async () => {
    mounts = 0;
    width = { client: 800, scroll: 800 };
    geometry();
    let resize: () => void = () => {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: () => void) {
          resize = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const { container } = renderWithUi(<Topbar overflow="menu" end={<Counted />} />);
    const topbar = container.querySelector('[data-slot="topbar"]')!;
    expect(topbar).toHaveAttribute("data-collapsed", "false");
    // Expanded: the cluster is a direct child of the bar, as the layout rules expect.
    expect(topbar.querySelector(":scope > .ui-topbar-end")).not.toBeNull();
    expect(mounts).toBe(1);

    width = { client: 32, scroll: 336 };
    act(() => resize());
    expect(topbar).toHaveAttribute("data-collapsed", "true");
    width = { client: 800, scroll: 800 };
    act(() => resize());
    expect(topbar).toHaveAttribute("data-collapsed", "false");
    expect(topbar.querySelector(":scope > .ui-topbar-end")).not.toBeNull();
    expect(mounts).toBe(1);
    vi.unstubAllGlobals();
  });
});
