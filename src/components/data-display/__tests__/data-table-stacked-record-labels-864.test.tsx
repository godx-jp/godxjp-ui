import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { DataTable, type ColumnDef } from "../data-table";

/**
 * gh#864 — `preset="stacked-record-collection"` on `DataTable`.
 *
 * Below `collapseBelow` the preset's stylesheet hides `<thead>` and turns every `<tr>` into a
 * card. `src/styles/table-layout.css` states the consequence in its own words: each cell's
 * `label` "takes over the accessible-name role" once the `<th>` association is gone.
 *
 * `Table` + `TableCell label` honours that. `DataTable` did not pass one, so the cards rendered
 * as unlabelled columns of bare values — a price, a date and a stock count stacked with nothing
 * saying which was which, on the exact viewport where the header that explained them is hidden.
 * The label source was already there and already the single source of truth: `ColumnDef.header`.
 */

type Offer = { id: string; merchant: string; total: string; delivery: string };

const rows: Offer[] = [
  { id: "1", merchant: "Sakura Denki", total: "¥12,800", delivery: "9/25" },
  { id: "2", merchant: "Minato Store", total: "¥13,200", delivery: "9/24" },
];

const columns: ColumnDef<Offer>[] = [
  { key: "merchant", header: "販売店" },
  { key: "total", header: "合計" },
  { key: "delivery", header: "お届け" },
];

function labelsIn(container: HTMLElement): string[] {
  return [...container.querySelectorAll(".ui-table-stacked-collection-label")].map(
    (el) => el.textContent ?? "",
  );
}

describe("DataTable preset=stacked-record-collection carries its column labels (gh#864)", () => {
  it("emits one stacked label per body cell, reading the column header", () => {
    const { container } = renderWithUi(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        preset="stacked-record-collection"
      />,
    );
    // 2 rows x 3 columns. Every value in a card must say what it is.
    expect(labelsIn(container)).toEqual(["販売店", "合計", "お届け", "販売店", "合計", "お届け"]);
  });

  it("hides the labels from assistive tech, which reads the real <th> above the collapse step", () => {
    const { container } = renderWithUi(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        preset="stacked-record-collection"
      />,
    );
    for (const el of container.querySelectorAll(".ui-table-stacked-collection-label")) {
      expect(el).toHaveAttribute("aria-hidden", "true");
    }
    // The header row is still the accessible-name source, so it must not have been removed.
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual([
      "販売店",
      "合計",
      "お届け",
    ]);
  });

  it("emits NOTHING for the other presets — an ordinary table gains no extra markup", () => {
    for (const preset of ["default", "action-collection"] as const) {
      const { container, unmount } = renderWithUi(
        <DataTable data={rows} columns={columns} getRowId={(r) => r.id} preset={preset} />,
      );
      expect(labelsIn(container), `preset=${preset}`).toEqual([]);
      unmount();
    }
  });

  it("falls back to `ariaLabel` for a column whose header is deliberately empty", () => {
    const { container } = renderWithUi(
      <DataTable
        data={rows}
        columns={
          [
            { key: "merchant", header: "販売店" },
            { key: "id", header: "", ariaLabel: "操作", render: () => <span>…</span> },
          ] satisfies ColumnDef<Offer>[]
        }
        getRowId={(r) => r.id}
        preset="stacked-record-collection"
      />,
    );
    expect(labelsIn(container)).toEqual(["販売店", "操作", "販売店", "操作"]);
  });
});
