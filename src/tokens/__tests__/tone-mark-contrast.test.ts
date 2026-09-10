import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, NON_TEXT, over } from "./wcag-contrast";

/**
 * A tone MARK is a thin shape that carries meaning with nothing written on it — the `Card accent`
 * rail, the `DataTable rowTone` rail. WCAG 2.2 SC 1.4.11 puts those at 3:1 against their own
 * surface, and both rails used to read the FILL tier (`--success` / `--warning` …), which is tuned
 * for a solid chip with a label on it, not for a thin mark on a pale ground.
 *
 * Measured in Chromium before `--mark-*` existed: `Card accent="warning"` drew a 6px rail at
 * **1.74:1** against its own card and `accent="success"` at **2.18:1** — a mark carrying the only
 * "this row needs attention" signal, at a contrast where it is barely distinguishable from the
 * surface it sits on.
 *
 * Nothing caught it. `check:contrast`'s non-text pass measures only elements 24×24px or smaller,
 * and a rail is 6px wide by the full height of the card — so it never entered the sample. This
 * guard reads the committed tokens instead, and the browser agrees with it to two decimals
 * (1.74 predicted, 1.74 rendered), which is why paper maths is admissible for this one axis:
 * both rails paint `hsl(var(--mark-*))` flat, with no compositing in between.
 */
const CSS = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");

function block(selector: string): string {
  const start = CSS.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = CSS.indexOf("{", start);
  return CSS.slice(open + 1, CSS.indexOf("\n}", open));
}

const THEMES = {
  light: block(":root {"),
  dark: block('.dark,\n:root[data-theme="dark"] {'),
} as const;

/**
 * `--mark-*` resolve THROUGH another token, so the alias is READ OUT of the committed CSS rather
 * than restated here. That matters: if the map were a literal in this file, repointing
 * `--mark-warning` back at the fill tier would leave every ratio below still measuring
 * `--text-warning` and the suite would stay green while the browser painted 1.74:1.
 */
const MARK_SOURCE = Object.fromEntries(
  [...CSS.matchAll(/--mark-([a-z]+):\s*var\(--([a-z-]+)\)/g)].map((m) => [m[1], m[2]]),
) as Record<string, string>;

/** The six tones `Card accent` and `DataTable rowTone` share. */
const TONES = ["primary", "success", "warning", "info", "attention", "destructive"] as const;

/** The two grounds a RAIL is ever drawn against. */
const GROUNDS = ["card", "background"] as const;

/**
 * The wash a toned DataTable row lays over its ground before the rail is drawn on top. The rail
 * has to clear the row it sits IN, not the bare page, so the ground is composited first.
 */
const WASH_ALPHA = 0.06;

describe("tone marks meet WCAG 1.4.11 against their own surface", () => {
  for (const [theme, body] of Object.entries(THEMES)) {
    for (const tone of TONES) {
      for (const ground of GROUNDS) {
        it(`${theme}: --mark-${tone} on --${ground} is >= ${NON_TEXT}:1`, () => {
          const source = MARK_SOURCE[tone];
          expect(source, `--mark-${tone} is not declared`).toBeTruthy();
          const mark = hslToRgb(hsl(body, source));
          const base = hslToRgb(hsl(body, ground));
          const washed = over(mark, base, WASH_ALPHA);
          expect(contrast(mark, base)).toBeGreaterThanOrEqual(NON_TEXT);
          expect(contrast(mark, washed)).toBeGreaterThanOrEqual(NON_TEXT);
        });
      }
    }
  }

  /** Every tone the two rails can be asked for must actually have a mark token behind it. */
  it("declares a mark token for all six tones", () => {
    expect(Object.keys(MARK_SOURCE).sort()).toEqual([...TONES].sort());
  });
});

/**
 * THE PROGRESS TRACK is the third ground, and it belongs to a different set of tones.
 *
 * A progress fill is a mark by the same definition as a rail — nothing is written on it, and where
 * the colour stops IS the datum — but it is drawn inside `--progress-track-background`, which
 * defaults to `hsl(var(--secondary))`, and only ever in the three tones `ProgressTone` allows.
 * Measured in Chromium on the FILL tier before the move: warning **1.60:1**, success **2.00:1** on
 * the light track, destructive **2.42:1** on the dark one.
 *
 * No wash here, unlike the rails: a track is never a toned DataTable row.
 */
describe("progress marks meet WCAG 1.4.11 against the track", () => {
  /** `ProgressTone` — the only tones a meter fill or a breakdown slice can be asked for. */
  const PROGRESS_TONES = ["success", "warning", "destructive"] as const;

  for (const [theme, body] of Object.entries(THEMES)) {
    for (const tone of PROGRESS_TONES) {
      it(`${theme}: --mark-${tone} on the --secondary track is >= ${NON_TEXT}:1`, () => {
        const mark = hslToRgb(hsl(body, MARK_SOURCE[tone]));
        expect(contrast(mark, hslToRgb(hsl(body, "secondary")))).toBeGreaterThanOrEqual(NON_TEXT);
      });
    }
  }
});

/**
 * The ratios above are only worth anything if the surfaces actually READ this tier.
 *
 * `check:contrast` proves that in a browser, but it runs in the browser lane; this is the cheap
 * half that fails in `pnpm test` the moment a rule is repointed at the fill tier — which is
 * exactly how the legend swatch and the progress fill shipped below the floor in the first place.
 */
describe("the mark-tier surfaces read the mark tier", () => {
  const LAYOUT = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");

  function declaration(selector: string): string {
    const start = LAYOUT.indexOf(selector);
    expect(start, `selector not found: ${selector}`).toBeGreaterThan(-1);
    const open = LAYOUT.indexOf("{", start);
    return LAYOUT.slice(open + 1, LAYOUT.indexOf("\n  }", open));
  }

  const SURFACES: Array<[string, string]> = [
    ['.ui-legend-swatch[data-tone="default"]', "mark-primary"],
    ['.ui-legend-swatch[data-tone="success"]', "mark-success"],
    ['.ui-legend-swatch[data-tone="warning"]', "mark-warning"],
    ['.ui-legend-swatch[data-tone="destructive"]', "mark-destructive"],
    ['.ui-legend-swatch[data-tone="info"]', "mark-info"],
    ['.ui-progress-segment[data-tone="success"]', "mark-success"],
    ['.ui-progress-segment[data-tone="warning"]', "mark-warning"],
    ['.ui-progress-segment[data-tone="destructive"]', "mark-destructive"],
    ['.ui-progress[data-tone="warning"] .ui-progress-bar', "mark-warning"],
    ['.ui-progress[data-tone="destructive"] .ui-progress-bar', "mark-destructive"],
    ["  .ui-progress-bar {", "mark-success"],
    ["  .ui-progress[data-over] .ui-progress-bar {", "mark-destructive"],
  ];

  for (const [selector, token] of SURFACES) {
    it(`${selector.trim()} paints --${token}`, () => {
      const body = declaration(selector);
      expect(body).toContain(`var(--${token})`);
    });
  }

  /**
   * A legend swatch is a SAMPLE of the bar beside it. If the two ever paint different tokens for
   * the same tone the key stops being a key to anything, so they are asserted as one fact rather
   * than two — this is the reason the two surfaces had to move together instead of one at a time.
   */
  it("the legend swatch and the progress slice paint the SAME token per tone", () => {
    for (const tone of ["success", "warning", "destructive"]) {
      const swatch = declaration(`.ui-legend-swatch[data-tone="${tone}"]`);
      const slice = declaration(`.ui-progress-segment[data-tone="${tone}"]`);
      expect(slice.trim()).toBe(swatch.trim());
    }
  });
});
