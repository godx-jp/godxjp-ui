import { describe, expect, it } from "vitest";

import { marqueeRevealTime } from "../marquee-reveal";

/**
 * A FOCUSED MARQUEE ITEM IS BROUGHT INTO VIEW BY SEEKING THE LAP (gh#983).
 *
 * The track travels by transform, so an item that has left on the inline-start side is in negative
 * overflow, which no scroll reaches. Measured in Chromium on `/frame/data-display-marquee`, tabbing
 * through the tracks: LTR 8/18 focused links not fully visible at 375px (one at -149..-65 against a
 * 75..1321 viewport at 1440px), RTL 10/18 at 320px — and 0 at every width, both directions, Tab and
 * Shift+Tab, after this. jsdom has no layout or animation, so the pixels were measured there; this
 * file pins the arithmetic that got them wrong twice while the fix was written.
 *
 * Geometry used throughout: a 1246px viewport at 75..1321, one copy (lap) 837px, a 13440ms lap.
 */
const box = { start: 75, end: 1321 };
const duration = 13440;
const lap = 837;
const LTR_STEP = -lap / 100; // travelling towards the inline start: moves left as time advances
const RTL_STEP = lap / 100;
const pxPerMs = lap / duration;

/** Where an item that was at `item` sits after the animation moves from `time` to `next`. */
const moved = (item: { start: number; end: number }, time: number, next: number, sign: number) => {
  const d = sign * pxPerMs * (next - time);
  return { start: item.start + d, end: item.end + d };
};
const inside = (s: { start: number; end: number }) =>
  s.start >= box.start - 1 && s.end <= box.end + 1;

describe("marqueeRevealTime (gh#983)", () => {
  it("does nothing for an item already fully visible — tabbing across the strip never jolts it", () => {
    expect(
      marqueeRevealTime({
        item: { start: 400, end: 500 },
        box,
        time: 5000,
        duration,
        lap,
        step: LTR_STEP,
      }),
    ).toBeNull();
  });

  it("brings back the measured item that travelled off the inline start (the unscrollable side)", () => {
    const item = { start: -149, end: -65 };
    const time = 5000;
    const next = marqueeRevealTime({ item, box, time, duration, lap, step: LTR_STEP })!;
    expect(next).not.toBeNull();
    expect(inside(moved(item, time, next, -1))).toBe(true);
  });

  it("centres the item when this iteration can reach the centre — clear of the fade mask", () => {
    const item = { start: 30, end: 114 };
    const time = 12000;
    const next = marqueeRevealTime({ item, box, time, duration, lap, step: LTR_STEP })!;
    const after = moved(item, time, next, -1);
    expect((after.start + after.end) / 2).toBeCloseTo((box.start + box.end) / 2, 5);
  });

  it("NEVER wraps into another lap — the focusable item lives only in the first copy", () => {
    // The first attempt wrapped modulo the lap and parked every item at exactly centre − lap.
    const item = { start: 1400, end: 1484 }; // needs to travel left by more than time allows forward…
    const time = 13000; // …near the end of the iteration
    const next = marqueeRevealTime({ item, box, time, duration, lap, step: LTR_STEP })!;
    const iteration = Math.floor(time / duration) * duration;
    expect(next).toBeGreaterThanOrEqual(iteration);
    expect(next).toBeLessThanOrEqual(iteration + duration);
  });

  it("stays in the CURRENT iteration after many laps, not the first", () => {
    const item = { start: -149, end: -65 };
    const time = 7 * duration + 5000;
    const next = marqueeRevealTime({ item, box, time, duration, lap, step: LTR_STEP })!;
    expect(Math.floor(next / duration)).toBe(7);
    expect(inside(moved(item, time, next, -1))).toBe(true);
  });

  it("settles for fully visible when the centre is out of this iteration's reach", () => {
    // At local time 0 the item can only move towards the start; a centre further the other way is
    // unreachable, so it lands at the nearest fully visible position instead of off-screen.
    const item = { start: 20, end: 104 };
    const next = marqueeRevealTime({ item, box, time: 30, duration, lap, step: RTL_STEP })!;
    const after = moved(item, 30, next, 1);
    expect(inside(after)).toBe(true);
  });

  it("reads the direction from the measured step — RTL and direction=end need no case of their own", () => {
    const item = { start: 1400, end: 1484 }; // past the inline-START edge in RTL
    const time = 5000;
    const next = marqueeRevealTime({ item, box, time, duration, lap, step: RTL_STEP })!;
    expect(inside(moved(item, time, next, 1))).toBe(true);
  });

  it("a probe that crossed the iteration boundary (a jump of ~a lap the other way) is read correctly", () => {
    const item = { start: -149, end: -65 };
    const time = 5000;
    const wrapped = lap - lap / 100; // LTR travel, but the probe landed in the next iteration
    const next = marqueeRevealTime({ item, box, time, duration, lap, step: wrapped })!;
    expect(inside(moved(item, time, next, -1))).toBe(true);
  });

  it("a zero step, zero lap or zero duration is no answer rather than a wrong one", () => {
    const item = { start: -149, end: -65 };
    for (const bad of [{ step: 0 }, { lap: 0 }, { duration: 0 }]) {
      expect(
        marqueeRevealTime({ item, box, time: 5000, duration, lap, step: LTR_STEP, ...bad }),
      ).toBeNull();
    }
  });
});
