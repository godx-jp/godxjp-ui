#!/usr/bin/env node
/**
 * `godxjp-ui mcp-call <tool> [json-args]` — query the godx-ui catalog without an MCP client
 * (gh#1324). It launches EXACTLY what the MCP client would — the repo's `.mcp.json` catalog entry
 * (command, args, env), or the version-pinned default when there is none — with `call <tool> …`
 * appended, so the answer comes from the same pinned server and the same `dispatchTool`.
 *
 * Network: the same as the MCP itself — `npx @godxjp/ui-mcp@<pin>` may download the server on a
 * cold npx cache, exactly as starting the MCP would.
 */
import { spawnSync } from "node:child_process";

import { findUiMcpConfig, mcpServerFor } from "./_agent-setup.mjs";

const root = process.env.INIT_CWD || process.cwd();
const found = findUiMcpConfig(root);
const entry = found?.entry ?? mcpServerFor(root);
const args = [...(Array.isArray(entry.args) ? entry.args : []), "call", ...process.argv.slice(2)];

const r = spawnSync(entry.command, args, {
  cwd: found?.dir ?? root,
  env: { ...process.env, ...(entry.env ?? {}) },
  // stdin closed: a server too old to know `call` starts its stdio loop, reads EOF and exits,
  // instead of waiting forever on the agent's terminal.
  stdio: ["ignore", "pipe", "inherit"],
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
  shell: process.platform === "win32", // npx is npx.cmd there
});
if (r.error) {
  console.error(`mcp-call: could not launch ${entry.command}: ${r.error.message}`);
  process.exit(1);
}
if (!r.stdout && r.status === 0) {
  console.error(
    `mcp-call: ${[entry.command, ...(entry.args ?? [])].join(" ")} printed nothing — that ` +
      "@godxjp/ui-mcp predates `call`. Upgrade @godxjp/ui and run `npx godxjp-ui sync-rules`.",
  );
  process.exit(1);
}
process.stdout.write(r.stdout ?? "", () => process.exit(r.status ?? 1));
