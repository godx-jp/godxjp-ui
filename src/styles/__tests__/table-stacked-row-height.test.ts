import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const tableStyles = readFileSync(resolve(process.cwd(), "src/styles/table-layout.css"), "utf8");
const controlStyles = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");

const BREAKPOINTS = ["sm", "md", "lg", "xl"] as const;

const stackedRowRule = (size: string) =>
  tableStyles.match(
    new RegExp(`\\[data-collapse-below="${size}"\\] \\.ui-table-row\\s*\\{[^}]*\\}`),
  )?.[0] ?? "";

describe("stacked table rows (gh#351)", () => {
  it("control.css still gives a normal row its fixed height", () => {
    expect(controlStyles).toMatch(/\.ui-table-row\s*\{[^}]*height:\s*var\(--table-row-height\)/s);
  });

  it.each(BREAKPOINTS)("a stacked row at %s is sized by its cells, not by the row tier", (size) => {
    const rule = stackedRowRule(size);
    expect(rule, `${size} stacked row rule`).toContain("display: block");
    // Without this the fixed height from control.css survives and the cells spill out of the card.
    expect(rule, `${size} stacked row rule`).toContain("height: auto");
  });

  it.each(BREAKPOINTS)("the %s card border reads the stroke token", (size) => {
    expect(stackedRowRule(size)).toContain("var(--stroke-hairline)");
  });
});
