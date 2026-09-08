#!/usr/bin/env node
/**
 * check:gate-coverage — the gate that guards the gates. Every `check:*` script in package.json
 * must either be REACHABLE from something a workflow actually runs, or be named in EXEMPT below
 * with the reason it is not. Adding a `check:` and forgetting to wire it now turns CI red.
 *
 * WHY THIS EXISTS, AND WHY IT DOES NOT AUDIT `verify:ci`
 * The obvious version of this guard — "is the gate listed in `verify:ci`?" — is the bug it is
 * meant to prevent, wearing the costume of the fix. No workflow in this repo runs `verify:ci`.
 * ci.yml runs `verify:ci:static` + `check:frame-contracts` + a sharded `pnpm test`; the Chromium
 * gates run in ci-browser.yml, the wide sweeps in ci-browser-full.yml, and the release contract in
 * release-integrity.yml. Membership in `verify:ci` is therefore evidence of nothing, and an audit
 * built on it reports gates as "not run" that run on every merge (check:contrast, check:frame-axe,
 * all seven inside check:frame-contracts) while reporting gates as "wired" that no runner ever
 * executes. So this script resolves coverage the only way that cannot drift: it reads the
 * workflows, takes what they invoke as the roots, and expands those roots through package.json.
 *
 * CONSEQUENCE FOR THE EXEMPT LIST — it is a list of gates NOTHING runs, each with a reason a
 * person accepted. It is not a list of "gates outside verify:ci". Keep it that way.
 *
 * The list is checked in BOTH directions: an exempt gate that has since been wired is an error
 * too, so the list cannot quietly rot into a pile of stale excuses.
 *
 * Usage: node scripts/check-gate-coverage.mjs [--report]
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const REPORT = process.argv.includes("--report");
const WORKFLOW_DIR = join(ROOT, ".github/workflows");

/**
 * Gates that NO workflow runs, and the reason each is allowed to stay that way.
 *
 * A gate belongs here only if it genuinely cannot run unattended — it needs a human, a device or
 * a judgement call that a runner does not have. "It is slow" is not a reason to be here; that is
 * a reason to live in ci-browser-full.yml's nightly lane, which IS covered.
 *
 * @type {Record<string, string>}
 */
const EXEMPT = {
  "check:voiceover-capture":
    "MANUAL — needs a real screen reader driven by a person. scripts/check-voiceover-capture.mjs " +
    'refuses on any non-macOS host and, on macOS, blocks with "VoiceOver is not running. Start ' +
    'it with Command-F5" — it drives Safari + VoiceOver over AppleScript. The swarm-pool runners ' +
    "are Linux, so this can never go green there. Run it by hand before an a11y release and " +
    "commit the evidence; check:screen-reader-evidence (which DOES run, inside " +
    "check:frame-contracts) is the gate that verifies what you committed.",
  "check:frame-runtime":
    "ALIAS, not a gate — it chains eight browser gates that each run individually in " +
    "ci-browser-full.yml (rendered-runtime shards 1-5). Kept as a one-command local repro. " +
    "Wiring the alias itself would run all eight serially in one job and undo that sharding.",
};

/** Strip YAML comments so the prose in these workflows is not mistaken for an invocation. */
function stripComments(yaml) {
  return yaml
    .split("\n")
    .map((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith("#")) return "";
      const hash = line.indexOf(" #");
      return hash === -1 ? line : line.slice(0, hash);
    })
    .join("\n");
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const scripts = pkg.scripts ?? {};

/** `scripts/foo.mjs` -> the package.json script name that runs it, for `node scripts/…` steps. */
const byScriptFile = new Map();
for (const [name, body] of Object.entries(scripts)) {
  for (const m of body.matchAll(/node\s+(scripts\/[\w.-]+\.mjs)/g)) {
    if (!byScriptFile.has(m[1])) byScriptFile.set(m[1], name);
  }
}

/** Every package.json script named inside one script's body (`pnpm x`, `pnpm run x`). */
function childrenOf(name) {
  const body = scripts[name];
  if (!body) return [];
  const out = new Set();
  for (const m of body.matchAll(/pnpm\s+(?:run\s+|-s\s+)?([\w:.-]+)/g)) {
    if (m[1] !== name && scripts[m[1]]) out.add(m[1]);
  }
  return [...out];
}

// ── Roots: what the workflows actually invoke ────────────────────────────────────────────────
/** @type {Map<string, string[]>} script name -> workflow files that invoke it directly */
const roots = new Map();
const workflowFiles = readdirSync(WORKFLOW_DIR).filter((f) => /\.ya?ml$/.test(f));
for (const file of workflowFiles) {
  const yaml = stripComments(readFileSync(join(WORKFLOW_DIR, file), "utf8"));
  const found = new Set();
  for (const m of yaml.matchAll(/pnpm\s+(?:run\s+|-s\s+)?([\w:.-]+)/g)) {
    if (scripts[m[1]]) found.add(m[1]);
  }
  for (const m of yaml.matchAll(/node\s+(scripts\/[\w.-]+\.mjs)/g)) {
    const name = byScriptFile.get(m[1]);
    if (name) found.add(name);
  }
  for (const name of found) {
    if (!roots.has(name)) roots.set(name, []);
    roots.get(name).push(file);
  }
}

// ── Transitive closure: expand each root through package.json ────────────────────────────────
/** @type {Map<string, string>} script name -> "workflow.yml -> a -> b" provenance trail */
const reachable = new Map();
const queue = [...roots.keys()].map((n) => [n, `${roots.get(n).join(", ")}`]);
while (queue.length) {
  const [name, trail] = queue.shift();
  if (reachable.has(name)) continue;
  reachable.set(name, trail);
  for (const child of childrenOf(name)) {
    if (!reachable.has(child)) queue.push([child, `${trail} → ${name}`]);
  }
}

// ── Verdict ──────────────────────────────────────────────────────────────────────────────────
const gates = Object.keys(scripts)
  .filter((n) => n.startsWith("check:"))
  .sort();
const failures = [];
const dead = [];

for (const gate of gates) {
  const covered = reachable.has(gate);
  const exempt = Object.hasOwn(EXEMPT, gate);
  if (covered && exempt) {
    failures.push(
      `  STALE EXEMPTION: "${gate}" is listed in EXEMPT but IS run by CI (${reachable.get(gate)}).\n` +
        `    Remove it from EXEMPT in scripts/check-gate-coverage.mjs.`,
    );
  } else if (!covered && !exempt) {
    dead.push(gate);
    failures.push(
      `  DEAD GATE: "${gate}" is declared in package.json but NO workflow reaches it.\n` +
        `    Wire it into a chain a workflow runs (verify:ci:static, check:frame-contracts,\n` +
        `    verify:browser, or a ci-browser-full.yml job), or add it to EXEMPT with a reason.`,
    );
  }
}
for (const gate of Object.keys(EXEMPT)) {
  if (!scripts[gate]) {
    failures.push(
      `  ORPHAN EXEMPTION: "${gate}" is in EXEMPT but is not a package.json script. Delete it.`,
    );
  }
}

if (REPORT) {
  for (const gate of gates) {
    const where = reachable.get(gate) ?? (Object.hasOwn(EXEMPT, gate) ? "EXEMPT" : "DEAD");
    console.log(`${gate.padEnd(38)} ${where}`);
  }
}

if (failures.length) {
  console.error(`check:gate-coverage FAILED (${failures.length}):\n${failures.join("\n")}`);
  if (dead.length) {
    console.error(
      `\nA gate nobody runs is a gate that cannot fail. @godxjp/ui@19.5.0 shipped a 1.02:1 toast\n` +
        `because a gate's COVERAGE had a hole; this guard exists so a gate's WIRING never does.`,
    );
  }
  process.exit(1);
}

console.log(
  `check:gate-coverage OK — ${gates.length} check:* gates: ` +
    `${gates.length - Object.keys(EXEMPT).length} reached by ${workflowFiles.length} workflows, ` +
    `${Object.keys(EXEMPT).length} declared-manual.`,
);
