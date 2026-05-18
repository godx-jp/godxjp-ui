---
title: "useTableViews"
diataxis: reference
library: "@godxjp/ui"
library_version: 4.0.0
hook: useTableViews
status: stable
audience: [developer, agent]
lang: en
---

# useTableViews

> Saved-view slice for tabbed table headers. Owns the active-view
> key + a list of user-saved views. Built-in (preset) views pass
> through unchanged; user-saved views can be persisted to
> `localStorage` via `storageKey`.

## Usage

```tsx
import { useTableViews } from "@godxjp/ui"

const BUILT_IN_VIEWS: TableViewItem[] = [
  { key: "all",     label: "All",     filters: [], sort: { key: "date", direction: "desc" } },
  { key: "pending", label: "Pending", filters: [{ key: "status", operator: "eq", value: "pending" }] },
]

const views = useTableViews({
  items: BUILT_IN_VIEWS,
  storageKey: "orders.views.v1",
})

<Table
  views={{
    items: views.items,
    activeKey: views.activeKey,
    onActiveKeyChange: views.setActiveKey,
    onViewApply: (view) => {
      const snapshot = views.applyView(view)
      setFilters(snapshot.filters ?? [])
      setSort(snapshot.sort ?? null)
    },
    onDeleteView: (view) => views.deleteView(view.key),
  }}
/>
```

## Options

| Option               | Type                                | Default                   | Description                                                          |
| -------------------- | ----------------------------------- | ------------------------- | -------------------------------------------------------------------- |
| `items`              | `TableViewItem[]`                   | required                  | Built-in preset views — never persisted, always present              |
| `defaultActive`      | `string`                            | `items[0]?.key`           | Active view key on first render                                      |
| `activeKey`          | `string`                            | —                         | Controlled active key                                                |
| `onActiveKeyChange`  | `(key: string) => void`             | —                         | Fires when the active view changes                                   |
| `onSavedViewsChange` | `(views: TableViewItem[]) => void`  | —                         | Fires when the saved-view list mutates                               |
| `storageKey`         | `string`                            | —                         | localStorage key — required to persist saved views                   |
| `maxSavedViews`      | `number`                            | `20`                      | Cap on persisted user views                                          |

## Returns

| Field          | Type                                                                  | Description                                                  |
| -------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ |
| `items`        | `TableViewItem[]`                                                     | Merged list (built-in + saved)                               |
| `savedViews`   | `TableViewItem[]`                                                     | Saved-by-user subset only                                    |
| `activeKey`    | `string \| undefined`                                                 | Current active view key                                      |
| `setActiveKey` | `(key: string) => void`                                               | Set the active view key                                      |
| `applyView`    | `(view: TableViewItem) => TableViewSnapshot`                          | Set active key + return snapshot for state hydration         |
| `saveView`     | `(label: string, snapshot: TableViewSnapshot) => TableViewItem`       | Persist a new user view from the current snapshot            |
| `deleteView`   | `(key: string) => void`                                               | Remove a saved view (no-op for built-ins)                    |
| `markCustom`   | `() => void`                                                          | Mark active view as `"custom"` (after manual filter changes) |

## Persistence

When `storageKey` is set, saved views are persisted via
`useTableState` under a version 1 envelope. Built-in items are
**not** persisted — they are part of the consumer's source code.
Capacity-managed: only the most recent `maxSavedViews` survive.

## See also

- [`useTablePagination`](./useTablePagination.md), [`useTableSelection`](./useTableSelection.md), [`useTableState`](./useTableState.md).
- [`<DataTable>`](../composites/DataTable.md) — composite that consumes this slice.
