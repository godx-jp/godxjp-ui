// antd 6.6.2 parity — `ColumnType.fixed` (frozen columns) and `ColumnType.ellipsis`.
//
// The PAINTED result of a frozen column is geometry and is measured in the browser
// (scripts/… / the preview run recorded in the PR); what a jsdom gate can prove is the contract
// that makes the geometry possible: the sticky class lands on BOTH cells of the column, the
// measured offset is published as a custom property rather than baked into a class, the leading
// select/expand columns freeze with it, and `ellipsis` switches the table to the fixed layout
// without which no browser truncates a table cell at all.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; code: string; note: string; action: string };

const data: Row[] = [
  { id: "1", code: "INV-1", note: "a very long note that has to be truncated", action: "…" },
  { id: "2", code: "INV-2", note: "another long note", action: "…" },
];

describe("DataTable — antd `fixed` (frozen columns)", () => {
  it('freezes a column against the inline START edge when fixed="start"', () => {
    const columns: ColumnDef<Row>[] = [
      { key: "code", header: "コード", fixed: "start" },
      { key: "note", header: "メモ" },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    const head = container.querySelector('th[data-column-key="code"]')!;
    const cells = container.querySelectorAll('td[data-column-key="code"]');

    expect(head).toHaveClass("ui-data-table-pin-start");
    expect(head).toHaveAttribute("data-fixed", "start");
    // BOTH cells of the column carry it — a header-only sticky column tears on scroll.
    expect(cells).toHaveLength(2);
    for (const cell of cells) {
      expect(cell).toHaveClass("ui-data-table-pin-start");
      expect(cell).toHaveAttribute("data-fixed", "start");
    }
    // The unfrozen column stays unfrozen.
    expect(container.querySelector('th[data-column-key="note"]')).not.toHaveClass(
      "ui-data-table-pin-start",
    );
  });

  it("publishes the stacking offset as a custom property, not as a baked class", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "code", header: "コード", fixed: "start" },
      { key: "note", header: "メモ" },
      { key: "action", header: "操作", ariaLabel: "操作", fixed: "end" },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    const start = container.querySelector('th[data-column-key="code"]') as HTMLElement;
    const end = container.querySelector('th[data-column-key="action"]') as HTMLElement;
    // Measured in the browser; in jsdom every box is 0 wide, so the CONTRACT under test is that
    // the property is published at all — the stylesheet multiplies it by 1px.
    expect(start.style.getPropertyValue("--table-fixed-offset")).toBe("0");
    expect(end.style.getPropertyValue("--table-fixed-offset")).toBe("0");
    expect(end).toHaveClass("ui-data-table-pin-end");
  });

  it("freezes the leading selection column too, so it cannot slide out from under a frozen column", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "code", header: "コード", fixed: "start" },
      { key: "note", header: "メモ" },
    ];
    const { container } = render(
      <DataTable data={data} columns={columns} selectable getRowId={(r) => r.id} />,
    );
    const head = container.querySelector('th[data-column-key="__select"]') as HTMLElement;
    expect(head).toHaveAttribute("data-fixed", "start");
    // …and carries its OWN measured offset, so it stacks with the frozen data column beside it.
    expect(head.style.getPropertyValue("--table-fixed-offset")).toBe("0");
    const cell = container.querySelector('td[data-column-key="__select"]') as HTMLElement;
    expect(cell.style.getPropertyValue("--table-fixed-offset")).toBe("0");
  });

  it("leaves the leading columns alone when nothing is frozen", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "code", header: "コード" },
      { key: "note", header: "メモ" },
    ];
    const { container } = render(
      <DataTable data={data} columns={columns} selectable getRowId={(r) => r.id} />,
    );
    expect(container.querySelector('th[data-column-key="__select"]')).not.toHaveAttribute(
      "data-fixed",
    );
  });

  it('keeps `pin: "end"` working as the older spelling of fixed: "end"', () => {
    const columns: ColumnDef<Row>[] = [
      { key: "code", header: "コード" },
      { key: "action", header: "操作", ariaLabel: "操作", pin: "end" },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    expect(container.querySelector('th[data-column-key="action"]')).toHaveClass(
      "ui-data-table-pin-end",
    );
  });
});

describe("DataTable — antd `ellipsis`", () => {
  it("holds the cell to one line and keeps the full value as its title", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "code", header: "コード" },
      { key: "note", header: "メモ", ellipsis: true, width: "120px" },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    const cell = container.querySelector('td[data-column-key="note"]')!;
    expect(cell).toHaveClass("ui-data-table-ellipsis");
    expect(cell).toHaveAttribute("title", "a very long note that has to be truncated");
    // An ordinary column is untouched.
    expect(container.querySelector('td[data-column-key="code"]')).not.toHaveClass(
      "ui-data-table-ellipsis",
    );
  });

  it("switches the table to `table-layout: fixed`, without which nothing truncates", () => {
    const plain: ColumnDef<Row>[] = [{ key: "code", header: "コード" }];
    const clipped: ColumnDef<Row>[] = [{ key: "note", header: "メモ", ellipsis: true }];

    const { container: a } = render(<DataTable data={data} columns={plain} />);
    expect(a.querySelector(".ui-data-table-surface")).not.toHaveAttribute("data-table-layout");

    const { container: b } = render(<DataTable data={data} columns={clipped} />);
    expect(b.querySelector(".ui-data-table-surface")).toHaveAttribute("data-table-layout", "fixed");
  });

  it("does not invent a title for a column with its own render", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "note", header: "メモ", ellipsis: true, render: (r) => <b>{r.note}</b> },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    const cell = container.querySelector('td[data-column-key="note"]')!;
    expect(cell).toHaveClass("ui-data-table-ellipsis");
    expect(cell).not.toHaveAttribute("title");
    expect(screen.getAllByText("another long note")[0].tagName).toBe("B");
  });
});
