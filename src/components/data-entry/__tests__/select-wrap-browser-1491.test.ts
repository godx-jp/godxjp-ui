import { TextEncoder as NodeTextEncoder } from "node:util";
import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compileRealCss } from "./compile-real-css";

const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Select } from "./src/components/data-entry";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div style={{ width: 200, padding: 16 }}>
      <Select aria-label="ゲーム" width="auto" popupMatchSelectWidth={200} options={[
        { value: "short", label: "短い名前" },
        { value: "long", label: "ドラゴンボールスーパーカードゲーム フュージョンワールド" },
        { value: "last", label: "最後のゲーム" }
      ]} />
    </div>
  </AppProvider>
);
`;
let css = "";
let js = "";
let browser: Browser;
beforeAll(async () => {
  const realm = {
    encoder: globalThis.TextEncoder,
    bytes: globalThis.Uint8Array,
  };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: {
        contents: ENTRY,
        loader: "tsx",
        resolveDir: ROOT,
        sourcefile: "entry.tsx",
      },
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
  css = await compileRealCss(
    `<div class="${tokens.replaceAll('"', "")}"></div>`,
  );
  browser = await chromium.launch({ headless: true });
}, 180_000);
afterAll(async () => {
  await browser?.close();
});

describe("Select wrapped labels (gh#1491)", () => {
  it("expands the row around its full label and still supports keyboard selection", async () => {
    const page = await browser.newPage({
      viewport: { width: 375, height: 812 },
    });
    try {
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
      );
      const trigger = page.getByRole("combobox", { name: "ゲーム" });
      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      await page.getByRole("option", { name: "短い名前" }).waitFor();
      const rows = await page.getByRole("option").evaluateAll((items) =>
        items.map((row) => {
          const rect = row.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(row);
          const text = range.getBoundingClientRect();
          return {
            top: rect.top,
            bottom: rect.bottom,
            height: rect.height,
            textTop: text.top,
            textBottom: text.bottom,
          };
        }),
      );
      expect(rows).toHaveLength(3);
      expect(rows[1]!.height).toBeGreaterThan(rows[0]!.height);
      for (let i = 0; i < rows.length; i++) {
        expect(rows[i]!.textTop).toBeGreaterThanOrEqual(rows[i]!.top);
        expect(rows[i]!.textBottom).toBeLessThanOrEqual(rows[i]!.bottom);
        if (i) expect(rows[i]!.top).toBeGreaterThanOrEqual(rows[i - 1]!.bottom);
      }
      await page.keyboard.press("Home");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      expect(await trigger.textContent()).toContain(
        "ドラゴンボールスーパーカードゲーム フュージョンワールド",
      );
    } finally {
      await page.close();
    }
  }, 40_000);
});
