import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataGrid } from "../data-grid";
import type { ColumnDef } from "../data-grid";

type Row = { id: string; partner: string };

const ROWS: Row[] = Array.from({ length: 12 }, (_, i) => ({
  id: `INV-${i + 1}`,
  partner: `取引先${i + 1}`,
}));

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "番号", enableHiding: false },
  { accessorKey: "partner", header: "取引先" },
  {
    id: "actions",
    header: "",
    cell: () => (
      <button type="button" data-testid="row-action">
        詳細
      </button>
    ),
  },
];

function Grid(props: Partial<React.ComponentProps<typeof DataGrid<Row>>>) {
  return (
    <DataGrid
      columns={columns}
      data={ROWS}
      getRowId={(r) => r.id}
      manualPagination={false}
      {...props}
    >
      {props.children}
    </DataGrid>
  );
}

describe("DataGrid — row interaction", () => {
  it("loading shows the busy state and hides data rows", () => {
    const { container } = render(<Grid loading />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull();
    expect(screen.queryByText("取引先1")).toBeNull();
  });

  it("Enter and Space on a focused row activate onRowClick", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<Grid onRowClick={onRowClick} />);
    const row = screen.getByText("取引先1").closest("tr")!;
    row.focus();
    await user.keyboard("{Enter}");
    expect(onRowClick).toHaveBeenLastCalledWith(expect.objectContaining({ id: "INV-1" }));
    await user.keyboard("[Space]");
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  it("clicking an interactive cell control does NOT trigger the row click", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<Grid onRowClick={onRowClick} />);
    await user.click(screen.getAllByTestId("row-action")[0]);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe("DataGrid.Pagination", () => {
  it("next/previous page buttons walk the client-paginated rows", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Grid>
        <DataGrid.Content />
        <DataGrid.Pagination />
      </Grid>,
    );
    // page 1: first 10 rows — row 11 not yet rendered
    expect(screen.getByText("取引先1")).toBeInTheDocument();
    expect(screen.queryByText("取引先11")).toBeNull();

    // pagination renders prev then next; labels are locale-bound so select by order
    // (scoped to the pagination bar to exclude the per-row action buttons)
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
    render(
      <Grid>
        <DataGrid.Content />
        <DataGrid.Pagination pageSizeOptions={[10, 20]} />
      </Grid>,
    );
    expect(screen.queryByText("取引先11")).toBeNull(); // 10/page
    // the page-size Select is a combobox; open it and pick 20
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "20" }));
    // all 12 rows now fit on one page
    expect(screen.getByText("取引先11")).toBeInTheDocument();
    expect(screen.getByText("取引先12")).toBeInTheDocument();
  });
});
