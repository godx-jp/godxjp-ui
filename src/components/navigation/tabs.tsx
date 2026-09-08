import * as React from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
} from "react-aria-components";
import { cn } from "../../lib/utils";
import { useKeepActiveTabVisible } from "./tabs-scroll";

export type TabsItem = {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
};

export type TabsOrientation = "vertical" | "horizontal";

/**
 * The repo's Radix-era vocabulary, kept VERBATIM. React Aria spells the same four things
 * `selectedKey` / `defaultSelectedKey` / `onSelectionChange` / `keyboardActivation`; the
 * translation lives inside this file so no consumer ever has to learn RAC's names.
 *
 * `activationMode` is the one that MUST NOT be dropped. `.ai/rules/settings.md` in the consumer
 * requires `orientation="vertical"` + `activationMode="manual"` for the settings rail, because
 * every item there is a URL — automatic activation would load four pages while the reader is only
 * arrowing past them.
 */
export type TabsProps = Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "dir"> & {
  /** Controlled selected tab — RAC `selectedKey`. */
  value?: string;
  /** Uncontrolled initial selection — RAC `defaultSelectedKey`. */
  defaultValue?: string;
  /** Fired with the NEW selected value — RAC `onSelectionChange`. */
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  /**
   * DOM attribute only. Under Radix this also steered RTL arrow keys; React Aria reads the
   * direction from the locale, so an RTL app must set it through `I18nProvider`.
   */
  dir?: "ltr" | "rtl";
  /** `"manual"` = arrow keys move focus without selecting — RAC `keyboardActivation`. */
  activationMode?: "manual" | "automatic";
  items?: TabsItem[];
  variant?: "default" | "line" | "card";
  listClassName?: string;
  contentClassName?: string;
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
  items: TabsItem[] | undefined,
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

export function Tabs({
  className,
  orientation = "horizontal",
  items,
  value,
  defaultValue,
  onValueChange,
  activationMode,
  dir,
  variant = "default",
  listClassName,
  contentClassName,
  children,
  ...props
}: TabsProps) {
  const resolvedDefault = resolveFallbackTabValue(items, defaultValue);
  /** gh#175: `items` given, but not one of them can be selected — see `TabsFrame`. */
  const selectionSuppressed =
    value === undefined && items != null && items.length > 0 && resolvedDefault === undefined;
  const frame = React.useMemo<TabsFrame>(
    () => ({ orientation, selectionSuppressed }),
    [orientation, selectionSuppressed],
  );

  return (
    <TabsFrameContext.Provider value={frame}>
      <AriaTabs
        // The variant AS ASKED FOR. The list deliberately collapses `card` into
        // what a service theme, and a test, need to key on.
        orientation={orientation}
        // Radix `activationMode` → RAC `keyboardActivation`. Same two words, same default
        // (`"automatic"`); the settings rail depends on `"manual"` surviving this rename.
        keyboardActivation={activationMode}
        selectedKey={value}
        defaultSelectedKey={value === undefined ? resolvedDefault : undefined}
        onSelectionChange={
          onValueChange
            ? (key) => {
                onValueChange(String(key));
              }
            : undefined
        }
        className={cn(
          // Structure only.
          // live in src/styles/navigation-layout.css so the gap reads --tabs-root-gap and a service
          "group/tabs flex data-[orientation=horizontal]:flex-col",
          className,
        )}
        render={(domProps) =>
          withDomProps("div", "tabs", { dir, ...props }, domProps, {
            "data-orientation": orientation,
            "data-variant": variant,
          })
        }
      >
        {items ? (
          <>
            <TabsList
              data-slot="tabs-list"
              // The list variant MUST be forwarded, not just styled through `className` — every
              // line-variant rule on TabsTrigger keys off `group-data-[variant=line]/tabs-list`
              // `card` keeps the
              // default list chrome, exactly like a hand-composed <TabsList> with no variant.
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
                variant === "card" && "w-full justify-start",
                listClassName,
              )}
            >
              {items.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className={cn(
                    // Geometry only — the active underline is the token-owned `::after` bar the
                    // line variant already owns (never a second, hand-rolled border-b indicator).
                    // utilities so tailwind-merge keeps dropping the pill trigger's own radius /
                    // padding steps from the base class list.
                    // `card` adds NOTHING here — its list is forwarded as data-variant="default", so
                    // the active lift already comes from the base trigger's
                    // `group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm`.
                    variant === "line" &&
                      "rounded-[var(--tabs-trigger-line-radius)] px-[var(--tabs-trigger-line-padding-x)] py-[var(--tabs-trigger-line-padding-y)]",
                  )}
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {items.map((item) => (
              <TabsContent
                key={item.value}
                value={item.value}
                data-slot="tabs-panel"
                // No variant geometry: the panel has never carried a top margin (the root is a flex
                className={contentClassName}
              >
                {item.content}
              </TabsContent>
            ))}
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
          "group/tabs-list text-muted-foreground data-[variant=default]:bg-muted inline-flex w-fit max-w-full min-w-0 items-center justify-center-safe rounded-lg p-1 group-data-[orientation=vertical]/tabs:flex-col data-[orientation=horizontal]:[scrollbar-width:none] data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:overflow-y-hidden data-[variant=line]:gap-1 data-[variant=line]:rounded-none data-[variant=line]:bg-transparent [&[data-orientation=horizontal]::-webkit-scrollbar]:hidden",
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
  ({ className, value, disabled, children, ...props }, ref) => {
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
          "text-muted-foreground ring-offset-background hover:text-foreground ui-focus-ring data-[state=active]:bg-background data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:border-primary/25 relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start group-data-[variant=line]/tabs-list:border-e-0 group-data-[variant=line]/tabs-list:border-b-0 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none",
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
        className={cn("ui-focus-ring flex-1 outline-none", className)}
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
