import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";

import { cn } from "../../lib/utils";

export const InputOTP = React.forwardRef<
  React.ComponentRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    data-slot="input-otp"
    containerClassName={cn("ui-otp-container", containerClassName)}
    className={cn("ui-otp-input", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

export const InputOTPGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="input-otp-group"
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
