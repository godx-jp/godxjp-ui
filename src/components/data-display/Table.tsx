/**
 * @godxjp/ui Table — slim primitive.
 *
 * Renders columns × rows. Sort indicators, resize handles, checkbox
 * column (driven by `selection`), expand toggles, tree twirls, group
 * banners, inline editing, sticky columns. The chrome — view tabs,
 * toolbar, filter chips, batch action band, pagination, column
 * manager Sheet, save-view Dialog — lives on the `<DataTable>`
 * composite (`src/components/composites/data-table/`).
 *
 * v5.0.0 (Stage 4b, Plan §3). The legacy chrome props (`toolbar`,
 * `views`, `batchActions`, `filters`, `onFiltersChange`, `filterBar`,
 * `onResetFilters`, `pagination`, `tableKey`) were removed in this
 * release. See `docs/how-to/migrate-to-data-table.md`.
 */
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Column,
  type ColumnPinningState,
  type Row,
  type Table as ReactTable,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";
import { matchBreakpoint, useBreakpoint } from "../../hooks/useBreakpoint";
import type { Breakpoint } from "../layout/Row";
import {
  Fragment,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../cn";
import { Checkbox } from "../data-entry/Checkbox";
import { Button } from "../general/Button";
import { Empty } from "./Empty";
import type {
  TableColumn,
  TableColumnVisibility,
  TableGroupDescriptor,
  TableProps,
  TableRowKey,
  TableSort,
  TableSortState,
  TableStickyConfig,
  TableStickySide,
} from "./Table.types";
// Re-export the type surface so existing `from "./data-display/Table"`
// imports continue to resolve identically to before the Stage 4 split.
export type {
  TableColumn,
  TableColumnPinningChange,
  TableColumnVisibility,
  TableDensity,
  TableEditingConfig,
  TableExpandableConfig,
  TableGroupBy,
  TableGroupDescriptor,
  TableProps,
  TableRowKey,
  TableSelectionConfig,
  TableSort,
  TableSortState,
  TableStickyConfig,
  TableStickySide,
  TableTreeConfig,
} from "./Table.types";
// Chrome-shaped types remain importable from this module for the
// composite consumers that still reference them (PR 4/4 of stage 4b
// will move them into `composites/data-table/DataTable.types.ts`).
export type {
  TableBatchActions,
  TableBatchActionsConfig,
  TableBatchActionsContext,
  TableFilter,
  TableFilterBar,
  TableFilterItem,
  TableFilterOperator,
  TableFilterOption,
  TablePagination,
  TablePaginationConfig,
  TablePaginationCursorConfig,
  TablePaginationLoadMoreConfig,
  TablePaginationNumberedConfig,
  TablePaginationVariantConfig,
  TableToolbar,
  TableToolbarButtonConfig,
  TableToolbarColumnConfig,
  TableToolbarConfig,
  TableToolbarFilterConfig,
  TableToolbarSearchConfig,
  TableViewItem,
  TableViewSnapshot,
  TableViews,
  TableViewsConfig,
} from "./Table.types";

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(previous)
    : updater;
}

function resolveRowKey<TData>(
  row: TData,
  index: number,
  rowKey: TableRowKey<TData>,
  warnMissingRowKey: (rowKey: string) => void,
) {
  if (typeof rowKey === "function") {
    const value = rowKey(row, index);
    return String(value);
  }
  if (
    typeof row === "object" &&
    row !== null &&
    Object.prototype.hasOwnProperty.call(row, rowKey)
  ) {
    const value = (row as Record<string, unknown>)[rowKey];
    if (value !== undefined && value !== null) return String(value);
  }
  warnMissingRowKey(rowKey);
  return String(index);
}

function resolveCellClass<TData>(
  value: string | ((row: Row<TData>) => string | undefined) | undefined,
  row: Row<TData>,
) {
  return typeof value === "function" ? value(row) : value;
}

function resolveCellStyle<TData>(
  value:
    | CSSProperties
    | ((row: Row<TData>) => CSSProperties | undefined)
    | undefined,
  row: Row<TData>,
) {
  return typeof value === "function" ? value(row) : value;
}

function getColumnKey<TData>(
  column: TableColumn<TData, unknown>,
): string | undefined {
  const maybeAccessor = column as { accessorKey?: unknown; id?: string };
  if (typeof maybeAccessor.id === "string") return maybeAccessor.id;
  if (typeof maybeAccessor.accessorKey === "string")
    return maybeAccessor.accessorKey;
  return undefined;
}

function asSortArray(sort: TableSortState | undefined): TableSort[] {
  if (sort === undefined || sort === null) return [];
  return Array.isArray(sort) ? sort : [sort];
}

function findSortEntry(sort: TableSortState | undefined, key: string) {
  const list = asSortArray(sort);
  const index = list.findIndex((item) => item.key === key);
  return index === -1 ? undefined : { entry: list[index], index, list };
}

/** Single-click cycle: asc → desc → off. Replaces the head of the list. */
function nextSingleSort(
  current: TableSortState | null | undefined,
  key: string,
): TableSortState {
  const entry = findSortEntry(current, key);
  if (entry === undefined) return { key, direction: "asc" };
  if (entry.entry.direction === "asc") return { key, direction: "desc" };
  return null;
}

/** Shift-click: extend the list. Same key → cycle that entry's direction or drop it. */
function nextMultiSort(
  current: TableSortState | null | undefined,
  key: string,
): TableSortState {
  const list = asSortArray(current);
  const index = list.findIndex((item) => item.key === key);
  if (index === -1) {
    return [...list, { key, direction: "asc" }];
  }
  const existing = list[index];
  const next = [...list];
  if (existing.direction === "asc") {
    next[index] = { key, direction: "desc" };
  } else {
    next.splice(index, 1);
  }
  if (next.length === 0) return null;
  if (next.length === 1) return next[0];
  return next;
}

function resolveStickySide(
  config: TableStickyConfig | undefined,
  bp: Breakpoint,
): TableStickySide | undefined {
  if (config === undefined || config === false) return undefined;
  if (typeof config === "string") return config;
  if (config.from !== undefined && !matchBreakpoint(bp, config.from))
    return undefined;
  return config.side;
}

function deriveColumnPinning<TData>(
  columns: TableColumn<TData, unknown>[],
  bp: Breakpoint,
): ColumnPinningState {
  return columns.reduce<ColumnPinningState>(
    (state, column) => {
      const key = getColumnKey(column);
      if (key === undefined) return state;
      const side = resolveStickySide(column.meta?.sticky, bp);
      if (side === undefined) return state;
      return { ...state, [side]: [...(state[side] ?? []), key] };
    },
    { left: [], right: [] },
  );
}

function getColumnStyle<TData>(
  column: Column<TData, unknown>,
  extra?: CSSProperties,
): CSSProperties {
  const pinned = column.getIsPinned();
  const size = column.columnDef.size;
  return {
    width: size !== undefined ? `${column.getSize()}px` : undefined,
    minWidth:
      column.columnDef.minSize !== undefined
        ? `${column.columnDef.minSize}px`
        : undefined,
    maxWidth:
      column.columnDef.maxSize !== undefined
        ? `${column.columnDef.maxSize}px`
        : undefined,
    position: pinned ? "sticky" : undefined,
    left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: pinned === "right" ? `${column.getAfter("right")}px` : undefined,
    zIndex: pinned ? 2 : undefined,
    ...extra,
  };
}

export function Table<TData>({
  columns,
  data,
  density,
  containerClassName,
  stickyHeader,
  rowKey = "id" as TableRowKey<TData>,
  getRowId,
  caption,
  defaultColumnVisibility,
  columnVisibility,
  onColumnVisibilityChange,
  sort,
  onSortChange,
  resizable,
  expandable,
  editing,
  groupBy,
  tree,
  onColumnPinningChange,
  selection,
  footer,
  empty,
  rowClassName,
  className,
  instance,
  ...rest
}: TableProps<TData>) {
  const { t } = useTranslation();
  const warnedRowKeys = useRef(new Set<string>());
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<TableColumnVisibility>(
      () => columnVisibility ?? defaultColumnVisibility ?? {},
    );
  const effectiveColumnVisibility =
    columnVisibility ?? internalColumnVisibility;
  // Auto-pinning is derived from `meta.sticky` against the current
  // breakpoint, so `{ side: "right", from: "md" }` only sticks on md+.
  // User-toggled pins live in the `<DataTable>` composite.
  const bp = useBreakpoint();
  const autoColumnPinning = useMemo(
    () => deriveColumnPinning(columns, bp),
    [columns, bp],
  );
  const [userColumnPinning, setUserColumnPinning] =
    useState<ColumnPinningState>({ left: [], right: [] });
  const columnPinning = useMemo<ColumnPinningState>(() => {
    const dedupe = (list: string[]) => Array.from(new Set(list));
    return {
      left: dedupe([
        ...(autoColumnPinning.left ?? []),
        ...(userColumnPinning.left ?? []),
      ]),
      right: dedupe([
        ...(autoColumnPinning.right ?? []),
        ...(userColumnPinning.right ?? []),
      ]),
    };
  }, [autoColumnPinning, userColumnPinning]);
  const handleColumnPinningChange = (updater: Updater<ColumnPinningState>) => {
    const next = resolveUpdater(updater, columnPinning);
    const autoLeft = new Set(autoColumnPinning.left ?? []);
    const autoRight = new Set(autoColumnPinning.right ?? []);
    setUserColumnPinning({
      left: (next.left ?? []).filter((key) => !autoLeft.has(key)),
      right: (next.right ?? []).filter((key) => !autoRight.has(key)),
    });
    onColumnPinningChange?.(next);
  };
  // Expand-row + tree-row + editing internal state.
  const [internalExpandedRowKeys, setInternalExpandedRowKeys] = useState<
    string[]
  >(() => expandable?.defaultExpandedRowKeys ?? []);
  const expandedRowKeys =
    expandable?.expandedRowKeys ?? internalExpandedRowKeys;
  const expandedRowKeySet = new Set(expandedRowKeys);
  function toggleExpandedRow(rowId: string) {
    if (expandable === undefined) return;
    const allowMultiple = expandable.allowMultiple === true;
    const nextSet = new Set(expandedRowKeys);
    if (nextSet.has(rowId)) {
      nextSet.delete(rowId);
    } else {
      if (!allowMultiple) nextSet.clear();
      nextSet.add(rowId);
    }
    const next = Array.from(nextSet);
    if (expandable.expandedRowKeys === undefined)
      setInternalExpandedRowKeys(next);
    expandable.onExpandedRowsChange?.(next);
  }
  const [internalTreeExpandedNodes, setInternalTreeExpandedNodes] = useState<
    string[]
  >(() => tree?.defaultExpandedNodes ?? []);
  const treeExpandedNodes =
    tree?.expandedNodes ?? internalTreeExpandedNodes;
  const treeExpandedSet = new Set(treeExpandedNodes);
  function toggleTreeNode(nodeKey: string) {
    if (tree === undefined) return;
    const nextSet = new Set(treeExpandedNodes);
    if (nextSet.has(nodeKey)) nextSet.delete(nodeKey);
    else nextSet.add(nodeKey);
    const next = Array.from(nextSet);
    if (tree.expandedNodes === undefined) setInternalTreeExpandedNodes(next);
    tree.onExpandedNodesChange?.(next);
  }
  const dirtyRowSet = new Set(editing?.dirtyRowIds ?? []);
  const dirtyCellSet = new Set(editing?.dirtyCellIds ?? []);
  const resolveGetRowId =
    getRowId ??
    ((row: TData, index: number) =>
      resolveRowKey(row, index, rowKey, (missingRowKey) => {
        if (warnedRowKeys.current.has(missingRowKey)) return;
        warnedRowKeys.current.add(missingRowKey);
        console.warn(
          `[godx-ui/Table] rowKey "${missingRowKey}" was not found on a row. Pass rowKey or getRowId to provide a stable row id.`,
        );
      }));
  const handleColumnVisibilityChange = (updater: Updater<VisibilityState>) => {
    const next = resolveUpdater(updater, effectiveColumnVisibility);
    if (columnVisibility === undefined) setInternalColumnVisibility(next);
    onColumnVisibilityChange?.(next);
  };
  const tableState = useMemo(
    () => ({ columnPinning, columnVisibility: effectiveColumnVisibility }),
    [columnPinning, effectiveColumnVisibility],
  );
  // Always-call-the-hook pattern: the local `useReactTable` runs
  // unconditionally so the rules-of-hooks invariant holds. When an
  // external `instance` is supplied (typically by `<DataTable>` via
  // `useDataTable`) we defer to it for state + row model.
  const localTable = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: resolveGetRowId,
    enableColumnPinning: true,
    enableColumnResizing: resizable === true,
    columnResizeMode: "onChange",
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnPinningChange: handleColumnPinningChange,
    state: tableState,
  });
  const table: ReactTable<TData> = instance ?? localTable;
  const leafColumns = table.getVisibleLeafColumns();
  const hasFooter = leafColumns.some(
    (column) => column.columnDef.footer !== undefined,
  );

  // ── Selection wiring (checkbox column only) ──────────────────────
  const selectedRowKeySet = new Set(selection?.selectedRowKeys ?? []);
  const selectableRows = table
    .getRowModel()
    .rows.filter((row) => selection?.getCheckboxDisabled?.(row) !== true);
  const allVisibleSelected =
    selection !== undefined &&
    selectableRows.length > 0 &&
    selectableRows.every((row) => selectedRowKeySet.has(row.id));
  const selectAllVisible = () => {
    if (selection === undefined) return;
    const next = new Set(selection.selectedRowKeys);
    if (allVisibleSelected) selectableRows.forEach((row) => next.delete(row.id));
    else selectableRows.forEach((row) => next.add(row.id));
    selection.onSelectedRowKeysChange(Array.from(next));
  };

  const colSpan = Math.max(
    leafColumns.length +
      (selection === undefined ? 0 : 1) +
      (expandable === undefined ? 0 : 1),
    1,
  );
  const emptyContent = empty ?? <Empty description={t("table.emptyDescription")} />;

  function renderDataRow(row: Row<TData>): ReactNode {
    const isEditingRow = editing?.rowId === row.id;
    const isReadOnly = editing?.isRowReadOnly?.(row) === true;
    const isDirtyRow = dirtyRowSet.has(row.id);
    const customClass = resolveCellClass(rowClassName, row);
    const stateClass = cn(
      customClass,
      isEditingRow && "is-editing",
      isDirtyRow && !isEditingRow && "is-dirty",
    );
    const isExpanded = expandedRowKeySet.has(row.id);
    const canExpand =
      expandable !== undefined &&
      (expandable.rowExpandable === undefined ||
        expandable.rowExpandable(row));
    const rowNodes: ReactNode[] = [];
    rowNodes.push(
      <tr
        key={row.id}
        className={cn(stateClass, isExpanded && "expanded")}
        onDoubleClick={
          editing !== undefined && !isReadOnly && !isEditingRow
            ? () => editing.onStart?.(row.id)
            : undefined
        }
        data-row-id={row.id}
      >
        {selection !== undefined && (
          <td className="check">
            <Checkbox
              aria-label={t("table.selectRow", { row: row.id })}
              checked={selectedRowKeySet.has(row.id)}
              disabled={selection.getCheckboxDisabled?.(row)}
              onCheckedChange={(checked) => {
                const next = new Set(selection.selectedRowKeys);
                if (checked === true) next.add(row.id);
                else next.delete(row.id);
                selection.onSelectedRowKeysChange(Array.from(next));
              }}
            />
          </td>
        )}
        {expandable !== undefined && (
          <td className="expand-cell" style={{ width: 32 }}>
            {canExpand && (
              <button
                type="button"
                className={cn("expand-toggle", isExpanded && "open")}
                aria-label={
                  isExpanded ? t("table.collapseRow") : t("table.expandRow")
                }
                aria-expanded={isExpanded}
                onClick={() => toggleExpandedRow(row.id)}
              >
                ▶
              </button>
            )}
          </td>
        )}
        {row.getVisibleCells().map((cell) => {
          const meta = cell.column.columnDef.meta;
          const cellId = `${row.id}:${cell.column.id}`;
          const isDirtyCell = dirtyCellSet.has(cellId);
          const cellContent =
            isEditingRow && !isReadOnly && editing?.renderEditCell
              ? (editing.renderEditCell(cell.column.columnDef, row) ??
                flexRender(cell.column.columnDef.cell, cell.getContext()))
              : flexRender(cell.column.columnDef.cell, cell.getContext());
          return (
            <td
              key={cell.id}
              className={cn(
                meta?.className,
                cell.column.getIsPinned() &&
                  `table-pinned-${cell.column.getIsPinned()}`,
                resolveCellClass(meta?.cellClassName, row),
                isDirtyCell && "cell-dirty",
              )}
              style={getColumnStyle(cell.column, {
                ...meta?.style,
                ...resolveCellStyle(meta?.cellStyle, row),
              })}
            >
              {cellContent}
            </td>
          );
        })}
      </tr>,
    );
    if (expandable !== undefined && isExpanded) {
      rowNodes.push(
        <tr key={`${row.id}:expand`} className="expand-panel">
          <td colSpan={colSpan}>{expandable.renderExpandedRow(row)}</td>
        </tr>,
      );
    }
    return <Fragment key={`${row.id}:wrap`}>{rowNodes}</Fragment>;
  }

  function renderTreeRow(
    item: TData,
    depth: number,
    nodes: ReactNode[],
  ): void {
    const id = String(resolveGetRowId(item, nodes.length));
    const children = tree?.children(item);
    const hasChildren = (children?.length ?? 0) > 0;
    const isOpen = treeExpandedSet.has(id);
    const visibleColumns = table.getVisibleLeafColumns();
    nodes.push(
      <tr key={id} className={resolveCellClass(rowClassName, {
        id,
        original: item,
        getVisibleCells: () => [],
      } as unknown as Row<TData>)}>
        {visibleColumns.map((column, columnIndex) => {
          const meta = column.columnDef.meta;
          const isFirst = columnIndex === 0;
          const indents = isFirst && depth > 0
            ? Array.from({ length: depth }, (_, i) => (
                <span key={i} className="indent" aria-hidden />
              ))
            : null;
          const twirl = isFirst && hasChildren ? (
            <button
              type="button"
              className={cn("twirl-btn", isOpen && "open")}
              aria-label={isOpen ? t("table.collapseRow") : t("table.expandRow")}
              aria-expanded={isOpen}
              onClick={() => toggleTreeNode(id)}
            >
              ▶
            </button>
          ) : isFirst ? (
            <span className="indent" aria-hidden />
          ) : null;
          const accessor = (column.columnDef as { accessorKey?: string })
            .accessorKey;
          let content: ReactNode = null;
          if (typeof column.columnDef.cell === "function") {
            content = column.columnDef.cell({
              row: { original: item, id } as Row<TData>,
              column,
              table,
              getValue: () =>
                accessor !== undefined
                  ? (item as Record<string, unknown>)[accessor]
                  : undefined,
              renderValue: () =>
                accessor !== undefined
                  ? (item as Record<string, unknown>)[accessor]
                  : undefined,
              cell: {} as never,
            } as never);
          } else if (accessor !== undefined) {
            const raw = (item as Record<string, unknown>)[accessor];
            content = raw === undefined || raw === null ? "" : String(raw);
          }
          return (
            <td
              key={column.id}
              className={cn(
                meta?.className,
                column.getIsPinned() && `table-pinned-${column.getIsPinned()}`,
              )}
              style={getColumnStyle(column, { ...meta?.style })}
            >
              {indents}
              {twirl}
              {twirl !== null ? " " : null}
              {content}
            </td>
          );
        })}
      </tr>,
    );
    if (hasChildren && isOpen && tree !== undefined) {
      const maxDepth = tree.maxDepth ?? 8;
      if (depth + 1 <= maxDepth) {
        for (const child of children ?? []) {
          renderTreeRow(child, depth + 1, nodes);
        }
      }
    }
  }

  function renderBodyRows(): ReactNode {
    const rows = table.getRowModel().rows;
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={colSpan} className="muted">
            {emptyContent}
          </td>
        </tr>
      );
    }
    if (tree !== undefined) {
      const nodes: ReactNode[] = [];
      for (const item of data) renderTreeRow(item, 0, nodes);
      return nodes;
    }
    if (groupBy !== undefined) {
      const buckets = new Map<
        string,
        { descriptor: TableGroupDescriptor; rows: Row<TData>[] }
      >();
      const order: string[] = [];
      for (const row of rows) {
        const raw = groupBy(row.original);
        if (raw === undefined) continue;
        const descriptor: TableGroupDescriptor =
          typeof raw === "string" ? { key: raw, label: raw } : raw;
        const bucket = buckets.get(descriptor.key);
        if (bucket === undefined) {
          buckets.set(descriptor.key, { descriptor, rows: [row] });
          order.push(descriptor.key);
        } else {
          bucket.rows.push(row);
        }
      }
      const nodes: ReactNode[] = [];
      for (const key of order) {
        const bucket = buckets.get(key);
        if (bucket === undefined) continue;
        const isCollapsed = treeExpandedSet.has(`group:collapse:${key}`);
        nodes.push(
          <tr key={`group:${key}`} className="group-row">
            <td colSpan={colSpan}>
              <button
                type="button"
                className="twirl"
                aria-label={
                  isCollapsed
                    ? t("table.expandRow")
                    : t("table.collapseRow")
                }
                aria-expanded={!isCollapsed}
                onClick={() => toggleTreeNode(`group:collapse:${key}`)}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                  font: "inherit",
                  color: "inherit",
                }}
              >
                {isCollapsed ? "▶" : "▼"}
              </button>{" "}
              {bucket.descriptor.label}
              {bucket.descriptor.count !== undefined && (
                <span className="gcount">{bucket.descriptor.count}</span>
              )}
              {bucket.descriptor.total !== undefined && (
                <span className="gtotal">{bucket.descriptor.total}</span>
              )}
            </td>
          </tr>,
        );
        if (!isCollapsed) {
          for (const row of bucket.rows) {
            nodes.push(renderDataRow(row));
          }
        }
      }
      return nodes;
    }
    return rows.map((row) => renderDataRow(row));
  }

  return (
    <div
      className={cn("table-stack", containerClassName)}
      data-density={density}
    >
      <div className="table-scroll">
        <table
          data-density={density}
          data-sticky-header={stickyHeader ? "true" : undefined}
          className={cn("table", className)}
          {...rest}
        >
          {caption !== undefined && <caption>{caption}</caption>}
          <thead data-sticky={stickyHeader ? "true" : undefined}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {selection !== undefined && (
                  <th className="check">
                    <Checkbox
                      aria-label={t("table.selectAllRows")}
                      checked={allVisibleSelected}
                      onCheckedChange={selectAllVisible}
                    />
                  </th>
                )}
                {expandable !== undefined && (
                  <th className="expand-col" style={{ width: 32 }} />
                )}
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const columnKey = getColumnKey(header.column.columnDef);
                  const isSortable =
                    meta?.sortable === true &&
                    columnKey !== undefined &&
                    onSortChange !== undefined;
                  const sortEntry =
                    columnKey !== undefined
                      ? findSortEntry(sort, columnKey)
                      : undefined;
                  const sortedDirection = sortEntry?.entry.direction;
                  const multiSortIndex =
                    sortEntry !== undefined && sortEntry.list.length > 1
                      ? sortEntry.index + 1
                      : undefined;
                  const headerContent = header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      );
                  const canResize =
                    resizable === true && header.column.getCanResize();
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        meta?.className,
                        meta?.headerClassName,
                        header.column.getIsPinned() &&
                          `table-pinned-${header.column.getIsPinned()}`,
                        isSortable && "sortable",
                        canResize && "has-resize",
                      )}
                      style={getColumnStyle(header.column, {
                        ...meta?.style,
                        ...meta?.headerStyle,
                      })}
                      aria-sort={
                        sortedDirection === "asc"
                          ? "ascending"
                          : sortedDirection === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {isSortable && columnKey !== undefined ? (
                        <button
                          type="button"
                          className="table-sort-button"
                          onClick={(event) => {
                            const next = event.shiftKey
                              ? nextMultiSort(sort, columnKey)
                              : nextSingleSort(sort, columnKey);
                            onSortChange(next);
                          }}
                        >
                          {headerContent}
                          <span className="sort" aria-hidden>
                            <span
                              className={
                                sortedDirection === "asc" ? "a on" : "a"
                              }
                            >
                              ▲
                            </span>
                            <span
                              className={
                                sortedDirection === "desc" ? "d on" : "d"
                              }
                            >
                              ▼
                            </span>
                          </span>
                          {multiSortIndex !== undefined && (
                            <span className="multi" aria-hidden>
                              {multiSortIndex}
                            </span>
                          )}
                        </button>
                      ) : (
                        headerContent
                      )}
                      {canResize && (
                        <button
                          type="button"
                          aria-label={t("table.resizeColumn") || "Resize column"}
                          className="resize"
                          data-resizing={
                            header.column.getIsResizing() ? "true" : undefined
                          }
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onDoubleClick={() => header.column.resetSize()}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>{renderBodyRows()}</tbody>
          {hasFooter && (
            <tfoot>
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((footer) => {
                    const meta = footer.column.columnDef.meta;
                    return (
                      <td
                        key={footer.id}
                        colSpan={footer.colSpan}
                        className={cn(meta?.className)}
                        style={{ ...meta?.style }}
                      >
                        {footer.isPlaceholder
                          ? null
                          : flexRender(
                              footer.column.columnDef.footer,
                              footer.getContext(),
                            )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>
      {footer !== undefined && <div className="tbl-footer">{footer}</div>}
      {editing !== undefined && dirtyRowSet.size > 0 && (
        <div className="tbl-footer" data-state="dirty">
          <span className="tbl-footer-icon" aria-hidden>
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx={12} cy={12} r={10} />
              <line x1={12} y1={8} x2={12} y2={12} />
              <line x1={12} y1={16} x2={12.01} y2={16} />
            </svg>
          </span>
          <span>
            {editing.unsavedLabel?.(dirtyRowSet.size) ??
              t("table.unsavedChanges", { count: dirtyRowSet.size })}
          </span>
          <span className="spacer" />
          {editing.onCancelAll !== undefined && (
            <Button
              size="x-small"
              variant="ghost"
              onClick={editing.onCancelAll}
            >
              {editing.cancelAllLabel ?? t("table.cancelAll")}
            </Button>
          )}
          {editing.onSaveAll !== undefined && (
            <Button size="x-small" onClick={editing.onSaveAll}>
              {editing.saveAllLabel ?? t("table.saveAll")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
