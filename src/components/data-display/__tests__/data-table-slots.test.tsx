import { describe, expect, it, vi } from "vitest";
import { within } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DataTable } from "../data-table";

type Row = { id: string; name: string };
const rows: Row[] = [
  { id: "1", name: "Mai Nguyen" },
  { id: "2", name: "Ken Tanaka" },
];
const columns = [{ key: "name", header: "Khách hàng" }] as const;

const toolbar = (c: HTMLElement) => c.querySelector(".ui-data-table-toolbar") as HTMLElement;

describe("DataTable.SelectAll", () => {
  it("selects every row, then clears, and shows indeterminate for a partial selection", async () => {
    const user = userEvent.setup();
    const onSelectChange = vi.fn();
    const { container } = renderWithUi(
      <DataTable
        data={rows}
        columns={[...columns]}
        getRowId={(r) => r.id}
        selectable
        onSelectChange={onSelectChange}
      >
        <DataTable.Toolbar>
          <DataTable.SelectAll />
        </DataTable.Toolbar>
        <DataTable.Content />
      </DataTable>,
    );
    const selectAll = within(toolbar(container)).getByRole("checkbox");

    // select all → both ids
    await user.click(selectAll);
    expect(onSelectChange).toHaveBeenLastCalledWith(new Set(["1", "2"]));
    expect(selectAll).toBeChecked();

    // toggle again → cleared
    await user.click(selectAll);
    expect(onSelectChange).toHaveBeenLastCalledWith(new Set());

    // selecting a single row checkbox → SelectAll becomes indeterminate
    const rowCheckbox = within(screen.getByText("Mai Nguyen").closest("tr")!).getByRole("checkbox");
    await user.click(rowCheckbox);
    expect(selectAll).toHaveAttribute("aria-checked", "mixed");
  });
});

describe("DataTable.DensityToggle", () => {
  it("toggles the root density class on click", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <DataTable data={rows} columns={[...columns]} getRowId={(r) => r.id}>
        <DataTable.Toolbar>
          <DataTable.DensityToggle />
        </DataTable.Toolbar>
        <DataTable.Content />
      </DataTable>,
    );
    const root = container.querySelector(".ui-data-table-root")!;
    const before = root.className;
    await user.click(within(toolbar(container)).getByRole("button"));
    expect(root.className).not.toBe(before); // density class swapped
  });
});

describe("DataTable.Pagination", () => {
  it("first/next buttons respect cursor + hasMore and emit the cursor", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = renderWithUi(
      <DataTable data={rows} columns={[...columns]} getRowId={(r) => r.id}>
        <DataTable.Content />
        <DataTable.Pagination cursor="cur-1" hasMore onChange={onChange} />
      </DataTable>,
    );
    const pager = container.querySelector(".ui-data-table-pagination") as HTMLElement;
    const [first, next] = within(pager).getAllByRole("button");
    expect(first).toBeEnabled(); // cursor present
    expect(next).toBeEnabled(); // hasMore
    await user.click(next);
    expect(onChange).toHaveBeenLastCalledWith("cur-1");
    await user.click(first);
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("disables first (no cursor) and next (no more) at the boundaries", () => {
    const { container } = renderWithUi(
      <DataTable data={rows} columns={[...columns]} getRowId={(r) => r.id}>
        <DataTable.Content />
        <DataTable.Pagination hasMore={false} onChange={vi.fn()} />
      </DataTable>,
    );
    const pager = container.querySelector(".ui-data-table-pagination") as HTMLElement;
    const [first, next] = within(pager).getAllByRole("button");
    expect(first).toBeDisabled();
    expect(next).toBeDisabled();
  });
});

describe("DataTable.RowActions + BulkActions count", () => {
  it("RowActions renders a kebab trigger with an accessible label wrapping its menu", () => {
    renderWithUi(
      <DataTable data={rows} columns={[...columns]} getRowId={(r) => r.id}>
        <DataTable.Toolbar>
          <DataTable.RowActions ariaLabel="行の操作">
            <span>menu-content</span>
          </DataTable.RowActions>
        </DataTable.Toolbar>
        <DataTable.Content />
      </DataTable>,
    );
    const btn = screen.getByRole("button", { name: "行の操作" });
    expect(within(btn).getByText("menu-content")).toBeInTheDocument();
  });

  it("BulkActions renders from an explicit count even with no row selection", () => {
    renderWithUi(
      <DataTable data={rows} columns={[...columns]} getRowId={(r) => r.id} selectable>
        <DataTable.Toolbar>
          <DataTable.BulkActions count={3}>
            <button type="button">削除</button>
          </DataTable.BulkActions>
        </DataTable.Toolbar>
        <DataTable.Content />
      </DataTable>,
    );
    expect(screen.getByRole("region")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });
});
