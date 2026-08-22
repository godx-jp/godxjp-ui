import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderWithUi } from "@/test/render";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

/**
 * gh#274 — `<Table bordered>` draws the full cell grid (outer frame + vertical
 * column rules) so rowSpan/colSpan merged cells read as merged. Default stays
 * byte-identical: no class emitted without the prop.
 */

function grid(bordered: boolean) {
  return renderWithUi(
    <Table bordered={bordered}>
      <TableHeader>
        <TableRow>
          <TableHead>グループ</TableHead>
          <TableHead>機能名</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell rowSpan={2}>問い合わせ</TableCell>
          <TableCell>問い合わせ一覧</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>既存顧客検索</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

describe("Table bordered (gh#274)", () => {
  it("stamps ui-table-bordered on the table element when bordered", () => {
    const { container } = grid(true);
    const table = container.querySelector('[data-slot="table"]') as HTMLTableElement;
    expect(table).toHaveClass("ui-table-bordered");
  });

  it("emits nothing without the prop — the plain table stays byte-identical", () => {
    const { container } = grid(false);
    const table = container.querySelector('[data-slot="table"]') as HTMLTableElement;
    expect(table.className).not.toContain("ui-table-bordered");
  });

  it("keeps the grid colour on the --table-border-color token (call-site resolution)", () => {
    const css = readFileSync(join(__dirname, "../../../styles/table-layout.css"), "utf8");
    expect(css).toContain(".ui-table-bordered");
    expect(css).toContain("var(--table-border-color, hsl(var(--border)))");
    // The token must stay `initial` in the token file — a :root hsl(var(--border))
    // binding would freeze the role against scoped theme overrides.
    const tokens = readFileSync(join(__dirname, "../../../tokens/components/table.css"), "utf8");
    expect(tokens).toMatch(/--table-border-color: initial;/);
  });
});
