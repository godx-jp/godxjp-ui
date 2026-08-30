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
  TablePresetProp,
  BreakpointProp,
  DensityProp,
  ChildrenProp,
  ToneProp,
  AvatarShapeProp,
  HeadingLevelProp,
  HandlerProp,
  SizeProp,
  LabelProp,
  IdProp,
  DescriptionsLayoutProp,
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

/**
 * @see Descriptions — composed with `Descriptions.Item` CHILDREN, not an `items` array.
 * This type had drifted from the component (it described a long-gone items-based API and was
 * missing `layout`/`labelAlign` entirely, which the generated manifest already listed).
 */
export type DescriptionsProp = {
  /** `Descriptions.Item` children — one label/value pair each. */
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  /** Label placement within each item. Default `vertical` (label over value). */
  layout?: DescriptionsLayoutProp;
  /** Label text alignment inside the label column. Applies only to `layout="horizontal"`. */
  labelAlign?: "start" | "end";
  className?: ClassNameProp;
};

export type DescriptionsItemProp = {
  label: React.ReactNode;
  value: React.ReactNode;
  mono?: boolean;
};

/**
 * @see Avatar
 *
 * Identity mark. `shape` is the ONLY appearance knob: the default `circle` is the person avatar
 * (unchanged — an existing `<Avatar>` renders identically), `square` is the entity-header
 * organization / service mark (compact rounded square on the brand surface). Every value it
 * paints — radius, box size, fill, glyph colour — comes from the `--avatar-square-*` component
 * tokens (cardinal rule #45), so a service retunes the entity mark once in its theme instead of
 * overriding `className` per call site.
 */
export type AvatarProp = React.ComponentPropsWithoutRef<"span"> & {
  shape?: AvatarShapeProp;
  appearance?: AvatarAppearanceProp;
  /**
   * Presence — WHO is reachable right now, drawn as an indicator at the block-end/inline-end
   * corner of the mark with a localized `sr-only` label folded into the avatar's accessible text.
   * Never colour alone (WCAG 1.4.1): each value also has its own silhouette (filled · half-filled ·
   * barred · hollow).
   *
   * OMIT the prop entirely for an entity that has no presence concept (an organization mark, a
   * capability medallion) — an absent prop emits no node and no attribute, so the DOM stays
   * byte-identical to today's. Pass `"offline"` for a person KNOWN to be unreachable; that is a
   * different statement, exactly as `ListRow`'s omitted vs `false` `unread` is.
   */
  presence?: AvatarPresenceProp;
  /**
   * Override the localized presence text (`t("dataDisplay.avatar.presence.online")` …) when the
   * product has a more precise phrasing ("In a meeting until 15:00"). Visually hidden either way —
   * a presence dot never carries visible text; that is `Badge status`.
   */
  presenceLabel?: LabelProp;
  className?: ClassNameProp;
  children?: ChildrenProp;
};

/**
 * Avatar presence status — a person's realtime reachability.
 *
 * A DELIBERATELY separate vocabulary from the lifecycle `BadgeStatusProp`: presence is volatile,
 * per-person and pushed over a socket, while a lifecycle status is a record's state and renders as
 * a labelled chip. Each value is encoded twice over — a semantic role colour AND a shape — so the
 * four are told apart in greyscale, by a deuteranope and under forced colors:
 *
 * - `"online"` — filled disc (`--success`).
 * - `"away"` — half-filled disc (`--warning`).
 * - `"busy"` — filled disc cut by a horizontal bar, the do-not-disturb mark (`--destructive`).
 * - `"offline"` — hollow ring (`--muted-foreground`).
 *
 * Retune every constant with `--avatar-presence-*`.
 *
 * @see Avatar
 */
export type AvatarPresenceProp = "online" | "away" | "busy" | "offline";

/**
 * Avatar fill treatment.
 *
 * - `"default"` — the identity fill: `--muted` for a person, the solid brand mark for
 *   `shape="square"`.
 * - `"tinted"` — the **capability medallion**: a soft role wash behind a role-coloured glyph.
 *   This is the plate a capability/feature icon sits on (`shape="square" appearance="tinted"` for
 *   the canonical rounded square). It exists because the medallion is a composition — `Avatar` +
 *   a Lucide glyph, per docs/COMPOSITION-VS-COMPONENT.md — but its *tint* was not reachable from
 *   a token, so consumers were re-deriving `hsl(var(--primary) / 0.1)` in page CSS or giving up
 *   and rendering a bare glyph. Retune with `--avatar-tinted-*`.
 *
 * @see Avatar
 */
export type AvatarAppearanceProp = "default" | "tinted";

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
  /**
   * Failure state (#216). `true` = built-in localized message (with a retry when `onRetry` is
   * given); any other node replaces it. `false`/`undefined` = the read succeeded.
   */
  error?: React.ReactNode;
  /**
   * Permission-denied state (#216) — refused, not failed. `true` = built-in localized message
   * with NO retry. Takes precedence over `error`.
   */
  denied?: React.ReactNode;
  /** Retry handler surfaced by the built-in `error` state. */
  onRetry?: HandlerProp;
  /**
   * Named collection contract (gh#253) — the SAME preset the `Table` primitive owns, forwarded to
   * the table DataTable renders. `"default"` (the default) emits no attribute and matches no
   * selector. `"action-collection"` is the canonical dense approval / action queue: below
   * `collapseBelow` the desktop intrinsic column widths give way to the token-owned column-PRIORITY
   * measures (`--table-action-collection-*`) under `table-layout: fixed`, cells wrap, and the
   * surface drops its `--table-surface-min-inline-size` floor — so every column, row actions
   * included, stays inside a 390px frame with no horizontal scroll. Mark each column with
   * `priority` on its `ColumnDef`.
   */
  preset?: TablePresetProp;
  /**
   * Container step at which `preset="action-collection"` switches to the compact priority measures.
   * Measured against the TABLE's own container (a container query), not the viewport, so a table in
   * a master rail collapses before the page does. Default `"sm"`. Ignored while `preset` is
   * `"default"`.
   */
  collapseBelow?: BreakpointProp;
  className?: ClassNameProp;
  children?: ChildrenProp;
};

/**
 * ListRow geometry — `default` (the roomy entity row) or `compact` (#246: the inline-actions row —
 * Avatar + title/description + one or two small trailing Buttons on ONE line inside a narrow card).
 * A ListRow-LOCAL subset of the shared density vocabulary: the row has no `comfortable` step, so it
 * is deliberately narrower than `DensityProp` (and unrelated to `PageDensityProp`/`TableDensityProp`).
 */
export type ListRowDensityProp = Exclude<DensityProp, "comfortable">;

/** @see ListRow */
export type ListRowProp = {
  /** Render element — `div` (default) or `li` when the parent is a `<ul>`/`<ol>`. */
  as?: "div" | "li";
  /** Leading slot — a decorative icon or an Avatar. Mark a purely decorative icon `aria-hidden`. */
  leading?: React.ReactNode;
  /** Primary line — rendered in medium weight. */
  title: TitleProp | React.ReactNode;
  /** Secondary line under the title (muted, xs). */
  description?: DescriptionProp | React.ReactNode;
  /** Trailing slot — the row action(s): a Button / DropdownMenu trigger, a Badge, or a Switch. */
  trailing?: React.ReactNode;
  /** Cross-axis alignment of the columns — `center` (default) or `start` for multi-line content. */
  align?: "center" | "start";
  /** How over-long title/description resolve — `truncate` (default) or `wrap` (#224). */
  overflow?: "truncate" | "wrap";
  /** Row geometry — `default` or the compact inline-actions preset (#246). */
  density?: ListRowDensityProp;
  /** Read/unread state — indicator dot + localized `sr-only` text, never colour alone (#225). */
  unread?: boolean;
  className?: ClassNameProp;
};

// ─── PermissionMatrix (gh#257 / DXS platform#311) ────────────────────────────────────────────────

/** @see PermissionMatrix — one role COLUMN. Domain data is consumer-supplied; nothing is encoded. */
export type PermissionMatrixRoleProp = {
  /** Stable role id — the `roleId` half of a grant key. */
  id: string;
  /** Human role name (also used in accessible cell labels, so a plain string). */
  name: string;
  /** Short hint under the role name (e.g. member count or scope). */
  description?: string;
  /** A locked role renders read-only cells even when the matrix is editable. */
  locked?: boolean;
};

/** @see PermissionMatrix — one permission ROW. */
export type PermissionMatrixPermissionProp = {
  /** Stable permission id — the `permissionId` half of a grant key. */
  id: string;
  /** Human permission name (also used in accessible cell labels, so a plain string). */
  name: string;
  /** Secondary line under the permission name. */
  description?: string;
  /** Optional category caption rendered with the description (e.g. 請求 / レポート). */
  group?: string;
};

/**
 * @see PermissionMatrix — the grant relation. Either the `grantKey(roleId, permissionId)` `Set`
 * from `@godxjp/ui/lib/permission-grid` (O(1), the canonical form) or a plain pair array, which the
 * matrix normalizes through the same `grantKey` encoding.
 */
export type PermissionMatrixGrantsProp =
  ReadonlySet<string> | readonly { roleId: string; permissionId: string }[];

/** @see PermissionMatrix */
export type PermissionMatrixProp = {
  /** Role columns, in render order. */
  roles: readonly PermissionMatrixRoleProp[];
  /** Permission rows, in render order. */
  permissions: readonly PermissionMatrixPermissionProp[];
  /** The grant relation (see {@link PermissionMatrixGrantsProp}). */
  grants: PermissionMatrixGrantsProp;
  /**
   * Grant toggle handler. Its PRESENCE makes the matrix editable (checkbox cells); omitted, the
   * matrix is the canonical read-only ✓/— grid. Locked roles and `readOnly` stay read-only
   * regardless.
   */
  onGrantChange?: (roleId: string, permissionId: string, granted: boolean) => void;
  /** Force the read-only grid even when `onGrantChange` is present (e.g. viewer permission). */
  readOnly?: boolean;
  /** Two role ids to compare side by side; highlights their columns and the differing rows. */
  compare?: readonly [string, string] | null;
  /** With `compare`, keep only the rows on which the two roles differ (差分のみ). */
  diffOnly?: boolean;
  /** Accessible name for the grid. Defaults to the localized caption. */
  label?: LabelProp;
  /** Show the loading skeleton instead of the grid. Precedence: loading → denied → error → empty. */
  loading?: boolean;
  /** Custom empty content when `permissions` is empty; defaults to a localized EmptyState. */
  empty?: React.ReactNode;
  /** Failure state (mirrors DataTable #216): `true` = built-in localized message, node = replace. */
  error?: React.ReactNode;
  /** Permission-denied state — refused, not failed. Takes precedence over `error`. */
  denied?: React.ReactNode;
  /** Retry handler for the built-in `error` state; omit to hide the retry action. */
  onRetry?: HandlerProp;
  className?: ClassNameProp;
  id?: IdProp;
};

/**
 * Edge the ScrollArea viewport sticks to as its content grows (gh#311).
 *
 * - `none` — the scroll offset is left entirely alone. This is the default and is exactly the
 *   behaviour a ScrollArea has always had.
 * - `bottom` — a live stream (chat, log tail, streaming response, activity feed). While the reader
 *   is within `anchorOffset` of the bottom, arriving content keeps the newest item in view; once
 *   they scroll away to read history, growth NEVER moves them, and content inserted ABOVE the
 *   read position is compensated so the item under their eyes stays put.
 */
export type ScrollAreaAnchorProp = "none" | "bottom";

/** @see ScrollArea */
export type ScrollAreaProp = {
  /**
   * Ref to the element that actually SCROLLS — the Radix viewport — not the root. The root is
   * `overflow: hidden` and never scrolls, so the component's own `ref` cannot serve. Use this to
   * read `scrollTop`/`scrollHeight`, call `scrollTo()`, restore a saved position, or drive a
   * "jump to newest" button. It is the typed, supported alternative to querying the Radix-internal
   * `[data-radix-scroll-area-viewport]` attribute, which is not a public contract and is ambiguous
   * the moment two ScrollAreas nest.
   */
  viewportRef?: React.Ref<HTMLDivElement>;
  /** Edge the viewport sticks to as content grows. Default `none` (inert). */
  anchor?: ScrollAreaAnchorProp;
  /**
   * Distance in px from the bottom edge inside which the reader still counts as "at the bottom"
   * for `anchor="bottom"`. Defaults to the `--scroll-area-anchor-offset` token (3rem), read off
   * the element at mount so a theme — or a `[data-tenant]` scope — moves it globally.
   */
  anchorOffset?: number;
  /**
   * Fires when the pinned state flips: `false` when the reader scrolls away from the bottom,
   * `true` when they come back inside `anchorOffset`. Render a focusable "jump to newest" button
   * from it — anchoring must never be the only route back to new content.
   */
  onAnchoredChange?: (anchored: boolean) => void;
};
