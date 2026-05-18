import { forwardRef, useCallback, useMemo, useState, type ReactNode } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "../cn"
import { Popover } from "../data-display/Popover"
import { Checkbox } from "./Checkbox"

/**
 * TreeSelect — tree-structured Select. Renders a Popover containing a
 * recursive tree where each node is expandable. Multi-select supported
 * via `multiple`; single-select highlights one node.
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `value` / `defaultValue` / `onValueChange` — Radix-style selection
 *     (single: `string`; multiple: `string[]`)
 *   - `multiple` — boolean (NEVER `mode="multiple"`)
 *   - `size` — "small" | "default" | "large"
 *   - `open` / `defaultOpen` / `onOpenChange`
 *   - `disabled`, `placeholder`, `className`
 */

export interface TreeSelectOption {
  value: string
  label: string
  disabled?: boolean
  children?: TreeSelectOption[]
}

export interface TreeSelectProps {
  options: TreeSelectOption[]
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  multiple?: boolean
  placeholder?: string
  size?: "small" | "default" | "large"
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Expand every node on first render. */
  defaultExpandAll?: boolean
  className?: string
}

function flattenLabels(options: TreeSelectOption[]): Map<string, string> {
  const out = new Map<string, string>()
  const walk = (nodes: TreeSelectOption[]) => {
    for (const n of nodes) {
      out.set(n.value, n.label)
      if (n.children) walk(n.children)
    }
  }
  walk(options)
  return out
}

function collectAllValues(options: TreeSelectOption[]): string[] {
  const out: string[] = []
  const walk = (nodes: TreeSelectOption[]) => {
    for (const n of nodes) {
      out.push(n.value)
      if (n.children) walk(n.children)
    }
  }
  walk(options)
  return out
}

interface TreeNodeProps {
  option: TreeSelectOption
  depth: number
  multiple: boolean
  selectedSet: Set<string>
  expandedSet: Set<string>
  onToggleExpand: (value: string) => void
  onSelect: (option: TreeSelectOption) => void
}

function TreeNode({
  option,
  depth,
  multiple,
  selectedSet,
  expandedSet,
  onToggleExpand,
  onSelect,
}: TreeNodeProps): ReactNode {
  const hasChildren = !!option.children && option.children.length > 0
  const isExpanded = expandedSet.has(option.value)
  const isSelected = selectedSet.has(option.value)
  return (
    <li
      className="treeselect-node-wrap"
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected || undefined}
    >
      <div
        className="treeselect-node"
        data-selected={isSelected ? "true" : undefined}
        data-disabled={option.disabled ? "true" : undefined}
        style={{ paddingLeft: `calc(var(--spacing-2) + ${depth} * var(--spacing-4))` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="treeselect-toggle"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            onClick={(event) => {
              event.stopPropagation()
              onToggleExpand(option.value)
            }}
          >
            {isExpanded ? (
              <ChevronDown aria-hidden style={{ width: "var(--spacing-3)", height: "var(--spacing-3)" }} />
            ) : (
              <ChevronRight aria-hidden style={{ width: "var(--spacing-3)", height: "var(--spacing-3)" }} />
            )}
          </button>
        ) : (
          <span className="treeselect-toggle" aria-hidden />
        )}
        {multiple ? (
          <Checkbox
            className="treeselect-checkbox"
            checked={isSelected}
            disabled={option.disabled}
            onCheckedChange={() => !option.disabled && onSelect(option)}
          />
        ) : null}
        <button
          type="button"
          className="treeselect-label"
          disabled={option.disabled}
          onClick={() => !option.disabled && onSelect(option)}
        >
          {option.label}
        </button>
      </div>
      {hasChildren ? (
        <ul
          className="treeselect-children"
          role="group"
          data-expanded={isExpanded ? "true" : "false"}
        >
          {option.children!.map((child) => (
            <TreeNode
              key={child.value}
              option={child}
              depth={depth + 1}
              multiple={multiple}
              selectedSet={selectedSet}
              expandedSet={expandedSet}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export const TreeSelect = forwardRef<HTMLButtonElement, TreeSelectProps>(
  function TreeSelect(
    {
      options,
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      placeholder = "Select",
      size = "default",
      disabled,
      open,
      defaultOpen,
      onOpenChange,
      defaultExpandAll = false,
      className,
    },
    ref,
  ) {
    const isControlled = value !== undefined

    const normalizeIn = (raw: string | string[] | undefined): string[] => {
      if (raw === undefined) return []
      return Array.isArray(raw) ? raw : raw ? [raw] : []
    }

    const [internal, setInternal] = useState<string[]>(normalizeIn(defaultValue))
    const currentArray = isControlled ? normalizeIn(value) : internal
    const selectedSet = useMemo(() => new Set(currentArray), [currentArray])

    const [isOpenInternal, setIsOpenInternal] = useState<boolean>(defaultOpen ?? false)
    const isOpenControlled = open !== undefined
    const isOpen = isOpenControlled ? !!open : isOpenInternal

    const setIsOpen = useCallback(
      (next: boolean) => {
        if (!isOpenControlled) setIsOpenInternal(next)
        onOpenChange?.(next)
      },
      [isOpenControlled, onOpenChange],
    )

    const allValues = useMemo(() => collectAllValues(options), [options])
    const labelMap = useMemo(() => flattenLabels(options), [options])

    const [expandedSet, setExpandedSet] = useState<Set<string>>(() => {
      if (defaultExpandAll) return new Set(allValues)
      // Expand ancestors of any selected node so the selection is visible.
      const out = new Set<string>()
      const walk = (nodes: TreeSelectOption[], parents: string[]) => {
        for (const n of nodes) {
          if (selectedSet.has(n.value)) for (const p of parents) out.add(p)
          if (n.children) walk(n.children, [...parents, n.value])
        }
      }
      walk(options, [])
      return out
    })

    const handleToggleExpand = useCallback((nodeValue: string) => {
      setExpandedSet((prev) => {
        const next = new Set(prev)
        if (next.has(nodeValue)) next.delete(nodeValue)
        else next.add(nodeValue)
        return next
      })
    }, [])

    const commit = useCallback(
      (nextArray: string[]) => {
        if (!isControlled) setInternal(nextArray)
        if (multiple) onValueChange?.(nextArray)
        else onValueChange?.(nextArray[0] ?? "")
      },
      [isControlled, multiple, onValueChange],
    )

    const handleSelect = useCallback(
      (option: TreeSelectOption) => {
        if (option.disabled) return
        if (multiple) {
          const next = new Set(currentArray)
          if (next.has(option.value)) next.delete(option.value)
          else next.add(option.value)
          commit(Array.from(next))
        } else {
          commit([option.value])
          setIsOpen(false)
        }
      },
      [multiple, currentArray, commit, setIsOpen],
    )

    const triggerText = useMemo(() => {
      if (currentArray.length === 0) return ""
      const labels = currentArray.map((v) => labelMap.get(v) ?? v)
      if (multiple) {
        if (labels.length <= 2) return labels.join(", ")
        return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`
      }
      return labels[0]
    }, [currentArray, labelMap, multiple])

    return (
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
        align="start"
        sideOffset={4}
        className="treeselect-content"
        trigger={
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              "input",
              "treeselect-trigger",
              size === "small" && "input-size-small",
              size === "large" && "input-size-large",
              className,
            )}
            data-placeholder={triggerText === "" ? "true" : undefined}
          >
            <span className="treeselect-trigger-text">
              {triggerText === "" ? placeholder : triggerText}
            </span>
            <ChevronDown
              aria-hidden
              style={{ width: "var(--spacing-4)", height: "var(--spacing-4)", flexShrink: 0 }}
            />
          </button>
        }
      >
          <ul className="treeselect-tree" role="tree">
            {options.map((option) => (
              <TreeNode
                key={option.value}
                option={option}
                depth={0}
                multiple={multiple}
                selectedSet={selectedSet}
                expandedSet={expandedSet}
                onToggleExpand={handleToggleExpand}
                onSelect={handleSelect}
              />
            ))}
          </ul>
      </Popover>
    )
  },
)
