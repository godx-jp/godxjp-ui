import * as PopoverPrimitive from "@radix-ui/react-popover"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react"
import { cn } from "../cn"

const Root = PopoverPrimitive.Root
const Trigger = PopoverPrimitive.Trigger
const Anchor = PopoverPrimitive.Anchor

export interface PopoverProps
  extends Omit<ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>, "children"> {
  /** Click-to-toggle trigger. Radix wires open/close on click. Don't combine
   *  with a controlled `open` flag that also opens on focus — the trigger's
   *  click handler will toggle the just-opened popup back to closed. Use
   *  `anchor` instead in that case (combobox / typeahead pattern). */
  trigger?: ReactNode
  /** Positioning-only anchor. The popup floats next to this element but the
   *  element itself does NOT handle open/close. Use this when the parent
   *  controls `open` (combobox / typeahead / focus-managed dropdown). */
  anchor?: ReactNode
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
    anchor,
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
  if (trigger === undefined && anchor === undefined) {
    return <Root {...rootProps}>{children}</Root>
  }

  const content = (
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
  )

  return (
    <Root {...rootProps}>
      {anchor !== undefined ? (
        <Anchor asChild>{anchor}</Anchor>
      ) : (
        <Trigger asChild>{trigger}</Trigger>
      )}
      {content}
    </Root>
  )
})
