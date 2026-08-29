import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";
import { controlIconSmClass } from "../../lib/control-styles";
import { buttonVariants } from "../general/button";
import type { CalendarProp } from "../../props/components/data-entry.prop";

export type {
  CalendarProp,
  CalendarProp as CalendarProps,
} from "../../props/components/data-entry.prop";

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  "aria-label": ariaLabel,
  labels,
  ...props
}: CalendarProp) {
  // Range mode defaults to resetOnSelect: once a range is complete, the next click
  // starts a FRESH range from that day. RDP's default (false) instead mutates the
  // nearest endpoint, which leaves the start date stuck — a user can never re-pick a
  // start by clicking. Opt out per call by passing resetOnSelect={false}.
  const rangeDefaults =
    props.mode === "range" ? { resetOnSelect: props.resetOnSelect ?? true } : null;
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      aria-label={ariaLabel}
      labels={{
        ...labels,
        labelNav: labels?.labelNav ?? (() => `${ariaLabel ?? "Calendar"} navigation`),
      }}
      // The calendar has an intrinsic width (7 fixed-size day columns); never stretch it to
      // fill a wide container — w-fit shrink-wraps the grid so the nav sits beside it, not at
      // the container edges. Consumers can still widen via `className` if they truly need to.
      // `relative` is load-bearing: the absolute nav must anchor to THIS root. Without it the
      // containing block becomes the nearest transformed ancestor (Radix PopoverContent), which
      // throws the chevrons to the popover corners.
      className={cn("ui-calendar", className)}
      classNames={{
        months: cn("ui-calendar-months", classNames?.months),
        month: cn("ui-calendar-month", classNames?.month),
        month_caption: cn("ui-calendar-caption", classNames?.month_caption),
        caption_label: cn("ui-calendar-caption-label", classNames?.caption_label),
        // z-10 is load-bearing: `month` below is position:relative and later in the DOM, so
        // without a z-index it paints OVER these buttons — they render but never receive the
        // click (the month caption swallows it) and the calendar looks frozen.
        nav: cn("ui-calendar-nav", classNames?.nav),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          controlIconSmClass,
          "ui-calendar-nav-button",
          classNames?.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          controlIconSmClass,
          "ui-calendar-nav-button",
          classNames?.button_next,
        ),
        month_grid: cn("ui-calendar-grid", classNames?.month_grid),
        weekdays: cn("flex", classNames?.weekdays),
        weekday: cn("ui-calendar-weekday", classNames?.weekday),
        week: cn("ui-calendar-week", classNames?.week),
        day: cn(
          "ui-calendar-day",
          "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected].day-range-end)]:rounded-e-md",
          classNames?.day,
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "ui-calendar-day-button",
          classNames?.day_button,
        ),
        range_start: cn("day-range-start rounded-s-md", classNames?.range_start),
        range_end: cn("day-range-end rounded-e-md", classNames?.range_end),
        range_middle: cn(
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
          classNames?.range_middle,
        ),
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          // The day is a ghost <button> that sets its OWN (dark --foreground) text colour, which
          // overrides the cell's text-primary-foreground and fails contrast on the blue fill
          // (axe color-contrast). Force the button label to primary-foreground through hover/focus.
          "[&>button]:text-primary-foreground [&>button:hover]:bg-primary [&>button:hover]:text-primary-foreground [&>button:focus]:text-primary-foreground",
          classNames?.selected,
        ),
        today: cn("bg-accent text-accent-foreground", classNames?.today),
        outside: cn(
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
          classNames?.outside,
        ),
        disabled: cn("ui-calendar-day-disabled", classNames?.disabled),
        hidden: cn("invisible", classNames?.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return (
            <Icon className={cn("ui-calendar-chevron", chevronClassName)} aria-hidden="true" />
          );
        },
      }}
      {...props}
      {...rangeDefaults}
    />
  );
}
