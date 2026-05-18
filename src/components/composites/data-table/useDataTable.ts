import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnPinningState,
  type Table as ReactTable,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";
import { matchBreakpoint, useBreakpoint } from "../../../hooks/useBreakpoint";
import type { Breakpoint } from "../../layout/Row";
import {
  MAX_PERSISTED_TABLE_VIEWS,
  readPersistedColumnPinning,
  readPersistedColumnVisibility,
  readPersistedTableViews,
  writePersistedColumnPinning,
  writePersistedColumnVisibility,
  writePersistedTableViews,
} from "../../data-display/Table.persistence";
import type {
  TableBatchActionsConfig,
  TableColumn,
  TableColumnPinningChange,
  TableColumnVisibility,
  TableDensity,
  TableEditingConfig,
  TableExpandableConfig,
  TableFilter,
  TableFilterBar,
  TableGroupBy,
  TablePagination,
  TableRowKey,
  TableSortState,
  TableStickyConfig,
  TableStickySide,
  TableToolbar,
  TableTreeConfig,
  TableViewItem,
  TableViews,
  TableViewSnapshot,
} from "../../data-display/Table.types";
import type { UseTablePaginationResult } from "../../../hooks/useTablePagination";
import type { UseTableSelectionResult } from "../../../hooks/useTableSelection";
import type { UseTableViewsResult } from "../../../hooks/useTableViews";

export interface UseDataTableOptions<TData> {
  data: TData[];
  columns: TableColumn<TData, unknown>[];
  rowKey?: TableRowKey<TData>;
  getRowId?: (row: TData, index: number) => string;

  selection?: UseTableSelectionResult;
  batchActions?:
    | ReactNode
    | TableBatchActionsConfig<TData>
    | {
        actions: TableBatchActionsConfig<TData>["actions"];
        getCheckboxDisabled?: TableBatchActionsConfig<
          TData
        >["getCheckboxDisabled"];
        selectedLabel?: TableBatchActionsConfig<TData>["selectedLabel"];
        selectAllLabel?: TableBatchActionsConfig<TData>["selectAllLabel"];
        clearLabel?: TableBatchActionsConfig<TData>["clearLabel"];
      };

  pagination?: UseTablePaginationResult;
  total?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  /** Direct pagination config — bypasses the `UseTablePaginationResult` slice. */
  paginationConfig?: TablePagination;

  views?: UseTableViewsResult;
  onViewApply?: (view: TableViewItem) => void;

  filters?: TableFilter[];
  onFiltersChange?: (filters: TableFilter[]) => void;
  filterBar?: TableFilterBar;
  onResetFilters?: () => void;

  sort?: TableSortState;
  onSortChange?: (sort: TableSortState) => void;
  resizable?: boolean;

  columnVisibility?: TableColumnVisibility;
  defaultColumnVisibility?: TableColumnVisibility;
  onColumnVisibilityChange?: (columnVisibility: TableColumnVisibility) => void;
  onColumnPinningChange?: TableColumnPinningChange;

  toolbar?: TableToolbar;

  expandable?: TableExpandableConfig<TData>;
  tree?: TableTreeConfig<TData>;
  editing?: TableEditingConfig<TData>;
  groupBy?: TableGroupBy<TData>;

  density?: TableDensity;
  stickyHeader?: boolean;
  rowClassName?: string | ((row: { original: TData }) => string | undefined);
  caption?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  tableKey?: string;
  containerClassName?: string;
  className?: string;
}

// ── Helpers (private; mirror primitive internals while Stage 4b lands) ──

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(previous)
    : updater;
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

function normalizeFilters(filters: TableFilter[] | undefined) {
  return (filters ?? [])
    .map((filter) => ({
      key: filter.key,
      operator: filter.operator ?? "eq",
      value: filter.value ?? null,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

function normalizeVisibility(columnVisibility: TableColumnVisibility | undefined) {
  return Object.fromEntries(
    Object.entries(columnVisibility ?? {}).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
}

function sameViewSnapshot(
  view: TableViewItem,
  snapshot: TableViewSnapshot,
) {
  return (
    JSON.stringify(normalizeFilters(view.filters)) ===
      JSON.stringify(normalizeFilters(snapshot.filters)) &&
    JSON.stringify(view.sort ?? null) === JSON.stringify(snapshot.sort ?? null) &&
    JSON.stringify(normalizeVisibility(view.columnVisibility)) ===
      JSON.stringify(normalizeVisibility(snapshot.columnVisibility))
  );
}

function buildBatchActions<TData>(
  selection: UseTableSelectionResult | undefined,
  batchActions: UseDataTableOptions<TData>["batchActions"],
): ReactNode | TableBatchActionsConfig<TData> | undefined {
  if (batchActions === undefined) return undefined;
  if (
    batchActions !== null &&
    typeof batchActions === "object" &&
    !Array.isArray(batchActions) &&
    "selectedRowKeys" in batchActions
  ) {
    return batchActions as TableBatchActionsConfig<TData>;
  }
  if (selection === undefined) return batchActions as ReactNode;
  if (
    batchActions !== null &&
    typeof batchActions === "object" &&
    !Array.isArray(batchActions) &&
    "actions" in batchActions
  ) {
    const partial = batchActions as Extract<
      UseDataTableOptions<TData>["batchActions"],
      { actions: unknown }
    >;
    return {
      selectedRowKeys: selection.selectedRowKeys,
      onSelectedRowKeysChange: selection.setSelectedRowKeys,
      actions: partial.actions,
      getCheckboxDisabled: partial.getCheckboxDisabled,
      selectedLabel: partial.selectedLabel,
      selectAllLabel: partial.selectAllLabel,
      clearLabel: partial.clearLabel,
    };
  }
  return {
    selectedRowKeys: selection.selectedRowKeys,
    onSelectedRowKeysChange: selection.setSelectedRowKeys,
    actions: batchActions as ReactNode,
  };
}

function buildViewsConfig(
  views: UseTableViewsResult | undefined,
  onViewApply: UseDataTableOptions<unknown>["onViewApply"],
): import("../../data-display/Table.types").TableViewsConfig | undefined {
  if (views === undefined) return undefined;
  return {
    items: views.items,
    activeKey: views.activeKey,
    onActiveKeyChange: views.setActiveKey,
    onViewApply: (view) => {
      views.applyView(view);
      onViewApply?.(view);
    },
    onDeleteView: (view) => views.deleteView(view.key),
  };
}

// ── Public surface ────────────────────────────────────────────────

export interface DataTableInstance<TData> {
  /** Resolved props ready to spread on `<Table>` — already strips chrome. */
  tableProps: {
    columns: TableColumn<TData, unknown>[];
    data: TData[];
    rowKey?: TableRowKey<TData>;
    getRowId?: (row: TData, index: number) => string;
    density?: TableDensity;
    stickyHeader?: boolean;
    resizable?: boolean;
    caption?: ReactNode;
    footer?: ReactNode;
    empty?: ReactNode;
    tableKey?: string;
    containerClassName?: string;
    className?: string;
    rowClassName?:
      | string
      | ((row: { original: TData }) => string | undefined);
    sort?: TableSortState;
    onSortChange?: (sort: TableSortState) => void;
    expandable?: TableExpandableConfig<TData>;
    tree?: TableTreeConfig<TData>;
    editing?: TableEditingConfig<TData>;
    groupBy?: TableGroupBy<TData>;
  };
  /** TanStack instance built by the hook (Stage 4b — hoisted from the primitive). */
  instance: ReactTable<TData>;
  /** Chrome config — consumed by `<DataTable>`'s renderers, not by the primitive. */
  chromeProps: {
    views: TableViews | undefined;
    toolbar: TableToolbar | undefined;
    batchActions: ReactNode | TableBatchActionsConfig<TData> | undefined;
    filterBar: TableFilterBar | undefined;
    filters: TableFilter[] | undefined;
    onFiltersChange: ((filters: TableFilter[]) => void) | undefined;
    onResetFilters: (() => void) | undefined;
    pagination: TablePagination | undefined;
    columnVisibility: TableColumnVisibility;
    columnPinning: ColumnPinningState;
    autoColumnPinning: ColumnPinningState;
    setColumnPinning: (pinning: ColumnPinningState) => void;
    setColumnVisibility: (visibility: TableColumnVisibility) => void;
    currentViewSnapshot: TableViewSnapshot;
    duplicateView: TableViewItem | undefined;
    savedViews: TableViewItem[];
    setSavedViews: (views: TableViewItem[]) => void;
    saveViewDefaultName: (count: number) => string;
  };
  /** Slice references (so consumer hooks remain visible). */
  selection: UseTableSelectionResult | undefined;
  pagination: UseTablePaginationResult | undefined;
  views: UseTableViewsResult | undefined;
}

/**
 * useDataTable — composite-level state + TanStack instance builder.
 *
 * Stage 4b of the Table refactor (Plan §3). The TanStack instance and
 * the chrome-related state (column visibility, column pinning, saved
 * views) live here on the composite side; `<DataTable>` renders the
 * chrome around the slim `<Table>` primitive.
 */
export function useDataTable<TData>(
  options: UseDataTableOptions<TData>,
): DataTableInstance<TData> {
  const {
    selection,
    pagination,
    total,
    pageSizeOptions,
    showSizeChanger,
    showTotal,
    paginationConfig,
    views,
    onViewApply,
    batchActions,
    columns,
    data,
    rowKey = "id" as TableRowKey<TData>,
    getRowId,
    columnVisibility: controlledColumnVisibility,
    defaultColumnVisibility,
    onColumnVisibilityChange,
    onColumnPinningChange,
    sort,
    onSortChange,
    resizable,
    expandable,
    editing,
    groupBy,
    tree,
    filterBar,
    filters,
    onFiltersChange,
    onResetFilters,
    toolbar,
    footer,
    empty,
    rowClassName,
    density,
    stickyHeader,
    caption,
    tableKey,
    containerClassName,
    className,
  } = options;

  // ── Column visibility ────────────────────────────────────────────
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<TableColumnVisibility>(
      () =>
        controlledColumnVisibility ??
        readPersistedColumnVisibility(tableKey, columns) ??
        defaultColumnVisibility ??
        {},
    );
  const effectiveColumnVisibility =
    controlledColumnVisibility ?? internalColumnVisibility;

  // ── Column pinning (auto + user) ─────────────────────────────────
  const bp = useBreakpoint();
  const autoColumnPinning = useMemo(
    () => deriveColumnPinning(columns, bp),
    [columns, bp],
  );
  const [userColumnPinning, setUserColumnPinning] =
    useState<ColumnPinningState>(
      () =>
        readPersistedColumnPinning(tableKey, columns) ?? {
          left: [],
          right: [],
        },
    );
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

  // ── Saved views (persisted) ─────────────────────────────────────
  const [internalSavedViews, setInternalSavedViews] = useState<TableViewItem[]>(
    () => readPersistedTableViews(tableKey, columns),
  );

  // Persistence effects
  useEffect(() => {
    writePersistedColumnVisibility(tableKey, columns, effectiveColumnVisibility);
  }, [columns, effectiveColumnVisibility, tableKey]);
  useEffect(() => {
    writePersistedColumnPinning(tableKey, columns, userColumnPinning);
  }, [columns, userColumnPinning, tableKey]);
  useEffect(() => {
    writePersistedTableViews(tableKey, columns, internalSavedViews);
  }, [columns, internalSavedViews, tableKey]);

  // ── TanStack instance (hoisted from the primitive) ──────────────
  const warnedRowKeys = useRef(new Set<string>());
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
    if (controlledColumnVisibility === undefined) setInternalColumnVisibility(next);
    onColumnVisibilityChange?.(next);
  };
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

  const tableState = useMemo(
    () => ({ columnPinning, columnVisibility: effectiveColumnVisibility }),
    [columnPinning, effectiveColumnVisibility],
  );
  const instance = useReactTable({
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

  // ── Pagination ──────────────────────────────────────────────────
  const paginationProp: TablePagination | undefined = paginationConfig
    ? paginationConfig
    : pagination
      ? {
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: total ?? data.length,
          pageSizeOptions,
          showSizeChanger,
          showTotal,
          onChange: pagination.onChange,
        }
      : undefined;

  // ── Views snapshot + duplicate detection ────────────────────────
  const currentViewSnapshot: TableViewSnapshot = {
    filters: filters ?? [],
    sort: Array.isArray(sort) ? (sort[0] ?? null) : (sort ?? null),
    columnVisibility: effectiveColumnVisibility,
  };
  const builtInViewsConfig = buildViewsConfig(views, onViewApply);
  const viewItems = builtInViewsConfig
    ? [...(views?.items ?? []), ...internalSavedViews]
    : [];
  const duplicateView = viewItems.find((view) =>
    sameViewSnapshot(view, currentViewSnapshot),
  );

  const setSavedViews = (next: TableViewItem[]) => {
    const trimmed = next.slice(-MAX_PERSISTED_TABLE_VIEWS);
    setInternalSavedViews(trimmed);
    builtInViewsConfig?.onItemsChange?.([...(views?.items ?? []), ...trimmed]);
  };

  return {
    tableProps: {
      columns,
      data,
      rowKey,
      getRowId,
      density,
      stickyHeader,
      resizable,
      caption,
      footer,
      empty,
      tableKey,
      containerClassName,
      className,
      rowClassName,
      sort,
      onSortChange,
      expandable,
      tree,
      editing,
      groupBy,
    },
    instance,
    chromeProps: {
      views: builtInViewsConfig,
      toolbar,
      batchActions: buildBatchActions(selection, batchActions),
      filterBar,
      filters,
      onFiltersChange,
      onResetFilters,
      pagination: paginationProp,
      columnVisibility: effectiveColumnVisibility,
      columnPinning,
      autoColumnPinning,
      setColumnPinning: handleColumnPinningChange,
      setColumnVisibility: handleColumnVisibilityChange,
      currentViewSnapshot,
      duplicateView,
      savedViews: internalSavedViews,
      setSavedViews,
      saveViewDefaultName: (count: number) =>
        `View ${internalSavedViews.length + count}`,
    },
    selection,
    pagination,
    views,
  };
}
