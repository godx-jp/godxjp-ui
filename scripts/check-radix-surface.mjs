#!/usr/bin/env node
/**
 * check:radix-surface — the ratchet on leaving @radix-ui.
 *
 * THE FAILURE THIS EXISTS TO CATCH IS A SLOW ONE, NOT A LOUD ONE.
 * This library is mid-migration: some components sit on @radix-ui, some on react-aria-components,
 * and the ones that already moved (Checkbox, Label, Dialog, Sheet, Tooltip, Tabs, Toggle,
 * Accordion, Separator, Popover, HoverCard, Collapsible, DropdownMenu, and now Switch, Segmented
 * and Radio) have nothing stopping the next author from reaching for Radix again. Nothing fails
 * when they do. The migration then stalls in a state where BOTH bases ship, which is strictly
 * worse than either one alone: two focus models, two `data-*` vocabularies, two bundles.
 *
 * The other half of the same failure is quieter still. Nine @radix-ui packages were declared in
 * package.json and imported by exactly nothing — they had been left behind by earlier migrations
 * and no gate could see them, so consumers installed nine packages the library does not use.
 *
 * WHAT IT COUNTS — every source file, and every declared dependency.
 *   • files      — per file, the sorted set of @radix-ui packages it imports.
 *   • declared   — the @radix-ui packages named in package.json `dependencies`.
 * Comments are stripped first. These files carry long Vietnamese migration notes that NAME the
 * package they left ("không còn @radix-ui/react-switch"), and a naive grep counts those notes as
 * imports — it reported 17 Radix files on a tree that had 9.
 *
 * WHY PER-FILE AND NOT A TOTAL. A total lets a win in one component pay for a regression in
 * another: migrate Segmented, re-introduce Radix in Card, total unchanged, gate green. Per-file
 * entries make each direction visible on its own.
 *
 * THE RATCHET, in both directions — the same contract as
 * scripts/check-disclosure-duplication.mjs and scripts/check-no-hardcoded-css-values.mjs:
 *   • a file with a Radix import and no baseline entry  -> red (Radix came back somewhere new)
 *   • a file importing MORE packages than its baseline  -> red (it got deeper)
 *   • a file importing FEWER, or gone entirely          -> red, "lock the win in" — re-baseline in
 *     the same commit that earns it, so a win cannot be quietly spent later
 *   • a declared @radix-ui dependency no file imports   -> red (dead dependency)
 *   • a declared package with no baseline entry         -> red (a package came back)
 *
 * NO EXEMPT LIST, deliberately. Every remaining Radix file is IN the baseline with its packages
 * named; that ledger is the list of what is left to do, and it is the file a reviewer reads to
 * see the migration's remaining surface. An exemption would hide exactly that.
 *
 * Usage: node scripts/check-radix-surface.mjs [--update] [--report] [--json]
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const BASELINE = join(ROOT, "scripts/radix-surface.baseline.json");

/**
 * Every directory that ships or tests library code. `src` is the library, `preview` and `docs`
 * are the example surfaces a consumer copies from, `mcp` is the catalog, `scripts` is the gate
 * layer itself — a Radix import creeping into any of them is the same regression.
 */
const SCAN_DIRS = ["src", "preview", "docs", "mcp/src", "scripts", "tests"];
const SOURCE_FILE = /\.(tsx?|mts|mjs|cjs|jsx?)$/;

const args = new Set(process.argv.slice(2));
const UPDATE = args.has("--update");
const REPORT = args.has("--report");
const AS_JSON = args.has("--json");

/** Blank a region but keep its newlines, so a migration note quoting a package is never counted. */
const blank = (text) => text.replace(/[^\n]/g, " ");

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/^\s*\/\/.*$/gm, blank);
}

/**
 * A real module reference, not prose. Both spellings that reach the bundler are counted — a static
 * `from "@radix-ui/…"` and a dynamic `import("@radix-ui/…")` / `require("@radix-ui/…")` — because
 * either one puts the package back in the tree.
 */
const IMPORT_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)["'](@radix-ui\/[^"']+)["']/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (SOURCE_FILE.test(p)) out.push(p);
  }
  return out;
}

const files = SCAN_DIRS.filter((d) => existsSync(join(ROOT, d)))
  .flatMap((d) => walk(join(ROOT, d)))
  .sort();

/** @type {Record<string, string[]>} */
const found = {};
let scanned = 0;
for (const file of files) {
  scanned += 1;
  const packages = new Set();
  for (const m of stripComments(readFileSync(file, "utf8")).matchAll(IMPORT_RE)) {
    packages.add(m[1]);
  }
  if (packages.size === 0) continue;
  found[relative(ROOT, file).split(sep).join("/")] = [...packages].sort();
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const declared = Object.keys(pkg.dependencies ?? {})
  .filter((name) => name.startsWith("@radix-ui/"))
  .sort();

const imported = new Set(Object.values(found).flat());
const fileCount = Object.keys(found).length;

if (REPORT) {
  console.log(
    `@radix-ui surface — ${fileCount} file(s) of ${scanned} scanned, ` +
      `${imported.size} package(s) imported, ${declared.length} declared\n`,
  );
  for (const [file, packages] of Object.entries(found)) {
    console.log(`  ${file.padEnd(58)} ${packages.map((p) => p.slice(10)).join(", ")}`);
  }
  console.log("");
}

if (UPDATE) {
  writeFileSync(
    BASELINE,
    `${JSON.stringify({ files: fileCount, packages: imported.size, declared, sources: found }, null, 2)}\n`,
  );
  console.log(
    `✓ baseline written — ${fileCount} file(s), ${imported.size} package(s), ${declared.length} declared`,
  );
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error(`✗ missing ${relative(ROOT, BASELINE)} — run with --update to create it.`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
/** @type {string[]} */
const regressions = [];
/** @type {string[]} */
const improvements = [];

for (const [file, packages] of Object.entries(found)) {
  const allowed = baseline.sources[file];
  if (allowed === undefined) {
    regressions.push(
      `RADIX IS BACK: ${file}\n      imports ${packages.join(", ")} — no baseline entry`,
    );
    continue;
  }
  const added = packages.filter((p) => !allowed.includes(p));
  const removed = allowed.filter((p) => !packages.includes(p));
  if (added.length) {
    regressions.push(`DEEPER: ${file}\n      adds ${added.join(", ")} on top of its baseline`);
  } else if (removed.length) {
    improvements.push(`${file}: dropped ${removed.join(", ")}`);
  }
}
for (const file of Object.keys(baseline.sources)) {
  if (found[file] === undefined) {
    improvements.push(
      `${file}: off Radix entirely (baseline had ${baseline.sources[file].join(", ")})`,
    );
  }
}

for (const name of declared) {
  if (!baseline.declared.includes(name)) {
    regressions.push(`DEPENDENCY IS BACK: ${name} was removed from package.json and has returned`);
  } else if (!imported.has(name)) {
    regressions.push(
      `DEAD DEPENDENCY: ${name} is declared in package.json and imported by no file.\n` +
        "      Consumers install it for nothing. Delete it from dependencies.",
    );
  }
}
for (const name of baseline.declared) {
  if (!declared.includes(name)) improvements.push(`dependency ${name}: gone from package.json`);
}

if (AS_JSON) {
  console.log(
    JSON.stringify(
      {
        files: fileCount,
        packages: imported.size,
        declared: declared.length,
        baselineFiles: baseline.files,
        regressions,
        improvements,
      },
      null,
      2,
    ),
  );
  process.exit(regressions.length || improvements.length ? 1 : 0);
}

if (regressions.length) {
  console.error("✗ the @radix-ui surface grew\n");
  for (const line of regressions) console.error(`  ${line}`);
  console.error(
    "\n  This library is leaving @radix-ui for react-aria-components. A component that has\n" +
      "  already moved must not move back, and a package nothing imports must not stay declared.\n\n" +
      "  If a new Radix import is genuinely the right call — react-aria has no equivalent and the\n" +
      "  alternative is hand-rolling a primitive — say so in the PR and run:\n" +
      "    node scripts/check-radix-surface.mjs --update\n" +
      "  That commit is the argument, and a reviewer has to accept it.",
  );
  process.exit(1);
}

if (improvements.length) {
  console.error(
    `✗ baseline is stale — Radix shrank in ${improvements.length} place(s). Lock it in:\n`,
  );
  for (const line of improvements) console.error(`  ${line}`);
  console.error("\n  Run: node scripts/check-radix-surface.mjs --update");
  process.exit(1);
}

console.log(
  `✓ @radix-ui surface held — ${fileCount} file(s) of ${scanned} scanned, ` +
    `${imported.size} package(s), ${declared.length} declared, at the baseline.`,
);
