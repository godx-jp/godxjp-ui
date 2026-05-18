---
title: "Pagination"
description: "Page jumper with first/prev/next/last, ellipsis collapsing, optional page-size changer, and small/default sizes."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 4.0.0
---

# Pagination

> Page jumper — derives the page count from `total` + `pageSize`, selects active via `value` / `defaultValue` (1-based). Three variants: `default` (pill bar), `simple` (`‹ N/M ›`), and `embedded` (table-footer layout with page-size changer and first/last buttons).

## Usage

```tsx
import { Pagination } from "@godxjp/ui"

// Default — pill bar
<Pagination total={120} pageSize={10} defaultValue={3} />

// With total label
<Pagination total={2481} pageSize={50} defaultValue={5} showTotal />

// Simple compact form
<Pagination total={120} pageSize={10} defaultValue={4} variant="simple" />

// Embedded inside a table footer — Table wires this automatically
// when you pass `<Table pagination={{ current, pageSize, total, onChange }} />`.
<Pagination
  variant="embedded"
  showFirstLast
  total={520}
  pageSize={20}
  value={page}
  onValueChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 20, 50, 100]}
  showTotal
/>
```

## Props

### `Pagination`

| Prop                 | Type                                                                 | Default              | Description                                                                                       |
| -------------------- | -------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| `total`              | `number`                                                             | required             | Total number of items                                                                             |
| `pageSize`           | `number`                                                             | —                    | Controlled rows per page                                                                          |
| `defaultPageSize`    | `number`                                                             | `10`                 | Uncontrolled initial page size                                                                    |
| `onPageSizeChange`   | `(pageSize: number) => void`                                         | —                    | Called when the page size changes (also resets to page 1)                                         |
| `value`              | `number`                                                             | —                    | Controlled current page (1-based)                                                                 |
| `defaultValue`       | `number`                                                             | `1`                  | Uncontrolled initial page                                                                         |
| `onValueChange`      | `(page: number) => void`                                             | —                    | Called when the page changes                                                                      |
| `size`               | `"small" \| "default"`                                               | `"default"`          | Dimensional scale (default + simple variants)                                                     |
| `variant`            | `"default" \| "simple" \| "embedded"`                                | `"default"`          | Visual treatment — see "Variants" below                                                           |
| `justify`            | `"start" \| "center" \| "end" \| "between"`                          | `"start"`            | Horizontal alignment (default + simple — reuses Flex's `justify`)                                 |
| `disabled`           | `boolean`                                                            | `false`              | Disable interaction                                                                               |
| `pageSizeOptions`    | `number[]`                                                           | `[10, 20, 50, 100]`  | Selectable page sizes for the embedded variant                                                    |
| `showSizeChanger`    | `boolean`                                                            | `true`               | Render the page-size `<select>` in the embedded variant                                           |
| `showFirstLast`      | `boolean`                                                            | `false`              | Render first / last chevron buttons (embedded variant)                                            |
| `hideOnSinglePage`   | `boolean`                                                            | `false`              | Suppress render when total fits in a single page                                                  |
| `showTotal`          | `boolean \| ((total: number, range: [number, number]) => ReactNode)` | `false`              | Render the total-row label. `true` shows `start–end / total`; pass a function for full control    |
| `siblings`           | `number`                                                             | `1`                  | Sibling pages either side of current before the ellipsis collapses                                |
| `boundary`           | `number`                                                             | `1`                  | Pages anchored at each end before the ellipsis                                                    |
| `pageSizeLabel`      | `ReactNode`                                                          | i18n `table.pageSize`| Override the page-size dropdown label                                                             |
| `firstPageLabel`     | `string`                                                             | i18n                 | Override first-page button aria-label                                                             |
| `previousPageLabel`  | `string`                                                             | i18n / `Previous page` | Override prev-page button aria-label                                                             |
| `nextPageLabel`      | `string`                                                             | i18n / `Next page`   | Override next-page button aria-label                                                              |
| `lastPageLabel`      | `string`                                                             | i18n                 | Override last-page button aria-label                                                              |
| `...rest`            | `Omit<ComponentProps<"nav">, "onChange" \| "value" \| "defaultValue">` | —                  | Standard `<nav>` props                                                                            |

Vocabulary per cardinal rule 23 §B: `value` / `defaultValue` / `onValueChange` (Radix-style controlled state), `size`, `variant`, `justify` (reused from Flex), `disabled`, adjective-boolean toggles (`showTotal`, `showSizeChanger`, `showFirstLast`, `hideOnSinglePage`).

## Variants

| Variant      | Layout                                                       | When to use                                                            |
| ------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `default`    | Pill bar — `‹ 1 2 3 … 12 ›` with optional total label        | Standalone pagination, freestanding feeds, search-result pages         |
| `simple`     | `‹ 4 / 12 ›`                                                 | Constrained widths, mobile shells, secondary surfaces                  |
| `embedded`   | Table-footer rhythm — info + page-size changer + numeric pager | Inside `<Table>` footers, or anywhere reproducing the table-page band |

## Helper

`computePageRange(current, total, sibling?, boundary?)` is exported for consumers building custom paginators. Returns `Array<number | "gap">`.

```ts
import { computePageRange } from "@godxjp/ui"

computePageRange(1, 52)    // → [1, 2, 3, "gap", 52]
computePageRange(25, 52)   // → [1, "gap", 24, 25, 26, "gap", 52]
computePageRange(3, 6)     // → [1, 2, 3, 4, 5, 6]   (no gap needed)
```

## Accessibility

- Root renders `<nav role="navigation" aria-label="Pagination">` — assistive tech identifies the pagination region.
- The active page button sets `aria-current="page"`; first / prev / next / last carry `aria-label`s sourced from i18n (Japanese / English / Vietnamese / Filipino) or override props.
- Ellipsis is `aria-hidden` — purely decorative.
- Page-size `<select>` is keyboard-operable and labelled.
- Keyboard: native `<button>` Tab order; Enter / Space activate. Boundary buttons disable themselves at edges.
- Touch-target consideration: at `size="small"` and `[data-density="compact"]` the painted buttons can be smaller than 44 × 44 px. Do not inflate them with mobile-only visual height; use `size="default"`, `variant="simple"`, or an invisible hit area when the surrounding surface needs touch-primary pagination.

## Composition

```tsx
// Centred, with total
<div style={{ minWidth: 600 }}>
  <Pagination total={2481} pageSize={50} defaultValue={5} justify="center" showTotal />
</div>

// Custom total renderer
<Pagination
  total={1240}
  pageSize={20}
  showTotal={(total, [start, end]) => `${start}–${end} 件 / 全 ${total} 件`}
/>

// Controlled — uses `value` + `onValueChange`
function ControlledPagination() {
  const [page, setPage] = useState(1)
  return <Pagination total={120} pageSize={10} value={page} onValueChange={setPage} />
}

// Embedded controlled with size changer
function EmbeddedPagination() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  return (
    <Pagination
      variant="embedded"
      showFirstLast
      total={520}
      pageSize={pageSize}
      value={page}
      onValueChange={setPage}
      onPageSizeChange={(next) => {
        setPageSize(next)
        setPage(1)
      }}
      pageSizeOptions={[10, 20, 50, 100]}
      showTotal
    />
  )
}
```

## See also

- [Table](../data-display/Table.md) — most common host for `variant="embedded"`. Pass `<Table pagination={{ current, pageSize, total, onChange }} />` and Table wires `<Pagination variant="embedded">` automatically.
- [Flex](../layout/Flex.md) — shares the `justify` vocabulary.
- Source: [`src/components/navigation/Pagination.tsx`](../../../src/components/navigation/Pagination.tsx)
