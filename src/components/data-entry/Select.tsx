import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  forwardRef,
  Fragment,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react"
import { cn } from "../cn"

/**
 * Select — Radix-backed dropdown field. Trigger uses `.input` +
 * `.select-trigger`; list uses `.select-content` / `.select-item`
 * from tokens.css.
 *
 * Two equivalent consumption modes per cardinal rule 23 (concept-first
 * API + minimise sub-components):
 *
 *   1. Data-driven (Ant / MUI / Mantine canonical) — pass `options`:
 *
 *      <Select options={[
 *        { value: "tokyo", label: "東京" },
 *        { value: "osaka", label: "大阪" },
 *      ]} placeholder="都道府県を選択" />
 *
 *   2. Compositional (shadcn / Radix canonical) — children:
 *
 *      <Select>
 *        <SelectTrigger><SelectValue /></SelectTrigger>
 *        <SelectContent>
 *          <SelectItem value="tokyo">東京</SelectItem>
 *        </SelectContent>
 *      </Select>
 *
 * `options` is the simpler surface for the common case; children stay
 * for advanced layouts (groups + dividers + custom item rendering).
 */

export interface SelectOption {
  value: string
  /** Display content — usually a string, but ReactNode is fine for
   * icon + label compositions. */
  label: ReactNode
  disabled?: boolean
}

export interface SelectOptionGroup {
  /** Group heading text (rendered via `<SelectLabel>`). */
  label: ReactNode
  options: SelectOption[]
}

export type SelectOptions = ReadonlyArray<SelectOption | SelectOptionGroup>

export interface SelectProps extends ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  /** Data-driven option list. When set, the children prop is ignored
   * and trigger + content + items render automatically. */
  options?: SelectOptions
  /** Placeholder text shown via `<SelectValue placeholder={…}>` when
   * no value is selected. Honoured only in data-driven mode. */
  placeholder?: ReactNode
  /** Extra class merged onto the trigger element (data-driven mode). */
  triggerClassName?: string
  /** Extra class merged onto the content surface (data-driven mode). */
  contentClassName?: string
}

function isOptionGroup(opt: SelectOption | SelectOptionGroup): opt is SelectOptionGroup {
  return Array.isArray((opt as SelectOptionGroup).options)
}

export function Select({
  options,
  placeholder,
  triggerClassName,
  contentClassName,
  children,
  ...rest
}: SelectProps) {
  if (options === undefined) {
    return <SelectPrimitive.Root {...rest}>{children}</SelectPrimitive.Root>
  }
  return (
    <SelectPrimitive.Root {...rest}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((opt, i) =>
          isOptionGroup(opt) ? (
            <Fragment key={`group-${i}`}>
              <SelectGroup>
                <SelectLabel>{opt.label}</SelectLabel>
                {opt.options.map((leaf) => (
                  <SelectItem
                    key={leaf.value}
                    value={leaf.value}
                    disabled={leaf.disabled}
                  >
                    {leaf.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              {i < options.length - 1 && <SelectSeparator />}
            </Fragment>
          ) : (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </SelectPrimitive.Root>
  )
}

export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value
export const SelectIcon = SelectPrimitive.Icon
export const SelectPortal = SelectPrimitive.Portal

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Trigger ref={ref} className={cn("input", "select-trigger", className)} {...rest}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className="muted"
          aria-hidden
          style={{ width: "var(--spacing-4)", height: "var(--spacing-4)", flexShrink: 0 }}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, position = "popper", sideOffset = 4, ...rest }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn("select-content", className)}
        position={position}
        sideOffset={sideOffset}
        {...rest}
      >
        <SelectScrollUpButton>
          <ChevronUp
            aria-hidden
            style={{ width: "var(--spacing-4)", height: "var(--spacing-4)" }}
          />
        </SelectScrollUpButton>
        <SelectPrimitive.Viewport className="select-viewport">{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton>
          <ChevronDown
            aria-hidden
            style={{ width: "var(--spacing-4)", height: "var(--spacing-4)" }}
          />
        </SelectScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})

export const SelectLabel = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...rest }, ref) {
  return <SelectPrimitive.Label ref={ref} className={cn("select-label", className)} {...rest} />
})

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Item ref={ref} className={cn("select-item", className)} {...rest}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})

export const SelectSeparator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className, ...rest }, ref) {
  return <SelectPrimitive.Separator ref={ref} className={cn("select-separator", className)} {...rest} />
})

export const SelectScrollUpButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(function SelectScrollUpButton({ className, ...rest }, ref) {
  return <SelectPrimitive.ScrollUpButton ref={ref} className={cn("select-scroll-btn", className)} {...rest} />
})

export const SelectScrollDownButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(function SelectScrollDownButton({ className, ...rest }, ref) {
  return <SelectPrimitive.ScrollDownButton ref={ref} className={cn("select-scroll-btn", className)} {...rest} />
})
