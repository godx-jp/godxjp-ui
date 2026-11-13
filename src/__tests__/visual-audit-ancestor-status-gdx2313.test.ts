import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// @ts-expect-error — plain ESM script without a declaration file
import { collectInPage } from "../../scripts/visual-audit.mjs";

type Target = { name: string; width: number; height: number; exempt: string | null };
type Collected = { targets: Target[]; alerts: unknown[] };

/**
 * GDX-2313 — two false readings from the in-page collector on a consumer's issue list and /users.
 * Run the real collector in Chromium.
 */
describe("visual-audit collector (GDX-2313)", () => {
  let browser: Browser;
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });
  afterAll(async () => {
    await browser?.close();
  });

  const collect = async (html: string) => {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await page.setContent(`<!doctype html><html><body style="margin:0">${html}</body></html>`);
    return (await page.evaluate(collectInPage)) as Collected;
  };

  // A DataTable wider than its frame makes `.ui-data-table-scroll` a focusable region
  // (tabindex=0, role=group). Its centre fell 11px from one row's 20px-tall title link, and the
  // Spacing exception counted the enclosing region as that link's neighbour — so the finding moved
  // from row to row with the container's centre. A target's ancestor is not its neighbour.
  it("does not count an enclosing focusable scroll region as a neighbouring target", async () => {
    const rows = Array.from(
      { length: 9 },
      (_, i) =>
        `<div style="height:48px;display:flex;align-items:center;padding-left:200px">` +
        `<a href="#r${i}" style="display:block;height:20px;line-height:20px;width:171px;overflow:hidden;white-space:nowrap">Row ${i} subject</a></div>`,
    ).join("");
    // The region's centre (x=200+171/2 ≈ 286, y = 9*48/2 = 216) sits on row 4's link centre.
    const { targets } = await collect(
      `<div class="ui-data-table-scroll" tabindex="0" role="group" aria-label="Issues" style="width:571px;overflow-x:auto">${rows}</div>`,
    );
    const links = targets.filter((t) => t.name.startsWith("Row "));
    expect(links).toHaveLength(9);
    // Every row is the same; every row must read the same — all clear the Spacing exception.
    expect(links.filter((t) => t.exempt !== "spacing").map((t) => t.name)).toEqual([]);
  });

  it("still counts a real neighbouring target that is not an ancestor or descendant", async () => {
    const { targets } = await collect(
      `<div style="display:flex;gap:2px;padding:40px">` +
        `<a href="#a" style="display:block;width:16px;height:16px">a</a>` +
        `<a href="#b" style="display:block;width:16px;height:16px">b</a></div>`,
    );
    const small = targets.filter((t) => t.name === "a" || t.name === "b");
    expect(small.map((t) => t.exempt)).toEqual([null, null]);
  });

  // FilterBar's result count is `<p role="status" class="ui-filter-bar-count">` — a polite live
  // text, display:block. The banner collector read every [role=status] and called it "controls
  // stacked vertically". Text with no icon and no control has no Alert anatomy to misplace.
  it("does not measure a bare status text with no icon or control as a banner", async () => {
    const { alerts } = await collect(
      `<p role="status" class="ui-filter-bar-count" style="width:288px">45 件の結果</p>` +
        `<div data-slot="alert" role="alert" style="display:flex;width:400px"><svg width="16" height="16"></svg><p>パスキーを登録してください</p><button>登録</button></div>`,
    );
    expect(alerts).toHaveLength(1);
  });

  it("still measures a status region that carries Alert anatomy", async () => {
    const { alerts } = await collect(
      `<div role="status" style="width:400px"><svg width="16" height="16"></svg><p>保存しました</p><button>元に戻す</button></div>`,
    );
    expect(alerts).toHaveLength(1);
  });
});
