---
title: "Pagination"
description: "Page jumper with first/prev/next/last, ellipsis collapsing, optional total label, and small/default sizes."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Pagination

> Page jumper — derives the page count from `total` + `pageSize`, selects active via `value` / `defaultValue` (1-based).

## Usage

```tsx
import { Pagination } from "@godxjp/ui"

<Pagination total={120} pageSize={10} defaultValue={3} />
<Pagination total={2481} pageSize={50} defaultValue={5} showTotal />
<Pagination total={120} pageSize={10} defaultValue={4} variant="simple" />
```

## Props

### `Pagination`

| Prop | Type | Default | Description |
|---|---|---|---|
| `total` | `number` | required | Total number of items |
| `pageSize` | `number` | `10` | Items per page |
| `value` | `number` | — | Controlled current page (1-based) |
| `defaultValue` | `number` | `1` | Uncontrolled initial page |
| `onValueChange` | `(page: number) => void` | — | Called when the page changes |
| `size` | `"small" \| "default"` | `"default"` | Dimensional scale |
| `variant` | `"default" \| "simple"` | `"default"` | Full button row or compact `‹ N/M ›` |
| `justify` | `"start" \| "center" \| "end" \| "between"` | `"start"` | Horizontal alignment (reuses Flex's `justify`) |
| `disabled` | `boolean` | `false` | Disable interaction |
| `showTotal` | `boolean \| ((total: number, range: [number, number]) => ReactNode)` | `false` | Render the total-row label. `true` shows `start–end / total`; pass a function for full control |
| `siblings` | `number` | `1` | Number of sibling pages to show around current before ellipsis collapses |
| `...rest` | `Omit<ComponentProps<"nav">, "onChange" \| "defaultValue">` | — | Standard `<nav>` props |

Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` (Radix-style selection), `size`, `variant`, `justify` (reused from Flex), `disabled`.

## Accessibility

- Root renders `<nav role="navigation" aria-label="Pagination">` — assistive tech identifies the pagination region.
- The active page button sets `aria-current="page"`; previous / next buttons carry `aria-label="Previous page"` / `aria-label="Next page"`.
- Ellipsis is `aria-hidden` — purely decorative.
- Keyboard: native `<button>` Tab order; Enter / Space activate. The Prev / Next buttons disable themselves at the boundaries.
- Touch-target consideration: at `size="small"` and `[data-density="compact"]` the painted buttons can be smaller than 44 × 44 px. Do not inflate them with mobile-only visual height; use `size="default"`, `variant="simple"`, or an invisible hit area when the surrounding surface needs touch-primary pagination.

## Composition

```tsx
// Centred, with total
<div style={{ minWidth: 600 }}>
  <Pagination
    total={2481}
    pageSize={50}
    defaultValue={5}
    justify="center"
    showTotal
  />
</div>

// Custom total renderer
<Pagination
  total={1240}
  pageSize={20}
  showTotal={(total, [start, end]) => `${start}–${end} 件 / 全 ${total} 件`}
/>

// Controlled
function ControlledPagination() {
  const [page, setPage] = useState(1)
  return (
    <Pagination
      total={120}
      pageSize={10}
      value={page}
      onValueChange={setPage}
    />
  )
}
```

## See also

- [Table](./Table.md) — most common host for Pagination.
- [Flex](./Flex.md) — shares the `justify` vocabulary.
- Source: [`src/components/navigation/Pagination.tsx`](../../../src/components/navigation/Pagination.tsx)
