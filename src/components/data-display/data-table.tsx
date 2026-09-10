// DataTable — the one compound, TanStack-powered admin list component.
//
// Encapsulates: sticky header, density toggle, per-row click navigation, bulk
// selection, the full lifecycle state set (loading · empty · error · denied —
// search, column visibility,
// and BOTH cursor and numbered pagination. Internally driven by
// `@tanstack/react-table` (useTable) so sorting / filtering / column
// visibility / pagination / selection are all real table state — but the SIMPLE
// `data` + `columns` (lean ColumnDef) entry path is preserved as the default
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
  columnFilteringFeature,
  columnVisibilityFeature,
  createCoreRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef as TanstackColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type ReactTable,
} from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Layers,
  Layers2,
  ListFilter,
  MoreHorizontal,
  RefreshCw,
  ShieldAlert,
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../navigation/dropdown-menu";
import { RadioGroupRoot, RadioItem } from "../data-entry/radio";
import { Tooltip, TooltipContent, TooltipTrigger } from "../feedback/tooltip";
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
import type {
  BreakpointProp,
  ColumnCompareProp,
  ColumnDefProp,
  ColumnFilterStateProp,
  ColumnFilterValueProp,
  DensityProp,
  OnColumnFilterChangeProp,
  OnRowProp,
  RowToneProp,
  SortDirectionProp,
  SortStateProp,
  TableExpandableProp,
  TablePaginationProp,
  TablePresetProp,
  TableRowSelectionProp,
  TableScrollProp,
  TableStickyProp,
  TableSummaryProp,
} from "../../props/vocabulary";

// DataTable supports all three density tiers (compact 28 / default 36 /
// comfortable 48) so a 表示密度 control can drive the full set, not just a
// 2-way toggle.
export type Density = DensityProp;

/**
 * Lean column definition — the simple, common-case column API. `render` shapes a cell; `sortable`
 * opts the column into the sort cycle; `align` / `width` / `pin` / `hiddenOnMobile` / `priority`
 * tune layout; `enableHiding` (default true) lists the column in DataTable.ViewOptions.
 */
export type ColumnDef<T> = ColumnDefProp<T>;

// ── lean ColumnDef → TanStack column adapter ───────────────────────────────
// We keep the lean ColumnDef as the public column shape and translate it into a
interface DataTableColumnMeta<T> {
  /**
   * The original lean column. It is THE declared home for every custom column option here
   * (render/align/width/pin/hiddenOnMobile/priority), so `priority` needs no second TanStack
   * channel — Content reads it all back off `meta.lean`.
   */
  lean?: ColumnDef<T>;
}

/**
 * It is a function only so `columnMeta` can carry the row type; the runtime object is identical
 * for every `T`, so callers memoise one per table.
 */
function dataTableFeatures<T>() {
  return tableFeatures({
    rowSortingFeature,
    columnFilteringFeature,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    columnVisibilityFeature,
    coreRowModel: createCoreRowModel(),
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    columnMeta: {} as DataTableColumnMeta<T>,
  });
}

type DataTableFeatures<T> = ReturnType<typeof dataTableFeatures<T>>;

/**
 * A consumer's row is normally an `interface`, and an interface has no index signature, so
 * `DataTable<Order>` would stop compiling for every consumer that did not redeclare `Order` as a
 * type alias — a breaking change for a purely internal upgrade. Intersecting with an indexed type
 * satisfies the constraint without touching the public generic: `T & Record<string, unknown>` is
 * still a subtype of `T`, so `row.original` keeps flowing back out as the consumer's own row type.
 */
type TanstackRow<T> = T & Record<string, unknown>;

/** The TanStack table instance this component drives, with our feature set applied. */
type DataTableInstance<T> = ReactTable<DataTableFeatures<T>, TanstackRow<T>>;

// ── antd sort / filter semantics on the lean column ───────────────────────
// antd is the taxonomy authority (docs/DESIGN-AUTHORITY.md), so the CYCLE, the multi-column
// priority and the filter predicate are antd's, expressed against this library's own
// `SortDirectionProp` (`asc`/`desc`) rather than antd's `ascend`/`descend`.

/** antd's own default cycle (`sortDirections` defaults to `['ascend', 'descend']`). */
const DEFAULT_SORT_DIRECTIONS: readonly SortDirectionProp[] = ["asc", "desc"];

/** `sortable` (this library) and `sorter` (antd) are the same opt-in. */
function columnIsSortable<T>(col: ColumnDef<T>): boolean {
  if (col.sortable) return true;
  if (col.sorter === true || typeof col.sorter === "function") return true;
  return typeof col.sorter === "object" && col.sorter !== null;
}

/** The comparator half of antd's `sorter`, when one was given. */
function columnCompare<T>(col: ColumnDef<T>): ColumnCompareProp<T> | undefined {
  if (typeof col.sorter === "function") return col.sorter;
  if (col.sorter && typeof col.sorter === "object") return col.sorter.compare;
  return undefined;
}

/**
 * antd's `sorter.multiple` — the MULTI-column sort priority. A column without one is a
 * single-column sort and replaces whatever was sorted before, exactly as in antd.
 */
function columnSortPriority<T>(col: ColumnDef<T>): number | undefined {
  return col.sorter && typeof col.sorter === "object" ? col.sorter.multiple : undefined;
}

function columnSortDirections<T>(
  col: ColumnDef<T>,
  tableDirections: readonly SortDirectionProp[] | undefined,
): readonly SortDirectionProp[] {
  const declared = col.sortDirections ?? tableDirections ?? DEFAULT_SORT_DIRECTIONS;
  return declared.length > 0 ? declared : DEFAULT_SORT_DIRECTIONS;
}

/**
 * The next step of antd's three-state cycle: unsorted → `sortDirections[0]` → … → cleared.
 * `undefined` means "cleared", which is why the return type is not `SortDirectionProp`.
 */
function nextSortDirection(
  current: SortDirectionProp | undefined,
  directions: readonly SortDirectionProp[],
): SortDirectionProp | undefined {
  if (!current) return directions[0];
  const at = directions.indexOf(current);
  if (at === -1) return directions[0];
  return directions[at + 1];
}

/**
 * Fold one column's new direction into the sorting state. A column WITH a `multiple` priority
 * joins the multi-sort (ordered by that priority, highest first — antd's rule); a column without
 * one replaces the whole state.
 */
function applySortToState(
  state: SortingState,
  key: string,
  direction: SortDirectionProp | undefined,
  priority: number | undefined,
  priorities: Record<string, number>,
): SortingState {
  if (priority === undefined) {
    return direction ? [{ id: key, desc: direction === "desc" }] : [];
  }
  const kept = state.filter((entry) => entry.id !== key && priorities[entry.id] !== undefined);
  const next = direction ? [...kept, { id: key, desc: direction === "desc" }] : kept;
  return next.sort((a, b) => (priorities[b.id] ?? 0) - (priorities[a.id] ?? 0));
}

/** Read a column's direction back out of the sorting state. */
function directionOf(state: SortingState, key: string): SortDirectionProp | undefined {
  const entry = state.find((s) => s.id === key);
  return entry ? (entry.desc ? "desc" : "asc") : undefined;
}

/**
 * antd's `onFilter` contract: a row survives when it matches ANY selected value. With no
 * `onFilter` the column falls back to equality on `row[key]`, which is the common case and is
 * exactly what antd's docs steer people to write by hand.
 */
function columnFilterPredicate<T>(
  col: ColumnDef<T>,
  row: T,
  values: readonly ColumnFilterValueProp[],
): boolean {
  if (values.length === 0) return true;
  const onFilter = col.onFilter;
  if (onFilter) return values.some((value) => onFilter(value, row));
  const raw = (row as Record<string, unknown>)[col.key];
  return values.some((value) => value === raw || String(value) === String(raw));
}

/**
 * Hold a derived array/object at ONE identity for as long as its VALUE is unchanged.
 *
 * `useTable` watches its `state` slices by identity, and `autoResetPageIndex` fires the moment
 * `columnFilters` looks new — so a filter array rebuilt on every render silently snaps the grid
 * back to page 1 one tick after every page change. The slices below are derived from props on each
 * render by construction (a controlled `filteredValue` / `sortOrder` lives on the COLUMN), so they
 * are re-anchored here instead. Values are primitives, so a serialised compare is exact.
 */
function useStableValue<T>(value: T): T {
  const key = JSON.stringify(value);
  const ref = React.useRef<{ key: string; value: T }>({ key, value });
  if (ref.current.key !== key) ref.current = { key, value };
  return ref.current.value;
}

/** A CSS length from the `number | string` antd accepts for `scroll` / `sticky` offsets. */
function cssLength(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

// Lean columns are translated once into TanStack columns. The original lean column is stashed in
// `meta.lean` so the (lean-rendered) Content can read it back — see DataTableColumnMeta.
function toTanstackColumns<T>(
  columns: ColumnDef<T>[],
): TanstackColumnDef<DataTableFeatures<T>, TanstackRow<T>, unknown>[] {
  return columns.map((col) => {
    const compare = columnCompare(col);
    return {
      id: col.key,
      accessorFn: (row: TanstackRow<T>) => row[col.key],
      header: () => col.header,
      enableSorting: columnIsSortable(col),
      enableHiding: col.enableHiding ?? true,
      enableGlobalFilter: true,
      enableColumnFilter: !!col.filters,
      ...(compare
        ? {
            sortFn: (rowA: { original: TanstackRow<T> }, rowB: { original: TanstackRow<T> }) =>
              compare(rowA.original as T, rowB.original as T),
          }
        : {}),
      filterFn: (row: { original: TanstackRow<T> }, _id: string, filterValue: unknown) =>
        columnFilterPredicate(
          col,
          row.original as T,
          Array.isArray(filterValue) ? (filterValue as ColumnFilterValueProp[]) : [],
        ),
      meta: { lean: col },
    } as TanstackColumnDef<DataTableFeatures<T>, TanstackRow<T>, unknown>;
  });
}

interface DataTableContextValue<T = unknown> {
  table: DataTableInstance<T>;
  density: Density;
  setDensity: (d: Density) => void;
  selectable: boolean;
  // legacy lean sort surface (controlled): mirrors TanStack sorting one-for-one
  sort?: SortStateProp;
  onSortChange?: (sort: SortStateProp | undefined) => void;
  onRowClick?: (row: T) => void;
  loading: boolean;
  empty?: React.ReactNode;
  error?: React.ReactNode;
  denied?: React.ReactNode;
  onRetry?: () => void;
  striped: boolean;
  hoverable: boolean;
  stickyHeader: boolean;
  preset: TablePresetProp;
  collapseBelow: BreakpointProp;
  rowClassName?: (row: T) => string | undefined;
  rowTone?: RowToneProp<T>;
  // ── antd 6.6.2 parity surface ────────────────────────────────────────
  bordered: boolean;
  scroll?: TableScrollProp;
  sticky?: TableStickyProp;
  onRow?: OnRowProp<T>;
  summary?: TableSummaryProp<T>;
  expandable?: TableExpandableProp<T>;
  expandedKeys: string[];
  toggleExpanded: (key: string) => void;
  rowSelection?: TableRowSelectionProp<T>;
  getRowId: (row: T) => string;
  showSorterTooltip: boolean;
  sortDirections?: readonly SortDirectionProp[];
  /** Sort priorities keyed by column — the `sorter.multiple` map used for multi-column sort. */
  sortPriorities: Record<string, number>;
  /** Controlled column filters, keyed by column (antd `filteredValue`). */
  filterValues: Record<string, ColumnFilterStateProp>;
  setFilterValue: (key: string, next: ColumnFilterStateProp) => void;
  paginationConfig?: TablePaginationProp;
  pagerHidden: boolean;
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
  /**
   * Numbered-pagination state, surfaced by DataTable.Pagination. THREE shapes, all accepted:
   * the TanStack `{ pageIndex, pageSize }` this prop has always taken; antd's
   * `TablePaginationConfig` object (`{ current, pageSize, total, pageSizeOptions,
   * showSizeChanger, onChange }`, 1-based like antd); and `false`, which hides the pager
   * entirely (antd `pagination={false}`).
   */
  pagination?: PaginationState | TablePaginationProp | false;
  onPaginationChange?: OnChangeFn<PaginationState>;
  /** Total server row count (manual pagination) — drives the page count. */
  rowCount?: number;
  /** Column show/hide state, surfaced by DataTable.ViewOptions. */
  columnVisibility?: ColumnVisibilityState;
  onColumnVisibilityChange?: OnChangeFn<ColumnVisibilityState>;
  /**
   * Manual (server) flags. Default `false` so the simple `data`+`columns` case sorts / filters
   * in-browser with no extra wiring.
   */
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  /** Show a loading row instead of data. */
  loading?: boolean;
  /** Custom empty content when `data` is empty; defaults to a built-in EmptyState. */
  empty?: React.ReactNode;
  /**
   * `true` renders the built-in localized error message; any other node REPLACES it (e.g. an
   * `Alert` carrying an error code + request id). Pass `undefined`/`false` when the read
   * succeeded.
   */
  error?: React.ReactNode;
  /**
   * `true` renders the built-in localized "no access" message; any other node replaces it.
   * Distinct from `error` so a 403 never offers a pointless retry.
   */
  denied?: React.ReactNode;
  /** Retry handler for the built-in `error` state; omit to hide the retry action. */
  onRetry?: () => void;
  /** Zebra-stripe the body rows (even rows get a subtle fill). */
  striped?: boolean;
  /** Highlight a row on hover even when it is not clickable (no `onRowClick`). */
  hoverable?: boolean;
  /** Pin the header to the top while the body scrolls. Default true. */
  stickyHeader?: boolean;
  /**
   * `"default"` (the default) emits no attribute and matches no selector: an existing DataTable is
   * byte-identical. Mark each column with `priority` on its `ColumnDef`; DataTable stamps it on
   * the `<th>` AND the `<td>` for you.
   */
  preset?: TablePresetProp;
  /** Default `"sm"`. Ignored while `preset` is `"default"`. */
  collapseBelow?: BreakpointProp;
  /**
   * Per-row className for state-based row tinting (e.g. flag an invalid or empty record). Returned
   * classes are appended last, so they win over the built-in hover/selected fills.
   */
  rowClassName?: (row: T) => string | undefined;
  /**
   * Per-row STATE, drawn as a leading-edge rail plus a wash — the same six tone names `Card accent`
   * carries, so a row that needs attention and a card that needs attention read as one vocabulary.
   * Return `undefined` for an ordinary row.
   *
   * This is the token-driven answer to what `rowClassName` could only do with utilities, and
   * `ui-audit` blocks those in a consumer: `rowClassName` matches the gate's `class`-name suffix
   * rule, so every colour and spacing rule scans the arrow body — a leading-edge border utility
   * plus a raw palette fill in there is two errors, not zero. Consumers fell back to a badge in a
   * cell instead.
   *
   * It is never the ONLY signal: colour alone cannot carry meaning (WCAG 1.4.1), so keep the
   * reason in a cell — a Badge, a status column — and let the rail make that cell findable in a
   * long table.
   */
  rowTone?: RowToneProp<T>;
  // ── antd 6.6.2 parity surface ────────────────────────────────────────
  /**
   * Full row-selection configuration (antd `rowSelection`). Supersedes — and can be mixed with —
   * `selectable` / `selected` / `onSelectChange`, which drive the same state.
   */
  rowSelection?: TableRowSelectionProp<T>;
  /** Expandable detail rows (antd `expandable`). */
  expandable?: TableExpandableProp<T>;
  /** Footer totals row (antd `summary`) — rendered in a real `<tfoot>` so it survives sorting. */
  summary?: TableSummaryProp<T>;
  /** Scroll envelope (antd `scroll`) — `x` a minimum inline size, `y` a maximum body block size. */
  scroll?: TableScrollProp;
  /**
   * Sticky header (antd `sticky`). Supersedes `stickyHeader` when given; the object form carries
   * the `offsetHeader` a page-level fixed topbar needs.
   */
  sticky?: TableStickyProp;
  /** Per-row DOM props merged onto the `<tr>` (antd `onRow`). */
  onRow?: OnRowProp<T>;
  /** Draw the outer frame and the vertical rules between columns (antd `bordered`). */
  bordered?: boolean;
  /** Explain the next sort step in a tooltip on every sortable header (antd `showSorterTooltip`). */
  showSorterTooltip?: boolean;
  /** Table-wide sort cycle (antd `sortDirections`); a column's own value wins. */
  sortDirections?: SortDirectionProp[];
  /**
   * Column filters changed (antd hands the same map to `onChange`). Pair it with a column's
   * `filteredValue` to drive filtering from a server query.
   */
  onFilterChange?: OnColumnFilterChangeProp;
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
  pagination: paginationProp,
  onPaginationChange,
  rowCount,
  columnVisibility: controlledVisibility,
  onColumnVisibilityChange,
  manualSorting = false,
  manualFiltering = false,
  manualPagination = false,
  loading = false,
  empty,
  error,
  denied,
  onRetry,
  striped = false,
  hoverable = false,
  stickyHeader = true,
  preset = "default",
  collapseBelow = "sm",
  rowClassName,
  rowTone,
  rowSelection,
  expandable,
  summary,
  scroll,
  sticky,
  onRow,
  bordered = false,
  showSorterTooltip = false,
  sortDirections,
  onFilterChange,
  className,
  children,
}: DataTableProps<T>) {
  const [internalDensity, setInternalDensity] = React.useState<Density>("compact");
  const density = controlledDensity ?? internalDensity;
  const setDensity = (d: Density) => {
    setInternalDensity(d);
    onDensityChange?.(d);
  };

  // ── pagination: three accepted shapes, one internal state ────────────────
  // `false` hides the pager (antd), the antd config object is 1-BASED, and the TanStack
  // `{ pageIndex, pageSize }` shape this prop already took keeps working untouched.
  const pagerHidden = paginationProp === false;
  const paginationConfig =
    paginationProp && typeof paginationProp === "object" && !("pageIndex" in paginationProp)
      ? (paginationProp as TablePaginationProp)
      : undefined;
  const controlledPagination =
    paginationProp && typeof paginationProp === "object" && "pageIndex" in paginationProp
      ? (paginationProp as PaginationState)
      : undefined;

  // Every state slice is controlled with an internal fallback: pass the prop +
  // onChange to drive it from your query, or omit both and the table owns it.
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(() =>
    columns
      .filter((col) => col.defaultSortOrder)
      .map((col) => ({ id: col.key, desc: col.defaultSortOrder === "desc" })),
  );
  const [internalFilters, setInternalFilters] = React.useState<ColumnFiltersState>(() =>
    columns
      .filter((col) => (col.defaultFilteredValue?.length ?? 0) > 0)
      .map((col) => ({ id: col.key, value: col.defaultFilteredValue })),
  );
  const [internalGlobal, setInternalGlobal] = React.useState("");
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: paginationConfig?.pageSize ?? 10,
  });
  const [internalSelection, setInternalSelection] = React.useState<RowSelectionState>(
    () =>
      Object.fromEntries(
        (rowSelection?.defaultSelectedRowKeys ?? []).map((key) => [key, true]),
      ) as RowSelectionState,
  );
  const [internalVisibility, setInternalVisibility] = React.useState<ColumnVisibilityState>({});
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(() =>
    expandable?.defaultExpandAllRows ? data.map(getRowId) : [],
  );

  const pageIndex =
    controlledPagination?.pageIndex ??
    (paginationConfig?.current !== undefined
      ? Math.max(0, paginationConfig.current - 1)
      : internalPagination.pageIndex);
  const pageSize =
    controlledPagination?.pageSize ?? paginationConfig?.pageSize ?? internalPagination.pageSize;
  // Memoised on the two NUMBERS: `useTable` keeps a reactive store keyed on the state object, so
  // handing it a fresh literal every render re-seeds pagination and swallows the page change.
  const resolvedPagination: PaginationState = React.useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize],
  );

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(resolvedPagination) : updater;
    setInternalPagination(next);
    onPaginationChange?.(next);
    paginationConfig?.onChange?.(next.pageIndex + 1, next.pageSize);
  };

  // ── selection: keep the legacy Set<string> surface, bridged to TanStack. ──
  const selectionFromSet = React.useCallback(
    (set: Set<string>): RowSelectionState => Object.fromEntries([...set].map((id) => [id, true])),
    [],
  );

  // ── sorting: antd's per-column `sortOrder` is the strongest controlled surface ──
  const sortPriorities = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const col of columns) {
      const priority = columnSortPriority(col);
      if (priority !== undefined) map[col.key] = priority;
    }
    return map;
  }, [columns]);
  const columnSortOrders = columns.filter((col) => col.sortOrder !== undefined);
  const sortingState = useStableValue<SortingState>(
    columnSortOrders.length > 0
      ? columnSortOrders
          .filter((col) => col.sortOrder)
          .map((col) => ({ id: col.key, desc: col.sortOrder === "desc" }))
          .sort((a, b) => (sortPriorities[b.id] ?? 0) - (sortPriorities[a.id] ?? 0))
      : sort !== undefined
        ? sortToSortingState(sort)
        : internalSorting,
  );

  // ── column filters: antd `filteredValue` (controlled) over the internal state ──
  const controlledFilterKeys = new Set(
    columns.filter((col) => col.filteredValue !== undefined).map((col) => col.key),
  );
  const columnFilters = useStableValue<ColumnFiltersState>([
    ...internalFilters.filter((entry) => !controlledFilterKeys.has(entry.id)),
    ...columns
      .filter((col) => (col.filteredValue?.length ?? 0) > 0)
      .map((col) => ({ id: col.key, value: col.filteredValue as ColumnFilterStateProp })),
  ]);
  const filterValues: Record<string, ColumnFilterStateProp> = Object.fromEntries(
    columnFilters.map((entry) => [entry.id, (entry.value ?? []) as ColumnFilterStateProp]),
  );
  const setFilterValue = (key: string, next: ColumnFilterStateProp) => {
    // A column with `filteredValue` is CONTROLLED (antd's rule): it only reports, never self-sets.
    if (!controlledFilterKeys.has(key)) {
      setInternalFilters((prev) => {
        const rest = prev.filter((entry) => entry.id !== key);
        return next.length > 0 ? [...rest, { id: key, value: next }] : rest;
      });
    }
    const merged = { ...filterValues };
    if (next.length > 0) {
      merged[key] = next;
    } else {
      delete merged[key];
    }
    onFilterChange?.(merged);
  };

  const rowSelectionKeys = rowSelection?.selectedRowKeys;
  const rowSelectionState: RowSelectionState =
    rowSelectionKeys !== undefined
      ? (Object.fromEntries(rowSelectionKeys.map((key) => [key, true])) as RowSelectionState)
      : controlledSelected !== undefined
        ? selectionFromSet(controlledSelected)
        : internalSelection;

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sortingState) : updater;
    if (columnSortOrders.length > 0) {
      // Every direction is owned by the column's own `sortOrder`; report and change nothing.
      onSortChange?.(sortingStateToSort(next));
      return;
    }
    if (sort !== undefined || onSortChange) {
      onSortChange?.(sortingStateToSort(next));
    } else {
      setInternalSorting(next);
    }
  };

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    let next = typeof updater === "function" ? updater(rowSelectionState) : updater;
    // antd `type: "radio"` — a single-choice column, so the newest key wins outright.
    if (rowSelection?.type === "radio") {
      const added = Object.keys(next).filter((key) => next[key] && !rowSelectionState[key]);
      const only = added[added.length - 1];
      next = only ? { [only]: true } : {};
    }
    // antd `preserveSelectedRowKeys` — a key whose row has left `data` (server paging, a filter)
    // stays selected instead of being silently dropped by the page-level toggles.
    if (rowSelection) {
      const onPage = new Set(data.map(getRowId));
      if (rowSelection.preserveSelectedRowKeys) {
        const offPage = Object.keys(rowSelectionState).filter(
          (key) => rowSelectionState[key] && !onPage.has(key),
        );
        next = {
          ...next,
          ...(Object.fromEntries(offPage.map((key) => [key, true])) as RowSelectionState),
        };
      } else {
        // antd's DEFAULT: a key whose row is no longer in `data` is dropped. TanStack keeps it in
        // the record forever, which is how a bulk action silently acts on a row nobody can see.
        next = Object.fromEntries(
          Object.entries(next).filter(([key, on]) => on && onPage.has(key)),
        ) as RowSelectionState;
      }
    }
    const keys = Object.keys(next).filter((key) => next[key]);
    if (rowSelectionKeys === undefined && controlledSelected === undefined) {
      setInternalSelection(next);
    }
    onSelectChange?.(new Set(keys));
    const byId = new Map(data.map((row) => [getRowId(row), row]));
    rowSelection?.onChange?.(
      keys,
      keys.map((key) => byId.get(key)).filter((row): row is T => row !== undefined),
    );
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

  // Client pagination is engaged ONLY when something actually drives it: a
  // composed numbered <DataTable.Pagination> child (cursor mode is server
  // paging — never client-slice it), or externally controlled pagination
  // state.
  // plain `data`+`columns` table to 10 rows with no pager and no warning —
  // No pager, no controlled state → render all rows.
  const hasNumberedPager = React.Children.toArray(children).some(
    (c) =>
      React.isValidElement(c) &&
      (c.type as { displayName?: string }).displayName === "DataTable.Pagination" &&
      typeof (c.props as { onChange?: unknown }).onChange !== "function",
  );
  const paginationEngaged =
    !pagerHidden &&
    (manualPagination ||
      controlledPagination !== undefined ||
      paginationConfig !== undefined ||
      onPaginationChange !== undefined ||
      hasNumberedPager);

  // One feature set per table instance. The object is the same for every T, but the table is
  // built from it, so it must stay referentially stable across renders.
  const features = React.useMemo(() => dataTableFeatures<T>(), []);

  const selectionEnabled = selectable || rowSelection !== undefined;

  const table = useTable<DataTableFeatures<T>, TanstackRow<T>>({
    features,
    data: data as TanstackRow<T>[],
    columns: tanstackColumns,
    getRowId,
    manualSorting,
    manualFiltering,
    // "no pager on this table" is expressed the same way as "the server paginates" — leave the
    // rows unsliced. Page count still derives from `rowCount`/the pre-paginated model either way.
    manualPagination: manualPagination || !paginationEngaged,
    rowCount: paginationConfig?.total ?? rowCount,
    enableRowSelection: selectionEnabled,
    state: {
      sorting: sortingState,
      columnFilters,
      globalFilter: controlledGlobalFilter ?? internalGlobal,
      pagination: resolvedPagination,
      rowSelection: rowSelectionState,
      columnVisibility: controlledVisibility ?? internalVisibility,
    },
    onSortingChange,
    onGlobalFilterChange: onGlobalFilterChangeFn,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalVisibility,
  });

  // ── expandable rows (antd `expandable`) ──────────────────────────────────
  const expandedKeys = expandable?.expandedRowKeys ?? internalExpanded;
  const toggleExpanded = (key: string) => {
    const next = expandedKeys.includes(key)
      ? expandedKeys.filter((k) => k !== key)
      : [...expandedKeys, key];
    if (expandable?.expandedRowKeys === undefined) setInternalExpanded(next);
    expandable?.onExpandedRowsChange?.(next);
  };

  const ctx: DataTableContextValue<T> = {
    table,
    density,
    setDensity,
    selectable: selectionEnabled,
    sort,
    onSortChange,
    onRowClick,
    loading,
    empty,
    error,
    denied,
    onRetry,
    striped,
    hoverable,
    // antd `sticky` supersedes `stickyHeader` whenever it is given (either form of it).
    stickyHeader: sticky === undefined ? stickyHeader : sticky !== false,
    preset,
    collapseBelow,
    rowClassName,
    rowTone,
    bordered,
    scroll,
    sticky,
    onRow,
    summary,
    expandable,
    expandedKeys,
    toggleExpanded,
    rowSelection,
    getRowId,
    showSorterTooltip,
    sortDirections,
    sortPriorities,
    filterValues,
    setFilterValue,
    paginationConfig,
    pagerHidden,
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
  const value = (table.state.globalFilter as string) ?? "";
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

DataTable.ViewOptions = function DataTableViewOptions({
  className,
  label,
}: {
  className?: string;
  /**
   * Overrides the button's text. The default ("View") is the shortest thing
   * that fits a dense toolbar, but a product whose users know the control by a
   * longer name — "View Options", "表示項目" — needs to say that, and hiding a
   * bare text node from the outside is not something CSS can do.
   */
  label?: React.ReactNode;
}) {
  const { table } = useDataTableContext();
  const { t } = useTranslation();
  const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide());
  if (hideable.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <SlidersHorizontal className="ui-data-table-toolbar-icon" aria-hidden="true" />
          {label ?? t("dataGrid.view")}
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

/**
 * `ColumnDef.width` accepts either a utility class or a CSS length. It has always been forwarded
 * straight into `cn()`, so a perfectly reasonable `width: "300px"` became the class name `300px` —
 * which matches nothing.
 */
function columnWidth(width: string | undefined): {
  className?: string;
  style?: React.CSSProperties;
} {
  if (width === undefined || width === "") return {};
  if (/^(?:[\d.]|calc\(|var\(|clamp\(|min\(|max\()/.test(width.trim())) {
    return { style: { width } };
  }
  return { className: width };
}

/** A header slot with no visible text — an action / selection column. */
function isEmptyHeader(header: React.ReactNode): boolean {
  return header == null || header === "" || header === false;
}

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
  const { table, selectable, rowSelection, getRowId } = useDataTableContext();
  const { t } = useTranslation();
  if (!selectable) return null;
  // antd: a `radio` column is single-choice, so it has no header checkbox at all; `hideSelectAll`
  // suppresses it for a checkbox column too (bulk actions live in the toolbar instead).
  if (rowSelection?.type === "radio" || rowSelection?.hideSelectAll) {
    // No header CONTROL — but the <th> still has to have a screen-reader name, or the column is
    // nameless for every row it labels (axe: empty-table-header), the same contract an
    // action column meets through `ariaLabel`.
    return (
      <>
        {rowSelection.columnTitle ?? <span className="sr-only">{t("dataTable.selectColumn")}</span>}
      </>
    );
  }
  const allSelected = table.getIsAllPageRowsSelected();
  const someSelected = table.getIsSomePageRowsSelected();
  const box = (
    <Checkbox
      checked={allSelected ? true : someSelected ? "indeterminate" : false}
      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      aria-label={t("dataTable.selectAll")}
    />
  );
  if (rowSelection?.columnTitle !== undefined) return <>{rowSelection.columnTitle}</>;
  if (!rowSelection?.selections) return box;

  // antd `selections` — the extra bulk-select entries that hang off the header checkbox.
  // `true` asks for antd's own built-in trio (all · invert · none).
  const pageKeys = table.getRowModel().rows.map((row) => getRowId(row.original as never));
  const selectedKeys = table
    .getSelectedRowModel()
    .rows.map((row) => getRowId(row.original as never));
  const builtIn = [
    {
      key: "all",
      text: t("dataTable.selectAll"),
      onSelect: () => table.toggleAllPageRowsSelected(true),
    },
    {
      key: "invert",
      text: t("dataTable.selectInvert"),
      onSelect: () => {
        // ONE state change, not a per-row toggle loop: every toggle in a loop re-applies its
        // updater to the same (stale) record, so only the last row would survive.
        table.setRowSelection(
          Object.fromEntries(
            table
              .getRowModel()
              .rows.filter((row) => !row.getIsSelected())
              .map((row) => [getRowId(row.original as never), true]),
          ),
        );
      },
    },
    {
      key: "none",
      text: t("dataTable.selectNone"),
      onSelect: () => table.toggleAllPageRowsSelected(false),
    },
  ];
  const entries =
    rowSelection.selections === true
      ? builtIn
      : rowSelection.selections.map((entry) => ({
          key: entry.key,
          text: entry.text,
          onSelect: () => entry.onSelect(pageKeys.length > 0 ? pageKeys : selectedKeys),
        }));
  return (
    <span className="ui-data-table-selection-menu">
      {box}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("dataTable.selectionMenu")}
            className="ui-data-table-selection-trigger"
          >
            <ChevronDown className="ui-data-table-sort-icon" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {entries.map((entry) => (
            <DropdownMenuItem key={entry.key} onSelect={entry.onSelect}>
              {entry.text}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
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
        <Icon className="ui-data-table-toolbar-icon" aria-hidden="true" />
        {density === "compact" ? t("dataTable.densityCompact") : t("dataTable.densityComfortable")}
      </Flex>
    </Button>
  );
};
(DataTable.DensityToggle as React.FC).displayName = "DataTable.DensityToggle";

// ── Content (the actual table) ─────────────────────────────────────────

/** The edge a column freezes against — `fixed` (antd) with `pin: "end"` as its older spelling. */
function fixedEdge<T>(col: ColumnDef<T>): "start" | "end" | undefined {
  return col.fixed ?? (col.pin === "end" ? "end" : undefined);
}

function sameOffsets(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((key) => a[key] === b[key]);
}

/**
 * One column's filter menu (antd `filters` / `filteredValue` / `onFilter`). `filterMultiple`
 * false makes it single-choice, which is antd's own switch between a checkbox list and a radio
 * list.
 */
function ColumnFilterMenu<T>({ column }: { column: ColumnDef<T> }) {
  const { filterValues, setFilterValue } = useDataTableContext<T>();
  const { t } = useTranslation();
  const options = column.filters ?? [];
  const active = filterValues[column.key] ?? [];
  const multiple = column.filterMultiple ?? true;
  const apply = (next: ColumnFilterStateProp) => {
    setFilterValue(column.key, next);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("dataTable.filterColumn")}
          data-filtered={active.length > 0 ? "" : undefined}
          className="ui-data-table-filter-trigger"
        >
          <ListFilter className="ui-data-table-sort-icon" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{t("dataTable.filterColumn")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {multiple ? (
          options.map((option) => (
            <DropdownMenuCheckboxItem
              key={String(option.value)}
              checked={active.includes(option.value)}
              onCheckedChange={(checked) => {
                apply(
                  checked
                    ? [...active, option.value]
                    : active.filter((value) => value !== option.value),
                );
              }}
            >
              {option.text}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <DropdownMenuRadioGroup
            value={active.length > 0 ? String(active[0]) : ""}
            onValueChange={(value) => {
              const picked = options.find((option) => String(option.value) === value);
              apply(picked ? [picked.value] : []);
            }}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem key={String(option.value)} value={String(option.value)}>
                {option.text}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            apply([]);
          }}
        >
          {t("dataTable.filterReset")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

DataTable.Content = function DataTableContent() {
  const {
    table,
    selectable,
    onRowClick,
    loading,
    empty,
    error,
    denied,
    onRetry,
    striped,
    hoverable,
    stickyHeader,
    preset,
    collapseBelow,
    rowClassName,
    rowTone,
    bordered,
    scroll,
    sticky,
    onRow,
    summary,
    expandable,
    expandedKeys,
    toggleExpanded,
    rowSelection,
    getRowId,
    showSorterTooltip,
    sortDirections,
    sortPriorities,
  } = useDataTableContext();
  const { t } = useTranslation();
  // `"default"` must be provably inert: no attribute is emitted, so no preset selector can match
  const presetAttr = preset === "default" ? undefined : preset;

  // A slot is "raised" when it carries content OR the sentinel `true` (built-in copy). `false` /
  // `error={isError}` / `denied={status === 403}` straight from a query result.
  const isDenied = denied != null && denied !== false;
  const isError = !isDenied && error != null && error !== false;

  const rowPadding = tableRowHeightClass;
  const cellPadding = tableCellPaddingClass;
  const visibleColumns = table
    .getVisibleLeafColumns()
    .map((c) => c.columnDef.meta?.lean as ColumnDef<unknown> | undefined)
    .filter((c): c is ColumnDef<unknown> => !!c);
  // antd renders the expand affordance in its own leading column, before the selection column.
  const expandColumnShown = !!expandable?.expandedRowRender;
  const leadingColumnCount = (expandColumnShown ? 1 : 0) + (selectable ? 1 : 0);
  const emptyColSpan = visibleColumns.length + leadingColumnCount;
  // A pinned inline-end column casts its own separating shadow, so the scroll
  // fade (which would otherwise dim the pinned column) is suppressed.
  const hasPinEnd = visibleColumns.some((col) => fixedEdge(col) === "end");
  // antd freezes the leading (expand / selection) columns as soon as ANY data column is frozen to
  // the inline start — otherwise they would slide out from under the frozen column.
  const hasFixedStart = visibleColumns.some((col) => fixedEdge(col) === "start");
  const leadingFixed = hasFixedStart ? "start" : undefined;
  // `ellipsis` truncates NOTHING under the auto table layout — the table simply grows to fit the
  // widest cell — so the fixed layout goes on as soon as a column asks for it, or as soon as
  // `scroll.x` pins a minimum width. This is antd's own switch, and it is the reason a hand-rolled
  // `text-overflow: ellipsis` on a `<td>` looks inert.
  const fixedTableLayout =
    scroll?.x !== undefined ||
    visibleColumns.some((col) => col.ellipsis || columnWidth(col.width).style !== undefined);

  // Accessible-header contract: a column whose `header` renders no visible text
  // (an action / selection column) MUST carry an `ariaLabel` so its <th> keeps a
  // screen-reader name (axe: empty-table-header). Dev-warn the offenders once per
  // change instead of failing silently.
  const missingHeaderNames = visibleColumns
    .filter((col) => isEmptyHeader(col.header) && !col.ariaLabel)
    .map((col) => col.key)
    .join("|");
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production" || !missingHeaderNames) return;
    for (const key of missingHeaderNames.split("|")) {
      // eslint-disable-next-line no-console
      console.warn(
        `[DataTable] Column "${key}" renders a <th> with no visible or accessible text. ` +
          'Give it a visible `header`, or set `ariaLabel` (e.g. "Actions"/"Select") so ' +
          "screen readers can announce the column and axe reports no empty-table-header violation.",
      );
    }
  }, [missingHeaderNames]);

  // while the region actually overflows AND is not scrolled to the inline-end.
  // CSS alone cannot know (there is no :overflowing selector), so measure the
  // scroll box and mirror the state into a class the stylesheet gates on.
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [hasOverflowEnd, setHasOverflowEnd] = React.useState(false);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const overflowing = el.scrollWidth - el.clientWidth > 1;
      // RTL scrolls into negative scrollLeft — abs() keeps the math logical.
      const atEnd = Math.abs(el.scrollLeft) + el.clientWidth >= el.scrollWidth - 1;
      setHasOverflowEnd(overflowing && !atEnd);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    // The surface resizes when data/columns/density change the table's width.
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  // ── frozen-column offsets, MEASURED ──────────────────────────────────────
  // A sticky column has to know how much frozen width sits between it and the edge, and that width
  // is whatever the browser laid out — a declared `width` is a request, not a result, and the
  // leading select/expand columns are token-sized. So the header row is measured and each frozen
  // cell publishes its own `--table-fixed-offset` (a NUMBER; the stylesheet multiplies by 1px, the
  // sanctioned pattern). Re-measured on every layout change through a ResizeObserver.
  const [fixedOffsets, setFixedOffsets] = React.useState<Record<string, number>>({});
  const fixedSignature = [
    leadingFixed ?? "",
    expandColumnShown ? "x" : "",
    selectable ? "s" : "",
    ...visibleColumns.map((col) => `${col.key}:${fixedEdge(col) ?? ""}`),
  ].join("|");
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const headerRow = el.querySelector("thead tr");
      if (!headerRow) return;
      const cells = Array.from(headerRow.children) as HTMLElement[];
      const next: Record<string, number> = {};
      let start = 0;
      for (const cell of cells) {
        if (cell.dataset.fixed !== "start") continue;
        next[cell.dataset.columnKey ?? ""] = start;
        start += cell.offsetWidth;
      }
      let end = 0;
      for (const cell of [...cells].reverse()) {
        if (cell.dataset.fixed !== "end") continue;
        next[cell.dataset.columnKey ?? ""] = end;
        end += cell.offsetWidth;
      }
      setFixedOffsets((prev) => (sameOffsets(prev, next) ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    const headerRow = el.querySelector("thead tr");
    if (headerRow) observer.observe(headerRow);
    return () => {
      observer.disconnect();
    };
  }, [fixedSignature]);

  /** The column IDENTITY the offset measurement reads back, plus the frozen edge it read. */
  const fixedCellProps = (key: string, edge: "start" | "end" | undefined) =>
    edge ? { "data-column-key": key, "data-fixed": edge } : { "data-column-key": key };

  /**
   * The measured offset, for the LEADING (expand / selection) columns — a data column publishes it
   * through `columnCellStyle` instead, so exactly one place per cell owns it.
   */
  const leadingFixedStyle = (key: string): React.CSSProperties | undefined =>
    leadingFixed
      ? ({ "--table-fixed-offset": fixedOffsets[key] ?? 0 } as React.CSSProperties)
      : undefined;

  const columnCellClass = (col: ColumnDef<unknown>) => {
    const edge = fixedEdge(col);
    return cn(
      columnWidth(col.width).className,
      col.align === "right" && "text-end",
      col.align === "center" && "text-center",
      col.hiddenOnMobile && "hidden md:table-cell",
      col.ellipsis && "ui-data-table-ellipsis",
      edge === "end" && "ui-data-table-pin-end",
      edge === "start" && "ui-data-table-pin-start",
    );
  };

  const columnCellStyle = (col: ColumnDef<unknown>): React.CSSProperties | undefined => {
    const base = columnWidth(col.width).style;
    const edge = fixedEdge(col);
    if (!edge) return base;
    return { ...base, "--table-fixed-offset": fixedOffsets[col.key] ?? 0 } as React.CSSProperties;
  };

  // Active sort — read straight off the table state, which the DataTable root has already
  // reconciled with the lean `sort` prop and with any per-column `sortOrder`.
  const sortingState = table.state.sorting;

  const onHeaderClick = (col: ColumnDef<unknown>) => {
    if (!columnIsSortable(col)) return;
    const directions = columnSortDirections(col, sortDirections);
    const next = nextSortDirection(directionOf(sortingState, col.key), directions);
    table.setSorting(
      applySortToState(sortingState, col.key, next, sortPriorities[col.key], sortPriorities),
    );
  };

  const dataRows = table.getRowModel().rows;
  const rowCount = dataRows.length;

  // antd `scroll` / `sticky` — CONSUMER lengths, so they travel as custom properties and the
  // geometry that reads them stays in table-layout.css.
  const scrollStyle: React.CSSProperties = {};
  const scrollVars = scrollStyle as Record<string, string | undefined>;
  if (scroll?.x !== undefined) scrollVars["--table-scroll-inline-size"] = cssLength(scroll.x);
  if (scroll?.y !== undefined) scrollVars["--table-scroll-block-size"] = cssLength(scroll.y);
  if (typeof sticky === "object" && sticky.offsetHeader !== undefined) {
    scrollVars["--table-sticky-offset"] = cssLength(sticky.offsetHeader);
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        "ui-data-table-scroll",
        hasPinEnd && "ui-data-table-has-pin-end",
        hasOverflowEnd && "ui-data-table-has-overflow-end",
      )}
      style={scrollStyle}
      data-scroll-x={scroll?.x !== undefined ? "" : undefined}
      data-scroll-y={scroll?.y !== undefined ? "" : undefined}
      aria-busy={loading}
      // A table wider than its container scrolls horizontally here; keep the scroll region
      // keyboard-reachable so it can be scrolled without a pointer (WCAG 2.1.1 / axe
      // scrollable-region-focusable). No landmark role — avoids landmark-unique collisions
      // when a page renders several tables. With the collection preset the Table primitive's
      // own wrapper owns the overflow + tab stop instead (see `scrollable` below), so this
      // region drops its tab stop rather than adding a second, never-scrollable one.
      tabIndex={presetAttr ? undefined : 0}
    >
      <div
        // to be a hard-coded 640px min-width utility pair, i.e. exactly the literal that forced
        // must be a token. The collection preset opts out of the floor via `data-preset`.
        className="ui-data-table-surface"
        data-preset={presetAttr}
        data-table-layout={fixedTableLayout ? "fixed" : undefined}
        data-striped={striped ? "" : undefined}
        data-hoverable={hoverable ? "" : undefined}
      >
        {/* With `preset="default"` the `.ui-data-table-scroll` region above owns the overflow, so the primitive's wrapper is a bare box (`scrollable={false}` — no nested scroller, no duplicate tab stop). Only the table's DIRECT wrapper sees the growth, so for the preset that wrapper is the keyboard-reachable scroll region (exactly the bare `Table` behaviour), scrolling inside the surface border. */}
        <Table
          scrollable={preset !== "default"}
          preset={preset}
          collapseBelow={collapseBelow}
          bordered={bordered}
        >
          <TableHeader
            className={cn("bg-secondary", stickyHeader && "ui-data-table-sticky-header")}
          >
            <TableRow>
              {expandColumnShown && (
                <TableHead
                  className={cn(
                    "ui-data-table-expand-column",
                    leadingFixed === "start" && "ui-data-table-pin-start",
                  )}
                  {...fixedCellProps("__expand", leadingFixed)}
                  style={leadingFixedStyle("__expand")}
                >
                  <span className="sr-only">
                    {expandable?.columnTitle ?? t("dataTable.expandColumn")}
                  </span>
                </TableHead>
              )}
              {selectable && (
                <TableHead
                  className={cn(
                    "ui-data-table-select-column",
                    leadingFixed === "start" && "ui-data-table-pin-start",
                  )}
                  {...fixedCellProps("__select", leadingFixed)}
                  style={leadingFixedStyle("__select")}
                >
                  <DataTable.SelectAll />
                </TableHead>
              )}
              {visibleColumns.map((col) => {
                const isSortable = columnIsSortable(col);
                const activeDirection = directionOf(sortingState, col.key);
                const sortIndicator = isSortable ? (
                  activeDirection ? (
                    activeDirection === "asc" ? (
                      <ArrowUp className="ui-data-table-sort-icon" aria-hidden="true" />
                    ) : (
                      <ArrowDown className="ui-data-table-sort-icon" aria-hidden="true" />
                    )
                  ) : (
                    <ChevronsUpDown
                      className="ui-data-table-sort-icon text-muted-foreground"
                      aria-hidden="true"
                    />
                  )
                ) : null;
                const headerEmpty = isEmptyHeader(col.header);
                // Visually-empty header (action / selection column) keeps a
                // screen-reader name via an sr-only span so the <th> is never
                // nameless (axe: empty-table-header).
                const headerContent =
                  headerEmpty && col.ariaLabel ? (
                    <span className="sr-only">{col.ariaLabel}</span>
                  ) : (
                    col.header
                  );
                const label = (
                  <span className="ui-data-table-sort-label">
                    {headerContent}
                    {sortIndicator}
                  </span>
                );
                const tooltipOn = col.showSorterTooltip ?? showSorterTooltip;
                const nextDirection = nextSortDirection(
                  activeDirection,
                  columnSortDirections(col, sortDirections),
                );
                const sortHint =
                  nextDirection === "asc"
                    ? t("dataTable.sortAscending")
                    : nextDirection === "desc"
                      ? t("dataTable.sortDescending")
                      : t("dataTable.sortCancel");
                const sortButton = (
                  <button
                    type="button"
                    className="ui-data-table-sort-button ui-focus-ring"
                    onClick={() => {
                      onHeaderClick(col);
                    }}
                  >
                    {label}
                  </button>
                );
                return (
                  <TableHead
                    key={col.key}
                    // The column-priority contract is carried by BOTH cells of a column; the
                    // primitive emits `data-priority` only when it is set, so an ordinary table
                    // gains no attribute (see ColumnDefProp.priority).
                    priority={col.priority}
                    data-empty={headerEmpty || undefined}
                    // The RESOLVED heading alignment, reflected so alignment is assertable and
                    // themeable at the contract level rather than through whichever text-* utility
                    // paints it today. Absent (not `"left"`) when the column never asked for one,
                    // so an ordinary table gains no attribute — same rule as `data-priority`.
                    data-align={col.headerAlign ?? col.align}
                    aria-sort={
                      isSortable
                        ? activeDirection
                          ? activeDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                        : undefined
                    }
                    {...fixedCellProps(col.key, fixedEdge(col))}
                    style={columnCellStyle(col)}
                    className={cn(
                      columnCellClass(col),
                      // `headerAlign` when the heading differs from the rows,
                      // `align` otherwise. A table wanting centred headings
                      // over start-aligned text could not say so before, and
                      // consumers reached for `[&_th_button]:justify-center`.
                      (col.headerAlign ?? col.align) === "right" && "text-end",
                      (col.headerAlign ?? col.align) === "center" && "text-center",
                      isSortable && "select-none",
                    )}
                  >
                    {isSortable ? (
                      tooltipOn ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{sortButton}</TooltipTrigger>
                          <TooltipContent>{sortHint}</TooltipContent>
                        </Tooltip>
                      ) : (
                        sortButton
                      )
                    ) : (
                      label
                    )}
                    {col.filters ? <ColumnFilterMenu column={col} /> : null}
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
                  {expandColumnShown && <TableCell className={cellPadding} />}
                  {selectable && (
                    <TableCell className={cellPadding}>
                      <div className="ui-skeleton-block ui-data-table-skeleton-check" />
                    </TableCell>
                  )}
                  {visibleColumns.map((col, j) => (
                    <TableCell
                      key={col.key}
                      priority={col.priority}
                      data-align={col.align}
                      style={columnCellStyle(col)}
                      className={cn(cellPadding, columnCellClass(col))}
                    >
                      <div
                        className={cn(
                          "ui-skeleton-block ui-data-table-skeleton-line",
                          j === 0 ? "w-1/2" : "w-3/4",
                          col.align === "right" && "ms-auto",
                          col.align === "center" && "mx-auto",
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isDenied ? (
              // repeating a 403 cannot succeed. `warning` (not destructive) keeps it a policy
              // statement rather than a system fault. Announced politely: a permission boundary
              // is expected information, not an interruption.
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={emptyColSpan}
                  className="ui-data-table-empty"
                  aria-live="polite"
                >
                  {denied === true ? (
                    <EmptyState
                      icon={ShieldAlert}
                      tone="warning"
                      title={t("dataTable.denied")}
                      description={t("dataTable.deniedDescription")}
                      titleAs="p"
                    />
                  ) : (
                    denied
                  )}
                </TableCell>
              </TableRow>
            ) : isError ? (
              // Announced assertively (`role="alert"`) because the
              // user's request did not complete — unlike empty/denied, which are states of the data
              // itself. The role sits on an inner wrapper, never on the <td>: overriding a cell's
              // role would strip it out of the table's grid semantics for AT.
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={emptyColSpan} className="ui-data-table-empty">
                  <div role="alert">
                    {error === true ? (
                      <EmptyState
                        icon={AlertCircle}
                        tone="destructive"
                        title={t("dataTable.error")}
                        description={t("dataTable.errorDescription")}
                        titleAs="p"
                        action={
                          onRetry ? (
                            <Button variant="outline" size="sm" onClick={onRetry}>
                              <RefreshCw aria-hidden="true" />
                              {t("common.retry")}
                            </Button>
                          ) : undefined
                        }
                      />
                    ) : (
                      error
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : rowCount === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={emptyColSpan}
                  className="ui-data-table-empty"
                  aria-live="polite"
                >
                  {/* A table's "no rows" message is a status, not a document section — render the
                      title as plain text (titleAs) so it never injects a stray heading into the
                      page outline (axe heading-order). */}
                  {empty ?? <EmptyState title={t("dataTable.empty")} titleAs="p" />}
                </TableCell>
              </TableRow>
            ) : (
              dataRows.map((row, rowIndex) => {
                const original = row.original as unknown;
                const rowKey = getRowId(original as never);
                const isSelected = row.getIsSelected();
                const checkboxProps = rowSelection?.getCheckboxProps?.(original as never) ?? {};
                const canExpand =
                  expandColumnShown && (expandable?.rowExpandable?.(original as never) ?? true);
                const isExpanded = canExpand && expandedKeys.includes(rowKey);
                const rowProps = onRow?.(original as never, rowIndex) ?? {};
                const isInteractiveTarget = (target: HTMLElement) =>
                  !!target.closest(
                    "button, a, input, select, textarea, [role=menuitem], [role=checkbox], [role=radio]",
                  );
                const expandByClick = canExpand && expandable?.expandRowByClick;
                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      {...rowProps}
                      data-state={isSelected ? "selected" : undefined}
                      // The tone rides a data attribute, not a class: the paint is a components-layer
                      // rule keyed on `[data-tone]`, so a theme retunes the rail from
                      // `--table-row-tone-*` instead of every call site shipping its own utility.
                      data-tone={rowTone?.(original as never)}
                      tabIndex={onRowClick ? 0 : rowProps.tabIndex}
                      onClick={(e) => {
                        rowProps.onClick?.(e);
                        // Don't trigger row click if user clicked on an interactive child.
                        const target = e.target as HTMLElement;
                        if (isInteractiveTarget(target)) return;
                        if (expandByClick) toggleExpanded(rowKey);
                        onRowClick?.(original as never);
                      }}
                      onKeyDown={
                        onRowClick
                          ? (e) => {
                              rowProps.onKeyDown?.(e);
                              if (e.key !== "Enter" && e.key !== " ") return;
                              // Let interactive descendants handle their own keys.
                              if (e.target !== e.currentTarget) return;
                              e.preventDefault();
                              onRowClick?.(original as never);
                            }
                          : rowProps.onKeyDown
                      }
                      className={cn(
                        rowPadding,
                        // Hover highlight when rows are clickable OR explicitly hoverable…
                        (onRowClick || hoverable) && "hover:bg-muted/50",
                        // …but the affordance (cursor + focus mark) only when clickable.
                        //
                        // `ui-focus-ring` = the single focus source (styles/focus-ring.css). It
                        // replaces `focus-visible:ring-ring focus-visible:ring-2
                        // focus-visible:ring-inset`, which was a hand-rolled second ring: it read no
                        // `--focus-ring-*` knob, so a service could not retune it, and — being a
                        // utility — it painted regardless of the `--focus-outline` switch, which is
                        // exactly the hole the switch exists to close.
                        onRowClick && "ui-focus-ring cursor-pointer",
                        isSelected && "bg-muted/30",
                        rowProps.className,
                        rowClassName?.(original as never),
                      )}
                    >
                      {expandColumnShown && (
                        <TableCell
                          className={cn(
                            cellPadding,
                            leadingFixed === "start" && "ui-data-table-pin-start",
                          )}
                          {...fixedCellProps("__expand", leadingFixed)}
                          style={leadingFixedStyle("__expand")}
                        >
                          {canExpand ? (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded ? t("dataTable.collapseRow") : t("dataTable.expandRow")
                              }
                              className="ui-data-table-expand-trigger"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(rowKey);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown
                                  className="ui-data-table-sort-icon"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ChevronRight
                                  className="ui-data-table-sort-icon"
                                  aria-hidden="true"
                                />
                              )}
                            </Button>
                          ) : null}
                        </TableCell>
                      )}
                      {selectable && (
                        <TableCell
                          className={cn(
                            cellPadding,
                            leadingFixed === "start" && "ui-data-table-pin-start",
                          )}
                          {...fixedCellProps("__select", leadingFixed)}
                          style={leadingFixedStyle("__select")}
                        >
                          {rowSelection?.type === "radio" ? (
                            // One choice per table, so each cell is its own single-item group:
                            // Radix requires a Root for an Item, and a Root cannot legally span
                            // <tr> boundaries without rewriting the table's own semantics.
                            <RadioGroupRoot
                              value={isSelected ? rowKey : ""}
                              disabled={checkboxProps.disabled}
                              onValueChange={() => {
                                row.toggleSelected(true);
                              }}
                            >
                              <RadioItem
                                value={rowKey}
                                aria-label={
                                  checkboxProps["aria-label"] ??
                                  t("dataTable.selectRow", { id: row.id })
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              />
                            </RadioGroupRoot>
                          ) : (
                            <Checkbox
                              checked={isSelected}
                              disabled={checkboxProps.disabled}
                              onCheckedChange={(v) => {
                                row.toggleSelected(!!v);
                              }}
                              aria-label={
                                checkboxProps["aria-label"] ??
                                t("dataTable.selectRow", { id: row.id })
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            />
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.map((col) => {
                        const rendered = col.render
                          ? col.render(original as never)
                          : (() => {
                              const v = (original as Record<string, unknown>)[col.key];
                              const text =
                                v == null || !(typeof v === "string" || typeof v === "number")
                                  ? "—"
                                  : String(v);
                              // The default renderer emits its text inside a real element, never
                              // A bare node leaves the
                              // cell BOX as the only thing a reflow/overflow check can measure,
                              // and the cell's block padding inflates that box — so a single
                              // unwrapped line reads as wrapped, which is how a CJK
                              // one-character-per-line check false-positives on a healthy cell.
                              // The span measures the TEXT.
                              return <span data-slot="table-cell-text">{text}</span>;
                            })();
                        // An ellipsised cell keeps the full value reachable as its `title`, so
                        // truncation never silently loses data (antd `ellipsis.showTitle`).
                        const rawValue = (original as Record<string, unknown>)[col.key];
                        const title =
                          col.ellipsis &&
                          !col.render &&
                          (typeof rawValue === "string" || typeof rawValue === "number")
                            ? String(rawValue)
                            : undefined;
                        return (
                          <TableCell
                            key={col.key}
                            priority={col.priority}
                            data-align={col.align}
                            title={title}
                            {...fixedCellProps(col.key, fixedEdge(col))}
                            style={columnCellStyle(col)}
                            className={cn(cellPadding, columnCellClass(col))}
                          >
                            {rendered}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {isExpanded && expandable?.expandedRowRender ? (
                      <TableRow
                        className="ui-data-table-expanded-row hover:bg-transparent"
                        data-expanded-row=""
                      >
                        <TableCell colSpan={emptyColSpan} flush>
                          {expandable.expandedRowRender(original as never, rowIndex, true)}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
          {summary ? (
            // A real <tfoot>: the totals row belongs to the table's own grid, so it keeps the
            // column widths, the header association and the screen-reader row navigation.
            <tfoot data-slot="table-footer" className="ui-data-table-summary">
              {summary(dataRows.map((row) => row.original as never))}
            </tfoot>
          ) : null}
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

function NumberedPagination({ pageSizeOptions, className }: NumberedPaginationProps) {
  const { table, paginationConfig, pagerHidden } = useDataTableContext();
  const { t } = useTranslation();
  const { pageIndex, pageSize } = table.state.pagination;
  const pageCount = table.getPageCount();
  // antd `pagination={false}` — the pager is gone, wherever it was composed.
  if (pagerHidden) return null;
  // antd's `pageSizeOptions` / `showSizeChanger` travel on the pagination config object; the
  // slot's own prop still wins when a call site sets it directly.
  const options = pageSizeOptions ?? paginationConfig?.pageSizeOptions ?? [10, 20, 50, 100];
  const showSizeChanger = paginationConfig?.showSizeChanger ?? true;

  return (
    <Flex
      direction="row"
      align="center"
      justify="between"
      gap="md"
      wrap
      className={cn("ui-data-table-pagination ui-data-table-pagination--numbered", className)}
    >
      {showSizeChanger ? (
        <Flex direction="row" align="center" gap="sm" className="ui-data-table-page-size">
          <span className="ui-data-table-page-size-label ui-data-table-pagination-text">
            {t("dataGrid.rowsPerPage")}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v: string) => table.setPageSize(Number(v))}
          >
            <SelectTrigger
              size="sm"
              aria-label={t("dataGrid.rowsPerPage")}
              className="ui-data-table-page-size-trigger w-auto shrink-0 tabular-nums"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((n) => (
                <SelectItem key={n} value={String(n)} className="tabular-nums">
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Flex>
      ) : (
        <span />
      )}
      <Flex direction="row" align="center" gap="sm" className="ui-data-table-page-nav">
        <span className="ui-data-table-pagination-text tabular-nums">
          {t("dataGrid.pageOf", { page: pageIndex + 1, total: Math.max(1, pageCount) })}
        </span>
        <Button
          variant="outline"
          size="icon"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          aria-label={t("common.previous") ?? "Previous"}
        >
          <ChevronLeft className="ui-data-table-pagination-icon" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          aria-label={t("common.next") ?? "Next"}
        >
          <ChevronRight className="ui-data-table-pagination-icon" aria-hidden="true" />
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
      <MoreHorizontal className="ui-data-table-toolbar-icon" aria-hidden="true" />
      {children}
    </Button>
  );
};
(DataTable.RowActions as React.FC).displayName = "DataTable.RowActions";

// flexRender is re-exported for advanced custom Content compositions that want
// to render a TanStack cell/header definition directly.
export { flexRender };
