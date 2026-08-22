import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
const tableCss = read("../../../styles/table-layout.css");
const tableCssFlat = tableCss.replace(/\s+/g, "");
const tableTokens = read("../../../tokens/components/table.css");

function Record({ preset }: { preset?: "default" | "stacked-record-collection" }) {
  return (
    <Table preset={preset} collapseBelow="sm">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">クライアントID</TableHead>
          <TableHead scope="col">用途</TableHead>
          <TableHead scope="col">スコープ</TableHead>
          <TableHead scope="col">最終利用</TableHead>
          <TableHead scope="col">状態</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell label="クライアントID">svc-acct-04213</TableCell>
          <TableCell label="用途">請求データの夜間バッチ連携</TableCell>
          <TableCell label="スコープ">billing:read invoices:export</TableCell>
          <TableCell label="最終利用">2026/08/03 9:12</TableCell>
          <TableCell label="状態">有効</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Table stacked-record-collection preset (gh#293 restore — SCR-215)", () => {
  it("is inert by default — no preset attribute, no container class", () => {
    const { container } = render(<Record />);
    const wrapper = container.querySelector("div")!;

    expect(wrapper).not.toHaveAttribute("data-preset");
    expect(wrapper).not.toHaveAttribute("data-collapse-below");
    expect(wrapper.className).not.toContain("ui-table-stacked-collection");
  });

  it("opts in with one prop and reflects the collapse step", () => {
    const { container } = render(<Record preset="stacked-record-collection" />);
    const wrapper = container.querySelector("div")!;

    expect(wrapper).toHaveAttribute("data-preset", "stacked-record-collection");
    expect(wrapper).toHaveAttribute("data-collapse-below", "sm");
    expect(wrapper.className).toContain("ui-table-stacked-collection");
  });

  it("keeps REAL table semantics — no display or role rewriting in markup", () => {
    const { container } = render(<Record preset="stacked-record-collection" />);

    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelector("table")).not.toHaveAttribute("role");
    expect(container.querySelector("thead")).not.toHaveAttribute("aria-hidden");
    expect(container.querySelectorAll("th")).toHaveLength(5);
    expect(container.querySelectorAll("tbody td")).toHaveLength(5);
  });

  it("renders each cell's label into the DOM, hidden until the collapse step reveals it", () => {
    const { container } = render(<Record preset="stacked-record-collection" />);
    const labels = container.querySelectorAll(".ui-table-stacked-collection-label");

    expect(labels).toHaveLength(5);
    expect(labels[0]).toHaveTextContent("クライアントID");
    // The default rule (outside the container query) hides it — the real <th> already carries
    // the label above the collapse step.
    expect(tableCss).toMatch(/\.ui-table-stacked-collection-label\s*\{\s*display:\s*none;/);
  });

  it("emits no label span when a TableCell does not opt in", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>本文</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(container.querySelector(".ui-table-stacked-collection-label")).not.toBeInTheDocument();
  });

  it("measures the collapse against the table's OWN container, at the canonical steps", () => {
    expect(tableCss).toMatch(
      /\.ui-table-stacked-collection\s*\{\s*container:\s*ui-table-stacked-collection/,
    );
    for (const [step, width] of [
      ["sm", "40rem"],
      ["md", "48rem"],
      ["lg", "64rem"],
      ["xl", "80rem"],
    ] as const) {
      expect(tableCss).toMatch(
        new RegExp(
          `@container ui-table-stacked-collection \\(width < ${width}\\) \\{\\s*\\[data-collapse-below="${step}"\\]`,
        ),
      );
    }
  });

  it("hides the real <thead> and turns each row into a block card below the step, per canonical step", () => {
    for (const step of ["sm", "md", "lg", "xl"] as const) {
      expect(tableCssFlat).toContain(
        `[data-collapse-below="${step}"][data-slot="table"]>thead{display:none;}`,
      );
      expect(tableCssFlat).toContain(`[data-collapse-below="${step}"].ui-table-row{display:block;`);
    }
  });

  it("owns its card geometry through service-themeable tokens", () => {
    for (const token of [
      "--table-stacked-collection-card-padding-y",
      "--table-stacked-collection-card-padding-x",
      "--table-stacked-collection-card-gap",
      "--table-stacked-collection-cell-padding-y",
      "--table-stacked-collection-label-font-size",
    ]) {
      expect(tableTokens).toContain(`${token}:`);
      expect(tableCssFlat).toContain(`var(${token})`);
    }
  });

  it("never styles a table that did not opt in — the inert-default contract (gh#231)", () => {
    const presetCss = tableCss.slice(tableCss.indexOf(".ui-table-stacked-collection {"));
    expect(presetCss).not.toMatch(/\[data-preset="default"\]/);
  });
});
