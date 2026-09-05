import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";

import { cn } from "../../lib/utils";
import type { InputOTPAlignProp, InputOTPGroupProp } from "../../props/components/data-entry.prop";

/**
 * InputOTP — the code-challenge field.
 *
 * `align` positions the whole row (groups + separators) on the main axis: `start` (default,
 * unchanged), `center` — the canonical auth challenge — or `end`. The attribute lands on the
 * hidden input because `input-otp` owns the container element; `.ui-otp-container` reads it back
 * through `:has()`, exactly as it already does for the invalid and disabled states. A service that
 * wants every code field centred sets `--otp-container-align` once instead.
 */
export const InputOTP = React.forwardRef<
  React.ComponentRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput> & { align?: InputOTPAlignProp }
>(({ className, containerClassName, align, ...props }, ref) => (
  <OTPInput
    ref={ref}
    data-slot="input-otp"
    // INERT DEFAULT: `start` emits no attribute, so an existing field keeps its exact DOM.
    data-align={align && align !== "start" ? align : undefined}
    containerClassName={cn("ui-otp-container", containerClassName)}
    className={cn("ui-otp-input", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

export type {
  InputOTPAlignProp,
  InputOTPGroupAppearanceProp,
  InputOTPGroupProp,
  InputOTPGroupProp as InputOTPGroupProps,
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
  const slot = context.slots[index] ?? { char: null, hasFakeCaret: false, isActive: false };
  return (
    <div
      ref={ref}
      data-slot="input-otp-slot"
      data-active={slot.isActive || undefined}
      className={cn("ui-otp-slot", className)}
      {...props}
    >
      {slot.char}
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
