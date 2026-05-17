import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react"
import { cn } from "../cn"

// Glyph at 0.75rem (12px @ base) — 3/4 of the box's 1rem footprint,
// matches the shadcn / Ant canonical ratio. Rem-based so the icon
// rescales with the font-size axis alongside the box (rule 21).
const iconSize = { width: "0.75rem", height: "0.75rem" } as const

// strokeWidth=3 (vs lucide's default 2) + absoluteStrokeWidth keeps
// the check / minus glyphs legible after the SVG is scaled from its
// 24-unit native viewBox down to 12px — at default 2 the stroke
// thins to roughly 1px visual and reads as a hairline.
const strokeWidth = 3

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
        <Check
          className="checkbox-glyph-check"
          aria-hidden
          strokeWidth={strokeWidth}
          absoluteStrokeWidth
          style={iconSize}
        />
        <Minus
          className="checkbox-glyph-indeterminate"
          aria-hidden
          strokeWidth={strokeWidth}
          absoluteStrokeWidth
          style={iconSize}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
