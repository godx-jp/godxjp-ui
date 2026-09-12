#!/usr/bin/env node
/**
 * Regenerate the merged JIS X 0208 level 1 woff2 faces that
 * `@godxjp/ui/styles/core-with-jis-level1` ships (issue #535).
 *
 * NOT part of `pnpm build`, and NOT a dependency of this package — nothing here reaches a
 * consumer's install. The output is COMMITTED under `src/styles/fonts/`; run this only when the
 * installed @fontsource version changes or the charset does. It needs `fonttools` + `brotli` in
 * whatever Python it finds, and a throwaway venv is enough:
 *
 *     python3 -m venv /tmp/fs && /tmp/fs/bin/pip install fonttools brotli
 *     PYTHON=/tmp/fs/bin/python node scripts/build-jis-level1-fonts.mjs
 *
 * WHY MERGE AT ALL. `styles` imports `@fontsource/noto-sans-jp/400.css`, which is 124 woff2 faces
 * split by `unicode-range`. A browser can only learn which of them it needs AFTER it has laid out
 * and measured the text, so every new screen discovers a new handful and fires another round of
 * requests. One file per weight has nothing to discover: it arrives once, on first paint, and
 * every screen after that costs zero font requests. Measured, three weights, Noto Sans JP only:
 *
 *   694 distinct Japanese characters (UI labels + names, addresses, business prose)
 *     sliced  → 150 requests, 1,772,728 bytes, spread over screens
 *     merged  →   3 requests, ~1.53 MB, all of it on first paint
 *
 * WHAT GOES IN. JIS X 0208 rows 1–47 — the 2965 level 1 kanji plus the kana, symbols, Greek and
 * Cyrillic of rows 1–8 — union the codepoints of @fontsource's `latin`, `latin-ext` and
 * `vietnamese` subsets, because this package promises Vietnamese coverage (`--font-sans-vi`) and a
 * Japanese-only cut would drop it silently. Level 2 (rows 48–84) is deliberately OUT: it roughly
 * doubles the bytes to buy kanji a business app meets only in rare surnames, and those fall
 * through to the platform Japanese face the consumer names after this one.
 *
 * WHAT IS NOT BUILT. M PLUS 2. It sits BEHIND Noto Sans JP in every stack this package ships and
 * Noto Sans JP covers the whole Japanese range, so a browser never reaches it — the 1,089,676
 * bytes its three merged weights would cost buy nothing that a consumer pays for today.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "src", "styles", "fonts");
const fontsource = join(root, "node_modules", "@fontsource", "noto-sans-jp", "files");
const python = process.env.PYTHON ?? "python3";

/**
 * The six JIS X 0208 cells whose Unicode mapping is DISPUTED, in their JIS-standard reading.
 *
 * `TextDecoder("euc-jp")` follows the WHATWG index, which is Microsoft's CP932 reading: row 1
 * cell 33 decodes to FULLWIDTH TILDE (U+FF5E), not WAVE DASH (U+301C). Both are live in real
 * Japanese text — a Windows-authored CSV and a macOS-authored one disagree on the same character —
 * so the subset carries BOTH members of each pair. Six glyphs; omitting them puts a tofu box in a
 * date range like `10:00〜18:00` for whichever half of the world authored it the other way.
 */
const DISPUTED_JIS_MAPPINGS = "〜‖−¢£¬";

/** JIS X 0208 rows 1–47, decoded through EUC-JP: rows 1–8 non-kanji + rows 16–47 level 1 kanji. */
function jisLevel1() {
  const decoder = new TextDecoder("euc-jp");
  const chars = [...DISPUTED_JIS_MAPPINGS];
  for (let ku = 1; ku <= 47; ku += 1) {
    for (let ten = 1; ten <= 94; ten += 1) {
      const decoded = decoder.decode(new Uint8Array([0xa0 + ku, 0xa0 + ten]));
      if (decoded.length === 1 && decoded !== "�") chars.push(decoded);
    }
  }
  return chars;
}

const WEIGHTS = [
  { css: "400", style: "Regular" },
  { css: "500", style: "Medium" },
  { css: "700", style: "Bold" },
];

/**
 * The GLYPHS come from the whole font — all 120 numbered slices merged back, which are a partition
 * and so merge without duplicating anything — plus `cyrillic`, the one face `400.css` ships whose
 * coverage no numbered slice repeats. Rows 1–8 scatter ※ 〜 ○ ● ■ → ─ and thirty more symbols
 * across ~38 slices, so merging the lot is both complete and free of a hand-kept slice list.
 */
const EXTRA_SOURCES = ["cyrillic"];
/** Named subsets whose codepoints JOIN the charset (their glyphs already arrive above). */
const LATIN_SUBSETS = ["latin", "latin-ext", "vietnamese"];

mkdirSync(outDir, { recursive: true });
const charsetFile = join(outDir, ".charset.txt");
const charset = jisLevel1();
writeFileSync(charsetFile, charset.join(""), "utf8");

const program = `
import sys, glob, re
from fontTools.merge import Merger
from fontTools import subset
from fontTools.ttLib import TTFont

charset_file, out_file, files_dir, weight, style, extras, latins = sys.argv[1:]
chars = set(open(charset_file, encoding="utf8").read())
for name in latins.split(","):
    path = f"{files_dir}/noto-sans-jp-{name}-{weight}-normal.woff2"
    chars |= {chr(c) for c in TTFont(path).getBestCmap()}

numbered = sorted(
    glob.glob(f"{files_dir}/noto-sans-jp-[0-9]*-{weight}-normal.woff2"),
    key=lambda p: int(re.search(r"-(\\d+)-", p.rsplit("/", 1)[1]).group(1)),
)
sources = numbered + [
    f"{files_dir}/noto-sans-jp-{name}-{weight}-normal.woff2" for name in extras.split(",")
]
merged = Merger().merge(sources)

opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = ["*"]
opts.notdef_outline = True
subsetter = subset.Subsetter(options=opts)
subsetter.populate(text="".join(sorted(chars)))
subsetter.subset(merged)

# Merging inherits the FIRST source's name records, and slice 0 of @fontsource's build is named
# "Noto Sans JP Thin". A face whose own name table lies is a trap for anyone who opens the file or
# installs it locally, so restate it from what this build actually is.
FULL = f"Noto Sans JP {style}"
NAMES = {1: "Noto Sans JP", 2: style, 3: f"{FULL} JIS X 0208 level 1", 4: FULL,
         6: f"NotoSansJP-{style}"}
for name_id, value in NAMES.items():
    merged["name"].setName(value, name_id, 3, 1, 0x409)
    merged["name"].setName(value, name_id, 1, 0, 0)

subset.save_font(merged, out_file, opts)
missing = sorted(c for c in chars if ord(c) not in merged.getBestCmap())
print(
    f"{out_file.rsplit('/', 1)[1]}: {merged['maxp'].numGlyphs} glyphs, "
    f"{len(merged.getBestCmap())} codepoints"
    + (f", {len(missing)} absent from the @fontsource build: {''.join(missing)}" if missing else "")
)
`;

for (const { css, style } of WEIGHTS) {
  const out = join(outDir, `noto-sans-jp-jis-level1-${css}.woff2`);
  execFileSync(
    python,
    [
      "-c",
      program,
      charsetFile,
      out,
      fontsource,
      css,
      style,
      EXTRA_SOURCES.join(","),
      LATIN_SUBSETS.join(","),
    ],
    { stdio: "inherit" },
  );
}

rmSync(charsetFile, { force: true });
let total = 0;
for (const name of readdirSync(outDir)
  .filter((n) => n.endsWith(".woff2"))
  .sort()) {
  const size = statSync(join(outDir, name)).size;
  total += size;
  console.log(`  ${String(size).padStart(8)}  ${name}`);
}
console.log(`JIS level 1 faces rebuilt — ${charset.length} JIS codepoints, ${total} bytes total`);
