import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * RangeTimeline schedules in Chromium: a dependency connector's ends land on the bars it joins
 * (also across a row whose label wraps), a milestone diamond sits centred on its unit, a cancelled
 * bar is hatched, an open-ended bar fades out, and a violated link's marker sits on the arrow head.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { RangeTimeline } from "./src/components/data-display/range-timeline";
const columns = Array.from({ length: 12 }, (_, d) => ({ label: String(d + 1), units: 1 }));
const row = (id, label, extra) => ({ id, label, startLabel: id + " start", endLabel: id + " end", ...extra });
const rows = [
  row("a", "設計（とても長いタイトルで、ラベル列の中で折り返して行の高さが変わる工程名）", { start: 0, end: 2 }),
  row("b", "開発", { start: 3, end: 6 }),
  row("m", "リリース", { shape: "milestone", start: null, end: 9, color: "#2563eb" }),
  row("c", "中止した作業", { start: 1, end: 4, cancelled: true }),
  row("o", "進行中", { start: 2, end: 7, openEnd: true }),
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="ja" persist={false}>
    <div style={{ width: 1100 }}>
      <RangeTimeline label="工程" columns={columns} rows={rows} defaultLabelWidth={200}
        links={[{ id: "ab", from: "a", to: "b" }, { id: "bm", from: "b", to: "m", type: "FF", violated: true, label: "後続" }]} />
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

async function open(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1200, height: 700 } });
  await page.setContent(
    `<!doctype html><html lang="ja"><head><style>${css}</style></head><body style="margin:0"><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[data-link-id="ab"] line').first().waitFor({ state: "attached" });
  return page;
}

describe("RangeTimeline schedules (Chromium)", { timeout: 40_000 }, () => {
  it("lands each connector end on the bars it joins, across a wrapped label", async () => {
    const page = await open();
    const m = await page.evaluate(() => {
      const rect = (el: Element) => el.getBoundingClientRect();
      const svg = rect(document.querySelector(".ui-range-timeline-links-svg")!);
      const lines = [...document.querySelectorAll<SVGLineElement>('[data-link-id="ab"] line')];
      const first = lines[0]!,
        last = lines[2]!;
      const bars = [...document.querySelectorAll(".ui-range-timeline-bar")].map(rect);
      const rows = [...document.querySelectorAll(".ui-range-timeline-row")].map(rect);
      return {
        start: { x: svg.left + first.x1.baseVal.value, y: svg.top + first.y1.baseVal.value },
        end: { x: svg.left + last.x2.baseVal.value, y: svg.top + last.y2.baseVal.value },
        barA: bars[0]!,
        barB: bars[1]!,
        rowA: rows[0]!,
        rowB: rows[1]!,
      };
    });
    // The wrapped label really did make row a taller than row b.
    expect(m.rowA.height).toBeGreaterThan(m.rowB.height);
    // FS: a's finish → b's start, at each bar's vertical centre.
    expect(Math.abs(m.start.x - m.barA.right)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.start.y - (m.barA.top + m.barA.height / 2))).toBeLessThanOrEqual(1);
    expect(Math.abs(m.end.x - m.barB.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.end.y - (m.barB.top + m.barB.height / 2))).toBeLessThanOrEqual(1);
    await page.close();
  });

  it("centres the milestone diamond on its unit and the violated marker on the arrow head", async () => {
    const page = await open();
    const m = await page.evaluate(() => {
      const rect = (el: Element) => el.getBoundingClientRect();
      const columns = [
        ...document.querySelectorAll(".ui-range-timeline-header .ui-range-timeline-column"),
      ].map(rect);
      const diamond = rect(document.querySelector(".ui-range-timeline-milestone")!);
      const marker = rect(document.querySelector(".ui-range-timeline-link-violation")!);
      const fill = getComputedStyle(
        document.querySelector(".ui-range-timeline-milestone")!,
        "::before",
      );
      return {
        unit: columns[9]!,
        diamond,
        marker,
        fill: fill.backgroundColor,
        rotate: fill.rotate,
        stroke: getComputedStyle(document.querySelector('[data-link-id="bm"] line')!).stroke,
      };
    });
    const unitCentre = m.unit.left + m.unit.width / 2;
    expect(Math.abs(m.diamond.left + m.diamond.width / 2 - unitCentre)).toBeLessThanOrEqual(1);
    expect(m.fill).toBe("rgb(37, 99, 235)");
    expect(m.rotate).toBe("45deg");
    // FF into a milestone ends at its diamond, where the violated marker sits.
    expect(Math.abs(m.marker.left + m.marker.width / 2 - unitCentre)).toBeLessThanOrEqual(1);
    expect(
      Math.abs(m.marker.top + m.marker.height / 2 - (m.diamond.top + m.diamond.height / 2)),
    ).toBeLessThanOrEqual(1);
    expect(m.marker.width).toBeGreaterThanOrEqual(24);
    expect(m.stroke).not.toBe("none");
    await page.close();
  });

  it("hatches a cancelled bar and fades an open-ended one", async () => {
    const page = await open();
    const m = await page.evaluate(() => {
      const bars = [...document.querySelectorAll<HTMLElement>(".ui-range-timeline-bar")];
      const cancelled = bars.find((bar) => bar.dataset.cancelled === "true")!;
      const open = bars.find((bar) => bar.dataset.openEnd === "true")!;
      return {
        hatch: getComputedStyle(cancelled).backgroundImage,
        mask: getComputedStyle(open).maskImage || getComputedStyle(open).webkitMaskImage,
        plainMask: getComputedStyle(bars[0]!).maskImage,
      };
    });
    expect(m.hatch).toContain("repeating-linear-gradient");
    expect(m.mask).toContain("linear-gradient");
    expect(m.plainMask).toBe("none");
    await page.close();
  });
});
