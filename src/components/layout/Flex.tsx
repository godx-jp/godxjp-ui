// <Flex> — flex container with prop-driven config (Ant Design model).
//
//   <Flex gap="default" vertical justify="space-between" align="center" wrap>
//
// Replaces `<div className="flex items-center gap-2 …">` patterns.
// Prop names mirror Ant Design exactly so the API is familiar to
// anyone who knows AntD; values map onto CSS flex.

import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";
import type { SizeProp } from "../../props";

/** Flex gap scale. Accepts the shared `SizeProp` vocabulary plus a raw
 *  pixel number for one-off gaps. Renamed from Ant's `"middle"` →
 *  `"default"` to match the framework-wide size axis. */
export type FlexGap = number | SizeProp;
export type FlexJustify =
  | "start"
  | "end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";
export type FlexAlign = "start" | "end" | "center" | "stretch" | "baseline";

const GAP_TOKEN: Record<Exclude<FlexGap, number>, string> = {
  small: "var(--spacing-2)",
  default: "var(--spacing-3)",
  large: "var(--spacing-4)",
};

const JUSTIFY_CLASS: Record<FlexJustify, string> = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  "space-between": "justify-between",
  "space-around": "justify-around",
  "space-evenly": "justify-evenly",
};

const ALIGN_CLASS: Record<FlexAlign, string> = {
  start: "items-start",
  end: "items-end",
  center: "items-center",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

export interface FlexProps extends ComponentProps<"div"> {
  /** Direction — false / undefined = horizontal, true = vertical. */
  vertical?: boolean;
  /** Wrap mode. */
  wrap?: boolean | "nowrap" | "wrap" | "wrap-reverse";
  /** Gap between children. Token name or pixel number. */
  gap?: FlexGap;
  justify?: FlexJustify;
  align?: FlexAlign;
  /** flex value for the container itself (rare — usually parent sets it). */
  flex?: string | number;
  children?: ReactNode;
}

export function Flex({
  vertical = false,
  wrap,
  gap,
  justify,
  align,
  flex,
  className,
  style,
  children,
  ...rest
}: FlexProps) {
  const wrapClass =
    wrap === undefined || wrap === false || wrap === "nowrap"
      ? "flex-nowrap"
      : wrap === "wrap-reverse"
        ? "flex-wrap-reverse"
        : "flex-wrap";

  const gapPx =
    typeof gap === "number"
      ? `${gap}px`
      : gap !== undefined
        ? GAP_TOKEN[gap]
        : undefined;

  return (
    <div
      className={cn(
        "flex",
        vertical ? "flex-col" : "flex-row",
        wrapClass,
        justify && JUSTIFY_CLASS[justify],
        align && ALIGN_CLASS[align],
        className,
      )}
      style={{
        gap: gapPx,
        flex: typeof flex === "number" ? `${flex} ${flex} auto` : flex,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
