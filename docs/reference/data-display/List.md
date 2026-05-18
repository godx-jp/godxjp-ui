---
title: "List"
description: "Header + items + optional footer surface — data-driven (dataSource + renderItem) or compositional (List children); grid mode via cols."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# List

> Header + items + optional footer surface. Render data-driven (`dataSource` + `renderItem`) or compositional (`<List>` children); switch to a grid by setting `cols > 1`.

Vocabulary follows cardinal rule 23 §B: `size` for dimensional scale, `bordered` for surface treatment, `cols` for grid mode (column count). The `cols` prop is the single knob for grid layout — Ant's `itemLayout` / `grid` object is not adopted.

## When to use List vs Table

| Need                                                                        | Use                           |
| --------------------------------------------------------------------------- | ----------------------------- |
| Vertical feed of records — typically avatar + title + description + actions | **List**                      |
| Cards-in-a-grid view of the same shape (use `cols`)                         | **List**                      |
| Sortable / filterable columns, header row, row selection                    | [Table](./Table.md)           |
| Flat menu of links / nav items                                              | [Menu](../navigation/Menu.md) |

## Usage

```tsx
import { List, List, Avatar, Tag } from "@godxjp/ui";

<List
  title="社員一覧"
  dataSource={employees}
  renderItem={(emp) => (
    <List
      avatar={<Avatar>{emp.name.charAt(0)}</Avatar>}
      title={emp.name}
      description={emp.role}
      extra={
        <Tag color={statusColor[emp.status]}>{statusLabel[emp.status]}</Tag>
      }
    />
  )}
/>;
```

## Props

### `List<T>` (root)

| Prop         | Type                                    | Default     | Description                                                      |
| ------------ | --------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `dataSource` | `T[]`                                   | —           | Data array — required for data-driven mode                       |
| `renderItem` | `(item: T, index: number) => ReactNode` | —           | Render function called once per datum                            |
| `header`     | `ReactNode`                             | —           | Optional header row content                                      |
| `footer`     | `ReactNode`                             | —           | Optional footer (e.g. pagination)                                |
| `title`      | `ReactNode`                             | —           | Heading rendered above the list                                  |
| `empty`      | `ReactNode`                             | `"No data"` | Empty state when `dataSource` is empty                           |
| `size`       | `"small" \| "default" \| "large"`       | `"default"` | Dimensional scale — maps to `.list-size-*`                       |
| `bordered`   | `boolean`                               | `false`     | Wrap in a bordered surface                                       |
| `split`      | `boolean`                               | `bordered`  | Show dividers between items                                      |
| `loading`    | `boolean`                               | `false`     | Render a loading placeholder instead of items                    |
| `cols`       | `number`                                | —           | Grid mode — column count. Omit / `1` for a stacked list          |
| `children`   | `ReactNode`                             | —           | Compositional `<List>` children when `dataSource` is omitted |
| `className`  | `string`                                | —           | Merged onto the `.list` root                                     |

### `List`

| Prop          | Type                                  | Default | Description                                   |
| ------------- | ------------------------------------- | ------- | --------------------------------------------- |
| `avatar`      | `ReactNode`                           | —       | Avatar / icon slot on the left                |
| `title`       | `ReactNode`                           | —       | Primary line                                  |
| `description` | `ReactNode`                           | —       | Secondary line under the title                |
| `extra`       | `ReactNode`                           | —       | Slot rendered to the right of the meta column |
| `actions`     | `ReactNode[]`                         | —       | Right-aligned action buttons / links          |
| `...rest`     | `Omit<ComponentProps<"li">, "title">` | —       | Standard `<li>` props                         |

`List` IS the `<li>` — when you supply `renderItem`, the framework does not wrap its return in another `<li>` (nested `<li>` is invalid HTML). Return a `<List>` (or another `<li>`) from `renderItem`; the framework injects the React `key` via `cloneElement`.

## Accessibility

- The list renders as `<ul class="list-items">` so screen readers announce item count.
- Avatar / extra / actions slots are visual; their meaning should still be expressed in the `title` / `description` text. If avatars represent users, set the avatar's `alt` / `aria-label` to the user's name.
- WCAG 2.1 SC 1.3.1 (Info and Relationships): keep `title` as the primary text and `description` for context. Don't move the only identifier into `extra`.
- Loading state renders a single `.list-loading` placeholder. Pair with `<span role="status" aria-live="polite">…</span>` when the load is user-initiated and progress matters.

## Composition

```tsx
// Bordered with per-item actions
<List
  bordered
  header="今週の出勤予定"
  dataSource={employees}
  renderItem={(emp) => (
    <List
      avatar={<Avatar>{emp.name.charAt(0)}</Avatar>}
      title={emp.name}
      description={emp.role}
      actions={[
        <Button key="view" size="small" variant="ghost">詳細</Button>,
      ]}
    />
  )}
/>

// Grid mode — product cards
<List
  title="今月の和雑貨"
  cols={3}
  dataSource={products}
  renderItem={(p) => (
    <Card padding="default" title={p.name}>
      <p>SKU: {p.sku}</p>
      <p>{p.price}</p>
    </Card>
  )}
/>

// Empty / loading states
<List bordered title="承認待ち申請" dataSource={[]} renderItem={() => null}
      empty={<span>承認待ちの申請はありません。</span>} />
<List bordered title="今週の出勤" loading dataSource={[]} renderItem={() => null} />
```

## See also

- [Table](./Table.md) — tabular alternative with sorting / row selection.
- [Card](./Card.md) — the primitive most often rendered inside `cols > 1` mode.
- [Pagination](../navigation/Pagination.md) — fits the `footer` slot.
- Source: [`src/components/data-display/List.tsx`](../../../src/components/data-display/List.tsx)
