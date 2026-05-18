import { type ReactNode } from "react";
import { cn } from "../../cn";
import {
  Table,
  type TableToolbarConfig,
} from "../../data-display/Table";
import type { DataTableInstance } from "./useDataTable";

export interface DataTableSlots {
  /** Override the toolbar entirely — replaces the default rendering. */
  toolbar?: ReactNode;
  /** Toolbar primary action (＋ 新規 / Create new). Falls through to `toolbar.primaryAction`. */
  primaryAction?: TableToolbarConfig["primaryAction"];
  /** Extra toolbar nodes appended after `primaryAction` / columns button. */
  toolbarActions?: TableToolbarConfig["actions"];
  /** Footer content rendered below the body (above pagination). */
  footer?: ReactNode;
  /** Empty-state override — replaces the default `<Empty>` primitive. */
  emptyState?: ReactNode;
}

export interface DataTableProps<TData> {
  /** Table instance from `useDataTable`. */
  table: DataTableInstance<TData>;
  /** Replaceable regions of the rendered tree. */
  slots?: DataTableSlots;
  /** Forwarded to the outer `<table>` className. */
  className?: string;
  /** Forwarded to the `.table-stack` wrapper className. */
  containerClassName?: string;
}

function mergeToolbar(
  base: DataTableInstance<unknown>["tableProps"]["toolbar"],
  slots: DataTableSlots | undefined,
):
  | DataTableInstance<unknown>["tableProps"]["toolbar"]
  | undefined {
  if (slots?.toolbar !== undefined) return slots.toolbar;
  if (
    base === undefined ||
    base === false ||
    typeof base !== "object" ||
    Array.isArray(base) ||
    "props" in (base as object)
  )
    return base;
  const config = base as TableToolbarConfig;
  return {
    ...config,
    primaryAction: slots?.primaryAction ?? config.primaryAction,
    actions: slots?.toolbarActions ?? config.actions,
  };
}

/**
 * DataTable — packaged-table composite.
 *
 * Thin orchestrator over `<Table>` that consumes the typed instance
 * returned by `useDataTable`. Slot overrides re-use the same shared
 * vocabulary as the primitive (`toolbar`, `primaryAction`,
 * `emptyState`, `footer`). Persistence belongs to the hooks
 * (`useTableState`, `useTableViews`) — not to this surface.
 *
 * Stage 3 of the Table refactor (Plan §3). Future stages will move
 * toolbar / view-tabs / filter-bar rendering off `<Table>` and into
 * this composite — for now the composite delegates to the primitive.
 */
export function DataTable<TData>({
  table,
  slots,
  className,
  containerClassName,
}: DataTableProps<TData>) {
  const props = table.tableProps;
  return (
    <Table
      {...props}
      className={cn(props.className, className)}
      containerClassName={cn(props.containerClassName, containerClassName)}
      toolbar={mergeToolbar(props.toolbar, slots)}
      empty={slots?.emptyState ?? props.empty}
      footer={slots?.footer ?? props.footer}
    />
  );
}
