import * as React from "react";
import { tableHeadHeightClass } from "../../lib/control-styles";
import { cn } from "../../lib/utils";
import type {
  BreakpointProp,
  TableColumnPriorityProp,
  TablePresetProp,
} from "../../props/vocabulary";

export type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /**
   * Whether the Table owns its own horizontal-scroll region (default `true`). When `true` a
   * table wider than its container scrolls inside a keyboard-reachable wrapper (WCAG 2.1.1 / axe
   * `scrollable-region-focusable`). Set `false` when an ancestor already provides the scroll
   * region (e.g. `DataTable`, whose `.ui-data-table-scroll` owns the overflow + tab stop) — this
   * avoids a redundant NESTED scroll container and a duplicate keyboard focus stop for one table.
   */
  scrollable?: boolean;
  /**
   * Named collection contract. `"default"` (the default) emits no attribute and keeps the plain
   * table exactly as it is. `"action-collection"` is the canonical dense approval / action queue
   * (gh#253): below `collapseBelow`, the desktop intrinsic column widths — the thing that pushes
   * the last columns outside a 390px viewport — are replaced by the token-owned column PRIORITY
   * measures (`--table-action-collection-*`) under `table-layout: fixed`, and cells wrap instead
   * of forcing a horizontal scroll. Mark each column with `priority` on its `TableHead`/`TableCell`.
   * The table keeps its real semantics: no `display` change, no role rewriting, no card swap, so
   * header association, `aria-sort` and screen-reader table navigation are identical at every width.
   */
  preset?: TablePresetProp;
  /**
   * Step at which `preset="action-collection"` switches to the priority measures, measured against
   * the TABLE's own container (not the viewport), so a table inside a rail collapses before the
   * page does. Defaults to `"sm"` (40rem). Ignored while `preset` is `"default"`.
   */
  collapseBelow?: BreakpointProp;
};

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, scrollable = true, preset = "default", collapseBelow = "sm", ...props }, ref) => (
    // A table wider than its container scrolls horizontally in this wrapper; keep it
    // keyboard-reachable so it can be scrolled without a pointer (WCAG 2.1.1 / axe
    // scrollable-region-focusable). No landmark role — avoids landmark-unique collisions.
    // When `scrollable` is false an ancestor owns the scroll region, so this is a bare
    // positioning box (no `overflow`, no tab stop) to avoid a redundant nested scroller.
    // The preset adds ONE class (the container the collapse step is measured against) and the
    // step attribute; with `preset="default"` neither is emitted, so the box is byte-identical.
    <div
      className={cn(
        scrollable ? "relative w-full overflow-auto" : "relative w-full",
        preset !== "default" && "ui-table-collection",
      )}
      data-preset={preset === "default" ? undefined : preset}
      data-collapse-below={preset === "default" ? undefined : collapseBelow}
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

/**
 * Column priority carried by BOTH the header cell and the body cells of a column. Read only by
 * `Table preset="action-collection"` below its collapse step, where it selects the column's
 * token-owned measure; unset columns take the remaining space. Emitted as `data-priority` only
 * when supplied, so an ordinary table gains no attribute.
 */
type TableCellPriority = { priority?: TableColumnPriorityProp };

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & TableCellPriority
>(({ className, priority, ...props }, ref) => (
  <th
    ref={ref}
    data-slot="table-head"
    data-priority={priority}
    className={cn(tableHeadHeightClass, className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & TableCellPriority
>(({ className, priority, ...props }, ref) => (
  <td
    ref={ref}
    data-slot="table-cell"
    data-priority={priority}
    className={cn(className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";
