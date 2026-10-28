import { afterAll, beforeAll, expect, it } from "vitest";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

// gh#1510 — a pinned box taller than the visible scrollport must stay reachable: held to the room
// below its pin line and scrollable on its own. A short pinned box must stay unclamped.
const entry = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Affix } from './src/components/layout/affix';
const rows = (n, id) => Array.from({ length: n }, (_, i) => <div key={i} style={{ blockSize: 40 }}>{id} {i + 1}</div>);
const tall = new URLSearchParams(location.search).get('rows') !== 'short';
createRoot(document.getElementById('root')).render(<div>
  <div style={{ blockSize: 100 }}>head</div>
  <Affix offsetBlockStart={16}><div id="rail">{rows(tall ? 60 : 3, 'item')}</div></Affix>
  <div style={{ blockSize: 6000 }}>body</div>
</div>);
`;
let current: ChromiumFixture;
beforeAll(async () => {
  current = await bootChromium(entry);
}, 180000);
afterAll(async () => {
  await current?.close();
});

it("holds a tall pinned box to the viewport and lets it scroll to its last item", async () => {
  const page = await current.open("", { width: 1280, height: 800 });
  try {
    await page.locator("#rail").waitFor();
    await page.evaluate(() => window.scrollTo(0, 1500));
    const content = page.locator('[data-slot="affix-content"]');
    await content.and(page.locator("[data-clamped]")).waitFor();
    const m = await content.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const placeholder = document.querySelector('[data-slot="affix-placeholder"]')!;
      return {
        top: r.top,
        bottom: r.bottom,
        scrolls: el.scrollHeight > el.clientHeight,
        overflowY: getComputedStyle(el).overflowY,
        placeholder: placeholder.getBoundingClientRect().height,
      };
    });
    expect(m.top).toBeCloseTo(16, 0);
    expect(m.bottom).toBeLessThanOrEqual(800);
    expect(m.scrolls).toBe(true);
    expect(m.overflowY).toBe("auto");
    // The flow keeper still holds the full in-flow height (60 rows × 40px), not the clamped one.
    expect(m.placeholder).toBeCloseTo(2400, 0);

    // The wheel over the pinned box scrolls the box, and its last item comes into view.
    await page.mouse.move(100, 400);
    for (let i = 0; i < 10; i++) await page.mouse.wheel(0, 400);
    await page.waitForFunction(() => {
      const box = document.querySelector('[data-slot="affix-content"]')!;
      return box.scrollTop + box.clientHeight >= box.scrollHeight - 1;
    });
    const last = await page.locator("#rail > div").last().boundingBox();
    expect(last!.y + last!.height).toBeLessThanOrEqual(800);
  } finally {
    await page.close();
  }
});

it("leaves a pinned box that fits unclamped", async () => {
  const page = await current.open("?rows=short", { width: 1280, height: 800 });
  try {
    await page.locator("#rail").waitFor();
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.locator('[data-slot="affix-content"][data-affixed]').waitFor();
    const m = await page.locator('[data-slot="affix-content"]').evaluate((el) => ({
      clamped: el.hasAttribute("data-clamped"),
      overflowY: getComputedStyle(el).overflowY,
    }));
    expect(m).toEqual({ clamped: false, overflowY: "visible" });
  } finally {
    await page.close();
  }
});
