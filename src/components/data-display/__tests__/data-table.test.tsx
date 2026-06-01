import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { DataTable } from "../data-table";

type Row = { id: string; name: string; status: string };

const rows: Row[] = [
  { id: "1", name: "Mai Nguyen", status: "active" },
  { id: "2", name: "Ken Tanaka", status: "pending" },
];

const columns = [
  { key: "name", header: "Khách hàng" },
  { key: "status", header: "Trạng thái" },
] as const;

describe("DataTable", () => {
  it("renders column headers and row data", () => {
    renderWithUi(<DataTable data={rows} columns={[...columns]} getRowId={(row) => row.id} />);
    expect(screen.getByRole("columnheader", { name: "Khách hàng" })).toBeInTheDocument();
    expect(screen.getByText("Mai Nguyen")).toBeInTheDocument();
    expect(screen.getByText("Ken Tanaka")).toBeInTheDocument();
  });

  it("can hide lower-priority columns below md", () => {
    renderWithUi(
      <DataTable
        data={rows}
        columns={[columns[0], { ...columns[1], hiddenOnMobile: true }]}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Trạng thái" })).toHaveClass(
      "hidden",
      "md:table-cell",
    );
    expect(screen.getAllByRole("cell", { name: "active" })[0]).toHaveClass(
      "hidden",
      "md:table-cell",
    );
  });

  it("applies ui-density class wrapper for token-based row height", () => {
    const { container } = renderWithUi(
      <DataTable data={rows} columns={[...columns]} getRowId={(row) => row.id} density="compact" />,
    );
    expect(container.querySelector(".ui-density-compact")).toBeInTheDocument();
  });

  it("supports row selection when selectable", async () => {
    const user = userEvent.setup();
    const onSelectChange = vi.fn();
    renderWithUi(
      <DataTable
        data={rows}
        columns={[...columns]}
        getRowId={(row) => row.id}
        selectable
        selected={new Set()}
        onSelectChange={onSelectChange}
      />,
    );
    const rowCheckbox = screen.getAllByRole("checkbox", { name: /chọn dòng/i })[0];
    await user.click(rowCheckbox);
    expect(onSelectChange).toHaveBeenCalledWith(new Set(["1"]));
  });

  it("calls onRowClick when row is clicked", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderWithUi(
      <DataTable
        data={rows}
        columns={[...columns]}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
      />,
    );
    await user.click(screen.getByText("Mai Nguyen"));
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it("shows bulk actions when rows selected", () => {
    renderWithUi(
      <DataTable
        data={rows}
        columns={[...columns]}
        getRowId={(row) => row.id}
        selectable
        selected={new Set(["1"])}
      >
        <DataTable.Toolbar>
          <DataTable.BulkActions>
            <button type="button">Xóa</button>
          </DataTable.BulkActions>
        </DataTable.Toolbar>
      </DataTable>,
    );
    expect(screen.getByRole("region", { name: /thao tác hàng loạt/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa" })).toBeInTheDocument();
  });

  it("shows a built-in empty state when there are no rows (never a bare header)", () => {
    renderWithUi(
      <DataTable data={[] as Row[]} columns={[...columns]} getRowId={(row) => row.id} />,
    );
    // Headers still render, but the body shows the default EmptyState, not a blank table.
    expect(screen.getByRole("columnheader", { name: "Khách hàng" })).toBeInTheDocument();
    expect(screen.getByText("Chưa có dữ liệu")).toBeInTheDocument();
  });

  it("renders a custom empty node when provided", () => {
    renderWithUi(
      <DataTable
        data={[] as Row[]}
        columns={[...columns]}
        getRowId={(row) => row.id}
        empty={<div>Không có khách hàng nào</div>}
      />,
    );
    expect(screen.getByText("Không có khách hàng nào")).toBeInTheDocument();
    expect(screen.queryByText("Chưa có dữ liệu")).not.toBeInTheDocument();
  });

  it("shows a loading row instead of data/empty when loading", () => {
    renderWithUi(
      <DataTable data={[] as Row[]} columns={[...columns]} getRowId={(row) => row.id} loading />,
    );
    expect(screen.getByText("Đang tải…")).toBeInTheDocument();
    expect(screen.queryByText("Chưa có dữ liệu")).not.toBeInTheDocument();
  });
});
