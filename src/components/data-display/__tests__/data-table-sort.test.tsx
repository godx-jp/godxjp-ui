import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; name: string; email: string };

const data: Row[] = [
  { id: "1", name: "田中", email: "tanaka@x.jp" },
  { id: "2", name: "佐藤", email: "sato@x.jp" },
];

const columns: ColumnDef<Row>[] = [
  { key: "name", header: "名前", render: (r) => r.name, sortable: true },
  { key: "email", header: "メール", render: (r) => r.email },
];

describe("DataTable sorting", () => {
  it("cycles a sortable column asc → desc → cleared via onSortChange", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const { rerender } = render(
      <DataTable data={data} columns={columns} onSortChange={onSortChange} />,
    );
    const header = () => screen.getByRole("button", { name: "名前" });

    // 1st click — no current sort → asc
    await user.click(header());
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "asc" });

    // asc → desc
    rerender(
      <DataTable
        data={data}
        columns={columns}
        sort={{ key: "name", direction: "asc" }}
        onSortChange={onSortChange}
      />,
    );
    await user.click(header());
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "desc" });

    // desc → cleared
    rerender(
      <DataTable
        data={data}
        columns={columns}
        sort={{ key: "name", direction: "desc" }}
        onSortChange={onSortChange}
      />,
    );
    await user.click(header());
    expect(onSortChange).toHaveBeenLastCalledWith(undefined);
  });

  it("switching to a different sortable column resets to asc", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const cols: ColumnDef<Row>[] = [
      { key: "name", header: "名前", render: (r) => r.name, sortable: true },
      { key: "email", header: "メール", render: (r) => r.email, sortable: true },
    ];
    render(
      <DataTable
        data={data}
        columns={cols}
        sort={{ key: "name", direction: "desc" }}
        onSortChange={onSortChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "メール" }));
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "email", direction: "asc" });
  });

  it("a non-sortable header does nothing", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<DataTable data={data} columns={columns} onSortChange={onSortChange} />);
    await user.click(screen.getByRole("columnheader", { name: "メール" }));
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it("is a no-op when sortable but no onSortChange handler is supplied", async () => {
    const user = userEvent.setup();
    render(<DataTable data={data} columns={columns} />);
    // without onSortChange the header renders plain text (no sort button) — clicking is harmless
    await user.click(screen.getByRole("columnheader", { name: "名前" }));
    expect(screen.getByText("田中")).toBeInTheDocument();
  });
});
