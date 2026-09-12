/** Feedback component prop types — @see docs/COMPONENTS.md#feedback */
import type * as React from "react";
import type { QueryErrorCategory } from "../../lib/query-error";
import type {
  AlertVariantProp,
  AvatarShapeProp,
  CancelLabelProp,
  ChildrenProp,
  ClassNameProp,
  ConfirmLabelProp,
  ConfirmVariantProp,
  DefaultOpenProp,
  DescriptionProp,
  HandlerProp,
  IconProp,
  OpenProp,
  OnOpenChangeProp,
  PendingProp,
  ShapeProp,
  SizeProp,
  ToneProp,
  TitleProp,
} from "../vocabulary";

/**
 * @see Dialog — the compound modal ROOT.
 *
 * `variant` is the one prop that answers gh#567: it decides the ARIA role, whether an
 * outside click dismisses, and the primary action's emphasis together, because those three
 * always travel together. Set it here to cover the whole tree, or on `DialogContent` for one
 * surface. `variant="destructive"` IS the 12 `AlertDialog*` exports, which stay for
 * compatibility — see the file header of `components/feedback/dialog.tsx`.
 */
export type DialogProp = {
  open?: OpenProp;
  defaultOpen?: DefaultOpenProp;
  onOpenChange?: OnOpenChangeProp;
  variant?: ConfirmVariantProp;
  /** Kept from Radix. RAC's `Modal` always locks scroll, so `false` no longer turns that off. */
  modal?: boolean;
  children?: ChildrenProp;
};

/**
 * @see DialogContent — the modal surface. `variant` overrides the root's for this surface and
 * is what actually resolves `role`, outside-click dismissal and the ✕ default.
 */
export type DialogContentProp = {
  variant?: ConfirmVariantProp;
  /** Show the corner ✕. Defaults to `true`, or `false` under `variant="destructive"`. */
  showCloseButton?: boolean;
  /** shadcn-era spelling of `showCloseButton`; kept working. */
  showClose?: boolean;
  /** Semantic class for the scrim the surface owns (RAC nests overlay → modal → dialog). */
  overlayClassName?: ClassNameProp;
  className?: ClassNameProp;
  children?: ChildrenProp;
};

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

/**
 * @see Banner — the full-bleed attention strip (`<Alert variant="banner">` with the variant fixed).
 * Same contract as {@link AlertProp} minus `variant`: `tone` owns colour + live-region politeness,
 * `icon`/`icon={false}` owns the leading glyph, `onDismiss` renders the built-in dismiss button.
 */
export type BannerProp = Omit<AlertProp, "variant">;

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

/**
 * The skeleton of a `Form columns={N}` — label + control PAIRS on the same grid the form uses,
 * not the flat line list `SkeletonRows` draws (gh#552).
 *
 * Why it is its own component rather than `SkeletonRows` with better defaults: `SkeletonRows` has
 * no idea a form field is two stacked things, so a consumer approximating one got the column count
 * right and the inside of every cell wrong. Worse, "close enough" is a thing that DRIFTS — change
 * the form's `columns` and forget the skeleton and the layout jumps again on load, with nothing
 * red to say so. Sharing `ResponsiveGrid` is what stops that: one `columns` value, one ladder.
 */
export type SkeletonFormProp = {
  /** Columns of the form this stands in for — passed straight to `ResponsiveGrid`. */
  columns?: number;
  /** How many label+control pairs to draw. */
  fields?: number;
  /** Shimmer, matching the rest of the family. */
  active?: boolean;
  className?: string;
};

/**
 * A skeleton line's MEASURE. `number` is read as pixels, matching antd's
 * `SkeletonParagraphProps["width"]` (components/skeleton/Paragraph.tsx); a string is any CSS length
 * or percentage. It reaches the DOM as the `--skeleton-line-width` custom property rather than a
 * raw `width`, so the line still resolves its own block size and radius from the token tier.
 */
export type SkeletonWidth = number | string;

/**
 * @see Skeleton — the placeholder BLOCK. Both fields are antd's, ported onto the block this
 * library already shipped rather than onto a second component beside it.
 */
export type SkeletonProp = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Swap the resting pulse for the travelling SHEEN (antd's `active`). antd's non-active skeleton
   * is fully static; this library's block has always pulsed, so the default is left alone and
   * `active` selects the louder of the two motions instead of turning motion on.
   */
  active?: boolean;
  /**
   * `false` renders `children` in place of the placeholder. An OMITTED `loading` still renders the
   * placeholder — antd's `loading || !("loading" in props)`.
   */
  loading?: boolean;
};

/** @see SkeletonAvatar */
export type SkeletonAvatarProp = {
  /** Box, from the `--control-height` tier — the same tier the real `Avatar` sizes from. */
  size?: SizeProp;
  shape?: AvatarShapeProp;
  active?: boolean;
  className?: ClassNameProp;
};

/** @see SkeletonButton */
export type SkeletonButtonProp = {
  size?: SizeProp;
  /** Corner, in `Button`'s own vocabulary: `pill` is antd's `shape="round"`. */
  shape?: ShapeProp;
  /** Fill the inline axis, for a button that spans its column (antd's `block`). */
  block?: boolean;
  active?: boolean;
  className?: ClassNameProp;
};

/** @see SkeletonInput */
export type SkeletonInputProp = {
  size?: SizeProp;
  block?: boolean;
  active?: boolean;
  className?: ClassNameProp;
};

/** @see SkeletonNode — a square standing in for a media/custom slot; `children` centres in it. */
export type SkeletonNodeProp = {
  active?: boolean;
  children?: ChildrenProp;
  className?: ClassNameProp;
};

/** @see SkeletonImage */
export type SkeletonImageProp = {
  active?: boolean;
  className?: ClassNameProp;
};

/**
 * @see SkeletonArticle — antd's own `<Skeleton>` shape (avatar + title + paragraph). It is a
 * SIBLING of `Skeleton`, not a replacement: `Skeleton` here is the block antd spells
 * `Skeleton.Node`, and re-pointing it at the article would change what every existing call site
 * renders.
 */
export type SkeletonArticleProp = {
  avatar?: boolean | Pick<SkeletonAvatarProp, "size" | "shape">;
  /** The heading line. NOT a string title — `false` drops the line, `{ width }` re-measures it. */
  title?: boolean | { width?: SkeletonWidth };
  /** `width` as an array measures each row; as a single value it measures the LAST row. */
  paragraph?: boolean | { rows?: number; width?: SkeletonWidth | SkeletonWidth[] };
  /** Pill corners on every line (antd's `round`, whose capsule radius is `--radius-pill` here). */
  round?: boolean;
  active?: boolean;
  loading?: boolean;
  children?: ChildrenProp;
  className?: ClassNameProp;
};
