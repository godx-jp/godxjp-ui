import {
  Button as RACButton,
  DateField as RACDateField,
  DateInput as RACDateInput,
  DatePicker as RACDatePicker,
  DateRangePicker as RACDateRangePicker,
  DateSegment as RACDateSegment,
  Dialog as RACDialog,
  FieldError as RACFieldError,
  Group as RACGroup,
  Label as RACLabel,
  Popover as RACPopover,
  Text as RACText,
  TimeField as RACTimeField,
  type DateValue,
  type DateFieldProps as RACDateFieldProps,
  type DatePickerProps as RACDatePickerProps,
  type DateRangePickerProps as RACDateRangePickerProps,
  type TimeFieldProps as RACTimeFieldProps,
  type TimeValue,
} from "react-aria-components"
import { CalendarIcon } from "lucide-react"
import { Calendar, RangeCalendar } from "../data-display/Calendar"
import { cn } from "../cn"

/**
 * Date / time input primitives — segmented + popover combinations
 * built on Adobe React Aria Components. Mirrors the dxs-kintai
 * design-system patterns A–E from
 * `design-handoff/ui-system/dxs-kintai-design-system/project/preview/comp-datetimepicker.html`.
 *
 * Five exports:
 *
 *   - `<DateField>` — segmented date input only (no popover).
 *   - `<TimeField>` — segmented time input (HH:MM, optional seconds).
 *   - `<DatePicker>` — single-date trigger + popover + Calendar.
 *   - `<DateRangePicker>` — range trigger + popover + RangeCalendar.
 *
 * All four consume `@internationalized/date` values (CalendarDate,
 * Time, etc.) — convert to/from JS Date via `parseDate`, `parseTime`,
 * `today(getLocalTimeZone())` from `@internationalized/date`. The
 * segmented inputs are timezone-correct and locale-aware.
 *
 * Visual theming flows through the four theme axes
 * (`docs/specs/01-theme-axes.md`): `data-theme`, `data-accent`,
 * `data-density`, `data-font-size`.
 */

// ─── DateField — segmented date input only ─────────────────────────

export interface DateFieldProps<T extends DateValue = DateValue>
  extends RACDateFieldProps<T> {
  label?: string
  description?: string
  errorMessage?: string
  className?: string
}

export function DateField<T extends DateValue = DateValue>({
  label,
  description,
  errorMessage,
  className,
  ...rest
}: DateFieldProps<T>) {
  return (
    <RACDateField {...rest} className={cn("field", className)}>
      {label != null && <RACLabel>{label}</RACLabel>}
      <RACDateInput className="dt-segments">
        {(segment) => <RACDateSegment segment={segment} className="dt-seg" />}
      </RACDateInput>
      {description != null && (
        <RACText slot="description" className="help">
          {description}
        </RACText>
      )}
      <RACFieldError className="help err">{errorMessage}</RACFieldError>
    </RACDateField>
  )
}

// ─── TimeField — segmented time input ──────────────────────────────

export interface TimeFieldProps<T extends TimeValue = TimeValue>
  extends RACTimeFieldProps<T> {
  label?: string
  description?: string
  errorMessage?: string
  className?: string
}

export function TimeField<T extends TimeValue = TimeValue>({
  label,
  description,
  errorMessage,
  className,
  ...rest
}: TimeFieldProps<T>) {
  return (
    <RACTimeField {...rest} className={cn("field", className)}>
      {label != null && <RACLabel>{label}</RACLabel>}
      <RACDateInput className="dt-segments">
        {(segment) => <RACDateSegment segment={segment} className="dt-seg" />}
      </RACDateInput>
      {description != null && (
        <RACText slot="description" className="help">
          {description}
        </RACText>
      )}
      <RACFieldError className="help err">{errorMessage}</RACFieldError>
    </RACTimeField>
  )
}

// ─── DatePicker — trigger + popover + Calendar ─────────────────────

export interface DatePickerProps<T extends DateValue = DateValue>
  extends RACDatePickerProps<T> {
  label?: string
  description?: string
  errorMessage?: string
  className?: string
}

export function DatePicker<T extends DateValue = DateValue>({
  label,
  description,
  errorMessage,
  className,
  ...rest
}: DatePickerProps<T>) {
  return (
    <RACDatePicker {...rest} className={cn("field", className)}>
      {label != null && <RACLabel>{label}</RACLabel>}
      <RACGroup className="dt-trigger">
        <RACDateInput className="dt-segments dt-segments-inline">
          {(segment) => <RACDateSegment segment={segment} className="dt-seg" />}
        </RACDateInput>
        {/* Trigger button on the right uses a calendar icon
         * (Ant Design / shadcn convention). The previous `▾` chevron
         * read as a generic dropdown affordance — calendar matches the
         * primitive's purpose. */}
        <RACButton className="dt-trigger-btn" aria-label="Open calendar">
          <CalendarIcon aria-hidden size={14} strokeWidth={1.75} />
        </RACButton>
      </RACGroup>
      {description != null && (
        <RACText slot="description" className="help">
          {description}
        </RACText>
      )}
      <RACFieldError className="help err">{errorMessage}</RACFieldError>
      <RACPopover className="dt-popover">
        <RACDialog>
          <Calendar />
        </RACDialog>
      </RACPopover>
    </RACDatePicker>
  )
}

// ─── DateRangePicker — range trigger + popover + RangeCalendar ─────

export interface DateRangePickerProps<T extends DateValue = DateValue>
  extends RACDateRangePickerProps<T> {
  label?: string
  description?: string
  errorMessage?: string
  className?: string
}

export function DateRangePicker<T extends DateValue = DateValue>({
  label,
  description,
  errorMessage,
  className,
  ...rest
}: DateRangePickerProps<T>) {
  return (
    <RACDateRangePicker {...rest} className={cn("field", className)}>
      {label != null && <RACLabel>{label}</RACLabel>}
      <RACGroup className="dt-trigger">
        <CalendarIcon aria-hidden size={14} strokeWidth={1.5} className="ico" />
        <RACDateInput slot="start" className="dt-segments dt-segments-inline">
          {(segment) => <RACDateSegment segment={segment} className="dt-seg" />}
        </RACDateInput>
        <span className="dt-sep" aria-hidden>→</span>
        <RACDateInput slot="end" className="dt-segments dt-segments-inline">
          {(segment) => <RACDateSegment segment={segment} className="dt-seg" />}
        </RACDateInput>
        <RACButton className="dt-trigger-btn" aria-label="Open calendar">
          <span aria-hidden>▾</span>
        </RACButton>
      </RACGroup>
      {description != null && (
        <RACText slot="description" className="help">
          {description}
        </RACText>
      )}
      <RACFieldError className="help err">{errorMessage}</RACFieldError>
      <RACPopover className="dt-popover">
        <RACDialog>
          <RangeCalendar />
        </RACDialog>
      </RACPopover>
    </RACDateRangePicker>
  )
}
