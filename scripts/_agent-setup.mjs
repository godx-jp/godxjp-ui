/**
 * Shared agent-setup helpers — used by both postinstall.mjs (auto, on install) and
 * init-agent-kit.mjs (explicit, full kit). Every writer is IDEMPOTENT and
 * NON-DESTRUCTIVE: it only creates a missing file or ADDS a missing key, never
 * overwrites existing config.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** The godxjp-ui MCP server — pulled on demand via npx (no extra dependency to ship). */
export const MCP_SERVER = { command: "npx", args: ["@godxjp/ui-mcp"] };
export const MCP_KEY = "godx-ui";

/** Commands wired into the consumer's .claude/settings.json. */
export const AUDIT_HOOK_CMD = "node node_modules/@godxjp/ui/scripts/audit-hook.mjs";
export const PRIMER_CMD = "cat .claude/godxjp-ui-workflow.md";

/** The per-session workflow mandate the SessionStart hook injects into the agent. */
export const WORKFLOW_MD = `# @godxjp/ui — mandatory workflow (read every session)

You are building UI in an app that uses @godxjp/ui. Follow this EVERY time you create
or change a component, page, or form — no exceptions.

## Before writing UI
1. **MCP-first.** Consult the godx-ui MCP: \`get_component <Name>\`, \`search_components\`,
   \`list_audit_rules\`, \`list_visual_checks\`. Never guess a prop; never hand-roll what a
   primitive already does.
2. **Real primitives only.** No raw \`<input>/<select>/<button>/<textarea>/<table>\`, no
   styled-div fakes. A labelled control ALWAYS goes in \`<FormField label=…>\` (it owns the
   label↔control wiring, error/aria, AND the field rhythm). Never pair a bare \`<Label>\`
   with an \`<Input>\`.
3. **Tokens, not literals.** Semantic colour tokens (bg-primary, text-muted-foreground),
   token spacing/size/radius/type — no raw palette (bg-blue-600), no hex, no arbitrary
   \`[13px]\`. No emoji in product UI. Logical CSS (ms-/me-/ps-/pe-) for RTL.

## After writing UI
4. **Audit (runs automatically too).** \`node node_modules/@godxjp/ui/scripts/ui-audit.mjs\`
   — fix every finding. A PostToolUse hook also runs it on each edit and feeds findings back.
5. **Before a visual review**, run the runtime audit against the running app:
   \`node node_modules/@godxjp/ui/scripts/visual-audit.mjs <url>\` (axe + contrast + layout).
`;

/** Delimited block appended to the consumer's CLAUDE.md — loaded into the agent's context
 * every turn (the most reliable "ensure it reads the rules"). Markers keep it idempotent. */
export const CLAUDE_MD_BLOCK = `<!-- godxjp-ui:start (managed by @godxjp/ui — edit .claude/godxjp-ui-workflow.md instead) -->
## @godxjp/ui — mandatory UI workflow (do NOT skip)

This app uses @godxjp/ui. EVERY time you build or change UI:

1. **MCP-first.** Consult the \`godx-ui\` MCP — \`get_component\`, \`search_components\`,
   \`list_audit_rules\`, \`list_visual_checks\`. Never guess a prop; never hand-roll what a
   primitive already does.
2. **Real primitives only.** No raw \`<input>/<select>/<button>/<textarea>/<table>\`. A labelled
   control ALWAYS goes in \`<FormField label=…>\` — never a bare \`<Label>\`+\`<Input>\`. Semantic
   tokens, not raw palette/hex/arbitrary values. No emoji in product UI. Logical CSS for RTL.
3. **Scan after writing.** \`node node_modules/@godxjp/ui/scripts/ui-audit.mjs <files>\` and fix
   every finding (a PostToolUse hook runs this automatically and feeds findings back). Before a
   visual review: \`node node_modules/@godxjp/ui/scripts/visual-audit.mjs <url>\` (axe + layout).

Full guide: \`.claude/godxjp-ui-workflow.md\`.
<!-- godxjp-ui:end -->
`;

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

/** Ensure `.mcp.json` registers the godx-ui MCP server. Returns 'created' | 'added' | 'present'. */
export function ensureMcpJson(root) {
  const path = join(root, ".mcp.json");
  const json = readJson(path) ?? {};
  json.mcpServers = json.mcpServers ?? {};
  if (json.mcpServers[MCP_KEY]) return "present";
  const created = !existsSync(path);
  json.mcpServers[MCP_KEY] = MCP_SERVER;
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
  return created ? "created" : "added";
}

/** Ensure `.claude/settings.json` has the audit PostToolUse + workflow SessionStart hooks. */
export function ensureClaudeHooks(root) {
  const path = join(root, ".claude", "settings.json");
  mkdirSync(dirname(path), { recursive: true });
  const json = readJson(path) ?? {};
  json.hooks = json.hooks ?? {};
  const added = [];

  const has = (arr, cmd) =>
    (arr ?? []).some((g) => (g.hooks ?? []).some((h) => (h.command ?? "").includes(cmd)));

  json.hooks.PostToolUse = json.hooks.PostToolUse ?? [];
  if (!has(json.hooks.PostToolUse, "audit-hook.mjs")) {
    json.hooks.PostToolUse.push({
      matcher: "Write|Edit|MultiEdit",
      hooks: [{ type: "command", command: AUDIT_HOOK_CMD }],
    });
    added.push("PostToolUse:auto-audit");
  }

  json.hooks.SessionStart = json.hooks.SessionStart ?? [];
  if (!has(json.hooks.SessionStart, "godxjp-ui-workflow.md")) {
    json.hooks.SessionStart.push({ hooks: [{ type: "command", command: PRIMER_CMD }] });
    added.push("SessionStart:workflow-primer");
  }

  writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
  return added;
}

/** Write the workflow mandate the SessionStart hook reads (only if absent). */
export function writeWorkflowMd(root) {
  const path = join(root, ".claude", "godxjp-ui-workflow.md");
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path)) return false;
  writeFileSync(path, WORKFLOW_MD);
  return true;
}

/** Append the godxjp-ui mandate to the consumer's CLAUDE.md (created if absent). Idempotent
 * via the markers. Returns 'created' | 'appended' | 'present'. */
export function ensureClaudeMd(root) {
  const path = join(root, "CLAUDE.md");
  const existing = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (existing?.includes("godxjp-ui:start")) return "present";
  if (existing == null) {
    writeFileSync(path, CLAUDE_MD_BLOCK);
    return "created";
  }
  writeFileSync(path, existing.replace(/\s*$/, "") + "\n\n" + CLAUDE_MD_BLOCK);
  return "appended";
}

/** True when setup should be SKIPPED (CI, opted out, or installing the library itself). */
export function shouldSkip(root) {
  if (process.env.CI || process.env.GODXJP_UI_SKIP_SETUP) return "ci-or-optout";
  if (!root) return "no-consumer";
  const pkg = readJson(join(root, "package.json"));
  if (!pkg) return "no-package";
  if (pkg.name === "@godxjp/ui" || pkg.name === "@godxjp/ui-mcp") return "self";
  return null;
}
