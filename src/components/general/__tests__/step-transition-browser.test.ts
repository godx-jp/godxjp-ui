import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * StepTransition in Chromium against the real stylesheet. Each animation is paused and sampled at
 * its edge: forward, the outgoing step ends 24px toward the inline START at opacity 0 and the
 * incoming one starts 24px toward the inline END; backward mirrors; RTL flips; reduced motion is a
 * pure cross-fade with no travel. Both layers share one grid cell (same top). No AppProvider: it
 * re-mounts its subtree once the locale loads, which would reset the transition under test.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { StepTransition } from "./src/components/general/step-transition";
function App() {
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState("forward");
  // flushSync: an update from outside a React event would otherwise commit on a later task, after
  // the sampling frame.
  window.__go = (s, d) => flushSync(() => { setDir(d); setStep(s); });
  return (
    <StepTransition value={step} direction={dir}>
      <div style={{ height: 40 + step * 20 }}>Step {step}</div>
    </StepTransition>
  );
}
createRoot(document.getElementById("root")).render(
  <div id="ready" style={{ width: 400 }}><App /></div>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

const sample = async (page: import("playwright").Page, step: number, dir: string) =>
  page.evaluate(
    ([s, d]) =>
      new Promise<Record<string, unknown>>((resolve) => {
        (window as unknown as { __go: (s: number, d: string) => void }).__go(
          s as number,
          d as string,
        );
        requestAnimationFrame(() => {
          try {
            const out = document.querySelector<HTMLElement>('[data-state="exit"]')!;
            const inn = document.querySelector<HTMLElement>('[data-state="enter"]')!;
            const tx = (el: HTMLElement) => new DOMMatrix(getComputedStyle(el).transform).m41;
            const [a] = out.getAnimations();
            const [b] = inn.getAnimations();
            a!.pause();
            b!.pause();
            a!.currentTime = (a!.effect!.getComputedTiming().duration as number) - 0.01;
            b!.currentTime = 0;
            resolve({
              outName: (a as CSSAnimation).animationName,
              inName: (b as CSSAnimation).animationName,
              outX: tx(out),
              outOpacity: Number(getComputedStyle(out).opacity),
              inX: tx(inn),
              inOpacity: Number(getComputedStyle(inn).opacity),
              sameTop: out.getBoundingClientRect().top === inn.getBoundingClientRect().top,
            });
          } catch (error) {
            resolve({
              error: String(error),
              layers: [...document.querySelectorAll("[data-slot='step-transition-layer']")].map(
                (e) => `${e.getAttribute("data-state")}:${e.getAnimations().length}`,
              ),
            });
          }
        });
      }),
    [step, dir],
  );

describe("StepTransition", { timeout: 60_000 }, () => {
  it("forward: out toward start, in from end; backward mirrors; one grid cell", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    const fwd = await sample(page, 1, "forward");
    // Resume: the outgoing layer is removed on its own animationend.
    await page.evaluate(() => document.getAnimations().forEach((a) => a.play()));
    await page.waitForTimeout(600);
    const remaining = await page.evaluate(
      () => document.querySelectorAll('[data-slot="step-transition-layer"]').length,
    );
    expect(remaining).toBe(1);
    const back = await sample(page, 0, "backward");
    await page.close();
    expect(back.error, JSON.stringify(back)).toBeUndefined();
    expect(fwd.outName, JSON.stringify(fwd)).toBe("ui-step-out");
    expect(fwd.outX as number).toBeCloseTo(-24, 0);
    expect(fwd.outOpacity as number).toBeLessThan(0.05);
    expect(fwd.inX as number).toBeCloseTo(24, 0);
    expect(fwd.inOpacity as number).toBe(0);
    expect(fwd.sameTop).toBe(true);
    expect(back.outX as number).toBeCloseTo(24, 0);
    expect(back.inX as number).toBeCloseTo(-24, 0);
  });

  it("flips under dir=rtl", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
    });
    const m = await sample(page, 1, "forward");
    await page.close();
    expect(m.outX as number).toBeCloseTo(24, 0);
    expect(m.inX as number).toBeCloseTo(-24, 0);
  });

  it("cross-fades with no travel under prefers-reduced-motion", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const m = await sample(page, 1, "forward");
    await page.close();
    expect(m.outName).toBe("ui-step-fade-out");
    expect(m.inName).toBe("ui-step-fade-in");
    expect(m.outX).toBe(0);
    expect(m.inX).toBe(0);
    expect(m.inOpacity as number).toBe(0);
  });
});
