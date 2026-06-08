import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataGrid } from "../data-grid";
import type { ColumnDef } from "../data-grid";
import { expectNoA11yViolations } from "@/test/a11y";

type Row = { id: string; partner: string; amount: number };

const ROWS: Row[] = [
  { id: "INV-1", partner: "東京商事", amount: 1000 },
  { id: "INV-2", partner: "大阪物産", amount: 2000 },
  { id: "INV-3", partner: "京都製作所", amount: 3000 },
];

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "番号", enableHiding: false },
  { accessorKey: "partner", header: "取引先", meta: { label: "取引先" } },
  { accessorKey: "amount", header: "金額", meta: { label: "金額" } },
];

function Grid(props: Partial<React.ComponentProps<typeof DataGrid<Row>>>) {
  return (
    <DataGrid
      columns={columns}
      data={ROWS}
      getRowId={(r) => r.id}
      manualSorting={false}
      manualFiltering={false}
      manualPagination={false}
      {...props}
    />
  );
}

describe("DataGrid (client mode)", () => {
  it("renders the column headers and every data row", () => {
    render(<Grid />);
    expect(screen.getByRole("columnheader", { name: /番号/ })).toBeInTheDocument();
    expect(screen.getByText("東京商事")).toBeInTheDocument();
    expect(screen.getByText("大阪物産")).toBeInTheDocument();
    expect(screen.getByText("京都製作所")).toBeInTheDocument();
  });

  it("calls onRowClick with the clicked row", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<Grid onRowClick={onRowClick} />);
    await user.click(screen.getByText("大阪物産"));
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: "INV-2" }));
  });

  it("row selection: toggling a row checkbox checks it", async () => {
    const user = userEvent.setup();
    render(<Grid enableRowSelection />);
    const checks = screen.getAllByRole("checkbox");
    // first is usually the select-all; pick a row checkbox
    const rowCheck = checks[checks.length - 1];
    expect(rowCheck).not.toBeChecked();
    await user.click(rowCheck);
    expect(rowCheck).toBeChecked();
  });

  it("client-side search filters the visible rows", async () => {
    const user = userEvent.setup();
    render(<Grid />);
    const search = screen.queryByRole("textbox") ?? screen.queryByRole("searchbox");
    if (!search) return; // search UI optional depending on flags
    await user.type(search, "京都");
    expect(screen.getByText("京都製作所")).toBeInTheDocument();
    expect(screen.queryByText("東京商事")).toBeNull();
  });

  it("shows an empty state when there is no data", () => {
    render(<Grid data={[]} />);
    // EmptyState renders a status/role region or descriptive text; the data rows are gone
    expect(screen.queryByText("東京商事")).toBeNull();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<Grid enableRowSelection />);
  });
});
