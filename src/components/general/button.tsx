import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../i18n/use-translation";
import type { ButtonProp } from "../../props/components/general.prop";

// Borderless counter pill for `count` (filter tabs / segmented toggles). Keyed by variant so it
// reads on the button's own surface — translucent foreground on filled variants, muted fill on
// light variants. Never a bordered Badge nested in a bordered Button (that double-borders).
const buttonCountClass: Record<string, string> = {
  default: "bg-primary-foreground/15",
  destructive: "bg-destructive-foreground/15",
  secondary: "bg-secondary-foreground/15",
  outline: "bg-foreground/8 text-muted-foreground",
  dashed: "bg-foreground/8 text-muted-foreground",
  ghost: "bg-foreground/8 text-muted-foreground",
  link: "bg-foreground/8 text-muted-foreground",
};

const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      default: "ui-button--default bg-primary text-primary-foreground hover:bg-primary/90",
      destructive:
        "ui-button--destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20",
      outline:
        "ui-button--outline border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      dashed:
        "ui-button--dashed border border-dashed bg-background hover:bg-accent hover:text-accent-foreground",
      secondary:
        "ui-button--secondary bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "ui-button--ghost hover:bg-accent hover:text-accent-foreground",
      link: "ui-button--link text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "ui-button--default-size py-2 has-[>svg]:px-3",
      md: "ui-button--default-size py-2 has-[>svg]:px-3",
      xs: "h-[calc(var(--control-height)-0.75rem)] gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
      sm: "ui-button--sm gap-1.5 has-[>svg]:px-2.5",
      lg: "ui-button--lg has-[>svg]:px-4",
      icon: "ui-button--icon",
      "icon-xs": "size-[calc(var(--control-height)-0.75rem)] [&_svg:not([class*='size-'])]:size-3",
      "icon-sm": "size-[calc(var(--control-height)-0.5rem)]",
      "icon-lg": "size-[calc(var(--control-height)+0.25rem)]",
    },
    // Single source of corner radius (deterministic — no competing rounded-* utility): default uses
    // the control radius token, pill is fully rounded, sharp is square.
    shape: {
      default: "rounded-md",
      pill: "rounded-[var(--radius-pill)]",
      sharp: "rounded-[var(--radius-sharp)]",
    },
  },
  defaultVariants: { variant: "default", size: "default", shape: "default" },
});

export type { ButtonProp, ButtonProp as ButtonProps } from "../../props/components/general.prop";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProp>(
  (
    {
      className,
      variant,
      size,
      shape,
      asChild = false,
      loading = false,
      loadingText,
      count,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const { locale } = useTranslation();
    const Comp = asChild ? Slot : "button";
    // While loading the control is non-interactive (blocks activation + pointer events) and
    // announces `aria-busy`. The spinner is rendered as a LEADING sibling so the label stays in
    // place (no abrupt width jump); a `loadingText` swaps the label for an i18n-friendly message.
    const isLoading = !asChild && loading;
    const content = isLoading ? (
      <>
        <Loader2 className="animate-spin" aria-hidden="true" />
        {loadingText ?? children}
      </>
    ) : (
      children
    );
    // The count is a trailing borderless counter. Ignored under `asChild` (Slot needs a single
    // child) and rendered for `0` too. Localized via Intl.NumberFormat (grouping per locale).
    const showCount = !asChild && count != null;
    const countNode = showCount ? (
      <span
        data-slot="button-count"
        className={cn(
          "inline-flex min-w-4 items-center justify-center rounded-[var(--radius-pill)] px-1 text-xs leading-none tabular-nums",
          buttonCountClass[variant ?? "default"],
        )}
      >
        {new Intl.NumberFormat(locale).format(count)}
      </span>
    ) : null;
    return (
      <Comp
        data-slot="button"
        data-variant={variant ?? "default"}
        data-size={size ?? "default"}
        data-shape={shape ?? "default"}
        data-loading={isLoading ? "" : undefined}
        aria-busy={isLoading || undefined}
        disabled={isLoading || disabled}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-all outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:pointer-events-none disabled:opacity-50",
          "data-[loading]:pointer-events-none",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          buttonVariants({ variant, size, shape, className }),
        )}
        ref={ref}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {content}
            {countNode}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
