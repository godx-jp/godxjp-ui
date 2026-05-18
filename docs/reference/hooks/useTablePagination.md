---
title: "useTablePagination"
diataxis: reference
library: "@godxjp/ui"
library_version: 4.0.0
hook: useTablePagination
status: stable
audience: [developer, agent]
lang: en
---

# useTablePagination

> `page` + `pageSize` slice for tables. Mirrors the canonical
> pagination state any `<DataTable>` (or bare `<Table pagination=…>`)
> needs. Controlled or uncontrolled.

## Usage

```tsx
import { useTablePagination } from "@godxjp/ui"

const pagination = useTablePagination({ defaultPageSize: 20 })

const rows = useMemo(
  () =>
    allRows.slice(
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize,
    ),
  [allRows, pagination.page, pagination.pageSize],
)

<Table
  pagination={{
    current: pagination.page,
    pageSize: pagination.pageSize,
    total: allRows.length,
    onChange: pagination.onChange,
  }}
  data={rows}
  columns={columns}
/>
```

## Options

| Option            | Type                                       | Default | Description                                            |
| ----------------- | ------------------------------------------ | ------- | ------------------------------------------------------ |
| `defaultPage`     | `number`                                   | `1`     | Initial page (1-based)                                 |
| `defaultPageSize` | `number`                                   | `20`    | Initial page size                                      |
| `page`            | `number`                                   | —       | Controlled page — when set, hook is view-only for page |
| `pageSize`        | `number`                                   | —       | Controlled page size                                   |
| `onChange`        | `(page: number, pageSize: number) => void` | —       | Fires when either page or pageSize changes             |

## Returns

| Field         | Type                                       | Description                                             |
| ------------- | ------------------------------------------ | ------------------------------------------------------- |
| `page`        | `number`                                   | Current page (1-based)                                  |
| `pageSize`    | `number`                                   | Current page size                                       |
| `setPage`     | `(page: number) => void`                   | Update page only                                        |
| `setPageSize` | `(pageSize: number) => void`               | Update page size (resets page → 1 by convention)        |
| `onChange`    | `(page: number, pageSize: number) => void` | Unified handler matching `<Pagination onChange>` shape  |
| `resetPage`   | `() => void`                               | Reset to page 1 (call after filter / sort / search changes) |
| `reset`       | `() => void`                               | Reset both back to `defaultPage` + `defaultPageSize`    |

## See also

- [`useTableSelection`](./useTableSelection.md) — row-selection slice.
- [`useTableViews`](./useTableViews.md) — saved-view slice.
- [`useTableState`](./useTableState.md) — persistence helper.
- [`<DataTable>`](../composites/DataTable.md) — composite that consumes this slice.
