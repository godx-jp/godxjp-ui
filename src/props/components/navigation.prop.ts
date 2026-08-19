/** Navigation component prop types — @see docs/COMPONENTS.md#navigation */
import type * as React from "react";
import type {
  ActionsProp,
  ChildrenProp,
  ClassNameProp,
  DisabledProp,
  ErrorProp,
  HasActiveFiltersProp,
  IdProp,
  LabelProp,
  OnClearFiltersProp,
  PendingProp,
  PlaceholderProp,
  StickyProp,
} from "../vocabulary";
import type { SearchSelectOptionProp } from "./data-entry.prop";

/**
 * How a {@link ToolbarProp} strip resolves more filters than fit one row (#216).
 * `wrap` (default) stacks on narrow viewports then wraps onto extra rows; `scroll` keeps ONE
 * bounded row that scrolls inline, so a wide filter set never pushes the list below the fold.
 */
export type FilterBarOverflowProp = "wrap" | "scroll";

/**
 * Typed search slot of the FilterBar model (gh#258). Renders the canonical SearchInput as the
 * FIRST control of the strip, with a token-owned consistent width (`--filter-bar-search-width`,
 * full-width below 640px). Controlled by consumer data via the `value`/`defaultValue`/
 * `onValueChange` triad; `onSearch` mirrors SearchInput's debounced-term callback.
 */
export type FilterBarSearchProp = {
  value?: string;
  defaultValue?: string;
  /** Fires on EVERY keystroke — required to keep a controlled `value` responsive. */
  onValueChange?: (query: string) => void;
  /** Fires with the DEBOUNCED term. Omit it when filtering is driven off `onValueChange`. */
  onSearch?: (query: string) => void;
  placeholder?: string;
  /** Visible label above the search field. Omit for the placeholder-only compact form. */
  label?: React.ReactNode;
  /** Accessible name when no visible `label` is given (defaults to the localized "Search"). */
  ariaLabel?: string;
  id?: IdProp;
  disabled?: DisabledProp;
};

/**
 * One typed filter of the FilterBar model (gh#258): a labelled, domain-neutral Select whose
 * options and selection are consumer data. `value` is the filter's stable identity (never shown);
 * the visible `label` is rendered as the control's real `<label htmlFor>` (WCAG 2.5.3 / 1.3.1).
 * Selection is controlled via `selected`/`defaultSelected`/`onSelectedChange` — the standard
 * triad, renamed so the filter's own identity `value` stays unambiguous.
 */
export type FilterBarFilterProp = {
  /** Stable filter identity (drives the control id + React key). */
  value: string;
  label: LabelProp;
  options: SearchSelectOptionProp[];
  selected?: string;
  defaultSelected?: string;
  onSelectedChange?: (selected: string) => void;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
};

/**
 * One applied-filter chip of the FilterBar model (gh#258). Chips are pure consumer data — the
 * lifecycle is: ADD by including the chip in `chips`, REMOVE via `onChipRemove(value)` (the ×
 * button), CLEAR-ALL via the bar's `onClear`. `label` should be a string when possible so the
 * remove button's accessible name can quote it; otherwise `value` is quoted instead.
 */
export type FilterBarChipProp = {
  /** Stable chip identity, passed to `onChipRemove`. */
  value: string;
  label: React.ReactNode;
  disabled?: DisabledProp;
};

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
  /**
   * Responsive overflow strategy (#216). Default `wrap`. Use `scroll` for list pages with many
   * filters (long JA/EN/VI labels) where a wrapped 3-row strip would push the table off screen.
   * Tune the scrollbar gutter with the `--filter-bar-scroll-padding-y` theme knob.
   */
  overflow?: FilterBarOverflowProp;
  /**
   * Typed model (gh#258) — search slot. When ANY model prop (`search`/`filters`/`chips`/
   * `onChipRemove`/`actions`/`resultCount`/`loading`/`disabled`/`error`) is present the bar renders
   * the canonical model layout: strip (search → filters → children → reset → actions) → chips row →
   * result-count/error line, with token-owned widths and stacking. Without any of them the bar
   * stays the plain children-composition toolbar — existing markup is unchanged.
   */
  search?: FilterBarSearchProp;
  /** Typed model — labelled Select filters rendered after the search slot, in array order. */
  filters?: FilterBarFilterProp[];
  /** Typed model — applied-filter chips (consumer data; add = include, remove = `onChipRemove`). */
  chips?: FilterBarChipProp[];
  /** Remove ONE chip by its `value`. Required for chips to render their × remove button. */
  onChipRemove?: (value: string) => void;
  /** Typed model — trailing action slot (e.g. a primary "Add" Button), parked at the inline end. */
  actions?: ActionsProp;
  /**
   * Typed model — localized, pluralized result count ("{count} results") announced politely via a
   * `role="status"` line under the strip. `0` is the rendered empty state, not "hidden".
   */
  resultCount?: number;
  /** Typed model — marks the strip `aria-busy` while results are being (re)fetched. */
  loading?: PendingProp;
  /** Typed model — disables every model-rendered control (search, filters, reset, chip removes). */
  disabled?: DisabledProp;
  /** Typed model — consumer error content, announced via `role="alert"` in place of the count. */
  error?: ErrorProp;
  className?: ClassNameProp;
  children?: ChildrenProp;
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
  /**
   * The glyph between inline steps (`type="inline"` only). `chevron` (default, `›`) is the
   * breadcrumb-flavoured original. `arrow` (`→`) is the canonical hosted-identity progression
   * marker: a chevron reads as "drill into", an arrow reads as "then" — which is what a step row
   * means. Ignored by every other `type`.
   */
  separator?: StepsSeparatorProp;
  onValueChange?: (value: number) => void;
  className?: ClassNameProp;
};

/** @see Steps — inline separator glyph. */
export type StepsSeparatorProp = "chevron" | "arrow";

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
