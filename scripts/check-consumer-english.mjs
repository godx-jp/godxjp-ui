#!/usr/bin/env node
/**
 * check:consumer-english — consumer guidance is written in English.
 *
 * SCOPE. `agent/**` (what an assistant reads before it writes a line) and
 * `docs/CONSUMER-RULES.md` (what `ui-audit` points a consumer at). Everything else in `docs/` is
 * for contributors and is out of scope.
 *
 * WHAT COUNTS. Prose lines only. A fenced code block, an inline code span and the JSON keys that
 * carry code or data (`code`, `example`, `value`, ...) are removed first, so a Japanese label inside
 * `<Badge>公開中</Badge>` is demo data, not prose. A prose LINE is flagged when it carries
 *   - Vietnamese: at least 2 words with a tone-marked letter (U+1EA0-U+1EF9) or a Vietnamese-only
 *     base letter (a-breve, d-stroke, o-horn, u-horn), or
 *   - Japanese: at least 8 kana (U+3040-U+30FF, half-width U+FF66-U+FF9F) or kanji (U+4E00-U+9FFF).
 * Quoted strings ("...", curly quotes, corner brackets) and parenthesised Japanese glosses are
 * removed first: they are examples of what a UI says, which the guidance is allowed to quote.
 * It is a heuristic, deliberately: it cannot tell Vietnamese from a French word with an accent, but
 * the base letters it keys on do not occur in either English or French prose.
 *
 * EXCEPTIONS are declared below with a reason: translations and demo data that must stay in their
 * language. A line matched by one is not counted.
 *
 * RATCHET. `scripts/consumer-english.baseline.json` records the flagged-line count per file. The
 * count may not GROW; if it shrinks the gate also fails until the baseline is lowered
 * (`--update-baseline`), so a translation win cannot be spent later. The report prints the baseline.
 *
 * Run from the repo root.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const VIETNAMESE = /[Ạ-ỹĂăĐđƠơƯư]/;
const JAPANESE = /[぀-ヿｦ-ﾟ一-鿿]/;

/**
 * A line is non-English prose when, after quoted examples are removed, it holds at least this many
 * tone-marked Vietnamese words or Japanese characters. One stray term (a colour name such as
 * 山吹, a product name) is vocabulary; a sentence is not.
 */
const MIN_VIETNAMESE_WORDS = 2;
const MIN_JAPANESE_CHARS = 8;

/** JSON keys whose values are code or data, never prose. */
const DATA_KEYS = new Set([
  "code",
  "snippet",
  "example",
  "examples",
  "value",
  "values",
  "default",
  "type",
  "importPath",
  "import",
  "source",
  "name",
  "default_value",
  "defaultValue",
]);

/**
 * Lines allowed to stay in their own language: `{ file, pattern, reason }`, with `pattern` tested
 * against the prose line. Empty today: quoted UI strings and parenthesised glosses are already
 * treated as demo data (stripQuoted), so nothing needs naming. Adding an entry is a claim that the
 * line is a translation or demo data, so give the reason.
 */
export const EXCEPTIONS = [];

/** Remove fenced blocks and inline code from markdown-ish prose. */
export function stripCode(text) {
  return text.replace(/^```[\s\S]*?^```/gm, "").replace(/`[^`\n]*`/g, "");
}

/** Quoted strings are examples of what a UI says (demo data), not the guidance itself. */
export function stripQuoted(text) {
  return text
    .replace(/"[^"]{0,200}"|“[^”]{0,200}”|「[^」]{0,200}」|『[^』]{0,200}』|'[^'\n]{2,}'/g, "")
    .replace(/\([^)\n]*\)/g, (m) => (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(m) ? "" : m));
}

/** Prose strings in a parsed JSON value, skipping data keys. */
export function proseStrings(value, key = "", out = []) {
  if (typeof value === "string") {
    if (!DATA_KEYS.has(key)) out.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) proseStrings(v, key, out);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) proseStrings(v, k, out);
  }
  return out;
}

/** Flagged prose lines in a text, given its file kind. */
export function flaggedLines(text, { json = false, file = "" } = {}) {
  const strings = json ? proseStrings(JSON.parse(text)) : [text];
  const lines = strings.flatMap((s) => stripQuoted(stripCode(s)).split("\n"));
  return lines.filter((line) => {
    const raw = line;
    const vietnamese = line.split(/\s+/).filter((w) => VIETNAMESE.test(w)).length;
    const japanese = [...line].filter((c) => JAPANESE.test(c)).length;
    if (vietnamese < MIN_VIETNAMESE_WORDS && japanese < MIN_JAPANESE_CHARS) return false;
    return !EXCEPTIONS.some((e) => e.file === file && e.pattern.test(raw));
  });
}

/** Generated copies of the per-component files; counting both would count every line twice. */
const DERIVED = new Set([
  "agent/components.json",
  "agent/components-index.json",
  "agent/patterns-index.json",
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

export function scan(root) {
  const files = [];
  const agentDir = join(root, "agent");
  if (existsSync(agentDir)) files.push(...walk(agentDir));
  const rules = join(root, "docs/CONSUMER-RULES.md");
  if (existsSync(rules)) files.push(rules);
  const counts = {};
  let scanned = 0;
  for (const full of files.sort()) {
    if (!/\.(json|md|txt)$/.test(full)) continue;
    if (DERIVED.has(relative(root, full))) continue;
    const rel = relative(root, full);
    scanned += 1;
    const flagged = flaggedLines(readFileSync(full, "utf8"), {
      json: full.endsWith(".json"),
      file: rel,
    });
    if (flagged.length) counts[rel] = flagged.length;
  }
  return { counts, scanned };
}

export function compare(counts, baseline) {
  const problems = [];
  for (const file of new Set([...Object.keys(counts), ...Object.keys(baseline)])) {
    const now = counts[file] ?? 0;
    const was = baseline[file] ?? 0;
    if (now > was)
      problems.push(`${file}: ${now} non-English prose line(s), baseline ${was} (grew)`);
    else if (now < was) {
      problems.push(
        `${file}: ${now} line(s), baseline ${was}; lock the win in with --update-baseline`,
      );
    }
  }
  return problems;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const root = process.cwd();
  const baselinePath = join(root, "scripts/consumer-english.baseline.json");
  const { counts, scanned } = scan(root);
  if (scanned === 0) {
    console.error(
      "x check:consumer-english - scanned 0 files; a gate that reads nothing proves nothing.",
    );
    process.exit(1);
  }
  if (process.argv.includes("--update-baseline")) {
    writeFileSync(baselinePath, JSON.stringify(counts, null, 2) + "\n");
    console.log(
      `baseline written: ${Object.keys(counts).length} file(s), ${Object.values(counts).reduce((a, b) => a + b, 0)} line(s)`,
    );
    process.exit(0);
  }
  const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const problems = compare(counts, baseline);
  if (problems.length) {
    console.error(`x check:consumer-english - ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(
    `ok check:consumer-english - ${scanned} file(s) scanned, ${total} non-English prose line(s), none above baseline.`,
  );
}
