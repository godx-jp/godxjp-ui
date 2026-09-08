/**
 * gh#399 — the page ground must sit one step BEHIND the cards standing on it, on BOTH themes.
 *
 * This is a MEASUREMENT, not a text assertion: the values are read out of the shipped token files,
 * composited in sRGB exactly as a browser would, and compared by relative luminance. The bug it
 * guards against was invisible to every textual check — `hsl(var(--muted) / 0.4)` is a perfectly
 * reasonable expression that happens to resolve to the WRONG SIDE of `--card` on the dark spine,
 * because the two themes order their surfaces differently.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");

const foundation = read("../../../tokens/foundation.css");
const semanticLayout = read("../../../tokens/semantic/layout.css");
const shellTokens = read("../../../tokens/components/shell.css");
const shellLayout = read("../../../styles/shell-layout.css");

type Rgb = [number, number, number];

/** The `:root` block, and the `.dark` block that follows it, of a token file. */
function themeBlock(css: string, theme: "light" | "dark"): string {
  const at =
    theme === "light"
      ? css.indexOf(":root {")
      : css.search(/\.dark,\s*\n\s*:root\[data-theme="dark"\]\s*\{/);
  if (at === -1) throw new Error(`no ${theme} block`);
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("\n}", open));
}

/** An `--x: H S% L%;` triplet as HSL numbers. */
function triplet(block: string, name: string): [number, number, number] {
  const match = block.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  if (!match) throw new Error(`no --${name} in block`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function hslToRgb([h, s, l]: [number, number, number]): Rgb {
  const sat = s / 100;
  const lig = l / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lig - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return [r + m, g + m, b + m].map((v) => Math.round(v * 255)) as Rgb;
}

/** Source-over compositing of `fg` at `alpha` onto the opaque `bg` — what `.app-main` does. */
function over(fg: Rgb, bg: Rgb, alpha: number): Rgb {
  return fg.map((v, i) => Math.round(v * alpha + bg[i] * (1 - alpha))) as Rgb;
}

function luminance([r, g, b]: Rgb): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Resolve the theme's `--surface-recessed` declaration against that theme's own roles. */
function recessed(theme: "light" | "dark"): Rgb {
  const roles = themeBlock(foundation, theme);
  const background = hslToRgb(triplet(roles, "background"));
  const block = themeBlock(semanticLayout, theme);
  const declaration = block.match(/--surface-recessed:\s*([^;]+);/)?.[1].trim();
  if (!declaration) throw new Error(`no --surface-recessed in the ${theme} theme`);
  const parsed = declaration.match(/^hsl\(var\(--([a-z-]+)\)(?:\s*\/\s*([\d.]+))?\)$/);
  if (!parsed) throw new Error(`unsupported --surface-recessed value: ${declaration}`);
  const role = hslToRgb(triplet(roles, parsed[1]));
  const alpha = parsed[2] === undefined ? 1 : Number(parsed[2]);
  return alpha === 1 ? role : over(role, background, alpha);
}

function card(theme: "light" | "dark"): Rgb {
  return hslToRgb(triplet(themeBlock(foundation, theme), "card"));
}

describe("AppShell page ground (gh#399)", () => {
  it("wires .app-main to the recessed-surface role through an `initial` knob", () => {
    // `initial` + a call-site fallback, so a SCOPED dark subtree re-resolves the role instead of
    // inheriting the light value frozen at :root (docs/TOKENS.md).
    expect(shellTokens).toMatch(/--app-shell-main-background:\s*initial;/);
    expect(shellLayout).toMatch(
      /background-color: var\(--app-shell-main-background, var\(--surface-recessed\)\);/,
    );
  });

  it.each(["light", "dark"] as const)("keeps the %s page BEHIND the card on it", (theme) => {
    const ground = recessed(theme);
    const surface = card(theme);
    expect(luminance(ground)).toBeLessThan(luminance(surface));
    // Visible separation, not a rounding artefact — the dark theme measured 1.015:1 before this
    // fix, and on the WRONG side of the card.
    expect(ratio(surface, ground)).toBeGreaterThan(1.03);
  });

  it("light keeps the exact composite it shipped with", () => {
    expect(recessed("light")).toEqual([249, 249, 247]);
  });

  it("records why the dark ground cannot be derived from --muted", () => {
    // The regression itself: `hsl(var(--muted) / 0.4)` on the dark spine composites IN FRONT of
    // the card, so no alpha on that mix can produce a ground — the reason the role is stated per
    // theme instead of derived.
    const roles = themeBlock(foundation, "dark");
    const derived = over(
      hslToRgb(triplet(roles, "muted")),
      hslToRgb(triplet(roles, "background")),
      0.4,
    );
    expect(luminance(derived)).toBeGreaterThan(luminance(card("dark")));
  });
});
