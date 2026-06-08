import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DataTable } from "../data-table";

type Row = { id: string; name: string };
const rows: Row[] = [{ id: "1", name: "Mai" }];
const columns = [
  { key: "name", header: "名前" },
  { key: "act", header: "操作", render: () => <button type="button">編集</button> },
];

describe("DataTable — keyboard on a row's interactive descendant", () => {
  it("Enter on an in-cell control does not trigger the row's onRowClick", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} onRowClick={onRowClick} />,
    );
    const button = screen.getByRole("button", { name: "編集" });
    button.focus();
    await user.keyboard("{Enter}");
    // the row onKeyDown bails because e.target (button) !== e.currentTarget (row)
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
