/** Prop → internal class maps. Apps use component props, never these classes directly. */
import type {
  GapNameProp,
  GapProp,
  PageContainerVariantProp,
  PageDensityProp,
} from "../props/vocabulary";

export type Density = PageDensityProp;
export type StackGap = GapProp;
export type FlexGap = GapProp;
export type InlineGap = Exclude<GapNameProp, "xl" | "none">;
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

/*
 * Stack/Inline là SHORTHAND, và chúng cố tình đứng trên tập con TÊN.
 *
 * Chúng chưa bao giờ phơi bậc zero, và từ v20 cũng không phơi bậc SỐ: một
 * shorthand tồn tại để nói ý định gọn ("xếp cột, cách vừa"), còn khi cần một
 * giá trị chính xác thì `Flex` với `gap={n}` mới là chỗ nói điều đó. Cho cả
 * hai cùng nhận thang số là để người ta chọn giữa hai đường làm cùng một việc.
 */
export const stackGapClass: Record<Exclude<GapNameProp, "none">, string> = {
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
  // Bậc SỐ: thang gốc `--space-{n}`, không theo trục. Xem GapStepProp.
  0: "ui-flex-gap-none",
  1: "ui-flex-gap-1",
  2: "ui-flex-gap-2",
  3: "ui-flex-gap-3",
  4: "ui-flex-gap-4",
  5: "ui-flex-gap-5",
  6: "ui-flex-gap-6",
  8: "ui-flex-gap-8",
  10: "ui-flex-gap-10",
  12: "ui-flex-gap-12",
};
