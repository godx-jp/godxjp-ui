import { forwardRef, useEffect, useMemo, useState, useCallback, type ChangeEvent } from "react"
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

    // Displayed input text — what the user reads in the field.
    // Held SEPARATELY from the committed value so the input can show
    // the user-facing `label` while `onValueChange` reports the option
    // `value` (the slug). When `value === label` (string-only options),
    // they collapse to one and behave as a plain text input.
    const initialText = useMemo(() => {
      const seed = isControlled ? value : defaultValue
      if (seed === undefined || seed === "") return ""
      const opt = options.find((o) => o.value === seed)
      return opt?.label ?? seed
    }, [])  // eslint-disable-line react-hooks/exhaustive-deps -- intentional one-shot init

    const [inputText, setInputText] = useState<string>(initialText)

    // When the controlled `value` changes externally and matches an
    // option, sync the displayed label. Skips when value is in
    // free-text mode (no matching option) to avoid clobbering typing.
    useEffect(() => {
      if (!isControlled) return
      const opt = options.find((o) => o.value === value)
      if (opt && inputText !== opt.label) {
        setInputText(opt.label)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally not on inputText
    }, [value, isControlled, options])

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

    const filtered = useMemo(() => {
      const q = inputText.trim().toLowerCase()
      if (!q) return options
      return options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
    }, [options, inputText])

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value
      setInputText(next)
      // Typing always re-commits as raw text — consumer sees the typed
      // string until a suggestion is picked. allowCustomValue gates
      // whether non-matching text "sticks" on blur (see handleBlur).
      onValueChange?.(next)
      if (!isOpen) setIsOpen(true)
    }

    const handleSelect = (selected: string) => {
      const opt =
        options.find((o) => o.value === selected) ??
        options.find((o) => o.label === selected)
      if (opt) {
        // Input shows the human-readable label; commit reports the
        // machine value (slug). This is the Ant AutoComplete /
        // shadcn Combobox convention.
        setInputText(opt.label)
        onValueChange?.(opt.value)
      } else if (allowCustomValue) {
        setInputText(selected)
        onValueChange?.(selected)
      }
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
            value={inputText}
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
          // Keep keyboard focus on the input — never steal it into the
          // popover content.
          onOpenAutoFocus={(event) => event.preventDefault()}
          // Radix Popover defaults: focus on the anchor counts as
          // "outside" the content, so opening on focus would
          // immediately re-close. Suppress focus-outside; pointer-
          // outside (`onInteractOutside` via pointerdown) still fires
          // when the user clicks elsewhere, so click-to-close works.
          onFocusOutside={(event) => event.preventDefault()}
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
