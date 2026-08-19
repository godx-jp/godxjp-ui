#!/usr/bin/env node
/**
 * Table action-collection CJK floor contract (gh#262).
 *
 * The gh#253 priority measures are percentages, so a ~10-column JA queue at 390px used to crush
 * every column below one CJK glyph — headers and values shredded vertically, one character per
 * line (the SC 1.4.10 Reflow failure mode). This gate renders the EXACT queue from the issue
 * (10 columns, JA headers, 390×844) against the real component CSS and asserts:
 *
 *   1. every column respects its token floor (`--table-action-collection-*-min-inline-size`);
 *   2. the table therefore outgrows the container and the wrapper's keyboard-reachable
 *      overflow-x region scrolls — the SC 1.4.10-permitted one-dimensional fallback;
 *   3. no header or cell renders as a vertical character column (line boxes << glyph count);
 *   4. the canonical five-column gh#253 queue still fits 390px WITHOUT scrolling (no regression).
 *
 * Self-contained: it inlines src/tokens/components/table.css + src/styles/table-layout.css into a
 * static page (no preview server), so it runs in seconds.
 */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT, loadDeps, resolveChromiumExecutable } from "./frame-harness.mjs";

const evidenceDirectory = path.join(REPO_ROOT, "audit-evidence/table-collection-cjk");
const tableTokens = readFileSync(path.join(REPO_ROOT, "src/tokens/components/table.css"), "utf8");
const tableLayout = readFileSync(path.join(REPO_ROOT, "src/styles/table-layout.css"), "utf8");

const rem = 16;
/** The compact rem floor-measures from tokens/components/table.css, in px at the 16px root. */
const FLOORS_PX = {
  primary: 6 * rem,
  secondary: 5.5 * rem,
  meta: 5 * rem,
  actions: 2.75 * rem,
  flex: 5 * rem, // unmarked free-text column
};

/** Primitive-token fallbacks the two component stylesheets read (normally supplied by the theme). */
const baseVars = `
  :root {
    --scaling: 1;
    --space-2: 0.5rem;
    --control-padding-x: 0.75rem;
    --font-size-xs: 0.75rem;
    --font-size-base: 0.875rem;
    --font-weight-medium: 500;
    --radius-md: 0.5rem;
    --space-inline-xs: 0.25rem;
    --space-inline-sm: 0.5rem;
    --space-inline-md: 0.75rem;
    --space-stack-sm: 0.75rem;
    --space-page-active-x: 1rem;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --border: 220 13% 91%;
    --background: 0 0% 100%;
    --foreground: 224 71% 4%;
  }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Hiragino Sans", "Noto Sans JP", sans-serif; font-size: 14px; }
  .relative { position: relative; }
  .w-full { width: 100%; }
  .overflow-auto { overflow: auto; }
  table { border-collapse: collapse; }
`;

const th = (priority, label) =>
  `<th data-slot="table-head" scope="col"${priority ? ` data-priority="${priority}"` : ""}>${label}</th>`;
const td = (priority, value) =>
  `<td data-slot="table-cell"${priority ? ` data-priority="${priority}"` : ""}>${value}</td>`;

/** The ten-column operator queue from gh#262, every column carrying a priority. */
const queue10 = [
  ["actions", "選択", "☐"],
  ["primary", "組織", "株式会社アクメ商事"],
  ["secondary", "サービス", "quasi-debiti"],
  ["secondary", "ステータス", "失敗"],
  ["meta", "ステップ", "3/5"],
  ["meta", "試行回数", "4"],
  ["secondary", "エラーコード", "E_TIMEOUT_UPSTREAM"],
  ["meta", "再試行", "可能"],
  ["meta", "作成日時", "2026/08/03 9:12"],
  ["actions", "操作", "…"],
];

/** The same queue with the error-code column UNMARKED — pins that a free-text column is floored
 * below the step instead of collapsing to the 0px the fixed algorithm hands an auto column. */
const queue10Flex = queue10.map(([priority, label, value]) =>
  label === "エラーコード" ? [null, label, value] : [priority, label, value],
);

/** The canonical five-column gh#253 approval queue — must stay scroll-free at 390px. */
const queue5 = [
  ["primary", "申請者", "田中 太郎"],
  ["secondary", "対象", "会計 / 請求書エクスポート"],
  [null, "理由", "月次決算のため請求データの一括出力権限が必要です。"],
  ["meta", "申請日時", "2026/08/03 9:12"],
  ["actions", "操作", "…"],
];

const renderQueue = (id, columns) => `
  <div id="${id}" class="ui-table-collection relative w-full overflow-auto"
       data-preset="action-collection" data-collapse-below="sm" tabindex="0">
    <table data-slot="table" class="w-full">
      <thead><tr>${columns.map(([p, label]) => th(p, label)).join("")}</tr></thead>
      <tbody><tr>${columns.map(([p, , value]) => td(p, value)).join("")}</tr></tbody>
    </table>
  </div>`;

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
  <style>${baseVars}</style>
  <style>${tableTokens}</style>
  <style>${tableLayout}</style>
</head><body>
  ${renderQueue("queue10", queue10)}
  <hr>
  ${renderQueue("queue10flex", queue10Flex)}
  <hr>
  ${renderQueue("queue5", queue5)}
</body></html>`;

const { chromium } = await loadDeps({ axe: false });
mkdirSync(evidenceDirectory, { recursive: true });
const browser = await chromium.launch(
  resolveChromiumExecutable() ? { executablePath: resolveChromiumExecutable() } : {},
);

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.setContent(html, { waitUntil: "load" });

  const measure = (id) =>
    page.evaluate((elementId) => {
      const wrapper = document.getElementById(elementId);
      const lineBoxes = (cell) => {
        const range = document.createRange();
        range.selectNodeContents(cell);
        // Client rects ≈ line boxes; the vertical-shred symptom is one rect per glyph.
        return range.getClientRects().length;
      };
      const cells = [...wrapper.querySelectorAll("th, td")].map((cell) => ({
        tag: cell.tagName.toLowerCase(),
        priority: cell.dataset.priority ?? null,
        text: cell.textContent.trim(),
        width: cell.getBoundingClientRect().width,
        lines: lineBoxes(cell),
      }));
      return { clientWidth: wrapper.clientWidth, scrollWidth: wrapper.scrollWidth, cells };
    }, id);

  const measured = {};
  for (const id of ["queue10", "queue10flex", "queue5"]) {
    measured[id] = await measure(id);

    // 1. Every column holds its token floor (0.5px layout tolerance) — including the UNMARKED
    //    free-text column, which the fixed algorithm would otherwise collapse to 0px.
    for (const cell of measured[id].cells) {
      const floor = FLOORS_PX[cell.priority ?? "flex"];
      assert.ok(
        cell.width >= floor - 0.5,
        `${id} <${cell.tag}> "${cell.text}" (${cell.priority ?? "flex"}): ${cell.width}px < floor ${floor}px`,
      );
    }

    // 2. Nothing shreds vertically: the gh#262 symptom is one line box PER GLYPH. At the floors
    //    every cell must average at least ~4 glyphs per rendered line (a long value wrapping to a
    //    few full lines is fine; a vertical character column is not).
    for (const cell of measured[id].cells) {
      const glyphs = [...cell.text].length;
      if (glyphs < 3) continue;
      assert.ok(
        cell.lines < glyphs && cell.lines <= Math.ceil(glyphs / 4),
        `${id} <${cell.tag}> "${cell.text}": ${cell.lines} line boxes for ${glyphs} glyphs — vertical shredding`,
      );
    }
  }

  // 3. The floors over-constrain 390px at ten columns, so the wrapper's overflow region scrolls
  //    (SC 1.4.10 permits one-dimensional scrolling of a data table; shredding is not readable).
  for (const id of ["queue10", "queue10flex"]) {
    assert.ok(
      measured[id].scrollWidth > measured[id].clientWidth,
      `${id}: expected intentional horizontal scroll, got scrollWidth ${measured[id].scrollWidth} <= clientWidth ${measured[id].clientWidth}`,
    );
  }

  // 4. No regression: the canonical five-column gh#253 queue still fits 390px without scrolling.
  assert.ok(
    measured.queue5.scrollWidth <= measured.queue5.clientWidth + 1,
    `queue5: canonical queue regressed into a scroll (scrollWidth ${measured.queue5.scrollWidth} > clientWidth ${measured.queue5.clientWidth})`,
  );

  await page.screenshot({ path: path.join(evidenceDirectory, "390x844.png"), fullPage: true });
  writeFileSync(
    path.join(evidenceDirectory, "results.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), ...measured }, null, 2)}\n`,
  );
  console.log(
    `PASS table action-collection CJK floors: 10-col JA queue scrolls at floors (${measured.queue10.scrollWidth}px in ${measured.queue10.clientWidth}px), no vertical shredding; 5-col canonical queue scroll-free; evidence -> ${path.relative(REPO_ROOT, evidenceDirectory)}`,
  );
} finally {
  await browser.close();
}
