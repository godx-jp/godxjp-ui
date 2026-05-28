import { APP_TIME_FORMATS } from "./time-formats";
import type { AppLocale } from "./types";
import type { AppTimeFormat } from "./time-formats";
import { translate } from "../i18n/translate";

export const APP_TIME_FORMAT_OPTIONS = APP_TIME_FORMATS.map((value) => ({ value }));

export function getTimeFormatLabel(
  timeFormat: AppTimeFormat,
  locale: AppLocale,
  fallbackLocale: AppLocale = "en",
): string {
  return translate(locale, fallbackLocale, `timeFormat.${timeFormat}`);
}

/** Suggested default per locale — vi/ja → 24h, en → 12h. */
export function resolveDefaultTimeFormat(locale: AppLocale): AppTimeFormat {
  return locale === "en" ? "12h" : "24h";
}
