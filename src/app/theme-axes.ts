/*
 * Theme axes — the runtime consumer API for the four design-system axes (Rule #21). AppProvider
 * holds these as persisted, switchable settings and writes them as `data-*` attributes on <html>;
 * the CSS in tokens/axes.css + density.css + foundation.css binds each attribute to tokens.
 */
import type { PageDensityProp } from "../props/vocabulary/layout.prop";
import { relativeLuminance, tenantTheme } from "./tenant-theme";

/**
 * Theme spine — `data-theme` (alias of the legacy `.dark` class). `"system"` is a CHOICE, not a
 * rendered value: it defers to the OS `prefers-color-scheme` and is what gets persisted, so the
 * app keeps following the OS tomorrow morning. `data-theme` only ever carries `light` or `dark`.
 */
export type AppTheme = "light" | "dark" | "system";
/** What `data-theme` actually carries — the resolution of an {@link AppTheme} choice. */
export type ResolvedAppTheme = Exclude<AppTheme, "system">;
/** Primary-palette preset — `data-brand`. `null` = keep the app's own `--primary`. */
export type AppBrand = "brand" | "crm" | "logistics" | "partner" | "slate" | "dxs";
/** Control / table / spacing density — `data-density` (same vocab as PageContainer). */
export type AppDensity = PageDensityProp;
/** Base type size — `data-font-size`; a preset rescales the whole golden scale. */
export type AppFontSize = "sm" | "default" | "lg";

export const APP_THEMES = ["light", "dark", "system"] as const satisfies readonly AppTheme[];
export const APP_BRANDS = [
  "brand",
  "crm",
  "logistics",
  "partner",
  "slate",
  "dxs",
] as const satisfies readonly AppBrand[];
export const APP_DENSITIES = [
  "compact",
  "default",
  "comfortable",
] as const satisfies readonly AppDensity[];
export const APP_FONT_SIZES = ["sm", "default", "lg"] as const satisfies readonly AppFontSize[];

/** The axes as held by AppProvider. `brand: null` opts out (app token wins). */
export type AppThemeAxes = {
  theme: AppTheme;
  brand: AppBrand | null;
  density: AppDensity;
  fontSize: AppFontSize;
  scaling: number | null;
};

export const isAppTheme = (v: unknown): v is AppTheme => APP_THEMES.includes(v as AppTheme);

/** The media query `theme: "system"` follows. */
export const PREFERS_DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

/** `false` wherever there is no `matchMedia` (SSR, jsdom without the stub) — light is the default. */
export function prefersDarkScheme(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(PREFERS_DARK_SCHEME_QUERY).matches;
}

/**
 * Resolve a stored CHOICE to the value `data-theme` carries. `light`/`dark` pass through
 * untouched, so a preference stored before `system` existed keeps working.
 */
export function resolveAppTheme(theme: AppTheme): ResolvedAppTheme {
  if (theme !== "system") return theme;
  return prefersDarkScheme() ? "dark" : "light";
}
export const isAppBrand = (v: unknown): v is AppBrand => APP_BRANDS.includes(v as AppBrand);
export const isAppDensity = (v: unknown): v is AppDensity =>
  APP_DENSITIES.includes(v as AppDensity);
export const isAppFontSize = (v: unknown): v is AppFontSize =>
  APP_FONT_SIZES.includes(v as AppFontSize);

/**
 * Write the axis attributes onto a root element (default `<html>`). Pass `brand: null` to remove
 * `data-brand` so the app's own `--primary` token applies.
 */
export function applyThemeAxes(el: HTMLElement, axes: Partial<AppThemeAxes>): void {
  // The CHOICE is persisted; only its RESOLUTION reaches the DOM — `data-theme="system"` would
  // match no rule in foundation.css and would silently render light.
  if (axes.theme !== undefined) el.dataset.theme = resolveAppTheme(axes.theme);
  if (axes.density !== undefined) el.dataset.density = axes.density;
  if (axes.fontSize !== undefined) el.dataset.fontSize = axes.fontSize;
  if (axes.brand !== undefined) {
    if (axes.brand === null) delete el.dataset.brand;
    else el.dataset.brand = axes.brand;
  }
  // `--scaling` is continuous → an inline style (not a data-attr). null defers to
  // the density preset's `--scaling`; a number overrides it (inline > stylesheet).
  if (axes.scaling !== undefined) {
    if (axes.scaling === null) el.style.removeProperty("--scaling");
    else el.style.setProperty("--scaling", String(axes.scaling));
  }
}

/**
 * Apply an entity's action palette to an existing themed tree, including portals. Call the returned
 * cleanup on scope exit.
 *
 * The arithmetic — hex → HSL triplet, and the WCAG 2.2 label choice — is {@link tenantTheme}'s, so
 * there is one formula rather than two. This entry point adds what a RE-SEED needs and a fresh
 * region does not: the knobs an ancestor service theme may have pinned to the PREVIOUS brand are
 * reset to `initial`, so the new seed cannot be outranked by a stale literal (gh#678, gh#664). The
 * three brand INKS are reset and then re-declared from the seed, because `tenantTheme` computes a
 * 4.5:1 floor for them and a bare reset would discard it (gh#887 — see the palette below).
 *
 * Use {@link tenantTheme} instead when you are painting a region with a customer's colour — it
 * returns declarations to put in `style`, with no effect, no unmount restore and no SSR flash.
 */
export function applyPrimaryColor(
  root: HTMLElement,
  color: string,
  foreground?: string | null,
): () => void {
  const seed = tenantTheme(color, { foreground });
  if (seed.primary === null) return () => {};
  // What JS knows that CSS does not is the LABEL it just chose: a state must step AWAY from that
  // label, so the pair follows the label's polarity rather than the theme (a mid-luminance seed
  // with WHITE text in a dark theme would otherwise lighten towards it). `tenantTheme` has already
  // applied that polarity to the two literal steps in `vars`; the `-channels` pointers below carry
  // it to the brand TEXT family, which reads them (`--text-link-channels`, src/tokens/derived.css).
  const polarity = (relativeLuminance(seed.foreground!) ?? 0) > 0.5 ? "darken" : "lighten";
  const palette: Record<string, string> = {
    /* THE STALE-PIN RESETS COME FIRST, AND THE ORDER IS THE WHOLE POINT (gh#887).
     *
     * They exist because a theme above this element may have pinned a knob to the PREVIOUS brand,
     * and an inherited literal would outrank a seed that only re-derives in CSS (gh#678, gh#664):
     * a link colour pinned for the old brand would survive on a re-tinted product. That reason
     * still holds, so nothing is deleted.
     *
     * But `tenantTheme` now RETURNS the three brand inks as clamped literals (gh#887), and these
     * three keys used to sit AFTER the spread — so the same call that walked each ink to 4.5:1 on
     * the surface threw the result away one line later, and a re-seeded tree got the unclamped
     * ramp step back. Declared BEFORE the spread they are overwritten by those literals, which
     * defeat an ancestor's pin on their own (a literal ON the element beats an inherited one), and
     * the guard still stands if that emission ever stops.
     *
     * `--primary-border` / `--control-outline` are NOT in `vars` — the reset IS their value here,
     * and they go on deriving in CSS from the `--primary` in scope. */
    "--text-link": "initial",
    "--text-brand": "initial",
    "--text-primary": "initial",
    ...seed.vars,
    "--primary-border": "initial",
    "--control-outline": "initial",
    "--primary-hover-channels": `var(--primary-hover-${polarity}-channels)`,
    "--primary-active-channels": `var(--primary-active-${polarity}-channels)`,
  };
  const previous = Object.keys(palette).map((key) => [
    key,
    root.style.getPropertyValue(key),
    root.style.getPropertyPriority(key),
  ]);
  for (const [key, value] of Object.entries(palette)) root.style.setProperty(key, value);
  return () => {
    for (const [key, value, priority] of previous) {
      if (value) root.style.setProperty(key, value, priority);
      else root.style.removeProperty(key);
    }
  };
}
