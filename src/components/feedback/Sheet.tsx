import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type FormHTMLAttributes,
  type ReactNode,
} from "react"
import { cn } from "../cn"

export type SheetSide = "top" | "right" | "bottom" | "left"

export interface SheetProps
  extends Omit<ComponentPropsWithoutRef<typeof DialogPrimitive.Root>, "children"> {
  trigger?: ReactNode
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  side?: SheetSide
  className?: string
  contentProps?: Omit<ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "children">
  form?: FormHTMLAttributes<HTMLFormElement>
}

export const Sheet = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  SheetProps
>(function Sheet(
  {
    trigger,
    title,
    description,
    footer,
    children,
    side = "right",
    className,
    contentProps,
    form,
    ...rootProps
  },
  ref,
) {
  const body = (
    <>
      {(title || description) && (
        <div className="dialog-header">
          {title && <DialogPrimitive.Title className="dialog-title">{title}</DialogPrimitive.Title>}
          {description && (
            <DialogPrimitive.Description className="dialog-description">
              {description}
            </DialogPrimitive.Description>
          )}
        </div>
      )}
      {children}
      {footer && <div className="dialog-footer">{footer}</div>}
    </>
  )

  return (
    <DialogPrimitive.Root {...rootProps}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="sheet-overlay" />
        <DialogPrimitive.Content
          ref={ref}
          data-side={side}
          {...contentProps}
          className={cn("sheet-content", className, contentProps?.className)}
        >
          {form ? <form {...form}>{body}</form> : body}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
})
