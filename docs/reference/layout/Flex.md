---
title: "Flex"
description: "Four layout primitives — Row + Col (24-column responsive grid), Flex (flexbox container), Space (inline gap group)."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Flex (and the layout family)

> Four sibling layout primitives — `Row` + `Col` (24-column responsive grid), `Flex` (flexbox container), `Space` (inline gap group).

This page documents the FOUR primitives together because they share one responsibility — laying things out — and consumers pick between them by intent. Token-driven gap values (`small` / `middle` / `large` → `--spacing-1 / -2 / -3 / -4`) mean a `<Flex gap="middle">` lines up with a `<Row gutter={12}>` lines up with a `<Space size="middle">`.

## When to use Row/Col vs Flex vs Space

| Need                                                                                                        | Use                     |
| ----------------------------------------------------------------------------------------------------------- | ----------------------- |
| Responsive page layout — multi-column sections that reflow at breakpoints (sidebar + main, dashboard tiles) | **Row + Col**           |
| Free flexbox container — direction, gap, justify, align, wrap — without grid math                           | **Flex**                |
| Inline group of small items with consistent gap (button row, tag row, breadcrumb)                           | **Space**               |
| Fixed N-column CSS Grid (not 24-col, not responsive overrides)                                              | [Grid](./Grid.md)       |
| Pinterest-style staggered column flow                                                                       | [Masonry](./Masonry.md) |

Rule of thumb:

- **Row/Col** is a _grid_ — children sum to ≤ 24 columns; breakpoint-aware via `xs`/`sm`/`md`/`lg`/`xl`/`xxl` overrides on `Col`.
- **Flex** is a _flex container_ — one axis at a time, prop-driven.
- **Space** is an _inline group_ — the same shape as Flex but the semantics ("inline-flex") signal "small adjacent items", not "section layout".

## Usage

```tsx
import { Row, Col, Flex, Space, Button, Card } from "@godxjp/ui"

// Row + Col — responsive 24-col grid
<Row gutter={16}>
  <Col xs={24} md={8}>サイドバー</Col>
  <Col xs={24} md={16}>メイン</Col>
</Row>

// Flex — flexbox container with prop-driven config
<Flex gap="middle" justify="space-between" align="center">
  <span>Title</span>
  <Button variant="primary">保存</Button>
</Flex>

// Space — inline action group
<Space size="small">
  <Button variant="ghost">キャンセル</Button>
  <Button variant="primary">保存</Button>
</Space>
```

## Props

### `Row`

| Prop      | Type                                                                                  | Default | Description                                                                    |
| --------- | ------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------ |
| `gutter`  | `number \| [number, number] \| Partial<Record<Breakpoint, number>>`                   | `0`     | Horizontal gap (px). Tuple = `[horizontal, vertical]`. Object = per-breakpoint |
| `justify` | `"start" \| "end" \| "center" \| "space-around" \| "space-between" \| "space-evenly"` | —       | Flex justify on the main axis                                                  |
| `align`   | `"top" \| "middle" \| "bottom" \| "stretch"`                                          | —       | Flex align on the cross axis                                                   |
| `wrap`    | `boolean`                                                                             | `true`  | Wrap children when sum exceeds 24 cols                                         |
| `...rest` | `Omit<ComponentProps<"div">, "children">`                                             | —       | Standard `<div>` props                                                         |

`Breakpoint` = `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| "xxl"` — read from the `--breakpoint-*` token system (cardinal rule 24).

### `Col`

| Prop                                     | Type                    | Default | Description                                                   |
| ---------------------------------------- | ----------------------- | ------- | ------------------------------------------------------------- |
| `span`                                   | `number`                | `24`    | Default span (1–24). `24` = full width                        |
| `offset`                                 | `number`                | `0`     | Left margin in columns (0–23)                                 |
| `xs` / `sm` / `md` / `lg` / `xl` / `xxl` | `number`                | —       | Per-breakpoint span overrides                                 |
| `order`                                  | `number`                | —       | Flex order                                                    |
| `flex`                                   | `string \| number`      | —       | When set, the Col grows/shrinks like `flex: <n>` (free width) |
| `...rest`                                | `ComponentProps<"div">` | —       | Standard `<div>` props                                        |

### `Flex`

| Prop       | Type                                                                                  | Default | Description                                                          |
| ---------- | ------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| `vertical` | `boolean`                                                                             | `false` | Stack direction — `false` = horizontal row, `true` = vertical column |
| `gap`      | `number \| "small" \| "middle" \| "large"`                                            | —       | Gap between children. Token → `--spacing-2 / -3 / -4`; number → px   |
| `justify`  | `"start" \| "end" \| "center" \| "space-between" \| "space-around" \| "space-evenly"` | —       | Main-axis alignment                                                  |
| `align`    | `"start" \| "end" \| "center" \| "stretch" \| "baseline"`                             | —       | Cross-axis alignment                                                 |
| `wrap`     | `boolean \| "nowrap" \| "wrap" \| "wrap-reverse"`                                     | `false` | Wrap mode                                                            |
| `flex`     | `string \| number`                                                                    | —       | Container `flex` value (rare)                                        |
| `...rest`  | `ComponentProps<"div">`                                                               | —       | Standard `<div>` props                                               |

### `Space`

| Prop        | Type                                                                 | Default        | Description                                                       |
| ----------- | -------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------- |
| `size`      | `number \| "small" \| "middle" \| "large" \| [SpaceSize, SpaceSize]` | `"small"`      | Gap. Tuple = `[colGap, rowGap]`. Tokens → `--spacing-1 / -2 / -3` |
| `direction` | `"horizontal" \| "vertical"`                                         | `"horizontal"` | Stack direction                                                   |
| `wrap`      | `boolean`                                                            | `false`        | Allow wrapping when row overflows                                 |
| `align`     | `"start" \| "end" \| "center" \| "baseline"`                         | —              | Cross-axis alignment                                              |
| `split`     | `ReactNode`                                                          | —              | Separator rendered between siblings (e.g. a `\|`)                 |
| `...rest`   | `ComponentProps<"div">`                                              | —              | Standard `<div>` props                                            |

## Accessibility

- All four primitives render structural `<div>`s — no interactive semantics. Pair with semantic landmarks (`<header>`, `<main>`, `<aside>`, `<nav>`) where appropriate.
- `Space` renders an `inline-flex` shell so it inherits inline flow; place it inside a paragraph or a button row without disrupting reading order.
- Visual order = DOM order. Use `Col.order` / `Flex` `wrap-reverse` sparingly — they desync screen-reader reading from visual reading (WCAG 2.1 SC 1.3.2 Meaningful Sequence).

## Composition

```tsx
// Responsive dashboard layout
<Row gutter={[16, 16]}>
  <Col xs={24} md={12} lg={6}><Card title="売上">…</Card></Col>
  <Col xs={24} md={12} lg={6}><Card title="新規顧客">…</Card></Col>
  <Col xs={24} md={12} lg={6}><Card title="解約率">…</Card></Col>
  <Col xs={24} md={12} lg={6}><Card title="LTV">…</Card></Col>
</Row>

// Vertical Flex with mixed-size content
<Flex vertical gap="middle">
  <h2>2026年5月の業績</h2>
  <Flex gap="middle" align="center" wrap>
    <Tag color="success">承認済</Tag>
    <Tag color="primary">レビュー中</Tag>
    <Tag color="attention">差し戻し</Tag>
  </Flex>
</Flex>

// Space with a divider between siblings
<Space size="middle" split={<span>·</span>}>
  <a href="/dashboard">ダッシュボード</a>
  <a href="/reports">レポート</a>
  <a href="/settings">設定</a>
</Space>
```

## See also

- [Grid](./Grid.md) — fixed N-column CSS Grid wrapper.
- [Masonry](./Masonry.md) — staggered column flow.
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)
- Source: [`src/components/layout/Row.tsx`](../../../src/components/layout/Row.tsx), [`Col.tsx`](../../../src/components/layout/Col.tsx), [`Flex.tsx`](../../../src/components/layout/Flex.tsx), [`Space.tsx`](../../../src/components/layout/Space.tsx)
