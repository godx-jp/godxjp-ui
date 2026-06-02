import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import type { ButtonProp } from "../../props/components/general.prop";

const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      default: "ui-button--default bg-primary text-primary-foreground hover:bg-primary/90",
      destructive:
        "ui-button--destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20",
      outline:
        "ui-button--outline border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      secondary:
        "ui-button--secondary bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "ui-button--ghost hover:bg-accent hover:text-accent-foreground",
      link: "ui-button--link text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "ui-button--default-size py-2 has-[>svg]:px-3",
      md: "ui-button--default-size py-2 has-[>svg]:px-3",
      xs: "h-[calc(var(--control-height)-0.75rem)] gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
      sm: "ui-button--sm gap-1.5 rounded-md has-[>svg]:px-2.5",
      lg: "ui-button--lg rounded-md has-[>svg]:px-4",
      icon: "ui-button--icon",
      "icon-xs":
        "size-[calc(var(--control-height)-0.75rem)] rounded-md [&_svg:not([class*='size-'])]:size-3",
      "icon-sm": "size-[calc(var(--control-height)-0.5rem)]",
      "icon-lg": "size-[calc(var(--control-height)+0.25rem)]",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export type { ButtonProp, ButtonProp as ButtonProps } from "../../props/components/general.prop";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProp>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-slot="button"
        data-variant={variant ?? "default"}
        data-size={size ?? "default"}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:pointer-events-none disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          buttonVariants({ variant, size, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
