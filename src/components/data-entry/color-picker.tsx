import * as React from "react";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { resolveFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { controlIconClass } from "../../lib/control-styles";
import type { ColorPickerProp } from "../../props/components/data-entry.prop";
import { Input } from "./input";

export type {
  ColorPickerProp,
  ColorPickerProp as ColorPickerProps,
} from "../../props/components/data-entry.prop";

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * The HTML default for `<input type="color">` (HTML §4.10.5.1.15 — a colour input's value must be
 * a valid simple colour, and `#000000` is the one the spec picks when there is none). It paints
 * the native swatch while the control holds NO colour; it is not a design decision and therefore
 * not a token. The component's own value stays `""` in that state, so nothing is submitted and
 * `onValueChange` never fires with a colour the user did not choose.
 */
const NATIVE_COLOR_FALLBACK = "#000000";

function normalizeHex(value: string): string {
  if (!value.startsWith("#")) return `#${value}`;
  return value;
}

export function ColorPicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled,
  name,
  className,
  id,
  showHexInput = true,
  ...ariaProps
}: ColorPickerProp) {
  const { t } = useTranslation();
  // Controlled/uncontrolled value (controlled-triad rule): `value` wins when provided, otherwise
  // internal state seeded from `defaultValue`. Without this a `<ColorPicker />` with no handler
  // was permanently frozen on its literal default — the canonical controlled-without-handler bug.
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const value = isControlled ? valueProp : internalValue;
  const [draft, setDraft] = React.useState<string | null>(null);
  const display = draft ?? value;
  // The visible swatch always needs a LEGAL colour; the component's value may legitimately be "".
  const swatchValue = HEX_PATTERN.test(display)
    ? display
    : HEX_PATTERN.test(value)
      ? value
      : NATIVE_COLOR_FALLBACK;
  // `name` rides a hidden input rather than the native colour swatch: an unset picker must submit
  // "" and not the swatch's legal-but-invented #000000.
  const identity = useFieldIdentity({ id, name, "data-field": ariaProps["data-field"] });
  const resolvedName = name ?? identity.name;
  // The native <input type="color"> is the primary focus target — forward the FormField
  // label/helper/error contract onto it (a FormField label via aria-labelledby wins over the
  // intrinsic "Color" aria-label). The hex mirror keeps its own descriptive label.
  const swatchA11y = resolveFieldA11y(ariaProps, t("dataEntry.colorPicker.ariaLabel"));

  const commit = (next: string) => {
    const normalized = normalizeHex(next);
    if (!HEX_PATTERN.test(normalized)) {
      setDraft(null);
      return;
    }
    setDraft(null);
    if (!isControlled) setInternalValue(normalized);
    onValueChange?.(normalized);
  };

  return (
    <div className={cn("ui-color-picker", className)}>
      <div className={cn("ui-color-picker-swatch", controlIconClass)}>
        <div
          className="ui-color-picker-preview"
          style={{ backgroundColor: swatchValue }}
          aria-hidden="true"
        />
        <input
          id={id}
          type="color"
          value={swatchValue}
          disabled={disabled}
          onChange={(event) => commit(event.target.value)}
          className="ui-color-picker-input"
          data-field={ariaProps["data-field"] ?? identity["data-field"]}
          {...swatchA11y}
        />
      </div>
      {showHexInput && (
        <Input
          id={id ? `${id}-hex` : undefined}
          value={display}
          disabled={disabled}
          aria-label={t("dataEntry.colorPicker.hexLabel")}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(display)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit(display);
          }}
          className="ui-color-picker-hex"
          spellCheck={false}
        />
      )}
      {/* Hidden field so the colour submits with a native form (Select/Switch/Rating do the same). */}
      {resolvedName ? <input type="hidden" name={resolvedName} value={value} readOnly /> : null}
    </div>
  );
}
