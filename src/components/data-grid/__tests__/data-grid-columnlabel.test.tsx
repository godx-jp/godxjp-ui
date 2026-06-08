import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataGrid } from "../data-grid";
import type { ColumnDef } from "../data-grid";

type Row = { id: string; partner: string };
const ROWS: Row[] = [{ id: "INV-1", partner: "東京商事" }];
// the second column has a NON-string header and no meta.label → columnLabel must fall back to the id
const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "番号", enableHiding: false },
  { id: "partner_col", header: () => <span>取引先</span>, accessorKey: "partner" },
];

describe("DataGrid.ViewOptions — columnLabel id fallback", () => {
  it("labels a column by its id when there is no meta.label and the header is not a string", async () => {
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
    expect(
      await screen.findByRole("menuitemcheckbox", { name: "partner_col" }),
    ).toBeInTheDocument();
  });
});
