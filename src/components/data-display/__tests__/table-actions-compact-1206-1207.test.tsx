import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Button } from "../../general/button";
import { Flex } from "../../layout/flex";
import { DataTable } from "../data-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

/**
 * The gh#1067 actions-column fit, below the collapse step on a 390px phone (Chromium, real CSS).
 *
 * gh#1206 — the compact tier makes everything inside a cell wrap, so a wrapping `Flex` of text
 * buttons collapses to the cell's width and the fit check read "fits": a 44px column held 49px and
 * 63px buttons, which spilled out of the cell. The column is now at least its widest button.
 *
 * gh#1207 — the measured actions width came out of the fixed compact floor
 * (`minInlineSizeCompact`), so the other columns shrank and the JA meta header 「シリアル番号」
 * wrapped 3+3. The excess over the token now grows the floor, and the wrapper scrolls instead.
 */

const ROOT = process.cwd();

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Button } from "./src/components/general/button";
import { Flex } from "./src/components/layout/flex";
import { DataTable } from "./src/components/data-display/data-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./src/components/data-display/table";

const requests = [
  { id: "1", who: "山田 太郎", app: "経費精算", at: "10/01", due: "10/08" },
  { id: "2", who: "佐藤 花子", app: "勤怠管理", at: "10/02", due: "10/09" },
];
const review = [
  { key: "who", header: "申請者", priority: "primary" },
  { key: "app", header: "アプリ", priority: "secondary" },
  { key: "at", header: "申請日", priority: "meta" },
  { key: "due", header: "期限", priority: "meta" },
  {
    key: "actions", header: "", ariaLabel: "操作", priority: "actions",
    render: () => (
      <Flex gap="xs" justify="end" wrap>
        <Button variant="outline" size="sm">承認</Button>
        <Button variant="ghost" size="sm">却下…</Button>
      </Flex>
    ),
  },
];

const devices = [
  ["PC-0001", "営業部", "東京本社", "SN-88231", "Windows 11", "10/01"],
  ["PC-0002", "開発部", "大阪支社", "SN-88232", "macOS 15", "10/02"],
];

createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div id="stacked">
      <DataTable data={requests} columns={review} getRowId={(r) => r.id} preset="action-collection" collapseBelow="sm" />
    </div>
    <div id="floor">
      <Table preset="action-collection" collapseBelow="sm" columnWidths={{ minInlineSizeCompact: "40rem" }}>
        <TableHeader>
          <TableRow>
            <TableHead priority="primary">端末名</TableHead>
            <TableHead priority="secondary">部署</TableHead>
            <TableHead priority="secondary">拠点</TableHead>
            <TableHead priority="meta" data-serial="">シリアル番号</TableHead>
            <TableHead priority="meta">OS</TableHead>
            <TableHead priority="meta">更新日</TableHead>
            <TableHead priority="actions" aria-label="操作" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((d) => (
            <TableRow key={d[0]}>
              <TableCell priority="primary">{d[0]}</TableCell>
              <TableCell priority="secondary">{d[1]}</TableCell>
              <TableCell priority="secondary">{d[2]}</TableCell>
              <TableCell priority="meta">{d[3]}</TableCell>
              <TableCell priority="meta">{d[4]}</TableCell>
              <TableCell priority="meta">{d[5]}</TableCell>
              <TableCell priority="actions">
                <Flex gap="xs" justify="end" wrap>
                  <Button variant="outline" size="sm">編集</Button>
                  <Button variant="ghost" size="sm">無効化</Button>
                  <Button variant="ghost" size="sm">削除</Button>
                </Flex>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </AppProvider>,
);
`;

let css = "";
let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  // Utility classes DataTable / Table / Button / Flex emit, so the real sheet covers them.
  const markup = renderToStaticMarkup(
    <AppProvider defaultLocale="ja" persist={false}>
      <DataTable
        preset="action-collection"
        data={[{ id: "1" }]}
        columns={[
          { key: "id", header: "ID", priority: "primary" },
          {
            key: "actions",
            header: "",
            ariaLabel: "操作",
            priority: "actions",
            render: () => (
              <Flex gap="xs" justify="end" wrap>
                <Button variant="outline" size="sm">
                  承認
                </Button>
              </Flex>
            ),
          },
        ]}
      />
      <Table preset="action-collection" columnWidths={{ minInlineSizeCompact: "40rem" }}>
        <TableHeader>
          <TableRow>
            <TableHead priority="meta">a</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell priority="actions">b</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </AppProvider>,
  );
  css = await compileRealCss(markup);
  // esbuild's TextEncoder/Uint8Array check fails under jsdom's realm — see org-chart-geometry-1034.
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  let out: Awaited<ReturnType<typeof import("esbuild").build>>;
  try {
    const { build } = await import("esbuild");
    out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: join(ROOT),
    });
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  js = out.outputFiles![0]!.text;
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function mount(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css} body { margin: 0; } #root { padding-inline: 1rem; }</style></head><body><div id="root"></div></body></html>`,
  );
  await page.addScriptTag({ content: js });
  await page.waitForSelector("#floor tbody tr", { state: "attached" });
  // Three frames: the fit is published from a ResizeObserver callback, then laid out again.
  await page.evaluate(
    () =>
      new Promise((r) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(() => r(null))),
        ),
      ),
  );
  return page;
}

/** Per body row of `#id`: the actions cell edges, its neighbour's end, and every button box. */
function actions(page: Page, id: string) {
  return page.evaluate(
    (id) =>
      [...document.querySelectorAll(`#${id} tbody tr`)].map((row) => {
        const cells = [...row.querySelectorAll<HTMLElement>("td")];
        const cell = cells.at(-1)!;
        const box = cell.getBoundingClientRect();
        return {
          cellEnd: box.right,
          cellWidth: box.width,
          prevEnd: cells.at(-2)!.getBoundingClientRect().right,
          buttons: [...cell.querySelectorAll("button")].map((b) => {
            const r = b.getBoundingClientRect();
            return { text: b.textContent, left: r.left, right: r.right, width: r.width };
          }),
        };
      }),
    id,
  );
}

describe("action-collection actions column below the collapse step (Chromium, 390px)", () => {
  it("gh#1206: stacked text buttons widen the actions column to the widest button", async () => {
    const page = await mount();
    const rows = await actions(page, "stacked");
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      const widest = Math.max(...row.buttons.map((b) => b.width));
      expect(row.cellWidth, JSON.stringify(row)).toBeGreaterThanOrEqual(widest);
      for (const b of row.buttons) {
        expect(b.left, `${b.text} clears the previous cell`).toBeGreaterThanOrEqual(
          row.prevEnd - 1,
        );
        expect(b.right, `${b.text} ends inside its cell`).toBeLessThanOrEqual(row.cellEnd + 1);
      }
    }
    await page.close();
  });

  it("gh#1207: a measured actions width grows the compact floor instead of shrinking the other columns", async () => {
    const page = await mount();
    const m = await page.evaluate(() => {
      const th = document.querySelector<HTMLElement>("#floor th[data-serial]")!;
      const range = document.createRange();
      range.selectNodeContents(th);
      const tops = new Set([...range.getClientRects()].map((r) => Math.round(r.top)));
      const table = document.querySelector<HTMLElement>("#floor table")!;
      return {
        rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
        lines: tops.size,
        metaWidth: th.getBoundingClientRect().width,
        tableWidth: table.getBoundingClientRect().width,
        published: parseFloat(
          getComputedStyle(table).getPropertyValue(
            "--table-action-collection-actions-content-width",
          ),
        ),
      };
    });
    // Precondition: the stacked buttons are wider than the 2.75rem compact token, so the fit
    // publishes a width (gh#1206).
    expect(m.published, JSON.stringify(m)).toBeGreaterThan(2.75 * m.rem);
    // The floor grows by exactly that excess, so the table outgrows its 40rem floor ...
    expect(
      Math.abs(m.tableWidth - (40 * m.rem + m.published - 2.75 * m.rem)),
      JSON.stringify(m),
    ).toBeLessThanOrEqual(1);
    // ... and a meta column keeps the share it had with the 2.75rem token (31.0.4: ~92px).
    expect(m.metaWidth, JSON.stringify(m)).toBeGreaterThanOrEqual(90);
    expect(m.lines, "「シリアル番号」 stays on one line").toBe(1);
    await page.close();
  });
});
