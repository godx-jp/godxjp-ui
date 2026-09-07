/** Prop → internal class maps. Apps use component props, never these classes directly. */
import type * as React from "react";

import type {
  GapNameProp,
  GapProp,
  PadProp,
  PadRawProp,
  PadSides,
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

/**
 * Bậc thang → giá trị CSS cho đệm.
 *
 * Bậc TÊN ánh xạ vào thang dọc (`--space-stack-*`) chứ không theo trục như
 * `gap`: đệm bao quanh một khối, nó không có "trục viết" để chặt hơn. Bậc SỐ
 * đi thẳng vào `--space-{n}` của thang gốc, giống hệt `gap={n}`.
 */
export function padStepToken(step: GapProp): string {
  if (step === "none" || step === 0) {
    return "0";
  }

  return typeof step === "number" ? `var(--space-${step})` : `var(--space-stack-${step})`;
}

/**
 * `pad` / `padRaw` → style đệm theo tên cạnh LOGIC.
 *
 * Trả về `undefined` khi không có gì để đặt, để `Flex` không phát một thuộc
 * tính `style` rỗng (và phép so với bản Radix không lệch vì một chuỗi thừa).
 *
 * `padRaw` thắng `pad` ở TỪNG CẠNH, không phải cả cụm: một thiết kế có thể cần
 * `blockStart` đúng 10px trong khi ba cạnh còn lại vẫn theo thang.
 */
export function padStyle(
  pad: PadProp | undefined,
  padRaw: PadRawProp | undefined,
): React.CSSProperties | undefined {
  const scalar = <T>(v: PadSides<T> | undefined): T | undefined =>
    v !== undefined && (typeof v !== "object" || v === null) ? (v as T) : undefined;
  const sides = <T>(v: PadSides<T> | undefined): Partial<Record<string, T>> =>
    v !== undefined && typeof v === "object" && v !== null ? (v as Record<string, T>) : {};

  const allStep = scalar(pad);
  const allRaw = scalar(padRaw);
  const stepSides = sides<GapProp>(pad);
  const rawSides = sides<number>(padRaw);

  const AXES = {
    inline: ["paddingInlineStart", "paddingInlineEnd"],
    block: ["paddingBlockStart", "paddingBlockEnd"],
    inlineStart: ["paddingInlineStart"],
    inlineEnd: ["paddingInlineEnd"],
    blockStart: ["paddingBlockStart"],
    blockEnd: ["paddingBlockEnd"],
  } as const;

  const out: Record<string, string> = {};

  if (allStep !== undefined) {
    out.padding = padStepToken(allStep);
  }
  if (allRaw !== undefined) {
    out.padding = `${allRaw}px`;
  }

  // Cạnh cụ thể ghi đè giá trị bao quanh; raw ghi đè step ở cùng cạnh.
  for (const [key, props] of Object.entries(AXES)) {
    const step = stepSides[key];
    if (step !== undefined) {
      for (const prop of props) out[prop] = padStepToken(step);
    }
  }
  for (const [key, props] of Object.entries(AXES)) {
    const raw = rawSides[key];
    if (raw !== undefined) {
      for (const prop of props) out[prop] = `${raw}px`;
    }
  }

  return Object.keys(out).length > 0 ? (out as React.CSSProperties) : undefined;
}
