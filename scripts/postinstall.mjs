#!/usr/bin/env node
/**
 * Auto-registers the godx-ui MCP server in the consumer's `.mcp.json` so the agent gets live
 * access to the component catalog + audit rules WITHOUT any manual step. Non-destructive (only
 * adds a missing server entry) and guarded so it never runs in CI or in the library's own repo.
 */
import { ensureClaudeMd, ensureMcpJson, shouldSkip, writeWorkflowMd } from "./_agent-setup.mjs";

const root = process.env.INIT_CWD || process.cwd();

const skip = shouldSkip(root);
if (skip) process.exit(0); // silent: CI / opt-out / self-install / no consumer project

try {
  const r = ensureMcpJson(root);
  // The mandate is plain text the agent reads every turn (CLAUDE.md block + workflow file). It
  // changes nothing in the dev loop, so it is installed by default: an agent that never saw the
  // but no mandate). Only the hooks — which DO change the loop — stay behind `init-agent`.
  const md = ensureClaudeMd(root);
  const wf = writeWorkflowMd(root);
  if (r === "present" && md === "present" && !wf) process.exit(0); // already configured — stay quiet
  console.log(
    `\n  @godxjp/ui → MCP in .mcp.json (${r}); workflow mandate in CLAUDE.md (${md}).\n` +
      "  Your agent now has live component + audit guidance. Restart it to pick up the MCP.\n" +
      "  For auto-audit on every edit (PostToolUse + SessionStart hooks):\n" +
      "    npx @godxjp/ui init-agent\n",
  );
} catch {
  // Never fail an install over optional setup.
}
process.exit(0);
