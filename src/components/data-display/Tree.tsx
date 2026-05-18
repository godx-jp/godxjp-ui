import { forwardRef, useMemo, useState, type ReactNode } from "react"
import {
  Button as AriaButton,
  Checkbox as AriaCheckbox,
  SelectionIndicator,
  Tree as AriaTree,
  TreeItem as AriaTreeItem,
  TreeItemContent,
  type Key,
  type Selection,
} from "react-aria-components"
import { ChevronRight } from "lucide-react"
import { cn } from "../cn"

/**
 * Tree — standalone hierarchical view (no popover).
 *
 * React Aria-backed sibling of `<TreeSelect>` — same recursive shape,
 * but renders inline with ARIA tree keyboard navigation and selection.
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
 *   - `showLine` — render connector guides.
 *   - `density` — local row spacing override for tree-heavy surfaces.
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
  key: string
  title: ReactNode
  icon?: ReactNode
  disabled?: boolean
  selectable?: boolean
  children?: TreeNode[]
}

export interface TreeRenderItemState {
  node: TreeNode
  isExpanded: boolean
  isSelected: boolean
  isDisabled: boolean
  hasChildren: boolean
  level: number
}

export type TreeDensity = "compact" | "default" | "comfortable"

export interface TreeProps {
  treeData: TreeNode[]
  /** Selected key(s). */
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  /** Allow multi-select. */
  multiple?: boolean
  /** Initially-expanded node keys. */
  defaultExpandedKeys?: string[]
  /** Controlled expanded keys. */
  expandedKeys?: string[]
  onExpandedKeysChange?: (keys: string[]) => void
  /** Render checkboxes (multi-select via checkbox). Implies `multiple`. */
  checkable?: boolean
  /** Render connector lines between depths. */
  showLine?: boolean
  /** Local row spacing override. Defaults to the page density. */
  density?: TreeDensity
  /** Override the row's icon + label content without replacing the ARIA tree. */
  renderItem?: (state: TreeRenderItemState) => ReactNode
  className?: string
}

function normalizeIn(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return []
  return Array.isArray(raw) ? raw : raw ? [raw] : []
}

interface NodeRowProps {
  node: TreeNode
  checkable: boolean
  depth: number
  guides: boolean[]
  isLast: boolean
  renderItem?: TreeProps["renderItem"]
}

function NodeRow({ node, checkable, depth, guides, isLast, renderItem }: NodeRowProps): ReactNode {
  const hasChildren = !!node.children && node.children.length > 0
  const childGuides = depth === 0 ? [] : [...guides, !isLast]
  return (
    <AriaTreeItem
      className="tree-node"
      id={node.key}
      textValue={String(node.title)}
      isDisabled={node.disabled}
    >
      <TreeItemContent>
        {({ hasChildItems, isExpanded, isSelected, isDisabled, level }) => {
          const content = renderItem?.({
            node,
            isExpanded,
            isSelected,
            isDisabled,
            hasChildren: hasChildItems,
            level,
          }) ?? (
            <>
              {node.icon !== undefined && (
                <span className="tree-icon" aria-hidden>
                  {node.icon}
                </span>
              )}
              <span className="tree-label">{node.title}</span>
            </>
          )

          return (
            <>
              <span className="tree-guides" aria-hidden>
                {guides.map((continues, index) => (
                  <span
                    key={index}
                    className="tree-guide"
                    data-continuation={continues ? "true" : undefined}
                  />
                ))}
                {depth > 0 && (
                  <span
                    className="tree-guide tree-guide-branch"
                    data-last={isLast ? "true" : undefined}
                  />
                )}
              </span>
              {hasChildItems ? (
                <AriaButton slot="chevron" className="tree-toggle">
                  <ChevronRight aria-hidden className="tree-toggle-icon" />
                </AriaButton>
              ) : (
                <span className="tree-toggle" aria-hidden />
              )}
              {checkable ? (
                <AriaCheckbox slot="selection" className="tree-checkbox" />
              ) : (
                <SelectionIndicator className="tree-selection" />
              )}
              <span className="tree-row-content">{content}</span>
            </>
          )
        }}
      </TreeItemContent>
      {hasChildren
        ? node.children!.map((child, index) => (
            <NodeRow
              key={child.key}
              node={child}
              checkable={checkable}
              depth={depth + 1}
              guides={childGuides}
              isLast={index === node.children!.length - 1}
              renderItem={renderItem}
            />
          ))
        : null}
    </AriaTreeItem>
  )
}

function collectKeys(nodes: TreeNode[], predicate: (node: TreeNode) => boolean): string[] {
  const out: string[] = []
  const walk = (items: TreeNode[]) => {
    for (const item of items) {
      if (predicate(item)) out.push(item.key)
      if (item.children) walk(item.children)
    }
  }
  walk(nodes)
  return out
}

function selectionFromKeys(keys: Iterable<Key> | "all"): string[] {
  if (keys === "all") return []
  return Array.from(keys, String)
}

export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree(
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
    density,
    renderItem,
    className,
  },
  ref,
) {
  const isMulti = multiple || checkable
  const isControlled = value !== undefined
  const [internal, setInternal] = useState<string[]>(normalizeIn(defaultValue))
  const selectedKeys = isControlled ? normalizeIn(value) : internal

  const disabledKeys = useMemo(
    () => collectKeys(treeData, (node) => node.disabled === true),
    [treeData],
  )

  const selectableKeys = useMemo(
    () => new Set(collectKeys(treeData, (node) => node.selectable !== false)),
    [treeData],
  )

  const handleSelectionChange = (keys: Selection) => {
    const next = selectionFromKeys(keys).filter((key) => selectableKeys.has(key))
    const nextValue = isMulti ? next : next.slice(0, 1)
    if (!isControlled) setInternal(nextValue)
    if (isMulti) onValueChange?.(nextValue)
    else onValueChange?.(nextValue[0] ?? "")
  }

  const handleExpandedChange = (keys: Set<Key>) => {
    onExpandedKeysChange?.(Array.from(keys, String))
  }

  return (
    <AriaTree
      ref={ref}
      aria-label="Tree"
      className={cn("tree", className)}
      data-show-line={showLine ? "true" : undefined}
      data-density={density}
      selectionMode={isMulti ? "multiple" : "single"}
      selectionBehavior={checkable ? "toggle" : "replace"}
      selectedKeys={new Set(selectedKeys)}
      onSelectionChange={handleSelectionChange}
      disabledKeys={disabledKeys}
      expandedKeys={expandedKeys}
      defaultExpandedKeys={expandedKeys === undefined ? defaultExpandedKeys : undefined}
      onExpandedChange={handleExpandedChange}
    >
      {treeData.map((node, index) => (
        <NodeRow
          key={node.key}
          node={node}
          checkable={checkable}
          depth={0}
          guides={[]}
          isLast={index === treeData.length - 1}
          renderItem={renderItem}
        />
      ))}
    </AriaTree>
  )
})
