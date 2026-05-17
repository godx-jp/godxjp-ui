---
title: "TimeInput"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: TimeInput
status: stable
audience: [developer, agent]
lang: en
---

# TimeInput

> Narrow text input for 24-hour `HH:mm` time values with built-in normalization.

## Usage

```tsx
import { TimeInput } from "@godxjp/ui"

<TimeInput value="09:30" onChange={(time) => console.log(time)} />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Controlled time in `"HH:mm"` format |
| `onChange` | `(time: string) => void` | — | Called on blur with the normalized `"HH:mm"` string (only when valid) |
| `disabled` | `boolean` | — | Disables the input and propagates `aria-disabled` |
| `placeholder` | `string` | `"HH:mm"` | Input placeholder |
| `id` | `string` | — | For `<Label htmlFor>` association |
| `name` | `string` | — | For form submission |
| `className` | `string` | — | Additional CSS class applied to the input element |

## Behavior

- Accepts flexible input: `"0930"`, `"9:30"`, `"930"` are all normalized to `"09:30"` on blur.
- `onChange` fires only on blur, only when the value is valid, and only when the value differs from the `value` prop.
- `aria-invalid` is set automatically when `draft` is non-empty and does not match `HH:mm`.
- The internal draft state tracks the typing state; the normalized value is committed on blur.

## Accessibility

- Renders `inputMode="numeric"` so mobile keyboards show the numeric pad.
- `aria-invalid` reflects validation state — combine with `aria-describedby` pointing to an error message.
- Always pair with a `<Label>` using `htmlFor` / `id`.
- WCAG 2.1 SC 1.3.5 (Identify Input Purpose): use `name="time"` and `autocomplete="off"` for custom time fields.

## Composition

```tsx
import { Label, TimeInput } from "@godxjp/ui"

<div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
  <Label htmlFor="start-time">Start time</Label>
  <TimeInput
    id="start-time"
    value={startTime}
    onChange={setStartTime}
  />
</div>
```

## See also

- [Calendar](./Calendar.md) — companion for date selection.
- [Input](./Input.md) — generic text input.
