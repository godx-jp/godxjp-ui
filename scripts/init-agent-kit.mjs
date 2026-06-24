#!/usr/bin/env node
/**
 * init-agent-kit — the FULL forcing-kit. Run once from a consumer app:
 *   npx @godxjp/ui init-agent
 *
 * Scaffolds (idempotent, non-destructive) the harness-enforced workflow so an agent
 * follows the whole godxjp-ui process every time it touches UI:
 *   1. .mcp.json            — registers the godx-ui MCP (component + audit guidance)
 *   2. .claude/settings.json — PostToolUse hook auto-runs the audit on every .tsx edit
 *                              and feeds findings back; SessionStart injects the mandate
 *   3. .claude/godxjp-ui-workflow.md — the per-session mandate the SessionStart hook reads
 *
 * Existing config is preserved (hooks are appended only if absent). It then prints the
 * optional pre-commit / CI snippets.
 */
import { ensureClaudeHooks, ensureMcpJson, shouldSkip, writeWorkflowMd } from "./_agent-setup.mjs";

const root = process.env.INIT_CWD || process.cwd();

const skip = shouldSkip(root);
if (skip === "self") {
  console.error("init-agent is for CONSUMER apps, not the @godxjp/ui repo itself.");
  process.exit(1);
}

const mcp = ensureMcpJson(root);
const hooks = ensureClaudeHooks(root);
const md = writeWorkflowMd(root);

console.log("\n  @godxjp/ui agent-kit installed:");
console.log(`    • .mcp.json — godx-ui MCP (${mcp})`);
console.log(
  `    • .claude/settings.json — ${hooks.length ? hooks.join(", ") : "hooks already present"}`,
);
console.log(`    • .claude/godxjp-ui-workflow.md — ${md ? "created" : "already present"}`);
console.log(`
  The auto-audit hook now runs on every Write/Edit of a .tsx file and feeds findings
  back to the agent — it cannot skip the audit. Restart your agent to load the MCP + hooks.

  Optional hard gate (block bad UI from landing):
    • pre-commit:  node node_modules/@godxjp/ui/scripts/ui-audit.mjs resources/js || exit 1
    • CI step:     node node_modules/@godxjp/ui/scripts/ui-audit.mjs --quiet <your-ui-dirs>
`);
process.exit(0);
