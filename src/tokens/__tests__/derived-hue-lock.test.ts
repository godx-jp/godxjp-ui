import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { hsl } from "./wcag-contrast";

/**
 * THE DERIVED TIER CARRIES THE SEED'S HUE — the axis four contrast suites cannot see (gh#648).
 *
 * Identity v2.3 moved `--primary` 63 degrees, from #0071bd to GoDX violet #7A00FF. Every derived
 * interaction state stayed on the blue it was derived from, and shipped that way in 24.0.0 and
 * 24.1.0: a primary button rendered violet at rest and NAVY on hover, in every consumer running
 * the default theme.
 *
 * NOTHING WENT RED, and that is the part worth keeping. `focus-ring-contrast`,
 * `interactive-fill-contrast`, `destructive-contrast` and `theme-tokens-css` all read
 * `derived.css` directly and all four stayed green, because every one of them measures a RATIO:
 * #005596 clears 7.53:1 against the primary label and would do so whatever colour the seed
 * underneath it was. Contrast is a relationship between two luminances; hue is not in it. The
 * generator that used to hold the tier to the seed was removed, its replacement was measurement,
 * and measurement covered one axis of two.
 *
 * So this file covers the other one, and only that one: it asserts no threshold and no ramp
 * position, just that the family painted with the brand is on the brand's hue. `--ring` is not
 * listed because it is declared `var(--primary)` — a reference cannot drift, which is exactly why
 * it was the one token still correct when the issue was filed.
 */

const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const derived = readFileSync(join(process.cwd(), "src/tokens/derived.css"), "utf8");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("\n}", open));
}

const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
] as const;

/**
 * Every derived value the brand seed paints. `--control-outline` is on the list because it is the
 * primary's own halo on a focused field — it was left on a cyan 76 degrees from the seed.
 */
const PRIMARY_FAMILY = ["primary-hover", "primary-active", "primary-border", "control-outline"];

/** Snapping a kit value onto the seed's hue is exact, so the tolerance is for rounding only. */
const HUE_TOLERANCE_DEGREES = 0.5;

describe.each(THEMES)("the derived tier is on the seed's hue ($theme)", ({ selector }) => {
  const seedHue = hsl(block(foundation, selector), "primary")[0];
  const body = block(derived, selector);

  it.each(PRIMARY_FAMILY)("--%s", (token) => {
    expect(Math.abs(hsl(body, token)[0] - seedHue)).toBeLessThanOrEqual(HUE_TOLERANCE_DEGREES);
  });

  it("`--ring` stays a reference, so it cannot drift at all", () => {
    expect(derived).toContain("--ring: var(--primary);");
  });
});
