import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable, type ColumnDef } from "../data-table";

/**
 * `ColumnDef.width` was forwarded straight into `cn()`, so a CSS length became
 * a class name that matches nothing: the column quietly fell back to auto
 * layout, and under `table-layout: fixed` a wrapping cell then collapsed to
 * its minimum. The type said `string`, which is precisely what invites
 * `"300px"`.
 */

type Row = { id: string; name: string };

const rows: Row[] = [{ id: "1", name: "first" }];

function renderWith(width: string) {
  const columns: ColumnDef<Row>[] = [
    { key: "name", header: "Name", width, render: (row) => row.name },
  ];

  return render(<DataTable data={rows} columns={columns} getRowId={(r) => r.id} />);
}

describe("ColumnDef.width", () => {
  it("applies a CSS length inline rather than dropping it", () => {
    renderWith("300px");

    const header = screen.getByRole("columnheader", { name: "Name" });

    expect(header).toHaveStyle({ width: "300px" });
    expect(header.className).not.toContain("300px");
  });

  it("applies the same length to the body cell", () => {
    renderWith("300px");

    const cell = screen.getByRole("cell", { name: "first" });

    expect(cell).toHaveStyle({ width: "300px" });
  });

  it("accepts a percentage and a calc()", () => {
    const { unmount } = renderWith("20%");
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveStyle({ width: "20%" });
    unmount();

    renderWith("calc(50% - 1rem)");
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveStyle({
      width: "calc(50% - 1rem)",
    });
  });

  it("still treats a utility class as a class", () => {
    renderWith("w-[300px]");

    const header = screen.getByRole("columnheader", { name: "Name" });

    // The existing contract: call sites already passing a class keep working,
    // and nothing is written inline for them.
    expect(header.className).toContain("w-[300px]");
    expect(header.getAttribute("style") ?? "").not.toContain("width");
  });
});
