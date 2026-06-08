import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataGrid } from "../data-grid";
import type { ColumnDef } from "../data-grid";

type Row = { id: string; partner: string };
const ROWS: Row[] = [
  { id: "INV-1", partner: "東京商事" },
  { id: "INV-2", partner: "大阪物産" },
];
// `partner` has a STRING header and NO meta.label → exercises columnLabel's header fallback
const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "番号", enableHiding: false },
  { accessorKey: "partner", header: "取引先" },
];

describe("DataGrid — row selection header", () => {
  it("select-all goes indeterminate for a partial selection then checks all", async () => {
    const user = userEvent.setup();
    render(
      <DataGrid columns={columns} data={ROWS} getRowId={(r) => r.id} enableRowSelection>
        <DataGrid.Content />
      </DataGrid>,
    );
    const checks = screen.getAllByRole("checkbox"); // [select-all, row1, row2]
    await user.click(checks[1]); // select one row
    expect(checks[0]).toHaveAttribute("aria-checked", "mixed"); // some selected → indeterminate

    await user.click(checks[0]); // toggle all on
    expect(checks[1]).toBeChecked();
    expect(checks[2]).toBeChecked();
  });
});

describe("DataGrid.ViewOptions — column label fallback", () => {
  it("labels a hideable column by its string header when there is no meta.label", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DataGrid columns={columns} data={ROWS} getRowId={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.ViewOptions />
        </DataGrid.Toolbar>
        <DataGrid.Content />
      </DataGrid>,
    );
    const toolbar = container.querySelector(".ui-data-table-toolbar") as HTMLElement;
    await user.click(within(toolbar).getByRole("button"));
    // 取引先 has no meta.label → columnLabel falls back to the string header
    expect(await screen.findByRole("menuitemcheckbox", { name: "取引先" })).toBeInTheDocument();
  });
});
