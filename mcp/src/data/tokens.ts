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
    name: "--font-sans-base",
    category: "semantic",
    tier: "semantic",
    role: "The default sans face. FONT-AGNOSTIC by default (pure system stack) — the library ships no hardcoded brand font. Override this for one face everywhere. --font-family-sans defaults to it; --font-family-display / --font-family-body default to --font-family-sans (override those for a dual display+body brand). Consumers supply the actual @font-face (next/font, @fontsource, self-host); the opt-in @godxjp/ui/styles/fonts fills this with the bundled Noto Sans JP.",
  },
  {
    name: "--font-sans-{ja,ko,vi,zh-hans,zh-hant}",
    category: "semantic",
    tier: "semantic",
    role: "Per-language font SLOT tokens. styles/base.css wires each [lang] to read its slot with --font-sans-base as fallback, so a consumer switches a locale's face by setting e.g. `--font-sans-ja: \"Noto Sans JP\", var(--font-sans-base)` — NO [lang] selectors to write. Empty by default. zh-hans matches lang zh|zh-Hans|zh-CN; zh-hant matches zh-Hant|zh-TW. Deciding which @font-face ships on which locale route is the consumer's font pipeline, not the library.",
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
  {
    name: "--shadow-color",
    category: "primitive",
    tier: "primitive",
    role: "RGB channels (space-separated, e.g. `12 26 49`) that tint the WHOLE elevation ramp (--shadow-xs..2xl) at once. Default `0 0 0`. Single-brand :root only — a scoped override does not re-resolve the ramp (the steps compute at :root); for a scoped/multi-tenant card lift set --card-shadow to a literal value.",
  },
  {
    name: "--shadow-glow",
    category: "primitive",
    tier: "primitive",
    role: "Opt-in brand GLOW halo layered on the primary CTA's resting shadow. Default invisible (`0 0 0 0 transparent`, valid inside a comma shadow list). A service sets the whole value, e.g. `--shadow-glow: 0 8px 20px hsl(var(--primary) / .32)` — works scoped under [data-tenant] because the service declares it inside the scope.",
  },
  {
    name: "--focus-ring-color",
    category: "primitive",
    tier: "primitive",
    role: "Themeable hue of EVERY keyboard-focus ring (HSL components, default var(--ring)). A leaf token, so it re-resolves at the element that paints the ring — override it once, even scoped under [data-tenant], to retint all focus rings. Pair with --focus-ring-width.",
  },
  {
    name: "--focus-ring-width",
    category: "primitive",
    tier: "primitive",
    role: "Thickness (2px) of the solid keyboard-focus ring. Leaf token — :focus-visible rules read it directly as `0 0 0 var(--focus-ring-width) hsl(var(--focus-ring-color))`, never via an intermediate composite (which would freeze at :root). Propagates scoped.",
  },
  {
    name: "--gradient-{brand,hero,glow}",
    category: "primitive",
    tier: "primitive",
    role: "Opt-in decorative gradient fills, default `none`. --gradient-hero paints the PageContainer header (hero banner); --gradient-glow paints the AppShell .app-main (ambient brand wash); --gradient-brand is a spare. A service sets the full gradient, e.g. `--gradient-glow: radial-gradient(60% 80% at 50% 0%, hsl(var(--primary) / .25), transparent)`.",
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
    name: "--overlay-background",
    category: "semantic",
    tier: "semantic",
    role: "Modal scrim — the single backdrop colour shared by every overlay (Dialog, AlertDialog, Sheet, Drawer). Default `rgb(0 0 0 / 0.5)`. A service tints it once, e.g. a navy `rgb(12 26 49 / .55)`. NOTE: portaled overlays render outside a [data-tenant] subtree, so for multi-tenant scoping put the tenant attribute on the portal container too.",
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
