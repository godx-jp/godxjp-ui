import * as React from "react";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { resolveFieldA11y } from "../../lib/field-a11y";
import { controlIconClass } from "../../lib/control-styles";
import type { ColorPickerProp } from "../../props/components/data-entry.prop";
import { Input } from "./input";

export type {
  ColorPickerProp,
  ColorPickerProp as ColorPickerProps,
} from "../../props/components/data-entry.prop";

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeHex(value: string): string {
  if (!value.startsWith("#")) return `#${value}`;
  return value;
}

export function ColorPicker({
  value = "#2563eb",
  onValueChange,
  disabled,
  className,
  id,
  showHexInput = true,
  ...ariaProps
}: ColorPickerProp) {
  const { t } = useTranslation();
  const [draft, setDraft] = React.useState<string | null>(null);
  const display = draft ?? value;
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
    onValueChange?.(normalized);
  };

  return (
    <div className={cn("ui-color-picker", className)}>
      <div className={cn("ui-color-picker-swatch", controlIconClass)}>
        <div
          className="ui-color-picker-preview"
          style={{ backgroundColor: HEX_PATTERN.test(display) ? display : value }}
          aria-hidden="true"
        />
        <input
          id={id}
          type="color"
          value={HEX_PATTERN.test(display) ? display : value}
          disabled={disabled}
          onChange={(event) => commit(event.target.value)}
          className="ui-color-picker-input"
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
    </div>
  );
}
