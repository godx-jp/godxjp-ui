import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useFieldIdentity } from "../../lib/field-a11y";
import type { SwitchProp } from "../../props/components/data-entry.prop";

export type { SwitchProp, SwitchProp as SwitchProps } from "../../props/components/data-entry.prop";

export const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitive.Root>, SwitchProp>(
  (
    {
      className,
      size = "md",
      name,
      checked,
      defaultChecked = false,
      onCheckedChange,
      loading = false,
      checkedChildren,
      unCheckedChildren,
      ...props
    },
    ref,
  ) => {
    // `{}` otherwise; the
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
      // antd `loading` — the toggle is mid-flight, so it refuses the change without becoming a
      // different control. `disabled` would have been the cheap way to say this and it is the
      // wrong one: a disabled button leaves the tab order, so a keyboard user's focus is thrown
      // to the next field the moment they flip a switch that saves over the network.
      if (loading) return;
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
          data-loading={loading ? "true" : undefined}
          aria-busy={loading || undefined}
          aria-disabled={loading || undefined}
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          className={cn(
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
          {/* antd `checkedChildren` / `unCheckedChildren` — the ON/OFF word inside the track.
              Exactly one is in the DOM at a time and it is `aria-hidden`: the switch already
              announces its own on/off through `role="switch"` + `aria-checked`, and a screen
              reader reading "有効, switch, checked" says the same thing twice. */}
          {checkedChildren != null || unCheckedChildren != null ? (
            <span data-slot="switch-content" className="ui-switch-content" aria-hidden="true">
              {isChecked ? checkedChildren : unCheckedChildren}
            </span>
          ) : null}
          <SwitchPrimitive.Thumb data-slot="switch-thumb" className="ui-switch-thumb">
            {loading ? (
              <Loader2
                data-slot="switch-spinner"
                className="ui-switch-spinner"
                aria-hidden="true"
              />
            ) : null}
          </SwitchPrimitive.Thumb>
        </SwitchPrimitive.Root>
      </>
    );
  },
);
Switch.displayName = SwitchPrimitive.Root.displayName;
