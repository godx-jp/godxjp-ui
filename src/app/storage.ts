import { isAppLocale } from "./locales";
import { isAppDateFormat } from "./date-formats";
import { isAppTimeFormat } from "./time-formats";
import type { AppLocale, AppTimezone, AppTimeFormat, AppDateFormat } from "./types";

const DEFAULT_STORAGE_KEY = "godxjp.app";

export type StoredAppPreferences = {
  locale?: AppLocale;
  timezone?: AppTimezone;
  timeFormat?: AppTimeFormat;
  dateFormat?: AppDateFormat;
};

export function readStoredPreferences(storageKey: string): StoredAppPreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredAppPreferences;
    return {
      locale: isAppLocale(parsed.locale) ? parsed.locale : undefined,
      timezone: typeof parsed.timezone === "string" ? parsed.timezone : undefined,
      timeFormat: isAppTimeFormat(parsed.timeFormat) ? parsed.timeFormat : undefined,
      dateFormat: isAppDateFormat(parsed.dateFormat) ? parsed.dateFormat : undefined,
    };
  } catch {
    return {};
  }
}

export function writeStoredPreferences(
  storageKey: string,
  preferences: StoredAppPreferences,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
  } catch {
    // Quota or private mode — ignore.
  }
}

export { DEFAULT_STORAGE_KEY };
