---
title: "Calendar"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Calendar
status: stable
audience: [developer, agent]
lang: en
---

# Calendar

> Date-picker calendar grid backed by `react-day-picker` v9.

## Usage

```tsx
import { Calendar } from "@godxjp/ui";
import { useState } from "react";

function DatePicker() {
  const [selected, setSelected] = useState<Date | undefined>();
  return <Calendar mode="single" selected={selected} onSelect={setSelected} />;
}
```

## Props

`Calendar` accepts all props from `react-day-picker` v9 `DayPicker`. Common props:

| Prop       | Type                                | Default       | Description                           |
| ---------- | ----------------------------------- | ------------- | ------------------------------------- |
| `mode`     | `"single" \| "multiple" \| "range"` | `"single"`    | Selection mode                        |
| `selected` | `Date \| Date[] \| DateRange`       | —             | Controlled selected value             |
| `onSelect` | `(date: ...) => void`               | —             | Selection callback                    |
| `disabled` | `Matcher \| Matcher[]`              | —             | Disable specific dates or ranges      |
| `fromDate` | `Date`                              | —             | Minimum selectable date               |
| `toDate`   | `Date`                              | —             | Maximum selectable date               |
| `locale`   | `Locale`                            | System locale | `date-fns` locale for month/day names |

## Accessibility

- `react-day-picker` renders an ARIA grid (`role="grid"`) with `role="gridcell"` for each day.
- Keyboard: Arrow keys move between days. Enter selects. Page Up/Down moves months.
- Selected day announces "selected" to screen readers via `aria-selected`.
- Disabled days announce "unavailable" via `aria-disabled`.
- WCAG 2.1 SC 1.4.11 (Non-text Contrast): day focus and selection indicators meet 3:1 contrast.

## Composition

```tsx
// Calendar inside a Popover (date picker pattern)
import {
  Popover,
  Popover,
  Popover,
  Button,
  Calendar,
} from "@godxjp/ui";

<Popover>
  <Popover asChild>
    <Button variant="secondary">
      {selected ? selected.toLocaleDateString() : "Pick a date"}
    </Button>
  </Popover>
  <Popover>
    <Calendar mode="single" selected={selected} onSelect={setSelected} />
  </Popover>
</Popover>;
```

## See also

- [TimeInput](../data-entry/TimeInput.md) — companion for time selection.
- [Popover](./Popover.md) — typical wrapping context.
