import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react"
import { cn } from "../cn"

export interface AlertDialogProps
  extends Omit<ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>, "children"> {
  trigger?: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  cancel?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  className?: string
  contentProps?: Omit<ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>, "children">
}

export const AlertDialog = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogProps
>(function AlertDialog(
  {
    trigger,
    title,
    description,
    children,
    cancel,
    action,
    footer,
    className,
    contentProps,
    ...rootProps
  },
  ref,
) {
  return (
    <AlertDialogPrimitive.Root {...rootProps}>
      {trigger && <AlertDialogPrimitive.Trigger asChild>{trigger}</AlertDialogPrimitive.Trigger>}
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="dialog-overlay" />
        <AlertDialogPrimitive.Content
          ref={ref}
          {...contentProps}
          className={cn("dialog-content", className, contentProps?.className)}
        >
          <div className="dialog-header">
            <AlertDialogPrimitive.Title className="dialog-title">
              {title}
            </AlertDialogPrimitive.Title>
            {description && (
              <AlertDialogPrimitive.Description className="dialog-description">
                {description}
              </AlertDialogPrimitive.Description>
            )}
          </div>
          {children}
          {(footer || cancel || action) && (
            <div className="dialog-footer">
              {footer}
              {cancel && (
                <AlertDialogPrimitive.Cancel className="btn btn-secondary">
                  {cancel}
                </AlertDialogPrimitive.Cancel>
              )}
              {action && (
                <AlertDialogPrimitive.Action className="btn btn-primary">
                  {action}
                </AlertDialogPrimitive.Action>
              )}
            </div>
          )}
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
})
