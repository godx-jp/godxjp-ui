// @godxjp/ui — i18n bootstrap.
//
// Locale resolution order:
//   1. localStorage["godx.locale"]   (user override via Tweaks panel)
//   2. navigator.language prefix     (ja-JP → ja, en-US → en, vi-VN → vi)
//   3. JA fallback                   (design's primary locale)
//
// Supported locales: ja / en / vi / fil (required by new-docs/12 §6).
// Services may add extra locales via `i18n.addResourceBundle` — never
// replace the base set.
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ja from "./locales/ja";
import en from "./locales/en";
import vi from "./locales/vi";
import fil from "./locales/fil";

export const SUPPORTED_LOCALES = ["ja", "en", "vi", "fil"] as const;
/** @deprecated Use GodxLocale instead. */
export type ForgeLocale = (typeof SUPPORTED_LOCALES)[number];
export type GodxLocale = (typeof SUPPORTED_LOCALES)[number];

export const GODX_LOCALE_STORAGE_KEY = "godx.locale";
/** @deprecated Use GODX_LOCALE_STORAGE_KEY instead. */
export const FORGE_LOCALE_STORAGE_KEY = GODX_LOCALE_STORAGE_KEY;

export function initI18n(): typeof i18next {
  void i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        ja: { translation: ja },
        en: { translation: en },
        vi: { translation: vi },
        fil: { translation: fil },
      },
      fallbackLng: "ja",
      supportedLngs: SUPPORTED_LOCALES,
      load: "languageOnly",
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: GODX_LOCALE_STORAGE_KEY,
        caches: ["localStorage"],
      },
    });
  return i18next;
}

export default i18next;
