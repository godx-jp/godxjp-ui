import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react"
import { cn } from "./cn"

/**
 * Table — semantic table wrapped for horizontal scroll. The `<table>`
 * uses the `.table` atom from tokens.css; compose with Header / Body /
 * Row / Head / Cell like shadcn.
 */
export const Table = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement> & { containerClassName?: string }
>(function Table({ className, containerClassName, ...rest }, ref) {
  return (
    <div className={cn("table-scroll", containerClassName)}>
      <table ref={ref} className={cn("table", className)} {...rest} />
    </div>
  )
})

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ className, ...rest }, ref) {
    return <thead ref={ref} className={cn(className)} {...rest} />
  },
)

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
