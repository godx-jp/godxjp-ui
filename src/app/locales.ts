import type { Locale } from "date-fns";
import { enUS, ja, vi } from "date-fns/locale";
import {
  enUS as enUSDayPicker,
  ja as jaDayPicker,
  vi as viDayPicker,
} from "react-day-picker/locale";
import type { AppLocale } from "./types";

export type AppLocaleConfig = {
  code: AppLocale;
  dateFns: Locale;
  dayPicker: typeof viDayPicker;
};

export const APP_LOCALE_CONFIG: Record<AppLocale, AppLocaleConfig> = {
  vi: { code: "vi", dateFns: vi, dayPicker: viDayPicker },
  en: { code: "en", dateFns: enUS, dayPicker: enUSDayPicker },
  ja: { code: "ja", dateFns: ja, dayPicker: jaDayPicker },
};

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === "vi" || value === "en" || value === "ja";
}

export function getDateFnsLocale(locale: AppLocale): Locale {
  return APP_LOCALE_CONFIG[locale].dateFns;
}

export function getDayPickerLocale(locale: AppLocale) {
  return APP_LOCALE_CONFIG[locale].dayPicker;
}
