/**
 * EmojiPicker's data (gh#1164): `emojibase-data` (MIT, CLDR annotations), ONE locale's compact file,
 * loaded the first time a picker opens — never in the kit's main bundle. Each file is ~570 KB raw
 * (~100 KB gzip). Unsupported locales fall back to English. Skin-tone variants are ignored.
 */
export type EmojiEntry = {
  unicode: string;
  label: string;
  tags: readonly string[];
  group: number;
  order: number;
};

type Raw = { unicode: string; label: string; tags?: string[]; group?: number; order?: number };

const LOADERS: Record<string, () => Promise<{ default: Raw[] }>> = {
  ja: () => import("emojibase-data/ja/compact.json") as Promise<{ default: Raw[] }>,
  en: () => import("emojibase-data/en/compact.json") as Promise<{ default: Raw[] }>,
  vi: () => import("emojibase-data/vi/compact.json") as Promise<{ default: Raw[] }>,
};

/** Emojibase groups, in display order — 2 (components: bare skin-tone swatches) is not shown. */
export const EMOJI_GROUPS = [
  { group: 0, key: "smileys" },
  { group: 1, key: "people" },
  { group: 3, key: "animals" },
  { group: 4, key: "food" },
  { group: 5, key: "travel" },
  { group: 6, key: "activities" },
  { group: 7, key: "objects" },
  { group: 8, key: "symbols" },
  { group: 9, key: "flags" },
] as const;

const cache = new Map<string, Promise<EmojiEntry[]>>();

export function loadEmoji(locale: string): Promise<EmojiEntry[]> {
  const lang = locale.toLowerCase().split("-")[0]!;
  const key = lang in LOADERS ? lang : "en";
  let pending = cache.get(key);
  if (!pending) {
    pending = LOADERS[key]!().then(({ default: raw }) =>
      raw
        .filter((e) => typeof e.group === "number" && e.group !== 2)
        .map((e) => ({
          unicode: e.unicode,
          label: e.label,
          tags: e.tags ?? [],
          group: e.group!,
          order: e.order ?? 0,
        }))
        .sort((a, b) => a.order - b.order),
    );
    cache.set(key, pending);
  }
  return pending;
}

/** Width- and case-folded, so `ｈａｐｐｙ`, `Happy` and `happy` match alike. */
const fold = (value: string) => value.normalize("NFKC").toLowerCase();

export function searchEmoji(
  entries: readonly EmojiEntry[],
  query: string,
  limit = 120,
): EmojiEntry[] {
  const q = fold(query.trim());
  if (!q) return [];
  const starts: EmojiEntry[] = [];
  const contains: EmojiEntry[] = [];
  for (const entry of entries) {
    const terms = [entry.label, ...entry.tags].map(fold);
    if (terms.some((t) => t.startsWith(q))) starts.push(entry);
    else if (terms.some((t) => t.includes(q))) contains.push(entry);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}
