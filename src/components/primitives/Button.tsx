import { Slot } from "@radix-ui/react-slot"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "./cn"

/**
 * Button — canonical action atom.
 *
 * Maps onto the `.btn` family in tokens.css:
 *
 *   primary   — filled, brand color, default action
 *   secondary — bordered, foreground text, neutral surface
 *   ghost     — transparent, foreground text, hover surface
 *   danger    — destructive, --destructive bg
 *
 * Sizes mirror density tokens:
 *   sm  — 28 px height (compact action bar)
 *   md  — 32 px height (default)
 *   lg  — 36 px height (page hero CTA)
 *
 * Supports `asChild` (Radix Slot pattern) so the button styles can wrap
 * a Link or any other element without nesting:
 *
 * @example
 *   <Button variant="primary">Save</Button>
 *   <Button asChild variant="ghost"><a href="/docs">Docs</a></Button>
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
  children?: ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const Component = asChild ? Slot : "button"
  return (
    <Component
      type={asChild ? undefined : type}
      className={cn(
        "btn",
        `btn-${variant}`,
        size === "sm" && "btn-sm",
        size === "lg" && "btn-lg",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
