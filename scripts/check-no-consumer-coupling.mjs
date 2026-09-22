#!/usr/bin/env node
/**
 * check:no-consumer-coupling — keeps @godxjp/ui an INTERNATIONAL, consumer-agnostic library. It
 * FAILS (non-zero exit, printing file:line for each violation) when the library source references
 * a SPECIFIC downstream consumer/product or consumer infrastructure.
 *
 * Four passes, four severities:
 *   consumer identifiers/domains  src+mcp+docs+preview   baselined  (no-consumer-coupling.baseline.json)
 *   locale/currency/tz literals   src/components only    STRICT     (no baseline, 0 allowed)
 *   docs locale content (gh#846)  docs/**                baselined  (docs-locale-literals.baseline.json)
 *   docs copy in the RUNTIME      src/i18n/messages/*    STRICT     (gh#858, no baseline)
 *   message catalogue
 *
 * Flags: --all (also list baselined debt) · --json · --update-baseline (rewrites both baselines;
 * the docs one shrink-only — it refuses to raise or add an entry).
 */
import { readFileSync, writeFileSync, globSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const BASELINE_PATH = join(HERE, "no-consumer-coupling.baseline.json");
const DOCS_BASELINE_PATH = join(HERE, "docs-locale-literals.baseline.json");

// ── DENYLIST — maintainable, one array per category ─────────────────────────
// Downstream product / app / deployment names + consumer infrastructure. Extend
// these as new consumers appear. Everything here is matched on WORD BOUNDARIES so
// the library's own scope (@godxjp/ui) can never be caught by a substring.
const CONSUMER_IDENTIFIERS = [
  "godx-umbrella",
  "umbrella",
  "kintai-prod",
  "kintai",
  "tempo",
  "tiximax",
  "chat-prod",
];

// Consumer infra domains. Explicit consumer hosts + the generic `<slug>-prod.godx.jp`
// backend-origin pattern. NOTE: bare `godx.jp` / the `@godxjp` scope are intentionally
// NOT forbidden — only consumer *subdomains* are.
const CONSUMER_DOMAINS = [
  "id.godx.jp",
  "apigw.godx.jp",
  "mcp.godx.jp",
  "console.godx.jp",
  "admin.godx.jp",
  "lago.godx.jp",
];

// Hard-coded locale/currency/timezone literals that bypass Intl/CLDR. Only enforced
// in component SOURCE (src/components/**, excluding tests/stories/examples).
const LOCALE_LITERALS = [
  { name: "currency symbol ¥ (use Intl.NumberFormat)", re: /(['"`])\s*¥\s*\1/ },
  { name: "currency code 'JPY' (derive from data/Intl)", re: /(['"`])JPY\1/ },
  { name: "locale 'ja-JP' (use the app locale / BCP-47)", re: /(['"`])ja-JP\1/ },
  { name: "timezone 'Asia/Tokyo' (use IANA/user tz)", re: /(['"`])Asia\/Tokyo\1/ },
];

// record legitimately naming consumers). The gate script + its baseline + fixtures
// are outside the scanned trees.
const IGNORE_SEGMENTS = ["/node_modules/", "/dist/", "/build/", "/.turbo/", "/coverage/"];
// carries denylist tokens as fixtures — both are allowlisted by basename.
const IGNORE_BASENAMES = new Set(["CHANGELOG.md", "no-consumer-coupling.gate.test.ts"]);

// Scanned trees: library source, the MCP catalog package, docs, stories & examples.
const SCAN_GLOBS = [
  "src/**/*.{ts,tsx,css,md,mdx}",
  "mcp/**/*.{ts,tsx,md}",
  "docs/**/*.{ts,tsx,css,md,mdx}",
  "preview/src/**/*.{ts,tsx,css,md}",
];
// Component-source subset for the locale-literal check (exclude non-shipping code).
const COMPONENT_GLOBS = ["src/components/**/*.{ts,tsx}"];
const COMPONENT_EXCLUDE = /(?:__tests__|\.test\.|\.stories\.|\/examples\/)/;

// ── docs/** locale literals (gh#846) ────────────────────────────────────────
// The locale rule above stopped at `src/components/**`, so it was strict exactly where the
// library lives and absent exactly where the EXAMPLES live — the surface the MCP catalog,
// agent/patterns.json and every copy-pasting consumer read from. 28 showcase files (221 across
// docs/**) hard-code Japanese next to chrome the library localises, which is how /showcase/
// table-pagination rendered `11–20 / 83 件` beside a Select saying `10 / trang`.
//
// THREE DECISIONS, each measured rather than assumed:
//
// 1. WHAT COUNTS. "Only files that ALSO render localized components" was the narrowing that
//    looked right — and it is very nearly empty. Of the 221 docs/**/*.{ts,tsx} files containing
//    CJK, 220 import at least one component that calls useTranslation() internally; the single
//    exception is a plain data module (docs/layout/legal-document-shell/_data.ts). A page built
//    from this library IS mixed the moment it renders a control, so "a showcase written entirely
//    in Japanese" does not exist here, and gating on the mix would gate on 220/221 anyway while
//    adding a component-import graph to a text scanner. The rule therefore targets CJK — but only
//    where CJK is CHROME, see (2) — and the reason is that measurement, not a language preference.
//
// 2. DOMAIN DATA vs UI CHROME. A regex cannot look at "鈴木 一郎" and "氏名" and tell you which
//    one is content. So this does not try. It identifies chrome POSITIVELY — text rendered as a
//    JSX child, and strings passed to props that render as human-readable text — and leaves
//    everything else unscanned. Roughly 1900 CJK string literals (company names, 1月…6月 chart
//    categories, 給与/家賃 expense rows) sit in that residue and this gate deliberately never
//    reports them. The cost is a known blind spot in both directions: a hand-written
//    `<Text>鈴木 一郎</Text>` is flagged though it is data, and a `header: "氏名"` moved into a
//    generated column array escapes. It is a heuristic with a stated error, not a classifier.
//
// 3. SEVERITY. godx-corebooks#114 is the recorded cost of getting this wrong: 1189 errors on day
//    one made a documented rule unenforceable and the consumer opened an issue about the rule.
//    So: a per-file BASELINE, zero errors on day one, and the list may only SHRINK
//    (`--update-baseline` refuses to raise or add). Baselined debt is reported under `--all`, not
//    as a failure. New or increased chrome in a docs file is the only error this can produce.
const DOCS_GLOBS = ["docs/**/*.{ts,tsx}"];
// Hiragana · Katakana · CJK Unified Ideographs. Built from a string so the code points stay
// readable as escapes — prettier rewrites `\uXXXX` inside a regex LITERAL to the glyph itself.
const CJK = new RegExp("[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF]");
// Props whose value RENDERS as human-readable text. Anything not in this list (name, value, id,
// category, …) is treated as domain data and never scanned — see decision (2).
const CHROME_PROP =
  /\b(label|placeholder|title|subtitle|heading|description|header|caption|tooltip|emptyMessage|emptyTitle|emptyDescription|alt|aria-label|ariaLabel|helperText|hint|actionLabel|confirmLabel|cancelLabel|legend)\s*[:=]\s*\{?\s*(['"])((?:(?!\2)[^\n])*)\2/g;

// ── docs copy in the runtime message catalogue (gh#858) ─────────────────────
// The pass above pushes a docs author towards `useTranslation()` + a message key, and has no
// opinion about WHICH catalogue receives the key. Both existing message files were reachable, so
// the keys went into `src/i18n/messages/*.json` — the catalogue `src/i18n/translate.ts` imports
// statically. JSON has no named exports, so a bundler cannot shake an unused namespace out of it:
// one `useTranslation()` anywhere in a consumer's tree (ScrollArea's default region label is
// enough) pulls all three locales in whole. By 28.12.0 that was 60.7% of en.json — 68.5 kB raw
// across three locales — of showcase and theme-editor demo copy in every consumer's bundle, and
// a consumer read those exact strings out of its PRODUCTION build.
//
// So the rule is mechanical and about OWNERSHIP, not about size: a top-level namespace in the
// runtime catalogue that NO shipping `src/**` module reads is docs copy, and belongs in
// `docs/i18n/messages/*.json`, which `preview/src/docs-messages.ts` registers at startup through
// the `registerMessages` extension point.
//
// DETECTION is a literal prefix — `"ns.` / `'ns.` / `` `ns. `` — which covers the computed keys
// too, because every one of them is built from a template whose constant head is the namespace
// (`` `timezone.${tz}` ``, `` `locale.${code}` ``). A namespace assembled with NO literal head
// would read as unused; the remedy is the same either way — name it once in the module that
// reads it, or move it to the docs catalogue.
//
// STRICT, no baseline: the split starts clean, and a baseline here would only record the next
// regression rather than stop it.
const RUNTIME_MESSAGE_GLOBS = ["src/i18n/messages/*.json"];
const DOCS_MESSAGE_DIR = "docs/i18n/messages";
// The shipping library surface. Tests and stories are excluded: a gate fixture quoting
// `t("showcase.pagination.recordCount")` is a string ABOUT a key, not a component reading one.
const RUNTIME_SOURCE_GLOBS = ["src/**/*.{ts,tsx}"];
const RUNTIME_SOURCE_EXCLUDE = /(?:__tests__|\.test\.|\.stories\.|\/i18n\/messages\/)/;

// A `>…<` run is JSX text only if it carries none of the characters that mean "this is code":
// quotes, `;`, `=`, ASCII parens. That is what keeps `useState<Row[]>([{ name: "鈴木" }])` —
// a generic followed by a data array — out of the JSX-text bucket.
const NOT_JSX_TEXT = /["'`;=()]/;

// ── matchers ────────────────────────────────────────────────────────────────
const WORD = "[A-Za-z0-9]";
function boundaried(token) {
  // Custom boundary: not flanked by an alphanumeric. Lets hyphenated tokens match
  // inside `dxs-kintai` / `godx-kintai` while never matching a longer alnum word.
  const esc = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<!${WORD})${esc}(?!${WORD})`, "gi");
}
const IDENTIFIER_MATCHERS = CONSUMER_IDENTIFIERS.map((t) => ({ name: t, re: boundaried(t) }));
const DOMAIN_MATCHERS = [
  ...CONSUMER_DOMAINS.map((d) => ({ name: d, re: boundaried(d) })),
  { name: "<slug>-prod.godx.jp", re: /(?<![A-Za-z0-9])[a-z0-9-]+-prod\.godx\.jp(?![A-Za-z0-9])/gi },
];

/** Scan raw text for consumer identifiers/domains. Returns [{ token, match, line }]. */
export function scanText(text) {
  const out = [];
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const { name, re } of [...IDENTIFIER_MATCHERS, ...DOMAIN_MATCHERS]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        out.push({ token: name, match: m[0], line: i + 1 });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }
  });
  return out;
}

/** Scan component source for hard-coded locale/currency/timezone literals. Pure/exported for tests. */
export function scanLocale(text) {
  const out = [];
  text.split("\n").forEach((line, i) => {
    for (const { name, re } of LOCALE_LITERALS) {
      const m = re.exec(line);
      if (m) out.push({ token: name, match: m[0].trim(), line: i + 1 });
    }
  });
  return out;
}

/** Blank out line and block comments, preserving newlines so line numbers survive. Japanese in a
 * comment is author documentation for a Japanese-reading maintainer — it is never rendered, and
 * flagging it would make the gate noise. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, (m, p) => p + m.slice(p.length).replace(/[^\n]/g, " "));
}

const lineAt = (src, index) => src.slice(0, index).split("\n").length;

/**
 * Scan a docs example for hard-coded locale content in CHROME positions. Returns
 * [{ token, match, line }] — the same shape as scanText/scanLocale. Exported for the self-test.
 */
export function scanDocsChrome(text) {
  const src = stripComments(text);
  const out = [];
  for (const m of src.matchAll(/>([^<>]*)</g)) {
    if (NOT_JSX_TEXT.test(m[1])) continue;
    const cleaned = m[1].replace(/\{[^{}]*\}/g, "").trim();
    if (!CJK.test(cleaned)) continue;
    out.push({ token: "CJK in JSX text", match: cleaned, line: lineAt(src, m.index) });
  }
  for (const m of src.matchAll(CHROME_PROP)) {
    if (!CJK.test(m[3])) continue;
    out.push({ token: `CJK in \`${m[1]}\``, match: m[3], line: lineAt(src, m.index) });
  }
  return out.sort((a, b) => a.line - b.line);
}

function collect(globs) {
  const files = new Set();
  for (const g of globs) {
    for (const f of globSync(g, { cwd: ROOT })) {
      const rel = f.split("\\").join("/");
      if (IGNORE_SEGMENTS.some((s) => `/${rel}`.includes(s))) continue;
      if (IGNORE_BASENAMES.has(rel.split("/").pop())) continue;
      files.add(rel);
    }
  }
  return [...files].sort();
}

/**
 * Which of `namespaces` does this text read a message key from? Matches the literal head of a
 * dotted key in any string form — `"ns.x"`, `'ns.x'`, `` `ns.${x}` ``. Pure/exported for the
 * self-test. (gh#858)
 */
export function referencedNamespaces(text, namespaces) {
  return namespaces.filter((ns) =>
    new RegExp(`["'\`]${ns.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.`).test(text),
  );
}

/** Top-level namespaces present in a set of message JSON files. */
function namespacesIn(globs) {
  const out = new Set();
  for (const rel of collect(globs)) {
    for (const key of Object.keys(JSON.parse(readFileSync(join(ROOT, rel), "utf8")))) out.add(key);
  }
  return [...out].sort();
}

/**
 * Namespaces the RUNTIME catalogue ships that no shipping `src/**` module reads — docs copy in
 * the consumer's bundle. Returns [{ namespace, readers }], readers being the docs files that do
 * read it (empty when nothing reads it at all — dead copy either way). (gh#858)
 */
export function findDocsOnlyRuntimeNamespaces() {
  const namespaces = namespacesIn(RUNTIME_MESSAGE_GLOBS);

  const read = new Set();
  for (const rel of collect(RUNTIME_SOURCE_GLOBS)) {
    if (RUNTIME_SOURCE_EXCLUDE.test(rel)) continue;
    const text = readFileSync(join(ROOT, rel), "utf8");
    for (const ns of referencedNamespaces(text, namespaces)) read.add(ns);
  }

  const orphans = namespaces.filter((ns) => !read.has(ns));
  if (orphans.length === 0) return [];

  const readers = new Map(orphans.map((ns) => [ns, []]));
  for (const rel of collect(DOCS_GLOBS)) {
    const text = readFileSync(join(ROOT, rel), "utf8");
    for (const ns of referencedNamespaces(text, orphans)) readers.get(ns).push(rel);
  }
  return orphans.map((namespace) => ({ namespace, readers: readers.get(namespace) }));
}

/** docs/** hard-coded locale content, grouped by file. rel -> [{ token, match, line }] */
function collectDocsHits() {
  const out = new Map();
  for (const rel of collect(DOCS_GLOBS)) {
    const text = readFileSync(join(ROOT, rel), "utf8");
    const hits = scanDocsChrome(text).sort((a, b) => a.line - b.line);
    if (hits.length) out.set(rel, hits);
  }
  return out;
}

const DOCS_BASELINE_NOTE =
  "Hard-coded locale content in the EXAMPLES — the surface the MCP catalog, agent/patterns.json " +
  "and every copy-pasting consumer read from. Keyed on the FILE PATH (identity) and never on a " +
  "line number, which moves the moment someone adds an import; the value is that file's remaining " +
  "allowance. This list is DEBT and may only SHRINK: the gate fails on a file whose count rises " +
  "above its allowance, and `--update-baseline` REFUSES to raise or add an entry. The way past " +
  "the gate is useTranslation() + a message key — see docs/showcase/table-pagination.tsx, which " +
  "does exactly that for its pagination chrome.";

/** Rewrite the docs baseline. Shrink-only: refuses to raise or add. Returns an exit code. */
function writeDocsBaseline(docsByFile) {
  const live = {};
  for (const rel of [...docsByFile.keys()].sort()) live[rel] = docsByFile.get(rel).length;

  const seeding = !existsSync(DOCS_BASELINE_PATH);
  const allowed = seeding ? {} : (JSON.parse(readFileSync(DOCS_BASELINE_PATH, "utf8")).files ?? {});

  if (!seeding) {
    const raised = Object.entries(live).filter(([rel, n]) => n > (allowed[rel] ?? 0));
    if (raised.length) {
      console.error(`✗ the docs locale baseline may only SHRINK — refusing to record:\n`);
      for (const [rel, n] of raised) console.error(`  ${rel}: ${allowed[rel] ?? 0} → ${n}`);
      console.error(
        "\nLocalise the new string (useTranslation() + a message key) instead of raising the number.\n",
      );
      return 1;
    }
  }

  const files = {};
  for (const rel of Object.keys(seeding ? live : allowed).sort()) {
    if (live[rel]) files[rel] = live[rel]; // a file that is now clean drops out entirely
  }
  const occurrences = Object.values(files).reduce((a, b) => a + b, 0);
  writeFileSync(
    DOCS_BASELINE_PATH,
    JSON.stringify(
      {
        note: DOCS_BASELINE_NOTE,
        tracked: "gh#846",
        count: Object.keys(files).length,
        occurrences,
        files,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `✓ ${seeding ? "seeded" : "shrank"} docs locale baseline: ${Object.keys(files).length} file(s), ` +
      `${occurrences} occurrence(s) → ${relative(ROOT, DOCS_BASELINE_PATH)}`,
  );
  return 0;
}

function main() {
  const argv = process.argv.slice(2);
  const files = collect(SCAN_GLOBS);

  // identifier/domain violations, grouped by file
  const byFile = new Map(); // rel -> [{ token, match, line }]
  for (const rel of files) {
    const hits = scanText(readFileSync(join(ROOT, rel), "utf8"));
    if (hits.length) byFile.set(rel, hits);
  }

  if (argv.includes("--update-baseline")) {
    const baseline = {};
    for (const rel of [...byFile.keys()].sort()) baseline[rel] = byFile.get(rel).length;
    writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + "\n");
    console.log(
      `✓ wrote baseline for ${Object.keys(baseline).length} file(s) → ${relative(ROOT, BASELINE_PATH)}`,
    );
    return writeDocsBaseline(collectDocsHits());
  }

  const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, "utf8")) : {};

  // A file FAILS if its live count exceeds its baselined allowance (0 if unlisted).
  const newViolations = []; // fully-formatted strings
  const debt = []; // baselined pre-existing references (for --all reporting)
  let debtCount = 0;
  for (const rel of [...byFile.keys()].sort()) {
    const hits = byFile.get(rel);
    const allowed = baseline[rel] ?? 0;
    debtCount += Math.min(hits.length, allowed);
    if (hits.length > allowed) {
      for (const h of hits) {
        newViolations.push(`  ${rel}:${h.line}  ${h.match}  [consumer: ${h.token}]`);
      }
      newViolations.push(
        `    ↳ ${rel}: ${hits.length} reference(s) but baseline allows ${allowed} — remove the NEW one(s).`,
      );
    } else if (hits.length) {
      debt.push(`  ${rel}: ${hits.length} (baselined)`);
    }
  }

  // locale literals — component source only, NO baseline (strict).
  const localeViolations = [];
  for (const rel of collect(COMPONENT_GLOBS)) {
    if (COMPONENT_EXCLUDE.test(rel)) continue;
    for (const h of scanLocale(readFileSync(join(ROOT, rel), "utf8"))) {
      localeViolations.push(`  ${rel}:${h.line}  ${h.match}  [locale literal: ${h.token}]`);
    }
  }

  // docs/** locale content — BASELINED (gh#846). A file fails only when it exceeds its allowance.
  const docsBaseline = existsSync(DOCS_BASELINE_PATH)
    ? (JSON.parse(readFileSync(DOCS_BASELINE_PATH, "utf8")).files ?? {})
    : {};
  const docsViolations = [];
  const docsDebt = [];
  let docsDebtCount = 0;
  const docsByFile = collectDocsHits();
  for (const rel of [...docsByFile.keys()].sort()) {
    const hits = docsByFile.get(rel);
    const allowed = docsBaseline[rel] ?? 0;
    docsDebtCount += Math.min(hits.length, allowed);
    if (hits.length > allowed) {
      // The gate COUNTS; it cannot say which of these is the new one, so it shows them all
      // (capped) rather than pointing at a line it only guessed at.
      for (const h of hits.slice(0, 12)) {
        docsViolations.push(`  ${rel}:${h.line}  ${h.match}  [${h.token}]`);
      }
      if (hits.length > 12) docsViolations.push(`  … and ${hits.length - 12} more in this file`);
      docsViolations.push(
        `    ↳ ${rel}: ${hits.length} hard-coded string(s) but baseline allows ${allowed} — localise one of them.`,
      );
    } else if (hits.length) {
      docsDebt.push(`  ${rel}: ${hits.length} (baselined)`);
    }
  }

  // runtime message catalogue carrying docs-only copy — STRICT (gh#858).
  const catalogueViolations = [];
  for (const { namespace, readers } of findDocsOnlyRuntimeNamespaces()) {
    const who = readers.length ? readers.join(", ") : "nothing — dead copy";
    catalogueViolations.push(`  src/i18n/messages/*.json  "${namespace}"  [read only by: ${who}]`);
  }

  if (argv.includes("--json")) {
    process.stdout.write(
      JSON.stringify(
        {
          newViolations,
          localeViolations,
          docsViolations,
          catalogueViolations,
          baselinedFiles: Object.keys(baseline).length,
          baselinedReferences: debtCount,
          docsBaselinedFiles: Object.keys(docsBaseline).length,
          docsBaselinedStrings: docsDebtCount,
        },
        null,
        2,
      ) + "\n",
    );
    return newViolations.length +
      localeViolations.length +
      docsViolations.length +
      catalogueViolations.length >
      0
      ? 1
      : 0;
  }

  const failed =
    newViolations.length +
      localeViolations.length +
      docsViolations.length +
      catalogueViolations.length >
    0;

  if (localeViolations.length) {
    console.error(
      `✗ check:no-consumer-coupling — ${localeViolations.length} hard-coded locale/currency/timezone literal(s) in component source:\n`,
    );
    for (const v of localeViolations) console.error(v);
    console.error(
      "\nUse Intl/CLDR (Intl.NumberFormat/DateTimeFormat, the app locale, IANA tz) — never bake one region in.\n",
    );
  }
  if (newViolations.length) {
    console.error(
      `✗ check:no-consumer-coupling — NEW consumer/product reference(s) (beyond the recorded baseline):\n`,
    );
    for (const v of newViolations) console.error(v);
    console.error(
      "\n@godxjp/ui is a general international library — it must not name a specific consumer/product/deployment.",
    );
    console.error(
      "Use a neutral/fictitious name (e.g. Acme) or a token/prop. The library's OWN scope @godxjp/ui is fine.\n",
    );
  }

  if (docsViolations.length) {
    console.error(
      `✗ check:no-consumer-coupling — NEW hard-coded locale content in docs/** (beyond the recorded baseline):\n`,
    );
    for (const v of docsViolations) console.error(v);
    console.error(
      "\nThe examples are what the MCP catalog and every copy-pasting consumer read, so a showcase that",
    );
    console.error(
      "hard-codes chrome teaches the library's own first rule backwards — and renders two languages in",
    );
    console.error(
      "one row, because the library's chrome follows the locale and a literal cannot. Use useTranslation()",
    );
    console.error(
      "+ a message key (docs/showcase/table-pagination.tsx is the worked example) and Intl for numbers/dates.",
    );
    console.error(
      "Domain DATA (a person's name, a company in a table row) is not scanned and does not need this.\n",
    );
  }

  if (catalogueViolations.length) {
    console.error(
      `✗ check:no-consumer-coupling — ${catalogueViolations.length} docs-only namespace(s) in the RUNTIME message catalogue:\n`,
    );
    for (const v of catalogueViolations) console.error(v);
    console.error(
      `\n\`src/i18n/translate.ts\` imports src/i18n/messages/{en,ja,vi}.json statically, and JSON has no`,
    );
    console.error(
      `named exports — so a namespace no component reads still ships, in all three locales, to every`,
    );
    console.error(
      `consumer that renders one component calling useTranslation(). Move it to ${DOCS_MESSAGE_DIR}/*.json`,
    );
    console.error(
      `(preview/src/docs-messages.ts registers those at startup via registerMessages) and the docs pages`,
    );
    console.error(
      `keep working unchanged. If a SHIPPING component really does read it, reference the key from that`,
    );
    console.error(`component rather than assembling the namespace name at runtime.\n`);
  }

  if (argv.includes("--all") && debt.length) {
    console.error(`ℹ pre-existing consumer references (baselined debt — burn down over time):`);
    for (const d of debt) console.error(d);
    console.error("");
  }
  if (argv.includes("--all") && docsDebt.length) {
    console.error(
      `ℹ docs/** hard-coded locale content (baselined debt — burn down as files are touched):`,
    );
    for (const d of docsDebt) console.error(d);
    console.error("");
  }

  if (!failed) {
    console.log(
      `✓ check:no-consumer-coupling — no NEW consumer coupling ` +
        `(${files.length} files scanned; ${debtCount} baselined reference(s) across ${debt.length} file(s) tracked as debt; 0 locale literals in component source; ` +
        `${docsDebtCount} baselined docs string(s) across ${docsDebt.length} file(s); ` +
        `0 docs-only namespace(s) in the runtime message catalogue).`,
    );
  }
  return failed ? 1 : 0;
}

// Run only when invoked directly (keeps scanText/scanLocale importable by the self-test).
if (process.argv[1] && process.argv[1].endsWith("check-no-consumer-coupling.mjs")) {
  process.exit(main());
}
