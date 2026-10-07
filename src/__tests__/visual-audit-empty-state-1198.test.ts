import { chromium } from "playwright";
import { describe, expect, it } from "vitest";

// @ts-expect-error — plain ESM script without a declaration file
import { collectInPage } from "../../scripts/visual-audit.mjs";

/**
 * gh#1198 — the banner anatomy check collected the kit's own EmptyState (role="status") and flagged
 * it as `alert-controls-misplaced`. Run the real in-page collector in Chromium.
 */
describe("visual-audit banner collector skips the kit's EmptyState (gh#1198)", () => {
  it("collects a real alert and not an EmptyState status region", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(`<!doctype html><html><body>
        <div data-slot="empty-state" role="status" style="display:flex;flex-direction:column;width:400px">
          <svg width="24" height="24"></svg><p>課題はありません</p><button style="width:100%">課題を追加</button>
        </div>
        <div role="alert" style="display:flex;width:400px"><svg width="16" height="16"></svg><p>保存に失敗しました</p></div>
      </body></html>`);
      const result = (await page.evaluate(collectInPage)) as { alerts: unknown[] };
      expect(result.alerts).toHaveLength(1);
    } finally {
      await browser.close();
    }
  });
});
