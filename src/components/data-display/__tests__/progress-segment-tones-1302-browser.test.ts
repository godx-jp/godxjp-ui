import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1302 in Chromium, against the real stylesheet — breakdown slices take `info` and `neutral`,
 * painted exactly like the matching Legend swatches, and a four-state partition stays legible: every
 * fill clears 3:1 against the track and the page (WCAG 2.2 SC 1.4.11) in light and dark, and no two
 * of the four fills are the same colour.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Progress } from "./src/components/data-display/progress";
import { Legend } from "./src/components/data-display/legend";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div style={{ width: 480 }}>
      <Progress segments={[
        { value: 4, tone: "success", label: "完了" },
        { value: 3, tone: "info", label: "処理済み（完了待ち）" },
        { value: 2, tone: "warning", label: "処理中" },
        { value: 1, tone: "neutral", label: "未対応" },
      ]} />
      <Legend items={[
        { tone: "info", label: "処理済み（完了待ち）" },
        { tone: "neutral", label: "未対応" },
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

async function measure(theme: "light" | "dark") {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.setContent(
    `<!doctype html><html lang="ja" class="${theme === "dark" ? "dark" : ""}"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator(".ui-progress-segment").first().waitFor();
  const result = await page.evaluate(() => {
    const rgb = (el: Element) => {
      // Canvas resolves any CSS colour space (oklch, color()) to sRGB bytes.
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.fillStyle = getComputedStyle(el).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    };
    const lum = ([r, g, b]: number[]) => {
      const c = [r, g, b].map((v) => {
        const s = v! / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
    };
    const ratio = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return (x! + 0.05) / (y! + 0.05);
    };
    const track = rgb(document.querySelector(".ui-progress-track")!);
    const pageBg = rgb(document.body);
    const fills: Record<string, number[]> = Object.fromEntries(
      [...document.querySelectorAll(".ui-progress-segment")].map((el) => [
        el.getAttribute("data-tone"),
        rgb(el),
      ]),
    );
    const swatches: Record<string, number[]> = Object.fromEntries(
      [...document.querySelectorAll(".ui-legend-swatch")].map((el) => [
        el.getAttribute("data-tone"),
        rgb(el),
      ]),
    );
    return {
      vsTrack: Object.fromEntries(
        Object.entries(fills).map(([k, v]) => [k, +ratio(v, track).toFixed(2)]),
      ),
      vsPage: Object.fromEntries(
        Object.entries(fills).map(([k, v]) => [k, +ratio(v, pageBg).toFixed(2)]),
      ),
      distinct: new Set(Object.values(fills).map((v) => v.join())).size,
      infoMatchesLegend: fills.info?.join() === swatches.info?.join(),
      neutralMatchesLegend: fills.neutral?.join() === swatches.neutral?.join(),
    };
  });
  await page.close();
  return result;
}

describe("Progress segment tones info + neutral (gh#1302)", { timeout: 60_000 }, () => {
  for (const theme of ["light", "dark"] as const) {
    it(`${theme}: four distinct fills, each ≥ 3:1 against the track and the page, matching Legend`, async () => {
      const m = await measure(theme);
      expect(m.distinct).toBe(4);
      expect(m).toMatchObject({ infoMatchesLegend: true, neutralMatchesLegend: true });
      for (const tone of ["info", "neutral"]) {
        expect(m.vsTrack[tone], `${theme} ${tone} vs track`).toBeGreaterThanOrEqual(3);
        expect(m.vsPage[tone], `${theme} ${tone} vs page`).toBeGreaterThanOrEqual(3);
      }
    });
  }
});
