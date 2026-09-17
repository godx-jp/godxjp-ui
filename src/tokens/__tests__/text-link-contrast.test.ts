import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, over } from "./wcag-contrast";

/**
 * A LINK IN RUNNING TEXT IS MARKED BY MORE THAN ITS HUE (gh#664).
 *
 * `Text link` painted `--primary` and removed the underline until hover. Two defects, one of which
 * hid the other:
 *
 *   · `--text-link`, the token a link SHOULD read, was still the pre-v2.3 blue (hue 204°) — the same
 *     miss gh#648 found in the derived tier, one tier up, and outside that issue's hue lock.
 *   · with the underline gone, the link differed from the words around it by colour alone, and that
 *     colour measures 1.87:1 against body ink in light and 1.54:1 in dark. WCAG 1.4.1 lets colour
 *     carry a link on its own only at 3:1 (technique G183).
 *
 * So this file asserts both halves, and asserts them against the SOURCE, because jsdom loads no
 * stylesheet and a component test cannot see either one.
 */

const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const textTokens = readFileSync(join(process.cwd(), "src/tokens/components/text.css"), "utf8");
const textLayout = readFileSync(join(process.cwd(), "src/styles/text-layout.css"), "utf8");

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

const AA_TEXT = 4.5;
/** WCAG 1.4.1 · G183 — the contrast at which colour ALONE may distinguish a link from its text. */
const COLOUR_ONLY_LINK = 3;
const HUE_TOLERANCE_DEGREES = 0.5;
const STRIPE_ALPHA = 0.8; // gh#700 — was 0.4, measured invisible in light

describe.each(THEMES)("the link ink ($theme)", ({ selector }) => {
  const body = block(foundation, selector);
  const link = hslToRgb(hsl(body, "text-link"));
  const background = hslToRgb(hsl(body, "background"));
  const muted = hslToRgb(hsl(body, "muted"));

  it("is on the brand's hue, not the pre-v2.3 blue", () => {
    const seedHue = hsl(body, "primary")[0];
    expect(Math.abs(hsl(body, "text-link")[0] - seedHue)).toBeLessThanOrEqual(
      HUE_TOLERANCE_DEGREES,
    );
  });

  it.each([
    ["the page", () => background],
    ["a card", () => hslToRgb(hsl(body, "card"))],
    ["a muted panel", () => muted],
    ["an accent panel", () => hslToRgb(hsl(body, "accent"))],
    ["a striped table row", () => over(muted, background, STRIPE_ALPHA)],
  ] as const)("clears AA as text on %s", (_label, surface) => {
    expect(contrast(link, surface())).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("CANNOT be told from body ink by colour alone — which is what makes the underline required", () => {
    // Recorded, not aspirational. If a future link ink ever clears 3:1 against body text, this
    // turns red and the underline becomes a choice again rather than a requirement.
    const ink = hslToRgb(hsl(body, "foreground"));
    expect(contrast(link, ink)).toBeLessThan(COLOUR_ONLY_LINK);
  });
});

describe("the link is underlined at rest", () => {
  it("defaults the decoration token to underline", () => {
    expect(textTokens).toMatch(/--text-link-decoration-line:\s*underline;/);
  });

  it("the resting link rule reads the token rather than removing the rule", () => {
    const rule = textLayout.match(/\[data-slot="text"\]\[data-link\]\s*\{[^}]*\}/)?.[0] ?? "";
    expect(rule, "the resting link rule must exist").not.toBe("");
    expect(rule).toContain("text-decoration-line: var(--text-link-decoration-line)");
    expect(rule).not.toMatch(/text-decoration-line:\s*none/);
  });

  it("uses the guideline's underline offset", () => {
    expect(textTokens).toMatch(/--text-link-underline-offset:\s*0\.18em;/);
  });
});

describe("a default link paints the link ink, and nothing else does", () => {
  const rule =
    textLayout.match(
      /\[data-slot="text"\]\[data-link\]\[data-tone="primary"\][^{]*\{[^}]*\}/,
    )?.[0] ?? "";

  it("reads --text-link, not the --primary fill role", () => {
    expect(rule, "the link-ink rule must exist").not.toBe("");
    expect(rule).toContain("hsl(var(--text-link))");
  });

  it('is scoped to the DEFAULT tone, so `link tone="destructive"` still wins', () => {
    expect(rule).toContain('[data-tone="primary"]');
  });

  it("never paints a DISABLED link as live", () => {
    // This selector is (0,3,0) and the disabled rule is (0,2,0): without the exclusion a disabled
    // default link took the live link ink at rest and read as clickable.
    expect(rule).toContain(":not([data-disabled])");
  });
});
