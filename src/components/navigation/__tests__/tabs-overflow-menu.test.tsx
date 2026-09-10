import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoA11yViolations } from "@/test/a11y";

import { Tabs } from "../tabs";
import { resolveHiddenTabValues } from "../tabs-scroll";

/**
 * `overflow="menu"` — Ant Design's `more`, mapped onto this package's `overflow` vocabulary.
 *
 * ── WHAT THIS FILE PROVES / DOES NOT PROVE ───────────────────────────────────────────────────
 * jsdom performs NO layout: every `getBoundingClientRect()` is a zero rect, nothing scrolls, and
 * a zero-sized scrollport is (correctly) read as "everything fits". So this suite splits the same
 * way `tabs-active-visible-204.test.tsx` does, and for the same reason:
 *
 *  1. **The measurement, on real numbers.** `resolveHiddenTabValues` is a pure function over two
 *     rect reads; it is handed the exact geometry of an overflowing strip and its answer is
 *     asserted. Nothing is faked there but the rects themselves.
 *  2. **The wiring, with the observer driven by hand.** That a resize notification reaches the
 *     measurement, that the button appears with a name, that its menu lists exactly the tabs that
 *     are out of view, and that choosing one really moves the selection.
 *
 * NOT proved here, and deliberately not attempted: that a strip of Japanese labels actually
 * overflows at a real width, that the chosen tab is then scrolled into view, or that the button is
 * visible at all. Those are geometry, and geometry is measured in a browser —
 * `scripts/check-tabs-overflow-menu.mjs`, wired into check:frame-runtime.
 */

const ITEMS = [
  { value: "a", label: "未承認", content: "パネルA" },
  { value: "b", label: "承認済", content: "パネルB" },
  { value: "c", label: "取消済", content: "パネルC" },
  { value: "d", label: "差戻し", content: "パネルD" },
];

const rect = (left: number, right: number): DOMRect =>
  ({
    left,
    right,
    top: 0,
    bottom: 40,
    width: right - left,
    height: 40,
    x: left,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

describe("tabs-scroll — resolveHiddenTabValues (pure geometry)", () => {
  /** A detached strip whose triggers carry the rects a real overflowing bar would have. */
  const strip = (scrollport: DOMRect, triggers: DOMRect[]) => {
    const list = document.createElement("div");
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue(scrollport);
    for (const box of triggers) {
      const tab = document.createElement("button");
      tab.setAttribute("role", "tab");
      vi.spyOn(tab, "getBoundingClientRect").mockReturnValue(box);
      list.append(tab);
    }
    return list;
  };

  it("names the trailing tabs that run past the end of a 390px scrollport", () => {
    const list = strip(rect(0, 390), [
      rect(0, 120),
      rect(120, 260),
      rect(260, 470),
      rect(470, 610),
    ]);
    expect(resolveHiddenTabValues(list, ["a", "b", "c", "d"])).toEqual(["c", "d"]);
  });

  it("names a LEADING tab the strip has scrolled past — overflow is not only trailing", () => {
    const list = strip(rect(0, 390), [rect(-140, -20), rect(-20, 120), rect(120, 260)]);
    expect(resolveHiddenTabValues(list, ["a", "b", "c"])).toEqual(["a", "b"]);
  });

  it("names nothing when every trigger fits", () => {
    const list = strip(rect(0, 800), [rect(0, 120), rect(120, 260), rect(260, 400)]);
    expect(resolveHiddenTabValues(list, ["a", "b", "c"])).toEqual([]);
  });

  it("maps trigger to value by INDEX — the rendered id is React Aria's, not the item's", () => {
    const list = strip(rect(0, 200), [rect(0, 120), rect(120, 340)]);
    // If the mapping ever went through the DOM id it would return "" or throw; it must return the
    // SECOND item's own value.
    expect(resolveHiddenTabValues(list, ["overview", "history"])).toEqual(["history"]);
  });

  it("ignores a trigger with no matching item instead of reporting undefined", () => {
    const list = strip(rect(0, 100), [rect(0, 220), rect(220, 340)]);
    expect(resolveHiddenTabValues(list, ["a"])).toEqual(["a"]);
  });
});

describe('Tabs — antd `more` (shipped as overflow="menu")', () => {
  let resizeCallbacks: ResizeObserverCallback[] = [];

  beforeEach(() => {
    resizeCallbacks = [];
    vi.stubGlobal(
      "ResizeObserver",
      class FakeResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          resizeCallbacks.push(callback);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /**
   * The ONE geometry fake here: a 260px scrollport holding four 140px triggers, so the last two
   * sit outside it. Applied to the elements the component already rendered, then delivered through
   * the ResizeObserver the way a viewport change would deliver it.
   */
  const overflowTheStrip = (hiddenFrom: number) => {
    const list = screen.getByRole("tablist");
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue(rect(0, hiddenFrom * 140));
    screen.getAllByRole("tab").forEach((tab, index) => {
      vi.spyOn(tab, "getBoundingClientRect").mockReturnValue(rect(index * 140, (index + 1) * 140));
    });
    for (const callback of resizeCallbacks) {
      callback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
    }
  };

  /**
   * `.ui-tabs-overflow`, not a `data-slot`: `DropdownMenuTrigger` stamps its own
   * `data-slot="dropdown-menu-trigger"` after the caller's props, so a `data-slot` passed in never
   * reaches the DOM. A `ui-*` class is the design system's own name and the sanctioned handle.
   */
  const overflowButton = () => document.querySelector(".ui-tabs-overflow");

  it("renders no overflow control at all under the default `scroll`", () => {
    render(<Tabs items={ITEMS} />);
    overflowTheStrip(2);
    expect(overflowButton()).toBeNull();
    // …and the strip is not wrapped in a bar row it does not need.
    expect(document.querySelector('[data-slot="tabs-bar"]')).toBeNull();
  });

  it("keeps the bar row even while nothing overflows, so the strip is never re-parented", () => {
    render(<Tabs items={ITEMS} overflow="menu" />);
    // No geometry delivered: jsdom's zero rects read as "everything fits".
    expect(document.querySelector('[data-slot="tabs-bar"]')).not.toBeNull();
    expect(overflowButton()).toBeNull();
  });

  it("grows a NAMED button once tabs go out of view", async () => {
    render(<Tabs items={ITEMS} overflow="menu" />);
    overflowTheStrip(2);
    await waitFor(() => {
      expect(overflowButton()).not.toBeNull();
    });
    expect(overflowButton()?.getAttribute("aria-label")).toBeTruthy();
  });

  it("keeps every tab in the tablist — the APG shape, not antd's re-homing", async () => {
    render(<Tabs items={ITEMS} overflow="menu" />);
    overflowTheStrip(2);
    await waitFor(() => {
      expect(overflowButton()).not.toBeNull();
    });
    // antd REMOVES the overflowing tabs from the bar. A tab that is not in the tablist cannot take
    // roving focus, so here they all stay and the menu is an additional route.
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByRole("tablist")).not.toContainElement(overflowButton() as HTMLElement);
  });

  it("lists EXACTLY the tabs that are out of view", async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} overflow="menu" />);
    overflowTheStrip(2);
    await waitFor(() => {
      expect(overflowButton()).not.toBeNull();
    });

    await user.click(overflowButton() as HTMLElement);
    const names = (await screen.findAllByRole("menuitem")).map((item) => item.textContent);
    expect(names).toEqual(["取消済", "差戻し"]);
  });

  it("selects the chosen tab — a menu item is not a tab, so the selection is pushed in", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs items={ITEMS} overflow="menu" onValueChange={onValueChange} />);
    overflowTheStrip(2);
    await waitFor(() => {
      expect(overflowButton()).not.toBeNull();
    });

    await user.click(overflowButton() as HTMLElement);
    await user.click(await screen.findByRole("menuitem", { name: "差戻し" }));

    expect(onValueChange).toHaveBeenCalledWith("d");
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "差戻し" })).toHaveAttribute("aria-selected", "true");
    });
    expect(screen.getByText("パネルD")).toBeInTheDocument();
  });

  it("still honours a controlled `value` — the menu reports, the parent decides", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs items={ITEMS} overflow="menu" value="a" onValueChange={onValueChange} />);
    overflowTheStrip(2);
    await waitFor(() => {
      expect(overflowButton()).not.toBeNull();
    });

    await user.click(overflowButton() as HTMLElement);
    await user.click(await screen.findByRole("menuitem", { name: "差戻し" }));

    expect(onValueChange).toHaveBeenCalledWith("d");
    // The parent did not move `value`, so neither did the strip.
    expect(screen.getByRole("tab", { name: "未承認" })).toHaveAttribute("aria-selected", "true");
  });

  it("carries a disabled item through as a disabled menu item", async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        items={[ITEMS[0], ITEMS[1], ITEMS[2], { ...ITEMS[3], disabled: true }]}
        overflow="menu"
      />,
    );
    overflowTheStrip(2);
    await waitFor(() => {
      expect(overflowButton()).not.toBeNull();
    });

    await user.click(overflowButton() as HTMLElement);
    expect(await screen.findByRole("menuitem", { name: "差戻し" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("has no axe violations while the overflow button is showing", async () => {
    await expectNoA11yViolations(<Tabs items={ITEMS} overflow="menu" />);
  });
});
