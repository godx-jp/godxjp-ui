import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1305 (ADR C12) in Chromium, against the real stylesheet: the Sidebar section label and the
 * StatCard label shipped as tiny letter-spaced capitals (11px · 0.08em · uppercase), the eyebrow
 * pattern visual-audit's C12 probe flags — every consumer with a Sidebar failed it. Default is now
 * sentence case with no tracking; a theme opts back in through the letter-case/letter-spacing tokens.
 */
let css = "";
let browser: Browser;

beforeAll(async () => {
  css = await compileRealCss(
    `<div class="sb-section-label"></div><div data-slot="stat-card-label"></div>`,
  );
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function labelStyle(selector: string, themeCss = "") {
  const page = await browser.newPage();
  await page.setContent(
    `<!doctype html><html><head><style>${css}${themeCss}</style></head><body><div class="sb-section-label">Pages</div><div data-slot="stat-card-label">Orders</div></body></html>`,
  );
  const style = await page.locator(selector).evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      transform: cs.textTransform,
      spacing: cs.letterSpacing,
      size: parseFloat(cs.fontSize),
    };
  });
  await page.close();
  return style;
}

describe("section labels are not tiny tracked capitals (gh#1305, C12)", { timeout: 60_000 }, () => {
  it.each([".sb-section-label", '[data-slot="stat-card-label"]'])(
    "%s: sentence case, no tracking by default",
    async (selector) => {
      const s = await labelStyle(selector);
      expect(s.transform).toBe("none");
      expect(s.spacing).toBe("normal");
    },
  );

  it("a theme can opt back into small caps through the tokens", async () => {
    const s = await labelStyle(
      ".sb-section-label",
      ":root{--sidebar-section-label-letter-case:uppercase;--sidebar-section-label-letter-spacing:0.08em}",
    );
    expect(s.transform).toBe("uppercase");
    expect(s.spacing).not.toBe("normal");
  });
});
