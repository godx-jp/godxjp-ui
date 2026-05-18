import { type ReactNode } from "react";
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
  TableRowKey,
  TableSortState,
  TableToolbar,
  TableTreeConfig,
  TableViewItem,
  TableViews,
} from "../../data-display/Table";
import type { UseTablePaginationResult } from "../../../hooks/useTablePagination";
import type { UseTableSelectionResult } from "../../../hooks/useTableSelection";
import type { UseTableViewsResult } from "../../../hooks/useTableViews";

/**
 * Options accepted by `useDataTable`. Mirrors `<Table>` props, but
 * lifts pagination / selection / views into hook slices so consumers
 * compose state ergonomically.
 */
export interface UseDataTableOptions<TData> {
  data: TData[];
  columns: TableColumn<TData, unknown>[];
  rowKey?: TableRowKey<TData>;
  getRowId?: (row: TData, index: number) => string;

  /** Selection slice (from `useTableSelection`). Wires into `batchActions`. */
  selection?: UseTableSelectionResult;
  /** Batch actions JSX or config. If `selection` is set, this can be a node-only payload. */
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

  /** Pagination slice (from `useTablePagination`). Wires into `pagination`. */
  pagination?: UseTablePaginationResult;
  /** Total row count for pagination. Defaults to `data.length` when omitted. */
  total?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showTotal?: (total: number, range: [number, number]) => ReactNode;

  /** Saved-views slice (from `useTableViews`). Wires into `views`. */
  views?: UseTableViewsResult;
  /** Apply view callback — typically setFilters + setSort + setColumnVisibility from snapshot. */
  onViewApply?: (view: TableViewItem) => void;

  /** Controlled filters state. */
  filters?: TableFilter[];
  onFiltersChange?: (filters: TableFilter[]) => void;
  filterBar?: TableFilterBar;
  onResetFilters?: () => void;

  /** Controlled sort state. */
  sort?: TableSortState;
  onSortChange?: (sort: TableSortState) => void;
  resizable?: boolean;

  /** Controlled column visibility. */
  columnVisibility?: TableColumnVisibility;
  defaultColumnVisibility?: TableColumnVisibility;
  onColumnVisibilityChange?: (columnVisibility: TableColumnVisibility) => void;
  onColumnPinningChange?: TableColumnPinningChange;

  /** Toolbar slot — pass false to suppress, a config for typed defaults, or any ReactNode. */
  toolbar?: TableToolbar;

  /** Expand / tree / editing / grouping — forwarded verbatim. */
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
  /** Persistence prefix forwarded to `<Table tableKey>`. */
  tableKey?: string;
  /** Outer `.table-stack` wrapper className. */
  containerClassName?: string;
  className?: string;
}

/**
 * Normalised "table instance" — what `useDataTable` returns and
 * `<DataTable>` consumes. Slot consumers can also destructure for
 * partial composition.
 */
export interface DataTableInstance<TData> {
  /** Resolved Table props ready to spread. */
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
    views?: TableViews;
    toolbar?: TableToolbar;
    batchActions?: ReactNode | TableBatchActionsConfig<TData>;
    filters?: TableFilter[];
    onFiltersChange?: (filters: TableFilter[]) => void;
    filterBar?: TableFilterBar;
    onResetFilters?: () => void;
    sort?: TableSortState;
    onSortChange?: (sort: TableSortState) => void;
    columnVisibility?: TableColumnVisibility;
    defaultColumnVisibility?: TableColumnVisibility;
    onColumnVisibilityChange?: (
      columnVisibility: TableColumnVisibility,
    ) => void;
    onColumnPinningChange?: TableColumnPinningChange;
    pagination?: {
      current: number;
      pageSize: number;
      total: number;
      pageSizeOptions?: number[];
      showSizeChanger?: boolean;
      showTotal?: (total: number, range: [number, number]) => ReactNode;
      onChange?: (page: number, pageSize: number) => void;
    };
    expandable?: TableExpandableConfig<TData>;
    tree?: TableTreeConfig<TData>;
    editing?: TableEditingConfig<TData>;
    groupBy?: TableGroupBy<TData>;
  };
  /** Slice references (so consumer hooks remain visible). */
  selection: UseTableSelectionResult | undefined;
  pagination: UseTablePaginationResult | undefined;
  views: UseTableViewsResult | undefined;
}

function buildBatchActions<TData>(
  selection: UseTableSelectionResult | undefined,
  batchActions: UseDataTableOptions<TData>["batchActions"],
): ReactNode | TableBatchActionsConfig<TData> | undefined {
  if (batchActions === undefined) return undefined;
  // Already a full config?
  if (
    batchActions !== null &&
    typeof batchActions === "object" &&
    !Array.isArray(batchActions) &&
    "selectedRowKeys" in batchActions
  ) {
    return batchActions as TableBatchActionsConfig<TData>;
  }
  // Selection slice + node/partial config — wire the slice.
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
  // Bare ReactNode actions — wrap into a minimal config.
  return {
    selectedRowKeys: selection.selectedRowKeys,
    onSelectedRowKeysChange: selection.setSelectedRowKeys,
    actions: batchActions as ReactNode,
  };
}

function buildViewsConfig(
  views: UseTableViewsResult | undefined,
  onViewApply: UseDataTableOptions<unknown>["onViewApply"],
): TableViews | undefined {
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

/**
 * useDataTable — composite-level config builder.
 *
 * Threads `useTablePagination` / `useTableSelection` / `useTableViews`
 * slices into the prop bag expected by `<DataTable>` (and ultimately
 * by `<Table>`). Returns a typed `instance` you spread into the
 * composite.
 *
 * @example
 *   const pagination = useTablePagination({ defaultPageSize: 20 });
 *   const selection  = useTableSelection({ defaultSelected: [] });
 *   const views      = useTableViews({ items: BUILT_IN_VIEWS });
 *
 *   const table = useDataTable({
 *     data: rows, columns, rowKey: "id",
 *     pagination, selection, views,
 *     total: matched.length,
 *     filters, onFiltersChange,
 *     sort,    onSortChange,
 *   });
 *
 *   <DataTable table={table} slots={{ primaryAction: <Button>＋ 新規</Button> }} />
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
    views,
    onViewApply,
    batchActions,
    ...rest
  } = options;

  const paginationProp = pagination
    ? {
        current: pagination.page,
        pageSize: pagination.pageSize,
        total: total ?? rest.data.length,
        pageSizeOptions,
        showSizeChanger,
        showTotal,
        onChange: pagination.onChange,
      }
    : undefined;

  return {
    tableProps: {
      ...rest,
      pagination: paginationProp,
      batchActions: buildBatchActions(selection, batchActions),
      views: buildViewsConfig(views, onViewApply),
    },
    selection,
    pagination,
    views,
  };
}
