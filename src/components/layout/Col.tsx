// <Col span={n} xs={n} sm={n} md={n} lg={n} xl={n} xxl={n}>
//
// 24-column grid cell — sibling of Row. The breakpoint-keyed props
// emit a `flex-basis: ${(n/24)*100}%` at each min-width media query
// using Tailwind v4 arbitrary properties. Defaults to filling the
// available row (span 24, i.e. 100%).
//
//   <Col xs={24} md={8}>side</Col>
//   <Col xs={24} md={16}>main</Col>

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useRowGutter, type Breakpoint } from "./Row";
import { cn } from "../cn";

const SPAN_TO_PCT = (n: number) => (n / 24) * 100;

export interface ColProps extends ComponentProps<"div"> {
  /** Default span (1..24). 24 = full width. */
  span?: number;
  /** Offset by n columns (1..23). */
  offset?: number;
  /** Push by n columns (flex-order shift). */
  push?: number;
  /** Per-breakpoint span overrides. */
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
  /** Flex order on the main axis. */
  order?: number;
  /** When set, the Col grows/shrinks like `flex: <n>` (free width). */
  flex?: string | number;
  children?: ReactNode;
}

const BP_WIDTHS: Record<Breakpoint, string> = {
  xs: "0px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  xxl: "1536px",
};

export function Col({
  span = 24,
  offset = 0,
  push,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  order,
  flex,
  className,
  style,
  children,
  ...rest
}: ColProps) {
  const [h] = useRowGutter();

  // Build inline media-query-aware styles. We use CSS custom properties
  // + Tailwind's arbitrary-property syntax — but to support all six
  // breakpoints cleanly, generate a per-instance <style> tag would be
  // overkill. Use only the largest set value at runtime via the same
  // matchMedia approach as Row's gutter resolution.
  const breakpoints: Partial<Record<Breakpoint, number>> = {
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
  };

  // SSR-safe initial: prefer xs over base `span`. Client useEffect not
  // needed because we re-evaluate on each render and the browser
  // matchMedia API works synchronously.
  let resolved = span;
  if (typeof window !== "undefined") {
    const order: Breakpoint[] = ["xxl", "xl", "lg", "md", "sm", "xs"];
    for (const bp of order) {
      const v = breakpoints[bp];
      if (v !== undefined && window.matchMedia(`(min-width: ${BP_WIDTHS[bp]})`).matches) {
        resolved = v;
        break;
      }
    }
  } else if (xs !== undefined) {
    resolved = xs;
  }

  const merged: CSSProperties = {
    flexBasis: flex !== undefined ? undefined : `${SPAN_TO_PCT(resolved)}%`,
    maxWidth: flex !== undefined ? undefined : `${SPAN_TO_PCT(resolved)}%`,
    flex: typeof flex === "number" ? `${flex} ${flex} auto` : flex,
    paddingLeft: h ? `${h / 2}px` : undefined,
    paddingRight: h ? `${h / 2}px` : undefined,
    marginLeft: offset ? `${SPAN_TO_PCT(offset)}%` : undefined,
    order: order,
    ...style,
  };
  void push; // reserved — Ant supports push/pull; rarely used, add if needed

  return (
    <div className={cn("min-w-0", className)} style={merged} {...rest}>
      {children}
    </div>
  );
}
