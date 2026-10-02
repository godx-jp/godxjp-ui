import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { Text } from "../../general/typography";
import { Badge } from "../badge";

/**
 * gh#1101 — a Badge with a long label grew to its full text (394px in a 242px DataTable cell) and
 * ran past the cell and the Card: the chip had no `max-inline-size` and its label could not
 * shrink, so even `<Badge><Text ellipsis>` never truncated. Now the chip is bounded by its
 * container and the label ellipsizes (antd `Typography ellipsis`); the full text opens in a tooltip
 * when it was cut (badge-label-tooltip-1105.test.tsx). jsdom does not lay out: Chromium.
 */
const REPO = process.cwd();
const css = [
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/semantic/layout.css",
  "src/tokens/axes.css",
  "src/tokens/components/control.css",
  "src/tokens/components/table.css",
  "src/tokens/components/badge.css",
  "src/tokens/components/text.css",
  "src/styles/control.css",
  "src/styles/layout.css",
  "src/styles/table-layout.css",
  "src/styles/text-layout.css",
  "src/styles/badge-layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

// 60 characters: the consumer's `チーム経由 · <team name>` shape.
const LONG =
  "チーム経由 · プラットフォーム基盤運用チーム（東日本リージョン・夜間当番ローテーション第二班）";

const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="ja" fallbackLocale="en">
    <table id="cell" style={{ tableLayout: "fixed", inlineSize: "242px" }}>
      <tbody>
        <tr>
          <td data-slot="table-cell">
            <Badge tone="info">{LONG}</Badge>
          </td>
        </tr>
      </tbody>
    </table>
    <div id="nested" style={{ inlineSize: "200px" }}>
      <Badge>
        <Text ellipsis>{LONG}</Text>
      </Badge>
    </div>
    <div id="short" style={{ inlineSize: "400px" }}>
      <Badge>有効</Badge>
    </div>
  </AppProvider>,
);

describe("Badge long label (Chromium, gh#1101)", () => {
  it("never outgrows its cell or container, and the label ellipsizes", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css} body { margin: 0; }</style></head><body>${markup}</body></html>`,
      );
      const m = await page.evaluate(() => {
        const read = (id: string) => {
          const box = document.getElementById(id)!;
          const holder = box.querySelector<HTMLElement>("td") ?? box;
          const badge = box.querySelector<HTMLElement>('[data-slot="badge"]')!;
          // The element that ellipsizes: the label, or a `Text ellipsis` the caller put in it.
          const label =
            box.querySelector<HTMLElement>('[data-slot="badge-label"] [data-slot="text"]') ??
            box.querySelector<HTMLElement>('[data-slot="badge-label"]')!;
          return {
            holderRight: holder.getBoundingClientRect().right,
            badgeRight: badge.getBoundingClientRect().right,
            badgeWidth: badge.getBoundingClientRect().width,
            cut: label.scrollWidth > label.clientWidth,
            textOverflow: getComputedStyle(label).textOverflow,
            whiteSpace: getComputedStyle(badge).whiteSpace,
            height: badge.getBoundingClientRect().height,
          };
        };
        return { cell: read("cell"), nested: read("nested"), short: read("short") };
      });

      for (const k of ["cell", "nested"] as const) {
        expect(m[k].badgeRight).toBeLessThanOrEqual(m[k].holderRight + 0.5);
        expect(m[k].cut).toBe(true);
        expect(m[k].textOverflow).toBe("ellipsis");
        // Still one chip on one line (rule #35): it ellipsizes, it does not wrap.
        expect(m[k].whiteSpace).toBe("nowrap");
        expect(m[k].height).toBeCloseTo(m.short.height, 0);
      }
      // A short label keeps its content width.
      expect(m.short.cut).toBe(false);
      expect(m.short.badgeWidth).toBeLessThan(100);
    } finally {
      await browser.close();
    }
  });
});
