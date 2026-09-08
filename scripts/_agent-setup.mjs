/**
 * Shared agent-setup helpers — used by both postinstall.mjs (auto, on install) and
 * init-agent-kit.mjs (explicit, full kit). Every writer is IDEMPOTENT and
 * NON-DESTRUCTIVE: it only creates a missing file or ADDS a missing key, never
 * overwrites existing config.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The godxjp-ui MCP server — pulled on demand via npx (no extra dependency to ship). */
/** This package's own root — the source of the version we stamp with. */
const SELF_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const MCP_SERVER = { command: "npx", args: ["@godxjp/ui-mcp"] };
export const MCP_KEY = "godx-ui";

/** Commands wired into the consumer's .claude/settings.json. */
export const AUDIT_HOOK_CMD = "node node_modules/@godxjp/ui/scripts/audit-hook.mjs";
export const PRIMER_CMD = "cat .claude/godxjp-ui-workflow.md";

/** The per-session workflow mandate the SessionStart hook injects into the agent. */
export const KIT_VERSION = readJson(join(SELF_ROOT, "package.json"))?.version ?? "0.0.0";

const STAMP = (v) => `<!-- godxjp-ui:version ${v} -->`;
const STAMP_RE = /<!-- godxjp-ui:version ([^\s]+) -->/;

/** The version stamped in `text`, or null when it predates stamping. */
export function stampedVersion(text) {
  return text?.match(STAMP_RE)?.[1] ?? null;
}

/**
 * Replace the MANAGED region of a file and leave everything else alone.
 *
 * Refreshing is only safe if it cannot eat hand-written content, so the contract is narrow: the
 * region is delimited, and anything outside the delimiters survives byte-for-byte. A consumer that
 * appended repo-specific sections keeps them.
 */
export const WORKFLOW_MD = `${STAMP(KIT_VERSION)}
# @godxjp/ui — mandatory workflow (read every session)

You are building UI in an app that uses @godxjp/ui. Follow this EVERY time you create
or change a component, page, or form — no exceptions.

## The rules the audit enforces (docs/CONSUMER-RULES.md in node_modules/@godxjp/ui)
- Styles: \`@import "@godxjp/ui/styles"\` or \`@godxjp/ui/styles/core\` (no fonts). Never cherry-pick layers.
- Layout: sections of a page are spaced by \`PageContainer\`; siblings go in \`<Flex direction="col" gap>\` /
  \`<ResponsiveGrid>\`. No \`flex\` / \`grid\` / \`gap-*\` / \`p-*\` / \`m-*\` on your own elements.
- Surfaces: \`Card\` / \`Badge\` / \`Avatar\` / \`ListRow\` / \`Descriptions\` / \`EmptyState\` — never a
  \`rounded border\` div. Text is \`<Text tone size weight truncate>\`, never utility classes.

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
${STAMP(KIT_VERSION)}
## @godxjp/ui — mandatory UI workflow (do NOT skip)

This app uses @godxjp/ui. EVERY time you build or change UI:

0. **Ten rules** — read \`node_modules/@godxjp/ui/docs/CONSUMER-RULES.md\` once. Styles via
   \`@godxjp/ui/styles\` or \`styles/core\` (never cherry-pick layers). Page sections are spaced by
   \`PageContainer\`; siblings go in \`<Flex direction="col" gap>\` / \`<ResponsiveGrid>\`; no
   \`flex\`/\`grid\`/\`gap-*\`/\`p-*\`/\`m-*\` on your own elements; boxes are \`Card\`/\`Badge\`/
   \`ListRow\`/\`Descriptions\`, never a \`rounded border\` div; text is \`<Text tone size weight>\`.
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
/**
 * The version that wrote each managed artefact, stamped so `postinstall` can tell "already there"
 * apart from "already there and STALE".
 *
 * Everything below used to be install-once: `ensureMcpJson` returned early on a present key,
 * `writeWorkflowMd` on a present file, `ensureClaudeMd` on a present marker. So `npm update
 * @godxjp/ui` brought new components, new audit rules and new catalog entries — and left the
 * agent reading whatever guidance shipped the day the package was FIRST installed. The library
 * moved; the instructions for using it did not.
 */
export function refreshBlock(current, next, startMarker, endMarker) {
  const i = current.indexOf(startMarker);
  if (i < 0) return current.replace(/\s*$/, "") + "\n\n" + next;
  const j = endMarker ? current.indexOf(endMarker, i) : -1;
  const tail = j < 0 ? "" : current.slice(j + endMarker.length);
  return current.slice(0, i) + next + tail;
}

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
  // This file is owned entirely by the package — the CLAUDE.md block tells the consumer to edit
  // it, but nothing else reads from it, so a stale copy is pure loss. Rewrite when the stamp moves.
  if (existsSync(path)) {
    const cur = readFileSync(path, "utf8");
    if (stampedVersion(cur) === KIT_VERSION) return false;
    writeFileSync(path, WORKFLOW_MD);
    return "refreshed";
  }
  writeFileSync(path, WORKFLOW_MD);
  return true;
}

/**
 * Append the godxjp-ui mandate to the consumer's CLAUDE.md (created if absent). Idempotent via the
 * markers.
 */
export function ensureClaudeMd(root) {
  const path = join(root, "CLAUDE.md");
  const existing = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (existing?.includes("godxjp-ui:start")) {
    // Present — but at WHICH version? Refresh only the delimited block; anything the consumer
    // wrote around it is untouched.
    if (stampedVersion(existing) === KIT_VERSION) return "present";
    writeFileSync(
      path,
      refreshBlock(existing, CLAUDE_MD_BLOCK, "<!-- godxjp-ui:start", "<!-- godxjp-ui:end -->"),
    );
    return "refreshed";
  }
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

/**
 * Keep an opted-in guinea-pig skill current.
 *
 * The file is co-authored: sections 0–7 come from this package, and section 8 onward is whatever
 * the repo wrote about ITSELF — its package manager, its audit baseline, its deliberate
 * exceptions. So the refresh replaces the head and keeps the tail, which is the only split that
 * lets the guidance move without eating the consumer's own notes.
 *
 * Only runs where `.guinea-pig-optin` exists: the skill carries an obligation to fix things
 * UPSTREAM, and pushing that into a repo that never asked for it would tell its agent to go edit
 * a library it has no mandate over.
 */
export function refreshGuineaPigSkill(root) {
  const dir = join(root, ".claude", "skills", "godx-ui-guinea-pig");
  const target = join(dir, "SKILL.md");
  const optin = join(dir, ".guinea-pig-optin");
  if (!existsSync(optin) || !existsSync(target)) return false;
  if (readFileSync(optin, "utf8").trim() === KIT_VERSION) return false;

  const base = readFileSync(join(SELF_ROOT, "scripts", "guinea-pig-skill.md"), "utf8");
  const current = readFileSync(target, "utf8");
  const marker = "\n---\n\n# 8. ";
  const i = current.indexOf(marker);
  writeFileSync(target, base.replace(/\s*$/, "") + "\n" + (i < 0 ? "" : current.slice(i)));
  writeFileSync(optin, `${KIT_VERSION}\n`);
  return true;
}
