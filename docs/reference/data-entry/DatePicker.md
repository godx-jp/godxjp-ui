---
title: "DatePicker"
description: "Date / time input family — DateField, TimeField, DatePicker, DateRangePicker — built on React Aria Components."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# DatePicker

> Date / time input family — `DateField`, `TimeField`, `DatePicker`, `DateRangePicker` — built on Adobe React Aria Components.

Four exports share one source file (`DateTimePicker.tsx`):

- `<DateField>` — segmented date input only, no popover.
- `<TimeField>` — segmented time input (`HH:MM`, optional seconds).
- `<DatePicker>` — segmented trigger + popover Calendar.
- `<DateRangePicker>` — start / end segments + popover RangeCalendar.

All four accept `@internationalized/date` values (`CalendarDate`, `Time`, `DateValue`, …). Convert to / from JS Date via `parseDate`, `parseTime`, `today(getLocalTimeZone())` from `@internationalized/date`. The segmented inputs are timezone-correct and locale-aware.

## When to use

| Need                            | Use                           |
| ------------------------------- | ----------------------------- |
| Single date, calendar popover   | **DatePicker**                |
| Date range with start / end     | **DateRangePicker**           |
| Segmented input without popover | **DateField**                 |
| Time-of-day only (`HH:MM`)      | **TimeField**                 |
| Free-text `HH:mm` text input    | [`TimeInput`](./TimeInput.md) |

## Usage

```tsx
import { DatePicker } from "@godxjp/ui";
import { today, getLocalTimeZone } from "@internationalized/date";

<div style={{ maxWidth: 320 }}>
  <DatePicker
    label="入社日"
    description="カレンダーから選択するか直接入力できます。"
    defaultValue={today(getLocalTimeZone())}
  />
</div>;
```

## Props

### `DateField<T>`

Extends `DateFieldProps<T>` from `react-aria-components`.

| Prop                                  | Type                                      | Default        | Description                                 |
| ------------------------------------- | ----------------------------------------- | -------------- | ------------------------------------------- |
| `label`                               | `string`                                  | —              | Rendered inside a React Aria `<Label>` slot |
| `description`                         | `string`                                  | —              | Help text under the segments                |
| `errorMessage`                        | `string`                                  | —              | Error text — paired with `isInvalid`        |
| `className`                           | `string`                                  | —              | Class merged onto the `.field` root         |
| `value` / `defaultValue` / `onChange` | `T \| null`                               | —              | React Aria date value control               |
| `placeholderValue`                    | `T`                                       | —              | Format hint visible when value is unset     |
| `granularity`                         | `"day" \| "hour" \| "minute" \| "second"` | `"day"`        | Segment depth                               |
| `hourCycle`                           | `12 \| 24`                                | locale-default | AM/PM vs 24h                                |
| `minValue` / `maxValue`               | `T`                                       | —              | Selectable range constraint                 |
| `isDisabled`                          | `boolean`                                 | `false`        | Disable interaction                         |
| `isReadOnly`                          | `boolean`                                 | `false`        | Display-only                                |
| `isInvalid`                           | `boolean`                                 | `false`        | Apply error styling                         |
| `isRequired`                          | `boolean`                                 | `false`        | Mark as required                            |

### `TimeField<T>`

Extends `TimeFieldProps<T>` from `react-aria-components`. Same `label` / `description` / `errorMessage` / `className` extension as `DateField`. Value is a `TimeValue` (`Time` from `@internationalized/date`).

### `DatePicker<T>`

Extends `DatePickerProps<T>`. Same wrapper props as `DateField`, plus the popover `<Calendar>` is rendered automatically inside the trigger.

### `DateRangePicker<T>`

Extends `DateRangePickerProps<T>`. Value shape is `{ start: T; end: T }`. Same wrapper props as `DatePicker`; popover renders a `<RangeCalendar>`.

## Accessibility

- React Aria owns the keyboard map: arrow keys cycle through segments; up / down adjust the focused segment; tab moves between segments and the calendar toggle button.
- Each segment renders as a `<div role="spinbutton">` with `aria-valuetext`, so screen readers announce both the segment label (year / month / day) and the typed value.
- The popover dialog has a real `role="dialog"` and traps focus while open.
- `errorMessage` is rendered through React Aria's `<FieldError>` and linked via `aria-describedby` so assistive tech reads it after the field value.
- WCAG 2.1 SC 1.3.5 (Identify Input Purpose): pass `label` so the segments are programmatically named.

## Composition

```tsx
// Date + time picker constrained to today onwards
<DatePicker
  label="打刻時刻 (分単位)"
  description='`granularity="minute"` で時刻セグメントが付与される。'
  granularity="minute"
  hourCycle={24}
  minValue={today(getLocalTimeZone())}
  placeholderValue={now(getLocalTimeZone())}
/>

// Range picker with default 14-day span
const start = today(getLocalTimeZone())
const end = start.add({ days: 14 })

<DateRangePicker
  label="勤務期間"
  description="開始日と終了日を選んでください。"
  defaultValue={{ start, end }}
/>

// Standalone segmented input — no popover overhead
<DateField
  label="生年月日"
  description="YYYY/MM/DD で直接入力可能。"
  defaultValue={today(getLocalTimeZone()).subtract({ years: 30 })}
/>
```

## See also

- [Calendar](../data-display/Calendar.md) — month-grid surface used inside `DatePicker`'s popover.
- [TimeInput](./TimeInput.md) — free-text `HH:mm` alternative when segments are not needed.
- [Field](./Field.md) — wrap multiple date primitives with a shared label / help group.
- Source: [`src/components/data-entry/DateTimePicker.tsx`](../../../src/components/data-entry/DateTimePicker.tsx)
