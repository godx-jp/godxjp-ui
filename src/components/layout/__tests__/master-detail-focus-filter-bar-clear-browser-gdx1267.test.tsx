import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Button } from "../../general/button";
import { FilterBar } from "../../navigation/toolbar";
import { MasterDetail } from "../master-detail";

/**
 * GDX-1267, in a real layout engine (jsdom neither paints a ring nor lays out):
 *  1. on a phone MasterDetail moves focus to the detail's first heading (tabindex -1) or to the
 *     detail region itself — a focus TARGET, not a control, so neither draws a ring;
 *  2. below 640px the FilterBar stacks and the end cluster is a row of its own, so an icon-only
 *     clear-all there carries its words instead of standing alone as a bare ✕.
 */
const page = (markup: string, css: string) =>
  `<!doctype html><html><head><style>${css} body{margin:0}</style></head><body>${markup}</body></html>`;

describe("MasterDetail programmatic focus target draws no ring (GDX-1267)", () => {
  const markup = renderToStaticMarkup(
    <AppProvider persist={false} defaultLocale="en">
      <MasterDetail
        master={<a href="#a">Item A</a>}
        mobilePane="detail"
        detailBack={<a href="#list">Back</a>}
      >
        <h2>Item A</h2>
        <p>Body</p>
      </MasterDetail>
    </AppProvider>,
  );

  it("leaves the focused heading and the focused detail region without an outline", async () => {
    const css = await compileRealCss(markup);
    const browser = await chromium.launch({ headless: true });
    try {
      const tab = await browser.newPage({ viewport: { width: 390, height: 700 } });
      await tab.setContent(page(markup, css));
      // A key press first, so the browser is in keyboard modality and :focus-visible WOULD match.
      await tab.keyboard.press("Tab");
      const m = await tab.evaluate(() => {
        const detail = document.querySelector<HTMLElement>(".ui-master-detail-detail")!;
        const heading = detail.querySelector<HTMLElement>("h2")!;
        // What the component's effect does on a phone.
        heading.tabIndex = -1;
        heading.focus();
        const h = {
          focused: document.activeElement === heading,
          style: getComputedStyle(heading).outlineStyle,
        };
        detail.focus();
        const d = {
          focused: document.activeElement === detail,
          style: getComputedStyle(detail).outlineStyle,
        };
        return { heading: h, detail: d };
      });
      expect(m).toEqual({
        heading: { focused: true, style: "none" },
        detail: { focused: true, style: "none" },
      });
    } finally {
      await browser.close();
    }
  });
});

describe("FilterBar icon clear-all below 640px (GDX-1267)", () => {
  const markup = renderToStaticMarkup(
    <AppProvider persist={false} defaultLocale="en">
      <FilterBar
        search={{ ariaLabel: "Search", placeholder: "Search" }}
        onClear={() => undefined}
        hasActiveFilters
        clearDisplay="icon"
      >
        <Button variant="outline">Filters</Button>
      </FilterBar>
    </AppProvider>,
  );

  it("shows its words on the stacked row at 390px and 320px, and is a bare square from 640px", async () => {
    const css = await compileRealCss(markup);
    const browser = await chromium.launch({ headless: true });
    try {
      const measure = async (width: number) => {
        const tab = await browser.newPage({ viewport: { width, height: 700 } });
        await tab.setContent(page(markup, css));
        const m = await tab.evaluate(() => {
          const clear = document.querySelector<HTMLElement>(".ui-toolbar-clear")!;
          const row = clear.closest<HTMLElement>(".ui-toolbar")!;
          const c = clear.getBoundingClientRect();
          const r = row.getBoundingClientRect();
          return {
            text: clear.innerText.trim(),
            name: clear.getAttribute("aria-label"),
            square: Math.abs(c.width - c.height) < 1,
            fillsRow: Math.abs(c.left - r.left) < 1 && Math.abs(c.right - r.right) < 1,
            clipped: clear.scrollWidth > clear.clientWidth + 0.5,
          };
        });
        await tab.close();
        return m;
      };
      for (const width of [390, 320]) {
        expect(await measure(width), `at ${width}px`).toEqual({
          text: "Clear filters",
          name: "Clear filters",
          square: false,
          fillsRow: true,
          clipped: false,
        });
      }
      expect(await measure(1280), "at 1280px").toMatchObject({
        text: "",
        name: "Clear filters",
        square: true,
      });
    } finally {
      await browser.close();
    }
  });
});
