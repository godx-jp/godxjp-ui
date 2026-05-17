import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../cn";
import { Checkbox } from "../data-entry/Checkbox";

/**
 * Tree — standalone hierarchical view (no popover).
 *
 * Sibling of `<TreeSelect>` — same recursive shape, but renders inline.
 * Useful for org charts, file explorers, category navigators where the
 * tree IS the surface (not a dropdown).
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `value` / `defaultValue` / `onValueChange` — Radix-style selection
 *     (single: `string`; multiple: `string[]`).
 *   - `multiple` — boolean (NEVER `mode="multiple"`).
 *   - `expandedKeys` / `defaultExpandedKeys` / `onExpandedKeysChange`
 *     — expansion state.
 *   - `checkable` — render checkboxes alongside labels.
 *   - `showLine` — render dashed indent guides.
 *
 * @example
 *   <Tree
 *     treeData={[
 *       { key: "eng", title: "エンジニアリング", children: [
 *         { key: "fe", title: "Frontend" },
 *         { key: "be", title: "Backend" },
 *       ]},
 *     ]}
 *     defaultExpandedKeys={["eng"]}
 *   />
 */

export interface TreeNode {
  key: string;
  title: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  selectable?: boolean;
  children?: TreeNode[];
}

export interface TreeProps {
  treeData: TreeNode[];
  /** Selected key(s). */
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  /** Allow multi-select. */
  multiple?: boolean;
  /** Initially-expanded node keys. */
  defaultExpandedKeys?: string[];
  /** Controlled expanded keys. */
  expandedKeys?: string[];
  onExpandedKeysChange?: (keys: string[]) => void;
  /** Render checkboxes (multi-select via checkbox). Implies `multiple`. */
  checkable?: boolean;
  /** Render dashed connector lines between depths. */
  showLine?: boolean;
  className?: string;
}

function normalizeIn(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

interface NodeRowProps {
  node: TreeNode;
  depth: number;
  multiple: boolean;
  checkable: boolean;
  selectedSet: Set<string>;
  expandedSet: Set<string>;
  onToggleExpand: (key: string) => void;
  onSelect: (node: TreeNode) => void;
}

function NodeRow({
  node,
  depth,
  multiple,
  checkable,
  selectedSet,
  expandedSet,
  onToggleExpand,
  onSelect,
}: NodeRowProps): ReactNode {
  const hasChildren = !!node.children && node.children.length > 0;
  const isExpanded = expandedSet.has(node.key);
  const isSelected = selectedSet.has(node.key);
  const isSelectable = node.selectable !== false && !node.disabled;
  return (
    <li
      className="tree-node"
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected || undefined}
      aria-disabled={node.disabled || undefined}
    >
      <div
        className="tree-node-row"
        data-selected={isSelected ? "true" : undefined}
        data-disabled={node.disabled ? "true" : undefined}
        style={{
          paddingLeft: `calc(var(--spacing-2) + ${depth} * var(--spacing-4))`,
        }}
        onClick={() => isSelectable && onSelect(node)}
      >
        {hasChildren ? (
          <button
            type="button"
            className="tree-toggle"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            data-expanded={isExpanded ? "true" : "false"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand(node.key);
            }}
          >
            <ChevronRight aria-hidden className="tree-toggle-icon" />
          </button>
        ) : (
          <span className="tree-toggle" aria-hidden />
        )}
        {checkable ? (
          <Checkbox
            className="tree-checkbox"
            checked={isSelected}
            disabled={node.disabled}
            onCheckedChange={() => isSelectable && onSelect(node)}
            onClick={(event) => event.stopPropagation()}
          />
        ) : null}
        {node.icon !== undefined && (
          <span className="tree-icon" aria-hidden>
            {node.icon}
          </span>
        )}
        <span className="tree-label">{node.title}</span>
      </div>
      {hasChildren ? (
        <ul
          className="tree-children"
          role="group"
          data-expanded={isExpanded ? "true" : "false"}
        >
          {node.children!.map((child) => (
            <NodeRow
              key={child.key}
              node={child}
              depth={depth + 1}
              multiple={multiple}
              checkable={checkable}
              selectedSet={selectedSet}
              expandedSet={expandedSet}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export const Tree = forwardRef<HTMLUListElement, TreeProps>(function Tree(
  {
    treeData,
    value,
    defaultValue,
    onValueChange,
    multiple = false,
    defaultExpandedKeys,
    expandedKeys,
    onExpandedKeysChange,
    checkable = false,
    showLine = false,
    className,
  },
  ref,
) {
  const isMulti = multiple || checkable;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(normalizeIn(defaultValue));
  const currentArray = isControlled ? normalizeIn(value) : internal;
  const selectedSet = useMemo(() => new Set(currentArray), [currentArray]);

  const isExpandControlled = expandedKeys !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<string[]>(
    defaultExpandedKeys ?? [],
  );
  const expandedArray = isExpandControlled
    ? (expandedKeys ?? [])
    : internalExpanded;
  const expandedSet = useMemo(() => new Set(expandedArray), [expandedArray]);

  const handleToggleExpand = useCallback(
    (key: string) => {
      const next = new Set(expandedArray);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      const nextArr = Array.from(next);
      if (!isExpandControlled) setInternalExpanded(nextArr);
      onExpandedKeysChange?.(nextArr);
    },
    [expandedArray, isExpandControlled, onExpandedKeysChange],
  );

  const handleSelect = useCallback(
    (node: TreeNode) => {
      if (node.disabled || node.selectable === false) return;
      let nextArr: string[];
      if (isMulti) {
        const next = new Set(currentArray);
        if (next.has(node.key)) next.delete(node.key);
        else next.add(node.key);
        nextArr = Array.from(next);
      } else {
        nextArr = [node.key];
      }
      if (!isControlled) setInternal(nextArr);
      if (isMulti) onValueChange?.(nextArr);
      else onValueChange?.(nextArr[0] ?? "");
    },
    [isMulti, currentArray, isControlled, onValueChange],
  );

  return (
    <ul
      ref={ref}
      className={cn("tree", className)}
      role="tree"
      data-show-line={showLine ? "true" : undefined}
    >
      {treeData.map((node) => (
        <NodeRow
          key={node.key}
          node={node}
          depth={0}
          multiple={isMulti}
          checkable={checkable}
          selectedSet={selectedSet}
          expandedSet={expandedSet}
          onToggleExpand={handleToggleExpand}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
});
