import { describe, expect, it } from "vitest";

import { resolveCategoryAxisWidth, truncateToWidth } from "../chart-category-axis";

/**
 * The rule that sizes a horizontal BarChart's category axis (gh#409 · 1), tested against the
 * widths actually measured in Chromium at 1440×1000 with the library's own JP stack: a full-width
 * glyph is 12.46px at the tick size, so `株式会社山田製作所` is 112.1px and
 * `東海精密工業株式会社` is 124.6px. Those are the numbers in the issue.
 */
const GLYPH = 12.4699;
/** Stands in for the browser measurement — full-width glyphs only, which is the reported case. */
const measure = (text: string) => [...text].length * GLYPH;

const COMPANIES = [
  "株式会社山田製作所",
  "佐藤食品株式会社",
  "株式会社中村建設",
  "東海精密工業株式会社",
  "みどり農産株式会社",
  "大和金属加工株式会社",
];
const WIDTHS = COMPANIES.map(measure);
const KNOBS = { gap: 8, maxFraction: 0.4 };

describe("category axis width", () => {
  it("reserves the WIDEST tick plus the gap, not a fixed 60px", () => {
    // 1358px canvas = the measured plot column; recharts' default would have been 60px.
    const { width } = resolveCategoryAxisWidth(WIDTHS, 1358, KNOBS);
    expect(width).toBe(133);
    expect(width).toBeGreaterThanOrEqual(Math.max(...WIDTHS));
  });

  it("caps the axis at the token-owned fraction of the canvas", () => {
    const { width, textCap } = resolveCategoryAxisWidth(WIDTHS, 200, KNOBS);
    // 200 × 0.4 = 80, minus the 8px gap → 72px of text, so the axis never eats the bars.
    expect(textCap).toBe(72);
    expect(width).toBe(80);
  });

  it("is the gap alone when there is nothing to plot", () => {
    expect(resolveCategoryAxisWidth([], 1358, KNOBS).width).toBe(8);
  });
});

describe("category tick truncation", () => {
  it("leaves a label that fits untouched", () => {
    expect(truncateToWidth("佐藤食品株式会社", 200, measure)).toBe("佐藤食品株式会社");
  });

  it("cuts at the END so the identifying prefix survives", () => {
    const shown = truncateToWidth("株式会社山田製作所", 72, measure);
    expect(shown.startsWith("株式会社")).toBe(true);
    expect(shown.endsWith("…")).toBe(true);
    expect(measure(shown)).toBeLessThanOrEqual(72);
    // The bug was the opposite: `株式会社` dropped and `⊔田製作所` left on screen.
    expect(shown).not.toBe("田製作所");
  });

  it("keeps the first glyph even when nothing fits", () => {
    const shown = truncateToWidth("東海精密工業株式会社", 1, measure);
    expect(shown).toBe("東…");
  });
});
