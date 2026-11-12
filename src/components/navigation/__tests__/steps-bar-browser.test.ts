import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * Steps `type="bar"` in Chromium against the real stylesheet: equal segments with a gap, the
 * title under its segment, finished + current segments filled and waiting ones empty, the fill
 * growing from the inline start (flipped in RTL), and a cross-fade instead of the scale under
 * prefers-reduced-motion.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Steps } from "./src/components/navigation/steps";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready" style={{ width: 400 }}>
    <Steps type="bar" value={1} items={[{ title: "Code" }, { title: "Confirm" }, { title: "Done" }]} />
  </div></AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

const read = () => {
  const items = [...document.querySelectorAll<HTMLElement>(".ui-steps-bar-item")];
  return items.map((li) => {
    const seg = li.querySelector<HTMLElement>(".ui-steps-bar-segment")!;
    const title = li.querySelector<HTMLElement>(".ui-steps-bar-title")!;
    const after = getComputedStyle(seg, "::after");
    const s = seg.getBoundingClientRect();
    return {
      status: li.dataset.status,
      left: s.left,
      right: s.right,
      width: s.width,
      height: s.height,
      titleTop: title.getBoundingClientRect().top - s.bottom,
      titleLeft: title.getBoundingClientRect().left - s.left,
      transform: after.transform,
      opacity: after.opacity,
      origin: after.transformOrigin,
      weight: getComputedStyle(title).fontWeight,
    };
  });
};

describe('Steps type="bar"', { timeout: 60_000 }, () => {
  it("lays out equal 4px segments 6px apart with the title under each", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    const m = await page.evaluate(read);
    await page.close();
    expect(m).toHaveLength(3);
    expect(Math.abs(m[0]!.width - m[2]!.width)).toBeLessThanOrEqual(1);
    expect(m[0]!.height).toBeCloseTo(4, 0);
    expect(m[1]!.left - m[0]!.right).toBeCloseTo(6, 0);
    for (const item of m) {
      expect(item.titleTop).toBeGreaterThanOrEqual(5);
      expect(Math.abs(item.titleLeft)).toBeLessThanOrEqual(1);
    }
    expect(m[1]!.weight).toBe("500");
  });

  it("fills finished + current segments and leaves waiting ones empty, from the inline start", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    await page.waitForTimeout(500);
    const m = await page.evaluate(read);
    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
    });
    const rtl = await page.evaluate(read);
    await page.close();
    expect(m[0]!.transform).toBe("none");
    expect(m[1]!.transform).toBe("none");
    expect(m[2]!.transform).toMatch(/^matrix\(0, 0, 0, 1/);
    expect(m[2]!.origin.startsWith("0px")).toBe(true);
    expect(rtl[2]!.origin.startsWith("0px")).toBe(false);
  });

  it("cross-fades instead of scaling under prefers-reduced-motion", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(400);
    const m = await page.evaluate(read);
    await page.close();
    expect(m[2]!.transform).toBe("none");
    expect(m[2]!.opacity).toBe("0");
    expect(m[1]!.opacity).toBe("1");
  });
});
