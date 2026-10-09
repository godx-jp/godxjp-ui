import type { FormatLongWidth, LocalizeFnOptions, Locale } from "date-fns";
import { enUS, ja, vi } from "date-fns/locale";
import {
  enUS as enUSDayPicker,
  ja as jaDayPicker,
  vi as viDayPicker,
} from "react-day-picker/locale";
import { registerLocaleMessages } from "../i18n/translate";
import {
  canonicalLocaleTag,
  getRegisteredLocales,
  isBuiltInLocale,
  markLocaleRegistered,
  resolveDefaultLocale,
  resolveRegisteredLocale,
  warnUnknownLocale,
} from "../i18n/locale-tags";
import { dateTimeFormat } from "../lib/intl-cache";
import { intlDatePattern } from "./date-formats";
import type { AppLocale, BuiltInLocale } from "./types";

export {
  getRegisteredLocales,
  resolveRegisteredLocale,
  resolveDefaultLocale,
  resolvePageLocale,
} from "../i18n/locale-tags";

/** A react-day-picker locale: a date-fns `Locale` plus optional `labels`. */
export type DayPickerLocale = typeof viDayPicker;

export type AppLocaleConfig = {
  code: AppLocale;
  dateFns: Locale;
  dayPicker: DayPickerLocale;
};

/**
 * What `registerLocale` takes. Only `code` is required: without `dateFns` the date adapter is built
 * from `Intl` (month/weekday names, long date patterns, week start), and without `dayPicker` the
 * calendar uses that same adapter.
 */
export type RegisterLocaleInput = {
  /** Any BCP-47 tag — `de`, `pt-BR`, `en-GB`, `ar`. Canonicalised (`pt-br` → `pt-BR`). */
  code: string;
  /** This locale's strings. For a locale the library does not ship, its own namespaces too. */
  messages?: Record<string, unknown>;
  /** A date-fns locale (`import { de } from "date-fns/locale"`). */
  dateFns?: Locale;
  /** A react-day-picker locale (`import { de } from "react-day-picker/locale"`). */
  dayPicker?: DayPickerLocale;
};

/** CLDR `weekData.firstDay` for regions that do not start on Monday — the engine-less fallback. */
const SUNDAY_FIRST =
  "AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW";
const SATURDAY_FIRST = "AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY";

type WeekInfo = { firstDay: number; minimalDays?: number };

function intlWeekInfo(code: string): WeekInfo | undefined {
  try {
    const locale = new Intl.Locale(code) as Intl.Locale & {
      getWeekInfo?: () => WeekInfo;
      weekInfo?: WeekInfo;
    };
    return locale.getWeekInfo?.() ?? locale.weekInfo;
  } catch {
    return undefined;
  }
}

/**
 * First day of the week for `code`, as date-fns counts it (0 = Sunday … 6 = Saturday).
 *
 * From `Intl.Locale#getWeekInfo` (or the older `.weekInfo` getter) where the engine has it; else
 * the pack's own `weekStartsOn`; else the region's CLDR first day, Monday (ISO 8601) by default.
 */
export function getLocaleWeekStart(
  code: string,
  pack?: Pick<Locale, "options">,
): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const info = intlWeekInfo(code);
  if (info) return (info.firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const fromPack = pack?.options?.weekStartsOn;
  if (fromPack !== undefined) return fromPack;
  let region = "";
  try {
    region = new Intl.Locale(code).maximize().region ?? "";
  } catch {
    /* keep Monday */
  }
  if (region && SUNDAY_FIRST.split(" ").includes(region)) return 0;
  if (region && SATURDAY_FIRST.split(" ").includes(region)) return 6;
  return 1;
}

/** The pack with `Intl`'s week start — the SAME object when they already agree. */
function withIntlWeekStart<T extends Locale>(code: string, pack: T): T {
  const weekStartsOn = getLocaleWeekStart(code, pack);
  if (pack.options?.weekStartsOn === weekStartsOn) return pack;
  return { ...pack, options: { ...pack.options, weekStartsOn } };
}

type Width = NonNullable<LocalizeFnOptions["width"]>;
const INTL_WIDTH: Record<Width, "narrow" | "short" | "long"> = {
  narrow: "narrow",
  short: "short",
  abbreviated: "short",
  wide: "long",
  any: "long",
};

/** `Intl` options behind date-fns' `P` / `PP` / `PPP` / `PPPP` widths. */
const LONG_DATE: Record<FormatLongWidth, Intl.DateTimeFormatOptions> = {
  full: { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  long: { year: "numeric", month: "long", day: "numeric" },
  medium: { year: "numeric", month: "short", day: "numeric" },
  short: { year: "numeric", month: "2-digit", day: "2-digit" },
  any: { year: "numeric", month: "long", day: "numeric" },
};

/** A date-fns locale for a tag with no date-fns pack: names, long patterns and week from `Intl`. */
function intlDateFnsLocale(code: string): Locale {
  const name = (options: Intl.DateTimeFormatOptions, date: Date) =>
    dateTimeFormat(code, { ...options, timeZone: "UTC" }).format(date);
  const width = (options?: LocalizeFnOptions) => INTL_WIDTH[options?.width ?? "wide"];
  const info = intlWeekInfo(code);
  return {
    ...enUS,
    code,
    localize: {
      ...enUS.localize,
      // 2017-01-01 was a Sunday, so day `n` of that week is weekday `n` in date-fns' numbering.
      month: (n, options) => name({ month: width(options) }, new Date(Date.UTC(2017, n, 1))),
      day: (n, options) => name({ weekday: width(options) }, new Date(Date.UTC(2017, 0, 1 + n))),
    },
    formatLong: {
      ...enUS.formatLong,
      date: ({ width: w = "full" }: { width?: FormatLongWidth } = {}) =>
        intlDatePattern(code, LONG_DATE[w]) ?? enUS.formatLong.date({ width: w }),
    },
    options: {
      weekStartsOn: getLocaleWeekStart(code),
      firstWeekContainsDate: info?.minimalDays === 4 ? 4 : 1,
    },
  };
}

/**
 * Every registered locale's date adapters. `vi`, `en` and `ja` are pre-registered with the packs
 * they always had; `registerLocale` adds the rest. Exported for compatibility — read it through
 * `getDateFnsLocale` / `getDayPickerLocale`, which also handle an unregistered tag.
 */
export const APP_LOCALE_CONFIG: Record<string, AppLocaleConfig> = {};

function storeConfig(code: string, dateFns: Locale, dayPicker: DayPickerLocale): AppLocaleConfig {
  const config: AppLocaleConfig = {
    code,
    dateFns: withIntlWeekStart(code, dateFns),
    dayPicker: withIntlWeekStart(code, dayPicker),
  };
  APP_LOCALE_CONFIG[code] = config;
  return config;
}

storeConfig("vi", vi, viDayPicker);
storeConfig("en", enUS, enUSDayPicker);
storeConfig("ja", ja, jaDayPicker);

/** The three locales the library ships packs for. */
export const BUILT_IN_LOCALES = ["vi", "en", "ja"] as const satisfies readonly BuiltInLocale[];

/**
 * REGISTER A LOCALE — any BCP-47 tag (v32, gh#1219).
 *
 * The locale set used to be a closed union of three, so a German or Brazilian app could not get
 * German dates or a Monday/Sunday week from this package at all. Register once at startup, before
 * the first render:
 *
 * ```ts
 * import { de } from "date-fns/locale";
 * import { de as deDayPicker } from "react-day-picker/locale";
 * registerLocale({ code: "de", messages: deMessages, dateFns: de, dayPicker: deDayPicker });
 * ```
 *
 * Registering an already-registered tag updates it (messages merge; adapters given replace).
 * Returns the canonical tag.
 */
export function registerLocale(input: RegisterLocaleInput): AppLocale {
  const code = canonicalLocaleTag(input.code);
  const existing = APP_LOCALE_CONFIG[code];
  const dateFns = input.dateFns ?? existing?.dateFns ?? intlDateFnsLocale(code);
  const dayPicker = input.dayPicker ?? existing?.dayPicker ?? (dateFns as DayPickerLocale);
  storeConfig(code, dateFns, dayPicker);
  markLocaleRegistered(code);
  registerLocaleMessages(code, input.messages ?? {}, !isBuiltInLocale(code));
  return code;
}

/** Whether `value` is a REGISTERED locale tag (exactly, after canonicalisation). */
export function isAppLocale(value: string | null | undefined): value is AppLocale {
  if (!value) return false;
  try {
    return getRegisteredLocales().includes(canonicalLocaleTag(value));
  } catch {
    return false;
  }
}

/**
 * The registered locale that serves `tag` (`de-AT` → `de`), or — with one development warning —
 * the default locale (`<html lang>` if registered, else `en`).
 */
export function normalizeAppLocale(tag: string | null | undefined): AppLocale {
  const resolved = resolveRegisteredLocale(tag);
  if (resolved) return resolved;
  const fallback = resolveDefaultLocale();
  if (tag) warnUnknownLocale(tag, fallback);
  return fallback;
}

function configFor(locale: AppLocale): AppLocaleConfig {
  return (
    APP_LOCALE_CONFIG[locale] ??
    APP_LOCALE_CONFIG[normalizeAppLocale(locale)] ??
    (APP_LOCALE_CONFIG.en as AppLocaleConfig)
  );
}

export function getDateFnsLocale(locale: AppLocale): Locale {
  return configFor(locale).dateFns;
}

export function getDayPickerLocale(locale: AppLocale): DayPickerLocale {
  return configFor(locale).dayPicker;
}
