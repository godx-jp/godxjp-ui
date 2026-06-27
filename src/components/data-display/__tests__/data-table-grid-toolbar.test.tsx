import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; partner: string };
const ROWS: Row[] = [
  { id: "INV-1", partner: "東京商事" },
  { id: "INV-2", partner: "大阪物産" },
  { id: "INV-3", partner: "京都製作所" },
];
const columns: ColumnDef<Row>[] = [
  { key: "id", header: "番号", enableHiding: false },
  { key: "partner", header: "取引先" },
];

function Grid(props: Partial<React.ComponentProps<typeof DataTable<Row>>>) {
  return (
    <DataTable columns={columns} data={ROWS} getRowId={(r) => r.id} {...props}>
      {props.children}
    </DataTable>
  );
}

describe("DataTable.Search (global filter)", () => {
  it("filters the visible rows through the global filter", async () => {
    const user = userEvent.setup();
    render(
      <Grid>
        <DataTable.Search placeholder="検索" />
        <DataTable.Content />
      </Grid>,
    );
    expect(screen.getByText("東京商事")).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("検索"), "京都");
    expect(screen.getByText("京都製作所")).toBeInTheDocument();
    expect(screen.queryByText("東京商事")).toBeNull();
  });
});

describe("DataTable.ViewOptions", () => {
  it("toggles a hideable column off via the dropdown", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Grid>
        <DataTable.Toolbar>
          <DataTable.ViewOptions />
        </DataTable.Toolbar>
        <DataTable.Content />
      </Grid>,
    );
    expect(screen.getByText("東京商事")).toBeInTheDocument();
    const toolbar = container.querySelector(".ui-data-table-toolbar") as HTMLElement;
    await user.click(within(toolbar).getByRole("button")); // the view-options trigger
    // the menu lists hideable columns by their string header ("取引先"); 番号 is enableHiding:false
    const toggle = await screen.findByRole("menuitemcheckbox", { name: "取引先" });
    await user.click(toggle);
    expect(screen.queryByText("東京商事")).toBeNull(); // partner column hidden
    expect(screen.getByText("INV-1")).toBeInTheDocument(); // id still visible
  });

  it("labels a hideable column by its id when the header is not a string", async () => {
    const user = userEvent.setup();
    const jsxCols: ColumnDef<Row>[] = [
      { key: "id", header: "番号", enableHiding: false },
      { key: "partner_col", header: <span>取引先</span>, render: (r) => r.partner },
    ];
    const { container } = render(
      <DataTable columns={jsxCols} data={ROWS} getRowId={(r) => r.id}>
        <DataTable.Toolbar>
          <DataTable.ViewOptions />
        </DataTable.Toolbar>
        <DataTable.Content />
      </DataTable>,
    );
    const toolbar = container.querySelector(".ui-data-table-toolbar") as HTMLElement;
    await user.click(within(toolbar).getByRole("button"));
    // header is JSX → columnLabel falls back to the column key
    expect(
      await screen.findByRole("menuitemcheckbox", { name: "partner_col" }),
    ).toBeInTheDocument();
  });
});

describe("DataTable.BulkActions (render-prop form)", () => {
  it("renders nothing until a row is selected, then exposes the count", async () => {
    const user = userEvent.setup();
    render(
      <Grid selectable>
        <DataTable.Content />
        <DataTable.BulkActions>{(count) => <span>選択 {count} 件</span>}</DataTable.BulkActions>
      </Grid>,
    );
    expect(screen.queryByText(/選択/)).toBeNull();
    // first checkbox is select-all; pick a row checkbox
    const checks = screen.getAllByRole("checkbox");
    await user.click(checks[checks.length - 1]);
    expect(screen.getByText(/選択\s*1\s*件/)).toBeInTheDocument();
  });
});

describe("DataTable.DensityToggle", () => {
  it("swaps the root density class on click", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Grid>
        <DataTable.Toolbar>
          <DataTable.DensityToggle />
        </DataTable.Toolbar>
        <DataTable.Content />
      </Grid>,
    );
    const root = container.querySelector(".ui-data-table-root")!;
    const before = root.className;
    const toolbar = container.querySelector(".ui-data-table-toolbar") as HTMLElement;
    await user.click(within(toolbar).getByRole("button"));
    expect(root.className).not.toBe(before);
  });
});
