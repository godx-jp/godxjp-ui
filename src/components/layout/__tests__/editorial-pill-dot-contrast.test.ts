import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, expect, it } from "vitest";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { contrast, NON_TEXT } from "../../../tokens/__tests__/wcag-contrast";

/**
 * EditorialPillNavItem icon="dot": the dot is a marker that carries meaning, so it clears WCAG
 * 1.4.11's 3:1 against the surface in light and dark (the hairline border colour gave ~1.4:1 in
 * dark), and the current pill's dot takes the current pill's brand ink.
 */
let browser: Browser;
let css: string;
const nav = `<nav class="ui-editorial-pill-nav">
<a class="ui-editorial-pill" href="#"><span class="ui-editorial-pill-dot"></span>A</a>
<a class="ui-editorial-pill" aria-current="page" href="#"><span class="ui-editorial-pill-dot"></span>B</a>
</nav>`;
const markup = `<div id="light" style="background:hsl(var(--background))">${nav}</div>
<div id="dark" class="dark" style="background:hsl(var(--background))">${nav}</div>`;

beforeAll(async () => {
  css = await compileRealCss(markup);
  browser = await chromium.launch({ headless: true });
});
afterAll(async () => {
  await browser?.close();
});

const rgb = (s: string) =>
  s
    .match(/[\d.]+/g)!
    .slice(0, 3)
    .map((v) => Number(v) * (s.startsWith("color(srgb") ? 255 : 1)) as [number, number, number];

it("the default dot clears 3:1 on the background, and the current dot takes the brand ink", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(`<style>${css}</style>${markup}`);
    for (const theme of ["light", "dark"]) {
      const read = (sel: string, prop: "color" | "backgroundColor") =>
        page.locator(`#${theme} ${sel}`).evaluate((el, p) => getComputedStyle(el)[p], prop);
      const bg = rgb(
        await page.locator(`#${theme}`).evaluate((el) => getComputedStyle(el).backgroundColor),
      );
      const dots = page.locator(`#${theme} .ui-editorial-pill-dot`);
      const dot = rgb(await dots.nth(0).evaluate((el) => getComputedStyle(el).backgroundColor));
      expect(contrast(dot, bg), theme).toBeGreaterThanOrEqual(NON_TEXT);

      const current = await dots.nth(1).evaluate((el) => getComputedStyle(el).backgroundColor);
      const currentInk = await read(".ui-editorial-pill[aria-current]", "color");
      expect(current, theme).toBe(currentInk);
      const currentBg = rgb(await read(".ui-editorial-pill[aria-current]", "backgroundColor"));
      expect(contrast(rgb(current), currentBg), `${theme} current`).toBeGreaterThanOrEqual(
        NON_TEXT,
      );
    }
  } finally {
    await page.close();
  }
});

it("--editorial-pill-dot-color still overrides both dots", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(
      `<style>${css}</style><div style="--editorial-pill-dot-color: rgb(1, 2, 3)">${nav}</div>`,
    );
    const colors = await page
      .locator(".ui-editorial-pill-dot")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor));
    expect(colors).toEqual(["rgb(1, 2, 3)", "rgb(1, 2, 3)"]);
  } finally {
    await page.close();
  }
});
