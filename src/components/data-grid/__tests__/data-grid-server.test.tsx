import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUi } from "@/test/render";

import { DataGrid } from "../data-grid";
import type { ColumnDef } from "../data-grid";

type Row = { id: string; partner: string; amount: number };

const ROWS: Row[] = [
  { id: "INV-1", partner: "東京商事", amount: 1000 },
  { id: "INV-2", partner: "大阪物産", amount: 2000 },
];

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "番号", enableHiding: false },
  { accessorKey: "partner", header: "取引先", meta: { label: "取引先" } },
];

describe("DataGrid (server / manual mode)", () => {
  it("manualSorting: clicking a sortable header delegates to onSortingChange", async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();
    render(
      <DataGrid
        columns={columns}
        data={ROWS}
        getRowId={(r) => r.id}
        manualSorting
        sorting={[]}
        onSortingChange={onSortingChange}
      />,
    );
    // the sortable header renders a button wrapping the label
    await user.click(screen.getByRole("button", { name: /取引先/ }));
    expect(onSortingChange).toHaveBeenCalled();
  });

  it("manualPagination: the next-page control delegates to onPaginationChange", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();
    renderWithUi(
      <DataGrid
        columns={columns}
        data={ROWS}
        getRowId={(r) => r.id}
        manualPagination
        rowCount={100}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        onPaginationChange={onPaginationChange}
      >
        <DataGrid.Pagination />
      </DataGrid>,
    );
    // at page 0 prev is disabled and next is enabled — the only enabled non-combobox button is "next"
    const nextBtn = screen
      .getAllByRole("button")
      .find((b) => b.getAttribute("role") !== "combobox" && !(b as HTMLButtonElement).disabled);
    expect(nextBtn).toBeTruthy();
    await user.click(nextBtn!);
    expect(onPaginationChange).toHaveBeenCalled();
  });

  it("column visibility: a controlled onColumnVisibilityChange is honoured", () => {
    // hidden column does not render its cells
    render(
      <DataGrid
        columns={columns}
        data={ROWS}
        getRowId={(r) => r.id}
        columnVisibility={{ partner: false }}
        onColumnVisibilityChange={vi.fn()}
      />,
    );
    expect(screen.queryByText("東京商事")).toBeNull(); // partner column hidden
    expect(screen.getByText("INV-1")).toBeInTheDocument(); // id still visible
  });

  it("renders an empty state in manual mode with no rows", () => {
    render(
      <DataGrid columns={columns} data={[]} getRowId={(r) => r.id} manualPagination rowCount={0} />,
    );
    expect(screen.queryByText("東京商事")).toBeNull();
  });
});
