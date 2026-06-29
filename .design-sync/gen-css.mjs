// Produces a STABLE, font-cleaned cssEntry for design-sync from the compiled
// Tailwind v4 preview stylesheet.
//
// Two problems this solves:
//  1. Hash rot — `pnpm preview:build` emits preview/dist/assets/preview-runtime-<hash>.css
//     with a content hash that rotates every build, so a committed cssEntry path
//     would go stale. We glob for it and re-emit at a fixed name.
//  2. Fonts — that compiled CSS @font-faces BOTH Montserrat (the Latin / `vi`
//     face, ~256 KB) and Noto Sans JP (the default JP face, ~8.8 MB / 372 subset
//     files) via absolute /assets/*.woff2 urls that don't resolve outside Vite's
//     dev server. We:
//       • keep Montserrat and rewrite its urls to be RELATIVE to the assets dir
//         (siblings on disk) so the converter copies the woff2 into fonts/;
//       • DROP the Noto Sans JP @font-face blocks — it's the framework's default
//         face but it's host/runtime-served (cfg.runtimeFontPrefixes suppresses
//         the FONT_MISSING warning), and 8.8 MB of CJK subsets is disproportionate
//         for a themeable design framework whose consumers bring their own fonts.
//         JP text falls back to the system stack (-apple-system, Hiragino Sans).
//
// Runs as part of cfg.buildCmd, after `pnpm preview:build`. cfg.cssEntry points
// at the file this writes: ./preview/dist/assets/_ds_cssentry.css

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = join(repoRoot, 'preview', 'dist', 'assets');

const compiled = readdirSync(assetsDir).filter((f) => /^preview-runtime-.*\.css$/.test(f));
if (!compiled.length) {
  console.error('[gen-css] no preview-runtime-*.css under preview/dist/assets — run `pnpm preview:build` first');
  process.exit(1);
}
// Deterministic pick if more than one lingers (stale builds): newest by name is fine,
// but prefer the single expected one.
const src = compiled.sort().at(-1);
let css = readFileSync(join(assetsDir, src), 'utf8');

// 1. Drop Noto Sans JP @font-face blocks (runtime-served). Blocks are minified,
//    single-level braces — [^}]* is safe.
const before = (css.match(/@font-face\{/g) || []).length;
css = css.replace(/@font-face\{[^}]*?font-family:\s*["']?Noto Sans JP["']?[^}]*?\}/gi, '');
const after = (css.match(/@font-face\{/g) || []).length;

// 2. Rewrite remaining absolute /assets/ font urls to be relative to this file
//    (which we write INTO the assets dir, so the woff2 are siblings).
css = css.replace(/url\(\/assets\/([^)]+\.(?:woff2?|ttf|otf))\)/gi, 'url(./$1)');

const outName = '_ds_cssentry.css';
writeFileSync(join(assetsDir, outName), css);
console.error(
  `[gen-css] wrote preview/dist/assets/${outName} from ${src} — dropped ${before - after} Noto Sans JP @font-face block(s), kept ${after} (Montserrat)`,
);
