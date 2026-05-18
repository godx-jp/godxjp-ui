import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  type ComponentPropsWithoutRef,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../cn";

export interface DialogProps extends ComponentPropsWithoutRef<
  typeof DialogPrimitive.Root
> {
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentProps?: Omit<
    ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    "children" | "className"
  >;
  form?: FormHTMLAttributes<HTMLFormElement>;
}

export function Dialog({
  trigger,
  title,
  description,
  footer,
  children,
  className,
  contentProps,
  form,
  ...rootProps
}: DialogProps) {
  const content = (
    <>
      <div className="dialog-header">
        <DialogPrimitive.Title className="dialog-title">
          {title}
        </DialogPrimitive.Title>
        {description !== undefined && (
          <DialogPrimitive.Description className="dialog-description">
            {description}
          </DialogPrimitive.Description>
        )}
      </div>
      {children}
      {footer !== undefined && <div className="dialog-footer">{footer}</div>}
    </>
  );
  const descriptionProps =
    description === undefined
      ? ({ "aria-describedby": undefined } as const)
      : {};

  return (
    <DialogPrimitive.Root {...rootProps}>
      {trigger !== undefined && (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay" />
        <DialogPrimitive.Content
          {...contentProps}
          {...descriptionProps}
          className={cn("dialog-content", className)}
        >
          {form !== undefined ? <form {...form}>{content}</form> : content}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
