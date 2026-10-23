import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { BarChart, LineChart, AreaChart, PieChart, HeatmapChart } from "./src/components/charts";
const data = [{ name: "East", a: 1000, b: 4 }, { name: "Central", a: 0, b: 7 }, { name: "West", a: 2000, b: null }];
function App() {
 const [picked, setPicked] = React.useState(null);
 const select = (datum, context) => { window.selection = { datum, ...context }; setPicked(datum); };
 return <AppProvider defaultLocale="en" persist={false}>
 <BarChart id="bar" label="Bars" data={data} categoryKey="name" series={[{ dataKey:"a", label:"Revenue" }, { dataKey:"b", label:"Orders" }]} onDatumSelect={select} />
 <BarChart id="horizontal" horizontal stacked label="Stacked" data={data} categoryKey="name" series={[{ dataKey:"a" },{ dataKey:"b" }]} onDatumSelect={select} />
 <LineChart id="line" label="Line" data={data} categoryKey="name" series={[{ dataKey:"a" },{ dataKey:"b" }]} onDatumSelect={select} />
 <AreaChart id="area" stacked label="Area" data={data} categoryKey="name" series={[{ dataKey:"a" },{ dataKey:"b" }]} onDatumSelect={select} />
 <PieChart id="pie" donut label="Pie" data={data} nameKey="name" dataKey="a" onDatumSelect={select} />
 <HeatmapChart id="heat" label="Heat" rows={[{key:"r",label:"Monday"}]} columns={[{key:"a",label:"Morning"},{key:"b",label:"Evening"}]} data={[{row:"r",column:"a",value:1000}]} onDatumSelect={select} />
 <BarChart id="negative" label="Loss" data={[{ name:"Loss", a:-50 }]} categoryKey="name" series={[{ dataKey:"a" }]} onDatumSelect={select} />
 <LineChart id="static" label="Static" data={data} categoryKey="name" series={[{dataKey:"a"}]} />
 </AppProvider>;
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

async function open() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (["warning", "error"].includes(m.type())) errors.push(m.text());
  });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css} body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector("#bar [data-chart-datum]", { timeout: 5000 }).catch((e) => {
    console.log(errors);
    throw e;
  });
  await page.waitForTimeout(500);
  return { page, errors };
}
describe("chart datum selection (Chromium #1398)", { timeout: 40000 }, () => {
  it("exposes real marks, localized names and one roving tab stop on each interactive chart", async () => {
    const { page, errors } = await open();
    for (const id of ["bar", "horizontal", "line", "area", "pie"]) {
      const chart = page.locator(`#${id}`);
      expect(await chart.getByRole("button").count(), id).toBe(id === "pie" ? 2 : 5);
      expect(await chart.locator('[data-chart-datum][tabindex="0"]').count()).toBe(1);
      expect(await chart.locator(".ui-chart-canvas").getAttribute("role")).toBe("group");
      const first = chart.getByRole("button").first();
      expect(await first.getAttribute("aria-label")).toContain("1,000");
      await first.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(150);
      expect(await page.evaluate(() => (window as any).selection.index)).toBe(0);
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Space");
      expect(await page.evaluate(() => (window as any).selection.index)).toBe(id === "pie" ? 2 : 1);
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(150);
      expect(await page.evaluate(() => (window as any).selection.index)).toBe(2);
      await page.keyboard.press("Home");
      // Stacked series can share a point's coordinates; choose the unoccluded West point for pointer input.
      if (id === "pie") {
        // A donut's bounding-box centre is its hole. Hit the painted outer band.
        const box = await first.boundingBox();
        await first.click({ position: { x: box!.width * 0.65, y: box!.height * 0.2 } });
      } else {
        await (
          id === "area" ? chart.getByRole("button", { name: "West, a: 2,000" }) : first
        ).click();
      }
      expect(await page.evaluate(() => (window as any).selection.index)).toBe(
        id === "area" ? 2 : 0,
      );
    }
    expect(await page.locator("#static [data-chart-datum]").count()).toBe(0);
    expect(await page.locator("#static .ui-chart-canvas").getAttribute("role")).toBe("img");
    await page.locator("#negative [data-chart-datum]").click();
    expect(await page.evaluate(() => (window as any).selection.datum.a)).toBe(-50);
    expect(errors).toEqual([]);
    await page.close();
  });
  it("moves across series, mirrors arrows under RTL, keeps focus visible and exits with Tab", async () => {
    const { page, errors } = await open();
    const marks = page.locator("#bar [data-chart-datum]");
    await marks.first().focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => (window as any).selection.seriesKey)).toBe("b");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowRight");
    await page.evaluate(() => (document.documentElement.dir = "rtl"));
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => (window as any).selection.index)).toBe(0);
    const focus = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement!);
      return { width: s.outlineWidth, offset: s.outlineOffset, style: s.outlineStyle };
    });
    expect(focus).toEqual({ width: "2px", offset: "2px", style: "solid" });
    await page.keyboard.press("Tab");
    expect(await page.locator("#bar :focus").count()).toBe(0);
    expect(errors).toEqual([]);
    await page.close();
  });
});
