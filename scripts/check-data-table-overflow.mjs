#!/usr/bin/env node
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

/**
 * A DataTable WIDER THAN ITS FRAME SCROLLS INSIDE ITS OWN BOX — it is never cut (WCAG 1.4.10:
 * the table scrolls, the page does not).
 *
 * WHY THIS NEEDS A BROWSER. The defect lived in one declaration — `.ui-data-table-surface` is
 * `overflow: clip` — and jsdom has no layout, so every test that renders the component passed
 * while the table was cut. Measured in Chromium before the fix, a selectable table in a flush
 * Card: at 1280px the surface was 938px and the table 1196px, 258px of columns painted outside
 * the clip, and `.ui-data-table-scroll` reported scrollWidth === clientWidth — no scrollbar, no
 * fade, nothing to reach. At 393px, 556px were gone. The consumer found it; no gate did.
 *
 * WHAT IS ASSERTED, on EVERY default-preset DataTable of the index frame, at each width:
 *   1. the table is never wider than its surface's content box (nothing is cut);
 *   2. the page never scrolls sideways;
 * and on the `#wide-overflow` section, which is wider than the frame at every width by
 * construction (five declared 240px columns in a 48rem frame):
 *   3. the region really overflows — otherwise 1 would pass vacuously;
 *   4. scrolled to its inline end (LTR and RTL), the LAST header cell lies fully inside the region;
 *   5. the scroll-hint fade is on before scrolling and off at the end.
 */
const port = Number(process.env.PREVIEW_PORT) || 6016;
const base = `http://localhost:${port}`;
const stopServer = await ensurePreviewServer(base);

const cases = [
  { width: 320, dir: "ltr" },
  { width: 393, dir: "ltr" },
  { width: 768, dir: "ltr" },
  { width: 1280, dir: "ltr" },
  { width: 1920, dir: "ltr" },
  { width: 393, dir: "rtl" },
  { width: 1280, dir: "rtl" },
];
const results = [];
let browser;

try {
  browser = await chromium.launch({ headless: true });
  for (const { width, dir } of cases) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(
      `${base}/isolate/data-display-data-table-index${dir === "rtl" ? "?dir=rtl" : ""}`,
      {
        waitUntil: "domcontentloaded",
      },
    );
    await page.locator("#wide-overflow .ui-data-table-surface").waitFor();
    await page.evaluate((d) => document.documentElement.setAttribute("dir", d), dir);
    await page.waitForTimeout(250);

    const tables = await page.evaluate(() =>
      [...document.querySelectorAll(".ui-data-table-surface:not([data-preset])")].map((surface) => {
        const table = surface.querySelector(':scope > * > [data-slot="table"]');
        if (!(table instanceof HTMLElement)) throw new Error("surface without a table");
        return {
          wide: surface.closest("#wide-overflow") != null,
          surfaceContent: surface.clientWidth,
          table: table.getBoundingClientRect().width,
          cut: table.getBoundingClientRect().width - surface.clientWidth,
        };
      }),
    );
    const cut = tables.filter((t) => t.cut > 1);
    const documentOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (cut.length || documentOverflow > 1) {
      throw new Error(`${dir}@${width}: ${JSON.stringify({ cut, documentOverflow })}`);
    }

    const wide = await page.evaluate(async (d) => {
      const scroll = document.querySelector("#wide-overflow .ui-data-table-scroll");
      const overflow = scroll.scrollWidth - scroll.clientWidth;
      const fadeBefore = scroll.classList.contains("ui-data-table-has-overflow-end");
      scroll.scrollLeft = d === "rtl" ? -scroll.scrollWidth : scroll.scrollWidth;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const region = scroll.getBoundingClientRect();
      const last = scroll.querySelector("thead th:last-child").getBoundingClientRect();
      return {
        overflow,
        fadeBefore,
        fadeAtEnd: scroll.classList.contains("ui-data-table-has-overflow-end"),
        lastHeaderInside: last.left >= region.left - 1 && last.right <= region.right + 1,
      };
    }, dir);
    if (wide.overflow <= 1 || !wide.lastHeaderInside || !wide.fadeBefore || wide.fadeAtEnd) {
      throw new Error(`${dir}@${width} #wide-overflow: ${JSON.stringify(wide)}`);
    }
    results.push({ width, dir, tables: tables.length, ...wide, verdict: "pass" });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser?.close();
  stopServer();
}
