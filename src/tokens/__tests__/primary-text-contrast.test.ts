import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * gh#299 — `--primary` is used as TEXT, not only as a fill: every link, every
 * issue key, every "Save as Filter" in a consuming app is `text-primary`. It
 * must therefore clear WCAG 2.x AA (4.5:1) not just on `--background`, but on
 * the tints this system itself lays over a row.
 *
 * The published value cleared the plain ground at 4.62 and failed on both of
 * them: the zebra stripe (`--muted / 0.4`) at 4.46 and row hover
 * (`--muted / 0.5`) at 4.43. A link that passes on a card and fails inside a
 * striped table is not a line anyone can defend, and no browser sweep catches
 * it unless it happens to sample an even row while hovering.
 *
 * This guard is deterministic so a future palette edit cannot spend that
 * headroom again.
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

/** Composite `fg` at `alpha` over `bg`, the way the browser paints a tint. */
function over(
  fg: [number, number, number],
  bg: [number, number, number],
  alpha: number,
): [number, number, number] {
  return fg.map((v, i) => v * alpha + bg[i] * (1 - alpha)) as [number, number, number];
}

/** The alphas table-layout.css lays over a row. */
const STRIPE_ALPHA = 0.4;
const HOVER_ALPHA = 0.5;

describe.each([
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
])("--primary as text ($theme)", ({ selector }) => {
  const body = block(selector);
  const primary = hslToRgb(hsl(body, "primary"));
  const background = hslToRgb(hsl(body, "background"));
  const muted = hslToRgb(hsl(body, "muted"));

  it("clears AA on the plain background", () => {
    expect(contrast(primary, background)).toBeGreaterThanOrEqual(4.5);
  });

  it("clears AA on a striped row", () => {
    expect(contrast(primary, over(muted, background, STRIPE_ALPHA))).toBeGreaterThanOrEqual(4.5);
  });

  it("clears AA on a hovered row", () => {
    // The darkest state a reader is commonly in — you hover the row you are
    // about to click, which is the row whose link you are reading.
    expect(contrast(primary, over(muted, background, HOVER_ALPHA))).toBeGreaterThanOrEqual(4.5);
  });

  it("still carries its own foreground as a fill", () => {
    // Fixing text contrast must not break the filled button it also paints.
    const foreground = hslToRgb(hsl(body, "primary-foreground"));
    expect(contrast(foreground, primary)).toBeGreaterThanOrEqual(4.5);
  });
});
