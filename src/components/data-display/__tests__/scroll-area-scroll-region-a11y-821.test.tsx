import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";

import { ScrollArea } from "../scroll-area";

/**
 * gh#821 — `ScrollArea`'s viewport took keyboard focus with NO role and NO accessible name, the
 * identical defect gh#817 fixed one component over in `Table`:
 *
 *   <div data-slot="scroll-area-viewport" tabindex="0" class="ui-scroll-area">
 *
 * The tab stop itself is correct (WCAG 2.1.1 — it is how the overflow is reached without a
 * pointer), so the fix NAMES it rather than removing it: `role="group"` + an accessible name that
 * defaults to the localized `dataDisplay.scrollArea.region`, so no consumer is forced to invent one.
 *
 * `group`, not `region`: a named `region` is a LANDMARK, and a page with several scroll areas would
 * ship several identically-named landmarks (axe `landmark-unique`).
 *
 * The second half: the stop only exists while there IS overflow to reach — and here, unlike the
 * table, on the axes `orientation` actually opens, because an axis left out is `overflow: hidden`
 * and cannot be scrolled to at all. jsdom reports 0 for every layout box, so overflow has to be
 * STUBBED — and the guard that an unlaid-out box counts as scrolling is what keeps every other
 * jsdom test seeing the tab stop.
 */

const resizeCallbacks: (() => void)[] = [];

beforeEach(() => {
  resizeCallbacks.length = 0;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
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

/** Make the viewport report a real layout on both axes, then let the observer notice. */
function measure(
  el: Element,
  box: { clientWidth: number; scrollWidth: number; clientHeight: number; scrollHeight: number },
) {
  for (const [name, value] of Object.entries(box)) {
    Object.defineProperty(el, name, { value, configurable: true });
  }
  act(() => {
    for (const fire of resizeCallbacks) fire();
  });
}

/** A box that fits on BOTH axes — nothing anywhere to scroll to. */
const FITS = { clientWidth: 400, scrollWidth: 400, clientHeight: 300, scrollHeight: 300 };
/** Taller than the box, exactly as wide: only the vertical axis has anywhere to go. */
const TALL = { clientWidth: 400, scrollWidth: 400, clientHeight: 300, scrollHeight: 900 };
/** Wider than the box, exactly as tall: only the horizontal axis has anywhere to go. */
const WIDE = { clientWidth: 400, scrollWidth: 1200, clientHeight: 300, scrollHeight: 300 };

function Log(props: React.ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea className="h-40" {...props}>
      <div>
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index}>メッセージ {index + 1}</div>
        ))}
      </div>
    </ScrollArea>
  );
}

function viewportOf(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>("[data-slot='scroll-area-viewport']");
  if (!el) throw new Error("no scroll-area viewport in the tree");
  return el;
}

describe("ScrollArea — the viewport is a NAMED stop, not an anonymous one (gh#821)", () => {
  it("carries role=group and the localized default name beside its tabindex", () => {
    const { container } = render(<Log />);
    const viewport = viewportOf(container);

    // The reported markup, restored in full: the same tab stop, no longer unroled and unnamed.
    expect(viewport).toHaveAttribute("tabindex", "0");
    expect(viewport).toHaveAttribute("role", "group");
    expect(viewport).toHaveAccessibleName("Vùng có thể cuộn");
  });

  it("is a GROUP, never a landmark region — several areas must not collide on one page", () => {
    const { container } = render(
      <>
        <Log />
        <Log />
      </>,
    );
    expect(container.querySelectorAll("[role='region']")).toHaveLength(0);
    expect(container.querySelectorAll("[role='group']")).toHaveLength(2);
  });

  it("takes the consumer's `label` as the region name when one is given", () => {
    const { container } = render(<Log label="監査ログ" />);
    expect(viewportOf(container)).toHaveAccessibleName("監査ログ");
  });

  it("falls back to the default when `label` is not a usable aria-label", () => {
    const { container } = render(<Log label={<strong>監査ログ</strong>} />);
    expect(viewportOf(container)).toHaveAccessibleName("Vùng có thể cuộn");
  });

  it("still lets the consumer's own aria-label win, as it always has", () => {
    const { container } = render(<Log aria-label="log" />);
    expect(viewportOf(container)).toHaveAccessibleName("log");
  });

  it("drops the stop, the role and the name once the content provably FITS", () => {
    const { container } = render(<Log />);
    const viewport = viewportOf(container);

    measure(viewport, FITS);

    expect(viewport).not.toHaveAttribute("tabindex");
    expect(viewport).not.toHaveAttribute("role");
    expect(viewport).not.toHaveAttribute("aria-label");
  });

  it("keeps all three the moment there IS overflow to reach", () => {
    const { container } = render(<Log />);
    const viewport = viewportOf(container);

    measure(viewport, TALL);

    expect(viewport).toHaveAttribute("tabindex", "0");
    expect(viewport).toHaveAttribute("role", "group");
    expect(viewport).toHaveAccessibleName("Vùng có thể cuộn");
  });
});

describe("ScrollArea — the axis that is measured is the axis that SCROLLS (gh#821)", () => {
  // The whole difference from Table: an axis `orientation` leaves out is `overflow: hidden`, so
  // content overflowing THERE is clipped, not reachable, and must not buy a focus stop.
  it("ignores vertical overflow while only the horizontal axis scrolls", () => {
    const { container } = render(<Log orientation="horizontal" />);
    const viewport = viewportOf(container);

    measure(viewport, TALL);

    expect(viewport).not.toHaveAttribute("tabindex");
    expect(viewport).not.toHaveAttribute("role");
  });

  it("ignores horizontal overflow while only the vertical axis scrolls", () => {
    const { container } = render(<Log orientation="vertical" />);
    const viewport = viewportOf(container);

    measure(viewport, WIDE);

    expect(viewport).not.toHaveAttribute("tabindex");
    expect(viewport).not.toHaveAttribute("role");
  });

  it("names the region for EITHER axis under orientation=both", () => {
    const { container } = render(<Log orientation="both" />);
    const viewport = viewportOf(container);

    measure(viewport, WIDE);
    expect(viewport).toHaveAttribute("tabindex", "0");

    measure(viewport, TALL);
    expect(viewport).toHaveAttribute("tabindex", "0");

    measure(viewport, FITS);
    expect(viewport).not.toHaveAttribute("tabindex");
  });

  it("keeps the stop for an UNLAID-OUT box, which is not evidence that anything fits", () => {
    // SSR, jsdom, a `display:none` ancestor: 0 everywhere. Reading that as "no overflow" would
    // strand the overflow from every keyboard user — a worse failure than a spare stop.
    const { container } = render(<Log orientation="both" />);
    const viewport = viewportOf(container);

    measure(viewport, { clientWidth: 0, scrollWidth: 0, clientHeight: 0, scrollHeight: 0 });

    expect(viewport).toHaveAttribute("tabindex", "0");
    expect(viewport).toHaveAttribute("role", "group");
  });
});
