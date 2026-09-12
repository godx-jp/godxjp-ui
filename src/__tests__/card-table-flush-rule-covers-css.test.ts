import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * gh#611 — `card-table-needs-flush` matched `<DataTable>` and `<Table>` but not `SkeletonTable`,
 * so a consumer writing the table and its own skeleton side by side got **one** finding:
 *
 *     <Card><CardContent><DataTable …/></CardContent></Card>        → flagged
 *     <Card><CardContent><SkeletonTable …/></CardContent></Card>    → silent
 *
 * The silent half is the worse half: `SkeletonTable` is the package's OWN stand-in for
 * `DataTable`, so the rule was quiet in exactly the place a consumer copies the shape.
 *
 * WHAT THIS TEST LOCKS, and why it is not just "SkeletonTable is in the list". The package's
 * stylesheet already carried a per-pair exception under
 * `[data-slot="card-content"][data-flush]` for every component that needs flush to reach it —
 * that exception IS the statement that the pair matters. So the audit alternation is derived from
 * the stylesheet, and this test checks the two against each other: adding a component to that CSS
 * block without adding it to the rule reopens gh#611, and the failure names the component.
 */

const root = process.cwd();
const audit = readFileSync(join(root, "scripts/ui-audit.mjs"), "utf8");
const alertLayout = readFileSync(join(root, "src/styles/alert-layout.css"), "utf8");
const tableLayout = readFileSync(join(root, "src/styles/table-layout.css"), "utf8");
const cardLayout = readFileSync(join(root, "src/styles/card-layout.css"), "utf8");

/** Which component each flush-scoped class belongs to. A new class needs a row here. */
const CLASS_OWNER: Record<string, string> = {
  "ui-data-table-root": "DataTable",
  "ui-data-table-scroll": "DataTable",
  "ui-data-table-surface": "DataTable",
  "ui-data-table-toolbar": "DataTable",
  "ui-skeleton-table": "SkeletonTable",
  "ui-table-bordered": "Table", // `<Table bordered>` — table.tsx
};

function alternation(): string[] {
  const match = /<\(\?:([A-Za-z|]+)\)\\\\b`/.exec(audit) ?? /\(\?:([A-Za-z|]+)\)\\\\b/.exec(audit);
  expect(match, "CARD_TABLE_FLUSH alternation not found in ui-audit.mjs").not.toBeNull();
  return match![1]!.split("|");
}

/** Classes the stylesheets special-case under a flush card body. */
function flushScopedClasses(): string[] {
  const css = [alertLayout, tableLayout, cardLayout].join("\n");
  const found = new Set<string>();
  for (const rule of css.matchAll(
    /\[data-slot="card-content"\]\[data-flush\][^{]*\{/g,
  )) {
    for (const cls of rule[0].matchAll(/\.(ui-[a-z-]+)/g)) found.add(cls[1]!);
  }
  return [...found].sort();
}

describe("card-table-needs-flush covers what the CSS special-cases (gh#611)", () => {
  it("finds a non-empty alternation and a non-empty CSS set — neither may be vacuous", () => {
    expect(alternation().length).toBeGreaterThan(1);
    expect(flushScopedClasses().length).toBeGreaterThan(1);
  });

  it("every component with a flush CSS exception is in the rule", () => {
    const rule = new Set(alternation());
    const missing = flushScopedClasses()
      .map((cls) => CLASS_OWNER[cls])
      .filter((owner): owner is string => Boolean(owner))
      .filter((owner) => !rule.has(owner));

    expect(
      [...new Set(missing)],
      "these have a flush exception in CSS but the audit rule stays silent about them",
    ).toEqual([]);
  });

  it("every flush-scoped class is attributed — an unknown one must not pass unnoticed", () => {
    // Without this, adding `.ui-widget-table` to the CSS block and forgetting the rule would go
    // through as "no owner, nothing to check" — the same silence gh#611 was.
    const unattributed = flushScopedClasses().filter((cls) => !(cls in CLASS_OWNER));
    expect(unattributed, "add a CLASS_OWNER row naming the component that emits this").toEqual([]);
  });

  it("SkeletonTable specifically — the one gh#611 reported", () => {
    expect(alternation()).toContain("SkeletonTable");
  });
});
