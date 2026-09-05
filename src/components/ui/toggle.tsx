import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { useTranslation } from "../../i18n/use-translation";

const toggleVariants = cva("ui-toggle", {
  variants: {
    variant: {
      default: "ui-toggle-default",
      outline: "ui-toggle-outline",
    },
    size: {
      sm: "ui-toggle-sm",
      md: "ui-toggle-default-size",
      lg: "ui-toggle-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

/**
 * Not exported on its own — it is folded into `ToggleProp` and `ToggleGroupItemProp` so there is
 * one public name per component.
 */
type ToggleCountFields = {
  /**
   * Optional numeric count rendered as a borderless counter pill after the label — the SAME
   * vocabulary `Button` already defines, so a counted segmented toggle and a counted filter tab
   * read identically. Formatted with `Intl.NumberFormat` in the active locale (never `String(n)`,
   * never a hand-rolled thousands separator).
   */
  count?: number;
  /** Cap for `count` — beyond it the pill shows `{overflowCount}+` (e.g. `99+`). */
  overflowCount?: number;
  /** Render the pill when `count` is 0. Default `true`, matching Button. */
  showZero?: boolean;
  /**
   * Localized description of what the count MEANS, folded into the accessible name so the control
   * never announces as a bare number ("👍 3" → "thumbs up, 3 reactions"). Supply it whenever the
   * visible label is an icon or an emoji; with a text label the label itself already carries the
   * meaning.
   */
  countLabel?: string;
};

/** Counter pill shared by `Toggle` and `ToggleGroupItem`. ACCESSIBLE NAME. */
function useCounterPill({
  count,
  overflowCount = 99,
  showZero = true,
  countLabel,
  ariaLabel,
}: ToggleCountFields & { ariaLabel?: string }) {
  const { locale } = useTranslation();
  const visible = count != null && (count !== 0 || showZero);
  const formatted = React.useMemo(() => {
    if (count == null) return "";
    const format = new Intl.NumberFormat(locale);
    return count > overflowCount ? `${format.format(overflowCount)}+` : format.format(count);
  }, [count, locale, overflowCount]);

  if (!visible) {
    return { pill: null, resolvedAriaLabel: ariaLabel };
  }

  const spoken = countLabel ? `${formatted} ${countLabel}` : formatted;
  return {
    pill: (
      <>
        <span data-slot="toggle-count" className="ui-toggle-count" aria-hidden="true">
          {formatted}
        </span>
        <span className="sr-only">{`, ${spoken}`}</span>
      </>
    ),
    resolvedAriaLabel: ariaLabel == null ? ariaLabel : `${ariaLabel}, ${spoken}`,
  };
}

export type ToggleProp = React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants> &
  ToggleCountFields;

export type ToggleProps = ToggleProp;

export const Toggle = React.forwardRef<React.ComponentRef<typeof TogglePrimitive.Root>, ToggleProp>(
  (
    {
      className,
      variant,
      size,
      count,
      overflowCount,
      showZero,
      countLabel,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const { pill, resolvedAriaLabel } = useCounterPill({
      count,
      overflowCount,
      showZero,
      countLabel,
      ariaLabel,
    });
    return (
      <TogglePrimitive.Root
        ref={ref}
        data-slot="toggle"
        aria-label={resolvedAriaLabel}
        className={cn(toggleVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {pill}
      </TogglePrimitive.Root>
    );
  },
);
Toggle.displayName = TogglePrimitive.Root.displayName;

export { toggleVariants, useCounterPill };
export type { ToggleCountFields };
