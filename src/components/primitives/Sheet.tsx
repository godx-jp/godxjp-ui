import * as DialogPrimitive from "@radix-ui/react-dialog"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from "react"
import { cn } from "./cn"

/**
 * Sheet — slide-over panel built on Radix Dialog. Same accessibility
 * model as Dialog; `.sheet-content` positions per `side` using tokens.
 */
export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetPortal = DialogPrimitive.Portal

export const SheetOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function SheetOverlay({ className, ...rest }, ref) {
  return <DialogPrimitive.Overlay ref={ref} className={cn("sheet-overlay", className)} {...rest} />
})

export type SheetSide = "top" | "right" | "bottom" | "left"

export type SheetContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: SheetSide
}

export const SheetContent = forwardRef<ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  function SheetContent({ side = "right", className, children, ...rest }, ref) {
    return (
      <SheetPortal>
        <SheetOverlay />
        <DialogPrimitive.Content
          ref={ref}
          data-side={side}
          className={cn("sheet-content", className)}
          {...rest}
        >
          {children}
        </DialogPrimitive.Content>
      </SheetPortal>
    )
  },
)

export function SheetHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dialog-header", className)} {...rest} />
}

export function SheetFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dialog-footer", className)} {...rest} />
}

export const SheetTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function SheetTitle({ className, ...rest }, ref) {
  return <DialogPrimitive.Title ref={ref} className={cn("dialog-title", className)} {...rest} />
})

export const SheetDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function SheetDescription({ className, ...rest }, ref) {
  return <DialogPrimitive.Description ref={ref} className={cn("dialog-description", className)} {...rest} />
})
