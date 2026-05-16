import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react"
import { cn } from "./cn"

const iconSize = { width: "var(--spacing-3)", height: "var(--spacing-3)" } as const

/**
 * Checkbox — tri-state capable (checked / unchecked / indeterminate).
 * Uses `.checkbox-*` classes from tokens.css.
 */
export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...rest }, ref) {
  return (
    <CheckboxPrimitive.Root ref={ref} className={cn("checkbox-root", className)} {...rest}>
      <CheckboxPrimitive.Indicator className="checkbox-indicator">
        <Check className="checkbox-glyph-check" aria-hidden style={iconSize} />
        <Minus className="checkbox-glyph-indeterminate" aria-hidden style={iconSize} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
