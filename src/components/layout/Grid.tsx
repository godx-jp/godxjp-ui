import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

/**
 * Grid — thin wrapper around CSS Grid.
 *
 * Concept: a fixed-column or template grid. Different from
 * `<Row>` / `<Col>` (12-col flexbox responsive grid, Ant-Design
 * shape). Use Grid when you want:
 *
 *   - A fixed N-column layout (`cols={3}` → 3 equal columns).
 *   - A template-driven layout (`cols="200px 1fr 80px"`).
 *   - Two-dimensional placement (rows × cols).
 *
 * Use Row/Col when you want responsive 12-col breakpoints
 * (`<Col xs={24} md={8}>`).
 *
 * Per cardinal rule 23 §B `gap` uses the same vocabulary as
 * Flex (FlexGap: number | "small" | "middle" | "large").
 */

export type GridGap = number | "small" | "middle" | "large";

const GAP_TOKEN: Record<Exclude<GridGap, number>, string> = {
  small: "var(--spacing-2)",   /* 8px */
  middle: "var(--spacing-3)",  /* 12px */
  large: "var(--spacing-4)",   /* 16px */
};

export interface GridProps extends ComponentProps<"div"> {
  /** Number of equal columns OR a CSS `grid-template-columns` string. */
  cols?: number | string;
  /** Number of equal rows OR a CSS `grid-template-rows` string. */
  rows?: number | string;
  /** Gap between grid cells. Token name or pixel number. */
  gap?: GridGap;
  /** Distinct horizontal / vertical gaps (overrides `gap` per axis). */
  columnGap?: GridGap;
  rowGap?: GridGap;
  children?: ReactNode;
}

function resolveTemplate(value: number | string): string {
  return typeof value === "number" ? `repeat(${value}, minmax(0, 1fr))` : value;
}

function resolveGap(value: GridGap | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `${value}px`;
  return GAP_TOKEN[value];
}

export function Grid({
  cols,
  rows,
  gap,
  columnGap,
  rowGap,
  className,
  style,
  children,
  ...rest
}: GridProps) {
  // Build style object dynamically — only spread defined keys.
  //
  // Why: assigning empty/undefined values to `columnGap` or `rowGap`
  // resets the `gap` shorthand to its initial value (CSSStyleDeclaration
  // behaviour). React's style serialization treats `undefined` as "remove
  // this property", which on a fresh element manifests as an empty-string
  // longhand assignment — which silently CLEARS the just-set `gap`.
  // Guard each prop so the longhand keys never enter the style object
  // unless the consumer asked for them.
  const merged: NonNullable<ComponentProps<"div">["style"]> = {
    display: "grid",
    ...style,
  };
  if (cols !== undefined) merged.gridTemplateColumns = resolveTemplate(cols);
  if (rows !== undefined) merged.gridTemplateRows = resolveTemplate(rows);
  const gapResolved = resolveGap(gap);
  if (gapResolved !== undefined) merged.gap = gapResolved;
  const columnGapResolved = resolveGap(columnGap);
  if (columnGapResolved !== undefined) merged.columnGap = columnGapResolved;
  const rowGapResolved = resolveGap(rowGap);
  if (rowGapResolved !== undefined) merged.rowGap = rowGapResolved;

  return (
    <div className={cn("grid", className)} style={merged} {...rest}>
      {children}
    </div>
  );
}
