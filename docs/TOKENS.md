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
  layout.css                 ← Stack / Inline / Page / EmptyState
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

| App API             | Internal owner                             |
| ------------------- | ------------------------------------------ |
| `<Stack gap="md">`  | `layout.css` `.ui-stack-md`                |
| `<Inline gap="sm">` | `layout.css` `.ui-inline-sm`               |
| `<PageContainer>`   | `layout.css` `.ui-page-*`                  |
| `<Card>` slots      | `card-layout.css`                          |
| `<Table>` cells     | `table-layout.css` `[data-slot="table-*"]` |

**Apps:** no Tailwind `p-*`, `m-*`, `gap-*`, `space-*`.

### Component Tokens

Each component owns a token file under `src/tokens/components/`. The file may only derive from foundation, semantic, or other component tokens; component CSS may only consume those component tokens.

#### Role-mirror knobs MUST be `initial` + a call-site fallback (the `:root` freeze rule)

When a component-token default is just a **role token** (`--card-background` defaults to `--card`,
`--table-header-background` to `--muted`, `--checkbox-checked-background` to `--primary`,
`--focus-ring-color` to `--ring` …), you may **not** write the binding at `:root`:

```css
/* ✗ WRONG — freezes at the :root role value */
:root { --card-background: var(--card); }
.ui-card { background: hsl(var(--card-background)); }
```

CSS substitutes a `var()` at the element that **declares** it, so `--card-background` computes to
`:root`'s `--card` and inherits that frozen value down. A consumer who scopes the *role*
(`[data-tenant] { --card: <dark> }` or `.dark`) overrides `--card` but **never reaches**
`--card-background` — the component keeps the light `:root` value. Under a dark theme this is glaring
(a frozen light card under white text → invisible text); under a light theme it hides silently.

Instead, declare the knob `initial` (a real, catalogued, guaranteed-invalid declaration — no role to
freeze) and move the role default to the **call site** as a fallback, so it re-resolves live at the
painting element under any scope, while an explicit theme override of the knob still wins:

```css
/* ✓ RIGHT — default re-resolves under scope; knob still overridable */
:root { --card-background: initial; } /* documented default = hsl(var(--card)) */
.ui-card { background: hsl(var(--card-background, var(--card))); }
```

The same rule applies to `@theme inline` (utilities re-resolve scoped roles) and to any
`:root`-declared **composite** that wraps a role (e.g. a focus-ring box-shadow): read the role
**directly** at the call site, never through a frozen `:root` intermediate. Pure non-colour knobs
(spacing, radius, font-size) don't need this — they aren't scope-retinted — but any colour/fill/
border/shadow knob whose default is a role token does.

Card primitive tokens:

| Token                      | Purpose                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| `--card-space-inset`       | Shared header/body/footer **x** inset — the column all slots align to |
| `--card-space-header-y`    | Banded header band vertical density (feeds `--card-space-divided-y`) |
| `--card-space-body-y`      | Gap under the header + the body's own top padding                 |
| `--card-space-footer-y`    | Separated footer band vertical density (feeds `--card-space-divided-y`) |
| `--card-space-divided-y`   | **Border-aware** symmetric top+bottom padding of a DIVIDED band    |
| `--card-space-gap`         | In-slot stack gap (header title ↕ description)                     |
| `--card-accent-rail-width` | Width of the `accent` leading-edge stripe (default `6px`)         |
| `--card-title-font-size`   | Card title scale                                                  |
| `--card-header-background` | Banded header background color token                              |
| `--card-shadow`            | Card elevation                                                   |

#### Border-aware vertical padding (dividers)

A card slot's vertical padding depends on **whether it carries a divider border** — set it once via
a token, never hard-code padding on the slot:

- **Divided band** — a `<CardHeader banded>` (bottom border + muted band) or a
  `<CardFooter separated>` (top border). It reads as its own region, so it pads **symmetrically**
  top+bottom from `--card-space-divided-y` (which defaults to `--card-space-header-y`). One knob
  keeps the header- and footer-band rhythm in sync.
- **Plain header** — no border; it _flows_ into the body. Top padding is `--card-space-inset`,
  bottom is `0`, and the body supplies the gap via `--card-space-body-y`.
- **Header above a flush table** — `<CardContent flush>` with a `<Table>`/`<DataTable>` zeroes the
  body's top padding, so the plain header instead supplies its own `--card-space-body-y` bottom gap;
  the title never butts against the table header row.

So: WITH a divider → symmetric band padding; WITHOUT → asymmetric flow padding. Tune the band
density once at `--card-space-divided-y`; tune the accent stripe at `--card-accent-rail-width`.

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

| Need            | Use                              |
| --------------- | -------------------------------- |
| KPI stat tile   | `<StatCard label value delta />` |
| Page sections   | `<Stack gap="md">`               |
| Row of controls | `<Inline gap="sm">`              |
| Status enum     | `<Badge status="…" />`           |
| Empty list      | `<EmptyState … />`               |

## Adding a new component

1. Add/update the component token file in `src/tokens/components/`.
2. Add `src/styles/<component>-layout.css` with `[data-slot="…"]` rules.
3. Import in `index.css`.
4. Component TSX: structure + `data-slot` only.
5. Extend `token-governance.test.ts` allowlist only for third-party adapters (calendar, cmdk).

## MCP

`godxjp_ui_guide` topic=`golden-ratio` · `tokens`
