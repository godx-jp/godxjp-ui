import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";
import { useFieldIdentity } from "../../lib/field-a11y";
import type { SwitchProp } from "../../props/components/data-entry.prop";

export type { SwitchProp, SwitchProp as SwitchProps } from "../../props/components/data-entry.prop";

export const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitive.Root>, SwitchProp>(
  (
    { className, size = "md", name, checked, defaultChecked = false, onCheckedChange, ...props },
    ref,
  ) => {
    // gh#337 — the machine key for a Switch NESTED under a layout wrapper. `{}` otherwise; the
    // resolved `name` also feeds the hidden input below, so the toggle still submits natively.
    const identity = useFieldIdentity({
      id: props.id,
      name,
      "data-field": (props as { "data-field"?: string })["data-field"],
    });
    const resolvedName = name ?? identity.name;
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
        {resolvedName ? (
          <input type="hidden" name={resolvedName} value={isChecked ? "1" : "0"} readOnly />
        ) : null}
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
          data-field={identity["data-field"] ?? (props as { "data-field"?: string })["data-field"]}
        >
          <SwitchPrimitive.Thumb data-slot="switch-thumb" className="ui-switch-thumb" />
        </SwitchPrimitive.Root>
      </>
    );
  },
);
Switch.displayName = SwitchPrimitive.Root.displayName;
