#!/usr/bin/env node
/**
 * check:descriptions-label-value-step — a Descriptions label and its value share ONE type step.
 *
 * The label used to be a hard-coded `text-muted-foreground text-xs` utility while the `<dd>` beside
 * it read `--descriptions-value-font-size`. `--font-size-xs` is ratio⁻¹ (≈12.5px) and
 * `--font-size-sm` IS `--font-size-base` (14px), so every row rendered its VALUE bigger than its
 * own LABEL — data outgrowing the word that names it. What separates the two is COLOUR, not size.
 *
 * Two faults, two claims, and they need different instruments:
 *
 *   1. STEP — `dt` and `dd` resolve to the same font-size, and the label still differs in colour.
 *      A static grep for `text-xs` would catch today's spelling and nothing else; this reads the
 *      COMPUTED value, so any future utility, cascade loss or retuned token is caught the same way.
 *
 *   2. KNOB — `--descriptions-label-font-size` is a REAL knob, not decoration. The gate overrides
 *      it at the document root and re-measures. A token declared in `descriptions.css` that no
 *      call site reads looks byte-identical to one that works (§4's lesson: an API that dies
 *      silently is indistinguishable from an API that runs), so the only honest test is to turn it
 *      and watch the pixels move. The same probe turns the VALUE token alone and asserts the label
 *      follows, which is the "locked together by construction" default the pair now ships with.
 *
 * jsdom cannot answer either question: it does not resolve a custom property declared in an
 * external stylesheet, so `getComputedStyle(dt).fontSize` there is the ambient default whatever
 * the component does.
 */
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

const base = process.env.PREVIEW_BASE || `http://localhost:${process.env.PREVIEW_PORT || 6019}`;
const FRAMES = ["data-display-descriptions", "data-display-data-table-examples-antd-parity"];
const WIDTHS = [390, 1440];
/** Sub-pixel slop — a rem-derived step lands on fractions. */
const EPS = 0.5;

const stopServer = await ensurePreviewServer(base);

const measurePairs = () =>
  [...document.querySelectorAll('[data-slot="descriptions-item"]')].map((item, index) => {
    const label = item.querySelector('[data-slot="descriptions-label"]');
    const value = item.querySelector('[data-slot="descriptions-value"]');
    if (!(label instanceof HTMLElement) || !(value instanceof HTMLElement)) {
      throw new Error(`descriptions item ${index} is missing a label or a value`);
    }
    const labelStyle = getComputedStyle(label);
    const valueStyle = getComputedStyle(value);
    return {
      index,
      label: (label.textContent || "").trim().slice(0, 20),
      layout: item.getAttribute("data-layout"),
      bordered: item.closest('[data-slot="descriptions"][data-bordered]') !== null,
      labelFontSize: parseFloat(labelStyle.fontSize),
      valueFontSize: parseFloat(valueStyle.fontSize),
      labelColor: labelStyle.color,
      valueColor: valueStyle.color,
    };
  });

/** Turn one custom property at the document root and report what the first pair then measures. */
const turnKnob = ([property, value]) => {
  document.documentElement.style.setProperty(property, value);
  const item = document.querySelector('[data-slot="descriptions-item"]');
  const label = item.querySelector('[data-slot="descriptions-label"]');
  const dd = item.querySelector('[data-slot="descriptions-value"]');
  const measured = {
    labelFontSize: parseFloat(getComputedStyle(label).fontSize),
    valueFontSize: parseFloat(getComputedStyle(dd).fontSize),
  };
  document.documentElement.style.removeProperty(property);
  return measured;
};

const failures = [];
let pairsSeen = 0;
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const frame of FRAMES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 1400 } });
      await page.goto(`${base}/isolate/${frame}`, { waitUntil: "networkidle", timeout: 30_000 });
      await page.locator('[data-slot="descriptions-item"]').first().waitFor({ timeout: 15_000 });
      await page.waitForTimeout(250);

      const pairs = await page.evaluate(measurePairs);
      // A frame that renders no pairs passes every assertion below — the shape that let
      // check:contrast report an unresolved route AA clean. Name the sample instead.
      if (pairs.length < 4) {
        throw new Error(`${frame}@${width}px: only ${pairs.length} label/value pair(s) rendered`);
      }
      pairsSeen += pairs.length;

      for (const pair of pairs) {
        const where = `${frame}@${width}px · item ${pair.index} "${pair.label}" (${pair.layout}${pair.bordered ? ", bordered" : ""})`;
        if (Math.abs(pair.labelFontSize - pair.valueFontSize) > EPS) {
          failures.push(
            `${where}: label ${pair.labelFontSize}px vs value ${pair.valueFontSize}px — the pair ` +
              `must share ONE type step` +
              (pair.valueFontSize > pair.labelFontSize
                ? "; the VALUE is the larger of the two, which is the fault this gate exists for"
                : ""),
          );
        }
        // Same size means colour is the ONLY thing left telling a label from its value.
        if (pair.labelColor === pair.valueColor) {
          failures.push(
            `${where}: label and value share the colour ${pair.labelColor} — with one type step ` +
              `between them, the muted label is the whole distinction`,
          );
        }
      }

      // The knob, turned. Only once per frame/width — it is a property of the stylesheet, not of
      // any one row.
      const labelKnob = await page.evaluate(turnKnob, ["--descriptions-label-font-size", "31px"]);
      if (Math.abs(labelKnob.labelFontSize - 31) > EPS) {
        failures.push(
          `${frame}@${width}px: --descriptions-label-font-size is not read by the label — set it ` +
            `to 31px and the label measured ${labelKnob.labelFontSize}px`,
        );
      }
      const valueKnob = await page.evaluate(turnKnob, ["--descriptions-value-font-size", "29px"]);
      if (Math.abs(valueKnob.valueFontSize - 29) > EPS) {
        failures.push(
          `${frame}@${width}px: --descriptions-value-font-size is not read by the value — set it ` +
            `to 29px and the value measured ${valueKnob.valueFontSize}px`,
        );
      }
      if (Math.abs(valueKnob.labelFontSize - 29) > EPS) {
        failures.push(
          `${frame}@${width}px: retuning the VALUE alone left the label at ` +
            `${valueKnob.labelFontSize}px instead of following it to 29px — the two have come ` +
            `unlocked, which is how they drifted a step apart in the first place`,
        );
      }

      await page.close();
    }
  }
} finally {
  await browser?.close();
  stopServer();
}

if (failures.length) {
  console.error(`✗ check:descriptions-label-value-step — ${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(
  `✓ check:descriptions-label-value-step — ${pairsSeen} rendered label/value pair(s) across ` +
    `${FRAMES.length} frame(s) × ${WIDTHS.length} width(s): one type step, distinct colours, ` +
    `and both font-size tokens are live knobs.`,
);
