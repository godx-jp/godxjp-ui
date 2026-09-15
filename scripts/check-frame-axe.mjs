#!/usr/bin/env node
/**
 * check:frame-axe — run the CONSUMER'S ruler on this package's own frames (gh#643).
 *
 * WHY THIS EXISTS, and it is a measured gap rather than a tidiness one. `scripts/visual-audit.mjs`
 * carries EIGHT rules; the consumer's nightly runs `@axe-core/playwright` with 68. Six of our eight
 * are design-language opinions with no axe equivalent (`oversaturated-accent`, `sibling-card-gap`,
 * `row-content-starved`, …) and a design system SHOULD own those. The other sixty — names, roles,
 * aria-*, contrast, focus order, target size — were checked nowhere in this repository and only in
 * a consumer that cannot fix the CSS, because the CSS is here.
 *
 * gh#639 is what that costs: a topbar shipped, every gate here said green, and `target-size` failed
 * in godx-jp/id's nightly. Worse, our own `target-size-min` could not have caught it at any
 * threshold — it measures a PAINTED BOX, and that failure was an obscured target (axe:
 * `partiallyObscured`, 8×28). Two rulers, and the disagreement only surfaces downstream.
 *
 * Same tag set as the consumer, so a number here means the same thing as a number there:
 *
 *     wcag2a · wcag2aa · wcag21aa · wcag22aa
 *
 * A BASELINE, NOT A CLEAN SHEET. The package did not start compliant, and a gate that fails the
 * whole build on its first day gets deleted rather than obeyed. `frame-axe-baseline.json` records
 * what was already failing when the gate landed; the gate fails on anything NEW and on any
 * baselined entry that grows. Entries are meant to be deleted as they are fixed — never added by
 * hand to make a red build green. `--update` rewrites it, and the diff is the review.
 *
 *   node scripts/check-frame-axe.mjs                 # every frame, 3 viewports
 *   node scripts/check-frame-axe.mjs --update        # rewrite the baseline
 *   node scripts/check-frame-axe.mjs --shard=2/4     # CI split
 *   node scripts/check-frame-axe.mjs /isolate/layout-topbar   # one route, while fixing
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import {
  REPO_ROOT,
  ensurePreviewServer,
  loadDeps,
  loadManifest,
  resolveChromiumExecutable,
} from "./frame-harness.mjs";

const argv = process.argv.slice(2);
const base = (
  argv.find((a) => a.startsWith("http")) ||
  process.env.PREVIEW_BASE ||
  "http://localhost:6008"
).replace(/\/$/, "");
const update = argv.includes("--update");
const explicitRoutes = argv.filter((a) => a.startsWith("/"));
const shardArg = argv.find((a) => a.startsWith("--shard="))?.slice("--shard=".length);
/**
 * `all` (default) · `showcase` · `isolate`. The merge lane runs `showcase` — thirty whole-page
 * frames, the only ones here shaped like the screens a consumer ships, and therefore the class
 * that gh#639 came from. The nightly runs `all`. See docs/FRAME-A11Y-CI.md for why the whole sweep
 * cannot sit in a five-minute lane.
 */
const scope = argv.find((a) => a.startsWith("--scope="))?.slice("--scope=".length) ?? "all";
if (!["all", "showcase", "isolate"].includes(scope)) {
  throw new Error(`--scope expects all|showcase|isolate, got "${scope}"`);
}

const BASELINE_PATH = path.join(REPO_ROOT, "frame-axe-baseline.json");
const EVIDENCE_DIR = path.join(REPO_ROOT, "audit-evidence/frame-axe");

/** The consumer's tag set, verbatim — the whole point is that the two rulers agree. */
const TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

/**
 * 320 is not decoration. It is WCAG 2.2 SC 1.4.10's reflow width, it is the width the consumer's
 * nightly runs, and it is the width gh#639 failed at while 390 passed.
 */
const VIEWPORTS = [
  { id: "1440", width: 1440, height: 900 },
  { id: "375", width: 375, height: 667 },
  { id: "320", width: 320, height: 568 },
];

function readBaseline() {
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  } catch {
    return { generatedAt: null, tags: TAGS, entries: {} };
  }
}

/** One stable key per (route, viewport, rule) — the unit a fix deletes. */
const keyOf = (route, viewport, ruleId) => `${route} @${viewport} ${ruleId}`;

function shardOf(list) {
  if (!shardArg) return list;
  const [index, count] = shardArg.split("/").map(Number);
  if (!Number.isInteger(index) || !Number.isInteger(count) || index < 1 || index > count) {
    throw new Error(`--shard expects i/n with 1 <= i <= n, got "${shardArg}"`);
  }
  return list.filter((_, i) => i % count === index - 1);
}

/**
 * Showcase ids, read from the catalog source. They are NOT in `window.__STORY_MANIFEST__` —
 * `preview/src/catalog.ts` drops `docs/showcase/**` on purpose, because a showcase is a standalone
 * page served from its own document rather than an entry in the component tree.
 */
function showcaseIds() {
  const src = readFileSync(path.join(REPO_ROOT, "preview/src/showcase-catalog.ts"), "utf8");
  return [...src.matchAll(/\n {4}id: "([^"]+)",/g)].map((m) => m[1]);
}

async function resolveRoutes(page) {
  if (explicitRoutes.length) return explicitRoutes;
  const manifest = await loadManifest(page, base);
  // Showcases included ON PURPOSE. They are the only frames in this repository shaped like a real
  // screen — a whole page, a landmark tree, a focus order — which is precisely the class the
  // component frames cannot reach and the consumer has been carrying alone.
  const isolate = scope === "showcase" ? [] : manifest.map((m) => `/isolate/${m.id}`);
  const showcase = scope === "isolate" ? [] : showcaseIds().map((id) => `/showcase/${id}`);
  return [...isolate, ...showcase].sort();
}

async function main() {
  const { chromium, AxeBuilder } = await loadDeps();
  const stopServer = await ensurePreviewServer(base);
  const browser = await chromium.launch(
    resolveChromiumExecutable() ? { executablePath: resolveChromiumExecutable() } : {},
  );

  const baseline = readBaseline();
  const found = {};
  const unexpected = [];
  const grown = [];
  let routes = [];

  try {
    const probe = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    routes = shardOf(await resolveRoutes(probe));
    await probe.close();

    /*
     * The three viewport passes run CONCURRENTLY, in their own browser contexts. Sequentially the
     * full sweep measured ~55 minutes (735 scans at ~4.5s); three contexts bring the wall clock to
     * roughly a third of that for the same work, which is what makes a showcase-scoped run fit
     * inside ci-browser.yml's five-minute budget at all.
     */
    await Promise.all(VIEWPORTS.map((viewport) => sweepViewport(browser, viewport, routes)));
  } finally {
    await browser.close();
    stopServer();
  }

  async function sweepViewport(browser, viewport, routes) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      // Motion off at the source. Two consecutive sweeps of identical code disagreed on five
      // `color-contrast` rows — a fade-in caught mid-flight renders text at partial opacity, and
      // axe scores whatever it finds. A gate that disagrees with itself gets ignored.
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    for (const route of routes) {
      /*
       * `domcontentloaded` + a BOUNDED settle, never `waitUntil: "networkidle"`. Some frames
       * never go idle — a chart tweening, a skeleton on a timer — and a hard networkidle wait
       * failed the whole sweep on one of them (`data-display-card-examples-detail-panel`, 30s)
       * after 40 clean routes. A gate that aborts on frame 41 measures nothing.
       */
      let status;
      try {
        const res = await page.goto(`${base}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: 30_000,
        });
        status = res?.status() ?? null;
        // A BOUNDED settle, and a short one. `networkidle` at 4s was paid in full by every frame
        // that never goes idle (a chart tweening, a skeleton on a timer) — measured at ~60 min
        // for one sweep. The preview is a STATIC build, so its assets are already in flight by
        // `domcontentloaded`; a bounded 1.2s `load` plus a fixed settle is enough.
        await page.waitForLoadState("load", { timeout: 1_200 }).catch(() => {});
        // Belt and braces with `reducedMotion` above: the library guards its own animations on
        // that query, but `tw-animate-css` utilities and any demo-local keyframe are not obliged
        // to, and one un-guarded fade is all it takes.
        await page
          .addStyleTag({
            content:
              "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}",
          })
          .catch(() => {});
        // Web fonts change glyph geometry, which changes which boxes overlap, which changes what
        // `color-contrast` resolves a background to.
        await page.evaluate(() => document.fonts?.ready).catch(() => {});
        await page.waitForTimeout(250);
      } catch (error) {
        status = `navigation failed: ${error.message.split("\n")[0]}`;
      }
      if (typeof status !== "number" || status >= 400) {
        // A route that does not render is a gate failure, never a skip: a missing page reports
        // zero violations, which reads exactly like a clean one.
        const key = keyOf(route, viewport.id, "route-did-not-render");
        found[key] = { count: 1, help: String(status ?? "no response") };
        if (!baseline.entries[key]) {
          unexpected.push({ key, count: 1, help: String(status ?? "no response") });
        }
        continue;
      }
      let results;
      try {
        results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      } catch (error) {
        const key = keyOf(route, viewport.id, "axe-did-not-run");
        found[key] = { count: 1, help: error.message.split("\n")[0] };
        if (!baseline.entries[key]) {
          unexpected.push({ key, count: 1, help: error.message.split("\n")[0] });
        }
        continue;
      }
      for (const violation of results.violations) {
        const key = keyOf(route, viewport.id, violation.id);
        found[key] = { count: violation.nodes.length, help: violation.help };
        const before = baseline.entries[key];
        if (!before) unexpected.push({ key, count: violation.nodes.length, help: violation.help });
        else if (violation.nodes.length > before.count) {
          grown.push({ key, from: before.count, to: violation.nodes.length });
        }
      }
    }
    await context.close();
  }

  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(
    path.join(EVIDENCE_DIR, "results.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), base, tags: TAGS, routes: routes.length, viewports: VIEWPORTS.map((v) => v.id), found }, null, 2)}\n`,
  );

  const total = Object.values(found).reduce((n, v) => n + v.count, 0);

  if (update) {
    writeFileSync(
      BASELINE_PATH,
      `${JSON.stringify({ generatedAt: new Date().toISOString(), tags: TAGS, entries: found }, null, 2)}\n`,
    );
    console.log(
      `✓ wrote frame-axe-baseline.json — ${Object.keys(found).length} entr(ies), ${total} node(s) ` +
        `across ${routes.length} route(s) × ${VIEWPORTS.length} viewport(s).`,
    );
    return;
  }

  // Entries in the baseline that no longer fire. Not an error — it is the gate's own progress
  // report, and the line that tells a fixer to delete the row.
  const fixed = Object.keys(baseline.entries).filter((k) => !found[k]);

  for (const u of unexpected) console.error(`✗ NEW  ${u.key} — ${u.count} node(s) · ${u.help}`);
  for (const g of grown) console.error(`✗ GREW ${g.key} — ${g.from} → ${g.to} node(s)`);
  if (fixed.length) {
    console.log(
      `· ${fixed.length} baselined entr(ies) no longer fire — run --update to drop them:\n  ` +
        fixed.slice(0, 20).join("\n  ") +
        (fixed.length > 20 ? `\n  …and ${fixed.length - 20} more` : ""),
    );
  }

  if (unexpected.length || grown.length) {
    console.error(
      `\n✗ check:frame-axe — ${unexpected.length} new and ${grown.length} grown violation(s) ` +
        `on ${routes.length} route(s) × ${VIEWPORTS.length} viewport(s), tags ${TAGS.join(" ")}. ` +
        `Fix them here; do NOT add rows to frame-axe-baseline.json to go green.`,
    );
    process.exit(1);
  }

  console.log(
    `\n✓ check:frame-axe — no new WCAG violations on ${routes.length} route(s) × ` +
      `${VIEWPORTS.length} viewport(s) (tags ${TAGS.join(" ")}); ` +
      `${Object.keys(found).length} baselined entr(ies) still open, ${total} node(s).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
