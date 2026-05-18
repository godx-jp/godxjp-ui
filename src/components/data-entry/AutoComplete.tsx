import { Command } from "cmdk"
import { forwardRef, useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react"
import { Popover } from "../data-display/Popover"
import { cn } from "../cn"

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
    const initialText = useMemo(() => {
      const seed = isControlled ? value : defaultValue
      if (!seed) return ""
      return options.find((option) => option.value === seed)?.label ?? seed
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    const [inputText, setInputText] = useState(initialText)
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
    const currentOpen = open ?? internalOpen
    const setOpen = useCallback(
      (next: boolean) => {
        if (open === undefined) setInternalOpen(next)
        onOpenChange?.(next)
      },
      [open, onOpenChange],
    )

    useEffect(() => {
      if (!isControlled) return
      const option = options.find((item) => item.value === value)
      if (option) setInputText(option.label)
    }, [isControlled, options, value])

    const filtered = useMemo(() => {
      const query = inputText.trim().toLowerCase()
      if (!query) return options
      return options.filter((option) =>
        option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query),
      )
    }, [inputText, options])

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value
      setInputText(next)
      onValueChange?.(next)
      if (!currentOpen) setOpen(true)
    }

    const commit = (picked: string) => {
      const option = options.find((item) => item.value === picked) ?? options.find((item) => item.label === picked)
      if (option) {
        setInputText(option.label)
        onValueChange?.(option.value)
      } else if (allowCustomValue) {
        setInputText(picked)
        onValueChange?.(picked)
      }
      setOpen(false)
    }

    const input = (
      <input
        ref={ref}
        type="text"
        role="combobox"
        aria-expanded={currentOpen}
        aria-autocomplete="list"
        disabled={disabled}
        placeholder={placeholder}
        value={inputText}
        onChange={handleChange}
        onFocus={() => !disabled && setOpen(true)}
        className={cn(
          "input",
          size === "small" && "input-size-small",
          size === "large" && "input-size-large",
          className,
        )}
      />
    )

    return (
      <Popover
        open={currentOpen}
        onOpenChange={setOpen}
        trigger={input}
        align="start"
        sideOffset={4}
        className="combobox-content"
        contentProps={{
          onOpenAutoFocus: (event) => event.preventDefault(),
          onFocusOutside: (event) => event.preventDefault(),
        }}
      >
        <Command shouldFilter={false} className="combobox-command">
          <Command.List className="combobox-list">
            {filtered.length === 0 ? (
              <Command.Empty className="combobox-empty">No matches</Command.Empty>
            ) : (
              filtered.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="combobox-item"
                  onSelect={commit}
                >
                  {option.label}
                </Command.Item>
              ))
            )}
          </Command.List>
        </Command>
      </Popover>
    )
  },
)
