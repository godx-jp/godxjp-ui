/* Theme axes — the runtime consumer API for the four design-system axes
 * (Rule #21). AppProvider holds these as persisted, switchable settings and
 * writes them as `data-*` attributes on <html>; the CSS in tokens/axes.css +
 * density.css + foundation.css binds each attribute to tokens. Every axis is a
 * no-op at its default, so apps that set nothing render exactly as before. */
import type { PageDensityProp } from "../props/vocabulary/layout.prop";

/** Light / dark spine — `data-theme` (alias of the legacy `.dark` class). */
export type AppTheme = "light" | "dark";
/** Primary-palette preset — `data-brand`. `null` = keep the app's own `--primary`. */
export type AppBrand = "brand" | "crm" | "logistics" | "partner" | "slate";
/** Control / table / spacing density — `data-density` (same vocab as PageContainer). */
export type AppDensity = PageDensityProp;
/** Base type size — `data-font-size`; a preset rescales the whole golden scale. */
export type AppFontSize = "sm" | "default" | "lg";

export const APP_THEMES = ["light", "dark"] as const satisfies readonly AppTheme[];
export const APP_BRANDS = [
  "brand",
  "crm",
  "logistics",
  "partner",
  "slate",
] as const satisfies readonly AppBrand[];
export const APP_DENSITIES = [
  "compact",
  "default",
  "comfortable",
] as const satisfies readonly AppDensity[];
export const APP_FONT_SIZES = ["sm", "default", "lg"] as const satisfies readonly AppFontSize[];

/** The axes as held by AppProvider. `brand: null` opts out (app token wins).
 * `scaling: null` defers to the density preset; a number is the continuous global
 * size multiplier (the `--scaling` factor / Radix model) and overrides the preset. */
export type AppThemeAxes = {
  theme: AppTheme;
  brand: AppBrand | null;
  density: AppDensity;
  fontSize: AppFontSize;
  scaling: number | null;
};

export const isAppTheme = (v: unknown): v is AppTheme => APP_THEMES.includes(v as AppTheme);
export const isAppBrand = (v: unknown): v is AppBrand => APP_BRANDS.includes(v as AppBrand);
export const isAppDensity = (v: unknown): v is AppDensity =>
  APP_DENSITIES.includes(v as AppDensity);
export const isAppFontSize = (v: unknown): v is AppFontSize =>
  APP_FONT_SIZES.includes(v as AppFontSize);

/**
 * Write the axis attributes onto a root element (default `<html>`). Pass `brand: null`
 * to remove `data-brand` so the app's own `--primary` token applies. SSR-safe: callers
 * guard `typeof document`. Exported for non-React / imperative consumers too.
 */
export function applyThemeAxes(el: HTMLElement, axes: Partial<AppThemeAxes>): void {
  if (axes.theme !== undefined) el.dataset.theme = axes.theme;
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
