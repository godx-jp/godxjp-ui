import { translate } from "../i18n/translate";
import type { AppLocale } from "./types";

/** Curated preset — pass to `<AppProvider timezoneOptions={APP_TIMEZONE_PRESET} />`. */
export const APP_TIMEZONE_PRESET = [
  "UTC",
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Jakarta",
  "Asia/Manila",
  "Asia/Kuala_Lumpur",
  "Asia/Yangon",
  "Asia/Phnom_Penh",
  "Asia/Vientiane",
  "Asia/Brunei",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Taipei",
  "Asia/Ulaanbaatar",
  "Asia/Kolkata",
  "Asia/Karachi",
  "Asia/Dhaka",
  "Asia/Colombo",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Qatar",
  "Asia/Tehran",
  "Asia/Jerusalem",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Moscow",
  "Europe/Istanbul",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Perth",
  "Pacific/Auckland",
] as const;

/** @deprecated Use `APP_TIMEZONE_PRESET` or `getAllIanaTimezones()`. */
export const APP_TIMEZONE_OPTIONS = APP_TIMEZONE_PRESET;

export type AppTimezonePreset = (typeof APP_TIMEZONE_PRESET)[number];

/**
 * Preferred IANA ids not returned by all runtimes (e.g. Node lists `Asia/Saigon` only).
 * Keys are app-facing ids; values are Intl-canonical ids for offset lookup.
 */
export const TIMEZONE_ALIASES: Record<string, string> = {
  "Asia/Ho_Chi_Minh": "Asia/Saigon",
};

const PREFERRED_TIMEZONE_IDS = Object.keys(TIMEZONE_ALIASES);

/** Map app id → Intl id for `DateTimeFormat` / validation. */
export function resolveTimezoneForIntl(timezone: string): string {
  return TIMEZONE_ALIASES[timezone] ?? timezone;
}

/** Minimal fallback when `Intl.supportedValuesOf("timeZone")` is unavailable. */
const FALLBACK_IANA_TIMEZONES = [...APP_TIMEZONE_PRESET] as const;

let cachedAllTimezones: readonly string[] | null = null;
let cachedTimezoneSet: ReadonlySet<string> | null = null;

function enrichTimezoneList(base: readonly string[]): readonly string[] {
  const set = new Set(base);
  for (const preferred of PREFERRED_TIMEZONE_IDS) {
    if (!set.has(preferred)) {
      const canonical = TIMEZONE_ALIASES[preferred];
      if (!canonical || set.has(canonical)) set.add(preferred);
    }
  }
  return [...set].sort();
}

/** Full IANA list from runtime — sorted lexicographically. */
export function getAllIanaTimezones(): readonly string[] {
  if (cachedAllTimezones) return cachedAllTimezones;

  try {
    const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
    if (typeof intl.supportedValuesOf === "function") {
      cachedAllTimezones = enrichTimezoneList(intl.supportedValuesOf("timeZone").slice().sort());
      return cachedAllTimezones;
    }
  } catch {
    /* use fallback */
  }

  cachedAllTimezones = FALLBACK_IANA_TIMEZONES;
  return cachedAllTimezones;
}

function getIanaTimezoneSet(): ReadonlySet<string> {
  cachedTimezoneSet ??= new Set(getAllIanaTimezones());
  return cachedTimezoneSet;
}

export function isValidIanaTimezone(value: string): boolean {
  const set = getIanaTimezoneSet();
  if (set.has(value)) return true;
  const canonical = TIMEZONE_ALIASES[value];
  return canonical ? set.has(canonical) : false;
}

/** @deprecated Use `isValidIanaTimezone`. */
export function isKnownAppTimezone(value: string): value is AppTimezonePreset {
  return (APP_TIMEZONE_PRESET as readonly string[]).includes(value);
}

/**
 * Options for TimezonePicker.
 * - `configured` omitted/empty → full IANA list
 * - `configured` set → only those ids (+ `current` if missing)
 */
export function resolveTimezonePickerOptions(
  configured?: readonly string[] | null,
  current?: string,
): readonly string[] {
  const base = configured && configured.length > 0 ? [...configured] : [...getAllIanaTimezones()];

  if (current && !base.includes(current)) {
    return [current, ...base];
  }

  return base;
}

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

/** City/region segment from IANA id — `Asia/Ho_Chi_Minh` → `Ho Chi Minh`. */
export function getTimezoneCityName(timezone: string): string {
  const segment = timezone.split("/").pop();
  if (!segment) return timezone;
  return segment.replace(/_/g, " ");
}

/** UTC/GMT offset via Intl — e.g. `GMT+7`, `UTC`. */
export function getTimezoneOffsetLabel(timezone: string, locale: AppLocale = "en"): string {
  if (timezone === "UTC") return "UTC";
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone: resolveTimezoneForIntl(timezone),
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

/** Intl fallback when no i18n override — `Ho Chi Minh (GMT+7)`. */
export function formatTimezoneDisplayLabel(timezone: string, locale: AppLocale = "en"): string {
  const city = getTimezoneCityName(timezone);
  const offset = getTimezoneOffsetLabel(timezone, locale);
  return offset ? `${city} (${offset})` : city;
}

export function getTimezoneLabel(
  timezone: string,
  locale: AppLocale,
  fallbackLocale: AppLocale = "en",
): string {
  const key = `timezone.${timezone}`;
  const translated = translate(locale, fallbackLocale, key);
  if (translated !== key) return translated;

  const offset = getTimezoneOffsetLabel(timezone, locale);
  const city = getTimezoneCityName(timezone);
  return offset ? `${city} (${offset})` : city;
}

export function resolveDefaultTimezone(
  defaultTimezone: "browser" | "system" | (string & {}),
  systemTimezone?: string,
): string {
  if (defaultTimezone === "browser") return getBrowserTimezone();
  if (defaultTimezone === "system") return systemTimezone ?? "UTC";
  return defaultTimezone;
}

/** Vitest only — reset cached IANA list between cases. */
export function resetIanaTimezoneCacheForTests(): void {
  cachedAllTimezones = null;
  cachedTimezoneSet = null;
}
