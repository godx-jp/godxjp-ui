#!/usr/bin/env node
/**
 * check:no-consumer-coupling — keeps @godxjp/ui an INTERNATIONAL, consumer-agnostic library. It
 * FAILS (non-zero exit, printing file:line for each violation) when the library source references
 * a SPECIFIC downstream consumer/product or consumer infrastructure.
 */
import { readFileSync, writeFileSync, globSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const BASELINE_PATH = join(HERE, "no-consumer-coupling.baseline.json");

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
    return 0;
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

  if (argv.includes("--json")) {
    process.stdout.write(
      JSON.stringify(
        {
          newViolations,
          localeViolations,
          baselinedFiles: Object.keys(baseline).length,
          baselinedReferences: debtCount,
        },
        null,
        2,
      ) + "\n",
    );
    return newViolations.length + localeViolations.length > 0 ? 1 : 0;
  }

  const failed = newViolations.length + localeViolations.length > 0;

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

  if (argv.includes("--all") && debt.length) {
    console.error(`ℹ pre-existing consumer references (baselined debt — burn down over time):`);
    for (const d of debt) console.error(d);
    console.error("");
  }

  if (!failed) {
    console.log(
      `✓ check:no-consumer-coupling — no NEW consumer coupling ` +
        `(${files.length} files scanned; ${debtCount} baselined reference(s) across ${debt.length} file(s) tracked as debt; 0 locale literals in component source).`,
    );
  }
  return failed ? 1 : 0;
}

// Run only when invoked directly (keeps scanText/scanLocale importable by the self-test).
if (process.argv[1] && process.argv[1].endsWith("check-no-consumer-coupling.mjs")) {
  process.exit(main());
}
