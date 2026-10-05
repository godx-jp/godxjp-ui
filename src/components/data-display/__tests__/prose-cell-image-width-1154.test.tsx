import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Prose } from "../prose";

/**
 * gh#1154 — at phone width a table-cell image keeps min(natural width, 20rem) even when it carries
 * a percentage `width` attribute, so a two-column table of images overflows into its scroll box
 * instead of squashing every picture. A pixel `width` (a thumbnail) is kept as written.
 * Chromium at 390px: the pages app's F13 page measured 129px per image.
 */
const table = (width: string | undefined) => (
  <div className="ui-prose-table-scroll">
    <table>
      <tbody>
        <tr>
          <td>
            <img src="https://images.test/480x120.svg" alt="a" width={width} />
          </td>
          <td>
            <img src="https://images.test/480x120.svg" alt="b" width={width} />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
const CASES = { none: undefined, percent: "100%", pixels: "80" } as const;
const markup = renderToStaticMarkup(
  <div style={{ width: 358 }}>
    {Object.entries(CASES).map(([name, width]) => (
      <div key={name} data-p={name}>
        <Prose>{table(width)}</Prose>
      </div>
    ))}
  </div>,
);

describe("Prose cell image width at phone width (Chromium, gh#1154)", () => {
  it("keeps min(natural, 20rem) with or without a percentage width; a pixel width stays", async () => {
    const css = await compileRealCss(markup);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
      await page.route("https://images.test/**", (route) =>
        route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120"><rect width="480" height="120"/></svg>',
        }),
      );
      await page.setContent(
        `<!doctype html><html><head><style>${css} body{margin:0;padding:16px}</style></head><body>${markup}</body></html>`,
      );
      await page.waitForFunction(() =>
        [...document.images].every((img) => img.complete && img.naturalWidth > 0),
      );
      const m = await page.evaluate(
        (names) =>
          Object.fromEntries(
            names.map((p) => {
              const img = document.querySelector<HTMLImageElement>(`[data-p="${p}"] img`)!;
              const box = document.querySelector<HTMLElement>(
                `[data-p="${p}"] .ui-prose-table-scroll`,
              )!;
              return [
                p,
                {
                  img: Math.round(img.getBoundingClientRect().width),
                  scrolls: box.scrollWidth > box.clientWidth,
                },
              ];
            }),
          ),
        Object.keys(CASES),
      );
      expect(m).toEqual({
        none: { img: 320, scrolls: true },
        percent: { img: 320, scrolls: true },
        pixels: { img: 80, scrolls: false },
      });
    } finally {
      await browser.close();
    }
  });
});
