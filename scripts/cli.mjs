#!/usr/bin/env node
/**
 * @godxjp/ui CLI — `npx @godxjp/ui <command>`.
 *   init-agent     scaffold the agent forcing-kit (MCP + auto-audit hook + mandate)
 *   audit          static UI audit (regex over source)
 *   visual-audit   runtime audit (Playwright + axe-core) against a running app
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MAP = {
  "init-agent": "init-agent-kit.mjs",
  audit: "ui-audit.mjs",
  "visual-audit": "visual-audit.mjs",
};

const [cmd, ...rest] = process.argv.slice(2);
const script = MAP[cmd];
if (!script) {
  console.error("usage: godxjp-ui <init-agent | audit | visual-audit> [args]");
  process.exit(1);
}
const r = spawnSync("node", [join(HERE, script), ...rest], { stdio: "inherit" });
process.exit(r.status ?? 0);
