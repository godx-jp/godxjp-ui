import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chromium } from "playwright";

import { anchorIndex } from "../../../test/css-selector";
import { contrast, hsl, hslToRgb, NON_TEXT } from "@/tokens/__tests__/wcag-contrast";

/**
 * gh#843 — "chọn thì đéo thấy có thay đổi gì": the selected option was invisible.
 *
 * The reporter measured the slab at `rgb(253,253,252)` on a `rgb(244,243,240)` track. That is
 * **1.09:1**, against the 3:1 WCAG 2.2 SC 1.4.11 sets for a non-text indicator of state.
 *
 * TWO THINGS THIS FILE HAS TO KEEP HONEST, because the first pass at the issue got one of them
 * wrong:
 *
 *  1. A FONT WEIGHT IS NOT A FIX FOR A NON-TEXT CONTRAST FAILURE. 500-on-selected is a real and
 *     useful second signal — it works on any canvas — but SC 1.4.11 is about the indicator, and
 *     the indicator here is the slab. Both assertions live below and neither substitutes for the
 *     other.
 *  2. THE DARK AXIS IS A DIFFERENT MEASUREMENT, NOT THE SAME ONE TWICE. A probe of the published
 *     showcase reported the SAME two colours under `?theme=dark` — not because the tokens sit
 *     still, but because `preview/src/showcase-main.tsx` never read the query string, so the page
 *     rendered light both times (fixed alongside this, mirroring isolate-main.tsx). The dark
 *     numbers below are genuinely different: slab rgb(25,24,21) on track rgb(49,47,43) = 1.33:1.
 *     `describe.each` over a selector, never one theme measured twice.
 */

/** What the reporter measured, and what the palette still computes for the fill pair. */
const FILL_ON_TRACK = { light: 1.09, dark: 1.33 } as const;

const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const segmentedTokens = readFileSync(
  join(process.cwd(), "src/tokens/components/segmented.css"),
  "utf8",
);
const controlStyles = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8");

function themeBlock(selector: string): string {
  const start = anchorIndex(foundation, selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = foundation.indexOf("{", start);
  return foundation.slice(open + 1, foundation.indexOf("\n}", open));
}

const THEMES = [
  { name: "light", selector: ":root {", dark: false },
  { name: "dark", selector: '.dark, :root[data-theme="dark"] {', dark: true },
] as const;

/** Exactly the files the preview loads for a Segmented, in load order. */
function browserStylesheet(): string {
  return [
    "src/tokens/foundation.css",
    "src/tokens/derived.css",
    "src/tokens/axes.css",
    "src/tokens/components/control.css",
    "src/tokens/components/segmented.css",
    "src/styles/control.css",
  ]
    .map((path) => readFileSync(join(process.cwd(), path), "utf8"))
    .join("\n");
}

describe.each(THEMES)("Segmented selected state — token maths ($name)", ({ name, selector }) => {
  const body = themeBlock(selector);
  const track = hslToRgb(hsl(body, "muted")); // --segmented-track-background
  const slab = hslToRgb(hsl(body, "background")); // --segmented-item-selected-background
  const ring = hslToRgb(hsl(body, "input")); // --segmented-item-selected-border-color default

  it(`reproduces the reported failure — fill vs track is ${FILL_ON_TRACK[name]}:1, under 3:1`, () => {
    // This is the number in the issue. It is asserted, not commented, so that anyone who later
    // re-seeds --muted or --background finds out here whether the premise still holds.
    expect(contrast(slab, track)).toBeCloseTo(FILL_ON_TRACK[name], 2);
    expect(contrast(slab, track)).toBeLessThan(NON_TEXT);
  });

  it("the ring clears 3:1 against the TRACK it sits on", () => {
    expect(contrast(ring, track)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("the ring clears 3:1 against the SLAB it encloses", () => {
    // Both neighbours, because an indicator that vanishes into the thing it outlines is not an
    // indicator. `inset` puts the slab on one side of the hairline and the track on the other.
    expect(contrast(ring, slab)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("the ring is a bigger signal than the fill it rescues", () => {
    expect(contrast(ring, track)).toBeGreaterThan(contrast(slab, track));
  });
});

describe("Segmented selected state — the stylesheet actually asks for it (gh#843)", () => {
  it("paints the ring inset, beside the elevation, from the token", () => {
    const rule = controlStyles.slice(
      anchorIndex(controlStyles, '.ui-segmented-item[data-state="checked"] {'),
    );
    const body = rule.slice(rule.indexOf("{") + 1, rule.indexOf("}"));
    // The chain, not the bare token: gh#880 made the knob `initial` so a scope that restates the
    // elevation ramp can reach the selected slab, which puts the ramp default at this call site.
    expect(body).toMatch(
      /box-shadow:[\s\S]*var\(--segmented-item-selected-shadow,\s*var\(--shadow-md\)\)/,
    );
    expect(body).toMatch(
      /inset 0 0 0 1px hsl\(var\(--segmented-item-selected-border-color,\s*var\(--input\)\)\)/,
    );
    expect(body).toMatch(/font-weight:\s*var\(--segmented-item-selected-font-weight\)/);
  });

  it("declares the ring knob `initial` so a scoped theme is not frozen at the root's value", () => {
    // docs/TOKENS.md · "Role-mirror knobs MUST be `initial` + a call-site fallback". Binding it to
    // var(--input) at :root would substitute once on <html>; a [data-tenant] or a dark REGION
    // would move --input and keep the light ring.
    expect(segmentedTokens).toMatch(/--segmented-item-selected-border-color:\s*initial;/);
  });
});

describe("The probe that measured the same thing twice (gh#843)", () => {
  // Not a Segmented assertion — an assertion about the instrument. The issue asks for the dark
  // axis to be checked, and the first attempt reported light-theme colours for both runs. The
  // cause was here: /showcase/** was the one preview entry point that never read `?theme`, so a
  // dark route silently re-measured the light page. `/frame/**` and `/isolate/**` both read it.
  it("every preview entry point honours `?theme=dark`", () => {
    for (const entry of ["frame-main.tsx", "isolate-main.tsx", "showcase-main.tsx"]) {
      const src = readFileSync(join(process.cwd(), "preview/src", entry), "utf8");
      expect(src, `${entry} must read the theme query param`).toMatch(
        /get\("theme"\)\s*===\s*"dark"/,
      );
      expect(src, `${entry} must hand it to AppProvider`).toMatch(/theme=\{[\w.]+\}/);
    }
  });
});

describe("Segmented selected state — getComputedStyle (Chromium)", () => {
  it.each(THEMES)("measures the ring, the fill and the weight ($name)", async ({ dark }) => {
    const css = browserStylesheet();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.setContent(
      `<!doctype html><html${dark ? ' class="dark"' : ""}><head><style>${css}</style></head><body>
        <div class="ui-segmented" data-slot="segmented">
          <label class="ui-segmented-item ui-focus-ring" data-state="unchecked">
            <span class="ui-segmented-item-label">Gọn</span>
          </label>
          <label class="ui-segmented-item ui-focus-ring" data-state="checked">
            <span class="ui-segmented-item-label">Thoáng</span>
          </label>
        </div>
      </body></html>`,
    );

    const measured = await page.evaluate(() => {
      const rgb = (c: string): [number, number, number] => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) throw new Error(`unparsable colour: ${c}`);
        const p = m[1]
          .split(/[,\s/]+/)
          .filter(Boolean)
          .map(parseFloat);
        return [p[0], p[1], p[2]];
      };
      const lum = ([r, g, b]: [number, number, number]) => {
        const f = (c: number) => {
          c /= 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratio = (a: [number, number, number], b: [number, number, number]) => {
        const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (hi + 0.05) / (lo + 0.05);
      };

      const trackEl = document.querySelector('[data-slot="segmented"]')!;
      const checked = document.querySelector('[data-state="checked"]')!;
      const unchecked = document.querySelector('[data-state="unchecked"]')!;
      const track = rgb(getComputedStyle(trackEl).backgroundColor);
      const slab = rgb(getComputedStyle(checked).backgroundColor);

      // The computed box-shadow is a comma list; the inset layer is the state ring. With no ring
      // the ratios collapse to 1 — a number the assertion can report, rather than a thrown error
      // that would also hide the font-weight expectations below it.
      const shadow = getComputedStyle(checked).boxShadow;
      const insetLayer = shadow.split(/,(?![^(]*\))/).find((layer) => layer.includes("inset"));
      const ring = insetLayer ? rgb(insetLayer) : null;

      return {
        track,
        slab,
        shadow,
        ring,
        fillOnTrack: ratio(slab, track),
        ringOnTrack: ring ? ratio(ring, track) : 1,
        ringOnSlab: ring ? ratio(ring, slab) : 1,
        checkedWeight: getComputedStyle(checked).fontWeight,
        uncheckedWeight: getComputedStyle(unchecked).fontWeight,
      };
    });

    await browser.close();

    // The defect, as the browser paints it.
    expect(measured.fillOnTrack).toBeLessThan(NON_TEXT);
    // The fix, as the browser paints it.
    expect(measured.ringOnTrack, `box-shadow was: ${measured.shadow}`).toBeGreaterThanOrEqual(
      NON_TEXT,
    );
    expect(measured.ringOnSlab, `box-shadow was: ${measured.shadow}`).toBeGreaterThanOrEqual(
      NON_TEXT,
    );
    // …and the second, canvas-independent signal, which is the part a weight CAN carry.
    expect(Number(measured.checkedWeight)).toBeGreaterThan(Number(measured.uncheckedWeight));
    expect(Number(measured.checkedWeight)).toBe(500);

    // The two themes must not be the same measurement twice — that was the broken probe.
    expect(measured.track).not.toEqual(measured.slab);
  });

  it("the selected label is heavier than its siblings — the canvas-independent signal", async () => {
    // Measured on the live page in the report: selected `font-weight: 400`, same as every
    // unselected option. A separate `it` from the ring, because they are two different signals
    // and a regression in one must not be reported as a regression in the other.
    const css = browserStylesheet();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>
        <div class="ui-segmented" data-slot="segmented">
          <label class="ui-segmented-item" data-state="unchecked"><span>Gọn</span></label>
          <label class="ui-segmented-item" data-state="checked"><span>Thoáng</span></label>
        </div>
      </body></html>`,
    );
    const weights = await page.evaluate(() => ({
      checked: getComputedStyle(document.querySelector('[data-state="checked"]')!).fontWeight,
      unchecked: getComputedStyle(document.querySelector('[data-state="unchecked"]')!).fontWeight,
    }));
    await browser.close();

    expect(Number(weights.unchecked)).toBe(400);
    expect(Number(weights.checked)).toBe(500);
  });

  it("light and dark are genuinely different surfaces", async () => {
    const css = browserStylesheet();
    const browser = await chromium.launch({ headless: true });
    const read = async (dark: boolean) => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.setContent(
        `<!doctype html><html${dark ? ' class="dark"' : ""}><head><style>${css}</style></head><body>
          <div class="ui-segmented" data-slot="segmented">
            <label class="ui-segmented-item" data-state="checked"><span>x</span></label>
          </div>
        </body></html>`,
      );
      return page.evaluate(() => ({
        track: getComputedStyle(document.querySelector('[data-slot="segmented"]')!).backgroundColor,
        slab: getComputedStyle(document.querySelector('[data-state="checked"]')!).backgroundColor,
      }));
    };
    const light = await read(false);
    const night = await read(true);
    await browser.close();

    // The assertion the original probe was missing. If this ever passes trivially again, the
    // page (or the harness) is not switching theme and every "dark" number above is a duplicate.
    expect(night.track).not.toBe(light.track);
    expect(night.slab).not.toBe(light.slab);
  });
});
