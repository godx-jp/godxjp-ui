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

/** The two grounds a rail is ever drawn against. */
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
