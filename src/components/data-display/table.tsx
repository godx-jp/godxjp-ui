import * as React from "react";
import { tableHeadHeightClass } from "../../lib/control-styles";
import { cn } from "../../lib/utils";

export type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /**
   * Whether the Table owns its own horizontal-scroll region (default `true`). When `true` a
   * table wider than its container scrolls inside a keyboard-reachable wrapper (WCAG 2.1.1 / axe
   * `scrollable-region-focusable`). Set `false` when an ancestor already provides the scroll
   * region (e.g. `DataTable`, whose `.ui-data-table-scroll` owns the overflow + tab stop) — this
   * avoids a redundant NESTED scroll container and a duplicate keyboard focus stop for one table.
   */
  scrollable?: boolean;
};

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, scrollable = true, ...props }, ref) => (
    // A table wider than its container scrolls horizontally in this wrapper; keep it
    // keyboard-reachable so it can be scrolled without a pointer (WCAG 2.1.1 / axe
    // scrollable-region-focusable). No landmark role — avoids landmark-unique collisions.
    // When `scrollable` is false an ancestor owns the scroll region, so this is a bare
    // positioning box (no `overflow`, no tab stop) to avoid a redundant nested scroller.
    <div
      className={scrollable ? "relative w-full overflow-auto" : "relative w-full"}
      {...(scrollable ? { tabIndex: 0 } : {})}
    >
      <table
        ref={ref}
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "ui-table-row hover:bg-accent/70 data-[state=selected]:bg-primary/[0.06] border-b transition-colors",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th ref={ref} data-slot="table-head" className={cn(tableHeadHeightClass, className)} {...props} />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} data-slot="table-cell" className={cn(className)} {...props} />
));
TableCell.displayName = "TableCell";
