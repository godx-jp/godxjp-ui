/** Feedback component prop types — @see docs/COMPONENTS.md#feedback */
import type * as React from "react";
import type {
  AlertVariantProp,
  CancelLabelProp,
  ChildrenProp,
  ClassNameProp,
  ConfirmLabelProp,
  ConfirmVariantProp,
  DescriptionProp,
  HandlerProp,
  IconProp,
  OpenProp,
  OnOpenChangeProp,
  PendingProp,
  ToneProp,
  TitleProp,
} from "../vocabulary";

/** @see AlertDialog */
export type AlertDialogProp = {
  open: OpenProp;
  onOpenChange: OnOpenChangeProp;
  title: TitleProp;
  description?: DescriptionProp;
  confirmLabel?: ConfirmLabelProp;
  cancelLabel?: CancelLabelProp;
  variant?: ConfirmVariantProp;
  /** Type-to-confirm friction — enables destructive flow (GitHub/Stripe style). */
  confirmPhrase?: string;
  onConfirm: HandlerProp;
  keepOpenOnConfirm?: boolean;
  pending?: PendingProp;
};

/** @see DialogConfirm — deprecated alias for AlertDialog. */
export type DialogConfirmProp = AlertDialogProp;

/** @see Alert */
export type AlertQueryErrorProp = {
  error: unknown;
  onRetry?: HandlerProp;
  className?: ClassNameProp;
};

/** @see Alert */
export type AlertProp = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariantProp;
  tone?: ToneProp;
  /** Pass `false` to hide the default variant icon. */
  icon?: IconProp | false;
  onDismiss?: HandlerProp;
  className?: ClassNameProp;
  children?: ChildrenProp;
};

/** @see AlertTitle */
export type AlertTitleProp = React.HTMLAttributes<HTMLParagraphElement> & {
  className?: ClassNameProp;
  children?: ChildrenProp;
};

/** @see AlertContent — groups title + description; pairs with {@link AlertActions}. */
export type AlertContentProp = React.HTMLAttributes<HTMLDivElement> & {
  className?: ClassNameProp;
  children?: ChildrenProp;
};

/** @see AlertDescription */
export type AlertDescriptionProp = React.HTMLAttributes<HTMLParagraphElement> & {
  className?: ClassNameProp;
  children?: ChildrenProp;
};

/** @see AlertActions */
export type AlertActionsProp = React.HTMLAttributes<HTMLDivElement> & {
  className?: ClassNameProp;
  children?: ChildrenProp;
};

/** @see SkeletonRows */
export type SkeletonRowsProp = {
  rows?: number;
  columns?: number;
};
