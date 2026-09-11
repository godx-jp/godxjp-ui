import {
  format as formatDate,
  isValid,
  parse,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  type Locale,
} from "date-fns";
import type {
  DatePickerBaseProp,
  PickerDateFormatProp,
} from "../../props/components/data-entry.prop";
import { parseDateInput, toIsoDate } from "./parse";

/** The granularity axis a picker selects at — `DatePickerProp["picker"]`, resolved. */
export type DatePickerPicker = NonNullable<DatePickerBaseProp["picker"]>;

/** Display is independent from the canonical value submitted by the field. */
export function formatPickerDate(
  date: Date | undefined,
  format: PickerDateFormatProp | undefined,
  locale: string,
  withTime = false,
): string {
  if (!date || !isValid(date)) return "";
  if (typeof format === "function") return format(date);
  if (typeof format === "object") return new Intl.DateTimeFormat(locale, format).format(date);
  if (typeof format === "string") return formatDate(date, format);
  return withTime ? formatDate(date, "yyyy-MM-dd HH:mm") : toIsoDate(date);
}

export function parsePickerDate(
  text: string,
  format: PickerDateFormatProp | undefined,
  parser?: (text: string) => Date | undefined,
  withTime = false,
): Date | undefined {
  const raw = text.trim();
  if (!raw) return undefined;
  const custom = parser?.(raw);
  if (custom && isValid(custom)) return custom;
  const pattern = typeof format === "string" ? format : withTime ? "yyyy-MM-dd HH:mm" : undefined;
  if (pattern) {
    const parsed = parse(raw, pattern, new Date(2000, 0, 1));
    if (isValid(parsed) && formatDate(parsed, pattern) === raw) return parsed;
  }
  if (withTime || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
  return parseDateInput(raw) ?? undefined;
}

export function pickerDateAllowed(
  date: Date,
  min: Date | undefined,
  max: Date | undefined,
  disabled?: (date: Date) => boolean,
): boolean {
  return (
    isValid(date) &&
    (!min || startOfDay(date) >= startOfDay(min)) &&
    (!max || startOfDay(date) <= startOfDay(max)) &&
    !disabled?.(date)
  );
}

/** Normalize a reporting period with the active calendar's week convention. */
export function pickerPeriodStart(
  date: Date,
  picker: DatePickerBaseProp["picker"],
  locale: Pick<Locale, "options">,
): Date {
  switch (picker) {
    case "week":
      return startOfWeek(date, { locale });
    case "month":
      return startOfMonth(date);
    case "quarter":
      return startOfQuarter(date);
    case "year":
      return startOfYear(date);
    default:
      return date;
  }
}

/**
 * ISO-8601 at the precision the picker actually selects.
 *
 * The standard defines reduced forms, and a month picker that submits `2026/03` is simply using
 * none of them: `/` is not an ISO separator and a server parsing an ISO date will reject it. Each
 * granularity gets the shortest ISO form that loses nothing:
 *   year → `2026` · month → `2026-03` · quarter → `2026-01` (the quarter's first month, which is
 *   what the value IS) · week → `2026-W07` (ISO week-numbering year + week) · date → `2026-03-01`.
 */
export function toIsoPeriod(date: Date | undefined, picker: DatePickerPicker): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  switch (picker) {
    case "year":
      return String(date.getFullYear()).padStart(4, "0");
    case "quarter":
    case "month":
      return toIsoDate(date).slice(0, 7);
    case "week":
      return formatDate(date, "RRRR-'W'II");
    default:
      return toIsoDate(date);
  }
}

/**
 * The inverse of `toIsoPeriod`: read back the reduced ISO form the field displays for this
 * granularity. `date` is left to `parsePickerDate`, which already owns the full `yyyy-MM-dd` path
 * (custom parser, `format` pattern, era display).
 */
export function parseIsoPeriod(raw: string, picker: DatePickerPicker): Date | undefined {
  const text = raw.trim();
  if (picker === "year") {
    const m = /^(\d{4})$/.exec(text);
    return m ? new Date(Number(m[1]), 0, 1) : undefined;
  }
  if (picker === "month" || picker === "quarter") {
    const m = /^(\d{4})-(\d{1,2})$/.exec(text);
    if (!m) return undefined;
    const month = Number(m[2]);
    return month >= 1 && month <= 12 ? new Date(Number(m[1]), month - 1, 1) : undefined;
  }
  if (picker === "week") {
    const parsed = parse(text, "RRRR-'W'II", new Date(2000, 0, 1));
    return isValid(parsed) ? parsed : undefined;
  }
  return undefined;
}
