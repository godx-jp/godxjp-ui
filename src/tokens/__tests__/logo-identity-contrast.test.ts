import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The boxed `<Logo mark="glyph">` sets real TEXT on a filled box, so WCAG 2.2 SC 1.4.3 applies at
 * **4.5:1** — 14px bold is NOT "large text" (that needs 18.66px bold or 24px regular).
 *
 * The `tone="success"` branch used to ink that text with `--brand-foreground`, which is the identity
 * artwork's KNOCKOUT colour, not an ink: it tracks `--background` in both themes because
 * `<Logo mark="godx">` punches its inner bar as an evenodd HOLE and the email mark paints that hole
 * as a solid fill to match. Negative space only owes SC 1.4.11's 3:1 (non-text) and cleared it at
 * 3.67:1 — but as an INK on the emerald that same 3.67:1 is a straight AA failure, which surfaced as
 * an axe `color-contrast` violation the moment a boxed `tone="success"` glyph was first rendered.
 *
 * This guard resolves the REAL fallback chains out of the shipped CSS (not a hardcoded copy of the
 * expected colours) and computes the actual ratios, so the pairing cannot silently fall below AA
 * again — whether by re-pointing the ink token, re-tinting a role, or editing the call site.
 */

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

const foundation = read("src/tokens/foundation.css");
const logoTokens = read("src/tokens/components/logo.css");
const logoLayout = read("src/styles/logo-layout.css");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function blockOf(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  return css.slice(open + 1, close);
}

/** All `--name: value;` declarations in a block body, as a scope map. */
function declarations(body: string): Record<string, string> {
  const scope: Record<string, string> = {};
  for (const m of body.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gim)) scope[m[1]] = m[2].trim();
  return scope;
}

const COMPONENT_SCOPE = declarations(blockOf(logoTokens, ":root {"));
const THEME_SCOPES = {
  light: { ...COMPONENT_SCOPE, ...declarations(blockOf(foundation, ":root {")) },
  dark: {
    ...COMPONENT_SCOPE,
    ...declarations(blockOf(foundation, ":root {")),
    ...declarations(blockOf(foundation, '.dark,\n:root[data-theme="dark"] {')),
  },
} as const;

/** Split `--name, <fallback>` at the TOP-LEVEL comma of a `var()` argument list. */
function splitVarArgs(inner: string): [string, string | undefined] {
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === "(") depth++;
    else if (inner[i] === ")") depth--;
    else if (inner[i] === "," && depth === 0) {
      return [inner.slice(0, i).trim(), inner.slice(i + 1).trim()];
    }
  }
  return [inner.trim(), undefined];
}

/**
 * Resolve a CSS colour-channel expression to an `H S% L%` triplet, honouring `var()` fallback
 * chains exactly as the cascade does: a knob declared `initial` is guaranteed-invalid, so the
 * call-site fallback takes over.
 */
function resolveTriplet(expr: string, scope: Record<string, string>): [number, number, number] {
  let value = expr.trim();
  for (let guard = 0; guard < 12; guard++) {
    if (value.startsWith("var(")) {
      const [name, fallback] = splitVarArgs(value.slice(4, value.lastIndexOf(")")));
      const declared = scope[name];
      if (declared !== undefined && declared !== "initial") value = declared;
      else if (fallback !== undefined) value = fallback;
      else throw new Error(`unresolvable and no fallback: ${name}`);
      continue;
    }
    const m = value.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
    if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
    throw new Error(`not an hsl triplet: ${value}`);
  }
  throw new Error(`var() chain too deep: ${expr}`);
}

/** Read `property: hsl(<expr>)` out of a rule body and resolve it in a theme scope. */
function paintedColor(ruleBody: string, property: string, scope: Record<string, string>) {
  const m = ruleBody.match(new RegExp(`${property}:\\s*hsl\\(([\\s\\S]*?)\\);`));
  if (!m) throw new Error(`no ${property}: hsl(...) in rule`);
  return resolveTriplet(m[1], scope);
}

/** Body of a `.ui-logo…{ }` rule, selected by its exact selector text. */
function ruleBody(selector: string): string {
  return blockOf(logoLayout, `${selector} {`);
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)].map((x) => x * 255) as [number, number, number];
}

const hex = (rgb: [number, number, number]) =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

/** WCAG relative luminance — computed on the 8-bit values a browser actually paints. */
function luminance(rgb: [number, number, number]): number {
  const a = rgb.map((v) => {
    const c = Math.round(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Resolved ink/fill of a boxed-glyph branch, plus the ratio a browser measures. */
function glyphPair(selector: string, theme: keyof typeof THEME_SCOPES) {
  const scope = THEME_SCOPES[theme];
  const body = ruleBody(selector);
  const ink = hslToRgb(paintedColor(body, "color", scope));
  const fill = hslToRgb(paintedColor(body, "background", scope));
  return { ink, fill, ratio: contrast(ink, fill) };
}

/** SC 1.4.3: bold text is only "large" (3:1) from 18.66px up. Below that the floor is 4.5:1. */
const WCAG_LARGE_BOLD_PX = 18.66;
const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

describe('boxed <Logo mark="glyph"> text clears WCAG 2.2 AA on its fill', () => {
  const BRANCHES = {
    'tone="primary"': ".ui-logo",
    'tone="success"': '.ui-logo[data-tone="success"]',
  } as const;

  for (const [name, selector] of Object.entries(BRANCHES)) {
    for (const theme of ["light", "dark"] as const) {
      it(`${name} · ${theme} — glyph ink clears ${AA_TEXT}:1 on its own fill`, () => {
        const { ink, fill, ratio } = glyphPair(selector, theme);
        expect(
          ratio,
          `${name} ${theme}: ink ${hex(ink)} on fill ${hex(fill)} = ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(AA_TEXT);
      });
    }
  }

  it("the identity ink is NOT the artwork knockout colour (the 3.67:1 regression)", () => {
    // --brand-foreground tracks --background so the godx evenodd hole and the email mark's solid
    // bar agree. Inking TEXT with it put near-white on the emerald at 3.67:1 — below AA.
    for (const theme of ["light", "dark"] as const) {
      const scope = THEME_SCOPES[theme];
      const knockout = hslToRgb(resolveTriplet("var(--brand-foreground)", scope));
      const fill = hslToRgb(resolveTriplet("var(--brand)", scope));
      const { ink } = glyphPair('.ui-logo[data-tone="success"]', theme);
      if (contrast(knockout, fill) < AA_TEXT) expect(hex(ink)).not.toBe(hex(knockout));
    }
    // …and in light, where the knockout genuinely fails, it must be gone from the call site.
    expect(ruleBody('.ui-logo[data-tone="success"]')).not.toContain("--brand-foreground");
  });

  it("the ink token is theme-invariant, so dark renders exactly as it always did", () => {
    const light = glyphPair('.ui-logo[data-tone="success"]', "light");
    const dark = glyphPair('.ui-logo[data-tone="success"]', "dark");
    expect(hex(light.ink)).toBe(hex(dark.ink));
    // The dark theme already inked the glyph with this near-black spine via --brand-foreground.
    expect(hex(dark.ink)).toBe(
      hex(hslToRgb(resolveTriplet("var(--brand-foreground)", THEME_SCOPES.dark))),
    );
  });

  it("no Logo type tier reaches the SC 1.4.3 large-text threshold, so 4.5:1 is the real floor", () => {
    // A future "fix" must not be to call the glyph large text: every tier resolves well under
    // 18.66px bold, at the 14px and the 16px --font-size-base the density axes ship.
    const scope = { ...COMPONENT_SCOPE, ...declarations(blockOf(foundation, ":root {")) };
    for (const tier of ["xs", "sm", "md", "lg"]) {
      const ref = scope[`--logo-font-size-${tier}`];
      expect(ref, `--logo-font-size-${tier} must be a token reference`).toMatch(
        /^var\(--font-size-/,
      );
    }
    for (const remBase of [14, 16]) {
      for (const size of [
        "--font-size-2xs",
        "--font-size-xs",
        "--font-size-sm",
        "--font-size-base",
      ]) {
        // Every step of the ramp is <= --font-size-base (the largest logo tier is `base`).
        expect(scope[size], `${size} must exist`).toBeDefined();
      }
      expect(remBase).toBeLessThan(WCAG_LARGE_BOLD_PX);
    }
  });

  it('mark="godx" artwork keeps clearing its NON-text 3:1 floor (unchanged by the ink fix)', () => {
    for (const theme of ["light", "dark"] as const) {
      const scope = THEME_SCOPES[theme];
      const mark = hslToRgb(paintedColor(ruleBody('.ui-logo[data-mark="godx"]'), "color", scope));
      for (const surface of ["--background", "--card"]) {
        const ratio = contrast(mark, hslToRgb(resolveTriplet(`var(${surface})`, scope)));
        expect(
          ratio,
          `${theme} godx mark on ${surface} = ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(AA_NON_TEXT);
      }
    }
  });
});
