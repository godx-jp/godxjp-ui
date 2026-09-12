import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Issue #535 — the font budget of each CSS entry, as a number a consumer can grep for.
 *
 * `@godxjp/ui/styles` bundles 737 woff2 subsets (~13 MB on a consumer build, 7× its JS). The way
 * out is `styles/core`, and what makes that way out TRUSTWORTHY is one command:
 *
 *     grep -c '@font-face' node_modules/@godxjp/ui/dist/styles/core.css   # 0
 *
 * A consumer who then wants the metric-matched swap-window fallbacks (issue #475) — six faces
 * whose `src` is `local()`-only, so they download nothing — takes the THIRD entry,
 * `styles/core-with-fallbacks`, rather than having them folded into `core`. Folding would have
 * turned that 0 into a 6 and broken a promise the consumer can measure, for zero bytes saved.
 *
 * These tests pin both numbers, on both sides of that decision.
 */

/** Vitest runs with the repo root as cwd (see vitest.config.ts `root`). */
const STYLES_DIR = resolve(process.cwd(), "src/styles");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * Inline every RELATIVE `@import` in source order, depth-first — what a bundler or the browser
 * actually linearises. Bare specifiers (`tailwindcss`, `@fontsource/*`, `sonner/*`) are
 * node_modules assets and stay as markers, which is exactly what the @fontsource assertions read.
 */
const flatten = (entry: string, seen = new Set<string>()): string => {
  const absolute = resolve(entry);
  if (seen.has(absolute)) return "";
  seen.add(absolute);

  const source = stripComments(readFileSync(absolute, "utf8"));
  return source.replace(/@import\s+["']([^"']+)["']\s*;/g, (match, specifier: string) => {
    if (!specifier.startsWith(".")) return match;
    return flatten(resolve(dirname(absolute), specifier), seen);
  });
};

const faceBodies = (css: string) => [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);

/** The LAST `--font-sans-base` in the flattened cascade — the declaration that actually wins. */
const winningFontStack = (css: string) =>
  [...css.matchAll(/--font-sans-base:\s*([^;}]+)/g)].at(-1)?.[1].replace(/\s+/g, " ").trim();

describe("the @font-face budget of each styles entry (issue #535)", () => {
  it("keeps core.css itself at ZERO @font-face — the number consumers grep", () => {
    // The RAW file, not the flattened graph: `grep -c '@font-face' …/dist/styles/core.css` is the
    // command the escape hatch is sold on, and it reads exactly one file with no CSS parsing.
    const core = stripComments(readFileSync(resolve(STYLES_DIR, "core.css"), "utf8"));
    expect(core.match(/@font-face/g) ?? []).toHaveLength(0);
  });

  // The promise is about the PACKED file, and `grep` cannot tell a rule from a comment: the source
  // header EXPLAINS the zero, which costs the literal string twice. `scripts/copy-styles.mjs`
  // strips comments on the way into `dist`, so the shipped file a consumer greps really is 0 —
  // measured here rather than assumed, because a build that stopped stripping would be invisible.
  it.skipIf(!existsSync(resolve(process.cwd(), "dist/styles/core.css")))(
    "ships a dist/styles/core.css whose RAW text contains @font-face zero times",
    () => {
      const built = readFileSync(resolve(process.cwd(), "dist/styles/core.css"), "utf8");
      expect(built.match(/@font-face/g) ?? []).toHaveLength(0);
    },
  );

  it("keeps the whole core cascade at ZERO @font-face and zero bundled subsets", () => {
    // Stronger than the grep: no layer core pulls in may smuggle a face back either.
    const core = flatten(resolve(STYLES_DIR, "core.css"));
    expect(faceBodies(core)).toHaveLength(0);
    expect(core).not.toContain("@fontsource/");
  });

  it("gives core-with-fallbacks the six local()-only faces and NOT ONE woff2 subset", () => {
    const entry = flatten(resolve(STYLES_DIR, "core-with-fallbacks.css"));
    const faces = faceBodies(entry);

    expect(faces).toHaveLength(6);
    for (const body of faces) {
      expect(body).toContain('"Noto Sans JP Fallback"');
      // `local()`-only is the entire reason this entry is free: no `url()` means no request.
      expect(body).toMatch(/src:\s*local\(/);
      expect(body).not.toMatch(/url\(/);
    }
    // The bundled subsets are what #535 is about — this entry must not reach them by any path.
    expect(entry).not.toContain("@fontsource/");
    expect(entry).not.toMatch(/url\([^)]*\.woff2?/);
  });

  it("adds faces to core and nothing else — same layers, same order, no token grab", () => {
    const core = flatten(resolve(STYLES_DIR, "core.css"));
    const entry = flatten(resolve(STYLES_DIR, "core-with-fallbacks.css"));

    // Everything core says, core-with-fallbacks says, unchanged: it is core + an @import.
    expect(entry.trim().startsWith(core.trim())).toBe(true);
    // It must NOT claim a brand face: `core` ships none, so naming one in --font-sans-base would
    // point the cascade at a family the entry does not deliver. The token that wins has to be the
    // same font-agnostic system stack `core` already resolves to — unlike `styles`, which
    // deliberately overwrites it with "Noto Sans JP".
    expect(winningFontStack(entry)).toBe(winningFontStack(core));
    expect(winningFontStack(entry)).not.toContain("Noto Sans JP");
  });

  it("carries the SAME faces the bundled entry does — one source, no drifting copy", () => {
    // Both entries `@import "./font-fallbacks.css"`. If someone ever re-inlines a copy into one of
    // them, the metric numbers start drifting and only `check:font-fallback-metrics` (a browser
    // gate) would notice — months later.
    const bundled = faceBodies(flatten(resolve(STYLES_DIR, "fonts.css")));
    const entry = faceBodies(flatten(resolve(STYLES_DIR, "core-with-fallbacks.css")));
    expect(entry).toEqual(bundled);
  });

  it("exports the entry under its own subpath, not only the wildcard", () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));
    expect(manifest.exports["./styles/core-with-fallbacks"]).toBe(
      "./dist/styles/core-with-fallbacks.css",
    );
    expect(manifest.exports["./styles/core"]).toBe("./dist/styles/core.css");
    expect(manifest.exports["./styles/core-with-jis-level1"]).toBe(
      "./dist/styles/core-with-jis-level1.css",
    );
  });
});

/**
 * The fourth entry — the one that answers the OTHER half of #535. `core-with-fallbacks` gave a
 * consumer a way to refuse the 729 sliced faces; it did not make the bundled face cheaper for the
 * consumer who wants it. This one does, by trading bytes for round-trips:
 *
 *   694 distinct Japanese characters, three weights, Noto Sans JP only
 *     @godxjp/ui/styles                → 150 requests, 1,772,728 bytes, spread over screens
 *     @godxjp/ui/styles/core-with-jis-level1 → 3 requests, ~1.53 MB, all on first paint
 *
 * Both numbers are contracts, and the byte one is the easier to break by accident: subsetting JIS
 * level 2 as well roughly doubles it, and dropping the Latin subsets cuts coverage this package
 * promises (`--font-sans-vi`) without changing the face count at all. So these tests pin the face
 * count, the budget per file, and the coverage the charset is built from.
 */
describe("the merged JIS level 1 entry (issue #535)", () => {
  const FONT_DIR = resolve(STYLES_DIR, "fonts");
  const FACE_FILES = [
    "noto-sans-jp-jis-level1-400.woff2",
    "noto-sans-jp-jis-level1-500.woff2",
    "noto-sans-jp-jis-level1-700.woff2",
  ];
  /** woff2 re-encoding is not byte-identical run to run, so the contract is a band, not a value. */
  const MIN_BYTES_EACH = 400_000;
  const MAX_BYTES_EACH = 560_000;
  const MAX_BYTES_TOTAL = 1_640_000;

  it("is core-with-fallbacks plus exactly three requesting faces", () => {
    const entry = flatten(resolve(STYLES_DIR, "core-with-jis-level1.css"));
    const faces = faceBodies(entry);

    expect(faces).toHaveLength(9);
    const requesting = faces.filter((body) => /url\(/.test(body));
    expect(requesting).toHaveLength(3);
    // The other six are the `local()`-only fallbacks, unchanged and still free.
    expect(faces.filter((body) => /src:\s*local\(/.test(body) && !/url\(/.test(body))).toHaveLength(
      6,
    );
    // One merged file per weight — a `unicode-range` here would put the browser back to measuring
    // text before it knows what to fetch, which is the mechanism this entry exists to remove.
    for (const body of requesting) {
      expect(body).toContain('font-family: "Noto Sans JP"');
      expect(body).toContain("font-display: swap");
      expect(body).not.toContain("unicode-range");
    }
    expect(requesting.map((body) => body.match(/font-weight:\s*(\d+)/)?.[1])).toEqual([
      "400",
      "500",
      "700",
    ]);
    // It must reach the merged files and NOT the sliced ones, by any path.
    expect(entry).not.toContain("@fontsource/");
  });

  it("keeps every face inside the byte budget the entry declares", () => {
    let total = 0;
    for (const file of FACE_FILES) {
      const bytes = readFileSync(resolve(FONT_DIR, file)).length;
      total += bytes;
      expect(bytes).toBeGreaterThan(MIN_BYTES_EACH);
      expect(bytes).toBeLessThan(MAX_BYTES_EACH);
    }
    expect(total).toBeLessThan(MAX_BYTES_TOTAL);
    // The comparison that makes the trade worth making: 150 sliced requests for 1,772,728 bytes on
    // a 694-character Japanese screen, against three requests for this.
    expect(total).toBeLessThan(1_772_728);
  });

  it("references the faces by a path that resolves next to the stylesheet", () => {
    const sheet = readFileSync(resolve(STYLES_DIR, "jis-level1-fonts.css"), "utf8");
    for (const file of FACE_FILES) {
      expect(sheet).toContain(`url("./fonts/${file}")`);
      expect(existsSync(resolve(FONT_DIR, file))).toBe(true);
    }
  });

  it("leaves the other three entries' budgets exactly where they were", () => {
    // The reason this is a fourth entry and not a change to `styles`: each entry's number is a
    // separate promise, and adding one may not move another.
    expect(faceBodies(flatten(resolve(STYLES_DIR, "core.css")))).toHaveLength(0);
    expect(faceBodies(flatten(resolve(STYLES_DIR, "core-with-fallbacks.css")))).toHaveLength(6);
    expect(flatten(resolve(STYLES_DIR, "core-with-fallbacks.css"))).not.toMatch(/url\(/);
    expect(flatten(resolve(STYLES_DIR, "index.css"))).toContain("@fontsource/");
    // …and the merged faces may not leak into the sliced entry, which would ship both.
    expect(flatten(resolve(STYLES_DIR, "index.css"))).not.toContain("jis-level1");
  });

  it("adds faces to core-with-fallbacks and nothing else — no token grab", () => {
    const fallbacks = flatten(resolve(STYLES_DIR, "core-with-fallbacks.css"));
    const entry = flatten(resolve(STYLES_DIR, "core-with-jis-level1.css"));

    expect(entry.trim().startsWith(fallbacks.trim())).toBe(true);
    // Like core-with-fallbacks it must NOT claim the brand face in the token: JIS level 2 kanji
    // are deliberately absent, so the consumer has to name a platform face after this one.
    expect(winningFontStack(entry)).toBe(winningFontStack(fallbacks));
    expect(winningFontStack(entry)).not.toContain("Noto Sans JP");
  });

  it("ships real woff2, not a placeholder or a truncated copy", () => {
    // No brotli decoder here, so this reads the 48-byte woff2 header, which is uncompressed:
    // signature, the wrapped sfnt flavour, the declared total length, and the table count. It
    // catches the failures a byte budget cannot tell apart from a legitimate rebuild — an LFS
    // pointer committed instead of the font, a half-written file, a woff1 renamed.
    for (const file of FACE_FILES) {
      const bytes = readFileSync(resolve(FONT_DIR, file));
      expect(bytes.subarray(0, 4).toString("latin1")).toBe("wOF2");
      // 0x00010000 is a TrueType-outline sfnt; Noto Sans JP is TrueType, not CFF ("OTTO").
      expect(bytes.readUInt32BE(4)).toBe(0x0001_0000);
      // The header's own length field must agree with the file on disk.
      expect(bytes.readUInt32BE(8)).toBe(bytes.length);
      expect(bytes.readUInt16BE(12)).toBeGreaterThan(8);
      // The decompressed sfnt is several times the woff2, and a merged JIS level 1 face is well
      // over a megabyte of tables — a Latin-only cut would be a small fraction of this.
      expect(bytes.readUInt32BE(16)).toBeGreaterThan(1_000_000);
    }
  });

  it("builds its charset from the whole of JIS X 0208 rows 1–47, both disputed readings", () => {
    // The number that defines "level 1" is 2965, and it is the one a smaller charset would quietly
    // change while the face count and the byte band both still passed. Reproduced from the same
    // decoder `scripts/build-jis-level1-fonts.mjs` uses, so the two cannot disagree silently.
    const decoder = new TextDecoder("euc-jp");
    const cell = (ku: number, ten: number) =>
      decoder.decode(new Uint8Array([0xa0 + ku, 0xa0 + ten]));
    const rows = (from: number, to: number) => {
      const chars: string[] = [];
      for (let ku = from; ku <= to; ku += 1) {
        for (let ten = 1; ten <= 94; ten += 1) {
          const decoded = cell(ku, ten);
          if (decoded.length === 1 && decoded !== "�") chars.push(decoded);
        }
      }
      return chars;
    };

    expect(rows(16, 47)).toHaveLength(2965);
    expect(rows(1, 8).length).toBeGreaterThan(500);

    // Row 1 cell 33 is WAVE DASH in JIS and FULLWIDTH TILDE in CP932, and real Japanese text uses
    // both. The build ships both members, so the script must name the JIS reading explicitly —
    // `TextDecoder` only ever yields the CP932 one.
    expect(cell(1, 33)).toBe("～");
    const script = readFileSync(
      resolve(process.cwd(), "scripts/build-jis-level1-fonts.mjs"),
      "utf8",
    );
    const disputed = script.match(/const DISPUTED_JIS_MAPPINGS = "([^"]+)"/)?.[1];
    expect([...(disputed ?? "")]).toEqual(["〜", "‖", "−", "¢", "£", "¬"]);
    // Each disputed glyph must be the OTHER reading of a cell the decoder already produced, or the
    // list has drifted into a wish list of characters nobody's JIS text actually contains.
    const decoded = new Set(rows(1, 8));
    for (const character of disputed ?? "") {
      expect(decoded.has(character)).toBe(false);
    }
  });

  it("ships the faces into dist, where a consumer's url() actually resolves", () => {
    const dist = resolve(process.cwd(), "dist/styles");
    if (!existsSync(resolve(dist, "core-with-jis-level1.css"))) return;
    for (const file of FACE_FILES) {
      expect(existsSync(resolve(dist, "fonts", file))).toBe(true);
    }
  });
});
