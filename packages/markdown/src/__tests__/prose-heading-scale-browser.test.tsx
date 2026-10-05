import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { compileRealCss } from "../../../../src/components/data-entry/__tests__/compile-real-css";
import { Prose } from "../../../../src/components/data-display/prose";
import { Markdown } from "../markdown";

/**
 * Every Prose heading reads as a heading. A host that keeps the page title as the screen's one h1
 * shifts body headings down a level (`#` → h2, `##` → h3), so h3–h6 carry real section titles. On
 * 31.28.0, h3 was body size at weight 500 next to 400 body, h4 was SMALLER than body, and h5/h6
 * had no rule at all, so they rendered as plain paragraphs.
 */
const BODY = ["# h1", "## h2", "### h3", "#### h4", "##### h5", "###### h6", "body text"].join(
  "\n\n",
);
const markup = renderToStaticMarkup(
  <Prose>
    <Markdown>{BODY}</Markdown>
  </Prose>,
);

describe("Prose heading scale (Chromium)", () => {
  it("puts h1–h6 at or above body size, never growing down the levels, all heavier than body", async () => {
    const css = await compileRealCss(markup);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      await page.setContent(
        `<!doctype html><html><head><style>${css}</style></head><body>${markup}</body></html>`,
      );
      const m = await page.evaluate(() => {
        const read = (el: Element) => {
          const s = getComputedStyle(el);
          return { size: parseFloat(s.fontSize), weight: Number(s.fontWeight), color: s.color };
        };
        return {
          body: read(document.querySelector(".ui-prose p")!),
          headings: ["h1", "h2", "h3", "h4", "h5", "h6"].map((tag) =>
            read(document.querySelector(`.ui-prose ${tag}`)!),
          ),
        };
      });
      const [h1, h2, h3, h4, h5, h6] = m.headings;
      for (const h of m.headings) {
        expect(h.size).toBeGreaterThanOrEqual(m.body.size);
        expect(h.weight).toBeGreaterThan(m.body.weight);
      }
      // A size step down to h3, so the shifted `##` still outranks body by size, not weight alone.
      expect(h1!.size).toBeGreaterThan(h2!.size);
      expect(h2!.size).toBeGreaterThan(h3!.size);
      expect(h3!.size).toBeGreaterThan(m.body.size);
      // At body size the WEIGHT carries the level: bold, not the 500 that reads like body.
      for (const h of [h4!, h5!, h6!]) expect(h.weight).toBeGreaterThanOrEqual(700);
      expect(h4!.size).toBeGreaterThanOrEqual(h5!.size);
      expect(h5!.size).toBeGreaterThanOrEqual(h6!.size);
      // h6 is told apart from h5 by tone.
      expect(h6!.color).not.toBe(h5!.color);
    } finally {
      await browser.close();
    }
  });
});
