import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { Table, TableBody, TableCell, TableRow } from "../table";
import { DataTable } from "../data-table";

/**
 * gh#894 — a tone Badge composed over a hovered glass table row measured 4.02–4.34:1 on four of
 * five seeds (only `citron` cleared 4.5:1). Root cause, part one: `TableRow`'s own hover fill
 * was a BARE Tailwind utility, `hover:bg-accent/70` — a literal `/70` with no token behind it, so
 * no theme could retune the wash's strength at all. The pinned-column mirror right beside it
 * (`table-layout.css`, `data-display-layout.css`) already read
 * `--table-row-hover-background-alpha`; the row that actually PAINTS the fill was the one piece
 * nothing could reach.
 *
 * This file locks in the part of the fix that lives in this repo: the primary row (and
 * `DataTable`'s own `hoverable` row, which duplicated the same bare literal) now read that same
 * token. The shared numeric default is UNCHANGED at 0.7 — lowering it globally was tried and
 * reverted, because `src/tokens/__tests__/table-stripe-contrast.test.ts` (gh#700) requires
 * alpha >= ~0.68 in the default theme or a hovered striped row stops reading as a visible step
 * beyond the stripe; a shared default cannot satisfy both gh#700 (>= 0.68) and gh#894 (<= 0.40,
 * measured in Chromium against every glass seed). Clearing gh#894 all the way needs GLASS's own
 * lower value for this token, which belongs in its theme file, not here.
 *
 * Reverting `src/components/data-display/table.tsx`'s class string makes the first assertion
 * fail; reverting `data-table.tsx`'s `hoverable` class makes the second.
 */
const here = dirname(fileURLToPath(import.meta.url));
const tableLayoutCss = readFileSync(join(here, "../../../styles/table-layout.css"), "utf8");
const dataDisplayLayoutCss = readFileSync(
  join(here, "../../../styles/data-display-layout.css"),
  "utf8",
);

const TOKEN_HOVER_FILL =
  "hover:[background-color:color-mix(in_oklab,hsl(var(--accent))_var(--table-row-hover-background-alpha,70%),transparent)]";

describe("gh#894 — table row hover fill is token-driven, not a bare fraction", () => {
  it("TableRow's own hover fill reads --table-row-hover-background-alpha, not a bare /70", () => {
    const { container } = renderWithUi(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>row</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = container.querySelector("tbody tr")!;
    expect(row.className).toContain(TOKEN_HOVER_FILL);
    expect(row.className).not.toMatch(/hover:bg-accent\/\d/);
  });

  it("DataTable's `hoverable` row uses the same token-driven fill, not its own bare /70", () => {
    const { container } = renderWithUi(
      <DataTable
        data={[{ id: "1", name: "A" }]}
        columns={[{ key: "name", header: "name" }]}
        getRowId={(r: { id: string }) => r.id}
        hoverable
      />,
    );
    const row = container.querySelector("tbody tr")!;
    expect(row.className).toContain(TOKEN_HOVER_FILL);
    expect(row.className).not.toMatch(/hover:bg-accent\/\d/);
  });

  /**
   * The two pinned-column mirrors (`table-layout.css`'s `.ui-data-table-pin-*` and
   * `data-display-layout.css`'s `.ui-permission-matrix-pin`) and the token's own documented
   * default must all still agree with the primary row — a mismatch here means a pinned cell
   * would visibly disagree with the row it sits in.
   */
  it.each([
    ["table-layout.css (DataTable pin mirror)", () => tableLayoutCss],
    ["data-display-layout.css (PermissionMatrix pin mirror)", () => dataDisplayLayoutCss],
  ])("%s agrees with the primary row's 0.7 default", (_label, read) => {
    const matches = [...read().matchAll(/--table-row-hover-background-alpha,\s*([\d.]+)\)/g)];
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(Number(m[1])).toBeCloseTo(0.7);
    }
  });
});
