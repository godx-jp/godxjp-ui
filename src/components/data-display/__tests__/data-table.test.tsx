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
});
