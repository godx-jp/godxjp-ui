/**
 * WCAG contrast maths, shared by the token-palette tests.
 *
 * Extracted from `input-boundary-contrast.test.ts` when the same check had to run a second time
 * over the showcase tenant themes (gh#315). Two copies of a luminance formula is how one of them
 * quietly drifts and starts certifying a palette that fails in the browser.
 */

/** Read an `--name: H S% L%;` token out of a CSS/TSX source block as [h, s, l]. */
export function hsl(body: string, name: string): [number, number, number] {
  const m = body.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  if (!m) throw new Error(`token --${name} not found`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)].map((x) => x * 255) as [number, number, number];
}

export function luminance([r, g, b]: [number, number, number]): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Composite `fg` at `alpha` over `bg`, the way the browser paints a tint. */
export function over(
  fg: [number, number, number],
  bg: [number, number, number],
  alpha: number,
): [number, number, number] {
  return fg.map((v, i) => v * alpha + bg[i] * (1 - alpha)) as [number, number, number];
}

/** WCAG 2.2 SC 1.4.11 Non-text Contrast. */
export const NON_TEXT = 3;
