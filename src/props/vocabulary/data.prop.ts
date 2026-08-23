/**
 * Data & collection prop types.
 * @see docs/PROPS-VOCABULARY.md#data-collections
 */
import type * as React from "react";
import type { ColumnAlignProp, SortDirectionProp } from "./interaction.prop";
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
   * Accessible header text for a column whose `header` is visually empty — the
   * standard case for a row-actions or selection column. Rendered as an
   * `sr-only` label inside the `<th>` so the column keeps a screen-reader name
   * (e.g. "Actions" / "Select") while showing nothing on screen. Required
   * (dev-warned) when `header` is empty; ignored when `header` has visible text.
   * Route the string through `t()` for i18n.
   */
  ariaLabel?: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  /**
   * Column width: either a utility class (`"w-[300px]"`) or a CSS length
   * (`"300px"`, `"20%"`, `"calc(50% - 1rem)"`). Both work — a length is
   * applied inline, anything else is treated as a class.
   *
   * It used to be class-only, and a length silently became a dead class name,
   * so the column fell back to auto layout with nothing to indicate why.
   */
  width?: string;
  align?: ColumnAlignProp;
  /**
   * Alignment of the header cell, when it differs from the body.
   *
   * Defaults to `align`, which is the usual case. It exists because a table
   * can want centred headings over start-aligned text — a long subject reads
   * from the left while its column heading sits over the column — and `align`
   * alone cannot say that: setting it to `center` centres the rows too.
   *
   * Consumers were reaching for `[&_th_button]:justify-center` to get there,
   * which is a hand-tuned override of a layout the table owns.
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
   * Pin the column to the inline-end edge so it stays visible while the rest of
   * the table scrolls horizontally — the standard home for a row-actions column.
   * The pinned cell keeps an opaque, hover/selection-aware background and casts a
   * separating shadow. Pin at most one column per table.
   */
  pin?: "end";
  /**
   * Relative importance of the column, read ONLY by `DataTable preset="action-collection"`
   * (gh#253). It is the SAME contract the `Table` primitive exposes on `TableHead`/`TableCell`:
   * DataTable stamps it onto both cells of the column for you, so the preset can swap the desktop
   * intrinsic widths for the token-owned priority measures (`--table-action-collection-*`) instead
   * of scrolling a five-column approval queue sideways at 390px. Leave the free-text column
   * unmarked — it takes the remaining space. Emitted as `data-priority` only when set, so an
   * ordinary column gains no attribute. Prefer this over `width` under the preset: an explicit
   * `width` utility wins the cascade and defeats the priority measure.
   */
  priority?: TableColumnPriorityProp;
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

/**
 * Table named collection preset. `"default"` keeps the plain table (and emits no attribute).
 * `"action-collection"` is the canonical dense approval / action queue: below `collapseBelow`
 * the desktop intrinsic column widths are replaced by token-owned column-PRIORITY measures under
 * `table-layout: fixed` and cells wrap, so every column — including the row actions — stays inside
 * the initial narrow frame. The real `<table>` semantics are never rewritten.
 *
 * `"stacked-record-collection"` (gh#293 restore — SCR-215) is the canonical wide-record collection:
 * a table whose column count/content cannot be squeezed into any fixed-measure narrow frame at all
 * (an admin detail row with many heterogeneous fields). Below `collapseBelow` the header row hides
 * and every `<tr>` becomes a bordered key-value CARD stack — each `TableCell`'s own `label` prop
 * renders inline above its value, taking over the accessible-name role the (now hidden) `<th>`
 * association would otherwise carry. Above the step it is a byte-for-byte ordinary table.
 */
export type TablePresetProp = "default" | "action-collection" | "stacked-record-collection";

/**
 * Relative importance of a table column, used by `preset="action-collection"` to allocate the
 * narrow-frame measure. `"primary"` is the row's subject, `"secondary"` its object/target,
 * `"meta"` a low-priority stamp (dates, ids), `"actions"` the row-action affordance whose measure
 * is reserved first so it can never be pushed outside the viewport. A column with no priority
 * takes the remaining space (the free-text column).
 */
export type TableColumnPriorityProp = "primary" | "secondary" | "meta" | "actions";
