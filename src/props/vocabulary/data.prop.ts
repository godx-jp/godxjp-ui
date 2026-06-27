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
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: ColumnAlignProp;
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
