import { isDevelopment } from "../lib/dev";

/**
 * WHICH BCP-47 TAGS THIS RUNTIME CAN SPEAK, and how an arbitrary tag maps onto one of them (v32,
 * gh#1219). A dependency-free leaf, so `i18n/translate` and `app/locales` can both read it without
 * importing each other.
 *
 * `vi`, `en` and `ja` are registered from the start (the library ships their packs); everything
 * else arrives through `registerLocale`.
 */
const BUILT_IN = ["vi", "en", "ja"] as const;
const registered = new Set<string>(BUILT_IN);

/** The tags the library ships its own catalog for — their library namespaces are reserved. */
export function isBuiltInLocale(tag: string): boolean {
  return (BUILT_IN as readonly string[]).includes(tag);
}

/** `pt-br` → `pt-BR`. Throws `RangeError` on a string that is not a well-formed BCP-47 tag. */
export function canonicalLocaleTag(tag: string): string {
  return Intl.getCanonicalLocales(tag)[0] ?? tag;
}

/** @internal Called by `registerLocale` only. */
export function markLocaleRegistered(tag: string): void {
  registered.add(tag);
}

export function getRegisteredLocales(): readonly string[] {
  return [...registered];
}

/**
 * The registered tag that serves `tag`, by BCP-47 lookup (RFC 4647 §3.4): the exact tag first,
 * then the tag with its last subtag removed, and so on — `de-AT` is served by `de`, `ja-JP` by
 * `ja`. `undefined` when nothing registered matches.
 */
export function resolveRegisteredLocale(tag: string | null | undefined): string | undefined {
  if (!tag) return undefined;
  let candidate: string;
  try {
    candidate = canonicalLocaleTag(tag);
  } catch {
    return undefined;
  }
  for (;;) {
    if (registered.has(candidate)) return candidate;
    const cut = candidate.lastIndexOf("-");
    if (cut <= 0) return undefined;
    candidate = candidate.slice(0, cut);
  }
}

/** `<html lang>` when it names a registered locale. Read at CALL time — `lang` is often set late. */
export function resolvePageLocale(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return resolveRegisteredLocale(document.documentElement.lang);
}

/**
 * The locale nothing chose (decision A2): the page's `<html lang>` if it is registered, else
 * `en`. NEVER `navigator.language` — a server cannot see it, so the first client render would
 * disagree with the server's HTML.
 */
export function resolveDefaultLocale(): string {
  return resolvePageLocale() ?? "en";
}

const warnedTags = new Set<string>();

/** One development warning per unknown tag, then silence. */
export function warnUnknownLocale(tag: string, fallback: string): void {
  if (warnedTags.has(tag) || !isDevelopment()) return;
  warnedTags.add(tag);
  console.warn(
    `[@godxjp/ui] Locale "${tag}" is not registered, so "${fallback}" is used instead. ` +
      `Call registerLocale({ code: "${tag}", … }) before rendering. Shown once.`,
  );
}

/** Test seam: the once-per-tag warning is module state. */
export function resetUnknownLocaleWarningsForTests(): void {
  warnedTags.clear();
}
