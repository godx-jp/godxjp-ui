import { isAppLocale } from "./locales";
import { isAppDateFormat } from "./date-formats";
import { isAppTimeFormat } from "./time-formats";
import {
  isAppBrand,
  isAppDensity,
  isAppFontSize,
  isAppTheme,
  type AppBrand,
  type AppDensity,
  type AppFontSize,
  type AppTheme,
} from "./theme-axes";
import type { AppLocale, AppTimezone, AppTimeFormat, AppDateFormat } from "./types";

const DEFAULT_STORAGE_KEY = "godxjp.app";

export type StoredAppPreferences = {
  locale?: AppLocale;
  timezone?: AppTimezone;
  timeFormat?: AppTimeFormat;
  dateFormat?: AppDateFormat;
  theme?: AppTheme;
  /** `null` = explicit opt-out (keep app token); on read, null/invalid → undefined. */
  brand?: AppBrand | null;
  density?: AppDensity;
  fontSize?: AppFontSize;
  /** Continuous global size multiplier; `null` defers to the density preset. */
  scaling?: number | null;
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
      theme: isAppTheme(parsed.theme) ? parsed.theme : undefined,
      brand: isAppBrand(parsed.brand) ? parsed.brand : undefined,
      density: isAppDensity(parsed.density) ? parsed.density : undefined,
      fontSize: isAppFontSize(parsed.fontSize) ? parsed.fontSize : undefined,
      scaling:
        typeof parsed.scaling === "number" && Number.isFinite(parsed.scaling)
          ? parsed.scaling
          : undefined,
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
