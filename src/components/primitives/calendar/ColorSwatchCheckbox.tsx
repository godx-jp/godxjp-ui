import type { ComponentProps } from "react";
import { Check } from "lucide-react";
import { cn } from "../cn";

/**
 * ColorSwatchCheckbox — Google-Calendar-style "color square = on/off"
 * checkbox. Border paints in `color`; fill paints `color` when checked.
 * Hidden native `<input>` keeps it a real form control + a11y target.
 *
 * @example
 *   <ColorSwatchCheckbox
 *     color="#4c6cb3"
 *     label="godx-admin · Product"
 *     checked={shown}
 *     onChange={(next) => setShown(next)}
 *   />
 */
export interface ColorSwatchCheckboxProps
  extends Omit<ComponentProps<"label">, "onChange"> {
  color: string;
  label: string;
  checked: boolean;
  onChange?: (next: boolean) => void;
  /** Marks the row as read-only (renders an "R" hint instead of a swatch). */
  readonly?: boolean;
  disabled?: boolean;
}

export function ColorSwatchCheckbox({
  color,
  label,
  checked,
  onChange,
  readonly = false,
  disabled = false,
  className,
  ...rest
}: ColorSwatchCheckboxProps) {
  return (
    <label className={cn("swatch-check", className)} {...rest}>
      <span
        className="swatch-check-box"
        style={{
          color,
          background: checked ? color : "transparent",
        }}
      >
        {checked && (
          <Check size={10} strokeWidth={3} color="white" aria-hidden="true" />
        )}
      </span>
      <span className="swatch-check-name">{label}</span>
      {readonly && (
        <span className="swatch-check-readonly" title="read-only">
          R
        </span>
      )}
      <input
        type="checkbox"
        className="swatch-check-native"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </label>
  );
}
