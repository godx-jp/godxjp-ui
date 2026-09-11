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

/**
 * Suggested default per locale — vi → dmy, ja → ymd, en → mdy.
 *
 * `ja` used to be `iso` (`yyyy-MM-dd`). Nothing recorded a reason for it, and it is not the form a
 * Japanese business document is written in: those use `YYYY/MM/DD` (or `YYYY年MM月DD日`). The cost
 * of the old default was measured in a consumer — gino-cloud shipped its own date formatter as an
 * explicit stopgap purely to get the slashes, which is the package's own rule 1 broken by the
 * package's own default.
 *
 * ONLY THE DEFAULT MOVES. A stored preference still wins (see `resolveDateFormat` in
 * app-provider.tsx), a service can pin any value through `defaultDateFormat`, and `iso` is still
 * one keystroke away in `DateFormatPicker`.
 */
export function resolveDefaultDateFormat(locale: AppLocale): AppDateFormat {
  if (locale === "en") return "mdy";
  if (locale === "ja") return "ymd";
  return "dmy";
}
