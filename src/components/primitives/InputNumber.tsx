import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "./cn";
import type { InputSize, InputStatus } from "./Input";

/**
 * InputNumber — numeric input with optional ± step buttons and an
 * optional display formatter / parser pair.
 *
 * Vocabulary per cardinal rule 23 §B:
 *   • `value` / `defaultValue` / `onValueChange` (Radix-style)
 *   • `size`: `"small" | "default" | "large"` (shared with Input)
 *   • `status`: `"default" | "success" | "warning" | "error"`
 *
 * NOT Ant-shaped: no `controls` / `formatter` / `parser`. The
 * display side is a single `format` callback; the inverse parse is
 * an optional `parse` callback (only needed when `format` produces
 * text the browser's `Number()` can no longer round-trip).
 *
 * DOM mirrors `.input` from `30-input.css` with two stacked step
 * buttons absolutely positioned inside the wrapper.
 */

export interface InputNumberProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Increment applied by the ± buttons + arrow keys. Default 1. */
  step?: number;
  /** Round to this many decimal places when emitting / blurring. */
  precision?: number;
  size?: InputSize;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  /** Show +/− step buttons (default true). */
  showStepper?: boolean;
  /** Optional display formatter (e.g., `n => \`¥\${n.toLocaleString()}\``). */
  format?: (value: number) => string;
  /** Optional parser (inverse of format). Defaults to stripping non-numeric chars. */
  parse?: (text: string) => number | null;
  className?: string;
  status?: InputStatus;
  /** Forwarded `name` for native form submission. */
  name?: string;
  /** Forwarded `id` for label binding. */
  id?: string;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
}

const SIZE_CLASS: Record<InputSize, string> = {
  small: "input-size-small",
  default: "",
  large: "input-size-large",
};

const STATUS_CLASS: Record<InputStatus, string> = {
  default: "",
  success: "input-status-success",
  warning: "input-status-warning",
  error: "input-status-error",
};

function roundTo(value: number, precision?: number): number {
  if (precision === undefined || precision < 0) return value;
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min?: number, max?: number): number {
  let out = value;
  if (typeof min === "number") out = Math.max(out, min);
  if (typeof max === "number") out = Math.min(out, max);
  return out;
}

function defaultParse(text: string): number | null {
  const cleaned = text.replace(/[^\d.\-eE+]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  function InputNumber(
    {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      precision,
      size = "default",
      disabled,
      readOnly,
      placeholder,
      showStepper = true,
      format,
      parse,
      className,
      status = "default",
      name,
      id,
      onBlur,
      onFocus,
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number | null>(
      defaultValue ?? null,
    );
    const currentValue = isControlled ? value ?? null : internalValue;

    // Text shown in the input. When focused or the user is mid-typing,
    // we show the raw text; when blurred we display the `format` output.
    const [displayText, setDisplayText] = useState<string>(() =>
      currentValue === null || currentValue === undefined
        ? ""
        : format
          ? format(currentValue)
          : String(currentValue),
    );
    const [isFocused, setIsFocused] = useState(false);
    const lastEmittedRef = useRef<number | null>(currentValue);

    // Sync display when the controlled `value` changes from the outside
    // (and we are not the source of the change).
    useEffect(() => {
      if (isFocused) return;
      const next = currentValue;
      if (next === null || next === undefined) {
        setDisplayText("");
        return;
      }
      setDisplayText(format ? format(next) : String(next));
    }, [currentValue, format, isFocused]);

    const emit = useCallback(
      (next: number | null) => {
        if (!isControlled) setInternalValue(next);
        if (lastEmittedRef.current !== next) {
          lastEmittedRef.current = next;
          onValueChange?.(next);
        }
      },
      [isControlled, onValueChange],
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      setDisplayText(raw);
      if (raw === "") {
        emit(null);
        return;
      }
      const parsed = (parse ?? defaultParse)(raw);
      if (parsed === null) return;
      emit(parsed);
    };

    const commit = useCallback(() => {
      if (currentValue === null || currentValue === undefined) {
        setDisplayText("");
        return;
      }
      const clamped = clamp(roundTo(currentValue, precision), min, max);
      emit(clamped);
      setDisplayText(format ? format(clamped) : String(clamped));
    }, [currentValue, emit, format, max, min, precision]);

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      commit();
      onBlur?.(event);
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Show raw numeric text on focus so users can edit cleanly.
      if (currentValue !== null && currentValue !== undefined) {
        setDisplayText(String(currentValue));
      }
      onFocus?.(event);
    };

    const stepBy = useCallback(
      (direction: 1 | -1) => {
        if (disabled || readOnly) return;
        const base =
          currentValue ?? (typeof min === "number" ? min : 0);
        const next = clamp(roundTo(base + direction * step, precision), min, max);
        emit(next);
        if (!isFocused) {
          setDisplayText(format ? format(next) : String(next));
        } else {
          setDisplayText(String(next));
        }
      },
      [currentValue, disabled, emit, format, isFocused, max, min, precision, readOnly, step],
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        stepBy(1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        stepBy(-1);
      }
    };

    const sizeClass = SIZE_CLASS[size];
    const statusClass = STATUS_CLASS[status];

    const ariaProps = useMemo(
      () => ({
        role: "spinbutton" as const,
        "aria-valuenow": currentValue ?? undefined,
        "aria-valuemin": min,
        "aria-valuemax": max,
      }),
      [currentValue, min, max],
    );

    return (
      <span
        className={cn(
          "input-number-wrap",
          sizeClass,
          statusClass,
          className,
        )}
      >
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          name={name}
          id={id}
          className={cn(
            "input",
            "input-number",
            sizeClass,
            statusClass,
            readOnly && "input-readonly",
            !showStepper && "input-number-no-stepper",
          )}
          value={displayText}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          {...ariaProps}
        />
        {showStepper && (
          <span className="input-number-stepper" aria-hidden>
            <button
              type="button"
              tabIndex={-1}
              className="input-number-step"
              disabled={disabled || readOnly}
              onMouseDown={(e) => {
                e.preventDefault();
                stepBy(1);
              }}
            >
              <ChevronUp size={12} aria-hidden />
            </button>
            <button
              type="button"
              tabIndex={-1}
              className="input-number-step"
              disabled={disabled || readOnly}
              onMouseDown={(e) => {
                e.preventDefault();
                stepBy(-1);
              }}
            >
              <ChevronDown size={12} aria-hidden />
            </button>
          </span>
        )}
      </span>
    );
  },
);
