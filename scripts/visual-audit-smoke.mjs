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
const TIMEOUT_MS = 120_000;
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
      // `detached` puts the child at the head of its own process group. Without it the timeout
      // below was unable to do its job: `child.kill()` signals the `node` child ONLY, leaving its
      // Chromium grandchild alive, and the grandchild inherited the stdout/stderr pipes. "close"
      // does not fire until the process has exited AND its stdio has ended, so the watchdog meant
      // to bound this at 2 minutes instead left the promise pending forever — the gate hung rather
      // than failing, which is the worst of the three possible outcomes.
      const child = spawn("node", [SCRIPT, base, "--format", "json"], {
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "";
      let stderr = "";
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (d) => (stdout += d));
      child.stderr.on("data", (d) => (stderr += d));

      // Second half of the same lesson: never make settling depend on the child cooperating.
      // `resolve` is idempotent, so whichever of the three paths arrives first decides.
      const settle = (extra) => {
        clearTimeout(timer);
        resolve({ stdout, stderr, ...extra });
      };
      const timer = setTimeout(() => {
        try {
          process.kill(-child.pid, "SIGKILL"); // the whole group, Chromium included
        } catch {
          child.kill("SIGKILL"); // no group (or already gone) — do what we can
        }
        settle({ timedOut: true });
      }, TIMEOUT_MS);
      child.on("close", () => settle({}));
      child.on("error", (spawnError) => settle({ spawnError }));
    });

    if (run.spawnError) {
      console.error(`✗ check:visual-audit — could not spawn the audit: ${run.spawnError.message}`);
      process.exit(1);
    }

    if (run.timedOut) {
      // Reported on its own rather than falling through to "did not emit valid JSON", which is
      // what a truncated stdout would otherwise look like — a misleading message for a hang.
      console.error(
        `✗ check:visual-audit — the audit did not finish within ${TIMEOUT_MS / 1000}s and was killed.`,
      );
      console.error("stdout so far:\n" + run.stdout);
      console.error("stderr so far:\n" + run.stderr);
      process.exit(1);
    }

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
    // `server.close()` only stops NEW connections; it stays pending while any established socket is
    // open, so a killed-but-still-connected Chromium would hang the exit right after the hang we
    // just fixed. Drop the live sockets first.
    server.closeAllConnections?.();
    server.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
