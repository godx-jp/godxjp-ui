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
    role: 'The default sans face. FONT-AGNOSTIC by default (pure system stack) — the library ships no hardcoded brand font. Override this for one face everywhere. --font-family-sans defaults to it; --font-family-display / --font-family-body default to --font-family-sans (override those for a dual display+body brand). Consumers supply the actual @font-face (next/font, @fontsource, self-host); the opt-in @godxjp/ui/styles/fonts OVERWRITES this (and --font-sans-vi) with the bundled DXS stack — "M PLUS 2" primary (incl. the Vietnamese coverage) with "Noto Sans JP" as the CJK fallback. BUNDLE CHANGED IN v18: v16 bundled Noto Sans JP + Montserrat, v18 bundles M PLUS 2 + Noto Sans JP — if a design spec names the v16 faces, set the tokens explicitly instead of relying on the bundle. IMPORT ORDER IS LOAD-BEARING: styles/fonts must be imported AFTER styles/base, because foundation.css declares this system-stack default on :root at the same specificity (0,1,0) and the later declaration wins (the all-in-one @godxjp/ui/styles entry already orders it correctly — issue #210).',
  },
  {
    name: "--font-sans-{ja,ko,vi,zh-hans,zh-hant}",
    category: "semantic",
    tier: "semantic",
    role: 'Per-language font SLOT tokens. styles/base.css wires each [lang] to read its slot with --font-sans-base as fallback, so a consumer switches a locale\'s face by setting e.g. `--font-sans-ja: "Noto Sans JP", var(--font-sans-base)` — NO [lang] selectors to write. Empty by default. zh-hans matches lang zh|zh-Hans|zh-CN; zh-hant matches zh-Hant|zh-TW. Deciding which @font-face ships on which locale route is the consumer\'s font pipeline, not the library. The opt-in @godxjp/ui/styles/fonts only fills --font-sans-vi (with the bundled "M PLUS 2", "Noto Sans JP" stack); the other slots stay empty and fall back to --font-sans-base.',
  },
  {
    name: "--duration-{fast,base,slow}",
    category: "primitive",
    tier: "primitive",
    role: "Motion durations (150 / 250 / 500ms). Read these instead of a literal `0.5s` for enter/transition timing (rule #2). the reference design keeps motion short; honour `prefers-reduced-motion` at the call site.",
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
    name: "--reveal-stagger-step",
    category: "primitive",
    tier: "primitive",
    role: "One step (60ms) of the Reveal stagger ladder — `<Reveal delay={n}>` waits n × this before entering, so a column of reveals cascades. Read instead of a literal `.04s`/`.09s` per-item delay.",
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
    role: "Modal scrim — the single backdrop colour shared by every overlay (Dialog, AlertDialog, Sheet, Drawer, AppShell mobile nav). Default `rgb(0 0 0 / 0.5)`. A service tints it once, e.g. a navy `rgb(12 26 49 / .55)`. HOW IT REACHES AN OVERLAY (gh#215 — until v18 it reached NOTHING; every overlay carried a private literal and this token was dead): each surface declares its own `--*-overlay-background` knob `initial` and resolves a SHARE of this colour at the call site, `color-mix(in srgb, var(--overlay-background) var(--*-overlay-alpha), transparent)`, so the calibrated per-surface depth survives (Sheet/drawer 40% = 0.2, Dialog 60% = 0.3) while ONE override here retints them all. NOTE: portaled overlays render outside a [data-tenant] subtree, so for multi-tenant scoping put the tenant attribute on the portal container too.",
  },
  {
    name: "--page-header-pad-bottom",
    category: "semantic",
    tier: "semantic",
    role: "PageContainer header bottom inset. Defaults to page top padding minus the section gap so the title band is vertically balanced.",
  },
  {
    name: "--master-detail-rail-{compact,standard}",
    category: "semantic",
    tier: "semantic",
    role: "MasterDetail fixed rail track — 18.75rem (300px) / 20rem (320px). The `railWidth` prop picks the preset; a service theme retunes the presets themselves. Consumers never author a grid track.",
  },
  {
    name: "--master-detail-gap",
    category: "semantic",
    tier: "semantic",
    role: "Gap between the MasterDetail master and detail regions (default --space-stack-md), side by side and stacked.",
  },
  {
    name: "--master-detail-collapse-below",
    category: "semantic",
    tier: "semantic",
    role: "MasterDetail stacking threshold (default 40rem / the `sm` step), measured against the composition's OWN inline size, not the viewport: wider keeps the split, narrower stacks master above detail. A real knob — the layout resolves it inside a flex-basis calc(), because a media/container-query CONDITION cannot read a var(). The `collapseBelow` prop overrides it per instance (rule #45).",
  },
  {
    name: "--master-detail-master-viewport-{compact,standard}",
    category: "semantic",
    tier: "semantic",
    role: 'Bounded MasterDetail master viewport — 20rem (320px) / 28rem (448px), selected by the semantic `masterViewport` prop. `masterViewport="auto"` (the default) applies NO bound, so existing compositions are unchanged; the presets cap the collection\'s block size and scroll it INSIDE the region, which is what stops a long real collection from pushing the detail below the fold once the layout stacks. Retune the presets in a service theme exactly like --master-detail-rail-*; never author a pixel max-height in consumer CSS.',
  },
  {
    name: "--master-detail-master-viewport-inset",
    category: "semantic",
    tier: "semantic",
    role: "Focus-ring room inside a bounded MasterDetail master region (default --space-1 / 4px), and its scroll-padding. An overflow container clips BOTH axes, so without this inset the focus ring of a row at the region's edge would be cut off; it also keeps a row scrolled into view off the clip edge. Only applies when `masterViewport` is compact/standard.",
  },
  {
    name: "--page-header-extra-measure",
    category: "semantic",
    tier: "semantic",
    role: 'Inline measure of the PageContainer header `extra` region while `headerLayout="responsive-inline"` and the page is below the 640px step (default 11rem / 176px). The default `headerLayout="stack"` never reads it — `extra` keeps wrapping onto its own full-width line under the subtitle. At >=640px both arrangements are identical, so this token only governs the compact range.',
  },
  { name: "--badge-space-*", category: "component", tier: "component", role: "Badge spacing." },
  {
    name: "--logo-godx-{size,color} / --logo-success-{background,foreground}",
    category: "component",
    tier: "component",
    role: 'The GoDX IDENTITY mark, deliberately independent of --primary so a re-themed action colour never recolours the brand. Role-mirror knobs: declared `initial` at :root with the role default at the CALL SITE (`hsl(var(--logo-godx-color, var(--success)))`), so a scoped `.dark`/`[data-tenant]` override of --success actually reaches the mark. Applies to `<Logo mark="godx">` / `tone="success"`.',
  },
  {
    name: "--logo-wordmark-{gap,font-size-xs|sm|md|lg,font-weight,letter-spacing,font-family,color}",
    category: "component",
    tier: "component",
    role: 'Wordmark/lockup knobs for `<Logo wordmark="…" />` — the mark↔wordmark gap, the per-size-tier wordmark type ramp, and its face/weight/tracking/colour. The package ships NO wordmark artwork: `--logo-wordmark-font-family` defaults (at the call site) to --font-family-display, so the wordmark is typeset in the design-system face; pass an inline <svg> as `wordmark` when a real logotype exists. `--logo-wordmark-color` is a role-mirror knob (`initial`) whose call-site default is hsl(var(--foreground)), or the --success identity role on the godx / tone="success" lockup — never --primary. Setting it once in a service theme re-colours every lockup with no page CSS (gh#214).',
  },
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
  {
    name: "--sheet-responsive-breakpoint-width / --sheet-bottom-max-height",
    category: "component",
    tier: "component",
    role: 'The responsive drawer / detail-panel contract (SheetContent responsive="auto"). --sheet-responsive-breakpoint-width (default 48rem = 768px, the library\'s canonical mobile line) is the viewport width at and below which the desktop side panel becomes a mobile bottom sheet; --sheet-bottom-max-height (default 85dvh) caps THAT bottom presentation only (a plain side="bottom" sheet stays content-sized). Because a CSS @media cannot resolve a custom property, the breakpoint is read off :root at runtime by the exported useSheetResponsiveMode() hook — which is also what OrgSwitcher responsive="auto" uses, so ONE knob moves the popover→sheet and side→bottom line for every overlay at once. Accepts px/rem/em.',
  },
  {
    name: "--qr-code-*",
    category: "component",
    tier: "component",
    role: "QrCode scanner-safe foreground/background and xs/sm/md/lg natural-size tiers. Keep foreground/background at strong contrast; the defaults remain dark-on-light in dark application themes.",
  },
  {
    name: "--chart-trend-plot-height{,-xs,-sm,-md,-lg}",
    category: "component",
    tier: "component",
    role: "CompactBarTrend plot-height tiers (xs 3.5rem = dashboard summary-card density, sm 5rem, md 7.5rem, lg 10rem). The `size` prop picks a step via data-size; a service retunes the whole scale here. This is why a consumer NEVER writes an inline height for a compact trend.",
  },
  {
    name: "--chart-trend-bar-{gap,radius,max-width,min-height}",
    category: "component",
    tier: "component",
    role: "CompactBarTrend mark geometry: gap between bars (default --space-2), rounded data-end radius (--radius-sm), the per-mark width ceiling (1.5rem, so a 3-point trend does not render slabs) and the min height floor (2px, so a zero value still reads as a plotted category). All service-tunable (rule #45).",
  },
  {
    name: "--chart-trend-bar-background{,-alpha} / --chart-trend-bar-emphasis-background",
    category: "component",
    tier: "component",
    role: "CompactBarTrend fills — role-mirror knobs declared `initial` with the role default at the call site. Muted marks default to hsl(var(--muted-foreground) / --chart-trend-bar-background-alpha) (0.75, which clears the 3:1 non-text contrast floor); the emphasized 'current' mark defaults to hsl(var(--primary)). Point them at --chart-N to tint a trend to a series colour.",
  },
  {
    name: "--chart-trend-baseline-border",
    category: "component",
    tier: "component",
    role: "CompactBarTrend baseline rule. QUIET by default (rule #44 — resolves to `none`); a service opts in with `--chart-trend-baseline-border: 1px solid hsl(var(--border));`.",
  },
  {
    name: "--chart-trend-{tick-gap,tick-font-size,footer-gap}",
    category: "component",
    tier: "component",
    role: "CompactBarTrend category-tick and activity-footer rhythm — the plot↔tick gap, tick type size (--font-size-xs) and the plot↔footer gap.",
  },
  {
    name: "--email-shell-{width,padding,page-padding,border-width} / --email-card-{radius,reference-height} / --email-stack-gap{,-sm}",
    category: "component",
    tier: "component",
    role: "Transactional-email shell geometry: the 480px card width, its 32px inset, the 24px viewport gutter, the 1px edge, the 10px radius (mirrors --card-radius) and the block rhythm. The canonical invitation reference measures 480×407 (--email-card-reference-height is a visual-regression target, NEVER a fixed height on the card). Values are LITERAL px — email clients resolve neither var() nor rem — and are consumed through the `@godxjp/ui/email` export (EMAIL_SHELL), never by a stylesheet.",
  },
  {
    name: "--email-{body,heading}-{font-size,line-height,font-weight} / --email-font-family-sans / --email-mark-{width,height}",
    category: "component",
    tier: "component",
    role: "Email type ramp + brand-mark box. Body 14px/1.7 (mirrors --font-size-base / --line-height-body), heading 20px/1.25 (--heading-h1 / --line-height-tight), mark 32×32 (--logo-godx-size). The font stack is email-safe system faces only — no @font-face survives an email client. Exposed as EMAIL_TYPOGRAPHY / EMAIL_BRAND_MARK.",
  },
  {
    name: "--email-cta-{height,line-height,padding-x,radius,font-size,font-weight} / --email-focus-border-width",
    category: "component",
    tier: "component",
    role: "The single primary email CTA: 44px tall (mirrors --control-height-comfortable, the coarse-pointer target) with line-height EQUAL to the height so the label centres without flexbox in Outlook, 24px inline padding, the 6px --radius base, 14px/700 label. --email-focus-border-width mirrors --focus-ring-width for the webmail panes that honour :focus-visible. Exposed as EMAIL_CTA / EMAIL_FOCUS.",
  },
  {
    name: "--email-footer-{font-size,line-height,link-gap,padding-top,border-width} / --email-mobile-*",
    category: "component",
    tier: "component",
    role: "Legal-footer typography (12px/1.5 quiet type, 12px between adjacent links, 20px above the hairline) and the narrow-viewport reflow (520px breakpoint, fluid card, 20px inset, 12px gutter, 18px heading, full-bleed CTA). Exposed as EMAIL_FOOTER / EMAIL_MOBILE; every reflow rule needs an inline fallback because most clients strip <style>.",
  },
  {
    name: "--auth-shell-device-{card-max-width,main-padding,main-padding-mobile}",
    category: "component",
    tier: "component",
    role: 'AuthShell `preset="device-authorization"` measure (gh#220) — the canonical OAuth device-grant artboard: a 23.75rem/380px card at 1440/1024 and a 15px-block · 5px-inline page gutter at 390 (so the card renders x=5px, width=380px). LITERAL lengths, not --space-*, because the artboard specifies exact device pixels that must not drift with --scaling. Selecting the preset replaces a consumer-side --auth-shell-card-max-width override or a forked `.auth-shell--wide` class; the canonical 360px/15px default is untouched.',
  },
  {
    name: "--auth-shell-context-{card-max-width,main-padding,main-padding-mobile,card-stack-gap}",
    category: "component",
    tier: "component",
    role: 'AuthShell `preset="context-selection"` measure (gh#217) — the organisation/context picker: a 25rem card on desktop/tablet, edge-to-edge on mobile (0 inline gutter), and a 1rem rhythm between the three direct sections of the auth column (intro · choice card · "remember" row).',
  },
  {
    name: "--auth-shell-{main-align,card-stack-gap}",
    category: "component",
    tier: "component",
    role: "AuthShell column knobs shared by every preset. --auth-shell-main-align is the block alignment of the auth column (default `center`, the vertically-centred card; set `start` for a tall intro+card+footnote stack). --auth-shell-card-stack-gap is the gap between the card slot's direct sections — default `0px` (quiet, rule #44) so an existing single-card consumer is byte-for-byte unchanged; a preset opts in.",
  },
  {
    name: "--card-space-shell-y",
    category: "component",
    tier: "component",
    role: "Card BLOCK-axis shell padding (gh#232) — a plain header's top, a `solo` body's top and the terminal slot's bottom. Split off --card-space-inset, which is now inline-only, so a theme can make a card SHORTER without narrowing its column. Declared `initial`: the default resolves at the CALL SITE to --card-space-inset, so a card that overrides neither (and `density=\"tight|cozy\"`, which re-declares it `initial` to re-arm the per-instance inset) renders exactly as before.",
  },
  {
    name: "--auth-shell-{compact-card-inset,card-padding-block-compact,card-body-gap-compact,card-gap-compact}",
    category: "component",
    tier: "component",
    role: "The compact AuthShell card's four independent knobs (gh#232) — one per axis, so the canonical Login card is tunable WITHOUT a consumer selector on the card-content slot: `compact-card-inset` = the inline column (→ --card-space-inset); `card-padding-block-compact` = the card's block/top-bottom padding (→ --card-space-shell-y, `initial` so its default mirrors the live inline inset and canonical output is unchanged); `card-body-gap-compact` = the header↔body gap (→ --card-space-body-y, 12px, the role the block knob used to be mis-wired to); `card-gap-compact` = the in-slot title↕description stack gap (→ --card-space-gap).",
  },
  {
    name: "--app-setting-picker-compact-{control-height,padding-x,gap,font-size}",
    category: "component",
    tier: "component",
    role: 'AppSettingPicker `compact` trigger (gh#217) — the small, content-hugging LABELLED switcher for an auth/legal footer (`kind="locale" appearance="labeled" compact`). The box height reads the official --control-height-sm tier (never a literal or an ad-hoc calc), and padding/gap/type are separate knobs so a service theme retunes the footer switcher without forking CSS.',
  },
  {
    name: "--centered-shell-column-offset-block",
    category: "component",
    tier: "component",
    role: 'CenteredShell column block offset (gh#221) — default `0` (the quiet state, rule #44: the top-aligned flowing/scrolling page). `<CenteredShell align="center">` flips it to `auto`, which centres the column in the 100dvh shell: the package-owned geometry for a SYSTEM-level standalone surface (a 500/503 error page, a maintenance notice) at 1440/1024/390, so a consumer never writes `min-h-dvh` + flex-centring CSS or a className. Auto block offsets collapse to 0 when the content is taller than the viewport, so a long localized message scrolls from the top instead of clipping.',
  },
  {
    name: "--legal-document-*",
    category: "component",
    tier: "component",
    role: "LegalDocumentShell knobs (gh#222) — the whole legal/policy document surface is themeable without a single consumer `.legal-*` class. Geometry: `--legal-document-measure-max-width` (46rem readable measure, caps header/body/footer), `--legal-document-toc-width` · `--legal-document-column-gap` · `--legal-document-toc-inset-block-start` (sticky offset) · `--legal-document-toc-max-height`, `--legal-document-section-gap` · `--legal-document-section-title-gap` · `--legal-document-header-gap` · `--legal-document-meta-gap` · `--legal-document-nav-gap` · `--legal-document-footer-gap`, `--legal-document-meta-font-size`, `--legal-document-body-line-height` (1.8 long-form leading) and `--legal-document-scroll-offset` (the `scroll-margin-block-start` a hash jump leaves above a heading — this is why no app needs JS offset arithmetic). Contents entries: `--legal-document-toc-font-size` · `--legal-document-toc-title-font-size` · `--legal-document-toc-item-padding` · `--legal-document-toc-item-radius` · `--legal-document-toc-marker-width`. Chrome is QUIET by default (rule #44): `--legal-document-toc-border` / `--legal-document-header-border` / `--legal-document-footer-border` are all `none`; a service opts in with `1px solid hsl(var(--border))`. The six colour knobs are ROLE-MIRRORS declared `initial` with the role default at the call site — `--legal-document-toc-foreground` (→ --muted-foreground, also paints the contents caption), `--legal-document-toc-active-foreground` (→ --foreground), `--legal-document-toc-active-background` (→ --accent), `--legal-document-toc-marker-color` (→ --primary), `--legal-document-meta-foreground` (→ --muted-foreground) and `--legal-document-summary-foreground` (→ --muted-foreground) — so a scoped [data-tenant]/.dark override of the role still reaches them. The one-column ⇄ two-column split is a CONTAINER query at 56rem on the shell's own width, not a viewport media query.",
  },
  {
    name: "--empty-state-description-max-width",
    category: "component",
    tier: "component",
    role: "EmptyState description MEASURE (gh#221) — default 28rem (~65 Latin characters per line). A service or locale that needs a shorter/longer measure for its own copy (JA/VI error-page descriptions, a narrow system surface) retunes this one knob instead of forking `.ui-empty-state-description` (rule #45).",
  },
  {
    name: "--sidebar-nav-item-{foreground,hover-foreground,disabled-foreground} / --sidebar-nav-icon-{foreground,hover-foreground,active-foreground,disabled-foreground}",
    category: "component",
    tier: "component",
    role: "Sidebar navigation row + icon COLOUR, split so they can differ (gh#228). Previously `.sb-nav-item` set one `color` for the whole row, so the Lucide SVG inherited `--muted-foreground` along with the label and the icons read as 'missing' against a canonical shell that wants darker 16px icons. `--sidebar-nav-item-*` drives the row/label (incl. sub rows), `--sidebar-nav-icon-*` drives `.sb-icon`. All are role-mirror knobs declared `initial` at `:root` with the role default at the call site, so a scoped `[data-tenant]`/`.dark` override reaches them; icon defaults resolve to `currentColor`, i.e. rendering is unchanged until a service opts in (`--sidebar-nav-icon-foreground: hsl(var(--foreground))` is the canonical darker-icon setting). Colour ONLY — the 16px icon, 32px row height and 10px gap are untouched. The active row keeps `--sidebar-item-active-{background,foreground}`.",
  },
  {
    name: "--list-row-{body-min-width,trailing-gap,indicator-size,read-background,unread-background,indicator-color}",
    category: "component",
    tier: "component",
    role: "ListRow shrink + unread state (gh#224, gh#225). `--list-row-body-min-width` (12rem) is consumed as `min(<token>, 100%)` — the `min()` is load-bearing, a bare length re-inflates the row's intrinsic width and reintroduces page-root overflow. `--list-row-trailing-gap` spaces wrapped trailing actions. The unread trio are role-mirror knobs declared `initial` with the role at the call site: `--list-row-unread-background` defaults to `hsl(var(--muted))` NOT `--accent` — accent measured 4.23:1 against the xs muted-foreground description line, below WCAG AA; muted is 4.63:1 light / 5.47:1 dark. `--list-row-indicator-color` (→ `--primary`) and `--list-row-indicator-size` drive the unread dot, whose meaning is carried by localized sr-only text, never by colour alone.",
  },
  {
    name: "--filter-bar-scroll-padding-y",
    category: "component",
    tier: "component",
    role: 'Scrollbar gutter for `<FilterBar overflow="scroll">` (gh#216), default `var(--space-1)`. Only applies at ≥640px, where a wide filter set becomes a single nowrap strip with a sticky inline-end clear-all; below that the bar still stacks, so the gutter would be dead space. Pair with the existing `--filter-bar-sticky-background` (already an `initial` role-mirror knob) when theming the strip.',
  },
  {
    name: "--app-shell-{sidebar-width,rail-width}",
    category: "component",
    tier: "component",
    role: "AppShell docked navigation rail widths (gh#213) — `--app-shell-sidebar-width` (default 16rem) is the expanded rail, `--app-shell-rail-width` (default 4rem) the icon-only rail used at `<AppShell sidebarCollapsed>`. These were hard-coded `grid-template-columns` literals; a service on a different design grid (e.g. a 255px rail) now sets ONE token in its theme instead of forking `.app-root`. Below the 900px shell breakpoint both collapse to a single full-width column and the sidebar moves into AppShell's drawer.",
  },
  {
    name: "--app-shell-bar-{inset,inset-compact,gap}",
    category: "component",
    tier: "component",
    role: "AppShell top-bar chrome (gh#213) — `--app-shell-bar-inset` is the bar's inline padding (default --space-4), `--app-shell-bar-inset-compact` the tighter value applied below the 900px breakpoint where the docked rail is gone (default --space-3), `--app-shell-bar-gap` the gap between the bar's direct children (default --space-3). Height stays `--app-shell-bar-height` (3rem), which now holds at EVERY width — a duplicate 768px rule used to override it with a literal.",
  },
  {
    name: "--topbar-{height,inset,gap}",
    category: "component",
    tier: "component",
    role: "Standalone `<Topbar>` box knobs (gh#213). Topbar is a pure slot bar, so the defaults are the QUIET ones and rendering is unchanged from before they existed: `--topbar-height: auto` and `--topbar-inset: 0px` (inside AppShell the `.app-topbar` grid row owns height and inset), `--topbar-gap: var(--space-2)`. A service that mounts Topbar DIRECTLY on a page sizes it from the theme (`--topbar-height: 3.5rem; --topbar-inset: var(--space-4)`) instead of an app-local class. `--topbar-gap` is both the gap BETWEEN the start/center/end clusters and the gap INSIDE each, so one knob re-rhythms the whole bar. None of them touch the gh#226 shrink contract (start clips, center yields first, end stays anchored inline-end).",
  },
  {
    name: "--{dialog,sheet}-overlay-background / --app-shell-mobile-nav-background (+ -alpha)",
    category: "component",
    tier: "component",
    role: "Overlay scrims (gh#215). All three are ROLE-MIRROR knobs declared `initial` at `:root`, with the default resolved at the CALL SITE as a SHARE of the one semantic `--overlay-background` — `color-mix(in srgb, var(--overlay-background) var(--<x>-overlay-alpha), transparent)`. Previously each carried a private literal, so setting `--overlay-background` had NO effect anywhere. The share knobs (`--dialog-overlay-alpha` 60%, `--sheet-overlay-alpha` 40%, `--app-shell-mobile-nav-alpha` 40%) keep every default byte-identical (0.3 / 0.2 / 0.2 black) while letting one `--overlay-background` override retint the whole system, including scoped `[data-tenant]` / `.dark` themes. Setting a `*-overlay-background` knob directly still wins outright. NOTE: overlays render in a portal, so a multi-tenant scope must also sit on the portal container.",
  },
];

export function tokensByCategory(category: TokenCategory): TokenEntry[] {
  return TOKENS.filter((t) => t.category === category);
}
