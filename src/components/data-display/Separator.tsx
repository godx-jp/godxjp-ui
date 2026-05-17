import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react"
import { cn } from "../cn"

/**
 * Separator — horizontal / vertical divider. Wraps Radix Separator for
 * ARIA + decorative semantics. Maps to `.divider` styling in tokens.css
 * (1px border, theme-aware color).
 */
export const Separator = forwardRef<
  ElementRef<typeof SeparatorPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(function Separator({ className, orientation = "horizontal", decorative = true, ...rest }, ref) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      orientation={orientation}
      decorative={decorative}
      className={cn(
        orientation === "horizontal" ? "divider" : "",
        className,
      )}
      style={
        orientation === "vertical"
          ? { width: 1, height: "100%", background: "var(--border)", border: 0 }
          : undefined
      }
      {...rest}
    />
  )
})
