/**
 * Design tokens catalog — mirrors `src/tokens/tailwind.css` +
 * `src/styles/theme.css` in the framework. CSS variable name +
 * the slot's role + (for fixed values) the literal value.
 *
 * Token values that change per `data-theme` / `data-accent` /
 * `data-density` / `data-font-size` axis are NOT listed with a
 * literal — only the slot name + axis name. Consumers read the
 * runtime value via `getComputedStyle(:root).getPropertyValue(...)`.
 */

export type TokenCategory =
  | "color"
  | "spacing"
  | "typography"
  | "radius"
  | "shadow"
  | "motion"
  | "breakpoint"
  | "density"
  | "z-index";

export interface TokenEntry {
  name: string;
  category: TokenCategory;
  role: string;
  /** Fixed value if non-axis. Otherwise omitted. */
  value?: string;
  /** Axis the token re-binds against, if any. */
  axis?: "data-theme" | "data-accent" | "data-density" | "data-font-size";
}

export const TOKENS: TokenEntry[] = [
  // Color — semantic slots (rebound by `data-theme` + `data-accent`)
  { name: "--background", category: "color", role: "Base surface", axis: "data-theme" },
  { name: "--foreground", category: "color", role: "Base text", axis: "data-theme" },
  { name: "--card", category: "color", role: "Card surface", axis: "data-theme" },
  { name: "--popover", category: "color", role: "Popover / dropdown surface", axis: "data-theme" },
  { name: "--popover-foreground", category: "color", role: "Popover text", axis: "data-theme" },
  { name: "--primary", category: "color", role: "Brand accent (Buttons, links)", axis: "data-accent" },
  { name: "--primary-foreground", category: "color", role: "Text on primary surface", axis: "data-accent" },
  { name: "--secondary", category: "color", role: "Secondary surface / text dimming", axis: "data-theme" },
  { name: "--accent", category: "color", role: "Hover / focus tint" },
  { name: "--muted", category: "color", role: "Muted surface" },
  { name: "--muted-foreground", category: "color", role: "Muted text" },
  { name: "--border", category: "color", role: "Default border color", axis: "data-theme" },
  { name: "--input", category: "color", role: "Input field border" },
  { name: "--ring", category: "color", role: "Focus ring", axis: "data-accent" },
  { name: "--success", category: "color", role: "Success semantic slot" },
  { name: "--warning", category: "color", role: "Warning semantic slot" },
  { name: "--destructive", category: "color", role: "Danger / destructive action slot" },
  { name: "--info", category: "color", role: "Info / neutral notice slot" },
  { name: "--attention", category: "color", role: "Attention / non-destructive alert slot" },

  // Spacing — fixed scale
  { name: "--spacing-1", category: "spacing", role: "4px", value: "0.25rem" },
  { name: "--spacing-2", category: "spacing", role: "8px", value: "0.5rem" },
  { name: "--spacing-3", category: "spacing", role: "12px", value: "0.75rem" },
  { name: "--spacing-4", category: "spacing", role: "16px", value: "1rem" },
  { name: "--spacing-5", category: "spacing", role: "20px", value: "1.25rem" },
  { name: "--spacing-6", category: "spacing", role: "24px", value: "1.5rem" },
  { name: "--spacing-8", category: "spacing", role: "32px", value: "2rem" },

  // Typography — fixed scale
  { name: "--text-2xs", category: "typography", role: "10px", value: "0.625rem" },
  { name: "--text-xs", category: "typography", role: "12px", value: "0.75rem" },
  { name: "--text-sm", category: "typography", role: "14px", value: "0.875rem" },
  { name: "--text-base", category: "typography", role: "16px", value: "1rem" },
  { name: "--text-lg", category: "typography", role: "18px", value: "1.125rem" },
  { name: "--text-xl", category: "typography", role: "20px", value: "1.25rem" },
  { name: "--text-2xl", category: "typography", role: "24px", value: "1.5rem" },
  { name: "--font-mono", category: "typography", role: "Monospace stack" },

  // Radius — fixed scale
  { name: "--radius-sm", category: "radius", role: "Small (chips, inputs)", value: "0.25rem" },
  { name: "--radius-md", category: "radius", role: "Medium (cards)", value: "0.5rem" },
  { name: "--radius-lg", category: "radius", role: "Large (dialogs)", value: "0.75rem" },
  { name: "--radius-full", category: "radius", role: "Pill / circle", value: "9999px" },

  // Breakpoints — mobile-first min-widths
  { name: "--breakpoint-xs", category: "breakpoint", role: "Mobile-first base (≥0px)", value: "0" },
  { name: "--breakpoint-sm", category: "breakpoint", role: "Phone landscape / tablet portrait", value: "640px" },
  { name: "--breakpoint-md", category: "breakpoint", role: "Tablet landscape", value: "768px" },
  { name: "--breakpoint-lg", category: "breakpoint", role: "Laptop", value: "1024px" },
  { name: "--breakpoint-xl", category: "breakpoint", role: "Desktop", value: "1280px" },
  { name: "--breakpoint-xxl", category: "breakpoint", role: "Wide desktop", value: "1536px" },

  // Density — rebound by `data-density`
  { name: "--density-element", category: "density", role: "Element height (Input/Button)", axis: "data-density" },
  { name: "--density-element-sm", category: "density", role: "Small element", axis: "data-density" },
  { name: "--density-element-lg", category: "density", role: "Large element", axis: "data-density" },
  { name: "--density-card", category: "density", role: "Card padding", axis: "data-density" },
  { name: "--density-page", category: "density", role: "Page (PageContent) padding", axis: "data-density" },
  { name: "--density-section", category: "density", role: "Section padding (cozy variant)", axis: "data-density" },
  { name: "--header-height", category: "density", role: "Topbar height", axis: "data-density" },
  { name: "--sidebar-width", category: "density", role: "Sidebar width (expanded)", axis: "data-density" },
  { name: "--sidebar-width-collapsed", category: "density", role: "Sidebar icon-only width", axis: "data-density" },
  { name: "--touch-target-min", category: "density", role: "Mobile touch target (does NOT scale)", value: "44px" },

  // Motion — fixed timings
  { name: "--transition-base", category: "motion", role: "Standard transition duration", value: "200ms" },
  { name: "--ease-out", category: "motion", role: "Out easing curve", value: "cubic-bezier(0, 0, 0.2, 1)" },
  { name: "--ease-in-out", category: "motion", role: "In-out easing", value: "cubic-bezier(0.4, 0, 0.2, 1)" },
];

export function tokensByCategory(category: TokenCategory): TokenEntry[] {
  return TOKENS.filter((t) => t.category === category);
}
