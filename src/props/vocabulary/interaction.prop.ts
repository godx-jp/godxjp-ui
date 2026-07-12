/**
 * Interaction & visual variant prop types.
 * @see docs/PROPS-VOCABULARY.md#interaction-variants
 */

/** Button visual style. */
export type ButtonVariantProp =
  | "default"
  | "destructive"
  | "outline"
  | "dashed"
  | "secondary"
  | "ghost"
  | "link";

/** Corner shape — maps to the radius tokens (default = control/component radius). Shared by
 *  Button + Badge. `pill` = fully rounded (`--radius-pill`), `sharp` = square (`--radius-sharp`). */
export type ShapeProp = "default" | "pill" | "sharp";

/** Text size — steps of the golden-ratio type scale (NEVER an arbitrary px). `sm` = base. */
export type TextSizeProp = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/** Text colour intent — maps to semantic foreground tokens (no raw palette). */
export type TextToneProp =
  | "default"
  | "muted"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info";

/** Font weight — the dxs-kintai canon is THREE weights only: `regular` (400 body), `medium` (500
 *  heading/label), `bold` (700 emphasis). 600/`semibold` is forbidden. */
export type FontWeightProp = "regular" | "medium" | "bold";

/** Heading level — drives both the `--heading-h*` size token and the semantic `<h1..h4>` element. */
export type HeadingLevelProp = 1 | 2 | 3 | 4;

/** Inline text alignment (logical, RTL-safe). */
export type TextAlignProp = "start" | "center" | "end";

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
 */
export type AppSettingPickerAppearanceProp = "labeled" | "icon";

/** Button size preset. */
export type SizeProp = "xs" | "sm" | "md" | "lg";

/** Button size preset; icon-only sizes are a documented Button subset. */
export type ButtonSizeProp = SizeProp | "default" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

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
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "muted"
  | "neutral";

/** Inline Alert visual treatment. */
export type AlertVariantProp = "default";

/** Sort direction for table columns. */
export type SortDirectionProp = "asc" | "desc";

/** Table column text alignment. */
export type ColumnAlignProp = "left" | "center" | "right";

/** Active sort state on DataTable. */
export type SortStateProp = { key: string; direction: SortDirectionProp };

/**
 * Entrance-stagger ordinal for `Reveal` — an INDEX into the motion ladder, never a raw ms.
 * `0` = enter immediately; `1..6` each add one `--reveal-stagger-step` of delay so a column of
 * revealed rows cascades in. Reduced-motion collapses every step to 0 (content stays visible).
 */
export type RevealDelayProp = 0 | 1 | 2 | 3 | 4 | 5 | 6;
