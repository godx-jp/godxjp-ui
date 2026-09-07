import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Plus, X } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { useKeepActiveTabVisible } from "./tabs-scroll";
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
} from "../../props/components/navigation.prop";

/** Historic name of the `items` entry. Kept as an alias so the shape has ONE declaration. */
export type TabsItem = TabItemProp;

/**
 * Radix `Tabs.Root` props plus the library's data-driven surface. `value`/`defaultValue`/
 * `onValueChange`/`className` come from Radix, so they are dropped from the shared model rather
 * than declared twice — one shape, `TabsProp` in props/components/navigation.prop.ts.
 */
export type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> &
  Omit<TabsProp, "value" | "defaultValue" | "onValueChange" | "className">;

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

export function Tabs({
  className,
  orientation,
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "default",
  tabPlacement,
  size = "md",
  centered,
  extra,
  destroyOnHidden = true,
  onEdit,
  addIcon,
  hideAdd,
  listClassName,
  contentClassName,
  ...props
}: TabsProps) {
  const { t } = useTranslation();
  const resolvedDefault = resolveFallbackTabValue(items, defaultValue);
  const { placement, orientation: resolvedOrientation } = resolveTabsAxis(
    tabPlacement,
    orientation,
  );
  const editable = variant === "editable-card";

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
  const showAdd = editable && !hideAdd && Boolean(onEdit);
  const needsBar = Boolean(extraStart || extraEnd || showAdd);
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
        variant === "line" &&
          "my-[calc(-1_*_var(--tabs-list-focus-ring-space-inset,calc(var(--focus-ring-width)_+_var(--focus-ring-glow-width))))] h-auto w-full justify-start border-b px-[var(--tabs-list-line-space-inset)] py-[calc(var(--tabs-list-line-space-inset)_+_var(--tabs-list-focus-ring-space-inset,calc(var(--focus-ring-width)_+_var(--focus-ring-glow-width))))]",
        // CARD strip. The list keeps `data-variant="default"` on purpose (a hand-composed
        // <TabsList> must be unaffected), so the card face is selected from the ROOT — but the
        // three properties the base list already claims as utilities (`bg-muted`, `p-1`,
        // `rounded-lg`) have to be replaced with utilities too, or the components layer loses.
        card &&
          "w-full items-end justify-start gap-[var(--tabs-card-list-space-gap)] rounded-[var(--tabs-card-list-radius)] p-[var(--tabs-card-list-space-inset)] data-[variant=default]:bg-transparent",
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
                onMouseDown={(event) => {
                  // Radix selects a tab on mousedown, so the stop has to happen there: on click it
                  // would already have switched tabs before removing one.
                  event.preventDefault();
                  event.stopPropagation();
                  onEdit?.(item.value, "remove");
                }}
              >
                {item.closeIcon ?? <X className="ui-tabs-tab-remove-icon" aria-hidden="true" />}
              </span>
            ) : null}
          </TabsTrigger>
        );
      })}
    </TabsList>
  ) : null;

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={resolvedOrientation}
      // The variant AS ASKED FOR. The list deliberately collapses `card`/`editable-card` into
      // what a service theme, and a test, need to key on.
      data-variant={variant}
      data-placement={placement}
      data-size={size}
      data-centered={centered ? "true" : undefined}
      orientation={resolvedOrientation}
      value={value}
      defaultValue={value === undefined ? resolvedDefault : undefined}
      onValueChange={handleValueChange}
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
      {...props}
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
              {extraEnd ? (
                <div data-slot="tabs-extra" data-side="end" className="ui-tabs-extra">
                  {extraEnd}
                </div>
              ) : null}
            </div>
          ) : (
            list
          )}
          {items.map((item) => (
            <TabsContent
              key={item.value}
              value={item.value}
              data-slot="tabs-panel"
              // `destroyOnHidden={false}` keeps every panel mounted. `forceMount` alone is not
              // enough: Radix writes `hidden: !present` and `present` is `forceMount || isSelected`,
              // so a force-mounted panel would paint on top of the active one. The attribute is
              // therefore driven from the selection mirror.
              forceMount={destroyOnHidden ? undefined : true}
              hidden={destroyOnHidden ? undefined : item.value !== activeValue}
              // No variant geometry: the panel has never carried a top margin (the root is a flex
              // column with --tabs-root-gap).
              className={contentClassName}
            >
              {item.content}
            </TabsContent>
          ))}
        </>
      ) : (
        props.children
      )}
    </TabsPrimitive.Root>
  );
}

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "line";
  }
>(({ className, variant = "default", ...props }, ref) => {
  // Own a node ref regardless of what the caller passes, so the keep-visible observers always have
  // the strip to measure; the caller's ref is still populated (object or callback form).
  const listRef = React.useRef<React.ComponentRef<typeof TabsPrimitive.List> | null>(null);
  const setListRef = React.useCallback(
    (node: React.ComponentRef<typeof TabsPrimitive.List> | null) => {
      listRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // out of the strip (see ./tabs-scroll for the constraints this obeys).
  useKeepActiveTabVisible(listRef);

  return (
    <TabsPrimitive.List
      ref={setListRef}
      data-slot="tabs-list"
      data-variant={variant}
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
        "group/tabs-list text-muted-foreground data-[variant=default]:bg-muted inline-flex w-fit max-w-full min-w-0 items-center justify-center-safe rounded-lg p-1 group-data-[orientation=vertical]/tabs:flex-col data-[orientation=horizontal]:[scrollbar-width:none] data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:overflow-y-hidden data-[variant=line]:gap-1 data-[variant=line]:rounded-none data-[variant=line]:bg-transparent [&[data-orientation=horizontal]::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-slot="tabs-trigger"
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
      "text-muted-foreground ring-offset-background hover:text-foreground ui-focus-ring data-[state=active]:bg-background data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:border-primary/25 relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start group-data-[variant=line]/tabs-list:border-e-0 group-data-[variant=line]/tabs-list:border-b-0 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="tabs-content"
    // `ui-focus-ring` = the single focus source, replacing a hand-rolled
    // `focus-visible:ring-2 focus-visible:ring-ring` that no --focus-ring-* knob could reach.
    className={cn("ui-focus-ring flex-1 outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
