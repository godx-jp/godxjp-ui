import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";
import { useKeepActiveTabVisible } from "./tabs-scroll";

export type TabsItem = {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
};

export type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  items?: TabsItem[];
  variant?: "default" | "line" | "card";
  listClassName?: string;
  contentClassName?: string;
};

/**
 * Resolves the value Tabs should fall back to when it owns the initial selection
 * (uncontrolled — `value` is undefined). `requested` (usually `defaultValue`) is honored
 * only when it names an item that exists AND is not disabled; otherwise (nothing requested,
 * a stale/unknown key, or a key that points at a disabled item) it falls back to the first
 * ENABLED item. Returns undefined — selecting nothing — when every item is disabled (gh#175).
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

export function Tabs({
  className,
  orientation = "horizontal",
  items,
  value,
  defaultValue,
  variant = "default",
  listClassName,
  contentClassName,
  ...props
}: TabsProps) {
  const resolvedDefault = resolveFallbackTabValue(items, defaultValue);

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      value={value}
      defaultValue={value === undefined ? resolvedDefault : undefined}
      className={cn(
        // Structure only. The shrink floor (`min-inline-size: 0`, gh#175) and the strip↔panel gap
        // live in src/styles/navigation-layout.css so the gap reads --tabs-root-gap and a service
        // can retune the tab rhythm without forking this file (#319).
        "group/tabs flex data-[orientation=horizontal]:flex-col",
        className,
      )}
      {...props}
    >
      {items ? (
        <>
          <TabsList
            data-slot="tabs-list"
            // The list variant MUST be forwarded, not just styled through `className` — every
            // line-variant rule on TabsTrigger keys off `group-data-[variant=line]/tabs-list`
            // (that is how the active ring is kept off the line variant, gh#248). `card` keeps the
            // default list chrome, exactly like a hand-composed <TabsList> with no variant.
            variant={variant === "line" ? "line" : "default"}
            className={cn(
              // The padding override is an arbitrary value reading the knob (never `p-0`): it must
              // stay a UTILITY so tailwind-merge still drops the strip's own padding step, and a
              // components-layer rule could not beat that utility anyway (#319).
              variant === "line" &&
                "h-auto w-full justify-start border-b p-[var(--tabs-list-line-space-inset)]",
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
                  // Token-reading arbitrary values, not Tailwind steps (#319): they have to stay
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
              // box whose gap does the spacing), so the old `mt-0` reset was resetting nothing.
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

  // gh#204 — a responsive resize / route re-render must never leave the active trigger scrolled
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
        // container (gh#175). Hidden scrollbar keeps the strip visually clean while staying
        // swipeable on touch and reachable via keyboard (arrow-key roving focus still scrolls the
        // newly-focused trigger into view natively); `useKeepActiveTabVisible` above re-pins the
        // active trigger when a resize would otherwise strand it off-strip (gh#204). Vertical
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
      // The SELECTED-state ring (`ring-1 ring-primary/25`) is scoped to the default/card lists —
      // the `line` variant is underline-only (gh#248) and must NEVER paint a surrounding ring, or
      // it competes with (and at equal specificity overrides) the `:focus-visible` ring. The
      // focus-visible ring/outline below is deliberately left unscoped: every variant keeps a
      // visible keyboard focus indicator (WCAG 2.4.7). The line indicator itself lives in
      // src/styles/navigation-layout.css so it reads the --tabs-indicator-* tokens.
      "text-muted-foreground ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:outline-ring focus-visible:ring-ring/50 data-[state=active]:bg-background data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:ring-primary/25 relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start group-data-[variant=line]/tabs-list:border-e-0 group-data-[variant=line]/tabs-list:border-b-0 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=default]/tabs-list:data-[state=active]:ring-1 group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none",
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
    className={cn("focus-visible:ring-ring flex-1 outline-none focus-visible:ring-2", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
