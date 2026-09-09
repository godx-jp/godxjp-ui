import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";

import { cn } from "../../lib/utils";
import { controlSurfaceAttrs, resolveAriaInvalid } from "../data-entry/control-surface";
import type { InputOTPGroupProp, InputOTPProp } from "../../props/components/data-entry.prop";

/** antd's masking glyph for `mask={true}`. A string `mask` supplies its own. */
const DEFAULT_MASK_CHAR = "•";

/**
 * Paint-only masking, read by `InputOTPSlot`. A context rather than a prop on every slot: the
 * slots are written by the CONSUMER (`<InputOTPSlot index={0} />`), so a prop would have to be
 * repeated on each one and could silently disagree between them.
 */
const InputOTPMaskContext = React.createContext<string | null>(null);

/**
 * InputOTP — the code-challenge field.
 *
 * `align` positions the whole row (groups + separators) on the main axis: `start` (default,
 * unchanged), `center` — the canonical auth challenge — or `end`. The attribute lands on the
 * hidden input because `input-otp` owns the container element; `.ui-otp-container` reads it back
 * through `:has()`, exactly as it already does for the invalid and disabled states. A service that
 * wants every code field centred sets `--otp-container-align` once instead.
 *
 * `size`/`status`/`variant` ride the same `controlSurfaceAttrs` helper as Input, Select, Cascader
 * and TagInput, so the code field sits on the shared control-height ladder and paints the same
 * error edge — they reach the CSS by the same `:has()` route as `align`.
 *
 * The VALUE is owned here, not by `input-otp`: `formatter` and `readOnly` have to hold for paste
 * too, and `input-otp` writes its own internal state inside its paste handler, which a wrapper
 * that only intercepted `onChange` could not undo.
 */
export const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProp>(function InputOTP(
  {
    className,
    containerClassName,
    align,
    mask,
    formatter,
    size,
    status,
    variant,
    value,
    defaultValue,
    onChange,
    onValueChange,
    readOnly,
    "aria-invalid": ariaInvalid,
    children,
    render,
    ...props
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;

  const handleChange = (next: string) => {
    // readOnly keeps the tab stop and the visible value, and refuses every edit — including the
    // paste path, which `input-otp` runs itself when a `pasteTransformer` is configured.
    if (readOnly) return;
    const formatted = formatter ? formatter(next) : next;
    if (!isControlled) setUncontrolled(formatted);
    onValueChange?.(formatted);
    // One handler passed as BOTH props must fire once, not twice (the same guard Input uses).
    if ((onChange as unknown) !== onValueChange) onChange?.(formatted);
  };

  const maskChar =
    mask === true ? DEFAULT_MASK_CHAR : typeof mask === "string" && mask ? mask.charAt(0) : null;

  const shared = {
    ref,
    "data-slot": "input-otp",
    // INERT DEFAULT: `start` emits no attribute, so an existing field keeps its exact DOM.
    "data-align": align && align !== "start" ? align : undefined,
    ...controlSurfaceAttrs({ size, status, variant }),
    "aria-invalid": resolveAriaInvalid(ariaInvalid, status),
    // Native `readonly` already conveys the state, but the library's readOnly contract names
    // `aria-readonly` explicitly and half the controls did not honour it.
    "aria-readonly": readOnly ? true : undefined,
    readOnly,
    value: current,
    onChange: handleChange,
    containerClassName: cn("ui-otp-container", containerClassName),
    className: cn("ui-otp-input", className),
    ...props,
  };

  // `input-otp` types its props as `render XOR children`; the two branches keep that union intact
  // instead of casting it away.
  return (
    <InputOTPMaskContext.Provider value={maskChar}>
      {render ? (
        <OTPInput {...shared} render={render} />
      ) : (
        <OTPInput {...shared}>{children}</OTPInput>
      )}
    </InputOTPMaskContext.Provider>
  );
});

export type {
  InputOTPAlignProp,
  InputOTPGroupAppearanceProp,
  InputOTPGroupProp,
  InputOTPGroupProp as InputOTPGroupProps,
  InputOTPMaskProp,
  InputOTPProp,
  InputOTPProp as InputOTPProps,
} from "../../props/components/data-entry.prop";

export const InputOTPGroup = React.forwardRef<HTMLDivElement, InputOTPGroupProp>(
  ({ appearance = "slots", className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="input-otp-group"
      data-appearance={appearance}
      className={cn("ui-otp-group", className)}
      {...props}
    />
  ),
);
InputOTPGroup.displayName = "InputOTPGroup";

export const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { index: number }
>(({ index, className, ...props }, ref) => {
  const context = React.useContext(OTPInputContext);
  const maskChar = React.useContext(InputOTPMaskContext);
  const slot = context.slots[index] ?? { char: null, hasFakeCaret: false, isActive: false };
  // Mask the PAINT only. `slot.char` stays the source of truth for "is this slot filled", so an
  // empty slot never shows a bullet and the real code is still what the field submits.
  const painted = slot.char === null ? null : (maskChar ?? slot.char);
  return (
    <div
      ref={ref}
      data-slot="input-otp-slot"
      data-active={slot.isActive || undefined}
      data-masked={maskChar && slot.char !== null ? "" : undefined}
      className={cn("ui-otp-slot", className)}
      {...props}
    >
      {painted}
      {slot.hasFakeCaret ? (
        <div className="ui-otp-caret-wrapper" aria-hidden="true">
          <div className="ui-otp-caret" />
        </div>
      ) : null}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

export const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div ref={ref} data-slot="input-otp-separator" role="separator" {...props}>
    <Minus className="ui-otp-separator-icon" aria-hidden="true" />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";
