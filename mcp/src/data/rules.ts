/**
 * Cardinal rules — mirrors the cardinal rules in `CLAUDE.md`. The MCP
 * server exposes them via `get_cardinal_rules` so consumer agents
 * can quote them when reviewing PRs or authoring new primitives.
 *
 * NUMBERS ARE STABLE, NOT CONTIGUOUS. Rules are cited by number (`rule #44`, `#45`) in code, docs
 * and consumer repos, so a retired rule leaves a gap rather than renumbering its neighbours.
 * Retired in v32 because the tool or path they required does not exist in this repo: 30 and 34
 * (Storybook), 4 (fork-in-place), 11 (git submodules), 17 and 18 (story and `docs/reference`
 * parity scripts), 22 (`design-handoff/`). Rewritten to the real thing: 1 and 25 (Storybook ->
 * docs example pages), 3 (Radix), 5 (`initI18n` / `addResourceBundle` -> `registerMessages`),
 * 14 (the locked stack).
 */

export interface CardinalRule {
  number: number;
  title: string;
  body: string;
}

/**
 * Rule numbers retired in v32 (gh#1217): they named Storybook, Radix, i18next, a submodule and
 * paths that no longer exist. A retired number is never reused, so a citation like "rule #12" in a
 * component entry, a consumer repo or an agent's memory keeps pointing at the same rule.
 */
export const RETIRED_RULE_NUMBERS: readonly number[] = [4, 11, 17, 18, 22, 30, 34];

export const CARDINAL_RULES: CardinalRule[] = [
  {
    number: 1,
    title: "Every component has a real-screen docs page",
    body: "Every primitive / shell / composite has an example page under `docs/<group>/` (rendered at `/isolate/<group>-<name>`) covering every prop value and state on light + dark, built from real primitives.",
  },
  {
    number: 2,
    title: "Tokens, not utilities",
    body: "Visual values come from CSS custom properties in `src/tokens/` (the `@theme` bridge lives in `src/styles/base.css`). Token-named Tailwind utilities (`bg-background`) are fine; raw value utilities (`bg-blue-500`) are forbidden.",
  },
  {
    number: 3,
    title: "Accessible behaviour comes from react-aria-components, not new Radix",
    body: "Anything with keyboard / ARIA / portal behaviour is built on `react-aria-components` (or the matching `react-aria` hook). Do not add a new `@radix-ui` import: `pnpm check:radix-surface` is a ratchet that only lets the remaining Radix files shrink.",
  },
  {
    number: 5,
    title: "One message catalogue",
    body: "Strings go through `t()` / `useTranslation()` from `src/i18n/`. Consumers add or override messages with `registerMessages(locale, messages)`; there is no second i18n instance and no i18next dependency.",
  },
  {
    number: 6,
    title: "WCAG 2.2 AA baseline",
    body: "Every interactive primitive meets WCAG 2.2 AA (keyboard nav, ARIA, focus-visible, 4.5:1 text contrast, `prefers-reduced-motion`). It is measured by `pnpm check:frame-axe` on the component's own `/isolate/**` frame, run locally.",
  },
  {
    number: 7,
    title: "SemVer 2.0 + Keep a Changelog 1.1",
    body: "Every release-worthy change updates `CHANGELOG.md` under `## Unreleased` in the same PR.",
  },
  {
    number: 8,
    title: "Inclusive naming",
    body: "`allowlist` / `denylist`, `main` / `primary` / `replica` / `secondary`, `they/them`. Never `whitelist` / `blacklist` / `master` / `slave`. Lint-enforced.",
  },
  {
    number: 9,
    title: "No marketing speak",
    body: 'Banned: "powerful", "robust", "blazing fast", "best-in-class", "seamless", "enterprise-grade". State what it does.',
  },
  {
    number: 10,
    title: "English is canonical for docs",
    body: "Prose in `docs/` and `agent/` is English. Translated UI messages live in `docs/i18n/messages/<locale>.json`; a translation never replaces the English source.",
  },
  {
    number: 12,
    title: "Branch + PR workflow",
    body: "Work lands on `main` through a pull request; `feat/<scope>` / `fix/<scope>` branches. CI green + squash-merge. No direct push to `main`. `--no-verify` forbidden.",
  },
  {
    number: 13,
    title: "TypeScript strict",
    body: "Explicit types on every export. `forwardRef` for components; `ComponentPropsWithoutRef` for extension. No `any`. No `@ts-ignore` without comment + issue link.",
  },
  {
    number: 14,
    title: "Every third-party library is a deliberate, declared choice",
    body: "The runtime stack is what `package.json` declares: react-aria-components / react-aria / react-stately, cmdk, sonner, lucide-react, @tanstack/react-table, react-day-picker, class-variance-authority + clsx + tailwind-merge. A new dependency needs an ADR saying why it is the canonical choice and why an existing one cannot do it.",
  },
  {
    number: 15,
    title: "No `@apply` re-encoding tokens",
    body: "Inside a primitive `.tsx`, don't `@apply` a Tailwind utility that re-encodes a token — reference the token (or the component's CSS class in `src/styles/`) instead. Composite token-named utilities remain fine.",
  },
  {
    number: 16,
    title: "CSS source-of-truth is `src/tokens/`",
    body: "A primitive that needs a new color / spacing / radius adds the token to the right tier in `src/tokens/` FIRST, then references it.",
  },
  {
    number: 19,
    title: "No service-specific anything",
    body: "`me-service`, `forge-service`, `admin-service` never appear in source / comments / prop names. Per-deployment brand colour is a token override on `:root` or a scope such as `[data-tenant]` (see docs/CUSTOMER-THEMING.md), never a component fork.",
  },
  {
    number: 20,
    title: 'No "platform-only" exports',
    body: "Every primitive ships via `package.json::exports`. Internal-only helpers stay un-exported.",
  },
  {
    number: 21,
    title: "Every component honours every theme axis",
    body: "`.dark` / light theme, `data-density` (compact / default / comfortable) and `data-font-size` (sm / base / lg) are axes the component must follow. Read from tokens, never hardcode values.",
  },
  {
    number: 23,
    title: "Concept-first prop API",
    body: "One concept per prop. Reuse shared vocabulary (`size`, `variant`, `color`, `tone`, `accent`, `padding`, `density`, `orientation`, `placement`, `current`, `value` / `defaultValue` / `onValueChange`, `open` / `defaultOpen` / `onOpenChange`, `justify`, `sticky`, `offset`). Before adding a new prop or token: grep for an existing one.",
  },
  {
    number: 24,
    title: "Mobile-first",
    body: "Defaults target `xs` (≥0px); progressive enhancement via `sm:` / `md:` / `lg:` / `xl:` / `2xl:`. Touch targets ≥ 24 × 24 px (`--touch-target-min`, WCAG 2.2 SC 2.5.8; does NOT scale with density). Runtime viewport via `useMediaQuery` / `useIsMobile` from `@godxjp/ui/hooks`, never `window.innerWidth`. Examples render at narrow viewport first.",
  },
  {
    number: 25,
    title: "Docs pages are evidence; the primitive is the product",
    body: "When a docs example looks wrong, fix the primitive / CSS / token. Never paper over it with an example tweak. A docs-only diff without a paired primitive / CSS / token diff does not close a defect.",
  },
  {
    number: 26,
    title: "Library isolation",
    body: "`dist/` ships only the consumer surface. Tests, scripts, design-handoff, `dev-probe/` stay out of npm. Every `dependencies` entry is `external` in `tsup`. Verification via `pnpm pack` + grep of `dist/`.",
  },
  {
    number: 27,
    title: "Per-group folder structure",
    body: "Components live at `src/components/<group>/<name>.tsx`, one folder per public subpath (`general`, `layout`, `data-display`, `data-entry`, `feedback`, `navigation`, plus the adapter groups `charts`, `query`, `react-router`). The group's `index.ts` is its barrel; docs examples under `docs/<group>/` mirror the same hierarchy.",
  },
  {
    number: 28,
    title: "`src/` folder taxonomy",
    body: "Two classes: consumer surface (matched by a `tsup` entry + `package.json::exports`) and build-input-only (`cn`, shared helpers in `src/lib/`, consumed through a group barrel). No `src/internal/`, `src/clients/`, `src/screens/`. Service clients live with the composite that uses them.",
  },
  {
    number: 29,
    title: "Docs examples consume framework primitives only",
    body: "No raw `<button>` / `<input>` / hand-rolled chips when a primitive exists. HTML semantics (`<section>`, `<article>`, …) for structure are fine. Inline `style={{}}` limited to layout / positioning; no colour / radius / typography overrides.",
  },
  {
    number: 31,
    title: "No nested wrapper / convenience primitives",
    body: "One base = one framework primitive. A convenience wrapper that restates a base primitive under another name is forbidden; add a prop to the base instead. Composites that combine multiple primitives are NOT wrappers.",
  },
  {
    number: 32,
    title: "No redundant props",
    body: "Before adding a prop / item field / variant, grep the existing surface; if a field already covers the concept, use it. Top-level prop that re-expresses an item field (Timeline `pending` ↔ `items[i].animate`) is rejected.",
  },
  {
    number: 33,
    title: "Docs / source name-synchronized",
    body: "No two names for the same export across the framework surface; no legacy aliases in docs or examples (source may keep an alias for a deprecation cycle, but the documentation surface uses the canonical name only).",
  },
  {
    number: 35,
    title: "Status chips never wrap",
    body: "A `Badge` / `Badge` reads as one atomic unit. Its label must never break across lines — pin `white-space: nowrap` on the chip (done in `badge-layout.css`), especially inside narrow `DataTable` cells (スコープ / ステータス columns). If a cell is too tight, widen the column or shorten the label; never let the chip wrap.",
  },
  {
    number: 36,
    title: "Badge tone/icon are the colour escape hatch",
    body: "For ANY other value — localized labels (公開中, アクティブ) or categorical tiers (会員ランク, 契約プラン) — pass `tone` explicitly (success | warning | destructive | info | neutral) and, for non-lifecycle tiers, `icon={null}` to drop the misleading glyph. Don't let domain labels fall back to neutral grey + ○. Map domain→tone in the CONSUMER layer; the framework only provides the props.",
  },
  {
    number: 37,
    title: "DataTable is full-width — never inside a narrow grid column",
    body: "A multi-column `DataTable` occupies its OWN row at the page's full width: `<Card><CardContent flush><DataTable …/></CardContent></Card>`. Never nest it in a `lg:col-span-2` of a `ResponsiveGrid columns={3}` beside a chart — the columns get squeezed until CJK text collapses to one character per line. Charts / KPI cards go in their own row ABOVE the table. (See the `inertia-list-page` pattern.)",
  },
  {
    number: 38,
    title: "FilterBar stays OUT of CardContent flush",
    body: "`CardContent flush` strips horizontal padding for edge-to-edge tables. A `FilterBar` placed inside it loses all padding and sticks to the card edge. Render `FilterBar` as a STANDALONE block above the table card; wrap ONLY the `DataTable` / `EmptyState` in the `Card` + `CardContent flush`. Order on a list page: KPIs → FilterBar → table card.",
  },
  {
    number: 39,
    title: "Long text columns get an explicit width",
    body: "For columns whose value can be long (name / title / segment / address), set `col.width` to a Tailwind width class (e.g. `w-64`, `w-48`) so the column reserves space instead of shrinking and wrapping to many lines; leave numeric / status columns auto. Table cells default to `white-space: nowrap`, so an over-tight table scrolls horizontally rather than crushing — give the important columns real widths so the default layout reads well before any scroll.",
  },
  {
    number: 40,
    title: "Pages are mobile-first",
    body: 'Author and verify every page at 320–390px FIRST. Page sections are spaced by `PageContainer` itself (`--page-body-gap` between its direct children). Inside a section spacing comes only from `Flex` `gap` (vertical rhythm = `Flex direction="col"`, control rows = the default `direction="row"`) + `ResponsiveGrid columns={2|3|4}` (which collapse to a single column on narrow screens) — never raw `p-*` / `gap-*` / `space-*` utilities for page layout (the static audit rejects them). Styles are loaded whole: `@godxjp/ui/styles` or `styles/core`, never a hand-picked set of layers. They differ ONLY in the 729 bundled CJK `@font-face` declarations, and that difference is most of the CSS: 367 KB vs 86 KB gzip for a 15-component app (gh#971) — pick `styles/core` whenever the app loads fonts another way.',
  },
  {
    number: 41,
    title: "Drawer & dialog footer layout",
    body: 'Sheet/Dialog/AlertDialog footers are a pinned action bar (the Drawer footer convention): the footer sticks to the bottom, SheetFooter draws a full-bleed top border, and actions are RIGHT-aligned with the PRIMARY button rightmost (Cancel/secondary to its left). A destructive / clear / reset action goes far-LEFT — give that button `className="me-auto"` — the logical edge, so the action stays on the reading-start side under RTL too. NEVER stack footer buttons full-width or center them.',
  },
  {
    number: 42,
    title: "Props & Tokens Before Customization",
    body: "Before reaching for a Tailwind class, inline `style`, or extra CSS, you MUST first check whether the component already supports the need via a PROP, a design TOKEN, or a layout/typography PRIMITIVE. godx-ui is meant to be enough on its own: `className` is for genuine one-offs only — never to redo what an API already does. Specifically: (1) NEVER hand-roll typography — no `text-[13px]`/`text-[11px]` arbitrary px (bypasses the golden type scale), no `font-medium`/`font-semibold`/`text-muted-foreground` on a raw `<span>`; use `<Text size tone weight tabular mono>` / `<Heading level>`. (2) NEVER hand-roll a trivial flex/grid wrapper; use `<Flex>` / `<ResponsiveGrid>` / `<PageContainer>`. (3) NEVER set a control's radius/height/colour with a utility when a `shape`/`size`/`tone`/token exists.",
  },
  {
    number: 43,
    title: "Every form control goes through FormField",
    body: "Consumers MUST wrap every labelled form control (Input, Select, DatePicker, NumberInput, Radio.Group, Checkbox groups, range pairs, ...) in FormField — it owns the label (aria-labelledby, never a dangling <label for>), auto-generates/injects the control id, and wires aria-describedby/aria-errormessage/aria-invalid. Bare controls are the rare exception (e.g. a toolbar quick-filter with its own aria-label) and must carry id/name + aria-label themselves. Never hand-roll a label+control stack with Text/Label.",
  },
  {
    number: 44,
    title: "Chrome is a token, default quiet",
    body: "Any decorative chrome a component draws — dividers, separator borders, and the padding that exists only to space that chrome — MUST read a token; never hard-code it in `src/styles/*.css` (a hard-coded `border-bottom: 1px solid hsl(var(--border))` leaves consumers no off-switch short of a variant fork). The DEFAULT is the quietest state (`none` / balanced rhythm); a service theme opts IN, e.g. `--page-header-divider: 1px solid hsl(var(--border))`.",
  },
  {
    number: 45,
    title: "Every service-tunable constant gets a knob",
    body: 'When component CSS encodes a geometry choice that a service plausibly re-tunes to match its design handoff — form label column width, label↔control gap, header insets — it MUST be a documented component token (current value as the default). The theme sets it ONCE globally; props (`labelWidth`) override per instance; Form→FormField priority stays intact. The test: "would a service theme.css want to change this to match its design grid?" If yes and the only route is forking CSS, that is a library gap — fix the library, don\'t patch the app.',
  },
  {
    number: 46,
    title: "Typography is tokens, default is base",
    body: "The DEFAULT body size is `--font-size-base`; components render body/UI text at `base`, not at the `sm` alias. Smaller-by-design text (badge, section label, caption) is a component token defaulting to a small step (`--badge-font-size: var(--font-size-xs)`), so a service re-tunes that part without moving the global scale. The `sm`/`xs` tokens stay for the explicit `<Text size>` API. Every component token is surfaced in the MCP `get_component` output (check:mcp-token-sync).",
  },
  {
    number: 47,
    title: "The layer contract — cascade layers, not specificity",
    body: 'Every rule this package ships is inside a cascade layer, and layer order beats specificity outright. Two consequences. (1) INSIDE the package: `@layer components` is EARLIER than Tailwind\'s `utilities`, so a utility a component emits on its own element (`<table class="text-sm">`) silently outranks the component rule meant to own that property — no selector can win. A responsive re-point that must beat such a utility goes in `@layer godxjp-ui-responsive`, declared after Tailwind in `styles/base.css` and therefore LAST; it is reserved for `@container`/`@media` re-points, never static rules.',
  },
  {
    number: 48,
    title: "Two token value forms — read the call site before you set a colour",
    body: "A colour token holds EITHER bare HSL components (`--card: 60 33% 99%`, read as `hsl(var(--card))`) OR a complete CSS colour (`--card-tint: hsl(var(--primary) / 4%)`, read as `var(--card-tint)`). The NAME does not tell you which, and neither does the tier: `--menu-item-hover-background` / `--tree-node-hover-background` / `--table-row-hover-background` take a complete colour while `--segmented-item-hover-background` / `--topbar-item-hover-background` take components — five knobs for the same hover fill, all defaulting to `--accent`. Measured: 346 published tokens hold a colour, 96 components / 249 complete, and 3 say which. SET THE WRONG FORM AND NOTHING SAYS SO: the declaration is invalid at computed-value time, the property takes its own INITIAL value (`transparent` for a background) and the call-site fallback is NOT used — so the surface shows what is behind it and reads exactly like a knob that does not work (a table header measured 1.03:1 this way). The tell in DevTools: the custom property holds what you wrote and the painted property is `rgba(0, 0, 0, 0)`. To check a knob: `grep -rho 'hsl(var(--NAME\\|var(--NAME' node_modules/@godxjp/ui/dist` — `hsl(var(--NAME` means components, bare `var(--NAME` means complete. Grep `dist` whole: some knobs are read from a component's JS, not its CSS. SUB-TRAP: a components role may carry an alpha (`--card: 0 0% 100% / 42%` is how a glass theme works) but 83 declarations across 15 roles apply their OWN alpha (`hsl(var(--accent) / 0.7)`), and a second `/` is a parse error → transparent. `--primary`, `--muted`, `--destructive`, `--warning`, `--success`, `--info`, `--accent`, `--foreground`, `--muted-foreground`, `--table-row-tone-color`, `--background`, `--destructive-foreground`, `--secondary`, `--accent-foreground`, `--ring` all have at least one such reader; `--card` and `--popover` have none. docs/CUSTOMER-THEMING.md \"Building a COMPLEX theme\" §1.",
  },
  {
    number: 49,
    title: "Interaction states are 95 separate tokens — resting state is not one of them",
    body: 'Hover, active, selected, checked, pressed and focus are their own tokens: 95 published (`node -e "const t=require(\'./node_modules/@godxjp/ui/agent/tokens.json\'); console.log(t.filter(x => /-(hover|active|selected|checked|pressed|focus)(-|$)/.test(x.name)).length)"`), 62 of which paint a colour, an edge or an elevation. A theme that re-materialises a surface and sets only its RESTING fill ships every other state broken, and each defect is reported from a screenshot rather than by a gate: a sidebar row at dark-violet-on-violet (`--sidebar-item-active-foreground` defaults to the live `--primary-active`, in `src/styles/shell-layout.css`), a Segmented hover with a dark fill under dark text (`--segmented-item-hover-background` set without `--segmented-item-hover-color`), a Topbar hover block. `--focus-ring-color` is on that list and a ring that fails 3:1 on its new ground is a WCAG 2.2 SC 1.4.11 defect, not a polish item. THE METHOD: for every component you re-theme, list its tokens (`get_component`, or `grep -- "--<component>-" node_modules/@godxjp/ui/dist/tokens/components/`) and set the state rows at the same time as the resting row. A state knob left at its default resolves against the LIVE role at the painting element — the correct default, and exactly why it can be wrong for you once `--accent` is no longer pale.',
  },
  {
    number: 50,
    title: "A scoped theme must state its own `color`",
    body: "`src/styles/base.css` sets `color: hsl(var(--foreground))` on `body`, which is above every scope a consumer can make, so that `var()` substitutes against the ROOT's `--foreground` exactly once and every element below inherits the already-resolved colour. A plain `<div>` carrying a theme's tokens therefore retints every SURFACE and no TEXT: measured, a title whose own computed `--foreground` was the theme's near-white still painted `rgb(36, 35, 30)`, 1.34:1 on real pixels, with every element reporting it was inside the scope (gh#881). It is the §3 freeze rule applied to a PROPERTY instead of a token, and worse there — a token can be given a knob and `color` on `body` cannot. FIX, React: wrap the region in `ThemeScope` (`@godxjp/ui/app`), which re-states `color` on its own element (`src/lib/overlay-portal.tsx`, `display: contents` so the box goes and the inheritance stays) AND on the body-level host it creates for portalled overlays — the other half, since a Dialog portals to `document.body` and would otherwise wear the root's theme. FIX, stylesheet-only scope: declare `color: hsl(var(--foreground))` on your own selector alongside the tokens; that is your element, not a selector into this package, so cardinal rule \"a consumer sets tokens, never selectors\" permits it — but it does NOT reach portalled overlays. docs/TOKEN-RESOLUTION.md §5 rule 7.",
  },
];

export const VOCABULARY_TOKEN_RULES: CardinalRule[] = [
  {
    number: 1,
    title: "Prop Registry Entry",
    body: "Prop vocabulary: every exported `*Prop` type in `src/props/components/` MUST have exactly one `COMPONENT_PROP_REGISTRY` entry.",
  },
  {
    number: 2,
    title: "Public Field Mapping",
    body: "Prop vocabulary: every public property in an exported component prop type MUST map to one `VOCABULARY_REGISTRY` entry or to a `local: true` registry record with a non-empty `reason`.",
  },
  {
    number: 3,
    title: "Vocabulary Exists",
    body: "Prop vocabulary: every vocabulary name referenced by `COMPONENT_PROP_REGISTRY[*].vocabulary` MUST exist in `VOCABULARY_REGISTRY`.",
  },
  {
    number: 4,
    title: "Shared Concepts",
    body: "Prop vocabulary: the same prop spelling, value kind, and semantic role used by two or more components MUST use one shared vocabulary entry.",
  },
  {
    number: 5,
    title: "GapProp",
    body: "Prop vocabulary: `gap` MUST use the single shared `GapProp` vocabulary on every layout primitive (`Flex`, `ResponsiveGrid`) — there are NO per-component gap vocabularies, and none may be added to the registry.",
  },
  {
    number: 6,
    title: "TitleProp",
    body: "Prop vocabulary: primary heading text MUST use `TitleProp`; `PageTitleProp` MUST NOT be a canonical registry entry.",
  },
  {
    number: 7,
    title: "Value Props",
    body: "Prop vocabulary: abstract controlled values MUST use `value?: ValueProp<T>`, `defaultValue?: DefaultValueProp<T>`, and `onValueChange?: OnValueChangeProp<T>`; `onChange` MAY be used only for DOM event handlers or explicitly local compatibility wrappers.",
  },
  {
    number: 8,
    title: "Open Props",
    body: "Prop vocabulary: disclosure/open state MUST use `open?: OpenProp`, `defaultOpen?: DefaultOpenProp`, and `onOpenChange?: OnOpenChangeProp`.",
  },
  {
    number: 9,
    title: "ToneProp",
    body: "Prop vocabulary: semantic color/status intent MUST use `tone` with `ToneProp` or a documented status-specific subtype; `variant` MUST NOT include status-only values such as `success`, `warning`, `info`, or `neutral`.",
  },
  {
    number: 10,
    title: "Variant Scope",
    body: "Prop vocabulary: `variant` MAY be component-specific only when its registry entry documents the component semantics and allowed values; one global `VariantProp` MUST NOT be used to collapse non-interchangeable value unions.",
  },
  {
    number: 11,
    title: "SizeProp",
    body: "Prop vocabulary: public `size` values MUST use shared `SizeProp` names or a documented component-specific subset; aliases such as `small` MUST be renamed to the canonical shared value.",
  },
  {
    number: 12,
    title: "DensityProp",
    body: "Prop vocabulary: public density MUST use `DensityProp` when the component participates in page/subtree density; component-specific density subsets MUST be documented with a registry reason.",
  },
  {
    number: 13,
    title: "Named Events",
    body: "Prop vocabulary: no new public `HandlerProp` use is allowed for named user events; command callbacks MUST have event-specific names such as `onConfirm`, `onRetry`, `onDismiss`, or `onValueChange`.",
  },
  {
    number: 14,
    title: "Token Tiers",
    body: "Design tokens: package tokens MUST be organized into primitive, semantic, and component tiers.",
  },
  {
    number: 15,
    title: "Tier Roles",
    body: "Design tokens: primitive tokens MUST define raw scales or palettes only; semantic tokens MUST alias primitives by UI role; component tokens MUST alias semantic or primitive tokens by component part/state.",
  },
  {
    number: 16,
    title: "No Domain Nouns",
    body: "Design tokens: package CSS custom properties and Tailwind `@theme` exports MUST NOT contain app, customer, or business-domain nouns.",
  },
  {
    number: 17,
    title: "No Tracking Tokens",
    body: "Design tokens: `--tracking-*` and `--color-tracking-*` are forbidden in package source.",
  },
  {
    number: 18,
    title: "Component Token Names",
    body: "Design tokens: component-scoped tokens MUST live in the component tier and use `--{component}-{part}-{property}` or `--{component}-{property}-{state}` naming consistently.",
  },
  {
    number: 19,
    title: "Theme References",
    body: "Design tokens: Tailwind `@theme` color exports MUST reference package tokens; literal colors are allowed only when first registered as primitive or semantic tokens.",
  },
  {
    number: 20,
    title: "Decorative Primitives",
    body: "Design tokens: public raw/decorative primitive exports are allowed only under documented neutral namespaces such as `wa-*` or `chart-*`; undocumented raw ramps such as public `gray-*`/`blue-*` exports are forbidden.",
  },
  {
    number: 21,
    title: "Dark Semantic Overrides",
    body: "Design tokens: dark mode MUST override semantic tokens by role; component-token dark overrides require a documented component contrast reason.",
  },
  {
    number: 22,
    title: "Density Aliases",
    body: "Design tokens: density CSS MUST select token aliases and MUST NOT introduce new raw component dimensions when a token tier can hold the value.",
  },
];

export function findRule(num: number): CardinalRule | undefined {
  return CARDINAL_RULES.find((r) => r.number === num);
}
