import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, NON_TEXT, over } from "./wcag-contrast";

/**
 * The focus mark is TWO layers, and only ONE of them is allowed to carry the accessibility
 * contract.
 *
 * The shape is Ant Design's, read from antd 6.6.2's own source rather than from memory (v6 is the
 * current major; v5.29.3 was read alongside it and the field formula is unchanged): a focused
 * field is `borderColor: colorPrimary` plus `boxShadow: 0 0 0 ${controlOutlineWidth}px
 * ${controlOutline}` (`es/input/style/token.js:48-50`; `es/select/style/select-input.js:32` emits
 * the same declarations, which is why an antd Select and an antd Input focus the same way).
 * `controlOutline` is the primary as an ALPHA TINT — running antd 6's own `formatToken` gives
 * rgba(5,145,255,0.1) light / rgba(23,117,249,0.31) dark for its default blue, and 0.11 / 0.30 for
 * this system's SmartHR #0071bd.
 *
 * THE TRAP THIS FILE EXISTS TO CLOSE. A halo that soft is decoration. Measured against this
 * palette, a primary tint composited over the page reaches only 1.18:1 at alpha 0.12 and still
 * only 2.84:1 at alpha 0.7 — it can NEVER satisfy WCAG 2.2 SC 1.4.11's 3:1, at any value of the
 * knob. So the moment someone reads "the focus ring is a soft glow" and deletes the opaque half,
 * every control in the library loses its focus indicator while still looking focused to a
 * sighted reviewer on a bright monitor. The assertions below state, in order:
 *
 *   1. what actually carries the contract — the OPAQUE focus hue, `--ring`, whether it is painted
 *      as the recoloured control boundary (bordered fields) or as the opaque ring stop
 *      (everything else) — and that it clears 3:1 on every surface a control sits on;
 *   2. that the halo is genuinely a halo, i.e. its alpha is nowhere near the opaque stop; and
 *   3. that raising the halo alpha is not an accessibility fix, by recording that even an
 *      absurd alpha misses the bar.
 *
 * Surfaces are checked the thorough way, for the same reason input-boundary-contrast.test.ts
 * gives: a value that passes on a card and fails inside a filter bar is not a line anyone can
 * defend.
 */

const css = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const controlTokens = readFileSync(
  join(process.cwd(), "src/tokens/components/control.css"),
  "utf8",
);
const shellTokens = readFileSync(join(process.cwd(), "src/tokens/components/shell.css"), "utf8");
const focusRing = readFileSync(join(process.cwd(), "src/styles/focus-ring.css"), "utf8");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  return css.slice(open + 1, close);
}

/** Read a bare numeric token (`--name: 0.12;`) out of a block body. */
function num(body: string, name: string): number {
  const m = body.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s*;`));
  if (!m) throw new Error(`token --${name} not found`);
  return Number(m[1]);
}

/** The alphas table-layout.css lays over a row. */
const STRIPE_ALPHA = 0.4;
const HOVER_ALPHA = 0.5;

const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
] as const;

describe.each(THEMES)("the opaque half of the focus mark ($theme)", ({ selector }) => {
  const body = block(selector);
  const ring = hslToRgb(hsl(body, "ring"));
  const background = hslToRgb(hsl(body, "background"));
  const card = hslToRgb(hsl(body, "card"));
  const popover = hslToRgb(hsl(body, "popover"));
  const muted = hslToRgb(hsl(body, "muted"));
  const secondary = hslToRgb(hsl(body, "secondary"));
  const accent = hslToRgb(hsl(body, "accent"));

  const SURFACES: ReadonlyArray<readonly [string, () => [number, number, number]]> = [
    ["the page background", () => background],
    ["a card", () => card],
    ["a popover / dialog", () => popover],
    ["a muted panel", () => muted],
    ["a secondary panel", () => secondary],
    ["an accent panel", () => accent],
    ["a striped table row", () => over(muted, background, STRIPE_ALPHA)],
    ["a hovered table row", () => over(muted, background, HOVER_ALPHA)],
  ];

  it.each(SURFACES)("clears 3:1 on %s", (_label, surface) => {
    expect(contrast(ring, surface())).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("is at least as visible as the resting boundary it replaces", () => {
    // A focused field swaps `--input` for `--ring` on its edge. If the focus hue were the
    // QUIETER of the two, focusing a field would make its boundary harder to see — the exact
    // inverse of an indicator. This is a floor, not an equality: --ring may be louder.
    const input = hslToRgb(hsl(body, "input"));
    expect(contrast(ring, background)).toBeGreaterThanOrEqual(contrast(input, background));
  });
});

describe.each(THEMES)("the halo is decoration, not the indicator ($theme)", ({ selector }) => {
  const body = block(selector);
  // Both blocks declare the alpha in full — the dark one because a halo needs ~2.5× the alpha on
  // a near-black ground to read at all, the same reason antd's own dark controlOutline is 0.31.
  const alpha = num(body, "focus-ring-glow-alpha");
  const ring = hslToRgb(hsl(body, "ring"));
  const themeBackground = hslToRgb(hsl(body, "background"));

  it("declares a glow alpha in this theme", () => {
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(1);
  });

  it("sits well under the opaque stop, so it can never be mistaken for it", () => {
    // `--focus-ring-opacity` (the opaque stop) is 1 by default. A halo at, say, 0.8 would be a
    // second opaque ring wearing a halo's name.
    expect(alpha).toBeLessThanOrEqual(0.5);
  });

  it("raising the halo alpha is not an a11y fix — it stops being a halo first", () => {
    // The measurement that makes the opaque half non-negotiable, stated as it actually measures
    // rather than as it is tempting to assert. The shipped halo is nowhere near the bar:
    // 1.18:1 light (α 0.12) and 1.73:1 dark (α 0.30).
    const halo = (a: number) => contrast(over(ring, themeBackground, a), themeBackground);
    expect(halo(alpha)).toBeLessThan(NON_TEXT);

    // And the alpha it WOULD take is no longer a halo. Light never gets there at all (the focus
    // hue is only 4.62:1 against the page even fully opaque, so a tint of it cannot be 3:1
    // against that same page); dark needs ≈0.57, i.e. more than half-opaque — a second solid
    // ring wearing a halo's name, and the thing the two-layer split exists to avoid.
    let minimum = Number.POSITIVE_INFINITY;
    for (let a = 0.01; a <= 1.0001; a += 0.01) {
      if (halo(a) >= NON_TEXT) {
        minimum = Math.round(a * 100) / 100;
        break;
      }
    }
    expect(minimum, `alpha needed for 3:1 in this theme: ${minimum}`).toBeGreaterThan(0.5);
  });
});

describe("one focus language, applied consistently", () => {
  it("the ring formula reads BOTH stops from tokens", () => {
    expect(focusRing).toContain("var(--focus-ring-glow-width)");
    expect(focusRing).toContain("var(--focus-ring-glow-alpha)");
    // The halo is painted OUTSIDE the opaque stop, never instead of it.
    expect(focusRing).toContain("calc(var(--focus-ring-width) + var(--focus-ring-glow-width))");
  });

  it("a focused field's BOUNDARY becomes the focus hue — the grey never survives", () => {
    // The user-visible defect this closes was an opaque brand ring sitting against an untouched
    // grey border. The fix feeds the `border-input` utility by rebinding the role it reads,
    // because a `border-color` declaration in @layer components loses to that utility.
    expect(focusRing).toMatch(/--input:\s*var\(--focus-ring-color, var\(--ring\)\)/);
  });

  it("does NOT rebind the boundary on the Switch, which FILLS from --input", () => {
    // `.ui-switch` paints its unchecked TRACK with --input rather than an edge, so including it
    // in the boundary rule would turn a focused off-switch solid blue. The membership rule is
    // "controls whose boundary is the --input role".
    const boundaryRule = focusRing.match(/:is\(\s*\.ui-input,[^}]*--input:[^}]*\}/s)?.[0] ?? "";
    expect(boundaryRule, "the boundary rule must exist").not.toBe("");
    expect(boundaryRule).not.toContain(".ui-switch");
  });

  it("the bordered-field ring width is a public knob, not a literal", () => {
    // A service can still trade the perimeter away deliberately — but through ONE token, and
    // never by editing a component. Note for anyone who does: the value must carry a unit. It is
    // summed with a length in `calc(var(--focus-ring-width) + var(--focus-ring-glow-width))`, and
    // calc() refuses to add a unitless number to a length, so the whole box-shadow becomes
    // invalid at computed-value time and resolves to NONE. Measured in Chromium while this knob
    // was briefly `0`: a focused Input reported `box-shadow: none` and still looked plausible,
    // because the recoloured border was carrying the state on its own. A bare `0` does not thin
    // the ring, it deletes it — on every field in the library at once.
    expect(focusRing).toContain("var(--control-focus-ring-width)");
    const declaration = controlTokens.match(/--control-focus-ring-width:\s*([^;]+);/)?.[1]?.trim();
    expect(declaration, "--control-focus-ring-width must be declared").toBeDefined();
    expect(declaration, "must be a length with a unit — see the calc() note above").toMatch(
      /^(0|var\(--stroke-[a-z0-9]+\)|[\d.]+[a-z%]+)$/,
    );
  });

  it("keeps the ring form for field variants that hide their own boundary", () => {
    // An icon-only / inline picker has no border at rest, so a field-scoped ring width must never
    // reach it — the ring is the only mark it has.
    expect(focusRing).toContain(".ui-app-setting-picker-icon");
    expect(focusRing).toContain(".ui-app-setting-picker-inline");
  });
});

/**
 * WCAG 2.2 SC 2.4.13 Focus Appearance — AAA, and a deliberate target.
 *
 * The Japanese market is strict, and this library is aimed at it (docs/DESIGN-AUTHORITY.md names
 * デジタル庁 as the standards reference). 2.4.13 asks for two things at once, and a gate that
 * checks only the colour will not catch a regression in the other:
 *
 *   AREA     — the indicator covers at least as much as a 2px thick perimeter of the control.
 *   CONTRAST — ≥3:1 between the focused and unfocused states of those same pixels.
 *
 * The contrast half is measured in the first describe above. This one holds the AREA, because the
 * way it gets lost is not a redesign — it is one component quietly rebinding `--focus-ring-width`
 * or `--focus-ring-opacity` to something gentler, which is exactly how the library arrived at
 * 0.35 / 0.45 / 0.45 alphas and a 0px field ring before this pass.
 *
 * Ant Design does NOT meet 2.4.13 on fields (it drops the ring and lets a 1px border stand), so
 * "align with antd" is not a reason to thin any of this. See docs/DESIGN-AUTHORITY.md.
 */
describe("SC 2.4.13 Focus Appearance — the 2px perimeter (AAA)", () => {
  const MIN_PERIMETER_PX = 2;
  const strokeScale: Record<string, number> = {
    hairline: 1,
    sm: 1.5,
    md: 2,
    lg: 3,
    xl: 4,
    "2xl": 6,
  };

  /** Resolve a width declaration to px, following one level of `var(--stroke-*)`. */
  function widthPx(value: string): number {
    const stroke = value.match(/var\(--stroke-([a-z0-9]+)\)/);
    if (stroke) {
      const px = strokeScale[stroke[1]];
      if (px === undefined) throw new Error(`unknown stroke step: ${stroke[1]}`);
      return px;
    }
    return Number.parseFloat(value);
  }

  /**
   * Rebinds allowed to fall below the floor, each with the reason it is not a hole.
   * A blanket exemption is how a criterion rots, so this is a list of SELECTORS, not of files.
   */
  const EXEMPT: Record<string, string> = {
    ".ui-command-input:focus-visible":
      "the command palette moves focus INTO this input on open; the PANEL is the focused thing " +
      "and carries the ring. Ringing both drew two marks for one focus. The rule also suppresses " +
      "box-shadow outright, so nothing paints a sub-2px indicator here.",
  };

  it("the global ring is at least a 2px perimeter", () => {
    const root = block(":root {");
    const width = root.match(/--focus-ring-width:\s*([^;]+);/)?.[1]?.trim() ?? "";
    expect(widthPx(width)).toBeGreaterThanOrEqual(MIN_PERIMETER_PX);
    expect(num(root, "focus-ring-opacity")).toBe(1);
  });

  it("the field knob does not thin it — a 1px border is not a 2px perimeter", () => {
    // The antd shape argues the recoloured border can carry the state alone. Under AAA it cannot,
    // so the field keeps the full stop and the border sits inside it, same hue, contiguous.
    const declared = controlTokens.match(/--control-focus-ring-width:\s*([^;]+);/)?.[1]?.trim();
    expect(widthPx(declared!)).toBeGreaterThanOrEqual(MIN_PERIMETER_PX);
  });

  it("stays in step with the global ring, so the two cannot drift apart", () => {
    // `--control-focus-ring-width` cannot literally read `--focus-ring-width` (that is the very
    // property it is assigned to — a var() cycle), so both read the same stroke step and this
    // asserts the equality that indirection would otherwise have guaranteed.
    const root = block(":root {");
    const global = root.match(/--focus-ring-width:\s*([^;]+);/)?.[1]?.trim() ?? "";
    const field = controlTokens.match(/--control-focus-ring-width:\s*([^;]+);/)?.[1]?.trim() ?? "";
    expect(widthPx(field)).toBe(widthPx(global));
  });

  it("every per-component width rebind clears the floor", () => {
    const offenders: string[] = [];
    // Each `selector { … --focus-ring-width: value … }` block in the single source.
    for (const match of focusRing.matchAll(/([^{}]+)\{([^}]*--focus-ring-width:[^}]*)\}/g)) {
      const selector = match[1]
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .trim()
        .replace(/\s+/g, " ");
      const value = match[2].match(/--focus-ring-width:\s*([^;]+);/)?.[1]?.trim() ?? "";
      if (EXEMPT[selector]) continue;
      // A rebind onto a component knob resolves through that knob's declared value.
      const knob = value.match(/var\((--[a-z-]+)\)/)?.[1];
      const resolved = knob
        ? ((controlTokens + shellTokens).match(new RegExp(`${knob}:\\s*([^;]+);`))?.[1]?.trim() ??
          value)
        : value;
      if (!(widthPx(resolved) >= MIN_PERIMETER_PX)) {
        offenders.push(`${selector} → ${value} (= ${resolved})`);
      }
    }
    expect(offenders, "every focus ring must be at least a 2px perimeter").toEqual([]);
  });

  it("every per-component ALPHA rebind keeps the indicator opaque", () => {
    // The other half, and the one that hid for longest: a 3px ring at 0.35 alpha is still a 3px
    // AREA, but it composites to 1.64:1 and fails the CONTRAST clause. Area alone is not the
    // criterion, so both are asserted.
    const offenders: string[] = [];
    for (const match of focusRing.matchAll(/--focus-ring-opacity:\s*var\((--[a-z-]+)\)/g)) {
      const knob = match[1];
      const declared = (controlTokens + shellTokens)
        .match(new RegExp(`${knob}:\\s*([^;]+);`))?.[1]
        ?.trim();
      expect(declared, `${knob} must be declared in a token tier`).toBeDefined();
      if (Number.parseFloat(declared!) !== 1) offenders.push(`${knob} = ${declared}`);
    }
    expect(offenders, "a softened opaque stop is not an SC 2.4.13 indicator").toEqual([]);
  });

  it("the ring still fits the clip headroom it is given", () => {
    // Chrome that clips its overflow reserves `--focus-ring-clip-margin` for the ring. The widest
    // paint in the system is the Toggle: its 3px stop plus the halo. If a future ring outgrows the
    // margin it is shaved at the edge, which is how gh#291 / gh#376 happened.
    const root = block(":root {");
    const clip = Number.parseFloat(
      root.match(/--focus-ring-clip-margin:\s*([^;]+);/)?.[1]?.trim() ?? "",
    );
    const glow = widthPx(root.match(/--focus-ring-glow-width:\s*([^;]+);/)?.[1]?.trim() ?? "");
    const widest = Math.max(
      ...[...focusRing.matchAll(/--focus-ring-width:\s*([^;]+);/g)].map((m) => {
        const value = m[1].trim();
        const knob = value.match(/var\((--[a-z-]+)\)/)?.[1];
        const resolved = knob
          ? ((controlTokens + shellTokens).match(new RegExp(`${knob}:\\s*([^;]+);`))?.[1]?.trim() ??
            value)
          : value;
        return widthPx(resolved);
      }),
      widthPx(root.match(/--focus-ring-width:\s*([^;]+);/)?.[1]?.trim() ?? ""),
    );
    expect(widest + glow, `widest ring paint (${widest} + ${glow}px halo)`).toBeLessThan(clip);
  });
});
