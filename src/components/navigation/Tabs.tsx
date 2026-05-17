import * as TabsPrimitive from "@radix-ui/react-tabs"
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react"
import { cn } from "../cn"

/**
 * Tabs — Radix-backed tab strip styled with canonical `.tabs` /
 * `.tab` (line) or `.tabs-pills` / `.tabs-pill` (pill) classes from
 * the dxs-kintai canon. Keyboard nav + ARIA come from Radix.
 *
 * @example
 *   <Tabs defaultValue="open" variant="line">
 *     <TabsList>
 *       <TabsTrigger value="open">Open</TabsTrigger>
 *       <TabsTrigger value="closed">Closed</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="open">...</TabsContent>
 *   </Tabs>
 *
 * Vocabulary (§23.B):
 *   - `variant` — "line" (default) | "pills"
 *   - `orientation` — "horizontal" (default) | "vertical"
 *   - `placement` — "top" (default) | "right" | "bottom" | "left"
 *     (drives flex-direction of the root; Radix root sets
 *     `aria-orientation` automatically)
 *   - `value` / `defaultValue` / `onValueChange` — Radix selection
 */

export type TabsVariant = "line" | "pills"
export type TabsOrientation = "horizontal" | "vertical"
export type TabsPlacement = "top" | "right" | "bottom" | "left"

interface TabsCtx {
  variant: TabsVariant
  placement: TabsPlacement
}

const TabsContext = createContext<TabsCtx>({ variant: "line", placement: "top" })

export interface TabsProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: TabsVariant
  /** Position of the tab-bar relative to the panel. */
  placement?: TabsPlacement
}

export const Tabs = forwardRef<
  ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(function Tabs(
  { variant = "line", placement = "top", className, orientation, ...rest },
  ref,
) {
  // Map placement → Radix orientation (vertical when left/right).
  const radixOrientation: TabsOrientation =
    orientation ?? (placement === "left" || placement === "right" ? "vertical" : "horizontal")
  return (
    <TabsContext.Provider value={{ variant, placement }}>
      <TabsPrimitive.Root
        ref={ref}
        orientation={radixOrientation}
        data-placement={placement}
        className={cn("tabs-root", className)}
        {...rest}
      />
    </TabsContext.Provider>
  )
})

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...rest }, ref) {
  const { variant } = useContext(TabsContext)
  const base = variant === "pills" ? "tabs-pills" : "tabs"
  return <TabsPrimitive.List ref={ref} className={cn(base, className)} {...rest} />
})

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...rest }, ref) {
  const { variant } = useContext(TabsContext)
  const base = variant === "pills" ? "tabs-pill" : "tab"
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(base, className)}
      {...rest}
    />
  )
})

export const TabsContent = TabsPrimitive.Content
