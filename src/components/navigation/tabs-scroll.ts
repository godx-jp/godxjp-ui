import * as React from "react";

/**
 * A tab you cannot see is a tab you cannot use. The fix observes the strip (size changes) and its
 * triggers (`data-state` changes) and scrolls the element that must stay reachable back into view.
 */

/** Minimal rect shape — only the edges the visibility test needs. */
export type TabsScrollBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

/** Sub-pixel slack: fractional layout must not read as "clipped by 0.4px". */
const VISIBILITY_EPSILON = 1;

/**
 * True when `trigger` sits entirely inside the `scrollport` box. Pure geometry — physical viewport
 * coordinates, so it is direction- and orientation-agnostic (LTR, RTL, vertical rail alike).
 */
export function isTabFullyVisible(scrollport: TabsScrollBox, trigger: TabsScrollBox): boolean {
  const width = scrollport.right - scrollport.left;
  const height = scrollport.bottom - scrollport.top;
  if (width <= 0 && height <= 0) return true;

  return (
    trigger.left >= scrollport.left - VISIBILITY_EPSILON &&
    trigger.right <= scrollport.right + VISIBILITY_EPSILON &&
    trigger.top >= scrollport.top - VISIBILITY_EPSILON &&
    trigger.bottom <= scrollport.bottom + VISIBILITY_EPSILON
  );
}

/**
 * The trigger the strip must keep reachable: the focused trigger when the roving focus is inside
 * this list (manual activation can park focus off the selected tab), otherwise the active one.
 */
export function resolveTabScrollTarget(list: HTMLElement): HTMLElement | null {
  const focused = list.ownerDocument?.activeElement;
  if (
    focused instanceof HTMLElement &&
    focused !== list &&
    list.contains(focused) &&
    focused.getAttribute("role") === "tab"
  ) {
    return focused;
  }
  return list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
}

/** `true` when the user has asked for reduced motion (falsy/unsupported environments say no). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * Scrolls the list's keep-visible target back into the scrollport when — and only when — it is not
 * already fully inside it. Returns the element it scrolled, or `null` when nothing needed doing
 * (which is the common case, and what keeps this from fighting a deliberate user scroll).
 */
export function syncActiveTabIntoView(
  list: HTMLElement | null,
  behavior: ScrollBehavior = "auto",
): HTMLElement | null {
  if (!list) return null;

  const target = resolveTabScrollTarget(list);
  if (!target || typeof target.scrollIntoView !== "function") return null;
  if (isTabFullyVisible(list.getBoundingClientRect(), target.getBoundingClientRect())) return null;

  target.scrollIntoView({
    block: "nearest",
    inline: "nearest",
    behavior: prefersReducedMotion() ? "auto" : behavior,
  });
  return target;
}

/**
 * Resize corrections are instant; a selection change animates unless reduced motion is requested.
 * Both observers are optional: without them (SSR, ancient runtimes) the component degrades to the
 * pre-fix behaviour instead of throwing.
 */
export function useKeepActiveTabVisible(listRef: React.RefObject<HTMLElement | null>): void {
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    // Correct once on mount, before any observer fires, so a strip that mounts already scrolled
    // (route re-render at a new width) is right on the first paint.
    syncActiveTabIntoView(list, "auto");

    const cleanups: (() => void)[] = [];

    if (typeof ResizeObserver !== "undefined") {
      // Instant: animating a scroll while the viewport is still being dragged reads as jank.
      const resizeObserver = new ResizeObserver(() => {
        syncActiveTabIntoView(list, "auto");
      });
      resizeObserver.observe(list);
      cleanups.push(() => {
        resizeObserver.disconnect();
      });
    }

    if (typeof MutationObserver !== "undefined") {
      const mutationObserver = new MutationObserver(() => {
        syncActiveTabIntoView(list, "smooth");
      });
      mutationObserver.observe(list, {
        subtree: true,
        attributes: true,
        attributeFilter: ["data-state"],
      });
      cleanups.push(() => {
        mutationObserver.disconnect();
      });
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [listRef]);
}

/**
 * The values of the triggers that are NOT fully inside the strip's scrollport, in document order.
 *
 * Pure apart from the two rect reads — `values` is the `items` array's own order, and the triggers
 * are matched to it by INDEX rather than by DOM id: `TabsTrigger` hands its `value` to React Aria
 * as the collection KEY, and the rendered `id` attribute is RAC-generated, so the element carries
 * no readable handle back to the item it came from.
 *
 * This is the measurement behind `overflow="menu"`. It is separated from the hook below so it can
 * be exercised on plain numbers — jsdom lays nothing out, so the only honest unit assertions about
 * it are the ones that hand it real geometry.
 */
export function resolveHiddenTabValues(list: HTMLElement, values: readonly string[]): string[] {
  const scrollport = list.getBoundingClientRect();
  const triggers = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
  const hidden: string[] = [];
  triggers.forEach((trigger, index) => {
    const value = values[index];
    if (value === undefined) return;
    if (!isTabFullyVisible(scrollport, trigger.getBoundingClientRect())) hidden.push(value);
  });
  return hidden;
}

/**
 * The LOGICAL scroll offset of a strip: how far it has moved from its own start edge, growing
 * towards `end` on whichever axis the strip is on and in whichever direction it is written.
 *
 * `scrollLeft` cannot be read raw. Per CSSOM-View an RTL scroller reports `0` at its START edge
 * (the right one) and goes NEGATIVE towards the end, so "scrollLeft went up" means opposite things
 * in the two directions — exactly the bug `start`/`end` exist to prevent, and it would have been
 * invisible in an LTR test suite.
 */
export function readTabsScrollOffset(list: HTMLElement, vertical: boolean): number {
  if (vertical) return list.scrollTop;
  const rtl =
    list.ownerDocument?.defaultView?.getComputedStyle(list).direction === "rtl" ||
    list.closest("[dir]")?.getAttribute("dir") === "rtl";
  return rtl ? -list.scrollLeft : list.scrollLeft;
}

/**
 * Ant Design `onTabScroll`'s one piece of logic: which edge a movement of the scroll offset went
 * towards. `null` when the offset did not move, so a scroll event that reports the same position
 * (momentum settling, a programmatic re-pin that was already in place) reports nothing.
 */
export function resolveTabsScrollDirection(previous: number, next: number): "start" | "end" | null {
  if (next === previous) return null;
  return next > previous ? "end" : "start";
}

/**
 * Reports every real movement of the strip's own scrollport to `onScroll` — Ant Design
 * `onTabScroll`. The handler is held in a ref so a consumer's inline arrow function does not
 * re-arm the listener on every render (same contract as `useTabsOverflowValues` above).
 *
 * It reports a `scrollIntoView` re-pin too, and deliberately: antd's does the same, and "the strip
 * moved" is the fact a consumer is subscribing to — not "the user moved it".
 */
export function useTabsScrollReporter(
  listRef: React.RefObject<HTMLElement | null>,
  vertical: boolean,
  onScroll: ((info: { direction: "start" | "end" }) => void) | undefined,
): void {
  const onScrollRef = React.useRef(onScroll);
  React.useEffect(() => {
    onScrollRef.current = onScroll;
  });

  const armed = onScroll !== undefined;
  React.useEffect(() => {
    if (!armed) return undefined;
    const list = listRef.current;
    if (!list) return undefined;

    let last = readTabsScrollOffset(list, vertical);
    const report = () => {
      const next = readTabsScrollOffset(list, vertical);
      const direction = resolveTabsScrollDirection(last, next);
      last = next;
      if (direction) onScrollRef.current?.({ direction });
    };

    list.addEventListener("scroll", report, { passive: true });
    return () => {
      list.removeEventListener("scroll", report);
    };
  }, [armed, listRef, vertical]);
}

/**
 * Keeps `onChange` fed with the values currently out of the scrollport, recomputing on the two
 * things that can move them: the strip resizing (a viewport change, a font swap, a tab added or
 * removed) and the strip scrolling (the user swiping, or `useKeepActiveTabVisible` re-pinning a
 * trigger).
 *
 * `values` is joined into the effect key rather than passed as a dependency, so a consumer that
 * rebuilds its `items` array on every render does not re-arm the observers on every render.
 *
 * The first measurement ALWAYS reports, even when nothing is hidden. Suppressing it looks harmless
 * and is not: on a remount the local `last` resets while the caller's state does not, so a strip
 * that had overflowed and then stopped would keep a stale menu forever.
 */
export function useTabsOverflowValues(
  listRef: React.RefObject<HTMLElement | null>,
  values: readonly string[] | undefined,
  onChange: (hidden: string[]) => void,
): void {
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });

  const key = values === undefined ? null : values.join(" ");
  React.useEffect(() => {
    if (key === null) return undefined;
    const list = listRef.current;
    if (!list) return undefined;
    const all = key === "" ? [] : key.split(" ");

    let last: string | null = null;
    const measure = () => {
      const hidden = resolveHiddenTabValues(list, all);
      const next = hidden.join(" ");
      if (next === last) return;
      last = next;
      onChangeRef.current(hidden);
    };

    measure();
    list.addEventListener("scroll", measure, { passive: true });
    const cleanups: (() => void)[] = [
      () => {
        list.removeEventListener("scroll", measure);
      },
    ];
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(list);
      cleanups.push(() => {
        resizeObserver.disconnect();
      });
    }
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [key, listRef]);
}
