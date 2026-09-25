import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Table, TableBody, TableCell, TableRow } from "../table";

/**
 * `interactive` — THE ROW IS THE TARGET (gh#929).
 *
 * `ListRow` gives a clickable row four things by wrapping its own `<a>`: the whole row as the hit
 * area, a pointer cursor, a row-level hover, and the design system's focus ring. A `<tr>` cannot
 * be wrapped in an `<a>` and stay a table row, so every consumer building "a list with COLUMNS
 * whose rows are selectable" fell into the same hole and patched it with page CSS.
 *
 * Measured on a consumer (godx-jp/id, `/organization/roles`): the link occupied 160x66 of a
 * 318x83 row (the right half dead), `cursor` computed `auto` on every `<tr>`, and a bare `<Link>`
 * in a cell fell back to Chromium's default ring — `rgb(0, 95, 204) auto 1px` against the
 * system's `1px solid rgb(122, 0, 255)`.
 *
 * jsdom applies no author cascade, so the three CSS facts are asserted against the stylesheet
 * source; what the DOM test holds is the contract the CSS hangs off — and, deliberately, the two
 * things this prop must NOT do.
 */
const TABLE_CSS = readFileSync(resolve(__dirname, "../../../styles/table-layout.css"), "utf8");
const RING_CSS = readFileSync(resolve(__dirname, "../../../styles/focus-ring.css"), "utf8");

describe("TableRow interactive (gh#929)", () => {
  it("stamps data-interactive, so the CSS has something to hang off", () => {
    render(
      <Table>
        <TableBody>
          <TableRow interactive data-testid="row">
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("row")).toHaveAttribute("data-interactive", "");
  });

  it("omits the attribute entirely when not interactive — no empty-string opt-in by accident", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="plain">
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("plain")).not.toHaveAttribute("data-interactive");
  });

  it("does NOT make the row a control — no tabindex, no role, no handler of its own", () => {
    render(
      <Table>
        <TableBody>
          <TableRow interactive data-testid="row">
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByTestId("row");
    // A row is not a button. The thing a keyboard user reaches must stay a real control INSIDE it,
    // which is the half `focus-ring.css` answers — announcing a <tr> as clickable without making
    // it reachable would be the worse bug this prop could ship.
    expect(row).not.toHaveAttribute("tabindex");
    expect(row).not.toHaveAttribute("role");
    expect(row.getAttribute("onclick")).toBeNull();
  });

  it("gives the row a pointer, which is the affordance that was missing", () => {
    expect(TABLE_CSS).toMatch(/\.ui-table-row\[data-interactive\]\s*\{[^}]*cursor:\s*pointer/);
  });

  it("hovers from the SAME token an ordinary row hover reads, not a second colour", () => {
    const block = TABLE_CSS.slice(TABLE_CSS.indexOf(".ui-table-row[data-interactive]"));
    expect(block).toMatch(/--table-row-hover-background-alpha/);
    // never parked in a hovered state on a touch device
    expect(block.slice(0, 600)).toMatch(/@media \(hover: hover\)/);
  });

  it("routes the real control inside the row to the design-system ring", () => {
    // TWO FLAT selectors, not one grouped one. The guard in `focus-ring-contrast.test.ts` reads
    // that selector list as TEXT and stops at the first closing bracket, so a nested group in
    // the list hides `.ui-button` from it — which is exactly what the first draft of this did.
    expect(RING_CSS).toContain('[data-interactive] > [data-slot="table-cell"] a[href],');
    expect(RING_CSS).toContain('[data-interactive] > [data-slot="table-cell"] button,');
  });

  it("keeps the focus-ring selector list free of nested groups, so its own guard still parses", () => {
    // A control case for the rule above: the list between `:is(` and `.ui-button` must contain no
    // closing bracket at all — not from a selector, and not from a COMMENT citing an issue in
    // brackets, which is how this broke the second time.
    const list = RING_CSS.slice(RING_CSS.indexOf(":is("), RING_CSS.indexOf(".ui-button"));
    expect(list).not.toContain(")");
  });
});
