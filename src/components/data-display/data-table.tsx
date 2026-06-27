// DataTable — the one compound, TanStack-powered admin list component.
//
// Encapsulates: sticky header, density toggle, per-row click navigation, bulk
// selection, empty/loading states, sorting, global search, column visibility,
// and BOTH cursor and numbered pagination. Internally driven by
// `@tanstack/react-table` (useReactTable) so sorting / filtering / column
// visibility / pagination / selection are all real table state — but the SIMPLE
// `data` + `columns` (lean ColumnDef) entry path is preserved as the default
// usage, so a consumer who only passes `data` + `columns` still gets a rendered
// table with zero TanStack boilerplate.
//
// Compound API (drop these as children of <DataTable>):
//   <DataTable.Toolbar>       — leading status / trailing controls row
//   <DataTable.Search>        — global-filter search box
//   <DataTable.ViewOptions>   — column show/hide menu ("set view")
//   <DataTable.SelectAll>     — header checkbox bound to selection state
//   <DataTable.BulkActions>   — only rendered when count > 0; sits in the toolbar
//   <DataTable.DensityToggle> — compact ↔ comfortable
//   <DataTable.Content>       — the actual table body (auto-included when omitted)
//   <DataTable.Pagination>    — cursor first/next OR numbered page-size pagination
//   <DataTable.RowActions>    — kebab trigger for a per-row actions menu
//
// Lives on @godxjp/ui/data-display (its own subpath) because it pulls
// @tanstack/react-table; it is intentionally NOT re-exported from the
// runtime-neutral root barrel (src/index.ts / admin) — see check-core-isolation.
import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef as TanstackColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type RowSelectionState,
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
  MoreHorizontal,
  SlidersHorizontal,
} from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Flex } from "../layout/flex";
import { Button } from "../general/button";
import { EmptyState } from "./empty-state";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../data-display/table";
import { cn } from "../../lib/utils";
import { densityClass } from "../../lib/variants";
import {
  controlIconSmClass,
  tableCellPaddingClass,
  tableRowHeightClass,
} from "../../lib/control-styles";
import type { ColumnDefProp, DensityProp, SortStateProp } from "../../props/vocabulary";

// DataTable supports all three density tiers (compact 28 / default 36 /
// comfortable 48) so a 表示密度 control can drive the full set, not just a
// 2-way toggle.
export type Density = DensityProp;

/**
 * Lean column definition — the simple, common-case column API. `render` shapes
 * a cell; `sortable` opts the column into the sort cycle; `align` / `width` /
 * `pin` / `hiddenOnMobile` tune layout; `enableHiding` (default true) lists the
 * column in DataTable.ViewOptions. Adapted to a TanStack column internally.
 */
export type ColumnDef<T> = ColumnDefProp<T>;

// ── lean ColumnDef → TanStack column adapter ───────────────────────────────
// We keep the lean ColumnDef as the public column shape and translate it into a
// TanStack column. The original lean column is stashed in `meta.lean` so the
// (lean-rendered) Content can read render/align/width/pin/hiddenOnMobile back.
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- generics required by the augmented interface signature
  interface ColumnMeta<TData extends RowData, TValue> {
    lean?: ColumnDef<TData>;
  }
}

function toTanstackColumns<T>(columns: ColumnDef<T>[]): TanstackColumnDef<T, unknown>[] {
  return columns.map((col) => ({
    id: col.key,
    accessorFn: (row: T) => (row as Record<string, unknown>)[col.key],
    header: () => col.header,
    enableSorting: !!col.sortable,
    enableHiding: col.enableHiding ?? true,
    enableGlobalFilter: true,
    meta: { lean: col },
  }));
}

interface DataTableContextValue<T = unknown> {
  table: TanstackTable<T>;
  density: Density;
  setDensity: (d: Density) => void;
  selectable: boolean;
  // legacy lean sort surface (controlled): mirrors TanStack sorting one-for-one
  sort?: SortStateProp;
  onSortChange?: (sort: SortStateProp | undefined) => void;
  onRowClick?: (row: T) => void;
  loading: boolean;
  empty?: React.ReactNode;
  striped: boolean;
  hoverable: boolean;
  stickyHeader: boolean;
  rowClassName?: (row: T) => string | undefined;
}

const DataTableContext = React.createContext<DataTableContextValue | null>(null);

function useDataTableContext<T>() {
  const ctx = React.useContext(DataTableContext);
  if (!ctx) throw new Error("DataTable subcomponents must be used inside <DataTable>");
  return ctx as unknown as DataTableContextValue<T>;
}

function useOptionalDataTableContext<T>() {
  return React.useContext(DataTableContext) as unknown as DataTableContextValue<T> | null;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  /** Required when `selectable` is true. Default: assume row.id (typed as any). */
  getRowId?: (row: T) => string;
  selectable?: boolean;
  selected?: Set<string>;
  onSelectChange?: (next: Set<string>) => void;
  onRowClick?: (row: T) => void;
  density?: Density;
  onDensityChange?: (d: Density) => void;
  /** Active sort state (lean surface). Pair with onSortChange for server sort. */
  sort?: SortStateProp;
  onSortChange?: (sort: SortStateProp | undefined) => void;
  /** Global search term, surfaced by DataTable.Search. */
  globalFilter?: string;
  onGlobalFilterChange?: (next: string) => void;
  /** Numbered-pagination state, surfaced by DataTable.Pagination. */
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  /** Total server row count (manual pagination) — drives the page count. */
  rowCount?: number;
  /** Column show/hide state, surfaced by DataTable.ViewOptions. */
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  /**
   * Manual (server) flags. Default `false` so the simple `data`+`columns` case
   * sorts / filters / paginates in-browser with no extra wiring. Set the
   * relevant flag `true` and drive the matching state from your query for
   * server-side sort / filter / pagination.
   */
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  /** Show a loading row instead of data. */
  loading?: boolean;
  /** Custom empty content when `data` is empty; defaults to a built-in EmptyState. */
  empty?: React.ReactNode;
  /** Zebra-stripe the body rows (even rows get a subtle fill). */
  striped?: boolean;
  /** Highlight a row on hover even when it is not clickable (no `onRowClick`). */
  hoverable?: boolean;
  /** Pin the header to the top while the body scrolls. Default true. */
  stickyHeader?: boolean;
  /**
   * Per-row className for state-based row tinting (e.g. flag an invalid or
   * empty record). Returned classes are appended last, so they win over the
   * built-in hover/selected fills. Return `undefined` to leave a row unstyled.
   */
  rowClassName?: (row: T) => string | undefined;
  className?: string;
  children?: React.ReactNode;
}

const noopGetRowId = <T,>(row: T): string => {
  const id = (row as { id?: unknown }).id;
  if (typeof id === "string") return id;
  if (typeof id === "number") return String(id);
  return "";
};

// lean SortStateProp ⇄ TanStack SortingState bridges.
function sortToSortingState(sort: SortStateProp | undefined): SortingState {
  return sort ? [{ id: sort.key, desc: sort.direction === "desc" }] : [];
}
function sortingStateToSort(state: SortingState): SortStateProp | undefined {
  const first = state[0];
  return first ? { key: first.id, direction: first.desc ? "desc" : "asc" } : undefined;
}

export function DataTable<T>({
  data,
  columns,
  getRowId = noopGetRowId,
  selectable = false,
  selected: controlledSelected,
  onSelectChange,
  onRowClick,
  density: controlledDensity,
  onDensityChange,
  sort,
  onSortChange,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  pagination: controlledPagination,
  onPaginationChange,
  rowCount,
  columnVisibility: controlledVisibility,
  onColumnVisibilityChange,
  manualSorting = false,
  manualFiltering = false,
  manualPagination = false,
  loading = false,
  empty,
  striped = false,
  hoverable = false,
  stickyHeader = true,
  rowClassName,
  className,
  children,
}: DataTableProps<T>) {
  const [internalDensity, setInternalDensity] = React.useState<Density>("compact");
  const density = controlledDensity ?? internalDensity;
  const setDensity = (d: Density) => {
    setInternalDensity(d);
    onDensityChange?.(d);
  };

  // Every state slice is controlled with an internal fallback: pass the prop +
  // onChange to drive it from your query, or omit both and the table owns it.
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [internalFilters] = React.useState<ColumnFiltersState>([]);
  const [internalGlobal, setInternalGlobal] = React.useState("");
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [internalSelection, setInternalSelection] = React.useState<RowSelectionState>({});
  const [internalVisibility, setInternalVisibility] = React.useState<VisibilityState>({});

  // ── selection: keep the legacy Set<string> surface, bridged to TanStack. ──
  const selectionFromSet = React.useCallback(
    (set: Set<string>): RowSelectionState => Object.fromEntries([...set].map((id) => [id, true])),
    [],
  );
  const sortingState = sort !== undefined ? sortToSortingState(sort) : internalSorting;
  const rowSelection =
    controlledSelected !== undefined ? selectionFromSet(controlledSelected) : internalSelection;

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sortingState) : updater;
    if (sort !== undefined || onSortChange) {
      onSortChange?.(sortingStateToSort(next));
    } else {
      setInternalSorting(next);
    }
  };

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater;
    if (controlledSelected !== undefined || onSelectChange) {
      const set = new Set(Object.keys(next).filter((id) => next[id]));
      onSelectChange?.(set);
      if (controlledSelected === undefined) setInternalSelection(next);
    } else {
      setInternalSelection(next);
    }
  };

  const onGlobalFilterChangeFn: OnChangeFn<string> = (updater) => {
    const current = controlledGlobalFilter ?? internalGlobal;
    const next = typeof updater === "function" ? updater(current) : updater;
    if (controlledGlobalFilter !== undefined || onGlobalFilterChange) {
      onGlobalFilterChange?.(next);
      if (controlledGlobalFilter === undefined) setInternalGlobal(next);
    } else {
      setInternalGlobal(next);
    }
  };

  const tanstackColumns = React.useMemo(() => toTanstackColumns(columns), [columns]);

  const table = useReactTable<T>({
    data,
    columns: tanstackColumns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    manualSorting,
    manualFiltering,
    manualPagination,
    rowCount,
    enableRowSelection: selectable,
    state: {
      sorting: sortingState,
      columnFilters: internalFilters,
      globalFilter: controlledGlobalFilter ?? internalGlobal,
      pagination: controlledPagination ?? internalPagination,
      rowSelection,
      columnVisibility: controlledVisibility ?? internalVisibility,
    },
    onSortingChange,
    onGlobalFilterChange: onGlobalFilterChangeFn,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    onRowSelectionChange,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalVisibility,
  });

  const ctx: DataTableContextValue<T> = {
    table,
    density,
    setDensity,
    selectable,
    sort,
    onSortChange,
    onRowClick,
    loading,
    empty,
    striped,
    hoverable,
    stickyHeader,
    rowClassName,
  };

  // Determine if children include a Content slot — if not, render default.
  const hasContent = React.Children.toArray(children).some(
    (c) =>
      React.isValidElement(c) &&
      (c.type as { displayName?: string }).displayName === "DataTable.Content",
  );

  return (
    <DataTableContext.Provider value={ctx as DataTableContextValue}>
      <div className={cn("ui-data-table-root", densityClass[density], className)}>
        {children}
        {!hasContent && <DataTable.Content />}
      </div>
    </DataTableContext.Provider>
  );
}

// ── Toolbar ────────────────────────────────────────────────────────────

DataTable.Toolbar = function DataTableToolbar({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
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
(DataTable.Toolbar as React.FC).displayName = "DataTable.Toolbar";

// ── Search (global filter) ───────────────────────────────────────────────

DataTable.Search = function DataTableSearch({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const { table } = useDataTableContext();
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
(DataTable.Search as React.FC).displayName = "DataTable.Search";

// ── ViewOptions (column visibility / "set view") ─────────────────────────

DataTable.ViewOptions = function DataTableViewOptions({ className }: { className?: string }) {
  const { table } = useDataTableContext();
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
(DataTable.ViewOptions as React.FC).displayName = "DataTable.ViewOptions";

function columnLabel(column: {
  id: string;
  columnDef: { meta?: { lean?: { header?: React.ReactNode } } };
}): React.ReactNode {
  const header = column.columnDef.meta?.lean?.header;
  if (typeof header === "string" && header.length > 0) return header;
  return column.id;
}

// ── SelectAll header checkbox ──────────────────────────────────────────

DataTable.SelectAll = function DataTableSelectAll() {
  const { table, selectable } = useDataTableContext();
  const { t } = useTranslation();
  if (!selectable) return null;
  const allSelected = table.getIsAllPageRowsSelected();
  const someSelected = table.getIsSomePageRowsSelected();
  return (
    <Checkbox
      checked={allSelected ? true : someSelected ? "indeterminate" : false}
      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      aria-label={t("dataTable.selectAll")}
    />
  );
};
(DataTable.SelectAll as React.FC).displayName = "DataTable.SelectAll";

// ── BulkActions — visible when selection > 0 ───────────────────────────

interface BulkActionsProps {
  count?: number;
  /**
   * Render-prop form receives the selected count; plain ReactNode children read
   * the count from selection state and render the built-in "N selected" status.
   */
  children?: React.ReactNode | ((count: number) => React.ReactNode);
  className?: string;
}

DataTable.BulkActions = function DataTableBulkActions({
  count,
  children,
  className,
}: BulkActionsProps) {
  const ctx = useOptionalDataTableContext();
  const { t } = useTranslation();
  const selectedCount = ctx?.table.getSelectedRowModel().rows.length ?? 0;
  const c = count ?? selectedCount;
  if (c === 0) return null;

  // Render-prop form: caller owns the entire bar (count badge + buttons).
  if (typeof children === "function") {
    return (
      <Flex
        direction="row"
        align="center"
        gap="sm"
        role="region"
        aria-label={t("dataTable.bulkActions")}
        className={className}
      >
        {children(c)}
      </Flex>
    );
  }

  // ReactNode form: built-in "N selected" status + the action buttons.
  return (
    <div
      role="region"
      aria-label={t("dataTable.bulkActions")}
      className={cn("ui-data-table-bulk", className)}
    >
      <span className="text-muted-foreground">
        <strong className="text-foreground">{t("common.selectedCount", { count: c })}</strong>
      </span>
      <div className="ui-data-table-bulk-actions">{children}</div>
    </div>
  );
};
(DataTable.BulkActions as React.FC).displayName = "DataTable.BulkActions";

// ── Density toggle ────────────────────────────────────────────────────

DataTable.DensityToggle = function DataTableDensityToggle() {
  const { density, setDensity } = useDataTableContext();
  const { t } = useTranslation();
  const next: Density = density === "compact" ? "comfortable" : "compact";
  const Icon = density === "compact" ? Layers : Layers2;
  const nextLabel =
    next === "compact" ? t("dataTable.densityCompact") : t("dataTable.densityComfortable");
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        setDensity(next);
      }}
      aria-label={t("dataTable.densitySwitch", { density: nextLabel })}
    >
      <Flex direction="row" wrap align="center" gap="xs">
        <Icon className="size-4" aria-hidden="true" />
        {density === "compact" ? t("dataTable.densityCompact") : t("dataTable.densityComfortable")}
      </Flex>
    </Button>
  );
};
(DataTable.DensityToggle as React.FC).displayName = "DataTable.DensityToggle";

// ── Content (the actual table) ─────────────────────────────────────────

DataTable.Content = function DataTableContent() {
  const {
    table,
    selectable,
    sort,
    onSortChange,
    onRowClick,
    loading,
    empty,
    striped,
    hoverable,
    stickyHeader,
    rowClassName,
  } = useDataTableContext();
  const { t } = useTranslation();

  const rowPadding = tableRowHeightClass;
  const cellPadding = tableCellPaddingClass;
  const visibleColumns = table
    .getVisibleLeafColumns()
    .map((c) => c.columnDef.meta?.lean as ColumnDef<unknown> | undefined)
    .filter((c): c is ColumnDef<unknown> => !!c);
  const emptyColSpan = visibleColumns.length + (selectable ? 1 : 0);
  // A pinned inline-end column casts its own separating shadow, so the scroll
  // fade (which would otherwise dim the pinned column) is suppressed.
  const hasPinEnd = visibleColumns.some((col) => col.pin === "end");

  // Active sort for header indicators — prefer the lean `sort` prop, else read
  // it back from the internal TanStack sorting state.
  const activeSort = sort ?? sortingStateToSort(table.getState().sorting);
  const isControlledSort = sort !== undefined || !!onSortChange;

  const onHeaderClick = (col: ColumnDef<unknown>) => {
    if (!col.sortable) return;
    // Lean controlled-sort surface: mirror the original three-step cycle so a
    // server-driven table calls onSortChange(undefined) on the third click.
    if (isControlledSort) {
      if (activeSort?.key !== col.key) {
        onSortChange?.({ key: col.key, direction: "asc" });
      } else if (activeSort.direction === "asc") {
        onSortChange?.({ key: col.key, direction: "desc" });
      } else {
        onSortChange?.(undefined);
      }
      return;
    }
    // Client mode (no controlled sort surface): TanStack owns the sort cycle.
    table.getColumn(col.key)?.toggleSorting();
  };

  const dataRows = table.getRowModel().rows;
  const rowCount = dataRows.length;

  return (
    <div
      className={cn("ui-data-table-scroll", hasPinEnd && "ui-data-table-has-pin-end")}
      aria-busy={loading}
    >
      <div
        className="ui-data-table-surface min-w-[640px] sm:min-w-0"
        data-striped={striped ? "" : undefined}
        data-hoverable={hoverable ? "" : undefined}
      >
        <Table>
          <TableHeader className={cn("bg-secondary", stickyHeader && "sticky top-0 z-10")}>
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <DataTable.SelectAll />
                </TableHead>
              )}
              {visibleColumns.map((col) => {
                const isSortable = !!col.sortable;
                const isActiveSort = isSortable && activeSort?.key === col.key;
                const sortIndicator = isSortable ? (
                  isActiveSort ? (
                    activeSort?.direction === "asc" ? (
                      <ArrowUp className="size-3" aria-hidden="true" />
                    ) : (
                      <ArrowDown className="size-3" aria-hidden="true" />
                    )
                  ) : (
                    <ChevronsUpDown className="text-muted-foreground size-3" aria-hidden="true" />
                  )
                ) : null;
                const label = (
                  <span className="ui-data-table-sort-label">
                    {col.header}
                    {sortIndicator}
                  </span>
                );
                return (
                  <TableHead
                    key={col.key}
                    data-empty={!col.header || undefined}
                    aria-sort={
                      isSortable
                        ? isActiveSort
                          ? activeSort?.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                        : undefined
                    }
                    className={cn(
                      col.width,
                      col.align === "right" && "text-end",
                      col.align === "center" && "text-center",
                      col.hiddenOnMobile && "hidden md:table-cell",
                      isSortable && "select-none",
                      col.pin === "end" && "ui-data-table-pin-end",
                    )}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        className="ui-data-table-sort-button focus-visible:ring-ring rounded-sm focus-visible:ring-2"
                        onClick={() => {
                          onHeaderClick(col);
                        }}
                      >
                        {label}
                      </button>
                    ) : (
                      label
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Shaped skeleton rows rendered INSIDE the real table grid so they
              // share its borders + column widths — no second framed container
              // (which double-borders when the table sits in a Card). Count is
              // bounded to the previous page so the height barely shifts.
              Array.from({ length: Math.min(Math.max(rowCount, 6), 10) }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className={cn(rowPadding, "hover:bg-transparent")}>
                  {selectable && (
                    <TableCell className={cellPadding}>
                      <div className="ui-skeleton-block size-4 rounded-sm" />
                    </TableCell>
                  )}
                  {visibleColumns.map((col, j) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        cellPadding,
                        col.width,
                        col.align === "right" && "text-end",
                        col.align === "center" && "text-center",
                        col.hiddenOnMobile && "hidden md:table-cell",
                        col.pin === "end" && "ui-data-table-pin-end",
                      )}
                    >
                      <div
                        className={cn(
                          "ui-skeleton-block h-4",
                          j === 0 ? "w-1/2" : "w-3/4",
                          col.align === "right" && "ms-auto",
                          col.align === "center" && "mx-auto",
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rowCount === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={emptyColSpan}
                  className="ui-data-table-empty"
                  aria-live="polite"
                >
                  {empty ?? <EmptyState title={t("dataTable.empty")} />}
                </TableCell>
              </TableRow>
            ) : (
              dataRows.map((row) => {
                const original = row.original as unknown;
                const isSelected = row.getIsSelected();
                const isInteractiveTarget = (target: HTMLElement) =>
                  !!target.closest(
                    "button, a, input, select, textarea, [role=menuitem], [role=checkbox]",
                  );
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected ? "selected" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={(e) => {
                      // Don't trigger row click if user clicked on an interactive child.
                      const target = e.target as HTMLElement;
                      if (isInteractiveTarget(target)) return;
                      onRowClick?.(original as never);
                    }}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key !== "Enter" && e.key !== " ") return;
                            // Let interactive descendants handle their own keys.
                            if (e.target !== e.currentTarget) return;
                            e.preventDefault();
                            onRowClick?.(original as never);
                          }
                        : undefined
                    }
                    className={cn(
                      rowPadding,
                      // Hover highlight when rows are clickable OR explicitly hoverable…
                      (onRowClick || hoverable) && "hover:bg-muted/50",
                      // …but the affordance (cursor + focus ring) only when clickable.
                      onRowClick &&
                        "focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                      isSelected && "bg-muted/30",
                      rowClassName?.(original as never),
                    )}
                  >
                    {selectable && (
                      <TableCell className={cellPadding}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(v) => {
                            row.toggleSelected(!!v);
                          }}
                          aria-label={t("dataTable.selectRow", { id: row.id })}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          cellPadding,
                          col.width,
                          col.align === "right" && "text-end",
                          col.align === "center" && "text-center",
                          col.hiddenOnMobile && "hidden md:table-cell",
                          col.pin === "end" && "ui-data-table-pin-end",
                        )}
                      >
                        {col.render
                          ? col.render(original as never)
                          : (() => {
                              const v = (original as Record<string, unknown>)[col.key];
                              if (v == null) return "—";
                              if (typeof v === "string" || typeof v === "number") return String(v);
                              return "—";
                            })()}
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
(DataTable.Content as React.FC).displayName = "DataTable.Content";

// ── Pagination ─────────────────────────────────────────────────────────
// Two modes, picked by the props you pass:
//   • cursor mode  — <DataTable.Pagination cursor hasMore onChange /> (First/Next)
//   • numbered mode — <DataTable.Pagination pageSizeOptions=[…] /> (page-size +
//     prev/next driven by the internal TanStack pagination state)

interface CursorPaginationProps {
  cursor?: string;
  hasMore: boolean;
  onChange: (cursor: string | undefined) => void;
  className?: string;
  pageSizeOptions?: never;
}

interface NumberedPaginationProps {
  pageSizeOptions?: number[];
  className?: string;
  cursor?: never;
  hasMore?: never;
  onChange?: never;
}

type PaginationProps = CursorPaginationProps | NumberedPaginationProps;

DataTable.Pagination = function DataTablePagination(props: PaginationProps) {
  // Cursor mode is selected when an onChange handler is supplied.
  if ("onChange" in props && typeof props.onChange === "function") {
    return <CursorPagination {...(props as CursorPaginationProps)} />;
  }
  return <NumberedPagination {...(props as NumberedPaginationProps)} />;
};
(DataTable.Pagination as React.FC).displayName = "DataTable.Pagination";

function CursorPagination({ cursor, hasMore, onChange, className }: CursorPaginationProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("ui-data-table-pagination", className)}>
      <Button
        variant="outline"
        size="sm"
        disabled={!cursor}
        onClick={() => {
          onChange(undefined);
        }}
      >
        {t("common.first")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasMore}
        onClick={() => {
          onChange(cursor);
        }}
      >
        {t("common.next")}
      </Button>
    </div>
  );
}

function NumberedPagination({
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: NumberedPaginationProps) {
  const { table } = useDataTableContext();
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
}

// ── More-actions dropdown trigger (kebab) ──────────────────────────────

interface RowActionsProps {
  ariaLabel?: string;
  children: React.ReactNode;
}

/** Kebab menu trigger for per-row actions. Wrap children in a DropdownMenu in
 * the consumer — this is just the trigger button shape. */
DataTable.RowActions = function DataTableRowActions({ ariaLabel, children }: RowActionsProps) {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={ariaLabel ?? t("dataTable.rowActions")}
      className={controlIconSmClass}
    >
      <MoreHorizontal className="size-4" aria-hidden="true" />
      {children}
    </Button>
  );
};
(DataTable.RowActions as React.FC).displayName = "DataTable.RowActions";

// flexRender is re-exported for advanced custom Content compositions that want
// to render a TanStack cell/header definition directly.
export { flexRender };
