---
title: "Table"
description: "Single-component TanStack Table wrapper with filters, sort, sticky columns, views, and persisted column visibility."
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Table
status: stable
audience: [developer, agent]
last-updated: 2026-05-18
lang: en
---

# Table

> Single-component TanStack Table wrapper — pass `columns` + `data`; no table sub-components.

## Usage

```tsx
import { Table, type TableColumn } from "@godxjp/ui"

interface Project {
  id: string
  name: string
  status: "active" | "blocked"
  openIssues: number
}

const columns: TableColumn<Project>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="success">{row.original.status}</Badge>,
  },
  {
    accessorKey: "openIssues",
    header: "Issues",
    meta: { headerClassName: "num", cellClassName: "num" },
  },
]

<Table
  columns={columns}
  data={projects}
  rowKey="id"
  caption="Project list as of today"
/>
```

## Exports

| Export                               | Description                                        |
| ------------------------------------ | -------------------------------------------------- |
| `Table`                              | Data-driven table wrapper backed by TanStack Table |
| `TableColumn`                        | Alias for TanStack `ColumnDef`                     |
| `TableColumnVisibility`              | Alias for TanStack `VisibilityState`               |
| `TableDensity`                       | `"default" \| "compact"`                           |
| `TableRowKey`                        | Row identity field or resolver                     |
| `TableToolbar`                       | `ReactNode \| false \| TableToolbarConfig`         |
| `TableToolbarColumnConfig`           | Built-in column settings button / drawer config    |
| `TableToolbarConfig`                 | Built-in toolbar renderer config                   |
| `TablePagination`                    | `ReactNode \| false \| TablePaginationConfig`      |
| `TablePaginationConfig`              | Built-in pagination renderer config                |
| `getTableColumnVisibilityStorageKey` | Returns the localStorage key for a `tableKey`      |
| `getTableViewsStorageKey`            | Returns the view-storage key for a `tableKey`      |
| `TableProps`                         | Generic prop type for `Table<TData>`               |
| `TableViewItem`                      | Saved-view tab item and snapshot                   |
| `TableViewSnapshot`                  | Filter / sort / column-visibility snapshot         |
| `TableViews`                         | `ReactNode \| false \| TableViewsConfig`           |
| `TableViewsConfig`                   | Built-in saved-view renderer config                |

## Props

| Prop                       | Type                                                 | Default                    | Description                                                                            |
| -------------------------- | ---------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------- |
| `columns`                  | `TableColumn<TData>[]`                               | required                   | TanStack column definitions                                                            |
| `data`                     | `TData[]`                                            | required                   | Rows to render                                                                         |
| `density`                  | `"default" \| "compact"`                             | Global `data-density` axis | Local row and region-density override                                                  |
| `containerClassName`       | `string`                                             | —                          | CSS class for the outer table stack                                                    |
| `stickyHeader`             | `boolean`                                            | `false`                    | Pins the header via the existing sticky CSS hook                                       |
| `rowKey`                   | `TableRowKey<TData>`                                 | `"id"`                     | Stable row identity field or resolver used by TanStack Table                           |
| `getRowId`                 | `(row, index) => string`                             | `rowKey` resolver          | TanStack-compatible row id resolver; overrides `rowKey`                                |
| `caption`                  | `ReactNode`                                          | —                          | Native `<caption>` content                                                             |
| `views`                    | `TableViews`                                         | —                          | Built-in saved-view config, `false`, or custom node above the toolbar                  |
| `toolbar`                  | `TableToolbar`                                       | —                          | Built-in toolbar config, `false`, or custom node above the table                       |
| `batchActions`             | `TableBatchActions<TData>`                           | —                          | Built-in selection column + batch action config, `false`, or custom node               |
| `filters`                  | `TableFilter[]`                                      | `[]`                       | Active filters. The default filter bar renders only when this list is non-empty        |
| `onFiltersChange`          | `(filters) => void`                                  | —                          | Receives chip remove / value-change updates                                            |
| `tableKey`                 | `string`                                             | —                          | Enables column-visibility persistence under `godxui:table:<tableKey>:columnVisibility` |
| `defaultColumnVisibility`  | `TableColumnVisibility`                              | `{}`                       | Initial column visibility when no persisted value exists                               |
| `columnVisibility`         | `TableColumnVisibility`                              | internal state             | Controlled column visibility map                                                       |
| `onColumnVisibilityChange` | `(visibility) => void`                               | —                          | Receives column visibility changes from TanStack Table                                 |
| `sort`                     | `TableSortState`                                     | —                          | Active controlled sort. `TableSort \| null` for single sort or `TableSort[]` for multi-sort (canon ⑤) |
| `onSortChange`             | `(sort) => void`                                     | —                          | Receives sortable header clicks. Single click cycles asc → desc → none; shift-click adds to multi-sort list |
| `resizable`                | `boolean`                                            | `false`                    | Enables the 4px right-edge column-resize grip (canon ⑤). Double-click auto-fits         |
| `expandable`               | `TableExpandableConfig<TData>`                       | —                          | Inline detail-panel row (canon ⑥)                                                       |
| `editing`                  | `TableEditingConfig<TData>`                          | —                          | Inline-edit + dirty banner footer (canon ⑦)                                             |
| `groupBy`                  | `(row) => string \| TableGroupDescriptor`            | —                          | Render full-width group header rows (canon ⑧)                                           |
| `tree`                     | `TableTreeConfig<TData>`                             | —                          | Hierarchical rows with 14px / level indent + twirl button (canon ⑧)                     |
| `onColumnPinningChange`    | `(pinning: ColumnPinningState) => void`              | —                          | Receives pin / unpin changes from the column-manager lock toggle (canon ⑨)              |
| `filterBar`                | `ReactNode \| TableFilterItem[]`                     | —                          | Escape hatch for custom active-filter UI                                               |
| `footer`                   | `ReactNode`                                          | —                          | Totals / summary row below the table                                                   |
| `pagination`               | `TablePagination`                                    | —                          | Built-in pagination config, `false`, or custom node below the footer                   |
| `empty`                    | `ReactNode`                                          | Localised `<Empty>`        | Empty state row override                                                               |
| `onResetFilters`           | `() => void`                                         | —                          | Shows the localised reset-filter action when active filters exist                      |
| `rowClassName`             | `string \| (row) => string`                          | —                          | Row state class such as `selected`, `is-new`, `is-error`, `disabled`, `is-editing`     |
| `...rest`                  | `Omit<HTMLAttributes<HTMLTableElement>, "children">` | —                          | Standard `<table>` props                                                               |

## Column-driven filters

Declare filter/sort capability on `ColumnDef.meta`, then pass active filter state. This keeps the table generic while allowing schema-driven screens to map `type`, `enum`, and `displayName` into table metadata later:

```tsx
<Table
  columns={[
    {
      accessorKey: "shop",
      header: "Shop",
      meta: {
        filterable: true,
        sortable: true,
        filterOptions: [
          { value: "shibuya", label: "Shibuya" },
          { value: "omotesando", label: "Omotesando" },
        ],
      },
    },
  ]}
  data={rows}
  filters={[{ key: "shop", operator: "eq", value: "shibuya" }]}
  onFiltersChange={setFilters}
  sort={{ key: "shop", direction: "asc" }}
  onSortChange={setSort}
  onResetFilters={resetFilters}
/>
```

The default filter bar renders only when `filters.length > 0`. Enum-like fields use `meta.filterOptions` to render a value selector inside the active chip. Each chip can be removed; `onResetFilters` clears the whole active set. Use `filterBar` only for layouts that cannot be expressed through column metadata.

## Views

Use `views` when the screen needs saved table states. A view snapshot can carry `filters`, `sort`, and `columnVisibility`. When `tableKey` is present, Table also owns the default save dialog, duplicate warning, deletion, and localStorage persistence for user-saved views.

```tsx
const defaultViews = [
  {
    key: "all",
    label: "All",
    filters: [],
    sort: { key: "date", direction: "desc" },
    columnVisibility: { hours: false },
  },
  {
    key: "pending",
    label: "Pending",
    filters: [{ key: "status", operator: "eq", value: "pending" }],
    sort: { key: "date", direction: "desc" },
    columnVisibility: { hours: false },
  },
] satisfies TableViewItem[]

<Table
  tableKey="kintai-applications"
  columns={columns}
  data={pageRows}
  views={{
    items: defaultViews,
    activeKey,
    onViewApply: (view) => {
      setActiveKey(view.key)
      setFilters(view.filters ?? [])
      setSort(view.sort ?? null)
      setColumnVisibility(view.columnVisibility ?? {})
      setPage(1)
    },
  }}
/>
```

`Table` renders the tabs and calls `onViewApply`. If `onSaveCurrent` is omitted, the save tab opens Table's built-in naming dialog and persists string-labelled saved views under `getTableViewsStorageKey(tableKey)`. If `onDeleteView` is omitted, deletable persisted views are removed by Table. Supplying either callback overrides that part of the built-in flow.

### `TableViewsConfig`

| Field               | Type              | Description                                |
| ------------------- | ----------------- | ------------------------------------------ |
| `items`             | `TableViewItem[]` | Built-in and user-saved views              |
| `activeKey`         | `string`          | Active view key                            |
| `onActiveKeyChange` | `(key) => void`   | Optional active-key callback               |
| `onViewApply`       | `(view) => void`  | Applies a view snapshot to consumer state  |
| `onDeleteView`      | `(view) => void`  | Deletes a view when its item is deletable  |
| `onItemsChange`     | `(items) => void` | Optional callback after built-in save/delete |
| `saveable`          | `boolean`         | Set `false` to hide the save tab           |
| `saveLabel`         | `ReactNode`       | Save button label                          |
| `deleteLabel`       | `string`          | Delete button accessible-label prefix      |
| `onSaveCurrent`     | `() => void`      | Custom save trigger; overrides built-in dialog |

### `TableViewItem`

| Field              | Type                    | Description                   |
| ------------------ | ----------------------- | ----------------------------- |
| `key`              | `string`                | Stable view identity          |
| `label`            | `ReactNode`             | Tab label                     |
| `count`            | `ReactNode`             | Optional count badge          |
| `dotColor`         | `string`                | Optional status dot CSS color |
| `disabled`         | `boolean`               | Disables the tab              |
| `deletable`        | `boolean`               | Shows delete action when true |
| `filters`          | `TableFilter[]`         | Filter snapshot               |
| `sort`             | `TableSort \| null`     | Sort snapshot                 |
| `columnVisibility` | `TableColumnVisibility` | Column visibility snapshot    |

## Toolbar

Use the built-in toolbar config for the common search / detail filter / column settings / primary action layout. This keeps the desktop and mobile toolbar spacing inside Table instead of hand-rendering a custom wrapper in every screen.

```tsx
<Table
  columns={columns}
  data={pageRows}
  toolbar={{
    search: {
      value: draftSearch,
      onValueChange: setDraftSearch,
      onSearch: (value) => setSearch(value),
      placeholder: "Employee, shop, or request number…",
    },
    filter: {
      count: filters.length,
      onClick: () => setFilterOpen(true),
    },
    columns: {},
    primaryAction: {
      label: "+ New request",
      onClick: () => openCreate(),
    },
  }}
/>
```

`toolbar={false}` hides the toolbar. Passing a `ReactNode` is still supported as an escape hatch for layouts that cannot use the config shape.

### `TableToolbarConfig`

| Field           | Type                                             | Description                                            |
| --------------- | ------------------------------------------------ | ------------------------------------------------------ |
| `search`        | `false \| TableToolbarSearchConfig`              | Search input plus submit button                        |
| `filter`        | `false \| TableToolbarFilterConfig`              | Detail-filter button with optional count badge         |
| `columns`       | `false \| TableToolbarColumnConfig`              | Built-in column settings drawer button                 |
| `primaryAction` | `false \| ReactNode \| TableToolbarButtonConfig` | Primary table action on the right side                 |
| `actions`       | `ReactNode`                                      | Additional right-side actions after the primary action |

### `TableToolbarSearchConfig`

| Field           | Type                      | Description                                      |
| --------------- | ------------------------- | ------------------------------------------------ |
| `value`         | `string`                  | Controlled draft search value                    |
| `onValueChange` | `(value: string) => void` | Draft value change handler                       |
| `onSearch`      | `(value: string) => void` | Fires from the search button and Enter key       |
| `onClear`       | `() => void`              | Optional callback after clearing                 |
| `placeholder`   | `string`                  | Search placeholder                               |
| `ariaLabel`     | `string`                  | Search input accessible name                     |
| `inputRef`      | `Ref<HTMLInputElement>`   | Ref for shortcuts such as `⌘/Ctrl + K`           |
| `suffix`        | `ReactNode`               | Optional suffix, such as a keyboard shortcut tag |
| `disabled`      | `boolean`                 | Disables search input and submit button          |

### `TableToolbarButtonConfig`

| Field      | Type         | Description              |
| ---------- | ------------ | ------------------------ |
| `label`    | `ReactNode`  | Button label             |
| `onClick`  | `() => void` | Button click handler     |
| `disabled` | `boolean`    | Disables the button      |
| `count`    | `number`     | Filter-only active count |

### `TableToolbarColumnConfig`

`toolbar.columns: {}` renders the localised column settings button and opens Table's built-in drawer. The drawer lists hideable leaf columns, toggles TanStack column visibility, persists through `tableKey`, and uses the same `columnVisibility` / `onColumnVisibilityChange` contract as direct TanStack state control.

Columns with no stable key (`id` or string `accessorKey`) are omitted. Set `meta.hideable = false` for selection, action, or pinned utility columns that must stay visible.

`TableToolbarColumnConfig` also accepts `label`, `disabled`, and `onClick`. Supplying `onClick` overrides the built-in drawer and keeps the button as a custom trigger.

## Row identity

Batch actions and selection must be keyed by stable data identity, not by the current page index. `rowKey` defaults to `"id"`:

```tsx
<Table columns={columns} data={rows} rowKey="employeeId" />
```

Pass a resolver when the key is derived:

```tsx
<Table
  columns={columns}
  data={rows}
  rowKey={(row) => `${row.tenantId}:${row.id}`}
/>
```

If the configured `rowKey` is missing on a row, Table writes a console warning and falls back to the row index so rendering does not crash. Treat that warning as a configuration bug for paginated, sortable, selectable, or batch-action tables.

### Selection and batch actions

`Table` owns the selection column and batch bar layout when `batchActions` is a config object. Consumers keep the selected keys in state, keyed by `rowKey`.

For paginated data, keep two sets separate:

- `pageRows` — rows rendered in the current page.
- `allFilteredRows` or server-side selected ids — rows eligible for the current batch action across every page.

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<Table
  rowKey="id"
  columns={columns}
  data={pageRows}
  batchActions={{
    selectedRowKeys: selectedIds,
    onSelectedRowKeysChange: setSelectedIds,
    getCheckboxDisabled: (row) => row.original.locked,
    actions: (
      <>
        <Button size="small" variant="outline">
          Approve
        </Button>
        <Button size="small" variant="destructive">
          Reject
        </Button>
      </>
    ),
  }}
/>;
```

The config renders a checkbox header, row checkboxes, selected-count text, visible-row select-all, clear selection, and the supplied action slot. Passing a `ReactNode` to `batchActions` is still supported as an escape hatch for fully custom selection UIs.

For server-side pagination, do not try to load every row just to select all. Store a selection descriptor such as `{ mode: "matching-filter", excludedIds: Set<string> }`, then send the current filter payload plus excluded ids to the batch endpoint.

## Pagination

Use the built-in pagination config for normal tables. This keeps range text, page-size selection, and page buttons inside the Table contract instead of hand-rendering a detached footer:

```tsx
<Table
  columns={columns}
  data={pageRows}
  pagination={{
    current: page,
    pageSize,
    total,
    pageSizeOptions: [10, 20, 50],
    onChange: (nextPage, nextPageSize) => {
      setPage(nextPage);
      setPageSize(nextPageSize);
    },
  }}
/>
```

`pagination={false}` hides pagination. Passing a `ReactNode` is still supported as an escape hatch for layouts that cannot use the config shape.

### `TablePaginationConfig`

| Field              | Type                          | Default             | Description                                                  |
| ------------------ | ----------------------------- | ------------------- | ------------------------------------------------------------ |
| `current`          | `number`                      | required            | Current 1-based page number                                  |
| `pageSize`         | `number`                      | required            | Rows per page                                                |
| `total`            | `number`                      | required            | Total rows after filtering                                   |
| `pageSizeOptions`  | `number[]`                    | `[10, 20, 50, 100]` | Select options; current `pageSize` is included automatically |
| `showSizeChanger`  | `boolean`                     | `true`              | Shows or hides the rows-per-page select                      |
| `hideOnSinglePage` | `boolean`                     | `false`             | Hides the whole pagination bar when `total <= pageSize`      |
| `disabled`         | `boolean`                     | `false`             | Disables page buttons and page-size select                   |
| `showTotal`        | `(total, range) => ReactNode` | Localised default   | Overrides the range label; `range` is `[start, end]`         |
| `onChange`         | `(page, pageSize) => void`    | —                   | Receives page button and page-size changes                   |

The built-in renderer clamps invalid pages into the valid range. Changing page size calls `onChange(1, nextPageSize)` so consumers reset to the first page.

### Client-side pagination

For client-side data, sort and filter first, then slice `pageRows` and pass the unsliced count as `total`:

```tsx
const filteredRows = rows.filter(matchesFilters)
const sortedRows = sortRows(filteredRows, sort)
const pageRows = sortedRows.slice((page - 1) * pageSize, page * pageSize)

<Table
  columns={columns}
  data={pageRows}
  pagination={{
    current: page,
    pageSize,
    total: sortedRows.length,
    onChange: (nextPage, nextPageSize) => {
      setPage(nextPage)
      setPageSize(nextPageSize)
    },
  }}
/>
```

### Server-side pagination

For server-side data, pass the current API page result as `data` and the API's total count as `pagination.total`:

```tsx
<Table
  columns={columns}
  data={query.data.items}
  pagination={{
    current: query.page,
    pageSize: query.pageSize,
    total: query.data.total,
    disabled: query.isFetching,
    onChange: (nextPage, nextPageSize) => {
      setQuery((current) => ({
        ...current,
        page: nextPage,
        pageSize: nextPageSize,
      }));
    },
  }}
/>
```

When filters or search conditions change, reset the page to `1` in the consumer before issuing the next request.

## Column visibility

Use TanStack column ids (`id` or string `accessorKey`) in `defaultColumnVisibility` / `columnVisibility`. Omitted keys are visible; `false` hides a column.

```tsx
<Table
  tableKey="kintai-applications"
  columns={columns}
  data={rows}
  defaultColumnVisibility={{ hours: false }}
/>
```

When `tableKey` is present, Table persists the effective visibility map to `localStorage` under `godxui:table:<tableKey>:columnVisibility`. The stored payload includes a schema version and the table's current column keys. If another page accidentally reuses the same `tableKey` with a different column schema, Table ignores the stored value silently and falls back to `defaultColumnVisibility`. A valid persisted value wins over `defaultColumnVisibility`; without `tableKey`, Table does not persist anything.

Use `toolbar={{ columns: {} }}` for the built-in column settings drawer. Use controlled `columnVisibility` + `onColumnVisibilityChange` only when the screen needs to mirror column visibility into saved views or another state store.

## Density

When `density` is omitted, Table inherits the global `data-density` axis from the application or Storybook toolbar. Pass `density="compact"` or `density="default"` only when a table needs a local override. Row height, toolbar spacing, active-filter spacing, footer spacing, pagination spacing, and filter-drawer spacing all follow the same density contract.

## Column customisation

Use TanStack `ColumnDef.header` and `ColumnDef.cell`; do not compose
table subcomponents.

```tsx
const columns: TableColumn<Project>[] = [
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => <code className="mono">{row.original.version}</code>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.ok ? "success" : "error"}>
        {row.original.status}
      </Badge>
    ),
  },
];
```

`ColumnDef.meta` supports these visual hooks:

| Meta              | Type                                      | Description                      |
| ----------------- | ----------------------------------------- | -------------------------------- |
| `className`       | `string`                                  | Applied to header and body cells |
| `headerClassName` | `string`                                  | Applied to header cells          |
| `cellClassName`   | `string \| (row) => string`               | Applied to body cells            |
| `style`           | `CSSProperties`                           | Applied to header and body cells |
| `headerStyle`     | `CSSProperties`                           | Applied to header cells          |
| `cellStyle`       | `CSSProperties \| (row) => CSSProperties` | Applied to body cells            |

## Accessibility

- Uses native semantic HTML (`<table>`, `<thead>`, `<th>`, `<td>`) so screen readers announce table structure automatically.
- `caption` renders a native `<caption>` element.
- Horizontal scroll container (`table-scroll`) preserves native keyboard scrolling.
- Keep row identity stable with `rowKey` or `getRowId` whenever rows can reorder.

## Design patterns

The Storybook stories mirror `design-handoff/ui-system/dxs-kintai-design-system/project/preview/comp-table.html`:

- `views` renders saved view tabs (`.tbl-views`).
- `toolbar` renders search, detail filter, column settings, and primary table extras.
- `batchActions` renders a separate selected-row action bar; show it only when selection is non-empty and key every selection set by `rowKey`.
- The default `empty` state is localised and composes `Empty`; override `empty` only for custom layouts.
- `toolbar` should compose native godx UI primitives (`InputSearch`, `Button`) instead of hand-rolled controls.
- Prefer `filters` plus column `meta.filterOptions`; reserve `filterBar` for custom active-filter layouts.
- `onResetFilters` renders the reset action only when active filters exist.
- `rowClassName` demonstrates selected, new, error, disabled, and editing rows.
- `footer` and `pagination` render totals and page controls inside the same table shell.

## Sort and resize (A5)

Pass `sort` as a single `TableSort` for the legacy single-sort flow.
Pass `TableSort[]` to drive multi-sort — the head of the list is the
primary key (priority 1), the next is priority 2, etc. The header
renders a numbered badge (1 / 2 / 3) at the right edge when multi-sort
is active.

```tsx
const [sort, setSort] = useState<TableSortState>([
  { key: "date", direction: "desc" },
  { key: "hours", direction: "asc" },
]);

<Table
  columns={columns}
  data={rows}
  resizable
  sort={sort}
  onSortChange={setSort}
/>
```

- **Single click** on a sortable header replaces the head of the
  list with `{ key, direction: "asc" }`, then cycles to `desc`,
  then drops the entry.
- **Shift-click** appends (or cycles within) the multi-sort list.
- **Resize** — set `resizable` to enable per-column resize grips
  on the right edge of each header. Drag to resize, double-click
  to auto-fit (TanStack `column.resetSize()`).

## Expand row (A6)

```tsx
<Table
  columns={columns}
  data={rows}
  expandable={{
    expandedRowKeys,
    onExpandedRowsChange: setExpandedRowKeys,
    rowExpandable: (row) => row.original.detail !== undefined,
    renderExpandedRow: (row) => (
      <div className="expand-body">
        <h4>Detail</h4>
        <dl className="grid">{/* … */}</dl>
      </div>
    ),
  }}
/>
```

- A `▶` button appears in a 32px first cell. Active rows get the
  `expanded` class so the panel below visually attaches to the row
  via the canonical 3px primary left border.
- The toggle is **exclusive** by default — opening one row closes
  the previous. Set `allowMultiple` to keep the previous open.
- Hide the toggle on rows that have no detail panel via
  `rowExpandable`.

### `TableExpandableConfig`

| Field                   | Type                                        | Description |
|-------------------------|---------------------------------------------|-------------|
| `expandedRowKeys`       | `string[]`                                  | Controlled open keys |
| `defaultExpandedRowKeys`| `string[]`                                  | Initial open keys (uncontrolled) |
| `onExpandedRowsChange`  | `(keys: string[]) => void`                  | Receives toggle changes |
| `renderExpandedRow`     | `(row: Row<TData>) => ReactNode`            | Required — panel body |
| `allowMultiple`         | `boolean`                                   | Default `false`; opens stay open |
| `rowExpandable`         | `(row: Row<TData>) => boolean`              | Hide the toggle on rows that can't expand |

## Editable row (A7)

```tsx
<Table
  columns={columns}
  data={rows}
  editing={{
    rowId: editingRowId,
    dirtyRowIds,
    dirtyCellIds,                  // ["k2:hours", "k2:kind"]
    isRowReadOnly: (row) => row.original.status === "confirmed",
    onStart: (id) => setEditingRowId(id),
    onCancel: () => { /* … */ },
    onCommit: () => { /* … */ },
    onSaveAll: () => { /* … */ },
    onCancelAll: () => { /* … */ },
    renderEditCell: (column, row) => {
      const accessor = (column as { accessorKey?: string }).accessorKey;
      if (accessor === "kind") {
        return (
          <select className="cell-select">{/* … */}</select>
        );
      }
      return <input className="cell-input" />;
    },
  }}
/>
```

- **Double-click** on any row (except confirmed ones) triggers
  `editing.onStart`. The row gets the `is-editing` class —
  yellow-tinted background per the canon.
- Cells with unsaved changes are flagged via `dirtyCellIds`
  (string `"<rowId>:<columnId>"`). Each gets a 5px warning dot
  at the top-right.
- When `dirtyRowIds.length > 0`, the framework renders a second
  footer band (`tbl-footer[data-state="dirty"]`) with the unsaved
  count + Save-all / Cancel-all controls.
- Read-only rows — set `isRowReadOnly`. Double-click is suppressed;
  confirmed `(確定済)` rows in the canon use this.

## Grouped + tree rows (A8)

### Grouped rows

```tsx
<Table
  columns={columns}
  data={rows}
  groupBy={(row) => ({
    key: row.shop,
    label: row.shop,
    count: <>{row.count} 名</>,
    total: <>{row.totalHours} h</>,
  })}
/>
```

The framework buckets rows by `key`, emits a full-width
`.group-row` `<tr>` per bucket with the title + count badge
(left) + total (right-floated), and renders the bucket's rows
inside. Each header has a built-in ▼ / ▶ collapse toggle.

### Tree rows

```tsx
<Table
  columns={columns}
  data={orgRoots}
  tree={{
    children: (row) => row.children,
    expandedNodes,
    onExpandedNodesChange: setExpandedNodes,
    maxDepth: 8,
  }}
/>
```

Tree mode replaces TanStack's flat row model with a recursive walk
of `data` — `children` returns a row's children. Per level the
first cell gets 14px indent + a twirl button on parents.

## Sticky columns (A9)

Pin a column with `meta.sticky: "left" | "right"`. Multiple columns
can pin to the same side. Both ends pin simultaneously when both
are set.

```tsx
const columns: TableColumn<Row>[] = [
  { accessorKey: "name", header: "Employee", meta: { sticky: "left" } },
  { accessorKey: "shop", header: "Shop" },
  // …
  { id: "actions", header: "操作", meta: { sticky: "right" } },
];
```

The column-manager Sheet (via `toolbar={{ columns: {} }}`)
includes a 🔒 / 🔓 toggle next to each visible column row so users
can pin / unpin at runtime. Changes fire via
`onColumnPinningChange(pinning: ColumnPinningState)` —
the same shape TanStack uses for `columnPinning`.

## Pagination variants (A10)

`TablePaginationVariantConfig` is the discriminated union; pick the
shape via `type`:

```tsx
pagination={{
  type: "numbered",            // legacy default; type optional
  current: 1, pageSize: 25, total: 1284,
  onChange: (page, size) => { /* … */ },
}}

pagination={{
  type: "load-more",
  hasMore: true,
  currentCount: 25,
  total: 1284,
  batchSize: 50,
  onLoadMore: () => { /* … */ },
  loadingMore: false,
}}

pagination={{
  type: "cursor",
  value: "2026-05",
  inputType: "month",          // "month" | "date" | "week"
  label: <>2026年 5月 (820 件)</>,
  onChange: (next) => { /* … */ },
  onPrev: () => { /* … */ },
  onNext: () => { /* … */ },
  onJumpToLatest: () => { /* … */ },
}}
```

| Variant | When to use |
|---|---|
| `numbered` | Default. Lists < 10k rows — user thinks in "page 47". |
| `load-more` | Feed-like / activity logs — user wants "show me more". |
| `cursor` | Time-series (`勤怠` / `給与`) — user thinks in "month" / "week". |

The legacy `TablePaginationConfig` shape is still accepted (it's a
back-compat alias for `TablePaginationNumberedConfig`).

## Import / Export composite (A11)

`<TableImportFlow>` and `<TableExportDialog>` are a separate
composite — NOT props on `<Table>` — per cardinal rule 32. Import
them from `@godxjp/ui/components/composites`:

```tsx
import {
  TableImportFlow,
  TableExportDialog,
} from "@godxjp/ui/components/composites";

<TableImportFlow
  title="勤怠データ取り込み"
  currentStep="validate"
  file={{ name: "kintai_2026_05.csv", progress: 798 / 1284, … }}
  errors={[{ line: "L 124", message: "日付形式が不正", value: "26/5/14" }]}
  actions={<Button>エラー行をスキップして取込</Button>}
/>

<TableExportDialog
  open={open}
  onOpenChange={setOpen}
  format={format}
  onFormatChange={setFormat}
  range={range}
  onRangeChange={setRange}
  includeHiddenColumns={includeHidden}
  onIncludeHiddenColumnsChange={setIncludeHidden}
  rangeCounts={{ currentFilter: 1284, selected: 3, all: 12408 }}
  columnCounts={{ visible: 8, total: 12 }}
  onExport={() => downloadExport(format, range, includeHidden)}
/>
```

Default format is `csv-utf8` (UTF-8 with BOM — Excel-safe).
`csv-shift-jis` covers legacy Japanese systems. Default range is
`current-filter` — matches what the user is looking at.

## See also

- [Card](./Card.md) — common wrapping context.
- [Badge](./Badge.md) — status indicators in table cells.
