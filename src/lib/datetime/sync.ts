import type { Locale } from "date-fns";
import { getDateFnsLocale, normalizeAppLocale } from "../../app/locales";
import { resolveDefaultDateFormat } from "../../app/date-format-labels";
import { resolveDefaultTimeFormat } from "../../app/time-format-labels";
import { getAppSettingsState } from "../../app/settings-scope";
import { resolveHydrationSafeTimezone } from "../../app/timezones";
import { resolveDefaultLocale } from "../../i18n/locale-tags";
import type { AppLocale, AppTimeFormat, AppDateFormat } from "../../app/types";

export type DatetimeContext = {
  locale: AppLocale;
  dateFnsLocale: Locale;
  timezone: string;
  timeFormat: AppTimeFormat;
  dateFormat: AppDateFormat;
};

/*
 * What `formatDate` uses for whatever the current scope has not set — module load, SSR, tests that
 * reset, and any field `runWithAppSettings` was not given.
 *
 * LOCALE: the page's own `<html lang>` if it is registered, else `en` (decision A2, gh#1219). Read
 * at CALL time, since `lang` is often set after this module loads (gh#1202).
 *
 * TIMEZONE: AppProvider's OWN unconfigured first-render answer (`defaultTimezone = "browser"`, no
 * `systemTimezone`), from the same function, so the two cannot drift (gh#968) — UTC, which is at
 * least visibly not local, where `Asia/Ho_Chi_Minh` looked right while being wrong.
 *
 * FORMATS: the locale's own, from `Intl` (`resolveDefaultDateFormat` / `resolveDefaultTimeFormat`).
 */
function resolveContext(partial: Partial<DatetimeContext> | undefined): DatetimeContext {
  const locale = partial?.locale ?? resolveDefaultLocale();
  return {
    locale,
    dateFnsLocale: partial?.dateFnsLocale ?? getDateFnsLocale(normalizeAppLocale(locale)),
    timezone: partial?.timezone ?? resolveHydrationSafeTimezone("browser"),
    timeFormat: partial?.timeFormat ?? resolveDefaultTimeFormat(locale),
    dateFormat: partial?.dateFormat ?? resolveDefaultDateFormat(locale),
  };
}

let liveRelativeFormattingEnabled = true;

/**
 * Sync the CURRENT scope's datetime prefs (mirrors `syncI18nLocale`). AppProvider calls it while
 * rendering; inside `runWithAppSettings` it writes that request's state only.
 */
export function syncDatetimeContext(
  // `prefs`, not `partial`: the type demands all four fields and the body REPLACES the context
  // rather than merging, so a name promising a partial update was the one wrong thing here.
  prefs: Pick<DatetimeContext, "locale" | "timezone" | "timeFormat" | "dateFormat"> & {
    dateFnsLocale?: Locale;
  },
): void {
  getAppSettingsState().datetime = {
    locale: prefs.locale,
    timezone: prefs.timezone,
    timeFormat: prefs.timeFormat,
    dateFormat: prefs.dateFormat,
    dateFnsLocale: prefs.dateFnsLocale ?? getDateFnsLocale(prefs.locale),
  };
}

/** The current scope's datetime prefs, with the neutral defaults for anything unset. */
export function getDatetimeContext(): Readonly<DatetimeContext> {
  return resolveContext(getAppSettingsState().datetime);
}

export function enableLiveRelativeFormatting(): void {
  liveRelativeFormattingEnabled = true;
}

export function disableLiveRelativeFormatting(): void {
  liveRelativeFormattingEnabled = false;
}

export function canUseLiveRelativeFormatting(): boolean {
  return liveRelativeFormattingEnabled;
}

/** Vitest only — reset the current scope to defaults between cases. */
export function resetDatetimeContextForTests(): void {
  getAppSettingsState().datetime = undefined;
  liveRelativeFormattingEnabled = true;
}
