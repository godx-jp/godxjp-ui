// Module-level GodxConfig holder.
//
// Why a module-level holder, not just React context: axios instances
// are created at module-load time (before React mounts), and axios
// interceptors need to read config at REQUEST time — which is after
// the React tree is up. A mutable holder solves both: the React
// provider writes into it on mount + on every state change; the
// interceptor reads via `getGodxConfig()` per request.
//
// The holder is the single source of truth at runtime. The React
// state mirrors it for re-renders; outside of React, anyone (axios,
// fetch wrapper, error reporter, telemetry, etc.) reads through the
// `getGodxConfig()` getter.

export interface GodxConfig {
  /** BCP 47 language tag, e.g. "ja", "en-US". */
  locale: string;
  /** IANA time zone name, e.g. "Asia/Tokyo". */
  timezone: string;
  /**
   * Currency default for `formatCurrency()` calls that omit a code.
   * ISO 4217 — e.g. "JPY", "USD", "VND", "PHP". Optional; helpers
   * require an explicit currency when this is undefined.
   */
  currency?: string;
}

const DEFAULT: GodxConfig = {
  locale: "ja",
  timezone: "Asia/Tokyo",
};

let CURRENT: GodxConfig = { ...DEFAULT };
const subscribers = new Set<(c: GodxConfig) => void>();

export function getGodxConfig(): GodxConfig {
  return CURRENT;
}

export function setGodxConfig(next: Partial<GodxConfig>): void {
  const merged: GodxConfig = { ...CURRENT, ...next };
  if (
    merged.locale === CURRENT.locale &&
    merged.timezone === CURRENT.timezone &&
    merged.currency === CURRENT.currency
  ) {
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

export function resetGodxConfig(defaults: GodxConfig = DEFAULT): void {
  setGodxConfig(defaults);
}

export function subscribeGodxConfig(
  fn: (c: GodxConfig) => void,
): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}
