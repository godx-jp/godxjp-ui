import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable, type ColumnDef } from "../data-table";

/**
 * A row's selection control is announced by the row's NAME, never by its key.
 *
 * Before: `selectRow: "行 {id} を選択"` was filled with `row.id`, so on a table keyed by UUIDs a
 * screen reader said "行 3f2a9c1e-7b4d-4e8a-9c21-000000000000 を選択" for every row — measured on a
 * selectable table in gino-cloud by its `/ui-review`, and reproduced in Chromium. The id is a KEY;
 * it is the last resort now, used only when nothing else can name the row.
 */
type Row = { id: string; name: string; org: string; meta?: { code: string } };

const rows: Row[] = [
  {
    id: "3f2a9c1e-7b4d-4e8a-9c21-000000000001",
    name: "NGUYEN VAN AN",
    org: "Hanoi",
    meta: { code: "A" },
  },
  {
    id: "3f2a9c1e-7b4d-4e8a-9c21-000000000002",
    name: "TRAN THI BINH",
    org: "Da Nang",
    meta: { code: "B" },
  },
];
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i;

/** The selection control of each BODY row — the header's "select all" is not a row. */
function rowControls(role: "checkbox" | "radio") {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getByRole(role));
}

describe("DataTable — row selection is named after the row", () => {
  it("names each checkbox after the first column's text, not the row id", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "name", header: "Name" },
      { key: "org", header: "Org" },
    ];
    render(<DataTable data={rows} columns={columns} getRowId={(r) => r.id} selectable />);
    const [first, second] = rowControls("checkbox");
    expect(first).toHaveAccessibleName(expect.stringContaining("NGUYEN VAN AN"));
    expect(second).toHaveAccessibleName(expect.stringContaining("TRAN THI BINH"));
    for (const control of rowControls("checkbox")) {
      expect(control).not.toHaveAccessibleName(expect.stringMatching(UUID));
    }
  });

  it('prefers the column marked priority="primary" over the first one', () => {
    const columns: ColumnDef<Row>[] = [
      { key: "org", header: "Org" },
      { key: "name", header: "Name", priority: "primary" },
    ];
    render(<DataTable data={rows} columns={columns} getRowId={(r) => r.id} selectable />);
    const [first] = rowControls("checkbox");
    expect(first).toHaveAccessibleName(expect.stringContaining("NGUYEN VAN AN"));
    expect(first).not.toHaveAccessibleName(expect.stringContaining("Hanoi"));
  });

  it("uses getRowLabel when the consumer provides one", () => {
    const columns: ColumnDef<Row>[] = [{ key: "org", header: "Org" }];
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        getRowLabel={(r) => `${r.name} (${r.org})`}
        selectable
      />,
    );
    const [first] = rowControls("checkbox");
    expect(first).toHaveAccessibleName(expect.stringContaining("NGUYEN VAN AN (Hanoi)"));
  });

  it("falls back to the row id only when no column holds text to name the row by", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "meta", header: "Code", render: (r) => r.meta?.code },
    ];
    render(<DataTable data={rows} columns={columns} getRowId={(r) => r.id} selectable />);
    const [first] = rowControls("checkbox");
    expect(first).toHaveAccessibleName(expect.stringContaining(rows[0].id));
  });

  it("still lets getCheckboxProps name one row explicitly", () => {
    const columns: ColumnDef<Row>[] = [{ key: "name", header: "Name" }];
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        selectable
        rowSelection={{
          getCheckboxProps: (r) => (r.name === "NGUYEN VAN AN" ? { "aria-label": "Pick An" } : {}),
        }}
      />,
    );
    const [first, second] = rowControls("checkbox");
    expect(first).toHaveAccessibleName("Pick An");
    expect(second).toHaveAccessibleName(expect.stringContaining("TRAN THI BINH"));
  });

  it("names a radio row the same way", () => {
    const columns: ColumnDef<Row>[] = [{ key: "name", header: "Name" }];
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        selectable
        rowSelection={{ type: "radio" }}
      />,
    );
    const [first] = rowControls("radio");
    expect(first).toHaveAccessibleName(expect.stringContaining("NGUYEN VAN AN"));
    expect(first).not.toHaveAccessibleName(expect.stringMatching(UUID));
  });
});
