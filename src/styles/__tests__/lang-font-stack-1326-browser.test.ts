import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";

/**
 * gh#1326 in Chromium, against the real stylesheet: `[lang="vi"]`/`[lang="ja"]`/… set
 * `--font-family-sans` from their per-language slot, but foundation.css's
 * `:root { --font-family-sans: var(--font-sans-base) }` came LATER at the same specificity, and
 * `lang` sits on `<html>`, which is `:root` — so the language stacks never applied on the page.
 *
 * Each slot gets a distinguishable probe face, because the slots default to `initial` and would
 * otherwise resolve to the base stack before and after alike.
 */
const SLOTS = `:root{--font-sans-vi:"ViProbe";--font-sans-ja:"JaProbe";}`;
let css = "";
let browser: Browser;

beforeAll(async () => {
  css = await compileRealCss("");
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function fontOf(lang: string, theme = "", nestedLang?: string) {
  const page = await browser.newPage();
  await page.setContent(
    `<!doctype html><html lang="${lang}"><head><style>${css}</style><style>${SLOTS}${theme}</style></head>` +
      `<body>${nestedLang ? `<div id="nested" lang="${nestedLang}">x</div>` : "x"}</body></html>`,
  );
  const result = await page.evaluate(() => {
    const read = (el: Element) =>
      getComputedStyle(el).getPropertyValue("--font-family-sans").trim();
    const nested = document.getElementById("nested");
    return {
      html: read(document.documentElement),
      body: getComputedStyle(document.body).fontFamily,
      nested: nested ? read(nested) : null,
    };
  });
  await page.close();
  return result;
}

describe("language-aware font stacks reach <html lang> (gh#1326)", { timeout: 60_000 }, () => {
  it('<html lang="vi"> resolves --font-family-sans to the vi slot, and the body renders it', async () => {
    const vi = await fontOf("vi");
    expect(vi.html).toBe('"ViProbe"');
    expect(vi.body).toMatch(/^"?ViProbe/);
  });

  it('<html lang="ja"> resolves --font-family-sans to the ja slot', async () => {
    const ja = await fontOf("ja");
    expect(ja.html).toBe('"JaProbe"');
    expect(ja.body).toMatch(/^"?JaProbe/);
  });

  it('a nested <div lang="vi"> inside <html lang="en"> takes the vi slot; <html> keeps the base', async () => {
    const mixed = await fontOf("en", "", "vi");
    expect(mixed.nested).toBe('"ViProbe"');
    expect(mixed.html).not.toContain("Probe");
  });

  it("a theme's :root --font-family-sans loaded after the package still wins on <html lang>", async () => {
    // Same specificity as the language rules on purpose — `:root[lang]` would beat this.
    const themed = await fontOf("vi", `:root{--font-family-sans:"Brand";}`);
    expect(themed.html).toBe('"Brand"');
  });
});
