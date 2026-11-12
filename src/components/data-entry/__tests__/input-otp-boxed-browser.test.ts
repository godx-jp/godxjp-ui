import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * InputOTPGroup `appearance="boxed"` in Chromium, against the real stylesheet: each slot is its
 * own rounded box (all four corners, all four edges) with a gap between them; md is the 40x52
 * device-code box, lg the 48x58 two-factor box; `mono` sets the mono face; the
 * device-authorization preset, which retunes the joined/grouped slot chain, does not shrink a
 * boxed field; an invalid field runs the reject shake, and does not under reduced motion.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "./src/components/data-entry/input-otp";
import { CenteredShell } from "./src/components/layout/centered-shell";
const Field = ({ id, groups, size, status, mono }) => {
  let i = 0;
  return (
    <div id={id}>
      <InputOTP maxLength={groups.reduce((a, b) => a + b, 0)} size={size} status={status} mono={mono}
        defaultValue="LTZW" aria-label={id}>
        {groups.map((n, g) => (
          <React.Fragment key={g}>
            {g > 0 ? <InputOTPSeparator /> : null}
            <InputOTPGroup appearance="boxed">
              {Array.from({ length: n }, () => <InputOTPSlot key={i} index={i++} />)}
            </InputOTPGroup>
          </React.Fragment>
        ))}
      </InputOTP>
    </div>
  );
};
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready">
    <Field id="device" groups={[4, 4]} mono />
    <Field id="twofa" groups={[3, 3]} size="lg" />
    <Field id="invalid" groups={[3, 3]} size="lg" status="error" />
    <div id="phone" style={{ width: 358, marginInline: 16 }}>
      <Field id="narrow" groups={[4, 4]} mono />
    </div>
    <CenteredShell variant="auth-canonical" preset="device-authorization">
      <Field id="preset" groups={[4, 4]} mono />
    </CenteredShell>
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

const measure = (id: string) => {
  const root = document.getElementById(id)!;
  const slots = [...root.querySelectorAll<HTMLElement>('[data-slot="input-otp-slot"]')];
  const rects = slots.map((s) => s.getBoundingClientRect());
  const cs = slots.map((s) => getComputedStyle(s));
  return {
    count: slots.length,
    w: rects[0]!.width,
    h: rects[0]!.height,
    gap: rects[1]!.left - rects[0]!.right,
    radii: cs.map((c) => [c.borderTopLeftRadius, c.borderBottomRightRadius]),
    startEdges: cs.map((c) => c.borderLeftWidth),
    font: cs[0]!.fontFamily,
    size: cs[0]!.fontSize,
    animation: getComputedStyle(root.querySelector(".ui-otp-container")!).animationName,
  };
};

describe('InputOTPGroup appearance="boxed"', { timeout: 60_000 }, () => {
  it("draws 40x52 separate rounded boxes 6px apart, mono, for a 4+4 device code", async () => {
    const page = await fixture.open("", { width: 1280, height: 900 });
    const m = await page.evaluate(measure, "device");
    await page.close();
    expect(m.count).toBe(8);
    expect(m.w).toBeCloseTo(40, 0);
    expect(m.h).toBeCloseTo(52, 0);
    expect(m.gap).toBeCloseTo(6, 0);
    for (const [start, end] of m.radii) {
      expect(parseFloat(start!)).toBeGreaterThan(0);
      expect(parseFloat(end!)).toBeGreaterThan(0);
    }
    // Every box has its own start edge — not the joined strip's collapsed one.
    for (const edge of m.startEdges) expect(parseFloat(edge)).toBeGreaterThan(0);
    expect(m.font).toMatch(/mono/i);
    expect(m.size).toBe("24px");
  });

  it("takes the 48x58 two-factor step at size=lg and keeps the body face without mono", async () => {
    const page = await fixture.open("", { width: 1280, height: 900 });
    const m = await page.evaluate(measure, "twofa");
    await page.close();
    expect(m.count).toBe(6);
    expect(m.w).toBeCloseTo(48, 0);
    expect(m.h).toBeCloseTo(58, 0);
    expect(m.size).toBe("26px");
    expect(m.font).not.toMatch(/mono/i);
  });

  it("is not shrunk by the device-authorization preset", async () => {
    const page = await fixture.open("", { width: 1280, height: 900 });
    const m = await page.evaluate(measure, "preset");
    await page.close();
    // The preset's --otp-slot-inline-size (27.5px) does not reach it; at most the row gives way a
    // pixel or two to fit the 380px card.
    expect(m.w).toBeGreaterThan(36);
    expect(m.h).toBeCloseTo(52, 0);
  });

  it("shakes once when invalid, and not under prefers-reduced-motion", async () => {
    const page = await fixture.open("", { width: 1280, height: 900 });
    const moving = await page.evaluate(measure, "invalid");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const still = await page.evaluate(measure, "invalid");
    const valid = await page.evaluate(measure, "twofa");
    await page.close();
    expect(moving.animation).toBe("ui-otp-reject");
    expect(still.animation).toBe("none");
    expect(valid.animation).toBe("none");
  });

  it("fits a 4+4 code into a 358px phone column without page overflow", async () => {
    const page = await fixture.open("", { width: 390, height: 844 });
    const m = await page.evaluate(() => {
      const col = document.getElementById("phone")!.getBoundingClientRect();
      const slots = [...document.querySelectorAll('#narrow [data-slot="input-otp-slot"]')].map(
        (s) => s.getBoundingClientRect(),
      );
      return {
        right: Math.max(...slots.map((r) => r.right)),
        colRight: col.right,
        w: slots[0]!.width,
        h: slots[0]!.height,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    await page.close();
    expect(m.right).toBeLessThanOrEqual(m.colRight + 0.5);
    expect(m.w).toBeGreaterThanOrEqual(28);
    expect(m.w).toBeLessThan(40);
    expect(m.h).toBeCloseTo(52, 0);
    expect(m.overflow).toBe(0);
  });

  it("clips input-otp's password-manager widening so the page does not scroll sideways", async () => {
    const page = await fixture.open("", { width: 390, height: 844 });
    const overflow = await page.evaluate(() => {
      // What input-otp does when it pushes a password-manager badge: the hidden input grows 40px.
      const input = document.querySelector<HTMLInputElement>("#narrow input")!;
      input.style.width = "calc(100% + 40px)";
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    await page.close();
    expect(overflow).toBe(0);
  });
});
