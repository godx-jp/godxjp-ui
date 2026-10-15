#!/usr/bin/env node
/**
 * agent-guard — the logic behind the user-level shim (scripts/user-guard.mjs, installed by
 * `npx godxjp-ui init-agent --user`; gh#1324). Usage, from the shim only:
 *
 *   node agent-guard.mjs pre|post <repo root>   < Claude Code hook payload on stdin
 *
 * The shim has already established that the edited .tsx/.jsx sits in <repo root> and that the
 * repo's `.mcp.json` mounts @godxjp/ui-mcp.
 *
 *   pre   BLOCK (exit 2) unless the agent's own transcript shows it consulted the catalog: a tool
 *         call to `mcp__<key>__*` for the repo's catalog key, or a Bash call to the stdio fallback
 *         (`godxjp-ui mcp-call …`, or `godx-ui-mcp call …`). A subagent is judged by ITS transcript
 *         (`agent_transcript_path`), so a parent's lookup does not license a subagent's write.
 *   post  When the session did not start in <repo root>, the repo's own PostToolUse audit hook
 *         never loaded: run this package's audit-hook.mjs in its place. Otherwise do nothing, so
 *         a session that did start there is not audited twice.
 *
 * No network. FAIL OPEN: an internal error — unreadable payload, missing or unparseable
 * transcript, a crash — exits 0. Only the deliberate "not consulted" verdict blocks.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Same test as runsUiMcp in _agent-setup.mjs — the catalog server under any key. */
const runsUiMcp = (entry) =>
  [entry?.command, ...(Array.isArray(entry?.args) ? entry.args : [])].some(
    (part) => typeof part === "string" && /(^|\/)@godxjp\/ui-mcp(@|$)/.test(part),
  );

/** The `.mcp.json` keys that serve the catalog — the `<key>` in `mcp__<key>__<tool>`. */
export function catalogKeys(root) {
  const servers = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8"))?.mcpServers ?? {};
  const keys = Object.keys(servers).filter((k) => k === "godx-ui" || runsUiMcp(servers[k]));
  return keys.length ? keys : ["godx-ui"];
}

/** A Bash command that queries the catalog over the stdio fallback. */
const CLI_CALL =
  /\bmcp-call\s+[a-z_]+|\bui-mcp(?:@\S+)?\s+call\s+[a-z_]+|\bgodx-ui-mcp\s+call\s+[a-z_]+/;

/**
 * True when the transcript (JSONL) holds a tool_use that consulted the catalog. Only tool_use
 * blocks count: the block message itself quotes the fallback command, and a transcript that
 * merely CONTAINS that text (in a tool result, in the agent's prose) has not run it.
 */
export function consulted(transcript, keys) {
  const prefixes = keys.map((k) => `mcp__${k}__`);
  for (const line of transcript.split("\n")) {
    if (!line.includes('"tool_use"')) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue; // a torn last line while the session is still writing
    }
    const content = entry?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block?.type !== "tool_use" || typeof block.name !== "string") continue;
      if (prefixes.some((p) => block.name.startsWith(p))) return true;
      if (block.name === "Bash" && CLI_CALL.test(String(block.input?.command ?? ""))) return true;
    }
  }
  return false;
}

const realOrSelf = (p) => {
  try {
    return realpathSync(p);
  } catch {
    return resolve(p);
  }
};

/**
 * Did the session START in <root>? Claude Code loads project hooks from the start directory and
 * hands hooks `CLAUDE_PROJECT_DIR`; without it, the transcript's project folder is the start
 * directory with every non-alphanumeric character turned into "-" (the measured layout:
 * ~/.claude/projects/<slug>/<session>.jsonl, a subagent's under <session>/subagents/). A write in
 * <top>/.claude/worktrees/<x> of a session started at <top> counts as started there: <top>'s
 * hooks are the ones that loaded.
 */
export function startedIn(root, payload, env = process.env) {
  const roots = new Set([resolve(root), realOrSelf(root)]);
  for (const r of [...roots]) {
    const at = r.indexOf(`${sep}.claude${sep}worktrees${sep}`);
    if (at > 0) roots.add(r.slice(0, at));
  }
  if (env.CLAUDE_PROJECT_DIR) {
    const start = env.CLAUDE_PROJECT_DIR;
    return roots.has(resolve(start)) || roots.has(realOrSelf(start));
  }
  let transcript = String(payload?.transcript_path ?? "");
  if (!transcript) return false;
  if (transcript.includes(`${sep}subagents${sep}`)) transcript = dirname(dirname(transcript));
  const slug = (p) => p.replace(/[^A-Za-z0-9]/g, "-");
  return [...roots].some((r) => basename(dirname(transcript)) === slug(r));
}

/** The @godxjp/ui repo itself builds primitives from raw elements; the guard is for consumers. */
function isLibrary(root) {
  try {
    const name = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))?.name;
    return name === "@godxjp/ui" || name === "@godxjp/ui-mcp";
  } catch {
    return false;
  }
}

export function blockMessage(file, root, keys, started) {
  const at = /^[\w./@-]+$/.test(root) ? root : `'${root.replace(/'/g, "'\\''")}'`;
  const key = keys[0];
  return [
    `godxjp-ui guard: ${file} was NOT written.`,
    `${root} builds its UI with @godxjp/ui, and this agent has not consulted the catalog yet.`,
    started
      ? null
      : `- This session did not start in ${root}, so its .mcp.json (the ${key} MCP), CLAUDE.md and hooks are NOT loaded.`,
    `- Consult the catalog first: call mcp__${key}__search_components, then get_component for each component you use.`,
    `  No mcp__${key}__* tools in this session? Query the same catalog over stdio:`,
    `    cd ${at} && npx --no-install @godxjp/ui mcp-call search_components '{"query":"<what you are building>"}'`,
    `    cd ${at} && npx --no-install @godxjp/ui mcp-call get_component '{"name":"<Component>"}'`,
    `  (\`npx --no-install @godxjp/ui mcp-call\` with no tool lists every tool.)`,
    `- Read ${join(root, "CLAUDE.md")} (the @godxjp/ui section), then retry the write.`,
  ]
    .filter(Boolean)
    .join("\n");
}

function main() {
  const [event, root] = process.argv.slice(2);
  if (!root || (event !== "pre" && event !== "post") || isLibrary(root)) process.exit(0);
  const raw = readFileSync(0, "utf8");
  const payload = JSON.parse(raw);
  const file = payload?.tool_input?.file_path ?? payload?.tool_input?.filePath;
  if (typeof file !== "string" || /\.(test|stories)\.[jt]sx$/.test(file)) process.exit(0);
  const started = startedIn(root, payload);

  if (event === "post") {
    if (started) process.exit(0); // the repo's own PostToolUse audit hook already ran
    const hook = join(HERE, "audit-hook.mjs");
    if (!existsSync(hook)) process.exit(0);
    const r = spawnSync(process.execPath, [hook], {
      input: raw,
      cwd: root,
      encoding: "utf8",
      timeout: 30_000,
    });
    if (r.error || r.status === null) process.exit(0);
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
    process.exit(r.status === 2 ? 2 : 0);
  }

  const transcriptPath = payload.agent_transcript_path ?? payload.transcript_path;
  if (!transcriptPath || !existsSync(transcriptPath)) process.exit(0); // nothing to judge by
  const keys = catalogKeys(root);
  if (consulted(readFileSync(transcriptPath, "utf8"), keys)) process.exit(0);
  process.stderr.write(blockMessage(file, root, keys, started) + "\n");
  process.exit(2); // exit 2 on PreToolUse → Claude Code blocks the call and shows stderr
}

// Run only as a script, so tests can import the helpers.
if (process.argv[1] && realOrSelf(process.argv[1]) === realOrSelf(fileURLToPath(import.meta.url))) {
  process.on("uncaughtException", () => process.exit(0)); // fail open, see the header
  try {
    main();
  } catch {
    process.exit(0); // fail open
  }
}
