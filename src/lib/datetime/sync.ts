import type { Locale } from "date-fns";
import { getDateFnsLocale } from "../../app/locales";
import { resolveDefaultDateFormat } from "../../app/date-format-labels";
import { resolveHydrationSafeTimezone } from "../../app/timezones";
import type { AppLocale, AppTimeFormat, AppDateFormat } from "../../app/types";

export type DatetimeContext = {
  locale: AppLocale;
  dateFnsLocale: Locale;
  timezone: string;
  timeFormat: AppTimeFormat;
  dateFormat: AppDateFormat;
};

/** Must equal AppProvider's `defaultLocale` default, so "not configured" means one thing. */
const DEFAULT_LOCALE: AppLocale = "vi";

/*
 * What `formatDate` uses until AppProvider syncs — module load, SSR, and tests that reset.
 *
 * The timezone is AppProvider's OWN unconfigured answer (`defaultTimezone = "browser"`, no
 * `systemTimezone`), taken from the same function, so the two cannot drift again (gh#968). It was a
 * hard-coded `Asia/Ho_Chi_Minh`, which disagreed with the provider AND looked plausible when wrong.
 */
const defaultContext = (): DatetimeContext => ({
  locale: DEFAULT_LOCALE,
  dateFnsLocale: getDateFnsLocale(DEFAULT_LOCALE),
  timezone: resolveHydrationSafeTimezone("browser"),
  timeFormat: "24h",
  dateFormat: resolveDefaultDateFormat(DEFAULT_LOCALE),
});

let syncedContext: DatetimeContext = defaultContext();
let liveRelativeFormattingEnabled = true;

/** Sync module-level datetime prefs from AppProvider (mirrors syncI18nLocale). */
export function syncDatetimeContext(
  // `prefs`, not `partial`: the type demands all four fields and the body REPLACES the context
  // rather than merging, so a name promising a partial update was the one wrong thing here.
  prefs: Pick<DatetimeContext, "locale" | "timezone" | "timeFormat" | "dateFormat"> & {
    dateFnsLocale?: Locale;
  },
): void {
  syncedContext = {
    locale: prefs.locale,
    timezone: prefs.timezone,
    timeFormat: prefs.timeFormat,
    dateFormat: prefs.dateFormat,
    dateFnsLocale: prefs.dateFnsLocale ?? getDateFnsLocale(prefs.locale),
  };
}

export function getDatetimeContext(): Readonly<DatetimeContext> {
  return syncedContext;
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

/** Vitest only — reset to defaults between cases. */
export function resetDatetimeContextForTests(): void {
  syncedContext = defaultContext();
  liveRelativeFormattingEnabled = true;
}
