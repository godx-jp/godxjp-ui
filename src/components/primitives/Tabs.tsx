import * as TabsPrimitive from "@radix-ui/react-tabs"
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react"
import { cn } from "./cn"

/**
 * Tabs — Radix-backed tab strip styled with the canonical `.tabs` /
 * `.tab` (line, default) or `.tabs-pills` / `.tabs-pill` (segmented
 * pill) classes from the dxs-kintai design system. Keyboard navigation
 * + ARIA come from Radix; the visual contract stays in tokens.
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
 * @example pills
 *   <Tabs defaultValue="day" variant="pills">
 *     <TabsList>
 *       <TabsTrigger value="day">日</TabsTrigger>
 *       <TabsTrigger value="week">週</TabsTrigger>
 *       <TabsTrigger value="month">月</TabsTrigger>
 *     </TabsList>
 *   </Tabs>
 */

export type TabsVariant = "line" | "pills"

const TabsVariantContext = createContext<TabsVariant>("line")

export interface TabsProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  /** Visual variant. `line` (default) is the underlined Radix-style strip; `pills` is the segmented control. */
  variant?: TabsVariant
}

export const Tabs = forwardRef<
  ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(function Tabs({ variant = "line", ...rest }, ref) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.Root ref={ref} {...rest} />
    </TabsVariantContext.Provider>
  )
})

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...rest }, ref) {
  const variant = useContext(TabsVariantContext)
  const base = variant === "pills" ? "tabs-pills" : "tabs"
  return <TabsPrimitive.List ref={ref} className={cn(base, className)} {...rest} />
})

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...rest }, ref) {
  const variant = useContext(TabsVariantContext)
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
