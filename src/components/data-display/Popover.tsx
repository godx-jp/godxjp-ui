import * as PopoverPrimitive from "@radix-ui/react-popover"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react"
import { cn } from "../cn"

/**
 * Popover — Radix-backed floating panel anchored to a trigger element.
 * Styled with the canonical `.popover-content` class from tokens.css
 * so the visual contract stays in the design tokens.
 *
 * @example
 *   <Popover>
 *     <PopoverTrigger asChild>
 *       <Button variant="ghost">Open</Button>
 *     </PopoverTrigger>
 *     <PopoverContent>…body…</PopoverContent>
 *   </Popover>
 */
export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverAnchor = PopoverPrimitive.Anchor

export const PopoverContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent(
  { className, align = "center", sideOffset = 6, ...rest },
  ref,
) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn("popover-content", className)}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  )
})
