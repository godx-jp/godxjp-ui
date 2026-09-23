/**
 * gh#861 / gh#868 — a customer's own hex, worn by one region, at runtime.
 *
 * Three things two consumer repos each hand-rolled, and the measurement that holds each:
 *
 *   1. hex → HSL triplet. The package shipped `hslToHex` (9 occurrences in `dist/`) and not its
 *      inverse, so a consumer repo wrote an 18-line `hexToHslChannels` of its own. Held here by a
 *      ROUND TRIP against the package's own `hslToHex`, over a grid, to a stated error bound.
 *   2. the contrast rule for `--primary-foreground`. Held by sweeping the whole sRGB cube: the
 *      chosen label clears WCAG 2.2 SC 1.4.3 AA (4.5:1) for EVERY seed, and the worst case in the
 *      cube is reported so the claim is a number rather than an adjective.
 *   3. hover / pressed. A consumer repo guards them behind `CSS.supports("color", "hsl(from red h s
 *      l)")`, so on an engine without relative colour the tenant colour applies at rest and NOT on
 *      hover — silently. `tenantTheme` emits both steps as literals instead; held here EQUAL to the
 *      CSS formula in `src/tokens/derived.css`, evaluated the way the browser would, for a sweep of
 *      seeds and both label polarities. One formula, two encodings.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { hslToHex } from "../../email/color";
import {
  channelsOf,
  contrast,
  hsl,
  hslToRgb,
  luminance,
  relative,
  triplet,
} from "../../tokens/__tests__/wcag-contrast";
import {
  AA_NORMAL_TEXT,
  contrastRatio,
  hexToHsl,
  relativeLuminance,
  tenantTheme,
} from "../tenant-theme";

type Hsl = [number, number, number];

const round2 = (n: number) => Math.round(n * 100) / 100;
const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];

/* ────────────────────────────────────────────────────────────────────────────
 * 1. THE DIRECTION THE PACKAGE WAS MISSING
 * ──────────────────────────────────────────────────────────────────────────── */
describe("hexToHsl — the inverse of hslToHex (gh#868 gap 1)", () => {
  it.each([
    ["#0071bd", "204.13 100% 37.06%"],
    ["#7a00ff", "268.71 100% 50%"],
    ["#ffffff", "0 0% 100%"],
    ["#000000", "0 0% 0%"],
    ["#808080", "0 0% 50.2%"],
  ])("%s → %s", (hex, expected) => {
    expect(hexToHsl(hex)).toBe(expected);
  });

  it("accepts the 3-digit form ColorPicker also produces", () => {
    expect(hexToHsl("#fff")).toBe(hexToHsl("#ffffff"));
    expect(hexToHsl("#0Bd")).toBe(hexToHsl("#00bbdd"));
  });

  it.each(["", "red", "0071bd", "#nope00", "#fff; color:red", "#12345"])(
    "returns null for %s rather than throwing",
    (value) => {
      expect(hexToHsl(value)).toBeNull();
    },
  );

  /**
   * THE ERROR BOUND, AND WHY IT IS NOT ZERO. Hex is 8 bits per channel; HSL is continuous. The
   * triplet is emitted rounded to 2dp (a token a human reads), so a round trip may land one
   * 1/255 step away on a channel. The bound asserted is therefore ONE hex step per channel, and
   * the measured worst case over the grid is reported beside it.
   */
  it("round-trips hexToHsl → hslToHex within one 1/255 step per channel", () => {
    let worst = 0;
    let worstAt = "";
    let checked = 0;
    for (let r = 0; r <= 255; r += 3) {
      for (let g = 0; g <= 255; g += 3) {
        for (let b = 0; b <= 255; b += 3) {
          const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
          const back = hslToHex(hexToHsl(hex)!);
          checked += 1;
          for (const offset of [1, 3, 5]) {
            const delta = Math.abs(
              parseInt(hex.slice(offset, offset + 2), 16) -
                parseInt(back.slice(offset, offset + 2), 16),
            );
            if (delta > worst) {
              worst = delta;
              worstAt = `${hex} → ${back}`;
            }
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(600_000);
    expect(worst, `worst round-trip error: ${worstAt}`).toBeLessThanOrEqual(1);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 2. THE CONTRAST RULE — STATED, MEASURED, AND REPORTABLE
 * ──────────────────────────────────────────────────────────────────────────── */
describe("the label clears WCAG 2.2 SC 1.4.3 AA for every seed (gh#868 gap 2)", () => {
  /**
   * REAL CUSTOMER COLOURS, including the two shapes where a naive rule fails: a very light seed
   * (a "always white" rule gives 1.3:1 on #FFD400) and a very dark one (an "always black" rule
   * gives 1.4:1 on #0A1F44). The table is the evidence a consumer can re-run.
   */
  const CUSTOMERS = [
    ["#0071bd", "GoDX blue (the seed both consumer repos quote)"],
    ["#7a00ff", "GoDX violet — the package's own seed"],
    ["#FFD400", "a very LIGHT seed — 'always white' fails here"],
    ["#0A1F44", "a very DARK seed — 'always black' fails here"],
    ["#E30613", "a saturated red"],
    ["#00A86B", "jade green"],
    ["#767676", "the mid grey that is the worst case for any two-candidate rule"],
    ["#f5f5f5", "near-white"],
    ["#1a1a1a", "near-black"],
    ["#8b5cf6", "mid violet"],
  ] as const;

  it("contrast table — every customer colour, the label chosen and the ratio achieved", () => {
    const rows = CUSTOMERS.map(([hex, why]) => {
      const seed = tenantTheme(hex);
      return {
        seed: hex,
        label: seed.foreground,
        ratio: round2(seed.contrast),
        meetsAA: seed.meetsAA,
        why,
      };
    });
    // Printed so the table in the issue and the table in the docs are the same measurement.
    console.table(rows.map(({ why: _why, ...row }) => row));
    for (const row of rows) {
      expect(row.ratio, `${row.seed} (${row.why})`).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      expect(row.meetsAA).toBe(true);
    }
    // The two shapes a naive rule gets wrong, named rather than merely covered.
    expect(rows.find((r) => r.seed === "#FFD400")!.label).toBe("#000000");
    expect(rows.find((r) => r.seed === "#0A1F44")!.label).toBe("#ffffff");
  });

  it("no sRGB colour exists for which the chosen label misses AA", () => {
    let worst = Infinity;
    let worstAt = "";
    let checked = 0;
    for (let r = 0; r <= 255; r += 3) {
      for (let g = 0; g <= 255; g += 3) {
        for (let b = 0; b <= 255; b += 3) {
          const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
          const { contrast: ratio } = tenantTheme(hex);
          checked += 1;
          if (ratio < worst) {
            worst = ratio;
            worstAt = hex;
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(600_000);
    // The pivot at relative luminance 0.179 is where both candidates are equal; nothing in the
    // cube can be worse than that, and the number below is the claim the module's comment makes.
    expect(
      worst,
      `worst seed in the cube: ${worstAt} at ${round2(worst)}:1`,
    ).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(round2(worst)).toBeLessThan(4.7);
  });

  it("agrees with the package's own contrast helper", () => {
    for (const [hex] of CUSTOMERS) {
      const seed = tenantTheme(hex);
      expect(seed.contrast).toBeCloseTo(contrastRatio(hex, seed.foreground!)!, 10);
      // Through the TRIPLET rather than the hex — the triplet is rounded to 2dp for a human
      // reader, so the two agree to ~1e-3, not to the float.
      expect(seed.contrast).toBeCloseTo(
        contrast(
          hslToRgb(triplet(seed.vars["--primary"])),
          hslToRgb(triplet(seed.vars["--primary-foreground"])),
        ),
        2,
      );
    }
  });

  it("relativeLuminance is WCAG's definition — the two anchors and a null", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 12);
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("not a colour")).toBeNull();
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 10);
  });
});

describe("a supplied foreground is used as given, and reported — never silently replaced", () => {
  afterEach(() => vi.restoreAllMocks());

  it("keeps Platform's server-computed pair and reports its real ratio", () => {
    // godx-jp/id stores {"primary_color": {"foreground": "#23221e", "contrast": 7.42}}.
    const seed = tenantTheme("#FFD400", { foreground: "#23221e" });
    expect(seed.foreground).toBe("#23221e");
    expect(round2(seed.contrast)).toBe(11.12);
    expect(seed.meetsAA).toBe(true);
  });

  it("SAYS NO rather than returning white when the supplied pair misses AA", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const seed = tenantTheme("#0071bd", { foreground: "#3b82f6" });
    expect(seed.meetsAA).toBe(false);
    expect(round2(seed.contrast)).toBeLessThan(AA_NORMAL_TEXT);
    // The label is NOT swapped behind the consumer's back — it is reported.
    expect(seed.foreground).toBe("#3b82f6");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("SC 1.4.3");
  });

  it("does not warn when the supplied pair clears AA, nor when it chose the label itself", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    tenantTheme("#0071bd", { foreground: "#ffffff" });
    tenantTheme("#767676");
    expect(warn).not.toHaveBeenCalled();
  });

  it("falls back to the contrast-safe label when the supplied one is not a hex", () => {
    const seed = tenantTheme("#0A1F44", { foreground: "rgb(255,0,0)" });
    expect(seed.foreground).toBe("#ffffff");
    expect(seed.meetsAA).toBe(true);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 3. HOVER AND PRESSED — THE SILENT HALF-APPLICATION, CLOSED
 * ──────────────────────────────────────────────────────────────────────────── */
describe("the literal steps ARE the CSS formula (gh#868 gap 3 / gh#678)", () => {
  const derived = readFileSync(join(process.cwd(), "src/tokens/derived.css"), "utf8");
  const light = derived.slice(derived.indexOf(":root {"), derived.indexOf("@supports not (color"));

  /** What `hsl(var(--primary-<step>, from hsl(var(--primary)) <pair> ))` paints for this seed. */
  const cssStep = (step: "hover" | "active", pair: "darken" | "lighten", seed: Hsl) =>
    relative(seed, channelsOf(`primary-${step}-${pair}`, light));

  it("emits --primary, --primary-foreground, --ring, the two states and the three inks — nothing else", () => {
    expect(Object.keys(tenantTheme("#0071bd").vars)).toEqual([
      "--primary",
      "--primary-foreground",
      "--ring",
      "--primary-hover",
      "--primary-active",
      "--text-link",
      "--text-brand",
      "--text-primary",
    ]);
  });

  it("matches the CSS formula for a sweep of seeds, in both polarities", () => {
    const failures: string[] = [];
    let checked = 0;
    for (let r = 0; r <= 255; r += 17) {
      for (let g = 0; g <= 255; g += 17) {
        for (let b = 0; b <= 255; b += 17) {
          const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
          const seed = tenantTheme(hex);
          const source = triplet(seed.vars["--primary"]) as Hsl;
          // The pair steps AWAY from the label the module chose — darken under a light label.
          const label = hslToRgb(triplet(seed.vars["--primary-foreground"]));
          const pair = contrast(label, WHITE) < contrast(label, BLACK) ? "darken" : "lighten";
          checked += 1;
          for (const step of ["hover", "active"] as const) {
            const mine = triplet(seed.vars[`--primary-${step}`]) as Hsl;
            const theirs = cssStep(step, pair, source);
            for (const channel of [0, 1, 2]) {
              if (Math.abs(mine[channel] - theirs[channel]) > 0.01) {
                failures.push(`${hex} --primary-${step}: ${mine.join(" ")} vs ${theirs.join(" ")}`);
              }
            }
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(4000);
    expect(failures).toEqual([]);
  });

  it("the steps keep the label at AA — a state a reader hovers is not a state that loses contrast", () => {
    const failures: string[] = [];
    for (let r = 0; r <= 255; r += 17) {
      for (let g = 0; g <= 255; g += 17) {
        for (let b = 0; b <= 255; b += 17) {
          const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
          const seed = tenantTheme(hex);
          const label = hslToRgb(triplet(seed.vars["--primary-foreground"]));
          for (const step of ["hover", "active"] as const) {
            const ratio = contrast(hslToRgb(triplet(seed.vars[`--primary-${step}`])), label);
            if (ratio < AA_NORMAL_TEXT) failures.push(`${hex} ${step} ${round2(ratio)}`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("a pale seed steps UP, a dark seed steps DOWN — the polarity follows the label, not the theme", () => {
    const pale = tenantTheme("#FFD400"); // black label ⇒ lighten
    const dark = tenantTheme("#0A1F44"); // white label ⇒ darken
    const lightnessOf = (value: string) => triplet(value)[2];
    expect(lightnessOf(pale.vars["--primary-hover"])).toBeGreaterThan(
      lightnessOf(pale.vars["--primary"]),
    );
    expect(lightnessOf(dark.vars["--primary-hover"])).toBeLessThan(
      lightnessOf(dark.vars["--primary"]),
    );
  });

  it("the pressed step reflects below the seed past 83.4% L instead of running off the ramp", () => {
    // #fffbe6 sits at 96.7% L with a black label; the conventional +11.6 would land at 108%.
    const seed = tenantTheme("#fffbe6");
    const l = (value: string) => triplet(value)[2];
    expect(l(seed.vars["--primary"])).toBeGreaterThan(83.4);
    expect(l(seed.vars["--primary-active"])).toBeLessThan(l(seed.vars["--primary"]));
    expect(l(seed.vars["--primary-active"])).toBeCloseTo(l(seed.vars["--primary"]) - 5.8, 6);
  });

  it("clamps rather than emitting an out-of-range lightness", () => {
    for (const hex of ["#000000", "#ffffff", "#050505", "#fafafa"]) {
      for (const step of ["hover", "active"] as const) {
        const [, s, l] = triplet(tenantTheme(hex).vars[`--primary-${step}`]);
        expect(l).toBeGreaterThanOrEqual(0);
        expect(l).toBeLessThanOrEqual(100);
        expect(s).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 4. SCOPED, NOT :root — AND THE FREEZE RULE
 * ──────────────────────────────────────────────────────────────────────────── */
describe("a region, not the document (gh#861)", () => {
  it("degrades to the app's own theme for an unusable seed instead of breaking the page", () => {
    for (const value of ["", "red", "#nope00", "#fff; color:red", "rgb(0,0,0)"]) {
      const seed = tenantTheme(value);
      expect(seed.vars).toEqual({});
      expect(seed.primary).toBeNull();
      expect(seed.meetsAA).toBe(false);
      expect(seed.contrast).toBe(0);
    }
  });

  it("restates --ring in the scope — derived.css binds it at :root, where it freezes", () => {
    const seed = tenantTheme("#0071bd");
    expect(seed.vars["--ring"]).toBe(seed.vars["--primary"]);
    // The exception is declared in derived.css and in CUSTOMER-THEMING; assert it is still there,
    // because the day --ring becomes an `initial` knob this line must come out.
    const derived = readFileSync(join(process.cwd(), "src/tokens/derived.css"), "utf8");
    expect(derived).toContain("--ring: var(--primary);");
  });

  it("a nested region carries its OWN pair — a literal declared on the scope cannot freeze below it", () => {
    const outer = tenantTheme("#0071bd");
    const inner = tenantTheme("#FFD400");
    for (const key of Object.keys(outer.vars)) {
      expect(inner.vars[key], key).not.toBe(outer.vars[key]);
    }
    // …and the inner label flips, which is the whole reason the pair must travel together.
    expect(outer.foreground).toBe("#ffffff");
    expect(inner.foreground).toBe("#000000");
  });

  it("the result is frozen — a consumer cannot mutate the declarations it just spread", () => {
    const seed = tenantTheme("#0071bd");
    expect(Object.isFrozen(seed.vars)).toBe(true);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 5. THE BRAND AS INK (gh#887)
 *
 * The pair above is a FILL and its label. Nothing guaranteed the brand used as INK on a page
 * surface, and the theme lab's `base` column measured 1.18–2.06:1 at `#FFD400` and 2.16–3.64:1 at
 * `#E2564A`, at rest and hovered — a brand that passes this module's own contrast computation and
 * still ships an unreadable sidebar. The roles already existed (`--text-link` / `--text-brand` /
 * `--text-primary`); what they lacked was a FLOOR, because a lightness step is not a contrast
 * guarantee. These hold the floor for the whole sRGB cube rather than for the seeds we tried.
 * ──────────────────────────────────────────────────────────────────────────── */
describe("the brand INK clears AA on the surface it lands on (gh#887)", () => {
  const derived = readFileSync(join(process.cwd(), "src/tokens/derived.css"), "utf8");
  const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
  const lightBlock = derived.slice(derived.indexOf(":root {"), derived.indexOf(".dark,"));
  const darkBlock = derived.slice(
    derived.indexOf(".dark,"),
    derived.indexOf("@supports not (color"),
  );

  /** The darkest / lightest surface brand ink lands on: `--accent` in each block of foundation.css. */
  const LIGHT_SURFACE = hsl(foundation.slice(0, foundation.indexOf(".dark,")), "accent");
  const DARK_SURFACE = hsl(foundation.slice(foundation.indexOf(".dark,")), "accent");
  /** The pixel the browser paints for a triplet — integers, the way a screen composites it. */
  const paint = (value: string) =>
    hslToRgb(triplet(value)).map((v) => Math.round(v)) as [number, number, number];
  const hexOf = (rgb: [number, number, number]) =>
    `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
  const INKS = ["--text-link", "--text-brand", "--text-primary"] as const;
  const grid = (): string[] => {
    const out: string[] = [];
    for (let r = 0; r <= 255; r += 17)
      for (let g = 0; g <= 255; g += 17)
        for (let b = 0; b <= 255; b += 17)
          out.push(`#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`);
    return out;
  };

  it("the surface it defaults to IS --accent, not --background — the hovered half of the defect", () => {
    // 4.5:1 on --background is 3.78:1 on --accent, and that gap is where the lab measured 1.18:1
    // and 3.06:1 on HOVER while the resting string on the page canvas passed. So the default is the
    // darker of the two, and this asserts the module did not quietly pick the easier one.
    const background = hsl(foundation.slice(0, foundation.indexOf(".dark,")), "background");
    expect(luminance(hslToRgb(LIGHT_SURFACE))).toBeLessThan(luminance(hslToRgb(background)));
    expect(hexOf(hslToRgb(LIGHT_SURFACE))).toBe("#ebe9e5");
    expect(hexOf(hslToRgb(DARK_SURFACE))).toBe("#3c3a34");
  });

  it("THE DEFAULT SEED IS UNCHANGED — byte-identical to the literals derived.css already ships", () => {
    // derived.css's `@supports not` block carries what 25.4.0 shipped to every engine for the
    // package seed. The clamp is a no-op there (violet ink is 6.2:1 on --accent), so these three
    // must come out exactly equal — a fix that moved the default would be a re-theme, not a fix.
    const seed = tenantTheme("#7A00FF");
    expect(triplet(seed.vars["--text-link"])).toEqual([268.71, 100, 41.6]);
    expect(triplet(seed.vars["--text-brand"])).toEqual([268.71, 100, 41.6]);
    expect(triplet(seed.vars["--text-primary"])).toEqual([268.71, 100, 34.5]);
    for (const [role, expected] of [
      ["text-link", "268.7 100% 41.6%"],
      ["text-brand", "268.7 100% 41.6%"],
      ["text-primary", "268.7 100% 34.5%"],
    ] as const) {
      expect(derived).toContain(`--${role}: ${expected};`);
    }
  });

  it("is the derived.css ink ramp wherever the step already clears — one formula, two encodings", () => {
    const failures: string[] = [];
    let clamped = 0;
    let checked = 0;
    for (const hex of grid()) {
      const seed = tenantTheme(hex);
      const source = triplet(seed.vars["--primary"]) as Hsl;
      for (const [role, css] of [
        ["--text-link", channelsOf("text-link", lightBlock)],
        ["--text-primary", channelsOf("text-primary", lightBlock)],
      ] as const) {
        const mine = triplet(seed.vars[role]) as Hsl;
        const theirs = relative(source, css);
        checked += 1;
        // The clamp only ever moves the ink DOWN a light surface, never up, and never past it.
        if (mine[2] < theirs[2] - 0.01) {
          clamped += 1;
          continue;
        }
        for (const channel of [0, 1, 2]) {
          if (Math.abs(mine[channel] - theirs[channel]) > 0.01) {
            failures.push(`${hex} ${role}: ${mine.join(" ")} vs ${theirs.join(" ")}`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
    // A clamp that never fires would mean the guarantee is vacuous; one that always fires would
    // mean the ramp was thrown away. Both branches must be real, and the count is the evidence.
    expect(clamped).toBeGreaterThan(0);
    expect(checked - clamped).toBeGreaterThan(checked / 4);
    console.info(
      `gh#887 ink: ${clamped}/${checked} of the grid needed the clamp, ` +
        `${checked - clamped} kept the derived.css ramp step exactly`,
    );
  });

  it("follows the SURFACE in dark too — the dark ramp, walked UP instead of down", () => {
    const failures: string[] = [];
    for (const hex of grid()) {
      const seed = tenantTheme(hex, { surface: hexOf(hslToRgb(DARK_SURFACE)) });
      const source = triplet(seed.vars["--primary"]) as Hsl;
      for (const [role, css] of [
        ["--text-link", channelsOf("text-link", darkBlock, lightBlock)],
        ["--text-primary", channelsOf("text-primary", darkBlock, lightBlock)],
      ] as const) {
        const mine = triplet(seed.vars[role]) as Hsl;
        const theirs = relative(source, css);
        // Same rule mirrored: on a dark surface the clamp may only LIGHTEN the ramp step.
        if (mine[2] < theirs[2] - 0.01) failures.push(`${hex} ${role} walked the wrong way`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("NO sRGB SEED EXISTS whose ink misses AA — on either surface, for all three roles", () => {
    const failures: string[] = [];
    const worst: Record<string, number> = {};
    for (const [name, surface] of [
      ["light --accent", LIGHT_SURFACE],
      ["dark --accent", DARK_SURFACE],
    ] as const) {
      const surfaceHex = hexOf(hslToRgb(surface));
      const surfacePixel = paint(`${surface[0]} ${surface[1]}% ${surface[2]}%`);
      worst[name] = Infinity;
      for (const hex of grid()) {
        const seed = tenantTheme(hex, { surface: surfaceHex });
        for (const role of INKS) {
          const ratio = contrast(paint(seed.vars[role]), surfacePixel);
          worst[name] = Math.min(worst[name], ratio);
          if (ratio < AA_NORMAL_TEXT) failures.push(`${hex} ${role} on ${name} ${round2(ratio)}`);
        }
      }
    }
    expect(failures).toEqual([]);
    console.info(
      `gh#887 ink worst case over the cube: ` +
        Object.entries(worst)
          .map(([k, v]) => `${k} ${round2(v)}:1`)
          .join(" · "),
    );
    for (const value of Object.values(worst)) expect(value).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it("walks no further than it must — one 0.1 step back towards the ramp always fails", () => {
    const surfacePixel = paint(`${LIGHT_SURFACE[0]} ${LIGHT_SURFACE[1]}% ${LIGHT_SURFACE[2]}%`);
    let asserted = 0;
    for (const hex of ["#FFD400", "#E2564A", "#ffff00", "#7fff00", "#44ccff", "#fdfdfc"]) {
      const seed = tenantTheme(hex);
      const source = triplet(seed.vars["--primary"]) as Hsl;
      for (const [role, css] of [
        ["--text-link", channelsOf("text-link", lightBlock)],
        ["--text-primary", channelsOf("text-primary", lightBlock)],
      ] as const) {
        const [h, s, l] = triplet(seed.vars[role]);
        // Only where the clamp actually fired: an untouched ramp step is free to clear by a mile.
        if (l >= relative(source, css)[2] - 0.01 || l <= 0) continue;
        asserted += 1;
        const nearer = contrast(paint(`${h} ${s}% ${round2(l + 0.1)}%`), surfacePixel);
        expect(nearer, `${hex} ${role} walked past the floor`).toBeLessThan(AA_NORMAL_TEXT);
      }
    }
    expect(asserted).toBeGreaterThan(5);
  });

  it("THE FIVE LAB SEEDS — the ratio before the clamp and after, on both surfaces", () => {
    const table: string[] = [];
    const surfacePixel = paint(`${LIGHT_SURFACE[0]} ${LIGHT_SURFACE[1]}% ${LIGHT_SURFACE[2]}%`);
    for (const [name, hex] of [
      ["violet", "#7C3AED"],
      ["azure", "#2563EB"],
      ["coral", "#E2564A"],
      ["citron", "#FFD400"],
      ["navy", "#0A1F44"],
    ] as const) {
      const seed = tenantTheme(hex);
      const source = triplet(seed.vars["--primary"]) as Hsl;
      const before = relative(source, channelsOf("text-link", lightBlock));
      const beforeRatio = contrast(paint(`${before[0]} ${before[1]}% ${before[2]}%`), surfacePixel);
      const afterRatio = contrast(paint(seed.vars["--text-link"]), surfacePixel);
      // The brand used as ink RAW — `color: hsl(var(--primary))`, which is what nine of the ten
      // failing strings in the lab actually read. It does not move here; it is the wiring half.
      const rawRatio = contrast(paint(seed.vars["--primary"]), surfacePixel);
      table.push(
        `${name.padEnd(7)} ${hex}  --text-link ${round2(beforeRatio)}:1 → ${round2(afterRatio)}:1` +
          `   raw --primary as ink ${round2(rawRatio)}:1`,
      );
      expect(afterRatio, `${name} ink`).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      expect(afterRatio, `${name} ink`).toBeGreaterThanOrEqual(beforeRatio - 0.01);
    }
    console.info(`gh#887 five seeds on --accent (#ebe9e5):\n${table.join("\n")}`);
  });

  it("ignores a surface that is not a hex rather than walking against a NaN", () => {
    const fallback = tenantTheme("#FFD400");
    for (const value of ["", "accent", "hsl(40 13% 91%)", "#nope00", null]) {
      expect(tenantTheme("#FFD400", { surface: value }).vars).toEqual(fallback.vars);
    }
  });
});
