/** Design token catalog taught by the MCP. Mirrors the 3-tier token model. */

export type TokenCategory = "primitive" | "semantic" | "component";

export interface TokenEntry {
  name: string;
  category: TokenCategory;
  role: string;
  tier: "primitive" | "semantic" | "component";
}

export const TOKENS: TokenEntry[] = [
  {
    name: "--wa-*",
    category: "primitive",
    tier: "primitive",
    role: "Neutral decorative Japanese accent primitives for charts/tags/decoration only.",
  },
  {
    name: "--chart-1..6",
    category: "primitive",
    tier: "primitive",
    role: "Neutral decorative chart series palette. The @godxjp/ui/charts components (LineChart/BarChart/AreaChart/PieChart) read these by series index automatically — a service rethemes every chart at once by overriding --chart-1..6; per-series/per-slice overrides go through the component's series.color / colors props.",
  },
  { name: "--space-0..12", category: "primitive", tier: "primitive", role: "Raw spacing scale." },
  {
    name: "--font-size-*",
    category: "primitive",
    tier: "primitive",
    role: "Raw typography scale.",
  },
  {
    name: "--duration-{fast,base,slow}",
    category: "primitive",
    tier: "primitive",
    role: "Motion durations (150 / 250 / 500ms). Read these instead of a literal `0.5s` for enter/transition timing (rule #2). dxs-kintai keeps motion short; honour `prefers-reduced-motion` at the call site.",
  },
  {
    name: "--ease-{standard,emphasized,decelerate,accelerate}",
    category: "primitive",
    tier: "primitive",
    role: "Motion easing curves. `standard` for most transitions, `emphasized` for entrances/overlays (the vaul drawer curve), `decelerate` for settling in, `accelerate` for exits. Read instead of a literal `cubic-bezier(…)`.",
  },
  {
    name: "--reveal-distance",
    category: "primitive",
    tier: "primitive",
    role: "Distance (10px) a revealed element travels on enter (translateY/-X). Read instead of a literal `translateY(10px)` for staggered reveals.",
  },
  { name: "--primary", category: "semantic", tier: "semantic", role: "Brand/action color role." },
  { name: "--success", category: "semantic", tier: "semantic", role: "Success status role." },
  { name: "--warning", category: "semantic", tier: "semantic", role: "Warning status role." },
  {
    name: "--destructive",
    category: "semantic",
    tier: "semantic",
    role: "Destructive/error status role.",
  },
  { name: "--info", category: "semantic", tier: "semantic", role: "Information status role." },
  { name: "--attention", category: "semantic", tier: "semantic", role: "Attention status role." },
  {
    name: "--page-header-divider",
    category: "semantic",
    tier: "semantic",
    role: "PageContainer header bottom divider. Default none; a service theme opts in with `1px solid hsl(var(--border))`.",
  },
  {
    name: "--page-header-pad-bottom",
    category: "semantic",
    tier: "semantic",
    role: "PageContainer header bottom inset. Defaults to page top padding minus the section gap so the title band is vertically balanced.",
  },
  { name: "--badge-space-*", category: "component", tier: "component", role: "Badge spacing." },
  {
    name: "--card-*",
    category: "component",
    tier: "component",
    role: "Card surface, border, spacing, and typography.",
  },
  {
    name: "--control-*",
    category: "component",
    tier: "component",
    role: "Shared form control heights, padding, icons, and focus chrome.",
  },
  { name: "--table-*", category: "component", tier: "component", role: "Table row/cell sizing." },
  {
    name: "--form-label-width",
    category: "component",
    tier: "component",
    role: "Label column width in horizontal Form layout. Default max-content; a service theme sets it once (e.g. 110px) — the labelWidth prop overrides per form/field.",
  },
  {
    name: "--form-label-gap",
    category: "component",
    tier: "component",
    role: "Label↔control column gap in horizontal Form layout. Default 16px (--space-4).",
  },
  {
    name: "--dialog-* / --alert-* / --skeleton-*",
    category: "component",
    tier: "component",
    role: "Feedback component sizing and spacing.",
  },
];

export function tokensByCategory(category: TokenCategory): TokenEntry[] {
  return TOKENS.filter((t) => t.category === category);
}
