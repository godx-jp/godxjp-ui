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

| Component           | Use                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StatCard`          | KPI / stat tile (`solo` path)                                                                                                                                                           |
| `CardContent solo`  | Body-only card (same padding as `StatCard`)                                                                                                                                             |
| `CardContent flush` | Edge-to-edge table/tabs in card — REQUIRED when the table IS the body (rule 10). `flush` alone drops the border, radius and inline padding; add `tight` only to change the HEADER band. |

See preview **Data Display → Card** for live examples.

### Inset classes (padding on something that is not a `Card*` slot)

`Card*` slots get their padding from `data-slot`. Everything else that must sit on the same rhythm (a table cell, a grid header strip, a scroll body, a sticky action row, a full-bleed toolbar) uses one of three public classes. They are the only legal way to take card-token padding onto a plain element, because the audit rejects Tailwind `p-*` / `px-*` (`no-utility-spacing`).

Pick by AXIS, and note that the three do **not** share one value: each reads a different card token, so `ui-card-inset` is not `ui-card-inset-x` plus `ui-card-inset-y`.

| Class             | Axis               | Token                   | Use when                                                                                                                                                                                                     |
| ----------------- | ------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ui-card-inset-x` | inline (start/end) | `--card-space-inset`    | The element must line up with the card shell edge, and the block axis is owned by something else (a fixed row height, a table cell). Rows in a `CardContent flush` table, a header strip in a bordered grid. |
| `ui-card-inset-y` | block (top/bottom) | `--card-space-header-y` | The element runs edge to edge inline but needs the band rhythm of a banded header / separated footer. A weekday header strip, a full-bleed toolbar cell.                                                     |
| `ui-card-inset`   | all four sides     | `--card-space-body-y`   | A self-contained panel that owns its own padding on every side: a scrollable body, a sticky action bar, an expanded row panel below a table row.                                                             |

Because `ui-card-inset-x` reads `--card-space-inset`, it follows the card it sits in: a `Card density="tight"` or `"cozy"` moves those cells with the shell. The other two read fixed steps (band and body) and do not.

## Control interiors are NOT on this scale

Everything above is the space **between** things — page sections, siblings in a stack, a card's
shell against its content. A control's **inside** is a different measurement and it is derived from
the control band (`--control-height`, `--control-padding-x`), never from `--space-*`. The two do not
meet, and reading a step off the table above as a minimum for a control's interior gives the wrong
answer.

The case that keeps coming up is `Segmented`'s track (gh#503). Its padding is **2px**, and the
label inside it therefore sits ~5px from the track's outer edge — under `--space-2` (8px), which is
NOT a floor this document sets for anything.

2px is the whole geometry of the control:

```
label height = --control-height − track padding × 2     →  32 − 4 = 28
```

so the track measures **exactly** `--control-height` and a `Segmented` sits level with the `Input`
and the `Button` beside it on the same row. Raise the padding to 8px and one of two things has to
give: either the label band drops to 16px — a 14px type size in a 16px box, under every hit target
this library holds — or the track grows to 44px (28 + 8 × 2) and stops lining up with every other
control. The same derivation is why a `Button`'s own label sits ~5px inside its border. A control
is sized by its band; the band is what a dense enterprise UI is for.

**The knob, if a service wants a roomier control.** `--segmented-track-padding` is a published
component token (`src/tokens/components/segmented.css`); raising it re-derives the item height from
the same formula, so the track stays exactly one control tall. Do not reach for a Tailwind `p-*` on
the control — the audit rejects it, and it would break the identity above.

## MCP

`get_pattern page-sections` (a page of Cards, spaced by the page) · `get_rule 40` (mobile-first spacing) · `list_audit_rules` (the spacing rules the CLI enforces).
