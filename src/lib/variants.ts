/** Prop → internal class maps. Apps use component props, never these classes directly. */
import type {
  InlineGapProp,
  PageContainerVariantProp,
  PageDensityProp,
  StackGapProp,
} from "../props/vocabulary";

export type Density = PageDensityProp;
export type StackGap = StackGapProp;
export type InlineGap = InlineGapProp;
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

export const stackGapClass: Record<StackGapProp, string> = {
  xs: "ui-stack-xs",
  sm: "ui-stack-sm",
  md: "ui-stack-md",
  lg: "ui-stack-lg",
  xl: "ui-stack-xl",
};

export const inlineGapClass: Record<InlineGapProp, string> = {
  xs: "ui-inline-xs",
  sm: "ui-inline-sm",
  md: "ui-inline-md",
  lg: "ui-inline-lg",
};
