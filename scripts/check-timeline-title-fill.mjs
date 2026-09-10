#!/usr/bin/env node
/**
 * check:timeline-title-fill — does a Timeline title actually OWN its row?
 *
 * `.ui-timeline-head` is a flex row: the title, then an optional `time` at the end. `title` is
 * typed `ReactNode`, so a consumer may hand it a Card, a truncating id, anything with a width of
 * its own — and every case in every frame before this one passed a bare STRING, which is already
 * narrower than the row. A title that shrink-wraps therefore looks pixel-identical to one that
 * fills, and the defect shipped invisible until a consumer passed a Card and watched it stop at
 * roughly a third of the body column.
 *
 * jsdom cannot see this: it does not lay out flex, so a render test asserting the title exists is
 * green against every one of the three failures below. Only a real engine measures it.
 *
 * THREE CLAIMS, one per line of the `.ui-timeline-title` rule:
 *   1. FILL      — the title reaches the row's right boundary (`time`'s left edge, or the head's
 *                  own right edge when there is no time). Broken by dropping `flex: 1 1 0%`.
 *   2. CONTAINED — `time` never escapes the head. Broken by dropping `min-inline-size: 0`, which
 *                  lets a title wider than the row push the time slot past the end.
 *   3. UNSQUEEZED— `time` is never narrower than its own natural width. Broken by a `flex` basis
 *                  of `auto`, which shares the shrink in proportion to the two bases and wraps a
 *                  CJK timestamp onto three lines.
 */
import { ensurePreviewServer, VIEWPORT_MATRIX } from "./frame-harness.mjs";
import { chromium } from "playwright";

const base = process.env.PREVIEW_BASE || `http://localhost:${process.env.PREVIEW_PORT || 6018}`;
const FRAME = "data-display-timeline";
/** Sub-pixel slop: layout arithmetic lands on fractional CSS pixels. */
const EPS = 1;

const stopServer = await ensurePreviewServer(base);

/**
 * Per-head geometry. `natural` is measured with an out-of-flow clone of the time slot sized to
 * `max-content` — appended INSIDE the head so it inherits the same font tokens, and absolutely
 * positioned so it is not itself a flex item and cannot perturb the row it is measuring.
 */
const measureHeads = () =>
  [...document.querySelectorAll(".ui-timeline-head")].map((head, index) => {
    const title = head.querySelector(".ui-timeline-title");
    const time = head.querySelector(".ui-timeline-time");
    if (!(title instanceof HTMLElement)) throw new Error(`head ${index} has no title`);
    const headRect = head.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(head).columnGap) || 0;

    let timeRect = null;
    let naturalTimeWidth = null;
    if (time instanceof HTMLElement) {
      timeRect = time.getBoundingClientRect();
      const probe = time.cloneNode(true);
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.inlineSize = "max-content";
      head.appendChild(probe);
      naturalTimeWidth = probe.getBoundingClientRect().width;
      probe.remove();
    }

    const boundary = timeRect ? timeRect.left : headRect.right;
    return {
      index,
      label: (title.textContent || "").replace(/\s+/g, " ").trim().slice(0, 28),
      gap,
      headWidth: +headRect.width.toFixed(1),
      titleWidth: +titleRect.width.toFixed(1),
      timeWidth: timeRect ? +timeRect.width.toFixed(1) : null,
      naturalTimeWidth: naturalTimeWidth === null ? null : +naturalTimeWidth.toFixed(1),
      // How much of the row the title left on the table. Anything past the flex gap is a title
      // that shrink-wrapped instead of growing.
      slack: +(boundary - titleRect.right).toFixed(1),
      // How far `time` sticks out of its own head. Positive is an escape.
      timeEscape: timeRect ? +(timeRect.right - headRect.right).toFixed(1) : null,
    };
  });

const results = [];
const failures = [];
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const width of VIEWPORT_MATRIX) {
    const page = await browser.newPage({ viewport: { width, height: 1400 } });
    await page.goto(`${base}/isolate/${FRAME}`, { waitUntil: "networkidle", timeout: 30_000 });
    await page.locator(".ui-timeline-head").first().waitFor({ timeout: 15_000 });
    await page.waitForTimeout(250);

    const heads = await page.evaluate(measureHeads);
    // A frame that renders nothing passes every assertion there is — the exact way check:contrast
    // once reported an unresolved route AA clean. Name the expected shapes instead.
    if (heads.length < 14) {
      throw new Error(`${width}px: only ${heads.length} timeline head(s) — did the frame render?`);
    }
    if (!heads.some((h) => h.timeWidth !== null) || !heads.some((h) => h.timeWidth === null)) {
      throw new Error(`${width}px: frame must carry BOTH timed and time-less rows`);
    }
    // The rich rows are the whole point: a bare string is narrower than the row either way.
    if (!heads.some((h) => h.label.includes("INV-2026-09-0001"))) {
      throw new Error(`${width}px: the over-wide title row is missing from the frame`);
    }

    for (const head of heads) {
      if (head.slack > head.gap + EPS) {
        failures.push(
          `${width}px · head ${head.index} "${head.label}" did NOT fill the row: ` +
            `${head.slack}px of slack past a ${head.gap}px gap (title ${head.titleWidth}px in a ${head.headWidth}px row)`,
        );
      }
      if (head.timeEscape !== null && head.timeEscape > EPS) {
        failures.push(
          `${width}px · head ${head.index} "${head.label}" pushed \`time\` ` +
            `${head.timeEscape}px past the end of its head`,
        );
      }
      if (head.timeWidth !== null && head.timeWidth < head.naturalTimeWidth - EPS) {
        failures.push(
          `${width}px · head ${head.index} "${head.label}" squeezed \`time\` to ` +
            `${head.timeWidth}px, below its natural ${head.naturalTimeWidth}px`,
        );
      }
    }
    results.push({ width, heads });
    await page.close();
  }
} finally {
  await browser?.close();
  stopServer();
}

if (failures.length) {
  console.error(`✗ check:timeline-title-fill — ${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(
  `✓ check:timeline-title-fill — ${results.length} width(s) × ${results[0].heads.length} timeline head(s): ` +
    `title fills the row, \`time\` stays inside it and keeps its natural width.`,
);
