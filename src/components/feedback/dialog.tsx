import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import type { ToneProp } from "../../props/vocabulary";
import { overlayHeaderToneClass } from "./overlay-header-tone";
import { buttonVariants } from "../general/button";
import { useTranslation } from "../../i18n/use-translation";
import { Button } from "../general/button";
import { Input } from "../data-entry/input";
import { Label } from "../data-entry/label";
import type { AlertDialogProp } from "../../props/components/feedback.prop";

export type {
  AlertDialogProp,
  AlertDialogProp as AlertDialogProps,
} from "../../props/components/feedback.prop";

type DialogRootProps = React.ComponentProps<typeof DialogPrimitive.Root> & {};

function DialogRoot(props: DialogRootProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
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

interface DialogHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  tone?: ToneProp;
}

const DialogHeader = ({
  className,
  title,
  subtitle,
  extra,
  tone = "default",
  children,
  ...props
}: DialogHeaderProps) => {
  // Band layout (full-bleed, border-bottom, padding) lives in dialog-layout.css so it mirrors the
  // footer exactly; here we only add the soft `tone` background + the title/subtitle/extra row.
  return (
    <div
      data-slot="dialog-header"
      data-tone={tone}
      className={cn(overlayHeaderToneClass[tone], className)}
      {...props}
    >
      {children ?? (
        <div className="flex items-start justify-between gap-[var(--space-3)] pe-[var(--space-8)]">
          <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
            {title != null && <DialogTitle>{title}</DialogTitle>}
            {subtitle != null && <DialogDescription>{subtitle}</DialogDescription>}
          </div>
          {extra != null && (
            <div className="flex shrink-0 items-center gap-[var(--space-2)] whitespace-nowrap">
              {extra}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
DialogHeader.displayName = "DialogHeader";

// Ring-safe scrollable region for a tall dialog. Layout lives in dialog-layout.css
// [data-slot="dialog-body"]: full-bleed inset (matches the dialog padding) so a full-width
// control's 3px focus ring never clips against the scroll container. Mirrors SheetBody.
const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="dialog-body" className={className} {...props} />
);
DialogBody.displayName = "DialogBody";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // Layout (right-aligned actions, mobile column-reverse) lives in feedback-layout.css
  // [data-slot="dialog-footer"]. Destructive action goes far-left via `className="mr-auto"`.
  <div data-slot="dialog-footer" className={className} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const cls = cn(className);
  return <DialogPrimitive.Title ref={ref} data-slot="dialog-title" className={cls} {...props} />;
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  const cls = cn(className);
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

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "ui-dialog-overlay data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    showClose?: boolean;
    showCloseButton?: boolean;
  }
>(({ className, children, showClose, showCloseButton: showCloseButtonProp, ...props }, ref) => {
  const showCloseButton = showCloseButtonProp ?? showClose ?? false;
  return (
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
      {showCloseButton ? (
        <AlertDialogPrimitive.Cancel asChild>
          <button
            type="button"
            className="ring-offset-background focus:ring-ring transition-opacity focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </AlertDialogPrimitive.Cancel>
      ) : null}
    </AlertDialogPrimitive.Content>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({
  className,
  title,
  subtitle,
  extra,
  tone = "default",
  children,
  ...props
}: DialogHeaderProps) => {
  return (
    <div
      data-slot="dialog-header"
      data-tone={tone}
      className={cn(overlayHeaderToneClass[tone], className)}
      {...props}
    >
      {children ?? (
        <div className="flex items-start justify-between gap-[var(--space-3)] pe-[var(--space-8)]">
          <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
            {title != null && <AlertDialogTitle>{title}</AlertDialogTitle>}
            {subtitle != null && <AlertDialogDescription>{subtitle}</AlertDialogDescription>}
          </div>
          {extra != null && (
            <div className="flex shrink-0 items-center gap-[var(--space-2)] whitespace-nowrap">
              {extra}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  // Layout lives in feedback-layout.css [data-slot="dialog-footer"] (right-aligned actions).
  <div data-slot="dialog-footer" className={cn(className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn(className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn(className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

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
const AlertDialogAction = DialogAction;
const AlertDialogCancel = DialogCancel;

/** Preset: confirm / destructive / type-to-confirm without compound markup. */
function AlertDialog({
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
}: AlertDialogProp) {
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
    <AlertDialogPrimitive.Root data-slot="dialog" open={open} onOpenChange={handleOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          data-slot="dialog-overlay"
          className="ui-dialog-overlay data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        />
        <AlertDialogPrimitive.Content
          data-slot="dialog-content"
          className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-200 outline-none"
        >
          <DialogHeader>
            <AlertDialogPrimitive.Title data-slot="dialog-title">
              {title}
            </AlertDialogPrimitive.Title>
            {description ? (
              <AlertDialogPrimitive.Description data-slot="dialog-description">
                {description}
              </AlertDialogPrimitive.Description>
            ) : null}
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
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Action: DialogAction,
  Cancel: DialogCancel,
});

export {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogAction,
  DialogCancel,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialog,
};
