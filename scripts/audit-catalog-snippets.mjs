#!/usr/bin/env node
/**
 * The MCP catalog must not prescribe what `ui-audit` forbids.
 *
 * An agent copies a catalog snippet verbatim. When the snippet carries a utility the audit blocks
 * in a consumer, that agent ships audit errors while following the design system's own guidance —
 * and it has no way to tell, because the catalog is the thing it was told to trust.
 *
 * This is not hypothetical. The Avatar entry's capability-card recipe read
 * `<CardHeader className="flex flex-row items-center gap-3">` for a long time: two errors
 * (`no-utility-layout`, `no-utility-spacing`) in every consumer that copied it. Nothing caught it —
 * `check:doc-prop-existence` reads PROPS, `check:mcp-pattern-imports` reads IMPORTS, and neither
 * looks at classes.
 *
 * ## Why this is `audit:`, not `check:` — read before promoting it
 *
 * It is a DIAGNOSTIC with a known backlog, not a gate, and it is deliberately not wired into a
 * workflow. As committed it reports **74 finding(s)** across **57 catalog entries**, and
 * making it green is a judgement call per entry that this script cannot make: some snippets are
 * "write it this way" (real defects, fix them), some are "never write it this way" (a quoted
 * anti-pattern, which needs a marker), and `component-tokens.generated.ts` is generated output
 * that should probably be out of scope entirely.
 *
 * Wiring it as `check:catalog-audit-clean` before that triage would mean shipping a red gate, and
 * allowlisting the backlog to force it green would mean a gate that guards nothing — this repo has
 * measured both failure shapes already. Do the triage, then rename it and wire it; the day it
 * reports zero is the day it becomes a gate.
 *
 * How it works: every string literal in `mcp/src/data/*.ts` that contains a `className=` is written
 * to one scratch file and handed to `scripts/ui-audit.mjs --consumer`. The audit's class-shaped
 * rules only read class EXPRESSIONS (a `className` attribute, a class-named binding, a
 * `cn()`/`clsx()`/`cva()` call), so ordinary prose in a usage string can never be a finding — the
 * same property `docs/CONSUMER-RULES.md` promises consumers.
 */
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "mcp/src/data");

/**
 * String literals, template literals included, without parsing TypeScript: the catalog is data,
 * and every snippet we care about lives inside a quoted string that mentions `className=`.
 */
const STRING_LITERAL = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;

const snippets = [];
for (const entry of readdirSync(DATA_DIR)) {
  if (!entry.endsWith(".ts")) continue;
  const src = readFileSync(join(DATA_DIR, entry), "utf8");
  for (const match of src.matchAll(STRING_LITERAL)) {
    const raw = match[1] ?? match[2] ?? match[3] ?? "";
    if (!raw.includes("className=")) continue;
    const text = raw.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, "\n");
    const line = src.slice(0, match.index).split("\n").length;
    snippets.push({ file: `mcp/src/data/${entry}`, line, text });
  }
}

if (!snippets.length) {
  console.log("✓ check:catalog-audit-clean — no catalog snippet carries a className.");
  process.exit(0);
}

const dir = mkdtempSync(join(tmpdir(), "catalog-audit-"));
const scratch = join(dir, "catalog-snippets.tsx");
// One line per snippet, so an audit finding's line number maps straight back to its source.
writeFileSync(scratch, snippets.map((s) => s.text.replace(/\n/g, " ")).join("\n") + "\n");

let output;
let failed = false;
try {
  output = execFileSync(process.execPath, [join(ROOT, "scripts/ui-audit.mjs"), "--consumer", scratch], {
    encoding: "utf8",
  });
} catch (error) {
  failed = true;
  output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
}

if (!failed) {
  rmSync(dir, { recursive: true, force: true });
  console.log(
    `✓ check:catalog-audit-clean — ${snippets.length} catalog snippet(s) with a className pass ui-audit as a consumer.`,
  );
  process.exit(0);
}

// Map each reported line back to the catalog file and line it came from.
const lines = output.split("\n");
const report = [];
for (const line of lines) {
  const m = line.match(/catalog-snippets\.tsx:(\d+)/);
  if (!m) continue;
  const origin = snippets[Number(m[1]) - 1];
  if (origin) report.push(`  ${origin.file}:${origin.line}`);
}
rmSync(dir, { recursive: true, force: true });

console.error("✗ check:catalog-audit-clean — the catalog prescribes what ui-audit forbids.");
console.error(output.trim());
if (report.length) {
  console.error("\nOriginating catalog entries:");
  for (const entry of [...new Set(report)]) console.error(entry);
}
console.error(
  "\nRewrite the snippet the way a consumer must write it (layout via <Flex>/<ResponsiveGrid>,\n" +
    "spacing via props, colours via tones) — an agent copies these verbatim.",
);
process.exit(1);
