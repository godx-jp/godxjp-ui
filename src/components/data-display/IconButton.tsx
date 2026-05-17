import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

/**
 * IconButton — square button with icon-only content.
 *
 * Maps onto the canonical `.icon-btn` family in shell.css (matches the
 * `K:comp-pageheader.html` reference at lines 14–17): 32 × 32 box,
 * `--radius-sm`, hairline border + `--background` fill by default
 * (`secondary` variant), with `ghost` (transparent / borderless) and
 * `primary` (filled brand) modifiers.
 *
 * Sizes:
 *   - `sm`      → 28 px (compact toolbars)
 *   - `default` → 32 px (page-header default)
 *   - `lg`      → 36 px (touch / hero contexts)
 *
 * `aria-label` is required for accessibility — icon-only controls must
 * carry a discoverable name. The component does not validate at
 * compile time, but stories + lint should catch missing labels.
 *
 * @example
 *   <IconButton aria-label="戻る"><ArrowLeft size={14} /></IconButton>
 *   <IconButton variant="ghost" aria-label="More"><MoreHorizontal size={16} /></IconButton>
 *   <IconButton variant="primary" size="large" aria-label="Save"><Check size={18} /></IconButton>
 */

export type IconButtonVariant = "secondary" | "ghost" | "primary";
export type IconButtonSize = "sm" | "default" | "lg";

export interface IconButtonProps
  extends Omit<ComponentProps<"button">, "children"> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  asChild?: boolean;
  children?: ReactNode;
}

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  secondary: "icon-btn-secondary",
  ghost: "icon-btn-ghost",
  primary: "icon-btn-primary",
};

const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: "icon-btn-sm",
  default: "",
  lg: "icon-btn-lg",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = "secondary",
      size = "default",
      asChild = false,
      className,
      type = "button",
      children,
      ...rest
    },
    ref,
  ) {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          "icon-btn",
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          className,
        )}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
