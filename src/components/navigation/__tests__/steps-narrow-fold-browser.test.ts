import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * GDX-1363 in Chromium, against the real stylesheet. Before the fix, at 320px under lang="ja",
 * four horizontal steps gave each `.ui-steps-title` a 48px column and the titles broke inside the
 * word: 「プロジ｜ェクト」, 「同期モ｜ード」, 「ステー｜タスの｜対応」.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Steps } from "./src/components/navigation/steps";
const items = [{ title: "接続" }, { title: "プロジェクト" }, { title: "同期モード" }, { title: "ステータスの対応" }];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}><div id="ready" style={{ padding: 16 }}><Steps size="sm" value={1} items={items} /></div></AppProvider>,
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

async function open(width: number): Promise<Page> {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready ol").waitFor();
  return page;
}

/** Each title's rendered lines, read from the client rects of its characters. */
function titleLines(page: Page) {
  return page.locator(".ui-steps-title").evaluateAll((titles) =>
    titles.map((title) => {
      const text = title.textContent ?? "";
      const node = title.firstChild!;
      const lines: string[] = [];
      let top: number | undefined;
      for (let i = 0; i < text.length; i += 1) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const y = Math.round(range.getBoundingClientRect().top);
        if (top === undefined || y > top + 2) {
          lines.push("");
          top = y;
        }
        lines[lines.length - 1] += text[i];
      }
      return lines;
    }),
  );
}

describe("Steps titles at narrow widths (GDX-1363)", { timeout: 60_000 }, () => {
  it("folds to vertical at 320px and every title stays on one line", async () => {
    const page = await open(320);
    expect(await page.locator("ol").getAttribute("data-direction")).toBe("vertical");
    expect(await titleLines(page)).toEqual([
      ["接続"],
      ["プロジェクト"],
      ["同期モード"],
      ["ステータスの対応"],
    ]);
    await page.close();
  });

  it("stays horizontal at 768px with whole titles", async () => {
    const page = await open(768);
    expect(await page.locator("ol").getAttribute("data-direction")).toBe("horizontal");
    const lines = await titleLines(page);
    expect(lines.map((l) => l.join(""))).toEqual([
      "接続",
      "プロジェクト",
      "同期モード",
      "ステータスの対応",
    ]);
    for (const title of lines) expect(title).toHaveLength(1);
    await page.close();
  });

  it("a Japanese title breaks between phrases, never before a small kana or ー", async () => {
    const page = await open(768);
    const style = await page
      .locator(".ui-steps-title")
      .first()
      .evaluate((el) => {
        const cs = getComputedStyle(el);
        return { wordBreak: cs.wordBreak, lineBreak: cs.getPropertyValue("line-break") };
      });
    expect(style).toEqual({ wordBreak: "auto-phrase", lineBreak: "strict" });
    await page.close();
  });
});
