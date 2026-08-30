import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../i18n/use-translation";
import type { ButtonProp } from "../../props/components/general.prop";

const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      default: "ui-button--default bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "ui-button--destructive bg-destructive text-destructive-foreground",
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
      default: "ui-button--default-size",
      md: "ui-button--default-size",
      // The glyph rules stay UTILITIES, not a components-layer rule: Tailwind v4 orders
      // utilities after components, so only a utility can out-rank a child's own `size-*`.
      // They read the token, so the value is still themeable.
      xs: "ui-button--xs [&_svg:not([class*='size-'])]:size-[var(--button-xs-icon-size)]",
      sm: "ui-button--sm",
      lg: "ui-button--lg",
      icon: "ui-button--icon",
      "icon-xs": "ui-button--icon-xs [&_svg]:size-[var(--button-xs-icon-size)] [&_svg]:shrink-0",
      "icon-sm": "ui-button--icon-sm",
      "icon-lg": "ui-button--icon-lg",
    },
    // Single source of corner radius (deterministic — no competing rounded-* utility): default uses
    // the dedicated --button-radius token (themeable independently of --control-radius, issue #124),
    // pill is fully rounded, sharp is square.
    shape: {
      default: "rounded-[var(--button-radius)]",
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
      fullWidth = false,
      asChild = false,
      loading = false,
      loadingText,
      count,
      overflowCount = 99,
      showZero = true,
      disabled,
      type,
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
    // The count is a trailing borderless counter (Ant Badge parity). Ignored under `asChild`
    // (Slot needs a single child). `showZero` controls the 0 case; values over `overflowCount`
    // render as `{overflowCount}+`. Localized via Intl.NumberFormat (grouping per locale).
    const showCount = !asChild && count != null && (count !== 0 || showZero);
    const countLabel =
      showCount && count != null && count > overflowCount
        ? `${new Intl.NumberFormat(locale).format(overflowCount)}+`
        : count != null
          ? new Intl.NumberFormat(locale).format(count)
          : "";
    const countNode = showCount ? (
      <span
        data-slot="button-count"
        className="ui-button-count"
      >
        {countLabel}
      </span>
    ) : null;
    return (
      <Comp
        data-slot="button"
        data-variant={variant ?? "default"}
        data-size={size ?? "default"}
        data-shape={shape ?? "default"}
        data-full-width={fullWidth ? "" : undefined}
        data-loading={isLoading ? "" : undefined}
        aria-busy={isLoading || undefined}
        disabled={isLoading || disabled}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(
          fullWidth && "w-full",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
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
