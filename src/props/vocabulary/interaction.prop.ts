/**
 * Interaction & visual variant prop types.
 * @see docs/PROPS-VOCABULARY.md#interaction-variants
 */
import type * as React from "react";

/**
 * Button visual style.
 *
 * `bare` (gh#404) is the control WITHOUT geometry: a real button — hitbox, focus ring, keyboard
 * semantics, `aria-label` — around content that already IS the shape (a `Badge`, a truncating
 * title). Every other variant loads a height and an inline inset from its `size`, so wrapping a
 * chip meant writing `className="h-auto p-0"`, an audit error with no legal replacement; `link`
 * was not it either, since it still loads a size class and adds primary colour plus a hover
 * underline. The 24×24 target WCAG 2.2 SC 2.5.8 requires is kept by a pseudo-element, so the box
 * stays exactly as big as its content.
 */
export type ButtonVariantProp =
  "default" | "destructive" | "outline" | "dashed" | "secondary" | "ghost" | "link" | "bare";

/**
 * Corner shape — maps to the radius tokens (default = control/component radius). Shared by Button
 * + Badge.
 */
export type ShapeProp = "default" | "pill" | "sharp";

/**
 * Avatar geometry — WHAT the mark represents, not just its corner radius, which is why it is a
 * separate vocabulary from the control `ShapeProp` (`default | pill | sharp`): an entity mark is a
 * ROUNDED rect, a value `ShapeProp` cannot express (its `sharp` = `--radius-sharp` = 0).
 * - `circle` (default) — a person: the fully-round `--radius-pill` identity avatar.
 * - `square` — an organization / service entity mark for an entity header: the compact rounded
 *   square on the brand surface (`--avatar-square-*` tokens).
 */
export type AvatarShapeProp = "circle" | "square";

/** Text size — steps of the golden-ratio type scale (NEVER an arbitrary px). `sm` = base. */
export type TextSizeProp = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/** Text colour intent — maps to semantic foreground tokens (no raw palette). */
export type TextToneProp =
  "default" | "muted" | "primary" | "success" | "warning" | "destructive" | "info";

/** Font weight — the reference-design canon is THREE weights only: `regular` (400 body), `medium` (500
 *  heading/label), `bold` (700 emphasis). 600/`semibold` is forbidden. */
export type FontWeightProp = "regular" | "medium" | "semibold" | "bold";

/** Heading level — drives both the `--heading-h*` size token and the semantic `<h1..h4>` element. */
export type HeadingLevelProp = 1 | 2 | 3 | 4;

/** Inline text alignment (logical, RTL-safe). */
export type TextAlignProp = "start" | "center" | "end";

/**
 * How a run of text treats the whitespace it was given.
 *
 * `normal` is CSS's own behaviour and the default: newlines and runs of spaces collapse. That is
 * right for a label and wrong for text a PERSON typed into a textarea — a plain-text note, a
 * pasted log, an issue description — where the line breaks and the indentation ARE content.
 *
 * `pre-wrap` keeps both and still wraps at the container's edge, so the block cannot force a
 * horizontal scrollbar the way `pre` would. It is a closed union rather than a boolean because the
 * remaining CSS keywords (`pre`, `pre-line`, `nowrap`) are values on the same axis, not more flags.
 */
export type TextWhitespaceProp = "normal" | "pre-wrap";

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * antd `Typography` parity — the vocabulary antd names, spelled antd's way.
 *
 * `docs/DESIGN-AUTHORITY.md`: "where antd names a capability, this library takes antd's name and
 * antd's semantics", read out of the INSTALLED types rather than from memory. These were read out
 * of **antd 6.6.3**, `es/typography/Base/index.d.ts` (`BaseType`, `CopyConfig`, `EditConfig`,
 * `EllipsisConfig`, `ActionsConfig`) in a throw-away checkout outside this repo — antd is NOT a
 * dependency here and `check:no-antd-runtime` keeps it out.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * antd `Typography` `type` — its four-value emphasis axis (`BaseType`).
 *
 * This library already publishes the same axis as `TextToneProp`, which is WIDER (it also carries
 * `default`, `primary` and `info`) and which every existing call site is written in. Both spellings
 * are accepted on `Text` / `Title` / `Paragraph` / `Link`; **`tone` WINS when both are passed**,
 * because `tone` is the vocabulary `check:prop-vocabulary` governs and the one the CSS keys on.
 * The fold is `secondary → muted`, `danger → destructive`, `success` / `warning` unchanged.
 */
export type TypographyTypeProp = "secondary" | "success" | "warning" | "danger";

/**
 * antd `Typography.Title` `level` — 1…5.
 *
 * `HeadingLevelProp` stops at 4 because `--heading-h4` is already 12.5px, BELOW the 14px body step.
 * antd's fifth level is carried here rather than widened into `HeadingLevelProp`, so `Heading` —
 * used across the package and at consumer call sites — keeps the four levels its tokens actually
 * define while `Title` reaches antd's five. Level 5 reads `--heading-h5`, which is bound to the
 * existing `--font-size-2xs` step (≈11.1px); it is not a new number.
 */
export type TitleLevelProp = 1 | 2 | 3 | 4 | 5;

/**
 * antd `CopyConfig` — the copy affordance beside a run of text.
 *
 * `format: "text/html"` reaches the real `ClipboardItem` path. `tooltips` takes `false` to suppress
 * the tooltip, one node for both states, or `[copy, copied]` for each.
 */
export type TypographyCopyConfigProp = {
  /** Text to copy. A function may be async — it is awaited. Defaults to the rendered children. */
  text?: string | (() => string | Promise<string>);
  /** Fired AFTER the write resolves. Never fired when the clipboard refuses — see the component. */
  onCopy?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  /** Icon node, or `[copy, copied]` for the two states. */
  icon?: React.ReactNode;
  /** Tooltip text: `false` suppresses it, a node replaces both, `[copy, copied]` sets each. */
  tooltips?: React.ReactNode;
  /** `text/html` also writes an HTML flavour to the clipboard. Default `text/plain`. */
  format?: "text/plain" | "text/html";
  /** Tab order of the copy button. */
  tabIndex?: number;
};

/** antd `EditConfig` — in-place editing of a run of text. */
export type TypographyEditConfigProp = {
  /** The value to edit. Falls back to the children when they are a plain string. */
  text?: string;
  /** Controlled editing state. */
  editing?: boolean;
  /** Icon node for the edit trigger. */
  icon?: React.ReactNode;
  /** Tooltip on the edit trigger; `false` suppresses it. */
  tooltip?: React.ReactNode;
  /** Fired when editing starts. */
  onStart?: () => void;
  /** Fired with the TRIMMED value when editing is confirmed (Enter, or blur). */
  onChange?: (value: string) => void;
  /** Fired when editing is abandoned (Escape). */
  onCancel?: () => void;
  /** Fired after Enter confirms — NOT after a blur, matching antd. */
  onEnd?: () => void;
  /** Character ceiling on the editing textarea. */
  maxLength?: number;
  /** Auto-grow the textarea. `true`, or `{ minRows, maxRows }`. Default `true`. */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /** What opens the editor: the icon, the text itself, or both. Default `["icon"]`. */
  triggerType?: ("icon" | "text")[];
  /** Node shown in the editor's corner; `null` removes it. */
  enterIcon?: React.ReactNode;
  /** Tab order of the edit button. */
  tabIndex?: number;
};

/**
 * antd `EllipsisConfig` — the truncation contract.
 *
 * `Text` already carries this library's own `truncate` (one line) and `clamp` (N lines). All three
 * spellings are accepted and **`ellipsis` WINS** when they collide, because it is the only one that
 * can carry an expand control, a suffix or a tooltip.
 */
export type TypographyEllipsisConfigProp = {
  /** Lines kept before truncating. Default 1. */
  rows?: number;
  /** Show an expand control. `"collapsible"` also keeps a collapse control once expanded. */
  expandable?: boolean | "collapsible";
  /** Text pinned AFTER the ellipsis (a unit, a count). */
  suffix?: string;
  /** The expand/collapse label — a node, or a function of the current state. */
  symbol?: React.ReactNode | ((expanded: boolean) => React.ReactNode);
  /** Uncontrolled initial expanded state. */
  defaultExpanded?: boolean;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Fired when the expand/collapse control is used. */
  onExpand?: (e: React.MouseEvent<HTMLElement>, info: { expanded: boolean }) => void;
  /** Fired when the measured overflow state flips. */
  onEllipsis?: (ellipsis: boolean) => void;
  /** Tooltip carrying the full text while it is truncated. `true` uses the children. */
  tooltip?: React.ReactNode;
};

/**
 * antd `ActionsConfig` — which side of the text the copy / edit / expand cluster sits on.
 *
 * The name is antd's. `PROP_ALIASES_FORBIDDEN` reserves the bare word `actions` for a ReactNode
 * SLOT (`ActionsProp`, toolbars); this is not that — it is a placement config for controls the
 * component renders itself, and antd's spelling wins per DESIGN-AUTHORITY's prop-surface rule.
 * `start` / `end` are logical, so they mirror in RTL.
 */
export type TypographyActionsConfigProp = {
  placement?: "start" | "end";
};

/** Badge visual style. */
export type BadgeVariantProp = "default" | "secondary" | "outline" | "dashed";

/**
 * AppSettingPicker trigger presentation.
 * - `labeled` (default) — the leading icon + the selected value inside a full-width control
 *   (settings forms, preference panels).
 * - `icon` — a square, icon-only utility trigger (e.g. a topbar globe locale switcher). It
 *   STRUCTURALLY drops the value text and the picker's owned trigger width, keeping the localized
 *   `aria-label`, focus ring, keyboard behaviour and a `--control-height` tap target (which is
 *   ≥44px on coarse/touch pointers per Rule #24) — so consumers never hide internal nodes via CSS.
 * - `bar` — the same structural drops as `icon`, re-shaped as a CELL OF THE BAR rather than a
 *   control dropped into it: it fills the bar's height and squares its corners, so the hover
 *   surface paints the whole strip. Reach for it in a `Topbar` slot or AppShell's own bar, where
 *   `icon` leaves a --control-height pill floating in a taller strip and reads as a different
 *   control family from the bar's own chrome (`TopbarItem`).
 */
export type AppSettingPickerAppearanceProp = "labeled" | "icon" | "bar" | "inline";

/**
 * AppSettingToggle presentation. The toggle has no menu, so it has no `labeled`/`inline` form —
 * the two members here are the two BOXES a one-tap cycler can take.
 * - `bar` (default) — a CELL of the bar (`TopbarItem`): full bar height, the bar's own hover
 *   surface, square corners (`--topbar-item-radius`). This is the canonical placement, which is
 *   why it is the default: a toggle exists for a top bar.
 * - `icon` — a square `--control-height` ghost button for everywhere that is NOT a bar (a
 *   settings row, a card header). In a taller bar this leaves a pill floating mid-strip, which is
 *   the defect `bar` exists to avoid.
 */
export type AppSettingToggleAppearanceProp = "bar" | "icon";

/** Button size preset. */
export type SizeProp = "xs" | "sm" | "md" | "lg";

/** Button size preset; icon-only sizes are a documented Button subset. */
export type ButtonSizeProp = SizeProp | "default" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

/**
 * Validation state a data-entry control PAINTS — Ant Design's `status` axis, which
 * docs/DESIGN-AUTHORITY.md names the taxonomy authority for this library.
 *
 * Two members, not antd's five. `error` and `warning` are the two antd paints from the prop alone;
 * `success` and `validating` are only ever drawn together with antd's `hasFeedback` icon slot,
 * which this library does not have (FormField owns the message and the icon), and `""` is antd's
 * way of spelling "no status" in a required field — `undefined` already says that here.
 *
 * `error` and `aria-invalid` are the same state seen from two sides: a control given
 * `status="error"` also reports `aria-invalid`, so the paint and the announcement can never drift.
 * `warning` deliberately does NOT set `aria-invalid` — a warning is not a validity failure, and
 * antd does not announce one either.
 */
export type ControlStatusProp = "error" | "warning";

/**
 * How much chrome a data-entry control draws — Ant Design's `variant` axis.
 * - `outlined` (default) — the historical field: boundary, surface and resting shadow.
 * - `filled` — no boundary at rest, a tinted surface instead; the dense-form treatment.
 * - `borderless` — neither boundary nor surface, for a field embedded in a box that already draws
 *   one (a composer inside a Card, an inline edit cell).
 *
 * antd's fourth member `underlined` is deliberately absent — see docs/DESIGN-AUTHORITY.md: a
 * single bottom rule is a Material convention, and SmartHR (the Japanese-UI authority here) draws
 * every form field as a full box.
 */
export type ControlVariantProp = "outlined" | "filled" | "borderless";

/** Form layout — label position relative to its control (Ant-style). */
export type FormLayoutProp = "vertical" | "horizontal" | "inline";

/** Descriptions layout — label over value (`vertical`) or beside it (`horizontal`); the
 *  `FormLayoutProp` subset that a metadata grid supports (no `inline`). */
export type DescriptionsLayoutProp = Extract<FormLayoutProp, "vertical" | "horizontal">;

/** Responsive breakpoint name (mobile-first); used by `collapseBelow` etc. */
export type BreakpointProp = "sm" | "md" | "lg" | "xl";

/** Dialog confirm button emphasis. */
export type ConfirmVariantProp = "default" | "destructive";

/** Semantic color/status intent. */
export type ToneProp =
  "default" | "success" | "warning" | "destructive" | "info" | "muted" | "neutral";

/**
 * Alert STRUCTURAL axis (orthogonal to `tone`, which owns colour/semantics):
 * `default` — the inline card (rounded, framed on all sides);
 * `banner` — the full-bleed page/shell attention strip the `Banner` export renders
 * (square corners, hairline block-end rule only, `--banner-*` token geometry).
 */
export type AlertVariantProp = "default" | "banner";

/** Sort direction for table columns. */
export type SortDirectionProp = "asc" | "desc";

/** Table column text alignment. */
export type ColumnAlignProp = "left" | "center" | "right";

/** Active sort state on DataTable. */
export type SortStateProp = { key: string; direction: SortDirectionProp };

/**
 * Entrance-stagger ordinal for `Reveal` — an INDEX into the motion ladder, never a raw ms. `0` =
 * enter immediately; `1..6` each add one `--reveal-stagger-step` of delay so a column of revealed
 * rows cascades in.
 */
export type RevealDelayProp = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Ambient-activity mark for `Activity` — the LOOP counterpart to `RevealDelayProp`'s one-shot
 * ladder. `dots` (default) is the three-dot ellipsis convention (someone is typing); `pulse` a
 * single breathing mark (live / recording); `bar` an indeterminate sweep (syncing).
 */
export type ActivityVariantProp = "dots" | "pulse" | "bar";

/**
 * Whether an ambient indicator announces its label to assistive technology. Default `false` —
 * DELIBERATELY.
 */
export type ActivityAnnounceProp = false | "polite";
