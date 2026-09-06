import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { Table, TableBody, TableCell, TableRow } from "../table";

/**
 * The two escapes a table cell had no prop for.
 *
 *   `flush`  the cell's CONTENT owns the inset (an expanded detail panel had to
 *            reach for a `p-0` utility to span the cell).
 *   `indent` hierarchy depth (a grouped/tree table had to hand-roll
 *            `style={{ paddingInlineStart }}` at the call site).
 *
 * Both stay INERT without the prop, so every existing table is byte-identical.
 */
const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "../../../styles/table-layout.css"), "utf8");
const tokens = readFileSync(join(here, "../../../tokens/components/table.css"), "utf8");

function cellOf(node: React.ReactElement) {
  const { container } = renderWithUi(
    <Table>
      <TableBody>
        <TableRow>{node}</TableRow>
      </TableBody>
    </Table>,
  );
  return container.querySelector('[data-slot="table-cell"]') as HTMLTableCellElement;
}

describe("TableCell flush (gh#354 · item 4)", () => {
  it("stamps data-flush so the cell drops its own padding", () => {
    expect(cellOf(<TableCell flush>panel</TableCell>)).toHaveAttribute("data-flush", "");
  });

  it("emits nothing without the prop", () => {
    expect(cellOf(<TableCell>plain</TableCell>)).not.toHaveAttribute("data-flush");
  });

  it("zeroes the cell padding in the stylesheet, not at the call site", () => {
    expect(css).toMatch(/\[data-slot="table-cell"\]\[data-flush\]\s*\{\s*padding:\s*0;/);
  });
});

describe("TableCell indent (gh#354 · item 5)", () => {
  it("publishes the depth as the level custom property", () => {
    const cell = cellOf(<TableCell indent={2}>child</TableCell>);
    expect(cell).toHaveAttribute("data-indent", "2");
    expect(cell.style.getPropertyValue("--table-cell-indent-level")).toBe("2");
  });

  it("keeps level 0 on the column's own text axis", () => {
    const cell = cellOf(<TableCell indent={0}>root</TableCell>);
    expect(cell).toHaveAttribute("data-indent", "0");
    expect(cell.style.getPropertyValue("--table-cell-indent-level")).toBe("0");
  });

  it("emits neither the attribute nor the property without the prop", () => {
    const cell = cellOf(<TableCell>plain</TableCell>);
    expect(cell).not.toHaveAttribute("data-indent");
    expect(cell.getAttribute("style")).toBeNull();
  });

  it("keeps a caller's own style when it indents", () => {
    const cell = cellOf(
      <TableCell indent={1} style={{ verticalAlign: "top" }}>
        child
      </TableCell>,
    );
    expect(cell.style.verticalAlign).toBe("top");
    expect(cell.style.getPropertyValue("--table-cell-indent-level")).toBe("1");
  });

  it("derives the measure from tokens on the logical inline axis (RTL-safe)", () => {
    expect(css).toContain('[data-slot="table-cell"][data-indent]');
    expect(css).toMatch(/padding-inline-start:\s*calc\(\s*var\(--table-cell-space-x\)/);
    expect(css).toContain("var(--table-cell-indent-level, 0)");
    expect(css).toContain("var(--table-cell-indent-space-step)");
    // The step is a named step of the spacing scale, never a raw length.
    expect(tokens).toMatch(/--table-cell-indent-space-step:\s*var\(--space-\d+\);/);
  });
});
