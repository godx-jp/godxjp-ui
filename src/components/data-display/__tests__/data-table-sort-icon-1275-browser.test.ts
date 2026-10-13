import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1275 in Chromium, against the real stylesheet — the sort icon takes no width from a header's
 * text. In flow, a 108px column left 56px of text beside the icon and 「予定時間」 broke between
 * kanji. The icon now hangs in the header's own inline-end padding: the text gets the whole content
 * box, the icon never overlaps it or leaves the cell, the sorted state stays visible without hover,
 * and the button (focus ring, hit area) still contains the icon.
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
  { key: "a", header: q.get("h"), width: q.get("w"), sortable: true, defaultSortOrder: "ascend", ellipsis: true, align: q.get("align") ?? undefined },
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

const measure = (page: Page) =>
  page.locator('th[data-column-key="a"]').evaluate((th) => {
    const button = th.querySelector<HTMLElement>(".ui-data-table-sort-button")!;
    const icon = th.querySelector<SVGElement>(".ui-data-table-sort-icon")!;
    const label = th.querySelector<HTMLElement>(".ui-data-table-sort-label")!;
    const tops = new Set<number>();
    let textEnd = -Infinity;
    let textStart = Infinity;
    const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        tops.add(Math.round(r.top));
        textEnd = Math.max(textEnd, r.right);
        textStart = Math.min(textStart, r.left);
      }
    }
    const thr = th.getBoundingClientRect();
    const ir = icon.getBoundingClientRect();
    const br = button.getBoundingClientRect();
    return {
      lines: tops.size,
      overlap: ir.left < textEnd - 0.5 && ir.right > textStart + 0.5,
      iconInsideCell: ir.left >= thr.left - 0.5 && ir.right <= thr.right + 0.5,
      buttonHoldsIcon: ir.left >= br.left - 0.5 && ir.right <= br.right + 0.5,
      iconVisible: getComputedStyle(icon).visibility !== "hidden" && ir.width > 0,
      /** Text centre minus the cell's content-box centre (centred headers). */
      centreOffset: (() => {
        const cs = getComputedStyle(th);
        const contentCentre =
          (thr.left + parseFloat(cs.paddingLeft) + thr.right - parseFloat(cs.paddingRight)) / 2;
        return Math.round(((textStart + textEnd) / 2 - contentCentre) * 10) / 10;
      })(),
      ariaSort: th.getAttribute("aria-sort"),
    };
  });

describe("the sort icon hangs in the header padding (gh#1275)", { timeout: 60_000 }, () => {
  it("「予定時間」 stays on one line in a 92px column (it broke as 予定時|間 before), sorted icon visible", async () => {
    const page = await open("予定時間", "92px", "ja");
    expect(await measure(page)).toMatchObject({
      lines: 1,
      overlap: false,
      iconInsideCell: true,
      buttonHoldsIcon: true,
      iconVisible: true,
      ariaSort: "ascending",
    });
    await page.close();
  });

  for (const [h, w, l] of [
    ["受付開始予定日時の確認", "72px", "ja"],
    ["Trạng thái xử lý hồ sơ", "72px", "vi"],
    ["Expected delivery date", "64px", "en"],
  ] as const) {
    it(`a long header in a narrow column wraps, and the icon never overlaps it (${l})`, async () => {
      const page = await open(h, w, l);
      const m = await measure(page);
      expect(m.lines).toBeGreaterThan(1);
      expect(m).toMatchObject({ overlap: false, iconInsideCell: true, buttonHoldsIcon: true });
      await page.close();
    });
  }

  it("an end-aligned header keeps the icon after its text, inside the cell", async () => {
    const page = await open("予定時間", "108px", "ja", "right");
    expect(await measure(page)).toMatchObject({
      overlap: false,
      iconInsideCell: true,
      buttonHoldsIcon: true,
    });
    await page.close();
  });

  it("a CENTRED header gets the same room: 「予定時間」 one line at 108px, centred, icon in the padding (gh#1278)", async () => {
    const page = await open("予定時間", "108px", "ja", "center");
    const m = await measure(page);
    expect(m).toMatchObject({
      lines: 1,
      overlap: false,
      iconInsideCell: true,
      buttonHoldsIcon: true,
      iconVisible: true,
      ariaSort: "ascending",
    });
    expect(Math.abs(m.centreOffset)).toBeLessThanOrEqual(1);
    await page.close();
  });

  it("a long CENTRED header in a narrow column wraps without overlapping the icon (gh#1278)", async () => {
    const page = await open("受付開始予定日時の確認", "72px", "ja", "center");
    const m = await measure(page);
    expect(m.lines).toBeGreaterThan(1);
    expect(m).toMatchObject({ overlap: false, iconInsideCell: true, buttonHoldsIcon: true });
    await page.close();
  });
});
