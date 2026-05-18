import { useCallback, useState } from "react";
import type {
  TableViewItem,
  TableViewSnapshot,
} from "../components/data-display/Table";
import { useTableState } from "./useTableState";

export interface UseTableViewsOptions {
  /** Built-in (preset) views — never persisted, always present in the merged list. */
  items: TableViewItem[];
  /** Active view key on first render. Default: `items[0]?.key`. */
  defaultActive?: string;
  /** Controlled active view key. */
  activeKey?: string;
  /** Fires when the active view changes (via `apply` or `setActiveKey`). */
  onActiveKeyChange?: (key: string) => void;
  /** Fires when a user-saved view list mutates. */
  onSavedViewsChange?: (views: TableViewItem[]) => void;
  /**
   * Optional persistence — when set, user-saved views are stored under
   * this localStorage key (versioned via `useTableState`).
   */
  storageKey?: string;
  /** Max number of user-saved views kept. Default 20. */
  maxSavedViews?: number;
}

export interface UseTableViewsResult {
  /** Merged list (built-in + saved). */
  items: TableViewItem[];
  /** Saved-by-user subset only. */
  savedViews: TableViewItem[];
  activeKey: string | undefined;
  setActiveKey: (key: string) => void;
  /** Apply a view — sets active key and returns the snapshot for state hydration. */
  applyView: (view: TableViewItem) => TableViewSnapshot;
  /** Persist a new user view from the current snapshot. Returns the saved view. */
  saveView: (label: string, snapshot: TableViewSnapshot) => TableViewItem;
  /** Remove a saved view by key. No-op for built-in views. */
  deleteView: (key: string) => void;
  /** Mark active view as "custom" (e.g. after manual filter/sort edits). */
  markCustom: () => void;
}

const CUSTOM_KEY = "custom";

function isPersistableLabel(label: TableViewItem["label"]): label is string {
  return typeof label === "string";
}

function generateKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `view-${crypto.randomUUID()}`;
  }
  return `view-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * useTableViews — saved-view state for tabbed Table headers.
 *
 * Owns the active-view key + a list of user-saved views. Built-in
 * (preset) views pass through unchanged; user-saved views are
 * persisted to localStorage when `storageKey` is provided.
 *
 * @example
 *   const views = useTableViews({
 *     items: BUILT_IN_VIEWS,
 *     storageKey: "orders.views.v1",
 *   });
 *   <Table
 *     views={{
 *       items: views.items,
 *       activeKey: views.activeKey,
 *       onActiveKeyChange: views.setActiveKey,
 *       onViewApply: (v) => {
 *         const snapshot = views.applyView(v);
 *         setFilters(snapshot.filters ?? []);
 *         setSort(snapshot.sort ?? null);
 *       },
 *       onDeleteView: (v) => views.deleteView(v.key),
 *     }}
 *   />
 */
export function useTableViews(
  options: UseTableViewsOptions,
): UseTableViewsResult {
  const {
    items: builtInItems,
    defaultActive,
    activeKey: controlledActiveKey,
    onActiveKeyChange,
    onSavedViewsChange,
    storageKey,
    maxSavedViews = 20,
  } = options;

  const [internalActiveKey, setInternalActiveKey] = useState<string | undefined>(
    defaultActive ?? builtInItems[0]?.key,
  );
  const activeKey = controlledActiveKey ?? internalActiveKey;

  const [savedViews, setSavedViewsState] = useTableState<TableViewItem[]>({
    storageKey,
    defaultValue: [],
    version: 1,
  });

  const updateSavedViews = useCallback(
    (next: TableViewItem[] | ((prev: TableViewItem[]) => TableViewItem[])) => {
      setSavedViewsState((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        const trimmed = resolved.slice(-maxSavedViews);
        onSavedViewsChange?.(trimmed);
        return trimmed;
      });
    },
    [maxSavedViews, onSavedViewsChange, setSavedViewsState],
  );

  const setActiveKey = useCallback(
    (key: string) => {
      if (controlledActiveKey === undefined) setInternalActiveKey(key);
      onActiveKeyChange?.(key);
    },
    [controlledActiveKey, onActiveKeyChange],
  );

  const applyView = useCallback(
    (view: TableViewItem): TableViewSnapshot => {
      setActiveKey(view.key);
      return {
        filters: view.filters,
        sort: view.sort,
        columnVisibility: view.columnVisibility,
      };
    },
    [setActiveKey],
  );

  const saveView = useCallback(
    (label: string, snapshot: TableViewSnapshot): TableViewItem => {
      const next: TableViewItem = {
        key: generateKey(),
        label,
        ...snapshot,
        deletable: true,
      };
      updateSavedViews((prev) => [...prev, next]);
      setActiveKey(next.key);
      return next;
    },
    [setActiveKey, updateSavedViews],
  );

  const deleteView = useCallback(
    (key: string) => {
      const target = savedViews.find((view) => view.key === key);
      if (!target || !isPersistableLabel(target.label)) return;
      updateSavedViews((prev) => prev.filter((view) => view.key !== key));
      if (activeKey === key) {
        const firstBuiltIn = builtInItems[0]?.key;
        if (firstBuiltIn !== undefined) setActiveKey(firstBuiltIn);
      }
    },
    [activeKey, builtInItems, savedViews, setActiveKey, updateSavedViews],
  );

  const markCustom = useCallback(() => {
    if (activeKey === CUSTOM_KEY) return;
    setActiveKey(CUSTOM_KEY);
  }, [activeKey, setActiveKey]);

  return {
    items: [...builtInItems, ...savedViews],
    savedViews,
    activeKey,
    setActiveKey,
    applyView,
    saveView,
    deleteView,
    markCustom,
  };
}
