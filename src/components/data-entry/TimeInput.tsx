import { forwardRef, useEffect, useState, type ChangeEvent, type FocusEvent } from "react"
import { cn } from "../cn"

export interface TimeInputProps {
  /** Current time value in `"HH:mm"` (24-hour) format. */
  value?: string
  /** Fired on blur with the validated `"HH:mm"` string. */
  onChange?: (time: string) => void
  /** Additional class name applied to the input element. */
  className?: string
  /** Disable input + propagate aria-disabled. */
  disabled?: boolean
  /** Optional placeholder (defaults to "HH:mm"). */
  placeholder?: string
  /** Optional id used for label association. */
  id?: string
  /** Optional name used in form submissions. */
  name?: string
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

function normalize(raw: string): string {
  // Strip whitespace + non-digits-or-colon. Accept either "HH:mm" or
  // "HHmm" / "H:mm" / "Hmm" and coerce into canonical "HH:mm". Returns
  // the original string when it can't be parsed — the caller decides
  // whether to surface aria-invalid.
  const cleaned = raw.trim()
  if (!cleaned) return ""
  if (TIME_PATTERN.test(cleaned)) return cleaned
  const digits = cleaned.replace(/[^0-9]/g, "")
  if (digits.length === 3 || digits.length === 4) {
    const hh = digits.slice(0, digits.length - 2).padStart(2, "0")
    const mm = digits.slice(-2)
    const candidate = `${hh}:${mm}`
    if (TIME_PATTERN.test(candidate)) return candidate
  }
  return raw
}

/**
 * TimeInput — narrow text input for HH:mm (24-hour) values.
 * Mirrors the public `@godxjp/ui@0.2.0` API so call sites don't change
 * when upgrading to v2. Visual contract lives in the `.time-input`
 * class in tokens.css.
 *
 * Validation: emits `onChange` with the normalized string on blur if
 * it parses, otherwise leaves the value untouched and surfaces
 * `aria-invalid` so the consumer can style the error state.
 */
export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  function TimeInput(
    { value, onChange, className, disabled, placeholder = "HH:mm", id, name },
    ref,
  ) {
    const [draft, setDraft] = useState(value ?? "")

    useEffect(() => {
      setDraft(value ?? "")
    }, [value])

    const invalid = draft !== "" && !TIME_PATTERN.test(draft)

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        maxLength={5}
        id={id}
        name={name}
        disabled={disabled}
        placeholder={placeholder}
        value={draft}
        aria-invalid={invalid || undefined}
        className={cn("time-input", className)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
        onBlur={(e: FocusEvent<HTMLInputElement>) => {
          const next = normalize(e.target.value)
          setDraft(next)
          if (TIME_PATTERN.test(next) && next !== value) onChange?.(next)
        }}
      />
    )
  },
)
