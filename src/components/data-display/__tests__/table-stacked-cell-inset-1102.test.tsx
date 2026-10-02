import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright";
import { describe, expect, it } from "vitest";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

/**
 * gh#1102 — `preset="stacked-record-collection"`: a folded cell kept the table's inline padding
 * (--table-cell-space-x) INSIDE the card's own padding, so every value line lost 32px at 320px
 * and a 31-character email broke mid-token. The card now owns the inset
 * (--table-stacked-collection-cell-padding-x, default 0). Secondary: a cell whose content is null
 * printed its label over nothing; it now prints neither and drops out of the card. Chromium.
 */
const REPO = process.cwd();
const css = [
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/semantic/layout.css",
  "src/tokens/axes.css",
  "src/tokens/components/control.css",
  "src/tokens/components/table.css",
  "src/styles/control.css",
  "src/styles/layout.css",
  "src/styles/table-layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

const EMAIL = "console.role.member@example.com";

/** gh#1106 — a cell component that has nothing to show on this row (a read-only row's actions). */
function Nothing() {
  return null;
}
function Something() {
  return <span data-something="">編集</span>;
}

const record = (
  <Table preset="stacked-record-collection" collapseBelow="sm">
    <TableHeader>
      <TableRow>
        <TableHead scope="col">メール</TableHead>
        <TableHead scope="col">操作</TableHead>
        <TableHead scope="col">権限</TableHead>
        <TableHead scope="col">編集</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell label="メール">
          <span data-value="">{EMAIL}</span>
        </TableCell>
        <TableCell label="操作">{null}</TableCell>
        <TableCell label="権限">
          <Nothing />
        </TableCell>
        <TableCell label="編集">
          <Something />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

describe("stacked-record-collection folded cell inset (Chromium, gh#1102)", () => {
  async function measure(extraCss = "") {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 320, height: 844 } });
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css}
          body { margin: 0; } #root { inline-size: 260px; }
          /* The email's measured need in the consumer (12.47px): 214px. */
          [data-value] { display: inline-block; inline-size: 214px; } ${extraCss}
        </style></head><body><div id="root">${renderToStaticMarkup(record)}</div></body></html>`,
      );
      return await page.evaluate(() => {
        const row = document.querySelector<HTMLElement>("tbody tr")!;
        const [cell, empty, renderedNull, rendered] = Array.from(
          row.querySelectorAll<HTMLElement>("td"),
        );
        const rs = getComputedStyle(row);
        const rowContent =
          row.clientWidth - parseFloat(rs.paddingInlineStart) - parseFloat(rs.paddingInlineEnd);
        const cs = getComputedStyle(cell);
        return {
          padInline: parseFloat(cs.paddingInlineStart) + parseFloat(cs.paddingInlineEnd),
          cellContent:
            cell.clientWidth - parseFloat(cs.paddingInlineStart) - parseFloat(cs.paddingInlineEnd),
          rowContent,
          valueFits:
            cell.querySelector<HTMLElement>("[data-value]")!.getBoundingClientRect().right <=
            cell.getBoundingClientRect().right - parseFloat(cs.paddingInlineEnd) + 0.5,
          emptyDisplay: getComputedStyle(empty).display,
          renderedNullDisplay: getComputedStyle(renderedNull).display,
          renderedDisplay: getComputedStyle(rendered).display,
          renderedLabel: rendered.querySelector(".ui-table-stacked-collection-label")?.textContent,
        };
      });
    } finally {
      await browser.close();
    }
  }

  it("lets the card own the inline inset, so the value gets the card's full content width", async () => {
    const m = await measure();
    expect(m.padInline).toBe(0);
    expect(m.cellContent).toBeCloseTo(m.rowContent, 0);
    expect(m.valueFits).toBe(true);
    // An empty cell is gone from the card, label and all.
    expect(m.emptyDisplay).toBe("none");
    // gh#1106 — so is a cell whose COMPONENT rendered nothing (children was a non-null element)…
    expect(m.renderedNullDisplay).toBe("none");
    // …while a component that did render something keeps its cell and its label.
    expect(m.renderedDisplay).toBe("block");
    expect(m.renderedLabel).toBe("編集");
  });

  it("the token retunes the folded cell's inline inset", async () => {
    const m = await measure(":root { --table-stacked-collection-cell-padding-x: 6px; }");
    expect(m.padInline).toBe(12);
  });
});

describe("TableCell label over an empty cell (gh#1102)", () => {
  it("prints no label when the cell has no content", () => {
    const { container } = render(record);
    const labels = container.querySelectorAll(".ui-table-stacked-collection-label");
    // メール and 編集 have content; 操作 ({null}) prints none. 権限 renders an element whose
    // component returns null — its label prints, and the stacked-card CSS drops the whole cell.
    expect(Array.from(labels, (l) => l.textContent)).toEqual(["メール", "権限", "編集"]);
    const empty = container.querySelectorAll("tbody td")[1]!;
    expect(empty).toHaveTextContent("");
    expect(empty.querySelector(".ui-table-stacked-collection-value")).toBeEmptyDOMElement();
  });
});
