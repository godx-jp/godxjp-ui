import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";
import { Prose } from "../../../../src/components/data-display/prose";
import { Markdown } from "../markdown";

/**
 * gh#1150 in Chromium, in a 280px column: a short single-token cell (優先度) stays on one line
 * while a sentence beside it wraps, and an image in a cell keeps min(natural width, 20rem) so the
 * table scrolls in its box instead of squashing the picture.
 */
// Served by a route below: Markdown's URL policy rightly drops `data:` image sources.
const svg = (w: number, h: number) => `https://images.test/${w}x${h}.svg`;
const CODES = `| code | note |\n|---|---|\n| 優先度 | ${"とても長い説明文です。".repeat(6)} |`;
const WIDE_IMAGE = `| image | x |\n|---|---|\n| ![wide](${svg(480, 120)}) | text |`;
const SMALL_IMAGE = `| image | x |\n|---|---|\n| ![small](${svg(100, 50)}) | text |`;

const markup = renderToStaticMarkup(
  <div style={{ width: 280 }}>
    {[CODES, WIDE_IMAGE, SMALL_IMAGE].map((body, i) => (
      <div key={i} data-p={i}>
        <Prose>
          <Markdown>{body}</Markdown>
        </Prose>
      </div>
    ))}
  </div>,
);

describe("Prose table cells (Chromium, gh#1150)", () => {
  it("keeps a short token on one line and gives a cell image min(natural, 20rem)", async () => {
    const css = await compileRealCss(markup);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
      await page.route("https://images.test/**", (route) => {
        const [w, h] = new URL(route.request().url()).pathname.slice(1, -4).split("x");
        return route.fulfill({
          contentType: "image/svg+xml",
          body: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#888"/></svg>`,
        });
      });
      await page.setContent(
        `<!doctype html><html><head><style>${css} body{margin:0;padding:16px}</style></head><body>${markup}</body></html>`,
      );
      await page.waitForFunction(() =>
        [...document.images].every((img) => img.complete && img.naturalWidth > 0),
      );
      const m = await page.evaluate(() => {
        const lines = (el: Element) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
        };
        const [shortCell, sentence] = document.querySelectorAll('[data-p="0"] td');
        const img = (p: string) => document.querySelector<HTMLImageElement>(`[data-p="${p}"] img`)!;
        const box = (p: string) =>
          document.querySelector<HTMLElement>(`[data-p="${p}"] .ui-prose-table-scroll`)!;
        return {
          shortLines: lines(shortCell!),
          sentenceLines: lines(sentence!),
          wideImage: Math.round(img("1").getBoundingClientRect().width),
          wideScrolls: box("1").scrollWidth > box("1").clientWidth,
          smallImage: Math.round(img("2").getBoundingClientRect().width),
        };
      });
      expect(m.shortLines).toBe(1);
      expect(m.sentenceLines).toBeGreaterThan(1);
      expect(m.wideImage).toBe(320);
      expect(m.wideScrolls).toBe(true);
      expect(m.smallImage).toBe(100);
    } finally {
      await browser.close();
    }
  });
});
