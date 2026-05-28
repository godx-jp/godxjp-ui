import type { AppTimeFormat } from "./time-formats";
import type { AppDateFormat } from "./date-formats";

/** Supported UI locales — sent as `x-locale` to backend. */
export type AppLocale = "vi" | "en" | "ja";

/** IANA timezone identifier — sent as `x-timezone` to backend. */
export type AppTimezone = string;

/** How to resolve the initial timezone when nothing is stored. */
export type AppTimezoneDefault = "browser" | "system" | (AppTimezone & {});

export type { AppTimeFormat } from "./time-formats";
export type { AppDateFormat } from "./date-formats";
export {
  APP_TIME_FORMATS,
  APP_REQUEST_HEADER_TIME_FORMAT,
  getTimePattern,
  isAppTimeFormat,
} from "./time-formats";
export {
  APP_DATE_FORMATS,
  APP_REQUEST_HEADER_DATE_FORMAT,
  getDatePattern,
  getDateTimePattern,
  isAppDateFormat,
} from "./date-formats";

export const APP_LOCALES = ["vi", "en", "ja"] as const satisfies readonly AppLocale[];

export const APP_REQUEST_HEADER_LOCALE = "x-locale" as const;
export const APP_REQUEST_HEADER_TIMEZONE = "x-timezone" as const;

export type AppRequestHeaders = {
  "x-locale": AppLocale;
  "x-timezone": AppTimezone;
  "x-time-format": AppTimeFormat;
  "x-date-format": AppDateFormat;
};
