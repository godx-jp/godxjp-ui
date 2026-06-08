import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DataTable } from "../data-table";

type Row = { id: string; name: string };
const rows: Row[] = [{ id: "1", name: "Mai" }];
const columns = [
  { key: "name", header: "名前" },
  { key: "act", header: "操作", render: () => <button type="button">編集</button> },
];

describe("DataTable — row click vs interactive children", () => {
  it("clicking a plain cell fires onRowClick but clicking a control does not", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} onRowClick={onRowClick} />,
    );
    // clicking the in-cell button is an interactive target → row click is suppressed
    await user.click(screen.getByRole("button", { name: "編集" }));
    expect(onRowClick).not.toHaveBeenCalled();

    // clicking a normal cell triggers the row click
    await user.click(screen.getByText("Mai"));
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
  });
});
