---
title: "useTableState"
diataxis: reference
library: "@godxjp/ui"
library_version: 4.0.0
hook: useTableState
status: stable
audience: [developer, agent]
lang: en
---

# useTableState

> Versioned, persistent useState. Drop-in replacement for
> `useState<T>` that mirrors writes to `localStorage` (or a custom
> `Storage` adapter). Industry-standard pattern (TanStack / MRT /
> MantineRT) — persistence as consumer code, not as a built-in
> primitive feature.

## Usage

```tsx
import { useTableState } from "@godxjp/ui"

const [filters, setFilters] = useTableState<TableFilter[]>({
  storageKey: "orders.filters.v1",
  defaultValue: [],
  version: 1,
})

const [columnVisibility, setColumnVisibility] =
  useTableState<TableColumnVisibility>({
    storageKey: "orders.columnVisibility.v1",
    defaultValue: { archived: false },
    version: 2,
    migrate: ({ version, value }) => {
      // optional — transform older records into the current schema
      if (version === 1) return { archived: false, ...(value as object) }
      return undefined  // discard
    },
  })
```

## Options

| Option         | Type                                                            | Default                   | Description                                                                |
| -------------- | --------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| `storageKey`   | `string`                                                        | —                         | localStorage key — required to enable persistence. Omit for plain useState |
| `defaultValue` | `T`                                                             | required                  | Initial value when storage is empty / invalid / disabled                   |
| `version`      | `number`                                                        | `1`                       | Bump to invalidate previously persisted data                               |
| `migrate`      | `(stored: { version: number; value: unknown }) => T \| undefined` | —                       | Optional migration from older versions                                     |
| `storage`      | `Storage \| null`                                               | `window.localStorage`     | Override the storage backend — useful in tests / SSR                       |

## Returns

`[value: T, setValue: (next: T \| ((prev: T) => T)) => void]` — same shape as `useState`.

## Persistence envelope

Stored as JSON:
```json
{ "version": 1, "value": <T> }
```

Records with a different `version` are discarded on read unless
`migrate` is provided. Storage failures (private browsing, disabled,
SSR) are swallowed silently — the hook degrades to plain `useState`.

## See also

- [`useTablePagination`](./useTablePagination.md), [`useTableSelection`](./useTableSelection.md), [`useTableViews`](./useTableViews.md).
- [`<DataTable>`](../composites/DataTable.md) — composite that pairs with this hook for persistence.
