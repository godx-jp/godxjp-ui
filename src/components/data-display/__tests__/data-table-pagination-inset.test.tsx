import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { renderWithUi } from "@/test/render";
import { Card, CardContent } from "../card";
import { DataTable, type ColumnDef } from "../data-table";

/**
 * gh#236 — `DataTable.Pagination` declared ONLY `padding-top`, so in the documented flush container
 * (`<Card><CardContent flush><DataTable/>`) the "rows per page" label and the page-size Select sat
 * flush against the container edge and its closing border.
 *
 * jsdom performs NO layout, so the pixel geometry cannot be measured here (same reasoning as
 * list-row-responsive.test.tsx). The guarantee is therefore split: the CSS CONTRACT that produces
 * the inset is asserted against the stylesheet + token tier, and the RENDERED contract (both
 * pagination modes carry the class that owns the inset) is asserted against the components.
 *
 * Browser evidence (Playwright/Chromium, preview `data-display-data-table-index`):
 *   before → computed padding `7.36px 0 0 0` (numbered) / `8.64px 0 0 0` (cursor);
 *            label inline-start 24px vs first-column text 37px at 1440 — 13px off axis, flush edge.
 *   after  → `7.36px 12px 7.36px 12px` / `8.64px 12px 8.64px 12px` at 1440/1024/390;
 *            label inline-start 36px vs first-column text 37px (the 1px table border) — on axis,
 *            and the block-end padding restores the breathing room before the Card border.
 * The block value still differs per density scope (7.36 vs 8.64), which proves the tokens are NOT
 * frozen at `:root` — they are `initial` with the default resolved at the call site.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const tableCss = read("../../../styles/table-layout.css");
const tokenCss = read("../../../tokens/components/table.css");

const paginationRule = (() => {
  const at = tableCss.indexOf(".ui-data-table-pagination {");
  expect(at, "missing .ui-data-table-pagination rule").toBeGreaterThan(-1);
  return tableCss.slice(at, tableCss.indexOf("}", at) + 1);
})();

type Row = { id: string; partner: string };
const columns: ColumnDef<Row>[] = [
  { key: "id", header: "番号" },
  { key: "partner", header: "取引先" },
];
const rows: Row[] = Array.from({ length: 12 }, (_, i) => ({
  id: `INV-${i + 1}`,
  partner: `取引先${i + 1}`,
}));

describe("DataTable.Pagination footer inset (gh#236)", () => {
  it("owns padding on BOTH axes instead of block-start only", () => {
    expect(paginationRule).toMatch(/padding-block:\s*var\(--table-pagination-padding-y/);
    expect(paginationRule).toMatch(/padding-inline:\s*var\(--table-pagination-padding-x/);
    // the original single-axis declaration must not come back
    expect(paginationRule).not.toMatch(/padding-top\s*:/);
    expect(paginationRule).not.toMatch(/(?:^|[^-])padding\s*:/);
  });

  it("keeps the block default and puts the label on the first column's optical axis", () => {
    // block default = the previous padding-top value, now on both block edges
    expect(paginationRule).toMatch(
      /padding-block:\s*var\(--table-pagination-padding-y,\s*var\(--space-stack-sm\)\)/,
    );
    // inline default = the table's own cell inline padding
    expect(paginationRule).toMatch(
      /padding-inline:\s*var\(--table-pagination-padding-x,\s*var\(--table-cell-space-x\)\)/,
    );
  });

  it("declares both knobs `initial` so the density-scaled defaults resolve at the call site", () => {
    // docs/TOKENS.md — a :root binding to a density-scaled token freezes the footer at the :root
    // density; `initial` + a call-site default lets a `.ui-density-*` subtree re-resolve it.
    expect(tokenCss).toMatch(/--table-pagination-padding-y:\s*initial/);
    expect(tokenCss).toMatch(/--table-pagination-padding-x:\s*initial/);
  });

  it('uses logical properties only, so the inset flips under dir="rtl"', () => {
    expect(paginationRule).not.toMatch(/padding-(?:left|right)\s*:/);
  });

  it("renders the numbered footer with the class that owns the inset, inside a flush Card", () => {
    const { container } = renderWithUi(
      <Card>
        <CardContent flush>
          <DataTable columns={columns} data={rows} getRowId={(r) => r.id}>
            <DataTable.Content />
            <DataTable.Pagination pageSizeOptions={[10, 25, 50]} />
          </DataTable>
        </CardContent>
      </Card>,
    );
    const footer = container.querySelector(".ui-data-table-pagination");
    expect(footer).not.toBeNull();
    expect(footer).toHaveClass("ui-data-table-pagination--numbered");
    expect(footer?.querySelector(".ui-data-table-page-size-label")).not.toBeNull();
  });

  it("renders the cursor footer with the same inset-owning class", () => {
    const { container } = renderWithUi(
      <Card>
        <CardContent flush>
          <DataTable columns={columns} data={rows} getRowId={(r) => r.id}>
            <DataTable.Content />
            <DataTable.Pagination hasMore onChange={() => {}} />
          </DataTable>
        </CardContent>
      </Card>,
    );
    expect(container.querySelector(".ui-data-table-pagination")).not.toBeNull();
  });
});
