/**
 * @godxjp/ui DataTable — chrome renderers.
 *
 * Stage 4b of the Table refactor (Plan §3). The view-tabs, toolbar,
 * batch-action band, and filter chip bar are all rendered here on
 * behalf of `<DataTable>`. The slim `<Table>` primitive renders
 * only the body of the table.
 *
 * These functions also remain importable by the primitive's
 * deprecated chrome rendering path so the back-compat surface stays
 * pixel-identical until v5.0.0 strips it.
 */
import { isValidElement, type ReactNode } from "react";
import { Search } from "lucide-react";
import type { Row } from "@tanstack/react-table";
import { Badge } from "../../data-display/Badge";
import { Tag } from "../../data-display/Tag";
import type {
  TableBatchActions,
  TableBatchActionsConfig,
  TableBatchActionsContext,
  TableColumn,
  TableFilter,
  TableFilterBar,
  TableFilterItem,
  TableFilterOperator,
  TableFilterOption,
  TableToolbar,
  TableToolbarButtonConfig,
  TableToolbarConfig,
  TableViewItem,
  TableViews,
  TableViewsConfig,
} from "../../data-display/Table.types";
import { Button } from "../../general/Button";
import { InputSearch } from "../../data-entry/InputSearch";
import { Select } from "../../data-entry/Select";

// ── Type-guard helpers ──────────────────────────────────────────────

export function isTableToolbarConfig(
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

export function isTableViewsConfig(
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

export function isTableBatchActionsConfig<TData>(
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

export function isToolbarButtonConfig(
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

export function isFilterItems(
  filterBar: TableFilterBar | undefined,
): filterBar is TableFilterItem[] {
  return Array.isArray(filterBar);
}

// ── Rendering helpers ───────────────────────────────────────────────

export function renderTableViews(
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

export function renderToolbarPrimaryAction(
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

export function renderTableToolbar(
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

// ── Filter helpers ──────────────────────────────────────────────────

export function operatorSymbol(operator: TableFilterOperator | undefined): string {
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

export function renderFilterBar(filterBar: TableFilterBar, label: string) {
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

export function labelForColumn<TData>(
  column: TableColumn<TData, unknown>,
  key: string,
): ReactNode {
  if (column.meta?.filterLabel !== undefined) return column.meta.filterLabel;
  if (typeof column.header === "string") return column.header;
  return key;
}

export function valueLabelFor(
  optionList: TableFilterOption[] | undefined,
  value: TableFilter["value"],
) {
  const option = optionList?.find((item) => item.value === String(value));
  return option?.label ?? value;
}

export function deriveFilterBar<TData>(
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
            ? (value: string) =>
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

// ── Chrome sub-components ───────────────────────────────────────────

interface ViewTabsProps {
  config: TableViewsConfig;
  items: TableViewItem[];
  applyView: (view: TableViewItem) => void;
  deleteView: (view: TableViewItem) => void;
  saveView: () => void;
  defaultSaveLabel: string;
  defaultDeleteLabel: string;
}

export function ViewTabs(props: ViewTabsProps) {
  return (
    <div className="tbl-views">
      {renderTableViews(
        props.config,
        props.items,
        props.applyView,
        props.deleteView,
        props.saveView,
        props.defaultSaveLabel,
        props.defaultDeleteLabel,
      )}
    </div>
  );
}

interface ToolbarBarProps {
  toolbar: TableToolbar;
  t: (key: string, options?: Record<string, unknown>) => string;
  onOpenColumns: () => void;
}

export function ToolbarBar(props: ToolbarBarProps) {
  const content = renderTableToolbar(props.toolbar, props.t, props.onOpenColumns);
  if (content === null) return null;
  return <div className="table-toolbar">{content}</div>;
}

interface BatchActionBandProps<TData> {
  batchConfig: TableBatchActionsConfig<TData>;
  selectableRows: Row<TData>[];
  selectedRows: Row<TData>[];
  allVisibleSelected: boolean;
  selectAllVisible: () => void;
  clearSelection: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function BatchActionBand<TData>(props: BatchActionBandProps<TData>) {
  const {
    batchConfig,
    selectableRows,
    selectedRows,
    allVisibleSelected,
    selectAllVisible,
    clearSelection,
    t,
  } = props;
  if (batchConfig.selectedRowKeys.length === 0) return null;
  const context: TableBatchActionsContext<TData> = {
    selectedRowKeys: batchConfig.selectedRowKeys,
    selectedRows,
    totalSelectableCount: selectableRows.length,
    selectAllVisible,
    clearSelection,
  };
  const actions =
    typeof batchConfig.actions === "function"
      ? batchConfig.actions(context)
      : batchConfig.actions;
  return (
    <div className="tbl-batch-bar">
      <span className="count">
        {batchConfig.selectedLabel?.(batchConfig.selectedRowKeys.length) ??
          t("table.selectedRows", {
            count: batchConfig.selectedRowKeys.length,
          })}
      </span>
      {!allVisibleSelected && selectableRows.length > 0 && (
        <Button size="small" variant="ghost" onClick={selectAllVisible}>
          {batchConfig.selectAllLabel?.(selectableRows.length) ??
            t("table.selectAllVisible", { count: selectableRows.length })}
        </Button>
      )}
      {actions}
      <span className="spacer" />
      <Button size="small" variant="ghost" onClick={clearSelection}>
        {batchConfig.clearLabel ?? t("table.clearSelection")}
      </Button>
    </div>
  );
}

interface FilterChipBarProps {
  items: TableFilterBar;
  label: string;
  onResetFilters?: () => void;
  resetLabel: string;
}

export function FilterChipBar(props: FilterChipBarProps) {
  const { items, label, onResetFilters, resetLabel } = props;
  if (items === undefined) return null;
  if (isFilterItems(items) && items.length === 0) return null;
  return (
    <div className="tbl-filter-bar">
      {renderFilterBar(items, label)}
      {onResetFilters !== undefined && (
        <Button size="x-small" variant="ghost" onClick={onResetFilters}>
          {resetLabel}
        </Button>
      )}
    </div>
  );
}
