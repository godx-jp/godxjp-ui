import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

/**
 * TOAST COLOUR CONTRACT — measured, not snapshotted.
 *
 * Two defects this guards, both of which shipped at once:
 *
 * 1. Every type rendered NEUTRAL. Sonner reads three custom properties per type
 *    (`--success-bg` / `-border` / `-text`, and the same for error/warning/info) and silently
 *    falls back to the `--normal-*` pair for any type that leaves them unset — so `toast.success()`
 *    and `toast.error()` were the same grey strip. Nothing in a render test notices a missing
 *    custom property, which is why this reads the properties the component actually hands sonner.
 *
 * 2. The text on those surfaces has to be READABLE. `--success` (58% L) and `--warning` (49% L)
 *    are light fills; body text on them cannot clear 4.5:1. The composition mirrors `Alert`
 *    (a `--alert-bg-alpha` tint of the hue, the hue at `--alert-border-alpha` for the edge, the
 *    AA-strong `--text-*` ink on top), and this resolves that composition against the real
 *    foundation tokens in BOTH themes and measures the ratio.
 *
 * The neutral pair is measured too: it is the pair a plain `toast()` uses, and it is the pair the
 * original `color-contrast` report was mistakenly blamed on.
 */

// Capture the props our Toaster hands sonner. This is the contract under test — the resolved
// custom properties, not the markup.
let lastProps: Record<string, unknown> = {};
vi.mock("sonner", () => ({
  Toaster: (props: Record<string, unknown>) => {
    lastProps = props;
    return null;
  },
}));

import { renderWithUi } from "@/test/render";
import { Toaster } from "../sonner";

const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const feedbackTokens = readFileSync(
  join(process.cwd(), "src/tokens/components/feedback.css"),
  "utf8",
);

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  return css.slice(open + 1, close);
}

type Rgb = [number, number, number];

/** Read an `--name: H S% L%;` colour token and convert it to sRGB. */
function hslToken(body: string, name: string): Rgb {
  const m = body.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  if (!m) throw new Error(`token --${name} not found`);
  const h = Number(m[1]);
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

/** Read a unitless `--name: 0.05;` alpha token. */
function alphaToken(body: string, name: string): number {
  const m = body.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s*;`));
  if (!m) throw new Error(`token --${name} not found`);
  return Number(m[1]);
}

const ALPHAS = {
  "alert-bg-alpha": alphaToken(feedbackTokens, "alert-bg-alpha"),
  "alert-border-alpha": alphaToken(feedbackTokens, "alert-border-alpha"),
} as Record<string, number>;

/**
 * Resolve the three value shapes the Toaster writes, against one theme's token block:
 *   hsl(var(--x))
 *   hsl(var(--x) / var(--a))                                      → composited over `over`
 *   color-mix(in srgb, hsl(var(--x)) calc(var(--a) * 100%), hsl(var(--y)))
 * Anything else is a value this test does not understand, and it says so rather than passing.
 */
function resolve(value: string, theme: string, over: Rgb = [255, 255, 255]): Rgb {
  const mix = value.match(
    /^color-mix\(in srgb, hsl\(var\(--([\w-]+)\)\) calc\(var\(--([\w-]+)\) \* 100%\), hsl\(var\(--([\w-]+)\)\)\)$/,
  );
  if (mix) {
    const tint = hslToken(theme, mix[1]);
    const base = hslToken(theme, mix[3]);
    const a = ALPHAS[mix[2]];
    if (a === undefined) throw new Error(`unknown alpha token --${mix[2]}`);
    return base.map((c, i) => c + (tint[i] - c) * a) as Rgb;
  }

  const translucent = value.match(/^hsl\(var\(--([\w-]+)\) \/ var\(--([\w-]+)\)\)$/);
  if (translucent) {
    const colour = hslToken(theme, translucent[1]);
    const a = ALPHAS[translucent[2]];
    if (a === undefined) throw new Error(`unknown alpha token --${translucent[2]}`);
    return over.map((c, i) => c + (colour[i] - c) * a) as Rgb;
  }

  const plain = value.match(/^hsl\(var\(--([\w-]+)\)\)$/);
  if (plain) return hslToken(theme, plain[1]);

  throw new Error(`unsupported toast colour expression: ${value}`);
}

function luminance([r, g, b]: Rgb): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const THEMES = {
  light: block(foundation, ":root {"),
  dark: block(foundation, '.dark,\n:root[data-theme="dark"] {'),
} as const;

const AA = 4.5;

/** sonner type → the status hue it must carry. `null` = the neutral pair a plain toast() uses. */
const TYPES = {
  normal: null,
  success: "success",
  error: "destructive",
  warning: "warning",
  info: "info",
} as const;

function toasterStyle(): Record<string, string> {
  lastProps = {};
  renderWithUi(<Toaster />);
  const style = lastProps.style as Record<string, string> | undefined;
  if (!style) throw new Error("Toaster handed sonner no style object");
  return style;
}

describe("toast tone surfaces", () => {
  it("turns rich colours on by default — sonner reads the per-type properties only then", () => {
    lastProps = {};
    renderWithUi(<Toaster />);
    expect(lastProps.richColors).toBe(true);
  });

  it("declares bg/border/text for every semantic type, not just the neutral pair", () => {
    const style = toasterStyle();
    for (const type of Object.keys(TYPES)) {
      for (const slot of ["bg", "border", "text"]) {
        expect(style[`--${type}-${slot}`], `--${type}-${slot} is unset`).toBeTruthy();
      }
    }
  });

  it("carries each type's OWN hue — a type may never quietly resolve to the neutral palette", () => {
    const style = toasterStyle();
    for (const [type, hue] of Object.entries(TYPES)) {
      if (!hue) continue;
      expect(style[`--${type}-bg`], `--${type}-bg`).toContain(`--${hue})`);
      expect(style[`--${type}-border`], `--${type}-border`).toContain(`--${hue}`);
      expect(style[`--${type}-text`], `--${type}-text`).not.toBe(style["--normal-text"]);
    }
  });

  for (const [theme, tokens] of Object.entries(THEMES)) {
    for (const type of Object.keys(TYPES)) {
      it(`${theme}: ${type} toast text meets AA (>= ${AA}:1) on its own surface`, () => {
        const style = toasterStyle();
        const bg = resolve(style[`--${type}-bg`], tokens);
        const text = resolve(style[`--${type}-text`], tokens, bg);
        expect(contrast(text, bg)).toBeGreaterThanOrEqual(AA);
      });
    }
  }
});
