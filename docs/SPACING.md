# Spacing & golden ratio (@godxjp/ui)

Macro layout uses a **φ modular scale** (≈ 1.618). Reference: [NN/G — golden ratio in UI](https://www.nngroup.com/articles/golden-ratio-ui-design/).

Implementation: `src/tokens/base.css` (values) · layout owners: `src/styles/*-layout.css` · full map: `docs/TOKENS.md`.

## Rules for apps

1. **Never** Tailwind `gap-*`, `space-*`, `p-*` for layout — use `<Stack gap>` / `<Inline gap>` / `<PageContainer>`.
2. Default section gap: `<Stack gap="md">` (= φ⁰).
3. Major blocks: `gap="lg"` (φ¹) or `gap="xl"` (φ²).
4. Card rhythm is token-driven — do not override card padding in app CSS.

## φ scale (one knob)

| Token      | Formula             |
| ---------- | ------------------- |
| `--phi-n1` | unit ÷ φ            |
| `--phi-0`  | unit (`--phi-unit`) |
| `--phi-p1` | unit × φ            |
| `--phi-p2` | unit × φ²           |

`--phi-unit` steps up at `sm` breakpoint; density (`compact` / `comfortable`) retunes it on `PageContainer`.

## Stack gap map

| Prop       | Token    | Typical use           |
| ---------- | -------- | --------------------- |
| `xs`, `sm` | 4px grid | Tight form rows       |
| `md`       | φ⁰       | Default sections      |
| `lg`       | φ¹       | Dashboard blocks      |
| `xl`       | φ²       | Page-level separation |

## Card

**Single owner:** `src/styles/card-layout.css` - all `[data-slot="card-*"]` padding. Components emit `data-slot` + modifier flags only (`data-banded`, `data-flush`, `data-tight`, `data-solo`, `data-separated`). Never Tailwind `p-*` / `px-*` on `Card*` in apps or previews.

| Part                                              | Ratio                    | Role                                         |
| ------------------------------------------------- | ------------------------ | -------------------------------------------- |
| `--card-space-inset`                              | `--space-section-active` | Horizontal inset · first/last vertical shell |
| `--card-space-body-y`                             | `--space-section-active` | Header↔body gap                              |
| `--card-space-header-y` / `--card-space-footer-y` | `--space-stack-sm`       | Banded header + separated footer band        |

| Component                 | Use                                                |
| ------------------------- | -------------------------------------------------- |
| `StatCard`                | KPI / stat tile (`size="compact"` + `solo` path)   |
| `CardContent solo`        | Body-only card (same padding as `StatCard`)        |
| `CardContent flush tight` | Edge-to-edge table/tabs in card                    |
| `ui-card-inset-x`         | Align nested cells to shell (tables in flush body) |

See preview **Data Display → Card** for live examples.

## MCP

`godxjp_ui_guide` topic=`golden-ratio` — full playbook for agents.
