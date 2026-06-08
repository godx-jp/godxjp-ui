import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataGrid } from "../data-grid";
import type { ColumnDef } from "../data-grid";

type Row = { id: string; partner: string };
const ROWS: Row[] = [{ id: "INV-1", partner: "東京商事" }];
const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "番号", enableHiding: false },
  {
    id: "act",
    header: "操作",
    cell: () => (
      <button type="button" data-testid="row-action">
        編集
      </button>
    ),
  },
];

describe("DataGrid — row keydown guards", () => {
  it("a non-Enter/Space key on the row does not fire onRowClick", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <DataGrid columns={columns} data={ROWS} getRowId={(r) => r.id} onRowClick={onRowClick} />,
    );
    const row = screen.getByText("INV-1").closest("tr")!;
    row.focus();
    await user.keyboard("a"); // not Enter/Space → guard returns
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("Enter on an in-cell control does not fire the row's onRowClick", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <DataGrid columns={columns} data={ROWS} getRowId={(r) => r.id} onRowClick={onRowClick} />,
    );
    screen.getByTestId("row-action").focus();
    await user.keyboard("{Enter}"); // e.target (button) !== e.currentTarget (row) → guard returns
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
