import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Command } from "cmdk"
import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react"
import { cn } from "../cn"
import {
  Popover,
  PopoverAnchor,
  PopoverTrigger,
} from "../data-display/Popover"
import { Button } from "../general/Button"
import { ChevronsUpDown } from "lucide-react"

export const ComboboxAnchor = PopoverAnchor
export const ComboboxTrigger = PopoverTrigger

/**
 * Combobox — cmdk command + Radix Popover compositional API.
 *
 * Two equivalent consumption modes per cardinal rule 23 (concept-first
 * API + minimise sub-components):
 *
 *   1. Data-driven (Ant / MUI / Mantine canonical) — pass `options`:
 *
 *      <Combobox
 *        options={[
 *          { value: "tokyo", label: "東京" },
 *          { value: "osaka", label: "大阪" },
 *        ]}
 *        triggerLabel="都道府県を選択"
 *        placeholder="名前で検索"
 *        emptyLabel="該当なし"
 *        onValueChange={(v) => setValue(v)}
 *      />
 *
 *   2. Compositional (cmdk / shadcn canonical) — children:
 *
 *      <Combobox>
 *        <ComboboxTrigger asChild><Button>選択</Button></ComboboxTrigger>
 *        <ComboboxContent>
 *          <ComboboxInput placeholder="検索" />
 *          <ComboboxList>
 *            <ComboboxEmpty>No matches</ComboboxEmpty>
 *            …items
 *          </ComboboxList>
 *        </ComboboxContent>
 *      </Combobox>
 */

export interface ComboboxOption {
  value: string
  /** Display content. Plain string for keyboard-search filterability;
   * ReactNode for icon + label compositions (filter still operates
   * on the `value` string). */
  label: ReactNode
  disabled?: boolean
}

export interface ComboboxProps extends ComponentPropsWithoutRef<typeof Popover> {
  /** Data-driven option list. When set, the children prop is ignored
   * and trigger + content + items render automatically. */
  options?: ReadonlyArray<ComboboxOption>
  /** Text rendered inside the auto-generated trigger button. When
   * `value` is set, the matching `label` is shown instead. */
  triggerLabel?: ReactNode
  /** `<ComboboxInput>` placeholder shown above the result list. */
  placeholder?: string
  /** Empty-state copy when the search query matches no item. */
  emptyLabel?: ReactNode
  /** Currently selected `value`. Controlled mode. */
  value?: string
  /** Commit handler — fires the option's `value` when picked. */
  onValueChange?: (value: string) => void
  /** Optional class merged onto the auto-generated `<ComboboxContent>`. */
  contentClassName?: string
}

export function Combobox({
  options,
  triggerLabel,
  placeholder,
  emptyLabel,
  value,
  onValueChange,
  contentClassName,
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...rest
}: ComboboxProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  // Compositional mode — render only the Popover Root with the
  // consumer-provided trigger / content / items as children.
  if (options === undefined) {
    return (
      <Popover open={openProp} defaultOpen={defaultOpen} onOpenChange={onOpenChange} {...rest}>
        {children}
      </Popover>
    )
  }

  // Data-driven mode — auto-wire the trigger + content + items.
  const selected = options.find((opt) => opt.value === value)
  return (
    <Popover open={open} onOpenChange={setOpen} {...rest}>
      <ComboboxTrigger asChild>
        <Button
          variant="secondary"
          endContent={<ChevronsUpDown size={14} aria-hidden />}
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          {selected ? selected.label : triggerLabel}
        </Button>
      </ComboboxTrigger>
      <ComboboxContent className={contentClassName} style={{ width: "var(--combobox-width, 16rem)" }}>
        <ComboboxInput placeholder={placeholder} />
        <ComboboxList>
          {emptyLabel !== undefined && <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>}
          {options.map((opt) => (
            <ComboboxItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              onSelect={(picked) => {
                onValueChange?.(picked)
                setOpen(false)
              }}
            >
              {opt.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Popover>
  )
}

type PopoverContentProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
type CommandRootProps = ComponentPropsWithoutRef<typeof Command>

export type ComboboxContentProps = PopoverContentProps &
  Omit<CommandRootProps, "children" | "className"> & {
    /** Applied to the inner cmdk `Command` root. */
    commandClassName?: string
  }

/**
 * Popover surface wrapping cmdk `Command`. Renders `Command` as the only
 * child of `PopoverContent` — put `ComboboxInput`, `ComboboxList`, etc.
 * inside.
 */
export const ComboboxContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComboboxContentProps
>(function ComboboxContent(
  {
    children,
    className,
    align = "start",
    sideOffset = 4,
    commandClassName,
    shouldFilter,
    filter,
    value,
    defaultValue,
    onValueChange,
    loop,
    label,
    vimBindings,
    disablePointerSelection,
    ...contentProps
  },
  ref,
) {
  // cmdk's `Command` renders a Radix Primitive.input under the hood;
  // passing `value` AND `defaultValue` (even both undefined) trips
  // React's controlled / uncontrolled warning on the inner input.
  // Conditional spread so only one prop reaches Command.
  const commandValueProp =
    value !== undefined ? { value } : defaultValue !== undefined ? { defaultValue } : {}

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn("popover-content", "combobox-content", className)}
        {...contentProps}
      >
        <Command
          className={cn("combobox-command", commandClassName)}
          shouldFilter={shouldFilter}
          filter={filter}
          {...commandValueProp}
          onValueChange={onValueChange}
          loop={loop}
          label={label}
          vimBindings={vimBindings}
          disablePointerSelection={disablePointerSelection}
        >
          {children}
        </Command>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
})

export const ComboboxInput = forwardRef<
  ElementRef<typeof Command.Input>,
  ComponentPropsWithoutRef<typeof Command.Input>
>(function ComboboxInput({ className, ...props }, ref) {
  return (
    <Command.Input
      ref={ref}
      className={cn("input", "combobox-input", className)}
      {...props}
    />
  )
})

export const ComboboxList = forwardRef<
  ElementRef<typeof Command.List>,
  ComponentPropsWithoutRef<typeof Command.List>
>(function ComboboxList({ className, ...props }, ref) {
  return (
    <Command.List
      ref={ref}
      className={cn("combobox-list", className)}
      {...props}
    />
  )
})

export const ComboboxItem = forwardRef<
  ElementRef<typeof Command.Item>,
  ComponentPropsWithoutRef<typeof Command.Item>
>(function ComboboxItem({ className, ...props }, ref) {
  return (
    <Command.Item
      ref={ref}
      className={cn("combobox-item", className)}
      {...props}
    />
  )
})

export const ComboboxEmpty = forwardRef<
  ElementRef<typeof Command.Empty>,
  ComponentPropsWithoutRef<typeof Command.Empty>
>(function ComboboxEmpty({ className, ...props }, ref) {
  return (
    <Command.Empty
      ref={ref}
      className={cn("combobox-empty", className)}
      {...props}
    />
  )
})
