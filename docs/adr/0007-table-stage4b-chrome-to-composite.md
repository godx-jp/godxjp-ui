---
diataxis: adr
library: "@godxjp/ui"
library_version: 5.0.0
adr: "0007"
title: "Table Stage 4b — chrome moves to DataTable composite"
status: accepted
date: 2026-05-18
last-updated: 2026-05-18
audience: [developer]
lang: en
supersedes: "0006"
---

# ADR 0007 — Table Stage 4b: chrome moves to DataTable composite

## Status

Accepted (2026-05-18). Supersedes [ADR-0006](./0006-table-primitive-vs-data-table-composite.md).
Ships in v5.0.0.

---

## Context

[ADR-0006](./0006-table-primitive-vs-data-table-composite.md) landed
Stages 1-4 of the Table refactor (`<Pagination>` merge, table hooks,
`<DataTable>` composite scaffolding, `Table.tsx` file split). It
intentionally **left chrome rendering on the primitive** as a
backward-compat measure — the composite was a thin orchestrator that
delegated to `<Table toolbar=… views=… batchActions=…>`.

The follow-up sentence in ADR-0006 captured the residual debt:

> _"After ≥ 1 minor release with both APIs stable, evaluate moving the_
> _`toolbar` / `views` / `filterBar` / `batchActions` rendering off_
> _`<Table>` into composite-owned helpers (Stage 4b in the original_
> _plan)."_

Symptoms that surfaced after a minor release with both APIs stable:

- `Table.tsx` was still **1,842 lines** — half of which is chrome
  the primitive never needs in isolation. Forking the primitive
  (rule 4 — shadcn-style ownership) remained daunting.
- The primitive owned three localStorage effects, the column-manager
  Sheet, the save-view Dialog, the batch action band, the view tabs,
  the toolbar, the filter bar, the pagination band — none of which
  a bare `<Table columns={…} data={…} />` consumer wants.
- The composite couldn't slot the toolbar or the filter band
  ergonomically; it had to mutate the toolbar config object before
  passing it through. Slot overrides were second-class.
- TanStack `useReactTable` lived inside the primitive, so the
  composite could not introspect the row model for its own chrome
  (the column manager Sheet, for example, had to round-trip through
  toolbar config events).

## Decision

Slim `<Table>` to the **table body only**. Move every chrome region
into `<DataTable>` and split CSS accordingly.

**Industry alignment.**

| Library | Primitive surface | Chrome owner |
|---|---|---|
| TanStack Table v8 | `useReactTable` (headless) | Consumer / wrappers |
| shadcn/ui Table | `<Table>` / `<TableHeader>` / `<TableRow>` — JSX shells only | Consumer |
| Material React Table | Headless props on `<MaterialReactTable>` | Same component, but everything is opt-in |
| Mantine React Table | Same as MRT | Same |

Every major React table package treats chrome as **composition**, not
primitive surface. v5 brings @godxjp/ui in line with that consensus.

### Primitive (`<Table>` v5)

Accepts only:
- `columns`, `data`, `rowKey`, `getRowId`, `instance?`
- `density`, `stickyHeader`, `containerClassName`, `className`,
  `caption`, `footer`, `empty`, `rowClassName`
- `sort`, `onSortChange`, `resizable`
- `columnVisibility`, `defaultColumnVisibility`,
  `onColumnVisibilityChange`, `onColumnPinningChange`
- `expandable`, `tree`, `editing`, `groupBy`
- `selection?` — leaner replacement for the v4 `batchActions` config;
  strictly the checkbox-column wiring.

**Removed:** `toolbar`, `views`, `batchActions`, `filters`,
`onFiltersChange`, `filterBar`, `onResetFilters`, `pagination`,
`tableKey`.

### Composite (`<DataTable>` v5)

Owns:
- View tabs + save-view `<Dialog>`.
- Toolbar bar (search + filter button + columns button + primary
  action + extras).
- Filter chip bar (auto-derived from `filters` or custom).
- Batch action band (when `selection.selectedRowKeys.length > 0`).
- Column manager `<Sheet>` (visibility + pinning lock toggle).
- Pagination band (numbered / load-more / cursor variants).
- TanStack instance built via `useReactTable` inside `useDataTable`.
- Manages `columnVisibility`, `columnPinning`, persisted saved-views
  via slice hooks (`useTablePagination`, `useTableSelection`,
  `useTableViews`, `useTableState`).

### CSS

`src/styles/shell/40-table.css` → primitive only (body / row / cell
/ sort / resize / expand / tree / group / sticky / editing /
dirty-footer rules).

`src/styles/shell/41-data-table.css` (new) → composite chrome
(`.table-toolbar`, `.tbl-views`, `.tbl-filter-bar`,
`.table-filter-sheet`, `.table-filter-field`, `.table-column-field`,
`.tbl-batch-bar`, `.tbl-pagination`, `.tbl-load-more`, etc.).

`shell.css` imports the new file directly after the old one so
cascade order is preserved.

## Consequences

### Positive

- **`Table.tsx`: 1,842 → 901 lines** (~51% reduction). Forking is
  achievable again.
- **`DataTable.tsx`: 86 → ~280 lines.** The composite carries its
  weight transparently; slot overrides for toolbar / primary action /
  footer / empty state are first-class.
- Persistence (localStorage) leaves the primitive. The composite
  threads it through `useDataTable` so consumers can opt in by
  passing a `tableKey` to the hook, or opt out by not passing one.
- TanStack instance lives in `useDataTable`. The composite renders
  the column manager Sheet, save-view Dialog, batch action band, and
  pagination band directly off the instance.
- CSS split mirrors the JS split. Reviewers can locate chrome rules
  in `41-data-table.css` without skimming the body rules.

### Negative

- **BREAKING for v5.** Consumers using `<Table toolbar=… views=…
  batchActions=… filters=… pagination=… tableKey=…>` must migrate to
  `<DataTable>` + `useDataTable`. The migration guide includes a 1:1
  prop-to-hook diff for every removed prop. The codemod note lives
  in [`docs/how-to/migrate-to-data-table.md`](../how-to/migrate-to-data-table.md).
- Bare `<Table>` users who passed `batchActions` switch to the
  slimmer `selection` prop. Same selectedRowKeys / onChange / disabled
  shape; the batch action band UI moves to the composite.

### Neutral

- No new peer dependencies. Cardinal rule 14 (locked stack) is honoured.
- Stage 4b ships a new internal module set under
  `src/components/composites/data-table/`:
  `DataTableChrome.tsx`, `DataTablePaginationBand.tsx`,
  `ColumnManagerSheet.tsx`, `SaveViewDialog.tsx`,
  `DataTable.types.ts`, `persistence.ts` (moved from
  `data-display/Table.persistence.ts`).
- The chrome-shaped types (`TableToolbarConfig`, `TableViewsConfig`,
  `TableBatchActionsConfig`, `TableFilterItem`, `TablePagination*`,
  `TableViewItem`, etc.) remain importable from
  `data-display/Table` so internal composite code didn't churn.
  A future PR may move the declarations into
  `composites/data-table/DataTable.types.ts`.

---

## References

- [ADR-0006](./0006-table-primitive-vs-data-table-composite.md) — Stage 4a, superseded.
- [`docs/how-to/migrate-to-data-table.md`](../how-to/migrate-to-data-table.md) — required migration for v5.
- [`docs/reference/composites/DataTable.md`](../reference/composites/DataTable.md) — composite reference.
- [`CHANGELOG.md`](../../CHANGELOG.md) — `## [5.0.0]` entry.
