import type { AppLocale } from "../app/types";
import en from "./messages/en.json";
import ja from "./messages/ja.json";
import vi from "./messages/vi.json";

export type Messages = typeof vi;

export const MESSAGE_CATALOG: Record<AppLocale, Messages> = {
  vi,
  en,
  ja,
};

export type MessageKey = string;

export type TranslateParams = Record<string, string | number>;

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

/** Resolve a dot-path message with fallback locale chain. */
export function translate(
  locale: AppLocale,
  fallbackLocale: AppLocale,
  key: MessageKey,
  params?: TranslateParams,
): string {
  const primary = getNested(MESSAGE_CATALOG[locale], key);
  const fallback = getNested(MESSAGE_CATALOG[fallbackLocale], key);
  const text = primary ?? fallback ?? key;
  return interpolate(text, params);
}

/** Non-React translate using module-synced locale (see `syncI18nLocale`). */
export function translateCurrent(key: MessageKey, params?: TranslateParams): string {
  return translate(getSyncedLocale(), getSyncedFallbackLocale(), key, params);
}

let syncedLocale: AppLocale = "vi";
let syncedFallbackLocale: AppLocale = "en";

export function syncI18nLocale(locale: AppLocale, fallbackLocale: AppLocale): void {
  syncedLocale = locale;
  syncedFallbackLocale = fallbackLocale;
}

export function getSyncedLocale(): AppLocale {
  return syncedLocale;
}

export function getSyncedFallbackLocale(): AppLocale {
  return syncedFallbackLocale;
}

/** Reset for tests. */
export function resetI18nLocale(): void {
  syncedLocale = "vi";
  syncedFallbackLocale = "en";
}
