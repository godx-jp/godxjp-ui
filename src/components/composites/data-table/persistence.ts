/**
 * @godxjp/ui DataTable — localStorage persistence helpers.
 *
 * Moved out of `data-display/Table.persistence.ts` in Stage 4b
 * (Plan §3). The `<DataTable>` composite owns persistence; the slim
 * `<Table>` primitive no longer reads or writes localStorage.
 *
 * Industry standard. Modern table libraries (TanStack, Material
 * React Table, Mantine React Table) recommend persistence as
 * consumer code via `useState` + `on[StateName]Change` callbacks
 * rather than a built-in primitive feature. The same pattern is
 * available via the `useTableState` hook (see
 * `docs/reference/hooks/useTableState.md`) — that's the preferred
 * surface for new consumers.
 */
import type { ColumnPinningState } from "@tanstack/react-table";
import type {
  TableColumn,
  TableColumnVisibility,
  TableFilter,
  TableSort,
  TableViewItem,
} from "../../data-display/Table.types";

export const MAX_PERSISTED_TABLE_VIEWS = 20;

export function getTableColumnVisibilityStorageKey(tableKey: string): string {
  return `godxui:table:${tableKey}:columnVisibility`;
}

export function getTableColumnPinningStorageKey(tableKey: string): string {
  return `godxui:table:${tableKey}:columnPinning`;
}

export function getTableViewsStorageKey(tableKey: string): string {
  return `godxui:table:${tableKey}:views`;
}

interface PersistedColumnVisibility {
  version: 1;
  columnKeys: string[];
  visibility: TableColumnVisibility;
}

interface PersistedColumnPinning {
  version: 2;
  columnKeys: string[];
  pinning: { left: string[]; right: string[] };
}

interface PersistedTableView {
  key: string;
  label: string;
  filters?: TableFilter[];
  sort?: TableSort | null;
  columnVisibility?: TableColumnVisibility;
}

interface PersistedTableViews {
  version: 1;
  columnKeys: string[];
  views: PersistedTableView[];
}

function isColumnVisibility(
  value: unknown,
): value is TableColumnVisibility {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "boolean")
  );
}

function localGetColumnKey<TData>(
  column: TableColumn<TData, unknown>,
): string | undefined {
  const maybeAccessor = column as { accessorKey?: unknown; id?: string };
  if (typeof maybeAccessor.id === "string") return maybeAccessor.id;
  if (typeof maybeAccessor.accessorKey === "string")
    return maybeAccessor.accessorKey;
  return undefined;
}

function getColumnKeys<TData>(
  columns: TableColumn<TData, unknown>[],
): string[] {
  return columns
    .map((column) => localGetColumnKey(column))
    .filter((key): key is string => key !== undefined)
    .sort();
}

function hasSameColumnKeys(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((key, index) => key === right[index])
  );
}

function isPersistedColumnVisibility(
  value: unknown,
): value is PersistedColumnVisibility {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const candidate = value as {
    version?: unknown;
    columnKeys?: unknown;
    visibility?: unknown;
  };
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.columnKeys) &&
    candidate.columnKeys.every((item) => typeof item === "string") &&
    isColumnVisibility(candidate.visibility)
  );
}

export function readPersistedColumnVisibility<TData>(
  tableKey: string | undefined,
  columns: TableColumn<TData, unknown>[],
): TableColumnVisibility | undefined {
  if (tableKey === undefined || typeof window === "undefined") return undefined;
  try {
    const stored = window.localStorage.getItem(
      getTableColumnVisibilityStorageKey(tableKey),
    );
    if (stored === null) return undefined;
    const parsed = JSON.parse(stored) as unknown;
    if (!isPersistedColumnVisibility(parsed)) return undefined;
    if (!hasSameColumnKeys(parsed.columnKeys, getColumnKeys(columns)))
      return undefined;
    return parsed.visibility;
  } catch {
    return undefined;
  }
}

export function writePersistedColumnVisibility<TData>(
  tableKey: string | undefined,
  columns: TableColumn<TData, unknown>[],
  columnVisibility: TableColumnVisibility,
): void {
  if (tableKey === undefined || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getTableColumnVisibilityStorageKey(tableKey),
      JSON.stringify({
        version: 1,
        columnKeys: getColumnKeys(columns),
        visibility: columnVisibility,
      } satisfies PersistedColumnVisibility),
    );
  } catch {
    // localStorage can be unavailable in private browsing or sandboxed iframes.
  }
}

function isPersistedColumnPinning(
  value: unknown,
): value is PersistedColumnPinning {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const candidate = value as {
    version?: unknown;
    columnKeys?: unknown;
    pinning?: unknown;
  };
  if (
    candidate.version !== 2 ||
    !Array.isArray(candidate.columnKeys) ||
    !candidate.columnKeys.every((item) => typeof item === "string") ||
    typeof candidate.pinning !== "object" ||
    candidate.pinning === null
  )
    return false;
  const pinning = candidate.pinning as { left?: unknown; right?: unknown };
  const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((item) => typeof item === "string");
  return isStringArray(pinning.left) && isStringArray(pinning.right);
}

export function readPersistedColumnPinning<TData>(
  tableKey: string | undefined,
  columns: TableColumn<TData, unknown>[],
): ColumnPinningState | undefined {
  if (tableKey === undefined || typeof window === "undefined") return undefined;
  try {
    const stored = window.localStorage.getItem(
      getTableColumnPinningStorageKey(tableKey),
    );
    if (stored === null) return undefined;
    const parsed = JSON.parse(stored) as unknown;
    if (!isPersistedColumnPinning(parsed)) return undefined;
    if (!hasSameColumnKeys(parsed.columnKeys, getColumnKeys(columns)))
      return undefined;
    return { left: parsed.pinning.left, right: parsed.pinning.right };
  } catch {
    return undefined;
  }
}

export function writePersistedColumnPinning<TData>(
  tableKey: string | undefined,
  columns: TableColumn<TData, unknown>[],
  columnPinning: ColumnPinningState,
): void {
  if (tableKey === undefined || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getTableColumnPinningStorageKey(tableKey),
      JSON.stringify({
        version: 2,
        columnKeys: getColumnKeys(columns),
        pinning: {
          left: columnPinning.left ?? [],
          right: columnPinning.right ?? [],
        },
      } satisfies PersistedColumnPinning),
    );
  } catch {
    // localStorage can be unavailable in private browsing or sandboxed iframes.
  }
}

function isPersistedTableView(value: unknown): value is PersistedTableView {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const candidate = value as Partial<PersistedTableView>;
  return (
    typeof candidate.key === "string" &&
    typeof candidate.label === "string" &&
    (candidate.filters === undefined || Array.isArray(candidate.filters)) &&
    (candidate.columnVisibility === undefined ||
      isColumnVisibility(candidate.columnVisibility))
  );
}

export function readPersistedTableViews<TData>(
  tableKey: string | undefined,
  columns: TableColumn<TData, unknown>[],
): TableViewItem[] {
  if (tableKey === undefined || typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(getTableViewsStorageKey(tableKey));
    if (stored === null) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return [];
    const candidate = parsed as Partial<PersistedTableViews>;
    if (
      candidate.version !== 1 ||
      !Array.isArray(candidate.columnKeys) ||
      !hasSameColumnKeys(candidate.columnKeys, getColumnKeys(columns)) ||
      !Array.isArray(candidate.views)
    )
      return [];
    return candidate.views
      .filter(isPersistedTableView)
      .slice(-MAX_PERSISTED_TABLE_VIEWS)
      .map((view) => ({
        ...view,
        deletable: true,
      }));
  } catch {
    return [];
  }
}

export function writePersistedTableViews<TData>(
  tableKey: string | undefined,
  columns: TableColumn<TData, unknown>[],
  views: TableViewItem[],
): void {
  if (tableKey === undefined || typeof window === "undefined") return;
  try {
    const persistedViews = views
      .flatMap((view): PersistedTableView[] =>
        typeof view.label === "string"
          ? [
              {
                key: view.key,
                label: view.label,
                filters: view.filters,
                sort: view.sort,
                columnVisibility: view.columnVisibility,
              },
            ]
          : [],
      )
      .slice(-MAX_PERSISTED_TABLE_VIEWS);
    window.localStorage.setItem(
      getTableViewsStorageKey(tableKey),
      JSON.stringify({
        version: 1,
        columnKeys: getColumnKeys(columns),
        views: persistedViews,
      } satisfies PersistedTableViews),
    );
  } catch {
    // localStorage can be unavailable in private browsing or sandboxed iframes.
  }
}
