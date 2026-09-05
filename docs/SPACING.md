# Spacing & golden ratio (@godxjp/ui)

Macro layout uses a **φ modular scale** (≈ 1.618). Reference: [NN/G — golden ratio in UI](https://www.nngroup.com/articles/golden-ratio-ui-design/).

Implementation: `src/tokens/base.css` (values) · layout owners: `src/styles/*-layout.css` · full map: `docs/TOKENS.md`.

## Rules for apps

1. **Never** Tailwind `gap-*`, `space-*`, `p-*`, `m-*` for layout — the audit rejects them (`no-utility-spacing`, `no-utility-layout`). Rows are `<Flex>` (default `direction="row"`), stacks are `<Flex direction="col" gap>`, grids are `<ResponsiveGrid>`.
2. **Page sections are spaced by `<PageContainer>` itself**: every direct child of the page body gets `--page-body-gap` (the section step, φ⁰) above it. Do not wrap the sections in a Flex just to space them; do not add margins.
3. Inside a section: `<Flex direction="col" gap="md">` (φ⁰) for the default rhythm, `gap="lg"` (φ¹) / `gap="xl"` (φ²) for major blocks, `xs` / `sm` (4px grid) for control rows.
4. Card rhythm is token-driven — do not override card padding in app CSS.

## φ scale (one knob)

| Token      | Formula             |
| ---------- | ------------------- |
| `--phi-n1` | unit ÷ φ            |
| `--phi-0`  | unit (`--phi-unit`) |
| `--phi-p1` | unit × φ            |
| `--phi-p2` | unit × φ²           |

`--phi-unit` steps up at `sm` breakpoint; density (`compact` / `comfortable`) retunes it on `PageContainer`.

## Flex gap map

| Prop       | Token    | Typical use           |
| ---------- | -------- | --------------------- |
| `xs`, `sm` | 4px grid | Tight form rows       |
| `md`       | φ⁰       | Default sections      |
| `lg`       | φ¹       | Dashboard blocks      |
| `xl`       | φ²       | Page-level separation |

## Card

**Single owner:** `src/styles/card-layout.css` - all `[data-slot="card-*"]` padding. Components emit `data-slot` + modifier flags only (`data-banded`, `data-flush`, `data-tight`, `data-solo`, `data-separated`). Never Tailwind `p-*` / `px-*` on `Card*` in apps or previews.

| Part                                              | Ratio                    | Role                                       |
| ------------------------------------------------- | ------------------------ | ------------------------------------------ |
| `--card-space-inset`                              | `--space-section-active` | Inline (start/end) inset                   |
| `--card-space-shell-y`                            | `--card-space-inset`     | Block shell padding (first/last slot edge) |
| `--card-space-body-y`                             | `--space-section-active` | Header↔body gap                            |
| `--card-space-header-y` / `--card-space-footer-y` | `--space-stack-sm`       | Banded header + separated footer band      |

| Component                 | Use                                                |
| ------------------------- | -------------------------------------------------- |
| `StatCard`                | KPI / stat tile (`solo` path)                      |
| `CardContent solo`        | Body-only card (same padding as `StatCard`)        |
| `CardContent flush tight` | Edge-to-edge table/tabs in card                    |
| `ui-card-inset-x`         | Align nested cells to shell (tables in flush body) |

See preview **Data Display → Card** for live examples.

## MCP

`get_pattern page-sections` (a page of Cards, spaced by the page) · `get_rule 40` (mobile-first spacing) · `list_audit_rules` (the spacing rules the CLI enforces).
