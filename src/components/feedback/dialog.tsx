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
    overlayClassName?: string;
  }
>(
  (
    {
      className,
      children,
      showClose,
      showCloseButton: showCloseButtonProp,
      overlayClassName,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const showCloseButton = showCloseButtonProp ?? showClose ?? true;
    return (
      <DialogPortal>
        <DialogOverlay className={overlayClassName} />
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
              // `ui-focus-ring` is the ONE focus affordance (styles/focus-ring.css): it reads the
              // four --focus-ring-* tokens, so a service retunes this ring with every other one.
              // The hand-written `focus:ring-2 focus:ring-offset-2` it replaces was un-themeable
              // AND fired on plain `:focus` (i.e. on a mouse click), unlike every other control.
              className="ui-focus-ring transition-opacity focus:outline-hidden disabled:pointer-events-none"
            >
              <X className="ui-dialog-close-icon" aria-hidden="true" />
              <span className="sr-only">{t("feedback.alert.dismiss")}</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
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
        // Chrome rhythm lives in dialog-layout.css (`.ui-dialog-*`, mirroring `.ui-sheet-*`), so
        // the two overlay siblings retune from one --dialog-*/--sheet-* set instead of literals.
        <div className="ui-dialog-title-row">
          <div className="ui-dialog-title-block">
            {title != null && <DialogTitle>{title}</DialogTitle>}
            {subtitle != null && <DialogDescription>{subtitle}</DialogDescription>}
          </div>
          {extra != null && <div className="ui-dialog-extra">{extra}</div>}
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
  // [data-slot="dialog-footer"]. Destructive action goes to the start via `className="me-auto"`.
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

type AlertDialogRootProps = React.ComponentProps<typeof AlertDialogPrimitive.Root> & {};

/**
 * Compound alert-dialog Root — the `role="alertdialog"` mirror of {@link DialogRoot}.
 *
 * The flat {@link AlertDialog} preset owns the confirm / challenge / step-up recipe and cannot be
 * re-composed; this Root is what a consumer reaches for when the confirmation needs bespoke
 * content. It supplies the Radix AlertDialog context that `AlertDialogTitle`,
 * `AlertDialogDescription`, `AlertDialogAction` and `AlertDialogCancel` read, so the compound
 * parts are assemblable from the public API alone (no direct `@radix-ui/react-alert-dialog`
 * import). Focus trap, focus restoration and the modal `role="alertdialog"` semantics stay
 * Radix-owned.
 */
function AlertDialogRoot(props: AlertDialogRootProps) {
  return <AlertDialogPrimitive.Root data-slot="dialog" {...props} />;
}

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
  const { t } = useTranslation();
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
            // Same slot as DialogContent's close: `[data-slot="dialog-close"]`
            // (styles/dialog-layout.css) is what pins the ✕ to the corner and gives it the rest
            // opacity. Without it this button rendered inline, in flow, under the footer.
            data-slot="dialog-close"
            // Same single-source ring as DialogContent's close (styles/focus-ring.css).
            className="ui-focus-ring transition-opacity focus:outline-hidden disabled:pointer-events-none"
            aria-label={t("feedback.alert.dismiss")}
          >
            <X className="ui-dialog-close-icon" aria-hidden="true" />
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
        <div className="ui-dialog-title-row">
          <div className="ui-dialog-title-block">
            {title != null && <AlertDialogTitle>{title}</AlertDialogTitle>}
            {subtitle != null && <AlertDialogDescription>{subtitle}</AlertDialogDescription>}
          </div>
          {extra != null && <div className="ui-dialog-extra">{extra}</div>}
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

/**
 * Preset: confirm / destructive / typed-challenge / step-up without compound markup.
 *
 * High-stakes deletion recipe ("DangerConfirm", godxui#193): pass `challenge` (or `confirmPhrase`)
 * to gate the confirm button behind an exact typed match (org slug / resource name), and `stepUp`
 * for an async re-auth gate (passkey / 2FA) that must resolve truthy before `onConfirm` fires.
 * Both flows force the destructive tone (button + soft header band).
 */
function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  confirmPhrase,
  challenge,
  onConfirm,
  stepUp,
  keepOpenOnConfirm = false,
  pending = false,
}: AlertDialogProp) {
  const { t } = useTranslation();
  const [typed, setTyped] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [stepUpFailed, setStepUpFailed] = React.useState(false);
  const inputId = React.useId();
  const stepErrorId = React.useId();

  // `challenge` is the semantic name for the typed token (an org slug); `confirmPhrase` is the
  // back-compat alias. Either enables the same type-to-confirm friction.
  const phrase = confirmPhrase ?? challenge;
  const needsPhrase = phrase != null && phrase.length > 0;
  const phraseMatches = !needsPhrase || typed === phrase;
  const effectiveVariant = needsPhrase ? "destructive" : variant;
  const headerTone: ToneProp = effectiveVariant === "destructive" ? "destructive" : "default";
  const resolvedConfirm = confirmLabel ?? (needsPhrase ? t("common.delete") : t("common.continue"));
  const resolvedCancel = cancelLabel ?? t("common.cancel");
  const busy = pending || verifying;
  const confirmLabelText = verifying
    ? t("feedback.alert.verifying")
    : pending
      ? t("common.working")
      : resolvedConfirm;

  const reset = () => {
    setTyped("");
    setVerifying(false);
    setStepUpFailed(false);
  };

  const handleOpenChange = (next: boolean) => {
    reset();
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (!phraseMatches || busy) return;
    void (async () => {
      if (stepUp) {
        setStepUpFailed(false);
        setVerifying(true);
        // Both the try and the catch assign, so an initialiser here is dead.
        let ok: boolean;
        try {
          ok = await stepUp();
        } catch {
          ok = false;
        }
        setVerifying(false);
        if (!ok) {
          setStepUpFailed(true);
          return;
        }
      }
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
          <DialogHeader tone={headerTone}>
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
              {/* No size class: `Label` already ships `text-sm` in its own variant, so the local
                  copy was an exact duplicate at the same specificity. */}
              <Label htmlFor={inputId}>{t("common.typeToConfirm", { phrase })}</Label>
              <Input
                id={inputId}
                value={typed}
                onChange={(e) => {
                  setTyped(e.target.value);
                }}
                autoComplete="off"
                spellCheck={false}
                placeholder={phrase}
                aria-required="true"
                disabled={busy}
              />
            </div>
          )}

          {stepUpFailed && (
            <p id={stepErrorId} role="alert" className="ui-dialog-step-up-error">
              {t("feedback.alert.stepUpFailed")}
            </p>
          )}

          <DialogFooter>
            <DialogCancel asChild>
              <Button variant="ghost" disabled={busy}>
                {resolvedCancel}
              </Button>
            </DialogCancel>
            <Button
              variant={effectiveVariant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={busy || !phraseMatches}
              aria-describedby={stepUpFailed ? stepErrorId : undefined}
            >
              {confirmLabelText}
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
  AlertDialogRoot,
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
