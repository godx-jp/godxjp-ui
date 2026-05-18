---
title: "Table"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Table
status: stable
audience: [developer, agent]
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
  getRowId={(row) => row.id}
  caption="Project list as of today"
/>
```

## Exports

| Export | Description |
|---|---|
| `Table` | Data-driven table wrapper backed by TanStack Table |
| `TableColumn` | Alias for TanStack `ColumnDef` |
| `TableDensity` | `"default" \| "compact"` |
| `TableProps` | Generic prop type for `Table<TData>` |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `TableColumn<TData>[]` | required | TanStack column definitions |
| `data` | `TData[]` | required | Rows to render |
| `density` | `"default" \| "compact"` | Global `data-density` axis | Local row and region-density override |
| `containerClassName` | `string` | — | CSS class for the outer table stack |
| `stickyHeader` | `boolean` | `false` | Pins the header via the existing sticky CSS hook |
| `getRowId` | `(row, index) => string` | index | Stable row id resolver |
| `caption` | `ReactNode` | — | Native `<caption>` content |
| `views` | `ReactNode` | — | Saved-view tab strip above the toolbar |
| `toolbar` | `ReactNode` | — | Action band rendered above the scroll container |
| `filters` | `TableFilter[]` | `[]` | Active filters. The default filter bar renders only when this list is non-empty |
| `onFiltersChange` | `(filters) => void` | — | Receives chip remove / value-change updates |
| `sort` | `TableSort \| null` | — | Active controlled sort |
| `onSortChange` | `(sort) => void` | — | Receives sortable header clicks; cycles asc → desc → none |
| `filterBar` | `ReactNode \| TableFilterItem[]` | — | Escape hatch for custom active-filter UI |
| `footer` | `ReactNode` | — | Totals / summary row below the table |
| `pagination` | `ReactNode` | — | Pagination controls below the footer |
| `empty` | `ReactNode` | Localised `<Empty>` | Empty state row override |
| `onResetFilters` | `() => void` | — | Shows the localised reset-filter action when active filters exist |
| `rowClassName` | `string \| (row) => string` | — | Row state class such as `selected`, `is-new`, `is-error`, `disabled`, `is-editing` |
| `...rest` | `Omit<HTMLAttributes<HTMLTableElement>, "children">` | — | Standard `<table>` props |

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
    cell: ({ row }) => <Badge variant={row.original.ok ? "success" : "error"}>{row.original.status}</Badge>,
  },
]
```

`ColumnDef.meta` supports these visual hooks:

| Meta | Type | Description |
|---|---|---|
| `className` | `string` | Applied to header and body cells |
| `headerClassName` | `string` | Applied to header cells |
| `cellClassName` | `string \| (row) => string` | Applied to body cells |
| `style` | `CSSProperties` | Applied to header and body cells |
| `headerStyle` | `CSSProperties` | Applied to header cells |
| `cellStyle` | `CSSProperties \| (row) => CSSProperties` | Applied to body cells |

## Accessibility

- Uses native semantic HTML (`<table>`, `<thead>`, `<th>`, `<td>`) so screen readers announce table structure automatically.
- `caption` renders a native `<caption>` element.
- Horizontal scroll container (`table-scroll`) preserves native keyboard scrolling.
- Keep row identity stable with `getRowId` whenever rows can reorder.

## Design patterns

The Storybook stories mirror `design-handoff/ui-system/dxs-kintai-design-system/project/preview/comp-table.html`:

- `views` renders saved view tabs (`.tbl-views`).
- `toolbar` renders search, import/export, density, column, and bulk-action controls.
- The default `empty` state is localised and composes `Empty`; override `empty` only for custom layouts.
- `toolbar` should compose native godx UI primitives (`InputSearch`, `Button`) instead of hand-rolled controls.
- Prefer `filters` plus column `meta.filterOptions`; reserve `filterBar` for custom active-filter layouts.
- `onResetFilters` renders the reset action only when active filters exist.
- `rowClassName` demonstrates selected, new, error, disabled, and editing rows.
- `footer` and `pagination` render totals and page controls inside the same table shell.

## See also

- [Card](./Card.md) — common wrapping context.
- [Badge](./Badge.md) — status indicators in table cells.
