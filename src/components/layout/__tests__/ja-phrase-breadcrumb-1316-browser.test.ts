import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1316 in Chromium, against the real stylesheet: the Japanese current-page crumb broke mid-word
 * (「…オンボーディ|ング…」 at 390, 「…オ|ンボーディング…」 at 320, measured in godx-content) while the
 * page title beneath it broke between phrases (gh#1314). Both trails are measured: Breadcrumb's
 * own markup (link + current page) and PageContainer's (a bare link inside `.ui-breadcrumb-item`).
 */
const WORDS = ["オンボーディング", "リリース", "ハンドブック"];
let css = "";
let browser: Browser;

const BREADCRUMB = `<nav class="ui-breadcrumb" aria-label="パンくず"><ol class="ui-breadcrumb-list">
<li class="ui-breadcrumb-item"><a class="ui-breadcrumb-link" href="#">エンジニアリングハンドブック</a></li>
<li class="ui-breadcrumb-item"><span class="ui-breadcrumb-separator">›</span><span class="ui-breadcrumb-current" aria-current="page">新しいメンバーのためのチーム運営ガイド：オンボーディングから日々の開発、リリースまで</span></li>
</ol></nav>`;
const PAGE_TRAIL = `<nav class="ui-breadcrumb"><ol class="ui-breadcrumb-list">
<li class="ui-breadcrumb-item"><a href="#">エンジニアリングハンドブック</a></li>
<li class="ui-breadcrumb-item"><a href="#">新しいメンバーのためのチーム運営ガイド：オンボーディングから日々の開発、リリースまで</a></li>
</ol></nav>`;

beforeAll(async () => {
  css = await compileRealCss(BREADCRUMB + PAGE_TRAIL);
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

/** Over all widths, how many of WORDS start on one line and end on the next? */
async function midWordBreaks(lang: string, html: string, widths: number[]) {
  const page = await browser.newPage();
  let total = 0;
  for (const w of widths) {
    await page.setContent(
      `<!doctype html><html lang="${lang}"><head><style>${css}</style></head><body><div id="box" style="inline-size:${w}px">${html}</div></body></html>`,
    );
    total += await page.evaluate((words) => {
      const box = document.getElementById("box")!;
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      let breaks = 0;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent ?? "";
        for (const word of words) {
          for (let i = text.indexOf(word); i !== -1; i = text.indexOf(word, i + 1)) {
            const r = document.createRange();
            const tops = new Set(
              Array.from({ length: word.length }, (_, k) => {
                r.setStart(n!, i + k);
                r.setEnd(n!, i + k + 1);
                return Math.round(r.getBoundingClientRect().top);
              }),
            );
            if (tops.size > 1) breaks++;
          }
        }
      }
      return breaks;
    }, WORDS);
  }
  await page.close();
  return total;
}

// Phone trails after the page gutter (390 − 32, 320 − 32) and a few between.
const WIDTHS = [240, 288, 320, 358];

describe("Japanese breadcrumb crumbs break between phrases (gh#1316)", { timeout: 60_000 }, () => {
  it("Breadcrumb (link + current page): no mid-word break at any width", async () => {
    expect(await midWordBreaks("ja", BREADCRUMB, WIDTHS)).toBe(0);
  });

  it("PageContainer's trail (bare links): no mid-word break at any width", async () => {
    expect(await midWordBreaks("ja", PAGE_TRAIL, WIDTHS)).toBe(0);
  });

  it("control: the same markup without lang=ja still breaks mid-word (the lens sees breaks)", async () => {
    expect(await midWordBreaks("en", BREADCRUMB + PAGE_TRAIL, WIDTHS)).toBeGreaterThan(0);
  });
});
