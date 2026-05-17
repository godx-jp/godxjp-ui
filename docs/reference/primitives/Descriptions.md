---
title: "Descriptions"
description: "Ant-Design label/value table for static info, with column-count, horizontal/vertical layout, and bordered variants."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Descriptions

Ant-Design-shaped label/value table for static info. Three orthogonal axes: `column` (grid track count at default breakpoint), `layout` (`horizontal` inline label + value vs `vertical` stacked), and `bordered` (outer + inner hairlines). Each `Descriptions.Item` carries a `label` and a `span` (column span). All values pinned to design tokens via the `.descriptions-*` class family.

## Import

```ts
import { Descriptions } from "@godxjp/ui/components/primitives"
```

## Props

### `Descriptions`

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | — | Heading above the grid |
| `extra` | `ReactNode` | — | Trailing slot in the title row |
| `column` | `number` | `3` | Columns at default breakpoint (1..6) |
| `layout` | `"horizontal" \| "vertical"` | `"horizontal"` | Label inline-left or stacked above value |
| `bordered` | `boolean` | `false` | Show outer + inner borders |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Density step |

### `Descriptions.Item`

| Prop | Type | Default | Description |
|---|---|---|---|
| `label *` | `ReactNode` | — | Item label |
| `span` | `number` | `1` | Columns this item spans (1..column) |

## Example

```tsx
<Descriptions title="従業員情報" column={3}>
  <Descriptions.Item label="氏名">田中 美咲</Descriptions.Item>
  <Descriptions.Item label="社員番号">EMP-00482</Descriptions.Item>
  <Descriptions.Item label="所属">渋谷本店</Descriptions.Item>
  <Descriptions.Item label="役職">店長</Descriptions.Item>
  <Descriptions.Item label="入社日">2021年4月1日</Descriptions.Item>
  <Descriptions.Item label="連絡先">090-1234-5678</Descriptions.Item>
</Descriptions>
```

## Related

- Story catalogue: [`Descriptions` stories](../../../src/stories/data-display/Descriptions.stories.tsx)
- Source: [`src/components/data-display/Descriptions.tsx`](../../../src/components/data-display/Descriptions.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
