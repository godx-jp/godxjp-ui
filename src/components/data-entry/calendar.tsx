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
  ...props
}: CalendarProp) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // The calendar has an intrinsic width (7 fixed-size day columns); never stretch it to
      // fill a wide container — w-fit shrink-wraps the grid so the nav sits beside it, not at
      // the container edges. Consumers can still widen via `className` if they truly need to.
      className={cn("w-fit p-3", className)}
      classNames={{
        months: cn("flex flex-col gap-4 sm:flex-row", classNames?.months),
        month: cn("relative flex flex-col gap-4", classNames?.month),
        month_caption: cn(
          "flex h-[length:var(--control-height)] w-full items-center justify-center px-8",
          classNames?.month_caption,
        ),
        caption_label: cn("text-sm font-medium", classNames?.caption_label),
        nav: cn("absolute inset-x-0 top-3 flex items-center justify-between px-1", classNames?.nav),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          controlIconSmClass,
          "bg-transparent p-0 opacity-70 hover:opacity-100",
          classNames?.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          controlIconSmClass,
          "bg-transparent p-0 opacity-70 hover:opacity-100",
          classNames?.button_next,
        ),
        month_grid: cn("mt-4 w-full border-collapse", classNames?.month_grid),
        weekdays: cn("flex", classNames?.weekdays),
        weekday: cn(
          "w-[length:var(--control-height)] rounded-md text-xs font-normal text-muted-foreground",
          classNames?.weekday,
        ),
        week: cn("mt-2 flex w-full", classNames?.week),
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected].day-range-end)]:rounded-e-md",
          classNames?.day,
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-[length:var(--control-height)] p-0 font-normal aria-selected:opacity-100",
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
          classNames?.selected,
        ),
        today: cn("bg-accent text-accent-foreground", classNames?.today),
        outside: cn(
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
          classNames?.outside,
        ),
        disabled: cn("text-muted-foreground opacity-50", classNames?.disabled),
        hidden: cn("invisible", classNames?.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className={cn("size-4", chevronClassName)} aria-hidden="true" />;
        },
      }}
      {...props}
    />
  );
}
