import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";
import { DataTable } from "../data-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

/**
 * Structural selectors in table-layout.css run against really rendered DOM
 * (src/test/css-selector.ts). The sort-label `> :last-child` rule has its own
 * dedicated coverage in data-table-header-align.test.tsx; the flush-card
 * bordered rule in card-table.test.tsx (gh#305).
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
  it("zebra stripe hits even body rows and spares a selected one", () => {
    const selector = ruleSelector(css, "[data-striped] tbody tr:nth-child(even)");
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

    // Selection wins over the stripe. The attribute is what DataTable's row
    // emits for a selected row — simulated here at the DOM level, which is
    // the level this selector reads.
    bodyRows[1].setAttribute("data-state", "selected");
    expect(bodyRows[1].matches(selector)).toBe(false);
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
        `[data-collapse-below="${bp}"] [data-slot="table"]:has([data-slot="table-head"]:nth-child(7))`,
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
