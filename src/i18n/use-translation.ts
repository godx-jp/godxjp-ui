import type { DayPickerProps } from "react-day-picker";
import { useMemo } from "react";
import { useOptionalAppContext } from "../app/app-provider";
import { getDateFnsLocale, getDayPickerLocale } from "../app/locales";
import type { AppLocale } from "../app/types";
import { translate, type MessageKey, type TranslateParams } from "./translate";

const DEFAULT_LOCALE: AppLocale = "vi";
const DEFAULT_FALLBACK: AppLocale = "en";

type DayPickerLocale = NonNullable<DayPickerProps["locale"]>;

export function useTranslation() {
  const ctx = useOptionalAppContext();
  const locale = ctx?.locale ?? DEFAULT_LOCALE;
  const fallbackLocale = ctx?.fallbackLocale ?? DEFAULT_FALLBACK;

  return useMemo(
    () => ({
      locale,
      fallbackLocale,
      t: (key: MessageKey, params?: TranslateParams) =>
        translate(locale, fallbackLocale, key, params),
    }),
    [locale, fallbackLocale],
  );
}

/** date-fns + react-day-picker locales + datetime prefs from AppProvider. */
export function usePickerLocales(dayPickerOverride?: DayPickerLocale) {
  const ctx = useOptionalAppContext();
  const locale = ctx?.locale ?? DEFAULT_LOCALE;

  return useMemo(
    () => ({
      locale,
      timezone: ctx?.timezone ?? "Asia/Ho_Chi_Minh",
      timeFormat: ctx?.timeFormat ?? "24h",
      dateFormat: ctx?.dateFormat ?? "dmy",
      dateFnsLocale: ctx?.dateFnsLocale ?? getDateFnsLocale(locale),
      dayPickerLocale: dayPickerOverride ?? ctx?.dayPickerLocale ?? getDayPickerLocale(locale),
    }),
    [
      ctx?.dateFnsLocale,
      ctx?.dayPickerLocale,
      ctx?.timeFormat,
      ctx?.dateFormat,
      ctx?.timezone,
      dayPickerOverride,
      locale,
    ],
  );
}
