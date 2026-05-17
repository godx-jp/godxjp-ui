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
import { I18nProvider as RACI18nProvider } from "react-aria-components";
import { InternalTooltipProvider } from "../components/data-display/Tooltip";
import {
  getGodxConfig,
  setGodxConfig as setHolder,
  subscribeGodxConfig,
  type GodxConfig,
} from "./holder";
import {
  readStored,
  writeStored,
  type CookieOptions,
  type GodxConfigStorage,
} from "./storage";

const LOCALE_KEY = "godx-locale";
const TIMEZONE_KEY = "godx-timezone";
const CURRENCY_KEY = "godx-currency";

export interface GodxConfigContextValue extends GodxConfig {
  setLocale: (locale: string) => void;
  setTimezone: (timezone: string) => void;
  setCurrency: (currency: string) => void;
  setGodxConfig: (partial: Partial<GodxConfig>) => void;
  reset: () => void;
  /** Build the canonical request headers (Accept-Language + X-Timezone). */
  headers: () => Record<string, string>;
}

const Ctx = createContext<GodxConfigContextValue | null>(null);

export interface GodxConfigProviderProps {
  children: ReactNode;
  /** Where to persist — defaults to localStorage. */
  storage?: GodxConfigStorage;
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
   * Default currency code (ISO 4217) for `formatCurrency()` calls
   * that omit a `currency` option. Optional.
   */
  defaultCurrency?: string;
  /**
   * Open delay applied to every `<Tooltip>` in the tree (ms). The
   * provider mounts a single Radix Tooltip Provider internally so
   * the entire app shares this timing — and so the consumer never
   * has to import a separate `TooltipProvider`. Per-tooltip overrides
   * still flow through the `delayDuration` prop on `<Tooltip>`.
   * Default 200.
   */
  tooltipDelay?: number;
  /**
   * Skip-delay duration applied to every `<Tooltip>` in the tree
   * (ms). When the cursor moves between adjacent tooltipped elements
   * within this window the next tooltip opens immediately. Default
   * follows Radix (300ms).
   */
  tooltipSkipDelay?: number;
  /**
   * Called whenever config changes. Useful for syncing the
   * `<html lang>` attribute or pushing to analytics.
   */
  onChange?: (config: GodxConfig) => void;
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

/**
 * Root provider for `@godxjp/ui` consumer apps. Carries locale,
 * timezone, and currency defaults; auto-wires React Aria's
 * `<I18nProvider>` so every date / time / number primitive picks up
 * the locale. Persists to localStorage / cookie / both.
 *
 * Mount once at the top of every service frontend's React tree.
 */
export function GodxConfigProvider({
  children,
  storage = "localStorage",
  cookieOptions,
  defaultLocale = "ja",
  defaultTimezone = "Asia/Tokyo",
  defaultCurrency,
  tooltipDelay = 200,
  tooltipSkipDelay,
  onChange,
}: GodxConfigProviderProps) {
  // Resolve initial config: stored → detected → fallback.
  const initial = useRef<GodxConfig>({
    locale:
      readStored(storage, LOCALE_KEY) ?? detectLocale(defaultLocale),
    timezone:
      readStored(storage, TIMEZONE_KEY) ?? detectTimezone(defaultTimezone),
    currency: readStored(storage, CURRENCY_KEY) ?? defaultCurrency,
  });

  const [config, setConfigState] = useState<GodxConfig>(initial.current);

  // Sync initial values into the module holder so non-React readers
  // (axios interceptor, etc.) pick them up immediately.
  useEffect(() => {
    setHolder(initial.current);
  }, []);

  // Bridge: holder → React state. When something else mutates the
  // holder (e.g. another tab via a future BroadcastChannel listener)
  // we re-render.
  useEffect(() => {
    return subscribeGodxConfig((next) => {
      setConfigState(next);
    });
  }, []);

  // Mirror to <html lang> so screen readers + CSS :lang() selectors
  // pick up locale changes.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = config.locale;
    }
  }, [config.locale]);

  // Persist + notify subscribers via the holder.
  const writeAndBroadcast = useCallback(
    (partial: Partial<GodxConfig>) => {
      if (partial.locale !== undefined) {
        writeStored(storage, LOCALE_KEY, partial.locale, cookieOptions);
      }
      if (partial.timezone !== undefined) {
        writeStored(storage, TIMEZONE_KEY, partial.timezone, cookieOptions);
      }
      if (partial.currency !== undefined) {
        writeStored(storage, CURRENCY_KEY, partial.currency, cookieOptions);
      }
      setHolder(partial); // holder → subscribers → setConfigState
    },
    [storage, cookieOptions],
  );

  // onChange callback — fires AFTER state settles.
  useEffect(() => {
    onChange?.(config);
  }, [config, onChange]);

  const setLocale = useCallback(
    (locale: string) => writeAndBroadcast({ locale }),
    [writeAndBroadcast],
  );
  const setTimezone = useCallback(
    (timezone: string) => writeAndBroadcast({ timezone }),
    [writeAndBroadcast],
  );
  const setCurrency = useCallback(
    (currency: string) => writeAndBroadcast({ currency }),
    [writeAndBroadcast],
  );
  const setAll = useCallback(
    (partial: Partial<GodxConfig>) => writeAndBroadcast(partial),
    [writeAndBroadcast],
  );
  const reset = useCallback(() => {
    writeStored(storage, LOCALE_KEY, null, cookieOptions);
    writeStored(storage, TIMEZONE_KEY, null, cookieOptions);
    writeStored(storage, CURRENCY_KEY, null, cookieOptions);
    const next: GodxConfig = {
      locale: detectLocale(defaultLocale),
      timezone: detectTimezone(defaultTimezone),
      currency: defaultCurrency,
    };
    setHolder(next);
  }, [storage, cookieOptions, defaultLocale, defaultTimezone, defaultCurrency]);

  const headers = useCallback((): Record<string, string> => {
    const current = getGodxConfig();
    return {
      "Accept-Language": current.locale,
      "X-Timezone": current.timezone,
    };
  }, []);

  const value = useMemo<GodxConfigContextValue>(
    () => ({
      ...config,
      setLocale,
      setTimezone,
      setCurrency,
      setGodxConfig: setAll,
      reset,
      headers,
    }),
    [config, setLocale, setTimezone, setCurrency, setAll, reset, headers],
  );

  return (
    <Ctx.Provider value={value}>
      <RACI18nProvider locale={config.locale}>
        <InternalTooltipProvider
          delayDuration={tooltipDelay}
          skipDelayDuration={tooltipSkipDelay}
        >
          {children}
        </InternalTooltipProvider>
      </RACI18nProvider>
    </Ctx.Provider>
  );
}

export function useGodxConfig(): GodxConfigContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useGodxConfig must be used within <GodxConfigProvider>",
    );
  }
  return ctx;
}
