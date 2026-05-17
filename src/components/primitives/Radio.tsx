import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react"
import { cn } from "./cn"

/**
 * Radio + RadioGroup — Radix-backed single-select group. Compositional
 * (`<Radio value="…" />` children) OR data-driven (`options`) per
 * cardinal rule 23 §A.
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `value` / `defaultValue` / `onValueChange` — Radix-canonical
 *     selection (the GROUP exposes the value; individual items
 *     internally use Radix's `checked` data-state).
 *   - `orientation` — "horizontal" (default) | "vertical".
 *   - `size` — "small" | "default" | "large".
 *   - `disabled` — applies to the whole group OR per-item.
 *   - `name` — native form name.
 *
 * Visual contract: `.radio-group` + `.radio-root` + `.radio-indicator`
 * in shell.css. State flows via Radix `data-state="checked"`.
 */

export type RadioGroupSize = "small" | "default" | "large"
export type RadioGroupOrientation = "horizontal" | "vertical"

export interface RadioOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface RadioGroupProps
  extends Omit<
    ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    "orientation"
  > {
  /** Data-driven items. */
  options?: RadioOption[]
  /** Compositional children when `options` is omitted. */
  children?: ReactNode
  orientation?: RadioGroupOrientation
  size?: RadioGroupSize
}

interface RadioGroupCtx {
  size: RadioGroupSize
}

const RadioGroupContext = createContext<RadioGroupCtx>({ size: "default" })

export const RadioGroup = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(function RadioGroup(
  {
    options,
    children,
    orientation = "horizontal",
    size = "default",
    className,
    ...rest
  },
  ref,
) {
  return (
    <RadioGroupContext.Provider value={{ size }}>
      <RadioGroupPrimitive.Root
        ref={ref}
        orientation={orientation}
        data-orientation={orientation}
        data-size={size}
        className={cn("radio-group", className)}
        {...rest}
      >
        {options
          ? options.map((opt) => (
              <Radio key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </Radio>
            ))
          : children}
      </RadioGroupPrimitive.Root>
    </RadioGroupContext.Provider>
  )
})

export interface RadioProps {
  value: string
  disabled?: boolean
  children?: ReactNode
  className?: string
  id?: string
}

export const Radio = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(function Radio({ value, disabled, children, className, id }, ref) {
  const { size } = useContext(RadioGroupContext)
  return (
    <label
      className="radio-group-item"
      data-disabled={disabled || undefined}
      data-size={size}
    >
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value}
        disabled={disabled}
        id={id}
        className={cn("radio-root", className)}
      >
        <RadioGroupPrimitive.Indicator className="radio-indicator" />
      </RadioGroupPrimitive.Item>
      {children !== undefined ? (
        <span className="radio-group-item-label">{children}</span>
      ) : null}
    </label>
  )
})
