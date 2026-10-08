#!/usr/bin/env node
/**
 * @godxjp/ui CLI — `npx @godxjp/ui <command>`.
 *   init-agent     scaffold the agent forcing-kit (MCP + auto-audit hook + mandate)
 *   sync-rules     write/refresh package-owned agent rules (--dry-run previews)
 *   audit          static UI audit (regex over source)
 *   visual-audit   runtime audit (Playwright + axe-core) against a running app
 *   prune-css      emit a stylesheet with only the CSS layers the app uses (gh#971)
 *   codemod v32    apply the mechanical half of the v32 upgrade (docs/migrations/v32.md)
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MAP = {
  "init-agent": "init-agent-kit.mjs",
  audit: "ui-audit.mjs",
  "visual-audit": "visual-audit.mjs",
  "prune-css": "prune-css.mjs",
  codemod: "codemod.mjs",
};

// `<command> --help` is answered HERE: the scripts take free positional arguments, so a `--help`
// forwarded to ui-audit used to be read as nothing and ran a full audit instead of printing help.
const HELP = {
  "init-agent": `godxjp-ui init-agent

  Install the agent forcing-kit into the current consumer app (run it from the app root):
    .mcp.json                  the godx-ui MCP server
    .claude/settings.json      a PostToolUse hook that audits every Write/Edit of a .tsx file
    .claude/godxjp-ui-workflow.md
    CLAUDE.md                  the godxjp-ui mandate block
  Idempotent. Refuses inside the @godxjp/ui repo itself. Restart the agent afterwards.`,
  "sync-rules": `godxjp-ui sync-rules

  Refresh the package-owned agent files for the installed @godxjp/ui version: the godx-ui entry in
  .mcp.json, the managed CLAUDE.md block, .claude/godxjp-ui-workflow.md and .ai/rules/godxjp-ui.md.
  Postinstall writes nothing (inert install); this explicit command is the only thing that does.
  Run it after installing and after each upgrade. Silent no-op in CI and when opted out.

    --dry-run   list every file it would create or change, without writing anything

  Restart the session afterwards: rewriting the .mcp.json pin does not relaunch an MCP server that
  is already running, and that process keeps answering from the catalog it started with.

  It also READS Claude Code's ~/.claude.json and reports any @godxjp/ui-mcp registered there (user
  scope, or local scope for this project): key, pin, and the claude mcp command that updates it.
  That file is outside the project and is never written; env values are never printed.`,
  audit: `godxjp-ui audit [dir …] [--changed] [--format json] [--quiet] [--rules]

  Static UI-standardization audit over source (regex, no browser, fast). Exits non-zero on errors.
    dir …           directories or files to scan
    --changed       scan what this branch changed vs origin/main (committed, staged, untracked);
                    fails rather than reporting clean when origin/main cannot be resolved
    --format json   machine-readable findings
    --quiet         print errors only (warnings hidden)
    --rules         print the rule catalog as JSON and exit
  Pre-commit:  npx godxjp-ui audit resources/js || exit 1`,
  "prune-css": `godxjp-ui prune-css <src dir/glob …> [--out <file>] [--fonts]

  Emit a stylesheet with only the component CSS layers your app uses (gh#971). Scans the given
  sources for @godxjp/ui imports, resolves the layer dependency closure from the graph the
  package ships (dist/styles/layers.json), and writes a css file that imports the foundation
  plus only the needed *-layout.css layers, in the exact order styles/index.css loads them.
    <src dir/glob …>  your app's source (directories are walked)
    --out <file>      output path (default: godx-ui.css)
    --fonts           include the bundled @font-face declarations (default mirrors styles/core)
  Import the emitted file INSTEAD of "@godxjp/ui/styles". Re-run when your component usage
  changes and after every upgrade; it refuses on a package/manifest version mismatch.
  Hand cherry-picking *-layout.css stays forbidden — this tool is the only thing allowed to slice.`,
  codemod: `godxjp-ui codemod v32 [paths…] [--godx] [--dry-run]

  Apply the mechanical half of the v32 upgrade (docs/migrations/v32.md). Idempotent.
    paths …     files or directories to rewrite (default ".")
    --godx      a GoDX product: keep today's look with the GoDX preset (violet, the GoDX mark,
                vi default locale, Japanese fonts)
    --dry-run   list every change without writing
  What it cannot decide (a component move that changes props, an AppProvider that relied on the
  old vi default) is printed as a "note" for you to finish.`,
  "visual-audit": `godxjp-ui visual-audit [--format json] [--strict] <baseUrl> [route …]

  Runtime audit (Playwright + axe-core) against an app you are ALREADY running locally.
    baseUrl         the running app, e.g. http://localhost:5173
    route …         paths appended to baseUrl (default "/")
    --strict        exit non-zero on any finding, not only errors
    --format json   machine-readable findings
    --rules         print the visual rule catalog as JSON and exit
  Needs the playwright peer installed.`,
};

const USAGE = `usage: godxjp-ui <command> [args]

commands:
  init-agent     install the agent forcing-kit (MCP + auto-audit hook + CLAUDE.md mandate)
  sync-rules     write/refresh package-owned agent rules (--dry-run previews)
  audit          static UI audit over source
  visual-audit   runtime audit (Playwright + axe-core) against a running app
  prune-css      emit a stylesheet with only the CSS layers your app uses

godxjp-ui <command> --help   details and flags for one command`;

const isHelp = (arg) => arg === "--help" || arg === "-h" || arg === "help";
const [cmd, ...rest] = process.argv.slice(2);

if (cmd === undefined || isHelp(cmd)) {
  const topic = isHelp(cmd) ? rest[0] : undefined;
  console.log(topic && HELP[topic] ? HELP[topic] : USAGE);
  process.exit(cmd === undefined ? 1 : 0);
}
const script = MAP[cmd];
if (!script && cmd !== "sync-rules") {
  console.error(`unknown command: ${cmd}\n\n${USAGE}`);
  process.exit(1);
}
if (rest.includes("--help") || rest.includes("-h")) {
  console.log(HELP[cmd]);
  process.exit(0);
}
if (cmd === "sync-rules") {
  // The ONLY writer of agent files (postinstall is inert, #1215). In-process: no env hand-off.
  const { runSyncRules } = await import("./_agent-setup.mjs");
  const dryRun = rest.includes("--dry-run");
  const root = process.env.INIT_CWD ?? process.cwd();
  const { changed, lines } = runSyncRules(root, { dryRun });
  for (const line of lines) console.log(line);
  if (dryRun) {
    console.log(
      changed.length
        ? `  sync-rules --dry-run: would create or change ${changed.length} file(s), nothing written:\n` +
            changed.map((f) => `    ${f}`).join("\n")
        : "  sync-rules --dry-run: nothing to change.",
    );
  }
  process.exit(0);
}
const r = spawnSync("node", [join(HERE, script), ...rest], { stdio: "inherit", env: process.env });
process.exit(r.status ?? 0);
