import { chromium } from "playwright";
import { describe, expect, it } from "vitest";

// @ts-expect-error — plain ESM script without a declaration file
import { collectInPage } from "../../scripts/visual-audit.mjs";

/**
 * gh#1200 — row-content-starved measured the kit's own visually-hidden text (a Button countLabel, a
 * VisuallyHidden label: absolute, 1px, overflow hidden) as starved content. Real collector, Chromium.
 */
describe("visual-audit starved-text collector skips visually-hidden text (gh#1200)", () => {
  it("measures a truncated visible label but not sr-only text", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(`<!doctype html><html><head><style>
        .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0 }
        .clip { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap }
      </style></head><body>
        <div class="ui-flex" data-direction="row" style="display:flex;width:120px">
          <button>★<span class="sr-only">, 0 件のスター</span></button>
          <span class="clip">コメント</span>
          <span style="overflow:hidden;white-space:nowrap;width:40px;display:block">とても長い件名のテキストです</span>
        </div>
      </body></html>`);
      const result = (await page.evaluate(collectInPage)) as { rowTexts: { text: string }[] };
      expect(result.rowTexts.map((r) => r.text)).toEqual(["とても長い件名のテキストです"]);
    } finally {
      await browser.close();
    }
  });
});
