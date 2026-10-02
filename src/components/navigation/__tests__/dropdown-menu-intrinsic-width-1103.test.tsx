import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { describe, expect, it } from "vitest";

/**
 * gh#1103 — `.ui-dropdown-menu-content` is absolutely positioned, and with `width: auto` its width
 * was shrink-to-fit against its PROVISIONAL `left`. Near the viewport's right edge the first
 * layout was narrower than the content (200px), React Aria moved the surface and it widened to its
 * natural 208px in the same ResizeObserver delivery — Chromium's "ResizeObserver loop completed
 * with undelivered notifications". The surface now has an intrinsic width, so where `left` lands
 * no longer changes it. Chromium: jsdom has no layout.
 */
const REPO = process.cwd();
const css = [
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/semantic/layout.css",
  "src/tokens/axes.css",
  "src/tokens/components/control.css",
  "src/tokens/components/navigation.css",
  "src/styles/control.css",
  "src/styles/layout.css",
  "src/styles/navigation-layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

const surface = (id: string, left: string) =>
  `<div id="${id}" class="ui-dropdown-menu-content" style="position: absolute; top: 0; left: ${left}">
     <div role="menu"><div role="menuitem">編集</div><div role="menuitem">認証情報をローテーション</div><div role="menuitem">削除</div></div>
   </div>`;

describe("DropdownMenuContent width does not depend on its left offset (Chromium, gh#1103)", () => {
  it("is as wide at the right edge as in open space, and stays inside the viewport", async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
      await page.setContent(
        `<!doctype html><html lang="ja"><head><style>${css} body { margin: 0; }</style></head><body>
          ${surface("open", "0px")}
          ${surface("edge", "calc(100vw - 120px)")}
          <div id="long" class="ui-dropdown-menu-content" style="position: absolute; top: 400px; left: 0">
            <div role="menu"><div role="menuitem" style="white-space: nowrap">${"長い項目名".repeat(60)}</div></div>
          </div>
        </body></html>`,
      );
      const m = await page.evaluate(() => {
        const w = (id: string) => document.getElementById(id)!.getBoundingClientRect().width;
        return { open: w("open"), edge: w("edge"), long: w("long"), vw: window.innerWidth };
      });
      expect(m.open).toBeGreaterThan(120);
      expect(m.edge).toBe(m.open);
      // The ceiling: a pathological label cannot make the surface wider than the viewport.
      expect(m.long).toBeLessThan(m.vw);
    } finally {
      await browser.close();
    }
  });
});
