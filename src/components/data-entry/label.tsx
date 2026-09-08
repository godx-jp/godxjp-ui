import * as React from "react";
import { Label as AriaLabel } from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Slot } from "../../lib/slot";

// Box + type live in `.ui-label` (styles/control.css → --control-label-*), so a service theme can
//   • `font-medium` — `.ui-choice-label` declares --font-weight-normal and this beats it today.
//     own `text-lg`. It reads the token now instead of hard-coding 1.
//   • the `peer-disabled:` pair — a state has to win over the resting `.ui-label` rule, which in
// The alpha is a token, not a literal.
const labelVariants = cva(
  "font-medium leading-[var(--control-label-line-height)] peer-disabled:cursor-not-allowed peer-disabled:opacity-[var(--control-label-disabled-alpha)]",
);

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<"label"> &
    VariantProps<typeof labelVariants> & { asChild?: boolean }
>(({ className, onMouseDown, asChild = false, ...props }, ref) => {
  const shared = {
    // `...props` đứng TRƯỚC, không phải sau: giữ đúng thứ tự thuộc tính mà
    // @radix-ui/react-label phát ra (`for` → `data-slot` → `class`), nên phép so
    // `outerHTML` trong __tests__/label-checkbox-rac.test.tsx khớp từng ký tự.
    // `className` / `onMouseDown` / `asChild` đã được tách ra nên không bị ghi đè.
    ...props,
    "data-slot": "label",
    className: cn(
      // A label inside a disabled group reads at the SYSTEM disabled alpha (--disabled-opacity),
      // the same one .ui-checkbox/.ui-radio/.ui-switch:disabled use — one knob, not a second one.
      "ui-label group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-[var(--disabled-opacity)]",
      labelVariants(),
      className,
    ),
    // Carried over BY HAND from @radix-ui/react-label, which react-aria-components' Label does not
    // do: without it a double click on the label text selects the surrounding paragraph instead of
    // just toggling the control twice. A press that started ON the control is left alone — cancelling
    // that one would swallow the control's own activation.
    onMouseDown: (event: React.MouseEvent<HTMLLabelElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest("button, input, select")) return;
      onMouseDown?.(event);
      if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
    },
  };
  // `asChild` is @godxjp/ui's own API (FormField renders the label as a <span> when the control it
  // names is a composite whose `for` would dangle), so it survives the primitive swap untouched.
  return asChild ? <Slot ref={ref} {...shared} /> : <AriaLabel ref={ref} {...shared} />;
});
Label.displayName = "Label";
