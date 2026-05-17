---
title: "Descriptions"
description: "Label/value table for static info — column-count, horizontal/vertical layout, optional bordered surface."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Descriptions

> Label/value table for static information — three orthogonal axes (`column`, `layout`, `bordered`) and a per-item `span` for irregular grids.

`Descriptions` lays out read-only attribute pairs in an N-column CSS Grid. Each `Descriptions.Item` carries a `label` (left column or stacked above, depending on `layout`) and a `span` (how many columns the value occupies). The internal grid uses `grid-template-columns: repeat(<column>, minmax(0, 1fr))` so columns share width evenly; `span` overrides per item.

Use it for read-only profile / record cards. For editable forms use [Form](./Form.md) + [Field](./Field.md); for sortable / filterable tabular data use [Table](./Table.md).

## Usage

```tsx
import { Descriptions } from "@godxjp/ui"

<Descriptions title="従業員情報" column={3}>
  <Descriptions.Item label="氏名">田中 美咲</Descriptions.Item>
  <Descriptions.Item label="社員番号">EMP-00482</Descriptions.Item>
  <Descriptions.Item label="所属">渋谷本店</Descriptions.Item>
  <Descriptions.Item label="役職">店長</Descriptions.Item>
  <Descriptions.Item label="入社日">2021年4月1日</Descriptions.Item>
  <Descriptions.Item label="連絡先">090-1234-5678</Descriptions.Item>
</Descriptions>
```

## Props

### `Descriptions` (root)

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | — | Heading rendered above the grid |
| `extra` | `ReactNode` | — | Trailing slot in the title row (typically an action button) |
| `column` | `number` | `3` | Columns at default breakpoint (1–6) |
| `layout` | `"horizontal" \| "vertical"` | `"horizontal"` | `horizontal` puts the label inline-left of the value; `vertical` stacks the label above the value |
| `bordered` | `boolean` | `false` | Show outer + inner hairlines |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Density step — maps to `.descriptions-size-*` CSS hooks |
| `...rest` | `Omit<ComponentProps<"div">, "title">` | — | Standard `<div>` props |

### `Descriptions.Item`

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | required | Item label (left column or stacked top) |
| `span` | `number` | `1` | Columns this item spans (1 ≤ span ≤ `column`) |
| `...rest` | `ComponentProps<"div">` | — | Standard `<div>` props |

## Accessibility

- Renders semantic `<div>` containers — no native `<dl>` / `<dt>` / `<dd>` (kept structural so themes don't need to override list reset rules). The label and value are visually adjacent and read in document order by screen readers.
- For mission-critical pairings (legal IDs, audit timestamps) wrap individual items in `<dl>` manually via the `...rest` spread, or pair with [Field](./Field.md) when the grid contains a mix of static and editable rows.
- WCAG 2.1 SC 1.3.1 (Info and Relationships): labels and values stay in adjacent grid cells; do not separate them with decorative dividers that change reading order.

## Composition

```tsx
// Bordered surface with mixed spans
<Descriptions title="プロジェクト概要" column={3} bordered>
  <Descriptions.Item label="案件名" span={3}>
    渋谷本店リニューアル
  </Descriptions.Item>
  <Descriptions.Item label="開始日">2026-04-01</Descriptions.Item>
  <Descriptions.Item label="終了予定">2026-09-30</Descriptions.Item>
  <Descriptions.Item label="責任者">田中 美咲</Descriptions.Item>
</Descriptions>

// Vertical layout — label stacked above value
<Descriptions title="従業員情報" column={3} layout="vertical">
  <Descriptions.Item label="氏名">田中 美咲</Descriptions.Item>
  <Descriptions.Item label="所属">渋谷本店</Descriptions.Item>
  <Descriptions.Item label="役職">店長</Descriptions.Item>
</Descriptions>
```

## See also

- [Table](./Table.md) — tabular data with sorting / filtering / pagination.
- [Form](./Form.md) — editable equivalent.
- [Field](./Field.md) — single label + value + help group.
- Source: [`src/components/data-display/Descriptions.tsx`](../../../src/components/data-display/Descriptions.tsx)
