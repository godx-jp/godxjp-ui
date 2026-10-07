import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1175 — `ResponsiveGrid.Item rowSpan` + `ResponsiveGrid dense`, measured in Chromium with the
 * real stylesheet: the widget board's tall (1×2) cell spans two rows, and with `dense` the small
 * cells after it fill the space beside it instead of leaving a hole.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { ResponsiveGrid } from "./src/components/layout/responsive-grid";
const cell = (id, props = {}) => (
  <ResponsiveGrid.Item key={id} {...props}>
    <div data-cell={id} style={{ height: 80, background: "#ddd" }}>{id}</div>
  </ResponsiveGrid.Item>
);
// Row 1 holds a, b, c; "wide" (2 cols) cannot fit the one column left, so it wraps and leaves a
// hole at row 1 col 4 — which "d" fills only under dense packing. "tall" spans two rows.
const board = (dense) => (
  <ResponsiveGrid columns={4} gap="md" dense={dense}>
    {cell("a")}
    {cell("b")}
    {cell("c")}
    {cell("wide", { span: 2 })}
    {cell("d")}
    {cell("tall", { rowSpan: 2 })}
  </ResponsiveGrid>
);
const params = new URLSearchParams(location.search);
createRoot(document.getElementById("root")).render(
  <div style={{ width: params.get("w") + "px" }}>{board(params.get("dense") === "1")}</div>,
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function board(width: number, dense: boolean) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto(`about:blank?w=${width}&dense=${dense ? 1 : 0}`);
  await page.setContent(
    `<!doctype html><html><head><style>${css} body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector('[data-cell="d"]');
  return page;
}

const rects = (page: Page) =>
  page.evaluate(() => {
    const out: Record<string, { top: number; left: number; height: number; row: string }> = {};
    for (const el of document.querySelectorAll<HTMLElement>(".ui-responsive-grid-item")) {
      const id = el.querySelector<HTMLElement>("[data-cell]")!.dataset.cell!;
      const r = el.getBoundingClientRect();
      out[id] = {
        top: Math.round(r.top),
        left: Math.round(r.left),
        height: Math.round(r.height),
        row: getComputedStyle(el).gridRowStart,
      };
    }
    return out;
  });

describe("ResponsiveGrid rowSpan + dense (Chromium, gh#1175)", { timeout: 40_000 }, () => {
  it("a rowSpan cell spans two rows at the lg step", async () => {
    const page = await board(1100, false);
    const r = await rects(page);
    expect(r.tall!.row).toBe("span 2");
    // It reaches past its own row by at least the row gap: a one-row cell beside it ends 80px down.
    // (The second row holds nothing else here, so its implicit height is 0 — the span is the gap.)
    expect(r.tall!.height).toBeGreaterThan(r.d!.height);
    expect(r.tall!.top + r.tall!.height).toBeGreaterThan(r.d!.top + r.d!.height);
    expect(r.a!.row).toBe("span 1");
    await page.close();
  });

  it("without dense a hole stays open; with dense a later small cell back-fills it", async () => {
    const sparse = await board(1100, false);
    const dense = await board(1100, true);
    const flowOf = (page: Page) =>
      page.evaluate(
        () => getComputedStyle(document.querySelector(".ui-responsive-grid")!).gridAutoFlow,
      );
    expect(await flowOf(sparse)).toBe("row");
    // Chromium serialises `row dense` as `dense`.
    expect(await flowOf(dense)).toMatch(/dense/);
    const s = await rects(sparse);
    const d = await rects(dense);
    // Sparse: "d" comes after "wide" in row 2, leaving row 1 col 4 empty.
    expect(s.d!.top).toBeGreaterThan(s.a!.top);
    // Dense: "d" moves up into the hole beside "c".
    expect(d.d!.top).toBe(d.a!.top);
    expect(d.d!.left).toBeGreaterThan(d.c!.left);
    await sparse.close();
    await dense.close();
  });

  it("at the base step (one stacked column) a rowSpan number spans one row", async () => {
    const page = await board(360, false);
    const r = await rects(page);
    expect(r.tall!.row).toBe("span 1");
    expect(r.tall!.height).toBe(80);
    await page.close();
  });
});
