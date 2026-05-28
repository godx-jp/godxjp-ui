// Skeleton family — shaped placeholders for loading states. Always pick the
// shape closest to the final layout; spinner-overlay is forbidden.
import * as React from "react";

import { cn } from "../../lib/utils";
import { tableCellPaddingClass, tableRowHeightClass } from "../../lib/control-styles";

function SkeletonBlock({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn("ui-skeleton-block", className)}
      {...props}
    />
  );
}

interface SkeletonRowsProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/** Skeleton for a flat list of rows (use inside a Card or section). */
export function SkeletonRows({ rows = 6, columns = 4, className }: SkeletonRowsProps) {
  return (
    <div className={cn("ui-skeleton-rows", className)} aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ui-skeleton-row">
          {Array.from({ length: columns }).map((_, j) => (
            <SkeletonBlock
              key={j}
              className={cn("h-4", j === 0 ? "w-1/4" : j === columns - 1 ? "w-1/6" : "flex-1")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton matching the DataTable layout — header row + N body rows. */
export function SkeletonTable({ rows = 8, columns = 5 }: SkeletonRowsProps) {
  return (
    <div className="ui-skeleton-table" aria-busy="true">
      <div className={cn("ui-skeleton-table-head", tableCellPaddingClass, tableRowHeightClass)}>
        {Array.from({ length: columns }).map((_, j) => (
          <SkeletonBlock key={j} className={cn("h-3", j === 0 ? "w-1/5" : "flex-1")} />
        ))}
      </div>
      <div className="ui-skeleton-table-body">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={cn("ui-skeleton-table-row", tableCellPaddingClass, tableRowHeightClass)}
          >
            {Array.from({ length: columns }).map((_, j) => (
              <SkeletonBlock key={j} className={cn("h-4", j === 0 ? "w-1/5" : "flex-1")} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton matching a Card detail layout — title + 6 metadata rows. */
export function SkeletonDetail() {
  return (
    <div className="ui-skeleton-detail ui-skeleton-detail-stack" aria-busy="true">
      <SkeletonBlock className="h-7 w-1/3" />
      <SkeletonBlock className="h-4 w-1/2" />
      <div className="ui-skeleton-detail-box ui-skeleton-detail-stack">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="ui-skeleton-detail-stack">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-4 w-full max-w-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton matching a stat card / dashboard tile. */
export function SkeletonCard() {
  return (
    <div className="ui-skeleton-card" aria-busy="true">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-[length:var(--control-height)] w-32" />
      <SkeletonBlock className="h-3 w-20" />
    </div>
  );
}
