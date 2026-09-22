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
 * ── WHAT THIS DELIBERATELY DOES NOT TOUCH ────────────────────────────────────────────────────
 * `--text-link` / `--text-brand` / `--text-primary` — brand INK on the page surface. Their
 * legibility depends on `--background`, which a customer's fill colour does not control, and their
 * step direction is per-THEME rather than per-label. A pale seed (#FFD400) makes a 1.4:1 link on a
 * white page; releasing that automatically is the same class of silent unreadability this module
 * exists to prevent. A consumer who wants brand links sets those roles itself, having measured.
 * `--primary-border` and `--control-outline` are left to derive: their channels are per-theme too,
 * and they are a hairline and an 11% halo rather than a state a reader tracks.
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
 * `--primary`, `--primary-foreground`, `--ring`, and the hover / pressed steps as literals so the
 * colour cannot half-apply on an engine without CSS relative colour.
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
  // L = 0.179 and the winner only rises away from it, so this branch always clears AA — the
  // property `tenant-theme.test.ts` proves over the whole sRGB cube rather than asserting here.
  const label = supplied ?? (luminanceOf(seed) > 0.179 ? [0, 0, 0] : [1, 1, 1]);

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
    }),
  });
}
