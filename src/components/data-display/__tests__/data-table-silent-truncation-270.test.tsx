import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithUi } from "@/test/render";

import { DataTable, type ColumnDef } from "../data-table";

/**
 * gh#270 — the internal TanStack pagination default (pageSize 10) used to slice
 * EVERY plain `data`+`columns` table to 10 rows even when no
 * `<DataTable.Pagination>` was composed and no pagination props were passed:
 * rows 11+ were unreachable, with no pager UI and no warning (a silent cap).
 * Client pagination must engage ONLY when something drives it — a numbered
 * pager child, or controlled `pagination`/`onPaginationChange` state.
 */

type Row = { id: string; partner: string };
const columns: ColumnDef<Row>[] = [
  { key: "id", header: "番号", enableHiding: false },
  { key: "partner", header: "取引先" },
];
const make = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `INV-${i + 1}`, partner: `取引先${i + 1}` }));

const dataRowCount = () => screen.getAllByRole("row").length - 1; // minus header row

describe("DataTable — no silent 10-row cap (gh#270)", () => {
  it("renders EVERY row when no pager is composed and pagination is uncontrolled", () => {
    renderWithUi(<DataTable data={make(26)} columns={[...columns]} getRowId={(r) => r.id} />);

    expect(dataRowCount()).toBe(26);
    expect(screen.getByText("INV-26")).toBeInTheDocument();
  });

  it("still slices to the default page size when a numbered pager is composed", () => {
    renderWithUi(
      <DataTable data={make(26)} columns={[...columns]} getRowId={(r) => r.id}>
        <DataTable.Pagination />
      </DataTable>,
    );

    expect(dataRowCount()).toBe(10);
    expect(screen.queryByText("INV-11")).not.toBeInTheDocument();
  });

  it("never client-slices in cursor mode (server pages arrive pre-sliced)", () => {
    renderWithUi(
      <DataTable data={make(15)} columns={[...columns]} getRowId={(r) => r.id}>
        <DataTable.Pagination cursor="cur-1" hasMore onChange={vi.fn()} />
      </DataTable>,
    );

    expect(dataRowCount()).toBe(15);
    expect(screen.getByText("INV-15")).toBeInTheDocument();
  });

  it("slices per the controlled pagination state when supplied without a pager child", () => {
    renderWithUi(
      <DataTable
        data={make(26)}
        columns={[...columns]}
        getRowId={(r) => r.id}
        pagination={{ pageIndex: 1, pageSize: 5 }}
        onPaginationChange={vi.fn()}
      />,
    );

    expect(dataRowCount()).toBe(5);
    expect(screen.getByText("INV-6")).toBeInTheDocument();
    expect(screen.queryByText("INV-1")).not.toBeInTheDocument();
  });
});
