#!/usr/bin/env node
/**
 * check:disclosure-duplication — the ratchet on "another picker".
 *
 * THE FAILURE THIS EXISTS TO CATCH IS STRUCTURAL, NOT EDITORIAL.
 * Every component in the cluster below is defensible on its own: `OrgSwitcher` needs a collapsed
 * rail mode, `AppLauncher` needs a launchpad, `Cascader` needs a path. None of them is a bad
 * component. What nothing in the repo could see is the ACCUMULATION — eleven components that each
 * re-assemble the same parts by hand, so a fix to the open/close/filter/commit cycle has to be
 * made eleven times and, measurably, never is. Cardinal rule #31 already forbids this in prose
 * ("One Radix base = one framework primitive"); prose does not fail CI. This does.
 *
 * WHAT IT COUNTS — the SHAPE, deliberately not the base.
 * A "disclosure surface" is the owner's own description of the cluster: a TRIGGER that opens a
 * floating SURFACE containing a LIST of choices, whose OPEN state the component holds itself.
 * Those four are the entry condition. The score is how many of seven machine parts — those four
 * plus FILTER, CURSOR and COMMIT — the file re-implements rather than delegating.
 *
 * It does NOT key on which headless library is underneath, and that is load-bearing. This repo is
 * mid-migration from @radix-ui to react-aria-components — measured on the tree this gate landed in:
 * 11 files import only @radix-ui, 9 import only react-aria-components, 5 import BOTH, and 160
 * import neither. Cardinal rule #31 is anchored on "one Radix base", so for as long as two bases
 * are in flight the rule cannot even be evaluated — which is a better explanation for the
 * accumulation than anyone being careless. A gate keyed on the base would go quiet component by
 * component as the migration proceeds, i.e. it would be weakest exactly when the library is most
 * likely to grow a duplicate. Keyed on shape, it keeps working through the migration and after it.
 *
 * WHY NOT LINE COUNT. Line count ranks this cluster backwards. `navigation/dropdown-menu.tsx` is
 * the largest file in it (799 lines) and re-implements NOTHING — it owns a real upstream base and
 * holds zero component state. `layout/org-switcher.tsx` is half its size (398) and re-implements
 * the whole machine. Comments are only 10-14% of these files, so the inflation story is not the
 * problem either: volume simply is not what duplicates. Machine parts are.
 *
 * THE RATCHET. Same contract as scripts/check-no-hardcoded-css-values.mjs: the baseline may fall,
 * never rise. An eleventh picker is a file with no baseline entry -> red. Deepening an existing one
 * (teaching `DatePicker` its own filter and cursor) raises that file's score -> red. Merging two
 * lowers the total -> also red, as "lock the win in", so a win cannot be quietly spent later.
 *
 * Usage: node scripts/check-disclosure-duplication.mjs [--update] [--report] [--json]
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIR = join(ROOT, "src/components");
const BASELINE = join(ROOT, "scripts/disclosure-duplication.baseline.json");

const args = new Set(process.argv.slice(2));
const UPDATE = args.has("--update");
const REPORT = args.has("--report");
const AS_JSON = args.has("--json");

/**
 * The four parts that make a file a member of the cluster. ALL FOUR are required to enter the
 * ledger: a trigger, a floating surface, a data-driven list of choices, and its own open-state
 * machine. That threshold is not arbitrary — it is where the tree separates cleanly. Measured on
 * the tree this gate landed in, every file rendering a trigger + surface scored either >= 4 (the
 * eleven pickers) or exactly 3 (`layout/sidebar.tsx`, `layout/app-shell.tsx`). Nothing sits on the
 * line.
 *
 * The two 3s are the reason the bar is here rather than lower. Both are navigation chrome with a
 * mobile drawer, not choice pickers: `Sidebar` opens a Sheet full of nav rows but never owns an
 * `open` pair, `AppShell` owns the pair but renders no list. Neither could be merged into a picker,
 * so counting them would make the gate cry wolf — and a gate that cries wolf gets its baseline
 * bumped without anyone reading it, which is the failure this whole file exists to prevent.
 *
 * KNOWN HOLE, stated rather than hidden: a picker that takes `open` as a REQUIRED controlled prop,
 * holding no state of its own, would render trigger + surface + list and still miss OPEN. That is a
 * real dodge. It is left open deliberately, because closing it by dropping OPEN from the entry
 * condition pulls both shells in and costs more than it buys. If a twelfth picker ever ships that
 * way, add OPEN-less entry and re-baseline — do not widen it speculatively now.
 */
const ENTRY_PARTS = ["TRIGGER", "SURFACE", "LIST", "OPEN"];

/** A floating surface's content element — the thing the trigger opens. */
const SURFACE =
  /<(PopoverContent|DialogContent|SheetContent|DropdownMenuContent|HoverCardContent|CommandDialog)\b/;

/**
 * A trigger that opens that surface. The `*Trigger` elements are the common spelling; the
 * `controlSurfaceTriggerClass` helper is how the form-control pickers (SearchSelect, Cascader,
 * TreeSelect) draw theirs, and they would otherwise escape.
 */
const TRIGGER =
  /<(PopoverTrigger|DialogTrigger|SheetTrigger|PopoverAnchor)\b|controlSurfaceTriggerClass/;

/**
 * A choice set rendered from data. Any `.map(` qualifies, and the breadth is deliberate: an earlier
 * draft matched a keyword list of identifier names (`options|items|groups|…`) and was both leaky
 * and brittle — it missed the whole date cluster, whose choices are a grid of days rather than a
 * variable called `options`, and it could be dodged by renaming a local. What matters is that the
 * surface repeats a row per datum, not what the datum is called.
 */
const LIST = /\.map\(/;

/**
 * Owns a controlled/uncontrolled `open` pair instead of letting the surface own it. Three spellings
 * appear in this tree: the explicit `open !== undefined` test (OrgSwitcher, AppLauncher), an
 * `onOpenChange?.()` forwarded out of local state (the form pickers), and a `defaultOpen`-seeded
 * uncontrolled flag (ChatSuggestion).
 */
const OPEN = [
  /open\s*!==\s*undefined/,
  /onOpenChange\?\.\(/,
  /\[\s*uncontrolledOpen\s*,|\[\s*internalOpen\s*,/,
];

/**
 * Owns a text query AND filters the choice list with it.
 *
 * The `\b` here is anchored per-alternative on purpose. Written as
 * `/\b(internalSearch|…|\[\s*(query|search)\s*,)/` the leading `\b` applies to the WHOLE group, and
 * before a `[` there is no word boundary to find — a space and a bracket are both non-word — so the
 * destructuring branch silently never matched. Caught by mutation-testing this gate: adding a
 * `const [query, setQuery]` + `.filter(` to a baselined component left it green.
 */
const FILTER_STATE =
  /\b(?:internalSearch|internalQuery|debouncedQuery)\b|\[\s*(?:query|search)\s*,/;
const FILTER_USE = /\.filter\(/;

/** Owns a highlight cursor it moves with the arrow keys. */
const CURSOR_STATE = /\b(activeIndex|activePath|activeKey|activeValue|highlightedIndex)\b/;
const CURSOR_USE = /Arrow(Down|Up|Right|Left)/;

/** Commits a choice AND closes the surface in the same handler. */
const COMMIT_CLOSE = /setOpen\(false\)|close\(\)|onOpenChange\?\.\(false\)/;
const COMMIT_FIRE = /(onValueChange|onChange|onSelect|onSubmit)\?\.\(/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Blank a region but keep its newlines, so a quoted example in a docblock is never counted. */
function blank(text) {
  return text.replace(/[^\n]/g, " ");
}

/**
 * Strip comments before scanning. These files carry unusually long explainers that quote their own
 * JSX — `check-no-hardcoded-css-values.mjs` learned the same lesson when Card's comment quoting
 * `className="border-2"` was counted as debt in a file that had none.
 */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/^\s*\/\/.*$/gm, blank);
}

/** @returns {string[]} the machine parts this file implements itself */
function partsOf(rawSource) {
  const src = stripComments(rawSource);
  const parts = [];
  if (TRIGGER.test(src)) parts.push("TRIGGER");
  if (SURFACE.test(src)) parts.push("SURFACE");
  if (LIST.test(src)) parts.push("LIST");
  if (OPEN.some((re) => re.test(src))) parts.push("OPEN");
  if (FILTER_STATE.test(src) && FILTER_USE.test(src)) parts.push("FILTER");
  if (CURSOR_STATE.test(src) && CURSOR_USE.test(src)) parts.push("CURSOR");
  if (COMMIT_CLOSE.test(src) && COMMIT_FIRE.test(src)) parts.push("COMMIT");
  return parts;
}

const files = walk(SCAN_DIR)
  .filter((f) => f.endsWith(".tsx") && !f.includes("__tests__") && !f.includes("__fixtures__"))
  .sort();

/** @type {Record<string, number>} */
const counts = {};
/** @type {Record<string, string[]>} */
const detail = {};
for (const file of files) {
  const parts = partsOf(readFileSync(file, "utf8"));
  if (!ENTRY_PARTS.every((p) => parts.includes(p))) continue;
  const rel = relative(ROOT, file);
  counts[rel] = parts.length;
  detail[rel] = parts;
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
const components = Object.keys(counts).length;

if (REPORT) {
  console.log(`disclosure surfaces — ${components} component(s), ${total} machine part(s)\n`);
  for (const [file, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count)}  ${file.padEnd(46)} [${detail[file].join(",")}]`);
  }
  console.log("");
}

if (UPDATE) {
  writeFileSync(BASELINE, `${JSON.stringify({ total, components, files: counts }, null, 2)}\n`);
  console.log(`✓ baseline written — ${components} component(s), ${total} machine part(s)`);
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
      `NEW disclosure surface: ${file}\n` +
        `      re-implements [${detail[file].join(", ")}] — ${count} machine part(s), no baseline entry`,
    );
  } else if (count > allowed) {
    regressions.push(
      `DEEPER duplication: ${file}\n` +
        `      now [${detail[file].join(", ")}] — ${count} part(s), baseline allows ${allowed}`,
    );
  } else if (count < allowed) {
    improvements.push(`${file}: ${count} < ${allowed}`);
  }
}
for (const file of Object.keys(baseline.files)) {
  if (counts[file] === undefined)
    improvements.push(`${file}: gone (baseline had ${baseline.files[file]})`);
}

if (AS_JSON) {
  console.log(
    JSON.stringify(
      { total, components, baselineTotal: baseline.total, regressions, improvements },
      null,
      2,
    ),
  );
  process.exit(regressions.length || improvements.length ? 1 : 0);
}

if (regressions.length) {
  console.error("✗ the picker cluster grew (cardinal rule #31)\n");
  for (const line of regressions) console.error(`  ${line}`);
  console.error(
    "\n  A trigger + a floating surface + a list of choices is ONE shape. This library already\n" +
      `  ships ${baseline.components} components that each re-assemble it by hand, and a fix to the\n` +
      "  open/close/filter/commit cycle has to be made in all of them.\n\n" +
      "  Before adding another, answer the question rule #31 asks: which EXISTING component does\n" +
      "  this differ from, and can a PROP express the difference? `<SimpleX>` over `<X>` is\n" +
      "  forbidden — add the prop to `<X>` instead.\n\n" +
      "  If the answer really is a new primitive, say so in the PR and run:\n" +
      "    node scripts/check-disclosure-duplication.mjs --update\n" +
      "  That commit is the argument, and a reviewer has to accept it.",
  );
  process.exit(1);
}

if (improvements.length) {
  console.error(
    `✗ baseline is stale — the cluster shrank in ${improvements.length} place(s). Lock the win in:\n`,
  );
  for (const line of improvements) console.error(`  ${line}`);
  console.error("\n  Run: node scripts/check-disclosure-duplication.mjs --update");
  process.exit(1);
}

console.log(
  `✓ picker cluster held — ${components} disclosure surface(s), ${total} machine part(s), ` +
    `at the ${baseline.total} baseline.`,
);
