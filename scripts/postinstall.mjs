#!/usr/bin/env node
/**
 * Auto-registers the godx-ui MCP server in the consumer's `.mcp.json` so the agent gets live
 * access to the component catalog + audit rules WITHOUT any manual step. Non-destructive (only
 * adds a missing server entry) and guarded so it never runs in CI or in the library's own repo.
 */
import {
  ensureClaudeMd,
  ensureMcpJson,
  ensureConsumerRules,
  refreshGuineaPigSkill,
  shouldSkip,
  writeWorkflowMd,
} from "./_agent-setup.mjs";
import { applyReactAriaHiddenSelectPatch } from "./patch-react-aria-hidden-select.mjs";

const root = process.env.INIT_CWD || process.cwd();

applyReactAriaHiddenSelectPatch(root);

const skip = shouldSkip(root);
if (skip) process.exit(0); // silent: CI / opt-out / self-install / no consumer project

try {
  const r = ensureMcpJson(root);
  // A refusal is a full sentence, not one of the three status words — say it on its own line
  // rather than folding it into "MCP in .mcp.json (…)", where it would read as a success.
  if (r.startsWith("left untouched")) {
    console.log(`\n  @godxjp/ui → .mcp.json ${r}\n`);
  }
  // The mandate is plain text the agent reads every turn (CLAUDE.md block + workflow file). It
  // changes nothing in the dev loop, so it is installed by default: an agent that never saw the
  // but no mandate). Only the hooks — which DO change the loop — stay behind `init-agent`.
  const md = ensureClaudeMd(root);
  if (md.startsWith("left untouched")) {
    console.log(`  @godxjp/ui → CLAUDE.md ${md}\n`);
  }
  const wf = writeWorkflowMd(root);
  const skill = refreshGuineaPigSkill(root);
  const rules = ensureConsumerRules(root);
  if (r.startsWith("left untouched") || md.startsWith("left untouched")) process.exit(0); // already reported
  if (r === "present" && md === "present" && !wf && !skill && !rules) process.exit(0); // current — stay quiet
  console.log(
    `\n  @godxjp/ui → MCP in .mcp.json (${r}); workflow mandate in CLAUDE.md (${md}).\n` +
      (rules ? `  common consumer rules in .ai/rules/godxjp-ui.md (glob ${rules}/**).\n` : "") +
      (skill ? "  guinea-pig skill refreshed to this version (your section 8 kept).\n" : "") +
      "  Your agent now has live component + audit guidance. Restart it to pick up the MCP.\n" +
      "  For auto-audit on every edit (PostToolUse + SessionStart hooks):\n" +
      "    npx @godxjp/ui init-agent\n",
  );
} catch {
  // Never fail an install over optional setup.
}
process.exit(0);
