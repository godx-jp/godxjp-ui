import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";
import { DataTable } from "../data-table";
import type { TableColumnPriorityProp } from "@/props/vocabulary";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

/**
 * Structural selectors in table-layout.css run against really rendered DOM
 * (src/test/css-selector.ts). The sort-label `> :last-child` rule has its own
 * dedicated coverage in data-table-header-align.test.tsx; the flush-card
 * bordered rule in card-table.test.tsx.
 */
const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/table-layout.css"),
  "utf8",
);

const rows = [
  { id: 1, name: "a" },
  { id: 2, name: "b" },
  { id: 3, name: "c" },
];

describe("table-layout.css structural selectors select the rendered DOM", () => {
  it("zebra stripe hits even body rows (gh#700 — selection wins by LAYER, see table-striped-700)", () => {
    const selector = ruleSelector(
      css,
      ':where([data-slot="table"] > tbody > tr:nth-child(even of :not([data-expanded-row]))) {',
    );
    const { container } = renderWithUi(
      <DataTable
        data={rows}
        striped
        getRowId={(row) => String(row.id)}
        columns={[{ key: "name", header: "Name" }]}
      />,
    );

    const bodyRows = [...container.querySelectorAll("tbody tr")];
    expect(bodyRows).toHaveLength(3);
    expect(bodyRows[0].matches(selector)).toBe(false);
    expect(bodyRows[1].matches(selector)).toBe(true);
    expect(bodyRows[2].matches(selector)).toBe(false);
  });

  it("bordered column rules stop before the last column", () => {
    const selector = ruleSelector(
      css,
      '.ui-table-bordered :is([data-slot="table-head"], [data-slot="table-cell"]):not(:last-child)',
    );
    const { container } = renderWithUi(
      <Table bordered>
        <TableHeader>
          <TableRow>
            <TableHead>one</TableHead>
            <TableHead>two</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>a1</TableCell>
            <TableCell>a2</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const heads = [...container.querySelectorAll("th")];
    const cells = [...container.querySelectorAll("td")];
    expect(heads[0].matches(selector)).toBe(true);
    expect(heads[1].matches(selector)).toBe(false);
    expect(cells[0].matches(selector)).toBe(true);
    expect(cells[1].matches(selector)).toBe(false);
  });

  it.each(["sm", "md", "lg", "xl"] as const)(
    "action-collection floor tier engages at seven columns (collapseBelow=%s)",
    (bp) => {
      const selector = ruleSelector(
        css,
        `[data-collapse-below="${bp}"] [data-slot="table"]:has(`,
      );
      const header = (count: number) => (
        <TableHeader>
          <TableRow>
            {Array.from({ length: count }, (_, i) => (
              <TableHead key={i}>c{i}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
      );
      const { container } = renderWithUi(
        <>
          <div data-testid="seven">
            <Table preset="action-collection" collapseBelow={bp}>
              {header(7)}
            </Table>
          </div>
          <div data-testid="six">
            <Table preset="action-collection" collapseBelow={bp}>
              {header(6)}
            </Table>
          </div>
        </>,
      );

      const table = (id: string) => container.querySelector(`[data-testid="${id}"] table`)!;
      expect(table("seven").matches(selector)).toBe(true);
      expect(table("six").matches(selector)).toBe(false);
    },
  );

  /**
   * gh#844 — the column count was never the variable. The compact measures are PER-COLUMN
   * percentages, so a five-column queue that repeats one tier over-subscribes the budget exactly
   * as a ten-column one does, and the surplus comes out of the `auto` free-text column: measured
   * at 390 in a 340px card, 1.9 CJK characters per line. The floor tier has to engage on the
   * repetition, not on the count — and a budget-shaped queue must still not match, or the gh#253
   * canonical queue loses its scroll-free frame.
   */
  it.each(["sm", "md", "lg", "xl"] as const)(
    "action-collection floor tier engages on a REPEATED tier at five columns (collapseBelow=%s)",
    (bp) => {
      const selector = ruleSelector(
        css,
        `[data-collapse-below="${bp}"] [data-slot="table"]:has(`,
      );
      const queue = (priorities: (TableColumnPriorityProp | undefined)[]) => (
        <Table preset="action-collection" collapseBelow={bp}>
          <TableHeader>
            <TableRow>
              {priorities.map((priority, i) => (
                <TableHead key={i} priority={priority} scope="col">
                  c{i}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
      );
      const { container } = renderWithUi(
        <>
          {/* The reporter's queue: 時刻 · 実行者 · 操作 · 対象 · 結果 — `meta` twice. */}
          <div data-testid="repeat-meta">
            {queue(["meta", "primary", undefined, "secondary", "meta"])}
          </div>
          <div data-testid="repeat-secondary">
            {queue(["secondary", "primary", undefined, "secondary", "meta"])}
          </div>
          <div data-testid="repeat-primary">
            {queue(["primary", "primary", undefined, "secondary", "meta"])}
          </div>
          {/* The gh#253 canonical queue — one column per tier, one free-text column. */}
          <div data-testid="budget-shaped">
            {queue(["primary", "secondary", undefined, "meta", "actions"])}
          </div>
          {/* `actions` is already an absolute measure, so repeating it is not over-subscription. */}
          <div data-testid="repeat-actions">
            {queue(["actions", "primary", undefined, "meta", "actions"])}
          </div>
        </>,
      );

      const table = (id: string) => container.querySelector(`[data-testid="${id}"] table`)!;
      expect(table("repeat-meta").matches(selector)).toBe(true);
      expect(table("repeat-secondary").matches(selector)).toBe(true);
      expect(table("repeat-primary").matches(selector)).toBe(true);
      expect(table("budget-shaped").matches(selector)).toBe(false);
      expect(table("repeat-actions").matches(selector)).toBe(false);
    },
  );

  it.each(["sm", "md", "lg", "xl"] as const)(
    "stacked cards drop the trailing gap on the last row only (collapseBelow=%s)",
    (bp) => {
      const selector = ruleSelector(css, `[data-collapse-below="${bp}"] .ui-table-row:last-child`);
      const { container } = renderWithUi(
        <Table preset="stacked-record-collection" collapseBelow={bp}>
          <TableBody>
            <TableRow>
              <TableCell>a</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>b</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      const bodyRows = [...container.querySelectorAll("tbody tr")];
      expect(bodyRows[0].matches(selector)).toBe(false);
      expect(bodyRows[1].matches(selector)).toBe(true);
    },
  );
});
