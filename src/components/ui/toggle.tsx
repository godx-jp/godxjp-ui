import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const toggleVariants = cva("ui-toggle", {
  variants: {
    variant: {
      default: "ui-toggle-default",
      outline: "ui-toggle-outline",
    },
    size: {
      sm: "ui-toggle-sm",
      default: "ui-toggle-default-size",
      lg: "ui-toggle-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ToggleProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>;

export const Toggle = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    data-slot="toggle"
    className={cn(toggleVariants({ variant, size }), className)}
    {...props}
  />
));
Toggle.displayName = TogglePrimitive.Root.displayName;

export { toggleVariants };
