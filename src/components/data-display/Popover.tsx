import * as PopoverPrimitive from "@radix-ui/react-popover"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react"
import { cn } from "../cn"

const Root = PopoverPrimitive.Root
const Trigger = PopoverPrimitive.Trigger

export interface PopoverProps
  extends Omit<ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>, "children"> {
  trigger?: ReactNode
  children?: ReactNode
  align?: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>["align"]
  side?: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>["side"]
  sideOffset?: number
  className?: string
  contentProps?: Omit<ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>, "children">
}

export const Popover = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  PopoverProps
>(function Popover(
  {
    trigger,
    children,
    align = "center",
    side,
    sideOffset = 6,
    className,
    contentProps,
    ...rootProps
  },
  ref,
) {
  if (trigger === undefined) {
    return <Root {...rootProps}>{children}</Root>
  }

  return (
    <Root {...rootProps}>
      <Trigger asChild>{trigger}</Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          side={side}
          sideOffset={sideOffset}
          {...contentProps}
          className={cn("popover-content", className, contentProps?.className)}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </Root>
  )
})
