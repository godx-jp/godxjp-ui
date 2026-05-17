// Locale-aware relative-time formatter.
//
// Wraps `Intl.RelativeTimeFormat` (browser-native, no library cost) with
// the diff-bucket logic — second / minute / hour / day / week / month /
// year — so consumers can pass a single date/time value and get
// "2時間前" / "2 hours ago" / "2 giờ trước" / "2 oras na nakalipas" by
// reading the active locale from the preferences holder.

import { type DateLike } from "./format";
import { getGodxConfig } from "../preferences/holder";

export interface RelativeOptions {
  /** BCP 47 locale override. Defaults to the preferences holder. */
  locale?: string;
  /** Reference moment. Defaults to "now". Useful for tests. */
  now?: Date | number;
  /** `Intl.RelativeTimeFormat` numeric style. Default `"auto"`. */
  numeric?: "always" | "auto";
  /** `Intl.RelativeTimeFormat` style. Default `"long"`. */
  style?: "long" | "short" | "narrow";
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function toMs(value: DateLike): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") return new Date(value).getTime();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return value.toDate(getGodxConfig().timezone).getTime();
  }
  throw new TypeError(`formatRelative: unsupported value ${String(value)}`);
}

/**
 * Format the distance between `value` and `opts.now` (default: current
 * time) as a locale-aware string.
 *
 * Granularity tops out at "year". Anything longer than a year reports
 * "in N years" / "N years ago".
 */
export function formatRelative(value: DateLike, opts: RelativeOptions = {}): string {
  const locale = opts.locale ?? getGodxConfig().locale;
  const nowMs = opts.now instanceof Date ? opts.now.getTime() : (opts.now ?? Date.now());
  const valueMs = toMs(value);
  const diffMs = valueMs - nowMs;
  const abs = Math.abs(diffMs);

  let unit: Intl.RelativeTimeFormatUnit;
  let amount: number;

  if (abs < MINUTE) {
    unit = "second";
    amount = Math.round(diffMs / SECOND);
  } else if (abs < HOUR) {
    unit = "minute";
    amount = Math.round(diffMs / MINUTE);
  } else if (abs < DAY) {
    unit = "hour";
    amount = Math.round(diffMs / HOUR);
  } else if (abs < WEEK) {
    unit = "day";
    amount = Math.round(diffMs / DAY);
  } else if (abs < MONTH) {
    unit = "week";
    amount = Math.round(diffMs / WEEK);
  } else if (abs < YEAR) {
    unit = "month";
    amount = Math.round(diffMs / MONTH);
  } else {
    unit = "year";
    amount = Math.round(diffMs / YEAR);
  }

  return new Intl.RelativeTimeFormat(locale, {
    numeric: opts.numeric ?? "auto",
    style: opts.style ?? "long",
  }).format(amount, unit);
}
