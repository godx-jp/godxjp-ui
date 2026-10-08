import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../test/css-selector";

import { contrast, hsl, hslToRgb, NON_TEXT, over } from "./wcag-contrast";

/**
 * v32 decision A1 (gh#1220): with no preset the action colour is a NEUTRAL INK — ≈ zinc-900 in
 * light, near-white in dark — and the identity role follows it. The GoDX violet lives in
 * themes/godx.css only. Measured here: the label on the fill clears AA text, and the focus ring
 * (`--ring: var(--primary)`) clears SC 1.4.11 on every surface a control sits on.
 */
const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const derived = readFileSync(join(process.cwd(), "src/tokens/derived.css"), "utf8");

function block(css: string, selector: string): string {
  const start = anchorIndex(css, selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("\n}", open));
}

const AA_TEXT = 4.5;
const hex = (rgb: [number, number, number]) =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
const round2 = (n: number) => Math.round(n * 100) / 100;

const THEMES = [
  { theme: "light", selector: ":root {", primary: "#18181b", label: 17.45 },
  {
    theme: "dark",
    selector: '.dark, :root[data-theme="dark"] {',
    primary: "#fafafa",
    label: 16.97,
  },
] as const;

describe.each(THEMES)("the neutral primary ($theme)", ({ selector, primary, label }) => {
  const body = block(foundation, selector);
  const rgb = (name: string) => hslToRgb(hsl(body, name));

  it("is the neutral ink, not a brand hue", () => {
    expect(hex(rgb("primary"))).toBe(primary);
    expect(hsl(body, "primary")[1]).toBeLessThanOrEqual(6); // saturation: neutral, not a hue
    expect(hex(rgb("brand"))).toBe(primary);
  });

  it("carries its label at AA text contrast", () => {
    const ratio = contrast(rgb("primary"), rgb("primary-foreground"));
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
    expect(round2(ratio)).toBe(label);
    expect(contrast(rgb("brand"), rgb("brand-foreground"))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("the ring is the primary, and clears 3:1 on every surface a control sits on", () => {
    expect(block(derived, selector)).toContain("--ring: var(--primary);");
    const ring = rgb("primary");
    const background = rgb("background");
    const surfaces = [
      background,
      rgb("card"),
      rgb("popover"),
      rgb("muted"),
      rgb("secondary"),
      rgb("accent"),
      over(rgb("muted"), background, 0.8),
      over(rgb("accent"), background, 0.7),
    ];
    for (const surface of surfaces)
      expect(contrast(ring, surface)).toBeGreaterThanOrEqual(NON_TEXT);
    // …and is never quieter than the resting control boundary it replaces on focus.
    expect(contrast(ring, background)).toBeGreaterThan(contrast(rgb("input"), background));
  });
});
