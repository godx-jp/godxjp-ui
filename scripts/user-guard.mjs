#!/usr/bin/env node
/**
 * @godxjp/ui user-level guard — the SHIM `npx godxjp-ui init-agent --user` copies to
 * ~/.claude/hooks/godxjp-ui-guard.mjs (gh#1324).
 *
 * A repo's `.mcp.json`, CLAUDE.md and `.claude/settings.json` hooks load only when Claude Code
 * STARTS in that repo. A session started anywhere else writes UI blind: measured in godx-qc,
 * 0 of 25 UI-writing subagents had the godx-ui MCP and no audit fired. User settings always load,
 * so this shim is registered there for PreToolUse and PostToolUse on Write|Edit|MultiEdit.
 *
 * It runs on EVERY write in EVERY repo on the machine, so it does as little as possible: it
 * leaves unless the file is a .tsx/.jsx inside a repo whose `.mcp.json` mounts @godxjp/ui-mcp,
 * and then hands the payload to that repo's own installed `@godxjp/ui/scripts/agent-guard.mjs`,
 * which holds the logic and moves with the package version. Self-contained on purpose: it is a
 * copy that lives outside every package. No network.
 *
 * FAIL OPEN: any error in this shim — unreadable stdin, a malformed .mcp.json, a missing or older
 * package without agent-guard.mjs, a crash — exits 0, and a write is never blocked because the
 * guard itself broke. Only agent-guard.mjs's deliberate exit 2 blocks.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

process.on("uncaughtException", () => process.exit(0)); // fail open, see above

const event = process.argv[2] === "post" ? "post" : "pre";
let raw;
try {
  raw = readFileSync(0, "utf8"); // fd 0 = the hook payload piped by Claude Code
} catch {
  process.exit(0);
}
const payload = JSON.parse(raw); // a throw lands in the fail-open handler
const given = payload?.tool_input?.file_path ?? payload?.tool_input?.filePath;
if (typeof given !== "string" || !/\.(tsx|jsx)$/.test(given)) process.exit(0);
const file = resolve(payload?.cwd ?? process.cwd(), given);

/** Mirrors runsUiMcp in @godxjp/ui scripts/_agent-setup.mjs: the catalog server, any key. */
const runsUiMcp = (entry) =>
  [entry?.command, ...(Array.isArray(entry?.args) ? entry.args : [])].some(
    (part) => typeof part === "string" && /(^|\/)@godxjp\/ui-mcp(@|$)/.test(part),
  );

// The nearest ancestor `.mcp.json` decides: it mounts the catalog, or this is not our repo.
let root = null;
for (let dir = dirname(file); ; dir = dirname(dir)) {
  const cfg = join(dir, ".mcp.json");
  if (existsSync(cfg)) {
    const servers = JSON.parse(readFileSync(cfg, "utf8"))?.mcpServers ?? {};
    if (Object.values(servers).some(runsUiMcp) || servers["godx-ui"]) root = dir;
    break;
  }
  if (dirname(dir) === dir) break;
}
if (!root) process.exit(0);

// The repo's installed package, up the node_modules chain (a workspace hoists it to the top).
let guard = null;
for (let dir = root; ; dir = dirname(dir)) {
  const candidate = join(dir, "node_modules", "@godxjp", "ui", "scripts", "agent-guard.mjs");
  if (existsSync(candidate)) {
    guard = candidate;
    break;
  }
  if (dirname(dir) === dir) break;
}
if (!guard) process.exit(0); // not installed, or a release older than the guard: fail open

const r = spawnSync(process.execPath, [guard, event, root], {
  input: raw,
  encoding: "utf8",
  timeout: 45_000, // under Claude Code's 60s hook limit, so a slow guard still ends in exit 0
});
if (r.error || r.status === null) process.exit(0);
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
process.exit(r.status === 2 ? 2 : 0);
