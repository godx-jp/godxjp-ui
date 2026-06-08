import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Input } from "./input";
import type { NumberInputProp } from "../../props/components/data-entry.prop";

export type {
  NumberInputProp,
  NumberInputProp as NumberInputProps,
} from "../../props/components/data-entry.prop";

/** Count decimal places of a finite number (used to derive precision from `step`). */
function decimalsOf(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

/** Clamp `n` into [min, max] (either bound optional). */
function clamp(n: number, min?: number, max?: number): number {
  let out = n;
  if (min != null && out < min) out = min;
  if (max != null && out > max) out = max;
  return out;
}

/** Round to `precision` decimals, avoiding binary FP drift (e.g. 0.1 + 0.2). */
function roundTo(n: number, precision: number): number {
  if (!Number.isFinite(n)) return n;
  const factor = 10 ** precision;
  return Math.round((n + Number.EPSILON) * factor) / factor;
}

/**
 * NumberInput — WAI-ARIA spinbutton: a localized numeric `<Input>` with increment/decrement steps.
 *
 * Composes the real `Input` primitive (no raw `<input>`) plus two icon `Button`s. The text input is
 * the `role="spinbutton"` element carrying `aria-valuenow/min/max/text`; type freely, ArrowUp/Down
 * (Shift = ×10) step, and the value commits clamped + rounded to `precision` on blur/Enter/step.
 * Display formats via `Intl.NumberFormat` at rest, but stays raw and typeable while focused.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProp>(
  (
    {
      value: controlledValue,
      defaultValue = null,
      onValueChange,
      min,
      max,
      step = 1,
      precision,
      disabled,
      readOnly,
      size = "md",
      placeholder,
      prefix,
      suffix,
      name,
      id,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
      "data-testid": dataTestId,
    },
    ref,
  ) => {
    const { t, locale } = useTranslation();

    const isControlled = controlledValue !== undefined;
    const [internal, setInternal] = React.useState<number | null>(defaultValue);
    const numericValue = isControlled ? (controlledValue ?? null) : internal;

    // Effective decimal places: explicit `precision`, else inferred from `step`.
    const effectivePrecision = precision ?? decimalsOf(step);

    // Locale-aware formatter for the value AT REST (when not being edited).
    const formatter = React.useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: 0,
          maximumFractionDigits: Math.max(effectivePrecision, 0),
          useGrouping: false,
        }),
      [locale, effectivePrecision],
    );

    const formatAtRest = React.useCallback(
      (n: number | null): string => (n == null ? "" : formatter.format(n)),
      [formatter],
    );

    // The text shown in the field. While focused we keep the user's raw keystrokes; at rest we show
    // the formatted value so a controlled value change is always reflected.
    const [draft, setDraft] = React.useState<string>(() => formatAtRest(numericValue));
    const [focused, setFocused] = React.useState(false);

    React.useEffect(() => {
      if (focused) return;
      setDraft(formatAtRest(numericValue));
    }, [numericValue, focused, formatAtRest]);

    const commit = React.useCallback(
      (next: number | null) => {
        const normalized =
          next == null || Number.isNaN(next)
            ? null
            : roundTo(clamp(next, min, max), effectivePrecision);
        if (!isControlled) setInternal(normalized);
        onValueChange?.(normalized);
        if (!focused) setDraft(formatAtRest(normalized));
        return normalized;
      },
      [effectivePrecision, focused, formatAtRest, isControlled, max, min, onValueChange],
    );

    const stepBy = React.useCallback(
      (direction: 1 | -1, multiplier = 1) => {
        const base = numericValue ?? min ?? 0;
        const next = base + direction * step * multiplier;
        const committed = commit(next);
        // Reflect immediately even while focused (button press / arrow key).
        setDraft(formatAtRest(committed));
      },
      [commit, formatAtRest, min, numericValue, step],
    );

    const atMin = min != null && numericValue != null && numericValue <= min;
    const atMax = max != null && numericValue != null && numericValue >= max;
    const interactive = !disabled && !readOnly;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      setDraft(raw);
      if (readOnly) return;
      const trimmed = raw.trim();
      if (trimmed === "" || trimmed === "-") {
        // Empty / lone minus = no committed value yet; don't fight the user's typing.
        if (trimmed === "") commit(null);
        return;
      }
      const parsed = Number(trimmed);
      if (Number.isNaN(parsed)) return;
      // While typing we DON'T clamp/round (that would fight mid-entry); we sync the raw number so
      // the controlled mirror tracks keystrokes, then normalize on blur.
      if (!isControlled) setInternal(parsed);
      onValueChange?.(parsed);
    };

    const handleBlur = () => {
      setFocused(false);
      const trimmed = draft.trim();
      if (trimmed === "" || trimmed === "-") {
        commit(null);
        setDraft(formatAtRest(null));
        return;
      }
      const parsed = Number(trimmed);
      const committed = commit(Number.isNaN(parsed) ? null : parsed);
      setDraft(formatAtRest(committed));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!interactive) return;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        stepBy(1, event.shiftKey ? 10 : 1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        stepBy(-1, event.shiftKey ? 10 : 1);
      } else if (event.key === "Enter") {
        const trimmed = draft.trim();
        const parsed = Number(trimmed);
        const committed = commit(trimmed === "" || Number.isNaN(parsed) ? null : parsed);
        setDraft(formatAtRest(committed));
      }
    };

    return (
      <div data-slot="number-input" data-size={size} className={cn("ui-number-input", className)}>
        {prefix != null ? (
          <span
            data-slot="number-input-prefix"
            className="ui-number-input-affix"
            aria-hidden="true"
          >
            {prefix}
          </span>
        ) : null}
        <Input
          ref={ref}
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          role="spinbutton"
          data-slot="number-input-field"
          data-testid={dataTestId}
          className="ui-number-input-field"
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          aria-valuenow={numericValue ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={numericValue != null ? formatAtRest(numericValue) : undefined}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {suffix != null ? (
          <span
            data-slot="number-input-suffix"
            className="ui-number-input-affix"
            aria-hidden="true"
          >
            {suffix}
          </span>
        ) : null}
        <span data-slot="number-input-steppers" className="ui-number-input-steppers">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            className="ui-number-input-step ui-number-input-step-up"
            tabIndex={-1}
            disabled={!interactive || atMax}
            aria-label={t("ui.numberInput.increment")}
            onClick={() => stepBy(1)}
          >
            <ChevronUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            className="ui-number-input-step ui-number-input-step-down"
            tabIndex={-1}
            disabled={!interactive || atMin}
            aria-label={t("ui.numberInput.decrement")}
            onClick={() => stepBy(-1)}
          >
            <ChevronDown aria-hidden="true" />
          </Button>
        </span>
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";
