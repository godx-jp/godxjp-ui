import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1387 in Chromium, against the real stylesheet and sonner's own injected CSS. gino-cloud saw
 * an empty box behind a fresh toast: a second toast arrived while the first was still live, and
 * sonner's collapsed stack kept the first as a card peeking 13px above the front one — frame
 * painted at `opacity: 1`, content at `opacity: 0` (back `li` 338×51 behind a 356×54 front,
 * `innerText ''`). The Toaster now defaults `expand` on, so every drawn toast carries its message;
 * `expand={false}` still gives the collapsed deck to a consumer who asks for it.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Toaster } from "./src/components/feedback/sonner";
import { toast } from "./src/components/feedback/use-toast";
window.__toast = toast;
const collapsed = new URLSearchParams(location.search).get("expand") === "false";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div id="ready">
      {collapsed ? <Toaster expand={false} /> : <Toaster />}
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

/** The consumer's sequence: one toast, then a second while the first is still on screen. */
async function openWithTwoToasts(query: string): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.goto(`about:blank?${query}`);
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}html,body,#root{height:100%;margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready").waitFor({ state: "attached" });
  const fire = (message: string) =>
    page.evaluate((m) => {
      (window as unknown as { __toast: { success: (m: string) => void } }).__toast.success(m);
    }, message);
  await fire("申請案件を作成しました。");
  await page.waitForTimeout(600);
  await fire("回答を保存しました。");
  await page.waitForFunction(
    () => document.querySelectorAll('[data-sonner-toast][data-mounted="true"]').length === 2,
  );
  // Past sonner's 400ms enter / stack transitions, so the measured state is the settled one.
  await page.waitForTimeout(1000);
  return page;
}

/** Each live toast: its painted frame, and whether the message inside it is actually drawn. */
const toasts = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-sonner-toast]")].map((li) => {
      const box = li.getBoundingClientRect();
      const frameOpacity = Number(getComputedStyle(li).opacity);
      const children = [...li.children].map((child) => getComputedStyle(child));
      return {
        top: box.top,
        bottom: box.bottom,
        framePainted: frameOpacity > 0 && box.width > 0 && box.height > 0,
        contentDrawn: children.every((s) => s.visibility !== "hidden" && Number(s.opacity) > 0.99),
        text: li.innerText.trim(),
      };
    }),
  );

describe("a stack of two toasts never paints an empty frame (gh#1387)", { timeout: 60_000 }, () => {
  it("every painted toast frame carries its message, and the frames do not overlap", async () => {
    const page = await openWithTwoToasts("");
    const stack = await toasts(page);
    expect(stack).toHaveLength(2);
    for (const toast of stack) {
      expect(toast.framePainted).toBe(true);
      expect(toast.contentDrawn).toBe(true);
      expect(toast.text).not.toBe("");
    }
    const [a, b] = [...stack].sort((x, y) => x.top - y.top);
    expect(a!.bottom).toBeLessThanOrEqual(b!.top + 0.5);
    await page.close();
  });

  it("expand={false} still opts back into sonner's collapsed deck", async () => {
    const page = await openWithTwoToasts("expand=false");
    const stack = await toasts(page);
    expect(stack).toHaveLength(2);
    expect(stack.filter((t) => t.contentDrawn)).toHaveLength(1);
    await page.close();
  });
});
