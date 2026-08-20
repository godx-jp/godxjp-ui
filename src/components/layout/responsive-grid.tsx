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
 * Column geometry behind each named preset. `pricing-plans`: 3 columns from the `sm` container
 * step up, 1 column only below it.
 *
 * This grid's breakpoints respond to the GRID'S OWN container width (`container-type:
 * inline-size` on `.ui-responsive-grid-scope`), not the viewport — see the container-query note
 * on `ResponsiveGrid` below. A real consumer inside a shelled layout (sidebar + padding) loses
 * ~300px of the viewport to chrome before the grid ever sees it: a 1024px viewport can leave the
 * grid with a container as narrow as ~721px (45rem) — inside the `sm` tier (>=40rem, <64rem), not
 * `lg` (>=64rem). An earlier `{ sm: 1, md: 1, lg: 3 }` mapping passed its own jsdom unit test
 * (which never evaluates `@container` and only reads back the CSS custom properties) but silently
 * regressed the real 3-up-at-1024 contract inside DXS's shelled Console
 * (dxs-platform/platform#333, reported 2026-08-20). `sm: 3` fixes that: any container from the
 * `sm` step up renders 3 columns; only a genuinely narrow (<40rem) container drops to 1.
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
