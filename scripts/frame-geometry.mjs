#!/usr/bin/env node
/**
 * frame-geometry — systematic responsive viewport-matrix sweep (issue #163 §5).
 *
 * Renders every component /frame route across the required width matrix
 * (320·375·390·768·1024·1280·1440·1920) and flags, per frame, horizontal overflow and
 * clipped interactive controls inside the rendered example (`.demo-block-frame`). This is
 * the geometry counterpart to check:frame-axe (which owns a11y at 2 viewports).
 *
 * "Clipped" means UNREACHABLE, not merely out of the frame box — see the semantics on `measure`
 * in ./frame-geometry-measure.mjs before changing what this gate counts.
 *
 * Like the axe gate, it compares to a machine-readable baseline that may only SHRINK:
 * a NEW overflow above baseline fails; pre-existing ones (component agents' territory)
 * are allowlisted and printed in full. Chromium-driven; runs in a dedicated CI lane.
 *
 * Usage:
 *   node scripts/frame-geometry.mjs [baseUrl]
 *   node scripts/frame-geometry.mjs --update-baseline
 *   node scripts/frame-geometry.mjs --format json
 *   FRAME_GEOMETRY_LIMIT=8 node scripts/frame-geometry.mjs   # quick local smoke
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  DEFAULT_BASE,
  VIEWPORT_MATRIX,
  REPO_ROOT,
  resolveChromiumExecutable,
  loadDeps,
  ensurePreviewServer,
  loadManifest,
  componentFrames,
} from "./frame-harness.mjs";
import { measure } from "./frame-geometry-measure.mjs";

const BASELINE_PATH = path.join(REPO_ROOT, "scripts/frame-geometry.baseline.json");
const EVIDENCE_DIR = path.join(REPO_ROOT, "audit-evidence/frame-geometry");

const args = process.argv.slice(2);
const asJson = args.includes("--format") && args[args.indexOf("--format") + 1] === "json";
const updateBaseline = args.includes("--update-baseline");
const base = (args.find((a) => a.startsWith("http")) || DEFAULT_BASE).replace(/\/$/, "");
const limit = Number(process.env.FRAME_GEOMETRY_LIMIT) || 0;
const C = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};
const log = (...a) => !asJson && console.log(...a);

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return { frames: {} };
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  } catch {
    return { frames: {} };
  }
}

async function main() {
  let deps;
  try {
    deps = await loadDeps({ axe: false });
  } catch (cause) {
    const msg = "frame-geometry needs the optional peer `playwright`";
    if (asJson) process.stdout.write(JSON.stringify({ status: "error", message: msg }) + "\n");
    else console.warn(`⚠ ${msg} — skipped. (${cause.message})`);
    return;
  }
  const { chromium } = deps;

  // No initialiser: the catch below returns, so past this point stopServer is always the
  // real teardown returned by ensurePreviewServer.
  let stopServer;
  try {
    stopServer = await ensurePreviewServer(base);
  } catch (e) {
    if (asJson)
      process.stdout.write(JSON.stringify({ status: "error", message: e.message }) + "\n");
    else console.warn(`⚠ frame-geometry skipped — ${e.message}.`);
    return;
  }

  const execPath = resolveChromiumExecutable();
  const browser = await chromium.launch(execPath ? { executablePath: execPath } : {});
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let frames;
  try {
    frames = componentFrames(await loadManifest(page, base));
  } catch (e) {
    await browser.close();
    stopServer();
    if (asJson)
      process.stdout.write(JSON.stringify({ status: "error", message: e.message }) + "\n");
    else console.error(`✗ ${e.message}`);
    process.exit(2);
  }
  if (limit) frames = frames.slice(0, limit);

  const current = {}; // frameId → [widths with overflow/clip]
  const detail = {};
  const infraErrors = [];
  log(`· geometry sweep ${frames.length} frame(s) × ${VIEWPORT_MATRIX.length} width(s)…`);
  let done = 0;
  for (const frame of frames) {
    for (const w of VIEWPORT_MATRIX) {
      await page.setViewportSize({ width: w, height: 900 });
      try {
        await page.goto(`${base}/frame/${encodeURIComponent(frame.id)}`, {
          waitUntil: "networkidle",
          timeout: 30_000,
        });
        await page.waitForTimeout(350);
      } catch (e) {
        infraErrors.push({ frame: frame.id, width: w, message: e.message.split("\n")[0] });
        continue;
      }
      const m = await page.evaluate(measure);
      if (m.overflowX || m.clipped > 0) {
        (current[frame.id] ??= []).push(w);
        (detail[frame.id] ??= {})[w] = m;
      }
    }
    done++;
    if (!asJson && done % 20 === 0) log(`  …${done}/${frames.length}`);
  }

  await browser.close();
  stopServer();

  if (updateBaseline) {
    const out = {
      generatedAt: new Date().toISOString().slice(0, 10),
      note:
        "Per-frame widths with horizontal overflow / clipped controls. Allowlist — may only " +
        "SHRINK. Regenerate after a responsive-fix PR: `node scripts/frame-geometry.mjs --update-baseline`.",
      widths: VIEWPORT_MATRIX,
      frames: current,
    };
    writeFileSync(BASELINE_PATH, JSON.stringify(out, null, 2) + "\n");
    log(
      `✓ baseline written → ${path.relative(REPO_ROOT, BASELINE_PATH)} (${Object.keys(current).length} frame(s) with geometry issues).`,
    );
    return;
  }

  const baseline = loadBaseline().frames ?? {};
  const regressions = [];
  const shrinkHints = [];
  let totalIssueFrames = 0;
  const ids = new Set([...Object.keys(current), ...Object.keys(baseline)]);
  for (const id of ids) {
    const cur = new Set(current[id] ?? []);
    const base_ = new Set(baseline[id] ?? []);
    if (cur.size) totalIssueFrames++;
    for (const w of cur) if (!base_.has(w)) regressions.push({ frame: id, width: w });
    for (const w of base_) if (!cur.has(w)) shrinkHints.push({ frame: id, width: w });
  }

  const pass = regressions.length === 0 && infraErrors.length === 0;
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const evidence = {
    generatedAt: new Date().toISOString(),
    base,
    widths: VIEWPORT_MATRIX,
    summary: {
      frames: frames.length,
      framesWithIssues: totalIssueFrames,
      regressions: regressions.length,
      infrastructureErrors: infraErrors.length,
    },
    current,
    detail,
    regressions,
    shrinkHints,
    infraErrors,
  };
  writeFileSync(
    path.join(EVIDENCE_DIR, "frame-geometry-results.json"),
    JSON.stringify(evidence, null, 2) + "\n",
  );

  if (asJson) {
    process.stdout.write(JSON.stringify(evidence, null, 2) + "\n");
    process.exit(pass ? 0 : 1);
  }

  log(`\n${C.bold}Viewport-matrix geometry (widths ${VIEWPORT_MATRIX.join(",")}):${C.reset}`);
  log(
    `  ${totalIssueFrames} frame(s) with overflow/clipped controls at ≥1 width (allowlisted baseline).`,
  );
  if (regressions.length) {
    log(`  ${C.red}✗ ${regressions.length} NEW geometry regression(s) above baseline:${C.reset}`);
    for (const r of regressions.slice(0, 30))
      log(`      ${C.red}${r.frame} @ ${r.width}px${C.reset}`);
  } else log(`  ${C.green}✓ no geometry regressions above baseline.${C.reset}`);
  if (shrinkHints.length)
    log(
      `  ${C.yellow}↓ ${shrinkHints.length} baseline width(s) now clean — run --update-baseline to tighten.${C.reset}`,
    );
  if (infraErrors.length) {
    log(`  ${C.red}infra errors: ${infraErrors.length}${C.reset}`);
    for (const e of infraErrors.slice(0, 15)) log(`      ${e.frame}@${e.width}: ${e.message}`);
  }
  log(
    `  evidence → ${path.relative(REPO_ROOT, path.join(EVIDENCE_DIR, "frame-geometry-results.json"))}`,
  );
  if (!pass) {
    log(`${C.red}✗ frame-geometry FAILED — geometry regressed above baseline.${C.reset}`);
    process.exit(1);
  }
  log(`${C.green}✓ frame-geometry — no regressions.${C.reset}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
