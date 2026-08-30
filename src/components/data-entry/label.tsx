import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Box + type live in `.ui-label` (styles/control.css → --control-label-*), so a service theme can
// retune them; what stays here is what MUST out-rank a components-layer rule (#319):
//   • `font-medium` — `.ui-choice-label` declares --font-weight-normal and this beats it today.
//   • `leading-*` — the old `leading-none` existed to beat the companion line-height that EVERY
//     `text-*` utility carries; only a utility can keep doing that when a consumer passes their
//     own `text-lg`. It reads the token now instead of hard-coding 1.
//   • the `peer-disabled:` pair — a state has to win over the resting `.ui-label` rule, which in
//     Tailwind v4 means staying in the utilities layer. The alpha is a token, not a literal.
const labelVariants = cva(
  "font-medium leading-[var(--control-label-line-height)] peer-disabled:cursor-not-allowed peer-disabled:opacity-[var(--control-label-disabled-alpha)]",
);

export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(
      // A label inside a disabled group reads at the SYSTEM disabled alpha (--disabled-opacity),
      // the same one .ui-checkbox/.ui-radio/.ui-switch:disabled use — one knob, not a second one.
      "ui-label group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-[var(--disabled-opacity)]",
      labelVariants(),
      className,
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;
