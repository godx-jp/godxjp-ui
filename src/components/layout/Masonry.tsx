import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

/**
 * Masonry — staggered column flow (Pinterest-style).
 *
 * Items flow top-to-bottom within columns; children of varying
 * heights pack naturally without gaps. Built on the CSS
 * `column-count` / `column-gap` properties (cross-browser stable
 * since 2017); each direct child gets `break-inside: avoid` so
 * single items don't split across columns.
 *
 * Trade-off vs CSS Grid Level 3 native `masonry`: that spec has
 * landed in Firefox + Safari preview but not Chromium. The
 * column-flow approach works everywhere. When CSS masonry is
 * cross-browser stable we'll add a `mode="grid-masonry"` switch.
 *
 * Per cardinal rule 23 §B `gap` uses the same vocabulary as
 * Flex / Grid (`GridGap = number | "small" | "middle" | "large"`).
 */

export type MasonryGap = number | "small" | "middle" | "large";

const GAP_TOKEN: Record<Exclude<MasonryGap, number>, string> = {
  small: "var(--spacing-2)",   /* 8px */
  middle: "var(--spacing-3)",  /* 12px */
  large: "var(--spacing-4)",   /* 16px */
};

export interface MasonryProps extends ComponentProps<"div"> {
  /** Number of columns. Defaults to 3. */
  cols?: number;
  /** Gap between columns (and implicitly between items). */
  gap?: MasonryGap;
  children?: ReactNode;
}

function resolveGap(value: MasonryGap | undefined): string {
  if (value === undefined) return "var(--spacing-3)"; /* 12px default */
  if (typeof value === "number") return `${value}px`;
  return GAP_TOKEN[value];
}

export function Masonry({
  cols = 3,
  gap,
  className,
  style,
  children,
  ...rest
}: MasonryProps) {
  const gapValue = resolveGap(gap);
  return (
    <div
      className={cn("masonry", className)}
      style={{
        columnCount: cols,
        columnGap: gapValue,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * MasonryItem — wraps each child so it doesn't break across
 * columns. Required for predictable layout (cardinal rule 23 §A:
 * separate the "I'm a Masonry container" concept from the
 * "I'm an item that should not split" concept).
 */
export interface MasonryItemProps extends ComponentProps<"div"> {
  children?: ReactNode;
}

export function MasonryItem({
  className,
  style,
  children,
  ...rest
}: MasonryItemProps) {
  return (
    <div
      className={cn("masonry-item", className)}
      style={{
        breakInside: "avoid",
        marginBottom: "var(--spacing-3)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
