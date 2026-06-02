import { TZDate } from "@date-fns/tz";
import { parseISO } from "date-fns";
import { isDateOnlyString } from "./detect";

/** Format a calendar Date to an ISO-8601 date-only string (`yyyy-MM-dd`) from its local Y/M/D. */
export function toIsoDate(value: Date | null | undefined): string {
  if (value == null || Number.isNaN(value.getTime())) return "";
  const year = String(value.getFullYear()).padStart(4, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse ISO string or Date — returns null for invalid values. */
export function parseDateInput(value: string | Date | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const trimmed = value.trim();
  if (isDateOnlyString(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = parseISO(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Calendar date from react-day-picker — interpret Y/M/D in app timezone, not browser local. */
export function calendarDateToTZDate(date: Date, timezone: string): TZDate {
  return new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), timezone);
}

const HHMM_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export function isValidHhmm(value: string): boolean {
  return HHMM_RE.test(value.trim());
}

/** Normalize loose input ("9:30") to canonical 24h "09:30". */
export function normalizeHhmm(value: string): string | null {
  const trimmed = value.trim();
  if (isValidHhmm(trimmed)) {
    const [h, m] = trimmed.split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }
  const loose = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!loose) return null;
  const hours = Number(loose[1]);
  const minutes = Number(loose[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Map canonical HH:mm to a TZDate on today's calendar date in the given timezone. */
export function hhmmToTZDate(hhmm: string, timezone: string): TZDate | null {
  const normalized = normalizeHhmm(hhmm);
  if (!normalized) return null;
  const [h, m] = normalized.split(":").map(Number);
  const today = TZDate.tz(timezone);
  return new TZDate(today.getFullYear(), today.getMonth(), today.getDate(), h, m, 0, 0, timezone);
}
