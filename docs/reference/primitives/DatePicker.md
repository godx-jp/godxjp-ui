---
title: "DatePicker"
description: "Date / time input family built on React Aria Components — DateField, TimeField, DatePicker, DateRangePicker."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# DatePicker

Date / time input primitives — segmented + popover combinations built on Adobe React Aria Components. Mirrors the dxs-kintai design-system patterns. Four exports: `<DateField>` (segmented date input only, no popover), `<TimeField>` (segmented time input HH:MM with optional seconds), `<DatePicker>` (single-date trigger + popover + Calendar), `<DateRangePicker>` (range trigger + popover + RangeCalendar). All consume `@internationalized/date` values (`CalendarDate`, `Time`, etc.); convert to/from JS Date via `parseDate`, `parseTime`, `today(getLocalTimeZone())`. The segmented inputs are timezone-correct and locale-aware.

## Import

```ts
import {
  DateField,
  TimeField,
  DatePicker,
  DateRangePicker,
} from "@godxjp/ui/components/primitives"
```

## Props (shared with React Aria)

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `DateValue` | — | Controlled value (`CalendarDate` / `CalendarDateTime` / `ZonedDateTime`) |
| `defaultValue` | `DateValue` | — | Uncontrolled initial value |
| `onChange` | `(value: DateValue) => void` | — | Called when the value changes |
| `label` | `string` | — | Accessible label |
| `description` | `string` | — | Help text below the input |
| `errorMessage` | `string` | — | Error text (renders via `.help.err`) |
| `isDisabled` | `boolean` | `false` | Disable interaction |

## Example

```tsx
import { today, getLocalTimeZone } from "@internationalized/date"

<DatePicker
  label="出勤日"
  defaultValue={today(getLocalTimeZone())}
/>
```

## Related

- Story catalogue: [`DatePicker` stories](../../../src/stories/data-entry/DatePicker.stories.tsx)
- Source: [`src/components/data-entry/DateTimePicker.tsx`](../../../src/components/data-entry/DateTimePicker.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
