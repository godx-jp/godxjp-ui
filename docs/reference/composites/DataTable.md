---
title: "DataTable"
diataxis: reference
library: "@godxjp/ui"
library_version: 4.0.0
component: DataTable
status: stable
audience: [developer, agent]
lang: en
---

# DataTable

> Packaged-table composite. Pairs the slim `<Table>` primitive with
> hook-based state slices (`useTablePagination`, `useTableSelection`,
> `useTableViews`, `useTableState`). Reach for it when you need the
> canonical "data-table page" experience; reach for `<Table>` directly
> when you only need rows + columns rendering.

## Usage

```tsx
import {
  DataTable,
  useDataTable,
} from "@godxjp/ui/components/composites"
import {
  useTablePagination,
  useTableSelection,
  useTableViews,
  useTableState,
} from "@godxjp/ui"

function OrdersPage() {
  const pagination = useTablePagination({ defaultPageSize: 20 })
  const selection  = useTableSelection({ defaultSelected: [] })
  const views      = useTableViews({
    items: BUILT_IN_VIEWS,
    storageKey: "orders.views.v1",
  })
  const [columnVisibility, setColumnVisibility] =
    useTableState<TableColumnVisibility>({
      storageKey: "orders.columnVisibility.v1",
      defaultValue: { archived: false },
    })

  const rows = useFetchOrders(filters, sort, pagination.page, pagination.pageSize)

  const table = useDataTable({
    data: rows.data,
    columns: ORDER_COLUMNS,
    rowKey: "id",
    pagination,
    total: rows.total,
    selection,
    views,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    filters,
    onFiltersChange: setFilters,
    sort,
    onSortChange: setSort,
    onViewApply: (view) => {
      setFilters(view.filters ?? [])
      setSort(view.sort ?? null)
    },
    toolbar: { columns: {}, primaryAction: { label: "＋ 新規申請" } },
    batchActions: {
      actions: <BulkApproveButton ids={selection.selectedRowKeys} />,
    },
  })

  return <DataTable table={table} containerClassName="tbl-shell" />
}
```

## Architecture

```
<DataTable>      ← composite (this file) — slot overrides, container
   │
   ├─ useDataTable({ data, columns, pagination, selection, views, … })
   │       returns { tableProps, selection, pagination, views }
   │
   └─ <Table>     ← primitive (data-display/Table.tsx) — renders rows
```

The composite is intentionally thin in Stage 3 of the refactor:
`DataTable` forwards the resolved prop bag from `useDataTable` into
the existing `<Table>` primitive. Stage 4 will migrate the toolbar /
view-tabs / filter-bar / batch-action rendering off the primitive
into the composite — public API stays the same.

## Props

### `<DataTable>`

| Prop                 | Type                                                          | Description                                                              |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `table`              | `DataTableInstance<TData>`                                    | Result of `useDataTable(…)` — required                                   |
| `slots`              | `DataTableSlots`                                              | Region overrides (toolbar, primary action, footer, empty)                |
| `className`          | `string`                                                      | Merged onto the inner `<table>`                                          |
| `containerClassName` | `string`                                                      | Merged onto the outer `.table-stack` wrapper                             |

### `DataTableSlots`

| Slot              | Type                                                       | Description                                                                |
| ----------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| `toolbar`         | `ReactNode`                                                | Full toolbar override (replaces `useDataTable` toolbar config)             |
| `primaryAction`   | `ReactNode \| TableToolbarButtonConfig`                    | Toolbar primary action (`＋ 新規`). Falls through if `toolbar` is overridden |
| `toolbarActions`  | `ReactNode`                                                | Appended after the columns button + primary action                         |
| `footer`          | `ReactNode`                                                | Footer slot — overrides the `useDataTable` footer                          |
| `emptyState`      | `ReactNode`                                                | Empty state — overrides the default `<Empty>` primitive                    |

### `useDataTable(options)`

The hook accepts a superset of `<Table>` props plus slice integration:

| Option                       | Type                                                                    | Description                                                                 |
| ---------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `data`                       | `TData[]`                                                               | Row data (already filtered / sorted / paginated by you or your fetcher)     |
| `columns`                    | `TableColumn<TData>[]`                                                  | TanStack column defs                                                        |
| `rowKey` / `getRowId`        | —                                                                       | Stable row id resolution (same vocabulary as `<Table>`)                     |
| `pagination`                 | `UseTablePaginationResult`                                              | Slice from `useTablePagination` — wires into `<Table pagination>`           |
| `total`                      | `number`                                                                | Defaults to `data.length`. Set explicitly when server-paginating            |
| `selection`                  | `UseTableSelectionResult`                                               | Slice from `useTableSelection` — wires into `batchActions.selectedRowKeys`  |
| `views`                      | `UseTableViewsResult`                                                   | Slice from `useTableViews` — wires into `views`                             |
| `onViewApply`                | `(view: TableViewItem) => void`                                         | Called after `views.applyView` — restore filters / sort / visibility here   |
| `filters` / `onFiltersChange` | —                                                                      | Controlled filter state                                                     |
| `sort` / `onSortChange`      | —                                                                       | Controlled sort state                                                       |
| `columnVisibility` / `onColumnVisibilityChange` | —                                                  | Controlled column visibility                                                |
| `toolbar`                    | `TableToolbar`                                                          | Same shape as `<Table toolbar>`                                             |
| `batchActions`               | `ReactNode \| TableBatchActionsConfig \| { actions, … }`                | Bare ReactNode or partial config — wired automatically when `selection` set |
| `expandable` / `tree` / `editing` / `groupBy` | —                                                       | Forwarded to `<Table>`                                                      |
| `density` / `stickyHeader` / `resizable` / `caption` / `footer` / `empty` | — | Forwarded to `<Table>`                                                      |
| `tableKey`                   | `string`                                                                | Forwarded to `<Table tableKey>` — primitive persistence prefix              |
| `containerClassName` / `className` | —                                                                 | Forwarded to `<Table>`                                                      |

Returns `{ tableProps, selection, pagination, views }`. Spread `tableProps` into `<Table>` if you prefer to render the primitive directly; pass the whole instance to `<DataTable table>` for the composite ergonomics.

## Sister hooks

- [`useTablePagination`](../hooks/useTablePagination.md) — `page` + `pageSize` slice.
- [`useTableSelection`](../hooks/useTableSelection.md) — row selection slice.
- [`useTableViews`](../hooks/useTableViews.md) — saved-view state.
- [`useTableState`](../hooks/useTableState.md) — versioned localStorage helper.

## Persistence

`<DataTable>` itself does **not** persist anything. Persistence is a
consumer concern — wire `useTableState` onto whichever slices you
want to survive page reloads (`columnVisibility`, `filters`, `sort`,
`columnPinning`, `views`). This matches the TanStack / Material React
Table / Mantine React Table pattern documented across the industry.

## See also

- [Table](../data-display/Table.md) — the underlying primitive.
- [Pagination](../navigation/Pagination.md) — rendered via `variant="embedded"` inside the table footer.
- [Architectural decision: Table primitive vs DataTable composite split](../../adr/0006-table-primitive-vs-data-table-composite.md) (forthcoming).
- Source: [`src/components/composites/data-table/`](../../../src/components/composites/data-table/)
