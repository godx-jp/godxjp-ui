import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { DayButton, DayPicker, dateMatchModifiers } from "react-day-picker";
import type { DateRange, Modifiers } from "react-day-picker";
import { usePickerLocales, useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { controlIconSmClass } from "../../lib/control-styles";
import { Button, buttonVariants } from "../general/button";
import type { CalendarProp } from "../../props/components/data-entry.prop";

export type {
  CalendarProp,
  CalendarProp as CalendarProps,
  CalendarCellRenderProp,
  CalendarFooterProp,
} from "../../props/components/data-entry.prop";

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  "aria-label": ariaLabel,
  labels,
  showToday = false,
  showClose = false,
  onClose,
  footer,
  width = "auto",
  bordered = false,
  cellRender,
  month: monthProp,
  onMonthChange,
  locale: localeProp,
  ...props
}: CalendarProp) {
  const { t } = useTranslation();
  /*
   * THE CALENDAR FOLLOWS THE PROVIDER, like everything else in this library.
   *
   * It did not. `locale` arrived only through `{...props}`, so with nothing passed react-day-picker
   * fell back to its own en-US default — and a Japanese page rendered Su Mo Tu We Th Fr Sa inside a
   * card whose every other string was Japanese. Nothing failed and nothing warned: the component
   * had no opinion, so the library's default quietly won over the application's setting.
   *
   * A consumer's own `locale` still wins — `usePickerLocales` takes it as the override — which is
   * what a booking screen pinned to one market needs. The change is only about what happens when
   * nobody says anything.
   */
  const { dayPickerLocale } = usePickerLocales(localeProp);
  // The Today action must be able to move the month, so the month is latched here whenever the
  // footer is on; a consumer's own `month` still wins.
  const [month, setMonth] = React.useState<Date | undefined>(monthProp ?? props.defaultMonth);
  const today = startOfDay(props.today ?? new Date());
  const todayDisabled =
    (props.startMonth != null && today < startOfMonth(props.startMonth)) ||
    (props.endMonth != null && today > endOfMonth(props.endMonth)) ||
    (props.disabled != null && dateMatchModifiers(today, props.disabled));
  const modifiers = { today: true } as unknown as Modifiers;

  const selectToday = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMonth(startOfMonth(today));
    onMonthChange?.(startOfMonth(today));
    if (props.mode === "single") {
      props.onSelect?.(today, today, modifiers, event);
    } else if (props.mode === "multiple") {
      const current = props.selected ?? [];
      const next = current.some((day) => sameDay(day, today)) ? current : [...current, today];
      props.onSelect?.(next, today, modifiers, event);
    } else if (props.mode === "range") {
      const from = props.selected?.from;
      const to = props.selected?.to;
      const next: DateRange =
        from && !to
          ? today < from
            ? { from: today, to: from }
            : { from, to: today }
          : { from: today, to: undefined };
      props.onSelect?.(next, today, modifiers, event);
    }
  };

  const actions =
    showToday || showClose ? (
      <>
        {showToday ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ui-calendar-footer-today"
            disabled={todayDisabled}
            onClick={selectToday}
          >
            {t("dataEntry.calendar.today") ?? "Today"}
          </Button>
        ) : null}
        {showClose ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t("dataEntry.calendar.close") ?? "Close"}
          </Button>
        ) : null}
      </>
    ) : undefined;
  // Range mode defaults to resetOnSelect: once a range is complete, the next click
  // starts a FRESH range from that day. RDP's default (false) instead mutates the
  // nearest endpoint, which leaves the start date stuck — a user can never re-pick a
  // start by clicking. Opt out per call by passing resetOnSelect={false}.
  const rangeDefaults =
    props.mode === "range" ? { resetOnSelect: props.resetOnSelect ?? true } : null;
  return (
    <DayPicker
      locale={dayPickerLocale}
      showOutsideDays={showOutsideDays}
      aria-label={ariaLabel}
      month={showToday ? (monthProp ?? month) : monthProp}
      onMonthChange={(next) => {
        setMonth(next);
        onMonthChange?.(next);
      }}
      footer={footer ?? actions}
      labels={{
        ...labels,
        /*
         * LOCALIZED, like every other string this component renders. It was an English literal
         * built by template — so a Japanese calendar announced its own month controls as "Calendar
         * navigation" while the two buttons INSIDE that container said 前の月へ and 次の月へ. Nothing
         * failed and nothing warned; the only reader affected was the one using a screen reader.
         */
        labelNav:
          labels?.labelNav ??
          (() => t("dataEntry.calendar.nav", { label: ariaLabel ?? t("dataEntry.calendar.name") })),
      }}
      // The calendar has an INTRINSIC width — seven fixed day columns — and `width="auto"` (the
      // default) shrink-wraps to it so the nav sits beside the grid, not at the container edges.
      // That first line was deleted by adf52906, which left the rest of this comment saying the
      // opposite of what the CSS does.
      //
      // `className` is NOT an escape hatch for widening, and the old comment promising it was
      // measured wrong: `w-full` gives a 1198px root with the grid still 224px, pinned to the
      // left edge — wrong layout, no error. Use `width="full"` instead; it lifts all three
      // barriers (root `fit-content`, the ≥40rem row axis, and the fixed day-cell size) together.
      //
      // `relative` is load-bearing: the absolute nav must anchor to THIS root. Without it the
      // containing block becomes the nearest transformed ancestor (the popover panel), which
      // throws the chevrons to the popover corners.
      className={cn("ui-calendar", className)}
      data-width={width === "full" ? "full" : undefined}
      data-bordered={bordered ? "true" : undefined}
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
        /*
         * The weekday row needs a DS class of its own. It only ever carried `flex`, so any rule
         * written for it — the ruled grid's end edge, the header tint — matched nothing and failed
         * silently while looking correct in the stylesheet.
         */
        weekdays: cn("ui-calendar-weekdays flex", classNames?.weekdays),
        /*
         * Named for the same reason the weekday row is: a slot with no DS class cannot be styled
         * from this package, and a rule written for one fails silently. These two only render with
         * `showWeekNumber`, which is exactly why the gap went unnoticed.
         */
        week_number: cn("ui-calendar-week-number", classNames?.week_number),
        week_number_header: cn("ui-calendar-week-number-header", classNames?.week_number_header),
        weekday: cn("ui-calendar-weekday", classNames?.weekday),
        week: cn("ui-calendar-week", classNames?.week),
        /*
         * ONE ELEMENT OWNS THE DAY SURFACE, and it is the `<button>`.
         *
         * It used to be split: hover painted the button, selection painted the `<td>`. Measured on
         * a real page — the selected day came out a SHARP blue square (td, border-radius 0) while
         * hover was a rounded grey (button, 3.71px). Same for `outside`: `text-muted-foreground`
         * sat on the td while the ghost button set its own colour underneath, so days from the
         * neighbouring month were not greyed at all. Two symptoms, one cause.
         *
         * So the `td` keeps ONLY grid duties — column width, the row it sits in — and every state
         * (hover, selected, today, outside, disabled, range) is expressed on the button, where the
         * radius and the padding already live. Adding a state later means adding it in one place;
         * that was the part that kept going wrong.
         */
        day: cn("ui-calendar-day", classNames?.day),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "ui-calendar-day-button",
          classNames?.day_button,
        ),
        range_start: cn("day-range-start", classNames?.range_start),
        range_end: cn("day-range-end", classNames?.range_end),
        range_middle: cn("day-range-middle", classNames?.range_middle),
        selected: cn("day-selected", classNames?.selected),
        today: cn("day-today", classNames?.today),
        outside: cn("day-outside", classNames?.outside),
        disabled: cn("ui-calendar-day-disabled", classNames?.disabled),
        hidden: cn("invisible", classNames?.hidden),
        footer: cn("ui-calendar-footer", classNames?.footer),
        /*
         * NO `...classNames` here. Spreading the consumer's object last REPLACED each slot that it
         * names, so `classNames={{ day: "my-class" }}` dropped `.ui-calendar-day` — and with it
         * every state selector, because they all key on that class. The slots above already merge
         * the consumer's value through `cn()`; this line only ever un-merged them.
         *
         * A slot this component does not name still passes straight through: react-day-picker
         * reads its own defaults for anything absent from this object.
         */
      }}
      {...props}
      components={{
        /*
         * FOUR orientations, not two. `Nav` asks for left/right, but `Dropdown` asks for "down" —
         * and mapping everything that is not "left" to ChevronRight pointed the month and year
         * selects sideways. react-day-picker's own Chevron handles all four; ours has to as well.
         */
        Chevron: ({ orientation, className: chevronClassName }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "up"
                ? ChevronUp
                : orientation === "down"
                  ? ChevronDown
                  : ChevronRight;
          return (
            <Icon className={cn("ui-calendar-chevron", chevronClassName)} aria-hidden="true" />
          );
        },
        /**
         * `cellRender` WRAPS the library's own day button rather than replacing it (gh#390). The
         * button carries the selection state, `aria-selected`, the disabled handling and its place
         * in the grid's roving tabindex; handing a consumer a blank cell to rebuild would mean
         * every 祝日 marker in every app re-derives all of that, and most would get it wrong.
         * So the original node is passed in and the consumer decorates around it.
         */
        ...(cellRender
          ? {
              DayButton: (dayButtonProps: React.ComponentProps<typeof DayButton>) => (
                <>
                  {cellRender(dayButtonProps.day.date, {
                    originNode: <DayButton {...dayButtonProps} />,
                  })}
                </>
              ),
            }
          : {}),
        /*
         * A consumer's `components` MERGE with ours; they must not replace the object.
         *
         * `{...props}` used to sit after this block, so `components={{ DayButton: Custom }}` — the
         * documented way to put a marker on a day — silently deleted our `Chevron` too. Measured
         * on a live page: the nav arrows came back as react-day-picker's own polygon chevron,
         * which needs a `fill` and therefore picked up `--rdp-accent-color: blue`. The consumer
         * replaced one component and lost an unrelated one, with no error.
         */
        ...props.components,
      }}
      {...rangeDefaults}
    />
  );
}
