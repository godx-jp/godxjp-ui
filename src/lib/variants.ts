/** Prop → internal class maps. Apps use component props, never these classes directly. */
import type {
  GapProp,
  PageContainerVariantProp,
  PageDensityProp,
} from "../props/vocabulary";

export type Density = PageDensityProp;
export type StackGap = GapProp;
export type FlexGap = GapProp;
export type InlineGap = Exclude<GapProp, "xl">;
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

export const stackGapClass: Record<GapProp, string> = {
  xs: "ui-stack-xs",
  sm: "ui-stack-sm",
  md: "ui-stack-md",
  lg: "ui-stack-lg",
  xl: "ui-stack-xl",
};

export const inlineGapClass: Record<Exclude<GapProp, "xl">, string> = {
  xs: "ui-inline-xs",
  sm: "ui-inline-sm",
  md: "ui-inline-md",
  lg: "ui-inline-lg",
};

export const flexGapClass: Record<GapProp, string> = {
  xs: "ui-flex-gap-xs",
  sm: "ui-flex-gap-sm",
  md: "ui-flex-gap-md",
  lg: "ui-flex-gap-lg",
  xl: "ui-flex-gap-xl",
};
