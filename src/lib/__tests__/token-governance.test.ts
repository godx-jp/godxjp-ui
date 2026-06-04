import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "../..");

const LAYOUT_CSS_FILES = [
  "density.css",
  "layout.css",
  "control.css",
  "card-layout.css",
  "table-layout.css",
  "dialog-layout.css",
  "alert-layout.css",
  "badge-layout.css",
];

/** Components fully on data-slot + *-layout.css — must stay free of Tailwind spacing utilities. */
const MIGRATED_LAYOUT_COMPONENTS = [
  "components/data-display/table.tsx",
  "components/data-display/empty-state.tsx",
  "components/data-display/badge.tsx",
  "components/data-display/data-table.tsx",
  "components/feedback/dialog.tsx",
  "components/feedback/alert.tsx",
  "components/data-display/card.tsx",
];

/** Pending migration — tracked separately; do not add new files without a layout owner. */
const SPACING_UTILITY_ALLOWLIST = new Set([
  "search-select.tsx",
  "tooltip.tsx",
  "calendar.tsx",
  "command.tsx",
  "upload.tsx",
  "upload-crop-dialog.tsx",
  "cascader.tsx",
  "tree-select.tsx",
  "transfer.tsx",
  "time-picker.tsx",
  "tabs.tsx",
  "tabs.tsx",
  "steps.tsx",
  "sheet.tsx",
  "dropdown-menu.tsx",
  "pagination.tsx",
  "skeleton.tsx",
  "field.tsx",
  "radio.tsx",
  "color-picker.tsx",
  "autocomplete.tsx",
  "date-range-picker.tsx",
  "locale-picker.tsx",
  "timezone-picker.tsx",
  "date-format-picker.tsx",
  "query-refetch-button.tsx",
  "descriptions.tsx",
  "card.tsx", // StatCard title uses text-2xl override (value typography)
  "button.tsx", // size variants use token-backed arbitrary lengths
]);

const FORBIDDEN_IN_COMPONENTS =
  /\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)\b/;

const FORBIDDEN_RAW_COLORS =
  /\b(text|bg|border)-(emerald|red|green|blue|yellow|orange|pink|purple|gray|slate|zinc|neutral|stone|amber|lime|teal|cyan|indigo|violet|fuchsia|rose)-/;

function walkComponents(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkComponents(full));
    } else if (entry.endsWith(".tsx") && !entry.endsWith(".test.tsx")) {
      out.push(full);
    }
  }
  return out;
}

describe("token governance", () => {
  const base = readFileSync(join(root, "tokens/base.css"), "utf8");
  const tokenCss = [
    base,
    readFileSync(join(root, "tokens/foundation.css"), "utf8"),
    readFileSync(join(root, "tokens/semantic/layout.css"), "utf8"),
    readFileSync(join(root, "tokens/components/control.css"), "utf8"),
    readFileSync(join(root, "tokens/components/card.css"), "utf8"),
    readFileSync(join(root, "tokens/components/table.css"), "utf8"),
    readFileSync(join(root, "tokens/components/feedback.css"), "utf8"),
    readFileSync(join(root, "tokens/components/badge.css"), "utf8"),
  ].join("\n");

  it("imports all layout CSS owners from index.css", () => {
    const index = readFileSync(join(root, "styles/index.css"), "utf8");
    for (const file of LAYOUT_CSS_FILES) {
      expect(index, `missing @import ./${file}`).toContain(`@import "./${file}"`);
    }
    expect(index).not.toContain(".ui-stack-md {");
    expect(index).not.toContain('[data-slot="card-header"]');
  });

  it("uses base.css as the token manifest", () => {
    for (const file of [
      "foundation.css",
      "semantic/layout.css",
      "components/control.css",
      "components/card.css",
      "components/table.css",
      "components/feedback.css",
      "components/badge.css",
    ]) {
      expect(base).toContain(`@import "./${file}"`);
    }
  });

  it("defines component slot tokens in the token graph", () => {
    for (const token of [
      "--dialog-space-inset",
      "--alert-space-inset",
      "--table-cell-space-x",
      "--badge-space-x",
      "--card-title-font-size",
      "--control-height-default",
    ]) {
      expect(tokenCss).toContain(token);
    }
  });

  it("keeps migrated components free of Tailwind spacing utilities", () => {
    const violations: string[] = [];

    for (const relative of MIGRATED_LAYOUT_COMPONENTS) {
      const src = readFileSync(join(root, relative), "utf8");
      if (FORBIDDEN_IN_COMPONENTS.test(src)) {
        violations.push(relative.split("/").pop()!);
      }
    }

    expect(violations, `move spacing to *-layout.css: ${violations.join(", ")}`).toEqual([]);
  });

  it("keeps non-allowlisted components on migration track (informational cap)", () => {
    const componentsDir = join(root, "components");
    const pending: string[] = [];

    for (const file of walkComponents(componentsDir)) {
      const name = file.split("/").pop()!;
      const relative = file.slice(root.length + 1);
      if (MIGRATED_LAYOUT_COMPONENTS.some((m) => relative.endsWith(m.replace(/^components\//, ""))))
        continue;
      if (SPACING_UTILITY_ALLOWLIST.has(name)) continue;

      const src = readFileSync(file, "utf8");
      if (FORBIDDEN_IN_COMPONENTS.test(src)) {
        pending.push(name);
      }
    }

    expect(pending.length, `pending layout migration: ${pending.join(", ")}`).toBeLessThan(30);
  });

  it("keeps migrated components free of raw Tailwind palette colors", () => {
    const violations: string[] = [];

    for (const relative of MIGRATED_LAYOUT_COMPONENTS) {
      if (relative.endsWith("card.tsx")) continue;
      const src = readFileSync(join(root, relative), "utf8");
      if (FORBIDDEN_RAW_COLORS.test(src)) {
        violations.push(relative.split("/").pop()!);
      }
    }

    expect(violations, `use semantic tokens: ${violations.join(", ")}`).toEqual([]);
  });

  it("legacy scan — non-migrated must not grow unbounded", () => {
    const componentsDir = join(root, "components");
    const violations: string[] = [];

    for (const file of walkComponents(componentsDir)) {
      const name = file.split("/").pop()!;
      if (SPACING_UTILITY_ALLOWLIST.has(name)) continue;

      const src = readFileSync(file, "utf8");
      if (FORBIDDEN_RAW_COLORS.test(src)) {
        violations.push(name);
      }
    }

    expect(violations.length).toBeLessThan(15);
  });
});
