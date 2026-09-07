import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "../../lib/utils";

/** One choice in a {@link Segmented}. */
export type SegmentedOption = {
  /** Wire value — what `onValueChange` reports and what a form submits. */
  value: string;
  /** Visible label. It is also the item's accessible name, so it is required. */
  label: React.ReactNode;
  /** Optional leading glyph, rendered `aria-hidden` beside the label. */
  icon?: React.ReactNode;
  /** Disable this one choice; the rest of the group stays operable. */
  disabled?: boolean;
};

export type SegmentedProp = {
  /** The closed set of choices, in reading order. */
  options: readonly SegmentedOption[];
  /** Controlled selection. */
  value?: string;
  /** Uncontrolled initial selection. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Disable the whole group. */
  disabled?: boolean;
  /** Form field name — submits the selected value with the form. */
  name?: string;
  id?: string;
  className?: string;
  /** Accessible name of the group. Required unless a visible label points at `id`. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export type SegmentedProps = SegmentedProp;

/**
 * Segmented — one-of-N from a small, closed, always-visible set. antd's `Segmented`
 * (docs/DESIGN-AUTHORITY.md names Ant Design the taxonomy authority) drawn on Radix's RadioGroup,
 * which is this repo's authority for behaviour primitives.
 *
 * WHY NOT `ToggleGroup`. A ToggleGroup is a row of PRESSED buttons: `aria-pressed`, independently
 * togglable, and — even at `type="single"` — deselectable, so "no theme at all" is a state the
 * markup permits. A segmented control is a radio group: exactly one member is always chosen, the
 * arrow keys move between members rather than Tab, and a screen reader must say "Light, radio
 * button, 1 of 3, selected" and not "Light, toggle button, pressed". WAI-ARIA APG owns that
 * distinction and it is not a skin.
 *
 * The primitive gives roving tabindex, arrow-key traversal (RTL-aware), the radiogroup/radio roles
 * and the hidden input a native form submit needs. This file adds the antd geometry and nothing
 * else — the focus mark comes from `ui-focus-ring`, the ONE source in styles/focus-ring.css.
 */
export const Segmented = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  SegmentedProp
>(function Segmented(
  { options, value, defaultValue, onValueChange, disabled, name, id, className, ...props },
  ref,
) {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      id={id}
      data-slot="segmented"
      className={cn("ui-segmented", className)}
      orientation="horizontal"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      {...props}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          data-slot="segmented-item"
          className="ui-segmented-item ui-focus-ring"
        >
          {option.icon == null ? null : (
            <span
              data-slot="segmented-item-icon"
              className="ui-segmented-item-icon"
              aria-hidden="true"
            >
              {option.icon}
            </span>
          )}
          <span data-slot="segmented-item-label" className="ui-segmented-item-label">
            {option.label}
          </span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
});
