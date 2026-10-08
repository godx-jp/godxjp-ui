import type { DayPickerProps } from "react-day-picker";
import { useMemo } from "react";
import { useOptionalAppContext } from "../app/app-provider";
import { getDateFnsLocale, getDayPickerLocale } from "../app/locales";
import { resolveHydrationSafeTimezone } from "../app/timezones";
import { resolveDefaultDateFormat } from "../app/date-format-labels";
import { resolveDefaultTimeFormat } from "../app/time-format-labels";
import { isDevelopment } from "../lib/dev";
import {
  getSyncedFallbackLocale,
  getSyncedLocale,
  isI18nLocaleSynced,
  translate,
  type MessageKey,
  type TranslateParams,
} from "./translate";

/*
 * WITHOUT AN AppProvider (gh#1005). The kit's own strings — a dialog's 閉じる, an upload's 削除, a
 * ListRow's unread badge — used to fall to a hard-coded "vi" here, while `syncI18nLocale` (the
 * non-React path) was ignored. Measured in godx-mailer: Vietnamese buttons in a Japanese UI, with
 * no warning of any kind. Now the React path reads the same module locale `syncI18nLocale` sets,
 * and a development build says ONCE, the first time it happens, that nothing chose it.
 */
let warnedOutsideProvider = false;
function warnOutsideProvider(locale: string): void {
  if (warnedOutsideProvider || !isDevelopment() || isI18nLocaleSynced()) return;
  warnedOutsideProvider = true;
  console.warn(
    `[@godxjp/ui] A kit component rendered outside <AppProvider>, so its built-in strings ` +
      `(close/cancel/delete labels, counters, pickers) use the resting locale "${locale}" — ` +
      `nothing chose it. Wrap the app in <AppProvider defaultLocale="…"> (docs/CONSUMER-RULES.md), or ` +
      `call syncI18nLocale(locale, fallback) at startup if you truly cannot. Shown once.`,
  );
}

/** Test seam: the once-only warning is module state. */
export function resetOutsideProviderWarningForTests(): void {
  warnedOutsideProvider = false;
}

type DayPickerLocale = NonNullable<DayPickerProps["locale"]>;

export function useTranslation() {
  const ctx = useOptionalAppContext();
  const locale = ctx?.locale ?? getSyncedLocale();
  const fallbackLocale = ctx?.fallbackLocale ?? getSyncedFallbackLocale();
  if (!ctx) warnOutsideProvider(locale);

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
  const locale = ctx?.locale ?? getSyncedLocale();
  if (!ctx) warnOutsideProvider(locale);

  return useMemo(
    () => ({
      locale,
      // AppProvider's own unconfigured answer (gh#968) — a zone that looks right when it is wrong
      // (Asia/Ho_Chi_Minh) is worse than one that is visibly not local.
      timezone: ctx?.timezone ?? resolveHydrationSafeTimezone("browser"),
      timeFormat: ctx?.timeFormat ?? resolveDefaultTimeFormat(locale),
      dateFormat: ctx?.dateFormat ?? resolveDefaultDateFormat(locale),
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
