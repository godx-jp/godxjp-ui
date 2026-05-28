import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { buttonVariants } from "../general/button";
import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { Input } from "../data-entry/input";
import { Label } from "../data-entry/label";
import type { DialogConfirmProp } from "../../props/components/feedback.prop";

export type {
  DialogConfirmProp,
  DialogConfirmProp as DialogConfirmProps,
} from "../../props/components/feedback.prop";

/** form = nhập liệu / wizard (role=dialog, có nút X). confirm = quyết định (role=alertdialog, không X). */
export type DialogMode = "form" | "confirm";

const DialogModeContext = React.createContext<DialogMode>("form");

function useDialogMode(): DialogMode {
  return React.useContext(DialogModeContext);
}

type DialogRootProps = React.ComponentProps<typeof DialogPrimitive.Root> & {
  mode?: DialogMode;
};

function DialogRoot({ mode = "form", ...props }: DialogRootProps) {
  if (mode === "confirm") {
    return (
      <DialogModeContext.Provider value="confirm">
        <AlertDialogPrimitive.Root data-slot="dialog" {...props} />
      </DialogModeContext.Provider>
    );
  }
  return (
    <DialogModeContext.Provider value="form">
      <DialogPrimitive.Root data-slot="dialog" {...props} />
    </DialogModeContext.Provider>
  );
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  const mode = useDialogMode();
  if (mode === "confirm") {
    return <AlertDialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
  }
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "ui-dialog-overlay data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showClose?: boolean;
    showCloseButton?: boolean;
  }
>(({ className, children, showClose, showCloseButton: showCloseButtonProp, ...props }, ref) => {
  const mode = useDialogMode();

  if (mode === "confirm") {
    return (
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          data-slot="dialog-overlay"
          className="ui-dialog-overlay data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        />
        <AlertDialogPrimitive.Content
          ref={ref}
          data-slot="dialog-content"
          className={cn(
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-200 outline-none",
            className,
          )}
          {...props}
        >
          {children}
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    );
  }

  const showCloseButton = showCloseButtonProp ?? showClose ?? true;
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        className={cn(
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-200 outline-none",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring transition-opacity focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="dialog-header" className={className} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="dialog-footer" className={className} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const mode = useDialogMode();
  const cls = cn(className);
  if (mode === "confirm") {
    return (
      <AlertDialogPrimitive.Title ref={ref} data-slot="dialog-title" className={cls} {...props} />
    );
  }
  return <DialogPrimitive.Title ref={ref} data-slot="dialog-title" className={cls} {...props} />;
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  const mode = useDialogMode();
  const cls = cn(className);
  if (mode === "confirm") {
    return (
      <AlertDialogPrimitive.Description
        ref={ref}
        data-slot="dialog-description"
        className={cls}
        {...props}
      />
    );
  }
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={cls}
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

/** Confirm mode — primary action (maps to Radix AlertDialogAction). */
const DialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
DialogAction.displayName = "DialogAction";

/** Confirm mode — dismiss without action (maps to Radix AlertDialogCancel). */
const DialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), className)}
    {...props}
  />
));
DialogCancel.displayName = "DialogCancel";

/** Preset: confirm / destructive / type-to-confirm — use case `mode="confirm"` without compound markup. */
function DialogConfirm({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  confirmPhrase,
  onConfirm,
  keepOpenOnConfirm = false,
  pending = false,
}: DialogConfirmProp) {
  const { t } = useTranslation();
  const [typed, setTyped] = React.useState("");
  const inputId = React.useId();

  const needsPhrase = confirmPhrase != null && confirmPhrase.length > 0;
  const phraseMatches = !needsPhrase || typed === confirmPhrase;
  const effectiveVariant = needsPhrase ? "destructive" : variant;
  const resolvedConfirm = confirmLabel ?? (needsPhrase ? t("common.delete") : t("common.continue"));
  const resolvedCancel = cancelLabel ?? t("common.cancel");

  const handleOpenChange = (next: boolean) => {
    setTyped("");
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (!phraseMatches) return;
    void (async () => {
      await onConfirm();
      if (!keepOpenOnConfirm) onOpenChange(false);
    })();
  };

  return (
    <DialogRoot mode="confirm" open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {needsPhrase && (
          <div className="ui-stack-xs">
            <Label htmlFor={inputId} className="text-sm">
              {t("common.typeToConfirm", { phrase: confirmPhrase })}
            </Label>
            <Input
              id={inputId}
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value);
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder={confirmPhrase}
              aria-required="true"
            />
          </div>
        )}

        <DialogFooter>
          <DialogCancel asChild>
            <Button variant="ghost" disabled={pending}>
              {resolvedCancel}
            </Button>
          </DialogCancel>
          <Button
            variant={effectiveVariant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={pending || !phraseMatches}
          >
            {pending ? t("common.working") : resolvedConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Action: DialogAction,
  Cancel: DialogCancel,
  Confirm: DialogConfirm,
});

export {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogAction,
  DialogCancel,
  DialogConfirm,
};
