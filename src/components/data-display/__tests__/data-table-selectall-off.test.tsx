import { describe, expect, it } from "vitest";
import { within } from "@testing-library/react";
import { renderWithUi } from "@/test/render";

import { DataTable } from "../data-table";

const rows = [{ id: "1", name: "Mai" }];
const columns = [{ key: "name", header: "名前" }] as const;

describe("DataTable.SelectAll — not selectable", () => {
  it("renders nothing when the table is not selectable", () => {
    const { container } = renderWithUi(
      <DataTable data={rows} columns={[...columns]} getRowId={(r) => r.id}>
        <DataTable.Toolbar>
          <DataTable.SelectAll />
        </DataTable.Toolbar>
        <DataTable.Content />
      </DataTable>,
    );
    const toolbar = container.querySelector(".ui-data-table-toolbar") as HTMLElement;
    // SelectAll bails (!selectable → null) so no header checkbox is rendered
    expect(within(toolbar).queryByRole("checkbox")).toBeNull();
  });
});
