import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { channelsOf, hsl, relative, triplet } from "./wcag-contrast";

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
 * AND THEN IT HAPPENED AGAIN, ONE LEVEL UP (gh#678). The fix for the above re-hued the literals onto
 * the violet seed, and this lock read those literals — so it certified OUR seed and nothing else. A
 * consumer that set `--primary: 204 100% 37%` got a violet hover with this file green. The family is
 * now a formula off the live `--primary` (src/tokens/derived.css), and the lock evaluates it for a
 * sweep of seeds: a hue that follows ours but not a consumer's is exactly the defect.
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

/** The package seed, then consumer seeds a hue lock on OUR seed alone could never see. */
const SEEDS = [
  "204 100% 37%",
  "204 90% 60%",
  "173 80% 28%",
  "262 83% 70%",
  "0 100% 50%",
  "50 100% 92%",
  "230 60% 12%",
];

/** The formula keeps the origin's `h` untouched, so the tolerance is for rounding only. */
const HUE_TOLERANCE_DEGREES = 0.5;

describe.each(THEMES)("the derived tier is on the seed's hue ($theme)", ({ selector }) => {
  const root = block(derived, ":root {");
  const body = block(derived, selector);
  const seeds = [block(foundation, selector).match(/--primary:\s*([^;]+);/)![1], ...SEEDS];

  describe.each(seeds)("seed %s", (seedText) => {
    const seed = triplet(seedText);
    it.each(PRIMARY_FAMILY)("--%s", (token) => {
      const [hue] = relative(seed, channelsOf(token, body, root));
      expect(Math.abs(hue - seed[0])).toBeLessThanOrEqual(HUE_TOLERANCE_DEGREES);
    });
  });

  it("no member of the family is a literal triplet — a literal can only carry ONE seed's hue", () => {
    const live = derived.slice(0, derived.indexOf("@supports not (color"));
    for (const token of PRIMARY_FAMILY) {
      expect(live).not.toMatch(new RegExp(`--${token}:\\s*[\\d.]+\\s+[\\d.]+%`));
    }
    // The fallback for engines without relative colour IS literal, and must at least be ours.
    const fallback = derived.slice(derived.indexOf("@supports not (color"));
    const seedHue = hsl(block(foundation, selector), "primary")[0];
    for (const token of PRIMARY_FAMILY) {
      for (const m of fallback.matchAll(new RegExp(`--${token}:\\s*([\\d.]+)\\s`, "g"))) {
        expect(Math.abs(Number(m[1]) - seedHue)).toBeLessThanOrEqual(HUE_TOLERANCE_DEGREES);
      }
    }
  });

  it("`--ring` stays a reference, so it cannot drift at all", () => {
    expect(derived).toContain("--ring: var(--primary);");
  });
});
