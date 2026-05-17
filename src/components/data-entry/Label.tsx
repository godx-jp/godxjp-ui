import * as LabelPrimitive from "@radix-ui/react-label"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react"
import { cn } from "../cn"

/**
 * Label — form-field label. Wraps Radix Label so `htmlFor` /
 * click-to-focus works out of the box. Maps to `.label` in tokens.css.
 *
 * Pair with <Input /> + an optional `.help` paragraph:
 *
 *   <Label htmlFor="name">Display name</Label>
 *   <Input id="name" />
 *   <p className="help">Visible to teammates.</p>
 */
export const Label = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(function Label({ className, ...rest }, ref) {
  return <LabelPrimitive.Root ref={ref} className={cn("label", className)} {...rest} />
})
