import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { isImeComposing } from "../../lib/ime";
import { resolveFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { controlIconClass } from "../../lib/control-styles";
import type {
  ColorPickerPresetProp,
  ColorPickerProp,
} from "../../props/components/data-entry.prop";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../data-display/collapsible";
import { Input } from "./input";

export type {
  ColorPickerProp,
  ColorPickerProp as ColorPickerProps,
  ColorPickerPresetProp,
  ColorPickerPresetProp as ColorPickerPresetProps,
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

/**
 * The comparison key for "is this preset the current colour": `#ABC`, `#abc` and `#aabbcc` are
 * one colour, so a preset written one way stays checked when the value arrives the other way
 * (antd compares `toCssString()`, which normalises the same way). Non-hex input keys as itself.
 */
function colorKey(value: string): string {
  const hex = normalizeHex(value.trim()).toLowerCase();
  if (!HEX_PATTERN.test(hex)) return hex;
  if (hex.length === 4) return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  return hex;
}

type ColorPickerParts = {
  picker: React.ReactNode;
  presets: React.ReactNode;
};

/**
 * `panelRender`'s `Picker` / `Presets` are handed out as COMPONENTS (antd's shape), so they must
 * keep one identity across renders — a component minted inside `ColorPicker` would remount on
 * every keystroke and drop focus out of the hex field. They read the live nodes from here.
 */
const ColorPickerPartsContext = React.createContext<ColorPickerParts | null>(null);

function ColorPickerPickerPart() {
  return <>{React.useContext(ColorPickerPartsContext)?.picker}</>;
}

function ColorPickerPresetsPart() {
  return <>{React.useContext(ColorPickerPartsContext)?.presets}</>;
}

const PANEL_COMPONENTS = { Picker: ColorPickerPickerPart, Presets: ColorPickerPresetsPart };

/**
 * One antd `presets` group: a collapsible section (antd: ghost `Collapse`, `defaultOpen` true)
 * whose swatches are an APG radio group — one tab stop, arrows move and select, the checked
 * swatch is announced. react-aria's RadioGroup supplies the keyboard model and RTL arrows; each
 * swatch is a real `<input type="radio">` named by its hex, so no colour is conveyed by paint
 * alone (WCAG 1.4.1).
 */
function ColorPickerPresetGroup({
  preset,
  value,
  disabled,
  onSelect,
}: {
  preset: ColorPickerPresetProp;
  value: string;
  disabled?: boolean;
  onSelect: (color: string) => void;
}) {
  const { t } = useTranslation();
  const labelId = React.useId();
  const currentKey = colorKey(value);
  const checked = preset.colors.find((color) => colorKey(color) === currentKey) ?? null;

  return (
    <Collapsible
      defaultOpen={preset.defaultOpen ?? true}
      className="ui-color-picker-presets-group"
      data-slot="color-picker-presets-group"
    >
      <CollapsibleTrigger className="ui-color-picker-presets-trigger ui-focus-ring">
        <ChevronDown className="ui-color-picker-presets-chevron" aria-hidden="true" />
        <span id={labelId} className="ui-color-picker-presets-label">
          {preset.label}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="ui-color-picker-presets-content">
        {preset.colors.length > 0 ? (
          <AriaRadioGroup
            aria-labelledby={labelId}
            orientation="horizontal"
            value={checked}
            onChange={onSelect}
            isDisabled={disabled}
            className="ui-color-picker-presets-items"
            data-slot="color-picker-presets-items"
          >
            {preset.colors.map((color, index) => (
              <AriaRadio
                // A palette may legitimately repeat a colour across positions.
                // eslint-disable-next-line react/no-array-index-key
                key={`${index}-${color}`}
                value={color}
                aria-label={color}
                className="ui-color-picker-presets-color ui-focus-ring"
                data-slot="color-picker-preset"
                style={{ ["--color-picker-preset-color" as string]: color } as React.CSSProperties}
              />
            ))}
          </AriaRadioGroup>
        ) : (
          <span className="ui-color-picker-presets-empty">
            {t("dataEntry.colorPicker.presetEmpty")}
          </span>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
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
  presets,
  panelRender,
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

  const swatch = (
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
  );

  const hexInput = showHexInput ? (
    <Input
      id={id ? `${id}-hex` : undefined}
      value={display}
      disabled={disabled}
      aria-label={t("dataEntry.colorPicker.hexLabel")}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => commit(display)}
      onKeyDown={(event) => {
        // gh#1054: the Enter that confirms an IME conversion is not a commit.
        if (event.key === "Enter" && !isImeComposing(event)) commit(display);
      }}
      className="ui-color-picker-hex"
      spellCheck={false}
    />
  ) : null;

  // Hidden field so the colour submits with a native form (Select/Switch/Rating do the same).
  const hiddenInput = resolvedName ? (
    <input type="hidden" name={resolvedName} value={value} readOnly />
  ) : null;

  // No presets and no panelRender: the original inline row, byte for byte.
  if (!presets && !panelRender) {
    return (
      <div className={cn("ui-color-picker", className)}>
        {swatch}
        {hexInput}
        {hiddenInput}
      </div>
    );
  }

  const presetsNamed = Boolean(ariaProps["aria-labelledby"] ?? ariaProps["aria-label"]);
  const parts: ColorPickerParts = {
    picker: (
      <div className="ui-color-picker-picker" data-slot="color-picker-picker">
        {swatch}
        {hexInput}
      </div>
    ),
    presets: presets?.length ? (
      // The FormField name/description also reach the palette as a GROUP, so presets-only mode
      // (no native swatch to carry them) still announces which field these swatches fill.
      <div
        className="ui-color-picker-presets"
        data-slot="color-picker-presets"
        role={presetsNamed ? "group" : undefined}
        aria-labelledby={ariaProps["aria-labelledby"]}
        aria-label={ariaProps["aria-labelledby"] ? undefined : ariaProps["aria-label"]}
        aria-describedby={ariaProps["aria-describedby"]}
      >
        {presets.map((preset, index) => (
          <ColorPickerPresetGroup
            key={preset.key ?? index}
            preset={preset}
            value={value}
            disabled={disabled}
            onSelect={commit}
          />
        ))}
      </div>
    ) : null,
  };
  const panel = (
    <>
      {parts.picker}
      {parts.presets}
    </>
  );

  return (
    <ColorPickerPartsContext.Provider value={parts}>
      <div className={cn("ui-color-picker", className)} data-panel="">
        {panelRender ? panelRender(panel, { components: PANEL_COMPONENTS }) : panel}
        {hiddenInput}
      </div>
    </ColorPickerPartsContext.Provider>
  );
}
