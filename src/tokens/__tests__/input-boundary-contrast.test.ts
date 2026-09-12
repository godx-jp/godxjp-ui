import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, NON_TEXT, over } from "./wcag-contrast";

/**
 * `--input` is the CONTROL BOUNDARY role, and it must clear WCAG 2.2
 * SC 1.4.11 Non-text Contrast (3:1).
 *
 * A text field in this system has no fill of its own (`background:
 * hsl(var(--background))`) and no shadow worth the name, so its 1px edge is the
 * entire visual claim that you may type there — exactly "the visual information
 * required to identify a user interface component".
 *
 * `--border` is deliberately NOT held to this bar and is NOT checked here:
 * table rules, card edges and section dividers are decorative chrome that
 * SC 1.4.11 does not reach, and this system's dense JP grid depends on them
 * staying quiet. The two roles must therefore be allowed to differ — the last
 * assertion states that as an invariant so a future palette pass cannot quietly
 * re-couple them by copying one value into the other.
 *
 * Surfaces are checked the thorough way: not only the plain ground, but
 * every tint this system lays under a control — a value that passes on a card
 * and fails inside a filter bar or a striped table row is not a line anyone can
 * defend, and no browser sweep catches it unless it happens to sample the right
 * row.
 */

const css = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  return css.slice(open + 1, close);
}

/** The alphas table-layout.css lays over a row. */
const STRIPE_ALPHA = 0.4;
const HOVER_ALPHA = 0.5;

const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
] as const;

describe.each(THEMES)("--input as a control boundary ($theme)", ({ selector }) => {
  const body = block(selector);
  const input = hslToRgb(hsl(body, "input"));
  const background = hslToRgb(hsl(body, "background"));
  const card = hslToRgb(hsl(body, "card"));
  const popover = hslToRgb(hsl(body, "popover"));
  const muted = hslToRgb(hsl(body, "muted"));
  const secondary = hslToRgb(hsl(body, "secondary"));

  it.each([
    ["the page background", () => background],
    // A field inside a Card is the common case, and a Dialog's fields sit on
    // --popover — in dark these are a step LIGHTER than the page, so they are
    // the harder surface, not the easier one.
    ["a card", () => card],
    ["a popover / dialog", () => popover],
    // Filter bars and toolbars are --muted/--secondary panels.
    ["a muted panel", () => muted],
    ["a secondary panel", () => secondary],
    ["a striped table row", () => over(muted, background, STRIPE_ALPHA)],
    ["a hovered table row", () => over(muted, background, HOVER_ALPHA)],
  ])("clears 3:1 on %s", (_label, surface) => {
    expect(contrast(input, surface())).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("keeps the Switch's unchecked track readable against its thumb", () => {
    // .ui-switch[data-state="unchecked"] fills with --input and the thumb is
    // --background: an "off" switch whose track and thumb are the same value is
    // a state carried by nothing (SC 1.4.11 covers state, not just presence).
    expect(contrast(input, background)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("stays decoupled from the decorative --border role", () => {
    // --border legitimately sits BELOW 3:1 (dividers are not components), so
    // the moment the two share a value again, either --input has failed
    // SC 1.4.11 or the table grid has been made needlessly loud.
    expect(hsl(body, "input")).not.toEqual(hsl(body, "border"));
  });
});

/**
 * `--border` IS ANTD'S SPLIT TIER, NOT ITS CONTROL TIER.
 *
 * antd ships two neutral border tokens and they are not interchangeable: `colorBorder`
 * (`darken(#fff, 15)` → #d9d9d9) is the edge that IS a control, and `colorBorderSecondary`
 * (`darken(#fff, 6)` → #f0f0f0) is chrome — the Tabs hairline, Card edges, Table cell rules,
 * Divider. In this system `--input` plays the first role (held to 3:1, see above) and `--border`
 * plays the second.
 *
 * It shipped at the WRONG ONE: 83% light / 22% dark, a 16-point gap from the ground where antd's
 * control tier is 15 — so every hairline, card edge and table rule was one tier too dark, and it
 * was reported from a screenshot of the Tabs line strip. The values now follow antd's own
 * proportion: its secondary sits at 6/15 = 40% of the control tier's gap in light, and
 * `lighten(bg, 19)` against `lighten(bg, 26)` = 73% in dark. Measured in Chromium on
 * /isolate/navigation-tabs: 1.15:1 light (antd 1.14:1) and 1.38:1 dark (antd 1.40:1).
 *
 * Pinned as the GAP FROM THE GROUND rather than as a literal lightness, because that is what
 * makes it a tier: re-tinting a theme's ground moves both, and only the ratio between them
 * carries the meaning.
 */
describe("--border tracks antd's colorBorderSecondary, not colorBorder", () => {
  const GAP = {
    // ground lightness − border lightness, in points, and what antd's own pair gives.
    light: { body: block(":root {"), maxGap: 8, antdControlGap: 15 },
    dark: { body: block('.dark,\n:root[data-theme="dark"] {'), maxGap: 11, antdControlGap: 17 },
  } as const;

  for (const [theme, { body: themeBody, maxGap, antdControlGap }] of Object.entries(GAP)) {
    it(`${theme}: the gap from the ground stays in the SPLIT tier, well inside antd's control tier`, () => {
      const groundL = hsl(themeBody, "background")[2];
      const borderL = hsl(themeBody, "border")[2];
      const gap = Math.abs(groundL - borderL);
      expect(gap, `--border is ${gap} points off the ground; the split tier is <= ${maxGap}`)
        .toBeLessThanOrEqual(maxGap);
      expect(
        gap,
        `${gap} points is antd's CONTROL tier (~${antdControlGap}); that value belongs to --input`,
      ).toBeLessThan(antdControlGap);
    });

    it(`${theme}: it is still visible — a split that renders as nothing is not a split`, () => {
      const ground = hslToRgb(hsl(themeBody, "background"));
      const border = hslToRgb(hsl(themeBody, "border"));
      // antd's own pair is 1.14:1 light / 1.40:1 dark, so the floor is set just under the lower of
      // the two rather than at some rounder number nobody measured.
      expect(contrast(border, ground)).toBeGreaterThan(1.1);
    });
  }
});
