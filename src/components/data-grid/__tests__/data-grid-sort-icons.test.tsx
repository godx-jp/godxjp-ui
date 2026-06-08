import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataGrid } from "../data-grid";
import type { ColumnDef } from "../data-grid";

type Row = { id: string; partner: string };
const ROWS: Row[] = [
  { id: "1", partner: "B社" },
  { id: "2", partner: "A社" },
  { id: "3", partner: "C社" },
];
const columns: ColumnDef<Row, unknown>[] = [{ accessorKey: "partner", header: "取引先" }];

const partnerCells = () =>
  Array.from(document.querySelectorAll("tbody td")).map((c) => c.textContent);

describe("DataGrid — client-side sort cycle (header icons)", () => {
  it("cycles unsorted → asc → desc via the sortable header button", async () => {
    const user = userEvent.setup();
    render(<DataGrid columns={columns} data={ROWS} getRowId={(r) => r.id} manualSorting={false} />);
    // unsorted: original order (ChevronsUpDown icon branch)
    expect(partnerCells()).toEqual(["B社", "A社", "C社"]);

    const header = screen.getByRole("button", { name: /取引先/ });
    await user.click(header); // asc → ArrowUp branch
    expect(partnerCells()).toEqual(["A社", "B社", "C社"]);

    await user.click(header); // desc → ArrowDown branch
    expect(partnerCells()).toEqual(["C社", "B社", "A社"]);
  });
});
