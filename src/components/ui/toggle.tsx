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
 * The counter-pill vocabulary, lifted VERBATIM from `Button` (`count` / `overflowCount` /
 * `showZero`) so a counted filter tab and a counted, pressed filter chip are one vocabulary rather
 * than two that drift (gh#312). Not exported on its own — it is folded into `ToggleProp` and
 * `ToggleGroupItemProp` so there is one public name per component.
 */
type ToggleCountFields = {
  /**
   * Optional numeric count rendered as a borderless counter pill after the label — the SAME
   * vocabulary `Button` already defines, so a counted segmented toggle and a counted filter tab
   * read identically. Formatted with `Intl.NumberFormat` in the active locale (never `String(n)`,
   * never a hand-rolled thousands separator). Never nest a `Badge` inside a Toggle for this: a
   * Badge is a status chip with its own surface, so it double-borders the chip and puts two boxes
   * where there is one control. The pill takes its colour from the toggle's OWN pressed state, so
   * pressed and unpressed chips differ without reading the number.
   */
  count?: number;
  /** Cap for `count` — beyond it the pill shows `{overflowCount}+` (e.g. `99+`). Default `99`. */
  overflowCount?: number;
  /** Render the pill when `count` is 0. Default `true`, matching Button. */
  showZero?: boolean;
  /**
   * Localized description of what the count MEANS, folded into the accessible name so the control
   * never announces as a bare number ("👍 3" → "thumbs up, 3 reactions"). Supply it whenever the
   * visible label is an icon or an emoji; with a text label the label itself already carries the
   * meaning. Pass a `t()`-resolved string — the library does not own this wording.
   */
  countLabel?: string;
};

/**
 * Counter pill shared by `Toggle` and `ToggleGroupItem`.
 *
 * ACCESSIBLE NAME. The digits live INSIDE the same `button[aria-pressed]` — one tab stop, one
 * focus ring, one name. The name always comes out as "<label>, <count> <unit>" ("Unread, 12",
 * "Thích, 3 lượt"), by one of two routes:
 *
 *   • Name from CONTENTS (the usual text chip). The visible digits are `aria-hidden`, and an
 *     `sr-only` sibling carries ", 12 unit". The separator is explicit on purpose: the accessible
 *     name is a CONCATENATION of descendant text, and whether a browser inserts a space between
 *     two inline boxes is a layout detail no test can rely on — without it the control can
 *     announce "Unread12".
 *   • Name from `aria-label` (an icon or emoji chip). Contents are ignored for the name, so the
 *     same ", 12 unit" tail is folded into the label instead.
 *
 * Either way the count is announced exactly ONCE — the visible digits are hidden from the a11y
 * tree precisely so they cannot be counted twice — and there is deliberately no `aria-live`: a
 * count that ticks up as other people react is not this control's status, and a live region here
 * would fire on every socket message. A product that wants the change announced owns its own
 * live region.
 */
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
