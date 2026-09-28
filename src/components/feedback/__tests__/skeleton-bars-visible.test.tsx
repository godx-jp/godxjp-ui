import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright";

import { SkeletonDetail, SkeletonTable } from "../skeleton";

/**
 * The bars of SkeletonTable and SkeletonDetail must have a height.
 *
 * `.ui-skeleton-line` / `-caption` / `-title` took their block-size only when nested inside
 * `.ui-skeleton-detail-box, .ui-skeleton-stat, .ui-skeleton-card`. A SkeletonTable is none of those,
 * so its 85 bars (the DataState preview) painted at height 0: the rows and the pulse were there,
 * and nothing was visible — "loading" looked like an empty, frozen table. SkeletonDetail's own
 * title and first line sit OUTSIDE its box and were 0 too.
 *
 * jsdom does not run the cascade, so this needs a browser.
 */
const REPO = process.cwd();
const css = [
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/axes.css",
  "src/tokens/components/feedback.css",
  "src/styles/alert-layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

describe("skeleton bars are visible (Chromium)", () => {
  it("every SkeletonTable and SkeletonDetail bar has a block size", async () => {
    const markup = renderToStaticMarkup(
      <>
        <div id="table">
          <SkeletonTable rows={2} columns={3} />
        </div>
        <div id="detail">
          <SkeletonDetail />
        </div>
      </>,
    );
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1024, height: 800 } });
      await page.setContent(
        `<!doctype html><html><head><style>${css}</style></head><body>${markup}</body></html>`,
      );
      const heights = await page.evaluate(() =>
        Object.fromEntries(
          ["table", "detail"].map((id) => [
            id,
            [...document.querySelectorAll(`#${id} .ui-skeleton-block`)].map(
              (b) => b.getBoundingClientRect().height,
            ),
          ]),
        ),
      );
      // 1 header row + 2 body rows × 3 columns.
      expect(heights.table).toHaveLength(9);
      expect(heights.table.filter((h) => h === 0)).toEqual([]);
      expect(heights.detail.length).toBeGreaterThan(0);
      expect(heights.detail.filter((h) => h === 0)).toEqual([]);
    } finally {
      await browser.close();
    }
  });
});
