import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../../test/css-selector";

import { contrast, hsl, hslToRgb, luminance, over } from "../../../tokens/__tests__/wcag-contrast";

/**
 * The ruled day grid draws in the `--border` tier, and that is a MEASURED choice — made THREE times.
 *
 * 25.3.0, round one. The grid shipped OFF and was reported "very hard to read"; turning it on drew
 * it in `hsl(var(--border))`, measured 1.15:1 on --background / --card / --popover (dark 1.27) and
 * 1.05:1 on the --muted weekday header — read at the time as a 1px line nobody can see. Candidates,
 * light / dark, on the popover:
 *
 *   --border            1.15 / 1.27
 *   --accent            1.19 / 1.43   also the range-middle fill → 1.00 on it
 *   --secondary-active  1.27 / 1.68   a pressed-fill role
 *   --text-disabled     2.15 / 2.97   a TEXT role meaning "disabled"
 *   --input             3.47 / 3.88   the ≥3:1 boundary tier  ← chosen in 25.3.0
 *
 * 27.6.0, round two. "màu border của gantt và date picker đang bị đậm quá cho mờ đi" — too dark,
 * make them lighter. The line moved to `--input / 0.5`: 1.74 / 1.95 on the popover, 1.68 / 1.80 on
 * the header tint.
 *
 * gh#730, round three, and the one that settles the tier rather than the alpha. The owner measured
 * the 27.6.0 line against the rule every OTHER surface in the system draws and found it heavier:
 *
 *   --input / 0.5   L* 78.67 light, rgb(198.5,194,189.5)   1.738 / 1.946
 *   --border        L* 93.80 light, rgb(238,237,236)       1.149 / 1.270   ← chosen
 *
 * --border is the terminal answer to "lighter", because it is the SAME role as the popover edge,
 * a Card edge, a DataTable row rule and RangeTimeline's own outer frame: the day grid can no longer
 * out-weigh the box it is drawn in, whatever a theme does to the palette. Known cost, measured and
 * accepted: on the --muted weekday header the tier reads 1.054 / 1.041, so the header's seven rules
 * are at the edge of visibility — the header's --muted tint, not its ruling, is what separates it
 * from the month. The selected day's --primary fill still dominates at 5.50 / 9.85.
 *
 * A role, not an alpha of one, so a theme that retints --border moves the grid with it.
 * RangeTimeline's grid uses the same tier, so the Gantt and the picker match.
 */
const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const control = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8");
const tokens = readFileSync(join(process.cwd(), "src/tokens/components/control.css"), "utf8");

function block(selector: string): string {
  const start = anchorIndex(foundation, selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = foundation.indexOf("{", start);
  return foundation.slice(open + 1, foundation.indexOf("\n}", open));
}

const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark, :root[data-theme="dark"] {' },
] as const;

describe.each(THEMES)("calendar grid line ($theme)", ({ selector }) => {
  const body = block(selector);
  const rgb = (name: string) => hslToRgb(hsl(body, name));
  // A ROLE now, not an alpha of one, so the painted line no longer depends on what it is over.
  const line = rgb("border");

  it.each(["background", "card", "popover", "muted"])(
    "is never heavier on --%s than the 27.6.0 line the owner measured as too dark",
    (surface) => {
      // Decorative rules have no WCAG floor, so what is pinned is a RELATION, not a band: the day
      // grid may not out-weigh the popover/card edge around it (the same --border role) and it has
      // to be strictly lighter than what was reported. `--muted` is the weekday header tint.
      const chosen = contrast(line, rgb(surface));
      expect(chosen).toBeLessThan(contrast(over(rgb("input"), rgb(surface), 0.5), rgb(surface)));
      expect(chosen).toBeLessThanOrEqual(contrast(rgb("border"), rgb(surface)));
    },
  );

  it("the reporter's number moves: L* 78.71 → 93.86 light, 33.07 → 20.75 dark", () => {
    // The issue's own frame — "grey L53% at alpha 0.5 comes out ~L76 on white, DARKER than
    // --border (L93)". CIE L* from relative luminance, the same Y the contrast maths uses; from
    // the token triplets, so the numbers are exact where Chromium's painted rgb(238,237,236)
    // rounds to L* 93.80.
    const lightness = (c: [number, number, number]) => {
      const Y = luminance(c);
      return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y;
    };
    const before = lightness(over(rgb("input"), rgb("popover"), 0.5));
    const after = lightness(line);
    const light = selector === ":root {";
    expect(before).toBeCloseTo(light ? 78.71 : 33.07, 1);
    expect(after).toBeCloseTo(light ? 93.86 : 20.75, 1);
    // Either theme, the line moves TOWARD the surface it is drawn on — that is what "lighter"
    // means on a dark popover, where the old line was the brighter of the two.
    expect(Math.abs(after - lightness(rgb("popover")))).toBeLessThan(
      Math.abs(before - lightness(rgb("popover"))),
    );
  });

  it("is lighter than BOTH weights the owner reported as too dark", () => {
    const surface = rgb("popover");
    const chosen = contrast(line, surface);
    // 25.3.0's full --input (3.463 / 3.883) and 27.6.0's --input / 0.5 (1.738 / 1.946).
    expect(chosen).toBeLessThan(contrast(rgb("input"), surface));
    expect(chosen).toBeLessThan(contrast(over(rgb("input"), surface, 0.5), surface));
  });

  it("stays quieter than the selected day's --primary fill", () => {
    expect(contrast(line, rgb("popover"))).toBeLessThan(contrast(rgb("primary"), rgb("popover")));
  });
});

describe("calendar grid line — stylesheet wiring", () => {
  const css = control.replace(/\/\*[\s\S]*?\*\//g, "");
  const ruled = [...css.matchAll(/\.ui-calendar\[data-bordered="true"\][^{]*\{([^}]*)\}/g)]
    .map((m) => m[1])
    .filter((b) => /border-(?:inline|block)-(?:start|end)\s*:/.test(b));

  it("every ruling declaration reads the knob with the --border fallback", () => {
    expect(ruled.length).toBeGreaterThanOrEqual(4);
    for (const b of ruled) {
      for (const decl of b.match(/border-(?:inline|block)-(?:start|end)\s*:[^;]*;/g) ?? []) {
        expect(decl).toContain("var(--calendar-grid-border-color, hsl(var(--border)))");
      }
    }
  });

  it("the ruled day cell owns its column width, so the 100%-wide button cannot collapse it", () => {
    // Measured in Chromium with the rule absent: cells 16.5px wide, the week ragged against a
    // 225px header. jsdom does no layout, so what is pinned is the rule that prevents it.
    const cell = [
      ...css.matchAll(/\.ui-calendar\[data-bordered="true"\] \.ui-calendar-day\s*\{([^}]*)\}/g),
    ];
    expect(cell.some((m) => /inline-size:\s*var\(--control-height\);/.test(m[1]))).toBe(true);
  });

  it("the knob is an `initial` role-mirror, so a scoped theme retints it live", () => {
    expect(tokens).toMatch(/--calendar-grid-border-color:\s*initial;/);
  });
});
