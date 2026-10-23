import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1409 (gino-cloud) in Chromium, against the real stylesheet. One `ellipsis` column switches
 * the whole DataTable to `table-layout: fixed` — it has to, or nothing truncates. Every OTHER body
 * cell kept the grid's `nowrap` with `overflow: visible`, so its text ran across the next column
 * with no title: measured 379px of Vietnamese and 326px of a Japanese company name in 175px cells.
 * An unmarked cell now wraps under the fixed layout (antd's cells do), the `ellipsis` cell keeps
 * its one line and its title, and an auto-layout table keeps `nowrap`.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DataTable } from "./src/components/data-display/data-table";
const kind = new URLSearchParams(location.search).get("kind");
const long = "Loại hồ sơ xin cấp phép lưu trú dài hạn cho thực tập sinh";
const company = "株式会社グローバルヒューマンリソースマネジメント";
const data = [{ id: "1", subject: long + " " + long, kind: long, company, code: "A-1" }];
const columns = [
  { key: "subject", header: "Hồ sơ", ellipsis: kind !== "auto" },
  { key: "kind", header: "Loại hồ sơ" },
  { key: "company", header: "Công ty" },
  { key: "code", header: "Mã" },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="vi" persist={false}>
    <div id="box" style={{ width: kind === "auto" ? 1600 : 700 }}>
      <DataTable rowKey="id" data={data} columns={columns} />
    </div>
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

async function open(kind: "fixed" | "auto"): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1700, height: 800 } });
  await page.goto(`about:blank?kind=${kind}`);
  await page.setContent(
    `<!doctype html><html lang="vi"><head><style>${css}html,body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("tbody td").first().waitFor();
  if (kind === "fixed")
    await page.locator('tbody td[data-column-key="subject"][data-truncated]').waitFor();
  return page;
}

const cell = (page: Page, key: string) =>
  page.locator(`tbody td[data-column-key="${key}"]`).evaluate((el) => ({
    overflow: el.scrollWidth - el.clientWidth,
    whiteSpace: getComputedStyle(el).whiteSpace,
    title: el.getAttribute("title"),
  }));

describe(
  "DataTable fixed layout: unmarked cells stay inside their column (gh#1409)",
  { timeout: 60_000 },
  () => {
    it("the table is on the fixed layout because one column asked for ellipsis", async () => {
      const page = await open("fixed");
      await expect(
        page.locator("table").evaluate((el) => getComputedStyle(el).tableLayout),
      ).resolves.toBe("fixed");
      await page.close();
    });

    it("an unmarked cell wraps inside its column instead of painting over the next one", async () => {
      const page = await open("fixed");
      for (const key of ["kind", "company"]) {
        const c = await cell(page, key);
        expect({ key, ...c }).toMatchObject({ key, whiteSpace: "normal" });
        expect(c.overflow).toBeLessThanOrEqual(1);
      }
      await page.close();
    });

    it("the ellipsis cell keeps its one line, its cut and its title", async () => {
      const page = await open("fixed");
      const c = await cell(page, "subject");
      expect(c.whiteSpace).toBe("nowrap");
      expect(c.overflow).toBeGreaterThan(1);
      expect(c.title).toContain("Loại hồ sơ xin cấp phép");
      await page.close();
    });

    it("an auto-layout table keeps the grid's nowrap default", async () => {
      const page = await open("auto");
      await expect(
        page.locator("table").evaluate((el) => getComputedStyle(el).tableLayout),
      ).resolves.toBe("auto");
      expect((await cell(page, "kind")).whiteSpace).toBe("nowrap");
      await page.close();
    });
  },
);
