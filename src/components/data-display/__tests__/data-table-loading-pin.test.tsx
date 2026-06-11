import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { DataTable } from "../data-table";

type Row = { id: string; name: string; actions: string };

const rows: Row[] = [
  { id: "1", name: "Mai Nguyen", actions: "—" },
  { id: "2", name: "Ken Tanaka", actions: "—" },
];

const columns = [
  { key: "name", header: "Khách hàng" },
  { key: "actions", header: "操作", pin: "end" as const, align: "right" as const },
];

describe("DataTable loading skeleton", () => {
  it("renders shaped skeleton rows inside the real grid (no text row, no extra frame)", () => {
    const { container } = renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} loading />,
    );
    // Skeleton blocks are rendered…
    expect(container.querySelectorAll(".ui-skeleton-block").length).toBeGreaterThan(0);
    // …as real <tr>/<td> inside the single table surface (one bordered surface).
    expect(container.querySelectorAll(".ui-data-table-surface").length).toBe(1);
    // The real data must NOT be shown while loading.
    expect(screen.queryByText("Mai Nguyen")).not.toBeInTheDocument();
  });

  it("keeps the column headers visible while loading (stable widths)", () => {
    renderWithUi(<DataTable data={rows} columns={columns} getRowId={(r) => r.id} loading />);
    expect(screen.getByRole("columnheader", { name: "Khách hàng" })).toBeInTheDocument();
  });
});

describe("DataTable pinned column", () => {
  it("marks a pin:'end' column's header and body cells sticky and suppresses the scroll fade", () => {
    const { container } = renderWithUi(
      <DataTable data={rows} columns={columns} getRowId={(r) => r.id} />,
    );
    const pinned = container.querySelectorAll(".ui-data-table-pin-end");
    // 1 header + 2 body cells.
    expect(pinned.length).toBe(3);
    expect(container.querySelector(".ui-data-table-has-pin-end")).toBeInTheDocument();
  });

  it("does not pin when no column opts in", () => {
    const { container } = renderWithUi(
      <DataTable
        data={rows}
        columns={[{ key: "name", header: "Khách hàng" }]}
        getRowId={(r) => r.id}
      />,
    );
    expect(container.querySelector(".ui-data-table-pin-end")).toBeNull();
    expect(container.querySelector(".ui-data-table-has-pin-end")).toBeNull();
  });
});
