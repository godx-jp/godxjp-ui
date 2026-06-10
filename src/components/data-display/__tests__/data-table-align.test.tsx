import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { DataTable } from "../data-table";

type Row = { id: string; name: string; amount: number; status: string };
const rows: Row[] = [{ id: "1", name: "Mai", amount: 1000, status: "active" }];
const columns = [
  { key: "name", header: "名前" },
  { key: "amount", header: "金額", align: "right" as const },
  { key: "status", header: "状態", align: "center" as const },
];

describe("DataTable — column alignment", () => {
  it("applies text-end / text-center per column align (logical)", () => {
    renderWithUi(<DataTable data={rows} columns={columns} getRowId={(r) => r.id} />);
    expect(screen.getByText("1000").closest("td")).toHaveClass("text-end");
    expect(screen.getByText("active").closest("td")).toHaveClass("text-center");
    expect(screen.getByText("Mai").closest("td")).not.toHaveClass("text-end", "text-center");
  });
});

describe("DataTable.RowActions — default label", () => {
  it("falls back to the built-in aria-label when none is given", () => {
    renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id}>
        <DataTable.Toolbar>
          <DataTable.RowActions>
            <span>menu</span>
          </DataTable.RowActions>
        </DataTable.Toolbar>
        <DataTable.Content />
      </DataTable>,
    );
    // the kebab trigger gets a non-empty default aria-label (t("dataTable.rowActions"))
    const trigger = screen.getByText("menu").closest("button")!;
    expect(trigger.getAttribute("aria-label")).toBeTruthy();
  });
});
