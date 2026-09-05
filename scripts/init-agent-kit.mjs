#!/usr/bin/env node
/** init-agent-kit — the FULL forcing-kit. */
import {
  ensureClaudeHooks,
  ensureClaudeMd,
  ensureMcpJson,
  shouldSkip,
  writeWorkflowMd,
} from "./_agent-setup.mjs";

const root = process.env.INIT_CWD || process.cwd();

const skip = shouldSkip(root);
if (skip === "self") {
  console.error("init-agent is for CONSUMER apps, not the @godxjp/ui repo itself.");
  process.exit(1);
}

const mcp = ensureMcpJson(root);
const hooks = ensureClaudeHooks(root);
const md = writeWorkflowMd(root);
const claudeMd = ensureClaudeMd(root);

console.log("\n  @godxjp/ui agent-kit installed:");
console.log(`    • .mcp.json — godx-ui MCP (${mcp})`);
console.log(
  `    • .claude/settings.json — ${hooks.length ? hooks.join(", ") : "hooks already present"}`,
);
console.log(`    • .claude/godxjp-ui-workflow.md — ${md ? "created" : "already present"}`);
console.log(`    • CLAUDE.md — godxjp-ui mandate (${claudeMd})`);
console.log(`
  The auto-audit hook now runs on every Write/Edit of a .tsx file and feeds findings
  back to the agent — it cannot skip the audit. Restart your agent to load the MCP + hooks.

  Optional hard gate (block bad UI from landing):
    • pre-commit:  node node_modules/@godxjp/ui/scripts/ui-audit.mjs resources/js || exit 1
    • CI step:     node node_modules/@godxjp/ui/scripts/ui-audit.mjs --quiet <your-ui-dirs>
`);
process.exit(0);
