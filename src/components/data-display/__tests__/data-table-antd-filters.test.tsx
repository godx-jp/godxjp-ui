// antd 6.6.2 parity — `filters`, `onFilter`, `filteredValue`, `defaultFilteredValue`,
// `filterMultiple` and the `onFilterChange` split of antd's table-level `onChange`.
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; name: string; status: string };

const data: Row[] = [
  { id: "1", name: "田中", status: "active" },
  { id: "2", name: "佐藤", status: "closed" },
  { id: "3", name: "鈴木", status: "active" },
];

const STATUS_FILTERS = [
  { text: "稼働中", value: "active" },
  { text: "終了", value: "closed" },
];

const names = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('tbody td[data-column-key="name"]')).map(
    (cell) => cell.textContent,
  );

describe("DataTable — antd column `filters`", () => {
  it("adds a filter menu to the header only for a column that declares filters", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "name", header: "名前" },
      { key: "status", header: "状態", filters: STATUS_FILTERS },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    expect(
      container.querySelectorAll('th[data-column-key="status"] .ui-data-table-filter-trigger'),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll('th[data-column-key="name"] .ui-data-table-filter-trigger'),
    ).toHaveLength(0);
  });

  it("filters the rows through the column's `onFilter`", async () => {
    const user = userEvent.setup();
    const columns: ColumnDef<Row>[] = [
      { key: "name", header: "名前" },
      {
        key: "status",
        header: "状態",
        filters: STATUS_FILTERS,
        onFilter: (value, row) => row.status === value,
      },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    expect(names(container)).toEqual(["田中", "佐藤", "鈴木"]);

    await user.click(container.querySelector(".ui-data-table-filter-trigger")!);
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "稼働中" }));
    expect(names(container)).toEqual(["田中", "鈴木"]);
  });

  it("falls back to equality on the column's own value when no `onFilter` is given", async () => {
    const user = userEvent.setup();
    const columns: ColumnDef<Row>[] = [
      { key: "name", header: "名前" },
      { key: "status", header: "状態", filters: STATUS_FILTERS },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    await user.click(container.querySelector(".ui-data-table-filter-trigger")!);
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "終了" }));
    expect(names(container)).toEqual(["佐藤"]);
  });

  it("seeds the filter from `defaultFilteredValue` with no interaction", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "name", header: "名前" },
      {
        key: "status",
        header: "状態",
        filters: STATUS_FILTERS,
        defaultFilteredValue: ["closed"],
        onFilter: (value, row) => row.status === value,
      },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    expect(names(container)).toEqual(["佐藤"]);
    expect(container.querySelector(".ui-data-table-filter-trigger")).toHaveAttribute(
      "data-filtered",
      "",
    );
  });

  it("lets a controlled `filteredValue` own the selection — the column never self-filters", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const columns: ColumnDef<Row>[] = [
      { key: "name", header: "名前" },
      {
        key: "status",
        header: "状態",
        filters: STATUS_FILTERS,
        filteredValue: ["active"],
        onFilter: (value, row) => row.status === value,
      },
    ];
    const { container } = render(
      <DataTable data={data} columns={columns} onFilterChange={onFilterChange} />,
    );
    expect(names(container)).toEqual(["田中", "鈴木"]);

    await user.click(container.querySelector(".ui-data-table-filter-trigger")!);
    await user.click(await screen.findByRole("menuitemcheckbox", { name: "終了" }));
    // It REPORTS the new selection…
    expect(onFilterChange).toHaveBeenLastCalledWith({ status: ["active", "closed"] });
    // …and leaves the rows where the consumer put them.
    expect(names(container)).toEqual(["田中", "鈴木"]);
  });

  it("renders a single-choice menu when `filterMultiple` is false", async () => {
    const user = userEvent.setup();
    const columns: ColumnDef<Row>[] = [
      { key: "name", header: "名前" },
      {
        key: "status",
        header: "状態",
        filters: STATUS_FILTERS,
        filterMultiple: false,
        onFilter: (value, row) => row.status === value,
      },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    await user.click(container.querySelector(".ui-data-table-filter-trigger")!);
    expect(screen.queryByRole("menuitemcheckbox")).toBeNull();
    await user.click(await screen.findByRole("menuitemradio", { name: "終了" }));
    expect(names(container)).toEqual(["佐藤"]);
  });

  it("clears the column from the reset entry", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const columns: ColumnDef<Row>[] = [
      { key: "name", header: "名前" },
      {
        key: "status",
        header: "状態",
        filters: STATUS_FILTERS,
        defaultFilteredValue: ["closed"],
        onFilter: (value, row) => row.status === value,
      },
    ];
    const { container } = render(
      <DataTable data={data} columns={columns} onFilterChange={onFilterChange} />,
    );
    expect(names(container)).toEqual(["佐藤"]);
    await user.click(container.querySelector(".ui-data-table-filter-trigger")!);
    const items = await screen.findAllByRole("menuitem");
    await user.click(items[items.length - 1]);
    expect(names(container)).toEqual(["田中", "佐藤", "鈴木"]);
    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });
});
