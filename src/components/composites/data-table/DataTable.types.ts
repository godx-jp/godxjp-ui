/**
 * @godxjp/ui DataTable — composite type surface.
 *
 * Stage 4b of the Table refactor (Plan §3). The chrome (view tabs +
 * toolbar + filter bar + batch action band + pagination + column
 * manager Sheet + save-view Dialog) is rendered by the composite,
 * not the primitive. These types describe the composite's external
 * prop surface and the slot-override shape; the underlying
 * `<Table>` primitive props remain in `data-display/Table.types`.
 */
import type { ReactNode } from "react";
import type { RowData } from "@tanstack/react-table";
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
  TableFilterOption,
  TableGroupBy,
  TablePagination,
  TableRowKey,
  TableSortState,
  TableToolbar,
  TableToolbarConfig,
  TableTreeConfig,
  TableViewItem,
  TableViews,
} from "../../data-display/Table.types";
import type { UseTablePaginationResult } from "../../../hooks/useTablePagination";
import type { UseTableSelectionResult } from "../../../hooks/useTableSelection";
import type { UseTableViewsResult } from "../../../hooks/useTableViews";

/**
 * Composite-only `ColumnMeta` extension. The `<Table>` primitive
 * does not render filter UI or the column manager — these fields
 * are consumed exclusively by `<DataTable>`'s chrome
 * (`DataTableChrome` filter chip bar + `ColumnManagerSheet`).
 *
 * Augmentation merges with the primitive declaration in
 * `data-display/Table.types.ts` whenever this module is in the
 * TypeScript program (i.e. as soon as a consumer imports anything
 * from `@godxjp/ui/components/composites`).
 */
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterable?: boolean;
    filterLabel?: ReactNode;
    filterOptions?: TableFilterOption[];
    hideable?: boolean;
  }
}

/**
 * Selection slice the slim primitive understands — strictly the
 * checkbox column wiring. The chrome batch-action band lives on the
 * composite (`<DataTable>`).
 */
export interface DataTableSelection<TData = unknown> {
  selectedRowKeys: string[];
  onSelectedRowKeysChange: (keys: string[]) => void;
  getCheckboxDisabled?: TableBatchActionsConfig<TData>["getCheckboxDisabled"];
}

/** Replaceable regions of the composite's rendered tree. */
export interface DataTableSlots {
  /** Override the toolbar entirely — replaces the default rendering. */
  toolbar?: ReactNode;
  /** Toolbar primary action (＋ 新規 / Create new). */
  primaryAction?: TableToolbarConfig["primaryAction"];
  /** Extra toolbar nodes appended after `primaryAction` / columns button. */
  toolbarActions?: TableToolbarConfig["actions"];
  /** Footer content rendered below the body (above pagination). */
  footer?: ReactNode;
  /** Empty-state override — replaces the default `<Empty>` primitive. */
  emptyState?: ReactNode;
}

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
  /**
   * Direct pagination config — bypasses the `UseTablePaginationResult`
   * slice when a richer variant (load-more / cursor) is needed.
   */
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
  /** Persistence prefix (forwarded for backward-compat). Stage 5 will remove. */
  tableKey?: string;
  containerClassName?: string;
  className?: string;
}

/** Composite `<DataTable>` prop surface. */
export interface DataTableProps<TData> {
  /** Table instance from `useDataTable`. */
  table: import("./useDataTable").DataTableInstance<TData>;
  /** Replaceable regions of the rendered tree. */
  slots?: DataTableSlots;
  /** Forwarded to the outer `<table>` className. */
  className?: string;
  /** Forwarded to the `.table-stack` wrapper className. */
  containerClassName?: string;
}
