#!/usr/bin/env node
/**
 * check:number-input-step-target — on a coarse pointer, each NumberInput stepper is a real target.
 *
 * WCAG 2.2 SC 2.5.8 asks for 24×24 CSS px. The two steppers are STACKED inside the field, so each
 * can only ever be half its band, and the band decides whether the control conforms. Measured in
 * Chromium with Playwright touch emulation (`(pointer: coarse)` matching) before the fix:
 *
 *   default  field 44px → stepper **24×19**, centres 20px apart
 *   lg       field 48px → stepper **24×21**, centres 22px apart
 *
 * Neither clears 24×24, and neither is rescued by SC 2.5.8's Spacing exception: that needs
 * 24px-diameter circles centred on each bounding box NOT to intersect, and 20px apart they do.
 * 44px cannot be made to work — half of it is 22px whatever the inset and the gap. 48px works
 * exactly.
 *
 * WHY A BROWSER. The number is a layout outcome of a `calc()` over an inherited custom property
 * under a media query. jsdom resolves none of that, and the component's own render tests were
 * green for the whole time each stepper was 13px tall on a desktop and 19px on a phone.
 *
 * WHAT IS ASSERTED, under a COARSE pointer:
 *   1. `(pointer: coarse)` actually matches — otherwise every assertion below is about the desktop
 *      build and passes for the wrong reason (the failure mode that made a sibling gate audit the
 *      light theme twice);
 *   2. the default and `lg` steppers are at least 24×24;
 *   3. no two stacked steppers overlap — an enlarged target that eats its neighbour's is not a fix;
 * and under a FINE pointer:
 *   4. the desktop geometry is UNCHANGED (24×13 at the default band). The touch fix must not grow
 *      every desktop NumberInput; if it does, this is a redesign wearing an a11y label.
 *
 * `xs` and `sm` are measured and printed but not asserted: a consumer who asks for a smaller
 * control on a touch screen has made that trade explicitly, and the DS does not overrule the call
 * site (the same position rule #24 already takes).
 */
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

const port = Number(process.env.PREVIEW_PORT) || 6018;
const base = `http://localhost:${port}`;
const stopServer = await ensurePreviewServer(base);

/** SC 2.5.8's minimum, in CSS px. */
const MIN = 24;
/** The sizes the floor applies to. */
const ENFORCED = new Set(["md", "lg", "(default)"]);
/** The desktop geometry this fix must not disturb. */
const FINE_DEFAULT = { width: 24, height: 13 };

const failures = [];
let browser;

try {
  browser = await chromium.launch();

  for (const coarse of [true, false]) {
    const context = await browser.newContext({
      viewport: { width: 393, height: 850 },
      hasTouch: coarse,
      isMobile: coarse,
    });
    const page = await context.newPage();
    await page.goto(`${base}/isolate/data-entry-number-input`, { waitUntil: "domcontentloaded" });
    await page.locator(".ui-number-input-step").first().waitFor({ timeout: 30000 });
    await page.waitForTimeout(300);

    const measured = await page.evaluate(() => {
      const seen = new Map();
      for (const root of document.querySelectorAll(".ui-number-input")) {
        const size = root.getAttribute("data-size") ?? "(default)";
        if (seen.has(size)) continue;
        const up = root.querySelector(".ui-number-input-step-up");
        const down = root.querySelector(".ui-number-input-step-down");
        if (!up || !down) continue;
        const u = up.getBoundingClientRect();
        const d = down.getBoundingClientRect();
        seen.set(size, {
          size,
          width: +u.width.toFixed(2),
          height: +u.height.toFixed(2),
          overlap: +(u.bottom - d.top).toFixed(2),
          centres: +((d.top + d.bottom) / 2 - (u.top + u.bottom) / 2).toFixed(2),
          field: +(
            root.querySelector("[data-slot=number-input-field]")?.getBoundingClientRect().height ??
            0
          ).toFixed(2),
        });
      }
      return { coarse: matchMedia("(pointer: coarse)").matches, sizes: [...seen.values()] };
    });

    if (measured.coarse !== coarse) {
      failures.push(
        `✗ asked for pointer:coarse=${coarse} and the page reports ${measured.coarse} — the ` +
          `measurements below would be about the other build entirely.`,
      );
      await context.close();
      continue;
    }
    if (measured.sizes.length < 4) {
      failures.push(`✗ only ${measured.sizes.length} size tiers found on the frame; expected 4+.`);
    }

    console.log(`\n  pointer:coarse = ${coarse}`);
    for (const m of measured.sizes) {
      const line = `size=${m.size.padEnd(10)} stepper ${m.width}×${m.height}  centres ${m.centres}px  field ${m.field}px`;

      if (m.overlap > 0.5) {
        failures.push(`✗ ${line} — the two steppers OVERLAP by ${m.overlap}px.`);
        continue;
      }
      if (coarse && ENFORCED.has(m.size) && (m.width < MIN - 0.01 || m.height < MIN - 0.01)) {
        failures.push(
          `✗ ${line} — under WCAG 2.2 SC 2.5.8's ${MIN}×${MIN}. Two stacked steppers need a ` +
            `${MIN * 2}px band; --number-input-touch-height is the knob.`,
        );
        continue;
      }
      if (!coarse && m.size === "md") {
        const off =
          Math.abs(m.width - FINE_DEFAULT.width) > 0.5 ||
          Math.abs(m.height - FINE_DEFAULT.height) > 0.5;
        if (off) {
          failures.push(
            `✗ ${line} — the DESKTOP geometry moved (was ${FINE_DEFAULT.width}×${FINE_DEFAULT.height}). ` +
              `The touch fix is scoped to a coarse pointer on purpose.`,
          );
          continue;
        }
      }
      const note = coarse && !ENFORCED.has(m.size) ? "  (not enforced — smaller by request)" : "";
      console.log(`    ✓ ${line}${note}`);
    }
    await context.close();
  }
} finally {
  await browser?.close();
  stopServer();
}

if (failures.length) {
  console.error(`\n✗ check:number-input-step-target — ${failures.length} failure(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `\n✓ check:number-input-step-target — each stepper is ${MIN}×${MIN} on a coarse pointer.`,
);
