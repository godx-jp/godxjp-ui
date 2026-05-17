import {
  forwardRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { cn } from "./cn";

/**
 * ColorPicker — decorative color-selection trigger + popover panel.
 *
 *   <ColorPicker defaultValue="#3b82f6" presets={["#ef4444", "#10b981"]} />
 *
 * Modeled on Input/Popconfirm prop shape per cardinal rule 23 §D.4.
 * The trigger is a `.colorpicker-trigger` button (swatch + hex label);
 * the popover hosts a native `<input type="color">` canvas plus a hex
 * text input + preset swatch grid.
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `value` / `defaultValue` / `onValueChange` — Radix-style state
 *   - `size` — `"small" | "default" | "large"` (matches Input)
 *   - `disabled` — boolean
 *   - `open` / `defaultOpen` / `onOpenChange` — popover state
 *   - `presets` — configurable hex list
 *   - `showAlpha` — toggle alpha slider (0..1)
 *
 * Never uses Ant's `format` / `mode` aliases — `value` is always a hex
 * string (with optional `#rrggbbaa` when `showAlpha` is true).
 */

export type ColorPickerSize = "small" | "default" | "large";

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  presets?: string[];
  showAlpha?: boolean;
  size?: ColorPickerSize;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const SIZE_CLASS: Record<ColorPickerSize, string> = {
  small: "input-size-small",
  default: "",
  large: "input-size-large",
};

const HEX_RGB_RE = /^#?([0-9a-fA-F]{6})$/;
const HEX_RGBA_RE = /^#?([0-9a-fA-F]{8})$/;

function normalizeHex(raw: string, showAlpha: boolean): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (showAlpha && HEX_RGBA_RE.test(value)) {
    return `#${value.replace(/^#/, "").toLowerCase()}`;
  }
  if (HEX_RGB_RE.test(value)) {
    return `#${value.replace(/^#/, "").toLowerCase()}`;
  }
  return null;
}

function pickerHex(value: string): string {
  // <input type="color"> only accepts #rrggbb — strip alpha.
  const m = value.match(/^#([0-9a-fA-F]{6})/);
  return m ? `#${m[1]}` : "#000000";
}

function alphaOf(value: string): number {
  const m = value.match(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})$/);
  if (!m) return 1;
  return parseInt(m[1], 16) / 255;
}

function applyAlpha(hex: string, alpha: number): string {
  const base = pickerHex(hex);
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${base}${a}`;
}

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(
  function ColorPicker(
    {
      value,
      defaultValue = "#3b82f6",
      onValueChange,
      presets,
      showAlpha = false,
      size = "default",
      disabled = false,
      open,
      defaultOpen,
      onOpenChange,
      className,
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = useState<string>(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const [internalOpen, setInternalOpen] = useState<boolean>(
      defaultOpen ?? false,
    );
    const isOpenControlled = open !== undefined;
    const currentOpen = isOpenControlled ? open : internalOpen;

    const [hexDraft, setHexDraft] = useState<string>(currentValue);

    const commit = (next: string) => {
      if (!isControlled) setInternalValue(next);
      setHexDraft(next);
      onValueChange?.(next);
    };

    const setOpen = (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    const handlePickerChange = (event: ChangeEvent<HTMLInputElement>) => {
      const base = event.target.value;
      const next = showAlpha
        ? applyAlpha(base, alphaOf(currentValue))
        : base.toLowerCase();
      commit(next);
    };

    const handleHexInput = (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      setHexDraft(raw);
      const normalized = normalizeHex(raw, showAlpha);
      if (normalized) commit(normalized);
    };

    const handleAlphaChange = (event: ChangeEvent<HTMLInputElement>) => {
      const alpha = Number(event.target.value);
      commit(applyAlpha(currentValue, alpha));
    };

    return (
      <Popover open={currentOpen} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            data-disabled={disabled || undefined}
            className={cn(
              "colorpicker-trigger",
              SIZE_CLASS[size],
              className,
            )}
            aria-label="Choose color"
          >
            <span
              className="colorpicker-swatch"
              style={{ background: currentValue }}
              aria-hidden
            />
            <span className="colorpicker-trigger-label">{currentValue}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="colorpicker-panel" align="start">
          <div
            className="colorpicker-preview"
            style={{ background: currentValue }}
            aria-hidden
          />
          <input
            type="color"
            value={pickerHex(currentValue)}
            onChange={handlePickerChange}
            className="colorpicker-canvas"
            aria-label="Color canvas"
          />
          {showAlpha && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={alphaOf(currentValue)}
              onChange={handleAlphaChange}
              className="colorpicker-alpha"
              aria-label="Alpha channel"
            />
          )}
          <input
            type="text"
            value={hexDraft}
            onChange={handleHexInput}
            className={cn("input", "colorpicker-hex")}
            spellCheck={false}
            aria-label="Hex value"
          />
          {presets && presets.length > 0 && (
            <div className="colorpicker-presets" role="listbox" aria-label="Preset colors">
              {presets.map((preset) => {
                const selected =
                  preset.toLowerCase() === currentValue.toLowerCase();
                return (
                  <button
                    key={preset}
                    type="button"
                    className="colorpicker-preset"
                    role="option"
                    aria-selected={selected}
                    data-selected={selected || undefined}
                    style={{ background: preset }}
                    onClick={() => commit(preset)}
                    aria-label={preset}
                  />
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  },
);

ColorPicker.displayName = "ColorPicker";

export type ColorPickerTriggerNode = ReactNode;
