import {
  Button as RACButton,
  Calendar as RACCalendar,
  CalendarCell as RACCalendarCell,
  CalendarGrid as RACCalendarGrid,
  CalendarGridBody as RACCalendarGridBody,
  CalendarGridHeader as RACCalendarGridHeader,
  CalendarHeaderCell as RACCalendarHeaderCell,
  Heading as RACHeading,
  RangeCalendar as RACRangeCalendar,
  type CalendarProps as RACCalendarProps,
  type DateValue,
  type RangeCalendarProps as RACRangeCalendarProps,
} from "react-aria-components"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../cn"

/**
 * Calendar — accessible date grid built on React Aria Components.
 *
 * Replaces the prior `react-day-picker` wrapper. The Adobe React
 * Aria stack is the modern shadcn / Radix-ecosystem recommendation
 * for date input: ARIA APG-compliant, full keyboard nav (arrow keys
 * / PageUp/PageDown / Home/End), locale-aware via `react-aria-i18n`,
 * and timezone-correct via `@internationalized/date`.
 *
 * Two exports:
 *
 *   - `<Calendar>` — single date selection. `value` is a
 *     `@internationalized/date` `CalendarDate` (or null); `onChange`
 *     receives the same shape. Convert to/from JS `Date` with
 *     `parseDate`, `today`, `getLocalTimeZone` from `@internationalized/date`.
 *
 *   - `<RangeCalendar>` — contiguous range selection. `value` is
 *     `{ start: CalendarDate, end: CalendarDate } | null`.
 *
 * @example
 *   import { Calendar } from "@godxjp/ui"
 *   import { today, getLocalTimeZone } from "@internationalized/date"
 *
 *   const [value, setValue] = useState<CalendarDate | null>(
 *     today(getLocalTimeZone())
 *   )
 *   <Calendar value={value} onChange={setValue} aria-label="Pick a date" />
 *
 * @see https://react-spectrum.adobe.com/react-aria/Calendar.html
 */
export interface CalendarProps<T extends DateValue = DateValue>
  extends Omit<RACCalendarProps<T>, "children"> {
  className?: string
}

export function Calendar<T extends DateValue = DateValue>({
  className,
  ...rest
}: CalendarProps<T>) {
  return (
    <RACCalendar {...rest} className={cn("calendar", className)}>
      <CalendarHeader />
      <RACCalendarGrid>
        <RACCalendarGridHeader>
          {(day) => (
            <RACCalendarHeaderCell className="calendar-weekday">
              {day}
            </RACCalendarHeaderCell>
          )}
        </RACCalendarGridHeader>
        <RACCalendarGridBody>
          {(date) => <RACCalendarCell date={date} className="calendar-day" />}
        </RACCalendarGridBody>
      </RACCalendarGrid>
    </RACCalendar>
  )
}

export interface RangeCalendarProps<T extends DateValue = DateValue>
  extends Omit<RACRangeCalendarProps<T>, "children"> {
  className?: string
}

export function RangeCalendar<T extends DateValue = DateValue>({
  className,
  ...rest
}: RangeCalendarProps<T>) {
  return (
    <RACRangeCalendar {...rest} className={cn("calendar", "calendar-range", className)}>
      <CalendarHeader />
      <RACCalendarGrid>
        <RACCalendarGridHeader>
          {(day) => (
            <RACCalendarHeaderCell className="calendar-weekday">
              {day}
            </RACCalendarHeaderCell>
          )}
        </RACCalendarGridHeader>
        <RACCalendarGridBody>
          {(date) => <RACCalendarCell date={date} className="calendar-day" />}
        </RACCalendarGridBody>
      </RACCalendarGrid>
    </RACRangeCalendar>
  )
}

function CalendarHeader() {
  return (
    <header className="calendar-header">
      <RACButton slot="previous" className="calendar-nav">
        <ChevronLeft aria-hidden size={16} strokeWidth={1.5} />
      </RACButton>
      <RACHeading className="calendar-title" />
      <RACButton slot="next" className="calendar-nav">
        <ChevronRight aria-hidden size={16} strokeWidth={1.5} />
      </RACButton>
    </header>
  )
}
