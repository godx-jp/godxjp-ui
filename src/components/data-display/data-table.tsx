// DataTable — compound component for admin lists.
//
// Encapsulates: sticky header, density toggle, per-row click navigation, bulk
// selection, empty/loading states, cursor pagination. Use this everywhere
// instead of raw <Table> markup.
//
// Compound API (drop these as children of <DataTable>):
//   <DataTable.Toolbar>     — leading status / trailing controls
//   <DataTable.SelectAll>   — header checkbox bound to selection state
//   <DataTable.BulkActions> — only rendered when count > 0; sits in the toolbar
//   <DataTable.DensityToggle> — compact ↔ comfortable
//   <DataTable.Content>     — the actual table body (auto-included when omitted)
//   <DataTable.Pagination>  — cursor pagination footer
import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Layers, Layers2, MoreHorizontal } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Flex } from "../layout/flex";
import { Button } from "../general/button";
import { EmptyState } from "./empty-state";
import { Checkbox } from "../data-entry/checkbox";
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
import type { ColumnDefProp, TableDensityProp, SortStateProp } from "../../props/vocabulary";

export type Density = TableDensityProp;
export type ColumnDef<T> = ColumnDefProp<T>;

interface DataTableContextValue<T = unknown> {
  data: T[];
  columns: ColumnDef<T>[];
  density: Density;
  setDensity: (d: Density) => void;
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  selectable: boolean;
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  sort?: SortStateProp;
  onSortChange?: (sort: SortStateProp | undefined) => void;
  loading: boolean;
  empty?: React.ReactNode;
  emptyColSpan: number;
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
  sort?: SortStateProp;
  onSortChange?: (sort: SortStateProp | undefined) => void;
  /** Show a loading row instead of data. */
  loading?: boolean;
  /** Custom empty content when `data` is empty; defaults to a built-in EmptyState. */
  empty?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const noopGetRowId = <T,>(row: T): string => {
  const id = (row as { id?: unknown }).id;
  if (typeof id === "string") return id;
  if (typeof id === "number") return String(id);
  return "";
};

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
  loading = false,
  empty,
  className,
  children,
}: DataTableProps<T>) {
  const [internalDensity, setInternalDensity] = React.useState<Density>("compact");
  const density = controlledDensity ?? internalDensity;
  const setDensity = (d: Density) => {
    setInternalDensity(d);
    onDensityChange?.(d);
  };

  const [internalSelected, setInternalSelected] = React.useState<Set<string>>(new Set());
  const selected = controlledSelected ?? internalSelected;
  const setSelected = (next: Set<string>) => {
    setInternalSelected(next);
    onSelectChange?.(next);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  const emptyColSpan = columns.length + (selectable ? 1 : 0);
  const allSelected = data.length > 0 && data.every((r) => selected.has(getRowId(r)));
  const someSelected = !allSelected && data.some((r) => selected.has(getRowId(r)));
  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(data.map(getRowId)));
  };

  const ctx: DataTableContextValue<T> = {
    data,
    columns,
    density,
    setDensity,
    selected,
    toggleSelect,
    toggleSelectAll,
    allSelected,
    someSelected,
    selectable,
    getRowId,
    onRowClick,
    sort,
    onSortChange,
    loading,
    empty,
    emptyColSpan,
  };

  // Determine if children include a Content slot — if not, render default.
  const hasContent = React.Children.toArray(children).some(
    (c) =>
      React.isValidElement(c) &&
      (c.type as { displayName?: string }).displayName === "DataTable.Content",
  );

  return (
    <DataTableContext.Provider value={ctx as DataTableContextValue}>
      <div
        className={cn(
          "ui-data-table-root",
          densityClass[density === "compact" ? "compact" : "comfortable"],
          className,
        )}
      >
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
  return <div className={cn("ui-data-table-toolbar", className)}>{children}</div>;
};
(DataTable.Toolbar as React.FC).displayName = "DataTable.Toolbar";

// ── SelectAll header checkbox ──────────────────────────────────────────

DataTable.SelectAll = function DataTableSelectAll() {
  const { allSelected, someSelected, toggleSelectAll, selectable } = useDataTableContext();
  const { t } = useTranslation();
  if (!selectable) return null;
  return (
    <Checkbox
      checked={allSelected ? true : someSelected ? "indeterminate" : false}
      onCheckedChange={toggleSelectAll}
      aria-label={t("dataTable.selectAll")}
    />
  );
};
(DataTable.SelectAll as React.FC).displayName = "DataTable.SelectAll";

// ── BulkActions — visible when selection > 0 ───────────────────────────

interface BulkActionsProps {
  count?: number;
  children?: React.ReactNode;
  className?: string;
}

DataTable.BulkActions = function DataTableBulkActions({
  count,
  children,
  className,
}: BulkActionsProps) {
  const ctx = useOptionalDataTableContext();
  const { t } = useTranslation();
  const c = count ?? ctx?.selected.size ?? 0;
  if (c === 0) return null;
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
    data,
    columns,
    density: _density,
    selectable,
    selected,
    toggleSelect,
    getRowId,
    onRowClick,
    sort,
    onSortChange,
    loading,
    empty,
    emptyColSpan,
  } = useDataTableContext();
  const { t } = useTranslation();

  const rowPadding = tableRowHeightClass;
  const cellPadding = tableCellPaddingClass;
  // A pinned inline-end column casts its own separating shadow, so the scroll
  // fade (which would otherwise dim the pinned column) is suppressed.
  const hasPinEnd = columns.some((col) => col.pin === "end");

  const onHeaderClick = (col: ColumnDef<unknown>) => {
    if (!col.sortable || !onSortChange) return;
    if (sort?.key !== col.key) {
      onSortChange({ key: col.key, direction: "asc" });
    } else if (sort.direction === "asc") {
      onSortChange({ key: col.key, direction: "desc" });
    } else {
      onSortChange(undefined);
    }
  };

  return (
    <div
      className={cn("ui-data-table-scroll", hasPinEnd && "ui-data-table-has-pin-end")}
      aria-busy={loading}
    >
      <div className="ui-data-table-surface min-w-[640px] sm:min-w-0">
        <Table>
          <TableHeader className="bg-secondary sticky top-0 z-10">
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <DataTable.SelectAll />
                </TableHead>
              )}
              {columns.map((col) => {
                const isSortable = !!col.sortable && !!onSortChange;
                const isActiveSort = isSortable && sort?.key === col.key;
                const sortIndicator = isSortable ? (
                  isActiveSort ? (
                    sort?.direction === "asc" ? (
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
                          ? sort?.direction === "asc"
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
              Array.from({ length: Math.min(Math.max(data.length, 6), 10) }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className={cn(rowPadding, "hover:bg-transparent")}>
                  {selectable && (
                    <TableCell className={cellPadding}>
                      <div className="ui-skeleton-block size-4 rounded-sm" />
                    </TableCell>
                  )}
                  {columns.map((col, j) => (
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
            ) : data.length === 0 ? (
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
              data.map((row) => {
                const id = getRowId(row);
                const isSelected = selected.has(id);
                const isInteractiveTarget = (target: HTMLElement) =>
                  !!target.closest("button, a, input, select, textarea, [role=menuitem]");
                return (
                  <TableRow
                    key={id}
                    data-state={isSelected ? "selected" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={(e) => {
                      // Don't trigger row click if user clicked on an interactive child.
                      const target = e.target as HTMLElement;
                      if (isInteractiveTarget(target)) return;
                      onRowClick?.(row);
                    }}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key !== "Enter" && e.key !== " ") return;
                            // Let interactive descendants handle their own keys.
                            if (e.target !== e.currentTarget) return;
                            e.preventDefault();
                            onRowClick?.(row);
                          }
                        : undefined
                    }
                    className={cn(
                      rowPadding,
                      onRowClick &&
                        "hover:bg-muted/50 focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                      isSelected && "bg-muted/30",
                    )}
                  >
                    {selectable && (
                      <TableCell className={cellPadding}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            toggleSelect(id);
                          }}
                          aria-label={t("dataTable.selectRow", { id })}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
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
                          ? col.render(row)
                          : (() => {
                              const v = (row as Record<string, unknown>)[col.key];
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

interface PaginationProps {
  cursor?: string;
  hasMore: boolean;
  onChange: (cursor: string | undefined) => void;
  className?: string;
}

DataTable.Pagination = function DataTablePagination({
  cursor,
  hasMore,
  onChange,
  className,
}: PaginationProps) {
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
};
(DataTable.Pagination as React.FC).displayName = "DataTable.Pagination";

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
