import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { AppShell } from "../app-shell";
import { PageContainer } from "../page-container";
import { Sidebar } from "../sidebar";

/**
 * gh#1133 / gh#1135 in a real layout engine: the labelled drawer trigger is one bar cell — glyph
 * and text on one line, the full bar height, nothing clipped — at phone widths; and a page title
 * focused through `titleRef` draws no ring. jsdom does not lay out: Chromium.
 */
const markup = renderToStaticMarkup(
  <AppProvider persist={false} defaultLocale="en">
    <AppShell
      sidebar={<Sidebar activeId="a" sections={[{ items: [{ id: "a", label: "A" }] }]} />}
      topbarLeft={<span>Workspace</span>}
      mobileNavTriggerLabel="Pages"
    >
      <PageContainer title="Guides" titleRef={() => undefined}>
        body
      </PageContainer>
    </AppShell>
  </AppProvider>,
);

describe("AppShell labelled drawer trigger (Chromium, gh#1133)", () => {
  it("is one full-height bar cell with the label unclipped at 390px and 320px", async () => {
    const css = await compileRealCss(markup);
    const browser = await chromium.launch({ headless: true });
    try {
      for (const width of [390, 320]) {
        const page = await browser.newPage({ viewport: { width, height: 700 } });
        await page.setContent(
          `<!doctype html><html><head><style>${css} body{margin:0}</style></head><body>${markup}</body></html>`,
        );
        const m = await page.evaluate(() => {
          const trigger = document.querySelector<HTMLElement>(".app-mobile-nav-trigger")!;
          const bar = document.querySelector<HTMLElement>(".app-topbar")!;
          const t = trigger.getBoundingClientRect();
          const glyph = trigger.querySelector("svg")!.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(trigger.lastChild!);
          const text = range.getBoundingClientRect();
          return {
            hidden: getComputedStyle(trigger).display === "none",
            // clientHeight: the bar's own 1px bottom border is not part of the cell's row.
            heightDelta: Math.abs(t.height - bar.clientHeight),
            clipped: trigger.scrollWidth > trigger.clientWidth + 0.5,
            oneLine: Math.abs(glyph.top + glyph.height / 2 - (text.top + text.height / 2)) < 2,
            textAfterGlyph: text.left >= glyph.right,
            insideViewport: t.left >= 0 && t.right <= window.innerWidth,
          };
        });
        expect(m, `at ${width}px`).toEqual({
          hidden: false,
          heightDelta: 0,
          clipped: false,
          oneLine: true,
          textAfterGlyph: true,
          insideViewport: true,
        });
        await page.close();
      }
    } finally {
      await browser.close();
    }
  });

  it("draws no focus ring on a page title focused through titleRef (gh#1135)", async () => {
    const css = await compileRealCss(markup);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 700 } });
      await page.setContent(
        `<!doctype html><html><head><style>${css} body{margin:0}</style></head><body>${markup}</body></html>`,
      );
      // A key press first, so the browser is in keyboard modality and :focus-visible WOULD match.
      await page.keyboard.press("Tab");
      const outline = await page.evaluate(() => {
        const h1 = document.querySelector<HTMLElement>("h1.ui-page-title")!;
        h1.focus();
        return {
          focused: document.activeElement === h1,
          style: getComputedStyle(h1).outlineStyle,
        };
      });
      expect(outline).toEqual({ focused: true, style: "none" });
    } finally {
      await browser.close();
    }
  });
});
