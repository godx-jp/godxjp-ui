import type { ReactNode } from "react";

export type ResponsiveGridProps = {
  columns?: 2 | 3 | 4;
  children: ReactNode;
};

export function ResponsiveGrid({ columns = 3, children }: ResponsiveGridProps) {
  return (
    <div className="ui-responsive-grid" data-columns={columns}>
      {children}
    </div>
  );
}
