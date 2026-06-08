import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { DataTable } from "../data-table";

const rows = [{ id: "1", name: "Mai" }];
const columns = [{ key: "name", header: "名前" }] as const;

describe("DataTable — context guard + toggle off", () => {
  it("a subcomponent used outside <DataTable> throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<DataTable.SelectAll />)).toThrow(/inside <DataTable>/);
    spy.mockRestore();
  });

  it("re-checking a selected row deselects it (toggleSelect delete branch)", async () => {
    const user = userEvent.setup();
    const onSelectChange = vi.fn();
    renderWithUi(
      <DataTable
        data={rows}
        columns={[...columns]}
        getRowId={(r) => r.id}
        selectable
        onSelectChange={onSelectChange}
      />,
    );
    const cb = within(screen.getByText("Mai").closest("tr")!).getByRole("checkbox");
    await user.click(cb); // select → add
    expect(onSelectChange).toHaveBeenLastCalledWith(new Set(["1"]));
    await user.click(cb); // re-click → delete
    expect(onSelectChange).toHaveBeenLastCalledWith(new Set());
  });
});
