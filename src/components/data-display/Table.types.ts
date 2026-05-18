/**
 * @godxjp/ui Table — type surface.
 *
 * Split out of `Table.tsx` in Stage 4 of the refactor (Plan §3) so
 * the primitive file focuses on rendering + state, while consumers
 * and the `<DataTable>` composite consume a focused type module.
 *
 * Also hosts the TanStack `ColumnMeta` augmentation — every consumer
 * that touches a `meta` field benefits from the typed interface.
 */
import type {
  ColumnDef,
  ColumnPinningState,
  Row,
  RowData,
  Table as ReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  Ref,
} from "react";
import type { Breakpoint } from "../layout/Row";
import type { TagPresetColor } from "./Tag";

export type TableStickySide = "left" | "right";
export type TableStickyConfig =
  | TableStickySide
  | false
  | { side: TableStickySide; from?: Breakpoint };

declare module "@tanstack/react-table" {
  /**
   * Primitive-level `ColumnMeta` — fields consumed by the `<Table>`
   * primitive itself: cell rendering, sort UI in headers, sticky
   * positioning.
   *
   * Composite-only fields (`filterable`, `filterLabel`,
   * `filterOptions`, `hideable`) live in
   * `composites/data-table/DataTable.types.ts` and are merged into
   * `ColumnMeta` whenever a consumer imports from
   * `@godxjp/ui/components/composites`.
   */
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
    headerClassName?: string;
    cellClassName?: string | ((row: Row<TData>) => string | undefined);
    style?: CSSProperties;
    headerStyle?: CSSProperties;
    cellStyle?:
      | CSSProperties
      | ((row: Row<TData>) => CSSProperties | undefined);
    sortable?: boolean;
    sticky?: TableStickyConfig;
  }
}

// Aliased to the shared `DensityProp` so adding a new density value
// (today: `"comfortable"`) lights up across the framework. The Table
// CSS already had the `compact` rule and the `default` baseline; the
// new `comfortable` class is defined in `40-table.css`.
import type { DensityProp } from "../../props";
export type TableDensity = DensityProp;
export type TableColumn<TData, TValue = unknown> = ColumnDef<TData, TValue>;
export type TableColumnVisibility = VisibilityState;
export type TableRowKey<TData> =
  | Extract<keyof TData, string>
  | ((row: TData, index: number) => string | number);
export type TableFilterOperator =
  | "eq"
  | "neq"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in";

export interface TableFilter {
  key: string;
  operator?: TableFilterOperator;
  value?: string | number | boolean | null;
  valueLabel?: ReactNode;
}

export interface TableSort {
  key: string;
  direction: "asc" | "desc";
}

/** Multi-sort: ordered list whose head is the primary key. */
export type TableSortState = TableSort | TableSort[] | null;

/** Numbered pagination (default behaviour for general lists). */
export interface TablePaginationNumberedConfig {
  type?: "numbered";
  current: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  hideOnSinglePage?: boolean;
  disabled?: boolean;
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  onChange?: (page: number, pageSize: number) => void;
}

/** Back-compat alias — numbered pagination is the legacy config. */
export type TablePaginationConfig = TablePaginationNumberedConfig;

/** Load-more pagination (feed-like activity / notification lists). */
export interface TablePaginationLoadMoreConfig {
  type: "load-more";
  hasMore: boolean;
  onLoadMore: () => void;
  currentCount: number;
  total: number;
  batchSize?: number;
  loadingMore?: boolean;
  loadMoreLabel?: ReactNode;
  progressLabel?: (currentCount: number, total: number) => ReactNode;
}

/** Cursor pagination (time-series jump-to-period for kintai / payroll). */
export interface TablePaginationCursorConfig {
  type: "cursor";
  value: string;
  onChange: (value: string) => void;
  label: ReactNode;
  prevLabel?: ReactNode;
  nextLabel?: ReactNode;
  jumpToLatestLabel?: ReactNode;
  /** HTML input type — `"month"` (default), `"date"`, or `"week"`. */
  inputType?: "month" | "date" | "week";
  onPrev?: () => void;
  onNext?: () => void;
  onJumpToLatest?: () => void;
  disabled?: boolean;
}

export type TablePaginationVariantConfig =
  | TablePaginationNumberedConfig
  | TablePaginationLoadMoreConfig
  | TablePaginationCursorConfig;

export interface TableViewSnapshot {
  filters?: TableFilter[];
  sort?: TableSort | null;
  columnVisibility?: TableColumnVisibility;
}

export interface TableViewItem extends TableViewSnapshot {
  key: string;
  label: ReactNode;
  count?: ReactNode;
  dotColor?: string;
  disabled?: boolean;
  deletable?: boolean;
}

export interface TableViewsConfig {
  items: TableViewItem[];
  activeKey?: string;
  onActiveKeyChange?: (key: string) => void;
  onViewApply?: (view: TableViewItem) => void;
  onDeleteView?: (view: TableViewItem) => void;
  onItemsChange?: (items: TableViewItem[]) => void;
  saveable?: boolean;
  saveLabel?: ReactNode;
  deleteLabel?: string;
  onSaveCurrent?: () => void;
}

export interface TableToolbarSearchConfig {
  value: string;
  onValueChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  inputRef?: Ref<HTMLInputElement>;
  suffix?: ReactNode;
  disabled?: boolean;
}

export interface TableToolbarButtonConfig {
  label?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface TableToolbarFilterConfig extends TableToolbarButtonConfig {
  count?: number;
}

export type TableToolbarColumnConfig = TableToolbarButtonConfig;

export interface TableToolbarConfig {
  search?: false | TableToolbarSearchConfig;
  filter?: false | TableToolbarFilterConfig;
  columns?: false | TableToolbarColumnConfig;
  primaryAction?: false | ReactNode | TableToolbarButtonConfig;
  actions?: ReactNode;
}

export interface TableBatchActionsContext<TData> {
  selectedRowKeys: string[];
  selectedRows: Row<TData>[];
  totalSelectableCount: number;
  selectAllVisible: () => void;
  clearSelection: () => void;
}

export interface TableBatchActionsConfig<TData> {
  selectedRowKeys: string[];
  onSelectedRowKeysChange: (keys: string[]) => void;
  actions:
    | ReactNode
    | ((context: TableBatchActionsContext<TData>) => ReactNode);
  getCheckboxDisabled?: (row: Row<TData>) => boolean;
  selectedLabel?: (count: number) => ReactNode;
  selectAllLabel?: (count: number) => ReactNode;
  clearLabel?: ReactNode;
}

export interface TableFilterOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface TableFilterItem {
  key: string;
  label: ReactNode;
  value?: string;
  valueLabel?: ReactNode;
  operator?: TableFilterOperator;
  options?: TableFilterOption[];
  onValueChange?: (value: string) => void;
  color?: TagPresetColor | string;
  closable?: boolean;
  onClose?: () => void;
}

export type TableFilterBar = ReactNode | TableFilterItem[];
export type TablePagination =
  | ReactNode
  | false
  | TablePaginationVariantConfig;
export type TableToolbar = ReactNode | false | TableToolbarConfig;
export type TableViews = ReactNode | false | TableViewsConfig;
export type TableBatchActions<TData> =
  | ReactNode
  | false
  | TableBatchActionsConfig<TData>;

/** Expand-row config (rule 32 — no `expanded`-singular / `expand` synonyms). */
export interface TableExpandableConfig<TData> {
  /** Rows whose expand panel is open. */
  expandedRowKeys?: string[];
  defaultExpandedRowKeys?: string[];
  onExpandedRowsChange?: (keys: string[]) => void;
  /** Renders the inline detail panel. */
  renderExpandedRow: (row: Row<TData>) => ReactNode;
  /** Allows more than one open expand panel at a time. Default `false`. */
  allowMultiple?: boolean;
  /** Hide the expand toggle for rows that have no detail panel. */
  rowExpandable?: (row: Row<TData>) => boolean;
}

/** Inline-edit config — single editing row, multi-row dirty tracking. */
export interface TableEditingConfig<TData> {
  /** The row currently in editing mode. `null` exits editing. */
  rowId: string | null;
  onStart?: (rowId: string) => void;
  onCommit?: (rowId: string, patch: Record<string, unknown>) => void;
  onCancel?: (rowId: string) => void;
  /** Renders an inline editor for a cell. Return `null` to fall back to the column's normal cell. */
  renderEditCell?: (
    column: TableColumn<TData, unknown>,
    row: Row<TData>,
  ) => ReactNode;
  /** Rows that should be read-only (confirmed records / locked rows). */
  isRowReadOnly?: (row: Row<TData>) => boolean;
  /** Row + cell ids that carry unsaved changes — for the warning dot + footer banner. */
  dirtyRowIds?: string[];
  dirtyCellIds?: string[];
  /** Footer banner — show "N rows unsaved" + Save-all / Cancel-all controls. */
  onSaveAll?: () => void;
  onCancelAll?: () => void;
  saveAllLabel?: ReactNode;
  cancelAllLabel?: ReactNode;
  unsavedLabel?: (count: number) => ReactNode;
}

/** Row-group config — either a key resolver or a richer descriptor. */
export interface TableGroupDescriptor {
  key: string;
  label: ReactNode;
  count?: ReactNode;
  total?: ReactNode;
}
export type TableGroupBy<TData> = (
  row: TData,
) => string | TableGroupDescriptor | undefined;

/** Tree-row config. Children are resolved per parent row. */
export interface TableTreeConfig<TData> {
  children: (row: TData) => TData[] | undefined;
  defaultExpandedNodes?: string[];
  expandedNodes?: string[];
  onExpandedNodesChange?: (keys: string[]) => void;
  /** Hard cap on nesting depth (defaults to a reasonable 8). */
  maxDepth?: number;
}

/** Column-pinning callback (TanStack-canonical name). */
export type TableColumnPinningChange = (
  pinning: ColumnPinningState,
) => void;

/**
 * Selection slice the slim primitive understands — strictly the
 * checkbox column wiring. The batch action band that surfaces
 * actions lives on the `<DataTable>` composite (Stage 4b, v5.0.0).
 */
export interface TableSelectionConfig<TData> {
  selectedRowKeys: string[];
  onSelectedRowKeysChange: (keys: string[]) => void;
  getCheckboxDisabled?: (row: Row<TData>) => boolean;
}

export interface TableProps<TData>
  extends Omit<HTMLAttributes<HTMLTableElement>, "children"> {
  columns: TableColumn<TData, unknown>[];
  data: TData[];
  density?: TableDensity;
  containerClassName?: string;
  stickyHeader?: boolean;
  rowKey?: TableRowKey<TData>;
  getRowId?: (row: TData, index: number) => string;
  caption?: ReactNode;
  defaultColumnVisibility?: TableColumnVisibility;
  columnVisibility?: TableColumnVisibility;
  onColumnVisibilityChange?: (columnVisibility: TableColumnVisibility) => void;
  /**
   * Active sort. Pass a single `TableSort` for single-key sort (legacy)
   * or `TableSort[]` for multi-sort (shift-click adds keys; canon ⑤).
   */
  sort?: TableSortState;
  onSortChange?: (sort: TableSortState) => void;
  /** Enable per-column horizontal resize handles (canon ⑤). */
  resizable?: boolean;
  /** Inline expand-row config (canon ⑥). */
  expandable?: TableExpandableConfig<TData>;
  /** Inline editing config (canon ⑦). */
  editing?: TableEditingConfig<TData>;
  /** Row-group descriptor — same vocabulary as TanStack `getGroupedRowModel`. */
  groupBy?: TableGroupBy<TData>;
  /** Tree-row resolver (canon ⑧, hierarchical rows). */
  tree?: TableTreeConfig<TData>;
  /** Receives column-pinning changes from the column manager lock toggle (canon ⑨). */
  onColumnPinningChange?: TableColumnPinningChange;
  /** Checkbox-column wiring. Use the `<DataTable>` composite for the batch action band. */
  selection?: TableSelectionConfig<TData>;
  footer?: ReactNode;
  empty?: ReactNode;
  rowClassName?: string | ((row: Row<TData>) => string | undefined);
  /**
   * Pre-built TanStack `useReactTable` instance, supplied by the
   * `<DataTable>` composite. When provided, the primitive skips
   * its internal `useReactTable` and consumes the externally-managed
   * instance.
   */
  instance?: ReactTable<TData>;
}
