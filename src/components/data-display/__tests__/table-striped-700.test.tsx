import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { anchorIndex, ruleSelector, ruleSelectors } from "@/test/css-selector";
import { DataTable, type ColumnDef } from "../data-table";
import { Table, TableBody, TableCell, TableRow } from "../table";

/**
 * gh#700 — zebra rows for Table and DataTable: the `striped` prop, a service-wide default in ONE
 * theme line, parity by LOGICAL record, and a stripe that never outranks hover, selection or a
 * frozen column. Real browser paint is measured separately (the issue's Chromium evidence); this
 * file holds the parts jsdom can decide: the attributes, which rows each rule selects, and the
 * cascade position each rule was given.
 */
const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "../../../styles/table-layout.css"), "utf8");
const tokens = readFileSync(join(here, "../../../tokens/components/table.css"), "utf8");

const ROW_RULE =
  ':where([data-slot="table"] > tbody > tr:nth-child(even of :not([data-expanded-row]))) {';
const DETAIL_RULE = "+ tr[data-expanded-row]";
/*
 * Anchored on the part only the STRIPE rule has. The bare tail `> :is(.ui-data-table-pin-end,
 * .ui-data-table-pin-start) {` is shared with the rule that carries a row's TONE into its frozen
 * cells, which sits just above it — anchored on the tail alone, `ruleSelector` found that rule
 * first and every stripe assertion below silently measured the wrong one (they all went false,
 * which read as "the stripe is gone" while the stripe was painting fine).
 */
const PIN_RULE =
  ":not([data-expanded-row]))) > :is(.ui-data-table-pin-end, .ui-data-table-pin-start) {";

/** The declaration block that follows `anchor`. */
function block(anchor: string): string {
  /*
   * gh#767 / gh#769 — Prettier re-wraps a selector as soon as it crosses the print width, so the
   * SAME rule reads as one line or four depending only on how long it is. A plain `indexOf` of a
   * hand-wrapped literal therefore asserts the FORMATTING, not the rule. Match any whitespace run
   * where the caller wrote one instead.
   */
  const pattern = new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"));
  const match = pattern.exec(css);
  expect(match, `rule not found: ${anchor}`).not.toBeNull();
  const at = match!.index;
  const open = css.indexOf("{", at + match![0].length - 1);
  return css.slice(open + 1, css.indexOf("\n  }", open));
}

/** The `@layer` a source offset sits in (every rule in this file is inside a top-level layer). */
function layerAt(offset: number): string {
  const layers = [...css.slice(0, offset).matchAll(/@layer\s+([\w-]+)\s*\{/g)];
  return layers.at(-1)?.[1] ?? "(none)";
}

type Row = { id: string; name: string; amount: number };
const DATA: Row[] = ["a", "b", "c", "d", "e"].map((id, i) => ({
  id,
  name: `name-${id}`,
  amount: i * 100,
}));
const COLUMNS: ColumnDef<Row>[] = [
  { key: "name", header: "名前" },
  { key: "amount", header: "金額", fixed: "end" },
];

const table = (c: HTMLElement) => c.querySelector('[data-slot="table"]')!;
const bodyRows = (c: HTMLElement) => [...c.querySelectorAll("tbody > tr")];

describe("gh#700 striped — the prop is tri-state", () => {
  it("Table: `striped` on, `striped={false}` off, omitted inherits the theme", () => {
    const { container } = renderWithUi(
      <>
        <Table striped data-testid="on" />
        <Table striped={false} data-testid="off" />
        <Table data-testid="inherit" />
      </>,
    );
    const get = (id: string) => container.querySelector(`[data-testid="${id}"]`)!;
    expect(get("on")).toHaveAttribute("data-striped", "");
    expect(get("off")).toHaveAttribute("data-striped", "false");
    expect(get("inherit")).not.toHaveAttribute("data-striped");
  });

  it("DataTable forwards the prop to its Table", () => {
    const { container: on } = renderWithUi(
      <DataTable data={DATA} columns={COLUMNS} getRowId={(r) => r.id} striped />,
    );
    expect(table(on)).toHaveAttribute("data-striped", "");

    const { container: off } = renderWithUi(
      <DataTable data={DATA} columns={COLUMNS} getRowId={(r) => r.id} striped={false} />,
    );
    expect(table(off)).toHaveAttribute("data-striped", "false");

    const { container: inherit } = renderWithUi(
      <DataTable data={DATA} columns={COLUMNS} getRowId={(r) => r.id} />,
    );
    expect(table(inherit)).not.toHaveAttribute("data-striped");
  });

  it("the attribute only moves the switch; the switch defaults OFF at :root", () => {
    expect(tokens).toMatch(/^\s*--table-row-striped-alpha:\s*0%;/m);
    expect(block('[data-slot="table"][data-striped=""] {')).toMatch(
      /--table-row-striped-alpha:\s*100%/,
    );
    expect(block('[data-slot="table"][data-striped="false"] {')).toMatch(
      /--table-row-striped-alpha:\s*0%/,
    );
  });

  it("the paint rule is NOT gated on the attribute, so one :root line stripes every table", () => {
    const selector = ruleSelector(css, ROW_RULE);
    expect(selector).not.toContain("data-striped");
    const paint = block(ROW_RULE);
    expect(paint).toContain("var(--table-row-striped-alpha)");
    // Role default at the CALL SITE, never frozen at :root (docs/TOKENS.md).
    expect(paint).toContain("var(--table-row-striped-background, hsl(var(--muted) / 0.8))");
    expect(tokens).toMatch(/^\s*--table-row-striped-background:\s*initial;/m);
  });
});

describe("gh#700 striped — parity by logical record", () => {
  it("an expanded detail row does not shift the stripe of the rows after it", () => {
    const { container } = renderWithUi(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        striped
        expandable={{
          expandedRowRender: (row) => <p>detail-{row.id}</p>,
          expandedRowKeys: ["a", "b"],
        }}
      />,
    );
    const row = ruleSelector(css, ROW_RULE);
    const detailCell = ruleSelector(css, DETAIL_RULE);
    const rows = bodyRows(container);
    // a, detail-a, b, detail-b, c, d, e
    const records = rows.filter((r) => !r.hasAttribute("data-expanded-row"));
    expect(records.map((r) => r.matches(row))).toEqual([false, true, false, true, false]);

    const details = rows.filter((r) => r.hasAttribute("data-expanded-row"));
    expect(details).toHaveLength(2);
    // Detail rows are never counted themselves…
    expect(details.every((r) => !r.matches(row))).toBe(true);
    // …and each one's cells wear its OWN record's stripe: a is odd (plain), b is even (striped).
    const cellOf = (r: Element) => r.querySelector("td")!;
    expect(cellOf(details[0]).matches(detailCell)).toBe(false);
    expect(cellOf(details[1]).matches(detailCell)).toBe(true);
  });

  it("the expanded wash gives way to the stripe, so a detail row wears exactly its record's paint", () => {
    const wash = block('.ui-data-table-expanded-row > [data-slot="table-cell"] {');
    // 0% (unstriped): the full wash, as before. 100% (striped): no wash — only the stripe.
    expect(wash.replace(/\s+/g, " ")).toContain(
      "var(--table-row-expanded-background, hsl(var(--muted) / 0.3)) calc(100% - var(--table-row-striped-alpha))",
    );
  });

  it("a hand-composed Table follows the same contract via `data-expanded-row`", () => {
    const { container } = renderWithUi(
      <Table striped>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2</TableCell>
          </TableRow>
          <TableRow data-expanded-row="">
            <TableCell flush>detail of 2</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>3</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>4</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = ruleSelector(css, ROW_RULE);
    const detailCell = ruleSelector(css, DETAIL_RULE);
    const rows = bodyRows(container);
    expect(rows.map((r) => r.matches(row))).toEqual([false, true, false, false, true]);
    expect(rows[2].querySelector("td")!.matches(detailCell)).toBe(true);
  });

  it("a nested table is not reached by the outer table's rows (child combinators only)", () => {
    const { container } = renderWithUi(
      <Table striped>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Table>
                <TableBody>
                  <TableRow data-testid="inner-1">
                    <TableCell>i1</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const inner = container.querySelector('[data-testid="inner-1"]')!;
    expect(inner.matches(ruleSelector(css, ROW_RULE))).toBe(false);
  });
});

describe("gh#700 striped — frozen columns and precedence", () => {
  it("a frozen cell in a striped row wears the stripe over its opaque base", () => {
    const { container } = renderWithUi(
      <DataTable data={DATA} columns={COLUMNS} getRowId={(r) => r.id} striped />,
    );
    const selector = ruleSelector(css, PIN_RULE);
    const pinned = bodyRows(container).map((r) => r.querySelector(".ui-data-table-pin-end")!);
    expect(pinned.every(Boolean)).toBe(true);
    expect(pinned.map((c) => c.matches(selector))).toEqual([false, true, false, true, false]);
    // An IMAGE layer: the opaque `background-color` that hides scrolled columns stays in place.
    expect(block(PIN_RULE)).toMatch(/^\s*background-image:/m);
    expect(block(PIN_RULE)).not.toMatch(/^\s*background-color:/m);
  });

  it("inside a Card a frozen body cell's opaque base is the CARD surface, not the page", () => {
    const anchor =
      '[data-slot="card"] .ui-data-table-surface tbody :is(.ui-data-table-pin-end, .ui-data-table-pin-start) {';
    expect(block(anchor)).toContain("hsl(var(--card-background, var(--card)) / var(--card-alpha, 100%))");
    const { container } = renderWithUi(
      <div data-slot="card">
        <DataTable data={DATA} columns={COLUMNS} getRowId={(r) => r.id} striped />
      </div>,
    );
    const selector = ruleSelector(css, anchor);
    expect(container.querySelector("tbody .ui-data-table-pin-end")!.matches(selector)).toBe(true);
    expect(container.querySelector("thead .ui-data-table-pin-end")!.matches(selector)).toBe(false);
  });

  it("every stripe rule is zero-specificity and in `components`, under the utility layer", () => {
    for (const anchor of [ROW_RULE, DETAIL_RULE, PIN_RULE]) {
      // `anchorIndex`, not `css.indexOf`: the pinned rule's selector wraps across lines, and a raw
      // indexOf of a single-spaced anchor returns -1 — which `layerAt` then read as the LAST layer
      // in the whole file. This file's own gh#767/#769 note is about exactly that.
      const at = anchorIndex(css, anchor);
      expect(at, `rule not found: ${anchor}`).toBeGreaterThan(-1);
      expect(layerAt(at)).toBe("components");
      // The selector opens with `:where(` — hover (`hover:bg-*`), selection
      // (`data-[state=selected]:bg-*`) and a consumer's `rowClassName` are utilities, a LATER
      // layer, so they replace the stripe without any specificity contest.
      expect(ruleSelectors(css, anchor).every((s) => s.startsWith(":where("))).toBe(true);
    }
  });

  it("the frozen-cell hover and selected washes come AFTER the stripe and outrank it", () => {
    const pinAt = css.indexOf(PIN_RULE);
    const hoverAt = css.indexOf(".ui-data-table-surface tbody tr:hover > .ui-data-table-pin-end");
    const selectedAt = css.indexOf(
      '.ui-data-table-surface tbody tr[data-state="selected"] > .ui-data-table-pin-end',
    );
    expect(hoverAt).toBeGreaterThan(pinAt);
    expect(selectedAt).toBeGreaterThan(pinAt);
    // Stripe: `:where(…)` (0) + one class inside `:is()` = (0,1,0). Hover: (0,3,2). Selected:
    // (0,3,3). Both also set `background-image`, so they REPLACE the stripe layer.
    expect(block(".ui-data-table-surface tbody tr:hover > .ui-data-table-pin-start {")).toMatch(
      /background-image:/,
    );
    expect(
      block('.ui-data-table-surface tbody tr[data-state="selected"] > .ui-data-table-pin-start {'),
    ).toMatch(/background-image:/);
  });

  it("a toned row keeps its stripe: the tone wash is an image layer, not the shorthand", () => {
    const tone = block(".ui-table-row[data-tone] {");
    // An IMAGE layer, not the shorthand — the shorthand would reset the stripe's `background-color`.
    expect(tone).toMatch(/^\s*background-image:/m);
    expect(tone).not.toMatch(/^\s*background:/m);
    // And that image IS the tone gradient. It is declared once as `--table-row-tone-layer` so the
    // row's frozen cells can wear the same layer; the row paints it through `var()`.
    expect(tone).toMatch(/--table-row-tone-layer:\s*linear-gradient/);
    expect(tone).toMatch(/background-image:\s*var\(--table-row-tone-layer\)/);

    const { container } = renderWithUi(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        striped
        rowTone={(r) => (r.id === "b" ? "destructive" : undefined)}
      />,
    );
    const toned = bodyRows(container)[1];
    expect(toned).toHaveAttribute("data-tone", "destructive");
    expect(toned.matches(ruleSelector(css, ROW_RULE))).toBe(true);
  });
});
