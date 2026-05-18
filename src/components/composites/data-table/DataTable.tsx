/**
 * @godxjp/ui DataTable — packaged-table composite.
 *
 * Stage 4b of the Table refactor (Plan §3). Renders the chrome
 * (views, toolbar, filter chips, batch action band, pagination,
 * column manager Sheet, save-view Dialog) around the slim
 * `<Table>` primitive. The TanStack instance is built by
 * `useDataTable` and passed in via the `instance` prop so primitive
 * and composite share state.
 */
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../cn";
import {
  Table,
  type TableToolbarConfig,
  type TableViewItem,
} from "../../data-display/Table";
import { Button } from "../../general/Button";
import { Empty } from "../../data-display/Empty";
import {
  BatchActionBand,
  FilterChipBar,
  ToolbarBar,
  ViewTabs,
  deriveFilterBar,
  isFilterItems,
  isTableBatchActionsConfig,
  isTableViewsConfig,
} from "./DataTableChrome";
import { ColumnManagerSheet } from "./ColumnManagerSheet";
import { DataTablePaginationBand } from "./DataTablePaginationBand";
import { SaveViewDialog } from "./SaveViewDialog";
import type {
  DataTableProps,
  DataTableSlots,
} from "./DataTable.types";
import type { DataTableInstance } from "./useDataTable";

export type { DataTableProps, DataTableSlots } from "./DataTable.types";

function applySlots<TData>(
  instance: DataTableInstance<TData>,
  slots: DataTableSlots | undefined,
): DataTableInstance<TData>["chromeProps"]["toolbar"] {
  const toolbar = instance.chromeProps.toolbar;
  if (slots?.toolbar !== undefined) return slots.toolbar;
  if (
    toolbar === undefined ||
    toolbar === false ||
    typeof toolbar !== "object" ||
    toolbar === null ||
    Array.isArray(toolbar) ||
    "props" in (toolbar as object)
  )
    return toolbar;
  if (slots?.primaryAction === undefined && slots?.toolbarActions === undefined)
    return toolbar;
  // After the guards above, toolbar is a TableToolbarConfig object.
  const config = toolbar as TableToolbarConfig;
  return {
    ...config,
    primaryAction: slots?.primaryAction ?? config.primaryAction,
    actions: slots?.toolbarActions ?? config.actions,
  };
}

export function DataTable<TData>({
  table,
  slots,
  className,
  containerClassName,
}: DataTableProps<TData>) {
  const { t } = useTranslation();
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [saveViewOpen, setSaveViewOpen] = useState(false);

  const tableProps = table.tableProps;
  const chrome = table.chromeProps;
  const instance = table.instance;
  const views = table.views;

  const toolbar = applySlots(table, slots);
  const viewsConfig = isTableViewsConfig(chrome.views) ? chrome.views : undefined;
  const viewsContent = chrome.views;
  const viewItems = useMemo<TableViewItem[]>(
    () =>
      viewsConfig === undefined
        ? []
        : [...viewsConfig.items],
    [viewsConfig],
  );

  // ── Batch action band wiring (composite-owned) ──────────────────
  const batchConfig = isTableBatchActionsConfig<TData>(chrome.batchActions)
    ? chrome.batchActions
    : undefined;
  const selectedRowKeySet = new Set(batchConfig?.selectedRowKeys ?? []);
  const rows = instance.getRowModel().rows;
  const selectableRows = rows.filter(
    (row) => batchConfig?.getCheckboxDisabled?.(row) !== true,
  );
  const selectedRows = rows.filter((row) => selectedRowKeySet.has(row.id));
  const allVisibleSelected =
    selectableRows.length > 0 &&
    selectableRows.every((row) => selectedRowKeySet.has(row.id));
  const selectAllVisible = () => {
    if (batchConfig === undefined) return;
    const next = new Set(batchConfig.selectedRowKeys);
    if (allVisibleSelected)
      selectableRows.forEach((row) => next.delete(row.id));
    else selectableRows.forEach((row) => next.add(row.id));
    batchConfig.onSelectedRowKeysChange(Array.from(next));
  };
  const clearSelection = () => batchConfig?.onSelectedRowKeysChange([]);

  // ── Filter chip bar (auto-derived or custom) ────────────────────
  const activeFilterBar =
    chrome.filterBar ??
    deriveFilterBar(tableProps.columns, chrome.filters, chrome.onFiltersChange);
  const hasFilterBar =
    activeFilterBar !== undefined &&
    (!isFilterItems(activeFilterBar) || activeFilterBar.length > 0);

  // ── Save-view callbacks ─────────────────────────────────────────
  const applyView = (view: TableViewItem) => {
    viewsConfig?.onActiveKeyChange?.(view.key);
    viewsConfig?.onViewApply?.(view);
  };
  const deleteView = (view: TableViewItem) => {
    if (chrome.savedViews.some((item) => item.key === view.key)) {
      chrome.setSavedViews(
        chrome.savedViews.filter((item) => item.key !== view.key),
      );
      if (
        viewsConfig?.activeKey === view.key &&
        viewsConfig.items[0] !== undefined
      )
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
    setSaveViewOpen(true);
  };
  const confirmSaveView = (label: string) => {
    const nextView: TableViewItem = {
      key: `saved-${Date.now()}`,
      label,
      deletable: true,
      ...chrome.currentViewSnapshot,
    };
    chrome.setSavedViews([...chrome.savedViews, nextView]);
    viewsConfig?.onActiveKeyChange?.(nextView.key);
    setSaveViewOpen(false);
  };

  // ── Toolbar config: detect columns button to open Sheet ─────────
  const hasColumnsButton =
    typeof toolbar === "object" &&
    toolbar !== null &&
    !Array.isArray(toolbar) &&
    "columns" in toolbar &&
    toolbar.columns !== undefined &&
    toolbar.columns !== false &&
    toolbar.columns.onClick === undefined;

  // ── Empty state with reset-filters action ───────────────────────
  const emptyContent: ReactNode =
    slots?.emptyState ??
    tableProps.empty ??
    (
      <Empty description={t("table.emptyDescription")}>
        {hasFilterBar && chrome.onResetFilters !== undefined && (
          <Button size="small" variant="outline" onClick={chrome.onResetFilters}>
            {t("table.resetFilters")}
          </Button>
        )}
      </Empty>
    );

  // ── Build batchActions prop to forward to <Table> (for checkbox column) ──
  // The primitive needs the selection state to render the checkbox
  // column; the chrome batch-action band is rendered here separately.
  const batchActionsForPrimitive = chrome.batchActions;

  // touch the unused-locally-derived `views` so lint stays calm.
  void views;
  void viewItems;

  return (
    <div
      className={cn("table-stack", containerClassName, tableProps.containerClassName)}
      data-density={tableProps.density}
    >
      {viewsConfig !== undefined && (
        <ViewTabs
          config={viewsConfig}
          items={viewsConfig.items}
          applyView={applyView}
          deleteView={deleteView}
          saveView={openSaveView}
          defaultSaveLabel={t("table.saveView")}
          defaultDeleteLabel={t("table.deleteView")}
        />
      )}
      {viewsContent !== undefined && viewsConfig === undefined && viewsContent !== false && (
        <div className="tbl-views">{viewsContent as ReactNode}</div>
      )}
      {toolbar !== undefined && toolbar !== false && (
        <ToolbarBar
          toolbar={toolbar}
          t={t}
          onOpenColumns={() => setColumnSettingsOpen(true)}
        />
      )}
      {batchConfig !== undefined && (
        <BatchActionBand
          batchConfig={batchConfig}
          selectableRows={selectableRows}
          selectedRows={selectedRows}
          allVisibleSelected={allVisibleSelected}
          selectAllVisible={selectAllVisible}
          clearSelection={clearSelection}
          t={t}
        />
      )}
      {hasFilterBar && (
        <FilterChipBar
          items={activeFilterBar}
          label={t("table.conditions")}
          onResetFilters={chrome.onResetFilters}
          resetLabel={t("table.resetFilters")}
        />
      )}
      <Table
        {...tableProps}
        instance={instance}
        batchActions={batchActionsForPrimitive}
        className={cn(tableProps.className, className)}
        empty={emptyContent}
        footer={slots?.footer ?? tableProps.footer}
      />
      {chrome.pagination !== undefined && (
        <DataTablePaginationBand config={chrome.pagination} t={t} />
      )}
      {hasColumnsButton && columnSettingsOpen && (
        <ColumnManagerSheet
          open={columnSettingsOpen}
          onOpenChange={setColumnSettingsOpen}
          table={instance}
          autoColumnPinning={chrome.autoColumnPinning}
          columnPinning={chrome.columnPinning}
          onColumnPinningChange={chrome.setColumnPinning}
        />
      )}
      {viewsConfig !== undefined &&
        viewsConfig.onSaveCurrent === undefined &&
        saveViewOpen && (
          <SaveViewDialog
            open={saveViewOpen}
            onOpenChange={setSaveViewOpen}
            defaultName={chrome.saveViewDefaultName(1)}
            duplicateView={chrome.duplicateView}
            onConfirm={confirmSaveView}
          />
        )}
    </div>
  );
}
