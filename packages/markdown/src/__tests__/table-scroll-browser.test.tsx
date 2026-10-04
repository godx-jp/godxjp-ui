import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";
import { Prose } from "../../../../src/components/data-display/prose";

/**
 * gh#1131 in Chromium: a wide Markdown table scrolls in its own box (focusable only while it
 * overflows), the page never scrolls sideways, and a short code in a narrow column stays whole.
 */
const ROOT = process.cwd();
const WIDE = `| ${Array.from({ length: 8 }, (_, i) => `Column header ${i}`).join(" | ")} |\n|${" --- |".repeat(8)}\n| ${Array.from({ length: 8 }, (_, i) => `value ${i}`).join(" | ")} |`;
const CODES =
  "| Code | Description |\n| --- | --- |\n| F02 | " + "とても長い説明文です。".repeat(8) + " |";
const SMALL = "| a | b |\n| --- | --- |\n| 1 | 2 |";

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Prose } from "./src/components/data-display/prose";
import { Markdown } from "./packages/markdown/src/markdown";
const md = (id, body) => <div id={id}><Prose><Markdown>{body}</Markdown></Prose></div>;
createRoot(document.getElementById("root")).render(<div style={{ padding: 16 }}>
  {md("wide", ${JSON.stringify(WIDE)})}{md("codes", ${JSON.stringify(CODES)})}{md("small", ${JSON.stringify(SMALL)})}
</div>);
`;

let css = "";
let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  css = await compileRealCss(renderToStaticMarkup(<Prose>x</Prose>));
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
      absWorkingDir: join(ROOT),
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  browser = await chromium.launch({ headless: true });
}, 120_000);

afterAll(async () => {
  await browser?.close();
});

describe("Prose tables (Chromium, gh#1131)", () => {
  it("a wide table scrolls in its own focusable box, the page does not, and F02 stays whole", async () => {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
    try {
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css} body{margin:0}</style></head><body><div id="root"></div></body></html>`,
      );
      await page.addScriptTag({ content: js });
      await page.waitForSelector("#small table");
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
      const m = await page.evaluate(() => {
        const box = (id: string) =>
          document.querySelector<HTMLElement>(`#${id} .ui-prose-table-scroll`)!;
        const code = document.querySelector("#codes td")!.firstChild!;
        const range = document.createRange();
        range.selectNodeContents(code);
        return {
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          wideScrolls: box("wide").scrollWidth > box("wide").clientWidth,
          wideTab: box("wide").tabIndex,
          smallTab: box("small").getAttribute("tabindex"),
          codeText: code.textContent,
          codeLines: new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size,
        };
      });
      expect(m.pageOverflow).toBeLessThanOrEqual(0);
      expect(m.wideScrolls).toBe(true);
      expect(m.wideTab).toBe(0);
      expect(m.smallTab).toBeNull();
      expect(m.codeText).toBe("F02");
      expect(m.codeLines).toBe(1);
    } finally {
      await page.close();
    }
  });
});
