import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { pickFieldA11y } from "../../lib/field-a11y";
import { Button } from "../general/button";
import { Input } from "./input";
import type { NumberInputProp } from "../../props/components/data-entry.prop";

export type {
  NumberInputProp,
  NumberInputProp as NumberInputProps,
} from "../../props/components/data-entry.prop";

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

/**
 * Normalise a typed numeric string for parsing — the JAPANESE half of this control.
 *
 * A Japanese keyboard in 全角 (full-width) mode produces `１２３．５`, and `Number("１２３．５")`
 * is `NaN`: JS parses full-width DIGITS but not the full-width period, minus or comma. NFKC folds
 * every one of those onto its ASCII twin, so a value typed in 全角 commits as the number the user
 * meant instead of silently clearing the field on blur. The 全角 comma is a thousands separator in
 * the same input mode, so it is dropped rather than folded (NFKC would leave a bare `,`).
 */
function normalizeNumeric(raw: string): string {
  return raw.normalize("NFKC").replace(/,/g, "");
}

/** Round to `precision` decimals, avoiding binary FP drift (e.g. 0.1 + 0.2). */
function roundTo(n: number, precision: number): number {
  if (!Number.isFinite(n)) return n;
  const factor = 10 ** precision;
  return Math.round((n + Number.EPSILON) * factor) / factor;
}

/**
 * NumberInput — WAI-ARIA spinbutton: a localized numeric `<Input>` with increment/decrement steps.
 * Composes the real `Input` primitive (no raw `<input>`) plus two icon `Button`s.
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
      formatter,
      parser,
      keyboard = true,
      changeOnWheel = false,
      controls = true,
      status,
      variant,
      disabled,
      readOnly,
      size = "md",
      placeholder,
      prefix,
      suffix,
      name,
      id,
      className,
      "data-testid": dataTestId,
      ...ariaProps
    },
    ref,
  ) => {
    const { t, locale } = useTranslation();
    // Forward the full FormField label/helper/error/required/invalid contract onto the
    const fieldA11y = pickFieldA11y(ariaProps);

    /*
     * THE TWO STEPPERS ARE NAMED AFTER THE FIELD THEY STEP, NOT AFTER THE VERB.
     *
     * They used to be a bare 「増やす」 / 「減らす」, which is unique on a page with ONE numeric
     * field and useless on a page with several. Counted on /isolate/data-entry-number-input:
     * 16 buttons called 「増やす」 and 16 called 「減らす」, on a page where every field has a
     * distinct name (数量, 評価, 目標金額, 重量, 価格…). A screen-reader user listing the buttons
     * gets thirty-two rows that all read the same and none of which says what they change
     * (WCAG 2.4.6; the steppers are `tabIndex={-1}` so this is a rotor/virtual-cursor problem
     * rather than a tab-order one, which is exactly the audience that cannot see which field the
     * button sits beside).
     *
     * The name is composed from whatever already names the FIELD, so no consumer has to pass
     * anything and no new prop exists:
     *   · `aria-label` (a string we hold) → one composed label, in the locale's own word order;
     *   · `aria-labelledby` (an element we do not hold) → `aria-labelledby` on the stepper listing
     *     the field's label source first and the stepper's own hidden verb second, which is how
     *     ARIA concatenates a name out of parts;
     *   · neither → the bare verb, exactly as before.
     */
    const stepperVerbId = React.useId();
    const fieldLabel =
      typeof fieldA11y["aria-label"] === "string" ? fieldA11y["aria-label"] : undefined;
    const fieldLabelledBy =
      typeof fieldA11y["aria-labelledby"] === "string" ? fieldA11y["aria-labelledby"] : undefined;

    const stepperName = (direction: "increment" | "decrement") => {
      const verb = t(`ui.numberInput.${direction}`);
      // `aria-labelledby` FIRST, because that is the order ARIA itself resolves a name in: a field
      // carrying both is named by the element, and composing from the `aria-label` instead would
      // announce a stepper for a field name the user never hears. Measured on
      // /isolate/data-entry-number-input, where the stories pass both: the field reads
      // 「評価 (1–5)」 and the stepper was composing from 「評価」.
      if (fieldLabelledBy) {
        return { "aria-labelledby": `${fieldLabelledBy} ${stepperVerbId}-${direction}` };
      }
      if (fieldLabel) {
        return {
          "aria-label": t(`ui.numberInput.${direction}Field`, { label: fieldLabel }) || verb,
        };
      }
      return { "aria-label": verb };
    };

    const isControlled = controlledValue !== undefined;
    const [internal, setInternal] = React.useState<number | null>(defaultValue);
    const numericValue = isControlled ? (controlledValue ?? null) : internal;

    // Effective decimal places: explicit `precision`, else inferred from `step`.
    const effectivePrecision = precision ?? decimalsOf(step);

    // Locale-aware formatter for the value AT REST (when not being edited).
    const intlFormatter = React.useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: 0,
          maximumFractionDigits: Math.max(effectivePrecision, 0),
          useGrouping: false,
        }),
      [locale, effectivePrecision],
    );

    // antd `formatter` REPLACES the localized default (a unit, a thousands separator, 円).
    const formatAtRest = React.useCallback(
      (n: number | null): string =>
        formatter ? formatter(n) : n == null ? "" : intlFormatter.format(n),
      [formatter, intlFormatter],
    );

    /**
     * antd `parser` — the inverse of `formatter`. Without one, the built-in reader folds 全角 to
     * ASCII first (see normalizeNumeric) so a value typed on a Japanese keyboard survives blur.
     */
    const parseDraft = React.useCallback(
      (raw: string): number | null => {
        if (parser) return parser(raw);
        const trimmed = normalizeNumeric(raw).trim();
        if (trimmed === "" || trimmed === "-") return null;
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? null : parsed;
      },
      [parser],
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

    /**
     * IME COMPOSITION IS NOT TYPING. Between `compositionstart` and `compositionend` the field
     * holds a CANDIDATE, not a value: on a Japanese keyboard the intermediate text is the reading
     * being converted, not the user's answer. Parsing or committing there is what makes a Japanese
     * form eat a number half-way through an entry.
     */
    const composing = React.useRef(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      setDraft(raw);
      if (readOnly) return;
      // `isComposing` is the authoritative flag on the native event; the ref covers the browsers
      // that leave it false on the very first keystroke of a composition. React types the change
      // event's native side as a bare `Event`, which is where the cast comes from — the DOM does
      // deliver an `InputEvent` here.
      if (composing.current || (event.nativeEvent as InputEvent).isComposing) return;
      const trimmed = normalizeNumeric(raw).trim();
      if (trimmed === "" || trimmed === "-") {
        // Empty / lone minus = no committed value yet; don't fight the user's typing.
        if (trimmed === "") commit(null);
        return;
      }
      const parsed = parseDraft(raw);
      if (parsed == null) return;
      // While typing we DON'T clamp/round (that would fight mid-entry); we sync the raw number so
      // the controlled mirror tracks keystrokes, then normalize on blur.
      if (!isControlled) setInternal(parsed);
      onValueChange?.(parsed);
    };

    const handleCompositionStart = () => {
      composing.current = true;
    };

    /** The conversion is confirmed — only NOW is the candidate a value, so read it once. */
    const handleCompositionEnd = (event: React.CompositionEvent<HTMLInputElement>) => {
      composing.current = false;
      if (readOnly) return;
      const raw = event.currentTarget.value;
      const parsed = parseDraft(raw);
      if (parsed == null) {
        if (normalizeNumeric(raw).trim() === "") commit(null);
        return;
      }
      if (!isControlled) setInternal(parsed);
      onValueChange?.(parsed);
    };

    const handleBlur = () => {
      setFocused(false);
      const committed = commit(parseDraft(draft));
      setDraft(formatAtRest(committed));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!interactive) return;
      // ENTER DURING A COMPOSITION CONFIRMS THE CONVERSION — it is neither a submit nor a commit.
      // Committing here reformats the field out from under the candidate window and the chosen
      // reading is lost. Same reasoning for the arrows: they walk the candidate list.
      if (composing.current || event.nativeEvent.isComposing) return;
      if (keyboard && event.key === "ArrowUp") {
        event.preventDefault();
        stepBy(1, event.shiftKey ? 10 : 1);
      } else if (keyboard && event.key === "ArrowDown") {
        event.preventDefault();
        stepBy(-1, event.shiftKey ? 10 : 1);
      } else if (event.key === "Enter") {
        const committed = commit(parseDraft(draft));
        setDraft(formatAtRest(committed));
      }
    };

    /**
     * antd `changeOnWheel`. Off by default, and gated on FOCUS even when on: a wheel handler that
     * fires on hover turns every scroll past a long form into a silent data edit.
     */
    const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
      if (!changeOnWheel || !interactive || !focused || event.deltaY === 0) return;
      stepBy(event.deltaY < 0 ? 1 : -1);
    };

    return (
      <div
        data-slot="number-input"
        data-size={size}
        data-status={status}
        data-variant={variant}
        data-controls={controls ? undefined : "off"}
        className={cn("ui-number-input", className)}
      >
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
          data-field={(ariaProps as { "data-field"?: string })["data-field"]}
          className="ui-number-input-field"
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          status={status}
          variant={variant}
          {...fieldA11y}
          aria-valuenow={numericValue ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={numericValue != null ? formatAtRest(numericValue) : undefined}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
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
        {/* antd `controls={false}` — the field keeps ArrowUp/ArrowDown and its spinbutton role,
            it simply stops drawing the two buttons. A read-only-looking number entry inside a
            dense table is the case; dropping the ROLE with them would be a different control. */}
        {controls ? (
          <span data-slot="number-input-steppers" className="ui-number-input-steppers">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              className="ui-number-input-step ui-number-input-step-up"
              tabIndex={-1}
              disabled={!interactive || atMax}
              {...stepperName("increment")}
              onClick={() => stepBy(1)}
            >
              <ChevronUp aria-hidden="true" />
              {/* The verb half of the composed name. Only referenced in the `aria-labelledby`
                  branch, but rendered unconditionally so the id is stable across a field that
                  gains or loses its label source. */}
              <span id={`${stepperVerbId}-increment`} className="sr-only">
                {t("ui.numberInput.increment")}
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              className="ui-number-input-step ui-number-input-step-down"
              tabIndex={-1}
              disabled={!interactive || atMin}
              {...stepperName("decrement")}
              onClick={() => stepBy(-1)}
            >
              <ChevronDown aria-hidden="true" />
              <span id={`${stepperVerbId}-decrement`} className="sr-only">
                {t("ui.numberInput.decrement")}
              </span>
            </Button>
          </span>
        ) : null}
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";
