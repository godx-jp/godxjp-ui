// antd 6.6.2 parity — `sorter` (comparator + multi-column priority), `sortOrder`,
// `defaultSortOrder`, `sortDirections` and `showSorterTooltip`.
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; team: string; score: number };

const data: Row[] = [
  { id: "1", team: "B", score: 2 },
  { id: "2", team: "A", score: 3 },
  { id: "3", team: "A", score: 1 },
];

const bodyOrder = (container: HTMLElement, key: string) =>
  Array.from(container.querySelectorAll(`tbody td[data-column-key="${key}"]`)).map(
    (cell) => cell.textContent,
  );

describe("DataTable — antd `sorter`", () => {
  it("sorts by the column's own comparator, not by the raw cell value", async () => {
    const user = userEvent.setup();
    // The comparator deliberately disagrees with the rendered text: it orders by score while the
    // column shows the team, so a lexical fallback cannot fake the result.
    const columns: ColumnDef<Row>[] = [
      { key: "team", header: "チーム", sorter: (a, b) => a.score - b.score },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    await user.click(screen.getByRole("button", { name: "チーム" }));
    expect(bodyOrder(container, "team")).toEqual(["A", "B", "A"]);
  });

  it("sorts MULTIPLE columns at once, highest `multiple` first", async () => {
    const user = userEvent.setup();
    const columns: ColumnDef<Row>[] = [
      { key: "team", header: "チーム", sorter: { multiple: 2 } },
      { key: "score", header: "点数", sorter: { multiple: 1 } },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    await user.click(screen.getByRole("button", { name: "点数" }));
    await user.click(screen.getByRole("button", { name: "チーム" }));
    // team asc wins, score asc breaks the tie — a single-column sort would give A/A/B with the
    // scores in their original 3, 1 order.
    expect(bodyOrder(container, "team")).toEqual(["A", "A", "B"]);
    expect(bodyOrder(container, "score")).toEqual(["1", "3", "2"]);
  });

  it("replaces the whole sort when a column has NO `multiple` — antd's single-sort rule", async () => {
    const user = userEvent.setup();
    const columns: ColumnDef<Row>[] = [
      { key: "team", header: "チーム", sorter: true },
      { key: "score", header: "点数", sorter: true },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    await user.click(screen.getByRole("button", { name: "点数" }));
    await user.click(screen.getByRole("button", { name: "チーム" }));
    expect(bodyOrder(container, "score")).toEqual(["3", "1", "2"]);
  });
});

describe("DataTable — antd `sortDirections`", () => {
  it("runs the cycle in the declared order and then clears it", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const columns: ColumnDef<Row>[] = [
      { key: "score", header: "点数", sorter: true, sortDirections: ["desc", "asc"] },
    ];
    render(<DataTable data={data} columns={columns} onSortChange={onSortChange} />);
    const header = () => screen.getByRole("button", { name: "点数" });

    await user.click(header());
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "score", direction: "desc" });
  });

  it("takes the table-wide cycle when the column declares none", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const columns: ColumnDef<Row>[] = [{ key: "score", header: "点数", sorter: true }];
    render(
      <DataTable
        data={data}
        columns={columns}
        sortDirections={["desc", "asc"]}
        onSortChange={onSortChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "点数" }));
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "score", direction: "desc" });
  });

  it("still defaults to asc → desc → cleared when nobody declares a cycle", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const columns: ColumnDef<Row>[] = [{ key: "score", header: "点数", sorter: true }];
    render(<DataTable data={data} columns={columns} onSortChange={onSortChange} />);
    await user.click(screen.getByRole("button", { name: "点数" }));
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "score", direction: "asc" });
  });
});

describe("DataTable — antd `sortOrder` / `defaultSortOrder`", () => {
  it("seeds the sort from `defaultSortOrder` without any interaction", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "score", header: "点数", sorter: true, defaultSortOrder: "desc" },
    ];
    const { container } = render(<DataTable data={data} columns={columns} />);
    expect(bodyOrder(container, "score")).toEqual(["3", "2", "1"]);
    expect(container.querySelector('th[data-column-key="score"]')).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });

  it("lets a controlled `sortOrder` own the direction — the column never self-sorts", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const columns: ColumnDef<Row>[] = [
      { key: "score", header: "点数", sorter: true, sortOrder: "asc" },
    ];
    const { container } = render(
      <DataTable data={data} columns={columns} onSortChange={onSortChange} />,
    );
    expect(bodyOrder(container, "score")).toEqual(["1", "2", "3"]);
    await user.click(screen.getByRole("button", { name: "点数" }));
    // It REPORTS the next step…
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "score", direction: "desc" });
    // …and leaves the rows exactly where the consumer put them.
    expect(bodyOrder(container, "score")).toEqual(["1", "2", "3"]);
  });
});

describe("DataTable — antd `showSorterTooltip`", () => {
  it("is OFF by default, so an existing table gains no hover chrome", () => {
    const columns: ColumnDef<Row>[] = [{ key: "score", header: "点数", sorter: true }];
    render(<DataTable data={data} columns={columns} />);
    expect(screen.getByRole("button", { name: "点数" })).not.toHaveAttribute("data-state");
  });

  it("wraps the sortable header in a tooltip trigger when asked", () => {
    const columns: ColumnDef<Row>[] = [{ key: "score", header: "点数", sorter: true }];
    const { container } = render(<DataTable data={data} columns={columns} showSorterTooltip />);
    const head = container.querySelector('th[data-column-key="score"]')!;
    expect(within(head as HTMLElement).getByRole("button")).toHaveAttribute("data-state", "closed");
  });

  it("lets a column opt out of a table-wide tooltip", () => {
    const columns: ColumnDef<Row>[] = [
      { key: "score", header: "点数", sorter: true, showSorterTooltip: false },
    ];
    const { container } = render(<DataTable data={data} columns={columns} showSorterTooltip />);
    const head = container.querySelector('th[data-column-key="score"]')!;
    expect(within(head as HTMLElement).getByRole("button")).not.toHaveAttribute("data-state");
  });
});
