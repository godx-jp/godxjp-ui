import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "./cn";

/**
 * Button — canonical action primitive.
 *
 * 100% mapped to the dxs-kintai design canon
 * (`design-handoff/ui-system/dxs-kintai-design-system/project/preview/
 * comp-buttons.html`):
 *
 *   Variants: primary · secondary · outline · ghost · destructive · link
 *   Sizes:    x-small · small · default · large
 *
 * Cardinal rules honoured:
 *   §14 — shadcn / Radix recipe (Slot for asChild)
 *   §21 — every axis (theme/accent/density/font-size)
 *   §22 — every literal token-pinned (height = --density-element-*)
 *   §23 — vocabulary (`size` + `variant` per new-docs/04 §B)
 *   §24 — mobile-first touch-target floor enforced via .btn CSS
 *          (@media max-width: 767px → min-height: 44px)
 *
 * Slot props (§N):
 *   startContent — ReactNode rendered before children (left icon)
 *   endContent   — ReactNode rendered after children (right icon)
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

export type ButtonSize = "x-small" | "small" | "default" | "large";

export interface ButtonProps extends Omit<ComponentProps<"button">, "size"> {
  /** Visual treatment per design canon `.btn-<variant>`. */
  variant?: ButtonVariant;
  /** Dimensional scale per `--density-element-<size>` chain. */
  size?: ButtonSize;
  /** Stretch to fill parent's width (mobile form submit pattern). */
  block?: boolean;
  /** Show a spinner + disable interaction. */
  loading?: boolean;
  /** Icon slot rendered before the label. */
  startContent?: ReactNode;
  /** Icon slot rendered after the label. */
  endContent?: ReactNode;
  /** Radix Slot pattern — wrap a link / RouterLink without nesting. */
  asChild?: boolean;
  children?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  destructive: "btn-destructive",
  link: "btn-link",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  "x-small": "btn-xs",
  small: "btn-sm",
  default: "",
  large: "btn-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "default",
    block,
    loading,
    startContent,
    endContent,
    disabled,
    asChild = false,
    className,
    type = "button",
    children,
    ...rest
  },
  ref,
) {
  const Component = asChild ? Slot : "button";
  const isDisabled = disabled || loading;
  return (
    <Component
      ref={ref as never}
      type={asChild ? undefined : type}
      data-loading={loading || undefined}
      disabled={asChild ? undefined : isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      className={cn(
        "btn",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        block && "btn-block",
        loading && "btn-loading",
        className,
      )}
      {...rest}
    >
      {loading ? <span className="btn-spinner" aria-hidden /> : startContent}
      {children}
      {endContent}
    </Component>
  );
});
