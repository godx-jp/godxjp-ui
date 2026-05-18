---
diataxis: adr
library: "@godxjp/ui"
library_version: 4.0.0
adr: "0006"
title: "Table primitive vs DataTable composite"
status: superseded by 0007
date: 2026-05-18
last-updated: 2026-05-18
audience: [developer]
lang: en
---

# ADR 0006 — Table primitive vs DataTable composite

## Status

**Superseded by [ADR-0007](./0007-table-stage4b-chrome-to-composite.md)**
(v5.0.0). Stage 4b shipped in v5.0.0 — the chrome moved off the
primitive entirely. This ADR is preserved for the historical record
of the four-stage rollout (`<Pagination>` merge, table hooks,
`<DataTable>` composite scaffolding, `Table.tsx` file split).

---

## Context

The `<Table>` primitive at `src/components/data-display/Table.tsx`
had grown to **2,353 lines** with ~25 top-level props and a ColumnMeta
interface carrying 11 fields. A single component owned: TanStack
engine wiring, row rendering, sort state, column visibility +
pinning (auto + user-locked + localStorage), inline editing,
expand-row + tree-row + grouping, search + filter bar + filter
sheet, saved-view tabs, batch-action band, toolbar (search +
columns + primary action + custom actions), pagination (numbered +
load-more + cursor), and three persistence concerns.

Symptoms:

- **Rule 31 violation** (one Radix base = one primitive; composites
  combine primitives but are not wrappers). The kitchen-sink shape
  conflated "render a `<table>`" with "render a paginated, filterable,
  view-tabbed, batch-actionable data grid screen."
- **Rule 4 friction** (shadcn-style ownership — consumers fork in
  place). Forking 2,353 lines is daunting.
- **Rule 32 violation** (no redundant components). A separate
  `<Pagination>` already existed at
  `src/components/navigation/Pagination.tsx` with a different API; the
  Table also rendered an inline numbered pager with different CSS
  classes. Two paginators coexisted.
- **Persistence baked in**. The `<Table tableKey="…">` prop
  auto-persisted column visibility / pinning / saved views to
  `localStorage`. Industry standard (TanStack, Material React Table,
  Mantine React Table) is "do persistence in consumer code via
  `useState` + `on[StateName]Change`."

We needed an architecture that:
1. Keeps a thin primitive that just renders tables.
2. Provides an ergonomic composite for the canonical "data-table page"
   pattern.
3. Aligns persistence with industry standard while not breaking
   existing `<Table tableKey>` consumers.

---

## Decision

Adopt a **two-tier architecture** (primitive + composite) with
**hook-based state slices** as the canonical consumer API. Persistence
becomes a separate concern via a generic `useTableState` hook.

```
src/components/data-display/Table.tsx              ← primitive (TanStack wrapper + render)
src/components/data-display/Table.types.ts         ← types + ColumnMeta augmentation
src/components/data-display/Table.persistence.ts   ← legacy localStorage helpers
src/components/navigation/Pagination.tsx           ← sub-primitive (numbered + simple + embedded)
src/components/composites/data-table/              ← composite + useDataTable hook
   ├─ DataTable.tsx
   ├─ useDataTable.ts
   └─ index.ts
src/hooks/
   ├─ useTablePagination.ts
   ├─ useTableSelection.ts
   ├─ useTableViews.ts
   └─ useTableState.ts   (versioned localStorage useState)
```

### Layer responsibilities

- **`<Table>` primitive** — renders rows + columns + supporting
  chrome (toolbar / views / filters / batch / pagination / column
  manager Sheet). Backward-compatible API.
- **`<Pagination>` sub-primitive** — single numbered pager;
  `variant: "default" | "simple" | "embedded"` covers freestanding,
  compact, and table-footer renderings. Used both standalone (search
  results, comment threads) and inside `<Table pagination=…>`.
- **`<DataTable>` composite** — thin orchestrator over `<Table>`,
  consumes a typed instance from `useDataTable`. Slot overrides for
  toolbar / primary action / footer / empty.
- **Hooks** — state slices that wire into either primitive directly
  or the composite. Persistence is an opt-in concern via
  `useTableState({ storageKey, version, migrate, storage })`.

### Migration shape

Both APIs ship side-by-side. New consumers prefer the composite +
hook pattern; existing `<Table tableKey="…">` callers keep working
unchanged.

```tsx
// Legacy (still supported)
<Table
  columns={columns}
  data={rows}
  tableKey="orders.v1"
  pagination={{ current, pageSize, total, onChange }}
  batchActions={{ selectedRowKeys, onSelectedRowKeysChange, actions }}
  views={{ items, activeKey, onActiveKeyChange, onViewApply }}
/>

// New (preferred)
const pagination = useTablePagination({ defaultPageSize: 20 })
const selection  = useTableSelection()
const views      = useTableViews({ items: BUILT_IN_VIEWS, storageKey: "orders.views.v1" })
const [columnVisibility, setColumnVisibility] =
  useTableState<TableColumnVisibility>({
    storageKey: "orders.columnVisibility.v1",
    defaultValue: {},
  })

const table = useDataTable({
  data, columns,
  pagination, selection, views,
  columnVisibility, onColumnVisibilityChange: setColumnVisibility,
  toolbar: { columns: {} },
  batchActions: { actions: <BulkApprove ids={selection.selectedRowKeys}/> },
})

<DataTable table={table} slots={{ primaryAction: <Button>＋ 新規</Button> }} />
```

---

## Industry research

Surveyed the major React data-table libraries (October 2025):

- **TanStack Table v8** — headless engine; state slices are
  independent; persistence is consumer code via `on[StateName]Change`.
- **shadcn/ui** — `table.tsx` is a pure DOM primitive; `DataTable` is
  a copy-paste recipe with `DataTableColumnHeader` / `DataTablePagination`
  / `DataTableViewOptions` extractable helpers. No localStorage in the
  primitive.
- **Mantine** — `Table` core is a styled primitive; the rich data-grid
  ships as a separate `mantine-datatable` package.
- **Material React Table v3** — explicit `useMaterialReactTable` hook
  + `<MaterialReactTable table={instance} />` split. Slots accept
  static values OR callbacks. Persistence documented as "easy to
  implement yourself using state + `on[StateName]Change`."
- **MUI X DataGrid** — tier split (Community / Pro / Premium) but a
  single component per tier. Persistence wiring via `apiRef.exportState`
  / `restoreState` is consumer code.
- **Ant Design** — single fat `<Table>` with nested config bags. The
  monolithic prop surface is the failure mode we exited.

**Pattern adopted**: the two-tier shadcn / Mantine / MRT shape — thin
primitive at the DOM layer, ergonomic composite + hooks for the
packaged experience. Persistence as a hook, never as a primitive
feature.

References:
- [TanStack Table state guide](https://tanstack.com/table/v8/docs/framework/react/guide/table-state)
- [shadcn DataTable](https://ui.shadcn.com/docs/components/data-table)
- [Mantine Table](https://mantine.dev/core/table/) + [mantine-datatable](https://icflorescu.github.io/mantine-datatable/)
- [Material React Table state](https://www.material-react-table.com/docs/guides/state-management)

---

## Alternatives considered

### A. Keep one fat `<Table>` and add convenience props

Rejected — entrenches the rule 31 / 32 violations. New consumers
still hit a 25-prop API; persistence stays baked in.

### B. Break to slot-based primitive in one step

Rewrite `<Table>` to `<Table.Root>` + `<Table.Header>` + `<Table.Body>`
+ `<Table.Row>` + `<Table.Cell>`. Move TanStack engine into a `useTable`
hook. Move chrome rendering into composite.

Rejected (for now) — major breaking change without enough payoff
beyond what the composite + hooks already deliver. Reconsidered if
the primitive's responsibilities grow further.

### C. Composite-only refactor; leave primitive untouched

Ship `<DataTable>` + hooks but keep all chrome on `<Table>`. Rejected
— sets up duplicated rendering paths long term, and `<Pagination>`
was already duplicated (the immediate motivator).

### D. Move persistence to a built-in hook on `<Table>` (similar to
Handsontable's `persistentState` plugin)

Rejected — explicit industry counter-pattern. TanStack / MRT /
MantineRT all push persistence to consumer code; bundling it in the
primitive ties the framework to a specific storage strategy.

---

## Consequences

### Positive

- `<Table>` file went from 2,353 → 1,838 lines (~22%) after extracting
  types + persistence. Further splits possible later.
- New consumers get an ergonomic, MRT-style hook + composite API.
- Persistence is now consumer code via `useTableState` — versioned,
  swappable storage backend, no implicit globals.
- `<Pagination>` is a single primitive (rule 32 satisfied).
- The composite is the *recommended marketing surface*; the primitive
  is for advanced cases (custom layouts, performance tuning,
  forking-in-place).

### Negative

- Two ways to do it (primitive props + composite + hooks) increases
  the surface area documentation has to cover.
- Existing PackagedFeatures-style consumers still wire the legacy
  prop bag; full migration to the hook pattern is a multi-PR effort.
- The `<DataTable>` composite, in Stage 3, still delegates to the fat
  primitive — the architectural separation isn't fully realised until
  a future stage moves chrome rendering off the primitive.

### Neutral

- No new peer dependencies (lucide-react was already locked-stack
  per rule 14).
- The 4 mandatory locales (ja / en / vi / fil) all gained the
  `table.lastPage` key required by the unified `<Pagination
  showFirstLast>` button.

---

## Follow-up

1. After ≥ 1 minor release with both APIs stable, evaluate moving the
   `toolbar` / `views` / `filterBar` / `batchActions` rendering off
   `<Table>` into composite-owned helpers (Stage 4b in the original
   plan).
2. Reconsider slot-based primitive (`<Table.Root>` / `<Table.Cell>`)
   only if a consumer use case demands it.
3. Codemod `<Table tableKey>` → `useTableState` for downstream apps
   when the major bump lands.

---

## References

- [`docs/specs/02-consumer-contract.md`](../specs/02-consumer-contract.md) —
  consumer surface contract.
- [`docs/reference/data-display/Table.md`](../reference/data-display/Table.md) —
  primitive reference.
- [`docs/reference/composites/DataTable.md`](../reference/composites/DataTable.md) —
  composite reference.
- [`docs/how-to/migrate-to-data-table.md`](../how-to/migrate-to-data-table.md) —
  migration guide.
- [Plan §3 architecture decision](#) — the recommendation that drove
  this ADR (industry research + codebase inventory captured October 2025).
