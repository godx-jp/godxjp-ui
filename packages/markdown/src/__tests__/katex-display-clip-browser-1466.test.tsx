import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * GDX-1466 in Chromium: a display formula's box scrolls sideways (`overflow-x: auto`), which also
 * clips it vertically, and `.katex-display` had no vertical room of its own, so the limits of
 * `\int_0^1` were cut by about 3px. Every glyph of the formula must lie inside the box that clips it.
 */
const ROOT = process.cwd();
const KATEX_DIST = join(ROOT, "node_modules/katex/dist");
const ORIGIN = "http://kit.test";
const FORMULAS = ["\\int_0^1 x\\,dx", "\\sum_{i=1}^{n} i^2", "\\lim_{x \\to 0} \\frac{\\sin x}{x}"];
const BODY = FORMULAS.map((f) => `$$\n${f}\n$$`).join("\n\n");

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Markdown } from "./packages/markdown/src/markdown";
createRoot(document.getElementById("root")).render(<Markdown>{${JSON.stringify(BODY)}}</Markdown>);
`;

/** The kit's katex.css as a host serves it: its `@import` resolved to KaTeX's own stylesheet. */
const stylesheet = () =>
  readFileSync(join(KATEX_DIST, "katex.min.css"), "utf8") +
  readFileSync(join(ROOT, "packages/markdown/katex.css"), "utf8").replace(/@import[^;]+;/, "");

let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

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
  browser = await chromium.launch({ headless: true });
}, 120_000);

afterAll(async () => {
  await browser?.close();
});

describe("display math is not clipped (Chromium, GDX-1466)", () => {
  it("every glyph of a display formula lies inside its .katex-display box", async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    try {
      await page.route(`${ORIGIN}/**`, (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path === "/") {
          return route.fulfill({
            contentType: "text/html",
            body: `<!doctype html><html><head><link rel="stylesheet" href="/katex.css"><style>body{margin:0;font-size:16px;line-height:1.5}</style></head><body><div id="root"></div><script src="/entry.js"></script></body></html>`,
          });
        }
        if (path === "/katex.css")
          return route.fulfill({ contentType: "text/css", body: stylesheet() });
        if (path === "/entry.js")
          return route.fulfill({ contentType: "text/javascript", body: js });
        // KaTeX's fonts, from the url(fonts/…) its stylesheet names.
        return route.fulfill({ body: readFileSync(join(KATEX_DIST, path)) });
      });
      await page.goto(`${ORIGIN}/`);
      await page.waitForSelector(".katex-display");
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
      const result = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>(".katex-display")].map((box) => {
          const clip = box.getBoundingClientRect();
          const walker = document.createTreeWalker(
            box.querySelector(".katex-html")!,
            NodeFilter.SHOW_TEXT,
          );
          let top = Infinity;
          let bottom = -Infinity;
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (!node.textContent?.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            const r = range.getBoundingClientRect();
            top = Math.min(top, r.top);
            bottom = Math.max(bottom, r.bottom);
          }
          return {
            overflowY: getComputedStyle(box).overflowY,
            above: Math.round((clip.top - top) * 10) / 10,
            below: Math.round((bottom - clip.bottom) * 10) / 10,
          };
        }),
      );
      expect(result).toHaveLength(FORMULAS.length);
      for (const [index, m] of result.entries()) {
        // Glyphs past the box's top or bottom edge are cut off: overflow-x: auto clips both axes.
        expect(m.above, `${FORMULAS[index]} above the box`).toBeLessThanOrEqual(0);
        expect(m.below, `${FORMULAS[index]} below the box`).toBeLessThanOrEqual(0);
      }
    } finally {
      await page.close();
    }
  });
});
