import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * HeatmapChart in Chromium (gh#1330): 7 × 24 cells at 390px must not scroll the PAGE. The matrix
 * scrolls inside its own box, the row header stays pinned, a cell never drops below 24px, and a
 * keyboard move to a cell hidden under the pinned header scrolls it back into view. jsdom lays
 * nothing out, so none of this is visible to heatmap-chart.test.tsx.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { HeatmapChart } from "./src/components/charts/heatmap-chart";
import { Card, CardContent } from "./src/components/data-display";
import { PageContainer } from "./src/components/layout";

const rows = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((key, day) => ({
  key,
  label: new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + day))),
}));
const columns = Array.from({ length: 24 }, (_, hour) => ({ key: hour, label: String(hour) }));
const data = rows.flatMap((row, r) =>
  columns
    .filter((column) => column.key < 3 || column.key >= 10)
    .map((column) => ({ row: row.key, column: column.key, value: column.key === 15 ? 0 : (r + 1) * 1000 + column.key * 250 })),
);

createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <PageContainer title="Store performance">
      <Card>
        <CardContent>
          <HeatmapChart
            id="heat"
            label="Revenue by weekday and hour"
            rows={rows}
            columns={columns}
            data={data}
            numberFormat={{ style: "currency", currency: "JPY" }}
            topN={3}
          />
        </CardContent>
      </Card>
    </PageContainer>
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

async function open(width: number) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") errors.push(m.text());
  });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css} body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.waitForSelector("#heat .ui-chart-heatmap-cell");
  return { page, errors };
}

const measure = (page: Page) =>
  page.evaluate(() => {
    const figure = document.getElementById("heat")!;
    const scroller = figure.querySelector<HTMLElement>(".ui-chart-heatmap-scroll")!;
    const cells = [...figure.querySelectorAll<HTMLElement>("td.ui-chart-heatmap-cell")];
    const header = figure.querySelector<HTMLElement>("tbody th")!.getBoundingClientRect();
    const box = (el: HTMLElement) => el.getBoundingClientRect();
    const empty = figure.querySelector<HTMLElement>("td[data-empty]")!;
    const zero = cells.find((c) => c.textContent === "¥0")!;
    const active = document.activeElement as HTMLElement | null;
    return {
      pageOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      figureRight: box(figure).right,
      viewport: window.innerWidth,
      scrollerOverflow: scroller.scrollWidth - scroller.clientWidth,
      scrollLeft: scroller.scrollLeft,
      cellCount: cells.length,
      minCellWidth: Math.min(...cells.map((c) => box(c).width)),
      minCellHeight: Math.min(...cells.map((c) => box(c).height)),
      headerRight: header.right,
      headerLeft: header.left,
      scrollerLeft: box(scroller).left,
      emptyBorder: getComputedStyle(empty).borderTopStyle,
      emptyBackground: getComputedStyle(empty).backgroundColor,
      zeroBackground: getComputedStyle(zero).backgroundColor,
      zeroBorder: getComputedStyle(zero).borderTopStyle,
      emphasizedShadow: getComputedStyle(figure.querySelector<HTMLElement>("td[data-emphasized]")!)
        .boxShadow,
      active: active?.matches("td.ui-chart-heatmap-cell")
        ? { left: box(active).left, right: box(active).right, text: active.textContent }
        : null,
      tooltip:
        document.querySelector('[role="tooltip"][data-state="delayed-open"]')?.textContent ?? null,
    };
  });

describe("HeatmapChart (Chromium, gh#1330)", { timeout: 40_000 }, () => {
  it("at 390: 24 columns scroll inside the chart, never the page; cells stay ≥ 24px", async () => {
    const { page, errors } = await open(390);
    const m = await measure(page);
    expect(m.cellCount).toBe(7 * 24);
    expect(m.pageOverflowX).toBeLessThanOrEqual(0.5);
    expect(m.figureRight).toBeLessThanOrEqual(m.viewport);
    expect(m.scrollerOverflow).toBeGreaterThan(100); // the matrix really is wider than the card
    expect(m.minCellWidth).toBeGreaterThanOrEqual(24);
    expect(m.minCellHeight).toBeGreaterThanOrEqual(24);
    expect(errors).toEqual([]);
    await page.close();
  });

  it("at 390: the row header stays pinned while the matrix scrolls", async () => {
    const { page } = await open(390);
    const before = await measure(page);
    await page.evaluate(() => {
      document.querySelector<HTMLElement>("#heat .ui-chart-heatmap-scroll")!.scrollLeft = 10_000;
    });
    const after = await measure(page);
    expect(after.scrollLeft).toBeGreaterThan(100);
    // Pinned: at rest the header sits one border-spacing in from the scrollport; scrolled, it sticks
    // to the scrollport's start edge instead of leaving with the cells (~2000px further on).
    expect(after.headerLeft).toBeGreaterThanOrEqual(after.scrollerLeft - 0.5);
    expect(after.headerLeft).toBeLessThanOrEqual(before.headerLeft + 0.5);
    await page.close();
  });

  it("at 390: keyboard End then Home reveals each cell, never under the pinned header", async () => {
    const { page, errors } = await open(390);
    await page.keyboard.press("Tab");
    await page.keyboard.press("End");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="tooltip"][data-state="delayed-open"]')
        ?.textContent?.includes("Mon, 23"),
    );
    const end = await measure(page);
    expect(end.active?.text).toContain("¥6,750"); // Mon 23:00
    expect(end.active!.right).toBeLessThanOrEqual(end.viewport);
    expect(end.scrollLeft).toBeGreaterThan(100);
    expect(end.tooltip).toContain("Mon, 23: ¥6,750");

    // Walk back one column at a time. The browser only scrolls a focused cell into the SCROLLPORT,
    // and a cell under the pinned header is inside the scrollport — so without the component's own
    // reveal step, the walk hides the focused cell behind the weekday labels.
    for (let step = 0; step < 23; step += 1) {
      await page.keyboard.press("ArrowLeft");
      const walked = await measure(page);
      expect(walked.active!.left, `column ${22 - step}`).toBeGreaterThanOrEqual(
        walked.headerRight - 0.5,
      );
    }

    await page.keyboard.press("Home");
    const home = await measure(page);
    expect(home.active?.text).toContain("¥1,000"); // Mon 0:00
    expect(home.active!.left).toBeGreaterThanOrEqual(home.headerRight - 0.5);
    expect(home.pageOverflowX).toBeLessThanOrEqual(0.5);
    expect(errors).toEqual([]);
    await page.close();
  });

  it("empty is outlined and unfilled; zero is filled; top-N wears a ring", async () => {
    const { page } = await open(390);
    const m = await measure(page);
    expect(m.emptyBorder).toBe("dashed");
    expect(m.emptyBackground).toBe("rgba(0, 0, 0, 0)");
    expect(m.zeroBorder).not.toBe("dashed");
    expect(m.zeroBackground).not.toBe("rgba(0, 0, 0, 0)");
    expect(m.emphasizedShadow).toContain("inset");
    await page.close();
  });

  it("at 1280 the matrix fits its card with no inner scroll", async () => {
    const { page, errors } = await open(1280);
    const m = await measure(page);
    expect(m.pageOverflowX).toBeLessThanOrEqual(0.5);
    expect(m.scrollerOverflow).toBeLessThanOrEqual(0.5);
    expect(errors).toEqual([]);
    await page.close();
  });
});
