/** Date-only display preset — sent as `x-date-format` to backend. */
import { getTimePattern, type AppTimeFormat } from "./time-formats";

export type AppDateFormat = "iso" | "ymd" | "dmy" | "mdy";

/**
 * `ymd` (`yyyy/MM/dd`) IS THE JAPANESE BUSINESS FORM, AND ITS ABSENCE WAS A HOLE WITH NO WAY OUT.
 *
 * The axis shipped three values and none of them said `2026/05/01`: `iso` writes hyphens, and the
 * two slash forms put the day or the month first. A Japanese-first consumer (gino-cloud) therefore
 * wrote its own formatter and marked it an explicit stopgap — the tell that a named axis was
 * missing a value rather than the consumer wanting something exotic, since the only alternative
 * the package left was the thing docs/DATETIME.md rule 1 forbids ("never use date-fns/format,
 * toLocaleString, or raw ISO slices for UI").
 *
 * It sits BEFORE the day/month-first pair because it is the other year-first form, next to `iso`.
 */
export const APP_DATE_FORMATS = [
  "iso",
  "ymd",
  "dmy",
  "mdy",
] as const satisfies readonly AppDateFormat[];

export const APP_REQUEST_HEADER_DATE_FORMAT = "x-date-format" as const;

/** date-fns pattern for date-only display. */
export function getDatePattern(dateFormat: AppDateFormat): string {
  switch (dateFormat) {
    case "ymd":
      return "yyyy/MM/dd";
    case "dmy":
      return "dd/MM/yyyy";
    case "mdy":
      return "MM/dd/yyyy";
    case "iso":
    default:
      return "yyyy-MM-dd";
  }
}

/** date-fns pattern for date + time (table cells). */
export function getDateTimePattern(timeFormat: AppTimeFormat, dateFormat: AppDateFormat): string {
  return `${getDatePattern(dateFormat)} ${getTimePattern(timeFormat)}`;
}

export function isAppDateFormat(value: string | null | undefined): value is AppDateFormat {
  return APP_DATE_FORMATS.includes(value as AppDateFormat);
}
