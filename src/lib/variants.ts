/** Prop → internal class maps. Apps use component props, never these classes directly. */
import type { GapProp, PageContainerVariantProp, PageDensityProp } from "../props/vocabulary";

export type Density = PageDensityProp;
export type StackGap = GapProp;
export type FlexGap = GapProp;
export type InlineGap = Exclude<GapProp, "xl" | "none">;
export type PageContainerVariant = PageContainerVariantProp;

export const densityClass: Record<PageDensityProp, string> = {
  compact: "ui-density-compact",
  default: "ui-density-default",
  comfortable: "ui-density-comfortable",
};

export const pageContainerVariantClass: Record<PageContainerVariantProp, string | undefined> = {
  default: undefined,
  narrow: "ui-page-container--narrow",
  flush: "ui-page-container--flush",
  ghost: "ui-page-container--ghost",
};

// The Stack/Inline shorthands never exposed a zero step, so they stay on the pre-`none` subset.
export const stackGapClass: Record<Exclude<GapProp, "none">, string> = {
  xs: "ui-stack-xs",
  sm: "ui-stack-sm",
  md: "ui-stack-md",
  lg: "ui-stack-lg",
  xl: "ui-stack-xl",
};

export const inlineGapClass: Record<InlineGap, string> = {
  xs: "ui-inline-xs",
  sm: "ui-inline-sm",
  md: "ui-inline-md",
  lg: "ui-inline-lg",
};

export const flexGapClass: Record<GapProp, string> = {
  none: "ui-flex-gap-none",
  xs: "ui-flex-gap-xs",
  sm: "ui-flex-gap-sm",
  md: "ui-flex-gap-md",
  lg: "ui-flex-gap-lg",
  xl: "ui-flex-gap-xl",
};
