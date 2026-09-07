// antd 6.6.2 parity — `summary`, `scroll`, `sticky`, `onRow`, `bordered` and the
// `pagination` object surface.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ruleSelectors } from "@/test/css-selector";
import { DataTable, type ColumnDef } from "../data-table";
import { TableCell, TableRow } from "../table";

const tableCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/table-layout.css"),
  "utf8",
);

type Row = { id: string; name: string; amount: number };

const data: Row[] = [
  { id: "a", name: "田中", amount: 100 },
  { id: "b", name: "佐藤", amount: 250 },
];

const columns: ColumnDef<Row>[] = [
  { key: "name", header: "名前" },
  { key: "amount", header: "金額", align: "right" },
];

describe("DataTable — antd `summary`", () => {
  it("renders a totals row in a real <tfoot> over the rows currently shown", () => {
    const { container } = render(
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        summary={(rows) => (
          <TableRow>
            <TableCell>合計</TableCell>
            <TableCell>{rows.reduce((sum, row) => sum + row.amount, 0)}</TableCell>
          </TableRow>
        )}
      />,
    );
    const foot = container.querySelector("tfoot")!;
    expect(foot).toHaveClass("ui-data-table-summary");
    expect(within(foot).getByText("350")).toBeInTheDocument();
  });

  it("adds no footer at all without the prop", () => {
    const { container } = render(<DataTable data={data} columns={columns} />);
    expect(container.querySelector("tfoot")).toBeNull();
  });
});

describe("DataTable — antd `scroll`", () => {
  it("publishes both lengths as custom properties and flags the axis", () => {
    const { container } = render(
      <DataTable data={data} columns={columns} scroll={{ x: 900, y: "20rem" }} />,
    );
    const region = container.querySelector(".ui-data-table-scroll") as HTMLElement;
    expect(region).toHaveAttribute("data-scroll-x", "");
    expect(region).toHaveAttribute("data-scroll-y", "");
    expect(region.style.getPropertyValue("--table-scroll-inline-size")).toBe("900px");
    expect(region.style.getPropertyValue("--table-scroll-block-size")).toBe("20rem");
    // `scroll.x` also makes the column widths authoritative — antd's own switch.
    expect(container.querySelector(".ui-data-table-surface")).toHaveAttribute(
      "data-table-layout",
      "fixed",
    );
  });

  it("puts the x floor on the SURFACE as well as the table, or the region never scrolls", () => {
    // Measured, not assumed: the surface is `overflow: clip`, so with the floor on the table alone
    // the table painted 1450px inside an 848px surface and `.ui-data-table-scroll` reported
    // scrollWidth === clientWidth === 848 — `scroll.x` produced a table nobody could reach.
    const selectors = ruleSelectors(tableCss, ".ui-data-table-scroll[data-scroll-x]");
    const { container } = render(<DataTable data={data} columns={columns} scroll={{ x: 900 }} />);
    const region = container.querySelector(".ui-data-table-scroll") as HTMLElement;
    const surface = container.querySelector(".ui-data-table-surface")!;
    const table = container.querySelector('[data-slot="table"]')!;
    // jsdom does not lay the table out, but it does resolve selectors — which is the claim here.
    const scoped = selectors.map((selector) => selector.replace(".ui-data-table-scroll", ""));
    const matches = (el: Element) =>
      scoped.some((selector) => {
        const trimmed = selector.replace(/^\[data-scroll-x\]\s*/, "");
        return el.matches(trimmed);
      });
    expect(region).toHaveAttribute("data-scroll-x", "");
    expect(matches(surface)).toBe(true);
    expect(matches(table)).toBe(true);
  });

  it("flags neither axis when nothing asked for one", () => {
    const { container } = render(<DataTable data={data} columns={columns} />);
    const region = container.querySelector(".ui-data-table-scroll")!;
    expect(region).not.toHaveAttribute("data-scroll-x");
    expect(region).not.toHaveAttribute("data-scroll-y");
  });
});

describe("DataTable — antd `sticky`", () => {
  it("publishes `offsetHeader` as the sticky offset token", () => {
    const { container } = render(
      <DataTable data={data} columns={columns} sticky={{ offsetHeader: 56 }} />,
    );
    const region = container.querySelector(".ui-data-table-scroll") as HTMLElement;
    expect(region.style.getPropertyValue("--table-sticky-offset")).toBe("56px");
    expect(container.querySelector("thead")).toHaveClass("ui-data-table-sticky-header");
  });

  it("supersedes stickyHeader when set to false", () => {
    const { container } = render(
      <DataTable data={data} columns={columns} stickyHeader sticky={false} />,
    );
    expect(container.querySelector("thead")).not.toHaveClass("ui-data-table-sticky-header");
  });
});

describe("DataTable — antd `onRow`", () => {
  it("merges the returned props onto the <tr> and composes with the row click", async () => {
    const user = userEvent.setup();
    const seen: string[] = [];
    const onRowClick = vi.fn();
    const { container } = render(
      <DataTable
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        onRowClick={onRowClick}
        onRow={(row, index) => ({
          "data-row-key": row.id,
          "data-row-index": String(index),
          onClick: () => seen.push(row.id),
        })}
      />,
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows[1]).toHaveAttribute("data-row-key", "b");
    expect(rows[1]).toHaveAttribute("data-row-index", "1");

    await user.click(screen.getByText("佐藤"));
    // BOTH handlers ran — onRow does not replace the built-in row behaviour.
    expect(seen).toEqual(["b"]);
    expect(onRowClick).toHaveBeenCalledWith(data[1]);
  });
});

describe("DataTable — antd `bordered`", () => {
  it("forwards the column rules to the table primitive", () => {
    const { container } = render(<DataTable data={data} columns={columns} bordered />);
    expect(container.querySelector('[data-slot="table"]')).toHaveClass("ui-table-bordered");
  });

  it("stays unbordered by default", () => {
    const { container } = render(<DataTable data={data} columns={columns} />);
    expect(container.querySelector('[data-slot="table"]')).not.toHaveClass("ui-table-bordered");
  });
});

describe("DataTable — antd `pagination` object surface", () => {
  const many: Row[] = Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    name: `行${i + 1}`,
    amount: i,
  }));

  it("reads a 1-BASED `current` and a server `total`", () => {
    render(
      <DataTable
        data={many.slice(10)}
        columns={columns}
        getRowId={(r) => r.id}
        manualPagination
        pagination={{ current: 2, pageSize: 10, total: 12 }}
      >
        <DataTable.Content />
        <DataTable.Pagination />
      </DataTable>,
    );
    expect(screen.getByText("行11")).toBeInTheDocument();
    // Page 2 of 2 — the label proves both `current` and `total` were read.
    expect(screen.getByText(/2\s*\/\s*2/)).toBeInTheDocument();
  });

  it("reports page changes through the config's own onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DataTable data={many} columns={columns} getRowId={(r) => r.id} pagination={{ onChange }}>
        <DataTable.Content />
        <DataTable.Pagination />
      </DataTable>,
    );
    const pager = container.querySelector(".ui-data-table-pagination") as HTMLElement;
    await user.click(within(pager).getAllByRole("button")[1]);
    expect(onChange).toHaveBeenLastCalledWith(2, 10);
  });

  it("takes its page-size options from the config", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        data={many}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ pageSizeOptions: [5, 25] }}
      >
        <DataTable.Content />
        <DataTable.Pagination />
      </DataTable>,
    );
    await user.click(screen.getByRole("combobox"));
    const options = await screen.findAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["5", "25"]);
  });

  it("drops the size changer when `showSizeChanger` is false", () => {
    render(
      <DataTable
        data={many}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ showSizeChanger: false }}
      >
        <DataTable.Content />
        <DataTable.Pagination />
      </DataTable>,
    );
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("hides the pager entirely on `pagination={false}` and stops slicing the rows", () => {
    const { container } = render(
      <DataTable data={many} columns={columns} getRowId={(r) => r.id} pagination={false}>
        <DataTable.Content />
        <DataTable.Pagination />
      </DataTable>,
    );
    expect(container.querySelector(".ui-data-table-pagination")).toBeNull();
    expect(screen.getByText("行12")).toBeInTheDocument();
  });

  it("keeps accepting the TanStack { pageIndex, pageSize } shape", () => {
    render(
      <DataTable
        data={many}
        columns={columns}
        getRowId={(r) => r.id}
        pagination={{ pageIndex: 1, pageSize: 10 }}
      >
        <DataTable.Content />
        <DataTable.Pagination />
      </DataTable>,
    );
    expect(screen.getByText("行11")).toBeInTheDocument();
    expect(screen.queryByText("行1")).toBeNull();
  });
});
