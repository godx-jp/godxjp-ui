/**
 * Memoised `Intl` formatters, keyed by locale + options.
 *
 * WHY THIS EXISTS, AS A MEASUREMENT (gh#557). A consumer ported a legacy CakePHP grid that keeps
 * every row in the DOM — 8,262 rows, no virtualisation available — and measured 27-30s against
 * 2.3s for the same markup built from native `<input>` / `<select>`. They had already ruled out
 * the obvious suspect: deleting `Popover` / `PopoverContent` from `DatePicker` entirely changed
 * nothing.
 *
 * Rendered here through `react-dom/server`, 2,000 rows at a time, one CLOSED `DatePicker` costs
 * **412.6us** against **4.2us** for `<input type="date">` — 98x. Counting constructor calls during
 * that render, each closed instance built:
 *
 *     12 x new Intl.DateTimeFormat
 *      1 x new Intl.NumberFormat
 *
 * Constructing an `Intl` formatter is one of the most expensive things a JS engine does: it
 * resolves locale data and compiles a pattern. Routing those same constructions through this
 * cache, changing nothing else, took the instance from **412.6us to 178us — a 57% cut**. For the
 * reporter's grid that is roughly 99,000 formatter constructions that no longer happen.
 *
 * WHY A SHARED MODULE AND NOT A `useMemo` AT EACH CALL SITE. `useMemo` memoises per INSTANCE, and
 * the instance is exactly what there are 8,262 of. Two rows formatting dates in the same locale
 * want the same formatter object, and nothing below module scope can give them one.
 *
 * SAFETY. `Intl` formatters are immutable and stateless — `format()` mutates nothing — so a single
 * instance is safely shared across every caller and every React tree, concurrent SSR included.
 */

/** Bounded, so a caller building option objects in a loop cannot grow this without limit. */
const MAX_ENTRIES = 256;

const cache = new Map<string, unknown>();

function memoise<T>(kind: string, locale: string, options: unknown, make: () => T): T {
  // `undefined` and `{}` are deliberately different keys: they are different formatters.
  const key = `${kind} ${locale} ${options === undefined ? "" : JSON.stringify(options)}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit as T;
  const made = make();
  // Plain eviction — the oldest key goes. No LRU: the realistic key count is (locales x option
  // shapes), a small number, and the cap exists for the pathological caller alone.
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value as string);
  cache.set(key, made);
  return made;
}

export function dateTimeFormat(
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  return memoise("dtf", locale, options, () => new Intl.DateTimeFormat(locale, options));
}

export function numberFormat(
  locale: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  return memoise("nf", locale, options, () => new Intl.NumberFormat(locale, options));
}

export function pluralRules(locale: string, options?: Intl.PluralRulesOptions): Intl.PluralRules {
  return memoise("pr", locale, options, () => new Intl.PluralRules(locale, options));
}

export function listFormat(locale: string, options?: Intl.ListFormatOptions): Intl.ListFormat {
  return memoise("lf", locale, options, () => new Intl.ListFormat(locale, options));
}
