// DataGrid — TanStack Table adapter (lives ONLY on the @godxjp/ui/data-grid subpath, never the
// runtime-neutral core). Built for SERVER / AJAX data: defaults to manual sorting/filtering/
// pagination so you wire the table state straight to your query, while the grid owns the UI state
// it should own (column visibility, selection, density). Renders with the styled @godxjp/ui
// Table* primitives, so it matches DataTable visually.
//
// Compound API (children of <DataGrid>):
//   <DataGrid.Toolbar>      — left status / right controls row
//   <DataGrid.Search>       — global-filter search box (debounced)
//   <DataGrid.ViewOptions>  — column show/hide menu ("set view")
//   <DataGrid.BulkActions>  — rendered only when rows are selected
//   <DataGrid.DensityToggle>— compact ↔ comfortable
//   <DataGrid.Content>      — the table (auto-included when omitted)
//   <DataGrid.Pagination>   — page-size select + numbered prev/next
import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type RowData,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Layers,
  Layers2,
  SlidersHorizontal,
} from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { densityClass } from "../../lib/variants";
import { tableCellPaddingClass, tableRowHeightClass } from "../../lib/control-styles";
import { Flex } from "../layout/flex";
import { Button } from "../general/button";
import { Checkbox } from "../data-entry/checkbox";
import { SearchInput } from "../data-entry/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../data-entry/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../navigation/dropdown-menu";
import { EmptyState } from "../data-display/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../data-display/table";
import type { TableDensityProp } from "../../props/vocabulary";

export type DataGridDensity = TableDensityProp;
export type { ColumnDef } from "@tanstack/react-table";

// Column-level `meta.label` — a human label for the "set view" column-visibility menu when the
// header is a JSX node rather than a plain string.
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- generics required by the augmented interface signature
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: React.ReactNode;
  }
}

interface DataGridContextValue<T> {
  table: TanstackTable<T>;
  density: DataGridDensity;
  setDensity: (d: DataGridDensity) => void;
  loading: boolean;
  empty?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

const DataGridContext = React.createContext<DataGridContextValue<unknown> | null>(null);

function useDataGrid<T>() {
  const ctx = React.useContext(DataGridContext) as DataGridContextValue<T> | null;
  if (!ctx) throw new Error("DataGrid.* must be used inside <DataGrid>");
  return ctx;
}

export interface DataGridProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  getRowId?: (row: T) => string;
  /** Stable id key when getRowId is omitted (defaults to "id"). */
  rowIdKey?: keyof T & string;
  // ── server (manual) mode: pass the slice of state you drive from your query ──
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  /** Total server row count (manual pagination) — drives the page count. */
  rowCount?: number;
  // ── UI state the grid owns (controlled optional) ──
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  enableRowSelection?: boolean;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  // ── flags: default to SERVER mode (manual). Set false for in-browser data. ──
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  density?: DataGridDensity;
  onDensityChange?: (d: DataGridDensity) => void;
  loading?: boolean;
  empty?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  children?: React.ReactNode;
}

interface DataGridComponent {
  <T>(props: DataGridProps<T>): React.ReactElement;
  Toolbar: React.FC<{ children?: React.ReactNode; className?: string }>;
  Search: React.FC<{ placeholder?: string; className?: string }>;
  ViewOptions: React.FC<{ className?: string }>;
  BulkActions: React.FC<{ children: (count: number) => React.ReactNode }>;
  DensityToggle: React.FC;
  Content: React.FC;
  Pagination: React.FC<{ pageSizeOptions?: number[]; className?: string }>;
  displayName?: string;
}

export const DataGrid = function DataGridRoot<T>({
  columns,
  data,
  getRowId,
  rowIdKey = "id" as keyof T & string,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  pagination,
  onPaginationChange,
  rowCount,
  rowSelection,
  onRowSelectionChange,
  enableRowSelection = false,
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange,
  manualSorting = true,
  manualFiltering = true,
  manualPagination = true,
  density: densityProp,
  onDensityChange,
  loading = false,
  empty,
  onRowClick,
  className,
  children,
}: DataGridProps<T>) {
  const [internalDensity, setInternalDensity] = React.useState<DataGridDensity>("comfortable");
  const density = densityProp ?? internalDensity;
  const setDensity = (d: DataGridDensity) => {
    if (!densityProp) setInternalDensity(d);
    onDensityChange?.(d);
  };

  // Every state slice is controlled with an internal fallback: pass the prop + onChange to drive
  // it from your query (server mode), or omit both and the grid manages it (client mode). A
  // partially-controlled `state` with a missing onChange would otherwise freeze that slice.
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [internalFilters, setInternalFilters] = React.useState<ColumnFiltersState>([]);
  const [internalGlobal, setInternalGlobal] = React.useState("");
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [internalSelection, setInternalSelection] = React.useState<RowSelectionState>({});
  const [internalVisibility, setInternalVisibility] = React.useState<VisibilityState>({});

  const resolveRowId = React.useCallback(
    (row: T) => (getRowId ? getRowId(row) : String((row as Record<string, unknown>)[rowIdKey])),
    [getRowId, rowIdKey],
  );

  const table = useReactTable<T>({
    data,
    columns,
    getRowId: resolveRowId,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    manualSorting,
    manualFiltering,
    manualPagination,
    rowCount,
    enableRowSelection,
    state: {
      sorting: sorting ?? internalSorting,
      columnFilters: columnFilters ?? internalFilters,
      globalFilter: globalFilter ?? internalGlobal,
      pagination: pagination ?? internalPagination,
      rowSelection: rowSelection ?? internalSelection,
      columnVisibility: columnVisibilityProp ?? internalVisibility,
    },
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalFilters,
    onGlobalFilterChange: onGlobalFilterChange ?? setInternalGlobal,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    onRowSelectionChange: onRowSelectionChange ?? setInternalSelection,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalVisibility,
  });

  const ctx: DataGridContextValue<T> = {
    table,
    density,
    setDensity,
    loading,
    empty,
    onRowClick,
  };

  return (
    <DataGridContext.Provider value={ctx as DataGridContextValue<unknown>}>
      <div
        className={cn(
          "ui-data-table-root",
          densityClass[density === "compact" ? "compact" : "comfortable"],
          className,
        )}
      >
        {children ?? <DataGrid.Content />}
      </div>
    </DataGridContext.Provider>
  );
} as DataGridComponent;
DataGrid.displayName = "DataGrid";

// ── Toolbar ──────────────────────────────────────────────────────────────
DataGrid.Toolbar = function DataGridToolbar({ children, className }) {
  return (
    <Flex
      direction="row"
      align="center"
      justify="between"
      gap="sm"
      wrap
      className={cn("ui-data-table-toolbar", className)}
    >
      {children}
    </Flex>
  );
};
(DataGrid.Toolbar as React.FC).displayName = "DataGrid.Toolbar";

// ── Search (global filter) ───────────────────────────────────────────────
DataGrid.Search = function DataGridSearch({ placeholder, className }) {
  const { table } = useDataGrid();
  const { t } = useTranslation();
  const value = (table.getState().globalFilter as string) ?? "";
  return (
    <SearchInput
      value={value}
      onValueChange={(q) => table.setGlobalFilter(q)}
      onSearch={(q) => table.setGlobalFilter(q)}
      placeholder={placeholder ?? t("dataGrid.searchPlaceholder")}
      ariaLabel={t("dataGrid.search")}
      className={className}
    />
  );
};
(DataGrid.Search as React.FC).displayName = "DataGrid.Search";

// ── ViewOptions (column visibility / "set view") ─────────────────────────
DataGrid.ViewOptions = function DataGridViewOptions({ className }) {
  const { table } = useDataGrid();
  const { t } = useTranslation();
  const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide());
  if (hideable.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />
          {t("dataGrid.view")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("dataGrid.toggleColumns")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(v) => column.toggleVisibility(!!v)}
          >
            {columnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
(DataGrid.ViewOptions as React.FC).displayName = "DataGrid.ViewOptions";

function columnLabel(column: {
  id: string;
  columnDef: { meta?: unknown; header?: unknown };
}): React.ReactNode {
  const meta = column.columnDef.meta as { label?: React.ReactNode } | undefined;
  if (meta?.label) return meta.label;
  if (typeof column.columnDef.header === "string") return column.columnDef.header;
  return column.id;
}

// ── BulkActions ──────────────────────────────────────────────────────────
DataGrid.BulkActions = function DataGridBulkActions({ children }) {
  const { table } = useDataGrid();
  const count = table.getSelectedRowModel().rows.length;
  if (count === 0) return null;
  return (
    <Flex direction="row" align="center" gap="sm">
      {children(count)}
    </Flex>
  );
};
(DataGrid.BulkActions as React.FC).displayName = "DataGrid.BulkActions";

// ── DensityToggle ────────────────────────────────────────────────────────
DataGrid.DensityToggle = function DataGridDensityToggle() {
  const { density, setDensity } = useDataGrid();
  const { t } = useTranslation();
  const next: DataGridDensity = density === "compact" ? "comfortable" : "compact";
  const Icon = density === "compact" ? Layers : Layers2;
  const nextLabel =
    next === "compact" ? t("dataTable.densityCompact") : t("dataTable.densityComfortable");
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setDensity(next)}
      aria-label={t("dataTable.densitySwitch", { density: nextLabel })}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {density === "compact" ? t("dataTable.densityCompact") : t("dataTable.densityComfortable")}
    </Button>
  );
};
(DataGrid.DensityToggle as React.FC).displayName = "DataGrid.DensityToggle";

// ── Content (the table) ──────────────────────────────────────────────────
DataGrid.Content = function DataGridContent() {
  const { table, loading, empty, onRowClick } = useDataGrid();
  const { t } = useTranslation();
  const leafCount = table.getVisibleLeafColumns().length;
  const enableSelection = table.options.enableRowSelection;
  const colSpan = leafCount + (enableSelection ? 1 : 0);

  const isInteractive = (target: HTMLElement) =>
    !!target.closest("button, a, input, select, textarea, [role=menuitem], [role=checkbox]");

  return (
    <div className="ui-data-table-scroll" aria-busy={loading}>
      <div className="ui-data-table-surface min-w-[640px] sm:min-w-0">
        <Table>
          <TableHeader className="bg-secondary sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {enableSelection && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        table.getIsAllPageRowsSelected()
                          ? true
                          : table.getIsSomePageRowsSelected()
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                      aria-label={t("dataTable.selectAll")}
                    />
                  </TableHead>
                )}
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        canSort
                          ? sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : "none"
                          : undefined
                      }
                      className={cn(canSort && "select-none")}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="ui-data-table-sort-button focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm focus-visible:ring-2"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3" aria-hidden="true" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3" aria-hidden="true" />
                          ) : (
                            <ChevronsUpDown
                              className="text-muted-foreground size-3"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="h-32 text-center" aria-live="polite">
                  <span className="text-muted-foreground text-sm">{t("dataTable.loading")}</span>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="ui-data-table-empty" aria-live="polite">
                  {empty ?? <EmptyState title={t("dataTable.empty")} />}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const selected = row.getIsSelected();
                return (
                  <TableRow
                    key={row.id}
                    data-state={selected ? "selected" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={(e) => {
                      if (isInteractive(e.target as HTMLElement)) return;
                      onRowClick?.(row.original);
                    }}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key !== "Enter" && e.key !== " ") return;
                            if (e.target !== e.currentTarget) return;
                            e.preventDefault();
                            onRowClick(row.original);
                          }
                        : undefined
                    }
                    className={cn(
                      tableRowHeightClass,
                      onRowClick &&
                        "hover:bg-muted/50 focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                      selected && "bg-muted/30",
                    )}
                  >
                    {enableSelection && (
                      <TableCell className={tableCellPaddingClass}>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(v) => row.toggleSelected(!!v)}
                          aria-label={t("dataTable.selectRow", { id: row.id })}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={tableCellPaddingClass}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
(DataGrid.Content as React.FC).displayName = "DataGrid.Content";

// ── Pagination (page-size + numbered) ────────────────────────────────────
DataGrid.Pagination = function DataGridPagination({
  pageSizeOptions = [10, 20, 50, 100],
  className,
}) {
  const { table } = useDataGrid();
  const { t } = useTranslation();
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <Flex
      direction="row"
      align="center"
      justify="between"
      gap="md"
      wrap
      className={cn("ui-data-table-pagination", className)}
    >
      <Flex direction="row" align="center" gap="sm">
        <span className="text-muted-foreground text-sm">{t("dataGrid.rowsPerPage")}</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v: string) => table.setPageSize(Number(v))}
        >
          <SelectTrigger size="sm" aria-label={t("dataGrid.rowsPerPage")} className="tabular-nums">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((n) => (
              <SelectItem key={n} value={String(n)} className="tabular-nums">
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Flex>
      <Flex direction="row" align="center" gap="sm">
        <span className="text-muted-foreground text-sm tabular-nums">
          {t("dataGrid.pageOf", { page: pageIndex + 1, total: Math.max(1, pageCount) })}
        </span>
        <Button
          variant="outline"
          size="icon"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          aria-label={t("common.previous") ?? "Previous"}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          aria-label={t("common.next") ?? "Next"}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </Flex>
    </Flex>
  );
};
(DataGrid.Pagination as React.FC).displayName = "DataGrid.Pagination";
