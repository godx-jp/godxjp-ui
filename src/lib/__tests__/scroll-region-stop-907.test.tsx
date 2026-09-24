import { act, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScrollsOnAxis } from "../hooks";

/**
 * gh#907 — the scroll region's tab stop must never lag the overflow it is for.
 *
 * WHAT WAS WRONG, and it is one frame wide. `useScrollsOnAxis` starts `true`, so the mount frame
 * always carries the stop; the report's stated mechanism ("between paint and that measurement")
 * cannot happen. The real window opens AFTER a correct removal: a box that fits loses the stop,
 * then something widens it again, and the `ResizeObserver` callback — which runs after layout and
 * BEFORE paint — batched its `setScrolls`, so the re-render landed in the NEXT frame. The frame in
 * between paints a genuinely scrollable box with no keyboard access, which is what axe reports as
 * `scrollable-region-focusable`.
 *
 * MEASURED in Chromium on /showcase/table-sticky-columns, by widening the viewport until the table
 * fits (stop correctly withheld) and narrowing it again, sampling from inside a `ResizeObserver`
 * registered AFTER the component's so it reads the same frame's final DOM:
 *
 *     without the fix   1 painted frame overflowing with no tab stop
 *     with the fix      0
 *
 * A `requestAnimationFrame` sampler reports 1 in BOTH, because rAF callbacks run BEFORE resize
 * observations in the frame — it reads the DOM the component has not updated yet. Trusting that
 * number would have said the fix does nothing. The sampler's position is part of the measurement.
 *
 * WHY THE DIRECTIONS ARE NOT SYMMETRIC. `hooks.ts` already ranks the two failures: "the
 * measurement may only ever REMOVE the stop, never withhold it on a guess", and an extra tab stop
 * is the lesser fault. So ADDING is flushed synchronously and REMOVING stays batched — one
 * synchronous render, only on the transition into overflow. This test pins that asymmetry, because
 * a well-meaning "simplify" that flushes both, or neither, silently restores the defect.
 */

const flushSync = vi.hoisted(() => vi.fn());

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return { ...actual, flushSync: (fn: () => void) => (flushSync(), actual.flushSync(fn)) };
});

/** The observer the hook installs, captured so a test can drive one notification at a time. */
let notify: (() => void) | undefined;

/** The `loadingdone` listeners the hook installs on `document.fonts`, driven the same way. */
const fontListeners = new Set<() => void>();

class CapturingResizeObserver {
  constructor(callback: () => void) {
    notify = callback;
  }
  observe() {}
  disconnect() {
    notify = undefined;
  }
}

/** `clientWidth` / `scrollWidth` are 0 in jsdom, and 0 means "unlaid out", never "it fits". */
function layout({ client, scroll }: { client: number; scroll: number }) {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    value: client,
    configurable: true,
  });
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    value: scroll,
    configurable: true,
  });
}

function Region() {
  const ref = useRef<HTMLDivElement>(null);
  const scrolls = useScrollsOnAxis(ref, true, "horizontal");
  return <div ref={ref} data-testid="box" {...(scrolls ? { tabIndex: 0, role: "group" } : {})} />;
}

describe("the scroll region's tab stop (gh#907)", () => {
  beforeEach(() => {
    flushSync.mockClear();
    fontListeners.clear();
    globalThis.ResizeObserver = CapturingResizeObserver as unknown as typeof ResizeObserver;
    /* jsdom has no `document.fonts`; the hook guards with `?.` so it simply does nothing there.
     * A stub is installed so the font path can be DRIVEN rather than assumed absent. */
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        ready: Promise.resolve(),
        addEventListener: (type: string, fn: () => void) => {
          if (type === "loadingdone") fontListeners.add(fn);
        },
        removeEventListener: (_type: string, fn: () => void) => fontListeners.delete(fn),
      },
    });
  });
  afterEach(() => {
    notify = undefined;
  });

  it("carries the stop on the mount frame, before anything has been measured", () => {
    // The state starts `true` on purpose: an unmeasured box is not evidence that nothing overflows.
    layout({ client: 0, scroll: 0 });
    render(<Region />);
    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
  });

  it("drops the stop once the box is measured to fit — a stop that scrolls nothing is noise", () => {
    layout({ client: 800, scroll: 800 });
    render(<Region />);
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");
  });

  it("ADDS the stop back synchronously when overflow returns, so no frame paints without it", () => {
    layout({ client: 800, scroll: 800 });
    render(<Region />);
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");

    flushSync.mockClear();
    layout({ client: 375, scroll: 1200 }); // the viewport narrowed; the box overflows again
    notify?.();

    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
    expect(flushSync, "the ADD must not wait for the next frame").toHaveBeenCalled();
  });

  it("does NOT flush the removal — the lesser failure stays cheap", () => {
    layout({ client: 375, scroll: 1200 });
    render(<Region />);
    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");

    flushSync.mockClear();
    layout({ client: 800, scroll: 800 }); // it fits now
    // `act` is REQUIRED here and deliberately absent from the test above: the removal is batched,
    // so nothing has re-rendered when the observer returns. That asymmetry IS the fix — the add
    // lands without act because it was flushed, the removal needs act because it was not.
    act(() => {
      notify?.();
    });

    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");
    expect(flushSync, "a removal does not earn a synchronous render").not.toHaveBeenCalled();
  });

  it("ADDS the stop when a web face lands, with no resize at all (gh#907, reopened)", () => {
    /* THE THIRD WAY INTO OVERFLOW, and the one 30.0.2 missed. `[data-slot="table"]` is `w-full`
     * inside a `w-full` wrapper, so a font slice that re-lays-out the cell text changes NEITHER
     * observed box — the text overflows inside them and `scrollWidth` crosses `clientWidth` with
     * no resize to notice. Driven here with the ResizeObserver deliberately silent: if the fix
     * ever regresses to resize-only, `notify` is never called and this fails. */
    layout({ client: 800, scroll: 800 });
    render(<Region />);
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");

    flushSync.mockClear();
    layout({ client: 375, scroll: 1200 }); // a slice landed; the text is wider now
    for (const fn of fontListeners) fn();

    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
    expect(flushSync, "a font-driven add is as urgent as a resize-driven one").toHaveBeenCalled();
  });

  it("keeps listening after the first batch — a sliced face arrives in many", () => {
    /* `fonts.ready` settles once, for the faces pending at that moment. The reporter's app loads
     * 729 unicode-range slices, which keep fetching as new glyphs are needed, so the slice that
     * widens the table can land long after that promise resolved. `loadingdone` is why a SECOND
     * batch still re-measures. */
    layout({ client: 800, scroll: 800 });
    render(<Region />);
    for (const fn of fontListeners) fn(); // batch one: still fits
    expect(screen.getByTestId("box")).not.toHaveAttribute("tabindex");

    layout({ client: 375, scroll: 1200 });
    for (const fn of fontListeners) fn(); // batch two: now it overflows
    expect(screen.getByTestId("box")).toHaveAttribute("tabindex", "0");
  });

  it("unsubscribes from `document.fonts` on unmount", () => {
    layout({ client: 800, scroll: 800 });
    const { unmount } = render(<Region />);
    expect(fontListeners.size).toBe(1);
    unmount();
    expect(fontListeners.size, "a listener per mounted region would leak").toBe(0);
  });

  it("does not flush on the FIRST measurement, which runs inside the effect", () => {
    // React warns when `flushSync` is called from a lifecycle, and it would buy nothing: the state
    // already starts `true`, so the mount frame carries the stop whatever the first read says.
    layout({ client: 375, scroll: 1200 });
    render(<Region />);
    expect(flushSync).not.toHaveBeenCalled();
  });
});
