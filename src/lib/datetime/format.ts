import { TZDate } from "@date-fns/tz";
import { format, formatDistanceToNow, type Locale } from "date-fns";
import { getDateFnsLocale } from "../../app/locales";
import { getDatePattern, getDateTimePattern } from "../../app/date-formats";
import { getTimePattern, type AppTimeFormat } from "../../app/time-formats";
import type { AppLocale, AppDateFormat } from "../../app/types";
import { calendarDateToTZDate, hhmmToTZDate, parseDateInput } from "./parse";
import { isDateOnlyString } from "./detect";
import { getDatetimeContext } from "./sync";

export type FormatDatetimeOptions = {
  locale?: Locale | AppLocale;
  timezone?: string;
  timeFormat?: AppTimeFormat;
  dateFormat?: AppDateFormat;
};

type ResolvedFormatOptions = {
  locale: Locale;
  timezone: string;
  timeFormat: AppTimeFormat;
  dateFormat: AppDateFormat;
};

function resolveLocale(locale?: Locale | AppLocale): Locale {
  if (!locale) return getDatetimeContext().dateFnsLocale;
  if (typeof locale === "string") return getDateFnsLocale(locale);
  return locale;
}

function resolveOptions(options?: FormatDatetimeOptions): ResolvedFormatOptions {
  const ctx = getDatetimeContext();
  return {
    locale: resolveLocale(options?.locale),
    timezone: options?.timezone ?? ctx.timezone,
    timeFormat: options?.timeFormat ?? ctx.timeFormat,
    dateFormat: options?.dateFormat ?? ctx.dateFormat,
  };
}

function formatTZDate(zoned: TZDate, pattern: string, options: ResolvedFormatOptions): string {
  return format(zoned, pattern, { locale: options.locale });
}

function instantToTZDate(value: Date, timezone: string): TZDate {
  return new TZDate(value, timezone);
}

const EMPTY = "—";

/** Date-only from calendar picker — uses Y/M/D in app timezone. */
export function formatCalendarDate(
  value: Date | null | undefined,
  options?: FormatDatetimeOptions,
): string {
  if (!value) return EMPTY;
  const resolved = resolveOptions(options);
  const zoned = calendarDateToTZDate(value, resolved.timezone);
  return formatTZDate(zoned, getDatePattern(resolved.dateFormat), resolved);
}

/** Date-only from ISO instant or `yyyy-MM-dd` string — date part in app timezone. */
export function formatAppDate(
  value: string | Date | null | undefined,
  options?: FormatDatetimeOptions,
): string {
  const resolved = resolveOptions(options);
  if (typeof value === "string" && isDateOnlyString(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const zoned = new TZDate(year, month - 1, day, resolved.timezone);
    return formatTZDate(zoned, getDatePattern(resolved.dateFormat), resolved);
  }
  const parsed = parseDateInput(value);
  if (!parsed) return EMPTY;
  const zoned = instantToTZDate(parsed, resolved.timezone);
  return formatTZDate(zoned, getDatePattern(resolved.dateFormat), resolved);
}

/** Date + time in app timezone. */
export function formatAppDateTime(
  value: string | Date | null | undefined,
  options?: FormatDatetimeOptions,
): string {
  const parsed = parseDateInput(value);
  if (!parsed) return EMPTY;
  const resolved = resolveOptions(options);
  const zoned = instantToTZDate(parsed, resolved.timezone);
  return formatTZDate(
    zoned,
    getDateTimePattern(resolved.timeFormat, resolved.dateFormat),
    resolved,
  );
}

/** Time from ISO instant in app timezone. */
export function formatAppTime(
  value: string | Date | null | undefined,
  options?: FormatDatetimeOptions,
): string {
  const parsed = parseDateInput(value);
  if (!parsed) return EMPTY;
  const resolved = resolveOptions(options);
  const zoned = instantToTZDate(parsed, resolved.timezone);
  return formatTZDate(zoned, getTimePattern(resolved.timeFormat), resolved);
}

/** Long date (PPP) in app timezone. */
export function formatAppDateLong(
  value: string | Date | null | undefined,
  options?: FormatDatetimeOptions,
): string {
  const parsed = parseDateInput(value);
  if (!parsed) return EMPTY;
  const resolved = resolveOptions(options);
  const zoned = instantToTZDate(parsed, resolved.timezone);
  return formatTZDate(zoned, "PPP", resolved);
}

/** Relative time — instant-based; locale from context. */
export function formatAppRelative(
  value: string | Date | null | undefined,
  options?: Pick<FormatDatetimeOptions, "locale">,
): string {
  const parsed = parseDateInput(value);
  if (!parsed) return EMPTY;
  const locale = resolveLocale(options?.locale);
  return formatDistanceToNow(parsed, { addSuffix: true, locale });
}

/** Format canonical HH:mm (24h storage) for display per timeFormat + locale. */
export function formatTimeOfDay(
  hhmm: string | null | undefined,
  options?: FormatDatetimeOptions,
): string {
  if (!hhmm) return EMPTY;
  const resolved = resolveOptions(options);
  const zoned = hhmmToTZDate(hhmm, resolved.timezone);
  if (!zoned) return hhmm;
  return formatTZDate(zoned, getTimePattern(resolved.timeFormat), resolved);
}
