import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type RowData,
} from "@tanstack/react-table"
import type { CSSProperties, HTMLAttributes, ReactNode } from "react"
import { cn } from "../cn"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    headerClassName?: string
    cellClassName?: string | ((row: Row<TData>) => string | undefined)
    style?: CSSProperties
    headerStyle?: CSSProperties
    cellStyle?: CSSProperties | ((row: Row<TData>) => CSSProperties | undefined)
  }
}

export type TableDensity = "default" | "compact"
export type TableColumn<TData, TValue = unknown> = ColumnDef<TData, TValue>

export interface TableProps<TData>
  extends Omit<HTMLAttributes<HTMLTableElement>, "children"> {
  columns: TableColumn<TData, unknown>[]
  data: TData[]
  density?: TableDensity
  containerClassName?: string
  stickyHeader?: boolean
  getRowId?: (row: TData, index: number) => string
  caption?: ReactNode
  toolbar?: ReactNode
  empty?: ReactNode
}

function resolveCellClass<TData>(
  value: string | ((row: Row<TData>) => string | undefined) | undefined,
  row: Row<TData>,
) {
  return typeof value === "function" ? value(row) : value
}

function resolveCellStyle<TData>(
  value: CSSProperties | ((row: Row<TData>) => CSSProperties | undefined) | undefined,
  row: Row<TData>,
) {
  return typeof value === "function" ? value(row) : value
}

export function Table<TData>({
  columns,
  data,
  density = "default",
  containerClassName,
  stickyHeader,
  getRowId,
  caption,
  toolbar,
  empty = "No data",
  className,
  ...rest
}: TableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  })
  const leafColumns = table.getAllLeafColumns()
  const hasFooter = leafColumns.some((column) => column.columnDef.footer !== undefined)
  const colSpan = Math.max(leafColumns.length, 1)

  return (
    <div className={cn("table-stack", containerClassName)}>
      {toolbar !== undefined && <div className="table-toolbar">{toolbar}</div>}
      <div className="table-scroll">
        <table
          data-density={density}
          data-sticky-header={stickyHeader ? "true" : undefined}
          className={cn("table", className)}
          {...rest}
        >
          {caption !== undefined && <caption>{caption}</caption>}
          <thead data-sticky={stickyHeader ? "true" : undefined}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(meta?.className, meta?.headerClassName)}
                      style={{ ...meta?.style, ...meta?.headerStyle }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <td
                        key={cell.id}
                        className={cn(meta?.className, resolveCellClass(meta?.cellClassName, row))}
                        style={{ ...meta?.style, ...resolveCellStyle(meta?.cellStyle, row) }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colSpan} className="muted">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
          {hasFooter && (
            <tfoot>
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((footer) => {
                    const meta = footer.column.columnDef.meta
                    return (
                      <td
                        key={footer.id}
                        colSpan={footer.colSpan}
                        className={cn(meta?.className)}
                        style={{ ...meta?.style }}
                      >
                        {footer.isPlaceholder
                          ? null
                          : flexRender(footer.column.columnDef.footer, footer.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
