import { afterAll, beforeAll, expect, it } from "vitest";
import type { Page } from "playwright";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(`
import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {AppProvider} from './src/app/app-provider';
import {AppShell} from './src/components/layout/app-shell';
import {Button} from './src/components/general/button';
import {PageContainer} from './src/components/layout/page-container';
const q=new URLSearchParams(location.search);
createRoot(document.getElementById('root')).render(<AppProvider defaultLocale="en" persist={false}>
<div dir={q.get('dir') || 'ltr'}><AppShell sidebar={<a href="#all">All destinations</a>}
responsiveNavigation={q.get('mode') || 'drawer'}
mobileTabBar={q.has('empty') ? null : <><Button asChild variant="ghost"><a href="#home" aria-current="page">Home</a></Button><Button asChild variant="ghost"><a href="#work">Work</a></Button><Button asChild variant="ghost"><a href="#more">More</a></Button></>}
footer={<span data-footer-text>Footer</span>} mobileTabBarLabel="Destinations"><PageContainer title="Records"><div style={{minHeight:1600}}>Long content<a href="#end">Last record</a></div></PageContainer></AppShell></div></AppProvider>);
`);
}, 60_000);
afterAll(async () => {
  await fixture?.close();
});

async function geometry(page: Page) {
  return page.locator(".app-root").evaluate((root) => {
    const bar = root.querySelector(".ui-mobile-shell-tabbar")!;
    const main = root.querySelector("main")!;
    const b = bar.getBoundingClientRect(),
      m = main.getBoundingClientRect();
    return {
      barTop: b.top,
      barBottom: b.bottom,
      mainBottom: m.bottom,
      width: b.width,
      height: b.height,
      published: parseFloat(
        root.ownerDocument.documentElement.style.getPropertyValue("--toast-sticky-bar-height"),
      ),
    };
  });
}
for (const width of [320, 390, 1280])
  for (const dir of ["ltr", "rtl"]) {
    it(`${width} ${dir}: phone destinations never cover main; desktop omits them`, async () => {
      const page = await fixture.open(`?dir=${dir}`, { width, height: 844 });
      try {
        const bar = page.getByRole("navigation", { name: "Destinations" });
        if (width === 1280) {
          await expect.poll(() => bar.count()).toBe(0);
          return;
        }
        await bar.waitFor({ timeout: 1500 });
        expect(await bar.locator('[aria-current="page"]').textContent()).toBe("Home");
        const g = await geometry(page);
        expect(g.width).toBe(width);
        expect(g.height).toBeGreaterThanOrEqual(44);
        expect(g.barBottom).toBe(844);
        expect(g.mainBottom).toBeLessThanOrEqual(g.barTop);
        expect(g.published).toBe(g.height);
        const links = bar.getByRole("link");
        expect(await links.first().evaluate((el) => el.getBoundingClientRect().height)).toBe(
          g.height,
        );
        await links.nth(0).focus();
        await page.keyboard.press("Tab");
        expect(await links.nth(1).evaluate((el) => el === document.activeElement)).toBe(true);
        await page.keyboard.press("Enter");
        expect(new URL(page.url()).hash).toBe("#work");
        await page
          .locator(".app-root")
          .evaluate((el) =>
            (el as HTMLElement).style.setProperty("--mobile-shell-safe-inset-block-end", "20px"),
          );
        await expect.poll(async () => (await geometry(page)).height).toBe(g.height + 20);
        await expect
          .poll(async () => {
            const g = await geometry(page);
            return g.mainBottom <= g.barTop;
          })
          .toBe(true);
        await page.emulateMedia({ media: "print" });
        expect(await bar.isVisible()).toBe(false);
        expect(await page.locator(".app-footer").isVisible()).toBe(false);
      } finally {
        await page.close();
      }
    });
  }
it("omits absent tabs and opts out with responsiveNavigation=none", async () => {
  for (const query of ["?empty", "?mode=none"]) {
    const page = await fixture.open(query, { width: 390, height: 844 });
    try {
      expect(await page.locator(".ui-mobile-shell-tabbar").count()).toBe(0);
    } finally {
      await page.close();
    }
  }
});
it("resizes across the drawer boundary and stacks inside an external dock inset", async () => {
  const page = await fixture.open("", { width: 390, height: 844 });
  try {
    const bar = page.getByRole("navigation", { name: "Destinations" });
    await bar.waitFor();
    await page.locator(".app-root").evaluate((el) => {
      const style = (el as HTMLElement).style;
      style.setProperty("--app-shell-viewport-inset", "40px");
      style.setProperty("--mobile-shell-tab-bar-height", "80px");
      style.setProperty("--mobile-shell-tab-bar-background", "rgb(20, 30, 40)");
      style.setProperty("--mobile-shell-tab-bar-border", "3px solid rgb(60, 70, 80)");
      style.setProperty("--mobile-shell-tab-bar-active-color", "rgb(20, 30, 40)");
      style.setProperty("--mobile-shell-tab-bar-active-background", "rgb(200, 220, 240)");
    });
    await expect.poll(async () => (await geometry(page)).height).toBe(80);
    expect((await geometry(page)).barBottom).toBe(804);
    expect(await bar.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      "rgb(20, 30, 40)",
    );
    expect(await bar.evaluate((el) => getComputedStyle(el).borderBlockStartWidth)).toBe("3px");
    const current = bar.locator('[aria-current="page"]');
    await expect
      .poll(() => current.evaluate((el) => getComputedStyle(el).color))
      .toBe("rgb(20, 30, 40)");
    await expect
      .poll(() => current.evaluate((el) => getComputedStyle(el).backgroundColor))
      .toBe("rgb(200, 220, 240)");
    await page.setViewportSize({ width: 901, height: 844 });
    await expect.poll(() => bar.count()).toBe(0);
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.documentElement.style.getPropertyValue("--toast-sticky-bar-height"),
        ),
      )
      .toBe("");
    await page.setViewportSize({ width: 900, height: 844 });
    await bar.waitFor();
    await expect.poll(async () => (await geometry(page)).published).toBe(80);
    await page.emulateMedia({ media: "print" });
    expect(
      await page.locator(".app-root").evaluate((el) => getComputedStyle(el).paddingBlockEnd),
    ).toBe("0px");
  } finally {
    await page.close();
  }
});

for (const width of [320, 390, 1280])
  for (const dir of ["ltr", "rtl"]) {
    it(`${width} ${dir}: footer shares the page keyline and only phone tabs persist`, async () => {
      const page = await fixture.open(`?dir=${dir}`, { width, height: 844 });
      try {
        if (width < 900) await page.locator(".app-mobile-tab-bar").waitFor();
        const measure = () =>
          page.evaluate(() => {
            const main = document.querySelector(".app-main")!;
            const footer = document.querySelector(".app-footer")!;
            const text = document.querySelector("[data-footer-text]")!;
            const title = document.querySelector("h1")!;
            const start = (el: Element) => {
              const r = el.getBoundingClientRect();
              return getComputedStyle(el).direction === "rtl" ? innerWidth - r.right : r.left;
            };
            return {
              inside: footer.parentElement === main,
              footerStart: start(text),
              pageStart: start(title),
              footerTop: footer.getBoundingClientRect().top,
              footerBottom: footer.getBoundingClientRect().bottom,
              mainBottom: main.getBoundingClientRect().bottom,
            };
          });
        const top = await measure();
        expect(top.footerStart).toBe(top.pageStart);
        expect(top.inside).toBe(width < 900);
        if (width < 900) {
          expect(top.footerTop).toBeGreaterThan(top.mainBottom);
          await page.locator(".app-main").evaluate((el) => {
            el.scrollTop = el.scrollHeight;
          });
          const end = await measure();
          expect(end.footerBottom).toBeLessThanOrEqual(end.mainBottom);
          expect(end.footerTop).toBeLessThan(top.footerTop);
        }
      } finally {
        await page.close();
      }
    });
  }
