import * as SwitchPrimitive from "@radix-ui/react-switch"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react"
import { cn } from "./cn"

/**
 * Switch — boolean toggle (Radix). Styled with `.switch-root` / `.switch-thumb`
 * in tokens.css.
 */
export const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(function Switch({ className, ...rest }, ref) {
  return (
    <SwitchPrimitive.Root ref={ref} className={cn("switch-root", className)} {...rest}>
      <SwitchPrimitive.Thumb className="switch-thumb" />
    </SwitchPrimitive.Root>
  )
})
