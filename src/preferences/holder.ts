// Module-level preference holder.
//
// Why a module-level holder, not just React context: axios instances
// are created at module-load time (before React mounts), and axios
// interceptors need to read preferences at REQUEST time — which is
// after the React tree is up. A mutable holder solves both: the React
// provider writes into it on mount + on every state change; the
// interceptor reads via `getPreferences()` per request.
//
// The holder is the single source of truth at runtime. The React
// state mirrors it for re-renders; outside of React, anyone (axios,
// fetch wrapper, error reporter, telemetry, etc.) reads through the
// `getPreferences()` getter.

export interface Preferences {
  /** BCP 47 language tag, e.g. "ja", "en-US". */
  locale: string;
  /** IANA time zone name, e.g. "Asia/Tokyo". */
  timezone: string;
}

const DEFAULT: Preferences = {
  locale: "ja",
  timezone: "Asia/Tokyo",
};

let CURRENT: Preferences = { ...DEFAULT };
const subscribers = new Set<(p: Preferences) => void>();

export function getPreferences(): Preferences {
  return CURRENT;
}

export function setPreferences(next: Partial<Preferences>): void {
  const merged: Preferences = { ...CURRENT, ...next };
  if (merged.locale === CURRENT.locale && merged.timezone === CURRENT.timezone) {
    return;
  }
  CURRENT = merged;
  for (const fn of subscribers) {
    try {
      fn(CURRENT);
    } catch {
      /* subscriber threw — swallow so other subscribers run */
    }
  }
}

export function resetPreferences(defaults: Preferences = DEFAULT): void {
  setPreferences(defaults);
}

export function subscribePreferences(
  fn: (p: Preferences) => void,
): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}
