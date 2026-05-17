import { forwardRef, useMemo, useState, useCallback, type ChangeEvent } from "react"
import { cn } from "../cn"
import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./combobox"

/**
 * AutoComplete — Combobox-backed text input with filtered suggestions.
 *
 * Thin wrapper over `Combobox*` (cmdk + Radix Popover). Free-text typing
 * is always allowed; selecting a suggestion COMMITS that option's value
 * via `onValueChange`. With `allowCustomValue`, blurring while the typed
 * text does not match any option commits the typed text as the value.
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `value` / `defaultValue` / `onValueChange` — Radix-style selection
 *   - `size` — "small" | "default" | "large"
 *   - `disabled`, `placeholder`, `open` / `defaultOpen` / `onOpenChange`
 */

export interface AutoCompleteOption {
  value: string
  label: string
  disabled?: boolean
}

export interface AutoCompleteProps {
  options: AutoCompleteOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  size?: "small" | "default" | "large"
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Free-text typing always allowed; selection is optional commit. */
  allowCustomValue?: boolean
  className?: string
}

export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(
  function AutoComplete(
    {
      options,
      value,
      defaultValue,
      onValueChange,
      placeholder,
      size = "default",
      disabled,
      open,
      defaultOpen,
      onOpenChange,
      allowCustomValue = false,
      className,
    },
    ref,
  ) {
    const isControlled = value !== undefined
    const [internal, setInternal] = useState<string>(defaultValue ?? "")
    const current = isControlled ? (value ?? "") : internal

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

    const commit = useCallback(
      (next: string) => {
        if (!isControlled) setInternal(next)
        onValueChange?.(next)
      },
      [isControlled, onValueChange],
    )

    const filtered = useMemo(() => {
      const q = current.trim().toLowerCase()
      if (!q) return options
      return options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
    }, [options, current])

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value
      if (!isControlled) setInternal(next)
      onValueChange?.(next)
      if (!isOpen) setIsOpen(true)
    }

    const handleSelect = (selected: string) => {
      const match = options.find((o) => o.value === selected) ?? options.find((o) => o.label === selected)
      const next = match?.value ?? (allowCustomValue ? selected : current)
      commit(next)
      setIsOpen(false)
    }

    return (
      <Combobox open={isOpen} onOpenChange={setIsOpen}>
        <ComboboxAnchor asChild>
          <input
            ref={ref}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            disabled={disabled}
            placeholder={placeholder}
            value={current}
            onChange={handleInputChange}
            onFocus={() => !disabled && setIsOpen(true)}
            className={cn(
              "input",
              size === "small" && "input-size-small",
              size === "large" && "input-size-large",
              className,
            )}
          />
        </ComboboxAnchor>
        <ComboboxContent
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(event) => event.preventDefault()}
          shouldFilter={false}
        >
          <ComboboxList>
            {filtered.length === 0 ? (
              <ComboboxEmpty>No matches</ComboboxEmpty>
            ) : (
              filtered.map((option) => (
                <ComboboxItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={handleSelect}
                >
                  {option.label}
                </ComboboxItem>
              ))
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
  },
)
