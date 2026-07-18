/** Navigation component prop types — @see docs/COMPONENTS.md#navigation */
import type * as React from "react";
import type {
  ChildrenProp,
  ClassNameProp,
  DisabledProp,
  HasActiveFiltersProp,
  LabelProp,
  OnClearFiltersProp,
  StickyProp,
} from "../vocabulary";

/** @see Toolbar */
export type ToolbarProp = {
  onClear?: OnClearFiltersProp;
  hasActiveFilters?: HasActiveFiltersProp;
  /**
   * Pin the strip to the top of its scroll container while the list scrolls beneath it
   * (list-page filter bars, #197). Opt-in — default `false` keeps the toolbar quiet. Tune
   * the pinned offset/background with the `--filter-bar-sticky-offset` /
   * `--filter-bar-sticky-background` theme knobs.
   */
  sticky?: StickyProp;
  className?: ClassNameProp;
  children: ChildrenProp;
};

/** @see ToolbarGroup */
export type ToolbarGroupProp = {
  label: LabelProp;
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
  type?: "default" | "dot";
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
