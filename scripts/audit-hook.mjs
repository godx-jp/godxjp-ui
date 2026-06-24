#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook — the FORCING FUNCTION.
 *
 * Wired by `init-agent-kit.mjs` into a consumer's `.claude/settings.json` so that
 * after EVERY Write/Edit/MultiEdit of a .tsx/.ts file, the godxjp-ui static audit
 * runs on that file and its findings are fed straight back to the agent. The agent
 * cannot skip it — the harness runs the hook, not the agent's goodwill — so a
 * hand-rolled <label>+<Input>, a raw <button>, a loud palette colour, or an emoji
 * is surfaced the instant it is written, and the agent self-corrects.
 *
 * Contract: reads the hook JSON on stdin ({ tool_input: { file_path } }). Prints
 * findings to stderr and exits 2 when any are found (Claude Code feeds stderr back
 * to the model); exits 0 (silent) when the file is clean or irrelevant. Non-fatal —
 * it never blocks the edit, it just makes the agent SEE the issue.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const AUDIT = join(HERE, "ui-audit.mjs");

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, "utf8")); // fd 0 = the hook payload piped by Claude Code
  } catch {
    return null;
  }
}

const payload = readStdin();
const file = payload?.tool_input?.file_path ?? payload?.tool_input?.filePath;
if (!file || !/\.(tsx|ts)$/.test(file) || /\.(test|stories|d)\.tsx?$/.test(file)) process.exit(0);

// ui-audit exits 1 when it finds errors — execFileSync throws, but the JSON is still on
// e.stdout. Capture it either way; only a truly broken run (no stdout) is ignored.
let out;
try {
  out = execFileSync("node", [AUDIT, "--format", "json", file], { encoding: "utf8" });
} catch (e) {
  out = e.stdout?.toString();
}
let result;
try {
  result = JSON.parse(out);
} catch {
  process.exit(0); // never let an audit error break the edit flow
}

const findings = result.findings ?? [];
if (findings.length === 0) process.exit(0);

const lines = [
  `godxjp-ui audit flagged ${findings.length} issue(s) in this file — fix before moving on:`,
];
for (const f of findings) {
  lines.push(`  [${f.severity}] ${f.rule} (line ${f.line})${f.standard ? ` · ${f.standard}` : ""}`);
  lines.push(`    ${f.message}`);
}
lines.push(
  "Consult the godxjp-ui MCP (get_component / list_audit_rules) and use the real primitive — do not hand-roll.",
);
process.stderr.write(lines.join("\n") + "\n");
process.exit(2); // exit 2 → Claude Code surfaces stderr to the agent
