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
 * `wrap` (default) stacks on narrow viewports then wraps onto extra rows; `scroll` keeps ONE
 * bounded row that scrolls inline, so a wide filter set never pushes the list below the fold.
 */
export type FilterBarOverflowProp = "wrap" | "scroll";

/**
 * Renders the canonical SearchInput as the FIRST control of the strip, with a token-owned
 * consistent width (`--filter-bar-search-width`, full-width below 640px). Controlled by consumer
 * data via the `value`/`defaultValue`/ `onValueChange` triad; `onSearch` mirrors SearchInput's
 * debounced-term callback.
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
 * `value` is the filter's stable identity (never shown); the visible `label` is rendered as the
 * control's real `<label htmlFor>` (WCAG 2.5.3 / 1.3.1). Selection is controlled via
 * `selected`/`defaultSelected`/`onSelectedChange` — the standard triad, renamed so the filter's
 * own identity `value` stays unambiguous.
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
 * Chips are pure consumer data — the lifecycle is: ADD by including the chip in `chips`, REMOVE
 * via `onChipRemove(value)` (the × button), CLEAR-ALL via the bar's `onClear`. `label` should be a
 * string when possible so the remove button's accessible name can quote it; otherwise `value` is
 * quoted instead.
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
   * Opt-in — default `false` keeps the toolbar quiet. Tune the pinned offset/background with the
   * `--filter-bar-sticky-offset` / `--filter-bar-sticky-background` theme knobs.
   */
  sticky?: StickyProp;
  /**
   * Default `wrap`. Use `scroll` for list pages with many filters (long JA/EN/VI labels) where a
   * wrapped 3-row strip would push the table off screen.
   */
  overflow?: FilterBarOverflowProp;
  /**
   * When ANY model prop (`search`/`filters`/`chips`/
   * `onChipRemove`/`actions`/`resultCount`/`loading`/`disabled`/`error`) is present the bar
   * renders the canonical model layout: strip (search → filters → children → reset → actions) →
   * chips row → result-count/error line, with token-owned widths and stacking. Without any of them
   * the bar stays the plain children-composition toolbar — existing markup is unchanged.
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
   * When set, the visible group label is rendered as that control's real `<label htmlFor>`, so the
   * filter is named by the text the user sees (WCAG 2.5.3 / 1.3.1) — otherwise the control needs
   * its own `aria-label`.
   */
  controlId?: IdProp;
  className?: ClassNameProp;
  children: ChildrenProp;
};

/** @see Pagination — offset/page-based (distinct from DataTable cursor pagination). */
export type PaginationProp = {
  /** Override the `<nav>` landmark's accessible name. Defaults to a localized "Pagination". */
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
   * pages, so a lone disabled `1 / 1` bar is noise.
   */
  hideOnSinglePage?: boolean;
  simple?: boolean;
  /**
   * Ant Design `showQuickJumper`. Adds a "go to page" number field at the inline end of the bar;
   * committing it (Enter, or the optional Go button) clamps into `[1, pageCount]` and fires
   * `onValueChange`. Pass an object to supply the confirm button's content.
   */
  showQuickJumper?: boolean | { goButton?: React.ReactNode };
  /**
   * Control tier of every button in the bar. `md` (default) is the library's standard control
   * height; `sm` is Ant Design's `size="small"` pager for a dense table footer.
   */
  size?: PaginationSizeProp;
  /**
   * Ant Design `align`. Where the pager sits on its own inline axis — `end` (default) keeps the
   * long-standing table-footer alignment.
   */
  align?: PaginationAlignProp;
  /**
   * Ant Design `responsive`. `true` (the default) collapses the bar to its `simple` form below the
   * library's single mobile breakpoint (`useIsMobile`, max-width 767px) instead of leaving a number
   * strip wider than the phone to scroll — measured at 390px: 224px wide, zero page buttons, no
   * horizontal overflow. `simple` always wins; `responsive={false}` pins the full pager at every
   * width.
   */
  responsive?: boolean;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  onValueChange?: (page: number, pageSize: number) => void;
};

/** @see Pagination — control tier (Ant Design `size`: `small` → `sm`, `middle` → `md`). */
export type PaginationSizeProp = "sm" | "md";

/** @see Pagination — inline-axis alignment of the bar (Ant Design `align`, RTL-logical). */
export type PaginationAlignProp = "start" | "center" | "end";

/**
 * @see DropdownMenuContent — Ant Design `placement`, spelled on the LOGICAL inline axis.
 * antd's names are physical (`bottomLeft`, `topRight`); the same six anchors are `bottomStart`,
 * `topEnd` and so on here, so an Arabic or Hebrew app anchors on the correct edge with no second
 * value. Only the block-axis set is offered — see the note on the `placement` prop for why the
 * inline-side ones (antd `left*` / `right*`) stay on Radix's own physical `side`.
 */
export type DropdownMenuPlacementProp =
  "top" | "topStart" | "topEnd" | "bottom" | "bottomStart" | "bottomEnd";

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

/**
 * @see Steps — marker/rail appearance.
 * `dot` IS Ant Design's `progressDot` (antd 6.6.2 deprecates that prop in favour of exactly this
 * value). `inline` is the compact numbered auth/device progress row. `navigation` is antd's
 * chevron-sectioned bar: each step becomes a full-width slab pointing at the next one.
 */
export type StepsTypeProp = "default" | "dot" | "inline" | "navigation";

/** @see Steps */
/**
 * The rest of a native `<ol>`'s attributes ride through to the list element.
 *
 * Not a convenience: without them a consumer had no supported handle on the rendered list at all,
 * so its browser test bound to `.ui-steps-list > li[data-status]` — an INTERNAL class and an
 * internal data attribute, both of which this package is free to rename. A `data-testid` or an
 * `id` on the component is what that test wanted, and every sibling primitive already forwards
 * them.
 *
 * `aria-label` is the one exception: the list names itself from the locale, and a caller-supplied
 * name wins — the same contract Progress and Toolbar follow.
 */
export type StepsProp = Omit<
  React.OlHTMLAttributes<HTMLOListElement>,
  // `type` collides head-on: on an `<ol>` it is the NUMBERING style ("1" | "a" | "i"), and here it
  // is the marker appearance. Intersecting the two resolves the prop to `never`, which turns every
  // existing `<Steps type="inline">` into a type error — so the native one steps aside.
  "onChange" | "defaultValue" | "children" | "type"
> & {
  items?: StepItemProp[];
  value?: number;
  defaultValue?: number;
  status?: StepStatusProp;
  orientation?: "horizontal" | "vertical";
  /**
   * Marker appearance. `inline` renders the compact numbered auth/device progress row without the
   * icon rail while preserving the same status and current-step semantics; `navigation` renders
   * Ant Design's chevron-sectioned bar.
   */
  type?: StepsTypeProp;
  size?: "md" | "sm";
  titlePlacement?: "horizontal" | "vertical";
  /**
   * Ant Design `percent` — completion of the CURRENT (`process`) step only, 0–100. Draws a
   * determinate arc around that step's marker and exposes it to assistive tech as a
   * `progressbar`. Ignored by `inline`, which has no marker to draw into.
   */
  percent?: number;
  /**
   * The glyph between inline steps (`type="inline"` only). `chevron` (default, `›`) is the
   * breadcrumb-flavoured original.
   */
  separator?: StepsSeparatorProp;
  onValueChange?: (value: number) => void;
  className?: ClassNameProp;
};

/** @see Steps — inline separator glyph. */
export type StepsSeparatorProp = "chevron" | "arrow";

/** Tab pane — the conventional `items` entry. */
export type TabItemProp = {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  /** Leading glyph inside the trigger (Ant Design `Tab.icon`). */
  icon?: React.ReactNode;
  /**
   * Ant Design `Tab.closable`. Honoured only by `variant="editable-card"`, where it puts a remove
   * button in the trigger that calls `onEdit(value, "remove")`. Defaults to `true` there.
   */
  closable?: boolean;
  /** Ant Design `Tab.closeIcon` — replaces the default × on this item's remove button. */
  closeIcon?: React.ReactNode;
};

/**
 * @see Tabs — trigger-strip appearance. This is Ant Design's `type` spelled in the library's own
 * `variant` vocabulary: `line`, `card` and `editable-card` are antd's values, `default` is the
 * library's pill strip (antd has no equivalent).
 */
export type TabsVariantProp = "default" | "line" | "card" | "editable-card";

/**
 * @see Tabs — which edge the trigger strip parks on. This is Ant Design 6.6.2's `tabPlacement`
 * (its `tabPosition` is deprecated there), so the inline values are already RTL-logical —
 * `start`/`end`, never `left`/`right`. Both inline values also flip the tablist to vertical
 * roving focus (WAI-ARIA APG), which is what `orientation="vertical"` did on its own before.
 */
export type TabsPlacementProp = "top" | "bottom" | "start" | "end";

/**
 * @see Tabs — Ant Design `tabBarExtraContent`, held to the library's `extra` slot name and to its
 * logical inline axis: antd's `left`/`right` keys are `start`/`end` here, so an Arabic or Hebrew
 * app gets the slot on the correct edge with no second code path.
 */
export type TabsExtraProp = React.ReactNode | { start?: React.ReactNode; end?: React.ReactNode };

/**
 * @see Tabs — Ant Design `onEdit`. It is a NAMED alias rather than an inline signature so the
 * field reads as one prop everywhere: the catalog-sync guard splits an object type on top-level
 * commas, and an inline `(target, action) => void` leaks its second PARAMETER as a phantom prop.
 */
export type TabsOnEditProp = (
  target: string | React.MouseEvent<HTMLButtonElement>,
  action: "add" | "remove",
) => void;

/** @see Tabs — high-level tabs with optional `items` array. */
export type TabsProp = {
  items?: TabItemProp[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariantProp;
  /** Ant Design `tabPlacement`. Default `top`. */
  tabPlacement?: TabsPlacementProp;
  /** Control tier of the triggers. Default `md`. Ant Design `size` (`small`/`middle`/`large`). */
  size?: "sm" | "md" | "lg";
  /** Ant Design `centered` — centre the trigger strip on its own inline axis. */
  centered?: boolean;
  /** Ant Design `tabBarExtraContent`, renamed and made logical. @see TabsExtraProp */
  extra?: TabsExtraProp;
  /**
   * Ant Design `destroyOnHidden`. `true` (the default here, and Radix's own behaviour) unmounts a
   * panel the moment it stops being selected. `false` keeps EVERY panel mounted and only hides the
   * inactive ones, so a live chart, a scroll position or an unsent form draft survives a tab
   * switch. The default is deliberately the opposite of antd's, which keeps panels mounted.
   */
  destroyOnHidden?: boolean;
  /** Ant Design `onEdit`. `remove` passes the item's `value`; `add` passes the click event. */
  onEdit?: TabsOnEditProp;
  /** Ant Design `addIcon` — replaces the default + on the `editable-card` add button. */
  addIcon?: React.ReactNode;
  /** Ant Design `hideAdd` — keep `editable-card`'s remove buttons but drop the add button. */
  hideAdd?: boolean;
  className?: ClassNameProp;
  listClassName?: ClassNameProp;
  contentClassName?: ClassNameProp;
};
