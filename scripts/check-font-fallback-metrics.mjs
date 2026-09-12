#!/usr/bin/env node
/**
 * check:font-fallback-metrics — does the fallback that paints a COLD VISIT occupy the same boxes
 * as the brand face?
 *
 * Every face in `@fontsource/noto-sans-jp` and `@fontsource/m-plus-2` is `font-display: swap`, and
 * CSS cannot override that on an already-declared face. So the first paint of a cold visit is in
 * whatever comes next in `--font-sans-base`, and the swap ~1s later reflows the page: a consumer
 * measured CLS 0.093–0.141 on macOS and 0.4134 on a Linux runner, with the font files still
 * downloading at ~890ms — long after the text was painted (issue #475). `styles/fonts.css` answers
 * that with "Noto Sans JP Fallback": local faces whose metrics are overridden to Noto Sans JP's.
 *
 * WHY A BROWSER. The numbers in that file are a claim about what a font engine will do with
 * `size-adjust` + `ascent-override` on a LOCAL face it had to find by name. jsdom has no layout and
 * no fonts, so the unit tests beside fonts.css can only check that the descriptors are spelled
 * right (they do). Whether the resulting line box is the same height is a rendered question.
 *
 * WHAT IS ASSERTED, for 400/500/700 × three sizes of the type scale × `line-height: 1.5` and
 * `normal`, in Latin, Vietnamese and Japanese:
 *   1. every paragraph is the same HEIGHT in the fallback as in the brand face — i.e. it wraps to
 *      the same number of lines, which is the shift that moves everything below it;
 *   2. every single-line box is the same height — the `line-height: normal` case is the one the
 *      overrides exist for, and it is 2px out per line without them;
 *   3. Latin advances agree in aggregate, and Japanese advances agree per string (kana and kanji
 *      are 1em in both, so anything else means a size-adjust leaked onto the Japanese face).
 *
 * `--font-render-hinting=none`, because Linux Chromium otherwise rounds every glyph advance to a
 * whole CSS pixel (subpixel positioning is off, and deviceScaleFactor does not change it). That
 * rounding is real for a Linux visitor, but it is the RASTERISER's, not this file's: measured, it
 * moves a single word by up to 12% in either direction at one size and back at the next, which
 * cannot be tuned away by any single size-adjust. Hinting off isolates the metrics this gate owns.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const FONTS_CSS = join(ROOT, "src/styles/fonts.css");
/** The faces themselves live here since #535, because `styles/core-with-fallbacks` carries them
 *  WITHOUT the @fontsource subsets; fonts.css `@import`s this file and owns the token stack. */
const FONT_FALLBACKS_CSS = join(ROOT, "src/styles/font-fallbacks.css");
const ORIGIN = "http://font-metrics.test";

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const source = stripComments(
  `${readFileSync(FONT_FALLBACKS_CSS, "utf8")}\n${readFileSync(FONTS_CSS, "utf8")}`,
);

const faces = (source.match(/@font-face\s*\{[^}]*"Noto Sans JP Fallback"[^}]*\}/g) ?? []).join(
  "\n",
);
if (!faces) {
  console.error(
    '✗ src/styles/font-fallbacks.css declares no "Noto Sans JP Fallback" face (issue #475).',
  );
  process.exit(1);
}
/** The bundled stack, and the same stack as it renders BEFORE the web fonts arrive. */
const stack = source
  .match(/--font-sans-base:\s*([^;]+);/)[1]
  .replace(/\s+/g, " ")
  .trim();
const swapWindowStack = stack.replace(/"(Noto Sans JP|M PLUS 2)",\s*/g, "");

/** Text that is representative of what the library renders, not a pangram. */
const SAMPLES = {
  latin:
    "Invite members to your project and track the progress of every task from one dashboard. " +
    "Changes are saved automatically, and you can restore an earlier version at any time.",
  vietnamese:
    "Mời thành viên vào dự án và theo dõi tiến độ của mọi công việc trên một bảng điều khiển.",
  japanese:
    "プロジェクトにメンバーを招待して、すべてのタスクの進捗をひとつのダッシュボードで確認できます。" +
    "変更は自動的に保存され、いつでも以前のバージョンに戻せます。",
  mixed: "GODX Task 設定 — 42件のIssueを更新しました (2026-09-11)",
};
/** --font-size-xs, --font-size-base/sm, --font-size-xl of the golden-ratio scale. */
const SIZES = [12.47, 14, 19.8];
const WEIGHTS = [400, 500, 700];
/**
 * Latin advances cannot agree glyph for glyph: one `size-adjust` maps a whole typeface onto a
 * different one, and Noto Sans JP is relatively narrow in capitals and wide in lowercase against
 * Arial. So the per-STRING budget is loose and the AGGREGATE one — the sum over the corpus the
 * size-adjust was fitted to — is tight; that sum is what decides where a paragraph wraps. Japanese
 * is held tightest of all, because kana and kanji are 1em in both faces and nothing should move.
 */
const TOLERANCE = { latinAggregate: 1.5, latinString: 4, japanese: 1, boxPx: 0.5 };

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<link rel="stylesheet" href="/fs/noto-sans-jp/400.css">
<link rel="stylesheet" href="/fs/noto-sans-jp/500.css">
<link rel="stylesheet" href="/fs/noto-sans-jp/700.css">
<style>${faces}
body { margin: 0 }
.para { inline-size: 360px }
.line { white-space: nowrap; display: inline-block }
</style></head><body><div id="root"></div></body></html>`;

const browser = await chromium.launch({ args: ["--font-render-hinting=none"] });
const page = await browser.newPage();
await page.route(`${ORIGIN}/**`, async (route) => {
  const { pathname } = new URL(route.request().url());
  if (pathname === "/") return route.fulfill({ body: html, contentType: "text/html" });
  const match = pathname.match(/^\/fs\/([^/]+)\/(.+)$/);
  if (!match) return route.abort();
  const pkgRoot = dirname(require.resolve(`@fontsource/${match[1]}/400.css`));
  const file = join(pkgRoot, match[2]);
  return route.fulfill({
    body: readFileSync(file),
    contentType: file.endsWith(".css") ? "text/css" : "font/woff2",
  });
});
await page.goto(`${ORIGIN}/`);

const measurements = await page.evaluate(
  async ({ stacks, SAMPLES, SIZES, WEIGHTS }) => {
    const text = Object.values(SAMPLES).join("");
    for (const weight of WEIGHTS) {
      await document.fonts.load(`${weight} 16px "Noto Sans JP"`, text);
      await document.fonts.load(`${weight} 16px "Noto Sans JP Fallback"`, text);
    }
    await document.fonts.ready;
    const root = document.getElementById("root");
    const out = [];
    for (const [stackName, family] of Object.entries(stacks)) {
      for (const weight of WEIGHTS) {
        for (const size of SIZES) {
          for (const lineHeight of ["1.5", "normal"]) {
            const box = document.createElement("div");
            box.style.cssText = `font-family:${family};font-weight:${weight};font-size:${size}px;line-height:${lineHeight}`;
            for (const [script, sample] of Object.entries(SAMPLES)) {
              for (const shape of ["para", "line"]) {
                const el = document.createElement("div");
                el.className = shape;
                el.textContent = sample;
                el.dataset.key = `${shape}:${script}:${weight}:${size}:${lineHeight}`;
                box.append(el);
              }
            }
            root.append(box);
            for (const el of box.querySelectorAll("[data-key]")) {
              const rect = el.getBoundingClientRect();
              out.push({
                stackName,
                key: el.dataset.key,
                width: rect.width,
                height: rect.height,
              });
            }
            box.remove();
          }
        }
      }
    }
    return out;
  },
  {
    stacks: { brand: '"Noto Sans JP", sans-serif', fallback: swapWindowStack },
    SAMPLES,
    SIZES,
    WEIGHTS,
  },
);
await browser.close();

const brand = new Map(measurements.filter((m) => m.stackName === "brand").map((m) => [m.key, m]));
const failures = [];
let worstWidth = { key: "-", pct: 0 };
let worstBox = { key: "-", px: 0 };
/** Latin-script advance sums per weight/size/line-height — the fitted quantity. */
const aggregate = new Map();

for (const m of measurements.filter((x) => x.stackName === "fallback")) {
  const [shape, script, weight, size, lineHeight] = m.key.split(":");
  const reference = brand.get(m.key);
  const heightDelta = Math.abs(m.height - reference.height);
  if (heightDelta > worstBox.px) worstBox = { key: m.key, px: heightDelta };
  if (heightDelta > TOLERANCE.boxPx) {
    failures.push(
      `${m.key}: ${shape === "para" ? "paragraph" : "line box"} is ${m.height.toFixed(1)}px in the ` +
        `fallback, ${reference.height.toFixed(1)}px in Noto Sans JP (${heightDelta.toFixed(1)}px out)`,
    );
  }
  if (shape !== "line") continue;
  const widthPct = (100 * (m.width - reference.width)) / reference.width;
  if (Math.abs(widthPct) > Math.abs(worstWidth.pct)) worstWidth = { key: m.key, pct: widthPct };

  if (script === "japanese") {
    if (Math.abs(widthPct) > TOLERANCE.japanese) {
      failures.push(
        `${m.key}: Japanese line is ${widthPct.toFixed(2)}% of the brand face, over ${TOLERANCE.japanese}% — ` +
          `kana and kanji are 1em in both faces, so this means a size-adjust reached the Japanese face`,
      );
    }
    continue;
  }
  if (Math.abs(widthPct) > TOLERANCE.latinString) {
    failures.push(
      `${m.key}: line is ${widthPct.toFixed(2)}% of the brand face, over the ${TOLERANCE.latinString}% ` +
        `any single string may drift (${m.width.toFixed(1)}px vs ${reference.width.toFixed(1)}px)`,
    );
  }
  const bucket = aggregate.get(`${weight}:${size}:${lineHeight}`) ?? { brand: 0, fallback: 0 };
  bucket.brand += reference.width;
  bucket.fallback += m.width;
  aggregate.set(`${weight}:${size}:${lineHeight}`, bucket);
}

let worstAggregate = { key: "-", pct: 0 };
for (const [key, { brand: b, fallback: f }] of aggregate) {
  const pct = (100 * (f - b)) / b;
  if (Math.abs(pct) > Math.abs(worstAggregate.pct)) worstAggregate = { key, pct };
  if (Math.abs(pct) > TOLERANCE.latinAggregate) {
    failures.push(
      `${key}: Latin-script advances sum to ${pct.toFixed(2)}% of the brand face across the corpus, ` +
        `over ${TOLERANCE.latinAggregate}% — this is the number that decides where a paragraph wraps`,
    );
  }
}

if (failures.length) {
  console.error(
    `✗ check:font-fallback-metrics — the swap window does not match the brand face (${failures.length}):\n`,
  );
  for (const failure of failures.slice(0, 20)) console.error(`  ${failure}`);
  if (failures.length > 20) console.error(`  … ${failures.length - 20} more`);
  console.error(
    "\n  Every one of these is a reflow a cold visitor sees as layout shift. The numbers live in\n" +
      "  src/styles/font-fallbacks.css: size-adjust is Noto Sans JP's advance ÷ the local face's over the\n" +
      "  library's own English strings, and ascent/descent-override restate 116% / 28.8% of the em\n" +
      "  divided by that size-adjust. Re-derive them from the font files; do not widen this gate.",
  );
  process.exit(1);
}

console.log(
  `✓ check:font-fallback-metrics — ${measurements.length / 2} boxes across ` +
    `${WEIGHTS.length} weights × ${SIZES.length} sizes × 2 line-heights × ${Object.keys(SAMPLES).length} scripts: ` +
    `the swap window reflows nothing. Worst line box ${worstBox.px.toFixed(2)}px (${worstBox.key}), ` +
    `worst Latin aggregate ${worstAggregate.pct.toFixed(2)}% (${worstAggregate.key}), ` +
    `worst single string ${worstWidth.pct.toFixed(2)}% (${worstWidth.key}).`,
);
