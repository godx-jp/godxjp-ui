#!/usr/bin/env node
/**
 * Measured gate for the three chart defects reported from a real 監理団体 dashboard (gh#409):
 *
 *  1. a horizontal `BarChart` gave the category axis a flat ~57px, so a Japanese company name
 *     (8–10 full-width glyphs, 100–125px) was painted OUTSIDE the chart box and clipped from the
 *     START — losing exactly the `株式会社` that identifies the row;
 *  2. `label` always painted a caption, so a chart inside a `Card` showed its title twice;
 *  4. recharts focuses its own `tabindex="-1"` layer groups on a mouse click, and the USER AGENT
 *     then paints its default accent outline on them — a selection ring around a graphic that is
 *     not a control.
 *
 * Everything below is read out of the live document at 1440×1000, after `document.fonts.ready`
 * and after the chart's enter animation has settled. Run with `pnpm test:visual:chart-cjk-axis`.
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  DEFAULT_BASE,
  REPO_ROOT,
  ensurePreviewServer,
  loadDeps,
  resolveChromiumExecutable,
} from "./frame-harness.mjs";

const evidenceDirectory = path.join(REPO_ROOT, "audit-evidence/chart-cjk-axis");
const STORY = "charts-cjk-category-axis";
const VIEWPORT = { width: 1440, height: 1000 };

/** The six 実習実施者 names from the issue, in the order the demo plots them. */
const COMPANIES = [
  "株式会社山田製作所",
  "佐藤食品株式会社",
  "株式会社中村建設",
  "東海精密工業株式会社",
  "みどり農産株式会社",
  "大和金属加工株式会社",
];

const cleanup = await ensurePreviewServer();
const { chromium } = await loadDeps({ axe: false });
mkdirSync(evidenceDirectory, { recursive: true });
const executablePath = resolveChromiumExecutable();
const browser = await chromium.launch(executablePath ? { executablePath } : {});

try {
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto(`${DEFAULT_BASE}/isolate/${STORY}`, { waitUntil: "load", timeout: 60_000 });
  await page.waitForSelector("#cjk-axis-chart .recharts-yAxis", {
    state: "attached",
    timeout: 60_000,
  });
  await page.evaluate(() => document.fonts.ready);
  // recharts animates the bars in; measure only once nothing is moving any more.
  await page.waitForTimeout(1500);

  const measured = await page.evaluate(() => {
    const readChart = (id) => {
      const figure = document.getElementById(id);
      const canvas = figure.querySelector(".ui-chart-canvas");
      const canvasBox = canvas.getBoundingClientRect();
      const caption = figure.querySelector("figcaption");
      const captionBox = caption.getBoundingClientRect();
      const ticks = [
        ...figure.querySelectorAll(
          ".recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value",
        ),
      ].map((node) => {
        const box = node.getBoundingClientRect();
        return {
          text: node.textContent,
          title: node.querySelector("title")?.textContent ?? null,
          width: Number(box.width.toFixed(1)),
          outsideBox: Number((canvasBox.left - box.left).toFixed(1)),
        };
      });
      return {
        canvasWidth: Number(canvasBox.width.toFixed(1)),
        // The axis' RESERVED width — recharts writes it onto the axis line, and it is the
        // number that was pinned at ~60px before this fix.
        axisWidth: Number(
          figure
            .querySelector(".recharts-yAxis .recharts-cartesian-axis-line")
            ?.getAttribute("width") ?? 0,
        ),
        captionPainted: captionBox.width > 1 && captionBox.height > 1,
        captionText: caption.textContent,
        captionId: caption.id,
        labelledBy: figure.getAttribute("aria-labelledby"),
        ticks,
      };
    };
    return {
      captioned: readChart("cjk-axis-chart"),
      uncaptioned: readChart("cjk-axis-chart-no-caption"),
    };
  });

  // Evidence first, assertions second: a FAILING run has to leave its numbers behind, otherwise
  // the before/after of a mutation test cannot be read off anything.
  writeFileSync(
    path.join(evidenceDirectory, "results.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), viewport: VIEWPORT, ...measured }, null, 2)}\n`,
  );

  // ── 1. the category axis holds its ticks ────────────────────────────────────────────────
  const chart = measured.captioned;
  assert.equal(
    chart.ticks.length,
    COMPANIES.length,
    `expected ${COMPANIES.length} category ticks, got ${chart.ticks.length}`,
  );
  for (const [index, tick] of chart.ticks.entries()) {
    const full = COMPANIES[index];
    assert.ok(
      tick.outsideBox <= 0.5,
      `"${full}" paints ${tick.outsideBox}px outside the chart box — it will be clipped from its START`,
    );
    const shown = tick.text.replace(/…$/, "");
    assert.ok(
      full.startsWith(shown) && shown.length > 0,
      `"${full}" rendered as "${tick.text}" — a category label may only ever be cut at its END`,
    );
    // At 1440 every one of these fits under the token cap, so nothing should be truncated at all.
    assert.equal(
      tick.text,
      full,
      `"${full}" was truncated to "${tick.text}" at ${VIEWPORT.width}px`,
    );
  }

  // ── 2. the caption is optional, the accessible name is not ──────────────────────────────
  assert.ok(chart.captionPainted, "showCaption defaults to true — the caption must still paint");
  assert.ok(
    !measured.uncaptioned.captionPainted,
    "showCaption={false} must not paint a visible caption (it duplicates the CardTitle)",
  );
  assert.equal(
    measured.uncaptioned.labelledBy,
    measured.uncaptioned.captionId,
    "showCaption={false} must keep aria-labelledby pointing at the (sr-only) figcaption",
  );
  assert.ok(
    measured.uncaptioned.captionText.trim().length > 0,
    "showCaption={false} must keep the accessible name in the DOM",
  );

  // ── 4. no user-agent selection ring on recharts' own tabindex="-1" groups ────────────────
  // recharts wraps its plot in `<g tabindex="-1">` z-index layers and focuses one on a mouse
  // click. Those are programmatic-focus-only, so they are never a Tab stop and suppressing their
  // ring costs no keyboard affordance — unlike the `<svg tabindex="0">` surface, which IS a tab
  // stop and deliberately keeps its ring.
  const bar = await page.locator("#cjk-axis-chart .recharts-bar-rectangle").first().boundingBox();
  await page.mouse.click(bar.x + bar.width / 2, bar.y + bar.height / 2);
  const focusRing = await page.evaluate(() => {
    const active = document.activeElement;
    const style = getComputedStyle(active);
    return {
      tag: active.tagName.toLowerCase(),
      tabIndex: active.getAttribute("tabindex"),
      className: active.getAttribute("class"),
      insideChart: Boolean(active.closest?.(".ui-chart-canvas")),
      outline: `${style.outlineColor} ${style.outlineStyle} ${style.outlineWidth}`,
      outlineStyle: style.outlineStyle,
      focusVisible: active.matches(":focus-visible"),
    };
  });
  assert.ok(
    focusRing.insideChart && focusRing.tabIndex === "-1",
    'clicking a bar should focus one of recharts\' own tabindex="-1" groups, got ' +
      `<${focusRing.tag} tabindex="${focusRing.tabIndex}"> (inside chart: ${focusRing.insideChart})`,
  );
  assert.equal(
    focusRing.outlineStyle,
    "none",
    `clicking a bar left a user-agent ring on <${focusRing.tag} tabindex="-1" class="${focusRing.className}">: ` +
      `outline ${focusRing.outline}`,
  );

  await page.screenshot({
    path: path.join(evidenceDirectory, `${VIEWPORT.width}x${VIEWPORT.height}.png`),
    fullPage: true,
  });
  writeFileSync(
    path.join(evidenceDirectory, "results.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), viewport: VIEWPORT, ...measured, focusRing }, null, 2)}\n`,
  );

  const widest = Math.max(...chart.ticks.map((t) => t.width));
  console.log(
    `PASS chart CJK category axis: ${chart.ticks.length} full-width names readable in a ` +
      `${chart.canvasWidth}px canvas (widest tick ${widest}px, axis ${chart.axisWidth}px, ` +
      `0px outside the box); caption optional and still the accessible name; no user-agent ring ` +
      `on the plot; evidence -> ${path.relative(REPO_ROOT, evidenceDirectory)}`,
  );
} finally {
  await browser.close();
  cleanup();
}
