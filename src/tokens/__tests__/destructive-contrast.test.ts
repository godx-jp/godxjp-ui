import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * gh#199 — filled destructive surfaces (Button/Badge/error Step) must clear WCAG 2.x AA (4.5:1) for
 * normal text against `--destructive-foreground`, in BOTH themes, for DEFAULT + HOVER + ACTIVE. The
 * dark default previously sat at 4.54:1 (on the floor) and the states drifted LIGHTER on hover,
 * cutting contrast further. This is a deterministic token guard so a future palette edit can't
 * silently regress the fill contrast (the browser check:contrast missed it — no dark-theme +
 * no destructive-button route). Error TEXT on dark surfaces uses `--text-error`, not this fill token.
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

/** Read an `--name: H S% L%;` token as [h, s, l]. */
function hsl(body: string, name: string): [number, number, number] {
  const m = body.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  if (!m) throw new Error(`token --${name} not found`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)].map((x) => x * 255) as [number, number, number];
}

function luminance([r, g, b]: [number, number, number]): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const THEMES = {
  light: block(":root {"),
  dark: block('.dark,\n:root[data-theme="dark"] {'),
} as const;

const AA = 4.5;

describe("destructive fill contrast (gh#199)", () => {
  for (const [theme, body] of Object.entries(THEMES)) {
    const fg = hslToRgb(hsl(body, "destructive-foreground"));
    for (const state of ["destructive", "destructive-hover", "destructive-active"] as const) {
      it(`${theme}: ${state} fill vs --destructive-foreground meets AA (>= ${AA}:1)`, () => {
        const ratio = contrast(hslToRgb(hsl(body, state)), fg);
        expect(ratio).toBeGreaterThanOrEqual(AA);
      });
    }
  }

  it("hover/active never reduce contrast below the default (states must not drift lighter)", () => {
    for (const body of Object.values(THEMES)) {
      const fg = hslToRgb(hsl(body, "destructive-foreground"));
      const def = contrast(hslToRgb(hsl(body, "destructive")), fg);
      expect(contrast(hslToRgb(hsl(body, "destructive-hover")), fg)).toBeGreaterThanOrEqual(def);
      expect(contrast(hslToRgb(hsl(body, "destructive-active")), fg)).toBeGreaterThanOrEqual(def);
    }
  });
});
