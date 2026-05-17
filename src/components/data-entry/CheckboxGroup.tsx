import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import { Checkbox } from "./Checkbox"
import { cn } from "../cn"

/**
 * CheckboxGroup — wraps a set of `<Checkbox value="…" />` items into a
 * single selection axis. Compositional (children) OR data-driven
 * (`options`) per cardinal rule 23 §A — one concept per prop.
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `value` / `defaultValue` / `onValueChange` — Radix-style
 *     controlled / uncontrolled selection (array of selected values).
 *     NEVER `checked` / `selectedKeys` aliases.
 *   - `orientation` — "horizontal" (default) | "vertical".
 *   - `size` — "small" | "default" | "large" (forwarded via context).
 *   - `disabled` — applies to every item.
 *
 * Visual contract lives in `.checkbox-group` (shell.css) — flex
 * direction flips on `data-orientation`.
 */

export type CheckboxGroupSize = "small" | "default" | "large"
export type CheckboxGroupOrientation = "horizontal" | "vertical"

export interface CheckboxOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface CheckboxGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Data-driven items. Alternative to passing `<Checkbox value="…" />` children. */
  options?: CheckboxOption[]
  /** Compositional children when `options` is omitted. */
  children?: ReactNode
  /** Controlled selection. */
  value?: string[]
  /** Uncontrolled initial selection. */
  defaultValue?: string[]
  /** Fires whenever the selection set changes. */
  onValueChange?: (value: string[]) => void
  orientation?: CheckboxGroupOrientation
  /** Disable every item in the group. */
  disabled?: boolean
  size?: CheckboxGroupSize
  /** Form name for native submission (mirrors RadioGroup). */
  name?: string
}

interface CheckboxGroupCtx {
  value: string[]
  toggle: (v: string) => void
  disabled: boolean
  size: CheckboxGroupSize
  name?: string
}

const CheckboxGroupContext = createContext<CheckboxGroupCtx | null>(null)

/** Internal hook — `<Checkbox value="…" />` consumes it. */
export function useCheckboxGroup(): CheckboxGroupCtx | null {
  return useContext(CheckboxGroupContext)
}

export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  function CheckboxGroup(
    {
      options,
      children,
      value: controlled,
      defaultValue,
      onValueChange,
      orientation = "horizontal",
      disabled = false,
      size = "default",
      name,
      className,
      ...rest
    },
    ref,
  ) {
    const [uncontrolled, setUncontrolled] = useState<string[]>(
      defaultValue ?? [],
    )
    const isControlled = controlled !== undefined
    const value = isControlled ? controlled : uncontrolled

    const toggle = useCallback(
      (v: string) => {
        const next = value.includes(v)
          ? value.filter((x) => x !== v)
          : [...value, v]
        if (!isControlled) setUncontrolled(next)
        onValueChange?.(next)
      },
      [value, isControlled, onValueChange],
    )

    const ctx = useMemo<CheckboxGroupCtx>(
      () => ({ value, toggle, disabled, size, name }),
      [value, toggle, disabled, size, name],
    )

    return (
      <CheckboxGroupContext.Provider value={ctx}>
        <div
          ref={ref}
          role="group"
          data-orientation={orientation}
          data-size={size}
          className={cn("checkbox-group", className)}
          {...rest}
        >
          {options
            ? options.map((opt) => (
                <CheckboxGroupItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </CheckboxGroupItem>
              ))
            : children}
        </div>
      </CheckboxGroupContext.Provider>
    )
  },
)

/**
 * Internal item — labelled checkbox bound to the group context.
 * When CheckboxGroup is `options`-driven we render this; consumers
 * using the compositional form import `Checkbox` directly and pass
 * `value`, which routes through the same context.
 */
interface CheckboxGroupItemProps {
  value: string
  disabled?: boolean
  children: ReactNode
}

function CheckboxGroupItem({
  value,
  disabled,
  children,
}: CheckboxGroupItemProps) {
  const ctx = useContext(CheckboxGroupContext)
  if (!ctx) return null
  const checked = ctx.value.includes(value)
  const isDisabled = disabled ?? ctx.disabled
  return (
    <label className="checkbox-group-item" data-disabled={isDisabled || undefined}>
      <Checkbox
        checked={checked}
        disabled={isDisabled}
        onCheckedChange={() => ctx.toggle(value)}
        name={ctx.name}
        value={value}
      />
      <span className="checkbox-group-item-label">{children}</span>
    </label>
  )
}
