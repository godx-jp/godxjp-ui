import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * gh#1285 in Chromium, against the real stylesheet. The shortcut key-cap padding (gh#1250) used to
 * be `calc(var(--search-input-edge-inset) + 6ch)`, which made `--search-input-end-padding` INERT on
 * that field (nightly check:frame-token-wins). It is now derived FROM that token: by default it must
 * resolve to exactly the old value, and a theme that retunes the token must move it.
 */
const OLD = "!pe-[calc(var(--search-input-edge-inset)+6ch)]";
const NEW =
  "!pe-[calc(var(--search-input-end-padding)_-_var(--control-icon-size)_-_var(--control-gap)_+_6ch)]";

let css = "";
let browser: Browser;

beforeAll(async () => {
  css = await compileRealCss(`<input class="${OLD}"><input class="${NEW}">`);
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function paddings(themeCss = "") {
  const page = await browser.newPage();
  await page.setContent(
    `<!doctype html><html><head><style>${css}${themeCss}</style></head><body><input id="o" class="${OLD}"><input id="n" class="${NEW}"></body></html>`,
  );
  const read = (id: string) =>
    page.locator(`#${id}`).evaluate((el) => parseFloat(getComputedStyle(el).paddingInlineEnd));
  const out = { old: await read("o"), new: await read("n") };
  await page.close();
  return out;
}

describe(
  "SearchInput shortcut padding reads --search-input-end-padding (gh#1285)",
  { timeout: 60_000 },
  () => {
    it("resolves to the same pixels as before by default", async () => {
      const { old, new: next } = await paddings();
      expect(old).toBeGreaterThan(0);
      expect(next).toBeCloseTo(old, 3);
    });

    it("moves when a theme retunes --search-input-end-padding", async () => {
      const base = await paddings();
      const themed = await paddings(":root{--search-input-end-padding:64px}");
      expect(themed.new).toBeGreaterThan(base.new);
      expect(themed.old).toBeCloseTo(base.old, 3);
    });
  },
);
