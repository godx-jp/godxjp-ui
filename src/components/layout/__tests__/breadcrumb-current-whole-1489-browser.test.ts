import type { Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * GDX-1489 in Chromium, against the real stylesheet. The trail's one rule: the current page is
 * never cut. Measured on GDX at 320: every crumb was `ellipsis`, all three shrank together and the
 * current page read 「一般設…」 (42 of 50px). Now only ancestors give way; the current crumb keeps
 * its whole label, on one line while it fits and wrapped when even the whole line cannot hold it.
 * `maxItems` folds the middle crumbs into one "…" menu button.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Breadcrumb } from "./src/components/layout/breadcrumb";
import { PageContainer } from "./src/components/layout/page-container";
const anc = [
  { label: "Corporate website renewal programme", to: "#p", ellipsis: true },
  { label: "プロジェクト設定とメンバーの管理", to: "#s", ellipsis: true },
];
const LONG = "Notification rules for every channel the organisation runs";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div style={{ padding: 16 }}>
      <div data-case="short"><Breadcrumb items={[...anc, { label: "一般設定", ellipsis: true }]} /></div>
      <div data-case="long"><Breadcrumb items={[...anc, { label: LONG, ellipsis: true }]} /></div>
      <div data-case="page"><PageContainer title="t" breadcrumb={[...anc, { label: "一般設定", ellipsis: true }]} /></div>
      <div data-case="fold">
        <Breadcrumb maxItems={3} itemsAfterCollapse={2} items={[
          { label: "Home", to: "#h" }, { label: "Projects", to: "#ps" },
          { label: "Web", to: "#w" }, { label: "Settings", to: "#st" }, { label: "General" },
        ]} />
      </div>
    </div>
  </AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

const measure = (page: Page, id: string) =>
  page.$eval(`[data-case="${id}"]`, (box) => {
    const nav = box.querySelector(".ui-breadcrumb")!;
    const current = nav.querySelector('[aria-current="page"]') as HTMLElement;
    const r = current.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(current).lineHeight) || 20;
    return {
      currentCut: current.scrollWidth - current.clientWidth,
      currentEllipsis: current.classList.contains("ui-breadcrumb-ellipsis"),
      currentLines: Math.round(r.height / lineHeight),
      currentRight: r.right,
      navRight: nav.getBoundingClientRect().right,
      ancestorsCut: [
        ...nav.querySelectorAll("a.ui-breadcrumb-ellipsis, a[href].ui-breadcrumb-ellipsis"),
      ].some((a) => (a as HTMLElement).scrollWidth > (a as HTMLElement).clientWidth),
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

describe("Breadcrumb never cuts the current page (GDX-1489)", () => {
  for (const width of [320, 390]) {
    it(`a short current crumb stays whole while the ancestors give way at ${width}px`, async () => {
      const page = await fixture.open("", { width, height: 800 });
      for (const id of ["short", "page"]) {
        const m = await measure(page, id);
        expect(m.currentEllipsis, id).toBe(false);
        expect(m.currentCut, id).toBeLessThanOrEqual(0);
        expect(m.currentLines, id).toBe(1);
        expect(m.ancestorsCut, id).toBe(true);
        expect(m.currentRight, id).toBeLessThanOrEqual(m.navRight + 0.5);
      }
      expect((await measure(page, "short")).pageOverflow).toBeLessThanOrEqual(0);
      await page.close();
    });

    it(`a current crumb longer than the line wraps inside the trail at ${width}px`, async () => {
      const page = await fixture.open("", { width, height: 800 });
      const m = await measure(page, "long");
      expect(m.currentEllipsis).toBe(false);
      expect(m.currentCut).toBeLessThanOrEqual(0);
      expect(m.currentLines).toBeGreaterThan(1);
      expect(m.currentRight).toBeLessThanOrEqual(m.navRight + 0.5);
      expect(m.pageOverflow).toBeLessThanOrEqual(0);
      await page.close();
    });
  }

  it("maxItems folds the middle crumbs into one menu button that lists them", async () => {
    const page = await fixture.open("", { width: 390, height: 800 });
    const fold = page.locator('[data-case="fold"]');
    const texts = await fold.locator("li").allTextContents();
    // The fold is an icon button between the kept crumbs (MUI's maxItems / itemsAfterCollapse).
    expect(texts.map((t) => t.trim())).toEqual(["Home", "", "Settings", "General"]);
    expect(await fold.locator("li[data-fold] [aria-haspopup]").count()).toBe(1);
    const button = fold.getByRole("button", { name: "Show hidden path" });
    await button.click();
    const items = page.getByRole("menuitem");
    expect(await items.allTextContents()).toEqual(["Projects", "Web"]);
    expect(await items.first().getAttribute("href")).toBe("#ps");
    await page.close();
  });
});
