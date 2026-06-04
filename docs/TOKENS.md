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

Card primitive tokens:

| Token                      | Purpose                              |
| -------------------------- | ------------------------------------ |
| `--card-space-inset`       | Shared header/body/footer x inset    |
| `--card-space-header-y`    | Banded header vertical density       |
| `--card-space-body-y`      | Body vertical gap after header       |
| `--card-space-footer-y`    | Separated footer vertical density    |
| `--card-space-gap`         | Header title/description gap         |
| `--card-title-font-size`   | Card title scale                     |
| `--card-header-background` | Banded header background color token |
| `--card-shadow`            | Card elevation                       |

Example app override:

```css
:root {
  --card-space-inset: var(--space-section-active);
  --card-space-header-y: var(--space-stack-sm);
  --card-title-font-size: var(--font-size-base);
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
