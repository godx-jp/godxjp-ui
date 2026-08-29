#!/usr/bin/env node
/**
 * Tests must assert the CONTRACT, not the Tailwind utility that happens to implement it.
 *
 * Sixteen tests broke during #319 without a single behaviour changing. Each one pinned a utility
 * class — `toHaveClass("size-6")`, `[class*="bg-destructive"]`, `toContain("text-xs")` — so the
 * moment a literal became a token the assertion failed even though the component rendered
 * identically. That is a test telling you about your stylesheet, not about your component.
 *
 * The replacements are all cheap and all stronger:
 *
 *     toHaveClass("size-6")                  ->  toHaveClass("ui-control-affix-action")
 *     querySelector('[class*="bg-destructive"]')  ->  querySelector('[data-status="error"]')
 *     className.toContain("text-xs")         ->  toHaveAttribute("data-compact")
 *     toHaveClass("flex-col")                ->  toHaveAttribute("data-direction", "vertical")
 *
 * Two of them were not merely brittle but WRONG: `[class*="opacity-0"]` also matches
 * `opacity-05`, and one asserted `dragLeave` had been called without asserting anything about
 * what it did — a dropzone stuck in the active state passed.
 *
 * DataTable is the proof this is achievable: 24 test files, 112 cases, zero utility assertions,
 * and it needed no changes at all when its chrome was tokenized.
 *
 * WHAT IS ALLOWED
 *   - Semantic classes: anything starting `ui-`, plus the shell's `app-` prefixed classes.
 *   - Arbitrary values that read a token: `size-[var(--x)]`, `min-w-[var(--y)]`.
 *   - Data attributes, roles, ARIA — the actual contract.
 *   - Consumer-supplied classes in a fixture (`<Button className="my-8">`) — those assert
 *     pass-through, which IS the contract.
 *
 * Ratchet, like the geometry guard: a baseline of known offenders that may only shrink.
 *
 * Usage:
 *   node scripts/check-no-tailwind-class-assertions.mjs
 *   node scripts/check-no-tailwind-class-assertions.mjs --update
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIR = join(ROOT, "src");
const BASELINE = join(ROOT, "scripts/no-tailwind-class-assertions.baseline.json");
const UPDATE = process.argv.includes("--update");

/** A utility that carries a scale step or a role — i.e. an implementation detail. */
const TAILWIND_LIKE =
  /^(?:p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|gap|w|h|min-w|max-w|min-h|max-h|size|z|inset|top|bottom|start|end|rounded|shadow|border|text|leading|tracking|opacity|bg|flex|grid|items|justify|font)-[a-z0-9./[\]-]+$/;

/** `ui-*` / `app-*` are the design system's own names — asserting those is the point. */
const SEMANTIC = /^(?:ui|app)-/;
/** An arbitrary value reading a token is already the themeable contract. */
const TOKEN_BACKED = /\[var\(--/;

function isImplementationDetail(cls) {
  if (!cls || SEMANTIC.test(cls)) return false;
  if (TOKEN_BACKED.test(cls)) return false;
  return TAILWIND_LIKE.test(cls);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function scan(source) {
  const hits = [];
  // toHaveClass("a", "b") / not.toHaveClass(...)
  for (const m of source.matchAll(/toHaveClass\(([^)]*)\)/g)) {
    for (const q of m[1].matchAll(/["'`]([^"'`]+)["'`]/g)) {
      for (const cls of q[1].split(/\s+/)) if (isImplementationDetail(cls)) hits.push(cls);
    }
  }
  // querySelector('[class*="…"]')
  for (const m of source.matchAll(/\[class\*=\s*["']([^"']+)["']\s*\]/g)) {
    if (isImplementationDetail(m[1])) hits.push(`[class*="${m[1]}"]`);
  }
  // expect(x.className).toContain("…")
  for (const m of source.matchAll(/className[^;\n]*?toContain\(\s*["'`]([^"'`]+)["'`]/g)) {
    for (const cls of m[1].split(/\s+/)) if (isImplementationDetail(cls)) hits.push(cls);
  }
  return hits;
}

const files = walk(SCAN_DIR)
  .filter((f) => /\.test\.tsx?$/.test(f))
  .sort();

const counts = {};
const samples = {};
for (const file of files) {
  const hits = scan(readFileSync(file, "utf8"));
  if (!hits.length) continue;
  const rel = relative(ROOT, file);
  counts[rel] = hits.length;
  samples[rel] = [...new Set(hits)].slice(0, 5);
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (UPDATE) {
  writeFileSync(BASELINE, `${JSON.stringify({ total, files: counts }, null, 2)}\n`);
  console.log(
    `✓ baseline written — ${total} utility assertion(s) across ${Object.keys(counts).length} file(s)`,
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
  if (allowed === undefined)
    regressions.push(`${file}: ${count} in a file with no baseline (${samples[file].join(" ")})`);
  else if (count > allowed)
    regressions.push(`${file}: ${count}, baseline allows ${allowed} (${samples[file].join(" ")})`);
  else if (count < allowed) improvements.push(`${file}: ${count} < ${allowed}`);
}
for (const file of Object.keys(baseline.files))
  if (counts[file] === undefined) improvements.push(`${file}: 0 < ${baseline.files[file]}`);

if (regressions.length) {
  console.error("✗ test asserts a Tailwind utility instead of the contract\n");
  for (const line of regressions) console.error(`  ${line}`);
  console.error(
    "\n  Assert what the component PROMISES, not how it is painted today:\n" +
      '    toHaveClass("size-6")   ->  toHaveClass("ui-control-affix-action")\n' +
      '    [class*="bg-destructive"] ->  [data-status="error"]\n' +
      '    toContain("text-xs")    ->  toHaveAttribute("data-compact")\n' +
      "  A utility assertion breaks when the value becomes a token, while the component\n" +
      "  renders identically — it reports on the stylesheet, not on the component.",
  );
  process.exit(1);
}

if (improvements.length) {
  console.error(
    `✗ baseline is stale — ${improvements.length} file(s) improved. Lock the win in:\n`,
  );
  for (const line of improvements) console.error(`  ${line}`);
  console.error("\n  Run: node scripts/check-no-tailwind-class-assertions.mjs --update");
  process.exit(1);
}

console.log(
  `✓ no new utility assertions — ${total} across ${Object.keys(counts).length} file(s), ` +
    `at the ${baseline.total} baseline.`,
);
