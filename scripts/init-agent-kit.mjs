#!/usr/bin/env node
/** init-agent-kit — the FULL forcing-kit. */
import {
  ensureClaudeHooks,
  ensureClaudeMd,
  ensureMcpJson,
  ensureUserGuard,
  outOfProjectUiMcpReport,
  shouldSkip,
  writeWorkflowMd,
} from "./_agent-setup.mjs";

// `--user` (gh#1324): the user-level guard. It touches no project file, so it needs no consumer
// package.json and is not refused anywhere — it is checked before shouldSkip on purpose.
if (process.argv.includes("--user")) {
  console.log("\n  @godxjp/ui user-level guard:");
  for (const line of ensureUserGuard()) console.log(`    • ${line}`);
  console.log(`
  Every Claude Code session now loads it, wherever it starts. Restart running sessions.
  A .tsx/.jsx write in a repo whose .mcp.json mounts @godxjp/ui-mcp is blocked until the agent
  consults the catalog; without the MCP it can use  npx --no-install @godxjp/ui mcp-call <tool>.
`);
  process.exit(0);
}

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
const outside = outOfProjectUiMcpReport(root);
if (outside) console.log(outside);
console.log(`
  The auto-audit hook now runs on every Write/Edit of a .tsx file and feeds findings
  back to the agent — it cannot skip the audit. Restart your agent to load the MCP + hooks.

  Optional hard gate (block bad UI from landing):
    • pre-commit:  node node_modules/@godxjp/ui/scripts/ui-audit.mjs resources/js || exit 1
    • CI step:     node node_modules/@godxjp/ui/scripts/ui-audit.mjs --quiet <your-ui-dirs>
`);
process.exit(0);
