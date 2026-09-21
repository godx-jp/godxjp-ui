#!/usr/bin/env node
/**
 * check:frame-overflow — text that does not fit the box it was given, across EVERY frame.
 *
 * WHY THIS GATE EXISTS. Six defects were reported on the live docs site in one sitting, and five
 * were the same failure wearing different clothes: the examples use TIDY data, so nothing ever
 * reaches an edge and nobody sees the edge break.
 *
 *   Progress ring   label font is FIXED at 12.47px on a 44px ring and on a 32px ring alike, so
 *                   "18/42" measures 32.6px inside a 32px ring and paints over the stroke. "0/42"
 *                   fits, which is why the demo looked fine.
 *   Legend          count cells are `text-align: start` and not in a fixed column, so a row whose
 *                   last value has one digit sits 8px right of a row whose last has two.
 *   ScrollArea      three demos had scrollHeight === clientHeight — a scroll component whose
 *                   example does not scroll.
 *   Descriptions    every value short, so no value ever wrapped or clipped.
 *
 * Every one of those is visible in a browser and invisible to every static gate this repo has.
 * jsdom lays nothing out, so `pnpm test` cannot see a single one. That is the hole.
 *
 * WHAT IT MEASURES. For every text-bearing element on every `/isolate/**` frame: does its ink
 * extend past the box that is supposed to contain it? Two shapes, because they fail differently:
 *
 *   CLIPPED   a clipping ancestor (`overflow: hidden|clip`) whose scrollWidth exceeds its
 *             clientWidth — the text is cut off and the reader never learns what it said.
 *   SPILLED   an absolutely-centred label wider than the element centring it — the text is
 *             legible but paints over its own container, which is the ring defect exactly.
 *
 * A BASELINE, NOT A CLEAN SWEEP. Turning this on found pre-existing debt, and a gate that fails
 * on day one gets disabled on day two. `preview/frame-overflow.baseline.json` records what was
 * there, the gate fails on anything NEW, and the number may only go down. That is the same shape
 * `check:no-hardcoded-css-values` uses for its 75 literals.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { DEFAULT_BASE, REPO_ROOT, resolveChromiumExecutable } from "./frame-harness.mjs";

const base = process.argv.find((a) => a.startsWith("http")) ?? DEFAULT_BASE;
const UPDATE = process.argv.includes("--update-baseline");
const BASELINE = path.join(REPO_ROOT, "preview/frame-overflow.baseline.json");

/** Every docs frame, derived the way the preview derives its route id — never a hand-kept list. */
function frameRoutes() {
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return e.name.endsWith(".tsx") && !e.name.startsWith("_") ? [full] : [];
    });
  return walk(path.join(REPO_ROOT, "docs"))
    .map((f) => path.relative(path.join(REPO_ROOT, "docs"), f).replace(/\.tsx$/, ""))
    .filter((rel) => !rel.startsWith("showcase/"))
    .map((rel) => rel.replace(/\//g, "-").toLowerCase())
    .sort();
}

/* Runs INSIDE the page. Kept as one string so there is no build step between what is reviewed and
 * what is measured. */
const PROBE = () => {
  const TOLERANCE = 1.5; // sub-pixel rounding, not a defect
  const out = [];
  const hasText = (el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);

  /* VISUALLY HIDDEN IS NOT OVERFLOWING. `sr-only` is a 1px box with `overflow: hidden` and
   * `clip-path: inset(50%)` — clipping its text is the entire technique. The first baseline run
   * reported 422 findings of which 420 were these, which would have buried the 2 real ones and
   * taught everyone to ignore the gate. A gate whose output is mostly noise is worse than none. */
  const visuallyHidden = (el, cs) =>
    el.clientWidth <= 1 ||
    el.clientHeight <= 1 ||
    /inset\(\s*50%/.test(cs.clipPath || "") ||
    /(^|\s)sr-only(\s|$)/.test(el.className?.toString() || "");

  for (const el of document.querySelectorAll("body *")) {
    if (!hasText(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (visuallyHidden(el, cs)) continue;
    const text = el.textContent.trim().slice(0, 40);
    if (!text) continue;

    // CLIPPED — this element clips its own overflowing text.
    const clips = /hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflowY);
    if (clips && el.scrollWidth > el.clientWidth + TOLERANCE && cs.textOverflow !== "ellipsis") {
      out.push({
        kind: "clipped",
        text,
        by: `${(el.scrollWidth - el.clientWidth).toFixed(1)}px`,
        sel: el.className?.toString().split(" ")[0] || el.tagName.toLowerCase(),
      });
      continue;
    }

    // SPILLED — a centred label wider than the box centring it (the ring-label shape).
    const parent = el.parentElement;
    if (!parent) continue;
    const pcs = getComputedStyle(parent);
    const centred =
      cs.position === "absolute" || pcs.display.includes("flex") || pcs.display.includes("grid");
    if (!centred) continue;
    const r = el.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    if (pr.width === 0 || pr.height === 0) continue;
    if (r.width > pr.width + TOLERANCE) {
      out.push({
        kind: "spilled",
        text,
        by: `${(r.width - pr.width).toFixed(1)}px`,
        sel: parent.className?.toString().split(" ")[0] || parent.tagName.toLowerCase(),
      });
    }
  }
  return out;
};

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (e) {
    if (process.env.CI) throw e;
    console.warn("⚠ check:frame-overflow skipped — playwright not installed (browser-only gate).");
    return;
  }
  const { ensurePreviewServer } = await import("./frame-harness.mjs");
  let stopServer;
  try {
    stopServer = await ensurePreviewServer(base);
  } catch (e) {
    if (process.env.CI) throw e;
    console.warn(`⚠ check:frame-overflow skipped — ${e.message}.`);
    return;
  }

  const exec = resolveChromiumExecutable();
  const browser = await chromium.launch(exec && existsSync(exec) ? { executablePath: exec } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const routes = frameRoutes();
  const found = {};
  let missing = 0;

  for (const id of routes) {
    try {
      await page.goto(`${base}/isolate/${id}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(250);
      /* A route that does not resolve renders a four-word "not found" card, which overflows
       * nothing and would be reported as clean — the exact way check:contrast once swept two
       * showcases that were never there. */
      const notFound = await page.evaluate(() =>
        /Preview not found/.test(document.body.innerText) ? true : false,
      );
      if (notFound) {
        missing += 1;
        continue;
      }
      const hits = await page.evaluate(PROBE);
      if (hits.length) found[id] = hits;
    } catch (e) {
      console.warn(`  ! ${id}: ${e.message.slice(0, 80)}`);
    }
  }
  await browser.close();
  await stopServer?.();

  const flat = Object.entries(found)
    .flatMap(([id, hits]) => hits.map((h) => `${id} · ${h.kind} · ${h.sel} · ${h.by} · ${h.text}`))
    .sort();

  if (UPDATE) {
    writeFileSync(
      BASELINE,
      JSON.stringify(
        {
          note: "Overflowing text recorded when check:frame-overflow was introduced. It may only SHRINK. Run with --update-baseline after fixing entries.",
          count: flat.length,
          entries: flat,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      `✓ baseline written — ${flat.length} overflowing element(s) across ${routes.length} frame(s).`,
    );
    return;
  }

  const prior = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : { entries: [] };
  const known = new Set(prior.entries);
  const added = flat.filter((f) => !known.has(f));
  const fixed = prior.entries.filter((f) => !flat.includes(f));

  if (added.length) {
    console.error(
      `✗ check:frame-overflow — ${added.length} NEW element(s) whose text does not fit:\n`,
    );
    for (const a of added) console.error(`  ${a}`);
    console.error(
      `\nEither give the text room, or let it wrap/ellipsize. ${routes.length} frames swept, ${missing} route(s) did not resolve.`,
    );
    process.exit(1);
  }
  console.log(
    `✓ check:frame-overflow — ${routes.length} frame(s) swept, ${flat.length} known overflow(s)` +
      `${fixed.length ? `, ${fixed.length} FIXED since the baseline (run --update-baseline to bank it)` : ""}.`,
  );
}

await main();
