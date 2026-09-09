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

/**
 * The axes a viewer's preferences are made of — the keys of {@link StoredAppPreferences}.
 *
 * They do NOT share an owner. `theme`, `density`, `fontSize`, `scaling` and `brand` are the
 * viewer's, and belong in this browser. `locale`, `timezone`, `timeFormat` and `dateFormat` are
 * frequently the SERVER's — resolved per request from a cookie, an account row or an Accept-Language
 * header — and a copy in local storage then wins over the value the server just sent, because
 * storage is read after the props. That is why `persist` takes a LIST as well as a boolean: one
 * flag for axes with two different owners forces an all-or-nothing choice, and the consumer that
 * hits it turns persistence off entirely and loses the viewer's theme with it.
 */
export const APP_PREFERENCE_AXES = [
  "locale",
  "timezone",
  "timeFormat",
  "dateFormat",
  "theme",
  "brand",
  "density",
  "fontSize",
  "scaling",
] as const;

export type AppPreferenceAxis = (typeof APP_PREFERENCE_AXES)[number];

/** `true` → every axis, `false` → none, a list → exactly those. */
export function resolvePersistedAxes(
  persist: boolean | readonly AppPreferenceAxis[],
): ReadonlySet<AppPreferenceAxis> {
  if (persist === true) return new Set(APP_PREFERENCE_AXES);
  if (persist === false) return new Set();
  return new Set(persist);
}

/** The subset of `preferences` on the given axes; the rest are dropped, not set to undefined. */
export function pickPersistedAxes(
  preferences: StoredAppPreferences,
  axes: ReadonlySet<AppPreferenceAxis>,
): StoredAppPreferences {
  const out: StoredAppPreferences = {};
  for (const axis of APP_PREFERENCE_AXES) {
    if (axes.has(axis) && preferences[axis] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (out as any)[axis] = preferences[axis];
    }
  }
  return out;
}

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
