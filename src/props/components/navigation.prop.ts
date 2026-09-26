/** Navigation component prop types — @see docs/COMPONENTS.md#navigation */
import type * as React from "react";
import type { ReactNode } from "react";
import type { AffixProp, AffixTargetProp } from "./layout.prop";
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
  TextAlignProp,
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

/**
 * @see DropdownMenu — Ant Design `trigger`: the gestures that open the menu, as an array because
 * more than one may be live at once (`['click', 'contextMenu']` is a row that opens from its kebab
 * AND from a right click anywhere on it).
 *
 * Default `['click']`, NOT antd's `['hover']`: a menu button that opens on hover is a pointer-only
 * affordance by default, and every consumer of this library today opens on click.
 *
 * `contextMenu` opens at the pointer and suppresses the browser's own menu. It is what replaced the
 * deleted `ContextMenu` component (v23) — antd has no such component either, and expresses the
 * whole idea as this value.
 *
 * Whatever the array says, the KEYBOARD opener stays wired: Enter / Space / ArrowDown on the
 * trigger for `click` and `hover`, and Shift+F10 / the ContextMenu key for `contextMenu`. A gesture
 * list can therefore never produce a menu that only a mouse can reach (WCAG 2.1.1).
 */
export type DropdownMenuTriggerActionProp = "click" | "hover" | "contextMenu";

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
  /**
   * The count beside the label — 「未対応 **12**」, the list-screen pattern (gh#762).
   *
   * It is the SAME counter vocabulary `Button` (gh#312) and `Toggle`/`ToggleGroupItem` (gh#734)
   * already publish, drawn by the same helper, so a counted tab and the counted chip under it
   * are one thing at one size and one accessible shape. Formatted with `Intl.NumberFormat` in
   * the active locale — never `String(n)`, never a hand-rolled thousands separator.
   *
   * WHY IT IS A SLOT AND NOT `label: <span>未対応 <Badge count={12} /></span>` (antd's answer):
   * with the number inside the label the PACKAGE owns none of it — not the size, not the gap,
   * not the tone as the tab moves between selected / unselected / disabled — so every consumer
   * lands somewhere different. The slot is what lets the tab state drive the pill.
   */
  count?: number;
  /** Cap for `count` — beyond it the pill shows `{overflowCount}+` (e.g. `99+`). Default `99`. */
  overflowCount?: number;
  /** Render the pill when `count` is 0. Default `true`, matching Button and Toggle. */
  showZero?: boolean;
  /**
   * Localized description of what the count MEANS, folded into the tab's accessible name so it
   * never announces as label-then-bare-digits. The digits concatenate straight onto the label in
   * the accessibility tree («未対応12», gh#734's defect), so the pill is `aria-hidden` and the
   * spoken clause is an `sr-only` sibling: `countLabel="未対応の課題"` reads
   * 「未対応, 12 未対応の課題」. Already localized when it arrives — pass a `t()` string.
   */
  countLabel?: string;
  /**
   * Ant Design `Tab.forceRender`. Mounts THIS panel up front and keeps it mounted while another
   * tab is selected, without turning that on for the whole strip the way `destroyOnHidden={false}`
   * does — so the one panel holding a live chart, a scroll position or an unsent draft survives a
   * tab switch while the rest are still destroyed.
   *
   * antd 5.25 also grew a per-item `destroyOnHidden`. It is NOT offered here: on this component
   * "kept mounted" is a single state, so an item-level `destroyOnHidden: false` would be a second
   * prop spelling exactly what `forceRender: true` already says (cardinal rule #32).
   */
  forceRender?: boolean;
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

/**
 * @see Tabs — what the trigger strip does when there are more tabs than fit its container.
 *
 * This is Ant Design's `more`, mapped onto the `overflow` vocabulary this package already uses
 * for the same question (`FilterBarOverflowProp` on Toolbar) rather than re-spelled: antd names
 * the AFFORDANCE it happens to draw, this library names the BEHAVIOUR and owns the affordance.
 *
 * `scroll` (the default, and what every strip does today) keeps one bounded row that scrolls its
 * own inline overflow, with `TabsList` re-pinning the active — or, under manual activation, the
 * focused — trigger. `menu` keeps all of that AND puts a real button beside the strip listing the
 * tabs currently outside the scrollport.
 *
 * WHERE THIS DELIBERATELY DIVERGES FROM ANTD, and why: antd REMOVES the overflowing tabs from the
 * bar and re-homes them in the dropdown. The WAI-ARIA APG tab pattern requires the tablist to own
 * every tab, and a tab hidden with `display: none` cannot take roving focus — so removing them
 * would make the keyboard route to those tabs disappear along with the pixels. Here the strip
 * still holds and still scrolls to every tab; the menu is an ADDITIONAL pointer route to the ones
 * a mouse user cannot currently see. The APG wins; the affordance is kept.
 */
export type TabsOverflowProp = "scroll" | "menu";

/**
 * @see Tabs — Ant Design `onTabClick`. A NAMED alias rather than an inline signature for the same
 * reason as `TabsOnEditProp`: the catalog-sync guard splits an object type on top-level commas,
 * so an inline `(value, event) => void` leaks its second PARAMETER as a phantom prop.
 */
export type TabsOnTabClickProp = (
  value: string,
  event: React.MouseEvent<HTMLButtonElement>,
) => void;

/**
 * @see Tabs — Ant Design `animated`, same shape and same two switches.
 *
 * `inkBar` (default ON) is the `line` variant's active bar cross-fading between triggers.
 * `tabPane` (default OFF, as in antd) fades the panel in when the selection moves.
 *
 * WHERE IT DIVERGES, and why: antd animates the PANE by laying every pane on one translated
 * inline track and sliding it, which needs all of them mounted. This component destroys a hidden
 * panel by default (`destroyOnHidden` — the opposite default from antd), so there is no track to
 * slide; the pane animation is a token-owned fade-in on the panel that just became active
 * (`--tabs-pane-motion-*`). The SWITCH is antd's, the motion is this library's, and both switches
 * are additionally off under `prefers-reduced-motion` — which antd's is not.
 */
export type TabsAnimatedProp = boolean | { inkBar?: boolean; tabPane?: boolean };

/**
 * @see Tabs — Ant Design `indicator.size`, held to a NAMED axis instead of a pixel length.
 *
 * antd takes `number | (origin: number) => number` — a measured px length, or a function of the
 * tab's own width. Neither can enter this library: a literal is what `no-arbitrary-spacing`
 * exists to stop, and a function of the measured origin is the free-form escape hatch
 * `docs/DESIGN-AUTHORITY.md` refuses by name. The two lengths that answer the actual request are
 * named instead — `full` (the whole trigger, today's bar and the default) and `label` (the
 * trigger's content box, i.e. minus its own inline padding), which is what
 * `size: (origin) => origin - 2 * padding` is written to produce.
 */
export type TabsIndicatorSizeProp = "full" | "label";

/**
 * @see Tabs — Ant Design `indicator`. `align` keeps antd's own name AND its values, which are
 * already logical, so it reads the shared `TextAlignProp` vocabulary rather than a second
 * spelling of the same axis. It only has anything to place when `size` is shorter than the
 * trigger, exactly as in antd.
 */
export type TabsIndicatorProp = {
  size?: TabsIndicatorSizeProp;
  align?: TextAlignProp;
};

/**
 * @see Tabs — the edge a scroll of the trigger strip moved TOWARDS, on the logical axis.
 *
 * antd reports `left | right | top | bottom`; those four cannot mirror for an RTL locale and two
 * of them are just the other axis of the same event. `start`/`end` say the same thing on whichever
 * axis the strip is on — the same override that makes `tabPlacement` logical.
 */
export type TabsScrollDirectionProp = "start" | "end";

/**
 * @see Tabs — Ant Design `onTabScroll`. A NAMED alias for the same reason as `TabsOnEditProp`.
 * Only fires for the `items` API, which is the path that owns the strip element.
 */
export type TabsOnScrollProp = (info: { direction: TabsScrollDirectionProp }) => void;

/** @see Tabs — high-level tabs with optional `items` array. */
export type TabsProp = {
  items?: TabItemProp[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariantProp;
  /**
   * Ant Design `tabPlacement`. Default `top`.
   *
   * `start`/`end` FOLD to `top`/`bottom` at or below
   * `--tabs-placement-responsive-breakpoint-width` (48rem), arrow keys included — a vertical strip
   * shares one inline axis with its panel and a phone has no room for both. Ant Design folds the
   * same pair the same way. Set the token to `0px` to keep the strip vertical at every width.
   */
  tabPlacement?: TabsPlacementProp;
  /** Control tier of the triggers. Default `md`. Ant Design `size` (`small`/`middle`/`large`). */
  size?: "sm" | "md" | "lg";
  /** Ant Design `centered` — centre the trigger strip on its own inline axis. */
  centered?: boolean;
  /**
   * Draw the PANEL BODY the card strip opens into, so the strip and the panel are ONE object
   * (gh#762): a surface, a border continuous with the rail, and the radius on the two corners
   * away from the strip. The active tab's block-end edge is repainted in that body's own colour,
   * which is what makes it read as opened into the body rather than closed off above it.
   *
   * WHY IT EXISTS. `variant="card"` already repaints the active face's merged edge — antd's
   * `genCardStyle` — but the package shipped no body for it to merge INTO, so the consumer had to
   * supply one and every choice was wrong. Measured on 28.0.0 against a `variant="card"` strip at
   * 1440px: `<Card>` left an 8px gap AND added a second 1px border at a 9.708px radius (two
   * stacked boxes), `<Card variant="borderless">` left the same 8px gap with no line at all, and
   * no box at all left the 8px gap over a transparent panel. The gap is `--tabs-root-gap`, which
   * is correct for every OTHER variant — a body is not a gap tweak, it is the missing half of the
   * card face.
   *
   * HONOURED ONLY BY `card` / `editable-card`, and that is a statement, not a limitation. The
   * pill strip is a free-floating control and the `line` strip's own body is the CARD around it —
   * `<Card tabList>` is that pairing, already built and already joined. Passing `bodied` to any
   * other variant emits no attribute and changes no pixel.
   *
   * OPT-IN, so no strip on 28.0.0 moves. A service that wants every card strip bodied has the
   * `card`-variant defaults as a theme decision, not a prop it must repeat.
   */
  bodied?: boolean;
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
  /**
   * Ant Design `removeIcon` — the strip-wide default glyph on `editable-card`'s remove shortcut.
   * A `TabItemProp.closeIcon` on one item still wins over it, which is antd's own precedence.
   */
  closeIcon?: React.ReactNode;
  /**
   * Ant Design `more`. Default `scroll` — the behaviour every strip has today, unchanged.
   * @see TabsOverflowProp for what `menu` adds and where it parts company with antd.
   *
   * The default is deliberately NOT `menu`: switching it would change the rendered bar for every
   * existing consumer at once, and which of the two a dense strip wants is a service decision, not
   * a library one.
   */
  overflow?: TabsOverflowProp;
  /**
   * Ant Design `onTabClick`. Fires on EVERY pointer activation of a trigger — including a click on
   * the tab that is already selected, where `onValueChange` is silent by design. That is the whole
   * reason it is a separate prop and not a re-spelling of `onValueChange` (cardinal rule #32):
   * "the user asked for this tab again" (re-fetch, close a drawer, scroll a panel back to the top)
   * is a different event from "the selection changed".
   *
   * Keyboard activation is NOT routed here, and that is the APG winning over antd: under
   * `activationMode="manual"` the arrow keys move focus without activating, so a key-driven
   * "click" would be a fiction. Use `onValueChange` for selection, whatever moved it.
   */
  onTabClick?: TabsOnTabClickProp;
  /**
   * Ant Design `animated`. Default `{ inkBar: true, tabPane: false }` — antd's own default, and
   * byte for byte what this strip already painted. @see TabsAnimatedProp
   */
  animated?: TabsAnimatedProp;
  /**
   * Ant Design `indicator`. Governs the `line` variant's active bar only — the other variants
   * have no bar to place. @see TabsIndicatorProp
   */
  indicator?: TabsIndicatorProp;
  /**
   * Ant Design `more.icon` — the glyph on the `overflow="menu"` button, flat here for the same
   * reason `addIcon` and `closeIcon` are flat: `overflow` names the BEHAVIOUR, the icon is a slot.
   */
  moreIcon?: React.ReactNode;
  /*
   * ANT DESIGN `tabBarGutter` IS NOT HERE, and that is a standing decision rather than an
   * oversight: the gutter between triggers is `--tabs-list-line-space-gap` /
   * `--tabs-card-list-space-gap` (see src/tokens/components/navigation.css, which records why —
   * a number of pixels is a constant, not a semantic axis, and a constant belongs to the theme).
   * The pill strip has no gutter at all by design.
   */
  /** Ant Design `onTabScroll`, on the logical axis. @see TabsOnScrollProp */
  onTabScroll?: TabsOnScrollProp;
  className?: ClassNameProp;
  listClassName?: ClassNameProp;
  contentClassName?: ClassNameProp;
};

/**
 * One conversation in the rail. Ant Design X `ConversationItemType`, field for field:
 * `key`, `label`, `group`, `icon`, `disabled`.
 *
 * `key` is `string` and REQUIRED, as it is in Ant X — the rail's whole contract (which row is
 * active, which row a menu command was aimed at, which row the roving tabindex is parked on) is
 * addressed by it, and an optional identity would make every one of those "probably this one".
 * @see Conversations
 */
/**
 * One row. Ant Design X calls this `Conversation` and this type carries every field of it.
 *
 * THREE ANT DESIGN X PROPS ARE DELIBERATELY ABSENT from `ConversationsProp`, and under
 * `docs/DESIGN-AUTHORITY.md` an undocumented deviation is a bug, so here are the reasons:
 * `styles`, `classNames` and `rootClassName` are antd's per-part style escape hatches. This
 * library's equivalent is the token tier — a service retunes every Conversations list at once by
 * rebinding `--conversations-*`, and `check:no-hardcoded-css-values` plus the CONSUMER-RULES ban
 * on utility classes exist precisely so a call site cannot paint one list differently from its
 * neighbours. Accepting them would hand back the thing those gates are for.
 */
export type ConversationsItemProp = {
  /** Unique identity of the conversation. Ant Design X `key`. */
  key: string;
  /** What the row reads. Ant Design X `label`. */
  label?: React.ReactNode;
  /** Bucket this row belongs to, honoured only while `groupable` is on. Ant Design X `group`. */
  group?: string;
  /** Decorative leading node. Ant Design X `icon`. */
  icon?: React.ReactNode;
  /** Row stays visible and reachable by arrow key, but cannot be activated. Ant Design X `disabled`. */
  disabled?: DisabledProp;
  /**
   * When the conversation last moved, as an epoch milliseconds number — Ant Design X `timestamp`.
   *
   * A NUMBER, not a formatted string, and that is the whole point: the row renders it through the
   * app's own locale and timezone from `AppProvider`, so a Japanese tenant reads 2026/03/15 and a
   * Vietnamese one reads 15/03/2026 from the SAME data. Handing the component a pre-formatted
   * string is what `docs/DATETIME.md` rule 1 forbids, and it is the reason this prop is not
   * `ReactNode` even though every other field here is.
   */
  timestamp?: number;
};

/**
 * A rule between two runs of conversations. Ant Design X `DividerItemType`.
 * @see Conversations
 */
export type ConversationsDividerProp = {
  type: "divider";
  key?: string;
  /** Ant Design X `dashed`. */
  dashed?: boolean;
};

/** Either kind of row `items` accepts. Ant Design X `ItemType`. @see Conversations */
export type ConversationsEntryProp = ConversationsItemProp | ConversationsDividerProp;

/**
 * One command on a row's overflow menu — rename, duplicate, delete.
 * @see Conversations
 */
export type ConversationsMenuItemProp = {
  /** Identity handed back to `menu.onClick`. */
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Paints the command as irreversible (`DropdownMenuItem variant="destructive"`). Ant Design `danger`. */
  danger?: boolean;
  disabled?: DisabledProp;
};

/**
 * The per-row overflow menu. Ant Design X takes antd's whole `MenuProps` here; this takes the two
 * fields of it a conversation rail uses — the commands, and where a click lands — plus the
 * accessible name the icon-only trigger needs and Ant X never had.
 * @see Conversations
 */
export type ConversationsMenuProp = {
  items: readonly ConversationsMenuItemProp[];
  /** Fires with the command and the row it was aimed at. */
  onClick?: (info: { key: string; conversation: ConversationsItemProp }) => void;
  /**
   * Accessible name of the icon-only trigger. Receives the row so the name can name it
   * ("More actions for 請求書の下書き"), which is what keeps twelve identical "More" buttons apart
   * in a screen reader's element list. A localized default applies when omitted.
   */
  triggerLabel?: (conversation: ConversationsItemProp) => string;
};

/**
 * Grouping options. Ant Design X `GroupableProps` — `label`, `collapsible`, and the
 * `defaultExpandedKeys` / `expandedKeys` / `onExpand` triad it inherits from `CollapsibleOptions`.
 * @see Conversations
 */
export type ConversationsGroupableProp = {
  /** Heading for a bucket. A function receives the raw `group` string. Ant Design X `label`. */
  label?: React.ReactNode | ((group: string) => React.ReactNode);
  /** Whether a bucket's heading collapses it. A function decides per bucket. Ant Design X `collapsible`. */
  collapsible?: boolean | ((group: string) => boolean);
  /** Uncontrolled initially-open buckets. Ant Design X `defaultExpandedKeys`. */
  defaultExpandedKeys?: readonly string[];
  /** Controlled open buckets. Ant Design X `expandedKeys`. */
  expandedKeys?: readonly string[];
  /** Fires with the next open set. Ant Design X `onExpand`. */
  onExpand?: (keys: string[]) => void;
};

/**
 * The "new conversation" button pinned above the rail. Ant Design X `creation`.
 * @see Conversations
 */
export type ConversationsCreationProp = {
  /** Button text. A localized default applies when omitted. Ant Design X `label`. */
  label?: React.ReactNode;
  /** Leading glyph. Defaults to a plus. Ant Design X `icon`. */
  icon?: React.ReactNode;
  disabled?: DisabledProp;
  onClick?: () => void;
};

/**
 * @see Conversations — the session rail of a chat surface (Ant Design X `Conversations`): the list
 * of past conversations, the current one marked, a per-row overflow menu, and recency buckets.
 *
 * Ant X's own rail is a bare `<ul>` of `<li onClick>` with no roles, no `tabIndex` and no key
 * handling — measured in `@ant-design/x@2.9.0`, `es/conversations/Item.js` renders a `<li>` whose
 * only interactive affordance is `onClick`. That is the half of it this port does NOT copy: the
 * rows here are real `Button`s under a single roving tabindex, so the whole rail is ONE tab stop
 * and ↑/↓/Home/End move between conversations. Everything a caller passes keeps Ant X's spelling.
 */
export type ConversationsProp = {
  /** The rows. Ant Design X `items`. */
  items?: readonly ConversationsEntryProp[];
  /** Controlled selection. Ant Design X `activeKey`. */
  activeKey?: string;
  /** Uncontrolled initial selection. Ant Design X `defaultActiveKey`. */
  defaultActiveKey?: string;
  /** Fires with the picked key and the entry behind it. Ant Design X `onActiveChange`. */
  onActiveChange?: (key: string, item?: ConversationsEntryProp) => void;
  /** One menu for every row, or a function returning the menu for one. Ant Design X `menu`. */
  menu?:
    | ConversationsMenuProp
    | ((conversation: ConversationsItemProp) => ConversationsMenuProp | undefined);
  /** Bucket rows by their `group` field. Ant Design X `groupable`. */
  groupable?: boolean | ConversationsGroupableProp;
  /** The "new conversation" button above the rail. Ant Design X `creation`. */
  creation?: ConversationsCreationProp;
  /**
   * Accessible name of the rail — a plain STRING, because it lands on `aria-label`, which is a
   * text attribute and cannot carry a node. Ant X has no equivalent because its rail has no role
   * to name; a localized default applies when omitted.
   */
  label?: string;
  id?: IdProp;
  className?: ClassNameProp;
};

/* ───────────────────────────── MegaMenu ─────────────────────────────
 * Ant Design's `Menu mode="horizontal"` is the authority for the NAMES and the SEMANTICS here
 * (docs/DESIGN-AUTHORITY.md). What antd calls `items` / `triggerSubMenuAction` /
 * `subMenuOpenDelay` / `subMenuCloseDelay` / `selectedKeys` / `openKeys` keeps its spelling or an
 * exactly-documented collapse of it.
 *
 * TWO deliberate departures, both forced by a rule this repo outranks antd with:
 *
 * 1. `openKeys: string[]` -> `open: string | null`. antd's array exists because its Menu nests
 *    SubMenus arbitrarily deep, so several levels can be open at once. A megamenu bar is ONE
 *    level by construction: at most one panel is open. The array would only ever hold zero or one
 *    key, and the controlled-vocabulary rule (`open`/`defaultOpen`/`onOpenChange`) applies to the
 *    overlay triad. So the triad keeps its vocabulary spelling and carries the open panel's key.
 * 2. `selectedKeys: string[]` -> `value: string`. Same reason plus a stronger one: in a site nav
 *    the "selection" is the CURRENT ROUTE, and a route is one key. It drives `aria-current="page"`,
 *    not a selection highlight, so `multiple` / `onDeselect` have nothing to mean here.
 *
 * antd props NOT ported, each because the thing they configure does not exist at one level:
 * `inlineCollapsed` / `inlineIndent` (no inline mode - the narrow layout is the same disclosure,
 * laid out in flow), `overflowedIndicator` (a nav bar of 4-8 links wraps; it does not collapse
 * into an ellipsis SubMenu), `forceSubMenuRender` (every panel is in the DOM already - that is
 * what makes the narrow accordion and the `aria-controls` target free), `theme` (tokens),
 * `multiple` / `selectable` / `onDeselect` (a route is singular).
 */

/**
 * Which pointer action opens a panel. Ant Design `triggerSubMenuAction`, minus antd's third
 * value: `contextMenu` is a Dropdown affordance, and a right-click that opened a site nav panel
 * would shadow the browser's own menu.
 *
 * `click` is the default here where antd defaults to `hover`, and that is the WCAG 2.2 call, not
 * a taste one: a hover-only trigger has no equivalent on a touch screen. `hover` remains
 * available and still accepts click - see `MegaMenuProp.triggerAction`.
 */
export type MegaMenuTriggerActionProp = "click" | "hover";

/** One link inside a panel group. A leaf: it navigates, it never opens anything. */
export type MegaMenuLinkProp = {
  /** Stable identity. Ant Design `MenuItemType.key`. */
  key: string;
  /** Ant Design `MenuItemType.label`. */
  label: React.ReactNode;
  /** Destination. Omit it and the row reports through `onValueChange` instead (SPA visit). */
  href?: string;
  /** A line under the label. Ant Design `MenuItemType.extra`, given the shape a nav panel uses. */
  description?: React.ReactNode;
  /** Ant Design `MenuItemType.icon`. Decorative - the label is the accessible name. */
  icon?: React.ReactNode;
  /** Ant Design `MenuItemType.disabled`. */
  disabled?: DisabledProp;
};

/**
 * One column of a panel. Ant Design `MenuItemGroupType` (`type: "group"`), which is exactly this:
 * a labelled cluster of items that is itself not interactive.
 */
export type MegaMenuGroupProp = {
  key: string;
  /** Ant Design `MenuItemGroupType.label`. Omit for a bare column of links with no heading. */
  label?: LabelProp;
  /** A sentence under the group heading. No antd equivalent - antd groups carry a label only. */
  description?: React.ReactNode;
  /** Decorative glyph beside the group heading. */
  icon?: React.ReactNode;
  /** Ant Design `MenuItemGroupType.children`, narrowed to leaves: a panel is one level deep. */
  links: readonly MegaMenuLinkProp[];
};

/** The disclosure panel behind one top-level item. Ant Design `SubMenuType.children`. */
export type MegaMenuPanelProp = {
  /** The columns. Ant Design `SubMenuType.children` restricted to `type: "group"` entries. */
  groups: readonly MegaMenuGroupProp[];
  /** A full-width strip below the columns - a promo, a "see all", a support line. */
  footer?: React.ReactNode;
};

/**
 * One top-level bar item. With a `panel` it is a DISCLOSURE BUTTON (Ant Design `SubMenuType`);
 * without one it is a plain link (Ant Design `MenuItemType`) - the "Top-Level Links" half of the
 * APG pattern this implements.
 */
export type MegaMenuItemProp = {
  key: string;
  label: React.ReactNode;
  /** Only meaningful without a `panel`: a disclosure button is not a link. */
  href?: string;
  icon?: React.ReactNode;
  disabled?: DisabledProp;
  panel?: MegaMenuPanelProp;
};

/**
 * Router link component, same contract as `Sidebar.linkComponent`: it receives `href` plus the
 * row's state props and children, and renders exactly one `<a>`.
 */
export type MegaMenuLinkComponentProp = React.ComponentType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }
>;

/**
 * MegaMenu - a primary site navigation whose top-level items disclose a full-width panel of
 * grouped links.
 *
 * Implements WAI-ARIA APG **Disclosure Navigation with Top-Level Links**, NOT Menubar. A site nav
 * is a set of LINKS to places, not a menu of commands, and `role="menu"` promises assistive
 * technology a command widget it will then navigate as one. That is the classic megamenu a11y
 * error, and it is also why this cannot be `DropdownMenu` + a token: `DropdownMenu` is
 * react-aria-components `Menu`, i.e. `role="menu"` / `role="menuitem"` by construction.
 */
export type MegaMenuProp = {
  /** The bar. Ant Design `items`. */
  items: readonly MegaMenuItemProp[];
  /** Key of the open panel, or `null` for none. Ant Design `openKeys`, collapsed to one level. */
  open?: string | null;
  /** Initial uncontrolled open panel. Ant Design `defaultOpenKeys`, collapsed to one level. */
  defaultOpen?: string | null;
  /** Fires with the newly open panel's key, or `null` when everything closed. Ant `onOpenChange`. */
  onOpenChange?: (key: string | null) => void;
  /** Key of the item for the CURRENT ROUTE - renders `aria-current="page"`. Ant `selectedKeys`. */
  value?: string;
  /** Uncontrolled initial current route. Ant Design `defaultSelectedKeys`. */
  defaultValue?: string;
  /**
   * Fires with the activated key (a top-level link, or a panel link). Ant Design `onClick`.
   * Activation always closes the open panel - the "close on route change" half of the contract
   * that does not need a router.
   */
  onValueChange?: (key: string) => void;
  /** Bar density. The trigger box tracks the matching `--control-height` tier. */
  size?: "xs" | "sm" | "md" | "lg";
  /** Ant Design `triggerSubMenuAction`. `hover` also accepts click, so touch is never stranded. */
  triggerAction?: MegaMenuTriggerActionProp;
  /** Ant Design `subMenuOpenDelay`, in MILLISECONDS (antd uses seconds). `hover` only. */
  openDelay?: number;
  /**
   * Ant Design `subMenuCloseDelay`, in MILLISECONDS. This is the hover-intent grace period: the
   * pointer may leave the bar entirely for this long - crossing a diagonal toward the panel -
   * before anything closes. `hover` only.
   */
  closeDelay?: number;
  /** Accessible name of the `<nav>` landmark. A plain string: it lands on `aria-label`. */
  label?: string;
  /** Ant Design `expandIcon`. `false` removes the chevron; a node replaces it. */
  expandIcon?: React.ReactNode | false;
  /** Router link component for every `href` in the bar and the panels. */
  linkComponent?: MegaMenuLinkComponentProp;
  id?: IdProp;
  className?: ClassNameProp;
} & Omit<React.HTMLAttributes<HTMLElement>, "onChange" | "defaultValue" | "children">;

/**
 * One entry of `Anchor items` — Ant Design `AnchorItem`, field for field.
 *
 * `key` / `href` / `title` / `target` / `children` are antd's, with the same meanings; antd's
 * per-link `targetOffset` (6.4.0) is here under the logical name the component-level prop uses.
 * @see Anchor
 */
export type AnchorItemProp = {
  /** Stable identity of the link. Ant Design `AnchorItem.key`. */
  key: React.Key;
  /** The in-page fragment this entry points at — `"#pricing"`. Ant Design `AnchorItem.href`. */
  href: string;
  /** The link's visible content. Ant Design `AnchorItem.title`. */
  title: ReactNode;
  /** `<a target>` — for the rare entry that points off-page. Ant Design `AnchorItem.target`. */
  target?: string;
  /**
   * ONE level of nesting, exactly as Ant Design allows, and — again exactly as Ant Design — it is
   * DROPPED when `direction="horizontal"`, where a nested list has nowhere to go. A horizontal
   * anchor carrying `children` warns in development rather than rendering a second row.
   */
  children?: AnchorItemProp[];
  /**
   * Replace this entry's `href` in history instead of pushing it. Ant Design `AnchorItem.replace`,
   * default `false`, and it overrides the component-level `replace`.
   */
  replace?: boolean;
  /**
   * Scroll landing offset for THIS entry, overriding the component's `targetOffsetBlockStart`.
   * Ant Design `AnchorItem.targetOffset` (6.4.0), renamed to its logical axis for the reason
   * `AffixProp.offsetBlockStart` states.
   */
  targetOffsetBlockStart?: number;
};

/** The scroll box an `Anchor` measures its sections in. Ant Design `AnchorContainer`. @see Anchor */
export type AnchorContainerProp = HTMLElement | Window;

/**
 * `Anchor`'s own layout axis — Ant Design `direction`, and the word `Separator` / `Flex` /
 * `Toolbar` already use for the same idea here, so antd's spelling and this library's agree.
 * @see Anchor
 */
export type AnchorDirectionProp = "vertical" | "horizontal";

/**
 * @see Anchor — Ant Design's `Anchor`: the in-page section navigation, and the thing that COMPUTES
 * which section is current. `NavList activeId` takes that answer as a prop; nothing else in this
 * library works it out.
 *
 * antd's surface, ported first: `items`, `direction`, `affix`, `bounds`, `getContainer`,
 * `getCurrentAnchor`, `offsetTop`, `targetOffset`, `showInkInFixed`, `replace`, `onChange`,
 * `onClick`. Three renames, each written at its field: the two physical offsets take their
 * logical axis, and antd's `onChange` becomes `onValueChange` because the active href here IS a
 * controlled value (`value` / `defaultValue` / `onValueChange`), which antd has no spelling for
 * at all. All three antd names stay findable — declared `never`, `@deprecated` with the
 * replacement named, and warned about in development.
 *
 * `target` (gh#890) is a fourth: `getContainer`'s own idea, renamed to `Affix`'s spelling and
 * shape (`AffixTargetProp`) so the two components that share a scroll box — `Anchor` pins itself
 * to one AND resolves which section is current inside it — share one name for it too. Unlike the
 * other three it is additive, not a hard break: `getContainer` still works, `target` wins when
 * both are given.
 */
export type AnchorProp = {
  /** The entries, in document order. Ant Design `items`. */
  items?: AnchorItemProp[];
  /** Layout axis. Ant Design `direction`, default `"vertical"`. */
  direction?: AnchorDirectionProp;
  /**
   * Pin the nav with `Affix`. Ant Design `affix`, default `true`, and antd's object form is
   * literally `AffixProps` minus the three fields `Anchor` supplies itself — which is why gh#827
   * lands before gh#828.
   *
   * `false` leaves the nav in the flow. An object is forwarded to `Affix`; `offsetBlockStart`,
   * `target` and `children` come from `Anchor` and are not yours to set there.
   */
  affix?: boolean | Omit<AffixProp, "offsetBlockStart" | "offsetTop" | "target" | "children">;
  /** Tolerance, in pixels, added to the decision line. Ant Design `bounds`, default `5`. */
  bounds?: number;
  /**
   * The scroll box the sections are measured in AND the box `Affix` pins the nav against — one
   * function, both halves (gh#890). `AffixTargetProp`, the same lazy-getter shape and the same
   * name `Affix.target` / `FloatButton.BackTop.target` already spell here, so a consumer who has
   * scoped one scrolling component already knows this one. `null` means the viewport. Absent (with
   * no `getContainer`), it is the nearest ancestor that scrolls on the block axis, else the
   * viewport — `Affix`'s own default (gh#984). Wins over `getContainer` when both are given.
   */
  target?: AffixTargetProp;
  /**
   * The scroll box holding the sections. Ant Design `getContainer`; omitted → the nearest
   * block-axis scroller, else the viewport (gh#984).
   *
   * Superseded by `target`, which mirrors `Affix`'s own spelling for the identical idea; kept,
   * still live, for a call site written before `target` existed.
   */
  getContainer?: () => AnchorContainerProp;
  /**
   * Last word on the highlight, given the one the scroll position resolved. Ant Design
   * `getCurrentAnchor`, kept because it is antd's own escape hatch and it runs INSIDE the
   * resolution, with no render round-trip. A controlled `value` outranks it.
   */
  getCurrentAnchor?: (activeLink: string) => string;
  /**
   * Where the decision line sits, measured from the scrollport's block-start edge, and the
   * distance `Affix` pins the nav at. Ant Design `offsetTop`, default `0`; renamed to its logical
   * axis for the reason `AffixProp.offsetBlockStart` states.
   */
  offsetBlockStart?: number;
  /**
   * Where a CLICKED section lands, measured from the scrollport's block-start edge — the room a
   * pinned header needs. Ant Design `targetOffset`, which defaults to `offsetTop`; same default
   * here, against `offsetBlockStart`.
   *
   * antd uses `targetOffset` for the decision line too whenever it is a number, and that is
   * ported: the line a section becomes current at and the line it lands on are the same line, so
   * a click cannot leave the item it just selected unselected.
   */
  targetOffsetBlockStart?: number;
  /** Draw the ink rail when `affix={false}`. Ant Design `showInkInFixed`, default `false`. */
  showInkInFixed?: boolean;
  /** Replace the hash in history instead of pushing it. Ant Design `replace`, default `false`. */
  replace?: boolean;
  /** Controlled active `href` (the entry carrying `aria-current="location"`). */
  value?: string;
  /** Uncontrolled initial active `href`, before the hash or the scroll position has an opinion. */
  defaultValue?: string;
  /**
   * Fires when the active entry changes — from a click, from the landing hash, and from the
   * scroll position. Ant Design calls this `onChange`; the pair `value`/`defaultValue` makes this
   * the setter half of a controlled value, and the triad's name for that here is `onValueChange`.
   *
   * antd's own note is ported with it: the callback reports the link the SCROLL POSITION resolved,
   * not the one `getCurrentAnchor` substituted for it.
   */
  onValueChange?: (href: string) => void;
  /**
   * NOT A PROP — Ant Design's name for `onValueChange`.
   *
   * @deprecated Ant Design spells this `onChange`; in `@godxjp/ui` the active href is a controlled
   * value, so it is `onValueChange`, beside `value` and `defaultValue`.
   */
  onChange?: never;
  /**
   * NOT A PROP — Ant Design's name for `offsetBlockStart`.
   *
   * @deprecated Ant Design spells this `offsetTop`; in `@godxjp/ui` it is `offsetBlockStart`.
   */
  offsetTop?: never;
  /**
   * NOT A PROP — Ant Design's name for `targetOffsetBlockStart`.
   *
   * @deprecated Ant Design spells this `targetOffset`; in `@godxjp/ui` it is
   * `targetOffsetBlockStart`.
   */
  targetOffset?: never;
  /** Fires on activation, before the scroll. Ant Design `onClick`. */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>, item: AnchorItemProp) => void;
  /**
   * Accessible name of the `<nav>` landmark — a plain STRING, because it lands on `aria-label`.
   * antd has no equivalent and ships an unnamed `<div>`; a page routinely carries a breadcrumb, a
   * rail and this, so a localized default ("On this page") applies when omitted.
   */
  label?: string;
  id?: IdProp;
  className?: ClassNameProp;
};
