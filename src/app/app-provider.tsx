import * as React from "react";
import { resolveDefaultDateFormat } from "./date-format-labels";
import { getDateFnsLocale, getDayPickerLocale } from "./locales";
import { syncAppRequestHeaders } from "./request-headers";
import { syncI18nLocale } from "../i18n/translate";

/** BCP-47 primary subtags that render right-to-left (forward-compat — current AppLocales are LTR). */
const RTL_LANGUAGE_SUBTAGS = new Set(["ar", "he", "fa", "ur", "ps", "sd", "yi", "dv", "ckb"]);
function localeDirection(locale: string): "rtl" | "ltr" {
  return RTL_LANGUAGE_SUBTAGS.has(locale.split("-")[0]?.toLowerCase() ?? "") ? "rtl" : "ltr";
}
import {
  disableLiveRelativeFormatting,
  enableLiveRelativeFormatting,
  syncDatetimeContext,
} from "../lib/datetime";
import { DEFAULT_STORAGE_KEY, readStoredPreferences, writeStoredPreferences } from "./storage";
import {
  applyThemeAxes,
  type AppBrand,
  type AppDensity,
  type AppFontSize,
  type AppTheme,
} from "./theme-axes";
import { resolveDefaultTimeFormat } from "./time-format-labels";
import { resolveDefaultTimezone } from "./timezones";
import {
  APP_REQUEST_HEADER_DATE_FORMAT,
  APP_REQUEST_HEADER_LOCALE,
  APP_REQUEST_HEADER_TIME_FORMAT,
  APP_REQUEST_HEADER_TIMEZONE,
  type AppDateFormat,
  type AppLocale,
  type AppRequestHeaders,
  type AppTimeFormat,
  type AppTimezone,
} from "./types";
import type { AppContextValue, AppProviderProp } from "../props/components/app.prop";

export type { AppProviderProp, AppContextValue } from "../props/components/app.prop";

const AppContext = React.createContext<AppContextValue | null>(null);

function resolveInitialTimeFormat(
  stored: AppTimeFormat | undefined,
  defaultTimeFormat: AppTimeFormat | "locale",
  locale: AppLocale,
): AppTimeFormat {
  if (stored) return stored;
  if (defaultTimeFormat === "locale") return resolveDefaultTimeFormat(locale);
  return defaultTimeFormat;
}

function resolveInitialDateFormat(
  stored: AppDateFormat | undefined,
  defaultDateFormat: AppDateFormat | "locale",
  locale: AppLocale,
): AppDateFormat {
  if (stored) return stored;
  if (defaultDateFormat === "locale") return resolveDefaultDateFormat(locale);
  return defaultDateFormat;
}

function buildRequestHeaders(
  locale: AppLocale,
  timezone: AppTimezone,
  timeFormat: AppTimeFormat,
  dateFormat: AppDateFormat,
): AppRequestHeaders {
  return {
    [APP_REQUEST_HEADER_LOCALE]: locale,
    [APP_REQUEST_HEADER_TIMEZONE]: timezone,
    [APP_REQUEST_HEADER_TIME_FORMAT]: timeFormat,
    [APP_REQUEST_HEADER_DATE_FORMAT]: dateFormat,
  };
}

function resolveHydrationSafeTimezone(
  defaultTimezone: "browser" | "system" | (string & {}),
  systemTimezone?: string,
): string {
  if (defaultTimezone === "browser") return systemTimezone ?? "UTC";
  return resolveDefaultTimezone(defaultTimezone, systemTimezone);
}

export function AppProvider({
  children,
  defaultLocale = "vi",
  fallbackLocale = "en",
  defaultTimezone = "browser",
  systemTimezone,
  defaultTimeFormat = "locale",
  defaultDateFormat = "locale",
  timezoneOptions,
  storageKey = DEFAULT_STORAGE_KEY,
  persist = true,
  theme: initialTheme = "light",
  brand: initialBrand = null,
  density: initialDensity = "default",
  fontSize: initialFontSize = "default",
  scaling: initialScaling = null,
  onLocaleChange,
  onTimezoneChange,
  onTimeFormatChange,
  onDateFormatChange,
  onThemeChange,
  onBrandChange,
  onDensityChange,
  onFontSizeChange,
  onScalingChange,
}: AppProviderProp) {
  const initialLocale = defaultLocale;

  const [locale, setLocaleState] = React.useState<AppLocale>(initialLocale);
  const [timezone, setTimezoneState] = React.useState<AppTimezone>(
    resolveHydrationSafeTimezone(defaultTimezone, systemTimezone),
  );
  const [timeFormat, setTimeFormatState] = React.useState<AppTimeFormat>(() =>
    resolveInitialTimeFormat(undefined, defaultTimeFormat, initialLocale),
  );
  const [dateFormat, setDateFormatState] = React.useState<AppDateFormat>(() =>
    resolveInitialDateFormat(undefined, defaultDateFormat, initialLocale),
  );
  const [theme, setThemeState] = React.useState<AppTheme>(initialTheme);
  const [brand, setBrandState] = React.useState<AppBrand | null>(initialBrand);
  const [density, setDensityState] = React.useState<AppDensity>(initialDensity);
  const [fontSize, setFontSizeState] = React.useState<AppFontSize>(initialFontSize);
  const [scaling, setScalingState] = React.useState<number | null>(initialScaling);

  const hasMountedRef = React.useRef(false);
  const prefsRef = React.useRef({
    locale,
    timezone,
    timeFormat,
    dateFormat,
    theme,
    brand,
    density,
    fontSize,
    scaling,
  });

  React.useEffect(() => {
    const stored = persist ? readStoredPreferences(storageKey) : {};
    const nextLocale = stored.locale ?? defaultLocale;
    const nextTimezone = stored.timezone ?? resolveDefaultTimezone(defaultTimezone, systemTimezone);
    const nextTimeFormat = resolveInitialTimeFormat(
      stored.timeFormat,
      defaultTimeFormat,
      nextLocale,
    );
    const nextDateFormat = resolveInitialDateFormat(
      stored.dateFormat,
      defaultDateFormat,
      nextLocale,
    );
    const nextTheme = stored.theme ?? initialTheme;
    const nextBrand = stored.brand ?? initialBrand;
    const nextDensity = stored.density ?? initialDensity;
    const nextFontSize = stored.fontSize ?? initialFontSize;
    const nextScaling = stored.scaling ?? initialScaling;

    prefsRef.current = {
      locale: nextLocale,
      timezone: nextTimezone,
      timeFormat: nextTimeFormat,
      dateFormat: nextDateFormat,
      theme: nextTheme,
      brand: nextBrand,
      density: nextDensity,
      fontSize: nextFontSize,
      scaling: nextScaling,
    };
    setLocaleState(nextLocale);
    setTimezoneState(nextTimezone);
    setTimeFormatState(nextTimeFormat);
    setDateFormatState(nextDateFormat);
    setThemeState(nextTheme);
    setBrandState(nextBrand);
    setDensityState(nextDensity);
    setFontSizeState(nextFontSize);
    setScalingState(nextScaling);
  }, [
    defaultDateFormat,
    defaultLocale,
    defaultTimeFormat,
    defaultTimezone,
    initialTheme,
    initialBrand,
    initialDensity,
    initialFontSize,
    initialScaling,
    persist,
    storageKey,
    systemTimezone,
  ]);

  React.useEffect(() => {
    prefsRef.current = {
      locale,
      timezone,
      timeFormat,
      dateFormat,
      theme,
      brand,
      density,
      fontSize,
      scaling,
    };
  }, [locale, timezone, timeFormat, dateFormat, theme, brand, density, fontSize, scaling]);

  // Reflect the axes on <html data-*> + inline --scaling — CSS in tokens/axes.css,
  // density.css and foundation.css bind them.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    applyThemeAxes(document.documentElement, { theme, brand, density, fontSize, scaling });
  }, [theme, brand, density, fontSize, scaling]);

  const setLocale = React.useCallback(
    (next: AppLocale) => {
      prefsRef.current = { ...prefsRef.current, locale: next };
      setLocaleState(next);
      onLocaleChange?.(next);
      if (persist) writeStoredPreferences(storageKey, prefsRef.current);
    },
    [onLocaleChange, persist, storageKey],
  );

  const setTimezone = React.useCallback(
    (next: AppTimezone) => {
      prefsRef.current = { ...prefsRef.current, timezone: next };
      setTimezoneState(next);
      onTimezoneChange?.(next);
      if (persist) writeStoredPreferences(storageKey, prefsRef.current);
    },
    [onTimezoneChange, persist, storageKey],
  );

  const setTimeFormat = React.useCallback(
    (next: AppTimeFormat) => {
      prefsRef.current = { ...prefsRef.current, timeFormat: next };
      setTimeFormatState(next);
      onTimeFormatChange?.(next);
      if (persist) writeStoredPreferences(storageKey, prefsRef.current);
    },
    [onTimeFormatChange, persist, storageKey],
  );

  const setDateFormat = React.useCallback(
    (next: AppDateFormat) => {
      prefsRef.current = { ...prefsRef.current, dateFormat: next };
      setDateFormatState(next);
      onDateFormatChange?.(next);
      if (persist) writeStoredPreferences(storageKey, prefsRef.current);
    },
    [onDateFormatChange, persist, storageKey],
  );

  const setTheme = React.useCallback(
    (next: AppTheme) => {
      prefsRef.current = { ...prefsRef.current, theme: next };
      setThemeState(next);
      onThemeChange?.(next);
      if (persist) writeStoredPreferences(storageKey, prefsRef.current);
    },
    [onThemeChange, persist, storageKey],
  );

  const setBrand = React.useCallback(
    (next: AppBrand | null) => {
      prefsRef.current = { ...prefsRef.current, brand: next };
      setBrandState(next);
      onBrandChange?.(next);
      if (persist) writeStoredPreferences(storageKey, prefsRef.current);
    },
    [onBrandChange, persist, storageKey],
  );

  const setDensity = React.useCallback(
    (next: AppDensity) => {
      prefsRef.current = { ...prefsRef.current, density: next };
      setDensityState(next);
      onDensityChange?.(next);
      if (persist) writeStoredPreferences(storageKey, prefsRef.current);
    },
    [onDensityChange, persist, storageKey],
  );

  const setFontSize = React.useCallback(
    (next: AppFontSize) => {
      prefsRef.current = { ...prefsRef.current, fontSize: next };
      setFontSizeState(next);
      onFontSizeChange?.(next);
      if (persist) writeStoredPreferences(storageKey, prefsRef.current);
    },
    [onFontSizeChange, persist, storageKey],
  );

  const setScaling = React.useCallback(
    (next: number | null) => {
      prefsRef.current = { ...prefsRef.current, scaling: next };
      setScalingState(next);
      onScalingChange?.(next);
      if (persist) writeStoredPreferences(storageKey, prefsRef.current);
    },
    [onScalingChange, persist, storageKey],
  );

  const requestHeaders = React.useMemo(
    () => buildRequestHeaders(locale, timezone, timeFormat, dateFormat),
    [locale, timezone, timeFormat, dateFormat],
  );

  const dateFnsLocale = getDateFnsLocale(locale);

  syncI18nLocale(locale, fallbackLocale);
  syncDatetimeContext({
    locale,
    timezone,
    timeFormat,
    dateFormat,
    dateFnsLocale,
  });
  if (!hasMountedRef.current) {
    disableLiveRelativeFormatting();
  }

  React.useEffect(() => {
    syncAppRequestHeaders(requestHeaders);
  }, [requestHeaders]);

  // Reflect the locale on <html>: `dir` flips logical CSS (ms/me/ps/pe, start/end) under RTL,
  // and `lang` drives `:lang()` rules — including the Vietnamese → Montserrat font swap in
  // styles/index.css (every non-`vi` locale keeps the default Noto Sans JP).
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = localeDirection(locale);
      document.documentElement.lang = locale;
    }
  }, [locale]);

  React.useEffect(() => {
    hasMountedRef.current = true;
    enableLiveRelativeFormatting();
  }, []);

  const value = React.useMemo<AppContextValue>(
    () => ({
      locale,
      fallbackLocale,
      timezone,
      timeFormat,
      dateFormat,
      dateFnsLocale,
      dayPickerLocale: getDayPickerLocale(locale),
      requestHeaders,
      timezoneOptions,
      theme,
      brand,
      density,
      fontSize,
      scaling,
      setLocale,
      setTimezone,
      setTimeFormat,
      setDateFormat,
      setTheme,
      setBrand,
      setDensity,
      setFontSize,
      setScaling,
    }),
    [
      locale,
      fallbackLocale,
      timezone,
      timeFormat,
      dateFormat,
      dateFnsLocale,
      requestHeaders,
      timezoneOptions,
      theme,
      brand,
      density,
      fontSize,
      scaling,
      setLocale,
      setTimezone,
      setTimeFormat,
      setDateFormat,
      setTheme,
      setBrand,
      setDensity,
      setFontSize,
      setScaling,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within <AppProvider>");
  }
  return ctx;
}

/** Returns null outside AppProvider — used by pickers for optional context. */
export function useOptionalAppContext(): AppContextValue | null {
  return React.useContext(AppContext);
}

/** Shorthand for `{ locale, setLocale }`. */
export function useAppLocale() {
  const { locale, fallbackLocale, setLocale, dateFnsLocale, dayPickerLocale } = useAppContext();
  return { locale, fallbackLocale, setLocale, dateFnsLocale, dayPickerLocale };
}

/** Shorthand for `{ timezone, setTimezone }`. */
export function useAppTimezone() {
  const { timezone, setTimezone } = useAppContext();
  return { timezone, setTimezone };
}

/** Shorthand for `{ timeFormat, setTimeFormat }`. */
export function useAppTimeFormat() {
  const { timeFormat, setTimeFormat } = useAppContext();
  return { timeFormat, setTimeFormat };
}

/** Shorthand for `{ dateFormat, setDateFormat }`. */
export function useAppDateFormat() {
  const { dateFormat, setDateFormat } = useAppContext();
  return { dateFormat, setDateFormat };
}
