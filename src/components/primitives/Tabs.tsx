import * as TabsPrimitive from "@radix-ui/react-tabs"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react"
import { cn } from "./cn"

/**
 * Tabs — Radix-backed tab strip styled with the canonical `.tabs` /
 * `.tab` CSS from tokens.css. Keyboard navigation + ARIA come from
 * Radix; the visual contract stays in the design tokens.
 *
 * @example
 *   <Tabs defaultValue="open">
 *     <TabsList>
 *       <TabsTrigger value="open">Open</TabsTrigger>
 *       <TabsTrigger value="closed">Closed</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="open">...</TabsContent>
 *     <TabsContent value="closed">...</TabsContent>
 *   </Tabs>
 */
export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...rest }, ref) {
  return <TabsPrimitive.List ref={ref} className={cn("tabs", className)} {...rest} />
})

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...rest }, ref) {
  // Radix sets `data-state="active"` on the active trigger — map it to
  // the `data-active` attribute the .tab CSS expects.
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn("tab", className)}
      {...rest}
      data-active={undefined}
    />
  )
})

export const TabsContent = TabsPrimitive.Content
