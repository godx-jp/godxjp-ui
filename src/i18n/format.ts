// Locale + timezone-aware formatters.
//
// Per ADR 0005 the framework standardises on native `Intl` APIs for
// formatting and `@internationalized/date` for value types. These
// helpers accept the value shapes the framework can encounter in the
// wild (native `Date`, ISO string, or any `@internationalized/date`
// value) and resolve the locale + timezone from the
// preferences holder.
//
// Non-React surface — callable from anywhere (axios interceptors,
// React renders, event handlers, tests). The matching React hook is
// `useFormatters()` in `src/hooks/useFormatters.ts`; it returns the
// same surface bound to the live provider context.

import {
  type CalendarDate,
  type CalendarDateTime,
  type Time,
  type ZonedDateTime,
} from "@internationalized/date";
import { getGodxConfig } from "../preferences/holder";

/** A value any framework primitive accepts as a date / time input. */
export type DateLike =
  | Date
  | string
  | number
  | CalendarDate
  | CalendarDateTime
  | ZonedDateTime;

/** A value any framework primitive accepts as a time-only input. */
export type TimeLike = Date | string | number | Time | CalendarDateTime | ZonedDateTime;

export interface FormatOptions {
  /** BCP 47 locale override. Defaults to the preferences holder. */
  locale?: string;
  /** IANA timezone override. Defaults to the preferences holder. */
  timezone?: string;
}

export interface FormatDateOptions extends FormatOptions, Intl.DateTimeFormatOptions {}
export interface FormatNumberOptions extends FormatOptions, Intl.NumberFormatOptions {}
export interface FormatCurrencyOptions extends FormatOptions, Intl.NumberFormatOptions {
  currency: string;
}

function resolveLocale(opts?: FormatOptions): string {
  return opts?.locale ?? getGodxConfig().locale;
}

function resolveTimezone(opts?: FormatOptions): string {
  return opts?.timezone ?? getGodxConfig().timezone;
}

/** Convert any DateLike value into a native `Date` for `Intl` use. */
function toDate(value: DateLike): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") return new Date(value);
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const v = value as CalendarDate | CalendarDateTime | ZonedDateTime;
    return v.toDate(getGodxConfig().timezone);
  }
  throw new TypeError(`format helpers: unsupported value ${String(value)}`);
}

/** Drop format-specific opts before passing to Intl. */
function extractIntlOpts<T extends FormatOptions>(opts: T | undefined): Omit<T, keyof FormatOptions> {
  if (!opts) return {} as Omit<T, keyof FormatOptions>;
  const { locale: _l, timezone: _t, ...rest } = opts;
  return rest as Omit<T, keyof FormatOptions>;
}

/** Format a date by locale + timezone. Defaults: medium date style. */
export function formatDate(value: DateLike, opts?: FormatDateOptions): string {
  const locale = resolveLocale(opts);
  const timezone = resolveTimezone(opts);
  const intlOpts: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    ...extractIntlOpts(opts),
    timeZone: timezone,
  };
  return new Intl.DateTimeFormat(locale, intlOpts).format(toDate(value));
}

/** Format a time by locale + timezone. Defaults: short time. */
export function formatTime(value: DateLike, opts?: FormatDateOptions): string {
  const locale = resolveLocale(opts);
  const timezone = resolveTimezone(opts);
  const intlOpts: Intl.DateTimeFormatOptions = {
    timeStyle: "short",
    ...extractIntlOpts(opts),
    timeZone: timezone,
  };
  return new Intl.DateTimeFormat(locale, intlOpts).format(toDate(value));
}

/** Format both date + time. Defaults: medium date, short time. */
export function formatDateTime(value: DateLike, opts?: FormatDateOptions): string {
  const locale = resolveLocale(opts);
  const timezone = resolveTimezone(opts);
  const intlOpts: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
    ...extractIntlOpts(opts),
    timeZone: timezone,
  };
  return new Intl.DateTimeFormat(locale, intlOpts).format(toDate(value));
}

/** Format a number by locale. */
export function formatNumber(value: number, opts?: FormatNumberOptions): string {
  const locale = resolveLocale(opts);
  return new Intl.NumberFormat(locale, extractIntlOpts(opts)).format(value);
}

/** Format a currency amount. ISO 4217 currency code required. */
export function formatCurrency(value: number, opts: FormatCurrencyOptions): string {
  const locale = resolveLocale(opts);
  const intlOpts: Intl.NumberFormatOptions = {
    style: "currency",
    ...extractIntlOpts(opts),
  };
  return new Intl.NumberFormat(locale, intlOpts).format(value);
}
