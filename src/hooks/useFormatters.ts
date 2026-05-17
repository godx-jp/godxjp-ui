// React hook — locale + timezone-bound formatter surface.
//
// Reads from `<GodxConfigProvider>` so components re-render when the
// active locale or timezone changes. Returns a memoised object whose
// methods always resolve to the current context values.
//
// Mirrors the surface of `src/i18n/format.ts` + `src/i18n/relative.ts`
// — the non-React calls accept explicit `{ locale, timezone }` opts;
// the hook fills them in from context.

import { useMemo, useSyncExternalStore } from "react";
import { getGodxConfig, subscribeGodxConfig } from "../preferences/holder";
import {
  formatCurrency as fnFormatCurrency,
  formatDate as fnFormatDate,
  formatDateTime as fnFormatDateTime,
  formatNumber as fnFormatNumber,
  formatTime as fnFormatTime,
  type DateLike,
  type FormatCurrencyOptions,
  type FormatDateOptions,
  type FormatNumberOptions,
} from "../i18n/format";
import {
  formatRelative as fnFormatRelative,
  type RelativeOptions,
} from "../i18n/relative";

export interface Formatters {
  /** Active locale (BCP 47). */
  locale: string;
  /** Active IANA timezone. */
  timezone: string;
  formatDate: (value: DateLike, opts?: Omit<FormatDateOptions, "locale" | "timezone">) => string;
  formatTime: (value: DateLike, opts?: Omit<FormatDateOptions, "locale" | "timezone">) => string;
  formatDateTime: (value: DateLike, opts?: Omit<FormatDateOptions, "locale" | "timezone">) => string;
  formatRelative: (value: DateLike, opts?: Omit<RelativeOptions, "locale">) => string;
  formatNumber: (value: number, opts?: Omit<FormatNumberOptions, "locale">) => string;
  formatCurrency: (value: number, opts: Omit<FormatCurrencyOptions, "locale">) => string;
}

export function useFormatters(): Formatters {
  // Subscribes to the module-level holder so this hook also works when
  // no `<GodxConfigProvider>` is mounted (e.g. isolated Storybook
  // renders). The holder's initial value matches the provider's
  // initial value — locale/timezone fall through `Intl` defaults.
  const { locale, timezone } = useSyncExternalStore(
    subscribeGodxConfig,
    getGodxConfig,
    getGodxConfig,
  );

  return useMemo<Formatters>(
    () => ({
      locale,
      timezone,
      formatDate: (value, opts) => fnFormatDate(value, { ...opts, locale, timezone }),
      formatTime: (value, opts) => fnFormatTime(value, { ...opts, locale, timezone }),
      formatDateTime: (value, opts) =>
        fnFormatDateTime(value, { ...opts, locale, timezone }),
      formatRelative: (value, opts) => fnFormatRelative(value, { ...opts, locale }),
      formatNumber: (value, opts) => fnFormatNumber(value, { ...opts, locale }),
      formatCurrency: (value, opts) =>
        fnFormatCurrency(value, { ...opts, locale }),
    }),
    [locale, timezone],
  );
}
