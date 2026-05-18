import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnPinningState,
  type Row,
  type RowData,
} from "@tanstack/react-table"
import type { CSSProperties, HTMLAttributes, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "../cn"
import { Select } from "../data-entry/Select"
import { Button } from "../general/Button"
import { Empty } from "./Empty"
import { Tag, type TagPresetColor } from "./Tag"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    headerClassName?: string
    cellClassName?: string | ((row: Row<TData>) => string | undefined)
    style?: CSSProperties
    headerStyle?: CSSProperties
    cellStyle?: CSSProperties | ((row: Row<TData>) => CSSProperties | undefined)
    filterable?: boolean
    filterLabel?: ReactNode
    filterOptions?: TableFilterOption[]
    sortable?: boolean
    sticky?: "left" | "right"
  }
}

export type TableDensity = "default" | "compact"
export type TableColumn<TData, TValue = unknown> = ColumnDef<TData, TValue>
export type TableFilterOperator =
  | "eq"
  | "neq"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in"

export interface TableFilter {
  key: string
  operator?: TableFilterOperator
  value?: string | number | boolean | null
  valueLabel?: ReactNode
}

export interface TableSort {
  key: string
  direction: "asc" | "desc"
}

export interface TableFilterOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface TableFilterItem {
  key: string
  label: ReactNode
  value?: string
  valueLabel?: ReactNode
  options?: TableFilterOption[]
  onValueChange?: (value: string) => void
  color?: TagPresetColor | string
  closable?: boolean
  onClose?: () => void
}

export type TableFilterBar = ReactNode | TableFilterItem[]

export interface TableProps<TData>
  extends Omit<HTMLAttributes<HTMLTableElement>, "children"> {
  columns: TableColumn<TData, unknown>[]
  data: TData[]
  density?: TableDensity
  containerClassName?: string
  stickyHeader?: boolean
  getRowId?: (row: TData, index: number) => string
  caption?: ReactNode
  views?: ReactNode
  toolbar?: ReactNode
  filters?: TableFilter[]
  onFiltersChange?: (filters: TableFilter[]) => void
  sort?: TableSort | null
  onSortChange?: (sort: TableSort | null) => void
  filterBar?: TableFilterBar
  pagination?: ReactNode
  footer?: ReactNode
  empty?: ReactNode
  onResetFilters?: () => void
  rowClassName?: string | ((row: Row<TData>) => string | undefined)
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

function isFilterItems(filterBar: TableFilterBar | undefined): filterBar is TableFilterItem[] {
  return Array.isArray(filterBar)
}

function renderFilterBar(filterBar: TableFilterBar, label: string) {
  if (!isFilterItems(filterBar)) return filterBar
  return (
    <>
      <span className="lbl">{label}:</span>
      {filterBar.map((item) => {
        if (item.options !== undefined) {
          return (
            <span key={item.key} className="table-filter-select-wrap">
              <Select
                value={item.value}
                onValueChange={item.onValueChange}
                options={item.options.map((option) => ({
                  ...option,
                  label: `${item.label}: ${option.label}`,
                }))}
                triggerClassName="table-filter-select"
              />
              {item.onClose !== undefined && (
                <button
                  type="button"
                  className="table-filter-clear"
                  onClick={item.onClose}
                  aria-label={`${item.label} clear`}
                >
                  ×
                </button>
              )}
            </span>
          )
        }
        return (
          <Tag
            key={item.key}
            color={item.color ?? "primary"}
            closable={item.closable ?? item.onClose !== undefined}
            onClose={item.onClose}
          >
            {item.label} = {item.valueLabel ?? item.value}
          </Tag>
        )
      })}
    </>
  )
}

function getColumnKey<TData>(column: TableColumn<TData, unknown>): string | undefined {
  const maybeAccessor = column as { accessorKey?: unknown; id?: string }
  if (typeof maybeAccessor.id === "string") return maybeAccessor.id
  if (typeof maybeAccessor.accessorKey === "string") return maybeAccessor.accessorKey
  return undefined
}

function labelForColumn<TData>(column: TableColumn<TData, unknown>, key: string): ReactNode {
  if (column.meta?.filterLabel !== undefined) return column.meta.filterLabel
  if (typeof column.header === "string") return column.header
  return key
}

function valueLabelFor(optionList: TableFilterOption[] | undefined, value: TableFilter["value"]) {
  const option = optionList?.find((item) => item.value === String(value))
  return option?.label ?? value
}

function deriveFilterBar<TData>(
  columns: TableColumn<TData, unknown>[],
  filters: TableFilter[] | undefined,
  onFiltersChange: ((filters: TableFilter[]) => void) | undefined,
): TableFilterItem[] {
  if (filters === undefined || filters.length === 0) return []
  return filters.flatMap((filter) => {
    const column = columns.find((item) => getColumnKey(item) === filter.key)
    if (column !== undefined && column.meta?.filterable !== true) return []
    const options = column?.meta?.filterOptions
    return [{
      key: filter.key,
      label: column ? labelForColumn(column, filter.key) : filter.key,
      value: filter.value == null ? undefined : String(filter.value),
      valueLabel: filter.valueLabel ?? valueLabelFor(options, filter.value),
      options,
      onValueChange: options !== undefined && onFiltersChange !== undefined
        ? (value) => onFiltersChange(filters.map((item) => (
          item.key === filter.key ? { ...item, value, valueLabel: valueLabelFor(options, value) } : item
        )))
        : undefined,
      closable: onFiltersChange !== undefined,
      onClose: onFiltersChange !== undefined
        ? () => onFiltersChange(filters.filter((item) => item.key !== filter.key))
        : undefined,
    }]
  })
}

function nextSort(current: TableSort | null | undefined, key: string): TableSort | null {
  if (current?.key !== key) return { key, direction: "asc" }
  if (current.direction === "asc") return { key, direction: "desc" }
  return null
}

function deriveColumnPinning<TData>(columns: TableColumn<TData, unknown>[]): ColumnPinningState {
  return columns.reduce<ColumnPinningState>((state, column) => {
    const key = getColumnKey(column)
    if (key === undefined || column.meta?.sticky === undefined) return state
    const side = column.meta.sticky
    return { ...state, [side]: [...(state[side] ?? []), key] }
  }, { left: [], right: [] })
}

function getColumnStyle<TData>(
  column: Column<TData, unknown>,
  extra?: CSSProperties,
): CSSProperties {
  const pinned = column.getIsPinned()
  const size = column.columnDef.size
  return {
    width: size !== undefined ? `${column.getSize()}px` : undefined,
    minWidth: column.columnDef.minSize !== undefined ? `${column.columnDef.minSize}px` : undefined,
    maxWidth: column.columnDef.maxSize !== undefined ? `${column.columnDef.maxSize}px` : undefined,
    position: pinned ? "sticky" : undefined,
    left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: pinned === "right" ? `${column.getAfter("right")}px` : undefined,
    zIndex: pinned ? 2 : undefined,
    ...extra,
  }
}

export function Table<TData>({
  columns,
  data,
  density,
  containerClassName,
  stickyHeader,
  getRowId,
  caption,
  views,
  toolbar,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  filterBar,
  pagination,
  footer,
  empty,
  onResetFilters,
  rowClassName,
  className,
  ...rest
}: TableProps<TData>) {
  const { t } = useTranslation()
  const columnPinning = deriveColumnPinning(columns)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    enableColumnPinning: true,
    state: { columnPinning },
  })
  const leafColumns = table.getAllLeafColumns()
  const hasFooter = leafColumns.some((column) => column.columnDef.footer !== undefined)
  const colSpan = Math.max(leafColumns.length, 1)
  const activeFilterBar = filterBar ?? deriveFilterBar(columns, filters, onFiltersChange)
  const hasFilterBar = activeFilterBar !== undefined && (!isFilterItems(activeFilterBar) || activeFilterBar.length > 0)
  const emptyContent = empty ?? (
    <Empty description={t("table.emptyDescription")}>
      {hasFilterBar && onResetFilters !== undefined && (
        <Button size="small" variant="outline" onClick={onResetFilters}>
          {t("table.resetFilters")}
        </Button>
      )}
    </Empty>
  )

  return (
    <div className={cn("table-stack", containerClassName)} data-density={density}>
      {views !== undefined && <div className="tbl-views">{views}</div>}
      {toolbar !== undefined && <div className="table-toolbar">{toolbar}</div>}
      {hasFilterBar && (
        <div className="tbl-filter-bar">
          {renderFilterBar(activeFilterBar, t("table.conditions"))}
          {onResetFilters !== undefined && (
            <Button size="x-small" variant="ghost" onClick={onResetFilters}>
              {t("table.resetFilters")}
            </Button>
          )}
        </div>
      )}
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
                  const columnKey = getColumnKey(header.column.columnDef)
                  const isSortable = meta?.sortable === true && columnKey !== undefined && onSortChange !== undefined
                  const sortedDirection = columnKey !== undefined && sort?.key === columnKey ? sort.direction : undefined
                  const headerContent = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        meta?.className,
                        meta?.headerClassName,
                        header.column.getIsPinned() && `table-pinned-${header.column.getIsPinned()}`,
                        isSortable && "sortable",
                      )}
                      style={getColumnStyle(header.column, { ...meta?.style, ...meta?.headerStyle })}
                      aria-sort={
                        sortedDirection === "asc"
                          ? "ascending"
                          : sortedDirection === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {isSortable ? (
                        <button
                          type="button"
                          className="table-sort-button"
                          onClick={() => onSortChange(nextSort(sort, columnKey))}
                        >
                          {headerContent}
                          <span className="sort" aria-hidden>
                            <span className={sortedDirection === "asc" ? "a on" : "a"}>▲</span>
                            <span className={sortedDirection === "desc" ? "d on" : "d"}>▼</span>
                          </span>
                        </button>
                      ) : headerContent}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={resolveCellClass(rowClassName, row)}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          meta?.className,
                          cell.column.getIsPinned() && `table-pinned-${cell.column.getIsPinned()}`,
                          resolveCellClass(meta?.cellClassName, row),
                        )}
                        style={getColumnStyle(cell.column, { ...meta?.style, ...resolveCellStyle(meta?.cellStyle, row) })}
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
                  {emptyContent}
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
      {footer !== undefined && <div className="tbl-footer">{footer}</div>}
      {pagination !== undefined && <div className="tbl-pagination">{pagination}</div>}
    </div>
  )
}
