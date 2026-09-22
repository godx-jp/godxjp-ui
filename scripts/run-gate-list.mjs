#!/usr/bin/env node
/**
 * RUN A LIST OF GATES AND REPORT EVERY FAILURE — not just the first (gh#853).
 *
 * `verify:ci:static` was 46 commands joined with `&&`. `&&` short-circuits, so a failure at
 * command 3 means commands 4…46 NEVER EXECUTE, and you learn about one defect per CI round trip.
 * With this lane at roughly five minutes, N independent failures cost N waits instead of one.
 *
 * Worse, it is invisible to the index built to catch exactly this: `check:gate-coverage` asks
 * whether a gate is WIRED to a workflow, not whether it EXECUTED. A gate can be correctly wired,
 * reported as covered, and not have run for weeks.
 *
 * The neighbouring repo hit the severe form — 56 commands in one CI step, `bash -e` stopping at
 * #33, so 23 gates had not executed since 2026-09-20 and nobody knew; and because that job carried
 * `continue-on-error`, the RUN read success while the JOB was failure. We have no
 * `continue-on-error` anywhere, so our red runs at least read red — but the short-circuit half was
 * ours too.
 *
 * WHY THE LIST IS STILL A `&&` STRING IN package.json. It stays the single declaration, and this
 * script only changes how it is EXECUTED. A second, maintained array of gate names would be a list
 * that drifts from the one CI runs — the failure `scripts/regen-generated.mjs` exists to avoid.
 *
 * PREREQUISITES STILL ABORT. A few entries produce what later ones read: `build` writes `dist/`
 * that `check:packed-public-contract` and `check:dist-tokens-resolve` inspect, and `preview:build`
 * writes `preview/dist/` that the frame gates serve. If one of those fails, everything downstream
 * fails FOR THAT REASON, and forty cascading failures is worse signal than one honest abort. So
 * they are named, they abort, and they say so — anything else runs to the end and is collected.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const scriptName = process.argv[2];
if (!scriptName) {
  console.error("usage: run-gate-list.mjs <package.json script name>");
  process.exit(2);
}

const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {};
const declaration = scripts[scriptName];
if (!declaration) {
  console.error(`✗ run-gate-list: package.json has no script "${scriptName}".`);
  process.exit(2);
}

const commands = declaration
  .split("&&")
  .map((part) => part.trim())
  .filter(Boolean);

/**
 * An entry whose OUTPUT later entries read. Not "expensive" and not "important" — only this.
 * Getting the list wrong in either direction is visible: too many, and one failure still hides
 * others; too few, and a cascade of derived failures buries the real one.
 */
const PREREQUISITES = new Set(["pnpm build", "pnpm preview:build"]);

const failures = [];
const started = Date.now();

for (const [index, command] of commands.entries()) {
  const label = `${String(index + 1).padStart(2)}/${commands.length}  ${command}`;
  const at = Date.now();
  const result = spawnSync(command, { shell: true, stdio: "inherit" });
  const seconds = ((Date.now() - at) / 1000).toFixed(1);

  if (result.status === 0) {
    console.log(`✓ ${label}  (${seconds}s)`);
    continue;
  }

  console.log(`✗ ${label}  (${seconds}s)`);
  failures.push({ command, seconds });

  if (PREREQUISITES.has(command)) {
    console.error(
      `\n✗ ${scriptName} ABORTED at a prerequisite: \`${command}\`.\n` +
        `  ${commands.length - index - 1} later gate(s) read what it produces, so running them now\n` +
        `  would report ITS failure ${commands.length - index - 1} more times instead of reporting\n` +
        "  theirs. Fix it and re-run.",
    );
    process.exit(1);
  }
}

const elapsed = ((Date.now() - started) / 1000).toFixed(1);

if (failures.length === 0) {
  console.log(`\n✓ ${scriptName} — ${commands.length} gate(s), all green (${elapsed}s).`);
  process.exit(0);
}

console.error(
  `\n✗ ${scriptName} — ${failures.length} of ${commands.length} gate(s) failed (${elapsed}s).\n` +
    "  Every gate ran, so this is the COMPLETE list, not the first one:\n" +
    failures.map((f) => `    ✗ ${f.command}  (${f.seconds}s)`).join("\n"),
);
process.exit(1);
