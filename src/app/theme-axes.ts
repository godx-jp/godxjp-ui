/*
 * Theme axes — the runtime consumer API for the four design-system axes (Rule #21). AppProvider
 * holds these as persisted, switchable settings and writes them as `data-*` attributes on <html>;
 * the CSS in tokens/axes.css + density.css + foundation.css binds each attribute to tokens.
 */
import type { PageDensityProp } from "../props/vocabulary/layout.prop";

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

/** Apply an entity's action palette, including portals. Call the returned cleanup on scope exit. */
export function applyPrimaryColor(
  root: HTMLElement,
  color: string,
  foreground?: string | null,
): () => void {
  const parse = (value: string): number[] | null => {
    if (!/^#[\da-f]{6}$/i.test(value)) return null;
    return [1, 3, 5].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  };
  const rgb = parse(color);
  if (!rgb) return () => {};
  const luminance = (channels: number[]) =>
    channels.reduce(
      (sum, value, index) =>
        sum +
        (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) *
          [0.2126, 0.7152, 0.0722][index],
      0,
    );
  const text =
    (foreground && parse(foreground)) || (luminance(rgb) > 0.179 ? [0, 0, 0] : [1, 1, 1]);
  const hsl = (channels: number[]) => {
    const [r, g, b] = channels;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    const delta = max - min,
      lightness = (max + min) / 2;
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
    return `${hue} ${saturation * 100}% ${lightness * 100}%`;
  };
  const away = luminance(text) > 0.5 ? 0 : 1;
  const shade = (amount: number) =>
    hsl(rgb.map((channel) => channel * (1 - amount) + away * amount));
  const palette: Record<string, string> = {
    "--primary": hsl(rgb),
    "--primary-foreground": hsl(text),
    "--primary-hover": shade(0.12),
    "--primary-active": shade(0.24),
    "--primary-border": hsl(rgb),
    "--ring": hsl(rgb),
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
