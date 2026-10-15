/**
 * Shared agent-setup helpers — used by both postinstall.mjs (auto, on install) and
 * init-agent-kit.mjs (explicit, full kit). Every writer is IDEMPOTENT and
 * NON-DESTRUCTIVE: it only creates a missing file or ADDS a missing key, never
 * overwrites existing config.
 *
 * That sentence was a claim, not a guarantee, until gh#541: `readJson` returned `null` for BOTH
 * "no file" and "file I cannot parse", so `readJson(path) ?? {}` read a consumer's malformed
 * `.mcp.json` as an empty one and wrote over it — their other MCP servers went with it, silently.
 * The guarantee is now structural: a file that exists but cannot be read, parsed, or recognised is
 * NEVER written to. We leave a `.godxjp-ui-suggested` sidecar next to it and say so.
 */
import { createHash, randomBytes } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** This package's own root — the source of the version we stamp with. */
const SELF_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const MCP_KEY = "godx-ui";

/** @deprecated Prefer `mcpServerFor(root)` — bare npx resolves latest on the registry (gh#543). */
export const MCP_SERVER = { command: "npx", args: ["@godxjp/ui-mcp"] };

function mcpEntryMatches(a, b) {
  if (a?.command !== b?.command) return false;
  const argsA = a?.args ?? [];
  const argsB = b?.args ?? [];
  if (argsA.length !== argsB.length || argsA.some((x, i) => x !== argsB[i])) return false;
  const envA = a?.env ?? {};
  const envB = b?.env ?? {};
  const keysA = Object.keys(envA).sort();
  const keysB = Object.keys(envB).sort();
  if (keysA.length !== keysB.length || keysA.some((k, i) => k !== keysB[i])) return false;
  return keysA.every((k) => envA[k] === envB[k]);
}

/**
 * True when `entry` is the shape THIS package writes (`npx @godxjp/ui-mcp@<pin>`, env at most
 * GODX_UI_VERSION), whatever pin and version it carries. Such an entry is ours to move forward on
 * upgrade: treating it as custom left consumers on the MCP of the release they first installed
 * (a `@godxjp/ui-mcp@25.4.0` pin survived the upgrade to 26.x).
 */
function isPackageWrittenMcpEntry(entry) {
  if (entry?.command !== "npx") return false;
  const args = entry.args ?? [];
  if (args.length !== 1 || !/^@godxjp\/ui-mcp@[^\s]+$/.test(args[0])) return false;
  return Object.keys(entry.env ?? {}).every((key) => key === "GODX_UI_VERSION");
}

/** True when an `mcpServers` entry launches the catalog server, under any key or launcher flags. */
function runsUiMcp(entry) {
  const parts = [entry?.command, ...(Array.isArray(entry?.args) ? entry.args : [])];
  return parts.some((part) => typeof part === "string" && /(^|\/)@godxjp\/ui-mcp(@|$)/.test(part));
}

function mcpConfigMismatchMessage(root, existing, expected, key = MCP_KEY) {
  const ui = readConsumerUiMetadata(root);
  const pin = expected.args?.[0] ?? "@godxjp/ui-mcp";
  const ver = ui?.version ?? "(unknown)";
  return (
    `present (custom godx-ui MCP entry${key === MCP_KEY ? "" : ` under key "${key}"`} — not overwritten, ` +
    `no duplicate added; expected ${pin} with ` +
    `env.GODX_UI_VERSION=${ver} from node_modules/@godxjp/ui)`
  );
}

/** Commands wired into the consumer's .claude/settings.json. */
// `npx --no-install` resolves @godxjp/ui up the node_modules chain, so the hook also works from a
// workspace package whose install is hoisted to the repo root (gh#1296); it never downloads.
export const AUDIT_HOOK_CMD = "npx --no-install @godxjp/ui audit-hook";
/** The pre-#1296 default, rewritten to AUDIT_HOOK_CMD when found verbatim (a custom command is kept). */
const LEGACY_AUDIT_HOOK_CMD = "node node_modules/@godxjp/ui/scripts/audit-hook.mjs";
export const PRIMER_CMD = "cat .claude/godxjp-ui-workflow.md";

/** What `.claude/settings.json` would get, used only for the `.godxjp-ui-suggested` sidecar. */
const SUGGESTED_HOOKS = {
  PostToolUse: [
    { matcher: "Write|Edit|MultiEdit", hooks: [{ type: "command", command: AUDIT_HOOK_CMD }] },
  ],
  SessionStart: [{ hooks: [{ type: "command", command: PRIMER_CMD }] }],
};

/** The per-session workflow mandate the SessionStart hook injects into the agent. */
export const KIT_VERSION = readJson(join(SELF_ROOT, "package.json"))?.version ?? "0.0.0";

/**
 * Read the consumer's installed @godxjp/ui metadata (postinstall runs with UI already in
 * node_modules). Returns null when absent — caller falls back to this package's release train.
 */
export function readConsumerUiMetadata(root) {
  // Up the node_modules chain: a workspace package has @godxjp/ui hoisted to the repo root (gh#1296).
  let uiPkg;
  for (let dir = resolve(root); ; dir = dirname(dir)) {
    uiPkg = readJson(join(dir, "node_modules/@godxjp/ui/package.json"));
    if (uiPkg || dirname(dir) === dir) break;
  }
  if (!uiPkg?.version) return null;
  return {
    version: String(uiPkg.version),
    godxUiMcp: uiPkg.godxUiMcp ? String(uiPkg.godxUiMcp) : String(uiPkg.version),
  };
}

/**
 * MCP launch config for a consumer root: pin @godxjp/ui-mcp to godxUiMcp from the installed UI
 * package and pass the real UI version via env (gh#543 — MCP must not read the repo to learn it).
 */
export function mcpServerFor(root) {
  const meta = readConsumerUiMetadata(root);
  const mcpPin = meta?.godxUiMcp ?? KIT_VERSION;
  const server = { command: "npx", args: [`@godxjp/ui-mcp@${mcpPin}`] };
  if (meta?.version) server.env = { GODX_UI_VERSION: meta.version };
  return server;
}

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
 * Refresh only the human-readable release marker when the managed body is already current.
 *
 * The writer keys off digest; `ui-audit` keys off version (godx-jp/id#513). When rule text is
 * unchanged across releases both must still agree after sync — without rewriting the body or
 * breaking idempotency when digest and version already match.
 */
function resyncVersionStamp(text) {
  if (stampedVersion(text) === KIT_VERSION) return null;
  return text.replace(STAMP_RE, `<!-- godxjp-ui:version ${KIT_VERSION} -->`);
}

/**
 * Replace the MANAGED region of a file and leave everything else alone.
 *
 * Refreshing is only safe if it cannot eat hand-written content, so the contract is narrow: the
 * region is delimited, and anything outside the delimiters survives byte-for-byte. A consumer that
 * appended repo-specific sections keeps them.
 */
export const WORKFLOW_MD = `${STAMP(KIT_VERSION)}
# @godxjp/ui — workflow (read every session)

Follow this every time you create or change a page, component or form.

## Before JSX
1. **Design target.** Read \`node_modules/@godxjp/ui/DESIGN.md\` (MCP \`get_design\`): tokens,
   scarcity rules, screen anatomy, do/don't.
2. **Route.** \`route_consumer_task "<task>"\` → \`compose-a-screen\` for app screens. The
   marketing skills (soft, minimalist, brutalist, gpt-tasteskill, imagegen-*) are for landing
   pages only.
3. **Exemplar.** \`get_exemplar\` for the closest archetype (call it with no argument for the
   list: list, detail, editor/form, reader/document, settings, dashboard, approval-queue). Match
   its structure; it is the visual target.
4. **Discover, then look up.** \`search_components "<area>"\` first, \`get_component <Name>\`
   second — \`get_component\` cannot find a name you do not already have (a consumer hand-rolled
   the shipped \`OrgSwitcher\` and \`TopbarItem\` this way). Code already in this repo is not the
   authority: search even when a neighbouring file seems to answer. Never guess a prop.

## Contract (ui-audit enforces it; full text in node_modules/@godxjp/ui/docs/CONSUMER-RULES.md)
- Styles: \`@import "@godxjp/ui/styles"\` (or \`import "@godxjp/ui/styles.css"\`); fonts are opt-in
  via \`@godxjp/ui/styles/fonts.css\`. Never cherry-pick layers.
- Layout: \`PageContainer\` spaces sections; siblings go in \`<Flex direction="col" gap>\` /
  \`<ResponsiveGrid>\`. No \`flex\` / \`grid\` / \`gap-*\` / \`p-*\` / \`m-*\` on your own elements.
- Surfaces: \`Card\` / \`Badge\` / \`Avatar\` / \`ListRow\` / \`Descriptions\` / \`EmptyState\`, never a
  \`rounded border\` div. Text is \`<Text tone size weight>\`.
- Real controls only; a labelled control sits in \`<FormField label>\` inside a \`<Form>\`.
- Semantic tokens only: no hex, palette names, arbitrary \`[13px]\`, emoji. Logical CSS (ms-/me-).
- Screen composition (what the audit cannot see) is in \`.ai/rules/godxjp-ui.md\`.

## After JSX
5. \`npx @godxjp/ui audit <files>\` — zero errors (a PostToolUse hook also runs it on each edit).
   Run it from the package that owns the files; \`--help\` lists the flags.
6. \`npx @godxjp/ui visual-audit <url> <routes>\` — every route at 320 / 390 / 768 / 1024 / 1280 /
   844×390; zero machine failures; "unmapped" is not a pass.
7. Inspect every screenshot at every width, region by region (top bar, header, body, aside/rail,
   menus/drawers), including regions you must not change — defects there become issues.
8. No top-N, no round cap: stop at zero failures and a fully resolved checklist. Then report
   "probes passed; independent acceptance pending" with the artifacts — never "done" on your own
   review. Acceptance comes from someone who did not build it.

In a workspace, \`node_modules/@godxjp/ui\` may be hoisted to the repo root: read its files there,
or through the MCP (\`get_design\`, \`get_rule\`).
`;

/** Delimited block appended to the consumer's CLAUDE.md — loaded into the agent's context
 * every turn, so it carries only the default path and points at the workflow for the rest.
 * Markers keep it idempotent. */
export const CLAUDE_MD_BLOCK = `<!-- godxjp-ui:start (managed by @godxjp/ui — rewritten by npx godxjp-ui sync-rules) -->
${STAMP(KIT_VERSION)}
## @godxjp/ui — UI workflow

Before any JSX for a screen:
1. Read \`node_modules/@godxjp/ui/DESIGN.md\` (MCP \`get_design\`).
2. \`route_consumer_task\` → \`compose-a-screen\`; \`search_components\` before hand-rolling anything.
3. \`get_exemplar\` (no argument lists the archetypes: list, detail, editor, reader, settings,
   dashboard, approval-queue) — match its structure.

No \`mcp__godx-ui__*\` tools (the session started outside this repo)? The same catalog over stdio:
\`npx --no-install @godxjp/ui mcp-call search_components '{"query":"<area>"}'\` (no tool lists them).

After building:
4. \`npx @godxjp/ui audit <files>\` and \`npx @godxjp/ui visual-audit <url> <routes>\` (6 widths) — zero.
5. Inspect every screenshot at every width, region by region; no top-N cap. Report "probes passed;
   independent acceptance pending" — the builder never accepts its own screen.

Rules: \`node_modules/@godxjp/ui/docs/CONSUMER-RULES.md\`. Details: \`.claude/godxjp-ui-workflow.md\`.
<!-- godxjp-ui:end -->
`;

/**
 * Read a JSON file and say WHICH failure happened. Collapsing "absent" and "corrupt" into one
 * `null` is the whole of gh#541 — see the module header.
 *
 * @returns {{state:"ok",json:object}|{state:"missing"}|{state:"unreadable"}|{state:"invalid-json"}|{state:"wrong-shape"}}
 */
function readJsonFile(path) {
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch (error) {
    return error.code === "ENOENT" ? { state: "missing" } : { state: "unreadable" };
  }
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return { state: "invalid-json" };
  }
  // `JSON.parse` happily returns `null`, `[]` or `"text"`. Merging keys into any of those and
  // writing the result back is the same data loss by a different door, so it is a refusal too.
  if (json === null || typeof json !== "object" || Array.isArray(json))
    return { state: "wrong-shape" };
  return { state: "ok", json, indent: indentOf(raw) };
}

/**
 * The indentation the file already uses — a tab, or the width of the first indented line — so a
 * rewrite changes only the keys it touches. Re-serialising at a fixed 2 turned a one-entry edit
 * into a whole-file diff in a repo formatted at 4 (gh#692).
 */
function indentOf(raw) {
  const first = raw.match(/\n([ \t]+)\S/);
  if (!first) return 2;
  return first[1].startsWith("\t") ? "\t" : first[1].length;
}

/** The sentence that goes in the refusal, so a consumer knows which of the three it hit. */
const READ_FAILURE = {
  "invalid-json": "not valid JSON",
  "wrong-shape": "JSON, but not an object",
  unreadable: "unreadable",
};

/** Unusable-as-absent — only for the read-only callers, which never write anything back. */
function readJson(path) {
  const read = readJsonFile(path);
  return read.state === "ok" ? read.json : null;
}

/**
 * Write through a temp file + rename. `writeFileSync` is NOT atomic: an interrupt mid-write (^C
 * during `npm install`, a full disk, the OOM killer) leaves a truncated file behind, which the
 * next run reads as malformed. That is how the two halves of gh#541 fed each other — one bad
 * write manufactured the precondition for the overwrite.
 */
let dryRunLog = null; // non-null during `sync-rules --dry-run`: collects paths instead of writing

function mkdirp(dir) {
  if (!dryRunLog) mkdirSync(dir, { recursive: true });
}

function writeFileAtomic(path, data) {
  if (dryRunLog) {
    dryRunLog.add(path);
    return;
  }
  // UNIQUE temp name. A fixed `${path}.godxjp-ui-tmp` is a shared mutable file: two installs
  // running at once — a workspace installing packages in parallel is enough — write over each
  // other's temp and `rename` whichever finished last.
  const tmp = `${path}.godxjp-ui-tmp-${process.pid}-${randomBytes(4).toString("hex")}`;
  try {
    writeFileSync(tmp, data);
    // `rename` does NOT carry the target's permissions: the new file is born under the process
    // umask. A `.mcp.json` the consumer had chmod 600 would come back 644 after the first sync,
    // silently, because the CONTENT would be right. This happens on every write, not only under
    // contention, which makes it the worse half of the two.
    try {
      chmodSync(tmp, statSync(path).mode & 0o7777);
    } catch {
      // No existing file (a create), or a filesystem that will not report/set the mode. Either
      // way the default is correct and this must not abort the write.
    }
    renameSync(tmp, path);
  } catch (error) {
    try {
      unlinkSync(tmp);
    } catch {
      // Nothing to clean up.
    }
    throw error;
  }
}

/**
 * Refuse to touch `path`, leave what we WOULD have written beside it, and return the sentence the
 * caller prints. A diff the consumer can read beats a config we guessed at.
 */
function refuseAndSuggest(path, data, reason) {
  const suggested = `${path}.godxjp-ui-suggested`;
  writeFileAtomic(suggested, data);
  return `left untouched (${reason}) — see ${basename(suggested)}`;
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
/**
 * Replace the delimited managed region, or REFUSE.
 *
 * The old shape set `tail = ""` when the closing marker was missing and returned
 * `current.slice(0, i) + next` — so a file whose end marker had been deleted (or truncated away by
 * a half-finished write) lost everything after the opening marker. Whatever the consumer wrote
 * below our block was simply gone (gh#541).
 *
 * There is no safe way to guess where a region ends, so we do not guess. Two refusals, both
 * returning `null` for the caller to report:
 *   • the opening marker appears more than once — which region is ours is ambiguous;
 *   • the closing marker is missing — the region has no end.
 * A closing marker that appears more than once is NOT a refusal: the first one after the opening
 * marker is the region's end, and everything past it is preserved either way.
 *
 * @returns {string|null} the rewritten file, or `null` to say "do not write".
 */
export function refreshBlock(current, next, startMarker, endMarker) {
  const first = current.indexOf(startMarker);
  if (first < 0) return current.replace(/\s*$/, "") + "\n\n" + next;
  if (current.indexOf(startMarker, first + startMarker.length) >= 0) return null;
  if (!endMarker) return null;
  const j = current.indexOf(endMarker, first);
  if (j < 0) return null;
  // `next` ends in its own newline, and the old block's newline is still the first character after
  // the end marker — keeping both grew the file by one blank line on every refresh.
  let tail = current.slice(j + endMarker.length);
  if (next.endsWith("\n") && tail.startsWith("\n")) tail = tail.slice(1);
  return current.slice(0, first) + next + tail;
}

export function ensureMcpJson(root) {
  const path = join(root, ".mcp.json");
  const expected = mcpServerFor(root);
  const suggested = JSON.stringify({ mcpServers: { [MCP_KEY]: expected } }, null, 2) + "\n";
  const read = readJsonFile(path);
  if (read.state !== "ok" && read.state !== "missing") {
    return refuseAndSuggest(path, suggested, READ_FAILURE[read.state]);
  }
  const json = read.state === "ok" ? read.json : {};
  if (
    json.mcpServers !== undefined &&
    (json.mcpServers === null ||
      typeof json.mcpServers !== "object" ||
      Array.isArray(json.mcpServers))
  ) {
    return refuseAndSuggest(path, suggested, "`mcpServers` is not an object");
  }
  json.mcpServers = json.mcpServers ?? {};
  const indent = read.state === "ok" ? read.indent : 2;
  // The catalog server may already be registered under ANOTHER key — `godxjp-ui`, `ui`, whatever
  // the repo chose. Looking only at MCP_KEY added a second copy of the same server beside it, at
  // a different version (gh#692). Whatever key runs @godxjp/ui-mcp is the entry.
  const key = json.mcpServers[MCP_KEY]
    ? MCP_KEY
    : Object.keys(json.mcpServers).find((name) => runsUiMcp(json.mcpServers[name]));
  if (key) {
    if (mcpEntryMatches(json.mcpServers[key], expected)) return "present";
    if (!isPackageWrittenMcpEntry(json.mcpServers[key])) {
      return mcpConfigMismatchMessage(root, json.mcpServers[key], expected, key);
    }
    json.mcpServers[key] = expected;
    writeFileAtomic(path, JSON.stringify(json, null, indent) + "\n");
    return "refreshed";
  }
  const created = read.state === "missing";
  json.mcpServers[MCP_KEY] = expected;
  writeFileAtomic(path, JSON.stringify(json, null, indent) + "\n");
  return created ? "created" : "added";
}

/**
 * Registrations of the catalog server OUTSIDE the project — READ-ONLY (gh#722).
 *
 * `.mcp.json` is not the only place an agent's MCP servers come from. Claude Code keeps
 * user-scoped servers in the top-level `mcpServers` of `~/.claude.json` (under
 * `$CLAUDE_CONFIG_DIR` when that is set) and local-scoped ones — private to one checkout — under
 * `projects[<absolute project path>].mcpServers` of the same file. Both are live beside the
 * project's entry. Measured: a user-scoped `godxjp-ui` serving a ≤ 21.0.0 catalog answered next
 * to the project's pinned `godx-ui`, and an agent took a removed component's page from it.
 *
 * That file belongs to the user, spans every project, and is not ours to edit: this only READS
 * it. A missing, unreadable or malformed file yields nothing, silently. Returns
 * `{ key, scope, pin }` per entry — never `env`, which is where secrets live.
 */
export function findOutOfProjectUiMcp(
  root,
  configDir = process.env.CLAUDE_CONFIG_DIR || homedir(),
) {
  try {
    const read = readJsonFile(join(configDir, ".claude.json"));
    if (read.state !== "ok") return [];
    const found = [];
    const collect = (servers, scope) => {
      if (!servers || typeof servers !== "object" || Array.isArray(servers)) return;
      for (const [key, entry] of Object.entries(servers)) {
        if (!runsUiMcp(entry)) continue;
        const parts = [entry.command, ...(Array.isArray(entry.args) ? entry.args : [])];
        const pin = parts.find(
          (part) => typeof part === "string" && /(^|\/)@godxjp\/ui-mcp(@|$)/.test(part),
        );
        found.push({ key, scope, pin });
      }
    };
    collect(read.json.mcpServers, "user");
    const projects = read.json.projects;
    if (projects && typeof projects === "object" && !Array.isArray(projects)) {
      const paths = new Set([resolve(root)]);
      try {
        paths.add(realpathSync(root));
      } catch {
        // A root that cannot be resolved is looked up by its given path only.
      }
      for (const path of paths) collect(projects[path]?.mcpServers, "local");
    }
    return found;
  } catch {
    return [];
  }
}

const shellWord = (word) => (/^[\w.@/-]+$/.test(word) ? word : `'${word.replace(/'/g, "'\\''")}'`);

/**
 * What `sync-rules` and `init-agent` print about out-of-project registrations: key, pin, that it
 * was left untouched, and the command that updates it. Empty string when there are none.
 */
export function outOfProjectUiMcpReport(root, configDir) {
  const found = findOutOfProjectUiMcp(root, configDir);
  if (found.length === 0) return "";
  const expected = mcpServerFor(root).args[0];
  let out =
    `\n  @godxjp/ui → @godxjp/ui-mcp is ALSO registered outside this project, in Claude Code's ` +
    `.claude.json.\n  It answers beside the project's .mcp.json entry (${expected}) and an agent ` +
    `can call either — the tool names differ only by the key.\n`;
  for (const { key, scope, pin } of found) {
    const k = shellWord(key);
    const runs = /@godxjp\/ui-mcp@\S+$/.test(pin ?? "")
      ? pin
      : `${pin ?? "@godxjp/ui-mcp"} (unpinned: resolves the latest release)`;
    out +=
      `    • "${key}" (${scope} scope) runs ${runs} — outside the project, left untouched.\n` +
      `        remove it:  claude mcp remove ${k} -s ${scope}\n` +
      `        or re-pin:  claude mcp remove ${k} -s ${scope} && claude mcp add ${k} -s ${scope} -- npx ${expected}\n`;
  }
  return out;
}

/** Ensure `.claude/settings.json` has the audit PostToolUse + workflow SessionStart hooks. */
export function ensureClaudeHooks(root) {
  const path = join(root, ".claude", "settings.json");
  mkdirp(dirname(path));
  const read = readJsonFile(path);
  if (read.state !== "ok" && read.state !== "missing") {
    // Same guard as ensureMcpJson, and the reason it is here rather than only there: this file
    // holds the consumer's OWN hooks. Rewriting it from `{}` silently unhooks their tooling.
    return [
      refuseAndSuggest(
        path,
        JSON.stringify({ hooks: SUGGESTED_HOOKS }, null, 2) + "\n",
        READ_FAILURE[read.state],
      ),
    ];
  }
  const json = read.state === "ok" ? read.json : {};
  if (
    json.hooks !== undefined &&
    (json.hooks === null || typeof json.hooks !== "object" || Array.isArray(json.hooks))
  ) {
    return [
      refuseAndSuggest(
        path,
        JSON.stringify({ hooks: SUGGESTED_HOOKS }, null, 2) + "\n",
        "`hooks` is not an object",
      ),
    ];
  }
  json.hooks = json.hooks ?? {};
  const added = [];

  const has = (arr, cmd) =>
    (arr ?? []).some((g) => (g.hooks ?? []).some((h) => (h.command ?? "").includes(cmd)));

  json.hooks.PostToolUse = json.hooks.PostToolUse ?? [];
  for (const group of json.hooks.PostToolUse)
    for (const hook of group.hooks ?? [])
      if (hook.command === LEGACY_AUDIT_HOOK_CMD) {
        hook.command = AUDIT_HOOK_CMD;
        added.push("PostToolUse:auto-audit (workspace-safe command)");
      }
  if (!has(json.hooks.PostToolUse, "audit-hook")) {
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

  writeFileAtomic(path, JSON.stringify(json, null, read.state === "ok" ? read.indent : 2) + "\n");
  return added;
}

/**
 * The nearest `.mcp.json` at or above `fromDir` that serves the catalog: `{ dir, key, entry }`, or
 * null. Read-only; a malformed file reads as "no catalog here".
 */
export function findUiMcpConfig(fromDir) {
  for (let dir = resolve(fromDir); ; dir = dirname(dir)) {
    const read = readJsonFile(join(dir, ".mcp.json"));
    if (read.state === "ok") {
      const servers = read.json.mcpServers;
      if (servers && typeof servers === "object" && !Array.isArray(servers)) {
        // The `godx-ui` key under any launcher (a local `node …/mcp/dist/index.js` link included),
        // else whichever key launches @godxjp/ui-mcp.
        const key = servers[MCP_KEY]
          ? MCP_KEY
          : Object.keys(servers).find((name) => runsUiMcp(servers[name]));
        if (key) return { dir, key, entry: servers[key] };
      }
    }
    if (dirname(dir) === dir) return null;
  }
}

/** Where `init-agent --user` puts the guard shim, under Claude Code's user config dir. */
export const USER_GUARD_FILE = "godxjp-ui-guard.mjs";
const USER_GUARD_SOURCE = join(SELF_ROOT, "scripts", "user-guard.mjs");

/** Claude Code's user config dir: `$CLAUDE_CONFIG_DIR`, else `~/.claude` (HOME-relative). */
export function userConfigDir(env = process.env) {
  return env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
}

/**
 * `init-agent --user` (gh#1324): copy the guard shim to `<config>/hooks/godxjp-ui-guard.mjs` and
 * register it in `<config>/settings.json` for PreToolUse and PostToolUse on Write|Edit|MultiEdit.
 * Merges: every other key and hook is kept, an existing godxjp-ui-guard entry is left as it is,
 * and the file is only rewritten when something was added. A settings.json that cannot be read,
 * parsed or recognised is refused with a sidecar, like the project files.
 * Returns the lines to print.
 */
export function ensureUserGuard(configDir = userConfigDir()) {
  const lines = [];
  const shim = join(configDir, "hooks", USER_GUARD_FILE);
  const source = readFileSync(USER_GUARD_SOURCE, "utf8");
  let current = null;
  try {
    current = readFileSync(shim, "utf8");
  } catch {
    // Not installed yet.
  }
  if (current === source) lines.push(`${shim} — present`);
  else {
    mkdirp(dirname(shim));
    writeFileAtomic(shim, source);
    lines.push(`${shim} — ${current === null ? "created" : "updated"}`);
  }

  const path = join(configDir, "settings.json");
  const group = (event) => ({
    matcher: "Write|Edit|MultiEdit",
    hooks: [{ type: "command", command: `node "${shim}" ${event}` }],
  });
  const suggested = {
    hooks: { PreToolUse: [group("pre")], PostToolUse: [group("post")] },
  };
  const read = readJsonFile(path);
  if (read.state !== "ok" && read.state !== "missing") {
    lines.push(
      `${path} — ` +
        refuseAndSuggest(path, JSON.stringify(suggested, null, 2) + "\n", READ_FAILURE[read.state]),
    );
    return lines;
  }
  const json = read.state === "ok" ? read.json : {};
  if (
    json.hooks !== undefined &&
    (json.hooks === null || typeof json.hooks !== "object" || Array.isArray(json.hooks))
  ) {
    lines.push(
      `${path} — ` +
        refuseAndSuggest(
          path,
          JSON.stringify(suggested, null, 2) + "\n",
          "`hooks` is not an object",
        ),
    );
    return lines;
  }
  json.hooks = json.hooks ?? {};
  const added = [];
  for (const [event, arg] of [
    ["PreToolUse", "pre"],
    ["PostToolUse", "post"],
  ]) {
    const groups = json.hooks[event] ?? [];
    if (!Array.isArray(groups)) {
      lines.push(`${path} — hooks.${event} is not an array, left untouched`);
      continue;
    }
    const has = groups.some((g) =>
      (g?.hooks ?? []).some((h) => String(h?.command ?? "").includes(USER_GUARD_FILE)),
    );
    if (has) continue;
    json.hooks[event] = [...groups, group(arg)];
    added.push(event);
  }
  if (added.length === 0) {
    lines.push(`${path} — guard hooks already present`);
    return lines;
  }
  mkdirp(dirname(path));
  writeFileAtomic(path, JSON.stringify(json, null, read.state === "ok" ? read.indent : 2) + "\n");
  lines.push(`${path} — added ${added.join(" + ")} (Write|Edit|MultiEdit)`);
  return lines;
}

/** Write the workflow mandate the SessionStart hook reads (only if absent). */
export function writeWorkflowMd(root) {
  const path = join(root, ".claude", "godxjp-ui-workflow.md");
  mkdirp(dirname(path));
  // This file is owned entirely by the package — the CLAUDE.md block tells the consumer to edit
  // it, but nothing else reads from it, so a stale copy is pure loss. It is package-owned end to
  // end, so the comparison is the BODY: a version check froze every consumer whose stamp already
  // matched, which meant guidance edited between releases reached nobody while still reading as
  // current. Same defect as ensureClaudeMd carried, same fix.
  if (existsSync(path)) {
    const cur = readFileSync(path, "utf8");
    if (cur.trim() === WORKFLOW_MD.trim()) return false;
    writeFileAtomic(path, WORKFLOW_MD);
    return "refreshed";
  }
  writeFileAtomic(path, WORKFLOW_MD);
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
  const region = (text) =>
    text.slice(text.indexOf("<!-- godxjp-ui:start"), text.indexOf("<!-- godxjp-ui:end -->"));
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
    const next = refreshBlock(
      existing,
      CLAUDE_MD_BLOCK,
      "<!-- godxjp-ui:start",
      "<!-- godxjp-ui:end -->",
    );
    if (next === null)
      return refuseAndSuggest(path, CLAUDE_MD_BLOCK, "godxjp-ui markers are broken");
    writeFileAtomic(path, next);
    return "refreshed";
  }
  if (existing == null) {
    writeFileAtomic(path, CLAUDE_MD_BLOCK);
    return "created";
  }
  writeFileAtomic(path, existing.replace(/\s*$/, "") + "\n\n" + CLAUDE_MD_BLOCK);
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
  const optinLine = readFileSync(optin, "utf8").trim();
  const optinDigest = optinLine.split(":").pop();
  if (optinDigest === digestOf(base)) {
    if (optinLine.split(":")[0] === KIT_VERSION) return false;
    // Base unchanged — only the release half of `<version>:<digest>` drifted (same split as above).
    writeFileAtomic(optin, `${stamp}\n`);
    return true;
  }

  const current = readFileSync(target, "utf8");
  const marker = "\n---\n\n# 8. ";
  const i = current.indexOf(marker);
  writeFileAtomic(target, base.replace(/\s*$/, "") + "\n" + (i < 0 ? "" : current.slice(i)));
  writeFileAtomic(optin, `${stamp}\n`);
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
const UI_FILE = /\.(tsx|jsx)$/;
const NOT_UI_DIR = new Set([
  "node_modules",
  "dist",
  "build",
  "out",
  "vendor",
  "coverage",
  "public",
  "storage",
]);

/** Does `dir` hold a .tsx/.jsx file within a few levels? Bounded, so a large tree costs little. */
function holdsUi(dir, depth = 5) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return false;
  }
  if (entries.some((e) => e.isFile() && UI_FILE.test(e.name))) return true;
  if (depth === 0) return false;
  return entries.some(
    (e) =>
      e.isDirectory() &&
      !e.name.startsWith(".") &&
      !NOT_UI_DIR.has(e.name) &&
      holdsUi(join(dir, e.name), depth - 1),
  );
}

/**
 * Every directory that actually holds the consumer's UI, as `paths:` globs without the `/**`
 * (gh#1296). A fixed `src` never fired in an app whose screens live in `web/` or
 * `resources/js/`, so the rules looked installed and loaded on no edit. Conventional nested roots
 * first (`resources/js`, `apps/*\/src`, …), then any other top-level directory holding .tsx/.jsx.
 * A repo with no UI files yet (a fresh scaffold) falls back to the first conventional directory
 * that exists.
 */
function detectUiDirs(root) {
  const subdirs = (rel) => {
    try {
      return readdirSync(join(root, rel), { withFileTypes: true })
        .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !NOT_UI_DIR.has(e.name))
        .map((e) => e.name)
        .sort();
    } catch {
      return [];
    }
  };
  const found = [];
  const add = (glob, dirs) => {
    if (dirs.some((d) => holdsUi(join(root, d)))) found.push(glob);
  };
  for (const rel of ["resources/js", "app/javascript"]) add(rel, [rel]);
  for (const parent of ["apps", "packages"]) {
    const dirs = subdirs(parent)
      .map((name) => `${parent}/${name}/src`)
      .filter((d) => existsSync(join(root, d)));
    if (dirs.length) add(`${parent}/*/src`, dirs);
  }
  for (const name of subdirs("")) {
    if (!found.some((glob) => glob.split("/")[0] === name)) add(name, [name]);
  }
  if (found.length) return found;
  const scaffold = ["resources/js", "app/javascript", "src/components", "src", "app"].find((d) =>
    existsSync(join(root, d)),
  );
  return scaffold ? [scaffold] : [];
}

export function ensureConsumerRules(root) {
  const uiDirs = detectUiDirs(root);
  if (uiDirs.length === 0) return false;
  const uiDir = uiDirs.join(", ");

  const dir = join(root, ".ai", "rules");
  const target = join(dir, "godxjp-ui.md");
  const body = readFileSync(join(SELF_ROOT, "scripts", "consumer-rule.md"), "utf8");
  const front = `---\npaths:\n${uiDirs.map((d) => `    - '${d}/**'\n`).join("")}---\n\n`;
  // The digest covers the FRONT MATTER too: the detected glob is part of what makes this file
  // correct, and a repo that grows a `resources/js` after shipping with `src` needs the rewrite.
  const managed = `${front}${body}`;
  const next = `${OWNED_STAMP(managed)}\n${managed}`;

  if (existsSync(target)) {
    const current = readFileSync(target, "utf8");
    if (stampedDigest(current) === digestOf(managed)) {
      const resynced = resyncVersionStamp(current);
      if (resynced == null) return false;
      writeFileAtomic(target, resynced);
      return uiDir;
    }
  }
  mkdirp(dir);
  writeFileAtomic(target, next);

  // Prettier and this writer were fighting over the same file: the body holds aligned markdown
  // tables, Prettier reformats them, the digest changes, the next install writes it back, and
  // `format:check` goes red again — a loop with no winner, and the consumer is who is stuck in it
  // (godx-jp/id#513). The file is OURS; say so to Prettier once, idempotently.
  const ignoreFile = join(root, ".prettierignore");
  if (existsSync(ignoreFile)) {
    const cur = readFileSync(ignoreFile, "utf8");
    const owned = [".ai/rules/godxjp-ui.md", ".claude/godxjp-ui-workflow.md"].filter(
      (line) => !cur.includes(line),
    );
    if (owned.length) {
      writeFileAtomic(
        ignoreFile,
        `${cur.replace(/\s*$/, "")}\n\n# Owned by @godxjp/ui — rewritten on every install, never hand-formatted.\n${owned.join("\n")}\n`,
      );
    }
  }

  // Only touch the index when the repo keeps one; a missing index means the repo reads rule files
  // directly, and inventing one would change how it loads everything else.
  const index = join(dir, "index.md");
  if (existsSync(index)) {
    const cur = readFileSync(index, "utf8");
    if (!cur.includes(".ai/rules/godxjp-ui.md")) {
      writeFileAtomic(
        index,
        cur.replace(/\s*$/, "") +
          `\n| ${uiDirs.map((d) => `${d}/**`).join(", ")} | .ai/rules/godxjp-ui.md |\n`,
      );
    }
  }
  return uiDir;
}

/**
 * `npx godxjp-ui sync-rules` — the ONLY path that writes agent files into a consumer project
 * (postinstall writes nothing, #1215). With `dryRun` nothing is written: the returned `changed`
 * lists every file that would be created or changed. Returns `{ skipped, changed, lines }`.
 */
export function runSyncRules(root, { dryRun = false } = {}) {
  const skipped = shouldSkip(root);
  if (skipped) return { skipped, changed: [], lines: [] };
  const lines = [];
  dryRunLog = dryRun ? new Set() : null;
  try {
    const r = ensureMcpJson(root);
    // A refusal is a full sentence, not one of the three status words — say it on its own line.
    if (r.startsWith("left untouched") || r.startsWith("present (custom godx-ui")) {
      lines.push(`\n  @godxjp/ui → .mcp.json ${r}\n`);
    }
    // Reported whatever the project file says: it is live beside ours (gh#722).
    const outside = outOfProjectUiMcpReport(root);
    if (outside) lines.push(outside);
    const md = ensureClaudeMd(root);
    if (md.startsWith("left untouched")) lines.push(`  @godxjp/ui → CLAUDE.md ${md}\n`);
    const wf = writeWorkflowMd(root);
    const skill = refreshGuineaPigSkill(root);
    const rules = ensureConsumerRules(root);
    const refused = r.startsWith("left untouched") || md.startsWith("left untouched");
    if (!refused && !(r === "present" && md === "present" && !wf && !skill && !rules)) {
      lines.push(
        `\n  @godxjp/ui → MCP in .mcp.json (${r}); workflow mandate in CLAUDE.md (${md}).\n` +
          (rules
            ? `  common consumer rules in .ai/rules/godxjp-ui.md (UI dirs: ${rules}).\n`
            : "") +
          (skill ? "  guinea-pig skill refreshed to this version (your section 8 kept).\n" : "") +
          "  Your agent now has live component + audit guidance. Restart it to pick up the MCP.\n" +
          "  For auto-audit on every edit (PostToolUse + SessionStart hooks):\n" +
          "    npx @godxjp/ui init-agent\n",
      );
    }
    return { skipped: null, changed: dryRun ? [...dryRunLog].sort() : [], lines };
  } finally {
    dryRunLog = null;
  }
}
