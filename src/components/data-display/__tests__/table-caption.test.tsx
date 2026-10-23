/**
 * TableCaption — the table's accessible name and its visible "what are these rows, under which
 * conditions" line. Consumer report (TCG-M price comparison): the brand requires a comparison table
 * to state its scope ("same variant, shipping not included") in a caption, and the kit had no part
 * for it — the only routes were a raw `<caption>` (a hand-rolled element) or a sentence outside the
 * table, where it no longer names the table.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import * as dataDisplay from "../index";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");
const layout = read("../../../styles/table-layout.css");
const tokens = read("../../../tokens/components/table.css");

describe("TableCaption", () => {
  it("is exported from the data-display barrel", () => {
    expect(dataDisplay.TableCaption).toBe(TableCaption);
  });

  it("renders a real <caption> that names the table", () => {
    const { container } = renderWithUi(
      <Table>
        <TableCaption>Prices for the Holo variant · shipping not included</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Market</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const caption = container.querySelector("caption");
    expect(caption).toHaveAttribute("data-slot", "table-caption");
    // HTML requires the caption to be the table's first child.
    expect(container.querySelector("table")?.firstElementChild).toBe(caption);
    expect(
      screen.getByRole("table", { name: "Prices for the Holo variant · shipping not included" }),
    ).toBeInTheDocument();
  });

  it("is styled through knobs whose defaults resolve at the call site", () => {
    const rule = layout.match(/\[data-slot="table-caption"\]\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toContain("caption-side: top;");
    expect(rule).toContain("color: hsl(var(--table-caption-color, var(--muted-foreground)))");
    expect(rule).toContain("var(--table-caption-font-size,");
    expect(rule).toContain("padding-inline: var(--table-cell-space-x,");
    for (const knob of ["color", "font-size", "space-y"]) {
      expect(tokens).toMatch(new RegExp(`--table-caption-${knob}: initial;`));
    }
  });

  it("stays a full-width block when a stacked-record-collection folds the table", () => {
    for (const bp of ["sm", "md", "lg", "xl"]) {
      expect(layout).toMatch(
        new RegExp(
          `\\[data-collapse-below="${bp}"\\] \\[data-slot="table-caption"\\] \\{\\s*display: block;`,
        ),
      );
    }
  });
});
