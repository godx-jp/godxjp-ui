import { format as formatDate, isValid, parse, startOfDay } from "date-fns";
import type { PickerDateFormatProp } from "../../props/components/data-entry.prop";
import { parseDateInput, toIsoDate } from "./parse";

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
