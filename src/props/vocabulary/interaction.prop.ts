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
export type TextSizeProp = "2xs" | "xs" | "sm" | "md" | "lg" | "xl";

/** Text colour intent — maps to semantic foreground tokens (no raw palette). */
export type TextToneProp =
  | "default"
  | "muted"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info";

/** Font weight — the system is 2-weight (400/500); `semibold` resolves to the 500 token, not 600. */
export type FontWeightProp = "regular" | "medium" | "semibold";

/** Heading level — drives both the `--heading-h*` size token and the semantic `<h1..h4>` element. */
export type HeadingLevelProp = 1 | 2 | 3 | 4;

/** Inline text alignment (logical, RTL-safe). */
export type TextAlignProp = "start" | "center" | "end";

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
