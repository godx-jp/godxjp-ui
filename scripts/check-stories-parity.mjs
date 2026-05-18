#!/usr/bin/env node
/**
 * Cardinal rule 17 enforcement — `src/stories/<group>/` ↔
 * `src/components/primitives.ts` parity.
 *
 * Reports primitive families exported from the barrel that lack a
 * matching story file. Bidirectional: also catches stray story files
 * that don't correspond to any primitive (or documented alias).
 *
 * Many primitives are co-documented inside one story file (Textarea,
 * InputPassword, InputSearch all live in `Input.stories.tsx`; Title /
 * Paragraph / Text / Link in `Typography.stories.tsx`). Those
 * co-locations are declared explicitly via `PRIMITIVE_TO_STORY`.
 * Anything else must have its own file matching the primitive name.
 *
 * Usage:
 *   node scripts/check-stories-parity.mjs        # fail on drift
 *   pnpm run check:stories-parity
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const PRIMITIVES_TS = join(rootDir, "src/components/primitives.ts");
const STORIES_ROOT = join(rootDir, "src/stories");
const PRIMITIVE_GROUPS = [
  "general",
  "layout",
  "data-display",
  "data-entry",
  "feedback",
  "navigation",
];

// Exports we never expect to map to a story file (helpers, hooks,
// toast emitter functions, lower-case utilities).
const NON_STORY_EXPORTS = new Set([
  "cn",
  "useRowGutter",
  "useFormContext",
  "toast",
]);

// Map each primitive name → the story file basename that documents
// it. Anything not in this map must have its own `<Name>.stories.tsx`
// in one of the canonical groups. Entries here capture the
// CO-DOCUMENTATION reality (one story file showcases several
// primitives) AND the consumer-facing aliases (e.g. consumers call
// the Sheet primitive a Drawer in their app).
const PRIMITIVE_TO_STORY = {
  // Layout — Row / Col / Space documented together with Flex.
  Row: "Flex",
  Col: "Flex",
  Space: "Flex",
  Flex: "Flex",
  // Input family — Textarea / InputPassword / InputSearch co-located
  // inside Input.stories.tsx.
  Input: "Input",
  Textarea: "Input",
  InputPassword: "Input",
  InputSearch: "Input",
  // Typography aliases.
  Typography: "Typography",
  Title: "Typography",
  Paragraph: "Typography",
  Text: "Typography",
  Link: "Typography",
  TypographyTitle: "Typography",
  TypographyParagraph: "Typography",
  TypographyText: "Typography",
  TypographyLink: "Typography",
  // Date/time pickers — all shown in DatePicker.stories.tsx; TimeInput
  // gets its own TimePicker.stories.tsx (consumer-facing name).
  DatePicker: "DatePicker",
  DateField: "DatePicker",
  DateRangePicker: "DatePicker",
  TimeField: "DatePicker",
  TimeInput: "TimePicker",
  // Steps + Step.
  Steps: "Steps",
  Step: "Steps",
  // IconButton — documented in Button.stories.tsx alongside Button.
  Button: "Button",
  IconButton: "Button",
  // Spinner — documented in Spin.stories.tsx (Ant-canonical name).
  Spinner: "Spin",
  // Toaster — documented across BOTH Message + Notification.stories
  // (two consumer-facing Sonner surfaces). Map the primitive to the
  // Message file; the sibling Notification file is whitelisted under
  // STORY_EXEMPT so the reverse check passes.
  Toaster: "Message",
  // Tooltip — merged SimpleTooltip into Tooltip primitive in v3.1
  // (cardinal rule 31 — no parallel convenience wrappers).
  Tooltip: "Tooltip",
  // Overlay aliases — consumer-facing story names differ from the
  // Radix-canonical primitive names.
  Sheet: "Drawer",
  Dialog: "Modal",
  DropdownMenu: "Dropdown",
  AlertDialog: "Popconfirm",
};

// Calendar exports come from a wildcard (`export * from
// "./calendar/index"`). The whole family ships in Calendar.stories.tsx.
const CALENDAR_RE = /^(Calendar|MiniMonth|EventBlock|TimeGrid|AvailabilityRow)/;

// Story files allowed to exist without a 1:1 primitive (consumer-side
// composites, helpers, layout primitives not yet in the barrel).
const STORY_EXEMPT = new Set([
  // Grid + Masonry are pre-barrel-export layout primitives — keep
  // until added to primitives.ts.
  "Grid",
  "Masonry",
  // Upload story documents the MediaUpload composite (which isn't in
  // the primitives barrel; it ships from `composites/upload`).
  "Upload",
  // Notification is a second story file for the Toaster primitive
  // (one Sonner-backed toast surface, two consumer-facing flavours).
  "Notification",
  // TableImportExport is a composite (TableImportFlow + TableExportDialog)
  // that ships from `composites/table-import-export`, not from
  // primitives.ts. Lives in data-display alongside Table for
  // Storybook proximity (canon ⑪).
  "TableImportExport",
]);

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
        if (NON_STORY_EXPORTS.has(name)) return;
        names.add(name);
      });
  }
  if (src.includes("./data-display/calendar/index")) {
    names.add("Calendar");
  }
  return names;
}

function readStoryFiles() {
  const stories = new Set();
  for (const group of PRIMITIVE_GROUPS) {
    const dir = join(STORIES_ROOT, group);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".stories.tsx")) continue;
      stories.add(file.replace(/\.stories\.tsx$/, ""));
    }
  }
  return stories;
}

function expectedStoryFor(primitive) {
  // Sub-exports of a family share the parent's story file. We treat
  // any name whose root matches a `<Family>` + suffix as belonging to
  // that family if `<Family>` is itself an exported primitive. This is
  // the "Card → Card header / Card body / …" pattern.
  if (PRIMITIVE_TO_STORY[primitive]) return PRIMITIVE_TO_STORY[primitive];
  if (CALENDAR_RE.test(primitive)) return "Calendar";
  return primitive;
}

function main() {
  if (!existsSync(PRIMITIVES_TS)) {
    console.error(`✗ primitives barrel not found at ${PRIMITIVES_TS}`);
    process.exit(2);
  }
  const exports = readPrimitiveExports();
  const stories = readStoryFiles();

  // Sub-export normalisation. Card header / Card body / Popover /
  // … don't ship their own story file — they're part
  // of the family's compositional API. We collapse them onto the
  // family root ONLY when (a) the name starts with another exported
  // primitive followed by an UPPERCASE letter (so "ColorPicker" with
  // "Col" prefix is NOT collapsed), AND (b) the full name doesn't
  // already have its own story file on disk.
  function familyRoot(name) {
    if (PRIMITIVE_TO_STORY[name]) return null;
    if (CALENDAR_RE.test(name) && name !== "Calendar") return null;
    // Prefer the OWN story file when it exists — TreeSelect /
    // InputNumber / ColorPicker live as their own primitives even
    // though they share a textual prefix with another primitive.
    if (stories.has(name)) return null;
    let best = null;
    for (const candidate of exports) {
      if (candidate === name) continue;
      if (!name.startsWith(candidate)) continue;
      const suffix = name.slice(candidate.length);
      if (!/^[A-Z]/.test(suffix)) continue; // ColorPicker / Col guard
      if (!best || candidate.length > best.length) best = candidate;
    }
    return best;
  }

  const violations = [];
  const required = new Set();
  for (const name of exports) {
    if (NON_STORY_EXPORTS.has(name)) continue;
    const expected = expectedStoryFor(name);
    if (expected !== name) {
      required.add(expected);
      continue;
    }
    const root = familyRoot(name);
    if (root) {
      required.add(expectedStoryFor(root));
      continue;
    }
    required.add(expected);
  }

  for (const story of required) {
    if (!stories.has(story)) {
      violations.push(
        `✗ primitive family requires "${story}.stories.tsx" but file is missing.`,
      );
    }
  }

  for (const base of stories) {
    if (STORY_EXEMPT.has(base)) continue;
    if (required.has(base)) continue;
    violations.push(
      `✗ story "${base}.stories.tsx" does not match any primitive in primitives.ts ` +
        `(add it to PRIMITIVE_TO_STORY or STORY_EXEMPT in check-stories-parity.mjs ` +
        `if this is intentional).`,
    );
  }

  if (violations.length === 0) {
    console.log(
      `✓ stories ↔ primitives parity: ${required.size} expected stories, ${stories.size} present.`,
    );
    process.exit(0);
  }

  console.error(
    `stories ↔ primitives parity: ${violations.length} violation(s)`,
  );
  for (const v of violations) console.error(v);
  process.exit(1);
}

main();
