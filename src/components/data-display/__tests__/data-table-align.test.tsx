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
  it("reflects each column's align on its cells, and leaves an unaligned column alone", () => {
    renderWithUi(<DataTable data={rows} columns={columns} getRowId={(r) => r.id} />);
    // `data-align` is the contract the cell publishes — a service theme keys on it, and it
    // survives the logical `text-*` utility that paints it becoming a token.
    expect(screen.getByText("1000").closest("td")).toHaveAttribute("data-align", "right");
    expect(screen.getByText("active").closest("td")).toHaveAttribute("data-align", "center");
    // A column that asked for no alignment gains no attribute at all (the `data-priority` rule).
    expect(screen.getByText("Mai").closest("td")).not.toHaveAttribute("data-align");
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
