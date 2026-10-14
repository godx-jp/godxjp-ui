import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";

/**
 * ADR C05 in Chromium: below the compact step the first unindented line starts at most 24px from
 * the editor's inner edge — the handle gutter collapses — while the block handle stays reachable
 * (shown for the caret's block, as targets of at least 24×24) and Mod+/ still opens the block menu.
 * From the step up the gutter is unchanged: the handle sits beside the text, not over it.
 */
const ROOT = process.cwd();
const ALIAS = {
  "@godxjp/markdown/codec": join(ROOT, "packages/markdown/src/codec/index.ts"),
  "@godxjp/markdown": join(ROOT, "packages/markdown/src/index.ts"),
  "@godxjp/ui/i18n": join(ROOT, "src/i18n/index.ts"),
  "@godxjp/ui/data-display": join(ROOT, "src/components/data-display/index.ts"),
  "@godxjp/ui/data-entry": join(ROOT, "src/components/data-entry/index.ts"),
  "@godxjp/ui/general": join(ROOT, "src/components/general/index.ts"),
  "@godxjp/ui/navigation": join(ROOT, "src/components/navigation/index.ts"),
  "@godxjp/ui/layout": join(ROOT, "src/components/layout/index.ts"),
};

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { BlockEditor } from "./packages/block-editor/src";

function App() {
  return (
    <AppProvider defaultLocale="ja" persist={false}>
      <div style={{ padding: 16 }}>
        <BlockEditor aria-label="本文" defaultValue={"# 概要\\n\\nこのページは編集画面のサンプルです。\\n\\n- 手順 1\\n- 手順 2\\n"} />
      </div>
    </AppProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
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
      alias: ALIAS,
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

async function open(width: number) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css} body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector(".ui-block-editor-content p");
  return { page, errors };
}

/** Inset of the first unindented block (the heading) from the editor's inner (border) edge, and the handle's boxes. */
const measure = (page: Page) =>
  page.evaluate(() => {
    const editor = document.querySelector<HTMLElement>(".ui-block-editor")!;
    const e = editor.getBoundingClientRect();
    const inner = e.left + parseFloat(getComputedStyle(editor).borderInlineStartWidth);
    const first = document.querySelector(".ui-block-editor-content h1")!;
    const range = document.createRange();
    range.selectNodeContents(first);
    const text = range.getBoundingClientRect();
    const para = document.querySelector(".ui-block-editor-content p")!.getBoundingClientRect();
    const handle = document.querySelector(".ui-block-editor-handle");
    const buttons = handle
      ? [...handle.querySelectorAll("button")].map((b) => b.getBoundingClientRect())
      : [];
    return {
      inset: text.left - inner,
      textLeft: text.left,
      paraTop: para.top,
      handle: handle
        ? {
            visible: getComputedStyle(handle).opacity !== "0",
            left: Math.min(...buttons.map((b) => b.left)),
            right: Math.max(...buttons.map((b) => b.right)),
            bottom: Math.max(...buttons.map((b) => b.bottom)),
            minSide: Math.min(...buttons.flatMap((b) => [b.width, b.height])),
            insideEditor: buttons.every((b) => b.left >= e.left - 0.5 && b.right <= e.right + 0.5),
          }
        : null,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });

describe("BlockEditor compact gutter (Chromium, ADR C05)", { timeout: 40_000 }, () => {
  it("at 390 starts the first line within 24px of the inner edge, handle still reachable", async () => {
    const { page, errors } = await open(390);
    expect((await measure(page)).inset).toBeLessThanOrEqual(24);

    await page.locator(".ui-block-editor-content > p").first().click();
    await page.waitForSelector(".ui-block-editor-handle");
    const m = await measure(page);
    expect(m.inset).toBeLessThanOrEqual(24);
    expect(m.handle).not.toBeNull();
    expect(m.handle!.visible).toBe(true);
    expect(m.handle!.minSide).toBeGreaterThanOrEqual(24);
    expect(m.handle!.insideEditor).toBe(true);
    // Raised above the caret's block, so it never covers the line being typed (1.5px: the
    // handle's top is read against the framed host's border box, one hairline off its padding box).
    expect(m.handle!.bottom).toBeLessThanOrEqual(m.paraTop + 1.5);
    expect(m.overflow).toBeLessThanOrEqual(1.5);

    // The FIRST block has nothing above it inside the frame: the handle must not leave the editor.
    await page.locator(".ui-block-editor-content h1").click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const h = document.querySelector(".ui-block-editor-handle")!.getBoundingClientRect();
          const e = document.querySelector(".ui-block-editor")!.getBoundingClientRect();
          const first = document
            .querySelector(".ui-block-editor-content h1")!
            .getBoundingClientRect();
          // It is the heading's handle (not the paragraph's, left behind), and it stays inside the frame.
          return h.top < first.bottom && h.top >= e.top - 0.5;
        }),
      )
      .toBe(true);
    await page.locator(".ui-block-editor-content > p").first().click();

    // Keyboard alternative: Mod+/ opens the caret block's menu.
    await page.keyboard.press("ControlOrMeta+/");
    await expect.poll(() => page.getByRole("menuitem", { name: "複製" }).count()).toBe(1);
    expect(errors).toEqual([]);
    await page.close();
  });

  it("at 1280 keeps the handle gutter: the handle sits beside the text", async () => {
    const { page, errors } = await open(1280);
    await page.locator(".ui-block-editor-content > p").first().click();
    await page.waitForSelector(".ui-block-editor-handle");
    const m = await measure(page);
    expect(m.handle).not.toBeNull();
    expect(m.handle!.right).toBeLessThanOrEqual(m.textLeft + 0.5);
    expect(m.inset).toBeGreaterThan(24);
    expect(errors).toEqual([]);
    await page.close();
  });
});
