import * as TabsPrimitive from "@radix-ui/react-tabs"
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react"
import { cn } from "../cn"

export type TabsVariant = "line" | "pills"
export type TabsOrientation = "horizontal" | "vertical"
export type TabsPlacement = "top" | "right" | "bottom" | "left"

export interface TabsItem {
  value: string
  label: ReactNode
  content?: ReactNode
  disabled?: boolean
}

export interface TabsProps
  extends Omit<ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, "children"> {
  items: TabsItem[]
  variant?: TabsVariant
  placement?: TabsPlacement
  listClassName?: string
  contentClassName?: string
  children?: ReactNode
}

export const Tabs = forwardRef<
  ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(function Tabs(
  {
    items,
    variant = "line",
    placement = "top",
    className,
    listClassName,
    contentClassName,
    orientation,
    children,
    ...rest
  },
  ref,
) {
  const radixOrientation: TabsOrientation =
    orientation ?? (placement === "left" || placement === "right" ? "vertical" : "horizontal")
  const listClass = variant === "pills" ? "tabs-pills" : "tabs"
  const triggerClass = variant === "pills" ? "tabs-pill" : "tab"

  return (
    <TabsPrimitive.Root
      ref={ref}
      orientation={radixOrientation}
      data-placement={placement}
      className={cn("tabs-root", className)}
      {...rest}
    >
      <TabsPrimitive.List className={cn(listClass, listClassName)}>
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={triggerClass}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) =>
        item.content === undefined ? null : (
          <TabsPrimitive.Content
            key={item.value}
            value={item.value}
            className={contentClassName}
          >
            {item.content}
          </TabsPrimitive.Content>
        ),
      )}
      {children}
    </TabsPrimitive.Root>
  )
})
