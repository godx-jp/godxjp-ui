import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1495 in Chromium, against the real stylesheet. gh#1273 pulls an inline component up by the
 * cell padding so it does not grow the row; its one-wrapper arm matched ANY wrapper that did not
 * declare a column, so a consumer's plain `<div class="flex flex-col">` stacking a shift chip over
 * a "+" button had both pulled up and the "+" painted over the chip. Two sides:
 *  (a) a plain block column in a cell — its buttons do not overlap and stay inside the cell;
 *  (b) gh#1273 still holds for the wrappers that are one line: a kit Flex row and an inline span
 *      keep the row at the plain-text height.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DataTable } from "./src/components/data-display/data-table";
import { Badge } from "./src/components/data-display/badge";
import { Button } from "./src/components/general/button";
import { Flex } from "./src/components/layout/flex";
const kind = new URLSearchParams(location.search).get("kind");
const cell = {
  plain: <span>Text</span>,
  "raw-column": (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Button size="xs" variant="outline" id="chip">09:00–18:00</Button>
      <Button size="xs" variant="ghost" id="plus" aria-label="Add">+</Button>
    </div>
  ),
  "flex-row-badge": <Flex align="center" gap="xs"><Badge>Open</Badge><span>since 10/06</span></Flex>,
  "span-button": <span><Button size="sm" variant="outline">Edit</Button></span>,
}[kind];
const data = [{ id: "1", a: "Plain text" }, { id: "2", a: "Plain text" }];
const columns = [
  { key: "a", header: "Subject" },
  { key: "b", header: "Other", render: () => cell },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <DataTable rowKey="id" data={data} columns={columns} density="compact" />
  </AppProvider>,
);
`;

let css = "";
let js = "";
let browser: Browser;

beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: ROOT,
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(kind: string): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`about:blank?kind=${kind}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("tbody tr").first().waitFor();
  return page;
}

const firstRowHeight = (page: Page) =>
  page
    .locator("tbody tr")
    .first()
    .evaluate((el) => el.getBoundingClientRect().height);

describe(
  "table-cell inline pull is scoped to one-line wrappers (gh#1495)",
  { timeout: 120_000 },
  () => {
    it("a plain block column keeps its buttons apart and inside the cell", async () => {
      const page = await open("raw-column");
      const m = await page.evaluate(() => {
        const cell = document.querySelector("#chip")!.closest("td")!.getBoundingClientRect();
        const chip = document.querySelector("#chip")!.getBoundingClientRect();
        const plus = document.querySelector("#plus")!.getBoundingClientRect();
        return { cellTop: cell.top, cellBottom: cell.bottom, chip, plus };
      });
      expect(m.plus.top).toBeGreaterThanOrEqual(m.chip.bottom);
      expect(m.chip.top).toBeGreaterThanOrEqual(m.cellTop);
      expect(m.plus.bottom).toBeLessThanOrEqual(m.cellBottom);
      // The "+" receives its own click — nothing else is painted over its centre.
      const hit = await page.evaluate(() => {
        const r = document.querySelector("#plus")!.getBoundingClientRect();
        return document
          .elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
          ?.closest("button")?.id;
      });
      expect(hit).toBe("plus");
      await page.close();
    });

    it("gh#1273 still holds for a Flex row and an inline span wrapper", async () => {
      const floorPage = await open("plain");
      const floor = await firstRowHeight(floorPage);
      await floorPage.close();
      for (const kind of ["flex-row-badge", "span-button"]) {
        const page = await open(kind);
        const h = await firstRowHeight(page);
        await page.close();
        expect(h - floor, `${kind}: ${h} vs floor ${floor}`).toBeLessThanOrEqual(0.05);
      }
    });
  },
);
