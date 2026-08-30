# Design tokens — single owner model (@godxjp/ui)

Every visual dimension has **one canonical owner**. Apps never patch spacing, density, typography, or color ad hoc.

## Architecture

```
src/tokens/base.css          ← token manifest; imports every base token file
src/tokens/foundation.css    ← primitive color accents, typography, raw spacing, ratio, radius, shadow
src/tokens/semantic/         ← semantic aliases by UI role
  layout.css                 ← page/section/stack/inline tokens
src/tokens/components/       ← component token files
  control.css                ← control height + control padding
  card.css                   ← Card component tokens
  table.css                  ← Table component tokens
  feedback.css               ← Dialog/Alert/EmptyState component tokens
  badge.css                  ← Badge component tokens
src/styles/
  index.css                  ← @theme bridge (Tailwind ↔ tokens) + body defaults
  density.css                ← .ui-density-* (PageContainer density prop)
  layout.css                 ← Flex / Page / EmptyState
  control.css                ← inputs, buttons height (--control-height)
  card-layout.css            ← Card* slots
  table-layout.css           ← Table + DataTable chrome
  dialog-layout.css          ← Dialog* slots
  alert-layout.css           ← Alert* slots + semantic variant colors
  badge-layout.css           ← Badge spacing
```

**Components emit `data-slot` + flags. Layout CSS applies padding/margin/gap/font-size/color.**

`base.css` is the single entry point. Primitive token files are split only for governance and audit; apps still import `@godxjp/ui/styles` once and override tokens in `theme.css`.

## By concern

### Color

| Owner                                   | Rule                                                                |
| --------------------------------------- | ------------------------------------------------------------------- |
| `base.css` `:root` / `.dark`            | HSL components (`--primary`, `--destructive`, …)                    |
| `index.css` `@theme`                    | Maps to Tailwind `bg-primary`, `text-muted-foreground`, …           |
| App `theme.css`                         | Override `:root` only — never component CSS                         |
| `alert-layout.css`, `control-styles.ts` | Semantic tones (`success`, `warning`, …) — never `text-emerald-600` |

Default brand tokens use the GodX Agent Portal palette: navy primary, 朱 orange focus/accent, warm neutral surfaces. App or customer identity colors belong in the consuming app theme, not in package tokens.

#### `--border` vs `--input` — decorative chrome vs control boundary (gh#315)

These two look like synonyms and are not. They shipped sharing one value, which is how a text
field's edge ended up at **1.46:1** against the page — the one live WCAG failure a full DXS
Platform sweep found. Keep them apart:

| Role       | What it draws                                                                                                                                                   | Contrast bar                                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--border` | Decorative chrome — table rules, card edges, section dividers, `<Separator>`                                                                                    | **None.** WCAG 2.2 SC 1.4.11 does not reach a divider; this system's dense JP grid depends on it staying quiet                                         |
| `--input`  | The boundary that **is** the control — Input, Textarea, Select, outline Button, TagInput, composite date field, topbar search, and the Switch's unchecked track | **≥ 3:1** (SC 1.4.11 Non-text Contrast) against every surface a control sits on — page, card, popover, muted/secondary panel, striped and hovered rows |

A field here has no fill of its own (`background: hsl(var(--background))`) and no shadow to speak
of, so that 1px edge is the whole visual claim that you may type there. Current values:
`30 7% 53%` light (3.47:1 on `--background`/`--card`, 3.18:1 on `--muted`) and `45 6% 47%` dark
(4.22:1 on `--background`, 3.88:1 on `--card`/`--popover`, 3.17:1 on `--muted`).

**Re-theming rule:** a service theme that retints neutrals must move these two **independently** —
setting `--input: var(--border)` re-opens the bug. `src/tokens/__tests__/input-boundary-contrast.test.ts`
recomputes the ratios from `foundation.css` and fails below 3:1, and fails outright if the two
roles are given the same value again.

The Switch's off-track borrows `--input` by default. If a service wants it quieter than the
boundary role, override `--switch-unchecked-background` (component token, `initial`, call-site
default `hsl(var(--input))`) rather than dragging `--input` back down — but whatever you set still
owes 3:1 against the page and against the thumb (`--background`), or "off" stops being a visible
state.

### Typography

| Owner               | Rule                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `base.css`          | `--font-size-xs` … `--font-size-2xl`, weights, line-heights                                     |
| `layout.css`        | Page title/subtitle, empty-state title                                                          |
| `card-layout.css`   | Banded header title override                                                                    |
| `dialog-layout.css` | Dialog title/description                                                                        |
| Components          | Use `text-sm`, `text-base` (wired to tokens) or `data-slot` CSS — never arbitrary `text-[14px]` |

Runtime scale: app `theme.css` overrides → `--font-size-sm` on root.

### Spacing / margin / gap

| App API                           | Internal owner                             |
| --------------------------------- | ------------------------------------------ |
| `<Flex direction="col" gap="md">` | `layout.css` `.ui-flex-gap-md`             |
| `<Flex gap="sm">`                 | `layout.css` `.ui-flex-gap-sm`             |
| `<PageContainer>`                 | `layout.css` `.ui-page-*`                  |
| `<Card>` slots                    | `card-layout.css`                          |
| `<Table>` cells                   | `table-layout.css` `[data-slot="table-*"]` |

**Apps:** no Tailwind `p-*`, `m-*`, `gap-*`, `space-*`.

### Component Tokens

Each component owns a token file under `src/tokens/components/`. The file may only derive from foundation, semantic, or other component tokens; component CSS may only consume those component tokens.

#### Role-mirror knobs MUST be `initial` + a call-site fallback (the `:root` freeze rule)

When a component-token default is just a **role token** (`--card-background` defaults to `--card`,
`--table-header-background` to `--muted`, `--checkbox-checked-background` to `--primary`,
`--focus-ring-color` to `--ring` …), you may **not** write the binding at `:root`:

```css
/* ✗ WRONG — freezes at the :root role value */
:root {
  --card-background: var(--card);
}
.ui-card {
  background: hsl(var(--card-background));
}
```

CSS substitutes a `var()` at the element that **declares** it, so `--card-background` computes to
`:root`'s `--card` and inherits that frozen value down. A consumer who scopes the _role_
(`[data-tenant] { --card: <dark> }` or `.dark`) overrides `--card` but **never reaches**
`--card-background` — the component keeps the light `:root` value. Under a dark theme this is glaring
(a frozen light card under white text → invisible text); under a light theme it hides silently.

Instead, declare the knob `initial` (a real, catalogued, guaranteed-invalid declaration — no role to
freeze) and move the role default to the **call site** as a fallback, so it re-resolves live at the
painting element under any scope, while an explicit theme override of the knob still wins:

```css
/* ✓ RIGHT — default re-resolves under scope; knob still overridable */
:root {
  --card-background: initial;
} /* documented default = hsl(var(--card)) */
.ui-card {
  background: hsl(var(--card-background, var(--card)));
}
```

The same rule applies to `@theme inline` (utilities re-resolve scoped roles) and to any
`:root`-declared **composite** that wraps a role (e.g. a focus-ring box-shadow): read the role
**directly** at the call site, never through a frozen `:root` intermediate. Pure non-colour knobs
(spacing, radius, font-size) don't need this — they aren't scope-retinted — but any colour/fill/
border/shadow knob whose default is a role token does.

**The same freeze bites any knob whose default is a RE-SCOPED tier, colour or not.**
`--control-height` is re-scoped by `.ui-auth-shell` (44px comfortable) and by
`.ui-auth-shell[data-variant="canonical"]` (36px), so a knob that mirrors it must follow the same
`initial` + call-site-fallback shape:

```css
:root {
  --otp-slot-size: initial;
} /* documented default = var(--control-height) */
.ui-otp-slot {
  width: var(--otp-slot-size, var(--control-height));
}
```

Written as `--otp-slot-size: var(--control-height)` at `:root` it freezes at the `:root` tier —
headless Chromium caught exactly this: the canonical auth shell's 36px OTP slots silently collapsed
to 32px (gh#233). Ask "is the default a token that some scope re-declares?", not "is the default a
colour?".

Card primitive tokens:

| Token                      | Purpose                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `--card-space-inset`       | Shared header/body/footer **inline** inset — the column all slots align to                     |
| `--card-space-shell-y`     | **Block** shell padding (header top · `solo` body top · terminal bottom) — default = the inset |
| `--card-space-header-y`    | Banded header band vertical density (feeds `--card-space-divided-y`)                           |
| `--card-space-body-y`      | Gap under the header + the body's own top padding                                              |
| `--card-space-footer-y`    | Separated footer band vertical density (feeds `--card-space-divided-y`)                        |
| `--card-space-divided-y`   | **Border-aware** symmetric top+bottom padding of a DIVIDED band                                |
| `--card-space-gap`         | In-slot stack gap (header title ↕ description)                                                 |
| `--card-accent-rail-width` | Width of the `accent` leading-edge stripe (default `6px`)                                      |
| `--card-title-font-size`   | Card title scale                                                                               |
| `--card-header-background` | Banded header background color token                                                           |
| `--card-shadow`            | Card elevation                                                                                 |

#### Border-aware vertical padding (dividers)

A card slot's vertical padding depends on **whether it carries a divider border** — set it once via
a token, never hard-code padding on the slot:

- **Divided band** — a `<CardHeader banded>` (bottom border + muted band) or a
  `<CardFooter separated>` (top border). It reads as its own region, so it pads **symmetrically**
  top+bottom from `--card-space-divided-y` (which defaults to `--card-space-header-y`). One knob
  keeps the header- and footer-band rhythm in sync.
- **Plain header** — no border; it _flows_ into the body. Top padding is `--card-space-shell-y`
  (which defaults to `--card-space-inset`), bottom is `0`, and the body supplies the gap via
  `--card-space-body-y`.
- **Header above a flush table** — `<CardContent flush>` with a `<Table>`/`<DataTable>` zeroes the
  body's top padding, so the plain header instead supplies its own `--card-space-body-y` bottom gap;
  the title never butts against the table header row.

So: WITH a divider → symmetric band padding; WITHOUT → asymmetric flow padding. Tune the band
density once at `--card-space-divided-y`; tune the accent stripe at `--card-accent-rail-width`.

#### The two card axes are independent (gh#232)

`--card-space-inset` owns the **inline** column; `--card-space-shell-y` owns the **block** shell
edges (a plain header's top, a `solo` body's top, the terminal slot's bottom). `--card-space-shell-y`
is declared `initial`, so its default resolves at the call site to `--card-space-inset` — a card that
sets neither, or that only re-tunes the inset (including `density="tight|cozy"`), renders exactly as
before. Override `--card-space-shell-y` alone to make a card **shorter without narrowing it**:

```css
/* a short login card that keeps its 24px column */
.ui-auth-shell {
  --auth-shell-card-padding-block-compact: 14px;
}
```

That AuthShell knob is wired straight to `--card-space-shell-y` on the compact auth card; the inline
column stays on `--auth-shell-compact-card-inset` and the header↔body gap on
`--auth-shell-card-body-gap-compact`. Three knobs, three axes, no consumer bridge selector on
`[data-slot="card-content"]`.

Example app override:

```css
:root {
  --card-space-inset: var(--space-section-active);
  --card-space-divided-y: var(--space-stack-md); /* roomier banded header / separated footer */
  --card-accent-rail-width: 4px; /* thinner accent stripe */
}
```

### Density

| App API                                                   | Owner         |
| --------------------------------------------------------- | ------------- |
| `<PageContainer density="compact\|default\|comfortable">` | `density.css` |

Retunes `--phi-unit`, `--control-height`, `--table-row-height`, `--table-cell-padding-y` for the whole subtree.

Control heights are `compact` 28px, `default` 32px, and `comfortable` 44px. Use `comfortable` for handheld/public surfaces that need the touch floor.

### Card / Table / Dialog / Alert

See `docs/SPACING.md` for Card slot matrix. Same pattern everywhere:

1. Component TSX → `data-slot` + modifier flags only
2. `*-layout.css` → all inset/gap/border-band rules
3. Governance test fails if TSX reintroduces padding utilities

## Preset components (avoid reinventing layout)

| Need            | Use                               |
| --------------- | --------------------------------- |
| KPI stat tile   | `<StatCard label value delta />`  |
| Page sections   | `<Flex direction="col" gap="md">` |
| Row of controls | `<Flex gap="sm">`                 |
| Status enum     | `<Badge status="…" />`            |
| Empty list      | `<EmptyState … />`                |

## The layer contract

Every rule this package ships sits inside a cascade layer, and **layer order beats specificity
outright**. Two halves, and both have already cost a release.

### Inside the package

`@import "tailwindcss"` establishes `theme, base, components, utilities`. Component CSS lives in
`@layer components`, which is **earlier** than `utilities` — so a Tailwind utility a component emits
on its own element outranks the layered rule that is supposed to own the same property, and no
selector can win that fight.

That is a real defect, not a hypothetical: `Table` renders `<table class="… text-sm">`, so the
`action-collection` preset's `font-size: var(--table-action-collection-font-size-compact)` never
applied at any width. The documented token was dead, the narrow frame stayed at 14px, and a 5–6
character Japanese label could not fit its column measure — a WCAG 2.2 SC 1.4.10 failure that only
manifests in Japanese. Two independent consumers reported it.

A **responsive re-point** that must beat such a utility goes in **`@layer godxjp-ui-responsive`**,
declared straight after Tailwind in `src/styles/base.css` and therefore the last layer:

```css
@layer godxjp-ui-responsive {
  @container ui-table-collection (width < 40rem) {
    [data-collapse-below="sm"] [data-slot="table"] {
      font-size: var(--table-action-collection-font-size-compact);
    }
  }
}
```

It is reserved for `@container` / `@media` re-points. A static rule has no business in it — that
would silently outrank a consumer's deliberate utility override. Everything static stays in
`@layer components`.

### In a consumer app

**Unlayered CSS outranks every layer, including `godxjp-ui-responsive`.** So:

- Theme this package by setting **tokens** on a wrapper element (`.my-page { --table-…: 7rem; }`).
- Do **not** write app selectors against package internals (`[data-slot]`, `[data-priority]`,
  `.ui-*`). An unlayered rule that does wins at _every_ width and kills the package's responsive
  re-points. What that looks like in production: a column measured to **0px**, wrapping one
  character per line.
- If an app genuinely must write such a rule, put it in a layer — `@layer components { … }` — so
  the package's own re-points still resolve above it.

## Adding a new component

1. Add/update the component token file in `src/tokens/components/`.
2. Add `src/styles/<component>-layout.css` with `[data-slot="…"]` rules.
3. Import in `index.css`.
4. Component TSX: structure + `data-slot` only.
5. Extend `token-governance.test.ts` allowlist only for third-party adapters (calendar, cmdk).

## MCP

`godxjp_ui_guide` topic=`golden-ratio` · `tokens`
