import * as React from "react";

import { cn } from "../../lib/utils";
import { isValidHhmm, normalizeHhmm } from "../../lib/datetime";

type TimeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  step?: number;
};

function clampStep(step?: number) {
  if (!step || Number.isNaN(step)) return 1;
  const parsed = Math.max(1, Math.floor(step));
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(59, parsed);
}

function applyStep(value: string, step: number): string {
  const normalized = normalizeHhmm(value);
  if (!normalized) return value;
  const [hourText, minuteText] = normalized.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const floored = Math.floor(minute / step) * step;
  const safeMinute = Math.min(59, Math.max(0, floored));
  return `${String(hour).padStart(2, "0")}:${String(safeMinute).padStart(2, "0")}`;
}

function maskTime(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** Step the current HH:mm by `delta` minutes, wrapping across the 24h day. */
function stepTime(value: string, deltaMinutes: number): string {
  const normalized = normalizeHhmm(value) ?? "00:00";
  const [hourText, minuteText] = normalized.split(":");
  const total = (Number(hourText) * 60 + Number(minuteText) + deltaMinutes + 24 * 60) % (24 * 60);
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function TimeInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  placeholder,
  step = 1,
  className,
  name,
  id,
  ...props
}: TimeInputProps) {
  const safeStep = clampStep(step);
  const [internal, setInternal] = React.useState(defaultValue);
  const [displayValue, setDisplayValue] = React.useState(controlledValue ?? defaultValue);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? (controlledValue ?? "") : internal;

  React.useEffect(() => {
    if (!isControlled) return;
    setDisplayValue(controlledValue ?? "");
  }, [controlledValue, isControlled]);

  React.useEffect(() => {
    if (isControlled) return;
    setDisplayValue(internal);
  }, [internal, isControlled]);

  const commit = React.useCallback(
    (next: string, fromBlur = false) => {
      const normalized = normalizeHhmm(next);
      if (!normalized) return;

      const snapped = applyStep(normalized, safeStep);
      if (!isControlled) {
        setInternal(snapped);
      }

      if (isValidHhmm(snapped)) {
        onValueChange?.(snapped);
        setDisplayValue(snapped);
      }

      if (fromBlur && value !== snapped) {
        onValueChange?.(snapped);
      }
    },
    [isControlled, onValueChange, safeStep, value],
  );

  const valid = isValidHhmm(value);

  return (
    <input
      id={id}
      name={name}
      value={displayValue}
      data-slot="time-input"
      className={cn("ui-time-input", className)}
      role="spinbutton"
      aria-valuemin={0}
      aria-valuemax={24 * 60 - 1}
      aria-valuenow={valid ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5)) : undefined}
      aria-valuetext={valid ? value : undefined}
      aria-invalid={displayValue !== "" && !isValidHhmm(displayValue) ? "true" : undefined}
      placeholder={placeholder ?? "HH:mm"}
      inputMode="numeric"
      autoComplete="off"
      {...props}
      onChange={(event) => {
        const masked = maskTime(event.target.value);
        setDisplayValue(masked);

        const normalized = normalizeHhmm(masked);
        if (normalized) {
          const snapped = applyStep(normalized, safeStep);
          if (!isControlled) {
            setInternal(snapped);
          }
          onValueChange?.(snapped);
          setDisplayValue(snapped);
        }

        props.onChange?.(event);
      }}
      onBlur={(event) => {
        commit(event.target.value, true);
        const normalized = normalizeHhmm(event.target.value);
        if (!normalized) {
          setDisplayValue(value);
        }
        props.onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          commit(event.currentTarget.value, true);
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          const base = isValidHhmm(displayValue) ? displayValue : value || "00:00";
          const next = stepTime(base, event.key === "ArrowUp" ? safeStep : -safeStep);
          setDisplayValue(next);
          if (!isControlled) {
            setInternal(next);
          }
          onValueChange?.(next);
        }
        props.onKeyDown?.(event);
      }}
    />
  );
}

export type { TimeInputProps };
