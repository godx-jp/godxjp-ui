#!/usr/bin/env node
/**
 * @godxjp/ui CLI — `npx @godxjp/ui <command>`.
 *   init-agent     scaffold the agent forcing-kit (MCP + auto-audit hook + mandate)
 *   sync-rules     refresh package-owned agent rules (same path as postinstall)
 *   audit          static UI audit (regex over source)
 *   visual-audit   runtime audit (Playwright + axe-core) against a running app
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MAP = {
  "init-agent": "init-agent-kit.mjs",
  "sync-rules": "postinstall.mjs",
  audit: "ui-audit.mjs",
  "visual-audit": "visual-audit.mjs",
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
  It is the postinstall step, run by hand — use it when the app installs with ignore-scripts=true,
  where postinstall never runs and the rules go stale. Silent no-op in CI and when opted out.`,
  audit: `godxjp-ui audit [dir …] [--changed] [--format json] [--quiet] [--rules]

  Static UI-standardization audit over source (regex, no browser, fast). Exits non-zero on errors.
    dir …           directories or files to scan
    --changed       scan what this branch changed vs origin/main (committed, staged, untracked);
                    fails rather than reporting clean when origin/main cannot be resolved
    --format json   machine-readable findings
    --quiet         print errors only (warnings hidden)
    --rules         print the rule catalog as JSON and exit
  Pre-commit:  npx godxjp-ui audit resources/js || exit 1`,
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
  sync-rules     refresh package-owned agent rules (postinstall, by hand)
  audit          static UI audit over source
  visual-audit   runtime audit (Playwright + axe-core) against a running app

godxjp-ui <command> --help   details and flags for one command`;

const isHelp = (arg) => arg === "--help" || arg === "-h" || arg === "help";
const [cmd, ...rest] = process.argv.slice(2);

if (cmd === undefined || isHelp(cmd)) {
  const topic = isHelp(cmd) ? rest[0] : undefined;
  console.log(topic && HELP[topic] ? HELP[topic] : USAGE);
  process.exit(cmd === undefined ? 1 : 0);
}
const script = MAP[cmd];
if (!script) {
  console.error(`unknown command: ${cmd}\n\n${USAGE}`);
  process.exit(1);
}
if (rest.includes("--help") || rest.includes("-h")) {
  console.log(HELP[cmd]);
  process.exit(0);
}
const env =
  cmd === "sync-rules"
    ? { ...process.env, INIT_CWD: process.env.INIT_CWD ?? process.cwd() }
    : process.env;
const r = spawnSync("node", [join(HERE, script), ...rest], { stdio: "inherit", env });
process.exit(r.status ?? 0);
