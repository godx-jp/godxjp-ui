import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1308 item 3 — a trail that wraps at 320 left its `›` alone at the end of a line: each crumb
 * carried the separator AFTER its label, so the glyph stayed with the crumb before the break and
 * the next line started bare. A separator belongs to the crumb it introduces. Measured in Chromium
 * against the real stylesheet: every separator sits on the first line of the crumb that FOLLOWS
 * it, for both trails (`Breadcrumb` and `PageContainer breadcrumb`).
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Breadcrumb } from "./src/components/layout/breadcrumb";
import { PageContainer } from "./src/components/layout/page-container";
const items = [
  { label: "Engineering handbook", to: "/c" },
  { label: "Working at the team: a guide for new members", to: "/c/p" },
  { label: "Edit" },
];
const kind = new URLSearchParams(location.search).get("kind");
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    {kind === "page" ? (
      <PageContainer title="Edit page" breadcrumb={items}>body</PageContainer>
    ) : (
      <div style={{ padding: 16 }}><Breadcrumb items={items} /></div>
    )}
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

describe("a wrapped breadcrumb keeps each separator with the crumb that follows it (320)", () => {
  for (const kind of ["breadcrumb", "page"] as const) {
    it(`${kind}: no separator ends a line`, async () => {
      const page = await browser.newPage({ viewport: { width: 320, height: 800 } });
      await page.goto(`about:blank?kind=${kind}`);
      await page.setContent(
        `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
      );
      await page.locator(".ui-breadcrumb-list").waitFor();
      const m = await page.evaluate(() => {
        const list = document.querySelector(".ui-breadcrumb-list")!;
        const glyphs = [...list.querySelectorAll("svg")].map((s) => s.getBoundingClientRect());
        // The text of each crumb, line by line (a long label wraps inside its own item).
        const labels = [...list.querySelectorAll(":scope > li")].map((li) => {
          const range = document.createRange();
          const label = li.querySelector("a, [aria-current], span:not(.ui-breadcrumb-separator)")!;
          range.selectNodeContents(label);
          return [...range.getClientRects()].map((r) => ({ top: r.top, bottom: r.bottom }));
        });
        const lines = new Set(labels.flat().map((r) => Math.round(r.top))).size;
        return { glyphs: glyphs.map((g) => ({ top: g.top, bottom: g.bottom })), labels, lines };
      });
      await page.close();
      expect(m.glyphs).toHaveLength(2);
      // The trail really wraps at this width — otherwise the case proves nothing.
      expect(m.lines, JSON.stringify(m)).toBeGreaterThan(1);
      m.glyphs.forEach((g, i) => {
        const centre = (g.top + g.bottom) / 2;
        const firstLine = m.labels[i + 1]![0]!;
        expect(
          centre > firstLine.top && centre < firstLine.bottom,
          `separator ${i + 1} (${centre}) is not on the first line of crumb ${i + 2} ${JSON.stringify(firstLine)}`,
        ).toBe(true);
      });
    }, 60_000);
  }
});
