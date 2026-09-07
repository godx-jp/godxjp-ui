/**
 * Data & collection prop types.
 * @see docs/PROPS-VOCABULARY.md#data-collections
 */
import type * as React from "react";
import type { BreakpointProp, ColumnAlignProp, SortDirectionProp } from "./interaction.prop";
import type { TableDensityProp } from "./layout.prop";

/** Generic row identifier extractor for tables with selection. */
export type GetRowIdProp<T> = (row: T) => string;

/** Row click navigation handler. */
export type OnRowClickProp<T> = (row: T) => void;

/** Column definition for DataTable. */
export type ColumnDefProp<T> = {
  key: string;
  header: React.ReactNode;
  /**
   * Accessible header text for a column whose `header` is visually empty — the standard case for a
   * row-actions or selection column. Rendered as an `sr-only` label inside the `<th>` so the
   * column keeps a screen-reader name (e.g.
   */
  ariaLabel?: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  /**
   * Column width: either a utility class (`"w-[300px]"`) or a CSS length (`"300px"`, `"20%"`,
   * `"calc(50% - 1rem)"`). Both work — a length is applied inline, anything else is treated as a
   * class.
   */
  width?: string;
  align?: ColumnAlignProp;
  /**
   * Alignment of the header cell, when it differs from the body. Defaults to `align`, which is the
   * usual case.
   */
  headerAlign?: ColumnAlignProp;
  hiddenOnMobile?: boolean;
  /**
   * List this column in DataTable.ViewOptions (the column show/hide "set view"
   * menu). Defaults to true; set false to keep a column always visible (e.g. a
   * primary key or a pinned actions column).
   */
  enableHiding?: boolean;
  /**
   * Pin the column to the inline-end edge so it stays visible while the rest of the table scrolls
   * horizontally — the standard home for a row-actions column. The pinned cell keeps an opaque,
   * hover/selection-aware background and casts a separating shadow.
   */
  pin?: "end";
  /**
   * It is the SAME contract the `Table` primitive exposes on `TableHead`/`TableCell`: DataTable
   * stamps it onto both cells of the column for you, so the preset can swap the desktop intrinsic
   * widths for the token-owned priority measures (`--table-action-collection-*`) instead of
   * scrolling a five-column approval queue sideways at 390px. Leave the free-text column unmarked
   * — it takes the remaining space.
   */
  priority?: TableColumnPriorityProp;
  /**
   * Freeze the column against a scroll edge (antd `ColumnType.fixed`). The offsets are MEASURED
   * from the rendered header cells and published as `--table-fixed-offset`, so several adjacent
   * fixed columns stack correctly at any width, in either writing direction. `pin: "end"` is the
   * older spelling of `fixed: "end"` and still works.
   */
  fixed?: ColumnFixedProp;
  /**
   * Hold the cell to ONE line and truncate the overflow (antd `ColumnType.ellipsis`). The full text
   * is kept reachable as the cell's `title`, so nothing is silently lost.
   */
  ellipsis?: boolean;
  /**
   * Sort declaration (antd `ColumnType.sorter`). `sorter: true` is the same opt-in as `sortable`;
   * a comparator sorts by it; `{ compare, multiple }` joins the MULTI-column sort, highest
   * `multiple` first.
   */
  sorter?: ColumnSorterProp<T>;
  /** Controlled sort direction for THIS column (antd `sortOrder`). `null` = not sorted. */
  sortOrder?: SortDirectionProp | null;
  /** Initial uncontrolled sort direction (antd `defaultSortOrder`). */
  defaultSortOrder?: SortDirectionProp;
  /**
   * The directions this column cycles through (antd `sortDirections`), in order; the cycle ends by
   * clearing the sort. Default `["asc", "desc"]`.
   */
  sortDirections?: SortDirectionProp[];
  /** Explain the next sort step in a tooltip on the header (antd `showSorterTooltip`). */
  showSorterTooltip?: boolean;
  /** Filter menu options (antd `filters`). Presence of this array is what adds the filter icon. */
  filters?: ColumnFilterItemProp[];
  /** Controlled filter selection (antd `filteredValue`). `null` = no filter. */
  filteredValue?: ColumnFilterStateProp | null;
  /** Initial uncontrolled filter selection (antd `defaultFilteredValue`). */
  defaultFilteredValue?: ColumnFilterStateProp;
  /** `false` makes the menu single-select (antd `filterMultiple`). Default `true`. */
  filterMultiple?: boolean;
  /** Row predicate for one selected filter value (antd `onFilter`). Omit for server filtering. */
  onFilter?: (value: ColumnFilterValueProp, row: T) => boolean;
};

/** Set of selected row IDs. */
export type SelectedIdsProp = Set<string>;

/** Selection change callback. */
export type OnSelectChangeProp = (next: Set<string>) => void;

/** Table density change callback. */
export type OnTableDensityChangeProp = (density: TableDensityProp) => void;

/** Sort change callback — undefined clears sort. */
export type OnSortChangeProp = (
  sort: { key: string; direction: SortDirectionProp } | undefined,
) => void;

/** Search debounce callback. */
export type OnSearchChangeProp = (query: string) => void;

/** Filter bar reset handler. */
export type OnClearFiltersProp = () => void;

/** Whether any filter is active — shows "Clear all". */
export type HasActiveFiltersProp = boolean;

/**
 * Whether the filter strip pins to the top of its scroll container while the list
 * scrolls beneath it. Opt-in (default `false`) so the toolbar stays quiet chrome;
 * offset/background are tuned via the `--filter-bar-sticky-*` theme knobs.
 */
export type StickyProp = boolean;

/** Table named collection preset. `"default"` keeps the plain table (and emits no attribute). */
export type TablePresetProp = "default" | "action-collection" | "stacked-record-collection";

/**
 * Relative importance of a table column, used by `preset="action-collection"` to allocate the
 * narrow-frame measure. `"primary"` is the row's subject, `"secondary"` its object/target,
 * `"meta"` a low-priority stamp (dates, ids), `"actions"` the row-action affordance whose measure
 * is reserved first so it can never be pushed outside the viewport.
 */
export type TableColumnPriorityProp = "primary" | "secondary" | "meta" | "actions";

/**
 * Hierarchy depth a table cell renders at. `0` sits on the column's own text axis and every
 * further level adds one `--table-cell-indent-space-step`, so a tree row or a grouped detail row
 * expresses its level instead of hand-rolling `style={{ paddingInlineStart }}` at the call site.
 */
export type TableCellIndentProp = number;

// ── Ant Design 6.6.2 table parity ──────────────────────────────────────────────────────────────
// Everything below closes the prop-surface gap against the INSTALLED antd types
// (`antd/es/table/interface.d.ts`, `antd/es/table/InternalTable.d.ts` and the `@rc-component/table`
// interface they extend). Names follow antd where antd's name is already the taxonomy; the values
// follow THIS library's controlled vocabulary where the two disagree — antd's `fixed: 'left'|'right'`
// becomes logical `start`/`end` (RTL, cardinal rule), and antd's `SortOrder`
// `'ascend'|'descend'` stays this library's `SortDirectionProp` (`asc`/`desc`).

/**
 * Sticky edge a column freezes against while the rest of the table scrolls horizontally. Logical,
 * not physical: `"start"` is the inline-start edge (visual left in LTR, right in RTL). antd's
 * `fixed` accepts the physical `left`/`right`; those cannot be mirrored for an RTL locale, which is
 * why only the logical pair is published here.
 */
export type ColumnFixedProp = "start" | "end";

/** A value a column filter can carry — the closed set a `<Checkbox>`/`<Radio>` option can hold. */
export type ColumnFilterValueProp = string | number | boolean;

/** One option in a column's filter menu (antd `ColumnFilterItem`). */
export type ColumnFilterItemProp = {
  text: React.ReactNode;
  value: ColumnFilterValueProp;
};

/** The active filter selection for one column (antd `FilterValue`). */
export type ColumnFilterStateProp = ColumnFilterValueProp[];

/**
 * Column-filter change handler — this library's split of the `filters` argument antd hands to the
 * table-level `onChange`. Keyed by column, so a controlled `filteredValue` has somewhere to be
 * driven from.
 */
export type OnColumnFilterChangeProp = (filters: Record<string, ColumnFilterStateProp>) => void;

/** Column comparator — the `compare` half of antd's `sorter`. */
export type ColumnCompareProp<T> = (a: T, b: T) => number;

/**
 * Column sort declaration (antd `ColumnType.sorter`). `true` sorts on the column's own value;
 * a function is the comparator; the object form adds `multiple`, the MULTI-COLUMN sort priority —
 * a higher number sorts first, exactly as in antd.
 */
export type ColumnSorterProp<T> =
  boolean | ColumnCompareProp<T> | { compare?: ColumnCompareProp<T>; multiple?: number };

/** One entry in the selection-column dropdown (antd `SelectionItem`). */
export type TableSelectionItemProp = {
  key: string;
  text: React.ReactNode;
  onSelect: (currentRowKeys: string[]) => void;
};

/**
 * Row-selection configuration (antd `TableRowSelection`). The object form is the full surface;
 * the older `selectable` / `selected` / `onSelectChange` triple stays and drives the same state.
 */
export type TableRowSelectionProp<T> = {
  /** `"checkbox"` (default, multi) or `"radio"` (single). */
  type?: "checkbox" | "radio";
  selectedRowKeys?: string[];
  defaultSelectedRowKeys?: string[];
  onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
  /** Per-row checkbox overrides — the standard home for "this row cannot be selected". */
  getCheckboxProps?: (row: T) => { disabled?: boolean; "aria-label"?: string };
  /** Keep keys selected even once their row leaves `data` (server paging / filtering). */
  preserveSelectedRowKeys?: boolean;
  /** Extra bulk-select entries under the header checkbox. `true` = the built-in all/none/invert. */
  selections?: TableSelectionItemProp[] | boolean;
  hideSelectAll?: boolean;
  columnTitle?: React.ReactNode;
};

/** Expandable-row configuration (antd/rc-table `ExpandableConfig`). */
export type TableExpandableProp<T> = {
  /** Renders the detail panel for an expanded row. Omit and nothing is expandable. */
  expandedRowRender?: (row: T, index: number, expanded: boolean) => React.ReactNode;
  /** Rows this returns `false` for get no expand affordance. Default: every row is expandable. */
  rowExpandable?: (row: T) => boolean;
  defaultExpandAllRows?: boolean;
  expandedRowKeys?: string[];
  onExpandedRowsChange?: (expandedRowKeys: string[]) => void;
  /** Clicking anywhere on the row toggles it (antd `expandRowByClick`). */
  expandRowByClick?: boolean;
  columnTitle?: React.ReactNode;
};

/** Footer totals row — receives the rows currently rendered (antd/rc-table `summary`). */
export type TableSummaryProp<T> = (rows: readonly T[]) => React.ReactNode;

/**
 * Scroll envelope (antd `scroll`). `x` is the table's minimum inline size (it scrolls horizontally
 * past it), `y` the body's maximum block size (it scrolls vertically past it). Both are published
 * as the `--table-scroll-x` / `--table-scroll-y` custom properties, so the LENGTHS stay data while
 * the geometry that reads them stays in the stylesheet.
 */
export type TableScrollProp = { x?: number | string; y?: number | string };

/**
 * Sticky header (antd `sticky`). `true` pins the header to its scroll container; the object form
 * adds the offset a page-level fixed topbar needs, published as `--table-sticky-offset`.
 */
export type TableStickyProp = boolean | { offsetHeader?: number | string };

/**
 * Per-row DOM props (antd `onRow`) — event handlers and attributes merged onto the `<tr>`.
 * The `data-*` index signature is deliberate: the commonest reason to reach for `onRow` at all is
 * to stamp a row key or an E2E hook onto the element, and `React.HTMLAttributes` alone rejects it.
 */
export type OnRowProp<T> = (
  row: T,
  index: number,
) =>
  | (React.HTMLAttributes<HTMLTableRowElement> & {
      [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
    })
  | undefined;

/**
 * Pagination object surface (antd `TablePaginationConfig`). 1-BASED `current`, like antd — the
 * TanStack-shaped `{ pageIndex, pageSize }` form the prop already accepted is still accepted and
 * is told apart by its `pageIndex` field. `false` hides the pager entirely.
 */
export type TablePaginationProp = {
  /** 1-based current page. */
  current?: number;
  pageSize?: number;
  /** Total row count on the server — drives the page count under manual pagination. */
  total?: number;
  pageSizeOptions?: number[];
  /** Default `true`. `false` drops the rows-per-page select. */
  showSizeChanger?: boolean;
  onChange?: (page: number, pageSize: number) => void;
};

/**
 * Descriptions column count (antd `column`). A plain number keeps this library's own mobile-first
 * ladder; the `{ sm, md, lg, xl }` object is antd's responsive form, expressed against this
 * library's own `BreakpointProp` set.
 */
export type DescriptionsColumnProp = number | Partial<Record<BreakpointProp, number>>;

/**
 * How many columns one Descriptions item occupies (antd `span`). `"filled"` takes the whole
 * remaining row; the object form spans a different number of columns per breakpoint.
 */
export type DescriptionsSpanProp = number | "filled" | Partial<Record<BreakpointProp, number>>;

/** Declarative Descriptions items (antd `items`) — the alternative to composing children. */
export type DescriptionsItemsProp = {
  key?: React.Key;
  label: React.ReactNode;
  /** The value. `children` is antd's name for it; `value` is this library's older one. */
  children?: React.ReactNode;
  value?: React.ReactNode;
  mono?: boolean;
  span?: DescriptionsSpanProp;
  className?: string;
}[];
