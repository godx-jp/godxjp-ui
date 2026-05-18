import { forwardRef, useCallback, useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "../cn"
import { Popover } from "../data-display/Popover"

/**
 * Cascader — nested column navigation. Renders a Popover whose body
 * is a horizontal row of vertical columns. Each column lists the
 * options at that depth; clicking a non-leaf option expands the next
 * column to the right; clicking a leaf commits the path of values.
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `value` / `defaultValue` / `onValueChange` — Radix-style selection
 *     (path is `string[]`; callback also receives the leaf option)
 *   - `size` — "small" | "default" | "large"
 *   - `open` / `defaultOpen` / `onOpenChange` — overlay state
 *   - `disabled`, `placeholder`, `className`
 */

export interface CascaderOption {
  value: string
  label: string
  disabled?: boolean
  children?: CascaderOption[]
}

export interface CascaderProps {
  options: CascaderOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (path: string[], leafOption: CascaderOption) => void
  placeholder?: string
  size?: "small" | "default" | "large"
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Display the full path as breadcrumb text or just the leaf label. */
  showFullPath?: boolean
  className?: string
}

function findPathLabels(options: CascaderOption[], path: string[]): string[] {
  const labels: string[] = []
  let cursor: CascaderOption[] | undefined = options
  for (const seg of path) {
    const hit: CascaderOption | undefined = cursor?.find((o) => o.value === seg)
    if (!hit) break
    labels.push(hit.label)
    cursor = hit.children
  }
  return labels
}

function findOptionByPath(options: CascaderOption[], path: string[]): CascaderOption | undefined {
  let cursor: CascaderOption[] | undefined = options
  let leaf: CascaderOption | undefined
  for (const seg of path) {
    leaf = cursor?.find((o) => o.value === seg)
    if (!leaf) return undefined
    cursor = leaf.children
  }
  return leaf
}

export const Cascader = forwardRef<HTMLButtonElement, CascaderProps>(
  function Cascader(
    {
      options,
      value,
      defaultValue,
      onValueChange,
      placeholder = "Select",
      size = "default",
      disabled,
      open,
      defaultOpen,
      onOpenChange,
      showFullPath = true,
      className,
    },
    ref,
  ) {
    const isControlled = value !== undefined
    const [internal, setInternal] = useState<string[]>(defaultValue ?? [])
    const currentPath = isControlled ? (value ?? []) : internal

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

    // Active (hovering / expanding) path while navigating columns.
    const [activePath, setActivePath] = useState<string[]>(currentPath)

    // When opening, reset activePath to the committed currentPath.
    const handleOpenChange = useCallback(
      (next: boolean) => {
        if (next) setActivePath(currentPath)
        setIsOpen(next)
      },
      [currentPath, setIsOpen],
    )

    // Build the visible columns by walking activePath.
    const columns = useMemo(() => {
      const cols: CascaderOption[][] = [options]
      let cursor: CascaderOption[] | undefined = options
      for (const seg of activePath) {
        const hit: CascaderOption | undefined = cursor?.find((o) => o.value === seg)
        if (!hit || !hit.children || hit.children.length === 0) break
        cols.push(hit.children)
        cursor = hit.children
      }
      return cols
    }, [options, activePath])

    const handleOptionClick = (depth: number, option: CascaderOption) => {
      if (option.disabled) return
      const nextActive = [...activePath.slice(0, depth), option.value]
      const hasChildren = !!option.children && option.children.length > 0
      if (hasChildren) {
        setActivePath(nextActive)
        return
      }
      // Leaf — commit
      if (!isControlled) setInternal(nextActive)
      onValueChange?.(nextActive, option)
      setActivePath(nextActive)
      setIsOpen(false)
    }

    const labels = findPathLabels(options, currentPath)
    const triggerText = labels.length === 0
      ? ""
      : showFullPath
        ? labels.join(" / ")
        : labels[labels.length - 1]

    return (
      <Popover
        open={isOpen}
        onOpenChange={handleOpenChange}
        align="start"
        sideOffset={4}
        className="cascader-content"
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
              "cascader-trigger",
              size === "small" && "input-size-small",
              size === "large" && "input-size-large",
              className,
            )}
            data-placeholder={triggerText === "" ? "true" : undefined}
          >
            <span className="cascader-trigger-text">
              {triggerText === "" ? placeholder : triggerText}
            </span>
            <ChevronDown
              aria-hidden
              style={{ width: "var(--spacing-4)", height: "var(--spacing-4)", flexShrink: 0 }}
            />
          </button>
        }
      >
          <div className="cascader-columns" role="tree">
            {columns.map((column, depth) => (
              <ul key={depth} className="cascader-column" role="group">
                {column.map((option) => {
                  const isActive = activePath[depth] === option.value
                  const isSelected = currentPath[depth] === option.value && currentPath.length === depth + 1
                  const hasChildren = !!option.children && option.children.length > 0
                  return (
                    <li
                      key={option.value}
                      className="cascader-option"
                      role="treeitem"
                      data-active={isActive ? "true" : undefined}
                      data-selected={isSelected ? "true" : undefined}
                      data-disabled={option.disabled ? "true" : undefined}
                      aria-expanded={hasChildren ? isActive : undefined}
                      aria-disabled={option.disabled || undefined}
                      onClick={() => handleOptionClick(depth, option)}
                    >
                      <span className="cascader-option-label">{option.label}</span>
                      {hasChildren ? (
                        <ChevronRight
                          aria-hidden
                          className="cascader-option-chevron"
                          style={{ width: "var(--spacing-3)", height: "var(--spacing-3)" }}
                        />
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            ))}
          </div>
      </Popover>
    )
  },
)

// Re-export the leaf-lookup helper for consumers that need it.
export const __cascaderFindOptionByPath = findOptionByPath
