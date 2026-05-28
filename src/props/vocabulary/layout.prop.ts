/**
 * Layout & spacing prop types.
 * @see docs/PROPS-VOCABULARY.md#layout--density
 */

/** Page-level density — affects padding, control heights across PageContainer subtree. */
export type PageDensityProp = "compact" | "default" | "comfortable";

/** Page shell layout — orthogonal to PageDensityProp. */
export type PageContainerVariantProp = "default" | "narrow" | "flush" | "ghost";

/** Vertical stack gap between block-level children. */
export type StackGapProp = "xs" | "sm" | "md" | "lg" | "xl";

/** Horizontal inline gap between row items. */
export type InlineGapProp = "xs" | "sm" | "md" | "lg";

/** DataTable row density — NOT the same as PageDensityProp. */
export type TableDensityProp = "compact" | "comfortable";

/** @deprecated Alias — use PageDensityProp. Kept for lib/variants compat. */
export type DensityProp = PageDensityProp;

/** @deprecated Alias — use StackGapProp. */
export type GapProp = StackGapProp;
