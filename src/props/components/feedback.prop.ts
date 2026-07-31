/** Feedback component prop types — @see docs/COMPONENTS.md#feedback */
import type * as React from "react";
import type { QueryErrorCategory } from "../../lib/query-error";
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
  /** Semantic alias of `confirmPhrase` — the exact token to type (e.g. an org slug) to arm confirm. */
  challenge?: string;
  onConfirm: HandlerProp;
  /** Optional step-up re-auth gate (passkey/2FA); must resolve truthy before `onConfirm` fires. */
  stepUp?: () => Promise<boolean> | boolean;
  keepOpenOnConfirm?: boolean;
  pending?: PendingProp;
};

/** @see Alert */
export type AlertQueryErrorProp = {
  error: unknown;
  /** Override the auto-classified cause. When omitted, the error is classified via `classifyQueryError`. */
  category?: QueryErrorCategory;
  /** Retry affordance — only shown for causes where retrying is meaningful (transient/network/5xx). */
  onRetry?: HandlerProp;
  /** Recovery for `auth` (401/expired token): renew the session or sign in again. Replaces Retry. */
  onAuthAction?: HandlerProp;
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

/**
 * @see SheetContent — responsive drawer / detail-panel presentation contract.
 *
 * - `"side"` (default) — always the physical `side` panel the consumer named. Today's behaviour.
 * - `"auto"` — desktop side panel above `--sheet-responsive-breakpoint-width`, mobile bottom sheet
 *   at and below it. The breakpoint is a token, so a service moves the line once for every overlay.
 * - `"bottom"` — always the mobile bottom-sheet presentation (deterministic embedded surfaces,
 *   component tests, and composites that already decided they are on a compact viewport).
 */
export type SheetResponsiveProp = "auto" | "side" | "bottom";

/** @see SkeletonRows */
export type SkeletonRowsProp = {
  rows?: number;
  columns?: number;
};
