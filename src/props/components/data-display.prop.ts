/** Data Display component prop types — @see docs/COMPONENTS.md#data-display */
import type * as React from "react";
import type {
  ActionProp,
  ClassNameProp,
  DescriptionProp,
  IconProp,
  TitleProp,
  ColumnDefProp,
  GetRowIdProp,
  OnRowClickProp,
  OnSelectChangeProp,
  OnSortChangeProp,
  OnTableDensityChangeProp,
  SelectedIdsProp,
  SortStateProp,
  TableDensityProp,
  ChildrenProp,
  ToneProp,
  HeadingLevelProp,
  SizeProp,
  LabelProp,
  IdProp,
} from "../vocabulary";

/** @see EmptyState */
/**
 * Semantic intent of the EmptyState icon medallion — a subset of the shared `ToneProp` vocabulary
 * (no `default`/`neutral`; `destructive` is the DS name for a "danger" state). Drives the
 * `--empty-state-icon-foreground` / `--empty-state-icon-tint` role tokens.
 */
export type EmptyStateToneProp = Extract<
  ToneProp,
  "muted" | "success" | "warning" | "destructive" | "info"
>;

export type EmptyStateProp = {
  icon?: IconProp;
  title: TitleProp;
  description?: DescriptionProp;
  action?: ActionProp;
  /** Visual weight appropriate to the empty condition. Default `page`. */
  variant?: "page" | "section" | "compact";
  /**
   * Medallion colour intent. Default `muted` (the neutral placeholder look). Set `success` for a
   * confirmation zero-state (e.g. device approved), or `warning`/`destructive`/`info` to match the
   * condition — tints the icon foreground + medallion fill from the matching role token, so a
   * consumer never hand-rolls a `.ui-success-state` class to recolour it.
   */
  tone?: EmptyStateToneProp;
  /**
   * Semantic heading level (`h1`–`h4`) for the title. Default `3`. Choose it to
   * keep the page outline valid (`h1 → h2 → h3`, no skipped levels), NOT for
   * visual size — the title size is fixed by `--empty-state` styles regardless
   * of level. A page/onboarding empty state directly under a page `h1` uses
   * `titleLevel={2}`; an empty state nested in an already-`h2` section uses `3`.
   */
  titleLevel?: HeadingLevelProp;
  /**
   * Render the title as a non-heading element (`p` / `div`) instead of a
   * heading. Use for a `compact`/`section` empty state placed inside a section
   * that already owns its heading, so the zero-state message is not announced as
   * a heading and cannot skip an outline level. Overrides `titleLevel`.
   */
  titleAs?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  className?: ClassNameProp;
};

/** @see Descriptions */
export type DescriptionsProp = {
  items: DescriptionsItemProp[];
  columns?: 1 | 2 | 3;
  className?: ClassNameProp;
};

export type DescriptionsItemProp = {
  label: React.ReactNode;
  value: React.ReactNode;
  mono?: boolean;
};

/** @see Badge */
export type BadgeProp = {
  variant?: "default" | "secondary" | "outline";
  /** Status tones plus a brand `primary` tone (soft brand pill); solid brand = `variant="default"`. */
  tone?: ToneProp | "primary";
  status?: string;
  icon?: React.ComponentType<{ className?: string }> | null;
  className?: ClassNameProp;
  children?: ChildrenProp;
};

/** @see CredentialReveal */
/**
 * Severity of the one-time-secret caution banner — a subset of the shared `ToneProp`
 * vocabulary that carries a caution/danger/informational meaning (no `default`/`success`/
 * `muted`/`neutral`, which would read as "safe"). Drives the composed `Alert` tone.
 */
export type CredentialRevealTone = Extract<ToneProp, "warning" | "destructive" | "info">;

/** @see CredentialReveal */
export type CredentialRevealProp = {
  /** The one-time secret value shown masked by default and copied verbatim. */
  secret: string;
  /**
   * Accessible name / caption for the secret (e.g. "API key", "デバイス資格情報"). When set it labels
   * the secret region; when omitted a generic localized label is used.
   */
  label?: LabelProp;
  /**
   * Caution banner copy. Defaults to the localized "shown only once" warning. Pass `null` to
   * suppress the banner entirely (e.g. when the surrounding Dialog already carries the caution).
   */
  warning?: React.ReactNode | null;
  /** Controlled reveal state (masked ↔ shown). */
  revealed?: boolean;
  /** Uncontrolled initial reveal state. Default `false` (masked). */
  defaultRevealed?: boolean;
  /** Reveal-state change handler (fires on the show/hide toggle). */
  onRevealedChange?: (revealed: boolean) => void;
  /** Called after the secret is written to the clipboard. */
  onCopy?: (secret: string) => void;
  /**
   * When provided, renders a confirm/acknowledge button that calls this — pair it with the
   * surrounding Dialog's `onOpenChange(false)` so the secret re-blurs once dismissed.
   */
  onAcknowledge?: () => void;
  /** Label for the acknowledge button. Defaults to a localized "I've saved it". */
  acknowledgeLabel?: React.ReactNode;
  /** Offer a download-as-file button next to copy. Default `false`. */
  downloadable?: boolean;
  /** Filename for the downloaded secret. Default `"credential.txt"`. */
  downloadFileName?: string;
  /** Control size tier for the action buttons. Default `md`. */
  size?: SizeProp;
  /** Caution banner severity. Default `warning`. */
  tone?: CredentialRevealTone;
  className?: ClassNameProp;
  id?: IdProp;
  "aria-label"?: string;
};

/** @see QrCode */
export type QrCodeProp = {
  /** Sensitive or public value encoded locally into the QR modules. */
  value: string;
  /** Purpose-specific accessible name. The encoded value is never used as accessible text. */
  label: string;
  /** Natural display size. Default `md`. */
  size?: SizeProp;
  className?: ClassNameProp;
  id?: IdProp;
};

/** @see DataTable */
export type DataTableProp<T> = {
  data: T[];
  columns: ColumnDefProp<T>[];
  getRowId?: GetRowIdProp<T>;
  selectable?: boolean;
  selected?: SelectedIdsProp;
  onSelectChange?: OnSelectChangeProp;
  onRowClick?: OnRowClickProp<T>;
  density?: TableDensityProp;
  onDensityChange?: OnTableDensityChangeProp;
  sort?: SortStateProp;
  onSortChange?: OnSortChangeProp;
  loading?: boolean;
  empty?: React.ReactNode;
  className?: ClassNameProp;
  children?: ChildrenProp;
};
