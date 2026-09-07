import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Filled destructive surfaces (Button/Badge/error Step) must clear WCAG 2.x AA (4.5:1) for
 * normal text against `--destructive-foreground`, in BOTH themes, for DEFAULT + HOVER + ACTIVE. The
 * dark default previously sat at 4.54:1 (on the floor) and the states drifted LIGHTER on hover,
 * cutting contrast further. This is a deterministic token guard so a future palette edit can't
 * silently regress the fill contrast (the browser check:contrast missed it — no dark-theme +
 * no destructive-button route). Error TEXT on dark surfaces uses `--text-error`, not this fill token.
 */

/**
 * BOTH TIERS. `--destructive` is the SEED and lives in foundation.css; `--destructive-hover` and
 * `--destructive-active` are DERIVED from it by antd's algorithm and live in the generated tier
 * (scripts/gen-antd-tokens.mjs). Reading only foundation would silently skip the two states this
 * file exists to guard.
 */
const SOURCES = ["src/tokens/foundation.css", "src/tokens/antd.generated.css"].map((file) =>
  readFileSync(join(process.cwd(), file), "utf8"),
);

/** Extract a flat `selector { ... }` block body from each tier, concatenated. */
function block(selector: string): string {
  const bodies = SOURCES.map((css) => {
    const start = css.indexOf(selector);
    if (start === -1) return "";
    const open = css.indexOf("{", start);
    return css.slice(open + 1, css.indexOf("\n}", open));
  }).filter(Boolean);
  if (!bodies.length) throw new Error(`selector not found in any tier: ${selector}`);
  return bodies.join("\n");
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

  /**
   * THIS ASSERTION CHANGED WHEN THE RAMP BECAME GENERATED, AND THE CHANGE IS DELIBERATE.
   *
   * It used to read "hover/active never reduce contrast below the default", i.e. the states must
   * never drift lighter. That was a PROXY for the criterion, chosen when the ramp was authored by
   * hand and every step could be pushed darker at will. `--destructive-hover` / `-active` are now
   * antd's `colorErrorHover` / `colorErrorActive` (scripts/gen-antd-tokens.mjs), and antd's model
   * is universally hover-lighter / active-darker — a direction, not an accident.
   *
   * What gh#199 was actually protecting is the loop above: every filled destructive surface stays
   * clear of AA against its own label, with margin rather than on the floor. antd's steps do,
   * measured off the committed tokens: light 6.10 → hover 4.64 → active 8.74, dark 5.53 → 4.65 →
   * 8.94.
   *
   * So the proxy is replaced by the two things that are really being defended: hover never falls
   * to the AA floor itself, and ACTIVE — the committed, irreversible press — is never the quietest
   * state of the three.
   *
   * THE HOVER MARGIN IS THIN ON PURPOSE — 4.64 against a 4.6 threshold. antd's hover is its
   * shallowest interactive step and it moves TOWARDS the label, so this is the one state where a
   * seed nudge can cross AA without anything else noticing. A generous threshold here would defeat
   * the tripwire; a failure here means the seed moved, not that the rule is wrong. The neighbouring
   * primary ramp already crossed that line and had to be reflected — see
   * interactive-fill-contrast.test.ts and the reflection block in scripts/gen-antd-tokens.mjs.
   */
  it("no state sits on the AA floor, and the pressed state is never the quietest", () => {
    const FLOOR_MARGIN = 0.1;
    for (const body of Object.values(THEMES)) {
      const fg = hslToRgb(hsl(body, "destructive-foreground"));
      const ratio = (state: string) => contrast(hslToRgb(hsl(body, state)), fg);
      expect(ratio("destructive-hover")).toBeGreaterThan(AA + FLOOR_MARGIN);
      expect(ratio("destructive-active")).toBeGreaterThan(ratio("destructive-hover"));
      expect(ratio("destructive-active")).toBeGreaterThanOrEqual(ratio("destructive"));
    }
  });
});
