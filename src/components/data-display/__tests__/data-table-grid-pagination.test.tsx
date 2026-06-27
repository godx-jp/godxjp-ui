import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUi } from "@/test/render";

import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; partner: string };
const columns: ColumnDef<Row>[] = [
  { key: "id", header: "番号", enableHiding: false },
  { key: "partner", header: "取引先" },
];
const make = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `INV-${i + 1}`, partner: `取引先${i + 1}` }));

function NumberedGrid(rows: Row[], pageSizeOptions?: number[]) {
  return render(
    <DataTable columns={columns} data={rows} getRowId={(r) => r.id}>
      <DataTable.Content />
      <DataTable.Pagination pageSizeOptions={pageSizeOptions} />
    </DataTable>,
  );
}

describe("DataTable.Pagination — numbered (client) mode", () => {
  it("next/previous page buttons walk the client-paginated rows", async () => {
    const user = userEvent.setup();
    const { container } = NumberedGrid(make(12));
    // page 1: first 10 rows — row 11 not yet rendered
    expect(screen.getByText("取引先1")).toBeInTheDocument();
    expect(screen.queryByText("取引先11")).toBeNull();

    const pager = container.querySelector(".ui-data-table-pagination") as HTMLElement;
    const [prev, next] = within(pager).getAllByRole("button");
    expect(prev).toBeDisabled(); // first page
    await user.click(next);
    expect(screen.getByText("取引先11")).toBeInTheDocument();
    expect(screen.queryByText("取引先1")).toBeNull();

    await user.click(prev);
    expect(screen.getByText("取引先1")).toBeInTheDocument();
  });

  it("changing the page size re-pages the grid", async () => {
    const user = userEvent.setup();
    NumberedGrid(make(12), [10, 20]);
    expect(screen.queryByText("取引先11")).toBeNull(); // 10/page
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "20" }));
    expect(screen.getByText("取引先11")).toBeInTheDocument();
    expect(screen.getByText("取引先12")).toBeInTheDocument();
  });

  it("disables both prev and next on a single page", () => {
    const { container } = NumberedGrid(make(3)); // 3 rows < pageSize 10 → 1 page
    const pager = container.querySelector(".ui-data-table-pagination") as HTMLElement;
    const [prev, next] = within(pager).getAllByRole("button");
    expect(prev).toBeDisabled();
    expect(next).toBeDisabled();
  });

  it("disables next once the last page is reached", async () => {
    const user = userEvent.setup();
    const { container } = NumberedGrid(make(12)); // 2 pages
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

describe("DataTable.Pagination — manual (server) mode", () => {
  it("the next-page control delegates to onPaginationChange", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();
    renderWithUi(
      <DataTable
        columns={columns}
        data={make(2)}
        getRowId={(r) => r.id}
        manualPagination
        rowCount={100}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        onPaginationChange={onPaginationChange}
      >
        <DataTable.Pagination />
      </DataTable>,
    );
    // at page 0 prev is disabled and next is enabled — the only enabled non-combobox button is "next"
    const nextBtn = screen
      .getAllByRole("button")
      .find((b) => b.getAttribute("role") !== "combobox" && !(b as HTMLButtonElement).disabled);
    expect(nextBtn).toBeTruthy();
    await user.click(nextBtn!);
    expect(onPaginationChange).toHaveBeenCalled();
  });
});
