// Shared formatting helpers — every admin component uses these instead of
// inline string templates so the platform speaks one language for dates,
// sizes, money, IDs.
import { formatDate, type FormatDateOptions, type FormatDatetimeOptions } from "./datetime";
import { translateCurrent } from "../i18n/translate";

export type FormatOptions = FormatDatetimeOptions & FormatDateOptions;

/** @deprecated Prefer `formatDate(value, { kind: "datetime" })` — delegates to unified formatter. */
export function formatTime(
  value: string | Date | null | undefined,
  options?: FormatOptions,
): string {
  return formatDate(value, { ...options, kind: "time" });
}

/** @deprecated Prefer `formatDate(value, { kind: "datetime" })`. */
export function formatDateTime(
  value: string | Date | null | undefined,
  options?: FormatOptions,
): string {
  return formatDate(value, { ...options, kind: "datetime" });
}

/** @deprecated Prefer `formatDate(value, { kind: "long" })`. */
export function formatDateLong(
  value: string | Date | null | undefined,
  options?: FormatOptions,
): string {
  return formatDate(value, { ...options, kind: "long" });
}

/** @deprecated Prefer `formatDate(value, { kind: "relative" })`. */
export function formatRelative(
  value: string | Date | null | undefined,
  options?: Pick<FormatOptions, "locale">,
): string {
  return formatDate(value, { ...options, kind: "relative" });
}

/** Bytes → "1.2 MB". */
export function formatBytes(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/** ISO 4217 minor units → display string. e.g. (1995, "USD") → "$19.95". */
export function formatCurrency(amountMinor: number | null | undefined, currency: string): string {
  if (amountMinor == null || !currency) return "—";
  // Most ISO 4217 currencies use 2 decimal places; JPY/VND/KRW use 0.
  const zeroDecimal = [
    "JPY",
    "VND",
    "KRW",
    "CLP",
    "ISK",
    "BIF",
    "DJF",
    "GNF",
    "KMF",
    "RWF",
    "XAF",
    "XOF",
    "XPF",
  ];
  const minorUnitDigits = zeroDecimal.includes(currency.toUpperCase()) ? 0 : 2;
  const major = amountMinor / Math.pow(10, minorUnitDigits);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: minorUnitDigits,
    maximumFractionDigits: minorUnitDigits,
  }).format(major);
}

/** UUIDv7 / UUIDv4 → first 8 chars + ellipsis. Pair with a Tooltip showing full. */
export function shortId(id: string | null | undefined): string {
  if (!id) return "—";
  if (id.length <= 12) return id;
  return id.slice(0, 8) + "…";
}

/** Translate any backend error into something a user can act on. Falls back
 * to a generic message for non-Error objects (avoids dumping stack traces). */
export function humanError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    const cleaned = msg.replace(/^\d{3}[^:]*:\s*/, "");
    if (cleaned && cleaned !== "(empty)") return cleaned;
    return translateCurrent("feedback.genericError");
  }
  return translateCurrent("feedback.genericError");
}

// Re-export datetime utilities for apps that import from lib/format.
export {
  formatDate,
  isFormatDateValue,
  formatCalendarDate,
  formatAppDate,
  formatAppDateTime,
  formatAppTime,
  formatAppDateLong,
  formatAppRelative,
  formatTimeOfDay,
  parseDateInput,
  normalizeHhmm,
  isValidHhmm,
  detectFormatDateKind,
} from "./datetime";
export type { FormatDateOptions, FormatDatetimeOptions, FormatDateKind } from "./datetime";
