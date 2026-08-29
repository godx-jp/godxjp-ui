#!/usr/bin/env node
/**
 * Hard-coded geometry/chrome guard — cardinal rules #44 and #45.
 *
 * A literal like `px-2`, `max-w-xs`, `rounded-md`, `z-50` or `h-7` baked into a component is a
 * constant a service theme CANNOT reach. Rule #45 says every service-tunable constant gets a
 * knob; rule #44 says chrome reads a token whose default is the quietest state. A Tailwind scale
 * literal satisfies neither: the only way to change it is to fork the component. That is exactly
 * how Tooltip ended up un-themeable — its whole box was
 * `z-50 max-w-xs px-2 py-1 rounded-md text-xs shadow-md`, with no token anywhere.
 *
 * WHAT COUNTS AS A VIOLATION
 *   Geometry/chrome literals on a SCALE STEP — the numbers and t-shirt sizes above.
 *
 * WHAT DOES NOT
 *   • Role utilities (`bg-primary`, `text-muted-foreground`, `border-border`). These ARE
 *     token-backed through Tailwind v4 `@theme` — flagging them would be wrong, and an early
 *     draft of the audit did exactly that and overstated the debt.
 *   • Arbitrary values that read a token: `rounded-[var(--radius-pill)]`.
 *   • Structural utilities with no scale step: `flex`, `grid`, `absolute`, `truncate`.
 *
 * RATCHET, NOT A CLIFF
 *   There are hundreds of these; failing the build on all of them today would just get the guard
 *   disabled. Instead every file carries a baseline count that may only SHRINK. Exceed it and CI
 *   fails; drop below it and CI ALSO fails, telling you to re-baseline — that is what stops the
 *   number creeping back up after someone cleans a file. Re-baseline with `--update`.
 *
 * Usage:
 *   node scripts/check-no-hardcoded-geometry.mjs            # check against the baseline
 *   node scripts/check-no-hardcoded-geometry.mjs --update   # rewrite the baseline after a cleanup
 *   node scripts/check-no-hardcoded-geometry.mjs --json     # machine-readable report
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIR = join(ROOT, "src/components");
const BASELINE = join(ROOT, "scripts/no-hardcoded-geometry.baseline.json");

const args = new Set(process.argv.slice(2));
const UPDATE = args.has("--update");
const AS_JSON = args.has("--json");

/** Spacing/size utilities carrying a literal scale step. */
const GEOMETRY =
  /(?:^|[\s:])((?:p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|gap|gap-x|gap-y|w|h|min-w|max-w|min-h|max-h|size|z|inset|top|bottom|start|end)-(?:\d+(?:\.\d+)?|px|xs|sm|md|lg|xl|\d?xl|full|fit|auto))(?=$|[\s"'`])/g;
/** Chrome utilities (radius, elevation, border width, type scale) carrying a literal step. */
const CHROME =
  /(?:^|[\s:])((?:rounded|shadow|border|text|leading|tracking|opacity)-(?:none|sm|md|lg|xl|\d?xl|full|px|\d+))(?=$|[\s"'`])/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Every string literal in the file — class lists live inside them, including multi-line cn(). */
function scan(source) {
  const literals = [...source.matchAll(/"([^"\n]{2,400})"|'([^'\n]{2,400})'/g)].map(
    (m) => m[1] ?? m[2] ?? "",
  );
  const hits = [];
  for (const literal of literals) {
    // Cheap reject: no utility-looking token and no design-system class.
    if (!/[a-z]-|\bui-/.test(literal)) continue;
    // Skip import specifiers and URLs — they are not class lists.
    if (/^(https?:|\.\/|\.\.\/|@)/.test(literal)) continue;
    for (const m of literal.matchAll(GEOMETRY)) hits.push(m[1]);
    for (const m of literal.matchAll(CHROME)) hits.push(m[1]);
  }
  return hits;
}

const files = walk(SCAN_DIR)
  .filter((f) => /\.tsx?$/.test(f) && !f.includes("__tests__") && !f.includes(".test."))
  .sort();

const counts = {};
const samples = {};
for (const file of files) {
  const hits = scan(readFileSync(file, "utf8"));
  if (!hits.length) continue;
  const rel = relative(ROOT, file);
  counts[rel] = hits.length;
  samples[rel] = [...new Set(hits)].slice(0, 6);
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (UPDATE) {
  writeFileSync(BASELINE, `${JSON.stringify({ total, files: counts }, null, 2)}\n`);
  console.log(
    `✓ baseline written — ${total} literal(s) across ${Object.keys(counts).length} file(s)`,
  );
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error(`✗ missing ${relative(ROOT, BASELINE)} — run with --update to create it.`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
const regressions = [];
const improvements = [];

for (const [file, count] of Object.entries(counts)) {
  const allowed = baseline.files[file];
  if (allowed === undefined) {
    regressions.push(
      `${file}: ${count} literal(s) in a file with no baseline (${samples[file].join(" ")})`,
    );
  } else if (count > allowed) {
    regressions.push(
      `${file}: ${count} literal(s), baseline allows ${allowed} (${samples[file].join(" ")})`,
    );
  } else if (count < allowed) {
    improvements.push(`${file}: ${count} < ${allowed}`);
  }
}
for (const file of Object.keys(baseline.files)) {
  if (counts[file] === undefined) improvements.push(`${file}: 0 < ${baseline.files[file]}`);
}

if (AS_JSON) {
  console.log(
    JSON.stringify({ total, baselineTotal: baseline.total, regressions, improvements }, null, 2),
  );
  process.exit(regressions.length || improvements.length ? 1 : 0);
}

if (regressions.length) {
  console.error("✗ hard-coded geometry/chrome added (cardinal rules #44/#45)\n");
  for (const line of regressions) console.error(`  ${line}`);
  console.error(
    "\n  These constants a service theme cannot reach. Give each one a component token\n" +
      "  (docs/TOKENS.md · Add-a-token checklist) instead of a Tailwind scale literal.\n" +
      "  Role utilities like bg-primary / text-muted-foreground are fine — they are token-backed.",
  );
  process.exit(1);
}

if (improvements.length) {
  console.error(
    `✗ baseline is stale — ${improvements.length} file(s) improved. Lock the win in:\n`,
  );
  for (const line of improvements) console.error(`  ${line}`);
  console.error("\n  Run: node scripts/check-no-hardcoded-geometry.mjs --update");
  process.exit(1);
}

console.log(
  `✓ no new hard-coded geometry — ${total} literal(s) across ${Object.keys(counts).length} file(s), ` +
    `at the ${baseline.total} baseline (#316 is driving this to 0).`,
);
