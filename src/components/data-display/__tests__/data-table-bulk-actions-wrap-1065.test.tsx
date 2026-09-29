import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium, type Page } from "playwright";

import { AppProvider } from "../../../app/app-provider";
import { Button } from "../../general/button";
import { DataTable } from "../data-table";

/**
 * gh#1065 — `DataTable.BulkActions` with the count plus four ja actions stayed on ONE line and
 * pushed the page into horizontal scroll at 390px (CONSUMER-RULES: never horizontal page scroll).
 * The bar now wraps like antd `Space wrap`: the count and the action group are two wrap items, and
 * the group wraps its own buttons. At 1280 it is still one row. jsdom does not lay out: Chromium.
 */
const REPO = process.cwd();
const css = [
  "src/tokens/components/flex.css",
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/semantic/layout.css",
  "src/tokens/axes.css",
  "src/tokens/components/control.css",
  "src/tokens/components/table.css",
  "src/styles/control.css",
  "src/styles/layout.css",
  "src/styles/table-layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

const ACTIONS = ["タグを追加", "タグを削除", "一括更新", "CSV出力"];

const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="ja" fallbackLocale="en">
    <div id="node" className="gutter">
      <DataTable.Toolbar>
        <DataTable.BulkActions count={12}>
          {ACTIONS.map((label) => (
            <Button key={label} variant="outline">
              {label}
            </Button>
          ))}
        </DataTable.BulkActions>
      </DataTable.Toolbar>
    </div>
    <div id="fn" className="gutter">
      <DataTable.Toolbar>
        <DataTable.BulkActions count={12}>
          {(count) => (
            <>
              <span>{`${count} 件選択中`}</span>
              {ACTIONS.map((label) => (
                <Button key={label} variant="outline">
                  {label}
                </Button>
              ))}
            </>
          )}
        </DataTable.BulkActions>
      </DataTable.Toolbar>
    </div>
  </AppProvider>,
);

async function measure(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      pageOverflow: doc.scrollWidth - doc.clientWidth,
      bars: ["node", "fn"].map((id) => {
        const bar = document.querySelector<HTMLElement>(`#${id} [role="region"]`)!;
        const box = bar.getBoundingClientRect();
        const buttons = [...bar.querySelectorAll("button")].map((b) => b.getBoundingClientRect());
        // The row's items: the count + every button (the ReactNode form nests the buttons in a group).
        const label = bar.firstElementChild!.getBoundingClientRect();
        const items = [label, ...buttons];
        // Vertical centres, not tops: the bar centres a one-line count against 32px buttons.
        const centres = items.map((r) => r.top + r.height / 2);
        return {
          id,
          barOverflow: bar.scrollWidth - bar.clientWidth,
          // Worst amount any button pokes outside the bar or the viewport, either side.
          buttonOutside: Math.max(
            ...buttons.map((r) =>
              Math.max(box.left - r.left, r.right - box.right, -r.left, r.right - doc.clientWidth),
            ),
          ),
          rowSpread: Math.max(...centres) - Math.min(...centres),
          // The count is not squeezed into a column of one-glyph lines: no taller than a button.
          labelOverButton: label.height - Math.max(...buttons.map((r) => r.height)),
        };
      }),
    };
  });
}

describe("DataTable.BulkActions wraps instead of overflowing (Chromium, gh#1065)", () => {
  it("wraps at 390px with four ja actions and stays one row at 1280px", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css}
          body { margin: 0; }
          .gutter { padding-inline: 16px; }
        </style></head><body>${markup}</body></html>`,
      );

      const narrow = await measure(page);
      expect(narrow.pageOverflow, "page horizontal overflow at 390").toBeLessThanOrEqual(1);
      for (const bar of narrow.bars) {
        expect(bar.barOverflow, `${bar.id} bar overflow at 390`).toBeLessThanOrEqual(1);
        expect(bar.buttonOutside, `${bar.id} button clipped at 390`).toBeLessThanOrEqual(1);
        expect(bar.labelOverButton, `${bar.id} count label squeezed at 390`).toBeLessThanOrEqual(1);
        // It really did wrap: the items no longer share one row.
        expect(bar.rowSpread, `${bar.id} wrapped at 390`).toBeGreaterThan(1);
      }

      await page.setViewportSize({ width: 1280, height: 800 });
      const wide = await measure(page);
      expect(wide.pageOverflow).toBeLessThanOrEqual(1);
      for (const bar of wide.bars) {
        expect(bar.rowSpread, `${bar.id} one row at 1280`).toBeLessThanOrEqual(1);
      }
    } finally {
      await browser.close();
    }
  });
});
