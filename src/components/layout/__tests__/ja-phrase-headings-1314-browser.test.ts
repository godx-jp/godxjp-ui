import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1314 in Chromium, against the real stylesheet: Japanese page titles, document titles and
 * EmptyState strings broke mid-word (「リ|リース」, 「オンボー|ディング」, 「ませ|ん。」) because only
 * Markdown prose had `auto-phrase` (32.11.0). Measured by the line each character lands on.
 */
const WORDS = ["リリース", "オンボーディング", "ありません。"];
let css = "";
let browser: Browser;

beforeAll(async () => {
  css = await compileRealCss(
    `<h1 class="ui-page-title"></h1><div class="ui-empty-state-title"></div><p class="ui-empty-state-description"></p>`,
  );
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

/** For each width, does any of WORDS start on one line and end on the next? */
async function midWordBreaks(lang: string, html: string, widths: number[]) {
  const page = await browser.newPage();
  const out: number[] = [];
  for (const w of widths) {
    await page.setContent(
      `<!doctype html><html lang="${lang}"><head><style>${css}</style></head><body><div id="box" style="inline-size:${w}px">${html}</div></body></html>`,
    );
    out.push(
      await page.evaluate((words) => {
        const box = document.getElementById("box")!;
        const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
        let breaks = 0;
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const text = n.textContent ?? "";
          for (const word of words) {
            let i = text.indexOf(word);
            while (i !== -1) {
              const r = document.createRange();
              const top = (k: number) => {
                r.setStart(n!, k);
                r.setEnd(n!, k + 1);
                return Math.round(r.getBoundingClientRect().top);
              };
              const tops = new Set(Array.from({ length: word.length }, (_, k) => top(i + k)));
              if (tops.size > 1) breaks++;
              i = text.indexOf(word, i + 1);
            }
          }
        }
        return breaks;
      }, WORDS),
    );
  }
  await page.close();
  return out.reduce((a, b) => a + b, 0);
}

const TITLE = `<h1 class="ui-page-title">新しいメンバーのためのリリースプロセスとオンボーディング</h1>`;
const EMPTY = `<div class="ui-empty-state-title">このページを参照しているページはまだありません。</div><p class="ui-empty-state-description">まだリンクはありません。オンボーディングを参照してください。</p>`;
// Widths where each phrase fits on a line (a phrase longer than the line — 「オンボーディング」 is
// ~160px at the title size — must still break inside itself; that limit is CSS's, recorded in gh#1314).
const WIDTHS = [200, 240, 280, 320, 360];

describe(
  "Japanese headings and EmptyState strings break between phrases (gh#1314)",
  { timeout: 60_000 },
  () => {
    it("page title: no mid-word break at any width", async () => {
      expect(await midWordBreaks("ja", TITLE, WIDTHS)).toBe(0);
    });

    it("EmptyState title and description: no mid-word break at any width", async () => {
      expect(await midWordBreaks("ja", EMPTY, WIDTHS)).toBe(0);
    });

    it("control: the same markup without lang=ja still breaks mid-word (the lens sees breaks)", async () => {
      expect(await midWordBreaks("en", TITLE + EMPTY, WIDTHS)).toBeGreaterThan(0);
    });
  },
);
