import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from "react"
import { cn } from "../cn"

/**
 * AlertDialog — modal that traps focus until confirmed or cancelled.
 * Uses `.dialog-*` surfaces from tokens.css; actions use `.btn` atoms.
 */
export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger
export const AlertDialogPortal = AlertDialogPrimitive.Portal

export const AlertDialogOverlay = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(function AlertDialogOverlay({ className, ...rest }, ref) {
  return <AlertDialogPrimitive.Overlay ref={ref} className={cn("dialog-overlay", className)} {...rest} />
})

export const AlertDialogContent = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(function AlertDialogContent({ className, ...rest }, ref) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content ref={ref} className={cn("dialog-content", className)} {...rest} />
    </AlertDialogPortal>
  )
})

export function AlertDialogHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dialog-header", className)} {...rest} />
}

export function AlertDialogFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dialog-footer", className)} {...rest} />
}

export const AlertDialogTitle = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(function AlertDialogTitle({ className, ...rest }, ref) {
  return <AlertDialogPrimitive.Title ref={ref} className={cn("dialog-title", className)} {...rest} />
})

export const AlertDialogDescription = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(function AlertDialogDescription({ className, ...rest }, ref) {
  return (
    <AlertDialogPrimitive.Description ref={ref} className={cn("dialog-description", className)} {...rest} />
  )
})

export const AlertDialogAction = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Action>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(function AlertDialogAction({ className, ...rest }, ref) {
  return <AlertDialogPrimitive.Action ref={ref} className={cn("btn", "btn-primary", className)} {...rest} />
})

export const AlertDialogCancel = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Cancel>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(function AlertDialogCancel({ className, ...rest }, ref) {
  return <AlertDialogPrimitive.Cancel ref={ref} className={cn("btn", "btn-secondary", className)} {...rest} />
})
