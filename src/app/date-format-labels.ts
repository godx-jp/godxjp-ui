import { APP_DATE_FORMATS } from "./date-formats";
import type { AppLocale } from "./types";
import type { AppDateFormat } from "./date-formats";
import { translate } from "../i18n/translate";

export const APP_DATE_FORMAT_OPTIONS = APP_DATE_FORMATS.map((value) => ({ value }));

export function getDateFormatLabel(
  dateFormat: AppDateFormat,
  locale: AppLocale,
  fallbackLocale: AppLocale = "en",
): string {
  return translate(locale, fallbackLocale, `dateFormat.${dateFormat}`);
}

/** Suggested default per locale — vi → dmy, ja → iso, en → mdy. */
export function resolveDefaultDateFormat(locale: AppLocale): AppDateFormat {
  if (locale === "en") return "mdy";
  if (locale === "ja") return "iso";
  return "dmy";
}
