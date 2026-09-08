// antd 6.6.2 parity — `expandable`: expandedRowRender, rowExpandable, defaultExpandAllRows,
// the controlled expandedRowKeys pair, and expandRowByClick.
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; name: string; detail: string };

const data: Row[] = [
  { id: "a", name: "田中", detail: "明細A" },
  { id: "b", name: "佐藤", detail: "明細B" },
];

const columns: ColumnDef<Row>[] = [{ key: "name", header: "名前" }];

const triggers = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".ui-data-table-expand-trigger")) as HTMLElement[];

describe("DataTable — antd `expandable`", () => {
  it("adds no expand column at all when nothing is expandable", () => {
    const { container } = render(<DataTable data={data} columns={columns} />);
    expect(container.querySelector(".ui-data-table-expand-column")).toBeNull();
    expect(triggers(container)).toHaveLength(0);
  });

  it("renders the detail panel in a real row of the same table", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        expandable={{ expandedRowRender: (row) => <p>{row.detail}</p> }}
      />,
    );
    expect(container.querySelector(".ui-data-table-expand-column")).not.toBeNull();
    expect(screen.queryByText("明細A")).toBeNull();

    await user.click(triggers(container)[0]);
    const panel = screen.getByText("明細A");
    expect(panel).toBeInTheDocument();
    // The panel lives in the table's own grid, not in a sibling container.
    expect(panel.closest("tr")).toHaveAttribute("data-expanded-row", "");
    expect(panel.closest("td")).toHaveAttribute("colspan", "2");
    expect(triggers(container)[0]).toHaveAttribute("aria-expanded", "true");

    await user.click(triggers(container)[0]);
    expect(screen.queryByText("明細A")).toBeNull();
  });

  it("gives no affordance to a row `rowExpandable` rejects", () => {
    const { container } = render(
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        expandable={{
          expandedRowRender: (row) => <p>{row.detail}</p>,
          rowExpandable: (row) => row.id === "a",
        }}
      />,
    );
    expect(triggers(container)).toHaveLength(1);
  });

  it("opens every row up front with `defaultExpandAllRows`", () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        expandable={{
          expandedRowRender: (row) => <p>{row.detail}</p>,
          defaultExpandAllRows: true,
        }}
      />,
    );
    expect(screen.getByText("明細A")).toBeInTheDocument();
    expect(screen.getByText("明細B")).toBeInTheDocument();
  });

  it("lets a controlled `expandedRowKeys` own the state and reports the next one", async () => {
    const user = userEvent.setup();
    const onExpandedRowsChange = vi.fn();
    const { container } = render(
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        expandable={{
          expandedRowRender: (row) => <p>{row.detail}</p>,
          expandedRowKeys: ["b"],
          onExpandedRowsChange,
        }}
      />,
    );
    expect(screen.getByText("明細B")).toBeInTheDocument();
    expect(screen.queryByText("明細A")).toBeNull();

    await user.click(triggers(container)[0]);
    expect(onExpandedRowsChange).toHaveBeenLastCalledWith(["b", "a"]);
    // Controlled: nothing moves until the consumer says so.
    expect(screen.queryByText("明細A")).toBeNull();
  });

  it("toggles from anywhere on the row when `expandRowByClick` is set", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        expandable={{
          expandedRowRender: (row) => <p>{row.detail}</p>,
          expandRowByClick: true,
        }}
      />,
    );
    await user.click(screen.getByText("田中"));
    expect(screen.getByText("明細A")).toBeInTheDocument();
  });

  it("does NOT toggle from the row body without `expandRowByClick`", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        expandable={{ expandedRowRender: (row) => <p>{row.detail}</p> }}
      />,
    );
    await user.click(screen.getByText("田中"));
    expect(screen.queryByText("明細A")).toBeNull();
  });
});
