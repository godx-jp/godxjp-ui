import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react"
import { cn } from "../cn"

/**
 * Table — semantic table wrapped for horizontal scroll. The `<table>`
 * uses the canonical `.table` class from the dxs-kintai design system;
 * compose with Header / Body / Row / Head / Cell like shadcn.
 *
 * `density="compact"` swaps 32 / 36 row heights for 28 / 32 and shrinks
 * font to `text-xs` — the design-system "Table · density compact"
 * variant from `comp-table.html`.
 */

export type TableDensity = "default" | "compact"

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  density?: TableDensity
  containerClassName?: string
  /** Sticky header — applies `data-sticky` on `<thead>` via CSS hook on the table root. */
  stickyHeader?: boolean
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, containerClassName, density = "default", stickyHeader, ...rest },
  ref,
) {
  return (
    <div className={cn("table-scroll", containerClassName)}>
      <table
        ref={ref}
        data-density={density}
        data-sticky-header={stickyHeader ? "true" : undefined}
        className={cn("table", className)}
        {...rest}
      />
    </div>
  )
})

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }
>(function TableHeader({ className, sticky, ...rest }, ref) {
  return (
    <thead
      ref={ref}
      data-sticky={sticky ? "true" : undefined}
      className={cn(className)}
      {...rest}
    />
  )
})

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className, ...rest }, ref) {
    return <tbody ref={ref} className={cn(className)} {...rest} />
  },
)

export const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableFooter({ className, ...rest }, ref) {
    return <tfoot ref={ref} className={cn(className)} {...rest} />
  },
)

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(function TableRow(
  { className, ...rest },
  ref,
) {
  return <tr ref={ref} className={cn(className)} {...rest} />
})

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(function TableHead(
  { className, ...rest },
  ref,
) {
  return <th ref={ref} className={cn(className)} {...rest} />
})

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(function TableCell(
  { className, ...rest },
  ref,
) {
  return <td ref={ref} className={cn(className)} {...rest} />
})

export const TableCaption = forwardRef<HTMLTableCaptionElement, ComponentPropsWithoutRef<"caption">>(
  function TableCaption({ className, ...rest }, ref) {
    return (
      <caption
        ref={ref}
        className={cn("muted", className)}
        style={{ fontSize: "var(--text-xs)", marginTop: "var(--spacing-2)" }}
        {...rest}
      />
    )
  },
)

/**
 * TableToolbar — translucent action band shown above a table while
 * rows are selected (canonical "table-toolbar" pattern).
 *
 *   <TableToolbar>
 *     <span className="selection-count">3 selected</span>
 *     <span className="spacer" />
 *     <Button size="small" variant="ghost">Archive</Button>
 *     <Button size="small" variant="destructive">Delete</Button>
 *   </TableToolbar>
 */
export const TableToolbar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TableToolbar({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("table-toolbar", className)} {...rest} />
  },
)
