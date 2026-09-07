// antd 6.6.2 parity — `rowSelection`: type, selectedRowKeys, getCheckboxProps,
// preserveSelectedRowKeys, selections and hideSelectAll.
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; name: string };

const page1: Row[] = [
  { id: "a", name: "田中" },
  { id: "b", name: "佐藤" },
  { id: "c", name: "鈴木" },
];
const page2: Row[] = [{ id: "d", name: "高橋" }];

const columns: ColumnDef<Row>[] = [{ key: "name", header: "名前" }];

const rowBoxes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('tbody [role="checkbox"]')) as HTMLElement[];

describe("DataTable — antd `rowSelection`", () => {
  it("turns selection on by itself, without the older `selectable` flag", () => {
    const { container } = render(
      <DataTable data={page1} columns={columns} getRowId={(r) => r.id} rowSelection={{}} />,
    );
    expect(rowBoxes(container)).toHaveLength(3);
  });

  it("reports keys AND rows through onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DataTable
        data={page1}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{ onChange }}
      />,
    );
    await user.click(rowBoxes(container)[1]);
    expect(onChange).toHaveBeenLastCalledWith(["b"], [page1[1]]);
  });

  it("honours a controlled `selectedRowKeys`", () => {
    const { container } = render(
      <DataTable
        data={page1}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{ selectedRowKeys: ["c"] }}
      />,
    );
    const states = rowBoxes(container).map((box) => box.getAttribute("data-state"));
    expect(states).toEqual(["unchecked", "unchecked", "checked"]);
  });

  it("seeds from `defaultSelectedRowKeys` and still moves", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DataTable
        data={page1}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{ defaultSelectedRowKeys: ["a"] }}
      />,
    );
    expect(rowBoxes(container)[0]).toHaveAttribute("data-state", "checked");
    await user.click(rowBoxes(container)[0]);
    expect(rowBoxes(container)[0]).toHaveAttribute("data-state", "unchecked");
  });

  it("disables the row whose `getCheckboxProps` says so, and names it", () => {
    const { container } = render(
      <DataTable
        data={page1}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{
          getCheckboxProps: (row) => ({
            disabled: row.id === "b",
            "aria-label": `選択 ${row.name}`,
          }),
        }}
      />,
    );
    const boxes = rowBoxes(container);
    expect(boxes[0]).not.toBeDisabled();
    expect(boxes[1]).toBeDisabled();
    expect(boxes[0]).toHaveAccessibleName("選択 田中");
  });

  it('renders a single-choice RADIO column for type: "radio" — and no header checkbox', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DataTable
        data={page1}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{ type: "radio", onChange }}
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    // The header cell exists (the column is still there) but carries no select-all control.
    expect(container.querySelectorAll('thead [role="checkbox"]')).toHaveLength(0);

    await user.click(radios[0]);
    expect(onChange).toHaveBeenLastCalledWith(["a"], [page1[0]]);
    await user.click(radios[2]);
    // The newest choice REPLACES the previous one — that is what makes it a radio column.
    expect(onChange).toHaveBeenLastCalledWith(["c"], [page1[2]]);
  });

  it("drops the header checkbox when `hideSelectAll` is set", () => {
    const { container } = render(
      <DataTable
        data={page1}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{ hideSelectAll: true }}
      />,
    );
    expect(container.querySelectorAll('thead [role="checkbox"]')).toHaveLength(0);
    expect(rowBoxes(container)).toHaveLength(3);
  });

  it("keeps an off-page key selected when `preserveSelectedRowKeys` is set", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const view = (data: Row[]) => (
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{ preserveSelectedRowKeys: true, onChange }}
      />
    );
    const { container, rerender } = render(view(page1));
    await user.click(rowBoxes(container)[0]);
    expect(onChange).toHaveBeenLastCalledWith(["a"], [page1[0]]);

    // Page 2 no longer contains row "a" at all.
    rerender(view(page2));
    await user.click(rowBoxes(container)[0]);
    const [keys] = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(new Set(keys)).toEqual(new Set(["a", "d"]));
  });

  it("drops the off-page key without `preserveSelectedRowKeys` — antd's default", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const view = (data: Row[]) => (
      <DataTable data={data} columns={columns} getRowId={(r) => r.id} rowSelection={{ onChange }} />
    );
    const { container, rerender } = render(view(page1));
    await user.click(rowBoxes(container)[0]);
    rerender(view(page2));
    await user.click(rowBoxes(container)[0]);
    const [keys] = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(keys).toEqual(["d"]);
  });

  it("hangs the built-in all/invert/none entries off the header checkbox", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DataTable
        data={page1}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{ selections: true, defaultSelectedRowKeys: ["a"] }}
      />,
    );
    await user.click(container.querySelector(".ui-data-table-selection-trigger")!);
    const items = await screen.findAllByRole("menuitem");
    expect(items).toHaveLength(3);
    await user.click(items[1]); // invert
    const states = rowBoxes(container).map((box) => box.getAttribute("data-state"));
    expect(states).toEqual(["unchecked", "checked", "checked"]);
  });

  it("runs a CUSTOM selection entry against the page's row keys", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = render(
      <DataTable
        data={page1}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{ selections: [{ key: "odd", text: "奇数行", onSelect }] }}
      />,
    );
    await user.click(container.querySelector(".ui-data-table-selection-trigger")!);
    await user.click(await screen.findByRole("menuitem", { name: "奇数行" }));
    expect(onSelect).toHaveBeenCalledWith(["a", "b", "c"]);
  });
});
