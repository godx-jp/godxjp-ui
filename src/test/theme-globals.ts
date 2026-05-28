import type { CSSProperties } from "react";
import type { PageDensityProp } from "../props/vocabulary/layout.prop";

/** Density toolbar → `ui-density-*` class (same as PageContainer density). */
export const DENSITY_GLOBALS = [
  "compact",
  "default",
  "comfortable",
] as const satisfies readonly PageDensityProp[];

export type DensityGlobal = (typeof DENSITY_GLOBALS)[number];

export const DENSITY_CLASS: Record<DensityGlobal, string> = {
  compact: "ui-density-compact",
  default: "ui-density-default",
  comfortable: "ui-density-comfortable",
};

export const DENSITY_CLASS_NAMES = Object.values(DENSITY_CLASS);

/** Scales typography tokens — mirrors app `theme.css` overrides. */
export const FONT_SIZE_GLOBALS = ["sm", "default", "lg"] as const;
export type FontSizeGlobal = (typeof FONT_SIZE_GLOBALS)[number];

const FONT_SIZE_VARS: Record<FontSizeGlobal, Record<string, string>> = {
  sm: {
    "--font-size-xs": "0.6875rem",
    "--font-size-sm": "0.8125rem",
    "--font-size-base": "0.9375rem",
    "--font-size-lg": "1rem",
    "--font-size-xl": "1.125rem",
    "--font-size-2xl": "1.25rem",
  },
  default: {},
  lg: {
    "--font-size-xs": "0.8125rem",
    "--font-size-sm": "0.9375rem",
    "--font-size-base": "1.0625rem",
    "--font-size-lg": "1.1875rem",
    "--font-size-xl": "1.3125rem",
    "--font-size-2xl": "1.625rem",
  },
};

/** Brand primary presets — HSL components (no `hsl()` wrapper), like `theme.css`. */
export const PRIMARY_COLOR_GLOBALS = ["brand", "crm", "logistics", "partner", "slate"] as const;
export type PrimaryColorGlobal = (typeof PRIMARY_COLOR_GLOBALS)[number];

export const PRIMARY_COLOR_LABELS: Record<PrimaryColorGlobal, string> = {
  brand: "GodX Navy",
  crm: "CRM Violet",
  logistics: "Logistics Teal",
  partner: "Partner Orange",
  slate: "HQ Slate",
};

/** Primary, focus ring, and tinted accent mirror service theme.css overrides. */
export const PRIMARY_COLOR_VARS: Record<PrimaryColorGlobal, Record<string, string>> = {
  brand: {
    "--primary": "211 73% 15%",
    "--primary-foreground": "0 0% 100%",
    "--ring": "24 99% 46%",
    "--accent": "24 99% 95%",
    "--accent-foreground": "24 99% 28%",
  },
  crm: {
    "--primary": "262 83% 58%",
    "--primary-foreground": "0 0% 100%",
    "--ring": "262 83% 58%",
    "--accent": "262 83% 96%",
    "--accent-foreground": "262 83% 28%",
  },
  logistics: {
    "--primary": "173 80% 36%",
    "--primary-foreground": "0 0% 100%",
    "--ring": "173 80% 36%",
    "--accent": "173 80% 94%",
    "--accent-foreground": "173 80% 22%",
  },
  partner: {
    "--primary": "24 95% 53%",
    "--primary-foreground": "0 0% 100%",
    "--ring": "24 95% 53%",
    "--accent": "24 95% 95%",
    "--accent-foreground": "24 95% 28%",
  },
  slate: {
    "--primary": "215 25% 27%",
    "--primary-foreground": "0 0% 100%",
    "--ring": "215 25% 27%",
    "--accent": "215 25% 94%",
    "--accent-foreground": "215 25% 20%",
  },
};

export type ThemeGlobals = {
  density?: DensityGlobal;
  fontSize?: FontSizeGlobal;
  primaryColor?: PrimaryColorGlobal;
};

function hslFromComponents(components: string): string {
  return `hsl(${components})`;
}

/** CSS vars for :root — includes Tailwind @theme `--color-*` aliases. */
export function themeGlobalsToCssVars(globals: ThemeGlobals): Record<string, string> {
  const fontSize = globals.fontSize ?? "default";
  const primaryColor = globals.primaryColor ?? "brand";
  const primary = PRIMARY_COLOR_VARS[primaryColor];

  return {
    ...FONT_SIZE_VARS[fontSize],
    "--primary": primary["--primary"],
    "--primary-foreground": primary["--primary-foreground"],
    "--ring": primary["--ring"],
    "--accent": primary["--accent"],
    "--accent-foreground": primary["--accent-foreground"],
    "--color-primary": hslFromComponents(primary["--primary"]),
    "--color-primary-foreground": hslFromComponents(primary["--primary-foreground"]),
    "--color-ring": hslFromComponents(primary["--ring"]),
    "--color-accent": hslFromComponents(primary["--accent"]),
    "--color-accent-foreground": hslFromComponents(primary["--accent-foreground"]),
  };
}

export function themeGlobalsToStyle(globals: ThemeGlobals): CSSProperties {
  return themeGlobalsToCssVars(globals);
}

export function themeGlobalsToClassName(globals: ThemeGlobals): string {
  const density = globals.density ?? "default";
  return DENSITY_CLASS[density];
}
