#!/usr/bin/env node
/**
 * @godxjp/ui CLI — `npx @godxjp/ui <command>`.
 *   init-agent     scaffold the agent forcing-kit (MCP + auto-audit hook + mandate)
 *   sync-rules     refresh package-owned agent rules (same path as postinstall)
 *   audit          static UI audit (regex over source)
 *   visual-audit   runtime audit (Playwright + axe-core) against a running app
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MAP = {
  "init-agent": "init-agent-kit.mjs",
  "sync-rules": "postinstall.mjs",
  audit: "ui-audit.mjs",
  "visual-audit": "visual-audit.mjs",
};

const [cmd, ...rest] = process.argv.slice(2);
const script = MAP[cmd];
if (!script) {
  console.error("usage: godxjp-ui <init-agent | sync-rules | audit | visual-audit> [args]");
  process.exit(1);
}
const env =
  cmd === "sync-rules" ? { ...process.env, INIT_CWD: process.env.INIT_CWD ?? process.cwd() } : process.env;
const r = spawnSync("node", [join(HERE, script), ...rest], { stdio: "inherit", env });
process.exit(r.status ?? 0);
