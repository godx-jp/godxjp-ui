// gh#1036 follow-up — antd semantics for a row `getCheckboxProps` disables: the header checkbox,
// SELECT_ALL / SELECT_INVERT / SELECT_NONE and "all N matching" never change its state, and the
// header's tri-state ignores it (a page whose only unticked rows are disabled reads as checked).
import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppProvider } from "@/app/app-provider";
import { DataTable, type ColumnDef } from "../data-table";

type Row = { id: string; name: string; locked?: boolean };

const rows: Row[] = [
  { id: "a", name: "田中" },
  { id: "b", name: "佐藤", locked: true },
  { id: "c", name: "鈴木" },
];
const columns: ColumnDef<Row>[] = [{ key: "name", header: "名前" }];
const getCheckboxProps = (row: Row) => ({ disabled: row.locked });

const rowBoxes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('tbody input[type="checkbox"]')) as HTMLInputElement[];
const states = (container: HTMLElement) => rowBoxes(container).map((box) => box.checked);
const headerBox = (container: HTMLElement) =>
  container.querySelector('thead input[type="checkbox"]') as HTMLInputElement;

function Table({
  defaultKeys = [],
  matchingSelected,
}: {
  defaultKeys?: string[];
  matchingSelected?: boolean;
}) {
  return (
    <AppProvider persist={false} defaultLocale="en" fallbackLocale="en">
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        manualPagination
        rowSelection={{
          defaultSelectedRowKeys: defaultKeys,
          getCheckboxProps,
          selections: true,
          ...(matchingSelected === undefined
            ? {}
            : { matching: { total: 100, selected: matchingSelected, onSelectedChange: () => {} } }),
        }}
      />
    </AppProvider>
  );
}

async function pick(container: HTMLElement, name: string) {
  const user = userEvent.setup();
  await user.click(container.querySelector(".ui-data-table-selection-trigger")!);
  await user.click(within(await screen.findByRole("menu")).getByRole("menuitem", { name }));
}

describe("DataTable — disabled rows under bulk selection (gh#1036 follow-up)", () => {
  it("the header checkbox skips a disabled row", async () => {
    const { container } = render(<Table />);
    await userEvent.setup().click(headerBox(container));
    expect(states(container)).toEqual([true, false, true]);
  });

  it("reads as fully checked when the only unticked rows are disabled", () => {
    const { container } = render(<Table defaultKeys={["a", "c"]} />);
    expect(headerBox(container)).toBeChecked();
  });

  it("unticking from the header keeps a disabled row's own tick", async () => {
    const { container } = render(<Table defaultKeys={["a", "b", "c"]} />);
    await userEvent.setup().click(headerBox(container));
    expect(states(container)).toEqual([false, true, false]);
  });

  it("SELECT_ALL skips a disabled row", async () => {
    const { container } = render(<Table />);
    await pick(container, "Select all rows");
    expect(states(container)).toEqual([true, false, true]);
  });

  it("SELECT_INVERT leaves a disabled row as it is", async () => {
    const { container } = render(<Table defaultKeys={["a"]} />);
    await pick(container, "Invert selection");
    expect(states(container)).toEqual([false, false, true]);
  });

  it("SELECT_NONE keeps a disabled row's tick", async () => {
    const { container } = render(<Table defaultKeys={["a", "b"]} />);
    await pick(container, "Clear selection");
    expect(states(container)).toEqual([false, true, false]);
  });

  it("`matching.selected` shows a disabled row as it is, not force-ticked", () => {
    const { container } = render(<Table matchingSelected />);
    expect(states(container)).toEqual([true, false, true]);
    expect(headerBox(container)).toBeChecked();
  });
});
