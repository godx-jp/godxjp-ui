import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from "react"
import { cn } from "../cn"

/**
 * DropdownMenu — Radix-backed action menu opened from a trigger
 * (kebab, caret, button…). Styled via canonical `.dropdown-menu-*`
 * classes from tokens.css.
 *
 * Items support `variant="destructive"` for dangerous actions and
 * `inset` for left-padding alignment when icons aren't on every row.
 *
 * @example
 *   <DropdownMenu>
 *     <DropdownMenuTrigger asChild>
 *       <Button variant="ghost"><MoreVertical /></Button>
 *     </DropdownMenuTrigger>
 *     <DropdownMenuContent align="end">
 *       <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem variant="destructive" onSelect={onDelete}>
 *         Delete
 *       </DropdownMenuItem>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 */
export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuGroup = DropdownMenuPrimitive.Group
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal
export const DropdownMenuSub = DropdownMenuPrimitive.Sub
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn("dropdown-menu-content", className)}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  )
})

type DropdownItemProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownItemProps
>(function DropdownMenuItem({ className, inset, variant = "default", ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn("dropdown-menu-item", className)}
      data-variant={variant === "destructive" ? "destructive" : undefined}
      data-inset={inset ? "true" : undefined}
      {...rest}
    />
  )
})

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn("dropdown-menu-separator", className)}
      {...rest}
    />
  )
})

export const DropdownMenuLabel = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }
>(function DropdownMenuLabel({ className, inset, ...rest }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn("dropdown-menu-label", className)}
      data-inset={inset ? "true" : undefined}
      {...rest}
    />
  )
})

export function DropdownMenuShortcut({
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("dropdown-menu-shortcut", className)} {...rest} />
}
