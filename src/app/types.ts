import type { AppTimeFormat } from "./time-formats";
import type { AppDateFormat } from "./date-formats";

/**
 * A UI locale: any REGISTERED BCP-47 tag (`registerLocale`) — sent as `x-locale` to the backend.
 *
 * v32 widened it from the closed union `"vi" | "en" | "ja"` (gh#1219); those three remain
 * pre-registered and are named by {@link BuiltInLocale}.
 */
export type AppLocale = string;

/** The locales the library ships packs (messages + date adapters) for. */
export type BuiltInLocale = "vi" | "en" | "ja";

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

/** The built-in locales. For everything registered at runtime, read `getRegisteredLocales()`. */
export const APP_LOCALES = ["vi", "en", "ja"] as const satisfies readonly BuiltInLocale[];

export const APP_REQUEST_HEADER_LOCALE = "x-locale" as const;
export const APP_REQUEST_HEADER_TIMEZONE = "x-timezone" as const;

export type AppRequestHeaders = {
  "x-locale": AppLocale;
  "x-timezone": AppTimezone;
  "x-time-format": AppTimeFormat;
  "x-date-format": AppDateFormat;
};
