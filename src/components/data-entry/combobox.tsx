import { Command } from "cmdk"
import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react"
import { ChevronsUpDown } from "lucide-react"
import { Popover } from "../data-display/Popover"
import { Button } from "../general/Button"
import { cn } from "../cn"

export interface ComboboxOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface ComboboxProps extends Omit<ComponentPropsWithoutRef<typeof Popover>, "children" | "trigger"> {
  options: ReadonlyArray<ComboboxOption>
  triggerLabel?: ReactNode
  placeholder?: string
  emptyLabel?: ReactNode
  value?: string
  onValueChange?: (value: string) => void
  contentClassName?: string
  loading?: boolean
  loadingLabel?: ReactNode
}

export function Combobox({
  options,
  triggerLabel,
  placeholder,
  emptyLabel,
  value,
  onValueChange,
  contentClassName,
  loading,
  loadingLabel = "Loading…",
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
  const selected = options.find((option) => option.value === value)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="start"
      sideOffset={4}
      className={cn(contentClassName)}
      trigger={
        <Button
          variant="secondary"
          endContent={<ChevronsUpDown size={14} aria-hidden />}
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          {selected ? selected.label : triggerLabel}
        </Button>
      }
      {...rest}
    >
      <Command className="combobox-command">
        <Command.Input className="combobox-input" placeholder={placeholder} />
        <Command.List className="combobox-list">
          {loading ? (
            <Command.Item value="__loading" disabled className="combobox-item">
              {loadingLabel}
            </Command.Item>
          ) : (
            <>
              {emptyLabel !== undefined && (
                <Command.Empty className="combobox-empty">{emptyLabel}</Command.Empty>
              )}
              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="combobox-item"
                  onSelect={(picked) => {
                    onValueChange?.(picked)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </Command.Item>
              ))}
            </>
          )}
        </Command.List>
      </Command>
    </Popover>
  )
}
