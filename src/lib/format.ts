// Shared formatting helpers — every admin component uses these instead of
// inline string templates so the platform speaks one language for dates,
// sizes, money, IDs.
import { getSyncedLocale, translateCurrent } from "../i18n/translate";

/**
 * Bytes → size with conventional binary units (B/KB/MB/GB) and a locale-correct number,
 * e.g. "2.0 KB" (en) / "2,0 KB" (vi). The numeric part is formatted via `Intl.NumberFormat`
 * (locale decimal/grouping separators — no hardcoded "."); an optional `locale` overrides the
 * module-synced active locale.
 */
export function formatBytes(
  n: number | null | undefined,
  locale: string = getSyncedLocale(),
): string {
  if (n == null) return "—";
  const num = (digits: number, scaled: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(scaled);
  if (n < 1024) return `${num(0, n)} B`;
  if (n < 1024 * 1024) return `${num(1, n / 1024)} KB`;
  if (n < 1024 * 1024 * 1024) return `${num(1, n / 1024 / 1024)} MB`;
  return `${num(2, n / 1024 / 1024 / 1024)} GB`;
}

/**
 * ISO 4217 minor units → locale-formatted currency, e.g. (1995, "USD") → "$19.95" (en) /
 * "19,95 $" (vi). The active locale (or an explicit `locale`) drives grouping/symbol placement;
 * the currency's minor-unit scale comes from CLDR via `resolvedOptions().maximumFractionDigits`
 * — no hand-maintained zero-decimal list.
 */
export function formatCurrency(
  amountMinor: number | null | undefined,
  currency: string,
  locale: string = getSyncedLocale(),
): string {
  if (amountMinor == null || !currency) return "—";
  const formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
  const minorUnitDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  const major = amountMinor / Math.pow(10, minorUnitDigits);
  return formatter.format(major);
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
