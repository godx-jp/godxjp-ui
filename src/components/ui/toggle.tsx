import * as React from "react";
import { ToggleButton, type ToggleButtonProps } from "react-aria-components";
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

/**
 * The repo's two-state vocabulary, kept VERBATIM from the Radix era. React Aria spells the same
 * four things `isSelected` / `defaultSelected` / `onChange` / `isDisabled`; the translation lives
 * inside this file so no consumer ever has to learn RAC's names.
 */
type TogglePressedFields = {
  /** Controlled pressed state — RAC `isSelected`. */
  pressed?: boolean;
  /** Uncontrolled initial pressed state — RAC `defaultSelected`. */
  defaultPressed?: boolean;
  /** Fired with the NEW pressed state — RAC `onChange`. */
  onPressedChange?: (pressed: boolean) => void;
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

/**
 * RAC keeps its own uncontrolled selection inside `useToggleState`, where this file cannot read
 * it — and `data-state="on|off"` (the hook `styles/control.css` and `styles/toggle.css` bind to)
 * has to be rendered FROM that state. So the pressed state is resolved here and RAC is always
 * driven as a controlled button: `pressed` given ⇒ the caller owns it (and with no
 * `onPressedChange` the control stays frozen, exactly as under Radix); `pressed` absent ⇒ this
 * hook owns it, seeded from `defaultPressed`.
 */
function usePressedState({ pressed, defaultPressed, onPressedChange }: TogglePressedFields) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultPressed ?? false);
  const isPressed = pressed ?? uncontrolled;
  return {
    isPressed,
    onSelectionChange: (next: boolean) => {
      if (pressed == null) {
        setUncontrolled(next);
      }
      onPressedChange?.(next);
    },
  };
}

/**
 * RAC's `filterDOMProps` forwards only `id`, `data-*`, the four labelling `aria-*` and the global
 * mouse/pointer events; `title`, `tabIndex` and the rarer DOM props are dropped silently, and
 * Radix forwarded ALL of them. `render` is RAC's own escape hatch: the raw props go on first, RAC's
 * merged ones second so its `type`/`disabled`/`aria-pressed`/handlers always win.
 *
 * Two exceptions, both of which Radix owned: `tabIndex` stays the caller's, and so does `id` —
 * inside a ToggleButtonGroup RAC spends `id` as the selection KEY and blanks the DOM attribute,
 * which would otherwise silently drop the id off every grouped item.
 */
function restoreDomProps<P extends { id?: string; tabIndex?: number }>(
  raw: P,
  domProps: React.JSX.IntrinsicElements["button"],
) {
  return (
    <button
      {...raw}
      {...domProps}
      id={raw.id ?? domProps.id}
      tabIndex={raw.tabIndex ?? domProps.tabIndex}
    />
  );
}

export type ToggleProp = React.ComponentPropsWithoutRef<"button"> &
  TogglePressedFields &
  VariantProps<typeof toggleVariants> &
  ToggleCountFields;

export type ToggleProps = ToggleProp;

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProp>(
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
      pressed,
      defaultPressed,
      onPressedChange,
      disabled,
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
    const { isPressed, onSelectionChange } = usePressedState({
      pressed,
      defaultPressed,
      onPressedChange,
    });
    return (
      <ToggleButton
        ref={ref}
        data-slot="toggle"
        data-state={isPressed ? "on" : "off"}
        aria-label={resolvedAriaLabel}
        className={cn(toggleVariants({ variant, size }), className)}
        {...(props as Omit<ToggleButtonProps, "children" | "className">)}
        isSelected={isPressed}
        onChange={onSelectionChange}
        isDisabled={disabled}
        render={(domProps) => restoreDomProps(props, domProps)}
      >
        {children}
        {pill}
      </ToggleButton>
    );
  },
);
Toggle.displayName = "Toggle";

export { toggleVariants, useCounterPill, restoreDomProps };
export type { ToggleCountFields, TogglePressedFields };
