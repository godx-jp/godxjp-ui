import type { CSSProperties, ReactNode } from "react";
import type { ResponsiveGridColumnsProp } from "../../props/components/layout.prop";

export type ResponsiveGridProps = {
  columns?: ResponsiveGridColumnsProp;
  children: ReactNode;
};

type ResponsiveGridStyle = CSSProperties & {
  "--responsive-grid-sm"?: number;
  "--responsive-grid-md"?: number;
  "--responsive-grid-lg"?: number;
};

function resolveColumns(columns: ResponsiveGridColumnsProp): ResponsiveGridStyle {
  if (typeof columns === "number") {
    return {
      "--responsive-grid-sm": Math.min(columns, 2),
      "--responsive-grid-md": Math.min(columns, 3),
      "--responsive-grid-lg": columns,
    };
  }

  return {
    "--responsive-grid-sm": columns.sm ?? 1,
    "--responsive-grid-md": columns.md ?? columns.sm ?? 1,
    "--responsive-grid-lg": columns.lg ?? columns.md ?? columns.sm ?? 1,
  };
}

export function ResponsiveGrid({ columns = 4, children }: ResponsiveGridProps) {
  return (
    <div className="ui-responsive-grid" style={resolveColumns(columns)}>
      {children}
    </div>
  );
}
