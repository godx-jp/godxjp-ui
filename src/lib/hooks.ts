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
