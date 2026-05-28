import * as React from "react";
import { resolveDefaultDateFormat } from "./date-format-labels";
import { getDateFnsLocale, getDayPickerLocale } from "./locales";
import { syncAppRequestHeaders } from "./request-headers";
import { syncI18nLocale } from "../i18n/translate";
import { syncDatetimeContext } from "../lib/datetime";
import { DEFAULT_STORAGE_KEY, readStoredPreferences, writeStoredPreferences } from "./storage";
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
  onLocaleChange,
  onTimezoneChange,
  onTimeFormatChange,
  onDateFormatChange,
}: AppProviderProp) {
  const stored = React.useMemo(
    () => (persist ? readStoredPreferences(storageKey) : {}),
    [persist, storageKey],
  );

  const initialLocale = stored.locale ?? defaultLocale;

  const [locale, setLocaleState] = React.useState<AppLocale>(initialLocale);
  const [timezone, setTimezoneState] = React.useState<AppTimezone>(
    stored.timezone ?? resolveDefaultTimezone(defaultTimezone, systemTimezone),
  );
  const [timeFormat, setTimeFormatState] = React.useState<AppTimeFormat>(() =>
    resolveInitialTimeFormat(stored.timeFormat, defaultTimeFormat, initialLocale),
  );
  const [dateFormat, setDateFormatState] = React.useState<AppDateFormat>(() =>
    resolveInitialDateFormat(stored.dateFormat, defaultDateFormat, initialLocale),
  );

  const prefsRef = React.useRef({ locale, timezone, timeFormat, dateFormat });

  React.useEffect(() => {
    prefsRef.current = { locale, timezone, timeFormat, dateFormat };
  }, [locale, timezone, timeFormat, dateFormat]);

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

  const requestHeaders = React.useMemo(
    () => buildRequestHeaders(locale, timezone, timeFormat, dateFormat),
    [locale, timezone, timeFormat, dateFormat],
  );

  React.useEffect(() => {
    syncAppRequestHeaders(requestHeaders);
    syncI18nLocale(locale, fallbackLocale);
    syncDatetimeContext({
      locale,
      timezone,
      timeFormat,
      dateFormat,
      dateFnsLocale: getDateFnsLocale(locale),
    });
  }, [requestHeaders, locale, fallbackLocale, timezone, timeFormat, dateFormat]);

  const value = React.useMemo<AppContextValue>(
    () => ({
      locale,
      fallbackLocale,
      timezone,
      timeFormat,
      dateFormat,
      dateFnsLocale: getDateFnsLocale(locale),
      dayPickerLocale: getDayPickerLocale(locale),
      requestHeaders,
      timezoneOptions,
      setLocale,
      setTimezone,
      setTimeFormat,
      setDateFormat,
    }),
    [
      locale,
      fallbackLocale,
      timezone,
      timeFormat,
      dateFormat,
      requestHeaders,
      timezoneOptions,
      setLocale,
      setTimezone,
      setTimeFormat,
      setDateFormat,
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
