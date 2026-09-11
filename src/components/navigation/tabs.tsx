import * as React from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
} from "react-aria-components";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";
import { useMaxWidthBreakpoint } from "../../lib/breakpoint-token";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useKeepActiveTabVisible, useTabsOverflowValues } from "./tabs-scroll";
import type {
  TabItemProp,
  TabsExtraProp,
  TabsPlacementProp,
  TabsProp,
} from "../../props/components/navigation.prop";

export type {
  TabItemProp,
  TabsProp,
  TabsVariantProp,
  TabsPlacementProp,
  TabsExtraProp,
  TabsOverflowProp,
} from "../../props/components/navigation.prop";

export type TabsOrientation = "vertical" | "horizontal";
export type TabsItem = TabItemProp;
export type TabsProps = Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "dir"> &
  TabsProp & {
    orientation?: TabsOrientation;
    dir?: "ltr" | "rtl";
    activationMode?: "manual" | "automatic";
  };

type TabsFrame = {
  /**
   * The resolved orientation, so `TabsTrigger` / `TabsContent` can keep emitting the
   * `data-orientation` hook Radix put on them. React Aria only exposes orientation on the root and
   * the list, and 12k lines of CSS in `src/styles/` are allowed to key on any of the four.
   */
  orientation: TabsOrientation;
  /**
   * gh#175: with EVERY item disabled the strip must show no selection at all. Radix simply left
   * the selection empty; React Aria refuses to — `useTabListState` runs an unconditional effect
   * that re-selects the first key whenever nothing is selected, and driving `selectedKey={null}`
   * to fight it spins that effect forever (measured: the test file never returns). So the
   * selection is left where RAC puts it and MASKED here instead: the triggers report
   * `aria-selected="false"` / `data-state="inactive"` and the panels do not render, which is byte
   * for byte what Radix produced.
   */
  selectionSuppressed: boolean;
};

const TabsFrameContext = React.createContext<TabsFrame>({
  orientation: "horizontal",
  selectionSuppressed: false,
});

/**
 * Resolves the value Tabs should fall back to when it owns the initial selection (uncontrolled —
 * `value` is undefined). `requested` (usually `defaultValue`) is honored only when it names an
 * item that exists AND is not disabled; otherwise (nothing requested, a stale/unknown key, or a
 * key that points at a disabled item) it falls back to the first ENABLED item.
 */
function resolveFallbackTabValue(
  items: TabItemProp[] | undefined,
  requested: string | undefined,
): string | undefined {
  if (!items || items.length === 0) return requested;
  if (requested !== undefined) {
    const requestedItem = items.find((item) => item.value === requested);
    if (requestedItem && !requestedItem.disabled) return requested;
  }
  return items.find((item) => !item.disabled)?.value;
}

/**
 * React Aria's `filterDOMProps` forwards only `id`, `data-*`, the four labelling `aria-*` and the
 * global mouse/pointer events; `dir`, `title`, `tabIndex` and the rarer DOM props are dropped
 * silently, and Radix forwarded ALL of them. `render` is RAC's own escape hatch: the caller's raw
 * props go on first, RAC's merged ones second so its roles, ids and handlers always win — except
 * `id`, which Radix let the caller own.
 *
 * `data-slot` is deliberately NOT handed to the RAC component: it is applied here, before the raw
 * props, so a caller that passes its own `data-slot` (the `items` branch does, for the panel)
 * still wins.
 */
function withDomProps<E extends keyof React.JSX.IntrinsicElements>(
  element: E,
  slot: string,
  raw: Record<string, unknown>,
  /**
   * Typed `object`, not `Record<string, unknown>`: RAC declares the argument its `render` slot hands
   * over as an INTERFACE (`React.JSX.IntrinsicElements["div"]` — for `Tab` a div-or-anchor union),
   * and interfaces get no implicit index signature, so a `Record` parameter rejects every call site.
   * Widening once here keeps all four of them cast-free.
   */
  domProps: object,
  own: Record<string, unknown>,
): React.ReactElement {
  const dom = domProps as Record<string, unknown>;
  return React.createElement(element, {
    "data-slot": slot,
    ...raw,
    ...dom,
    id: (raw.id as string | undefined) ?? (dom.id as string | undefined),
    ...own,
  });
}

/**
 * Ant Design's `tabBarExtraContent` accepts either ONE node (which antd parks on the right) or a
 * `{ left, right }` map. Both arrive here on the logical axis instead — a bare node is the `end`
 * slot, so an RTL app puts it on the correct edge without a second code path.
 */
function resolveTabsExtra(extra: TabsExtraProp | undefined): {
  start?: React.ReactNode;
  end?: React.ReactNode;
} {
  if (extra === undefined || extra === null || extra === false) return {};
  const isSlotMap =
    typeof extra === "object" &&
    !React.isValidElement(extra) &&
    !Array.isArray(extra) &&
    ("start" in extra || "end" in extra);
  if (isSlotMap) return extra as { start?: React.ReactNode; end?: React.ReactNode };
  return { end: extra as React.ReactNode };
}

/**
 * `tabPlacement` owns the axis in antd 6.6.2, `orientation` owns it in Radix/WAI-ARIA. Neither is
 * dropped: whichever the caller actually passed decides, and the other is derived from it, so a
 * long-standing `orientation="vertical"` keeps working and `tabPlacement="start"` needs no second
 * prop to become a real vertical tablist (roving focus follows `orientation`, not paint order).
 */
function resolveTabsAxis(
  tabPlacement: TabsPlacementProp | undefined,
  orientation: "horizontal" | "vertical" | undefined,
): { placement: TabsPlacementProp; orientation: "horizontal" | "vertical" } {
  if (tabPlacement) {
    return {
      placement: tabPlacement,
      orientation:
        orientation ??
        (tabPlacement === "start" || tabPlacement === "end" ? "vertical" : "horizontal"),
    };
  }
  return {
    placement: orientation === "vertical" ? "start" : "top",
    orientation: orientation ?? "horizontal",
  };
}

/** Theme knob holding the width at which a vertical strip folds (src/tokens/components/navigation.css). */
const TABS_PLACEMENT_BREAKPOINT_TOKEN = "--tabs-placement-responsive-breakpoint-width";
/** Mirrors the token default (48rem @ a 16px root) so SSR and a token-less test env agree. */
const TABS_PLACEMENT_BREAKPOINT_FALLBACK_QUERY = "(max-width: 768px)";

/**
 * NARROW FOLD (gh#502) — an inline-axis strip becomes a block-axis strip on a phone.
 *
 * A vertical strip and its panel are two flex items on ONE inline axis, and the panel's content
 * sets its min-content width. As soon as that min-content is most of a phone screen the strip has
 * nothing left to occupy: measured at 393px against a panel holding a 676px-wide block, the strip
 * came out 8px wide with 0px of tab in it — not "hard to hit", but NO WAY AT ALL to reach any tab
 * but the open one (WCAG 2.2 SC 2.1.1), plus the panel's own inline overflow on top (SC 1.4.10).
 *
 * Ant Design folds the same way and that is the precedent followed here: `components/tabs/index.tsx`
 * drops `left`/`right` to `top` once it decides the device is mobile. The one thing NOT copied is
 * HOW it decides — antd sniffs the user agent, which says nothing about how much room this
 * particular strip has. A width query is the honest question, and it is a THEME knob rather than a
 * literal so a service whose vertical tabs live in a wide scroll region can move it (or set it to
 * `0px`, which no viewport matches, to keep the strip vertical at every width).
 *
 * A TRAILING placement folds to `bottom`, a leading one to `top`: the caller asked for the strip on
 * the trailing edge, and on the block axis that edge is the bottom. Keeping the pairing means the
 * fold moves the strip around ONE corner instead of across the box.
 *
 * IT KEYS ON THE ORIENTATION, NOT ON THE PLACEMENT, because the orientation is what decides the
 * ROOT's flex direction — `data-[orientation=horizontal]:flex-col`, so a vertical one is a ROW.
 * `tabPlacement="top" orientation="vertical"` is an odd pair to pass and a perfectly legal one,
 * and it puts the strip beside the panel exactly like `start` does; keyed on the placement alone
 * the fold would have walked straight past it.
 *
 * The fold is resolved in JS, not in a media query, because it is not a paint: `orientation` is
 * what `aria-orientation` announces, what react-aria reads for the roving focus, and what those
 * `[data-orientation]` selectors key on. A CSS-only flip would paint a row while telling a screen
 * reader it is a column.
 */
function foldVerticalPlacement(
  axis: { placement: TabsPlacementProp; orientation: "horizontal" | "vertical" },
  narrow: boolean,
): { placement: TabsPlacementProp; orientation: "horizontal" | "vertical" } {
  if (!narrow || axis.orientation !== "vertical") return axis;
  const trailing = axis.placement === "end" || axis.placement === "bottom";
  return { placement: trailing ? "bottom" : "top", orientation: "horizontal" };
}

export function Tabs({
  className,
  orientation,
  items,
  value,
  defaultValue,
  onValueChange,
  activationMode,
  dir,
  variant = "default",
  tabPlacement,
  size = "md",
  centered,
  extra,
  destroyOnHidden = true,
  onEdit,
  addIcon,
  hideAdd,
  closeIcon,
  onTabClick,
  overflow = "scroll",
  listClassName,
  contentClassName,
  children,
  ...props
}: TabsProps) {
  const { t } = useTranslation();
  const resolvedDefault = resolveFallbackTabValue(items, defaultValue);
  const narrow = useMaxWidthBreakpoint(
    TABS_PLACEMENT_BREAKPOINT_TOKEN,
    TABS_PLACEMENT_BREAKPOINT_FALLBACK_QUERY,
  );
  const { placement, orientation: resolvedOrientation } = foldVerticalPlacement(
    resolveTabsAxis(tabPlacement, orientation),
    narrow,
  );
  const selectionSuppressed =
    value === undefined && items != null && items.length > 0 && resolvedDefault === undefined;
  const frame = React.useMemo<TabsFrame>(
    () => ({ orientation: resolvedOrientation, selectionSuppressed }),
    [resolvedOrientation, selectionSuppressed],
  );
  const editable = variant === "editable-card";

  /*
   * OVERFLOW MENU (antd `more`). The strip still holds and still scrolls to every tab — see the
   * note on `TabsOverflowProp` for why the tabs are NOT re-homed into the dropdown the way antd
   * re-homes them. The menu is an additional POINTER route to the ones a mouse user cannot
   * currently see, so it is driven purely by measurement.
   */
  const collapsible = items != null && overflow === "menu";
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [hiddenValues, setHiddenValues] = React.useState<readonly string[]>([]);
  const itemValues = React.useMemo(
    () => (collapsible ? items.map((item) => item.value) : undefined),
    [collapsible, items],
  );
  const handleHiddenChange = React.useCallback((next: string[]) => {
    // Same contents = the same array, so a measurement that changed nothing cannot re-render.
    setHiddenValues((prev) =>
      prev.length === next.length && prev.every((value, index) => value === next[index])
        ? prev
        : next,
    );
  }, []);
  useTabsOverflowValues(listRef, itemValues, handleHiddenChange);

  // The selection MIRROR. Radix still owns the state; this only reflects it, so that the panels
  // can be told which of them is active from OUTSIDE a Trigger. `destroyOnHidden={false}` needs
  // exactly that: `forceMount` alone is not enough, because Radix computes `hidden: !present` and
  // `present` is `forceMount || isSelected` — unconditionally true under forceMount — so every
  // panel would paint on top of the active one.
  const [mirroredValue, setMirroredValue] = React.useState<string | undefined>(
    value ?? resolvedDefault,
  );
  React.useEffect(() => {
    if (value !== undefined) setMirroredValue(value);
  }, [value]);
  const activeValue = value ?? mirroredValue;
  const handleValueChange = React.useCallback(
    (next: string) => {
      setMirroredValue(next);
      onValueChange?.(next);
    },
    [onValueChange],
  );

  const { start: extraStart, end: extraEnd } = resolveTabsExtra(extra);
  const overflowItems = collapsible
    ? items.filter((item) => hiddenValues.includes(item.value))
    : [];
  const showAdd = editable && !hideAdd && Boolean(onEdit);
  // `collapsible` counts even while NOTHING overflows. If the bar row appeared only once a tab
  // went out of view, the strip would be re-parented mid-scroll — remounting the list and losing
  // both its scroll offset and the observers watching it.
  const needsBar = Boolean(extraStart || extraEnd || showAdd || collapsible);
  const card = variant === "card" || variant === "editable-card";

  // EVERY knob below is written as an arbitrary-value UTILITY reading a token, never as a rule in
  // `@layer components`. That is not a style preference: Tailwind's `utilities` layer wins over
  // `components` outright, and the base trigger/list already claim `bg-*`, `p-*`, `rounded-*` and
  // `text-*` there — a components-layer `padding`/`font-size` for a size tier or a card face would
  // simply never paint. Writing them as utilities also keeps tailwind-merge able to DROP the base
  // step it replaces instead of stacking two values on one property.
  const sizeTriggerClassName = cn(
    size === "sm" &&
      "min-h-[var(--tabs-trigger-height-sm)] px-[var(--tabs-trigger-padding-x-sm)] text-[length:var(--tabs-trigger-font-size-sm)]",
    size === "md" &&
      "min-h-[var(--tabs-trigger-height-md)] px-[var(--tabs-trigger-padding-x-md)] text-[length:var(--tabs-trigger-font-size-md)]",
    size === "lg" &&
      "min-h-[var(--tabs-trigger-height-lg)] px-[var(--tabs-trigger-padding-x-lg)] text-[length:var(--tabs-trigger-font-size-lg)]",
  );

  const list = items ? (
    <TabsList
      ref={listRef}
      data-slot="tabs-list"
      // The list variant MUST be forwarded, not just styled through `className` — every
      // line-variant rule on TabsTrigger keys off `group-data-[variant=line]/tabs-list`.
      // `card` and `editable-card` keep the default list chrome; their own card geometry is
      // selected from the ROOT's `data-variant`, so a hand-composed <TabsList> is unaffected.
      variant={variant === "line" ? "line" : "default"}
      className={cn(
        // The inset override is an arbitrary value reading the knob (never `p-0`): it must
        // stay a UTILITY so tailwind-merge still drops the strip's own padding step.
        //
        // IT IS SPLIT INTO `px-`/`py-` FOR THE FOCUS RING (gh#376). The strip clips its
        // block axis (`overflow-y: hidden` beside `overflow-x: auto`), and this variant's
        // inset is 0px, so a focused trigger had NO block headroom at all — measured in
        // Chromium, 0px top and bottom, i.e. the entire ring was shaved. The headroom has to
        // come from layout: `overflow-y: visible` next to `overflow-x: auto` computes back
        // to `auto` per spec (a second scroll container, not a ring), and Chromium honours
        // `overflow-clip-margin` only when BOTH axes are `clip`. So the block padding carries
        // the ring's outer reach and an equal negative block margin hands it straight back —
        // the ring paints inside the scrollport and the strip's OUTER box is unchanged
        // (measured: 38px before and after). Both values read the same token the ring is
        // sized from, so the two can never drift apart.
        //
        // The cost, recorded rather than hidden: the rail hairline (`border-b`, drawn at the
        // border box) now sits the ring's reach below the triggers instead of flush. That is
        // where a hand-composed <TabsList variant="line"> already put it — its `p-1` gives
        // the same block inset — so the two construction paths now agree. A service that
        // wants the active bar parked back on the hairline raises `--tabs-indicator-offset`,
        // which exists for exactly that.
        // `w-full` is scoped to the HORIZONTAL axis. Unscoped it also applied when the root is
        // vertical, where the strip is a COLUMN beside the panel: `width: 100%` made the strip
        // claim the whole row and the panel collapsed to its own min-content floor. Measured at a
        // 1232px root: strip 1133.72px (92%) / panel 90.28px (7%). And it is not a layer problem —
        // tailwind-merge drops the base `w-fit` as a same-group conflict, so `w-fit` never reached
        // the DOM at all. Scoping puts it back on the axis it was written for.
        variant === "line" &&
          "my-[calc(-1_*_var(--tabs-list-focus-ring-space-inset,calc(var(--focus-ring-width)_+_var(--focus-ring-glow-width))))] h-auto justify-start border-b px-[var(--tabs-list-line-space-inset)] py-[calc(var(--tabs-list-line-space-inset)_+_var(--tabs-list-focus-ring-space-inset,calc(var(--focus-ring-width)_+_var(--focus-ring-glow-width))))] data-[orientation=horizontal]:w-full",
        // CARD strip. The list keeps `data-variant="default"` on purpose (a hand-composed
        // <TabsList> must be unaffected), so the card face is selected from the ROOT — but the
        // three properties the base list already claims as utilities (`bg-muted`, `p-1`,
        // `rounded-lg`) have to be replaced with utilities too, or the components layer loses.
        card &&
          "items-end justify-start gap-[var(--tabs-card-list-space-gap)] rounded-[var(--tabs-card-list-radius)] p-[var(--tabs-card-list-space-inset)] data-[orientation=horizontal]:w-full data-[variant=default]:bg-transparent",
        // CENTERED. Two independent moves, because the strip has two shapes: the pill/card strip
        // is `w-fit` (auto inline margins centre the BOX) and the line strip is `w-full`
        // (`justify-content` centres its CONTENT). `safe` keeps the overflow rule the strip
        // already depends on — plain `center` strands the leading tab outside the scrollport.
        centered && "mx-auto justify-center-safe",
        listClassName,
      )}
    >
      {items.map((item) => {
        // antd's own rule (`getRemovable`): a tab is removable only on an editable bar, only when
        // it did not opt out, only when there is an `onEdit` to call, and never when disabled.
        const removable = editable && Boolean(onEdit) && item.closable !== false && !item.disabled;

        return (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            // WAI-ARIA APG "tabs with deletion": Delete/Backspace on the focused tab removes it,
            // and `aria-keyshortcuts` is how a screen-reader user is told so — without padding the
            // tab's accessible name with a sentence.
            aria-keyshortcuts={removable ? "Delete" : undefined}
            // antd `onTabClick`. POINTER only, by design: under `activationMode="manual"` the
            // arrow keys move focus without activating, so routing a keypress here would report a
            // click nobody made. Selection — however it moved — is `onValueChange`'s job.
            onClick={
              onTabClick
                ? (event: React.MouseEvent<HTMLButtonElement>) => onTabClick(item.value, event)
                : undefined
            }
            onKeyDown={
              removable
                ? (event: React.KeyboardEvent<HTMLButtonElement>) => {
                    if (event.key !== "Delete" && event.key !== "Backspace") return;
                    event.preventDefault();
                    onEdit?.(item.value, "remove");
                  }
                : undefined
            }
            className={cn(
              // Geometry only — the active underline is the token-owned `::after` bar the
              // line variant already owns (never a second, hand-rolled border-b indicator).
              // They are arbitrary-value utilities so tailwind-merge keeps dropping the pill
              // trigger's own radius / padding steps from the base class list.
              variant === "line" &&
                "rounded-[var(--tabs-trigger-line-radius)] px-[var(--tabs-trigger-line-padding-x)] py-[var(--tabs-trigger-line-padding-y)]",
              sizeTriggerClassName,
              // A centred strip must let its triggers SHRINK to their labels first. The base
              // trigger is `flex-1`, so on a full-width (`line`) strip they already fill every
              // pixel and `justify-content` has nothing left to centre — measured, the leading and
              // trailing gaps were both 0px with `centered` on and off.
              centered && "flex-none",
              // CARD face: a real boundary on every side, rounded on the leading block edge only.
              // The ACTIVE face's block-end edge is the SURFACE colour, never `transparent`: the
              // rail is an inset shadow at the strip's padding-box edge, so a see-through border
              // would let that 1px of rail run straight across the tab it is joined to.
              card &&
                "data-[state=active]:border-b-background rounded-[var(--tabs-card-radius)_var(--tabs-card-radius)_0_0] border-[color:hsl(var(--border))] bg-[hsl(var(--tabs-card-background,var(--muted)))]",
            )}
          >
            {item.icon ? (
              <span
                data-slot="tabs-trigger-icon"
                className="ui-tabs-trigger-icon"
                aria-hidden="true"
              >
                {item.icon}
              </span>
            ) : null}
            {item.label}
            {removable ? (
              // A POINTER SHORTCUT, not a control — and that is measured, not stylistic. antd's own
              // TabNode puts a real <button> beside the role="tab" element; rendered through
              // vitest-axe that markup fails `aria-required-children`, because a tablist may own
              // nothing but tabs and axe walks straight through the generic wrapper to find the
              // button. Putting the button INSIDE the tab is worse still (`nested-interactive`,
              // plus a <button> in a <button> is invalid HTML). So the × is an aria-hidden span and
              // the real, announced route is the Delete/Backspace shortcut above — the WAI-ARIA APG
              // "tabs with deletion" shape.
              <span
                data-slot="tabs-tab-remove"
                className="ui-tabs-tab-remove"
                aria-hidden="true"
                title={t("navigation.tabs.removeTab")}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  // Radix selects a tab on mousedown, so the stop has to happen there: on click it
                  // would already have switched tabs before removing one.
                  event.preventDefault();
                  event.stopPropagation();
                  onEdit?.(item.value, "remove");
                }}
              >
                {/* antd's own precedence: the ITEM's icon wins over the strip-wide
                    `closeIcon` (antd `removeIcon`), which wins over the default ×. */}
                {item.closeIcon ?? closeIcon ?? (
                  <X className="ui-tabs-tab-remove-icon" aria-hidden="true" />
                )}
              </span>
            ) : null}
          </TabsTrigger>
        );
      })}
    </TabsList>
  ) : null;

  return (
    <TabsFrameContext.Provider value={frame}>
      <AriaTabs
        data-slot="tabs"
        data-orientation={resolvedOrientation}
        // The variant AS ASKED FOR. The list deliberately collapses `card`/`editable-card` into
        // what a service theme, and a test, need to key on.
        data-variant={variant}
        data-placement={placement}
        data-size={size}
        data-centered={centered ? "true" : undefined}
        orientation={resolvedOrientation}
        keyboardActivation={activationMode}
        // CONTROLLED FROM THE MIRROR while the overflow menu exists, and only then. A menu item
        // is not a tab, so choosing one cannot go through React Aria's own press path — the
        // selection has to be pushed in. `mirroredValue` already tracks every selection change
        // (that is what it is for), so feeding it back as `selectedKey` makes the root controlled
        // without inventing a second source of truth. Left uncontrolled otherwise: RAC's
        // `useTabListState` re-selects a key whenever nothing is selected, and the gh#175
        // all-disabled case depends on not fighting it.
        selectedKey={value ?? (collapsible ? mirroredValue : undefined)}
        defaultSelectedKey={value === undefined && !collapsible ? resolvedDefault : undefined}
        onSelectionChange={(key) => handleValueChange(String(key))}
        className={cn(
          // Structure only. The paint (and the placement flip, which is `order`/`flex-direction`)
          // lives in src/styles/navigation-layout.css so the gap reads --tabs-root-gap and a service
          // can retune it.
          "group/tabs flex data-[orientation=horizontal]:flex-col",
          // PLACEMENT is a flex REVERSAL, never a re-ordered tree: the strip stays first in the DOM
          // at every placement, so reading order and the APG tablist → tabpanel relationship do not
          // depend on which edge the bar is painted on. Both classes carry the same modifier as the
          // base step they replace, so tailwind-merge drops that step instead of stacking two
          // flex-direction values on one element.
          placement === "bottom" && "data-[orientation=horizontal]:flex-col-reverse",
          placement === "end" && "flex-row-reverse",
          className,
        )}
        render={(domProps) =>
          withDomProps("div", "tabs", { dir, ...props }, domProps, {
            "data-orientation": resolvedOrientation,
            "data-variant": variant,
            "data-placement": placement,
            "data-size": size,
            "data-centered": centered ? "true" : undefined,
          })
        }
      >
        {items ? (
          <>
            {needsBar ? (
              <div data-slot="tabs-bar" className="ui-tabs-bar">
                {extraStart ? (
                  <div data-slot="tabs-extra" data-side="start" className="ui-tabs-extra">
                    {extraStart}
                  </div>
                ) : null}
                {list}
                {showAdd ? (
                  <button
                    type="button"
                    data-slot="tabs-add"
                    className="ui-tabs-add"
                    aria-label={t("navigation.tabs.addTab")}
                    onClick={(event) => onEdit?.(event, "add")}
                  >
                    {addIcon ?? <Plus className="ui-tabs-add-icon" aria-hidden="true" />}
                  </button>
                ) : null}
                {overflowItems.length > 0 ? (
                  <DropdownMenu>
                    {/* NO `data-slot` here, on purpose: DropdownMenuTrigger stamps
                        `data-slot="dropdown-menu-trigger"` AFTER spreading the caller's props, so
                        one passed in would be silently dropped — a hook that reads correctly and
                        never reaches the DOM. `.ui-tabs-overflow` is the handle instead, which is
                        the design system's own name and what tests and gates select on. */}
                    <DropdownMenuTrigger
                      className="ui-tabs-overflow"
                      aria-label={t("navigation.tabs.moreTabs")}
                    >
                      <MoreHorizontal className="ui-tabs-overflow-icon" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent placement="bottomEnd">
                      {overflowItems.map((item) => (
                        <DropdownMenuItem
                          key={item.value}
                          disabled={item.disabled}
                          onSelect={() => handleValueChange(item.value)}
                        >
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
                {extraEnd ? (
                  <div data-slot="tabs-extra" data-side="end" className="ui-tabs-extra">
                    {extraEnd}
                  </div>
                ) : null}
              </div>
            ) : (
              list
            )}
            {items.map((item) => {
              // `destroyOnHidden={false}` keeps EVERY panel mounted; antd's per-item
              // `forceRender` keeps exactly THIS one mounted while the rest are still destroyed.
              // Both land on the same two attributes, so they are resolved to one flag here.
              //
              // `forceMount` alone is not enough: Radix writes `hidden: !present` and `present` is
              // `forceMount || isSelected`, so a force-mounted panel would paint on top of the
              // active one. The attribute is therefore driven from the selection mirror.
              const keepMounted = !destroyOnHidden || item.forceRender === true;
              return (
                <TabsContent
                  key={item.value}
                  value={item.value}
                  data-slot="tabs-panel"
                  forceMount={keepMounted ? true : undefined}
                  hidden={keepMounted ? item.value !== activeValue : undefined}
                  // No variant geometry: the panel has never carried a top margin (the root is a flex
                  // column with --tabs-root-gap).
                  className={contentClassName}
                >
                  {item.content}
                </TabsContent>
              );
            })}
          </>
        ) : (
          children
        )}
      </AriaTabs>
    </TabsFrameContext.Provider>
  );
}

/*
 * Prop types below are DELIBERATELY not exported.
 *
 * None of them was exported before this file left Radix — `dropdown-menu.tsx` exported no prop
 * type at all, and `tabs.tsx` exported only `TabsProps`. They appeared here only because moving
 * off a third-party primitive forces the shapes to be written down locally, and exporting them
 * would grow the package's public surface as a side effect of an internal change: every field
 * would become an API promise nobody asked for, on a component whose internals just moved once
 * and may move again.
 *
 * Nothing in this repo consumes them and the package barrel re-exports the COMPONENTS only, so no
 * consumer can be relying on them today. Export one when a consumer has a real reason, and govern
 * it in COMPONENT_PROP_REGISTRY at the same time.
 */
type TabsListProps = React.ComponentPropsWithoutRef<"div"> & {
  variant?: "default" | "line";
  /**
   * ACCEPTED AND IGNORED. Radix's `RovingFocusGroup` took a `loop` switch; React Aria's tab list
   * always wraps at the ends and exposes no equivalent knob. The prop stays so no consumer's build
   * breaks. No test records this: the claim worth pinning would have been "both libraries wrap
   * by default", and once Radix is gone there is no second library left to compare against.
   */
  loop?: boolean;
};

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = "default", loop: _loop, children, ...props }, ref) => {
    // Own a node ref regardless of what the caller passes, so the keep-visible observers always have
    // the strip to measure; the caller's ref is still populated (object or callback form).
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const setListRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        listRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // out of the strip (see ./tabs-scroll for the constraints this obeys).
    useKeepActiveTabVisible(listRef);

    return (
      <AriaTabList
        ref={setListRef}
        className={cn(
          // `min-w-0 max-w-full` let the list shrink to (and never exceed) whatever width its
          // ancestors actually give it instead of forcing them wider; horizontal orientation then
          // scrolls its own overflow rather than clipping/hiding long localized labels in a narrow
          // Hidden scrollbar keeps the strip visually clean while staying
          // swipeable on touch and reachable via keyboard (arrow-key roving focus still scrolls the
          // newly-focused trigger into view natively); `useKeepActiveTabVisible` above re-pins the
          // Vertical
          // orientation is untouched — it already stacks in a column and is sized by its own
          // `h-*`/`w-*` overrides.
          // justify-center-SAFE: the strip is a centred flex box that also scrolls. Plain `center`
          // splits the overflow across BOTH edges, and scrollLeft only ever covers the trailing one
          // — so the leading tab sat permanently outside the scrollport (an unreachable control at
          // 320px, WCAG 2.2 SC 2.1.1). `safe` falls back to start alignment exactly when it
          // overflows, and still centres whenever the tabs fit.
          "group/tabs-list text-muted-foreground data-[variant=default]:bg-muted inline-flex w-fit max-w-full min-w-0 items-center justify-center-safe rounded-lg p-1 group-data-[orientation=vertical]/tabs:flex-col data-[orientation=horizontal]:[scrollbar-width:none] data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:overflow-y-hidden data-[variant=line]:gap-[var(--tabs-list-line-space-gap)] data-[variant=line]:rounded-none data-[variant=line]:bg-transparent [&[data-orientation=horizontal]::-webkit-scrollbar]:hidden",
          className,
        )}
        render={(domProps) =>
          withDomProps("div", "tabs-list", props, domProps, { "data-variant": variant })
        }
      >
        {children}
      </AriaTabList>
    );
  },
);
TabsList.displayName = "TabsList";

type TabsTriggerProps = Omit<React.ComponentPropsWithoutRef<"button">, "value"> & {
  /** The tab's key — RAC `id` (its DOM `id` stays RAC-generated, exactly as Radix generated one). */
  value: string;
  /** RAC `isDisabled`; ALSO written to the button so `disabled:` utilities keep matching. */
  disabled?: boolean;
};

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, children, onKeyDown, onClick, ...props }, ref) => {
    const { orientation, selectionSuppressed } = React.useContext(TabsFrameContext);
    return (
      <AriaTab
        // RAC types `Tab`'s ref as `HTMLDivElement` because its DEFAULT element is a <div>. The
        // `render` slot below overrides that element with the <button> Radix rendered, and RAC puts
        // its own ref INTO the props it hands that slot (`dom.ref`, spread onto the button by
        // `withDomProps`) — so the node the caller's ref receives really is the <button>, and the
        // published `HTMLButtonElement` ref type stays true. Only RAC's static default is wrong
        // here, hence the assertion rather than a widened public type.
        ref={ref as React.Ref<HTMLDivElement>}
        id={value}
        isDisabled={disabled}
        className={cn(
          // SELECTED IS A BORDER TINT, NOT A RING — and that is a WCAG fix, not a style preference.
          // It used to be `ring-1 ring-primary/25`, which writes `--tw-ring-shadow` in the UTILITIES
          // layer and therefore overwrote the focus ring that focus-ring.css feeds from `components`.
          // Measured: a focused ACTIVE tab painted `oklab(… / 0.25) 0 0 0 1px` and nothing else — a
          // 1px indicator at 25% alpha, failing both clauses of SC 2.4.13 (2px perimeter, ≥3:1),
          // while every other control in the library carried a full 2px ring. The trigger already
          // owns `border border-transparent`, so tinting that border reproduces the selected hairline
          // at the same colour and width with no layout change, and leaves `--tw-ring-shadow` free for
          // the focus ring. `shadow-sm` stays: its composite READS `--tw-ring-shadow`, so the lift and
          // the ring coexist.
          //
          // No `focus-visible:outline-1` either. It was the fallback that survived the clobber — a 1px
          // currentColor line squeezed between the border and the ring once both paint. The ring is
          // the indicator now; two marks for one state is what this pass exists to remove.
          //
          // The line indicator lives in src/styles/navigation-layout.css so it reads --tabs-indicator-*.
          // Selected and focused stay visually distinct (WCAG 2.4.7): selected is a 1px hairline in the
          // border, focused is the 2px ring plus its halo outside it.
          "text-muted-foreground ring-offset-background hover:text-foreground ui-focus-ring data-[state=active]:bg-background data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:border-primary/25 relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:flex-none group-data-[orientation=vertical]/tabs:justify-start group-data-[variant=line]/tabs-list:border-e-0 group-data-[variant=line]/tabs-list:border-b-0 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none",
          className,
        )}
        // A <button>, not RAC's default <div>: Radix rendered one, `disabled:` utilities need the
        // real attribute, and `type` is part of this component's published prop list.
        render={(domProps, renderProps) =>
          withDomProps("button", "tabs-trigger", { type: "button", ...props }, domProps, {
            // `data-state` is what `src/styles/navigation-layout.css` and `tabs-scroll.ts` both
            // key on. RAC only writes `data-selected` on the selected tab, so it is re-emitted
            // here for BOTH states, exactly as Radix did.
            "data-state": renderProps.isSelected && !selectionSuppressed ? "active" : "inactive",
            "aria-selected": renderProps.isSelected && !selectionSuppressed,
            "data-orientation": orientation,
            disabled,
            // CHAINED, not spread — the same reason `onKeyDown` below is. `withDomProps` lays the
            // caller's raw props down FIRST and RAC's merged ones second, so any handler RAC owns
            // for this event would silently swallow the caller's. Caller first, then RAC's, and
            // only while the caller has not called `preventDefault()`.
            onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
              onClick?.(event);
              if (!event.defaultPrevented) {
                (domProps.onClick as React.MouseEventHandler<HTMLButtonElement> | undefined)?.(
                  event,
                );
              }
            },
            onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
              onKeyDown?.(event);
              if (!event.defaultPrevented) {
                (domProps.onKeyDown as React.KeyboardEventHandler<HTMLButtonElement> | undefined)?.(
                  event,
                );
              }
            },
            tabIndex:
              (props as { tabIndex?: number }).tabIndex ??
              (domProps as { tabIndex?: number }).tabIndex,
          })
        }
      >
        {children}
      </AriaTab>
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

type TabsContentProps = Omit<React.ComponentPropsWithoutRef<"div">, "value"> & {
  /** The panel's key — must match a `TabsTrigger value`. RAC `id`. */
  value: string;
  /** Keep the panel mounted while another tab is selected — RAC `shouldForceMount`. */
  forceMount?: true;
};

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount, children, ...props }, ref) => {
    const { orientation, selectionSuppressed } = React.useContext(TabsFrameContext);
    // gh#175: every item disabled, so NOTHING is selected and Radix rendered no panel at all. RAC
    // still force-selects a key internally (see `TabsFrame`), and would mount that key's panel — so
    // the panel is dropped here, the panel-side half of the same mask the triggers apply. A
    // force-mounted panel is exempt: `forceMount` means "stay mounted while unselected", and with
    // no selection at all that is still its contract; it renders `data-state="inactive"` below.
    if (selectionSuppressed && !forceMount) return null;
    return (
      <AriaTabPanel
        ref={ref}
        id={value}
        shouldForceMount={forceMount}
        // `ui-focus-ring` = the single focus source, replacing a hand-rolled
        // `focus-visible:ring-2 focus-visible:ring-ring` that no --focus-ring-* knob could reach.
        className={cn("ui-focus-ring flex-1", className)}
        render={(domProps, renderProps) =>
          withDomProps("div", "tabs-content", props, domProps, {
            // A force-mounted panel whose tab is not selected: Radix marked it `data-state="inactive"`
            // and `hidden`; RAC marks it inert. The state hook is re-emitted so CSS keys the same way.
            "data-state": renderProps.isInert || selectionSuppressed ? "inactive" : "active",
            "data-orientation": orientation,
          })
        }
      >
        {children}
      </AriaTabPanel>
    );
  },
);
TabsContent.displayName = "TabsContent";
