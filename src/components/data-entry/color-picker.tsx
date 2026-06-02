import * as React from "react";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
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
}: ColorPickerProp) {
  const { t } = useTranslation();
  const [draft, setDraft] = React.useState<string | null>(null);
  const display = draft ?? value;

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
          aria-label={t("dataEntry.colorPicker.ariaLabel")}
        />
      </div>
      {showHexInput && (
        <Input
          value={display}
          disabled={disabled}
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
