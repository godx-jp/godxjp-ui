import type { CSSProperties, ReactNode } from "react";
import type {
  ResponsiveGridColumnsProp,
  ResponsiveGridPresetProp,
} from "../../props/components/layout.prop";
import { cn } from "../../lib/utils";
import type { GapProp } from "../../props/vocabulary/layout.prop";

export type ResponsiveGridProps = {
  /** Gap between cells, the same steps as Flex. Default `md`. */
  gap?: GapProp;
  /** Optional structural class override. */
  className?: string;
  columns?: ResponsiveGridColumnsProp;
  /**
   * Named column geometry for a recognised collection shape — see `ResponsiveGridPresetProp`.
   * Wins over `columns` when both are set, so a caller migrating to a preset does not also need
   * to strip its old `columns` prop.
   */
  preset?: ResponsiveGridPresetProp;
  children: ReactNode;
};

type ResponsiveGridStyle = CSSProperties & {
  "--responsive-grid-sm"?: number;
  "--responsive-grid-md"?: number;
  "--responsive-grid-lg"?: number;
};

/**
 * Column geometry behind each named preset. `pricing-plans`: 3 columns from the `sm` container
 * step up, 1 column only below it.
 */
const RESPONSIVE_GRID_PRESET_COLUMNS: Record<
  ResponsiveGridPresetProp,
  { sm: number; md: number; lg: number }
> = {
  "pricing-plans": { sm: 3, md: 3, lg: 3 },
};

function resolveColumns(columns: ResponsiveGridColumnsProp): {
  sm: number;
  md: number;
  lg: number;
} {
  if (typeof columns === "number") {
    return {
      sm: Math.min(columns, 2),
      md: Math.min(columns, 3),
      lg: columns,
    };
  }

  return {
    sm: columns.sm ?? 1,
    md: columns.md ?? columns.sm ?? 1,
    lg: columns.lg ?? columns.md ?? columns.sm ?? 1,
  };
}

function toStyle(resolved: { sm: number; md: number; lg: number }): ResponsiveGridStyle {
  return {
    "--responsive-grid-sm": resolved.sm,
    "--responsive-grid-md": resolved.md,
    "--responsive-grid-lg": resolved.lg,
  };
}

export function ResponsiveGrid({
  columns = 4,
  gap,
  preset,
  className,
  children,
}: ResponsiveGridProps) {
  const resolved = preset ? RESPONSIVE_GRID_PRESET_COLUMNS[preset] : resolveColumns(columns);
  // The scope wrapper establishes the grid's OWN query container (container-type: inline-size) so
  // the column count responds to the width AVAILABLE TO THE GRID, never the viewport and never an
  // undeclared ancestor `container-type`. It therefore stays correct inside a narrow card or a
  return (
    <div className="ui-responsive-grid-scope">
      <div className={cn("ui-responsive-grid", className)} data-gap={gap} style={toStyle(resolved)}>
        {children}
      </div>
    </div>
  );
}
