import type { AppLocale } from "../app/types";
import en from "./messages/en.json";
import ja from "./messages/ja.json";
import vi from "./messages/vi.json";

export type Messages = typeof vi;

// Values may be plain strings or CLDR plural-category maps (e.g. en `pagination.total`), so the
// catalog is typed loosely; `getNested` narrows each leaf to a string or category map at read time.
export const MESSAGE_CATALOG: Record<AppLocale, Record<string, unknown>> = {
  vi,
  en,
  ja,
};

export type MessageKey = string;

/**
 * The top-level namespaces THIS PACKAGE ships, captured once at module load.
 *
 * Frozen at load rather than read live, because after the first `registerMessages` call an
 * application's own namespace is in the catalog too — a live check would then reject that
 * application's SECOND call for colliding with its own first one. Measured exactly that way: two
 * calls under one namespace, the second refused.
 */
const LIBRARY_NAMESPACES: ReadonlySet<string> = new Set(
  Object.values(MESSAGE_CATALOG).flatMap((messages) => Object.keys(messages)),
);

/**
 * ADD AN APPLICATION'S OWN STRINGS TO THE LIBRARY'S CATALOG.
 *
 * The catalog used to be closed: `MESSAGE_CATALOG` was exported but there was no way to extend it,
 * so an application had to run a SECOND translation system beside this one — two lookups, two
 * fallback chains, and two places a missing key can hide. That is a real cost for a product whose
 * pages mix library chrome and application copy in the same sentence.
 *
 * MERGES, never replaces: a partial tree is layered onto what is already there, so registering
 * `{ myApp: { title: "…" } }` cannot delete `dataEntry.calendar.today`. Registering the same key
 * twice is last-write-wins, which is what a hot reload needs and what a second call with corrected
 * copy expects.
 *
 * A LIBRARY KEY CANNOT BE SILENTLY REPLACED. Overwriting `dataEntry.*` or any other namespace this
 * package ships would let one application change what a shared component says — invisibly, from a
 * distance, and only in the build where that call ran. Reach for the component's own labels prop
 * instead; every string this library renders has one.
 */
export function registerMessages(
  locale: AppLocale,
  messages: Record<string, unknown>,
): void {
  const reserved = [...LIBRARY_NAMESPACES].filter((key) => Object.hasOwn(messages, key));

  if (reserved.length > 0) {
    throw new Error(
      `@godxjp/ui i18n: [${reserved.join(", ")}] ${reserved.length === 1 ? "is a" : "are"} reserved ` +
        "top-level namespace(s) owned by the library. Register your strings under a namespace of " +
        "your own, and change what a component says through its `labels` prop.",
    );
  }

  MESSAGE_CATALOG[locale] = mergeDeep(MESSAGE_CATALOG[locale] ?? {}, messages);
}

/** Layer `source` onto `target` without dropping branches `source` does not mention. */
function mergeDeep(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...target };

  for (const [key, value] of Object.entries(source)) {
    const existing = merged[key];
    merged[key] =
      isPlainObject(existing) && isPlainObject(value) ? mergeDeep(existing, value) : value;
  }

  return merged;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type TranslateParams = Record<string, string | number>;

/**
 * A message value is either a plain string or a CLDR plural-category map (`{ one?, two?, few?,
 * many?, other }`) selected via `Intl.PluralRules`. Only locales that inflect (e.g.
 */
type MessageValue = string | Partial<Record<Intl.LDMLPluralRule, string>>;

function getNested(obj: Record<string, unknown>, path: string): MessageValue | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === "string") return current;
  if (current != null && typeof current === "object") {
    return current as Partial<Record<Intl.LDMLPluralRule, string>>;
  }
  return undefined;
}

/** The number that drives plural selection: an explicit `count`, else the first numeric param. */
function pluralCount(params?: TranslateParams): number | undefined {
  if (!params) return undefined;
  if (typeof params.count === "number") return params.count;
  for (const value of Object.values(params)) {
    if (typeof value === "number") return value;
  }
  return undefined;
}

/** Resolve a plain-or-category message to a concrete template for the active locale + count. */
function selectPlural(value: MessageValue, locale: AppLocale, params?: TranslateParams): string {
  if (typeof value === "string") return value;
  const count = pluralCount(params);
  if (count === undefined) {
    return value.other ?? Object.values(value)[0] ?? "";
  }
  const category = new Intl.PluralRules(locale).select(count);
  return value[category] ?? value.other ?? Object.values(value)[0] ?? "";
}

/** Replace `{param}` tokens; numbers are grouped/decimal-formatted via `Intl.NumberFormat`. */
function interpolate(template: string, locale: AppLocale, params?: TranslateParams): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (text, [key, value]) =>
      text.replaceAll(
        `{${key}}`,
        typeof value === "number" ? new Intl.NumberFormat(locale).format(value) : String(value),
      ),
    template,
  );
}

/** Resolve a dot-path message with fallback locale chain, CLDR plurals, and locale number formatting. */
export function translate(
  locale: AppLocale,
  fallbackLocale: AppLocale,
  key: MessageKey,
  params?: TranslateParams,
): string {
  const primary = getNested(MESSAGE_CATALOG[locale], key);
  const fallback = getNested(MESSAGE_CATALOG[fallbackLocale], key);
  const value = primary ?? fallback ?? key;
  return interpolate(selectPlural(value, locale, params), locale, params);
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
