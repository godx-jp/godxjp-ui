// gh#1036 — server-paged selection: the header checkbox can be NAMED (`rowSelection.selectAllLabel`),
// "select all N matching" is offered by `rowSelection.matching`, and antd's `SELECTION_*` built-ins
// mix with custom entries in a `selections` list.
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppProvider } from "@/app/app-provider";
import type { AppLocale } from "@/app/types";
import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; name: string };

const page1: Row[] = [
  { id: "a", name: "田中" },
  { id: "b", name: "佐藤" },
  { id: "c", name: "鈴木" },
];
const page2: Row[] = [
  { id: "d", name: "高橋" },
  { id: "e", name: "伊藤" },
];
const columns: ColumnDef<Row>[] = [{ key: "name", header: "名前" }];

const rowBoxes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('tbody input[type="checkbox"]')) as HTMLInputElement[];
const headerBox = (container: HTMLElement) =>
  container.querySelector('thead input[type="checkbox"]') as HTMLInputElement;
const inLocale = (locale: AppLocale, node: React.ReactNode) => (
  <AppProvider persist={false} defaultLocale={locale} fallbackLocale="en">
    {node}
  </AppProvider>
);

/** A consumer wired the way the issue describes: controlled keys + controlled "matching". */
function ServerPaged({
  data = page1,
  total = 4112,
  initialSelected = false,
  onSelectedChange,
  onChange,
}: {
  data?: Row[];
  total?: number;
  initialSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  onChange?: (keys: string[]) => void;
}) {
  const [keys, setKeys] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState(initialSelected);
  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(r) => r.id}
      manualPagination
      rowSelection={{
        selectedRowKeys: keys,
        onChange: (next) => {
          setKeys(next);
          onChange?.(next);
        },
        matching: {
          total,
          selected,
          onSelectedChange: (next) => {
            setSelected(next);
            onSelectedChange?.(next);
          },
        },
      }}
    />
  );
}

describe("DataTable — header checkbox name (gh#1036)", () => {
  it("is named by `rowSelection.selectAllLabel`", () => {
    const { container } = render(
      <DataTable
        data={page1}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{ selectAllLabel: "このページの3件を選択" }}
      />,
    );
    expect(headerBox(container)).toHaveAttribute("aria-label", "このページの3件を選択");
  });

  it("keeps the name next to the `selections` menu too", () => {
    const { container } = render(
      <DataTable
        data={page1}
        columns={columns}
        getRowId={(r) => r.id}
        rowSelection={{ selectAllLabel: "Select this page", selections: true }}
      />,
    );
    expect(headerBox(container)).toHaveAttribute("aria-label", "Select this page");
  });

  it("says 'on this page' by default once `matching` declares the table server-paged", () => {
    const { container } = render(inLocale("en", <ServerPaged />));
    expect(headerBox(container)).toHaveAttribute("aria-label", "Select all rows on this page");
  });

  it("changes nothing for a table that does not opt in", () => {
    const { container } = render(
      inLocale(
        "en",
        <DataTable data={page1} columns={columns} getRowId={(r) => r.id} rowSelection={{}} />,
      ),
    );
    expect(headerBox(container)).toHaveAttribute("aria-label", "Select all rows");
    expect(container.querySelector(".ui-data-table-matching")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("DataTable — select all N matching (gh#1036)", () => {
  it("offers the whole result set only once the page is fully ticked — ja copy, Intl grouping", async () => {
    const user = userEvent.setup();
    const { container } = render(inLocale("ja", <ServerPaged />));
    // The live region is there BEFORE it speaks, and silent.
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");
    expect(container.querySelector(".ui-data-table-matching")).not.toHaveAttribute("data-active");

    await user.click(rowBoxes(container)[0]);
    expect(status).toHaveTextContent("");

    await user.click(headerBox(container));
    expect(status).toHaveTextContent("このページの3件を選択中");
    expect(screen.getByRole("button", { name: "4,112件すべてを選択" })).toBeInTheDocument();
    expect(container.querySelector(".ui-data-table-matching")).toHaveAttribute("data-active", "");
  });

  it("uses CLDR plurals in English", async () => {
    const user = userEvent.setup();
    const { container, unmount } = render(inLocale("en", <ServerPaged />));
    await user.click(headerBox(container));
    expect(screen.getByRole("status")).toHaveTextContent("All 3 rows on this page are selected.");
    expect(
      screen.getByRole("button", { name: "Select all 4,112 matching rows" }),
    ).toBeInTheDocument();
    unmount();

    const single = render(inLocale("en", <ServerPaged data={[page1[0]]} total={2} />));
    await user.click(headerBox(single.container));
    expect(screen.getByRole("status")).toHaveTextContent("1 row on this page is selected.");
  });

  it("is not offered when the page already holds every matching row", async () => {
    const user = userEvent.setup();
    const { container } = render(inLocale("en", <ServerPaged total={3} />));
    await user.click(headerBox(container));
    expect(screen.getByRole("status")).toHaveTextContent("");
    expect(screen.queryByRole("button", { name: /matching/ })).toBeNull();
  });

  it("flips into matching mode, keeps focus on the action, and names the way back", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const { container } = render(
      inLocale("en", <ServerPaged onSelectedChange={onSelectedChange} />),
    );
    await user.click(headerBox(container));
    const action = screen.getByRole("button", { name: "Select all 4,112 matching rows" });
    await user.click(action);
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("status")).toHaveTextContent("All 4,112 matching rows are selected.");
    const clear = screen.getByRole("button", { name: "Clear selection" });
    // Same element, relabelled — focus does not fall to <body>.
    expect(clear).toBe(action);
    expect(clear).toHaveFocus();
  });

  it("shows every row of ANOTHER page as selected while matching is on", () => {
    const { container } = render(inLocale("en", <ServerPaged data={page2} initialSelected />));
    expect(rowBoxes(container).map((box) => box.checked)).toEqual([true, true]);
    expect(headerBox(container)).toBeChecked();
  });

  it("leaves matching mode when any row is unticked", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const onChange = vi.fn();
    const { container } = render(
      inLocale(
        "en",
        <ServerPaged initialSelected onSelectedChange={onSelectedChange} onChange={onChange} />,
      ),
    );
    await user.click(rowBoxes(container)[1]);
    expect(onSelectedChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(onChange).toHaveBeenLastCalledWith(["a", "c"]);
  });

  it("'Clear selection' clears the page and reports false exactly once", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const onChange = vi.fn();
    const { container } = render(
      inLocale(
        "en",
        <ServerPaged initialSelected onSelectedChange={onSelectedChange} onChange={onChange} />,
      ),
    );
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onSelectedChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(rowBoxes(container).every((box) => !box.checked)).toBe(true);
    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});

describe("DataTable — antd `SELECTION_*` built-ins in a `selections` list (gh#1036)", () => {
  it("publishes antd's constant values", () => {
    expect(DataTable.SELECTION_ALL).toBe("SELECT_ALL");
    expect(DataTable.SELECTION_INVERT).toBe("SELECT_INVERT");
    expect(DataTable.SELECTION_NONE).toBe("SELECT_NONE");
  });

  it("mixes built-ins with custom entries, in the order given", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = render(
      inLocale(
        "en",
        <DataTable
          data={page1}
          columns={columns}
          getRowId={(r) => r.id}
          rowSelection={{
            defaultSelectedRowKeys: ["a"],
            selections: [
              DataTable.SELECTION_INVERT,
              { key: "odd", text: "Odd rows", onSelect },
              DataTable.SELECTION_NONE,
            ],
          }}
        />,
      ),
    );
    await user.click(container.querySelector(".ui-data-table-selection-trigger")!);
    const menu = await screen.findByRole("menu");
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Invert selection", "Odd rows", "Clear selection"]);
    await user.click(within(menu).getByRole("menuitem", { name: "Invert selection" }));
    expect(rowBoxes(container).map((box) => box.checked)).toEqual([false, true, true]);
  });
});
