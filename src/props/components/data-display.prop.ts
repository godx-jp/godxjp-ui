/** Data Display component prop types — @see docs/COMPONENTS.md#data-display */
import type * as React from "react";

/** @see CodeBlock — a block of preformatted text (request bodies, logs, snippets). */
export type CodeBlockProp = {
  /** The text. Pass a string; a highlighter's spans also work. */
  children?: ChildrenProp;
  /** Soft-wrap long lines (default true). `false` scrolls horizontally instead. */
  wrap?: boolean;
  /** Scroll inside the block past this height. Default `none` (grows with the content). */
  maxHeight?: "sm" | "md" | "lg" | "none";
  /** Type size. Default `sm`. */
  size?: Extract<SizeProp, "xs" | "sm">;
  /** Cosmetic: lands on `data-language`; no highlighter is bundled. */
  language?: string;
  className?: ClassNameProp;
};

/**
 * @see Prose — typography for rendered content (Markdown, CMS bodies). Styles descendant semantic
 * HTML from the tokens; it has no opinion about where the HTML comes from.
 */
export type ProseProp = {
  /** Body size. `md` is the page body size; `sm` is the compact step. Default `md`. */
  size?: Extract<SizeProp, "sm" | "md">;
  /** `fit` scales images to the column (default); `original` shows them at their authored size. */
  imageSize?: "fit" | "original";
  className?: ClassNameProp;
  children?: ChildrenProp;
};
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
  DescriptionsColumnProp,
  DescriptionsSpanProp,
  DescriptionsItemsProp,
  SortDirectionProp,
  OnColumnFilterChangeProp,
  OnRowProp,
  TableExpandableProp,
  TableRowSelectionProp,
  TableScrollProp,
  TableStickyProp,
  TableSummaryProp,
} from "../vocabulary";

/**
 * One key in a `Legend`: a tone, and the words that tone stands for.
 *
 * `label` is required and there is no way to omit it. That is the point of a key — colour alone
 * never carries meaning (WCAG 1.4.1), and a legend whose entries could be wordless would be a
 * component that lets a caller build the exact failure it exists to prevent.
 */
export type LegendItemProp = {
  /** The tone this key explains — the SAME tone the marks it stands for are drawn in. */
  tone: ToneProp;
  label: LabelProp;
};

/** @see Legend — the key for a colour-coded surface: a breakdown bar, a chart, a status column. */
export type LegendProp = Omit<React.HTMLAttributes<HTMLUListElement>, "children"> & {
  items: LegendItemProp[];
  className?: ClassNameProp;
};

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
  /** Medallion colour intent. Default `muted` (the neutral placeholder look). */
  tone?: EmptyStateToneProp;
  /** Semantic heading level (`h1`–`h4`) for the title. Default `3`. */
  titleLevel?: HeadingLevelProp;
  /**
   * Render the title as a non-heading element (`p` / `div`) instead of a heading. Use for a
   * `compact`/`section` empty state placed inside a section that already owns its heading, so the
   * zero-state message is not announced as a heading and cannot skip an outline level.
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
  children?: React.ReactNode;
  /**
   * Column count. `1 | 2 | 3` keeps this library's own mobile-first ladder; any other number, or
   * antd's responsive `{ sm, md, lg, xl }` object, drives the token-published grid instead.
   */
  columns?: DescriptionsColumnProp;
  /** Label placement within each item. Default `vertical` (label over value). */
  layout?: DescriptionsLayoutProp;
  /** Label text alignment inside the label column. Applies only to `layout="horizontal"`. */
  labelAlign?: "start" | "end";
  /** Draw the grid as a bordered table with shaded label cells (antd `bordered`). */
  bordered?: boolean;
  /** Declarative items (antd `items`) — the alternative to composing `Descriptions.Item`. */
  items?: DescriptionsItemsProp;
  className?: ClassNameProp;
};

export type DescriptionsItemProp = {
  label: React.ReactNode;
  value: React.ReactNode;
  mono?: boolean;
  /** Columns this item occupies — number | `"filled"` | responsive object (antd `span`). */
  span?: DescriptionsSpanProp;
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
   * Never colour alone (WCAG 1.4.1): each value also has its own silhouette (filled · half-filled
   * · barred · hollow).
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
  /**
   * Render element — `div` (default) or `span` when the chip sits in a phrasing context where a
   * `<div>` is invalid HTML (inside a `<button>` rendered by TabsTrigger/PopoverTrigger/Button,
   * a `<label>`, a `<p>`). Swaps the tag only.
   */
  as?: "div" | "span";
  variant?: "default" | "secondary" | "outline";
  /** Status tones plus a brand `primary` tone (soft brand pill); solid brand = `variant="default"`. */
  tone?: ToneProp | "primary";
  /**
   * The entity's OWN colour (a status, an issue type, a tag) as a CSS colour —
   * DATA, not a semantic tone. Washed into `--badge-tint-surface` rather than
   * filled, because no foreground clears WCAG AA against every colour a picker
   * can produce. Wins over `tone` and over `variant`'s fill.
   */
  color?: string;
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
  /** Accessible name / caption for the secret (e.g. "API key", "デバイス資格情報"). */
  label?: LabelProp;
  /** Caution banner copy. Defaults to the localized "shown only once" warning. */
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
   * `true` = built-in localized message (with a retry when `onRetry` is given); any other node
   * replaces it. `false`/`undefined` = the read succeeded.
   */
  error?: React.ReactNode;
  /** `true` = built-in localized message with NO retry. Takes precedence over `error`. */
  denied?: React.ReactNode;
  /** Retry handler surfaced by the built-in `error` state. */
  onRetry?: HandlerProp;
  /**
   * `"default"` (the default) emits no attribute and matches no selector. Mark each column with
   * `priority` on its `ColumnDef`.
   */
  preset?: TablePresetProp;
  /**
   * Container step at which `preset="action-collection"` switches to the compact priority
   * measures. Default `"sm"`.
   */
  collapseBelow?: BreakpointProp;
  // ── antd 6.6.2 parity surface ──────────────────────────────────────────
  /** Full row-selection configuration (antd `rowSelection`). */
  rowSelection?: TableRowSelectionProp<T>;
  /** Expandable detail rows (antd `expandable`). */
  expandable?: TableExpandableProp<T>;
  /** Footer totals row, rendered in a real `<tfoot>` (antd `summary`). */
  summary?: TableSummaryProp<T>;
  /** Scroll envelope — `x` a minimum inline size, `y` a maximum body block size (antd `scroll`). */
  scroll?: TableScrollProp;
  /** Sticky header; the object form carries `offsetHeader` (antd `sticky`). */
  sticky?: TableStickyProp;
  /** Per-row DOM props merged onto the `<tr>` (antd `onRow`). */
  onRow?: OnRowProp<T>;
  /** Outer frame + vertical rules between columns (antd `bordered`). */
  bordered?: boolean;
  /** Explain the next sort step in a tooltip on sortable headers (antd `showSorterTooltip`). */
  showSorterTooltip?: boolean;
  /** Table-wide sort cycle; a column's own `sortDirections` wins (antd `sortDirections`). */
  sortDirections?: SortDirectionProp[];
  /** Column filters changed — pair with a column's `filteredValue` for server filtering. */
  onFilterChange?: OnColumnFilterChangeProp;
  className?: ClassNameProp;
  children?: ChildrenProp;
};

/**
 * A ListRow-LOCAL subset of the shared density vocabulary: the row has no `comfortable` step, so
 * it is deliberately narrower than `DensityProp` (and unrelated to
 * `PageDensityProp`/`TableDensityProp`).
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
  overflow?: "truncate" | "wrap";
  density?: ListRowDensityProp;
  unread?: boolean;
  className?: ClassNameProp;
};

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
   * matrix is the canonical read-only ✓/— grid.
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
  error?: React.ReactNode;
  /** Permission-denied state — refused, not failed. Takes precedence over `error`. */
  denied?: React.ReactNode;
  /** Retry handler for the built-in `error` state; omit to hide the retry action. */
  onRetry?: HandlerProp;
  className?: ClassNameProp;
  id?: IdProp;
};

/**
 * This is the default and is exactly the behaviour a ScrollArea has always had. - `bottom` — a
 * live stream (chat, log tail, streaming response, activity feed).
 */
export type ScrollAreaAnchorProp = "none" | "bottom";

/** @see ScrollArea */
export type ScrollAreaProp = {
  /**
   * Ref to the element that actually SCROLLS — the Radix viewport — not the root. The root is
   * `overflow: hidden` and never scrolls, so the component's own `ref` cannot serve.
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

/**
 * @see TimelineGrid — one COLUMN of the grid (a day, a room, a machine). The label names the
 * column visually AND names the column's event list for assistive technology.
 */
export type TimelineGridColumnProp = {
  /** Stable column id — the `columnId` an event points at. */
  id: string;
  /** Column head. Also the accessible name of that column's event list, so keep it text. */
  label: LabelProp;
  /** Secondary line under the head (a date, a capacity, a room number). */
  description?: DescriptionProp;
  /** Marks the column as "now" (today's column): it carries the tint and hosts the `now` marker. */
  current?: boolean;
};

/**
 * @see TimelineGrid — one event BLOCK. `start`/`end` are clock times in the column's own day,
 * `"HH:MM"` 24-hour (`"24:00"` = end of day). An `end` at or before `start` continues into the
 * next day (22:00–06:00), and the block is drawn to the end of the window and marked clipped.
 */
export type TimelineGridEventProp = {
  /** Stable event id — the React key, and the `data-event-id` on the block. */
  id: string;
  /** Id of the column this event belongs to. An event pointing at no column is not drawn. */
  columnId: string;
  /** Start clock time, `"HH:MM"`. */
  start: string;
  /** End clock time, `"HH:MM"`. At or before `start` = continues into the next day. */
  end: string;
  /** Block title. The block also renders the time range as text, so the range is never colour or position alone. */
  title: TitleProp;
  /** Secondary line inside the block (who is on the shift, a room, a customer). */
  description?: DescriptionProp;
  /** The record's own colour, washed exactly like `Badge color` — decorative, never the only signal. */
  color?: string;
};

/** @see TimelineGrid */
export type TimelineGridProp = {
  /**
   * Accessible name of the grid. Required, and a plain `string`: the grid is a focusable scroll
   * region, so its name has to survive as an `aria-label`.
   */
  label: Extract<LabelProp, string>;
  /** Columns in render order. */
  columns: readonly TimelineGridColumnProp[];
  /** Events in any order; the grid sorts each column by start time and lays overlaps out side by side. */
  events: readonly TimelineGridEventProp[];
  /** First clock time on the axis, `"HH:MM"`. Defaults to the earliest event, on the hour. */
  start?: string;
  /** Last clock time on the axis, `"HH:MM"`. Defaults to the latest event, on the hour. */
  end?: string;
  /** Hours between hour rules and axis labels. Default `1`. */
  interval?: number;
  /** Current clock time, `"HH:MM"`. Draws the now marker in the columns marked `current`. */
  now?: string;
  /** Block click handler. Its PRESENCE turns every block into a real `button`. */
  onEventSelect?: (event: TimelineGridEventProp) => void;
  className?: ClassNameProp;
  id?: IdProp;
};
