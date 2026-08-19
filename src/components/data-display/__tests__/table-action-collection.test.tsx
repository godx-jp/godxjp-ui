import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
const tableCss = read("../../../styles/table-layout.css");
// Prettier may wrap a long `var(--token)` across lines; compare against a whitespace-free copy.
const tableCssFlat = tableCss.replace(/\s+/g, "");
const tableTokens = read("../../../tokens/components/table.css");

function Queue({ preset }: { preset?: "default" | "action-collection" }) {
  return (
    <Table preset={preset} collapseBelow="sm">
      <TableHeader>
        <TableRow>
          <TableHead priority="primary" scope="col">
            申請者
          </TableHead>
          <TableHead priority="secondary" scope="col">
            対象
          </TableHead>
          <TableHead scope="col">理由</TableHead>
          <TableHead priority="meta" scope="col">
            申請日時
          </TableHead>
          <TableHead priority="actions" scope="col">
            <span className="sr-only">操作</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell priority="primary">田中 太郎</TableCell>
          <TableCell priority="secondary">会計 / 請求書エクスポート</TableCell>
          <TableCell>月次決算のため請求データの一括出力権限が必要です。</TableCell>
          <TableCell priority="meta">2026/08/03 9:12</TableCell>
          <TableCell priority="actions">操作</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Table action-collection preset (gh#253)", () => {
  it("is inert by default — no preset attribute, no container class", () => {
    const { container } = render(<Queue />);
    const wrapper = container.querySelector("div")!;

    expect(wrapper).not.toHaveAttribute("data-preset");
    expect(wrapper).not.toHaveAttribute("data-collapse-below");
    expect(wrapper.className).not.toContain("ui-table-collection");
  });

  it("opts in with one prop and reflects the collapse step", () => {
    const { container } = render(<Queue preset="action-collection" />);
    const wrapper = container.querySelector("div")!;

    expect(wrapper).toHaveAttribute("data-preset", "action-collection");
    expect(wrapper).toHaveAttribute("data-collapse-below", "sm");
    expect(wrapper.className).toContain("ui-table-collection");
  });

  it("keeps REAL table semantics at every width — no display or role rewriting", () => {
    const { container } = render(<Queue preset="action-collection" />);

    // The collapse is a sizing change only: the table, its header row and its cells are the
    // native elements, with no explicit role and no aria-hidden header.
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelector("table")).not.toHaveAttribute("role");
    expect(container.querySelector("thead")).not.toHaveAttribute("aria-hidden");
    expect(container.querySelectorAll("th")).toHaveLength(5);
    expect(container.querySelectorAll("tbody td")).toHaveLength(5);
    for (const th of container.querySelectorAll("th")) {
      expect(th).toHaveAttribute("scope", "col");
    }
  });

  it("carries the column priority on both the header and the body cell", () => {
    const { container } = render(<Queue preset="action-collection" />);

    expect(container.querySelector('th[data-priority="primary"]')?.textContent).toBe("申請者");
    expect(container.querySelector('td[data-priority="actions"]')).toBeInTheDocument();
    // The free-text column is deliberately unmarked — it takes the remaining space.
    expect(container.querySelectorAll("th:not([data-priority])")).toHaveLength(1);
  });

  it("emits no priority attribute when a column does not declare one", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>本文</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(container.querySelector("td")).not.toHaveAttribute("data-priority");
  });

  it("owns every measure through service-themeable tokens", () => {
    for (const token of [
      "--table-action-collection-primary-width",
      "--table-action-collection-secondary-width",
      "--table-action-collection-meta-width",
      "--table-action-collection-actions-width",
      "--table-action-collection-primary-width-compact",
      "--table-action-collection-secondary-width-compact",
      "--table-action-collection-meta-width-compact",
      "--table-action-collection-actions-width-compact",
      "--table-action-collection-font-size-compact",
      "--table-action-collection-row-height-compact",
      "--table-action-collection-cell-space-x-compact",
      "--table-action-collection-cell-padding-y-compact",
    ]) {
      expect(tableTokens).toContain(`${token}:`);
      expect(tableCssFlat).toContain(`var(${token})`);
    }
  });

  it("measures the collapse against the table's OWN container, at the canonical steps", () => {
    expect(tableCss).toMatch(/\.ui-table-collection\s*\{\s*container:\s*ui-table-collection/);
    for (const [step, width] of [
      ["sm", "40rem"],
      ["md", "48rem"],
      ["lg", "64rem"],
      ["xl", "80rem"],
    ] as const) {
      expect(tableCss).toMatch(
        new RegExp(
          `@container ui-table-collection \\(width < ${width}\\) \\{\\s*\\[data-collapse-below="${step}"\\]`,
        ),
      );
    }
  });

  it("never styles a table that did not opt in — the inert-default contract (gh#231)", () => {
    expect(tableCss).not.toMatch(/\[data-preset="default"\]/);
    expect(tableCss).not.toMatch(/\[data-collapse-below\]\s*\{/);
  });

  it("writes no literal column geometry into the component stylesheet", () => {
    const presetCss = tableCss.slice(tableCss.indexOf(".ui-table-collection {"));
    expect(presetCss).not.toMatch(/inline-size:\s*[\d.]+(px|rem|em)\b/);
    expect(presetCss).not.toMatch(/font-size:\s*[\d.]+(px|rem|em)\b/);
  });
});

describe("Table action-collection priority floors (gh#262)", () => {
  // jsdom performs no table layout, so the geometry itself is exercised by the Playwright script
  // (scripts/table-collection-cjk-visual.mjs, 10 CJK columns at 390px). Here we pin the CONTRACT:
  // up to the six-column budget the compact tier stays the gh#253 percentage ratios (canonical
  // queues keep their scroll-free acceptance frames), and from SEVEN columns a `:has()` tier
  // swaps in rem LENGTH floors — the only floor `table-layout: fixed` respects: over-constrained
  // percentage columns are normalized back into the frame and shred CJK headers one character
  // per line, while length columns grow the table into the wrapper's scroll region instead.

  it("keeps the compact ratios as percentages and owns a rem floor per priority", () => {
    for (const token of [
      "--table-action-collection-primary-width-compact",
      "--table-action-collection-secondary-width-compact",
      "--table-action-collection-meta-width-compact",
    ]) {
      // Percent within the budget: ratios keep a five-column queue filling — never overflowing —
      // its container at every acceptance artboard.
      expect(tableTokens).toMatch(new RegExp(`${token}:\\s*[\\d.]+%;`));
      expect(tableCssFlat).toContain(`var(${token})`);
    }
    for (const token of [
      "--table-action-collection-primary-width-floor",
      "--table-action-collection-secondary-width-floor",
      "--table-action-collection-meta-width-floor",
      "--table-action-collection-flex-width-floor",
    ]) {
      // rem, not %: fixed layout scales over-constrained percentages back down (sub-glyph
      // columns), while length columns grow the table into the scroll region instead.
      // rem, not ch: `ch` tracks the "0" glyph (~half a CJK em), which would silently halve the
      // floor for the JA copy it protects.
      expect(tableTokens).toMatch(new RegExp(`${token}:\\s*[\\d.]+rem;`));
      expect(tableCssFlat).toContain(`var(${token})`);
    }
  });

  it("switches to the floor tier at the documented seven-column budget, at every step", () => {
    // The budget is a `:has()` column-count gate per collapse step: within six columns the rule
    // never matches (percent tier, scroll-free canon); from seven the shares are guaranteed to
    // over-sum and every column — the unmarked free-text one included, which `auto` would
    // collapse to 0px — takes its rem floor, so the table grows and the wrapper scrolls.
    const gate =
      ':has([data-slot="table-head"]:nth-child(7)){--table-action-collection-primary-width:var(--table-action-collection-primary-width-floor);';
    expect(tableCssFlat.split(gate).length - 1).toBe(4); // sm / md / lg / xl
    const flexFloor =
      "--table-action-collection-flex-width:var(--table-action-collection-flex-width-floor)";
    expect(tableCssFlat.split(flexFloor).length - 1).toBe(4);
    // Base rule: the cell measure falls back through the flex slot before `auto`, so the floor
    // tier can floor unmarked columns without touching marked ones.
    expect(tableCssFlat).toContain(
      "inline-size:var(--table-action-collection-column-width,var(--table-action-collection-flex-width,auto))",
    );
  });

  it("keeps the keyboard-reachable horizontal overflow region the floors fall back to", () => {
    // Bare Table: the preset wrapper itself is the scroll region (overflow-auto + tab stop), so
    // when the floors outgrow the container the result is a scrollable table, never a clipped one.
    const { container } = render(<Queue preset="action-collection" />);
    const wrapper = container.querySelector("div")!;
    expect(wrapper.className).toContain("ui-table-collection");
    expect(wrapper.className).toContain("overflow-auto");
    expect(wrapper).toHaveAttribute("tabindex", "0");
    // DataTable: its `.ui-data-table-scroll` region owns overflow-x for the same fallback.
    expect(tableCssFlat).toContain(".ui-data-table-scroll{position:relative;overflow-x:auto");
  });

  it("never breaks CJK headers with keep-all — wrapping stays lossless under fixed layout", () => {
    // Under `table-layout: fixed` a column cannot grow to fit an unbreakable CJK run, so
    // `word-break: keep-all` would clip long JA headers instead of wrapping them (see the
    // stylesheet comment). Pin its absence from the collection DECLARATIONS (the stylesheet
    // comment deliberately names it, so strip comments before asserting).
    const presetCss = tableCss
      .slice(tableCss.indexOf(".ui-table-collection {"))
      .replace(/\/\*[\s\S]*?\*\//g, "");
    expect(presetCss).not.toContain("keep-all");
    expect(presetCss).toContain("overflow-wrap: anywhere");
  });
});
