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

/** Badge visual style. */
export type BadgeVariantProp = "default" | "secondary" | "outline" | "dashed";

/** Button size preset. */
export type SizeProp = "xs" | "sm" | "md" | "lg";

/** Button size preset; icon-only sizes are a documented Button subset. */
export type ButtonSizeProp = SizeProp | "default" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

/** Form layout — label position relative to its control (Ant-style). */
export type FormLayoutProp = "vertical" | "horizontal" | "inline";

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
