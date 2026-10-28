import { afterAll, beforeAll, expect, it } from "vitest";
import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

// gh#1510 — inside a scroll box that is also the fixed containing block (AppShell's `.app-main`:
// `overflow: auto` + `contain: paint`), a pinned rail must not move or change height while the
// page scrolls. A `position: fixed` box there rides the scroll and is put back a frame late.
const entry = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Affix } from './src/components/layout/affix';
const rows = Array.from({ length: 60 }, (_, i) => <div key={i} style={{ blockSize: 40 }}>item {i + 1}</div>);
function App() {
  const ref = React.useRef(null);
  return <main ref={ref} id="scroller" style={{ blockSize: 800, overflow: 'auto', contain: 'paint' }}>
    <div style={{ blockSize: 100 }}>head</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px' }}>
      <div style={{ blockSize: 8000 }}>body</div>
      <div><Affix offsetBlockStart={16} target={() => ref.current}><div id="rail">{rows}</div></Affix></div>
    </div>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
`;
let current: ChromiumFixture;
beforeAll(async () => {
  current = await bootChromium(entry);
}, 180000);
afterAll(async () => {
  await current?.close();
});

it("keeps a rail pinned in a paint-contained scroller still, frame by frame, while the wheel scrolls", async () => {
  const page = await current.open("", { width: 1280, height: 900 });
  try {
    await page.locator("#rail").waitFor();
    await page.evaluate(() => {
      document.getElementById("scroller")!.scrollTop = 1000;
    });
    await page.locator('[data-slot="affix"][data-affixed]').waitFor();
    // Sample every frame while real wheel input scrolls the box.
    await page.evaluate(() => {
      const w = window as unknown as { samples: number[][]; sampling: boolean };
      const box = document.querySelector('[data-slot="affix-content"]')!;
      w.samples = [];
      w.sampling = true;
      const tick = () => {
        const r = box.getBoundingClientRect();
        w.samples.push([r.top, box.clientHeight]);
        if (w.sampling) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.mouse.move(400, 400);
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(16);
    }
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const w = window as unknown as { samples: number[][]; sampling: boolean };
      w.sampling = false;
      const scroller = document.getElementById("scroller")!;
      const box = document.querySelector('[data-slot="affix-content"]')!;
      const tops = w.samples.map((s) => s[0]);
      const heights = w.samples.map((s) => s[1]);
      return {
        frames: w.samples.length,
        scrolled: scroller.scrollTop,
        top: [Math.min(...tops), Math.max(...tops)],
        height: [Math.min(...heights), Math.max(...heights)],
        scrollerTop: scroller.getBoundingClientRect().top,
        clamped: box.hasAttribute("data-clamped"),
        scrolls: box.scrollHeight > box.clientHeight,
      };
    });
    expect(m.scrolled).toBeGreaterThan(2000);
    expect(m.frames).toBeGreaterThan(10);
    // Pinned 16px below the scroller's top edge in EVERY frame, and never resized.
    expect(m.top[0]).toBeCloseTo(m.scrollerTop + 16, 0);
    expect(m.top[1]).toBeCloseTo(m.scrollerTop + 16, 0);
    expect(m.height[0]).toBe(m.height[1]);
    // Still held to the room in the 800px scroller (800 - 16) and scrollable.
    expect(m.height[0]).toBe(784);
    expect(m.clamped).toBe(true);
    expect(m.scrolls).toBe(true);
  } finally {
    await page.close();
  }
});
