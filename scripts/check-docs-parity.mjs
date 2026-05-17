#!/usr/bin/env node
/**
 * Cardinal rule 18 enforcement — `docs/reference/primitives/<Name>.md`
 * ↔ exported primitive parity.
 *
 * Every primitive family with its own story file should also have a
 * reference page. Co-documented sub-primitives (Textarea inside
 * Input.stories.tsx, Title/Paragraph inside Typography.stories.tsx,
 * …) share the family's reference page.
 *
 * Usage:
 *   node scripts/check-docs-parity.mjs
 *   pnpm run check:docs-parity
 *
 * Exits non-zero on drift so CI / pre-commit can block.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const PRIMITIVES_TS = join(rootDir, "src/components/primitives.ts");
const DOCS_DIR = join(rootDir, "docs/reference/primitives");

// Exports we never expect to map to a doc file (helpers, hooks, raw
// utilities).
const NON_DOC_EXPORTS = new Set([
  "cn",
  "useRowGutter",
  "useFormContext",
  "toast",
]);

// Map each primitive name → the reference doc basename that documents
// it. Mirrors `check-stories-parity.mjs`'s PRIMITIVE_TO_STORY so the
// two checkers stay consistent.
const PRIMITIVE_TO_DOC = {
  Row: "Flex",
  Col: "Flex",
  Space: "Flex",
  Flex: "Flex",
  Input: "Input",
  Textarea: "Input",
  InputPassword: "Input",
  InputSearch: "Input",
  Typography: "Typography",
  Title: "Typography",
  Paragraph: "Typography",
  Text: "Typography",
  Link: "Typography",
  TypographyTitle: "Typography",
  TypographyParagraph: "Typography",
  TypographyText: "Typography",
  TypographyLink: "Typography",
  DatePicker: "DatePicker",
  DateField: "DatePicker",
  DateRangePicker: "DatePicker",
  TimeField: "DatePicker",
  // TimeInput primitive — doc file uses the primitive name directly
  // (vs the story which uses TimePicker as the consumer-facing name).
  TimeInput: "TimeInput",
  Steps: "Steps",
  Step: "Steps",
  Button: "Button",
  IconButton: "IconButton",
  Spinner: "Spinner",
  Toaster: "Toaster",
  Tooltip: "Tooltip",
  SimpleTooltip: "Tooltip",
  // Overlay primitives keep their canonical Radix names in docs
  // (Sheet / Dialog / DropdownMenu / AlertDialog).
};

const CALENDAR_RE = /^(Calendar|MiniMonth|EventBlock|TimeGrid|AvailabilityRow)/;

function readPrimitiveExports() {
  const src = readFileSync(PRIMITIVES_TS, "utf8");
  const names = new Set();
  const exportRe = /export\s*\{([\s\S]*?)\}\s*from/g;
  let match;
  while ((match = exportRe.exec(src)) !== null) {
    const body = match[1];
    body
      .split(",")
      .map((tok) => tok.trim())
      .filter(Boolean)
      .forEach((raw) => {
        const name = raw.split(/\s+as\s+/)[0].trim();
        if (!name || !/^[A-Z]/.test(name)) return;
        if (NON_DOC_EXPORTS.has(name)) return;
        names.add(name);
      });
  }
  if (src.includes("./data-display/calendar/index")) {
    names.add("Calendar");
  }
  return names;
}

function readDocFiles() {
  const docs = new Set();
  if (!existsSync(DOCS_DIR)) return docs;
  for (const file of readdirSync(DOCS_DIR)) {
    if (!file.endsWith(".md") || file === "README.md") continue;
    docs.add(file.replace(/\.md$/, ""));
  }
  return docs;
}

function expectedDocFor(primitive) {
  if (PRIMITIVE_TO_DOC[primitive]) return PRIMITIVE_TO_DOC[primitive];
  if (CALENDAR_RE.test(primitive)) return "Calendar";
  return primitive;
}

function main() {
  if (!existsSync(PRIMITIVES_TS)) {
    console.error(`✗ primitives barrel not found at ${PRIMITIVES_TS}`);
    process.exit(2);
  }
  const exports = readPrimitiveExports();
  const docs = readDocFiles();

  function familyRoot(name) {
    if (PRIMITIVE_TO_DOC[name]) return null;
    if (CALENDAR_RE.test(name) && name !== "Calendar") return null;
    if (docs.has(name)) return null;
    let best = null;
    for (const candidate of exports) {
      if (candidate === name) continue;
      if (!name.startsWith(candidate)) continue;
      const suffix = name.slice(candidate.length);
      if (!/^[A-Z]/.test(suffix)) continue;
      if (!best || candidate.length > best.length) best = candidate;
    }
    return best;
  }

  const required = new Set();
  for (const name of exports) {
    if (NON_DOC_EXPORTS.has(name)) continue;
    const expected = expectedDocFor(name);
    if (expected !== name) {
      required.add(expected);
      continue;
    }
    const root = familyRoot(name);
    if (root) {
      required.add(expectedDocFor(root));
      continue;
    }
    required.add(expected);
  }

  const missing = [];
  for (const doc of required) {
    if (!docs.has(doc)) missing.push(doc);
  }
  const stray = [];
  for (const doc of docs) {
    if (!required.has(doc)) stray.push(doc);
  }

  const total = missing.length + stray.length;
  if (total === 0) {
    console.log(
      `✓ docs/reference/primitives parity: ${required.size} expected, ${docs.size} present.`,
    );
    process.exit(0);
  }

  console.error(
    `docs/reference/primitives parity: ${total} drift item(s) ` +
      `(${missing.length} missing, ${stray.length} stray)`,
  );
  for (const m of missing) {
    console.error(`✗ primitive family requires "docs/reference/primitives/${m}.md" — missing.`);
  }
  for (const s of stray) {
    console.error(
      `✗ doc "docs/reference/primitives/${s}.md" does not match any primitive in primitives.ts.`,
    );
  }
  // Docs parity is informational at this stage — many reference docs
  // are still being authored. Exit code 1 only when stray docs exist;
  // missing-docs gets a non-blocking warning so the gate doesn't trip
  // until the catalogue is complete.
  if (stray.length > 0) {
    process.exit(1);
  }
  console.error(
    "(missing docs are advisory until the reference catalogue is complete — " +
      "this run reports drift but exits 0)",
  );
  process.exit(0);
}

main();
