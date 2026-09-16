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
 * TWO STATES PER ROUTE, NOT ONE (#355, restored in gh#643 item 4). A menu, dialog, listbox or
 * popover that is closed at rest paints nothing, so every rule whose CONDITION only exists while an
 * overlay is open — `aria-hidden-focus` first among them — was outside this gate's field of view
 * rather than passing it. A demo declares its open step with `data-axe-open`; the gate presses it,
 * waits for the overlay to actually mount, and scans again. Those rows are keyed `@<viewport>+open`.
 * A declaration whose overlay never appears is a GATE FAILURE, not a silent skip — a broken
 * declaration reads exactly like a clean frame.
 *
 * A BASELINE, NOT A CLEAN SHEET. The package did not start compliant, and a gate that fails the
 * whole build on its first day gets deleted rather than obeyed. `frame-axe-baseline.json` records
 * what was already failing when the gate landed; the gate fails on anything NEW and on any
 * baselined entry that grows. Entries are meant to be deleted as they are fixed — never added by
 * hand to make a red build green. `--update` rewrites it, and the diff is the review.
 *
 *   node scripts/check-frame-axe.mjs                 # every frame, 3 viewports
 *   node scripts/check-frame-axe.mjs --update        # rewrite the baseline (FULL sweeps only)
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

/**
 * A PARTIAL RUN MAY NOT WRITE THE LEDGER, AND THIS IS A RESTORED GUARD, NOT A NEW ONE.
 *
 * `b367b832` enforced it (*"--update-baseline TỪ CHỐI chạy dưới chế độ shard"*) and the rewrite in
 * 24.1.0 dropped it along with the overlay scope. `--update` writes `entries` from what THIS run
 * found, so `--update --shard=1/4` rewrites the file from a quarter of the frames and silently
 * deletes the other three quarters — the ledger goes green by forgetting, which is the one move
 * this file exists to make visible. `--scope=` has the identical shape and the same hole.
 *
 * Latent rather than harmless: it does nothing today only because the ledger is at 0 rows, and it
 * goes live the moment one row is recorded. Explicit routes are covered too — they are the
 * narrowest partition of all.
 */
if (update && (shardArg || scope !== "all" || explicitRoutes.length)) {
  throw new Error(
    "--update cannot run under --shard, --scope or an explicit route list: a partial run sees a " +
      "FRACTION of the frames, so writing the baseline from it DELETES every row it did not " +
      "visit. Regenerate from a full sweep.",
  );
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

/**
 * DOM contract for the declared open step.
 *
 * A demo opts in by putting `data-axe-open` on the trigger it wants pressed — or, when the
 * component owns its own trigger DOM and forwards no `data-*` to it (`DatePicker`, the
 * data-driven `Select`), on the nearest element that DOES forward, with the gate resolving the
 * real control inside it. `data-axe-open="contextmenu"` right-clicks the declaring element
 * instead, for the one gesture nothing else reaches.
 */
const OPEN_DECLARATION = "[data-axe-open]";
/** Controls a press can open an overlay from. Deliberately narrow — see the resolution above. */
const OPEN_TARGET =
  'button, [role="button"], [role="combobox"], [role="menuitem"], a[href], summary';
/** An overlay that has actually mounted. Radix and react-aria both portal every one of these. */
const OVERLAY_MOUNTED =
  '[data-radix-popper-content-wrapper], [role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';

/**
 * Perform the route's declared open step. Returns false when nothing is declared (the vast
 * majority of routes, which then cost nothing). Throws when a declaration exists but no overlay
 * ever mounted — a broken declaration is a broken gate, and the caller records it as a violation.
 */
async function openDeclaredOverlay(page) {
  const declaration = page.locator(OPEN_DECLARATION).first();
  if ((await declaration.count()) === 0) return false;
  // JSX `data-axe-open` with no value renders as "true"; only `contextmenu` selects a gesture.
  const gesture =
    (await declaration.getAttribute("data-axe-open")) === "contextmenu" ? "contextmenu" : "click";
  // Some demos deliberately render an overlay OPEN at rest (a `defaultOpen` menu, so the closed
  // state is not the only one anything ever measures). A modal one makes the rest of the page
  // inert, so the declared trigger cannot be pressed while it stands. Dismissing first also makes
  // this a real closed → open transition rather than whatever the demo happened to leave mounted.
  for (let i = 0; i < 3 && (await page.locator(OVERLAY_MOUNTED).count()) > 0; i++) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
  }
  const isTarget = await declaration.evaluate((el, sel) => el.matches(sel), OPEN_TARGET);
  const target =
    gesture === "contextmenu" || isTarget ? declaration : declaration.locator(OPEN_TARGET).first();
  const before = await page.locator(OVERLAY_MOUNTED).count();
  await target.click({ button: gesture === "contextmenu" ? "right" : "left", timeout: 10_000 });
  // Settle on the OVERLAY, never on a timer: wait until one more is mounted than before the press.
  await page.waitForFunction(
    ({ sel, n }) => document.querySelectorAll(sel).length > n,
    { sel: OVERLAY_MOUNTED, n: before },
    { timeout: 8_000 },
  );
  // Animations are already zeroed above; this is the commit-and-position beat, not a fade.
  await page.waitForTimeout(200);
  return true;
}

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
  /** Routes whose declared open step actually ran, for the summary line. */
  const opened = new Set();

  /** Record one row and judge it against the ledger. The only place either verdict is decided. */
  function record(route, viewport, ruleId, count, help) {
    const key = keyOf(route, viewport, ruleId);
    found[key] = { count, help };
    const before = baseline.entries[key];
    if (!before) unexpected.push({ key, count, help });
    else if (count > before.count) grown.push({ key, from: before.count, to: count });
  }

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
        record(route, viewport.id, "route-did-not-render", 1, String(status ?? "no response"));
        continue;
      }
      let results;
      try {
        results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      } catch (error) {
        record(route, viewport.id, "axe-did-not-run", 1, error.message.split("\n")[0]);
        continue;
      }
      for (const violation of results.violations) {
        record(route, viewport.id, violation.id, violation.nodes.length, violation.help);
      }

      /*
       * The overlay state, and it runs LAST because opening one is destructive to the default
       * state the scan above measures. Only routes that declare an open step pay anything at all.
       */
      const openViewport = `${viewport.id}+open`;
      let didOpen;
      try {
        didOpen = await openDeclaredOverlay(page);
      } catch (error) {
        // A declaration that never opens is the worst outcome available: the route reports the
        // overlay rules as clean while never having entered the state they live in. Red, loudly.
        record(route, openViewport, "overlay-did-not-open", 1, error.message.split("\n")[0]);
        continue;
      }
      if (!didOpen) continue;
      opened.add(route);
      try {
        results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      } catch (error) {
        record(route, openViewport, "axe-did-not-run", 1, error.message.split("\n")[0]);
        continue;
      }
      for (const violation of results.violations) {
        record(route, openViewport, violation.id, violation.nodes.length, violation.help);
      }
    }
    await context.close();
  }

  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(
    path.join(EVIDENCE_DIR, "results.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), base, tags: TAGS, routes: routes.length, viewports: VIEWPORTS.map((v) => v.id), openedRoutes: [...opened].sort(), found }, null, 2)}\n`,
  );

  const total = Object.values(found).reduce((n, v) => n + v.count, 0);
  // A count nobody can read is a count nobody checks. `declared` is the promise, `opened` is the
  // delivery, and the two disagreeing is exactly the failure `overlay-did-not-open` reports.
  const overlay = `${opened.size} route(s) opened a declared overlay`;

  if (update) {
    writeFileSync(
      BASELINE_PATH,
      `${JSON.stringify({ generatedAt: new Date().toISOString(), tags: TAGS, entries: found }, null, 2)}\n`,
    );
    console.log(
      `✓ wrote frame-axe-baseline.json — ${Object.keys(found).length} entr(ies), ${total} node(s) ` +
        `across ${routes.length} route(s) × ${VIEWPORTS.length} viewport(s); ${overlay}.`,
    );
    return;
  }

  // Entries in the baseline that no longer fire. Not an error — it is the gate's own progress
  // report, and the line that tells a fixer to delete the row.
  //
  // ONLY A FULL SWEEP MAY ASK THIS QUESTION (the other half of b367b832's shard contract, lost in
  // the same rewrite). A shard sees a fraction of the frame list, so every row belonging to a
  // SIBLING shard has no hit in `found` and reads as fixed — and the line below would then tell a
  // fixer to `--update` them away. `--scope=` and an explicit route list partition it just as
  // hard. Suppressed rather than approximated: a count that is right for one partition and wrong
  // for the next is worse than no count.
  const partialRun = Boolean(shardArg) || scope !== "all" || explicitRoutes.length > 0;
  const fixed = partialRun ? [] : Object.keys(baseline.entries).filter((k) => !found[k]);
  if (partialRun && Object.keys(baseline.entries).length) {
    console.log(
      "· partial run — not reporting which baselined entries no longer fire; only a full sweep " +
        "sees every frame.",
    );
  }

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
        `on ${routes.length} route(s) × ${VIEWPORTS.length} viewport(s) (${overlay}), ` +
        `tags ${TAGS.join(" ")}. ` +
        `Fix them here; do NOT add rows to frame-axe-baseline.json to go green.`,
    );
    process.exit(1);
  }

  console.log(
    `\n✓ check:frame-axe — no new WCAG violations on ${routes.length} route(s) × ` +
      `${VIEWPORTS.length} viewport(s), ${overlay} (tags ${TAGS.join(" ")}); ` +
      `${Object.keys(found).length} baselined entr(ies) still open, ${total} node(s).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
