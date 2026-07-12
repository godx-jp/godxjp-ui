#!/usr/bin/env node
/**
 * check:visual-audit — CI smoke test for scripts/visual-audit.mjs.
 *
 * Serves a fixture page that deliberately trips ALL FIVE runtime rule families, runs the
 * REAL CLI against it (`--format json`), and asserts each rule executed and produced a
 * finding — proving Chromium launch, browser-context creation, axe-core injection, and
 * every rule family work end-to-end with the installed peer versions.
 *
 * Skips (exit 0) when Playwright / @axe-core/playwright are unavailable (browserless CI),
 * matching scripts/check-contrast.mjs. Wired into `verify:release` and npm-publish CI.
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE = readFileSync(join(HERE, "__fixtures__", "visual-audit-fixture.html"));
const SCRIPT = join(HERE, "visual-audit.mjs");
const EXPECTED = [
  "axe-violations",
  "target-size-min",
  "oversaturated-accent",
  "emoji-rendered",
  "alert-controls-misplaced",
];

async function peersAvailable() {
  try {
    await import("playwright");
    await import("@axe-core/playwright");
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await peersAvailable())) {
    console.warn(
      "⚠ check:visual-audit skipped — playwright/@axe-core/playwright not installed (browser-only gate).",
    );
    return;
  }

  const server = createServer((_req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(FIXTURE);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    // Async spawn (NOT spawnSync) so this process's HTTP server keeps serving the
    // fixture to the child's Chromium — a synchronous spawn would block the event loop.
    const run = await new Promise((resolve) => {
      const child = spawn("node", [SCRIPT, base, "--format", "json"], { encoding: "utf8" });
      let stdout = "";
      let stderr = "";
      const timer = setTimeout(() => child.kill("SIGKILL"), 120_000);
      child.stdout.on("data", (d) => (stdout += d));
      child.stderr.on("data", (d) => (stderr += d));
      child.on("close", () => {
        clearTimeout(timer);
        resolve({ stdout, stderr });
      });
    });

    let result;
    try {
      result = JSON.parse(run.stdout);
    } catch {
      console.error("✗ check:visual-audit — audit did not emit valid JSON.");
      console.error("stdout:", run.stdout);
      console.error("stderr:", run.stderr);
      process.exit(1);
    }

    const problems = [];
    if (result.status !== "ok")
      problems.push(
        `status="${result.status}" (expected "ok"); infra errors: ${JSON.stringify(result.errors)}`,
      );
    const fired = new Set((result.findings ?? []).map((f) => f.rule));
    for (const id of EXPECTED) if (!fired.has(id)) problems.push(`rule "${id}" did not fire`);

    if (problems.length) {
      console.error("✗ check:visual-audit — the runtime audit did not behave as expected:");
      for (const p of problems) console.error(`  - ${p}`);
      console.error("stdout:\n" + run.stdout);
      process.exit(1);
    }

    console.log(
      `✓ check:visual-audit — Chromium launch + context + axe injection OK; ` +
        `all ${EXPECTED.length} rule families fired (${result.findings.length} finding(s)).`,
    );
  } finally {
    server.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
