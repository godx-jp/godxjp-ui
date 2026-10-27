import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * The plain listbox popup must keep one width while it is open. With `width: auto` it shrank to
 * fit (containing block − left); react-aria's scroll lock (`scrollbar-gutter: stable` on <html>)
 * narrows that containing block by the scrollbar while placement still clamps to the viewport, so
 * near the inline-end edge the popup re-placed itself every frame and visibly narrowed, 3px a
 * frame, wrapping its labels (gh#1502: 404px → 312px over ~300ms). Classic scrollbars
 * are required to see it, hence `--hide-scrollbars` is dropped from the launch.
 */
const ROOT = process.cwd();
const LABELS = [
  "ポケモンカードゲーム",
  "ONE PIECEカードゲーム",
  "ドラゴンボールスーパーカードゲーム フュージョンワールド",
  "ドラゴンボールスーパーカードゲーム Masters",
  "デュエル・マスターズ",
  "遊戯王オフィシャルカードゲーム",
];
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Select } from "./src/components/data-entry";
const options = ${JSON.stringify(LABELS.map((label, i) => ({ value: `g${i}`, label })))};
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "120px 16px 0", minHeight: "250vh" }}>
      <div style={{ width: "16rem" }}>
        <Select aria-label="Game" width="full" defaultValue="g1" options={options} />
      </div>
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
  browser = await chromium.launch({ headless: true, ignoreDefaultArgs: ["--hide-scrollbars"] });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

describe(
  "Select popup width near the inline-end edge (Chromium, classic scrollbars)",
  { timeout: 40_000 },
  () => {
    it("opens at one width and keeps it, inside the page", async () => {
      const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css}</style></head><body style="margin:0"><div id="root"></div><script>${js}</script></body></html>`,
      );
      const trigger = page.locator('[data-slot="select-trigger"]');
      await trigger.click();
      await page.locator('[data-slot="select-content"]').waitFor();

      const m = await page.evaluate(
        () =>
          new Promise<{
            widths: number[];
            lefts: number[];
            right: number;
            bodyRight: number;
            gutter: string;
          }>((resolve) => {
            const widths: number[] = [];
            const lefts: number[] = [];
            let frames = 0;
            const tick = () => {
              const r = document
                .querySelector('[data-slot="select-content"]')!
                .getBoundingClientRect();
              widths.push(Math.round(r.width));
              lefts.push(Math.round(r.left));
              if (++frames < 45) return requestAnimationFrame(tick);
              resolve({
                widths,
                lefts,
                right: r.right,
                bodyRight: document.body.getBoundingClientRect().right,
                gutter: getComputedStyle(document.documentElement).scrollbarGutter,
              });
            };
            requestAnimationFrame(tick);
          }),
      );
      // The scroll lock is what makes the containing block and the placement boundary disagree;
      // without it this test would not exercise the defect.
      expect(m.gutter).toBe("stable");
      expect(new Set(m.widths).size).toBe(1);
      expect(new Set(m.lefts).size).toBe(1);
      // Long enough to hold the longest label on one row (32rem cap), and on screen.
      expect(m.widths[0]).toBeGreaterThan(380);
      expect(m.right).toBeLessThanOrEqual(1512);
      await page.close();
    });
  },
);
