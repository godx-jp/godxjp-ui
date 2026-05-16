import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getPreferences,
  setPreferences as setHolder,
  subscribePreferences,
  type Preferences,
} from "./holder";
import {
  readStored,
  writeStored,
  type CookieOptions,
  type PreferenceStorage,
} from "./storage";

const LOCALE_KEY = "godx-locale";
const TIMEZONE_KEY = "godx-timezone";

export interface PreferencesContextValue extends Preferences {
  setLocale: (locale: string) => void;
  setTimezone: (timezone: string) => void;
  setPreferences: (partial: Partial<Preferences>) => void;
  reset: () => void;
  /** Build the canonical request headers (Accept-Language + X-Timezone). */
  headers: () => Record<string, string>;
}

const Ctx = createContext<PreferencesContextValue | null>(null);

export interface PreferencesProviderProps {
  children: ReactNode;
  /** Where to persist — defaults to localStorage. */
  storage?: PreferenceStorage;
  /** Cookie options when storage is "cookie" or "both". */
  cookieOptions?: CookieOptions;
  /**
   * Fallback locale when neither storage nor `navigator.language`
   * yields a value. Defaults to "ja".
   */
  defaultLocale?: string;
  /**
   * Fallback timezone when neither storage nor
   * `Intl.DateTimeFormat().resolvedOptions().timeZone` yields a value.
   * Defaults to "Asia/Tokyo".
   */
  defaultTimezone?: string;
  /**
   * Called whenever preferences change. Useful for syncing the
   * `<html lang>` attribute or pushing to analytics.
   */
  onChange?: (prefs: Preferences) => void;
}

function detectLocale(fallback: string): string {
  if (typeof navigator === "undefined") return fallback;
  const lang = navigator.language;
  return lang || fallback;
}

function detectTimezone(fallback: string): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || fallback;
  } catch {
    return fallback;
  }
}

export function PreferencesProvider({
  children,
  storage = "localStorage",
  cookieOptions,
  defaultLocale = "ja",
  defaultTimezone = "Asia/Tokyo",
  onChange,
}: PreferencesProviderProps) {
  // Resolve initial preferences: stored → detected → fallback.
  const initial = useRef<Preferences>({
    locale:
      readStored(storage, LOCALE_KEY) ?? detectLocale(defaultLocale),
    timezone:
      readStored(storage, TIMEZONE_KEY) ?? detectTimezone(defaultTimezone),
  });

  const [prefs, setPrefsState] = useState<Preferences>(initial.current);

  // Sync initial values into the module holder so non-React readers
  // (axios interceptor, etc.) pick them up immediately.
  useEffect(() => {
    setHolder(initial.current);
  }, []);

  // Bridge: holder → React state. When something else mutates the
  // holder (e.g. another tab via a future BroadcastChannel listener)
  // we re-render.
  useEffect(() => {
    return subscribePreferences((next) => {
      setPrefsState(next);
    });
  }, []);

  // Mirror to <html lang> so screen readers + CSS :lang() selectors
  // pick up locale changes.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = prefs.locale;
    }
  }, [prefs.locale]);

  // Persist + notify subscribers via the holder.
  const writeAndBroadcast = useCallback(
    (partial: Partial<Preferences>) => {
      if (partial.locale !== undefined) {
        writeStored(storage, LOCALE_KEY, partial.locale, cookieOptions);
      }
      if (partial.timezone !== undefined) {
        writeStored(storage, TIMEZONE_KEY, partial.timezone, cookieOptions);
      }
      setHolder(partial); // holder → subscribers → setPrefsState
    },
    [storage, cookieOptions],
  );

  // onChange callback — fires AFTER state settles.
  useEffect(() => {
    onChange?.(prefs);
  }, [prefs, onChange]);

  const setLocale = useCallback(
    (locale: string) => writeAndBroadcast({ locale }),
    [writeAndBroadcast],
  );
  const setTimezone = useCallback(
    (timezone: string) => writeAndBroadcast({ timezone }),
    [writeAndBroadcast],
  );
  const setAll = useCallback(
    (partial: Partial<Preferences>) => writeAndBroadcast(partial),
    [writeAndBroadcast],
  );
  const reset = useCallback(() => {
    writeStored(storage, LOCALE_KEY, null, cookieOptions);
    writeStored(storage, TIMEZONE_KEY, null, cookieOptions);
    const next: Preferences = {
      locale: detectLocale(defaultLocale),
      timezone: detectTimezone(defaultTimezone),
    };
    setHolder(next);
  }, [storage, cookieOptions, defaultLocale, defaultTimezone]);

  const headers = useCallback((): Record<string, string> => {
    const current = getPreferences();
    return {
      "Accept-Language": current.locale,
      "X-Timezone": current.timezone,
    };
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ...prefs,
      setLocale,
      setTimezone,
      setPreferences: setAll,
      reset,
      headers,
    }),
    [prefs, setLocale, setTimezone, setAll, reset, headers],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "usePreferences must be used within <PreferencesProvider>",
    );
  }
  return ctx;
}
