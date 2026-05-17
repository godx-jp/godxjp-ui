import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react"
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
 *
 * Two consumption modes (per cardinal rule 23 + rule 31 — no parallel
 * convenience wrappers):
 *
 *   1. With label (preferred, Ant canonical) — pass children as the
 *      label text:
 *
 *        <Checkbox defaultChecked>利用規約に同意する</Checkbox>
 *
 *      The primitive wraps the box + label in a single `<label>` so
 *      clicking the text toggles the checkbox, ARIA labelling is
 *      automatic, and the consumer never writes
 *      `<label><Checkbox /><span>…</span></label>` ceremony.
 *
 *   2. Box-only (advanced) — no children. Use when the label lives
 *      elsewhere (table cell header, custom layout) and you wire
 *      `aria-labelledby` / `aria-label` yourself:
 *
 *        <th><Checkbox aria-label="Select all" /></th>
 *
 * Uses `.checkbox-*` classes from tokens.css. The box is 1rem (16px
 * @ base) per industry canon (shadcn / Ant / Tailwind).
 */

export interface CheckboxProps
  extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Label text rendered to the right of the box. When provided, the
   * primitive wraps both in a single `<label>` so clicking the text
   * toggles the checkbox. */
  children?: ReactNode
  /** Class merged onto the OUTER `<label>` when `children` is set,
   * or onto the box `<button>` otherwise. */
  className?: string
  /** Class merged onto the inner box (when `children` is set). */
  boxClassName?: string
}

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(function Checkbox({ className, boxClassName, children, ...rest }, ref) {
  const box = (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn("checkbox-root", children === undefined ? className : boxClassName)}
      {...rest}
    >
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

  if (children === undefined) return box

  return (
    <label className={cn("checkbox-label", className)}>
      {box}
      <span className="checkbox-label-text">{children}</span>
    </label>
  )
})
