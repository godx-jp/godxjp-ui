// Shared hooks for admin components.
import { useEffect, useState } from "react";

/**
 * Returns a debounced view of `value`, updated only after `delay` ms of no
 * change. Use for search inputs to avoid querying on every keystroke.
 *
 * setState runs only inside setTimeout (async) — compliant with
 * react-hooks/set-state-in-effect.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => {
      clearTimeout(t);
    };
  }, [value, delay]);
  return debounced;
}

/**
 * Returns true while `ms` haven't elapsed since `signal` last flipped truthy.
 * setState is scheduled asynchronously (setTimeout 0 / ms) — Rules of React safe.
 */
export function useTimeoutFlag(signal: unknown, ms = 2_000): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!signal) {
      const id = window.setTimeout(() => {
        setActive(false);
      }, 0);
      return () => {
        clearTimeout(id);
      };
    }

    const showId = window.setTimeout(() => {
      setActive(true);
    }, 0);
    const hideId = window.setTimeout(() => {
      setActive(false);
    }, ms);
    return () => {
      clearTimeout(showId);
      clearTimeout(hideId);
    };
  }, [signal, ms]);

  return Boolean(signal) && active;
}

/**
 * Controlled-ness latch for `value`/`defaultValue`/`onValueChange` controls whose empty state is
 * `undefined` (pickers carrying `Date`/`DateRange`). A control counts as controlled once a DEFINED
 * `value` has EVER been passed: - mounted with a defined `value` → controlled, and a later
 * `value={undefined}` stays controlled-EMPTY (not mistaken for uncontrolled); - mounted with
 * `value={undefined}` (an empty form that later restores a saved value) → uncontrolled until the
 * first defined value arrives, then PROMOTES to controlled for good.
 */
export function useControlledLatch(valueIsDefined: boolean): boolean {
  const [latched, setLatched] = useState(valueIsDefined);
  // Guarded render-time set — React's documented "derived state" form.
  if (valueIsDefined && !latched) setLatched(true);
  return valueIsDefined || latched;
}

export function useMediaQuery(query: string): boolean {
  const isBrowser = typeof window !== "undefined";

  const getMatch = () => (isBrowser ? window.matchMedia(query).matches : false);

  const [matches, setMatches] = useState<boolean>(getMatch());

  useEffect(() => {
    if (!isBrowser) return undefined;

    const mediaQuery = window.matchMedia(query);

    const updateMatch = () => {
      setMatches(mediaQuery.matches);
    };

    updateMatch();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatch);
      return () => {
        mediaQuery.removeEventListener("change", updateMatch);
      };
    }

    mediaQuery.addListener(updateMatch);
    return () => {
      mediaQuery.removeListener(updateMatch);
    };
  }, [isBrowser, query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/** A scroll container is already keyboard-reachable when something inside it can take focus. */
const SCROLLABLE_REGION_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * WCAG 2.1.1 — a region that scrolls must be operable by keyboard. Tabbing to a focusable child
 * scrolls the container, so a region whose content IS focusable needs nothing; one whose content is
 * inert (plain text) strands its overflow for anyone not using a pointer and must therefore take
 * focus itself via `tabindex="0"`. Which case applies depends on the RENDERED size and content —
 * the same pagination strip is fine at 1440px and unreachable at 375px, and a panel full of text
 * only overflows once it is resized — so it is measured at runtime and kept in sync as the element
 * resizes or its content changes.
 *
 * The attribute is written imperatively rather than rendered: `react-resizable-panels` applies our
 * className to a nested div it owns, which no prop can reach.
 *
 * @param element the scroll container itself (state, not a ref, so the effect re-runs when it mounts)
 */
export function useScrollableRegionTabIndex(element: HTMLElement | null): void {
  useEffect(() => {
    if (!element) return;

    const sync = () => {
      const scrolls =
        element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
      const hasFocusableContent =
        element.querySelector(SCROLLABLE_REGION_FOCUSABLE_SELECTOR) !== null;
      // Guard both writes: setting an attribute to the value it already holds still emits a
      // MutationRecord, which would call this back forever.
      if (scrolls && !hasFocusableContent) {
        if (element.getAttribute("tabindex") !== "0") element.setAttribute("tabindex", "0");
      } else if (element.getAttribute("tabindex") === "0") {
        element.removeAttribute("tabindex");
      }
    };

    sync();

    // Resize covers the container AND its children (content growing past the box); mutations cover
    // content swapped in, or a child losing `disabled` and becoming a focus target.
    const observers: Array<{ disconnect: () => void }> = [];
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(sync);
      resizeObserver.observe(element);
      for (const child of Array.from(element.children)) resizeObserver.observe(child);
      observers.push(resizeObserver);
    }
    if (typeof MutationObserver !== "undefined") {
      const mutationObserver = new MutationObserver(sync);
      mutationObserver.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["disabled", "href", "tabindex"],
      });
      observers.push(mutationObserver);
    }
    return () => {
      for (const observer of observers) observer.disconnect();
    };
  }, [element]);
}
