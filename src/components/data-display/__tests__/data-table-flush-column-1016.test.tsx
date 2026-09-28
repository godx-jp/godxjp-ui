import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { DataTable } from "../data-table";
import { ListRow } from "../list-row";

/**
 * `columns[].flush` — a cell that hosts a self-padded row primitive (gh#1016).
 *
 * Measured on a consumer (godx-mailer, 1142×805): a selectable mail list renders each message as
 * a `ListRow` in one DataTable column. The body `<td>` kept its own padding (`7.36px 16px`) on
 * top of ListRow's (`7.36px 16px`), so the avatar sat 32px from the checkbox where every other
 * column sits 16px, rows grew by the cell's block padding, and the unread band stopped at the
 * checkbox cell.
 *
 * jsdom applies no author cascade, so the CSS facts are asserted against the stylesheet source;
 * the DOM test holds the contract the CSS hangs off. The block-padding UTILITY is the part that
 * matters most: utilities are a later layer than `components`, so a flush cell that still carried
 * it would keep its block padding whatever `[data-flush]` said.
 */
const TABLE_CSS = readFileSync(resolve(__dirname, "../../../styles/table-layout.css"), "utf8");
const CELL_PADDING_UTILITY = "py-[length:var(--table-cell-padding-y)]";

type Mail = { id: string; from: string; subject: string; read: boolean };
const mails: Mail[] = [
  { id: "1", from: "Mai", subject: "Invoice", read: false },
  { id: "2", from: "Ken", subject: "Minutes", read: true },
];

function MailTable({ flush }: { flush?: boolean }) {
  return (
    <DataTable
      data={mails}
      selectable
      density="compact"
      getRowLabel={(m) => m.subject}
      columns={[
        {
          key: "row",
          header: "",
          ariaLabel: "Message",
          flush,
          render: (m) => (
            <ListRow
              asChild
              density="compact"
              unread={!m.read}
              title={m.from}
              description={m.subject}
            >
              <a href={`#mail-${m.id}`} />
            </ListRow>
          ),
        },
        { key: "from", header: "From" },
      ]}
    />
  );
}

describe("DataTable columns[].flush (gh#1016)", () => {
  it("renders a flush column's body cells as TableCell flush, without the block-padding utility", () => {
    renderWithUi(<MailTable flush />);
    const cell = screen.getByRole("link", { name: /Mai/ }).closest("td")!;
    expect(cell).toHaveAttribute("data-flush", "");
    expect(cell.className).not.toContain(CELL_PADDING_UTILITY);
  });

  it("leaves every other column padded — flush is per column, not per table", () => {
    renderWithUi(<MailTable flush />);
    const other = screen
      .getAllByText("Mai")
      .find((el) => !el.closest("a"))!
      .closest("td")!;
    expect(other).not.toHaveAttribute("data-flush");
    expect(other.className).toContain(CELL_PADDING_UTILITY);
  });

  it("keeps the header cell padded, so the header label sits on the ListRow's own inset", () => {
    renderWithUi(<MailTable flush />);
    const headers = screen.getAllByRole("columnheader");
    for (const th of headers) expect(th).not.toHaveAttribute("data-flush");
  });

  it("changes nothing when the option is omitted", () => {
    renderWithUi(<MailTable />);
    const cell = screen.getByRole("link", { name: /Mai/ }).closest("td")!;
    expect(cell).not.toHaveAttribute("data-flush");
    expect(cell.className).toContain(CELL_PADDING_UTILITY);
  });

  it("the selection cell's hug rule matches the live Checkbox, which carries no role attribute", () => {
    renderWithUi(<MailTable flush />);
    const selectCell = screen.getAllByRole("checkbox")[1]!.closest("td")!;
    // The React Aria Checkbox is a <label data-slot="checkbox"> around a native input: its role
    // is implicit, so a `[role="checkbox"]`-only selector cannot match it.
    expect(selectCell.querySelector('[role="checkbox"]')).toBeNull();
    expect(selectCell.querySelector('[data-slot="checkbox"]')).not.toBeNull();
    expect(TABLE_CSS).toMatch(
      /\[data-slot="table-cell"\]:has\(\[data-slot="checkbox"\][^)]*\)\s*\{\s*padding-inline-end:\s*0;/,
    );
    expect(TABLE_CSS).toMatch(
      /\[data-slot="table-head"\]:has\(\[data-slot="checkbox"\][^)]*\)\s*\{\s*padding-inline-end:\s*0;/,
    );
  });

  it("the flush reset zeroes the cell padding in the stylesheet", () => {
    expect(TABLE_CSS).toMatch(/\[data-slot="table-cell"\]\[data-flush\]\s*\{\s*padding:\s*0;/);
  });

  it("paints the ListRow unread token across the whole table row, not only the ListRow's cell", () => {
    const rule = TABLE_CSS.match(
      /\.ui-table-row:has\(\s*>\s*\[data-slot="table-cell"\]\[data-flush\]\s*>\s*\[data-slot="list-row"\]\[data-unread\]\s*\)\s*\{([^}]*)\}/,
    );
    expect(rule).not.toBeNull();
    expect(rule![1]).toContain("var(--list-row-unread-background, hsl(var(--muted)))");
  });

  it("the unread ListRow is a direct child of the flush cell — the shape the row rule selects", () => {
    renderWithUi(<MailTable flush />);
    const row = screen.getByRole("link", { name: /Mai/ });
    expect(row).toHaveAttribute("data-slot", "list-row");
    expect(row).toHaveAttribute("data-unread", "");
    expect(row.parentElement).toHaveAttribute("data-flush", "");
  });
});
