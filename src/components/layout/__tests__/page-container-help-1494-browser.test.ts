import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1494 in Chromium, against the real stylesheet: the Help control sits at the header's inline
 * end on every width — with one action, with actions that wrap, and with none — and never leaves
 * the header.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { PageContainer } from "./src/components/layout/page-container";
import { Button } from "./src/components/general/button";
const many = ["書き出し", "取り込み", "一括割当", "シフトをコピー", "新しいシフト"];
function Page({ actions }) {
  return (
    <PageContainer
      title="シフト表（店舗別・週次）"
      extra={actions === 0 ? undefined : actions === 1 ? <Button>新しいシフト</Button> : many.map((label) => <Button key={label}>{label}</Button>)}
      help={<Button variant="ghost">ヘルプ</Button>}
    />
  );
}
const n = Number(new URLSearchParams(location.search).get("actions") ?? "1");
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}><Page actions={n} /></AppProvider>,
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

describe(
  "PageContainer help sits at the header's inline end (gh#1494)",
  { timeout: 60_000 },
  () => {
    for (const width of [1440, 768, 390]) {
      for (const actions of [0, 1, 5]) {
        it(`${width}px, ${actions} action(s)`, async () => {
          const page = await browser.newPage({ viewport: { width, height: 900 } });
          await page.goto(`about:blank?actions=${actions}`);
          await page.setContent(
            `<!doctype html><html lang="ja"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
          );
          const help = page.getByRole("button", { name: "ヘルプ" });
          await help.waitFor();
          const m = await page.evaluate(() => {
            const helpEl = document
              .querySelector('[data-slot="page-header-help"]')!
              .getBoundingClientRect();
            const row = document.querySelector(".ui-page-header-row")!.getBoundingClientRect();
            const buttons = [...document.querySelectorAll(".ui-page-header-extra > button")].map(
              (b) => b.getBoundingClientRect(),
            );
            return {
              helpEnd: helpEl.right,
              rowEnd: row.right,
              helpTop: helpEl.top,
              lastActionBottom: buttons.length ? Math.max(...buttons.map((b) => b.bottom)) : -1,
              maxActionEnd: buttons.length ? Math.max(...buttons.map((b) => b.right)) : -1,
            };
          });
          // Flush with the header row's inline end, never past it.
          expect(Math.abs(m.helpEnd - m.rowEnd)).toBeLessThanOrEqual(1);
          // Nothing sits to its right.
          expect(m.maxActionEnd).toBeLessThanOrEqual(m.helpEnd);
          // It sits on (or after) the last row of the actions, never above them.
          if (m.lastActionBottom > 0) expect(m.helpTop).toBeLessThan(m.lastActionBottom + 1);
          await page.close();
        });
      }
    }
  },
);
