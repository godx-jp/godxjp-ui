/**
 * Shared agent-setup helpers — used by both postinstall.mjs (auto, on install) and
 * init-agent-kit.mjs (explicit, full kit). Every writer is IDEMPOTENT and
 * NON-DESTRUCTIVE: it only creates a missing file or ADDS a missing key, never
 * overwrites existing config.
 */
import { createHash } from "node:crypto";
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
 * A stamp that tracks the CONTENT, for the files this package owns outright.
 *
 * A version stamp answers "which release wrote this", which is the wrong question for a file whose
 * whole job is to carry current guidance. Measured: editing `consumer-rule.md` without bumping the
 * package left two of three consumers holding the previous text, with a stamp that read as current
 * and nothing anywhere reporting a difference. The rules are edited far more often than the
 * version moves — most of all while they are being written, which is exactly when a stale copy
 * does the most damage.
 *
 * So the digest goes in alongside the version: the version stays for humans reading the file, and
 * the digest is what the refresh actually compares. Identical body → still a no-op.
 */
const DIGEST_RE = /<!-- godxjp-ui:digest ([0-9a-f]{12}) -->/;
const digestOf = (body) => createHash("sha256").update(body).digest("hex").slice(0, 12);
const OWNED_STAMP = (body) => `${STAMP(KIT_VERSION)}\n<!-- godxjp-ui:digest ${digestOf(body)} -->`;

/** The content digest stamped in `text`, or null when it predates digest stamping. */
export function stampedDigest(text) {
  return text?.match(DIGEST_RE)?.[1] ?? null;
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
1. **DISCOVERY BEFORE LOOKUP — in this order, every time.**
   1. \`search_components "<the area you are about to build>"\` FIRST. This is the only call that
      answers "what already exists here". Ask it before the first line of JSX, not after.
   2. \`get_component <Name>\` second, once you know the name.
   \`get_component\` answers "how do I use X" and is USELESS for finding X — you can only look up a
   name you already have. Skipping step 1 is how a consumer hand-rolled an organization switcher
   the package ships (\`OrgSwitcher\`) and built three topbar cells out of Buttons instead of
   \`TopbarItem\`: both were one \`search_components\` call away, and neither was ever searched for.
   **Existing code in this repo is NOT the authority.** Reading a neighbouring file and copying it
   is the most common way this rule gets skipped — measured: of four fresh agents given a vague UI
   task, all four answered correctly but two never called the MCP at all, saying the answer was
   already in the code. They were only right because that code had just been fixed; a week earlier
   the same files hand-rolled a switcher and put Buttons in topbar slots, and both agents would
   have copied it. Search the catalog even when a local file looks like it already answers you.
   Also \`list_audit_rules\`, \`list_visual_checks\`. Never guess a prop; never hand-roll what a
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
1. **DISCOVERY BEFORE LOOKUP — in this order, every time.**
   1. \`search_components "<the area you are about to build>"\` FIRST. This is the only call that
      answers "what already exists here". Ask it before the first line of JSX, not after.
   2. \`get_component <Name>\` second, once you know the name.
   \`get_component\` answers "how do I use X" and is USELESS for finding X — you can only look up a
   name you already have. Skipping step 1 is how a consumer hand-rolled an organization switcher
   the package ships (\`OrgSwitcher\`) and built three topbar cells out of Buttons instead of
   \`TopbarItem\`: both were one \`search_components\` call away, and neither was ever searched for.
   **Existing code in this repo is NOT the authority.** Reading a neighbouring file and copying it
   is the most common way this rule gets skipped — measured: of four fresh agents given a vague UI
   task, all four answered correctly but two never called the MCP at all, saying the answer was
   already in the code. They were only right because that code had just been fixed; a week earlier
   the same files hand-rolled a switcher and put Buttons in topbar slots, and both agents would
   have copied it. Search the catalog even when a local file looks like it already answers you.
   Also \`list_audit_rules\`, \`list_visual_checks\`. Never guess a prop; never hand-roll what a
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
  // it, but nothing else reads from it, so a stale copy is pure loss. It is package-owned end to
  // end, so the comparison is the BODY: a version check froze every consumer whose stamp already
  // matched, which meant guidance edited between releases reached nobody while still reading as
  // current. Same defect as ensureClaudeMd carried, same fix.
  if (existsSync(path)) {
    const cur = readFileSync(path, "utf8");
    if (cur.trim() === WORKFLOW_MD.trim()) return false;
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

/**
 * Is the managed region in `existing` already byte-identical to what we would write?
 *
 * Digest first (cheap, and survives whitespace-only rewrites of the surrounding file). When the
 * stamp predates digest stamping there is nothing to compare, so fall back to the region body
 * itself rather than assuming current — assuming current is the bug this replaced.
 */
function blockIsCurrent(existing, block) {
  const wanted = stampedDigest(block);
  const have = stampedDigest(existing);
  if (wanted && have) return wanted === have;
  const region = (text) => text.slice(text.indexOf("<!-- godxjp-ui:start"), text.indexOf("<!-- godxjp-ui:end -->"));
  return region(existing).trim() === region(block).trim();
}

export function ensureClaudeMd(root) {
  const path = join(root, "CLAUDE.md");
  const existing = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (existing?.includes("godxjp-ui:start")) {
    // Present — but at WHICH version? Refresh only the delimited block; anything the consumer
    // wrote around it is untouched.
    // Compare the DIGEST, not the version — which is what the note above already promised and
    // what this line did not do. Guidance is edited far more often than the package version moves,
    // so a version check freezes every consumer whose stamp already matches: a rewritten mandate
    // reached nobody, and the block still read as current. A file written before digest stamping
    // has no digest at all, so fall back to comparing the rendered body.
    if (blockIsCurrent(existing, CLAUDE_MD_BLOCK)) return "present";
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

  const base = readFileSync(join(SELF_ROOT, "scripts", "guinea-pig-skill.md"), "utf8");
  /*
   * The marker tracks the BASE TEXT, not the release — the same correction the consumer rule file
   * needed, for the same reason. A version marker means editing this skill without cutting a
   * release reaches nobody, and the skill is edited far more often than the version moves. The
   * digest covers only the base: everything from the `# 8.` marker down belongs to the repo and
   * must not make the package's own content look changed.
   *
   * `<version>:<digest>` rather than a bare digest, so the file still says which release wrote it
   * to anyone reading it. Only the digest half is compared.
   */
  const stamp = `${KIT_VERSION}:${digestOf(base)}`;
  if (readFileSync(optin, "utf8").trim().split(":").pop() === digestOf(base)) return false;

  const current = readFileSync(target, "utf8");
  const marker = "\n---\n\n# 8. ";
  const i = current.indexOf(marker);
  writeFileSync(target, base.replace(/\s*$/, "") + "\n" + (i < 0 ? "" : current.slice(i)));
  writeFileSync(optin, `${stamp}\n`);
  return true;
}

/** The stamp `init-guinea-pig` writes on a fresh install, so the first refresh is a no-op. */
export function guineaPigStamp() {
  return `${KIT_VERSION}:${digestOf(readFileSync(join(SELF_ROOT, "scripts", "guinea-pig-skill.md"), "utf8"))}`;
}

/**
 * Install the common consumer rules as a PATH-TRIGGERED file, and wire them into `.ai/rules`.
 *
 * The skill and this file say overlapping things on purpose, because they fire at different
 * moments: a skill loads when the TASK matches its description — once, at the start — while an
 * `.ai/rules` entry loads every time an agent touches a file under its glob. Measured over one
 * session: a dashboard file was edited dozens of times and the skill was never re-read, so the
 * laws that mattered were out of context for every edit after the first.
 *
 * The glob is DETECTED, not assumed. A rule wired to a directory the repo does not have is a rule
 * that never fires, which is worse than no rule at all — it looks installed.
 *
 * Unlike the skill, this file is owned OUTRIGHT by the package and is rewritten whole. That is the
 * honest shape for `.ai/rules`, where the convention is one file per concern and the index loads
 * them all: a repo with something of its own to say writes its own rule file instead of editing
 * this one. The file says so at the top, because the first draft preserved nothing and silently
 * ate a note left inside it — measured, and the reason for that banner.
 */
export function ensureConsumerRules(root) {
  const uiDir = ["resources/js", "app/javascript", "src/components", "src", "app"].find((d) =>
    existsSync(join(root, d)),
  );
  if (!uiDir) return false;

  const dir = join(root, ".ai", "rules");
  const target = join(dir, "godxjp-ui.md");
  const body = readFileSync(join(SELF_ROOT, "scripts", "consumer-rule.md"), "utf8");
  const front = `---\npaths:\n    - '${uiDir}/**'\n---\n\n`;
  // The digest covers the FRONT MATTER too: the detected glob is part of what makes this file
  // correct, and a repo that grows a `resources/js` after shipping with `src` needs the rewrite.
  const managed = `${front}${body}`;
  const next = `${OWNED_STAMP(managed)}\n${managed}`;

  if (existsSync(target) && stampedDigest(readFileSync(target, "utf8")) === digestOf(managed)) {
    return false;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(target, next);

  // Only touch the index when the repo keeps one; a missing index means the repo reads rule files
  // directly, and inventing one would change how it loads everything else.
  const index = join(dir, "index.md");
  if (existsSync(index)) {
    const cur = readFileSync(index, "utf8");
    if (!cur.includes(".ai/rules/godxjp-ui.md")) {
      writeFileSync(
        index,
        cur.replace(/\s*$/, "") + `\n| ${uiDir}/** | .ai/rules/godxjp-ui.md |\n`,
      );
    }
  }
  return uiDir;
}
