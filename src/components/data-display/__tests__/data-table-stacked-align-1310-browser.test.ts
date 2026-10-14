import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * gh#1310 (3) — `preset="stacked-record-collection"` below its step: a column with `align: "right"`
 * kept its end alignment inside each stacked card, so godx-content's "Sub-pages 0" sat alone at the
 * row's end while the other fields read from the start. End alignment is for a number COLUMN; in a
 * card the value is one field among labels. Asserted on geometry: every value's first glyph starts
 * where its own label starts — DataTable `align` right/center, and the Table primitive's
 * `numeric` / `align="end"` — and above the step the column keeps its end alignment.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DataTable } from "./src/components/data-display/data-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./src/components/data-display/table";
const q = new URLSearchParams(location.search);
const frame = Number(q.get("frame") ?? 390);
const data = [
  { id: "1", title: "Onboarding", owner: "Famgia Info", pages: 12, share: "40%" },
  { id: "2", title: "Release notes", owner: "Famgia Info", pages: 0, share: "5%" },
];
const columns = [
  { key: "title", header: "Title" },
  { key: "owner", header: "Owner" },
  { key: "pages", header: "Sub-pages", align: "right" },
  { key: "share", header: "Share", align: "center" },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div id="frame" style={{ width: frame }}>
      <DataTable rowKey="id" data={data} columns={columns} preset="stacked-record-collection" />
      <Table preset="stacked-record-collection" collapseBelow="sm">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Name</TableHead>
            <TableHead scope="col" numeric>Count</TableHead>
            <TableHead scope="col" align="end">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell label="Name">Alpha</TableCell>
            <TableCell label="Count" numeric>7</TableCell>
            <TableCell label="Total" align="end">1,200</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

/** Per body cell: x of the label's first glyph, x of the value's first glyph. */
const cells = (frame: number) =>
  fixture.open(`?frame=${frame}`, { width: 1280, height: 900 }).then((page) =>
    page.$$eval('tbody [data-slot="table-cell"]', (els) =>
      els.map((cell) => {
        const firstGlyph = (root: Node, skip?: Element) => {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
            if (!n.data.trim() || (skip && skip.contains(n))) continue;
            const r = document.createRange();
            r.setStart(n, n.data.search(/\S/));
            r.setEnd(n, n.data.search(/\S/) + 1);
            const rect = r.getClientRects()[0];
            if (rect) return Math.round(rect.left);
          }
          return null;
        };
        const label = cell.querySelector(".ui-table-stacked-collection-label");
        return {
          text: (cell.textContent ?? "").trim(),
          label: label && getComputedStyle(label).display !== "none" ? firstGlyph(label) : null,
          value: firstGlyph(cell, label ?? undefined),
          cellEnd: Math.round(cell.getBoundingClientRect().right),
        };
      }),
    ),
  );

describe(
  "stacked-record-collection value alignment (Chromium, gh#1310)",
  { timeout: 60_000 },
  () => {
    it("stacked at 390: every value starts at its label's start, whatever the column's align", async () => {
      const m = await cells(390);
      expect(m.length).toBe(11);
      expect(m.every((c) => c.label !== null)).toBe(true);
      expect(m.filter((c) => c.value !== c.label)).toEqual([]);
    });

    it("not stacked at 1200: the right-aligned and numeric columns still end-align", async () => {
      const m = await cells(1200);
      const ends = m.filter((c) => ["12", "0", "7", "1,200"].some((v) => c.text.endsWith(v)));
      expect(ends.length).toBe(4);
      for (const c of ends) expect(c.value!).toBeGreaterThan(c.cellEnd - 80);
    });
  },
);
