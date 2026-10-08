#!/usr/bin/env node
/**
 * Inert install (#1215): this script writes NOTHING into the consumer project. Agent files
 * (.mcp.json, CLAUDE.md block, .claude/godxjp-ui-workflow.md, .ai/rules/godxjp-ui.md) are written
 * only by the explicit `npx godxjp-ui sync-rules` (see `runSyncRules` in _agent-setup.mjs).
 * Silent in CI, when opted out, and when installing the library itself.
 */
import { shouldSkip } from "./_agent-setup.mjs";

try {
  if (!shouldSkip(process.env.INIT_CWD || process.cwd())) {
    console.log(
      "\n  @godxjp/ui: agent files are not written on install. Run `npx godxjp-ui sync-rules` to set them up (add --dry-run to preview).\n",
    );
  }
} catch {
  // Never fail an install over an optional hint.
}
process.exit(0);
