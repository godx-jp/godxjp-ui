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
import { Lock, LockOpen, Search } from "lucide-react";
import { matchBreakpoint, useBreakpoint } from "../../hooks/useBreakpoint";
import type { Breakpoint } from "../layout/Row";
import {
  Fragment,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../cn";
import { Checkbox } from "../data-entry/Checkbox";
import { Input } from "../data-entry/Input";
import { InputSearch } from "../data-entry/InputSearch";
import { Select } from "../data-entry/Select";
import { Alert } from "../feedback/Alert";
import { Dialog } from "../feedback/Dialog";
import { Sheet } from "../feedback/Sheet";
import { Button } from "../general/Button";
import { Pagination } from "../navigation/Pagination";
import { Badge } from "./Badge";
import { Empty } from "./Empty";
import {
  MAX_PERSISTED_TABLE_VIEWS,
  readPersistedColumnPinning,
  readPersistedColumnVisibility,
  readPersistedTableViews,
  writePersistedColumnPinning,
  writePersistedColumnVisibility,
  writePersistedTableViews,
} from "./Table.persistence";
import type {
  TableBatchActions,
  TableBatchActionsConfig,
  TableColumn,
  TableColumnVisibility,
  TableEditingConfig,
  TableExpandableConfig,
  TableFilter,
  TableFilterBar,
  TableFilterItem,
  TableFilterOperator,
  TableFilterOption,
  TableGroupBy,
  TableGroupDescriptor,
  TablePagination,
  TablePaginationCursorConfig,
  TablePaginationLoadMoreConfig,
  TablePaginationNumberedConfig,
  TablePaginationVariantConfig,
  TableProps,
  TableRowKey,
  TableSort,
  TableSortState,
  TableStickyConfig,
  TableStickySide,
  TableToolbar,
  TableToolbarButtonConfig,
  TableToolbarConfig,
  TableTreeConfig,
  TableViewItem,
  TableViews,
  TableViewsConfig,
  TableViewSnapshot,
} from "./Table.types";
// Re-export the type surface so existing `from "./data-display/Table"`
// imports continue to resolve identically to before the Stage 4 split.
export type {
  TableBatchActions,
  TableBatchActionsConfig,
  TableBatchActionsContext,
  TableColumn,
  TableColumnPinningChange,
  TableColumnVisibility,
  TableDensity,
  TableEditingConfig,
  TableExpandableConfig,
  TableFilter,
  TableFilterBar,
  TableFilterItem,
  TableFilterOperator,
  TableFilterOption,
  TableGroupBy,
  TableGroupDescriptor,
  TablePagination,
  TablePaginationConfig,
  TablePaginationCursorConfig,
  TablePaginationLoadMoreConfig,
  TablePaginationNumberedConfig,
  TablePaginationVariantConfig,
  TableProps,
  TableRowKey,
  TableSort,
  TableSortState,
  TableStickyConfig,
  TableStickySide,
  TableToolbar,
  TableToolbarButtonConfig,
  TableToolbarColumnConfig,
  TableToolbarConfig,
  TableToolbarFilterConfig,
  TableToolbarSearchConfig,
  TableTreeConfig,
  TableViewItem,
  TableViewSnapshot,
  TableViews,
  TableViewsConfig,
} from "./Table.types";
export {
  getTableColumnPinningStorageKey,
  getTableColumnVisibilityStorageKey,
  getTableViewsStorageKey,
} from "./Table.persistence";
import { Tag } from "./Tag";


// ── Stage 4b deprecation warner ────────────────────────────────────
// Module-level Set dedupes the warning to once-per-prop per session.
const warnedDeprecatedProps = new Set<string>();
function warnDeprecatedChromeProp(prop: string) {
  if (warnedDeprecatedProps.has(prop)) return;
  warnedDeprecatedProps.add(prop);
  // eslint-disable-next-line no-console
  console.warn(
    `[@godxjp/ui Table] prop \`${prop}\` is deprecated on the primitive and will be removed in v5. ` +
      `Move to the <DataTable> composite (see docs/how-to/migrate-to-data-table.md).`,
  );
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

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(previous)
    : updater;
}

function isTablePaginationVariantConfig(
  value: TablePagination | undefined,
): value is TablePaginationVariantConfig {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    isValidElement(value)
  )
    return false;
  const candidate = value as { type?: string };
  if (candidate.type === "load-more" || candidate.type === "cursor")
    return true;
  return "total" in value && "current" in value && "pageSize" in value;
}

function isNumberedPaginationConfig(
  value: TablePaginationVariantConfig,
): value is TablePaginationNumberedConfig {
  return value.type === undefined || value.type === "numbered";
}

function isTableToolbarConfig(
  value: TableToolbar | undefined,
): value is TableToolbarConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !isValidElement(value) &&
    ("search" in value ||
      "filter" in value ||
      "columns" in value ||
      "primaryAction" in value ||
      "actions" in value)
  );
}

function isTableViewsConfig(
  value: TableViews | undefined,
): value is TableViewsConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !isValidElement(value) &&
    "items" in value
  );
}

function isTableBatchActionsConfig<TData>(
  value: TableBatchActions<TData> | undefined,
): value is TableBatchActionsConfig<TData> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !isValidElement(value) &&
    "selectedRowKeys" in value &&
    "onSelectedRowKeysChange" in value &&
    "actions" in value
  );
}

function isToolbarButtonConfig(
  value: ReactNode | TableToolbarButtonConfig,
): value is TableToolbarButtonConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !isValidElement(value) &&
    ("label" in value || "onClick" in value || "disabled" in value)
  );
}

function renderTableViews(
  views: TableViewsConfig,
  items: TableViewItem[],
  applyView: (view: TableViewItem) => void,
  deleteView: (view: TableViewItem) => void,
  saveView: () => void,
  defaultSaveLabel: string,
  defaultDeleteLabel: string,
) {
  return (
    <>
      {items.map((view) => (
        <span
          key={view.key}
          className={view.key === views.activeKey ? "tab-wrap on" : "tab-wrap"}
        >
          <button
            type="button"
            className="tab"
            disabled={view.disabled}
            onClick={() => applyView(view)}
          >
            {view.dotColor !== undefined && (
              <span
                className="dot"
                style={{ background: view.dotColor }}
                aria-hidden
              />
            )}
            {view.label}
            {view.count !== undefined && (
              <span className="count">{view.count}</span>
            )}
          </button>
          {view.deletable === true && (
            <button
              type="button"
              className="tab-delete"
              aria-label={`${views.deleteLabel ?? defaultDeleteLabel}: ${String(view.label)}`}
              disabled={view.disabled}
              onClick={(event) => {
                event.stopPropagation();
                deleteView(view);
              }}
            >
              ×
            </button>
          )}
        </span>
      ))}
      <span className="spacer" />
      {views.saveable !== false && (
        <button type="button" className="tab add" onClick={saveView}>
          {views.saveLabel ?? defaultSaveLabel}
        </button>
      )}
    </>
  );
}

function renderToolbarPrimaryAction(
  primaryAction: TableToolbarConfig["primaryAction"],
  defaultLabel: string,
) {
  if (primaryAction === undefined || primaryAction === false) return null;
  if (!isToolbarButtonConfig(primaryAction)) return primaryAction;
  return (
    <Button
      className="tbl-primary-action"
      size="small"
      onClick={primaryAction.onClick}
      disabled={primaryAction.disabled}
    >
      {primaryAction.label ?? defaultLabel}
    </Button>
  );
}

function renderTableToolbar(
  toolbar: TableToolbar | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
  onColumnSettingsClick: () => void,
) {
  if (toolbar === undefined || toolbar === false) return null;
  if (!isTableToolbarConfig(toolbar)) return toolbar;

  return (
    <>
      {toolbar.search !== undefined && toolbar.search !== false && (
        <InputSearch
          ref={toolbar.search.inputRef}
          aria-label={toolbar.search.ariaLabel ?? t("common.search")}
          className="tbl-search-input"
          size="small"
          placeholder={
            toolbar.search.placeholder ?? t("table.searchPlaceholder")
          }
          value={toolbar.search.value}
          disabled={toolbar.search.disabled}
          onChange={(event) =>
            toolbar.search !== false &&
            toolbar.search?.onValueChange(event.target.value)
          }
          onSearch={toolbar.search.onSearch}
          onClear={() => {
            if (toolbar.search === false) return;
            toolbar.search?.onValueChange("");
            toolbar.search?.onSearch?.("");
            toolbar.search?.onClear?.();
          }}
          suffix={toolbar.search.suffix}
        />
      )}
      {toolbar.search !== undefined && toolbar.search !== false && (
        <Button
          className="tbl-search-action"
          size="small"
          variant="primary"
          aria-label={t("common.search")}
          disabled={toolbar.search.disabled}
          startContent={<Search aria-hidden="true" focusable="false" />}
          onClick={() =>
            toolbar.search !== false &&
            toolbar.search?.onSearch?.(toolbar.search.value)
          }
        >
          <span className="tbl-search-action-label">{t("common.search")}</span>
        </Button>
      )}
      {toolbar.filter !== undefined && toolbar.filter !== false && (
        <Button
          className="tbl-filter-action"
          size="small"
          variant="outline"
          disabled={toolbar.filter.disabled}
          onClick={toolbar.filter.onClick}
        >
          {toolbar.filter.label ?? t("table.detailFilter")}
          {toolbar.filter.count !== undefined && toolbar.filter.count > 0 && (
            <>
              {" "}
              <Badge variant="primary" dot={false}>
                {toolbar.filter.count}
              </Badge>
            </>
          )}
        </Button>
      )}
      <span className="spacer" />
      <span className="tbl-extra-actions">
        {toolbar.columns !== undefined && toolbar.columns !== false && (
          <Button
            className="tbl-column-action"
            size="small"
            variant="outline"
            disabled={toolbar.columns.disabled}
            onClick={toolbar.columns.onClick ?? onColumnSettingsClick}
          >
            {toolbar.columns.label ?? t("table.columnSettings")}
          </Button>
        )}
        {renderToolbarPrimaryAction(
          toolbar.primaryAction,
          t("table.newRecord"),
        )}
        {toolbar.actions}
      </span>
    </>
  );
}

function getColumnSettingsLabel<TData>(column: Column<TData, unknown>) {
  const label = labelForColumn(column.columnDef, column.id);
  if (label === undefined || label === null || typeof label === "boolean")
    return column.id;
  return label;
}

interface PaginationRendered {
  variant: TablePaginationVariantConfig["type"];
  node: ReactNode;
}

function renderTablePagination(
  pagination: TablePagination | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
): PaginationRendered | null {
  if (pagination === undefined || pagination === false) return null;
  if (!isTablePaginationVariantConfig(pagination))
    return { variant: undefined, node: pagination as ReactNode };
  if (pagination.type === "load-more")
    return { variant: "load-more", node: renderLoadMore(pagination, t) };
  if (pagination.type === "cursor")
    return { variant: "cursor", node: renderCursor(pagination, t) };
  const config = pagination;
  return {
    variant: "numbered",
    node: (
      <Pagination
        variant="embedded"
        showFirstLast
        total={config.total}
        pageSize={config.pageSize}
        value={config.current}
        onValueChange={(page) => config.onChange?.(page, config.pageSize)}
        onPageSizeChange={(size) => config.onChange?.(1, size)}
        pageSizeOptions={config.pageSizeOptions}
        showSizeChanger={config.showSizeChanger}
        showTotal={
          config.showTotal !== undefined ? config.showTotal : true
        }
        hideOnSinglePage={config.hideOnSinglePage}
        disabled={config.disabled}
      />
    ),
  };
}

function renderLoadMore(
  config: TablePaginationLoadMoreConfig,
  t: (key: string, options?: Record<string, unknown>) => string,
): ReactNode {
  const remaining = Math.max(config.total - config.currentCount, 0);
  const batch =
    config.batchSize !== undefined
      ? Math.min(config.batchSize, remaining)
      : remaining;
  const defaultLabel = t("table.loadMore", { count: batch });
  return (
    <div className="tbl-load-more">
      <Button
        size="small"
        variant="outline"
        disabled={!config.hasMore || config.loadingMore === true}
        onClick={config.onLoadMore}
      >
        {config.loadMoreLabel ?? defaultLabel}
      </Button>
      <div className="tbl-load-more-progress">
        {config.progressLabel?.(config.currentCount, config.total) ??
          t("table.loadMoreProgress", {
            current: config.currentCount,
            total: config.total,
          })}
      </div>
    </div>
  );
}

function renderCursor(
  config: TablePaginationCursorConfig,
  t: (key: string, options?: Record<string, unknown>) => string,
): ReactNode {
  const inputType = config.inputType ?? "month";
  return (
    <>
      <Button
        size="x-small"
        variant="ghost"
        disabled={config.disabled}
        onClick={config.onJumpToLatest}
      >
        {config.jumpToLatestLabel ?? t("table.jumpToLatest")}
      </Button>
      <Button
        size="x-small"
        variant="outline"
        disabled={config.disabled}
        onClick={config.onPrev}
      >
        {config.prevLabel ?? t("table.previousPeriod")}
      </Button>
      <span className="spacer" />
      <div className="label">{config.label}</div>
      <span className="spacer" />
      <input
        type={inputType}
        value={config.value}
        disabled={config.disabled}
        aria-label={t("table.jumpToPeriod")}
        onChange={(event) => config.onChange(event.target.value)}
      />
      <Button
        size="x-small"
        variant="outline"
        disabled={config.disabled}
        onClick={config.onNext}
      >
        {config.nextLabel ?? t("table.nextPeriod")}
      </Button>
    </>
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

function isFilterItems(
  filterBar: TableFilterBar | undefined,
): filterBar is TableFilterItem[] {
  return Array.isArray(filterBar);
}

function operatorSymbol(operator: TableFilterOperator | undefined): string {
  switch (operator) {
    case "neq": return "≠";
    case "contains": return "∋";
    case "startsWith": return "≻";
    case "endsWith": return "≺";
    case "gt": return ">";
    case "gte": return "≥";
    case "lt": return "<";
    case "lte": return "≤";
    case "between": return "..";
    case "in": return "∈";
    case "eq":
    case undefined:
    default:
      return "=";
  }
}

function renderFilterBar(filterBar: TableFilterBar, label: string) {
  if (!isFilterItems(filterBar)) return filterBar;
  return (
    <>
      <span className="lbl">{label}:</span>
      {filterBar.map((item) => {
        if (item.options !== undefined) {
          return (
            <span key={item.key} className="table-filter-select-wrap">
              <Select
                value={item.value ?? ""}
                onValueChange={item.onValueChange}
                options={item.options.map((option) => ({
                  ...option,
                  label: `${item.label}: ${option.label}`,
                }))}
                triggerClassName="table-filter-select"
              />
              {item.onClose !== undefined && (
                <button
                  type="button"
                  className="table-filter-clear"
                  onClick={item.onClose}
                  aria-label={`${item.label} clear`}
                >
                  ×
                </button>
              )}
            </span>
          );
        }
        return (
          <Tag
            key={item.key}
            color={item.color ?? "primary"}
            closable={item.closable ?? item.onClose !== undefined}
            onClose={item.onClose}
          >
            {item.label} {operatorSymbol(item.operator)}{" "}
            {item.valueLabel ?? item.value}
          </Tag>
        );
      })}
    </>
  );
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

function labelForColumn<TData>(
  column: TableColumn<TData, unknown>,
  key: string,
): ReactNode {
  if (column.meta?.filterLabel !== undefined) return column.meta.filterLabel;
  if (typeof column.header === "string") return column.header;
  return key;
}

function valueLabelFor(
  optionList: TableFilterOption[] | undefined,
  value: TableFilter["value"],
) {
  const option = optionList?.find((item) => item.value === String(value));
  return option?.label ?? value;
}

function deriveFilterBar<TData>(
  columns: TableColumn<TData, unknown>[],
  filters: TableFilter[] | undefined,
  onFiltersChange: ((filters: TableFilter[]) => void) | undefined,
): TableFilterItem[] {
  if (filters === undefined || filters.length === 0) return [];
  return filters.flatMap((filter) => {
    const column = columns.find((item) => getColumnKey(item) === filter.key);
    if (column !== undefined && column.meta?.filterable !== true) return [];
    const options = column?.meta?.filterOptions;
    return [
      {
        key: filter.key,
        label: column ? labelForColumn(column, filter.key) : filter.key,
        value: filter.value == null ? undefined : String(filter.value),
        valueLabel: filter.valueLabel ?? valueLabelFor(options, filter.value),
        operator: filter.operator,
        options,
        onValueChange:
          options !== undefined && onFiltersChange !== undefined
            ? (value) =>
                onFiltersChange(
                  filters.map((item) =>
                    item.key === filter.key
                      ? {
                          ...item,
                          value,
                          valueLabel: valueLabelFor(options, value),
                        }
                      : item,
                  ),
                )
            : undefined,
        closable: onFiltersChange !== undefined,
        onClose:
          onFiltersChange !== undefined
            ? () =>
                onFiltersChange(
                  filters.filter((item) => item.key !== filter.key),
                )
            : undefined,
      },
    ];
  });
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
  views,
  toolbar,
  batchActions,
  filters,
  onFiltersChange,
  tableKey,
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
  filterBar,
  pagination,
  footer,
  empty,
  onResetFilters,
  rowClassName,
  className,
  instance,
  ...rest
}: TableProps<TData>) {
  const { t } = useTranslation();
  const warnedRowKeys = useRef(new Set<string>());
  // ── Stage 4b deprecation. When `instance` is provided, this is the
  // composite path: chrome is rendered by `<DataTable>`. When it's
  // undefined and chrome props are passed, the primitive is being
  // used standalone with the legacy fat surface — warn the consumer.
  if (instance === undefined) {
    if (toolbar !== undefined) warnDeprecatedChromeProp("toolbar");
    if (views !== undefined) warnDeprecatedChromeProp("views");
    if (batchActions !== undefined) warnDeprecatedChromeProp("batchActions");
    if (filters !== undefined) warnDeprecatedChromeProp("filters");
    if (onFiltersChange !== undefined)
      warnDeprecatedChromeProp("onFiltersChange");
    if (filterBar !== undefined) warnDeprecatedChromeProp("filterBar");
    if (onResetFilters !== undefined)
      warnDeprecatedChromeProp("onResetFilters");
    if (pagination !== undefined) warnDeprecatedChromeProp("pagination");
    if (tableKey !== undefined) warnDeprecatedChromeProp("tableKey");
  }
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [saveViewOpen, setSaveViewOpen] = useState(false);
  const [saveViewName, setSaveViewName] = useState("");
  const [internalSavedViews, setInternalSavedViews] = useState<TableViewItem[]>(
    () => readPersistedTableViews(tableKey, columns),
  );
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<TableColumnVisibility>(
      () =>
        columnVisibility ??
        readPersistedColumnVisibility(tableKey, columns) ??
        defaultColumnVisibility ??
        {},
    );
  const effectiveColumnVisibility =
    columnVisibility ?? internalColumnVisibility;
  // Auto-pinning is derived from `meta.sticky` against the current
  // breakpoint, so `{ side: "right", from: "md" }` only sticks on md+.
  // User-toggled pins (Sheet lock button) live in a separate state
  // and are persisted to localStorage; the effective pinning is the
  // union of both.
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
  // Memoise the controlled-state object so the reference stays stable
  // across renders when the underlying values haven't changed. Without
  // this, TanStack receives a fresh object literal each render which
  // can amplify re-render churn (especially under React 19 strict mode
  // dev double-rendering).
  const tableState = useMemo(
    () => ({ columnPinning, columnVisibility: effectiveColumnVisibility }),
    [columnPinning, effectiveColumnVisibility],
  );
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
  // Stage 4b — `<DataTable>` composite owns `useReactTable` and
  // passes the resulting instance via `instance`. Always call the
  // local hook (rules-of-hooks) but defer to the composite-supplied
  // instance when present.
  const table: ReactTable<TData> = instance ?? localTable;
  const isComposite = instance !== undefined;
  useEffect(() => {
    if (isComposite) return;
    writePersistedColumnVisibility(
      tableKey,
      columns,
      effectiveColumnVisibility,
    );
  }, [columns, effectiveColumnVisibility, tableKey, isComposite]);
  useEffect(() => {
    if (isComposite) return;
    writePersistedColumnPinning(tableKey, columns, userColumnPinning);
  }, [columns, userColumnPinning, tableKey, isComposite]);
  useEffect(() => {
    if (isComposite) return;
    writePersistedTableViews(tableKey, columns, internalSavedViews);
  }, [columns, internalSavedViews, tableKey, isComposite]);
  const leafColumns = table.getVisibleLeafColumns();
  const hasFooter = leafColumns.some(
    (column) => column.columnDef.footer !== undefined,
  );
  const columnSettingsColumns = table
    .getAllLeafColumns()
    .filter(
      (column) =>
        getColumnKey(column.columnDef) !== undefined &&
        column.columnDef.meta?.hideable !== false &&
        column.getCanHide(),
    );
  const batchConfig = isTableBatchActionsConfig(batchActions)
    ? batchActions
    : undefined;
  const selectedRowKeySet = new Set(batchConfig?.selectedRowKeys ?? []);
  const selectableRows = table
    .getRowModel()
    .rows.filter((row) => batchConfig?.getCheckboxDisabled?.(row) !== true);
  const selectedRows = table
    .getRowModel()
    .rows.filter((row) => selectedRowKeySet.has(row.id));
  const allVisibleSelected =
    selectableRows.length > 0 &&
    selectableRows.every((row) => selectedRowKeySet.has(row.id));
  const selectAllVisible = () => {
    if (batchConfig === undefined) return;
    const next = new Set(batchConfig.selectedRowKeys);
    if (allVisibleSelected) selectableRows.forEach((row) => next.delete(row.id));
    else selectableRows.forEach((row) => next.add(row.id));
    batchConfig.onSelectedRowKeysChange(Array.from(next));
  };
  const clearSelection = () => batchConfig?.onSelectedRowKeysChange([]);
  const batchActionsContent: ReactNode | undefined | false =
    batchConfig === undefined
      ? (batchActions as ReactNode | undefined | false)
      : batchConfig.selectedRowKeys.length > 0
        ? typeof batchConfig.actions === "function"
          ? batchConfig.actions({
              selectedRowKeys: batchConfig.selectedRowKeys,
              selectedRows,
              totalSelectableCount: selectableRows.length,
              selectAllVisible,
              clearSelection,
            })
          : batchConfig.actions
        : undefined;
  const colSpan = Math.max(
    leafColumns.length +
      (batchConfig === undefined ? 0 : 1) +
      (expandable === undefined ? 0 : 1),
    1,
  );
  const activeFilterBar =
    filterBar ?? deriveFilterBar(columns, filters, onFiltersChange);
  const hasFilterBar =
    activeFilterBar !== undefined &&
    (!isFilterItems(activeFilterBar) || activeFilterBar.length > 0);
  const viewsConfig = isTableViewsConfig(views) ? views : undefined;
  const viewItems = useMemo(
    () =>
      viewsConfig === undefined
        ? []
        : [...viewsConfig.items, ...internalSavedViews],
    [internalSavedViews, viewsConfig],
  );
  const currentViewSnapshot: TableViewSnapshot = {
    filters: filters ?? [],
    // Snapshot stores the primary sort entry for back-compat; multi-
    // sort is preserved at runtime through `sort` directly.
    sort: Array.isArray(sort) ? (sort[0] ?? null) : (sort ?? null),
    columnVisibility: effectiveColumnVisibility,
  };
  const duplicateView = viewItems.find((view) =>
    sameViewSnapshot(view, currentViewSnapshot),
  );
  const applyView = (view: TableViewItem) => {
    if (isTableViewsConfig(views)) {
      views.onActiveKeyChange?.(view.key);
      if (views.onViewApply !== undefined) {
        views.onViewApply(view);
        return;
      }
    }
    if (view.filters !== undefined) onFiltersChange?.(view.filters);
    if ("sort" in view) onSortChange?.(view.sort ?? null);
    if (view.columnVisibility !== undefined)
      onColumnVisibilityChange?.(view.columnVisibility);
  };
  const deleteView = (view: TableViewItem) => {
    if (internalSavedViews.some((item) => item.key === view.key)) {
      const nextViews = internalSavedViews.filter((item) => item.key !== view.key);
      setInternalSavedViews(nextViews);
      viewsConfig?.onItemsChange?.([...viewsConfig.items, ...nextViews]);
      if (viewsConfig?.activeKey === view.key && viewsConfig.items[0] !== undefined)
        applyView(viewsConfig.items[0]);
      return;
    }
    viewsConfig?.onDeleteView?.(view);
  };
  const openSaveView = () => {
    if (viewsConfig?.onSaveCurrent !== undefined) {
      viewsConfig.onSaveCurrent();
      return;
    }
    setSaveViewName(t("table.defaultViewName", { count: internalSavedViews.length + 1 }));
    setSaveViewOpen(true);
  };
  const confirmSaveView = () => {
    const label = saveViewName.trim();
    if (label === "") return;
    const nextView: TableViewItem = {
      key: `saved-${Date.now()}`,
      label,
      deletable: true,
      ...currentViewSnapshot,
    };
    const nextViews = [...internalSavedViews, nextView].slice(
      -MAX_PERSISTED_TABLE_VIEWS,
    );
    setInternalSavedViews(nextViews);
    viewsConfig?.onItemsChange?.([...(viewsConfig.items ?? []), ...nextViews]);
    viewsConfig?.onActiveKeyChange?.(nextView.key);
    setSaveViewOpen(false);
  };
  const viewsContent: ReactNode | null =
    views === undefined || views === false
      ? null
      : viewsConfig === undefined
        ? (views as ReactNode)
        : renderTableViews(
            viewsConfig,
            viewItems,
            applyView,
            deleteView,
            openSaveView,
            t("table.saveView"),
            t("table.deleteView"),
          );
  const toolbarContent = renderTableToolbar(toolbar, t, () =>
    setColumnSettingsOpen(true),
  );
  const paginationContent = renderTablePagination(pagination, t);
  const emptyContent = empty ?? (
    <Empty description={t("table.emptyDescription")}>
      {hasFilterBar && onResetFilters !== undefined && (
        <Button size="small" variant="outline" onClick={onResetFilters}>
          {t("table.resetFilters")}
        </Button>
      )}
    </Empty>
  );

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
        {batchConfig !== undefined && (
          <td className="check">
            <Checkbox
              aria-label={t("table.selectRow", { row: row.id })}
              checked={selectedRowKeySet.has(row.id)}
              disabled={batchConfig.getCheckboxDisabled?.(row)}
              onCheckedChange={(checked) => {
                const next = new Set(batchConfig.selectedRowKeys);
                if (checked === true) next.add(row.id);
                else next.delete(row.id);
                batchConfig.onSelectedRowKeysChange(Array.from(next));
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
          // Render the cell by calling the column's accessor manually.
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
    // Tree mode: ignore TanStack's flat row model; walk `data` recursively.
    if (tree !== undefined) {
      const nodes: ReactNode[] = [];
      for (const item of data) renderTreeRow(item, 0, nodes);
      return nodes;
    }
    // Group mode: bucket rows by group key.
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
        const groupOpen = !treeExpandedSet.has(`group:${key}`)
          ? true
          : treeExpandedSet.has(`group:${key}`);
        // Group rows are open by default — toggle stored as collapse flag.
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
        // touch groupOpen to silence "unused" — semantic is via isCollapsed.
        void groupOpen;
      }
      return nodes;
    }
    // Default — flat list with optional expand panels.
    return rows.map((row) => renderDataRow(row));
  }

  return (
    <div
      className={cn("table-stack", containerClassName)}
      data-density={density}
    >
      {!isComposite && viewsContent !== null && (
        <div className="tbl-views">{viewsContent}</div>
      )}
      {!isComposite && toolbarContent !== null && (
        <div className="table-toolbar">{toolbarContent}</div>
      )}
      {!isComposite && batchActionsContent !== undefined &&
        batchActionsContent !== false && (
          <div className="tbl-batch-bar">
            {batchConfig !== undefined && (
              <>
                <span className="count">
                  {batchConfig.selectedLabel?.(batchConfig.selectedRowKeys.length) ??
                    t("table.selectedRows", {
                      count: batchConfig.selectedRowKeys.length,
                    })}
                </span>
                {!allVisibleSelected && selectableRows.length > 0 && (
                  <Button size="small" variant="ghost" onClick={selectAllVisible}>
                    {batchConfig.selectAllLabel?.(selectableRows.length) ??
                      t("table.selectAllVisible", {
                        count: selectableRows.length,
                      })}
                  </Button>
                )}
              </>
            )}
            {batchActionsContent}
            {batchConfig !== undefined && (
              <>
                <span className="spacer" />
                <Button size="small" variant="ghost" onClick={clearSelection}>
                  {batchConfig.clearLabel ?? t("table.clearSelection")}
                </Button>
              </>
            )}
          </div>
        )}
      {!isComposite && hasFilterBar && (
        <div className="tbl-filter-bar">
          {renderFilterBar(activeFilterBar, t("table.conditions"))}
          {onResetFilters !== undefined && (
            <Button size="x-small" variant="ghost" onClick={onResetFilters}>
              {t("table.resetFilters")}
            </Button>
          )}
        </div>
      )}
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
                {batchConfig !== undefined && (
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
      {!isComposite &&
        paginationContent !== null &&
        (paginationContent.variant === "numbered" ? (
          // <Pagination variant="embedded"> owns its <nav> wrapper.
          paginationContent.node
        ) : (
          <div
            className={
              paginationContent.variant === "load-more"
                ? undefined
                : "tbl-pagination"
            }
            data-variant={paginationContent.variant}
          >
            {paginationContent.node}
          </div>
        ))}
      {!isComposite && columnSettingsOpen &&
        isTableToolbarConfig(toolbar) &&
        toolbar.columns !== undefined &&
        toolbar.columns !== false &&
        toolbar.columns.onClick === undefined && (
          <Sheet
            open={columnSettingsOpen}
            onOpenChange={setColumnSettingsOpen}
            className="table-filter-sheet"
            side="right"
            title={t("table.columnSettings")}
            description={t("table.columnSettingsDescription")}
            footer={
              <>
                <Button
                  size="small"
                  variant="ghost"
                  onClick={() => handleColumnVisibilityChange({})}
                >
                  {t("table.showAllColumns")}
                </Button>
                <Button
                  size="small"
                  onClick={() => setColumnSettingsOpen(false)}
                >
                  {t("table.closeColumnSettings")}
                </Button>
              </>
            }
          >
            <div className="table-filter-field-list">
              {columnSettingsColumns.map((column) => {
                const pinned = column.getIsPinned();
                const isAutoPinned =
                  (autoColumnPinning.left ?? []).includes(column.id) ||
                  (autoColumnPinning.right ?? []).includes(column.id);
                return (
                  <section key={column.id} className="table-column-field">
                    <Checkbox
                      checked={column.getIsVisible()}
                      disabled={pinned !== false}
                      onCheckedChange={(checked) =>
                        column.toggleVisibility(checked === true)
                      }
                    >
                      {getColumnSettingsLabel(column)}
                    </Checkbox>
                    <button
                      type="button"
                      className="col-lock"
                      aria-label={
                        pinned === false
                          ? t("table.lockColumn")
                          : t("table.unlockColumn")
                      }
                      aria-pressed={pinned !== false}
                      data-locked={pinned !== false ? "true" : "false"}
                      disabled={isAutoPinned}
                      onClick={() => {
                        const next: ColumnPinningState = {
                          left: [...(columnPinning.left ?? [])],
                          right: [...(columnPinning.right ?? [])],
                        };
                        next.left = (next.left ?? []).filter(
                          (id) => id !== column.id,
                        );
                        next.right = (next.right ?? []).filter(
                          (id) => id !== column.id,
                        );
                        if (pinned === false) {
                          next.left = [...(next.left ?? []), column.id];
                          if (!column.getIsVisible())
                            column.toggleVisibility(true);
                        }
                        handleColumnPinningChange(next);
                      }}
                    >
                      {pinned === false ? (
                        <LockOpen aria-hidden="true" focusable="false" />
                      ) : (
                        <Lock aria-hidden="true" focusable="false" />
                      )}
                    </button>
                  </section>
                );
              })}
            </div>
          </Sheet>
        )}
      {!isComposite && saveViewOpen &&
        viewsConfig !== undefined &&
        viewsConfig.onSaveCurrent === undefined && (
        <Dialog
          open={saveViewOpen}
          onOpenChange={setSaveViewOpen}
          title={t("table.saveViewTitle")}
          description={t("table.saveViewDescription")}
          form={{
            onSubmit: (event) => {
              event.preventDefault();
              confirmSaveView();
            },
          }}
          footer={
            <>
              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={() => setSaveViewOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                size="small"
                disabled={saveViewName.trim() === ""}
              >
                {duplicateView === undefined
                  ? t("common.save")
                  : t("table.continueSaveView")}
              </Button>
            </>
          }
        >
          <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
            <Input
              autoFocus
              aria-label={t("table.viewName")}
              value={saveViewName}
              onChange={(event) => setSaveViewName(event.target.value)}
              placeholder={t("table.viewNamePlaceholder")}
            />
            {duplicateView !== undefined && (
              <Alert
                color="warning"
                title={t("table.duplicateViewTitle", {
                  name: String(duplicateView.label),
                })}
                description={t("table.duplicateViewDescription")}
              />
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
