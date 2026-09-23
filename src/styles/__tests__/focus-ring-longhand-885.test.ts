import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * gh#885 — the focus mark must survive a consumer writing the WRONG FORM of the colour token.
 *
 * `--focus-outline-color` / `--focus-ring-color` are contracted as the TWO-VALUE form: a bare
 * `H S% L%` triple read inside `hsl()` (cardinal rule 48). Most other knobs in this library take the
 * COMPLETE-VALUE form (`hsl(...)` already resolved), so writing
 * `--focus-ring-color: hsl(220 80% 24%)` is the natural mistake — and it nests `hsl()` inside
 * `hsl()`, which is invalid at computed-value time.
 *
 * CSS discards the whole DECLARATION that an invalid substitution appears in. While the mark was an
 * `outline` shorthand, the bad colour took `outline-style` and `outline-width` down with it and the
 * declaration fell back to `medium none currentcolor` — the control lost its focus indicator
 * ENTIRELY, with no error anywhere. Measured in Chromium: `outline-width: 3px; outline-style: none`.
 * (That pair is also what an instrument reading width+colour and skipping STYLE reports as "a 3px
 * ring in the brand colour" — `currentcolor` on `.ui-checkbox` IS `--primary`. It is what produced
 * gh#885's headline reading; on a real Tab the choice family takes the themed ring like everything
 * else, measured 2px warm-white at 15/15 theme x seed cells of the glass theme.)
 *
 * Split into the three longhands, the failure is contained to `outline-color` → `currentcolor`: a
 * ring in the wrong colour instead of no ring. WCAG 2.2 SC 2.4.11 can be met by the first and never
 * by the second. The values are unchanged, so the default is byte-identical — `outline` sets exactly
 * these three longhands and `outline-offset` was never one of them.
 */
const focusRing = readFileSync(resolve(process.cwd(), "src/styles/focus-ring.css"), "utf8");

/** The MARK rule — the one that paints the outline on every focused control. */
const markRule =
  focusRing.match(/\.ui-otp-group\[data-appearance="grouped"\][^{]*\{[^}]*\}/)?.[0] ?? "";

describe("gh#885 · the focus mark is three longhands, never the `outline` shorthand", () => {
  it("found the mark rule", () => {
    expect(markRule).not.toBe("");
    expect(markRule).toMatch(/outline-color/);
  });

  it("sets outline-width from --focus-ring-width, via the gh#891 per-component fallback", () => {
    // `--focus-ring-width-component` is the fresh-at-this-element override
    // (`.ui-toggle`, the field-control family); everything else falls through to the
    // root/theme `--focus-ring-width` exactly as before.
    expect(markRule).toMatch(
      /outline-width:\s*var\(\s*--focus-ring-width-component,\s*var\(\s*--focus-ring-width\)\)/,
    );
  });

  it("sets outline-style as a LITERAL, so no token can delete it", () => {
    // A width and a colour with `outline-style: none` paints nothing. Keeping the style out of every
    // var() chain is what makes the indicator's existence independent of the theme's correctness.
    expect(markRule).toMatch(/outline-style:\s*solid;/);
  });

  it("sets outline-color from the token chain, alone in its own declaration", () => {
    expect(markRule).toMatch(
      /outline-color:\s*hsl\(\s*var\(\s*--focus-outline-color,\s*var\(\s*--focus-ring-color,\s*var\(\s*--ring\)\)\)\s*\/\s*var\(\s*--focus-ring-opacity,\s*1\)\s*\)/,
    );
  });

  it("keeps outline-offset, which the shorthand never carried", () => {
    expect(markRule).toMatch(/outline-offset:\s*var\(\s*--focus-ring-offset\)/);
  });

  it("uses no `outline:` shorthand whose colour comes from a token, anywhere in the file", () => {
    // The regression this test exists to catch is someone collapsing the three back into one for
    // tidiness. Any `outline:` shorthand that interpolates a colour token is the same trap.
    const shorthands = [...focusRing.matchAll(/^\s*outline:\s*([^;]+);/gm)].map((m) => m[1]);
    for (const value of shorthands) expect(value).not.toMatch(/hsl\(\s*var\(/);
  });
});
