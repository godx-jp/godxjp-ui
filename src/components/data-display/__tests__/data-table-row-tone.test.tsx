import { describe, expect, it } from "vitest";

import { DataTable, type ColumnDef } from "../data-table";
import { renderWithUi, screen, within } from "@/test/render";

type Row = { id: string; partner: string; status: "ok" | "late" | "failed" };

const DATA: Row[] = [
  { id: "A-1", partner: "株式会社ベトヤ", status: "ok" },
  { id: "A-2", partner: "ハノイ物流", status: "late" },
  { id: "A-3", partner: "東京ロジ", status: "failed" },
];

const COLUMNS: ColumnDef<Row>[] = [
  { key: "id", header: "番号" },
  { key: "partner", header: "取引先" },
];

/**
 * Before `rowTone` the only per-row paint axis was `rowClassName`, and `ui-audit` blocks utilities
 * inside it in a consumer (its rule matches any prop whose name ENDS in `class`/`className`, so
 * the arrow body is scanned by every colour and spacing rule). Consumers fell back to a badge in a
 * cell and the row itself stayed unmarked.
 *
 * Rows are found by ROLE and by their visible text, never by class.
 */
describe("DataTable — rowTone", () => {
  const tone = (row: Row) =>
    row.status === "failed"
      ? ("destructive" as const)
      : row.status === "late"
        ? ("attention" as const)
        : undefined;

  const rowFor = (name: string) =>
    screen.getAllByRole("row").find((r) => within(r).queryByText(name))!;

  it("marks only the rows the resolver names", () => {
    renderWithUi(<DataTable data={DATA} columns={COLUMNS} getRowId={(r) => r.id} rowTone={tone} />);
    expect(rowFor("東京ロジ")).toHaveAttribute("data-tone", "destructive");
    expect(rowFor("ハノイ物流")).toHaveAttribute("data-tone", "attention");
    expect(rowFor("株式会社ベトヤ")).not.toHaveAttribute("data-tone");
  });

  it("emits no attribute at all when no rowTone is given", () => {
    renderWithUi(<DataTable data={DATA} columns={COLUMNS} getRowId={(r) => r.id} />);
    for (const row of DATA) {
      expect(rowFor(row.partner)).not.toHaveAttribute("data-tone");
    }
  });

  it("leaves the row's own content and semantics untouched", () => {
    renderWithUi(<DataTable data={DATA} columns={COLUMNS} getRowId={(r) => r.id} rowTone={tone} />);
    const row = rowFor("東京ロジ");
    expect(within(row).getByText("A-3")).toBeInTheDocument();
    // The tone is decoration on top of the row, never a substitute for the row's own name.
    expect(row).toHaveAttribute("data-tone", "destructive");
    expect(screen.getAllByRole("row")).toHaveLength(DATA.length + 1);
  });

  it("does not fight row selection — a toned row can still be selected", () => {
    renderWithUi(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        rowTone={tone}
        selectable
        selected={new Set(["A-3"])}
        onSelectChange={() => {}}
      />,
    );
    const row = rowFor("東京ロジ");
    expect(row).toHaveAttribute("data-tone", "destructive");
    expect(row).toHaveAttribute("data-state", "selected");
  });
});
