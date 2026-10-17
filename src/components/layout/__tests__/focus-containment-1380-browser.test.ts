import { afterAll, beforeAll, expect, it } from "vitest";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";
// @ts-expect-error Shared JavaScript browser measurement.
import { measureFocus } from "../../../../scripts/focus-ring-audit-1375.mjs";

type FocusMeasurement = {
  brand: boolean;
  clipped: unknown[];
  textOverlap: unknown[];
  filledContrastFailure: boolean;
};
const measure = measureFocus as () => FocusMeasurement;

let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(`
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './src/app/app-provider';
import { Button } from './src/components/general/button';
import { Topbar } from './src/components/layout/topbar';
import { Anchor } from './src/lab/anchor';
createRoot(document.getElementById('root')).render(<AppProvider defaultLocale="en" persist={false}>
<Topbar start={<Button>Start</Button>} end={<Button>End</Button>}/>
<Anchor direction="horizontal" affix={false} items={[{key:'one',href:'#one',title:'Introduction'},{key:'two',href:'#two',title:'Details'}]}/>
</AppProvider>);
`);
});
afterAll(async () => fixture?.close());
it("measures the real inner gap, rejecting the old backing that ends at the ring", async () => {
  const page = await fixture.open("");
  try {
    await page.keyboard.press("Tab");
    const button = page.locator(".ui-button").first();
    await button.evaluate((el) => el.setAttribute("data-focus-contained", ""));
    const good = await page.evaluate(measure);
    expect(good.brand).toBe(true);
    expect(good.clipped).toEqual([]);
    expect(good.textOverlap).toEqual([]);
    expect(good.filledContrastFailure).toBe(false);
    await button.evaluate((el) => el.style.setProperty("--focus-ring-contained-offset", "-4px"));
    expect((await page.evaluate(measure)).filledContrastFailure).toBe(true);
  } finally {
    await page.close();
  }
});
it("checks inset block strokes against text and honours the focus switch", async () => {
  const page = await fixture.open("");
  try {
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => document.activeElement?.matches('[data-slot="anchor-link"]')),
    ).toBe(true);
    const good = await page.evaluate(measure);
    expect(good.brand).toBe(true);
    expect(good.clipped).toEqual([]);
    expect(good.textOverlap).toEqual([]);
    await page
      .locator('[data-slot="anchor-link"]')
      .first()
      .evaluate((el) => (el as HTMLElement).style.setProperty("--focus-ring-width", "12px"));
    expect((await page.evaluate(measure)).textOverlap.length).toBeGreaterThan(0);
    await page
      .locator('[data-slot="anchor-link"]')
      .first()
      .evaluate((el) => (el as HTMLElement).style.removeProperty("--focus-ring-width"));
    await page.evaluate(() => (document.documentElement.dataset.focusOutline = "off"));
    expect((await page.evaluate(measure)).brand).toBe(false);
  } finally {
    await page.close();
  }
});
