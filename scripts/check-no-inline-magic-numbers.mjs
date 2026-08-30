#!/usr/bin/env node
/**
 * Inline-style magic-number guard — cardinal rules #44 and #45, the `style={{…}}` blind spot.
 *
 * `check-no-hardcoded-geometry.mjs` reads class lists. It cannot see an inline style, because an
 * inline style is not a class — so the single most unreachable constant in the whole library was
 * invisible to it. TreeSelect computed its indent as
 *
 *     style={{ paddingInlineStart: `${depth * 1.25 + 0.5}rem` }}
 *
 * and the guard reported the file as clean. That `1.25` is the indent-per-level and that `0.5` is
 * the base inset: two design decisions, baked into a JS expression, at a specificity no stylesheet
 * can outrank and behind no token a service theme can set. It is the WORST kind of rule-#45
 * violation — not merely hard to change, literally unreachable at any price. (Phase 1 replaced it
 * with `style={{ "--tree-select-depth": depth }}` and moved the arithmetic into CSS, where the step
 * is a token.)
 *
 * WHAT COUNTS AS A VIOLATION — a numeric literal inside `style={{…}}` that ends up a CSS length
 *   • A static length in a string or template: `padding: "0.5rem 1rem"`, `top: `4px``.
 *   • A literal baked into an interpolation that is then given an absolute unit:
 *     `` `${depth * 1.25 + 0.5}rem` ``, `` `${index * 4}px` ``.
 *   • A bare number on a length-ish property, which React silently turns into px: `width: 24`,
 *     `maxHeight: rows * 36`.
 *
 * WHAT DOES NOT — the line between "baked" and "dynamic"
 *   • Anything reading a token: `style={{ background: "hsl(var(--attention))" }}`.
 *   • A value computed from props/state with NO numeric literal in it. This is the whole point:
 *     `transform: `scale(${scale})`` is fine — `scale` is data. `width: `${boundedValue}%`` (the
 *     Progress bar) is fine — the number IS the datum. `style={{ height }}` is fine.
 *   • Feeding a custom property from state: `style={{ "--tree-select-depth": depth }}` — that is
 *     the FIX, not the debt, and a bare number on a custom property is not a length anyway.
 *   • `1px` and `0`. A hairline is not a tunable constant; `0` is "off".
 *   • Percentages and viewport units inside an interpolation. `` `${(i / n) * 100}%` `` is a
 *     computed proportion — the 100 is unit conversion, not a design choice. Only absolute units
 *     (px/rem/em/ch/pt) make an interpolated literal a violation.
 *
 * DELIBERATELY NOT FLAGGED (false negatives we are choosing to accept)
 *   • `style={someObject}` / a `React.CSSProperties` const declared outside the JSX. Following the
 *     reference would need real scope analysis; the payoff does not justify the machinery.
 *   • Non-length magic numbers — `zIndex: 50`, `opacity: 0.6`, `duration: 200`. Real debt, but a
 *     different guard's debt; this one is scoped to lengths so its output stays trustworthy.
 *   • Numbers that are call arguments or array indices (`.toFixed(2)`, `ratios[0]`). Those are
 *     precision and addressing, not geometry, so they are stripped before the literal hunt.
 *   Err toward false NEGATIVES: a missed literal costs one line of work, a phantom one sends a
 *   person to "fix" prose.
 *
 * RATCHET, NOT A CLIFF
 *   Same contract as the geometry guard: a per-file baseline that may only SHRINK. Exceed it and CI
 *   fails; drop below it and CI ALSO fails, telling you to re-baseline. Re-baseline with `--update`.
 *
 * Usage:
 *   node scripts/check-no-inline-magic-numbers.mjs            # check against the baseline
 *   node scripts/check-no-inline-magic-numbers.mjs --update   # rewrite the baseline after a cleanup
 *   node scripts/check-no-inline-magic-numbers.mjs --json     # machine-readable report
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIR = join(ROOT, "src/components");
const BASELINE = join(ROOT, "scripts/no-inline-magic-numbers.baseline.json");

const args = new Set(process.argv.slice(2));
const UPDATE = args.has("--update");
const AS_JSON = args.has("--json");

/** Properties React turns into a length. Compared against the key lowercased with `-` removed, so
 * `paddingInlineStart`, `padding-inline-start` and `paddinginlinestart` all normalise to one name. */
const LENGTH_PROPERTY =
  /^(?:(?:min|max)?(?:width|height|inlinesize|blocksize)|padding[a-z]*|margin[a-z]*|gap|rowgap|columngap|inset[a-z]*|top|bottom|left|right|[a-z]*radius|fontsize|lineheight|flexbasis|textindent|letterspacing)$/;

/** A length written out in full: the number and its unit are adjacent in the source. `(?<![\w.$}])`
 * keeps `${x * 2}rem` out of this pass — there the `}` sits between them, and pass 2 owns that. */
const STATIC_ABSOLUTE_LENGTH = /(?<![\w.$}])(\d*\.?\d+)(px|rem|em|ch|pt)\b/g;
const STATIC_RELATIVE_LENGTH = /(?<![\w.$}])(\d*\.?\d+)(%|vh|vw|vmin|vmax)(?![\w-])/g;
/** `${…}` immediately followed by an ABSOLUTE unit — the TreeSelect shape. */
const INTERPOLATED_LENGTH = /\$\{((?:[^{}]|\{[^{}]*\})*)\}\s*(px|rem|em|ch|pt)\b/g;
/** A number that is not part of an identifier and not a property access. */
const NUMERIC_LITERAL = /(?<![\w$.])(\d*\.?\d+)/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function blank(text) {
  return text.replace(/[^\n]/g, " ");
}

/**
 * Strip comments before scanning, preserving offsets so reported line numbers stay true.
 *
 * The geometry guard learned this the hard way — Card's explainer comment quoting
 * `className="border-2"` and Topbar's JSDoc `<Avatar className="rounded-md">` were counted as debt
 * in files that had none. The same trap is live here: the honest way to document this rule is to
 * quote the bug, and every JSDoc that shows a `style={{…}}` example would otherwise be read as one.
 *
 * Deliberately naive — it does not track a string that itself contains `//`. The `[^:]` guard keeps
 * `https://` intact, and any remaining false NEGATIVE costs one uncounted literal, whereas the
 * false POSITIVE it replaces costs someone real time.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:])(\/\/[^\n]*)/g, (_m, lead, comment) => lead + blank(comment));
}

/**
 * Walk from an opening brace to its match, stepping over strings and template literals (including
 * nested `${…}`) so a `}` inside a string never closes the object. Returns -1 if unbalanced.
 */
function matchBrace(text, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      i = skipString(text, i);
      if (i < 0) return -1;
      continue;
    }
    if (c === "{") depth += 1;
    else if (c === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Index of the closing quote/backtick of the string starting at `start`, or -1. */
function skipString(text, start) {
  const quote = text[start];
  for (let i = start + 1; i < text.length; i += 1) {
    const c = text[i];
    if (c === "\\") {
      i += 1;
      continue;
    }
    if (quote === "`" && c === "$" && text[i + 1] === "{") {
      const end = matchBrace(text, i + 1);
      if (end < 0) return -1;
      i = end;
      continue;
    }
    if (c === quote) return i;
  }
  return -1;
}

/** Split an object-literal body on its TOP-LEVEL commas, returning `{ text, offset }` entries. */
function splitEntries(body, bodyOffset) {
  const entries = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < body.length; i += 1) {
    const c = body[i];
    if (c === '"' || c === "'" || c === "`") {
      const end = skipString(body, i);
      if (end < 0) break;
      i = end;
      continue;
    }
    if (c === "{" || c === "(" || c === "[") depth += 1;
    else if (c === "}" || c === ")" || c === "]") depth -= 1;
    else if (c === "," && depth === 0) {
      entries.push({ text: body.slice(start, i), offset: bodyOffset + start });
      start = i + 1;
    }
  }
  entries.push({ text: body.slice(start), offset: bodyOffset + start });
  return entries.filter((e) => e.text.trim());
}

/** First TOP-LEVEL `:` — the key/value separator. A ternary's `:` inside the value is deeper, and a
 * computed key's `:` (there is none) or a `["--x" as string]` bracket is deeper still. */
function splitKeyValue(entry) {
  let depth = 0;
  for (let i = 0; i < entry.length; i += 1) {
    const c = entry[i];
    if (c === '"' || c === "'" || c === "`") {
      const end = skipString(entry, i);
      if (end < 0) break;
      i = end;
      continue;
    }
    if (c === "{" || c === "(" || c === "[") depth += 1;
    else if (c === "}" || c === ")" || c === "]") depth -= 1;
    else if (c === "?")
      depth += 1; // a ternary's `:` belongs to the value, never the key
    else if (c === ":" && depth === 0) return [entry.slice(0, i), entry.slice(i + 1)];
  }
  return [entry, ""]; // shorthand — `style={{ height }}`
}

function normaliseKey(rawKey) {
  return rawKey
    .replace(/\bas\s+[\w.<>[\]| ]+/g, "")
    .replace(/["'`[\]\s]/g, "")
    .replace(/-/g, "")
    .toLowerCase();
}

/** Numbers that are call arguments or array indices are precision/addressing, not geometry. */
function stripNonGeometricNumbers(expression) {
  return expression.replace(/\.\w+\([^()]*\)/g, "").replace(/\[[^[\]]*\]/g, "");
}

function hasBakedNumber(expression) {
  for (const m of stripNonGeometricNumbers(expression).matchAll(NUMERIC_LITERAL)) {
    if (Number.parseFloat(m[1]) !== 0) return true;
  }
  return false;
}

/** `0` is "off" and `1px` is a hairline — neither is a tunable design constant. */
function isAllowedLength(value, unit) {
  if (value === 0) return true;
  if (unit === "px" && Math.abs(value) === 1) return true;
  if (/^(?:vh|vw|vmin|vmax|%)$/.test(unit) && Math.abs(value) === 100) return true;
  return false;
}

function scan(rawSource) {
  const source = stripComments(rawSource);
  const hits = [];
  const lineOf = (index) => source.slice(0, index).split("\n").length;

  for (const m of source.matchAll(/\bstyle\s*=\s*\{/g)) {
    const jsxOpen = m.index + m[0].length - 1;
    const jsxClose = matchBrace(source, jsxOpen);
    if (jsxClose < 0) continue;

    // Inside the JSX expression, find the object literal. `style={styles.row}` has none — out of
    // scope by design (see the header); `style={{…} as React.CSSProperties}` is found here.
    const objOpen = source.indexOf("{", jsxOpen + 1);
    if (objOpen < 0 || objOpen > jsxClose) continue;
    const objClose = matchBrace(source, objOpen);
    if (objClose < 0 || objClose > jsxClose) continue;

    for (const entry of splitEntries(source.slice(objOpen + 1, objClose), objOpen + 1)) {
      const [rawKey, rawValue] = splitKeyValue(entry.text);
      const key = normaliseKey(rawKey);
      const value = rawValue.trim();
      if (!value) continue;
      if (value.includes("var(--")) continue; // reads a knob — the destination, not the debt.

      const line = lineOf(entry.offset);
      const isCustomProperty = rawKey.replace(/["'`[\]\s]/g, "").startsWith("--");
      const isLengthProperty = !isCustomProperty && LENGTH_PROPERTY.test(key);
      const seen = new Set();
      const record = (literal) => {
        if (seen.has(literal)) return;
        seen.add(literal);
        hits.push({ line, key: rawKey.trim(), value: value.replace(/\s+/g, " "), literal });
      };

      // 1 — a length spelled out in the source.
      for (const l of value.matchAll(STATIC_ABSOLUTE_LENGTH)) {
        if (!isAllowedLength(Number.parseFloat(l[1]), l[2])) record(l[0]);
      }
      // …percentages/viewport units only where the property really is a length, so a colour like
      // `hsl(220 10% 50%)` is not misread as geometry.
      if (isLengthProperty) {
        for (const l of value.matchAll(STATIC_RELATIVE_LENGTH)) {
          if (!isAllowedLength(Number.parseFloat(l[1]), l[2])) record(l[0]);
        }
      }
      // 2 — a literal baked into an interpolation that is then given an absolute unit.
      for (const l of value.matchAll(INTERPOLATED_LENGTH)) {
        if (hasBakedNumber(l[1])) record(`\${${l[1].trim()}}${l[2]}`);
      }
      // 3 — a bare number on a length-ish property; React appends the `px` for you.
      if (isLengthProperty && !/["'`]/.test(value) && hasBakedNumber(value)) record(value);
    }
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
  samples[rel] = hits
    .slice(0, 6)
    .map((h) => `${rel}:${h.line} ${h.key}: ${h.value}   → ${h.literal}`);
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (UPDATE) {
  writeFileSync(BASELINE, `${JSON.stringify({ total, files: counts }, null, 2)}\n`);
  console.log(
    `✓ baseline written — ${total} magic number(s) across ${Object.keys(counts).length} file(s)`,
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
      `${file}: ${count} magic number(s) in a file with no baseline\n      ${samples[file].join("\n      ")}`,
    );
  } else if (count > allowed) {
    regressions.push(
      `${file}: ${count} magic number(s), baseline allows ${allowed}\n      ${samples[file].join("\n      ")}`,
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
  console.error("✗ magic number(s) in an inline style (cardinal rules #44/#45)\n");
  for (const line of regressions) console.error(`  ${line}`);
  console.error(
    "\n  An inline style outranks every stylesheet, so a constant baked into one is unreachable\n" +
      "  at any price — no theme, no [data-tenant] scope, no consumer override can touch it.\n" +
      "  Pass the DATUM through a custom property and let CSS do the arithmetic:\n" +
      '    style={{ "--tree-select-depth": depth }}  +  padding-inline-start: calc(\n' +
      "      var(--tree-select-indent-base) + var(--tree-select-depth) * var(--tree-select-indent-step))\n" +
      "  Dynamic values with no baked literal are already exempt — `scale(${scale})` is fine.",
  );
  process.exit(1);
}

if (improvements.length) {
  console.error(
    `✗ baseline is stale — ${improvements.length} file(s) improved. Lock the win in:\n`,
  );
  for (const line of improvements) console.error(`  ${line}`);
  console.error("\n  Run: node scripts/check-no-inline-magic-numbers.mjs --update");
  process.exit(1);
}

console.log(
  `✓ no inline magic numbers — ${total} across ${Object.keys(counts).length} file(s), ` +
    `at the ${baseline.total} baseline (#316 is driving this to 0).`,
);
