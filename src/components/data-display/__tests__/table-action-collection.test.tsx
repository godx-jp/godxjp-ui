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

describe("Table action-collection compact tier — the layer contract (gh#412)", () => {
  const baseCss = read("../../../styles/base.css");

  it("declares `godxjp-ui-responsive` AFTER Tailwind, so it is the last layer", () => {
    const tailwindAt = baseCss.indexOf('@import "tailwindcss";');
    const layerAt = baseCss.indexOf("@layer godxjp-ui-responsive;");

    expect(tailwindAt).toBeGreaterThanOrEqual(0);
    expect(layerAt).toBeGreaterThan(tailwindAt);
    // Nothing may re-declare it earlier and steal the position.
    expect(baseCss.slice(0, tailwindAt)).not.toContain("godxjp-ui-responsive");
  });

  it("puts the compact re-point in that layer — `@layer components` cannot beat `text-sm`", () => {
    // The reason the token was dead: Table emits a Tailwind utility for its type, and `utilities`
    // outranks `components` by LAYER ORDER — no selector written in `components` can win.
    expect(read("../table.tsx")).toContain("caption-bottom text-sm");

    const responsiveAt = tableCss.indexOf("@layer godxjp-ui-responsive {");
    expect(responsiveAt).toBeGreaterThan(0);
    const responsiveLayer = tableCss.slice(responsiveAt);
    const beforeResponsive = tableCss.slice(0, responsiveAt);

    // Every compact re-point — type AND measures — is inside the last layer…
    expect(responsiveLayer.match(/@container ui-table-collection \(width </g)).toHaveLength(4);
    expect(
      responsiveLayer.match(/font-size: var\(--table-action-collection-font-size-compact\)/g),
    ).toHaveLength(4);
    // …and none of it is left behind in `@layer components` (prose comments aside).
    const beforeRules = beforeResponsive.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(beforeRules).not.toContain("@container ui-table-collection");
    expect(beforeRules).not.toContain("-compact");
  });

  it("keeps the static preset rules in `@layer components` — the layer is for re-points only", () => {
    const responsiveAt = tableCss.indexOf("@layer godxjp-ui-responsive {");
    const responsiveLayer = tableCss.slice(responsiveAt);

    expect(tableCss.slice(0, responsiveAt)).toMatch(/\.ui-table-collection\s*\{/);
    // Nothing in the last layer sits outside a container query.
    for (const line of responsiveLayer.split("\n")) {
      if (/^\s{2}[.[]/.test(line))
        throw new Error(`unqueried rule in the responsive layer: ${line}`);
    }
  });
});
