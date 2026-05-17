# 03 — Token system foundation

**Status:** Binding. The design system's source-of-truth for every
visual value (colour, typography, spacing, density, radius, shadow,
motion, layout). Read before adding a token, renaming a token,
removing a token, or writing any CSS that needs a value.

`@godxjp/ui` ships a layered token system extracted from the
canonical dxs-kintai bundle at
`design-handoff/ui-system/dxs-kintai-design-system/project/colors_and_type.css`.
Per cardinal rule 22 every component reads from tokens; no
component hardcodes a literal value. Per cardinal rule 21 every
token cascades through the four theme axes ([01-theme-axes.md](./01-theme-axes.md)).

## §A — Architecture

Three layers, in cascade order (top wins):

1. **Primitives** (raw values) — type scale, spacing scale, raw
   colour scales (`--gray-*`, `--blue-*`), raw radius / shadow /
   motion. Lives in `:root` of `src/styles/theme.css`. Immutable
   across themes; only the cardinal rule 14 ADR can change them.

2. **Semantic** (role aliases) — `--background`, `--foreground`,
   `--primary`, `--card`, `--border`, `--ring`, `--muted-foreground`,
   `--success`, `--warning`, `--info`, `--attention`, `--destructive`,
   `--sidebar-{bg,fg,border,active-*}`, `--surface-{1,2,3}`, and
   the per-component chrome tokens (`--card-pad-y-*`,
   `--card-title-size`, `--density-{element,card,page,…}`).
   Also lives in `:root`. THIS is the layer components reference.

3. **Variants** (axis-bound rebindings) — `[data-theme="dark"]`,
   `[data-density="compact|comfortable"]`, `[data-accent="*"]`,
   `html[data-font-size="*"]`. Each block re-binds a disjoint
   subset of semantic tokens for its axis value (see
   [01-theme-axes.md](./01-theme-axes.md) §"The four canonical axes").

International-standard references:

- **W3C Design Tokens Community Group** — "Three-tier token
  architecture" (primitive → semantic → component).
  <https://design-tokens.github.io/community-group/format/>
- **Material Design 3 — Tokens** — "Reference / system / component"
  three-tier model. <https://m3.material.io/foundations/design-tokens/overview>
- **Tailwind CSS v4 `@theme inline`** — maps CSS custom properties
  into the utility surface so `bg-primary` resolves to
  `var(--primary)`. <https://tailwindcss.com/docs/theme>
- **IBM Carbon Design — Themes** — naming convention parallels
  (`$layer-01`, `$layer-02`).

## §B — Colour

### Brand chain (`--primary` family)

Defined in `:root`, re-bound per `[data-accent]` value.

```css
--primary:            oklch(56% 0.15 240);
--primary-foreground: oklch(99% 0.002 60);
--ring:               oklch(56% 0.15 240);
--brand:              oklch(60% 0.137 163);
```

| Axis value             | Hue ° | Typical role                |
|------------------------|------:|-----------------------------|
| `data-accent="blue"`   |   246 | default — SmartHR blue       |
| `data-accent="green"`  |   158 | success-leaning             |
| `data-accent="violet"` |   302 | enterprise-cool             |
| `data-accent="amber"`  |    75 | warmth / hospitality        |
| `data-accent="rose"`   |    18 | attention / brand variant   |
| `data-accent="slate"`  |   250 | low-chroma neutral          |

Brand chain rules:

- `--primary` lives in OKLCH lightness 56% / chroma 0.13–0.15 (light
  mode). Dark mode lifts to lightness 70–72% and matches chroma so
  the surface stays readable.
- `--primary-foreground` is the high-contrast text-on-primary
  colour (off-white in light mode, dark grey in dark mode).
- `--ring` is the focus-visible outline; **must** equal `--primary`
  for the canonical accent palettes.
- `--brand` is the avatar / logo / brand-stripe colour. Defaults to
  Famgia emerald in `:root`; `[data-accent]` blocks re-target it.

Tints derive via `color-mix`:

```css
background: color-mix(in oklch, var(--primary) 14%, transparent);
border-color: color-mix(in oklch, var(--primary) 20%, transparent);
```

**Never** hardcode a tint — always express as `color-mix` so the
accent axis rescales.

### Surface chain (light + dark)

```css
--background        /* page bg */
--card              /* raised surface */
--popover           /* floating surface */
--secondary         /* muted fill (table head, switch track) */
--muted             /* muted text bg (chip default) */
--accent            /* hover tint */
--surface-1         /* = card */
--surface-2         /* page bg subtle */
--surface-3         /* hover / active accent */
--surface-inset     /* depressed surface */
```

In light mode every surface sits in OKLCH lightness 93–99% / chroma
≤0.005. In dark mode 18–30% / chroma ≤0.008. Foreground tokens
flip accordingly.

### Semantic chain (status / state)

Fixed mapping, **never** substitute. Per the dxs-kintai SKILL.md:

```css
--success      /* 若竹 #68be8d — 72% 0.13 155 */
--warning      /* 山吹 #f8b500 — 80% 0.17 85  */
--info         /* 群青 #4c6cb3 — 55% 0.12 265 */
--error        /* 茜  #b7282e — 52% 0.18 25  (= --destructive) */
--attention    /* 朱  #eb6101 — 66% 0.19 45  */
--destructive  /* alias of --error */
```

`--attention` (朱 vermilion) is preferred over `--destructive`
(茜 madder) for **non-destructive alerts** like 遅刻 (lateness),
slow operations, retryable failures. The "everything's red"
pattern is dated; reach for attention first.

### Wa-iro (和色) decorative palette

Traditional Japanese hues for charts, tags, brand tints. **Never**
mapped to a semantic role.

```css
--wa-ai        /* 藍   indigo            */
--wa-gunjo     /* 群青 ultramarine      */
--wa-ruri      /* 瑠璃 lapis             */
--wa-kon       /* 紺   navy              */
--wa-wakatake  /* 若竹 young bamboo     */
--wa-moegi     /* 萌葱 spring green     */
--wa-yamabuki  /* 山吹 mountain yellow  */
--wa-shu       /* 朱   vermilion        */
--wa-akane     /* 茜   madder            */
--wa-enji      /* 臙脂 cochineal         */
--wa-sakura    /* 桜   cherry            */
--wa-sumi      /* 墨   ink               */
--wa-nezu     /* 鼠   mouse grey       */
```

### Forbidden in colour

- Hex literals (`#0077c7`) in any component CSS or `style=` prop.
- OKLCH literals (`oklch(56% 0.15 240)`) outside `theme.css` /
  `:root` / `[data-accent]` blocks.
- `--gray-*` / `--blue-*` / `--rose-*` raw scales in a component
  (they're internal compatibility shims, not for direct use).
- Mapping a wa-iro hue to a semantic role (`background:
  var(--wa-shu); color: var(--destructive-foreground)` — confuses
  the message).

## §C — Typography

### Scale

```css
--text-2xs:  0.6875rem  /* 11px — fine print, micro labels */
--text-xs:   0.75rem    /* 12px — captions, footnotes */
--text-sm:   0.8125rem  /* 13px — dense table rows */
--text-base: 0.875rem   /* 14px — DEFAULT body (JP density) */
--text-md:   1rem       /* 16px — content-heavy body */
--text-lg:   1.125rem   /* 18px — subheading */
--text-xl:   1.25rem    /* 20px — h3 / page title */
--text-2xl:  1.5rem     /* 24px — h2 */
--text-3xl:  1.875rem   /* 30px */
--text-4xl:  2rem       /* 32px — h1 cap */
```

### Heading semantic aliases

JP enterprise convention — intentionally small. Don't go bigger
than these unless you're writing a marketing landing page.

```css
--heading-h1: var(--text-xl)    /* 20px */
--heading-h2: var(--text-lg)    /* 18px */
--heading-h3: var(--text-base)  /* 14px */
--heading-h4: var(--text-sm)    /* 13px */
```

### Line-height

```css
--leading-none:    1
--leading-tight:   1.25   /* headings */
--leading-normal:  1.5    /* dense / single-line UI */
--leading-body:    1.7    /* JP body default — 間 (ma) principle */
--leading-relaxed: 1.625
--leading-loose:   2
```

### Weight

**Three weights only** (簡素 — kanso):

```css
--font-weight-normal:   400  /* body */
--font-weight-medium:   500  /* heading default — freee vibes */
--font-weight-bold:     700  /* emphasis only */
```

Banned: 300 (kana strokes vanish at small sizes), 600 (ambiguous
between 500 and 700). `--font-weight-semibold: 600` exists as a
legacy alias but new code uses 500 or 700.

### Family

```css
--font-sans-jp:
  "M PLUS 2", "Hiragino Sans", "ヒラギノ角ゴシック",
  "Hiragino Kaku Gothic ProN", "Yu Gothic Medium", "游ゴシック Medium",
  YuGothic, "Noto Sans JP", Meiryo, メイリオ,
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui,
  sans-serif;

--font-mono:
  ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
  "Liberation Mono", monospace;
```

Used by `body` automatically via `@layer base`. Components do not
restate `font-family` unless the use case requires monospace
(`font-variant-numeric: tabular-nums` covers most numeric
alignment needs without switching to mono).

### Forbidden in typography

- `font-size: 14px` literal — use `var(--text-base)`.
- `font-weight: 600` — use 500 or 700.
- A new heading size that isn't on the scale.
- Mixing `font-family` per component.

## §D — Spacing

Four-pixel grid. Express every gap / padding / margin as a token.

```css
--spacing-0:  0
--spacing-1:  0.25rem  /*  4px */
--spacing-2:  0.5rem   /*  8px */
--spacing-3:  0.75rem  /* 12px */
--spacing-4:  1rem     /* 16px */
--spacing-5:  1.25rem  /* 20px */
--spacing-6:  1.5rem   /* 24px */
--spacing-8:  2rem     /* 32px */
--spacing-10: 2.5rem   /* 40px */
--spacing-12: 3rem     /* 48px */
--spacing-16: 4rem     /* 64px */
--spacing-20: 5rem     /* 80px */
--spacing-24: 6rem     /* 96px */
```

10px and 14px (which appear in some design literals) are NOT on
the spacing scale. The framework adds them as **component-scope
tokens** instead — e.g. `--card-pad-y-header: 0.625rem` (10px)
lives in `:root` as a card-chrome token, not a generic spacing
token. Per cardinal rule 22 we don't substitute a "close enough"
spacing value.

Tailwind v4 utilities `p-page`, `gap-section`, `p-card` resolve
via the `@theme inline` map in `src/tokens/tailwind.css`.

## §E — Density

`[data-density]` rebinds the density chain ([01-theme-axes.md §3](./01-theme-axes.md#3--data-density--spacing-density)):

```css
--density-element-xs   /* button-extra-small — 24px DEFAULT */
--density-element-sm   /* button-small        — 28px DEFAULT */
--density-element      /* button / input / picker — DEFAULT 32px */
--density-element-lg   /* button-large        — 36px DEFAULT */
--density-element-xl   /* login form floor    — 44px = touch-target */
--density-card         /* card inner padding  */
--density-dialog       /* dialog padding      */
--density-page         /* page top padding    */
--density-section      /* between-section gap */
--density-page-title   /* page title size     */
--density-table-head   /* table header row    */
--header-height        /* topbar              */
--touch-target-min     /* WCAG floor — NOT scalable */
```

The `size` vocabulary in
[`04-prop-vocabulary.md`](./04-prop-vocabulary.md) §B maps directly
onto this chain: `size="x-small"` → `--density-element-xs`,
`size="small"` → `-sm`, `size="default"` → `--density-element`,
`size="large"` → `-lg`, `size="x-large"` → `-xl`.

| Token                  | compact | default | comfortable |
|------------------------|--------:|--------:|------------:|
| `--density-element`    |  1.75rem |  2rem  |     2.75rem |
| `--density-card`       |  0.75rem |  1rem  |      1.5rem |
| `--density-page`       |  0.75rem |  1rem  |      1.5rem |
| `--header-height`      |  2.5rem  |  3rem  |     3.5rem  |
| `--density-table-head` |  1.75rem |  2rem  |     2.5rem  |

`--touch-target-min: 44px` does NOT scale — WCAG 2.1 AA floor.

## §F — Radius

```css
--radius:      0.375rem  /* 6px — BASE */
--radius-sm:   calc(var(--radius) - 4px)  /* 2px */
--radius-md:   calc(var(--radius) - 2px)  /* 4px */
--radius-lg:   var(--radius)              /* 6px */
--radius-xl:   calc(var(--radius) + 4px)  /* 10px */
--radius-full: 9999px                     /* pill */
--border-width: 1px
```

Conventions:

- Buttons + inputs: `var(--radius-md)` (4px).
- Cards + dialogs: `var(--radius-lg)` (6px).
- Tags + chips: `var(--radius-full)` (pill).
- Small ribbons + meta chips: `var(--radius-sm)` (2px).

Border width is locked to 1px. 2px borders are reserved for accent
edges on cards (3px) and focus rings (2px via outline).

## §G — Shadow

Six levels, climb only when the surface needs it:

```css
--shadow-sm:    0 1px 2px 0 rgb(0 0 0 / .05)
--shadow:       0 1px 3px 0 rgb(0 0 0 / .1),  0 1px 2px -1px rgb(0 0 0 / .1)
--shadow-md:    0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1)
--shadow-lg:    0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)
--shadow-xl:    0 20px 25px -5px rgb(0 0 0 / .1), 0 8px 10px -6px rgb(0 0 0 / .1)
--shadow-2xl:   0 25px 50px -12px rgb(0 0 0 / .25)
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / .05)
```

Conventions:

- Cards at rest: **no shadow**. Border only.
- Card on hover: `var(--shadow-sm)`.
- Popover / dropdown: `var(--shadow-md)`.
- Dialog / modal: `var(--shadow-xl)`.
- Inset (depressed surface): `var(--shadow-inner)`.

Climbing the shadow ladder without a reason in the design canon is
rejected at review.

## §H — Motion

```css
--transition-fast:   150ms
--transition-base:   200ms
--transition-slow:   300ms
--transition-slower: 500ms

--ease-in:     cubic-bezier(0.4, 0, 1, 1)
--ease-out:    cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

Conventions:

- Hover state change: `var(--transition-fast)` + `ease-out`.
- Open / close (popover, dialog enter): `var(--transition-base)`
  + `ease-out`.
- Long-form transitions (route, sheet slide): `var(--transition-slow)`
  + `ease-in-out`.
- Honour `prefers-reduced-motion` at the global `@layer base` — no
  per-component override.

## §I — Layout

```css
--header-height:           3rem        /* 48px — topbar (rescales per density) */
--sidebar-width:           16rem       /* 256px */
--sidebar-collapsed-width: 4rem        /* 64px */
--sidebar-transition:      300ms
--content-sidebar-width:   20rem
--container-max-width:     1280px
--touch-target-min:        44px        /* WCAG 2.1 AA — never scales */
```

`--touch-target-min: 44px` is set at `:root` and is NOT rebound by
any axis. The WCAG floor wins over both density and font-size.

## §I-2 — Responsive breakpoints

Mobile-first min-width thresholds. Values match Tailwind v4
defaults so utility variants (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
keep working with existing class names.

```css
--breakpoint-xs:  0;       /*  0px  — phone portrait (mobile-first base) */
--breakpoint-sm:  640px;   /* 40em  — phone landscape / tablet portrait */
--breakpoint-md:  768px;   /* 48em  — tablet landscape */
--breakpoint-lg:  1024px;  /* 64em  — laptop */
--breakpoint-xl:  1280px;  /* 80em  — desktop */
--breakpoint-xxl: 1536px;  /* 96em  — wide desktop / 4K-leaning */
```

The Tailwind `@theme inline` block re-exports the canonical name
shapes (`sm` / `md` / `lg` / `xl` / `2xl`) so the utility variants
resolve via tokens. Tailwind names `2xl` ↔ our `xxl` because
Tailwind v4 doesn't recognize `xxl`; both spellings point at the
same value.

### Consuming breakpoints from JavaScript

**Never hardcode breakpoint pixel values in a component.** Per
cardinal rule 22 (no hardcoded literals) read them at runtime
from the CSS token system:

```ts
import { useBreakpoint, matchBreakpoint } from "@godxjp/ui/hooks"

function Shell() {
  const bp = useBreakpoint()
  if (bp === "xs" || bp === "sm") return <MobileShell />
  return <DesktopShell />
}

// Or: render only on >= md
function Aside() {
  const bp = useBreakpoint()
  return matchBreakpoint(bp, "md") ? <SideRail /> : null
}
```

`useBreakpoint` subscribes to `window.matchMedia` on every
breakpoint and re-renders when the viewport crosses one. The
returned value is the WIDEST currently-matching name (mobile-first
order). `matchBreakpoint(current, target)` returns `true` when
`current` is at-or-above `target` in the mobile-first ordering.

### Consuming breakpoints from CSS

Use Tailwind utility variants (resolved via `@theme inline`):

```html
<div class="block md:grid lg:flex">…</div>
```

Or raw `@media` with the tokens via `var()`:

```css
@media (min-width: 768px) {
  .my-grid { grid-template-columns: repeat(3, 1fr); }
}
```

`var()` does not work inside `@media (min-width: var(--…))`
(spec disallows). For raw media queries reference the literal
matching the token value or use Tailwind utilities.

### Container queries

Tailwind v4 ships `@container` queries. Use the same breakpoint
names via `@<bp>:`. The framework does not (yet) ship custom
container tokens; default Tailwind container sizes apply.

### Forbidden patterns

- `if (window.innerWidth >= 768) { … }` — hardcoded 768.
  Use `matchBreakpoint(useBreakpoint(), "md")`.
- `@media (min-width: 768px) { … }` in a primitive's CSS without
  citing the token. Either cite the token in a comment or use
  Tailwind utility variants.
- Adding `--bp-tablet`, `--bp-mobile` aliases. The vocabulary is
  `xs / sm / md / lg / xl / xxl` framework-wide (cardinal rule
  23 §B).

## §J — Component-scope tokens

When a component needs a value that doesn't map cleanly to the
generic tokens above, ADD a component-scope token in `:root` (the
canonical home), then reference it from the component CSS. This
keeps the cardinal-rule-22 invariant (every literal pinned to a
token) without polluting the generic spacing / type scale.

Current component-scope tokens:

```css
--card-pad-y-header: 0.625rem  /* 10px */
--card-pad-y-body:   0.875rem  /* 14px */
--card-pad-y-footer: 0.625rem  /* 10px */
--card-title-size:   0.8125rem /* 13px */
--card-meta-size:    0.6875rem /* 11px */
```

Naming convention: `--<component>-<aspect>-<axis>?` where axis is
`y`/`x`/`y-<region>`. Add via PR with reason cited in CHANGELOG.

## §K — Tailwind utility surface

`src/tokens/tailwind.css` declares `@theme inline` so Tailwind
utility classes resolve via tokens. Consumer CSS can mix tokens
and utilities freely:

```css
@theme inline {
  --color-background:  var(--background);
  --color-foreground:  var(--foreground);
  --color-primary:     var(--primary);
  --color-card:        var(--card);
  --color-border:      var(--border);
  --spacing-page:      var(--density-page);
  --spacing-section:   var(--density-section);
  --spacing-element:   var(--density-element);
  --spacing-card:      var(--density-card);
  --font-size-page-title: var(--density-page-title);
  --font-sans:         var(--font-sans-jp);
  --radius-lg:         var(--radius);
}
```

Consumers MAY write `<div className="bg-background border-border
p-page">` because every utility resolves to a semantic token. They
MAY NOT write `<div className="bg-zinc-50 border-zinc-200 p-4">`
because that hardcodes a raw scale — cardinal rule 2 violation.

## §L — Dark mode

`[data-theme="dark"]` block in `theme.css` re-binds every surface
+ foreground token. Components NEVER add their own dark-mode
selectors; if a primitive needs a dark-mode-specific value, the
fix is upstream in the dark block, not at the component.

The pattern for accent × theme intersection (rose-light vs
rose-dark) is documented at [01-theme-axes.md §2](./01-theme-axes.md#2--data-accent--color-theme-brand-hue).

## §M — How to extend

### Add a new component-scope token

1. Confirm the value can't be expressed via existing tokens. If a
   generic token works, use it.
2. Add the new token in `:root` of `src/styles/theme.css` with a
   comment citing the design literal it pins.
3. If the token participates in the dark variant, add the dark
   value in `[data-theme="dark"]`.
4. Reference the token from the component CSS / `style=` prop.
5. Update `CHANGELOG.md / ### Added`.

### Add a new accent palette

1. Add `[data-accent="<name>"] { … }` in
   `src/tokens/tailwind.css` (default layer, AFTER theme.css
   import).
2. Six tokens to set: `--primary`, `--primary-foreground`,
   `--ring`, `--brand`, `--sidebar-active-bg`,
   `--sidebar-active-fg`. Mirror the shape of an existing palette.
3. Add the dark variant `[data-theme="dark"][data-accent="<name>"]`.
4. Update [01-theme-axes.md §2 accents](./01-theme-axes.md) table.
5. Update `.storybook/preview.tsx` toolbar items so the new
   accent appears in the Color theme picker.

### Add a new density variant

`compact` / `default` / `comfortable` cover the standard density
range. Adding a fourth (e.g. `xl`) requires an ADR — three is the
international-standard count (Material 3, IBM Carbon).

### Override tokens per consumer

In a consumer's `theme.css`:

```css
@import "@godxjp/ui/tailwind.css";

:root { --primary: oklch(58% 0.18 25); /* per-deployment brand */ }
[data-accent="acme"] { --primary: oklch(…); --brand: oklch(…); }
```

Per cardinal rule 19 the framework does NOT ship per-tenant
accent blocks (`[data-tenant="kintai|tempo|betoya|godx"]`). The
consumer ships them in its own `theme.css`.

## §N — Anti-patterns (rejected at review)

- Hardcoded hex / OKLCH literal anywhere outside `:root` /
  `[data-theme="dark"]` / `[data-accent]` blocks.
- A `style={{ padding: "10px 16px" }}` prop — use the matching
  `--card-pad-y-header` / `--density-card` token chain.
- A new variant that re-encodes a token via `@apply` (cardinal
  rule 15).
- Cross-component CSS reach — `.card .button-primary` cascade —
  every component owns its own tokens, no peer reach.
- Skipping the `@layer base` for `body` font + colour — every
  consumer SPA inherits the base.

## §O — Verification

For every PR touching a token or a component CSS rule:

```bash
# Token-usage audit — fails if any component CSS hardcodes a
# literal that should be a token.
pnpm dlx stylelint 'src/components/**/*.css'

# Build + storybook + a11y — every story renders under every axis
# combination from the Tweaks panel.
pnpm build
pnpm exec storybook build -o storybook-static
```

CI runs both. Visual sweep through the Storybook toolbar
(`theme × accent × density × fontSize`) is part of the review
checklist.

## §P — Standards (international)

- **W3C Design Tokens Community Group** — three-tier architecture
  + `.tokens.json` exchange format.
  <https://design-tokens.github.io/community-group/format/>
- **Material Design 3 — Tokens** — reference / system / component
  three-tier model + dynamic colour scheme generation.
  <https://m3.material.io/foundations/design-tokens/overview>
- **Tailwind CSS v4 `@theme`** — CSS custom properties as the
  theme surface.
  <https://tailwindcss.com/docs/theme>
- **IBM Carbon Design — Tokens** — semantic colour role naming
  parallel.
  <https://carbondesignsystem.com/elements/themes/tokens/>
- **Adobe Spectrum — Tokens** — typography + spacing scale
  rationale.
  <https://spectrum.adobe.com/page/design-tokens/>
- **WCAG 2.1 AA** — `--touch-target-min: 44px` + 4.5:1 colour
  contrast.
  <https://www.w3.org/TR/WCAG21/>
- **OKLCH** colour space — perceptually uniform colour for the
  brand chain.
  <https://oklch.com/>
- **shadcn/ui** — semantic token naming convention.
  <https://ui.shadcn.com/docs/theming>

## §Q — When in doubt

Ask: "what does the design canon
(`design-handoff/ui-system/<latest-bundle>/project/colors_and_type.css`)
say this value should be?"

- If it's a literal → token-pin it (existing token or new
  component-scope token).
- If it's not in the canon → STOP. Tell the user the design
  bundle doesn't cover this value; ask them to mock it on Claude
  Design and share the new handoff URL.

Never improvise.
