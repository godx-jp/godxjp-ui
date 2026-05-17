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
| `density` | `"default" \| "compact"` | `"default"` | Row density |
| `containerClassName` | `string` | — | CSS class for the outer table stack |
| `stickyHeader` | `boolean` | `false` | Pins the header via the existing sticky CSS hook |
| `getRowId` | `(row, index) => string` | index | Stable row id resolver |
| `caption` | `ReactNode` | — | Native `<caption>` content |
| `toolbar` | `ReactNode` | — | Action band rendered above the scroll container |
| `empty` | `ReactNode` | `"No data"` | Empty state row |
| `...rest` | `Omit<HTMLAttributes<HTMLTableElement>, "children">` | — | Standard `<table>` props |

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

## See also

- [Card](./Card.md) — common wrapping context.
- [Badge](./Badge.md) — status indicators in table cells.
