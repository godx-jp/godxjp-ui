import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";

/**
 * gh#1395 in Chromium, against the real stylesheet. A consumer's week view showed a 1-hour block
 * whose title lost the bottom half of every letter: the block stacked time over title in a clipped
 * flex column, and the title box was shrunk to 11.3px of a 16.7px line. 15/30-minute blocks cut
 * their time line and hid the title. Every text line must now be whole: as tall as its line box,
 * and inside the block's clip edge — at desktop and phone widths, and on the largest font axis.
 */
const ROOT = process.cwd();
const TITLE = "Kiểm thử cuộc họp trực tuyến với đối tác Nhật Bản — rà soát tiến độ quý";
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { TimelineGrid } from "./src/lab/timeline-grid";
const title = ${JSON.stringify(TITLE)};
const lengths = [["m15", "16:15"], ["m30", "16:30"], ["m60", "17:00"], ["m120", "18:00"]];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="vi" persist={false}>
    <div id="ready">
      <TimelineGrid
        label="Tuần"
        start="15:00"
        end="19:00"
        columns={lengths.map(([id]) => ({ id, label: id }))}
        events={lengths.map(([id, end]) => ({
          id, columnId: id, start: "16:00", end, title,
          description: id === "m120" ? "Phòng họp 3" : undefined,
        }))}
        onEventSelect={() => {}}
      />
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

type Line = {
  block: string;
  layout: string;
  part: string;
  height: number;
  lineHeight: number;
  overflow: number;
};

async function measure(width: number, fontSize: "default" | "lg"): Promise<Line[]> {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const attr = fontSize === "lg" ? ' data-font-size="lg"' : "";
  await page.setContent(
    `<!doctype html><html lang="vi"${attr}><head><style>${css}html,body,#root{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("[data-event-id]").first().waitFor({ state: "attached" });
  const lines = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-event-id]")].flatMap((li) => {
      const body = li.querySelector<HTMLElement>(".ui-timeline-grid-event-body")!;
      const clip =
        body.getBoundingClientRect().bottom -
        parseFloat(getComputedStyle(body).borderBlockEndWidth);
      return [...body.querySelectorAll<HTMLElement>(":scope > span")].map((span) => {
        const box = span.getBoundingClientRect();
        return {
          block: li.dataset.eventId!,
          layout: li.dataset.layout ?? "",
          part: span.className,
          height: box.height,
          lineHeight: parseFloat(getComputedStyle(span).lineHeight),
          overflow: box.bottom - clip,
        };
      });
    }),
  );
  await page.close();
  return lines;
}

describe("TimelineGrid block text is never cut mid-glyph (gh#1395)", { timeout: 60_000 }, () => {
  it.each([
    [1440, "default"],
    [390, "default"],
    [1440, "lg"],
  ] as const)(
    "at %ipx, font axis %s: every line is whole and inside the block",
    async (width, fontSize) => {
      const lines = await measure(width, fontSize);
      expect(new Set(lines.map((line) => line.block))).toEqual(
        new Set(["m15", "m30", "m60", "m120"]),
      );
      for (const line of lines) {
        const where = `${line.block}/${line.layout} ${line.part}`;
        // A whole number of line boxes: a shrunk box is a cut glyph.
        const count = line.height / line.lineHeight;
        expect(Math.abs(count - Math.round(count)), `${where} height ${line.height}`).toBeLessThan(
          0.05,
        );
        expect(Math.round(count), where).toBeGreaterThanOrEqual(1);
        expect(line.overflow, `${where} runs past the clip edge`).toBeLessThanOrEqual(0.5);
      }
      // The title is always drawn, and first.
      for (const block of ["m15", "m30", "m60", "m120"]) {
        expect(lines.find((line) => line.block === block)!.part).toBe(
          "ui-timeline-grid-event-title",
        );
      }
    },
  );
});
