import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoA11yViolations } from "@/test/a11y";

import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; partner: string };

describe("DataTable — client-side sort cycle (header icons)", () => {
  const ROWS: Row[] = [
    { id: "1", partner: "B社" },
    { id: "2", partner: "A社" },
    { id: "3", partner: "C社" },
  ];
  const columns: ColumnDef<Row>[] = [{ key: "partner", header: "取引先", sortable: true }];
  const partnerCells = () =>
    Array.from(document.querySelectorAll("tbody td")).map((c) => c.textContent);

  it("cycles unsorted → asc → desc via the sortable header button (no onSortChange)", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={ROWS} getRowId={(r) => r.id} />);
    // unsorted: original order (ChevronsUpDown icon branch)
    expect(partnerCells()).toEqual(["B社", "A社", "C社"]);

    const header = screen.getByRole("button", { name: /取引先/ });
    await user.click(header); // asc → ArrowUp branch
    expect(partnerCells()).toEqual(["A社", "B社", "C社"]);

    await user.click(header); // desc → ArrowDown branch
    expect(partnerCells()).toEqual(["C社", "B社", "A社"]);
  });
});

describe("DataTable — server (manual) mode", () => {
  const ROWS: Row[] = [
    { id: "INV-1", partner: "東京商事" },
    { id: "INV-2", partner: "大阪物産" },
  ];
  const columns: ColumnDef<Row>[] = [
    { key: "id", header: "番号", enableHiding: false },
    { key: "partner", header: "取引先", sortable: true },
  ];

  it("manualSorting: clicking a sortable header delegates to onSortChange", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={ROWS}
        getRowId={(r) => r.id}
        manualSorting
        sort={undefined}
        onSortChange={onSortChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /取引先/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: "partner", direction: "asc" });
  });

  it("column visibility: a controlled onColumnVisibilityChange is honoured", () => {
    render(
      <DataTable
        columns={columns}
        data={ROWS}
        getRowId={(r) => r.id}
        columnVisibility={{ partner: false }}
        onColumnVisibilityChange={vi.fn()}
      />,
    );
    expect(screen.queryByText("東京商事")).toBeNull(); // partner column hidden
    expect(screen.getByText("INV-1")).toBeInTheDocument(); // id still visible
  });

  it("renders an empty state in manual mode with no rows", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(r) => r.id}
        manualPagination
        rowCount={0}
      />,
    );
    expect(screen.queryByText("東京商事")).toBeNull();
  });

  it("has no axe violations with the full grid chrome", async () => {
    await expectNoA11yViolations(
      <DataTable columns={columns} data={ROWS} getRowId={(r) => r.id} selectable>
        <DataTable.Toolbar>
          <DataTable.Search />
          <DataTable.ViewOptions />
          <DataTable.DensityToggle />
        </DataTable.Toolbar>
        <DataTable.Content />
        <DataTable.Pagination />
      </DataTable>,
    );
  });
});
