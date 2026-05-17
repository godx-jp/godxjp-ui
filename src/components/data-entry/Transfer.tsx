import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../cn";
import { Checkbox } from "./Checkbox";
import { IconButton } from "../data-display/IconButton";
import { Input } from "./Input";

/**
 * Transfer — dual list-box. Items in the left ("source") column move
 * to the right ("target") column via arrow buttons; `value` tracks
 * the keys currently on the right.
 *
 * Vocabulary per cardinal rule 23 §B:
 *   • `value` / `defaultValue` / `onValueChange` (Radix-style)
 *     — NOT `targetKeys`. The string-array carries "the chosen set",
 *     which on this primitive happens to be the right column.
 *   • `size`: `"small" | "default" | "large"`
 *   • `disabled` boolean
 *
 * DOM mirrors `.transfer` / `.transfer-list` / `.transfer-actions`
 * from `30-input.css`.
 */

export interface TransferItem {
  key: string;
  label: ReactNode;
  disabled?: boolean;
}

export type TransferSize = "small" | "default" | "large";

export interface TransferProps {
  dataSource: TransferItem[];
  /** Keys currently on the right ("target") column. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Headers for the two columns — `[left, right]`. */
  titles?: [ReactNode, ReactNode];
  size?: TransferSize;
  disabled?: boolean;
  className?: string;
  /** Search box above each column. */
  showSearch?: boolean;
  /** Placeholder for the search input when `showSearch` is true. */
  searchPlaceholder?: string;
  /** Renderer for each item label (defaults to `item.label`). */
  renderItem?: (item: TransferItem) => ReactNode;
}

const COLUMN_INDEX = { left: 0, right: 1 } as const;
type ColumnSide = keyof typeof COLUMN_INDEX;

export const Transfer = forwardRef<HTMLDivElement, TransferProps>(
  function Transfer(
    {
      dataSource,
      value,
      defaultValue,
      onValueChange,
      titles = ["", ""],
      size = "default",
      disabled,
      className,
      showSearch,
      searchPlaceholder,
      renderItem,
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [internalRight, setInternalRight] = useState<string[]>(
      defaultValue ?? [],
    );
    const rightKeys = isControlled ? value ?? [] : internalRight;
    const rightSet = useMemo(() => new Set(rightKeys), [rightKeys]);

    const [selectedLeft, setSelectedLeft] = useState<Set<string>>(new Set());
    const [selectedRight, setSelectedRight] = useState<Set<string>>(new Set());
    const [searchLeft, setSearchLeft] = useState("");
    const [searchRight, setSearchRight] = useState("");

    const leftItems = useMemo(
      () => dataSource.filter((i) => !rightSet.has(i.key)),
      [dataSource, rightSet],
    );
    const rightItems = useMemo(
      () => dataSource.filter((i) => rightSet.has(i.key)),
      [dataSource, rightSet],
    );

    const visibleLeft = useMemo(
      () => filterBySearch(leftItems, searchLeft),
      [leftItems, searchLeft],
    );
    const visibleRight = useMemo(
      () => filterBySearch(rightItems, searchRight),
      [rightItems, searchRight],
    );

    const commit = useCallback(
      (nextRight: string[]) => {
        if (!isControlled) setInternalRight(nextRight);
        onValueChange?.(nextRight);
      },
      [isControlled, onValueChange],
    );

    const moveRight = useCallback(() => {
      if (disabled) return;
      const movable = leftItems.filter(
        (i) => selectedLeft.has(i.key) && !i.disabled,
      );
      if (movable.length === 0) return;
      const moved = new Set(movable.map((i) => i.key));
      commit([...rightKeys, ...moved]);
      const stillSelected = new Set(selectedLeft);
      for (const k of moved) stillSelected.delete(k);
      setSelectedLeft(stillSelected);
    }, [commit, disabled, leftItems, rightKeys, selectedLeft]);

    const moveLeft = useCallback(() => {
      if (disabled) return;
      const movable = rightItems.filter(
        (i) => selectedRight.has(i.key) && !i.disabled,
      );
      if (movable.length === 0) return;
      const moved = new Set(movable.map((i) => i.key));
      commit(rightKeys.filter((k) => !moved.has(k)));
      const stillSelected = new Set(selectedRight);
      for (const k of moved) stillSelected.delete(k);
      setSelectedRight(stillSelected);
    }, [commit, disabled, rightItems, rightKeys, selectedRight]);

    const toggleItem = (side: ColumnSide, key: string, item: TransferItem) => {
      if (disabled || item.disabled) return;
      const setter = side === "left" ? setSelectedLeft : setSelectedRight;
      setter((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    };

    const sizeClass = SIZE_CLASS[size];

    return (
      <div
        ref={ref}
        className={cn("transfer", sizeClass, className)}
        aria-disabled={disabled || undefined}
      >
        <Column
          title={titles[0]}
          totalCount={leftItems.length}
          selectedCount={selectedLeft.size}
          visibleItems={visibleLeft}
          selected={selectedLeft}
          disabled={disabled}
          showSearch={showSearch}
          searchValue={searchLeft}
          onSearchChange={setSearchLeft}
          searchPlaceholder={searchPlaceholder}
          renderItem={renderItem}
          onToggle={(key, item) => toggleItem("left", key, item)}
          size={size}
        />
        <div className="transfer-actions">
          <IconButton
            aria-label="Move right"
            disabled={disabled || selectedLeft.size === 0}
            onClick={moveRight}
            size={size === "small" ? "sm" : "default"}
          >
            <ChevronRight size={14} aria-hidden />
          </IconButton>
          <IconButton
            aria-label="Move left"
            disabled={disabled || selectedRight.size === 0}
            onClick={moveLeft}
            size={size === "small" ? "sm" : "default"}
          >
            <ChevronLeft size={14} aria-hidden />
          </IconButton>
        </div>
        <Column
          title={titles[1]}
          totalCount={rightItems.length}
          selectedCount={selectedRight.size}
          visibleItems={visibleRight}
          selected={selectedRight}
          disabled={disabled}
          showSearch={showSearch}
          searchValue={searchRight}
          onSearchChange={setSearchRight}
          searchPlaceholder={searchPlaceholder}
          renderItem={renderItem}
          onToggle={(key, item) => toggleItem("right", key, item)}
          size={size}
        />
      </div>
    );
  },
);

// ─── Internals ────────────────────────────────────────────────────

const SIZE_CLASS: Record<TransferSize, string> = {
  small: "transfer-size-small",
  default: "",
  large: "transfer-size-large",
};

function filterBySearch(items: TransferItem[], query: string): TransferItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((i) => {
    const labelText = typeof i.label === "string" ? i.label : i.key;
    return labelText.toLowerCase().includes(q);
  });
}

interface ColumnProps {
  title: ReactNode;
  totalCount: number;
  selectedCount: number;
  visibleItems: TransferItem[];
  selected: Set<string>;
  disabled?: boolean;
  showSearch?: boolean;
  searchValue: string;
  onSearchChange: (next: string) => void;
  searchPlaceholder?: string;
  renderItem?: (item: TransferItem) => ReactNode;
  onToggle: (key: string, item: TransferItem) => void;
  size: TransferSize;
}

function Column({
  title,
  totalCount,
  selectedCount,
  visibleItems,
  selected,
  disabled,
  showSearch,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  renderItem,
  onToggle,
  size,
}: ColumnProps) {
  return (
    <div className="transfer-list">
      <div className="transfer-list-header">
        <span>
          {title}
          {selectedCount > 0 ? ` (${selectedCount}/${totalCount})` : ` (${totalCount})`}
        </span>
      </div>
      {showSearch && (
        <div className="transfer-list-search">
          <Input
            size={size === "large" ? "default" : "small"}
            placeholder={searchPlaceholder}
            value={searchValue}
            disabled={disabled}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      <div className="transfer-list-body">
        {visibleItems.map((item) => {
          const itemDisabled = disabled || item.disabled;
          const checked = selected.has(item.key);
          return (
            <div
              key={item.key}
              className="transfer-list-item"
              aria-disabled={itemDisabled || undefined}
              onClick={() => onToggle(item.key, item)}
            >
              <Checkbox
                checked={checked}
                disabled={itemDisabled}
                onCheckedChange={() => onToggle(item.key, item)}
                onClick={(e) => e.stopPropagation()}
              />
              <span>{renderItem ? renderItem(item) : item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
