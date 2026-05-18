import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnPinningState,
  type Row,
  type RowData,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
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
import { Badge } from "./Badge";
import { Empty } from "./Empty";
import { Tag, type TagPresetColor } from "./Tag";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
    headerClassName?: string;
    cellClassName?: string | ((row: Row<TData>) => string | undefined);
    style?: CSSProperties;
    headerStyle?: CSSProperties;
    cellStyle?:
      | CSSProperties
      | ((row: Row<TData>) => CSSProperties | undefined);
    filterable?: boolean;
    filterLabel?: ReactNode;
    filterOptions?: TableFilterOption[];
    sortable?: boolean;
    sticky?: "left" | "right";
    hideable?: boolean;
  }
}

export type TableDensity = "default" | "compact";
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

export interface TablePaginationConfig {
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
  actions: ReactNode | ((context: TableBatchActionsContext<TData>) => ReactNode);
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
  options?: TableFilterOption[];
  onValueChange?: (value: string) => void;
  color?: TagPresetColor | string;
  closable?: boolean;
  onClose?: () => void;
}

export type TableFilterBar = ReactNode | TableFilterItem[];
export type TablePagination = ReactNode | false | TablePaginationConfig;
export type TableToolbar = ReactNode | false | TableToolbarConfig;
export type TableViews = ReactNode | false | TableViewsConfig;
export type TableBatchActions<TData> =
  | ReactNode
  | false
  | TableBatchActionsConfig<TData>;

export interface TableProps<TData> extends Omit<
  HTMLAttributes<HTMLTableElement>,
  "children"
> {
  columns: TableColumn<TData, unknown>[];
  data: TData[];
  density?: TableDensity;
  containerClassName?: string;
  stickyHeader?: boolean;
  rowKey?: TableRowKey<TData>;
  getRowId?: (row: TData, index: number) => string;
  caption?: ReactNode;
  views?: TableViews;
  toolbar?: TableToolbar;
  batchActions?: TableBatchActions<TData>;
  filters?: TableFilter[];
  onFiltersChange?: (filters: TableFilter[]) => void;
  tableKey?: string;
  defaultColumnVisibility?: TableColumnVisibility;
  columnVisibility?: TableColumnVisibility;
  onColumnVisibilityChange?: (columnVisibility: TableColumnVisibility) => void;
  sort?: TableSort | null;
  onSortChange?: (sort: TableSort | null) => void;
  filterBar?: TableFilterBar;
  pagination?: TablePagination;
  footer?: ReactNode;
  empty?: ReactNode;
  onResetFilters?: () => void;
  rowClassName?: string | ((row: Row<TData>) => string | undefined);
}

export function getTableColumnVisibilityStorageKey(tableKey: string) {
  return `godxui:table:${tableKey}:columnVisibility`;
}

export function getTableViewsStorageKey(tableKey: string) {
  return `godxui:table:${tableKey}:views`;
}

interface PersistedColumnVisibility {
  version: 1;
  columnKeys: string[];
  visibility: TableColumnVisibility;
}

interface PersistedTableView {
  key: string;
  label: string;
  filters?: TableFilter[];
  sort?: TableSort | null;
  columnVisibility?: TableColumnVisibility;
}

interface PersistedTableViews {
  version: 1;
  columnKeys: string[];
  views: PersistedTableView[];
}

const MAX_PERSISTED_TABLE_VIEWS = 20;

function isColumnVisibility(value: unknown): value is TableColumnVisibility {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "boolean")
  );
}

function getColumnKeys<TData>(columns: TableColumn<TData, unknown>[]) {
  return columns
    .map((column) => getColumnKey(column))
    .filter((key): key is string => key !== undefined)
    .sort();
}

function hasSameColumnKeys(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((key, index) => key === right[index])
  );
}

function isPersistedColumnVisibility(
  value: unknown,
): value is PersistedColumnVisibility {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const candidate = value as {
    version?: unknown;
    columnKeys?: unknown;
    visibility?: unknown;
  };
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.columnKeys) &&
    candidate.columnKeys.every((item) => typeof item === "string") &&
    isColumnVisibility(candidate.visibility)
  );
}

function readPersistedColumnVisibility<TData>(
  tableKey: string | undefined,
  columns: TableColumn<TData, unknown>[],
): TableColumnVisibility | undefined {
  if (tableKey === undefined || typeof window === "undefined") return undefined;
  try {
    const stored = window.localStorage.getItem(
      getTableColumnVisibilityStorageKey(tableKey),
    );
    if (stored === null) return undefined;
    const parsed = JSON.parse(stored) as unknown;
    if (!isPersistedColumnVisibility(parsed)) return undefined;
    if (!hasSameColumnKeys(parsed.columnKeys, getColumnKeys(columns)))
      return undefined;
    return parsed.visibility;
  } catch {
    return undefined;
  }
}

function writePersistedColumnVisibility<TData>(
  tableKey: string | undefined,
  columns: TableColumn<TData, unknown>[],
  columnVisibility: TableColumnVisibility,
) {
  if (tableKey === undefined || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getTableColumnVisibilityStorageKey(tableKey),
      JSON.stringify({
        version: 1,
        columnKeys: getColumnKeys(columns),
        visibility: columnVisibility,
      } satisfies PersistedColumnVisibility),
    );
  } catch {
    // localStorage can be unavailable in private browsing or sandboxed iframes.
  }
}

function isPersistedTableView(value: unknown): value is PersistedTableView {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const candidate = value as Partial<PersistedTableView>;
  return (
    typeof candidate.key === "string" &&
    typeof candidate.label === "string" &&
    (candidate.filters === undefined || Array.isArray(candidate.filters)) &&
    (candidate.columnVisibility === undefined ||
      isColumnVisibility(candidate.columnVisibility))
  );
}

function readPersistedTableViews<TData>(
  tableKey: string | undefined,
  columns: TableColumn<TData, unknown>[],
): TableViewItem[] {
  if (tableKey === undefined || typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(getTableViewsStorageKey(tableKey));
    if (stored === null) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return [];
    const candidate = parsed as Partial<PersistedTableViews>;
    if (
      candidate.version !== 1 ||
      !Array.isArray(candidate.columnKeys) ||
      !hasSameColumnKeys(candidate.columnKeys, getColumnKeys(columns)) ||
      !Array.isArray(candidate.views)
    )
      return [];
    return candidate.views
      .filter(isPersistedTableView)
      .slice(-MAX_PERSISTED_TABLE_VIEWS)
      .map((view) => ({
        ...view,
        deletable: true,
      }));
  } catch {
    return [];
  }
}

function writePersistedTableViews<TData>(
  tableKey: string | undefined,
  columns: TableColumn<TData, unknown>[],
  views: TableViewItem[],
) {
  if (tableKey === undefined || typeof window === "undefined") return;
  try {
    const persistedViews = views
      .flatMap((view): PersistedTableView[] =>
        typeof view.label === "string"
          ? [
              {
                key: view.key,
                label: view.label,
                filters: view.filters,
                sort: view.sort,
                columnVisibility: view.columnVisibility,
              },
            ]
          : [],
      )
      .slice(-MAX_PERSISTED_TABLE_VIEWS);
    window.localStorage.setItem(
      getTableViewsStorageKey(tableKey),
      JSON.stringify({
        version: 1,
        columnKeys: getColumnKeys(columns),
        views: persistedViews,
      } satisfies PersistedTableViews),
    );
  } catch {
    // localStorage can be unavailable in private browsing or sandboxed iframes.
  }
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

function isTablePaginationConfig(
  value: TablePagination | undefined,
): value is TablePaginationConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !isValidElement(value) &&
    "total" in value &&
    "current" in value &&
    "pageSize" in value
  );
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
          disabled={toolbar.search.disabled}
          onClick={() =>
            toolbar.search !== false &&
            toolbar.search?.onSearch?.(toolbar.search.value)
          }
        >
          {t("common.search")}
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

function renderTablePagination(
  pagination: TablePagination | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (pagination === undefined || pagination === false) return null;
  if (!isTablePaginationConfig(pagination)) return pagination;
  const config = pagination;

  const total = Math.max(config.total, 0);
  const pageSize = Math.max(config.pageSize, 1);
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);
  const current = Math.min(Math.max(config.current, 1), pageCount);
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);
  const disabled = config.disabled === true;
  const showSizeChanger = config.showSizeChanger !== false;
  const pageSizeOptions = Array.from(
    new Set([...(config.pageSizeOptions ?? [10, 20, 50, 100]), pageSize]),
  ).sort((left, right) => left - right);

  if (config.hideOnSinglePage === true && total <= pageSize) return null;

  function changePage(nextPage: number) {
    if (disabled) return;
    config.onChange?.(Math.min(Math.max(nextPage, 1), pageCount), pageSize);
  }

  function changePageSize(nextPageSize: number) {
    if (disabled) return;
    config.onChange?.(1, nextPageSize);
  }

  return (
    <>
      <div className="info">
        {config.showTotal?.(total, [start, end]) ??
          t("table.paginationTotal", { start, end, total })}
      </div>
      {showSizeChanger && (
        <div className="ps">
          <span>{t("table.pageSize")}</span>
          <select
            aria-label={t("table.pageSize")}
            value={pageSize}
            disabled={disabled}
            onChange={(event) => changePageSize(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="spacer" />
      <div className="pgn">
        <button
          className={current === 1 ? "disabled" : ""}
          disabled={disabled || current === 1}
          onClick={() => changePage(1)}
          aria-label={t("table.firstPage")}
        >
          {"<<"}
        </button>
        <button
          className={current === 1 ? "disabled" : ""}
          disabled={disabled || current === 1}
          onClick={() => changePage(current - 1)}
          aria-label={t("table.previousPage")}
        >
          {"<"}
        </button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map(
          (page) => (
            <button
              key={page}
              className={page === current ? "on" : ""}
              disabled={disabled}
              onClick={() => changePage(page)}
              aria-current={page === current ? "page" : undefined}
            >
              {page}
            </button>
          ),
        )}
        <button
          className={current === pageCount ? "disabled" : ""}
          disabled={disabled || current === pageCount}
          onClick={() => changePage(current + 1)}
          aria-label={t("table.nextPage")}
        >
          {">"}
        </button>
      </div>
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
                value={item.value}
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
            {item.label} = {item.valueLabel ?? item.value}
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

function nextSort(
  current: TableSort | null | undefined,
  key: string,
): TableSort | null {
  if (current?.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null;
}

function deriveColumnPinning<TData>(
  columns: TableColumn<TData, unknown>[],
): ColumnPinningState {
  return columns.reduce<ColumnPinningState>(
    (state, column) => {
      const key = getColumnKey(column);
      if (key === undefined || column.meta?.sticky === undefined) return state;
      const side = column.meta.sticky;
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
  filterBar,
  pagination,
  footer,
  empty,
  onResetFilters,
  rowClassName,
  className,
  ...rest
}: TableProps<TData>) {
  const { t } = useTranslation();
  const warnedRowKeys = useRef(new Set<string>());
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
  const columnPinning = deriveColumnPinning(columns);
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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: resolveGetRowId,
    enableColumnPinning: true,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    state: { columnPinning, columnVisibility: effectiveColumnVisibility },
  });
  useEffect(() => {
    writePersistedColumnVisibility(
      tableKey,
      columns,
      effectiveColumnVisibility,
    );
  }, [columns, effectiveColumnVisibility, tableKey]);
  useEffect(() => {
    writePersistedTableViews(tableKey, columns, internalSavedViews);
  }, [columns, internalSavedViews, tableKey]);
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
        column.columnDef.meta?.sticky === undefined &&
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
    leafColumns.length + (batchConfig === undefined ? 0 : 1),
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
    sort: sort ?? null,
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

  return (
    <div
      className={cn("table-stack", containerClassName)}
      data-density={density}
    >
      {viewsContent !== null && <div className="tbl-views">{viewsContent}</div>}
      {toolbarContent !== null && (
        <div className="table-toolbar">{toolbarContent}</div>
      )}
      {batchActionsContent !== undefined && batchActionsContent !== false && (
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
      {hasFilterBar && (
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
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const columnKey = getColumnKey(header.column.columnDef);
                  const isSortable =
                    meta?.sortable === true &&
                    columnKey !== undefined &&
                    onSortChange !== undefined;
                  const sortedDirection =
                    columnKey !== undefined && sort?.key === columnKey
                      ? sort.direction
                      : undefined;
                  const headerContent = header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      );
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
                      {isSortable ? (
                        <button
                          type="button"
                          className="table-sort-button"
                          onClick={() =>
                            onSortChange(nextSort(sort, columnKey))
                          }
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
                        </button>
                      ) : (
                        headerContent
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={resolveCellClass(rowClassName, row)}
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
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          meta?.className,
                          cell.column.getIsPinned() &&
                            `table-pinned-${cell.column.getIsPinned()}`,
                          resolveCellClass(meta?.cellClassName, row),
                        )}
                        style={getColumnStyle(cell.column, {
                          ...meta?.style,
                          ...resolveCellStyle(meta?.cellStyle, row),
                        })}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colSpan} className="muted">
                  {emptyContent}
                </td>
              </tr>
            )}
          </tbody>
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
      {paginationContent !== null && (
        <div className="tbl-pagination">{paginationContent}</div>
      )}
      {columnSettingsOpen &&
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
              {columnSettingsColumns.map((column) => (
                <section key={column.id} className="table-column-field">
                  <Checkbox
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) =>
                      column.toggleVisibility(checked === true)
                    }
                  >
                    {getColumnSettingsLabel(column)}
                  </Checkbox>
                </section>
              ))}
            </div>
          </Sheet>
        )}
      {saveViewOpen &&
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
