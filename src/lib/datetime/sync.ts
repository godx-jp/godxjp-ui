import type { Locale } from "date-fns";
import { getDateFnsLocale } from "../../app/locales";
import { resolveDefaultDateFormat } from "../../app/date-format-labels";
import type { AppLocale, AppTimeFormat, AppDateFormat } from "../../app/types";

export type DatetimeContext = {
  locale: AppLocale;
  dateFnsLocale: Locale;
  timezone: string;
  timeFormat: AppTimeFormat;
  dateFormat: AppDateFormat;
};

const DEFAULT_LOCALE: AppLocale = "vi";

const defaultContext = (): DatetimeContext => ({
  locale: DEFAULT_LOCALE,
  dateFnsLocale: getDateFnsLocale(DEFAULT_LOCALE),
  timezone: "Asia/Ho_Chi_Minh",
  timeFormat: "24h",
  dateFormat: resolveDefaultDateFormat(DEFAULT_LOCALE),
});

let syncedContext: DatetimeContext = defaultContext();

/** Sync module-level datetime prefs from AppProvider (mirrors syncI18nLocale). */
export function syncDatetimeContext(
  partial: Pick<DatetimeContext, "locale" | "timezone" | "timeFormat" | "dateFormat"> & {
    dateFnsLocale?: Locale;
  },
): void {
  syncedContext = {
    locale: partial.locale,
    timezone: partial.timezone,
    timeFormat: partial.timeFormat,
    dateFormat: partial.dateFormat,
    dateFnsLocale: partial.dateFnsLocale ?? getDateFnsLocale(partial.locale),
  };
}

export function getDatetimeContext(): Readonly<DatetimeContext> {
  return syncedContext;
}

/** Vitest only — reset to defaults between cases. */
export function resetDatetimeContextForTests(): void {
  syncedContext = defaultContext();
}
