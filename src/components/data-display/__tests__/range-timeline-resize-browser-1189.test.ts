import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1189 in Chromium: dragging the label-column divider widens the label cell in the header AND
 * in every row (they share one token), clamped to max; the divider's hit area meets 24px.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { RangeTimeline } from "./src/components/data-display/range-timeline";
const columns = Array.from({ length: 14 }, (_, d) => ({ label: String(d + 1), units: 1 }));
const rows = [
  { id: "a", label: "EXSELI-81 問い合わせフォームの改修", start: 1, end: 4, startLabel: "s", endLabel: "e", color: "#fde68a", overdue: true },
  { id: "b", label: "EXSELI-82", start: null, end: null, startLabel: "s", endLabel: "e" },
  { id: "c", label: "EXSELI-83", start: 2, end: 8, plan: { start: 2, end: 5 }, startLabel: "s", endLabel: "e" },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <RangeTimeline label="Schedule" columns={columns} rows={rows} resizableLabel={{ min: 160, max: 400 }} defaultLabelWidth={240} />
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

describe("RangeTimeline label resize (Chromium, gh#1189)", { timeout: 40_000 }, () => {
  it("drags the divider: header and rows widen together, clamped at max", async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 600 } });
    await page.setContent(
      `<!doctype html><html lang="ja"><head><style>${css}</style></head><body style="margin:0"><div id="root"></div><script>${js}</script></body></html>`,
    );
    const separator = page.getByRole("separator");
    await separator.waitFor();
    const widths = () =>
      page.evaluate(() =>
        [...document.querySelectorAll(".ui-range-timeline-label")].map((el) =>
          Math.round(el.getBoundingClientRect().width),
        ),
      );
    expect(new Set(await widths())).toEqual(new Set([240]));
    const box = (await separator.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(24);
    const x = box.x + box.width / 2,
      y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 60, y, { steps: 4 });
    await page.mouse.up();
    expect(new Set(await widths())).toEqual(new Set([300]));
    expect(await separator.getAttribute("aria-valuenow")).toBe("300");
    // Past max: clamped.
    const box2 = (await separator.boundingBox())!;
    await page.mouse.move(box2.x + box2.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(box2.x + 500, y, { steps: 4 });
    await page.mouse.up();
    expect(new Set(await widths())).toEqual(new Set([400]));
    await page.close();
  });

  it("paints the data colour, black ink on a light fill, and an overdue edge", async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 600 } });
    await page.setContent(
      `<!doctype html><html lang="ja"><head><style>${css}</style></head><body style="margin:0"><div id="root"></div><script>${js}</script></body></html>`,
    );
    await page.locator(".ui-range-timeline-bar").first().waitFor();
    const m = await page.evaluate(() => {
      const bar = document.querySelector<HTMLElement>(".ui-range-timeline-bar")!;
      const style = getComputedStyle(bar);
      return { background: style.backgroundColor, color: style.color, shadow: style.boxShadow };
    });
    expect(m.background).toBe("rgb(253, 230, 138)");
    expect(m.color).toBe("rgb(0, 0, 0)");
    expect(m.shadow).toContain("inset");
    expect(m.shadow).not.toBe("none");
    await page.close();
  });

  it("paints the plan as a dashed ghost and the overrun in the destructive tone", async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 600 } });
    await page.setContent(
      `<!doctype html><html lang="ja"><head><style>${css}</style></head><body style="margin:0"><div id="root"></div><script>${js}</script></body></html>`,
    );
    await page.locator(".ui-range-timeline-plan").waitFor();
    const m = await page.evaluate(() => {
      const plan = getComputedStyle(document.querySelector(".ui-range-timeline-plan")!);
      const overrun = document.querySelector<HTMLElement>(".ui-range-timeline-overrun")!;
      return {
        planBorder: plan.borderTopStyle,
        planBackground: plan.backgroundColor,
        overrunBackground: getComputedStyle(overrun).backgroundColor,
        overrunWidth: overrun.getBoundingClientRect().width,
        label: overrun.textContent,
      };
    });
    expect(m.planBorder).toBe("dashed");
    expect(m.planBackground).toBe("rgba(0, 0, 0, 0)");
    expect(m.overrunBackground).not.toBe("rgba(0, 0, 0, 0)");
    expect(m.overrunWidth).toBeGreaterThan(0);
    expect(m.label).toContain("+3日");
    await page.close();
  });

  it("caps the label column on a phone so the bars and the resize divider stay on screen", async () => {
    // gh#1184 geometry sweep: a 240px column on a narrower timeline put the divider, which lives in
    // the sticky label cell, beyond any scroll. The column now takes at most 60% of the timeline.
    const page = await browser.newPage({ viewport: { width: 320, height: 600 } });
    await page.setContent(
      `<!doctype html><html lang="ja"><head><style>${css}</style></head><body style="margin:0;padding:8px"><div id="root"></div><script>${js}</script></body></html>`,
    );
    const separator = page.getByRole("separator");
    await separator.waitFor();
    const m = await page.evaluate(() => {
      const section = document.querySelector(".ui-range-timeline")!.getBoundingClientRect();
      const label = document.querySelector(".ui-range-timeline-label")!.getBoundingClientRect();
      const handle = document.querySelector('[role="separator"]')!.getBoundingClientRect();
      return { section, label, handle };
    });
    expect(m.label.width).toBeLessThanOrEqual(m.section.width * 0.6 + 1);
    expect(m.handle.right).toBeLessThanOrEqual(m.section.right + 1);
    await page.close();
  });
});
