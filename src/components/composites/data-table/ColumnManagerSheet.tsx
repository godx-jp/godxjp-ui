/**
 * @godxjp/ui DataTable — column manager Sheet.
 *
 * Stage 4b of the Table refactor (Plan §3). Lives on the composite
 * side. Reads + writes column visibility + pinning through the
 * provided TanStack `table` instance.
 */
import { Lock, LockOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  Column,
  ColumnPinningState,
  Table as ReactTable,
} from "@tanstack/react-table";
import { Button } from "../../general/Button";
import { Checkbox } from "../../data-entry/Checkbox";
import { Sheet } from "../../feedback/Sheet";
import type { TableColumn } from "../../data-display/Table.types";

function getColumnKeyFromDef<TData>(
  column: TableColumn<TData, unknown>,
): string | undefined {
  const maybeAccessor = column as { accessorKey?: unknown; id?: string };
  if (typeof maybeAccessor.id === "string") return maybeAccessor.id;
  if (typeof maybeAccessor.accessorKey === "string")
    return maybeAccessor.accessorKey;
  return undefined;
}

function getColumnSettingsLabel<TData>(column: Column<TData, unknown>) {
  const meta = column.columnDef.meta;
  if (meta?.filterLabel !== undefined) return meta.filterLabel;
  if (typeof column.columnDef.header === "string") return column.columnDef.header;
  return column.id;
}

interface ColumnManagerSheetProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: ReactTable<TData>;
  autoColumnPinning: ColumnPinningState;
  columnPinning: ColumnPinningState;
  onColumnPinningChange: (pinning: ColumnPinningState) => void;
}

export function ColumnManagerSheet<TData>(props: ColumnManagerSheetProps<TData>) {
  const { open, onOpenChange, table, autoColumnPinning, columnPinning, onColumnPinningChange } = props;
  const { t } = useTranslation();
  const columnSettingsColumns = table
    .getAllLeafColumns()
    .filter(
      (column) =>
        getColumnKeyFromDef(column.columnDef) !== undefined &&
        column.columnDef.meta?.hideable !== false &&
        column.getCanHide(),
    );

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      className="table-filter-sheet"
      side="right"
      title={t("table.columnSettings")}
      description={t("table.columnSettingsDescription")}
      footer={
        <>
          <Button
            size="small"
            variant="ghost"
            onClick={() => table.setColumnVisibility({})}
          >
            {t("table.showAllColumns")}
          </Button>
          <Button size="small" onClick={() => onOpenChange(false)}>
            {t("table.closeColumnSettings")}
          </Button>
        </>
      }
    >
      <div className="table-filter-field-list">
        {columnSettingsColumns.map((column) => {
          const pinned = column.getIsPinned();
          const isAutoPinned =
            (autoColumnPinning.left ?? []).includes(column.id) ||
            (autoColumnPinning.right ?? []).includes(column.id);
          return (
            <section key={column.id} className="table-column-field">
              <Checkbox
                checked={column.getIsVisible()}
                disabled={pinned !== false}
                onCheckedChange={(checked) =>
                  column.toggleVisibility(checked === true)
                }
              >
                {getColumnSettingsLabel(column)}
              </Checkbox>
              <button
                type="button"
                className="col-lock"
                aria-label={
                  pinned === false
                    ? t("table.lockColumn")
                    : t("table.unlockColumn")
                }
                aria-pressed={pinned !== false}
                data-locked={pinned !== false ? "true" : "false"}
                disabled={isAutoPinned}
                onClick={() => {
                  const next: ColumnPinningState = {
                    left: [...(columnPinning.left ?? [])],
                    right: [...(columnPinning.right ?? [])],
                  };
                  next.left = (next.left ?? []).filter(
                    (id) => id !== column.id,
                  );
                  next.right = (next.right ?? []).filter(
                    (id) => id !== column.id,
                  );
                  if (pinned === false) {
                    next.left = [...(next.left ?? []), column.id];
                    if (!column.getIsVisible()) column.toggleVisibility(true);
                  }
                  onColumnPinningChange(next);
                }}
              >
                {pinned === false ? (
                  <LockOpen aria-hidden="true" focusable="false" />
                ) : (
                  <Lock aria-hidden="true" focusable="false" />
                )}
              </button>
            </section>
          );
        })}
      </div>
    </Sheet>
  );
}
