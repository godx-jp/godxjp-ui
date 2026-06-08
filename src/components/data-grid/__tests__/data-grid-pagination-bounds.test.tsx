import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataGrid } from "../data-grid";
import type { ColumnDef } from "../data-grid";

type Row = { id: string; partner: string };
const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "番号", enableHiding: false },
  { accessorKey: "partner", header: "取引先" },
];
const make = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `INV-${i + 1}`, partner: `取引先${i + 1}` }));

function Grid(rows: Row[]) {
  return render(
    <DataGrid columns={columns} data={rows} getRowId={(r) => r.id} manualPagination={false}>
      <DataGrid.Content />
      <DataGrid.Pagination />
    </DataGrid>,
  );
}

describe("DataGrid.Pagination — bounds", () => {
  it("disables both prev and next on a single page", () => {
    const { container } = Grid(make(3)); // 3 rows < pageSize 10 → 1 page
    const pager = container.querySelector(".ui-data-table-pagination") as HTMLElement;
    const [prev, next] = within(pager).getAllByRole("button");
    expect(prev).toBeDisabled();
    expect(next).toBeDisabled();
  });

  it("disables next once the last page is reached", async () => {
    const user = userEvent.setup();
    const { container } = Grid(make(12)); // 2 pages
    const pager = container.querySelector(".ui-data-table-pagination") as HTMLElement;
    const [prev, next] = within(pager).getAllByRole("button");
    expect(prev).toBeDisabled(); // page 1
    expect(next).toBeEnabled();
    await user.click(next); // → page 2 (last)
    expect(within(pager).getAllByRole("button")[1]).toBeDisabled(); // next now disabled
    expect(within(pager).getAllByRole("button")[0]).toBeEnabled(); // prev now enabled
    expect(screen.getByText("取引先11")).toBeInTheDocument();
  });
});
