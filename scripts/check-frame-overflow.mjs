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
 * WHERE IT RUNS. `verify:browser`, beside `check:text-ink-clip`, which is the complementary gate:
 * that one measures the VERTICAL axis — whether a clipped box contains its own glyph ink, the
 * descenders and diacritics Latin demo strings never reveal — and this one measures the
 * HORIZONTAL, text wider than the box it was given. Neither sees the other's defect, and the lane
 * already pays for Chromium.
 *
 * It is deliberately NOT exempt like `check:frame-axe`. That exemption is the owner's standing
 * rule about axe specifically; this gate found three real defects nobody had reported on its first
 * clean run, which is precisely the argument for it gating rather than waiting to be remembered.
 *
 * A BASELINE, NOT A CLEAN SWEEP. Turning this on found pre-existing debt, and a gate that fails
 * on day one gets disabled on day two. `preview/frame-overflow.baseline.json` records what was
 * there, the gate fails on anything NEW, and the number may only go down. That is the same shape
 * `check:no-hardcoded-css-values` uses for its 75 literals.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import {
  DEFAULT_BASE,
  REPO_ROOT,
  isolateRoutes,
  resolveChromiumExecutable,
} from "./frame-harness.mjs";

const base = process.argv.find((a) => a.startsWith("http")) ?? DEFAULT_BASE;
const UPDATE = process.argv.includes("--update-baseline");
const BASELINE = path.join(REPO_ROOT, "preview/frame-overflow.baseline.json");

/**
 * TWO WIDTHS, because one width was measuring one sixth of the problem.
 *
 * Every browser gate in this repo ran at 1280 and only at 1280. At 1280 this gate reports 0. The
 * first sweep at a phone width reported 24 elements across 3 frames — and after the reachability
 * rule above dismissed the two `ScrollArea`/`Tabs` demos that were simply scrolling, one was real:
 * `foundation-density` put 128px of unbreakable mono text into a 92px box with `overflow: visible`
 * and no scrollport anywhere above it, so 36px of ink painted over the neighbouring column with
 * no way to reach it.
 *
 * The cause is the kind that only exists narrow: three columns carrying `min-w-0 flex-1`, so
 * `wrap` can never fire — items that may shrink to nothing never reach the wrap threshold — and
 * at 375px you get three 92px columns instead of a stack. `Flex` has taken a responsive
 * `direction` the whole time; the page simply did not use it.
 *
 * 375 is the narrow rung because it is the iPhone SE / mini class and the narrowest width this
 * library claims to support. Anything that survives 375 survives 390 and 414.
 */
const VIEWPORTS = [
  { name: "w1280", width: 1280, height: 1000 },
  { name: "w375", width: 375, height: 800, mobile: true },
];

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

  /* REACHABLE IS NOT OVERFLOWING EITHER, and this one cost a false report before it was written.
   *
   * A `ScrollArea` demo at phone width puts 3008px of table inside a 309px viewport, and a
   * `Tabs overflow="scroll"` list puts 480px of tabs inside 131px. Both look exactly like a spill
   * — a child wider than its parent — and both are the component doing its job: the ink is one
   * swipe away. The thing that separates them from a real defect is not the amount, it is whether
   * ANY ancestor is a scrollport on that axis. So walk up and ask.
   *
   * Only `auto`/`scroll` counts. `hidden` is a clip, not a route: it hides the ink with no way to
   * reach it, which is the defect this gate is named after. */
  const reachableBy = (el, axis) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const acs = getComputedStyle(a);
      const over = axis === "x" ? acs.overflowX : acs.overflowY;
      const room = axis === "x" ? a.scrollWidth - a.clientWidth : a.scrollHeight - a.clientHeight;
      if (/auto|scroll/.test(over) && room > 1) return true;
    }
    return false;
  };

  for (const el of document.querySelectorAll("body *")) {
    if (!hasText(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (visuallyHidden(el, cs)) continue;
    const text = el.textContent.trim().slice(0, 40);
    if (!text) continue;

    // CLIPPED — this element clips its own overflowing text.
    const clips = /hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflowY);
    if (
      clips &&
      el.scrollWidth > el.clientWidth + TOLERANCE &&
      cs.textOverflow !== "ellipsis" &&
      !/auto|scroll/.test(cs.overflowX)
    ) {
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
    if (r.width > pr.width + TOLERANCE && !reachableBy(el, "x")) {
      out.push({
        kind: "spilled",
        text,
        by: `${(r.width - pr.width).toFixed(1)}px`,
        sel: parent.className?.toString().split(" ")[0] || parent.tagName.toLowerCase(),
      });
    }
  }

  /* THE LOUDEST RESPONSIVE DEFECT THERE IS, and nothing in this repo looked for it: a page that
   * scrolls SIDEWAYS on a phone. It is one number, it is free once Chromium is already here, and
   * it is 0 across all 192 frames today — so it gates at 0 from the first run rather than
   * arriving with debt. */
  const doc = document.documentElement;
  return { hits: out, pageOverflowX: +(doc.scrollWidth - doc.clientWidth).toFixed(1) };
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
  const routes = isolateRoutes();
  const found = {};
  let missing = 0;

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      ...(vp.mobile ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}),
    });
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
        const { hits, pageOverflowX } = await page.evaluate(PROBE);
        const all = [...hits];
        if (pageOverflowX > 1)
          all.push({
            kind: "sideways",
            text: "(the page itself)",
            by: `${pageOverflowX}px`,
            sel: "html",
          });
        if (all.length) found[`${vp.name} ${id}`] = all;
      } catch (e) {
        console.warn(`  ! ${vp.name} ${id}: ${e.message.slice(0, 80)}`);
      }
    }
    await page.close();
  }
  await browser.close();
  await stopServer?.();

  /* THE KEY MUST NOT CONTAIN A MEASUREMENT.
   *
   * It did — `frame · kind · selector · 41.8px · text` — and the first CI run reported all three
   * KNOWN findings as NEW, because the runner renders them at 41.2px, 5.4px and 58.0px against my
   * 41.8, 5.5 and 59.0. Font rasterisation differs by machine, so a baseline keyed on magnitude can
   * only ever match the machine that wrote it.
   *
   * The overflow is a fact about the LAYOUT; the exact pixel is a fact about the RENDERER, and only
   * the first belongs in an identity. The amount is carried alongside, reported on failure and
   * recorded under `lastMeasured` so a regression that gets WORSE is still visible. */
  const keyOf = (id, h) => `${id} · ${h.kind} · ${h.sel} · ${h.text}`;
  // `id` already carries the viewport name, so the same element at two widths is two identities —
  // which is right: a box that fits at 1280 and spills at 375 is a different fact from one that
  // spills at both, and fixing one must not silently bank the other.
  const flat = Object.entries(found)
    .flatMap(([id, hits]) => hits.map((h) => keyOf(id, h)))
    .sort();
  const amounts = Object.fromEntries(
    Object.entries(found).flatMap(([id, hits]) => hits.map((h) => [keyOf(id, h), h.by])),
  );

  if (UPDATE) {
    /* PRESERVE WHAT A HUMAN WROTE. The first version overwrote `note` and dropped `tracked` on
     * every regeneration, so whoever fixed an entry had to restore the issue link by hand and
     * discovered it only by reading the diff. A baseline that forgets why its entries exist is a
     * list of accepted debt, which is the opposite of the point. */
    const existing = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};
    writeFileSync(
      BASELINE,
      JSON.stringify(
        {
          note:
            existing.note ??
            "Text that renders outside its box. Every entry is a TRACKED defect, not accepted " +
              "debt. The list may only SHRINK: the gate fails on anything new. Entries are keyed " +
              "on frame/kind/selector/text and NOT on the pixel amount, which varies by renderer.",
          ...(existing.tracked ? { tracked: existing.tracked } : {}),
          count: flat.length,
          entries: flat,
          lastMeasured: amounts,
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
    for (const a of added) console.error(`  ${a}  (${amounts[a]})`);
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
