import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * gh#1495 in Chromium, against the real stylesheet: a plain-listbox row that carries a sublabel
 * keeps the one-line row height of its plain sibling, and the sublabel is painted inside the row.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Select } from "./src/components/data-entry";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div style={{ width: 320, padding: 16 }}>
      <Select aria-label="支給項目" options={[
        { value: "none", label: "なし" },
        { value: "A012", label: "通勤手当", sublabel: "A012" },
        { value: "A099", label: "単身赴任手当（遠隔地・特別加算を含む）", sublabel: "A099" },
      ]} />
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

describe("Select plain listbox sublabel row (gh#1495)", { timeout: 60_000 }, () => {
  it("a sublabel row keeps its plain sibling's height and paints the sublabel inside it", async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.setContent(
      `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
    );
    await page.getByRole("combobox", { name: "支給項目" }).click();
    await page.getByRole("option", { name: "なし" }).waitFor();
    const rows = await page.getByRole("option").evaluateAll((items) =>
      items.map((row) => {
        const r = row.getBoundingClientRect();
        const sub = row.querySelector(".ui-search-select-option-sublabel")?.getBoundingClientRect();
        return {
          top: r.top,
          bottom: r.bottom,
          left: r.left,
          right: r.right,
          height: r.height,
          sub: sub
            ? { top: sub.top, bottom: sub.bottom, left: sub.left, right: sub.right, w: sub.width }
            : null,
        };
      }),
    );
    expect(rows).toHaveLength(3);
    for (const row of rows.slice(1)) {
      expect(Math.abs(row.height - rows[0]!.height)).toBeLessThanOrEqual(0.5);
      expect(row.sub).not.toBeNull();
      expect(row.sub!.w).toBeGreaterThan(0);
      expect(row.sub!.top).toBeGreaterThanOrEqual(row.top);
      expect(row.sub!.bottom).toBeLessThanOrEqual(row.bottom);
      expect(row.sub!.right).toBeLessThanOrEqual(row.right);
    }
    await page.close();
  });
});
