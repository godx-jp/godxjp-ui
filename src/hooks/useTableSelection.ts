import { useCallback, useState } from "react";

export type TableSelectionMode = "single" | "multiple";

export interface UseTableSelectionOptions {
  /** "single" replaces previous selection on toggle/select. Default "multiple". */
  mode?: TableSelectionMode;
  /** Initial selected row keys (uncontrolled). */
  defaultSelected?: string[];
  /** Controlled selected row keys — when set, hook becomes view-only. */
  selected?: string[];
  /** Fires when selection changes. */
  onChange?: (selectedRowKeys: string[]) => void;
}

export interface UseTableSelectionResult {
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  /** Toggle a single row's selection. */
  toggle: (key: string) => void;
  /** Add a row to the selection (no-op in "single" — replaces). */
  select: (key: string) => void;
  /** Remove a row from the selection. */
  deselect: (key: string) => void;
  /** Clear the selection. */
  clear: () => void;
  /** True if the row is currently selected. */
  isSelected: (key: string) => boolean;
  /** Number of selected rows. */
  count: number;
}

/**
 * useTableSelection — controlled-or-uncontrolled row selection.
 *
 * Mirrors `<Table batchActions={{ selectedRowKeys, onSelectedRowKeysChange }}>`
 * shape. `mode="single"` replaces on toggle; `mode="multiple"` (default)
 * adds/removes individual keys.
 *
 * @example
 *   const selection = useTableSelection({ mode: "multiple" });
 *   <Table
 *     batchActions={{
 *       selectedRowKeys: selection.selectedRowKeys,
 *       onSelectedRowKeysChange: selection.setSelectedRowKeys,
 *       actions: <Button onClick={() => approve(selection.selectedRowKeys)}>承認</Button>,
 *     }}
 *   />
 */
export function useTableSelection(
  options: UseTableSelectionOptions = {},
): UseTableSelectionResult {
  const {
    mode = "multiple",
    defaultSelected = [],
    selected: controlledSelected,
    onChange,
  } = options;

  const [internal, setInternal] = useState<string[]>(defaultSelected);
  const selectedRowKeys = controlledSelected ?? internal;

  const setSelectedRowKeys = useCallback(
    (next: string[]) => {
      if (controlledSelected === undefined) setInternal(next);
      onChange?.(next);
    },
    [controlledSelected, onChange],
  );

  const select = useCallback(
    (key: string) => {
      const next =
        mode === "single"
          ? [key]
          : selectedRowKeys.includes(key)
            ? selectedRowKeys
            : [...selectedRowKeys, key];
      if (next === selectedRowKeys) return;
      setSelectedRowKeys(next);
    },
    [mode, selectedRowKeys, setSelectedRowKeys],
  );

  const deselect = useCallback(
    (key: string) => {
      if (!selectedRowKeys.includes(key)) return;
      setSelectedRowKeys(selectedRowKeys.filter((k) => k !== key));
    },
    [selectedRowKeys, setSelectedRowKeys],
  );

  const toggle = useCallback(
    (key: string) => {
      if (selectedRowKeys.includes(key)) {
        setSelectedRowKeys(selectedRowKeys.filter((k) => k !== key));
      } else {
        setSelectedRowKeys(mode === "single" ? [key] : [...selectedRowKeys, key]);
      }
    },
    [mode, selectedRowKeys, setSelectedRowKeys],
  );

  const clear = useCallback(() => {
    if (selectedRowKeys.length === 0) return;
    setSelectedRowKeys([]);
  }, [selectedRowKeys.length, setSelectedRowKeys]);

  const isSelected = useCallback(
    (key: string) => selectedRowKeys.includes(key),
    [selectedRowKeys],
  );

  return {
    selectedRowKeys,
    setSelectedRowKeys,
    toggle,
    select,
    deselect,
    clear,
    isSelected,
    count: selectedRowKeys.length,
  };
}
