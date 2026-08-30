import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, over } from "./wcag-contrast";

/**
 * gh#320 — the Button counter pill must clear WCAG 2.2 SC 1.4.3 (4.5:1 for small text).
 *
 * The pill used to tint itself translucently over the button's own surface
 * (`bg-primary-foreground/15` on filled variants, `bg-foreground/8` on light ones). A translucent
 * fill has no contrast of its own — it is a function of whatever is behind it — so the same
 * declaration measured differently per variant, per theme, and again on hover. Five combinations
 * were below the bar, and the two worst were HOVER states, which is precisely why no screenshot
 * sweep found them: `--accent` only exists under the cursor.
 *
 * This test exists because a browser sweep structurally cannot cover that. It reads the shipped
 * palette and computes every combination the CSS can produce, hover included.
 *
 * The fix (the treatment gh#312 validated on Toggle) is opaque role fills, so each ratio below is
 * independent of the surface: a filled variant wears its own label pair swapped, which makes the
 * pill exactly as legible as the label beside it and impossible to make worse without making the
 * button itself unreadable first.
 */

const css = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");

function block(selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("\n}", open));
}

/** WCAG 2.2 SC 1.4.3 Contrast (Minimum) — the counter renders at `--font-size-xs`, so small text. */
const SMALL_TEXT = 4.5;

const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
] as const;

describe.each(THEMES)("Button counter pill contrast ($theme)", ({ selector }) => {
  const body = block(selector);
  const role = (name: string) => hslToRgb(hsl(body, name));

  // A filled variant's pill: the button's label pair, swapped.
  const FILLED = [
    { variant: "default", fill: "primary-foreground", text: "primary" },
    { variant: "destructive", fill: "destructive-foreground", text: "destructive" },
    { variant: "secondary", fill: "secondary-foreground", text: "secondary" },
  ] as const;

  for (const { variant, fill, text } of FILLED) {
    it(`${variant}: digits are legible on the pill`, () => {
      expect(contrast(role(text), role(fill))).toBeGreaterThanOrEqual(SMALL_TEXT);
    });

    it(`${variant}: the pill is never less legible than the button's own label`, () => {
      // The invariant that makes this robust across re-themes: the pair is the label's, swapped,
      // so the two ratios are equal by construction. If a theme keeps the button readable, the
      // count comes along for free — no separate palette decision to get wrong.
      expect(contrast(role(text), role(fill))).toBeCloseTo(contrast(role(fill), role(text)), 10);
    });
  }

  // The outline family (outline / dashed / ghost / link) shares one pill, and its button surface
  // CHANGES on hover (`--background` -> `--accent`). This is where the worst failures were, so the
  // test measures the OLD recipe as well as the new one: an assertion that only checks the current
  // value cannot tell you whether it fixed anything.
  it("outline family: legible at rest and on hover, where the tint was not", () => {
    const opaque = contrast(role("foreground"), role("muted"));
    expect(opaque).toBeGreaterThanOrEqual(SMALL_TEXT);

    for (const surface of ["background", "accent"] as const) {
      // What shipped before: --muted-foreground over --foreground at 8% over the button's surface.
      const tinted = over(role("foreground"), role(surface), 0.08);
      const before = contrast(role("muted-foreground"), tinted);
      // Every one of these was at or under the bar in at least one theme; the opaque fill clears
      // it everywhere and, unlike the tint, reads the same on both surfaces.
      expect(opaque).toBeGreaterThan(before);
    }
  });

  it("outline family: the hover surface no longer moves the ratio at all", () => {
    // The defect in one line: the old fill's contrast depended on which surface was under it, so
    // it silently dropped when the cursor arrived. An opaque fill cannot, and this is the assertion
    // that fails the day someone gives it an alpha again.
    const atRest = contrast(
      role("muted-foreground"),
      over(role("foreground"), role("background"), 0.08),
    );
    const onHover = contrast(
      role("muted-foreground"),
      over(role("foreground"), role("accent"), 0.08),
    );
    expect(Math.abs(atRest - onHover)).toBeGreaterThan(0.1);
  });

  it("outline family: the pill stays QUIET against the button (cardinal rule #44)", () => {
    // Legibility of the digits went up; loudness of the pill must not. `--muted` sits within a
    // hair of the button's own ground, so at rest a count still reads as text, not as a badge.
    expect(contrast(role("muted"), role("background"))).toBeLessThan(1.5);
  });
});

describe("the translucent tint that failed cannot come back", () => {
  const control = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8");
  const button = readFileSync(join(process.cwd(), "src/components/general/button.tsx"), "utf8");

  it("the pill's colour is declared in CSS off tokens, not as utilities on the element", () => {
    // The element carries no utility classes at all now. That matters beyond tidiness: Tailwind v4
    // orders `utilities` AFTER `components`, so a utility on this same element would out-rank the
    // token rule and silently restore the failing tint.
    expect(button).toContain('className="ui-button-count"');
    expect(button).not.toMatch(/bg-(primary|secondary|destructive)-foreground\//);
    expect(button).not.toMatch(/bg-foreground\/\d/);
  });

  it("every count-pill fill is opaque", () => {
    const rules = control.match(
      /\.ui-button(--\w+)? \.ui-button-count \{[^}]*\}|\.ui-button-count \{[^}]*\}/g,
    );
    expect(rules?.length).toBe(4);
    for (const rule of rules ?? []) {
      const background = rule.match(/background:\s*([^;]+);/)?.[1] ?? "";
      expect(background, rule.slice(0, 40)).not.toMatch(/\/\s*[\d.]+\s*\)|rgba|hsla/);
    }
  });
});
