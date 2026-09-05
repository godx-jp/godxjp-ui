#!/usr/bin/env node
/**
 * Hard-coded CSS value guard — cardinal rules #44 and #45, the stylesheet half.
 * `check-no-hardcoded-geometry.mjs` only reads `src/components/**\/*.tsx`.
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIR = join(ROOT, "src/styles");
const BASELINE = join(ROOT, "scripts/no-hardcoded-css-values.baseline.json");

const args = new Set(process.argv.slice(2));
const UPDATE = args.has("--update");
const AS_JSON = args.has("--json");

/** Geometry/chrome properties. Logical forms are first-class here — this repo writes
 * `inline-size` / `padding-inline` / `inset-block-start` far more often than the physical ones. */
const GEOMETRY_PROPERTY =
  /^(?:(?:min-|max-)?(?:width|height|inline-size|block-size)|padding(?:-[a-z-]+)?|margin(?:-[a-z-]+)?|gap|row-gap|column-gap|inset(?:-[a-z-]+)?|top|bottom|left|right|border-radius|border-[a-z-]+-radius|font-size|box-shadow)$/;

/** Absolute + viewport length units. `%` is handled separately (see the allow-list above). */
const LENGTH = /(-?\d*\.?\d+)(px|rem|em|ch|ex|vh|vw|vmin|vmax|pt|cm|mm|in|pc)\b/g;
const VIEWPORT_UNIT = /^(?:vh|vw|vmin|vmax)$/;
/** `line-height` is the one property whose constant is normally UNITLESS (`1.2`, `1.5`). */
const UNITLESS_LINE_HEIGHT = /^-?\d*\.?\d+$/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Blank a region but keep its newlines, so reported line numbers stay true to the source. */
function blank(text) {
  return text.replace(/[^\n]/g, " ");
}

/**
 * Strip comments before scanning. The geometry guard learned this the hard way — Card's explainer
 * comment quoting `className="border-2"` and Topbar's JSDoc `<Avatar className="rounded-md">` were
 * both counted as debt in files that had none.
 */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, blank);
}

/** Blank `@media (min-width: 48rem) {` preludes — a breakpoint is a query, not a component knob. */
function stripAtRulePreludes(source) {
  return source.replace(/@(?:media|container|supports)[^{;]*/g, blank);
}

function isAllowedLiteral(value, unit) {
  if (value === 0) return true; // 0 / 0px — "off", never a constant.
  if (unit === "px" && Math.abs(value) === 1) return true; // hairline.
  if (VIEWPORT_UNIT.test(unit) && Math.abs(value) === 100) return true; // the `100%` of viewports.
  return false;
}

function scan(rawSource) {
  const source = stripAtRulePreludes(stripComments(rawSource));
  const hits = [];
  // A declaration: `prop: value` closed by `;` or the rule's `}`. A selector like `a:hover {` never
  // matches — `[^;{}]+` cannot swallow the `{`, so there is no terminator to close on.
  for (const m of source.matchAll(/([-a-zA-Z]+)\s*:\s*([^;{}]+)[;}]/g)) {
    const property = m[1].toLowerCase();
    const value = m[2].trim();
    if (value.includes("var(--")) continue; // reads a knob — this is the destination, not the debt.

    const isLineHeight = property === "line-height";
    if (!isLineHeight && !GEOMETRY_PROPERTY.test(property)) continue;

    const line = source.slice(0, m.index).split("\n").length;
    const record = (literal) => hits.push({ line, property, value, literal });

    // `line-height: 0` and `line-height: 1` are the icon-box resets, not typography choices.
    if (isLineHeight && UNITLESS_LINE_HEIGHT.test(value)) {
      const n = Math.abs(Number.parseFloat(value));
      if (n !== 0 && n !== 1) record(value);
      continue;
    }

    for (const l of value.matchAll(LENGTH)) {
      if (isAllowedLiteral(Number.parseFloat(l[1]), l[2])) continue;
      record(l[0]);
    }
  }
  return hits;
}

const files = walk(SCAN_DIR)
  .filter((f) => f.endsWith(".css") && !f.includes("__tests__"))
  .sort();

const counts = {};
const samples = {};
for (const file of files) {
  const hits = scan(readFileSync(file, "utf8"));
  if (!hits.length) continue;
  const rel = relative(ROOT, file);
  counts[rel] = hits.length;
  samples[rel] = hits
    .slice(0, 6)
    .map((h) => `${rel}:${h.line} ${h.property}: ${h.value}   → ${h.literal}`);
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
      `${file}: ${count} literal(s) in a file with no baseline\n      ${samples[file].join("\n      ")}`,
    );
  } else if (count > allowed) {
    regressions.push(
      `${file}: ${count} literal(s), baseline allows ${allowed}\n      ${samples[file].join("\n      ")}`,
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
  console.error("✗ hard-coded CSS value(s) added in src/styles (cardinal rules #44/#45)\n");
  for (const line of regressions) console.error(`  ${line}`);
  console.error(
    "\n  A literal here is a constant no service theme can reach — moving it out of a .tsx\n" +
      "  className into a stylesheet does not pay the debt, it only hides it from the other guard.\n" +
      "  Give it a component token (docs/TOKENS.md · Add-a-token checklist) and read it with\n" +
      "  var(--…). 0 / 100% / auto / none / 1px hairlines / @media conditions are already exempt.",
  );
  process.exit(1);
}

if (improvements.length) {
  console.error(
    `✗ baseline is stale — ${improvements.length} file(s) improved. Lock the win in:\n`,
  );
  for (const line of improvements) console.error(`  ${line}`);
  console.error("\n  Run: node scripts/check-no-hardcoded-css-values.mjs --update");
  process.exit(1);
}

console.log(
  `✓ no new hard-coded CSS values — ${total} literal(s) across ${Object.keys(counts).length} file(s), ` +
    `at the ${baseline.total} baseline (#316 is driving this to 0).`,
);
