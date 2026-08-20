import type { CSSProperties, ReactNode } from "react";
import type {
  ResponsiveGridColumnsProp,
  ResponsiveGridPresetProp,
} from "../../props/components/layout.prop";

export type ResponsiveGridProps = {
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
 * Column geometry behind each named preset. `pricing-plans`: 1 column below the `lg` container
 * step, 3 columns from `lg` up — ResponsiveGrid has no step above `lg`, so this alone produces 3
 * columns at both the 1024px and 1440px reference widths (dxs-platform/platform#333).
 */
const RESPONSIVE_GRID_PRESET_COLUMNS: Record<
  ResponsiveGridPresetProp,
  { sm: number; md: number; lg: number }
> = {
  "pricing-plans": { sm: 1, md: 1, lg: 3 },
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

export function ResponsiveGrid({ columns = 4, preset, children }: ResponsiveGridProps) {
  const resolved = preset ? RESPONSIVE_GRID_PRESET_COLUMNS[preset] : resolveColumns(columns);
  // The scope wrapper establishes the grid's OWN query container (container-type: inline-size) so
  // the column count responds to the width AVAILABLE TO THE GRID, never the viewport and never an
  // undeclared ancestor `container-type`. It therefore stays correct inside a narrow card or a
  // SplitPane aside instead of silently collapsing to one column (gh#165).
  return (
    <div className="ui-responsive-grid-scope">
      <div className="ui-responsive-grid" style={toStyle(resolved)}>
        {children}
      </div>
    </div>
  );
}
