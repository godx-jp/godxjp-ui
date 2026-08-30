#!/usr/bin/env node
/**
 * check:frame-axe — per-frame accessibility CI gate (issue #157).
 *
 * Renders EVERY /frame/** contract example in real Chromium at desktop (1440×900) and
 * mobile-sm (375×667) and runs axe-core on each. Unlike `check:contrast` (6 hand-picked
 * pages) and the static `audit:examples` (0/0, source-only), this exercises the whole
 * catalog the way the audit that filed #157 did.
 *
 * Two independently-tracked axe scopes per frame/viewport:
 *   • PREVIEW CHROME  = the zoom/dimension toolbar (`.demo-block-toolbar`). WE own this.
 *     It MUST be 0 — a chrome violation FAILS the build.
 *   • COMPONENT/DEMO  = the rendered example + its Radix portals (everything except the
 *     toolbar). Owned by the per-component agents fixing #157's semantics in parallel.
 *     Allowlisted as a per-frame SET OF AXE RULE IDS (not exact node counts — those jitter
 *     with portal open/close timing). The set can ONLY SHRINK: a NEW rule on a frame fails
 *     the build; a rule that stops firing is a shrink hint. Nothing is hidden.
 *
 * Usage:
 *   node scripts/check-frame-axe.mjs [baseUrl]         # gate (default http://localhost:6008)
 *   node scripts/check-frame-axe.mjs --update-baseline  # re-snapshot (2-pass union) the allowlist
 *   node scripts/check-frame-axe.mjs --format json
 *   AXE_FRAMES_LIMIT=8 node scripts/check-frame-axe.mjs # quick local smoke (first N frames)
 *   AXE_RUNS=3 node scripts/check-frame-axe.mjs --update-baseline # more union passes
 *
 * The allowlist shrinks to zero as component PRs merge: after each merge, run
 * `--update-baseline` (or let CI auto-tighten) so the baseline can never grow back.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  DEFAULT_BASE,
  AXE_VIEWPORTS,
  REPO_ROOT,
  resolveChromiumExecutable,
  loadDeps,
  ensurePreviewServer,
  loadManifest,
  componentFrames,
} from "./frame-harness.mjs";

const BASELINE_PATH = path.join(REPO_ROOT, "scripts/frame-axe.baseline.json");
const EVIDENCE_DIR = path.join(REPO_ROOT, "audit-evidence/frame-axe");

const args = process.argv.slice(2);
const asJson = args.includes("--format") && args[args.indexOf("--format") + 1] === "json";
const updateBaseline = args.includes("--update-baseline");
const base = (args.find((a) => a.startsWith("http")) || DEFAULT_BASE).replace(/\/$/, "");
const limit = Number(process.env.AXE_FRAMES_LIMIT) || 0;

const C = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};
const log = (...a) => !asJson && console.log(...a);

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return { component: {} };
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  } catch {
    return { component: {} };
  }
}

/** Run axe on a scope and return [{ id, impact, nodes }]. */
async function scan(AxeBuilder, page, { include, exclude }) {
  let b = new AxeBuilder({ page });
  if (include) b = b.include(include);
  if (exclude) b = b.exclude(exclude);
  const { violations } = await b.analyze();
  return violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
}

async function main() {
  let deps;
  try {
    deps = await loadDeps();
  } catch (cause) {
    const msg = "check:frame-axe needs optional peers `playwright` + `@axe-core/playwright`";
    if (asJson) process.stdout.write(JSON.stringify({ status: "error", message: msg }) + "\n");
    else console.warn(`⚠ ${msg} — skipped. (${cause.message})`);
    return; // skip in a browser-less env rather than fail the build
  }
  const { chromium, AxeBuilder } = deps;

  // No initialiser: the catch below returns, so past this point stopServer is always the
  // real teardown returned by ensurePreviewServer.
  let stopServer;
  try {
    stopServer = await ensurePreviewServer(base);
  } catch (e) {
    if (asJson)
      process.stdout.write(JSON.stringify({ status: "error", message: e.message }) + "\n");
    // A preview that will not start is a BROKEN GATE, not a gate with nothing to do. Skipping it
    // let three browser gates report success on CI for weeks while never once loading a page —
    // and that green is what made me spend six rounds asking why the OTHER shards were red, when
    // none of them had ever worked. `CI=true` is the honest line: locally a missing browser or a
    // busy port is a reason to step aside, but on CI it is the failure itself.
    if (process.env.CI) throw e;
    else console.warn(`⚠ check:frame-axe skipped — ${e.message}.`);
    return;
  }

  const execPath = resolveChromiumExecutable();
  const browser = await chromium.launch(execPath ? { executablePath: execPath } : {});
  // @axe-core/playwright 4.10+ requires the context→page flow (browser.newPage() throws).
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let frames;
  try {
    const manifest = await loadManifest(page, base);
    frames = componentFrames(manifest);
  } catch (e) {
    await browser.close();
    stopServer();
    if (asJson)
      process.stdout.write(JSON.stringify({ status: "error", message: e.message }) + "\n");
    else console.error(`✗ ${e.message}`);
    process.exit(2);
  }
  if (limit) frames = frames.slice(0, limit);

  const baseline = loadBaseline();
  const results = [];
  const chromeHits = []; // { frame, viewport, rule, impact, nodes }
  const componentCurrent = {}; // frameId → viewport → rule → nodes
  const infraErrors = [];

  // Baseline generation can UNION several passes (AXE_RUNS>1) so intermittently-mounted
  // portals are captured — a rule-set the gate then never falsely regresses on. The gate
  // itself runs a single pass (a NEW rule outside the union baseline is a genuine problem).
  const RUNS = Math.max(1, Number(process.env.AXE_RUNS) || (updateBaseline ? 2 : 1));
  log(
    `· axe over ${frames.length} frame(s) × ${AXE_VIEWPORTS.length} viewport(s)` +
      `${RUNS > 1 ? ` × ${RUNS} pass(es)` : ""}…`,
  );
  let done = 0;
  for (let run = 0; run < RUNS; run++) {
    for (const frame of frames) {
      const record = { id: frame.id, viewports: {} };
      for (const vp of AXE_VIEWPORTS) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        const url = `${base}/frame/${encodeURIComponent(frame.id)}`;
        try {
          await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
          // Let Radix portals (Dialog/Popover/Sheet content) finish mounting so a demo's
          // overlay is consistently present at axe time — reduces open/closed count jitter.
          await page.waitForTimeout(800);
        } catch (e) {
          infraErrors.push({ frame: frame.id, viewport: vp.id, message: e.message.split("\n")[0] });
          continue;
        }
        let chrome, comp;
        try {
          // Chrome = the preview toolbar we own (zoom/dimension controls). Component/demo =
          // EVERYTHING else — the rendered frame AND Radix-portaled content (Dialog/Popover/
          // Sheet/Toast/Select) which mounts on document.body OUTSIDE `.demo-block-frame`.
          // Scoping component by `exclude(.demo-block-toolbar)` (not `include(.demo-block-frame)`)
          // keeps portaled demo violations attributed to the component, never to chrome.
          chrome = await scan(AxeBuilder, page, { include: ".demo-block-toolbar" });
          comp = await scan(AxeBuilder, page, { exclude: ".demo-block-toolbar" });
        } catch (e) {
          infraErrors.push({ frame: frame.id, viewport: vp.id, message: `axe: ${e.message}` });
          continue;
        }
        for (const v of chrome) chromeHits.push({ frame: frame.id, viewport: vp.id, ...v });
        for (const v of comp) {
          ((componentCurrent[frame.id] ??= {})[vp.id] ??= {})[v.id] ??= 0;
          componentCurrent[frame.id][vp.id][v.id] += v.nodes;
        }
        record.viewports[vp.id] = { chrome, component: comp };
      }
      if (run === 0) results.push(record);
      done++;
      if (!asJson && done % 20 === 0) log(`  …${done}/${frames.length * RUNS}`);
    }
  }

  await browser.close();
  stopServer();

  // Rule-PRESENCE per frame (union across viewports). We allowlist violation *types* per
  // frame, not exact node counts: axe counts jitter run-to-run (a Radix portal open vs
  // closed changes a count by ±1) which would make an exact-count gate flaky. A rule
  // leaving a frame's set is a real fix (shrink); a NEW rule on a frame is a real
  // regression. Node counts are still recorded in the evidence JSON for triage.
  const runFrameIds = new Set(frames.map((f) => f.id));
  const currentRules = {}; // fid → sorted unique rule ids
  let componentTotal = 0; // total node count (reporting only)
  for (const fid of Object.keys(componentCurrent)) {
    const rules = new Set();
    for (const vp of Object.keys(componentCurrent[fid])) {
      for (const [rule, n] of Object.entries(componentCurrent[fid][vp])) {
        rules.add(rule);
        componentTotal += n;
      }
    }
    if (rules.size) currentRules[fid] = [...rules].sort();
  }

  // ---- Baseline update mode -------------------------------------------------
  if (updateBaseline) {
    // Merge: overwrite the frames we actually ran, keep others — so a limited
    // `AXE_FRAMES_LIMIT=… --update-baseline` never silently drops un-run frames.
    const merged = { ...(baseline.component ?? {}) };
    for (const fid of runFrameIds) {
      if (currentRules[fid]) merged[fid] = currentRules[fid];
      else delete merged[fid]; // ran and is now clean → remove from allowlist
    }
    const out = {
      generatedAt: new Date().toISOString().slice(0, 10),
      note:
        "Per-frame COMPONENT/demo axe allowlist (violations INSIDE the rendered frame + its " +
        "portals). Each value is the set of axe rule ids still firing on that frame. It may " +
        "only SHRINK — a new rule on a frame fails CI. Chrome (the preview toolbar) is NOT " +
        "allowlisted: it must be 0. Regenerate after a component-fix PR merges: " +
        "`node scripts/check-frame-axe.mjs --update-baseline`.",
      component: Object.fromEntries(Object.entries(merged).sort(([a], [b]) => a.localeCompare(b))),
    };
    writeFileSync(BASELINE_PATH, JSON.stringify(out, null, 2) + "\n");
    log(
      `✓ baseline written → ${path.relative(REPO_ROOT, BASELINE_PATH)} ` +
        `(${Object.keys(out.component).length} frame(s) with component violations).`,
    );
    return;
  }

  // ---- Compare component rule-sets to baseline (run frames only) ------------
  const regressions = []; // NEW rule on a frame → blocking
  const shrinkHints = []; // rule gone from a frame → baseline can be tightened
  const baseComp = baseline.component ?? {};
  for (const fid of runFrameIds) {
    const cur = new Set(currentRules[fid] ?? []);
    // Baseline schema is `fid → [ruleId]`. Guard against a stale/foreign shape so a
    // schema drift degrades to "no allowlist for this frame" instead of crashing.
    const base_ = new Set(Array.isArray(baseComp[fid]) ? baseComp[fid] : []);
    for (const rule of cur) if (!base_.has(rule)) regressions.push({ frame: fid, rule });
    for (const rule of base_) if (!cur.has(rule)) shrinkHints.push({ frame: fid, rule });
  }

  // ---- Aggregate chrome by rule --------------------------------------------
  const chromeByRule = {};
  for (const h of chromeHits) {
    chromeByRule[h.id] ??= { impact: h.impact, nodes: 0, frames: new Set() };
    chromeByRule[h.id].nodes += h.nodes;
    chromeByRule[h.id].frames.add(`${h.frame}@${h.viewport}`);
  }
  const chromeFail = chromeHits.length > 0;
  const regressionFail = regressions.length > 0;
  const pass = !chromeFail && !regressionFail && infraErrors.length === 0;

  const summary = {
    status: pass ? "ok" : "fail",
    frames: frames.length,
    viewports: AXE_VIEWPORTS.map((v) => v.id),
    chromeViolations: chromeHits.reduce((n, h) => n + h.nodes, 0),
    componentViolations: componentTotal,
    componentRegressions: regressions.length,
    infrastructureErrors: infraErrors.length,
  };

  // ---- Evidence -------------------------------------------------------------
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const evidence = {
    generatedAt: new Date().toISOString(),
    base,
    summary,
    chrome: Object.fromEntries(
      Object.entries(chromeByRule).map(([k, v]) => [
        k,
        { impact: v.impact, nodes: v.nodes, frames: [...v.frames] },
      ]),
    ),
    componentCurrent,
    regressions,
    shrinkHints,
    infraErrors,
    results,
  };
  writeFileSync(
    path.join(EVIDENCE_DIR, "frame-axe-results.json"),
    JSON.stringify(evidence, null, 2) + "\n",
  );

  if (asJson) {
    process.stdout.write(JSON.stringify(evidence, null, 2) + "\n");
    process.exit(pass ? 0 : 1);
  }

  // ---- Human report ---------------------------------------------------------
  log(`\n${C.bold}Preview-chrome axe (blocking — must be 0):${C.reset}`);
  if (!chromeFail) {
    log(`  ${C.green}✓ 0 chrome violations across all ${frames.length} frame(s).${C.reset}`);
  } else {
    for (const [rule, v] of Object.entries(chromeByRule)) {
      log(
        `  ${C.red}✗ ${rule} (${v.impact}) — ${v.nodes} node(s) in ${v.frames.size} frame/viewport run(s)${C.reset}`,
      );
      log(`      e.g. ${[...v.frames].slice(0, 4).join(", ")}`);
    }
  }

  log(`\n${C.bold}Component/demo axe (allowlisted — baseline may only shrink):${C.reset}`);
  log(
    `  ${componentTotal} component violation node(s) remaining across ${Object.keys(componentCurrent).length} frame(s).`,
  );
  if (regressionFail) {
    log(`  ${C.red}✗ ${regressions.length} NEW violation-type(s) not in baseline:${C.reset}`);
    for (const r of regressions.slice(0, 40)) log(`      ${C.red}${r.frame}: ${r.rule}${C.reset}`);
  } else {
    log(`  ${C.green}✓ no new component violation types (rule-set within baseline).${C.reset}`);
  }
  if (shrinkHints.length) {
    log(
      `  ${C.yellow}↓ ${shrinkHints.length} baseline rule(s) no longer fire (component agents fixed them) — run --update-baseline to tighten:${C.reset}`,
    );
    for (const s of shrinkHints.slice(0, 25)) log(`      ${s.frame}: ${s.rule}`);
  }
  if (infraErrors.length) {
    log(`\n${C.red}Infrastructure errors (${infraErrors.length}):${C.reset}`);
    for (const e of infraErrors.slice(0, 20)) log(`  ${e.frame}@${e.viewport}: ${e.message}`);
  }

  log(
    `\nevidence → ${path.relative(REPO_ROOT, path.join(EVIDENCE_DIR, "frame-axe-results.json"))}`,
  );
  if (pass) {
    log(
      `\n${C.green}✓ check:frame-axe — chrome AA clean; component violations within allowlist.${C.reset}`,
    );
    process.exit(0);
  }
  log(
    `\n${C.red}✗ check:frame-axe FAILED${C.reset} — ` +
      `${chromeFail ? "preview-chrome has a11y violations; " : ""}` +
      `${regressionFail ? "component violations regressed above baseline; " : ""}` +
      `${infraErrors.length ? "some frames failed to load." : ""}`,
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
