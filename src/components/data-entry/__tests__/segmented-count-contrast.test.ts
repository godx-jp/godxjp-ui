import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chromium } from "playwright";

import { contrast, hsl, hslToRgb, NON_TEXT } from "@/tokens/__tests__/wcag-contrast";

/**
 * gh#602 — Badge `secondary` nested in Segmented `label` measured 1.00:1 against the track
 * (`rgb(244,243,240)` on `rgb(244,243,240)`). The DS-owned count pill must clear SC 1.4.11
 * against BOTH the recessed track and the lifted selected slab.
 *
 * Luminance math matches `scripts/check-contrast.mjs` (`lum` + `ratio`). Browser measurements use
 * the same `parse` + `getComputedStyle` shape when Chromium is available.
 */

const BEFORE_BADGE_ON_TRACK = 1;

const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const segmentedTokens = readFileSync(
  join(process.cwd(), "src/tokens/components/segmented.css"),
  "utf8",
);
const controlStyles = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8");

function themeBlock(selector: string): string {
  const start = foundation.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = foundation.indexOf("{", start);
  return foundation.slice(open + 1, foundation.indexOf("\n}", open));
}

const THEMES = [
  { name: "light", selector: ":root {" },
  { name: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
] as const;

function ratio(a: [number, number, number], b: [number, number, number]): number {
  return contrast(a, b);
}

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

function pillRole(body: string): [number, number, number] {
  // Default call-site in control.css: hsl(var(--primary))
  return hslToRgb(hsl(body, "primary"));
}

describe.each(THEMES)("Segmented count pill non-text contrast ($name)", ({ selector }) => {
  const body = themeBlock(selector);
  const track = hslToRgb(hsl(body, "muted"));
  const selected = hslToRgb(hsl(body, "background"));
  const pill = pillRole(body);

  it(`documents the failure mode (${BEFORE_BADGE_ON_TRACK}:1 Badge secondary on track)`, () => {
    const badgeSecondary = hslToRgb(hsl(body, "muted"));
    expect(ratio(badgeSecondary, track)).toBeCloseTo(BEFORE_BADGE_ON_TRACK, 2);
  });

  it("pill background is distinguishable from the track (>= 3:1)", () => {
    const after = ratio(pill, track);
    expect(after).toBeGreaterThan(BEFORE_BADGE_ON_TRACK);
    expect(after).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("pill background is distinguishable from the selected item slab (>= 3:1)", () => {
    expect(ratio(pill, selected)).toBeGreaterThanOrEqual(NON_TEXT);
  });
});

describe("Segmented count pill contract (gh#602)", () => {
  it("uses an opaque primary fill in CSS, not Badge secondary / muted", () => {
    expect(controlStyles).toMatch(
      /\.ui-segmented-count\s*\{[^}]*background:\s*var\(--segmented-count-background,\s*hsl\(var\(--primary\)\)\)/,
    );
    expect(segmentedTokens).toContain("--segmented-count-background:");
    expect(controlStyles).not.toMatch(/\.ui-segmented-count[^}]*hsl\(var\(--muted\)\)/);
  });

  it("mutates when the fill is muted — the Badge-secondary regression", () => {
    const body = themeBlock(":root {");
    const track = hslToRgb(hsl(body, "muted"));
    const broken = hslToRgb(hsl(body, "muted"));
    expect(ratio(broken, track)).toBeCloseTo(1, 2);
    expect(ratio(pillRole(body), track)).toBeGreaterThan(1.5);
  });
});

describe("Segmented count — getComputedStyle (Chromium)", () => {
  it("measures pill vs track and vs selected item backgrounds", async () => {
    const css = browserStylesheet();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>
        <div class="ui-segmented" data-slot="segmented">
          <label class="ui-segmented-item ui-focus-ring" data-state="unchecked">
            <span class="ui-segmented-item-label">今週</span>
            <span data-slot="segmented-count" class="ui-segmented-count">9</span>
          </label>
          <label class="ui-segmented-item ui-focus-ring" data-state="checked">
            <span class="ui-segmented-item-label">全件</span>
            <span data-slot="segmented-count" class="ui-segmented-count">54</span>
          </label>
        </div>
      </body></html>`,
    );

    const measured = await page.evaluate(() => {
      const parse = (c: string) => {
        if (!c) return null;
        const rgb = c.match(/rgba?\(([^)]+)\)/);
        if (rgb) {
          const p = rgb[1]
            .split(/[,\s/]+/)
            .filter(Boolean)
            .map(parseFloat);
          return { rgb: [p[0], p[1], p[2]] as [number, number, number], a: p[3] ?? 1 };
        }
        const srgb = c.match(/color\(srgb\s+([^)]+)\)/);
        if (srgb) {
          const p = srgb[1]
            .split(/[\s/]+/)
            .filter(Boolean)
            .map(parseFloat);
          return {
            rgb: [p[0] * 255, p[1] * 255, p[2] * 255] as [number, number, number],
            a: p[3] ?? 1,
          };
        }
        return null;
      };
      const lum = ([r, g, b]: [number, number, number]) => {
        const f = (c: number) => {
          c /= 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratioPair = (a: [number, number, number], b: [number, number, number]) => {
        const L1 = lum(a);
        const L2 = lum(b);
        return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      };

      const track = document.querySelector('[data-slot="segmented"]')!;
      const trackBg = parse(getComputedStyle(track).backgroundColor)!.rgb;
      const unchecked = document.querySelector('[data-state="unchecked"] [data-slot="segmented-count"]')!;
      const checked = document.querySelector('[data-state="checked"] [data-slot="segmented-count"]')!;
      const uncheckedItem = unchecked.closest(".ui-segmented-item")!;
      const checkedItem = checked.closest(".ui-segmented-item")!;
      const uncheckedPill = parse(getComputedStyle(unchecked).backgroundColor)!.rgb;
      const checkedPill = parse(getComputedStyle(checked).backgroundColor)!.rgb;
      const selectedBg = parse(getComputedStyle(checkedItem).backgroundColor)!.rgb;

      const itemFont = parseFloat(getComputedStyle(uncheckedItem).fontSize);
      const countFont = parseFloat(getComputedStyle(unchecked).fontSize);
      return {
        uncheckedOnTrack: ratioPair(uncheckedPill, trackBg),
        checkedOnSelected: ratioPair(checkedPill, selectedBg),
        borderRadius: getComputedStyle(unchecked).borderRadius,
        countFont,
        itemFont,
      };
    });

    await browser.close();

    expect(measured.uncheckedOnTrack).toBeGreaterThan(BEFORE_BADGE_ON_TRACK);
    expect(measured.uncheckedOnTrack).toBeGreaterThanOrEqual(NON_TEXT);
    expect(measured.checkedOnSelected).toBeGreaterThanOrEqual(NON_TEXT);
    expect(parseFloat(measured.borderRadius)).toBeGreaterThan(8);
    expect(measured.countFont).toBeLessThan(measured.itemFont);
  });
});
