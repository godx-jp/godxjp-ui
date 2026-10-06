import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1180 — an account menu whose item label is wider than the menu raised "ResizeObserver loop
 * completed with undelivered notifications" (measured on 31.0.4 in godx-jp/id). Driven here with
 * the real DropdownMenu, the trigger at the right edge, at a phone and a desktop width.
 */
const ROOT = process.cwd();
const LONG = "データのエクスポート・アカウントの削除（すべての所属組織から完全に退会する）";
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Button } from "./src/components/general";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./src/components/navigation";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div style={{ display: "flex", justifyContent: "flex-end", padding: 8 }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button>アカウント</Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>プロフィール</DropdownMenuItem>
          <DropdownMenuItem>${LONG}</DropdownMenuItem>
          <DropdownMenuItem>ログアウト</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

describe("DropdownMenu with a label wider than the menu (Chromium, gh#1180)", { timeout: 40_000 }, () => {
  for (const width of [390, 1440]) {
    it(`opens at ${width}px with no ResizeObserver loop and nothing outside the viewport`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css}</style></head><body style="margin:0"><script>window.__errors=[];addEventListener("error",(e)=>window.__errors.push(String(e.message)));</script><div id="root"></div><script>${js}</script></body></html>`,
      );
      await page.getByRole("button", { name: "アカウント" }).click();
      const item = page.getByRole("menuitem", { name: LONG });
      await item.waitFor();
      // Two frames for any ResizeObserver delivery to surface.
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      await page.waitForTimeout(200);
      const m = await page.evaluate(() => {
        const menu = document.querySelector(".ui-dropdown-menu-content")!.getBoundingClientRect();
        const row = [...document.querySelectorAll('[role="menuitem"]')][1] as HTMLElement;
        return {
          errors: (window as unknown as { __errors: string[] }).__errors,
          left: menu.left,
          right: menu.right,
          rowOverflows: row.scrollWidth > row.clientWidth + 1,
        };
      });
      expect([...errors, ...m.errors].filter((e) => /ResizeObserver/.test(e))).toEqual([]);
      expect(m.left).toBeGreaterThanOrEqual(0);
      expect(m.right).toBeLessThanOrEqual(width);
      // The label wraps inside the row instead of spilling past it.
      expect(m.rowOverflows).toBe(false);
      await page.close();
    });
  }
});
