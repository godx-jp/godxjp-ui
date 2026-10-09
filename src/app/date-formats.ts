/** Date-only display preset — sent as `x-date-format` to backend. */
import { getTimePattern, type AppTimeFormat } from "./time-formats";
import { dateTimeFormat } from "../lib/intl-cache";

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

/** Map one `Intl` date part to the date-fns token that prints it. */
function partToken(part: Intl.DateTimeFormatPart, options: Intl.DateTimeFormatOptions): string {
  switch (part.type) {
    case "year":
      return "yyyy";
    case "month":
      return options.month === "long"
        ? "MMMM"
        : options.month === "short"
          ? "MMM"
          : options.month === "2-digit"
            ? "MM"
            : "M";
    case "day":
      return options.day === "2-digit" ? "dd" : "d";
    case "weekday":
      return options.weekday === "long" ? "EEEE" : "EEE";
    default:
      // date-fns reads ASCII letters as tokens; a literal containing one (or a quote) is quoted.
      return /[A-Za-z']/.test(part.value) ? `'${part.value.replaceAll("'", "''")}'` : part.value;
  }
}

function intlParts(locale: string, options: Intl.DateTimeFormatOptions) {
  const resolved = { ...options, calendar: "gregory", numberingSystem: "latn", timeZone: "UTC" };
  try {
    return dateTimeFormat(locale, resolved).formatToParts(new Date(Date.UTC(2026, 9, 8)));
  } catch {
    return null;
  }
}

/**
 * A date-fns pattern equivalent to `Intl.DateTimeFormat(locale, options)` — Gregorian calendar,
 * Latin digits (what date-fns prints). `null` when the engine cannot format `locale`.
 */
export function intlDatePattern(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string | null {
  const parts = intlParts(locale, options);
  return parts ? parts.map((part) => partToken(part, options)).join("") : null;
}

const NUMERIC_DATE: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

/**
 * The locale's own numeric date pattern, from `Intl` (v32, gh#1219): `de` → `dd.MM.yyyy`, `en-GB`
 * → `dd/MM/yyyy`, `ja` → `yyyy/MM/dd`, `vi` → `dd/MM/yyyy`, `en` → `MM/dd/yyyy`.
 */
export function getLocaleDatePattern(locale: string): string {
  return intlDatePattern(locale, NUMERIC_DATE) ?? getDatePattern("iso");
}

/** The ORDER the locale writes a numeric date in, from `Intl` — `ymd`, `dmy` or `mdy`. */
export function getLocaleDateOrder(locale: string): Exclude<AppDateFormat, "iso"> {
  const first = intlParts(locale, NUMERIC_DATE)?.find((part) => part.type !== "literal")?.type;
  if (first === "year") return "ymd";
  if (first === "month") return "mdy";
  return "dmy";
}

/**
 * date-fns pattern for date-only display IN A LOCALE (v32, gh#1219): the order the locale writes
 * natively is printed with the locale's own separators from `Intl` — `dmy` under `de` is
 * `dd.MM.yyyy`. Any other order prints the fixed {@link getDatePattern}. For `vi`, `en` and `ja`
 * the native pattern equals the fixed one, so they print exactly what they always did.
 */
export function getLocaleAwareDatePattern(dateFormat: AppDateFormat, locale: string): string {
  return dateFormat !== "iso" && dateFormat === getLocaleDateOrder(locale)
    ? getLocaleDatePattern(locale)
    : getDatePattern(dateFormat);
}

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

/** date-fns pattern for date + time (table cells); with a `locale`, its native separators. */
export function getDateTimePattern(
  timeFormat: AppTimeFormat,
  dateFormat: AppDateFormat,
  locale?: string,
): string {
  const date = locale ? getLocaleAwareDatePattern(dateFormat, locale) : getDatePattern(dateFormat);
  return `${date} ${getTimePattern(timeFormat)}`;
}

export function isAppDateFormat(value: string | null | undefined): value is AppDateFormat {
  return APP_DATE_FORMATS.includes(value as AppDateFormat);
}
