/**
 * TENANT BRAND SEED — a CUSTOMER's own hex, worn by one REGION of a page, at runtime (gh#861, gh#868).
 *
 * WHAT THIS IS NOT. It is not a component, and the ledger for that is in
 * docs/COMPOSITION-VS-COMPONENT.md §3.2: a `<TenantTheme>` wrapper owns no state, no keyboard, no
 * focus and no ARIA (C2), is `<div style={…}>` over token overrides the doctrine already blesses
 * (C3), has no `value`/`onValueChange`/`size` to map onto (C4), and renders no text for `t()` or
 * the APG to say anything about (C6). What two consumers actually hand-rolled — measured, in
 * gh#868 — is the ARITHMETIC: hex → HSL triplet, and the contrast rule that picks the label. That
 * is what ships here, as functions, so it is callable from a server (Platform already computes its
 * pair at write time), from a `<style>` block with no hydration flash, and from a test with no DOM.
 *
 * ── THE CONTRAST RULE, STATED (WCAG 2.2 SC 1.4.3 Contrast (Minimum), AA) ──────────────────────
 * Relative luminance L of an sRGB colour is WCAG's own definition:
 *
 *     c ∈ {R,G,B}/255 ;  c′ = c ≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4
 *     L = 0.2126·R′ + 0.7152·G′ + 0.0722·B′
 *
 * and the ratio of two colours is (L_lighter + 0.05) / (L_darker + 0.05).
 *
 * THE THRESHOLD IS 4.5:1 — normal text, SC 1.4.3. The label is whichever of `#ffffff` / `#000000`
 * scores higher on the seed, which is the pivot at L = 0.179 (solve 1.05/(L+0.05) = (L+0.05)/0.05).
 * That choice is not "usually fine": at the pivot BOTH candidates measure 4.58:1, and away from it
 * the winner only rises, so **the chosen label clears AA for every sRGB seed, by construction** —
 * proved over the full 0–255³ grid in `src/app/__tests__/tenant-theme.test.ts`. The returned
 * `contrast` is the achieved ratio, so a consumer can check the arithmetic rather than trust it.
 *
 * WHEN THE CONSUMER SUPPLIES THE LABEL, it is used as given — Platform stores a server-computed,
 * WCAG-checked pair in `brands.theme_tokens` and must not have it silently second-guessed — but
 * `contrast` / `meetsAA` report what it actually achieves, and a dev build warns when it is under
 * 4.5:1. `meetsAA: false` is the API SAYING no, instead of quietly returning white.
 *
 * ── HOVER AND PRESSED ARE LITERALS HERE, AND THAT IS THE POINT ────────────────────────────────
 * `src/tokens/derived.css` computes the primary family at the painting element with CSS relative
 * colour (`hsl(from hsl(var(--primary)) h s calc(l - 8.4))`), and engines without it
 * (Chrome/Edge 111–118) fall back to `:root` literals of the PACKAGE seed. A tenant colour would
 * therefore apply at rest and not on hover, with no error and no warning — the exact shape gh#868
 * reports a consumer repo guarding by hand with `CSS.supports("color", "hsl(from red h s l)")`.
 *
 * So this module does not feature-detect: it computes the two steps in JS from the SAME channel
 * formulas and emits them as literal triplets, on the same element that carries the seed. Every
 * engine, both states, one code path, no `CSS.supports`. The duplication of the numbers is held
 * correct by measurement, not by comment — `tenant-theme.test.ts` reads derived.css and evaluates
 * its channel expressions for a sweep of seeds, and fails if the two ever disagree.
 *
 * THE FREEZE RULE STILL HOLDS (docs/TOKENS.md · "Role-mirror knobs MUST be `initial`"). A literal
 * freezes when it is declared ABOVE the scope that re-seeds; these are declared ON that scope, by
 * the same call that sets `--primary`, so a nested region that re-seeds through this function
 * re-emits its own pair. `--ring` is here for the same reason — derived.css declares
 * `--ring: var(--primary)` at `:root`, where it computes ONCE, so a scope below `<html>` inherits
 * the root's ring unless it restates it.
 *
 * ── THE BRAND AS INK, NOT ONLY AS A FILL (gh#887) ────────────────────────────────────────────
 * The pair above guarantees `--primary` against `--primary-foreground` — a fill and the label
 * riding on it. It says NOTHING about `--primary` used as INK on a page surface, and a sidebar
 * active item, a NavList item, a MegaMenu trigger, an Anchor link, `Text link` and
 * `Button variant="link"` all do exactly that. So a brand could pass this module's own contrast
 * computation and still ship an unreadable navigation: measured on the theme lab's `base` column,
 * `#FFD400` gave 1.18–2.06:1 and `#E2564A` 2.16–3.64:1, at rest AND hovered.
 *
 * That role is NOT new. `src/tokens/derived.css` already publishes three brand inks — `--text-link`
 * (the link), `--text-brand` (the brand as ink anywhere else) and `--text-primary` (the pressed
 * ink, with the `--mark-*` tier hanging off it). What they lacked is a FLOOR: each is a plain
 * lightness step off the seed (`l - 8.4`, `l - 15.5`), and a step is not a contrast guarantee —
 * `#FFD400` minus 8.4 lightness is #d4b000, which is 2.06:1 on the page and 1.73:1 on the hover
 * fill. So this module now emits the three as literals, each walked AWAY from the surface until it
 * clears 4.5:1, and no further. A seed whose step already clears is emitted unchanged, which is why
 * the package's own violet is byte-identical to what it was before gh#887.
 *
 * WHAT "THE SURFACE" MEANS, and it is the hovered half of the defect: the DARKEST surface the ink
 * lands on, `--accent` (#ebe9e5), not the page canvas `--background` (#fdfdfc). An ink clamped to
 * exactly 4.5:1 on #fdfdfc measures 3.78:1 the moment the row under it is hovered — the factor
 * between the two surfaces is 1.191, and that is precisely where the lab measured 1.18:1 and
 * 3.06:1. `options.surface` overrides it, and a region inside a DARK theme must pass the dark
 * surface (`--accent` there is #3c3a34) or its ink is walked the wrong way.
 *
 * STILL NOT TOUCHED. `--primary-border` and `--control-outline` are left to derive: their channels
 * are per-theme, and they are a hairline and an 11% halo rather than a string a reader has to read.
 */
import { isDevelopment } from "../lib/dev";

/** A bare CSS HSL channel triplet, `"H S% L%"` — the shape every `@godxjp/ui` colour role uses. */
export type HslTriplet = string;

/** WCAG 2.2 SC 1.4.3 Contrast (Minimum) — normal text. */
export const AA_NORMAL_TEXT = 4.5;
/** WCAG 2.2 SC 1.4.3 Contrast (Minimum) — large text (≥18.66px bold / ≥24px). */
export const AA_LARGE_TEXT = 3;

/**
 * The two lightness steps of the primary family, mirroring `src/tokens/derived.css`. A state steps
 * the fill AWAY from the label riding on it, so `darken` goes with a light label and `lighten` with
 * a dark one. `lighten`'s pressed step reflects BELOW the seed past 83.4% L, where the conventional
 * step would run off the top of the ramp (derived.css explains the number).
 */
const STEPS = {
  darken: { hover: (l: number) => l - 8.4, active: (l: number) => l - 15.5 },
  lighten: {
    hover: (l: number) => l + 5.8,
    active: (l: number) => (l > 83.4 ? l - 5.8 : l + 11.6),
  },
} as const;

/**
 * The brand-INK ramp of `src/tokens/derived.css`, read off its two blocks rather than restated:
 * `--text-link` / `--text-brand` are one step DOWN from the action colour in light
 * (`--text-link-channels: var(--primary-hover-channels)`) and the seed ITSELF in dark (`h s l`);
 * `--text-primary` is the pressed ink, two steps down in light and one hover step UP in dark. The
 * polarity here follows the SURFACE the ink sits on, not the label on the fill — an ink has no label
 * riding on it. `tenant-theme.test.ts` holds these equal to derived.css.
 */
const INK_STEPS = {
  light: { link: (l: number) => l - 8.4, pressed: (l: number) => l - 15.5 },
  dark: { link: (l: number) => l, pressed: (l: number) => l + 5.8 },
} as const;

/**
 * L = 0.179, the pivot of the label choice (solve 1.05/(L+0.05) = (L+0.05)/0.05). A surface above it
 * is one an ink walks DOWN away from, below it one an ink walks UP — and either end of the ramp is
 * achromatic, since `hsl(h s 0%)` is black and `hsl(h s 100%)` is white at every hue and saturation.
 * So the walk always reaches at least 4.58:1 and the guarantee is a property of the whole sRGB cube
 * rather than of the seeds we happened to try.
 *
 * EXPORTED because a component that paints its own fill has to make the same choice against it and
 * must not re-derive the number (gh#884: `Sidebar`'s brand mark).
 */
export const CONTRAST_PIVOT = 0.179;

/**
 * The darkest surface brand INK lands on in the package's LIGHT theme — `--accent`
 * (`src/tokens/foundation.css`, `40 13% 91%`), the hover fill under a nav item. NOT `--background`;
 * the docblock has the factor. `tenant-theme.test.ts` holds it equal to foundation.css.
 */
const INK_SURFACE_LIGHT = "#ebe9e5";

const HEX = /^#(?:[\da-f]{3}|[\da-f]{6})$/i;

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

/** `#abc` and `#aabbcc` → `[r, g, b]` in 0–1, or null. The `ColorPicker` contract, unchanged. */
function parseHex(value: string): [number, number, number] | null {
  if (typeof value !== "string" || !HEX.test(value.trim())) return null;
  const body = value.trim().slice(1);
  const full = body.length === 3 ? body.replace(/./g, (c) => c + c) : body;
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

const toHex = (rgb: readonly number[]): string =>
  `#${rgb
    .map((v) =>
      Math.round(clamp(v, 0, 1) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

/**
 * WCAG 2.2 relative luminance of an sRGB colour, per the definition quoted at the top of this file.
 * Accepts `#abc` / `#aabbcc`; returns null for anything else.
 */
export function relativeLuminance(hex: string): number | null {
  const rgb = parseHex(hex);
  return rgb === null ? null : luminanceOf(rgb);
}

function luminanceOf(rgb: readonly number[]): number {
  const coefficients = [0.2126, 0.7152, 0.0722];
  return rgb.reduce(
    (sum, channel, index) =>
      sum +
      (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4) *
        coefficients[index],
    0,
  );
}

/**
 * WCAG 2.2 contrast ratio between two hex colours, `(L_lighter + 0.05) / (L_darker + 0.05)`, in
 * 1–21. Returns null if either colour is not a hex. Compare against {@link AA_NORMAL_TEXT}.
 */
export function contrastRatio(a: string, b: string): number | null {
  const [first, second] = [relativeLuminance(a), relativeLuminance(b)];
  if (first === null || second === null) return null;
  const [hi, lo] = first >= second ? [first, second] : [second, first];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * `#0071bd` → `"204.13 100% 37.06%"` — the direction the package was missing (gh#868: `hslToHex`
 * appears 9 times in `dist/`, `hexToHsl` zero). The exact inverse of
 * {@link import("../email/color").hslToHex} within one hex step, which `tenant-theme.test.ts`
 * round-trips over a grid. Returns null for anything that is not a 3- or 6-digit hex, so an
 * unparseable customer value is ignored rather than breaking the page.
 */
export function hexToHsl(hex: string): HslTriplet | null {
  const rgb = parseHex(hex);
  return rgb === null ? null : tripletOf(rgb);
}

const round = (value: number, places: number) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const formatHsl = ([h, s, l]: readonly number[]): HslTriplet =>
  `${round(h, 2)} ${round(s, 2)}% ${round(l, 2)}%`;

function tripletOf(rgb: readonly number[]): HslTriplet {
  return formatHsl(toHsl(rgb));
}

/**
 * `[h, s, l]` → `[r, g, b]`, QUANTIZED to the 8 bits a screen actually paints — the inverse of
 * {@link toHsl}, held equal to `hslToHex` by `tenant-theme.test.ts`. The quantization matters: the
 * ink below is walked until the PIXEL clears 4.5:1, not until a real number does that then rounds to
 * one that does not.
 */
function fromHsl([h, s, l]: readonly number[]): [number, number, number] {
  const hue = (((h % 360) + 360) % 360) / 60;
  const chroma = (1 - Math.abs((2 * l) / 100 - 1)) * (s / 100);
  const second = chroma * (1 - Math.abs((hue % 2) - 1));
  const base = l / 100 - chroma / 2;
  const [r, g, b] =
    hue < 1
      ? [chroma, second, 0]
      : hue < 2
        ? [second, chroma, 0]
        : hue < 3
          ? [0, chroma, second]
          : hue < 4
            ? [0, second, chroma]
            : hue < 5
              ? [second, 0, chroma]
              : [chroma, 0, second];
  return [r, g, b].map((c) => Math.round(clamp(c + base, 0, 1) * 255) / 255) as [
    number,
    number,
    number,
  ];
}

/**
 * The lightness CLOSEST to `from` — walking away from `surface` — at which `hsl(h s l%)` clears
 * {@link AA_NORMAL_TEXT} on it. Returns `from` untouched when that already clears, which is why the
 * package's own violet seed emits exactly the inks it emitted before gh#887.
 *
 * A BISECTION of the 0.1 grid, and the reason it is sound needs stating because the ratio itself is
 * NOT monotone here: it is V-shaped in `l`, falling to 1:1 where the ink's luminance meets the
 * surface's and rising after. The PREDICATE still flips exactly once on the interval between `from`
 * and the achromatic end, because luminance is monotone in `l` — so `clears` is false next to `from`
 * and true from one grid point onward, and bisection finds that point in ~12 probes rather than the
 * 1000 a walk would take. 0.1 is the grid because it is what {@link formatHsl} emits.
 *
 * `h`, `s` and `from` arrive ALREADY ROUNDED the way `formatHsl` will emit them. Measuring an
 * unrounded triple and emitting a rounded one is not a rounding detail: at `#44ccff` the two
 * decimals of hue move the green channel across a 1/255 boundary, and the pixel that paints measures
 * 4.46:1 while the pixel that was measured measured 4.50:1. The guarantee has to be about the former.
 */
function inkLightness(h: number, s: number, from: number, surface: number): number {
  const clears = (l: number) => {
    const ink = luminanceOf(fromHsl([h, s, l]));
    const [hi, lo] = ink >= surface ? [ink, surface] : [surface, ink];
    return (hi + 0.05) / (lo + 0.05) >= AA_NORMAL_TEXT;
  };
  const start = clamp(from, 0, 100);
  if (clears(start)) return start;
  // Everything below counts in TENTHS of a lightness percent — the grid `formatHsl` can emit. The
  // far end is black on a light surface and white on a dark one, both ≥ 4.58:1 from anything on the
  // other side of the pivot, which is why the search always has an answer to find.
  const limit = surface > CONTRAST_PIVOT ? 0 : 1000;
  let fails = clamp(limit === 0 ? Math.floor(start * 10) : Math.ceil(start * 10), 0, 1000);
  if (clears(fails / 10)) return fails / 10;
  let passes = limit;
  if (!clears(passes / 10)) return passes / 10;
  while (Math.abs(passes - fails) > 1) {
    const mid = Math.round((passes + fails) / 2);
    if (clears(mid / 10)) passes = mid;
    else fails = mid;
  }
  return passes / 10;
}

/** [r,g,b] in 0–1 → [h in 0–360, s in 0–100, l in 0–100]. */
function toHsl(rgb: readonly number[]): [number, number, number] {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  const hue =
    delta === 0
      ? 0
      : 60 *
        (max === r
          ? ((g - b) / delta + 6) % 6
          : max === g
            ? (b - r) / delta + 2
            : (r - g) / delta + 4);
  return [hue, clamp(saturation, 0, 1) * 100, lightness * 100];
}

export type TenantThemeOptions = {
  /**
   * The label to paint ON the seed, as hex. Omit and the contrast-safe choice is made here. Supply
   * it — Platform stores a server-computed, WCAG-checked pair — and it is used as given, with
   * `contrast` / `meetsAA` reporting what it achieves and a dev warning under 4.5:1.
   */
  foreground?: string | null;
  /**
   * The surface the brand INK sits on, as hex — the DARKEST one it lands on in a light theme, the
   * LIGHTEST in a dark one, because the guarantee has to hold in the hovered state too. Default: the
   * package's light `--accent`, `#ebe9e5`. A region inside the dark theme passes `#3c3a34`
   * (`--accent` there); a themed consumer passes its own. Anything that is not a hex is ignored.
   */
  surface?: string | null;
};

export type TenantTheme = {
  /** The seed, normalized to `#rrggbb`, or null when the input was not a hex colour. */
  primary: string | null;
  /** The label on that seed, `#rrggbb`, or null when there is no seed. */
  foreground: string | null;
  /** WCAG 2.2 ratio of `foreground` on `primary`, 1–21. `0` when there is no seed. */
  contrast: number;
  /** `contrast >= 4.5` — WCAG 2.2 SC 1.4.3, normal text. */
  meetsAA: boolean;
  /**
   * The custom properties to declare on the scope. Spread straight into a `style` prop, or
   * serialize into a `<style>` block for SSR. EMPTY for an unusable seed, so an invalid customer
   * value degrades to the app's own theme instead of breaking the page.
   */
  vars: Readonly<Record<string, string>>;
};

const EMPTY: TenantTheme = Object.freeze({
  primary: null,
  foreground: null,
  contrast: 0,
  meetsAA: false,
  vars: Object.freeze({}),
});

/**
 * Turn a customer's hex into the scoped token declarations that make one REGION wear it —
 * `--primary`, `--primary-foreground`, `--ring`, the hover / pressed steps, and the three brand INKS
 * (`--text-link` / `--text-brand` / `--text-primary`) — all as literals, so the colour cannot
 * half-apply on an engine without CSS relative colour and the ink cannot land under 4.5:1.
 *
 * ```tsx
 * const brand = tenantTheme(tenant.primary_color, { foreground: tenant.primary_foreground });
 * <div data-tenant={tenant.slug} style={brand.vars}>…</div>
 * ```
 *
 * Never throws and never returns null: an unusable seed yields empty `vars`.
 */
export function tenantTheme(primary: string, options: TenantThemeOptions = {}): TenantTheme {
  const seed = parseHex(primary);
  if (seed === null) return EMPTY;

  const supplied = options.foreground ? parseHex(options.foreground) : null;
  // The pivot: whichever of white / black scores higher on this seed. Both measure 4.58:1 at
  // the pivot and the winner only rises away from it, so this branch always clears AA — the
  // property `tenant-theme.test.ts` proves over the whole sRGB cube rather than asserting here.
  const label = supplied ?? (luminanceOf(seed) > CONTRAST_PIVOT ? [0, 0, 0] : [1, 1, 1]);

  const seedLuminance = luminanceOf(seed);
  const labelLuminance = luminanceOf(label);
  const [hi, lo] =
    labelLuminance >= seedLuminance
      ? [labelLuminance, seedLuminance]
      : [seedLuminance, labelLuminance];
  const contrast = (hi + 0.05) / (lo + 0.05);

  if (isDevelopment() && supplied !== null && contrast < AA_NORMAL_TEXT) {
    console.warn(
      `[godxjp-ui] tenantTheme: the supplied foreground ${toHex(label)} measures ` +
        `${round(contrast, 2)}:1 on ${toHex(seed)} — below WCAG 2.2 SC 1.4.3 AA (4.5:1). ` +
        `Text on this brand fill will be hard to read. Omit \`foreground\` to let the ` +
        `contrast-safe label be chosen, or raise the pair upstream.`,
    );
  }

  // The steps go AWAY from the label that rides on the fill, so contrast can only rise: lightness
  // is monotonic in every sRGB channel at fixed H and S. Polarity follows the LABEL, not the theme
  // — a mid-luminance seed with white text under a dark theme would otherwise lighten towards it.
  const steps = STEPS[labelLuminance > 0.5 ? "darken" : "lighten"];
  const [h, s, l] = toHsl(seed);

  // The brand as INK (gh#887). An ink carries no label, so its polarity follows the SURFACE, and the
  // ramp step is only a starting point: `inkLightness` walks it away from that surface until the
  // painted pixel clears 4.5:1, and stops there — a seed whose step already clears is untouched.
  const surface = luminanceOf(
    (options.surface ? parseHex(options.surface) : null) ?? parseHex(INK_SURFACE_LIGHT)!,
  );
  const ink = INK_STEPS[surface > CONTRAST_PIVOT ? "light" : "dark"];
  const [inkH, inkS] = [round(h, 2), round(s, 2)];
  const inkAt = (step: (value: number) => number) =>
    formatHsl([inkH, inkS, inkLightness(inkH, inkS, round(step(l), 2), surface)]);
  const [linkInk, pressedInk] = [inkAt(ink.link), inkAt(ink.pressed)];

  return Object.freeze({
    primary: toHex(seed),
    foreground: toHex(label),
    contrast,
    meetsAA: contrast >= AA_NORMAL_TEXT,
    vars: Object.freeze({
      "--primary": tripletOf(seed),
      "--primary-foreground": tripletOf(label),
      // derived.css declares `--ring: var(--primary)` at `:root`, where a var() substitutes ONCE;
      // a scope below it inherits the root's ring unless it restates it (the freeze rule).
      "--ring": tripletOf(seed),
      "--primary-hover": formatHsl([h, s, clamp(steps.hover(l), 0, 100)]),
      "--primary-active": formatHsl([h, s, clamp(steps.active(l), 0, 100)]),
      // The three brand INKS, each ≥ 4.5:1 on `surface` — the roles derived.css already publishes,
      // now with the floor its lightness steps never had. `--text-primary` also seeds `--mark-*`.
      "--text-link": linkInk,
      "--text-brand": linkInk,
      "--text-primary": pressedInk,
    }),
  });
}
