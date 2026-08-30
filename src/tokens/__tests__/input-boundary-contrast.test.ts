import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, NON_TEXT, over } from "./wcag-contrast";

/**
 * gh#315 — `--input` is the CONTROL BOUNDARY role, and it must clear WCAG 2.2
 * SC 1.4.11 Non-text Contrast (3:1).
 *
 * A text field in this system has no fill of its own (`background:
 * hsl(var(--background))`) and no shadow worth the name, so its 1px edge is the
 * entire visual claim that you may type there — exactly "the visual information
 * required to identify a user interface component". `--input` shipped sharing
 * `--border`'s value and measured 1.46:1 on the page, 1.43:1 on a dialog's card.
 *
 * `--border` is deliberately NOT held to this bar and is NOT checked here:
 * table rules, card edges and section dividers are decorative chrome that
 * SC 1.4.11 does not reach, and this system's dense JP grid depends on them
 * staying quiet. The two roles must therefore be allowed to differ — the last
 * assertion states that as an invariant so a future palette pass cannot quietly
 * re-couple them by copying one value into the other.
 *
 * Surfaces are checked the way gh#299 taught: not only the plain ground, but
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
