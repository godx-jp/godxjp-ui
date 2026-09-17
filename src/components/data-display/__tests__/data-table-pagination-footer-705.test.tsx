import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, within } from "@/test/render";
import { DataTable, type ColumnDef } from "../data-table";

/**
 * gh#705 — antd `Table pagination`: the config object renders the table's OWN footer, the real
 * `Pagination` with the total beside the page numbers, sized from the table's density, and a
 * server total drives `ceil(total / pageSize)` pages while `data` holds only the current page.
 *
 * Browser evidence (Chromium 1440, preview `data-display-data-table-examples-server-paged`, LTR and
 * RTL): total → first control gap 8px (the bar's own --pagination-gap); pager controls 25.75px =
 * the toolbar's size="sm" controls, 25.75px (28px before, when the sm step was a frozen band).
 */
type Row = { id: string; name: string };
const columns: ColumnDef<Row>[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Name" },
];
const rowsFor = (page: number, pageSize: number, total: number): Row[] =>
  Array.from({ length: Math.max(0, Math.min(pageSize, total - (page - 1) * pageSize)) }, (_, i) => {
    const n = (page - 1) * pageSize + i + 1;
    return { id: String(n), name: `row-${n}` };
  });

const pager = () => screen.getByRole("navigation");
const pageButton = (page: number) =>
  within(pager()).getByRole("button", { name: new RegExp(`^trang ${page}$`, "i") });

describe("DataTable `pagination` config footer (gh#705)", () => {
  it("renders the real Pagination with the total and page numbers, bottom-end by default", () => {
    const { container } = renderWithUi(
      <DataTable
        data={rowsFor(1, 10, 57)}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ total: 57, pageSize: 10, showTotal: true }}
      />,
    );
    const nav = pager();
    expect(nav).toHaveClass("ui-pagination");
    expect(nav).toHaveAttribute("data-align", "end");
    expect(within(nav).getByText("Tổng 57 mục")).toBeInTheDocument();
    expect(pageButton(1)).toHaveAttribute("aria-current", "page");
    expect(pageButton(6)).toBeInTheDocument();
    // The footer sits AFTER the table, inside the DataTable root.
    const root = container.querySelector(".ui-data-table-root") as HTMLElement;
    const footer = nav.closest(".ui-data-table-pagination--footer") as HTMLElement;
    expect(footer.parentElement).toBe(root);
    expect(root.lastElementChild).toBe(footer);
    expect(footer).toHaveAttribute("data-position", "bottomEnd");
  });

  it("places the total directly before the page buttons (no size changer)", () => {
    renderWithUi(
      <DataTable
        data={rowsFor(1, 10, 30)}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ total: 30, pageSize: 10, showTotal: true, showSizeChanger: false }}
      />,
    );
    const total = pager().querySelector(".ui-pagination-total") as HTMLElement;
    expect(total.nextElementSibling).toHaveClass("ui-pagination-list");
  });

  it("passes antd's (total, range) render to showTotal", () => {
    renderWithUi(
      <DataTable
        data={rowsFor(2, 10, 57)}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{
          total: 57,
          current: 2,
          pageSize: 10,
          showTotal: (total, [from, to]) => `${from}-${to} of ${total}`,
        }}
      />,
    );
    expect(screen.getByText("11-20 of 57")).toBeInTheDocument();
  });

  it("clicking page 2 calls onChange(2, pageSize)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(
      <DataTable
        data={rowsFor(1, 20, 95)}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ total: 95, current: 1, pageSize: 20, onChange }}
      />,
    );
    await user.click(pageButton(2));
    expect(onChange).toHaveBeenLastCalledWith(2, 20);
  });

  it("server mode: ceil(total/pageSize) pages, and only the provided page's rows, unsliced", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function ServerPaged() {
      const [page, setPage] = React.useState(1);
      return (
        <DataTable
          data={rowsFor(page, 10, 95)}
          columns={columns}
          getRowId={(r) => r.id}
          pagination={{
            total: 95,
            current: page,
            pageSize: 10,
            showTotal: true,
            onChange: (next, size) => {
              onChange(next, size);
              setPage(next);
            },
          }}
        />
      );
    }
    renderWithUi(<ServerPaged />);
    expect(pageButton(10)).toBeInTheDocument();
    expect(within(pager()).queryByRole("button", { name: /^trang 11$/i })).toBeNull();
    expect(screen.getAllByRole("row")).toHaveLength(11); // header + 10
    await user.click(pageButton(10));
    expect(onChange).toHaveBeenLastCalledWith(10, 10);
    // Page 10 holds rows 91–95: shown as given, NOT sliced to an empty 10th client page.
    expect(screen.getByText("row-91")).toBeInTheDocument();
    expect(screen.getByText("row-95")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(6);
    expect(pageButton(10)).toHaveAttribute("aria-current", "page");
  });

  it("client mode: a total equal to data.length still slices in the browser", () => {
    renderWithUi(
      <DataTable
        data={rowsFor(1, 25, 25)}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ pageSize: 10 }}
      />,
    );
    expect(screen.getAllByRole("row")).toHaveLength(11);
    expect(pageButton(3)).toBeInTheDocument();
  });

  it("renders no footer on `pagination={false}` or position ['none']", () => {
    const { container, rerender } = renderWithUi(
      <DataTable
        data={rowsFor(1, 25, 25)}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={false}
      />,
    );
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(container.querySelector(".ui-data-table-pagination")).toBeNull();
    rerender(
      <DataTable
        data={rowsFor(1, 25, 25)}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ pageSize: 10, position: ["none"] }}
      />,
    );
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });

  it("follows the table density: compact → size sm, default → size md", () => {
    const { rerender } = renderWithUi(
      <DataTable
        data={rowsFor(1, 25, 25)}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ pageSize: 10 }}
      />,
    );
    expect(pager()).toHaveAttribute("data-size", "sm");
    rerender(
      <DataTable
        data={rowsFor(1, 25, 25)}
        columns={columns}
        getRowId={(r) => r.id}
        density="default"
        pagination={{ pageSize: 10 }}
      />,
    );
    expect(pager()).toHaveAttribute("data-size", "md");
  });

  it("maps a logical top position onto the bar's align, above the table", () => {
    const { container } = renderWithUi(
      <DataTable
        data={rowsFor(1, 25, 25)}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ pageSize: 10, position: ["topStart"] }}
      />,
    );
    const root = container.querySelector(".ui-data-table-root") as HTMLElement;
    expect(root.firstElementChild).toHaveAttribute("data-position", "topStart");
    expect(pager()).toHaveAttribute("data-align", "start");
  });

  it("a composed <DataTable.Pagination> keeps its own footer — never a second pager", () => {
    const { container } = renderWithUi(
      <DataTable
        data={rowsFor(1, 25, 25)}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ pageSize: 10, showTotal: true }}
      >
        <DataTable.Content />
        <DataTable.Pagination />
      </DataTable>,
    );
    expect(container.querySelectorAll(".ui-data-table-pagination")).toHaveLength(1);
    expect(container.querySelector(".ui-data-table-pagination--numbered")).not.toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});
