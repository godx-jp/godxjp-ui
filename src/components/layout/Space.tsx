// <Space> — inline spacing between children (Ant Design model).
//
//   <Space size="middle">
//     <Button>One</Button>
//     <Button>Two</Button>
//   </Space>
//
// Distinct from Flex in intent: Space implies a tight inline group
// (action bar, breadcrumb, tag row). Flex implies a layout container.
// Both use the same underlying flex CSS — Space adds a `<Compact>`
// variant later for borderless adjacency.

import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

export type SpaceSize = number | "small" | "middle" | "large";

const SIZE_TOKEN: Record<Exclude<SpaceSize, number>, string> = {
  small: "var(--spacing-1)",
  middle: "var(--spacing-2)",
  large: "var(--spacing-3)",
};

export interface SpaceProps extends ComponentProps<"div"> {
  /** Gap between adjacent children. */
  size?: SpaceSize | [SpaceSize, SpaceSize];
  /** Vertical stack instead of horizontal row. */
  direction?: "horizontal" | "vertical";
  /** Allow wrapping when row overflows. */
  wrap?: boolean;
  /** Cross-axis alignment. */
  align?: "start" | "end" | "center" | "baseline";
  /** Separator rendered between siblings (e.g. a divider). */
  split?: ReactNode;
  children?: ReactNode;
}

function resolveSize(s: SpaceSize): string {
  return typeof s === "number" ? `${s}px` : SIZE_TOKEN[s];
}

const ALIGN_CLASS: Record<NonNullable<SpaceProps["align"]>, string> = {
  start: "items-start",
  end: "items-end",
  center: "items-center",
  baseline: "items-baseline",
};

export function Space({
  size = "small",
  direction = "horizontal",
  wrap = false,
  align,
  split,
  className,
  style,
  children,
  ...rest
}: SpaceProps) {
  const [colGap, rowGap] = Array.isArray(size) ? size : [size, size];

  // Render children with optional separators.
  const items: ReactNode[] = [];
  let i = 0;
  // We don't introspect children to filter out null; mirror Ant's behavior
  // of letting falsy children naturally render nothing.
  const arr = Array.isArray(children) ? children : [children];
  for (const child of arr) {
    if (i > 0 && split) {
      items.push(
        <span key={`sep-${i}`} aria-hidden="true" className="text-muted-foreground">
          {split}
        </span>,
      );
    }
    items.push(<span key={`item-${i}`}>{child}</span>);
    i++;
  }

  return (
    <div
      className={cn(
        "inline-flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        wrap ? "flex-wrap" : "flex-nowrap",
        align && ALIGN_CLASS[align],
        className,
      )}
      style={{
        columnGap: resolveSize(colGap),
        rowGap: resolveSize(rowGap),
        ...style,
      }}
      {...rest}
    >
      {items}
    </div>
  );
}
