import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { applyPrimaryColor } from "../../app/theme-axes";
import {
  channelsOf,
  contrast,
  declaration,
  hsl,
  hslToRgb,
  relative,
  triplet,
} from "./wcag-contrast";

/**
 * THE DERIVED PRIMARY FAMILY HOLDS FOR A CONSUMER'S SEED, NOT ONLY FOR OURS (gh#678).
 *
 * 25.0.0 (gh#648) wrote `--primary-hover`, `--primary-active`, `--primary-border` and
 * `--control-outline` as literals on the violet seed. Every gate read those literals, so every gate
 * measured exactly one seed — ours — and stayed green while a consumer that re-themed `--primary`
 * to `204 100% 37%` got a blue button that hovered violet. The defect was not in a value; it was in
 * what the gates were able to see.
 *
 * The tier is now a formula evaluated at the call site (src/tokens/derived.css). This file holds
 * the formula to four things, each for a SWEEP of seeds rather than one:
 *   1. on OUR seed it still produces the identity kit's values, and the no-relative-colour fallback
 *      carries those same values;
 *   2. every package call site uses the formula, and no literal can creep back in beside it;
 *   3. a filled button's label clears AA in hover and pressed for every seed whose RESTING fill
 *      clears AA — by construction, measured over a dense grid, with the one case where it cannot
 *      named rather than skipped;
 *   4. `applyPrimaryColor` (JS) lands on the same formula, not a second one.
 */

const AA_TEXT = 4.5;

const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const derived = readFileSync(join(process.cwd(), "src/tokens/derived.css"), "utf8");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("\n}", open));
}

const LIGHT = ":root {";
const DARK = '.dark,\n:root[data-theme="dark"] {';
const derivedLight = block(derived, LIGHT);
const THEMES = [
  { theme: "light", foundation: block(foundation, LIGHT), derived: derivedLight },
  { theme: "dark", foundation: block(foundation, DARK), derived: block(derived, DARK) },
] as const;
type Theme = (typeof THEMES)[number];

const FAMILY = ["primary-hover", "primary-active", "primary-border", "control-outline"] as const;
type Hsl = [number, number, number];

/** What `hsl(var(--<name>, from hsl(var(--primary)) var(--<name>-channels)))` paints in a theme. */
const state = (theme: Theme, name: string, seed: Hsl) =>
  relative(seed, channelsOf(name, theme.derived, derivedLight));

/** The same, for an explicit step pair (`darken` / `lighten`), ignoring the theme's choice. */
const stepped = (name: "primary-hover" | "primary-active", pair: string, seed: Hsl) =>
  relative(seed, channelsOf(`${name}-${pair}`, derivedLight));

const hex = (value: Hsl) =>
  `#${hslToRgb(value)
    .map((v) => Math.round(v).toString(16).padStart(2, "0"))
    .join("")}`;
const round2 = (n: number) => Math.round(n * 100) / 100;

/* ────────────────────────────────────────────────────────────────────────────
 * 1. OUR SEED STILL LANDS ON THE KIT.
 * ──────────────────────────────────────────────────────────────────────────── */
describe("on the package's own seed the formula reproduces the identity kit", () => {
  /** The literals 25.4.0 shipped — the kit's own ramp, hue-snapped (see derived.css). */
  const KIT = {
    light: {
      "primary-hover": "#6500d4",
      "primary-active": "#5400b0",
      "primary-border": "#a66de3",
      "control-outline": "#6d00e4",
    },
    dark: {
      "primary-hover": "#ecdaff",
      "primary-active": "#cd9fff",
      "primary-border": "#3b2058",
      "control-outline": "#993dfe",
    },
  } as const;

  describe.each(THEMES)("$theme", (theme) => {
    const seed = hsl(theme.foundation, "primary");

    it.each(FAMILY)("--%s", (name) => {
      expect(hex(state(theme, name, seed))).toBe(KIT[theme.theme][name]);
    });

    it("the no-relative-colour fallback carries the same four values", () => {
      // Chrome/Edge 111–118 cannot evaluate the formula; they get these literals instead. Held equal
      // here so the fallback can never drift from what every other engine paints.
      const fallback = derived.slice(derived.indexOf("@supports not (color: hsl(from red h s l))"));
      expect(fallback.length, "the @supports fallback block must exist").toBeGreaterThan(50);
      const body = block(fallback, theme.theme === "light" ? "  :root {" : "  .dark,");
      for (const name of FAMILY) {
        expect(hex(triplet(declaration(body, name))), `fallback --${name}`).toBe(
          KIT[theme.theme][name],
        );
      }
    });
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 2. ONE FORMULA, AT EVERY CALL SITE, AND NO LITERAL BESIDE IT.
 * ──────────────────────────────────────────────────────────────────────────── */
describe("the family is a knob with a live default everywhere it is read", () => {
  const sheets = globSync("src/{styles,tokens}/**/*.css").map((file) => ({
    file,
    code: readFileSync(join(process.cwd(), file), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\s+/g, " ")
      .replace(/\( /g, "(")
      .replace(/ \)/g, ")"),
  }));

  it("the four knobs are `initial` in both themes — a literal is exactly the gh#678 defect", () => {
    const light = derived.slice(0, derived.indexOf("@supports not (color"));
    for (const name of FAMILY) {
      const writes = [...light.matchAll(new RegExp(`--${name}:\\s*([^;]+);`, "g"))].map((m) =>
        m[1].trim(),
      );
      expect(writes, `--${name} outside the @supports fallback`).toEqual(["initial"]);
    }
  });

  it.each(FAMILY)("every read of --%s carries the formula as its fallback", (name) => {
    const formula = `var(--${name}, from hsl(var(--primary)) var(--${name}-channels))`;
    const reads: string[] = [];
    for (const { file, code } of sheets) {
      for (const m of code.matchAll(new RegExp(`var\\(--${name}\\b[^-]`, "g"))) {
        const at = m.index!;
        if (!code.startsWith(formula, at)) reads.push(`${file}: ${code.slice(at, at + 90)}`);
      }
    }
    expect(reads, `a bare read of --${name} paints nothing now that it is initial`).toEqual([]);
  });

  it("the family is actually painted — the button, the utilities, the halo, the open nav row", () => {
    const all = sheets.map((s) => s.code).join("\n");
    expect(all).toContain(
      ".ui-button--default:hover { background: hsl(var(--primary-hover, from hsl(var(--primary)) var(--primary-hover-channels)));",
    );
    expect(all).toContain("--color-primary-active: hsl(var(--primary-active, from");
    expect(all).toContain(
      "var(--control-outline, from hsl(var(--primary)) var(--control-outline-channels))",
    );
    expect(all).toContain(
      "color: var(--sidebar-item-active-foreground, hsl(var(--primary-active, from",
    );
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 3. AA FOR A CONSUMER'S SEED.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * The seeds this sweep names. The first two are ours; the next four were measured in a consuming
 * app on 25.4.0 (every one of them hovered violet); the last four are the extremes a formula tends
 * to break at.
 */
const SWEEP: ReadonlyArray<{ theme: "light" | "dark"; seed: string; why: string }> = [
  { theme: "light", seed: "268.7 100% 50%", why: "the package seed" },
  { theme: "dark", seed: "268.7 100% 86.9%", why: "the package seed" },
  { theme: "light", seed: "204 100% 37%", why: "consumer blue" },
  { theme: "dark", seed: "204 90% 60%", why: "consumer blue, dark" },
  { theme: "light", seed: "173 80% 28%", why: "consumer teal" },
  { theme: "dark", seed: "262 83% 70%", why: "consumer violet, dark" },
  { theme: "light", seed: "50 100% 92%", why: "very light" },
  { theme: "dark", seed: "50 100% 92%", why: "very light" },
  { theme: "light", seed: "230 60% 12%", why: "very dark" },
  { theme: "dark", seed: "230 60% 12%", why: "very dark" },
];

/**
 * label on [rest, hover, active], measured with the theme's DEFAULT label and the theme's own step
 * pair. Pinned, so a formula change lands here and not in a consumer's axe run.
 */
const MEASURED: Record<string, [number, number, number]> = {
  "light 268.7 100% 50%": [6.32, 8.23, 10.31],
  "dark 268.7 100% 86.9%": [10.72, 13.51, 8.41],
  "light 204 100% 37%": [5.04, 7.4, 10.35],
  "dark 204 90% 60%": [7.07, 8.09, 9.27],
  "light 173 80% 28%": [4.72, 7.98, 12.53],
  "dark 262 83% 70%": [5.29, 6.85, 8.8],
  "light 50 100% 92%": [1.05, 1.12, 1.18],
  "dark 50 100% 92%": [16.61, 17.41, 15.88],
  "light 230 60% 12%": [17.99, 19.97, 20.68],
  "dark 230 60% 12%": [1.03, 1.08, 1.23],
};

/**
 * THE NAMED EXCEPTION — LABEL POLARITY. A step can only move a fill AWAY from one side, so a pair is
 * correct for one label polarity: `darken` under a light label, `lighten` under a dark one. When a
 * seed cannot carry its theme's DEFAULT label even at rest (a pale yellow under the light theme's
 * near-white text), no step in the theme's direction can rescue it, and none is claimed: the service
 * sets a label of the other polarity and points `--primary-hover-channels` /
 * `--primary-active-channels` at the other pair (`applyPrimaryColor` does it automatically). The
 * test asserts BOTH halves — that the default fails, and that the documented fix passes.
 */
const POLARITY_INVERTED = new Set(["light 50 100% 92%", "dark 230 60% 12%"]);

describe.each(SWEEP)("$theme $seed ($why)", ({ theme: themeName, seed: seedText }) => {
  const key = `${themeName} ${seedText}`;
  const theme = THEMES.find((t) => t.theme === themeName)!;
  const seed = triplet(seedText);
  const label = hslToRgb(hsl(theme.foundation, "primary-foreground"));
  const ratios = [
    seed,
    state(theme, "primary-hover", seed),
    state(theme, "primary-active", seed),
  ].map((fill) => contrast(hslToRgb(fill), label));

  it("measures what is pinned", () => {
    expect(ratios.map(round2)).toEqual(MEASURED[key]);
  });

  it("every state carries the seed's hue — a stale literal cannot pass this", () => {
    for (const name of FAMILY) expect(state(theme, name, seed)[0]).toBeCloseTo(seed[0], 6);
  });

  if (!POLARITY_INVERTED.has(key)) {
    it("the label clears AA at rest, hover and pressed", () => {
      for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
    });
  } else {
    it("NAMED EXCEPTION: the theme's label cannot sit on this seed even at rest", () => {
      expect(ratios[0]).toBeLessThan(AA_TEXT);
    });

    it("…and the documented fix — the other label and the other pair — clears AA", () => {
      const other = themeName === "light" ? "dark" : "light";
      const otherLabel = hslToRgb(
        hsl(THEMES.find((t) => t.theme === other)!.foundation, "primary-foreground"),
      );
      const pair = other === "dark" ? "lighten" : "darken";
      for (const fill of [
        seed,
        stepped("primary-hover", pair, seed),
        stepped("primary-active", pair, seed),
      ]) {
        expect(contrast(hslToRgb(fill), otherLabel)).toBeGreaterThanOrEqual(AA_TEXT);
      }
    });
  }
});

describe("AA by construction — every seed on a dense grid", () => {
  /** Label polarity → the pair that steps away from it, and the label the package ships for it. */
  const PAIRS = [
    { pair: "darken", label: hslToRgb(hsl(THEMES[0].foundation, "primary-foreground")) },
    { pair: "lighten", label: hslToRgb(hsl(THEMES[1].foundation, "primary-foreground")) },
  ] as const;

  it.each(PAIRS)(
    "$pair: a fill that clears AA at rest clears it in hover and pressed",
    ({ pair, label }) => {
      // 72 hues × 6 saturations × 99 lightnesses. Lightness is monotonic in every sRGB channel at
      // fixed H and S, so a step AWAY from the label can only raise the ratio; the one step that goes
      // TOWARDS it (`lighten` pressed, reflected past 83.4% L) still lands ≥ 77.6% L, which this grid
      // shows is enough for the package's dark label.
      let checked = 0;
      const failures: string[] = [];
      for (let h = 0; h < 360; h += 5) {
        for (const s of [0, 10, 25, 50, 75, 100]) {
          for (let l = 1; l < 100; l += 1) {
            const seed: Hsl = [h, s, l];
            if (contrast(hslToRgb(seed), label) < AA_TEXT) continue;
            checked += 1;
            for (const name of ["primary-hover", "primary-active"] as const) {
              const ratio = contrast(hslToRgb(stepped(name, pair, seed)), label);
              if (ratio < AA_TEXT) failures.push(`${seed.join(" ")} ${name} ${round2(ratio)}`);
            }
          }
        }
      }
      expect(checked, "the grid must actually exercise seeds").toBeGreaterThan(15000);
      expect(failures).toEqual([]);
    },
  );
});

/* ────────────────────────────────────────────────────────────────────────────
 * 4. THE JS PATH IS THE SAME FORMULA.
 * ──────────────────────────────────────────────────────────────────────────── */
describe("applyPrimaryColor lands on the CSS formula, not a second one", () => {
  it("writes no colour of its own for the family — it resets the knobs to the live default", () => {
    const root = document.createElement("div");
    applyPrimaryColor(root, "#0071bd");
    for (const name of FAMILY) expect(root.style.getPropertyValue(`--${name}`)).toBe("initial");
  });

  it("picks the step pair from the label it chose, and that pair keeps the label at AA", () => {
    const failures: string[] = [];
    let checked = 0;
    for (let r = 0; r <= 255; r += 17) {
      for (let g = 0; g <= 255; g += 17) {
        for (let b = 0; b <= 255; b += 17) {
          const color = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
          const root = document.createElement("div");
          applyPrimaryColor(root, color);
          const seed = triplet(root.style.getPropertyValue("--primary"));
          const label = hslToRgb(triplet(root.style.getPropertyValue("--primary-foreground")));
          const pairs = ["hover", "active"].map((step) =>
            root.style
              .getPropertyValue(`--primary-${step}-channels`)
              .match(/^var\(--primary-(hover|active)-(darken|lighten)-channels\)$/),
          );
          expect(pairs[0], color).not.toBeNull();
          expect(pairs[1]![2]).toBe(pairs[0]![2]);
          const pair = pairs[0]![2];
          // The pair must step AWAY from the label: darken under a light label, lighten under a dark.
          expect(pair).toBe(
            contrast(label, [255, 255, 255]) < contrast(label, [0, 0, 0]) ? "darken" : "lighten",
          );
          const rest = contrast(hslToRgb(seed), label);
          if (rest < AA_TEXT) continue;
          checked += 1;
          for (const name of ["primary-hover", "primary-active"] as const) {
            const ratio = contrast(hslToRgb(stepped(name, pair, seed)), label);
            if (ratio < AA_TEXT) failures.push(`${color} ${name} ${round2(ratio)}`);
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(1000);
    expect(failures).toEqual([]);
  });
});
