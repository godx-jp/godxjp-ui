import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, expect, it } from "vitest";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/** gh#1538 follow-up: a tab's count sits a clear word space from its label (「招待中 5」, not 「招待中5」). */
let browser: Browser;
let css: string;
const trigger = (id: string, tone = "") =>
  `<button id="${id}" data-slot="tabs-trigger" class="inline-flex items-center gap-1.5 text-sm">招待中<span class="ui-tabs-count" data-slot="tabs-count"${tone}>5</span></button>`;
const markup = `<div data-slot="tabs">${trigger("pill")}${trigger("neutral", ' data-count-tone="neutral"')}</div>`;

beforeAll(async () => {
  css = await compileRealCss(markup);
  browser = await chromium.launch({ headless: true });
});
afterAll(async () => {
  await browser?.close();
});

it.each(["pill", "neutral"])("%s count stands at least 12px from the label", async (id) => {
  const page = await browser.newPage();
  try {
    await page.setContent(`<style>${css}</style>${markup}`);
    const gap = await page.locator(`#${id}`).evaluate((t) => {
      const range = document.createRange();
      range.selectNodeContents(t.firstChild!);
      return (
        t.querySelector(".ui-tabs-count")!.getBoundingClientRect().left -
        range.getBoundingClientRect().right
      );
    });
    expect(gap).toBeGreaterThanOrEqual(12);
  } finally {
    await page.close();
  }
});
