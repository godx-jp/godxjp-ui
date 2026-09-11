#!/usr/bin/env node
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

/**
 * A Segmented with the catalog's maximum of FOUR options survives a phone: when the options cannot
 * share one row the track WRAPS, and no label or count is truncated.
 *
 * WHY THIS NEEDS A BROWSER. Truncation is a layout outcome — jsdom has no layout, so every test
 * that rendered the component passed while the labels were cut. Measured in Chromium at 393px
 * before the fix, four options with count badges in a 361px track: every label truncated, and
 * 「失踪・帰国 0」 showed 9.1px of its 25.1px count. The consumer (gino-cloud) found it.
 *
 * TWO FRAMES, BECAUSE THE BOX AROUND THE TRACK IS A VARIABLE. On `data-entry-segmented` the track
 * sits directly in a CardContent, where it is a block box and shrinks to the column. On
 * `data-entry-segmented-in-filter-row` it shares a WRAPPING flex row with another control — which
 * is how a list screen actually builds a filter bar, and a flex item's `min-inline-size` defaults
 * to `auto`, its max-content width. A consumer reported the phone-width defect from exactly that
 * composition and it was reasonable to suspect the row was the cause, so the row is now measured
 * rather than reasoned about. (It was not the cause: re-measured with `flex-wrap: wrap` removed,
 * the block box and the flex item fail identically — all four labels truncated at 393px and the
 * last count badge 11.61px outside the track. The wrap fixes both.)
 *
 * WHAT IS ASSERTED, at each width, on each frame:
 *   1. no `.ui-segmented-item-label` anywhere on the frame is truncated;
 *   2. the page never scrolls sideways, and every track stays inside its parent;
 * and on the frame's counted card:
 *   3. every count badge lies wholly inside its item;
 *   4. at 1280px the bar is ONE row (a bar that fits must not wrap needlessly), and at phone widths
 *      it is at least two — otherwise 1 and 3 would pass because nothing was ever narrow.
 */
const port = Number(process.env.PREVIEW_PORT) || 6017;
const base = `http://localhost:${port}`;
const stopServer = await ensurePreviewServer(base);

const frames = [
  { story: "data-entry-segmented", counted: "#four-with-counts" },
  { story: "data-entry-segmented-in-filter-row", counted: "#four-in-wrap-row" },
];
const widths = [
  { width: 320, dir: "ltr", wraps: true },
  { width: 393, dir: "ltr", wraps: true },
  { width: 1280, dir: "ltr", wraps: false },
  { width: 393, dir: "rtl", wraps: true },
];
const cases = frames.flatMap((frame) => widths.map((w) => ({ ...frame, ...w })));
const results = [];
let browser;

try {
  browser = await chromium.launch({ headless: true });
  for (const { width, dir, wraps, story, counted } of cases) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`${base}/isolate/${story}${dir === "rtl" ? "?dir=rtl" : ""}`, {
      waitUntil: "domcontentloaded",
    });
    await page.locator(`${counted} .ui-segmented`).waitFor();
    await page.evaluate((d) => document.documentElement.setAttribute("dir", d), dir);
    await page.waitForTimeout(250);

    const r = await page.evaluate((countedSelector) => {
      const truncated = [...document.querySelectorAll(".ui-segmented-item-label")]
        .filter((label) => label.scrollWidth > label.clientWidth + 0.5)
        .map((label) => label.textContent);
      const escaped = [...document.querySelectorAll(".ui-segmented")]
        .filter((track) => {
          const t = track.getBoundingClientRect();
          const p = track.parentElement.getBoundingClientRect();
          return p.width > 0 && (t.left < p.left - 1 || t.right > p.right + 1);
        })
        .map((track) => track.getAttribute("aria-label"));
      const four = document.querySelector(`${countedSelector} .ui-segmented`);
      const items = [...four.querySelectorAll(".ui-segmented-item")];
      const badgesCut = items
        .filter((item) => {
          const b = item.querySelector('[data-slot="badge"]').getBoundingClientRect();
          const i = item.getBoundingClientRect();
          return b.left < i.left - 0.5 || b.right > i.right + 0.5;
        })
        .map((item) => item.textContent);
      return {
        truncated,
        escaped,
        badgesCut,
        rows: new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size,
        documentOverflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    }, counted);
    const rowsOk = wraps ? r.rows >= 2 : r.rows === 1;
    if (
      r.truncated.length ||
      r.escaped.length ||
      r.badgesCut.length ||
      r.documentOverflow > 1 ||
      !rowsOk
    ) {
      throw new Error(`${story} ${dir}@${width}: ${JSON.stringify(r)}`);
    }
    results.push({ story, width, dir, rows: r.rows, verdict: "pass" });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser?.close();
  stopServer();
}
