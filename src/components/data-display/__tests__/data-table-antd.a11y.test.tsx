// Axe guard for the antd-parity surface. Each addition puts new interactive controls INSIDE the
// table grid — an expand button and a filter menu in cells, a radio in the selection column, a
// <tfoot> totals row — which is exactly where a hand-rolled version breaks table semantics or
// leaves a control nameless.
import { describe, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { DataTable, type ColumnDef } from "../data-table";
import { TableCell, TableRow } from "../table";

type Row = { id: string; name: string; status: string; amount: number };

const DATA: Row[] = [
  { id: "a", name: "Tanaka", status: "active", amount: 100 },
  { id: "b", name: "Sato", status: "closed", amount: 250 },
];

const COLUMNS: ColumnDef<Row>[] = [
  { key: "name", header: "Name", fixed: "start", sorter: true },
  {
    key: "status",
    header: "Status",
    filters: [
      { text: "Active", value: "active" },
      { text: "Closed", value: "closed" },
    ],
    onFilter: (value, row) => row.status === value,
  },
  { key: "amount", header: "Amount", align: "right", ellipsis: true, width: "120px" },
];

describe("DataTable antd-parity a11y", () => {
  it("has no violations with frozen columns, a filter menu, a summary row and expandable rows", async () => {
    await expectNoA11yViolations(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        getRowId={(row) => row.id}
        bordered
        showSorterTooltip
        scroll={{ x: 900, y: "20rem" }}
        rowSelection={{ selections: true }}
        expandable={{
          expandedRowRender: (row) => <p>{row.name} detail</p>,
          defaultExpandAllRows: true,
        }}
        summary={(rows) => (
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell />
            <TableCell>{rows.reduce((sum, row) => sum + row.amount, 0)}</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        )}
      />,
    );
  });

  it("has no violations with a radio selection column", async () => {
    await expectNoA11yViolations(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        getRowId={(row) => row.id}
        rowSelection={{ type: "radio", selectedRowKeys: ["a"] }}
      />,
    );
  });
});
