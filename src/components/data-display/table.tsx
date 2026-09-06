import * as React from "react";
import { tableHeadHeightClass } from "../../lib/control-styles";
import { cn } from "../../lib/utils";
import type {
  BreakpointProp,
  FlushProp,
  TableCellIndentProp,
  TableColumnPriorityProp,
  TablePresetProp,
} from "../../props/vocabulary";

export type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /**
   * Whether the Table owns its own horizontal-scroll region (default `true`). When `true` a table
   * wider than its container scrolls inside a keyboard-reachable wrapper (WCAG 2.1.1 / axe
   * `scrollable-region-focusable`).
   */
  scrollable?: boolean;
  /**
   * Reach for this whenever the table carries rowSpan/colSpan merged cells — without column rules
   * the merge relationships are unreadable. Colour comes from the `--table-border-color` token
   * (default `--border`).
   */
  bordered?: boolean;
  /**
   * Named collection contract. `"default"` (the default) emits no attribute and keeps the plain
   * table exactly as it is.
   */
  preset?: TablePresetProp;
  /** Defaults to `"sm"` (40rem). Ignored while `preset` is `"default"`. */
  collapseBelow?: BreakpointProp;
};

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      scrollable = true,
      bordered = false,
      preset = "default",
      collapseBelow = "sm",
      ...props
    },
    ref,
  ) => (
    // A table wider than its container scrolls horizontally in this wrapper; keep it
    // keyboard-reachable so it can be scrolled without a pointer (WCAG 2.1.1 / axe
    // scrollable-region-focusable). No landmark role — avoids landmark-unique collisions.
    // When `scrollable` is false an ancestor owns the scroll region, so this is a bare
    // positioning box (no `overflow`, no tab stop) to avoid a redundant nested scroller.
    // step attribute; with `preset="default"` neither is emitted, so the box is byte-identical.
    <div
      className={cn(
        scrollable ? "relative w-full overflow-auto" : "relative w-full",
        preset === "action-collection" && "ui-table-collection",
        preset === "stacked-record-collection" && "ui-table-stacked-collection",
      )}
      data-preset={preset === "default" ? undefined : preset}
      data-collapse-below={preset === "default" ? undefined : collapseBelow}
      {...(scrollable ? { tabIndex: 0 } : {})}
    >
      <table
        ref={ref}
        data-slot="table"
        // Type metrics live on `[data-slot="table"]` in table-layout.css
        className={cn("w-full caption-bottom", bordered && "ui-table-bordered", className)}
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
  // "The last row draws no rule" is an idiom, not a service-tunable constant, so it is a CSS
  // rule (`[data-slot="table-body"] .ui-table-row:last-child`) rather than a utility. That only
  // works because TableRow's own bottom rule moved to `.ui-table-row` in the same layer: while
  <tbody ref={ref} data-slot="table-body" className={cn(className)} {...props} />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      // The row rule itself is `.ui-table-row` in table-layout.css (--table-row-border-width),
      // NOT a `border-b` utility — a utility sits in `@layer utilities` and would outrank the
      "ui-table-row hover:bg-accent/70 data-[state=selected]:bg-primary/[0.06] transition-colors",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

/**
 * Column priority carried by BOTH the header cell and the body cells of a column. Read only by
 * `Table preset="action-collection"` below its collapse step, where it selects the column's
 * token-owned measure; unset columns take the remaining space.
 */
type TableCellPriority = { priority?: TableColumnPriorityProp };

/**
 * Rendered into the DOM unconditionally (so it exists for the preset's CSS to reveal) but visually
 * hidden above the collapse step, where the real `<th>` already carries the label — an ordinary
 * table with no `label` prop supplied gains no extra markup.
 */
type TableCellLabel = { label?: React.ReactNode };

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

/**
 * The cell's CONTENT owns its inset — an expanded detail panel, a nested table, a full-bleed media
 * strip. The cell drops its own padding so the child reaches the cell edges; without it the only
 * route was a zero-padding utility at the call site, which no service theme can reach.
 */
type TableCellFlush = { flush?: FlushProp };

/**
 * Hierarchy depth. The indent is `--table-cell-space-x + depth × --table-cell-indent-space-step`,
 * computed in table-layout.css off the level this prop publishes as `--table-cell-indent-level`,
 * so a service retunes (or flattens) the step without touching JSX — the route TreeSelect's
 * `--tree-select-depth` already takes. Logical, so an RTL tree indents from the inline start.
 */
type TableCellIndent = { indent?: TableCellIndentProp };

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> &
    TableCellPriority &
    TableCellLabel &
    TableCellFlush &
    TableCellIndent
>(({ className, priority, label, flush, indent, children, style, ...props }, ref) => (
  <td
    ref={ref}
    data-slot="table-cell"
    data-priority={priority}
    data-flush={flush ? "" : undefined}
    data-indent={indent === undefined ? undefined : indent}
    className={cn(className)}
    style={
      indent === undefined
        ? style
        : ({ ...style, "--table-cell-indent-level": indent } as React.CSSProperties)
    }
    {...props}
  >
    {label !== undefined ? (
      <span className="ui-table-stacked-collection-label" aria-hidden="true">
        {label}
      </span>
    ) : null}
    {children}
  </td>
));
TableCell.displayName = "TableCell";
