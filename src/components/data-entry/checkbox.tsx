import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { CheckboxGroup } from "./checkbox-group";

const CheckboxRoot = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    className={cn(
      // `disabled:cursor-not-allowed disabled:opacity-50` and the checked fill are DELETED, not
      // moved (#319): `.ui-checkbox:disabled, .ui-checkbox[data-disabled]` and
      // `.ui-checkbox[data-state="checked"]` in styles/control.css already declare both, reading
      // --disabled-opacity and --checkbox-checked-background. Utilities are layered AFTER
      // components in Tailwind v4, so these literals were silently OUTRANKING those knobs — a
      // service overriding --checkbox-checked-background got no fill change at all. Radix sets
      // `data-state`/`data-disabled` on the root, so the CSS rules match. Rendering is unchanged:
      // both knobs default to exactly the values these utilities hard-coded.
      "peer ui-checkbox aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground shrink-0 shadow-xs transition-shadow outline-none",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="ui-choice-indicator">
      <Check className="ui-checkbox-icon" aria-hidden="true" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
CheckboxRoot.displayName = CheckboxPrimitive.Root.displayName;

/** Checkbox — dùng standalone hoặc `Checkbox.Group` với `options` (Ant Design style). */
export const Checkbox = Object.assign(CheckboxRoot, {
  Group: CheckboxGroup,
});
