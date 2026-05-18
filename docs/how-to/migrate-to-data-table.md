---
title: "How to migrate from <Table> to <DataTable>"
diataxis: how-to
library: "@godxjp/ui"
library_version: 4.0.0
last-updated: 2026-05-18
audience: [developer]
lang: en
status: published
---

# How to migrate from `<Table>` to `<DataTable>`

**When to use:** You have an existing `<Table>` page (likely
`<Table tableKey="…" pagination={…} batchActions={…} views={…}>`) and
want to move to the hook + composite API introduced in v4.0.0.

**Prerequisites:** A working `<Table>` page on `@godxjp/ui ≥ 4.0.0`.
The old API still works — migration is optional and incremental.

---

## Why migrate?

- **Ergonomics**: state slices (page, selection, views, visibility)
  become explicit hooks rather than nested prop bags. Easier to test,
  share, and pass between components.
- **Persistence on your terms**: `useTableState` lets you choose what
  to persist (and where) instead of opting all of column visibility +
  pinning + saved views into `localStorage` with `<Table tableKey>`.
- **Future-proofing**: ADR-0006 commits to `<DataTable>` as the
  canonical "data-table page" surface. Future framework features land
  on the composite first.

---

## Mapping cheatsheet

| Legacy `<Table>` prop                  | Composite + hooks equivalent                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `tableKey`                             | `useTableState({ storageKey, ... })` per slice you actually want persisted                                |
| `pagination={{ current, pageSize, total, onChange }}` | `useTablePagination({ defaultPageSize })` + `total` on `useDataTable(...)`                |
| `batchActions={{ selectedRowKeys, onSelectedRowKeysChange, actions }}` | `useTableSelection()` + `batchActions: { actions }` on `useDataTable`  |
| `views={{ items, activeKey, onActiveKeyChange, onViewApply }}` | `useTableViews({ items, storageKey })`                                              |
| `columnVisibility / defaultColumnVisibility / onColumnVisibilityChange` | Same — pass directly to `useDataTable`, optionally wired to `useTableState`     |
| `filters / onFiltersChange / sort / onSortChange` | Same — pass directly to `useDataTable`                                                       |
| `toolbar={{ search, columns, primaryAction }}` | Same — pass directly to `useDataTable`. Or override via `<DataTable slots={{ primaryAction }}>` |

`columns`, `data`, `rowKey`, `density`, `stickyHeader`, `caption`,
`footer`, `empty`, `expandable`, `tree`, `editing`, `groupBy`,
`resizable`, `rowClassName` — pass through unchanged.

---

## Step-by-step

### Step 1 — Install nothing

The hooks and composite ship in the same `@godxjp/ui` package.

```diff
- import { Table } from "@godxjp/ui"
+ import { Table } from "@godxjp/ui"   // still works
+ import {
+   useTablePagination,
+   useTableSelection,
+   useTableViews,
+   useTableState,
+ } from "@godxjp/ui"
+ import { DataTable, useDataTable } from "@godxjp/ui/components/composites"
```

### Step 2 — Replace pagination state

Before:

```tsx
const [page, setPage] = useState(1)
const [pageSize, setPageSize] = useState(20)
```

After:

```tsx
const pagination = useTablePagination({ defaultPageSize: 20 })
// pagination.page, pagination.pageSize, pagination.onChange, pagination.resetPage
```

Pass `pagination` into `useDataTable` — the wiring into `<Table pagination>`
happens automatically.

### Step 3 — Replace selection state

Before:

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([])
```

After:

```tsx
const selection = useTableSelection({ defaultSelected: [] })
// selection.selectedRowKeys, selection.setSelectedRowKeys, selection.toggle, selection.clear, selection.count
```

### Step 4 — Replace saved-views state

Before — built-in views inline, `markCustom()` helper, manual
localStorage:

```tsx
const [activeViewKey, setActiveViewKey] = useState("all")
// ...applyView / markCustom helpers
```

After:

```tsx
const views = useTableViews({
  items: BUILT_IN_VIEWS,
  storageKey: "myPage.views.v1",  // optional persistence
})
// views.items, views.activeKey, views.applyView, views.saveView,
// views.deleteView, views.markCustom
```

### Step 5 — Replace `tableKey` persistence

Before:

```tsx
<Table tableKey="orders.v1" ... />
```

After — pick what you actually want to persist:

```tsx
const [columnVisibility, setColumnVisibility] =
  useTableState<TableColumnVisibility>({
    storageKey: "orders.columnVisibility.v1",
    defaultValue: {},
  })

// + the useTableViews({ storageKey }) above handles saved-view persistence.
// Column pinning persistence: optional via another useTableState.
```

### Step 6 — Build the composite instance

```tsx
const table = useDataTable({
  data,
  columns,
  rowKey: "id",
  pagination,
  selection,
  views,
  total: matched.length,                // explicit when server-paginating
  columnVisibility,
  onColumnVisibilityChange: setColumnVisibility,
  filters, onFiltersChange: setFilters,
  sort,    onSortChange:    setSort,
  toolbar: { columns: {} },
  batchActions: {
    actions: <BulkApprove ids={selection.selectedRowKeys}/>,
  },
  onViewApply: (view) => {
    setFilters(view.filters ?? [])
    setSort(view.sort ?? null)
  },
})

return <DataTable
  table={table}
  containerClassName="tbl-shell"
  slots={{ primaryAction: <Button>＋ 新規申請</Button> }}
/>
```

That's it.

---

## Worked example — before / after diff

A minimal employee-list page.

### Before

```tsx
function EmployeesPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<TableFilter[]>([])
  const [sort, setSort] = useState<TableSortState>(null)
  const [activeView, setActiveView] = useState("all")

  const visible = useMemo(() =>
    sortRows(EMPLOYEES.filter(row => matches(row, filters)), sort),
    [filters, sort])
  const rows = useMemo(() =>
    visible.slice((page - 1) * pageSize, page * pageSize),
    [visible, page, pageSize])

  return (
    <Table
      tableKey="employees.v1"
      columns={COLUMNS}
      data={rows}
      rowKey="id"
      pagination={{
        current: page, pageSize, total: visible.length,
        onChange: (p, s) => { setPage(p); setPageSize(s) },
      }}
      filters={filters}
      onFiltersChange={(next) => { setFilters(next); setPage(1) }}
      sort={sort}
      onSortChange={setSort}
      batchActions={{
        selectedRowKeys: selectedIds,
        onSelectedRowKeysChange: setSelectedIds,
        actions: <BulkApprove ids={selectedIds}/>,
      }}
      views={{
        items: BUILT_IN_VIEWS,
        activeKey: activeView,
        onActiveKeyChange: setActiveView,
      }}
    />
  )
}
```

### After

```tsx
function EmployeesPage() {
  const pagination = useTablePagination({ defaultPageSize: 20 })
  const selection  = useTableSelection()
  const views      = useTableViews({
    items: BUILT_IN_VIEWS,
    storageKey: "employees.views.v1",
  })
  const [filters, setFilters] = useState<TableFilter[]>([])
  const [sort,    setSort]    = useState<TableSortState>(null)

  const visible = useMemo(() =>
    sortRows(EMPLOYEES.filter(row => matches(row, filters)), sort),
    [filters, sort])
  const rows = useMemo(() =>
    visible.slice(
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize,
    ),
    [visible, pagination.page, pagination.pageSize])

  const table = useDataTable({
    data: rows, columns: COLUMNS, rowKey: "id",
    pagination, selection, views,
    total: visible.length,
    filters, onFiltersChange: (next) => {
      setFilters(next)
      pagination.resetPage()
      views.markCustom()
    },
    sort, onSortChange: setSort,
    batchActions: { actions: <BulkApprove ids={selection.selectedRowKeys}/> },
  })

  return <DataTable table={table} />
}
```

Roughly the same line count, but:

- Persistence (saved views) is now opt-in via `storageKey`.
- The hooks are reusable across pages (`useTableSelection` works the
  same in audit logs, ledgers, kintai).
- Selection helpers (`toggle`, `clear`, `count`) ride with the slice.
- No `tableKey` magic — the storage key for views is right there.

---

## Validation

- [ ] `pnpm type-check` clean.
- [ ] `pnpm test:stories --run` green (no regressions).
- [ ] Manual sanity in Storybook — `Composites/DataTable` stories
      reflect the same behaviour as your migrated page.
- [ ] If you used `<Table tableKey>` and have downstream users, plan a
      one-time localStorage clear or `migrate` callback on the new
      `useTableState` slices to carry the old data forward.

## See also

- [ADR-0006 Table primitive vs DataTable composite](../adr/0006-table-primitive-vs-data-table-composite.md)
- [`<DataTable>` reference](../reference/composites/DataTable.md)
- [`useTablePagination`](../reference/hooks/useTablePagination.md) ·
  [`useTableSelection`](../reference/hooks/useTableSelection.md) ·
  [`useTableViews`](../reference/hooks/useTableViews.md) ·
  [`useTableState`](../reference/hooks/useTableState.md)
