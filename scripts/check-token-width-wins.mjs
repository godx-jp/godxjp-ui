#!/usr/bin/env node
/**
 * check:token-width-wins — a width token declared in `@layer components` must not be paired with
 * a width UTILITY on the same element.
 *
 * WHY IT EXISTS
 * Three times now the same defect has shipped: geometry moved into `@layer components` so a
 * service could retune it, while the TSX went on emitting a Tailwind `w-*` utility onto the same
 * element. Tailwind v4 orders `utilities` after `components`, so the utility wins and the token
 * is INERT — it resolves, it is documented, it is in the MCP catalog, and it changes nothing.
 *
 *   gh#366  `.ui-app-setting-picker-icon { inline-size: var(--control-height) }` vs `w-full`
 *   gh#375  the same trap named as the reason `width="bounded"` emits no utility at all
 *   gh#819  all eight `.ui-app-setting-picker-trigger[data-kind]` per-kind widths vs `w-auto`
 *
 * An inert token is worse than a missing one: a missing token fails loudly at the call site, an
 * inert one reports success. `check:dist-tokens-resolve` proves a token RESOLVES; nothing proved
 * it WINS. This gate does not prove it either — see the limits — it refuses the one arrangement
 * that produced all three bugs.
 *
 * THE RULE
 * For every rule inside `@layer components` that (a) selects a `ui-*` class and (b) declares an
 * inline-axis size FROM A TOKEN (`inline-size`/`width` — also the `min-`/`max-` pair, each against
 * its own utility family), that `ui-*` class may not appear in a `className` expression that also
 * carries a competing utility literal. One of the two has to go: either the rule keeps the width
 * and the TSX drops the utility (gh#375's `bounded`), or the utility reads the token and the rule
 * drops the declaration (gh#366, gh#819). Both are fixes; the pair is not.
 *
 * WHAT THIS GATE CANNOT DO — read this before trusting a green run
 * 1. It does not evaluate the cascade. It is a PAIRING rule over two text files, not a proof.
 *    Layer order, specificity, `!important`, `@media`/`@container` scope and tailwind-merge are
 *    all invisible to it.
 * 2. It only sees class names written as LITERAL strings in the same `className` attribute. A
 *    class contributed by a shared constant (`controlTriggerBaseClass`), by a variant map, by a
 *    parent component, or by `cn()` across a component boundary is not matched — so the exact
 *    arrangement in `select.tsx` (`.ui-control-trigger[data-width="bounded"]` vs the `w-full` that
 *    the same file emits) is OUT of its reach.
 * 3. It only guards declarations whose value reads a token. A literal width in the components
 *    layer can still be outranked in silence — deliberately: the issues are about inert TOKENS,
 *    and widening the rule to literals fires on every chrome-stripping rule in the repo.
 * 4. It cannot see a utility a CONSUMER passes through `className`, which is the other half of the
 *    cascade and lives outside this repo entirely.
 *
 * The only complete check is a browser one: load each `/isolate/**` frame and ask CDP
 * (`CSS.getMatchedStylesForNode`) which declarations were overridden, which reports an inert
 * token directly instead of inferring it. That belongs in the `check:frame-*` family and is not
 * what this script is. Treat a green run here as "the known trap is absent", nothing more.
 *
 * Usage: node scripts/check-token-width-wins.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/**
 * Each guarded CSS property and the utility prefixes that outrank it. `size-*` sets both axes, so
 * it competes with the inline one too.
 */
const AXES = [
  { props: ["inline-size", "width"], utilities: ["w", "size"] },
  { props: ["min-inline-size", "min-width"], utilities: ["min-w"] },
  { props: ["max-inline-size", "max-width"], utilities: ["max-w"] },
];

/**
 * Pairs that are NOT the trap, keyed `<tsx file>::<ui class>`, each with the reason. The bar is:
 * the rule and the utility cannot both apply to the same render, and a person has checked why.
 *
 * "It looks fine" is not a reason. If the two can coexist, it is the bug.
 */
const ALLOWED = {
  "src/components/data-entry/date-picker.tsx::ui-control":
    'MUTUALLY EXCLUSIVE BRANCHES of one prop. `.ui-control[data-width="bounded"]` (control.css) ' +
    "and the `w-auto`/`w-full` utilities are the three arms of `width`, and the trigger emits no " +
    "utility at all for `bounded` — that IS gh#375's resolution, written down in both files. The " +
    'gate cannot see that `data-width={width}` and `width === "auto"` can never both hold.',
};

function walk(dir, test, out = []) {
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, test, out);
    else if (test(full)) out.push(full);
  }
  return out;
}

/** Blank comments, keeping byte offsets so reported line numbers stay true. */
const blankComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + " ".repeat(m.length - p.length));

const lineOf = (source, index) => source.slice(0, index).split("\n").length;

/** Split on `,` at bracket/paren depth 0, so `:is(a, b)` stays one selector. */
function splitTopLevel(selector) {
  const out = [];
  let depth = 0;
  let buffer = "";
  for (const ch of selector) {
    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth -= 1;
    if (ch === "," && depth === 0) {
      out.push(buffer);
      buffer = "";
    } else buffer += ch;
  }
  out.push(buffer);
  return out.map((s) => s.trim()).filter(Boolean);
}

/**
 * The `ui-*` classes on the SUBJECT of a selector — its rightmost compound, the element the
 * declarations actually style. Without this, a descendant rule like
 * `.ui-table-collection :is([data-slot="table-cell"]) { inline-size: … }` reads as if the width
 * belonged to the wrapper that carries `.ui-table-collection`, and the wrapper's own `w-full` is
 * reported as a clash it is not.
 */
function subjectClasses(selector) {
  const out = [];
  for (const one of splitTopLevel(selector)) {
    let depth = 0;
    let cut = 0;
    for (let i = 0; i < one.length; i += 1) {
      const ch = one[i];
      if (ch === "(" || ch === "[") depth += 1;
      else if (ch === ")" || ch === "]") depth -= 1;
      else if (depth === 0 && /[\s>+~]/.test(ch)) cut = i + 1;
    }
    for (const m of one.slice(cut).matchAll(/\.(ui-[a-z0-9-]+)/g)) out.push(m[1]);
  }
  return out;
}

/**
 * Every `ui-*` class whose components-layer rule declares an inline-axis size from a token.
 * @returns {Map<string, {file: string, line: number, decl: string, utilities: string[]}>}
 */
function collectClassOwnedWidths() {
  const owned = new Map();
  const files = walk(join(ROOT, "src/styles"), (f) => f.endsWith(".css"));
  for (const file of files) {
    const rel = relative(ROOT, file);
    const css = blankComments(readFileSync(file, "utf8"));
    // Only what is INSIDE `@layer components`. A rule in the base layer, or outside any layer,
    // has a different standing against utilities and is not this trap.
    for (const layer of css.matchAll(/@layer\s+components\s*\{/g)) {
      let depth = 1;
      let i = layer.index + layer[0].length;
      const start = i;
      while (i < css.length && depth > 0) {
        if (css[i] === "{") depth += 1;
        else if (css[i] === "}") depth -= 1;
        i += 1;
      }
      const block = css.slice(start, i - 1);
      const blockOffset = start;
      // Innermost `selector { decls }` pairs — nested @media wrappers are skipped by construction.
      for (const rule of block.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const selector = rule[1].trim();
        const body = rule[2];
        const classes = subjectClasses(selector);
        if (classes.length === 0) continue;
        for (const axis of AXES) {
          const decl = axis.props
            .map((prop) => body.match(new RegExp(`(^|[;{\\s])(${prop}\\s*:[^;]*var\\(--[^;]*)`)))
            .find(Boolean);
          if (!decl) continue;
          const text = decl[2].trim();
          for (const cls of classes) {
            const key = `${cls} ${axis.utilities.join(",")}`;
            if (owned.has(key)) continue;
            owned.set(key, {
              className: cls,
              utilities: axis.utilities,
              file: rel,
              line: lineOf(css, blockOffset + rule.index + rule[0].indexOf(text)),
              decl: text,
            });
          }
        }
      }
    }
  }
  return owned;
}

/** Split a class on `:` at bracket depth 0, so `sm:w-[length:var(--x)]` yields base `w-[…]`. */
function baseUtility(cls) {
  let depth = 0;
  let last = -1;
  for (let i = 0; i < cls.length; i += 1) {
    const ch = cls[i];
    if (ch === "[" || ch === "(") depth += 1;
    else if (ch === "]" || ch === ")") depth -= 1;
    else if (ch === ":" && depth === 0) last = i;
  }
  return cls.slice(last + 1);
}

/** Every `className=…` attribute value in a TSX file, as {text, index}. */
function classNameExpressions(source) {
  const out = [];
  for (const m of source.matchAll(/className\s*=\s*/g)) {
    let i = m.index + m[0].length;
    if (source[i] === '"' || source[i] === "'") {
      const quote = source[i];
      const end = source.indexOf(quote, i + 1);
      if (end === -1) continue;
      out.push({ text: source.slice(i, end + 1), index: i });
      continue;
    }
    if (source[i] !== "{") continue;
    let depth = 0;
    const start = i;
    while (i < source.length) {
      if (source[i] === "{") depth += 1;
      else if (source[i] === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
      i += 1;
    }
    out.push({ text: source.slice(start, i + 1), index: start });
  }
  return out;
}

const owned = collectClassOwnedWidths();
const failures = [];
const allowedHits = new Set();
const scanned = new Set();

for (const file of walk(join(ROOT, "src/components"), (f) => /\.tsx$/.test(f))) {
  if (/__tests__/.test(file)) continue;
  const rel = relative(ROOT, file);
  scanned.add(rel);
  const source = blankComments(readFileSync(file, "utf8"));
  for (const expr of classNameExpressions(source)) {
    const literals = [...expr.text.matchAll(/["'`]([^"'`]*)["'`]/g)].flatMap((m) =>
      m[1].split(/\s+/).filter(Boolean),
    );
    const present = new Set(literals);
    for (const entry of owned.values()) {
      if (!present.has(entry.className)) continue;
      const clash = literals.find((cls) => {
        const base = baseUtility(cls);
        return entry.utilities.some(
          (prefix) => base.startsWith(`${prefix}-`) || base === `${prefix}-full`,
        );
      });
      if (!clash) continue;
      const key = `${rel}::${entry.className}`;
      if (ALLOWED[key]) {
        allowedHits.add(key);
        continue;
      }
      failures.push(
        `${rel}:${lineOf(source, expr.index)}: \`.${entry.className}\` declares ` +
          `\`${entry.decl}\` in @layer components (${entry.file}:${entry.line}) but the same ` +
          `className also emits \`${clash}\` — the utility layer is ordered after components, so ` +
          `the token is inert. Either drop the utility, or drop the declaration and read the ` +
          `token FROM the utility (gh#366/#375/#819).`,
      );
    }
  }
}

// Checked in both directions, so the allowlist cannot rot into a pile of stale excuses: a pair
// that has since been fixed must leave the list, or the next real one hides behind its entry.
// Only entries whose file was actually scanned are audited — a component that has been deleted or
// renamed takes its entry out of reach here, and out of reach of the bug it excused.
for (const key of Object.keys(ALLOWED)) {
  const [file] = key.split("::");
  if (scanned.has(file) && !allowedHits.has(key)) {
    failures.push(`${key}: allowlisted, but the pair no longer exists — delete the ALLOWED entry.`);
  }
}

if (failures.length) {
  console.error("✗ token-width-wins guard failed");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(
  `✓ token-width-wins guard passed (${owned.size} class-owned width declaration(s), ` +
    `${allowedHits.size} allowlisted)`,
);
