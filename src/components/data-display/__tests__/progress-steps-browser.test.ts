import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/** Progress `steps` against the real stylesheet: equal segments with a gap, a filled one in the fill colour, growing in; still under reduced motion. */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Progress } from "./src/components/data-display/progress";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready" style={{ width: 300 }}>
    <Progress steps={3} value={33} label="1 of 3 done" />
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
  const s = [...document.querySelectorAll<HTMLElement>(".ui-progress-step")];
  // offset* = layout box, unaffected by the grow-in transform still running on the filled one.
  return {
    widths: s.map((e) => e.offsetWidth),
    // The two EMPTY segments carry no transform, so their sub-pixel rects give the gap exactly.
    gap: s[2]!.getBoundingClientRect().left - s[1]!.getBoundingClientRect().right,
    filled: getComputedStyle(s[0]!).backgroundColor,
    empty: getComputedStyle(s[1]!).backgroundColor,
    anim: getComputedStyle(s[0]!).animationName,
  };
};

describe("Progress steps", { timeout: 60_000 }, () => {
  it("lays out equal segments, fills the first, grows it in", async () => {
    const page = await fixture.open("", { width: 800, height: 400 });
    const m = await page.evaluate(read);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const still = await page.evaluate(read);
    await page.close();
    expect(Math.max(...m.widths) - Math.min(...m.widths)).toBeLessThanOrEqual(1);
    expect(m.gap).toBeCloseTo(4, 0);
    expect(m.filled).not.toBe(m.empty);
    expect(m.anim).toBe("ui-progress-step-fill");
    expect(still.anim).toBe("none");
  });
});
