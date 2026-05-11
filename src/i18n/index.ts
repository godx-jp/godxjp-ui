// GoDX Forge i18n bootstrap.
//
// Locale resolution order:
//   1. localStorage["forge.locale"]  (user override via Tweaks panel)
//   2. navigator.language prefix      (ja-JP → ja, en-US → en, vi-VN → vi)
//   3. JA fallback                    (design's primary locale)
//
// Supported locales follow the design prototype (chats + ui-kit.jsx): ja / en / vi.
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ja from "./locales/ja";
import en from "./locales/en";
import vi from "./locales/vi";

export const SUPPORTED_LOCALES = ["ja", "en", "vi"] as const;
export type ForgeLocale = (typeof SUPPORTED_LOCALES)[number];

export const FORGE_LOCALE_STORAGE_KEY = "forge.locale";

export function initI18n(): typeof i18next {
  void i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        ja: { translation: ja },
        en: { translation: en },
        vi: { translation: vi },
      },
      fallbackLng: "ja",
      supportedLngs: SUPPORTED_LOCALES,
      load: "languageOnly",
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: FORGE_LOCALE_STORAGE_KEY,
        caches: ["localStorage"],
      },
    });
  return i18next;
}

export default i18next;
