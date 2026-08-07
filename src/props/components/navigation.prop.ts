/** Navigation component prop types — @see docs/COMPONENTS.md#navigation */
import type * as React from "react";
import type {
  ChildrenProp,
  ClassNameProp,
  DisabledProp,
  HasActiveFiltersProp,
  IdProp,
  LabelProp,
  OnClearFiltersProp,
  StickyProp,
} from "../vocabulary";

/**
 * How a {@link ToolbarProp} strip resolves more filters than fit one row (#216).
 * `wrap` (default) stacks on narrow viewports then wraps onto extra rows; `scroll` keeps ONE
 * bounded row that scrolls inline, so a wide filter set never pushes the list below the fold.
 */
export type FilterBarOverflowProp = "wrap" | "scroll";

/**
 * One APPLIED filter, rendered as a removable chip under the control row (#258).
 *
 * The chip is the visible record of a filter that is already in effect — it is NOT the control that
 * sets it. `label` is caller-localized text (the bar never interprets or formats domain values);
 * omit `onRemove` for a chip the user may not lift (a scope locked by the route or by permission),
 * and the chip renders as a static token with no dead button.
 */
export type FilterBarChipProp = {
  /** Stable identity — also the argument passed back to {@link ToolbarProp.onChipRemove}. */
  id: string;
  /** Already-localized chip text, e.g. "状態: 未払い". */
  label: string;
  /**
   * Per-chip removal. Omit for a chip the user cannot lift; the bar then renders no remove control
   * rather than a disabled one, so nothing focusable is dead.
   */
  onRemove?: () => void;
};

/** @see Toolbar */
export type ToolbarProp = {
  onClear?: OnClearFiltersProp;
  hasActiveFilters?: HasActiveFiltersProp;
  /**
   * The search control (#258). A slot, not a rendered input: the bar owns its MEASURE
   * (`--filter-bar-search-width`) and its position at the START of the row, while the caller
   * still chooses the real primitive (`SearchInput`, or a `Select showSearch` for scoped search)
   * and owns its debounce and value. Passing the control as a child instead is what produced the
   * inconsistent search widths the issue was filed against.
   */
  search?: ChildrenProp;
  /**
   * Applied filters as removable chips (#258). The bar owns the CHIP LIFECYCLE — chips render
   * below the control row, each with an accessible remove control, and the row disappears entirely
   * when the array is empty (never an empty reserved strip). It owns no state: removing a chip
   * calls back and the caller re-renders the array.
   */
  chips?: readonly FilterBarChipProp[];
  /**
   * Called with the chip's `id` when its remove control is activated. Fires in addition to that
   * chip's own `onRemove`, so a caller may handle removal per chip, centrally, or both.
   */
  onChipRemove?: (id: string) => void;
  /**
   * Number of records the current filters resolve to (#258). Rendered in a POLITE LIVE REGION and
   * formatted with `Intl.NumberFormat` + CLDR plurals for the active locale — which is the point:
   * a sighted user sees the table change, and this is what tells everyone else that filtering
   * happened. Omit when the count is unknown or still loading.
   */
  resultCount?: number;
  /**
   * Trailing action region (#258) — export, column settings, a saved-view menu. Rendered AFTER the
   * reset control, so "clear filters" never sits at the end of the row beside an unrelated primary
   * action. The bar owns the ordering; the caller owns the controls.
   */
  actions?: ChildrenProp;
  /**
   * Pin the strip to the top of its scroll container while the list scrolls beneath it
   * (list-page filter bars, #197). Opt-in — default `false` keeps the toolbar quiet. Tune
   * the pinned offset/background with the `--filter-bar-sticky-offset` /
   * `--filter-bar-sticky-background` theme knobs.
   */
  sticky?: StickyProp;
  /**
   * Responsive overflow strategy (#216). Default `wrap`. Use `scroll` for list pages with many
   * filters (long JA/EN/VI labels) where a wrapped 3-row strip would push the table off screen.
   * Tune the scrollbar gutter with the `--filter-bar-scroll-padding-y` theme knob.
   */
  overflow?: FilterBarOverflowProp;
  className?: ClassNameProp;
  children: ChildrenProp;
};

/** @see ToolbarGroup */
export type ToolbarGroupProp = {
  label: LabelProp;
  /**
   * `id` of the single control this group labels (#216). When set, the visible group label is
   * rendered as that control's real `<label htmlFor>`, so the filter is named by the text the
   * user sees (WCAG 2.5.3 / 1.3.1) — otherwise the control needs its own `aria-label`.
   */
  controlId?: IdProp;
  className?: ClassNameProp;
  children: ChildrenProp;
};

/** @see Pagination — offset/page-based (distinct from DataTable cursor pagination). */
export type PaginationProp = {
  /**
   * Override the `<nav>` landmark's accessible name. Defaults to a localized "Pagination".
   * Multiple Pagination instances on one page/view (e.g. two independent result lists) need a
   * DISTINCT name each — two `<nav>` landmarks sharing one name/role fail axe's `landmark-unique`
   * (WCAG 2.4.1 / 1.3.1). Pass something that names what is being paged, e.g. `"注文一覧の
   * ページネーション"` vs `"請求書一覧のページネーション"`.
   */
  ariaLabel?: string;
  value?: number;
  total?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  /**
   * Hide the whole control when there is nothing to page through — zero items OR exactly one page.
   * `true` (default) keeps table footers clean: pagination is navigation between multiple result
   * pages, so a lone disabled `1 / 1` bar is noise. Set `false` for the explicit opt-in when a
   * consumer still wants the bar on a single page (e.g. to keep `showTotal` visible). A control
   * with `total === 0` is ALWAYS hidden — there is no data to navigate. (gh#153)
   */
  hideOnSinglePage?: boolean;
  simple?: boolean;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  onValueChange?: (page: number, pageSize: number) => void;
};

export type StepStatusProp = "wait" | "process" | "finish" | "error";

/** @see StepItem */
export type StepItemProp = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: StepStatusProp;
  disabled?: boolean;
};

/** @see Steps */
export type StepsProp = {
  items?: StepItemProp[];
  value?: number;
  defaultValue?: number;
  status?: StepStatusProp;
  orientation?: "horizontal" | "vertical";
  /**
   * Marker appearance. `inline` renders the compact numbered auth/device progress row without the
   * icon rail while preserving the same status and current-step semantics.
   */
  type?: "default" | "dot" | "inline";
  size?: "md" | "sm";
  titlePlacement?: "horizontal" | "vertical";
  onValueChange?: (value: number) => void;
  className?: ClassNameProp;
};

/** Tab pane — Ant Design `items` entry. */
export type TabItemProp = {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
};

/** @see Tabs — high-level tabs with optional `items` array. */
export type TabsProp = {
  items?: TabItemProp[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "default" | "line" | "card";
  className?: ClassNameProp;
  listClassName?: ClassNameProp;
  contentClassName?: ClassNameProp;
};
