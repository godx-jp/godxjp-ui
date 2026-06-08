import { describe, expect, it, vi } from "vitest";
import { within } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DataTable } from "../data-table";

describe("DataTable — default getRowId (noopGetRowId)", () => {
  it("derives a string id from a numeric row id", async () => {
    const user = userEvent.setup();
    const onSelectChange = vi.fn();
    renderWithUi(
      <DataTable
        data={[{ id: 1, name: "Mai" }]}
        columns={[{ key: "name", header: "名前" }]}
        selectable
        onSelectChange={onSelectChange}
      />,
    );
    const row = screen.getByText("Mai").closest("tr")!;
    await user.click(within(row).getByRole("checkbox"));
    expect(onSelectChange).toHaveBeenLastCalledWith(new Set(["1"]));
  });

  it("falls back to an empty id when the row has none", async () => {
    const user = userEvent.setup();
    const onSelectChange = vi.fn();
    renderWithUi(
      <DataTable
        data={[{ name: "Ken" }]}
        columns={[{ key: "name", header: "名前" }]}
        selectable
        onSelectChange={onSelectChange}
      />,
    );
    const row = screen.getByText("Ken").closest("tr")!;
    await user.click(within(row).getByRole("checkbox"));
    expect(onSelectChange).toHaveBeenLastCalledWith(new Set([""]));
  });
});

describe("DataTable — keyboard row activation", () => {
  it("Enter and Space on a focused row fire onRowClick", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderWithUi(
      <DataTable
        data={[{ id: "1", name: "Mai" }]}
        columns={[{ key: "name", header: "名前" }]}
        getRowId={(r) => r.id}
        onRowClick={onRowClick}
      />,
    );
    const row = screen.getByText("Mai").closest("tr")!;
    row.focus();
    await user.keyboard("{Enter}");
    expect(onRowClick).toHaveBeenCalledTimes(1);
    await user.keyboard("[Space]");
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });
});

describe("DataTable — cell rendering", () => {
  it("renders custom cells, stringifies primitives and shows — for empty/complex values", () => {
    renderWithUi(
      <DataTable
        data={[{ id: "1", name: "Mai", age: 30, note: null, meta: { a: 1 }, c: "x" }]}
        getRowId={(r) => r.id}
        columns={[
          { key: "name", header: "名前" },
          { key: "age", header: "年齢" },
          { key: "note", header: "備考" },
          { key: "meta", header: "メタ" },
          { key: "c", header: "操作", render: (r) => <b>詳細-{r.name}</b> },
        ]}
      />,
    );
    expect(screen.getByText("Mai")).toBeInTheDocument(); // string
    expect(screen.getByText("30")).toBeInTheDocument(); // number → String
    expect(screen.getByText("詳細-Mai")).toBeInTheDocument(); // custom render
    // null and an object both fall back to the em-dash placeholder
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });
});
