import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataGrid } from "../data-grid";
import type { ColumnDef } from "../data-grid";

type Row = { id: string; partner: string };
const ROWS: Row[] = [
  { id: "INV-1", partner: "東京商事" },
  { id: "INV-2", partner: "大阪物産" },
  { id: "INV-3", partner: "京都製作所" },
];
const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "番号", enableHiding: false },
  { accessorKey: "partner", header: "取引先", meta: { label: "取引先" } },
];

function Grid(props: Partial<React.ComponentProps<typeof DataGrid<Row>>>) {
  return (
    <DataGrid
      columns={columns}
      data={ROWS}
      getRowId={(r) => r.id}
      manualFiltering={false}
      manualPagination={false}
      {...props}
    >
      {props.children}
    </DataGrid>
  );
}

describe("DataGrid.Search", () => {
  it("filters the visible rows through the global filter", async () => {
    const user = userEvent.setup();
    render(
      <Grid>
        <DataGrid.Search placeholder="検索" />
        <DataGrid.Content />
      </Grid>,
    );
    expect(screen.getByText("東京商事")).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("検索"), "京都");
    expect(screen.getByText("京都製作所")).toBeInTheDocument();
    expect(screen.queryByText("東京商事")).toBeNull();
  });
});

describe("DataGrid.ViewOptions", () => {
  it("toggles a hideable column off via the dropdown", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Grid>
        <DataGrid.Toolbar>
          <DataGrid.ViewOptions />
        </DataGrid.Toolbar>
        <DataGrid.Content />
      </Grid>,
    );
    expect(screen.getByText("東京商事")).toBeInTheDocument();
    const toolbar = container.querySelector(".ui-data-table-toolbar") as HTMLElement;
    await user.click(within(toolbar).getByRole("button")); // the view-options trigger
    // the menu lists hideable columns by their meta.label ("取引先"); 番号 is enableHiding:false
    const toggle = await screen.findByRole("menuitemcheckbox", { name: "取引先" });
    await user.click(toggle);
    expect(screen.queryByText("東京商事")).toBeNull(); // partner column hidden
    expect(screen.getByText("INV-1")).toBeInTheDocument(); // id still visible
  });
});

describe("DataGrid.BulkActions", () => {
  it("renders nothing until a row is selected, then exposes the count", async () => {
    const user = userEvent.setup();
    render(
      <Grid enableRowSelection>
        <DataGrid.Content />
        <DataGrid.BulkActions>{(count) => <span>選択 {count} 件</span>}</DataGrid.BulkActions>
      </Grid>,
    );
    expect(screen.queryByText(/選択/)).toBeNull();
    // first checkbox is select-all; pick a row checkbox
    const checks = screen.getAllByRole("checkbox");
    await user.click(checks[checks.length - 1]);
    expect(screen.getByText(/選択\s*1\s*件/)).toBeInTheDocument();
  });
});

describe("DataGrid.DensityToggle", () => {
  it("swaps the root density class on click", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Grid>
        <DataGrid.Toolbar>
          <DataGrid.DensityToggle />
        </DataGrid.Toolbar>
        <DataGrid.Content />
      </Grid>,
    );
    const root = container.querySelector(".ui-data-table-root")!;
    const before = root.className;
    const toolbar = container.querySelector(".ui-data-table-toolbar") as HTMLElement;
    await user.click(within(toolbar).getByRole("button"));
    expect(root.className).not.toBe(before);
  });
});
