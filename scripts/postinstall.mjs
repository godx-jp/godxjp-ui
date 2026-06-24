#!/usr/bin/env node
/**
 * postinstall — runs when a consumer installs @godxjp/ui. Auto-registers the godx-ui
 * MCP server in the consumer's `.mcp.json` so the agent gets live access to the
 * component catalog + audit rules WITHOUT any manual step. Non-destructive (only adds
 * a missing server entry) and guarded so it never runs in CI or in the library's own repo.
 *
 * The heavier forcing-kit (the auto-audit PostToolUse hook + the workflow mandate) is
 * left to an EXPLICIT `npx @godxjp/ui init-agent`, since hooks change the dev loop and
 * should be opted into, not forced on install. Set GODXJP_UI_SKIP_SETUP=1 to disable.
 */
import { ensureMcpJson, shouldSkip } from "./_agent-setup.mjs";

const root = process.env.INIT_CWD || process.cwd();

const skip = shouldSkip(root);
if (skip) process.exit(0); // silent: CI / opt-out / self-install / no consumer project

try {
  const r = ensureMcpJson(root);
  if (r === "present") process.exit(0); // already configured — stay quiet
  console.log(
    `\n  @godxjp/ui → registered the godx-ui MCP in .mcp.json (${r}).\n` +
      "  Your agent now has live component + audit guidance. Restart it to pick up the MCP.\n" +
      "  For the full forcing-kit (auto-audit on every edit + workflow mandate):\n" +
      "    npx @godxjp/ui init-agent\n",
  );
} catch {
  // Never fail an install over optional setup.
}
process.exit(0);
