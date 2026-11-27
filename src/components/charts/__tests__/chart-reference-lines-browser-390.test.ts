import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * caimono 33.30.7-caimono.1 — LineChart `referenceLines` in Chromium at 390 and 1440 (jsdom lays out
 * nothing, and recharts draws nothing in a 0-wide container). A dashed line at the value, its label
 * INSIDE the plot at the right edge: above the line, below it when the line is near the top — never
 * outside the plot box, never sideways page scroll; the label takes its tone colour.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { LineChart } from "./src/components/charts/line-chart";

const data = Array.from({ length: 90 }, (_, i) => ({ day: "11/" + String(i % 30 + 1).padStart(2, "0") + "-" + i, low: 30000 - (i % 17) * 300 }));
const low = Math.min(...data.map((d) => d.low));
const high = Math.max(...data.map((d) => d.low));

createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div style={{ padding: 16 }}>
      <LineChart id="low" label="価格推移" data={data} categoryKey="day" series={[{ dataKey: "low", label: "最安値" }]}
        numberFormat={{ style: "currency", currency: "JPY" }} height={260} showLegend={false}
        referenceLines={[{ y: low, label: "最安 ¥25,200（11/17）", tone: "primary" }]} />
      <LineChart id="high" label="価格推移" data={data} categoryKey="day" series={[{ dataKey: "low", label: "最安値" }]}
        numberFormat={{ style: "currency", currency: "JPY" }} height={260} showLegend={false} valueDomain={[25000, 30000]}
        referenceLines={[{ y: high, label: "最高 ¥30,000（11/01）" }]} />
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
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

describe("LineChart referenceLines (Chromium)", { timeout: 40_000 }, () => {
  it.each([390, 1440])(
    "at %ipx: dashed line at the value, label inside the plot at the right edge, in its tone",
    async (width) => {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css} body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
      );
      await page.waitForSelector("#high .ui-chart-reference-label");
      await page.waitForTimeout(1600); // line animation
      const m = await page.evaluate(() => {
        const one = (id: string) => {
          const fig = document.getElementById(id)!;
          const line = fig.querySelector<SVGLineElement>(".recharts-reference-line-line")!;
          const label = fig.querySelector<SVGTextElement>(".ui-chart-reference-label")!; // recharts 3 paints labels in their own z-index layer;
          const grid = fig
            .querySelector<SVGGElement>(".recharts-cartesian-grid")!
            .getBoundingClientRect();
          const l = label.getBoundingClientRect();
          const lineY = line.getBoundingClientRect().top;
          return {
            dash: line.getAttribute("stroke-dasharray"),
            text: label.textContent,
            inside:
              l.left >= grid.left - 0.5 &&
              l.right <= grid.right + 0.5 &&
              l.top >= grid.top - 0.5 &&
              l.bottom <= grid.bottom + 0.5,
            rightGap: grid.right - l.right,
            above: l.bottom <= lineY + 0.5,
            below: l.top >= lineY - 0.5,
            fill: getComputedStyle(label).fill,
          };
        };
        const probe = document.createElement("span");
        probe.style.color = "hsl(var(--primary))";
        document.body.append(probe);
        return {
          low: one("low"),
          high: one("high"),
          primary: getComputedStyle(probe).color,
          pageX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      expect(m.pageX).toBe(0);
      expect(m.low.dash).toBe("6 4");
      expect(m.low.text).toBe("最安 ¥25,200（11/17）");
      expect(m.low.inside).toBe(true);
      expect(m.low.rightGap).toBeLessThan(24);
      expect(m.low.above).toBe(true); // a low line sits near the bottom: label above it
      expect(m.low.fill).toBe(m.primary);
      expect(m.high.inside).toBe(true);
      expect(m.high.below).toBe(true); // the top line: label below it, still inside the plot
      await page.close();
    },
  );
});
