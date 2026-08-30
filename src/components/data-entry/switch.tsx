import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";
import type { SwitchProp } from "../../props/components/data-entry.prop";

export type { SwitchProp, SwitchProp as SwitchProps } from "../../props/components/data-entry.prop";

export const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitive.Root>, SwitchProp>(
  (
    { className, size = "md", name, checked, defaultChecked = false, onCheckedChange, ...props },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleCheckedChange = (next: boolean) => {
      if (!isControlled) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
    };

    return (
      <>
        {name ? <input type="hidden" name={name} value={isChecked ? "1" : "0"} readOnly /> : null}
        <SwitchPrimitive.Root
          ref={ref}
          data-slot="switch"
          data-size={size}
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          className={cn(
            // `disabled:cursor-not-allowed disabled:opacity-50` DELETED, not moved (#319):
            // `.ui-switch:disabled, .ui-switch[data-disabled]` in styles/control.css already
            // declares both and reads --disabled-opacity. The utility was layered after
            // components, so it silently outranked that token. Byte-identical: the token
            // defaults to 0.5. (`shadow-xs` STAYS — .ui-switch declares --shadow-sm, so this
            // utility is the switch's real resting elevation, not a duplicate.)
            "peer ui-switch shadow-xs transition-all outline-none",
            className,
          )}
          {...props}
        >
          <SwitchPrimitive.Thumb data-slot="switch-thumb" className="ui-switch-thumb" />
        </SwitchPrimitive.Root>
      </>
    );
  },
);
Switch.displayName = SwitchPrimitive.Root.displayName;
