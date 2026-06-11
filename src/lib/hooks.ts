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
 * Controlled-ness latch for `value`/`defaultValue`/`onValueChange` controls
 * whose empty state is `undefined` (pickers carrying `Date`/`DateRange`).
 *
 * A control counts as controlled once a DEFINED `value` has EVER been passed:
 * - mounted with a defined `value` → controlled, and a later `value={undefined}`
 *   stays controlled-EMPTY (not mistaken for uncontrolled);
 * - mounted with `value={undefined}` (an empty form that later restores a
 *   saved value) → uncontrolled until the first defined value arrives, then
 *   PROMOTES to controlled for good.
 *
 * Fixing controlled-ness at mount (the previous behaviour) silently ignored
 * every later controlled value in the second case.
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
