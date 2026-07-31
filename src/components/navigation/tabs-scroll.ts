import * as React from "react";

/**
 * Keep-the-active-tab-visible logic for the horizontal `TabsList` scroll strip (gh#204).
 *
 * `TabsList` scrolls its own overflow (gh#175) so long localized labels never clip. That fixed
 * clipping but not the SCROLL POSITION: after a responsive resize / route re-render the strip kept
 * (or shifted) its internal `scrollLeft`, so the ACTIVE trigger — typically the FIRST one — could
 * end up completely outside the scrollport while still carrying `data-state="active"` /
 * `aria-selected="true"`. A tab you cannot see is a tab you cannot use.
 *
 * The fix observes the strip (size changes) and its triggers (`data-state` changes) and scrolls the
 * element that must stay reachable back into view. Deliberate constraints:
 *
 *  - **Never fights the user.** The scroll only runs when the target is NOT already fully inside the
 *    scrollport, so an intentional manual/touch scroll that leaves the active tab visible is left
 *    alone, and a click (target is under the pointer) or arrow-key move (the browser already
 *    scrolled focus into view) is a no-op.
 *  - **Focus wins over selection.** With `activationMode="manual"` the roving focus can sit on a
 *    trigger that is not the selected one; yanking the strip to the selected tab would strand the
 *    keyboard user. The focused trigger inside the list is therefore the preferred target.
 *  - **Reduced motion.** `prefers-reduced-motion: reduce` downgrades every correction to an instant
 *    jump; resize corrections are instant regardless (a smooth animation mid-resize reads as jank).
 *  - **RTL / vertical safe.** All geometry is physical viewport rects and the scroll uses
 *    `scrollIntoView({ block: "nearest", inline: "nearest" })`, which resolves direction natively —
 *    so a first trigger in `dir="rtl"` (visually on the right) and a vertical rail both work
 *    without direction branches. `nearest` also means no ancestor/page scroll when the strip is
 *    already where it should be.
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
 *
 * A zero-area scrollport (unmounted, `display:none`, or an environment without layout such as
 * jsdom) reports `true`: there is no measurable overflow to correct, and scrolling a hidden strip
 * would be meaningless.
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
 * Wires the two signals that can strand the active tab off-screen:
 *
 *  - a `ResizeObserver` on the strip — a responsive width change (1440 → 1024 → 390) keeps/shifts
 *    the old `scrollLeft`; the observer's initial delivery also covers first mount at a new width;
 *  - a `MutationObserver` on descendant `data-state` — the selected tab changing from outside the
 *    strip (router/URL state, a controlled parent) must bring the newly-selected trigger into view.
 *
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
