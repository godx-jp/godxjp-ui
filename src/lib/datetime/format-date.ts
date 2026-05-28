import {
  formatAppDate,
  formatAppDateLong,
  formatAppDateTime,
  formatAppRelative,
  formatAppTime,
  formatCalendarDate,
  formatTimeOfDay,
  type FormatDatetimeOptions,
} from "./format";
import { detectFormatDateKind, type FormatDateKind } from "./detect";
import { isValidHhmm, parseDateInput } from "./parse";

const EMPTY = "—";

export type FormatDateOptions = FormatDatetimeOptions & {
  /**
   * Output preset. Default `auto` detects ISO date / HH:mm / instant.
   * Locale, timezone, and 12h|24h fall back to AppProvider when omitted.
   */
  kind?: FormatDateKind;
  /** Treat `Date` as calendar pick (react-day-picker) — not an instant. */
  calendar?: boolean;
};

function resolveKind(
  value: string | Date,
  options?: FormatDateOptions,
): Exclude<FormatDateKind, "auto"> {
  if (options?.kind && options.kind !== "auto") return options.kind;
  if (options?.calendar && value instanceof Date) return "calendar";
  return detectFormatDateKind(value);
}

/**
 * **Single entry point** for all date/time display in GX apps.
 *
 * - Defaults: locale, timezone, timeFormat from AppProvider (`syncDatetimeContext`)
 * - Optional overrides: `{ timezone: "Asia/Tokyo" }` per call
 * - Auto-detect: `"2026-05-01"` → date, `"14:30"` → time, ISO instant → datetime
 * - International patterns: ISO 8601 date (`yyyy-MM-dd`) + ISO datetime (`yyyy-MM-dd HH:mm`)
 */
export function formatDate(
  value: string | Date | null | undefined,
  options?: FormatDateOptions,
): string {
  if (value == null || value === "") return EMPTY;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return EMPTY;

    const kind = resolveKind(trimmed, options);
    switch (kind) {
      case "time":
        return isValidHhmm(trimmed)
          ? formatTimeOfDay(trimmed, options)
          : formatAppTime(trimmed, options);
      case "date":
        return formatAppDate(trimmed, options);
      case "long":
        return formatAppDateLong(trimmed, options);
      case "relative":
        return formatAppRelative(trimmed, options);
      case "calendar":
      case "datetime":
      default:
        return formatAppDateTime(trimmed, options);
    }
  }

  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return EMPTY;

  const kind = resolveKind(value, options);
  switch (kind) {
    case "calendar":
      return formatCalendarDate(value, options);
    case "date":
      return formatCalendarDate(value, options);
    case "time":
      return formatAppTime(value, options);
    case "long":
      return formatAppDateLong(value, options);
    case "relative":
      return formatAppRelative(value, options);
    case "datetime":
    default:
      return formatAppDateTime(value, options);
  }
}

/** True when value looks like a displayable date/time (string or valid Date). */
export function isFormatDateValue(value: unknown): value is string | Date {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (isValidHhmm(trimmed)) return true;
  return parseDateInput(trimmed) != null;
}
