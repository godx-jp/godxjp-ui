import { expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { DataTable } from "../data-table";

it("explicit column widths use fixed layout, including Japanese text actions", () => {
  renderWithUi(
    <DataTable
      preset="action-collection"
      columns={[
        { key: "name", header: "担当者", width: "168px" },
        { key: "action", header: "操作", width: "104px" },
      ]}
      data={[{ id: "a", name: "田中美咲", action: "対応する" }]}
      getRowId={(row) => row.id}
    />,
  );
  expect(screen.getByRole("table").closest("[data-table-layout]")).toHaveAttribute(
    "data-table-layout",
    "fixed",
  );
  expect(screen.getByRole("columnheader", { name: "操作" }).style.width).toBe("104px");
});
