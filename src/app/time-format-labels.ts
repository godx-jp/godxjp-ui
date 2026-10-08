import { APP_TIME_FORMATS } from "./time-formats";
import type { AppLocale } from "./types";
import type { AppTimeFormat } from "./time-formats";
import { translate } from "../i18n/translate";
import { dateTimeFormat } from "../lib/intl-cache";

export const APP_TIME_FORMAT_OPTIONS = APP_TIME_FORMATS.map((value) => ({ value }));

export function getTimeFormatLabel(
  timeFormat: AppTimeFormat,
  locale: AppLocale,
  fallbackLocale: AppLocale = "en",
): string {
  return translate(locale, fallbackLocale, `timeFormat.${timeFormat}`);
}

/**
 * Suggested default per locale: the locale's own clock from `Intl`'s hour cycle (v32, gh#1219) —
 * `h11`/`h12` → 12h, otherwise 24h. vi/ja → 24h and en → 12h, as before; en-GB / de → 24h.
 */
export function resolveDefaultTimeFormat(locale: AppLocale): AppTimeFormat {
  try {
    const { hourCycle } = dateTimeFormat(locale, { hour: "numeric" }).resolvedOptions();
    return hourCycle === "h11" || hourCycle === "h12" ? "12h" : "24h";
  } catch {
    return "24h";
  }
}
