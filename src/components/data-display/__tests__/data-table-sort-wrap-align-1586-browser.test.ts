import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1586 in Chromium, against the real stylesheet — a WRAPPED sortable header follows its
 * column's alignment. The sort `<button>` kept the UA `text-align: center`, so every wrapped line
 * was centred inside it while the cells below were start-aligned (GoDX Grid's 件名 column).
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DataTable } from "./src/components/data-display/data-table";
const q = new URLSearchParams(location.search);
const data = [{ id: "1", a: "x", b: "y" }];
const columns = [
  { key: "a", header: q.get("h"), width: q.get("w"), sortable: true, ellipsis: true, align: q.get("align") ?? undefined },
  { key: "b", header: "Next" },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale={q.get("l")} persist={false}>
    <div id="ready" style={{ width: 600 }}><DataTable rowKey="id" data={data} columns={columns} /></div>
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

async function open(h: string, w: string, l: string, align = ""): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(
    `about:blank?h=${encodeURIComponent(h)}&w=${w}&l=${l}${align ? `&align=${align}` : ""}`,
  );
  await page.setContent(
    `<!doctype html><html lang="${l}"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('th[data-column-key="a"] .ui-data-table-sort-button').waitFor();
  return page;
}

/** Each wrapped line's start and end, as offsets from the header's content box. */
const lines = (page: Page) =>
  page.locator('th[data-column-key="a"]').evaluate((th) => {
    const label = th.querySelector<HTMLElement>(".ui-data-table-sort-label")!;
    const cs = getComputedStyle(th);
    const thr = th.getBoundingClientRect();
    const contentLeft = thr.left + parseFloat(cs.paddingLeft);
    const contentRight = thr.right - parseFloat(cs.paddingRight);
    const byTop = new Map<number, { left: number; right: number }>();
    const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        const top = Math.round(r.top);
        const line = byTop.get(top) ?? { left: Infinity, right: -Infinity };
        line.left = Math.min(line.left, r.left);
        line.right = Math.max(line.right, r.right);
        byTop.set(top, line);
      }
    }
    return [...byTop.values()].map((l) => ({
      start: Math.round((l.left - contentLeft) * 10) / 10,
      end: Math.round((contentRight - l.right) * 10) / 10,
    }));
  });

describe(
  "a wrapped sortable header follows its column's alignment (gh#1586)",
  { timeout: 60_000 },
  () => {
    for (const [h, w, l] of [
      ["Đăng nhập gần nhất", "140px", "vi"],
      ["受付開始予定日時の確認", "72px", "ja"],
      ["Expected delivery date", "64px", "en"],
    ] as const) {
      it(`start-aligned: every wrapped line starts at the content edge, like the cells below (${l})`, async () => {
        const page = await open(h, w, l);
        const ls = await lines(page);
        expect(ls.length).toBeGreaterThan(1);
        for (const line of ls) expect(Math.abs(line.start)).toBeLessThanOrEqual(1);
        await page.close();
      });
    }

    it("end-aligned: every wrapped line ends at the same edge", async () => {
      const page = await open("受付開始予定日時の確認", "72px", "ja", "right");
      const ls = await lines(page);
      expect(ls.length).toBeGreaterThan(1);
      const ends = ls.map((line) => line.end);
      expect(Math.max(...ends) - Math.min(...ends)).toBeLessThanOrEqual(1);
      await page.close();
    });
  },
);
