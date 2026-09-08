/**
 * gh#410 — TableHead/TableCell publish the four column axes that were `className`-only, one of
 * which the catalog was recommending as the PHYSICAL `text-right` this package lints against.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");
const layout = read("../../../styles/table-layout.css");

describe("Table column axes (gh#410)", () => {
  it("emits no axis attribute and no inline style on an untouched cell", () => {
    const { container } = renderWithUi(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>金額</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1,200</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    for (const cell of container.querySelectorAll("th, td")) {
      expect(cell).not.toHaveAttribute("data-align");
      expect(cell).not.toHaveAttribute("data-numeric");
      expect(cell).not.toHaveAttribute("data-wrap");
      expect(cell.getAttribute("style")).toBeNull();
    }
  });

  it("reflects align, numeric and wrap on both the header and the body cell", () => {
    const { container } = renderWithUi(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead align="center" wrap>
              件名
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell align="end" numeric>
              1,200
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const head = container.querySelector("th");
    expect(head).toHaveAttribute("data-align", "center");
    expect(head).toHaveAttribute("data-wrap", "");
    expect(head).not.toHaveAttribute("data-numeric");

    const cell = container.querySelector("td");
    expect(cell).toHaveAttribute("data-align", "end");
    expect(cell).toHaveAttribute("data-numeric", "");
  });

  it("takes a column measure as a number (px) or any CSS length", () => {
    const { container } = renderWithUi(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead width={88}>ID</TableHead>
            <TableHead width="12rem">名前</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const [byNumber, byLength] = [...container.querySelectorAll("th")];
    expect(byNumber.style.inlineSize).toBe("88px");
    expect(byLength.style.inlineSize).toBe("12rem");
  });

  it("keeps the indent level when a cell carries both a measure and a depth", () => {
    const { container } = renderWithUi(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell indent={2} width="10rem">
              子ノード
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const cell = container.querySelector("td") as HTMLTableCellElement;
    expect(cell.style.inlineSize).toBe("10rem");
    expect(cell.style.getPropertyValue("--table-cell-indent-level")).toBe("2");
  });

  it("resolves alignment logically, and lets an explicit align beat numeric by source order", () => {
    expect(layout).not.toMatch(/text-align:\s*(?:left|right);/);
    const numericAt = layout.indexOf("[data-numeric] {");
    const alignAt = layout.indexOf('[data-align="center"] {');
    expect(numericAt).toBeGreaterThan(-1);
    expect(alignAt).toBeGreaterThan(numericAt);
    expect(layout).toMatch(
      /\[data-numeric\] \{\s*font-variant-numeric: tabular-nums;\s*text-align: end;/,
    );
    expect(layout).toMatch(/\[data-wrap\] \{\s*white-space: normal;/);
  });

  it("moves the header weight onto a theme knob instead of eighteen call sites", () => {
    expect(layout).toMatch(/font-weight: var\(--table-head-font-weight\);/);
    expect(read("../../../tokens/components/table.css")).toMatch(
      /--table-head-font-weight:\s*var\(--font-weight-medium\);/,
    );
  });
});
