#!/usr/bin/env node
/**
 * check:token-width-wins — geometry declared in `@layer components` must not be paired with a
 * competing UTILITY on the same element.
 *
 * THE NAME IS HISTORICAL. It started as a width gate and gh#841 widened it to the radius family;
 * the script name and the `check:` entry stayed put because CI, `check:gate-coverage` and two
 * stylesheets name them.
 *
 * WHY IT EXISTS
 * Five times now the same defect has shipped: geometry moved into `@layer components` so a
 * service could retune it, while the TSX went on emitting a Tailwind utility onto the same
 * element. Tailwind v4 orders `utilities` after `components`, so the utility wins and the rule
 * is INERT — it resolves, it is documented, it is in the MCP catalog, and it changes nothing.
 *
 *   gh#366  `.ui-app-setting-picker-icon { inline-size: var(--control-height) }` vs `w-full`
 *   gh#375  the same trap named as the reason `width="bounded"` emits no utility at all
 *   gh#819  all eight `.ui-app-setting-picker-trigger[data-kind]` per-kind widths vs `w-auto`
 *   —       `.ui-pagination-size-trigger` vs `w-max`, found by this gate's own first run
 *   gh#841  `.ui-input-group:has(…) .ui-input { border-start-start-radius: 0 }` vs the
 *           `rounded-[var(--control-radius)]` in `inputBaseClass` — a joined field that drew a
 *           rounded corner exactly where the addon welds to it, measured 6px on all four corners
 *           against the 0 the rule asked for.
 *
 * WHAT gh#841 COST THIS GATE, because it is the argument for both relaxations below. Run against
 * that defect, the gate was green, and for TWO independent reasons: the losing declaration was
 * `border-start-start-radius: 0`, outside the property list AND a literal, and the class and the
 * utility that beat it both live in `inputBaseClass`, a shared constant the gate did not follow.
 * Each is one of the limits this header already declared — so the limits were honest, and the
 * defect still shipped. Both are narrowed now: radius reads literals (see AXES), and module-scope
 * class constants are resolved (see `sharedClassConstants`). Measured on the tree that carries
 * gh#841's fix: 3 findings, all judged and allowlisted, and the reverted source fails the gate.
 *
 * An inert token is worse than a missing one: a missing token fails loudly at the call site, an
 * inert one reports success. `check:dist-tokens-resolve` proves a token RESOLVES; nothing proved
 * it WINS. This gate does not prove it either — see the limits — it refuses the arrangement that
 * produced all five bugs.
 *
 * THE RULE
 * For every rule inside `@layer components` that (a) selects a `ui-*` class and (b) declares a
 * guarded property FROM A TOKEN (`inline-size`/`width`, the `min-`/`max-` pair, and the radius
 * family, each against its own utility family — radius also counts literals), that `ui-*` class
 * may not appear in a `className` expression that also carries a competing utility literal. One
 * of the two has to go: either the rule keeps the geometry and the TSX drops the utility
 * (gh#375's `bounded`), or the utility reads the token and the rule drops the declaration
 * (gh#366, gh#819, gh#841). Both are fixes; the pair is not.
 *
 * ONE EXEMPTION, AND IT IS THE FIX ITSELF: a utility whose arbitrary value reads a custom
 * property that the components layer sets on that same class is not a clash — that is the rule
 * reaching the element THROUGH the utility, which is what gh#366 and gh#841 were both repaired
 * into. `check:frame-token-wins` makes the same distinction in the browser, where it removed 691
 * of 734 candidates.
 *
 * WHAT THIS GATE CANNOT DO — read this before trusting a green run
 * 1. It does not evaluate the cascade. It is a PAIRING rule over two text files, not a proof.
 *    Layer order, specificity, `!important`, `@media`/`@container` scope and tailwind-merge are
 *    all invisible to it.
 * 2. It sees class names written as LITERAL strings in the same `className` attribute, plus
 *    module-scope `const` string/array constants that the expression names (gh#841's
 *    `inputBaseClass`). A class contributed by a variant map, by a parent component, or by `cn()`
 *    across a component boundary is still not matched — so the arrangement in `select.tsx`
 *    (`.ui-control-trigger[data-width="bounded"]` vs the `w-full` that the same file emits) is
 *    still OUT of its reach.
 * 3. On the SIZE axes it only guards declarations whose value reads a token. A literal width in
 *    the components layer can still be outranked in silence — deliberately, and measured:
 *    allowing literals there reports four `width: 100%` / `width: auto` rules whose utility says
 *    the same thing, and a gate that reports agreements is one people stop reading. The radius
 *    axis is the exception, because its trap value is `0` and `0` cannot be a token.
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
  /**
   * CORNERS (gh#841, the fifth instance). `literals: true` is the difference between catching that
   * one and not: a joined control squares its seam with `border-start-start-radius: 0`, and `0` is
   * not a token and never will be — "no corner here" is the absence of a value, so the
   * token-valued filter that keeps the width axis quiet made the whole radius family invisible.
   * Measured: with the filter on, the reverted gh#841 source passes this gate; with it off, the
   * gate names `.ui-input` and the `rounded-*` utility that beat it.
   *
   * The literal relaxation is scoped to THIS axis on purpose. The header's limit 3 still holds for
   * the size axes, where it was measured: allowing literals there reports four `width: 100%` rules
   * whose utility says the same thing, and a gate that reports agreements is one people stop
   * reading.
   */
  {
    props: [
      "border-radius",
      "border-start-start-radius",
      "border-start-end-radius",
      "border-end-start-radius",
      "border-end-end-radius",
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-left-radius",
      "border-bottom-right-radius",
    ],
    utilities: ["rounded"],
    literals: true,
  },
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
  "src/components/data-entry/input.tsx::ui-control":
    'THE UTILITY IS THE TOKEN, one component away. `.ui-control[data-width="bounded"]` ' +
    "(control.css) loses to the `w-full` baked into `inputBaseClass` — and that is exactly why " +
    "neither composer relies on it: `Input` itself never emits `data-width`, and the two that do " +
    "(date-picker.tsx, time-picker.tsx) pass " +
    "`w-[var(--control-bounded-width)] max-w-full` on the same element, which `cn()`'s twMerge " +
    "resolves by dropping the baked `w-full`. gh#799 settled it that way and both call sites say " +
    "so in a comment. Reached only because this gate now follows shared class constants.",
  "src/components/navigation/app-setting-picker.tsx::ui-app-setting-picker-inline":
    "MUTUALLY EXCLUSIVE BRANCHES, the same shape as the date-picker entry above. The class is " +
    "the `inline` arm of a ternary; the `rounded-[var(--topbar-item-radius)]` that clashes with " +
    "its `border-radius: 0` is inside the `iconOnly`+`bar` arm, and `appearance` cannot be both. " +
    "Reached only because the radius axis is now guarded.",
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

/** `ui-*` class → the custom properties the components layer sets on it. Filled below. */
const knobs = new Map();

/**
 * Every `ui-*` class whose components-layer rule declares a guarded property from a token (or, on
 * the radius axis, from any value at all).
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
        // The custom properties the components layer sets ON THIS CLASS. A utility that READS one
        // of them is not beating the rule — it is how the rule reaches the element (gh#366's
        // resolution, and gh#841's). Same discrimination `check:frame-token-wins` makes in the
        // browser, where "the winner does not read the same token" removed 691 of its 734
        // candidates: what matters is whether the KNOB arrives, not which declaration won.
        for (const knob of body.matchAll(/(--[a-z0-9-]+)\s*:/g)) {
          for (const cls of classes) {
            if (!knobs.has(cls)) knobs.set(cls, new Set());
            knobs.get(cls).add(knob[1]);
          }
        }
        for (const axis of AXES) {
          // Literals are in scope for the radius axis only — see the note on AXES.
          const value = axis.literals ? "" : "var\\(--";
          const decl = axis.props
            .map((prop) => body.match(new RegExp(`(^|[;{\\s])(${prop}\\s*:[^;]*${value}[^;]*)`)))
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

/**
 * Module-scope class constants, `const X = "…"` / `const X = [ "…", … ]`, as name → classes.
 *
 * Header limit 2 said a class reached through a shared constant is out of reach, and gh#841 is
 * what that cost: `inputBaseClass` holds BOTH `ui-input` and the `rounded-*` utility that beat it,
 * so the pairing was in one array in one file and the gate could not see either half. Only
 * module-scope literals — a variant map or a value computed at render time is still out of reach,
 * and deliberately so: this stays a text rule, not an evaluator.
 * @returns {Map<string, string[]>}
 */
function sharedClassConstants(source) {
  const out = new Map();
  for (const m of source.matchAll(
    /^const\s+([A-Za-z_$][\w$]*)\s*=\s*(\[[\s\S]*?\n\];|"[^"]*";)/gm,
  )) {
    const classes = [...m[2].matchAll(/["'`]([^"'`]*)["'`]/g)].flatMap((s) =>
      s[1].split(/\s+/).filter(Boolean),
    );
    if (classes.length) out.set(m[1], classes);
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
  const shared = sharedClassConstants(source);
  for (const expr of classNameExpressions(source)) {
    const literals = [...expr.text.matchAll(/["'`]([^"'`]*)["'`]/g)].flatMap((m) =>
      m[1].split(/\s+/).filter(Boolean),
    );
    for (const [name, classes] of shared) {
      if (new RegExp(`(?:^|[^\\w$.])${name}(?:[^\\w$]|$)`).test(expr.text))
        literals.push(...classes);
    }
    const present = new Set(literals);
    for (const entry of owned.values()) {
      if (!present.has(entry.className)) continue;
      const clash = literals.find((cls) => {
        const base = baseUtility(cls);
        if ([...(knobs.get(entry.className) ?? [])].some((knob) => cls.includes(knob)))
          return false;
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
