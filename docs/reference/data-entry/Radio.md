---
title: "Radio"
description: "Radix-backed single-select group — data-driven (options) or compositional (children)."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Radio

> Radix-backed single-select group. Use the `options` array for data-driven groups; use `<Radio>` children when you need per-item layout control.

## When to use

| Need                                | Use                                                                  |
| ----------------------------------- | -------------------------------------------------------------------- |
| Pick exactly one option             | **Radio**                                                            |
| Pick zero or more options           | [Checkbox](./Checkbox.md) (multi via [CheckboxGroup](./Checkbox.md)) |
| Boolean on / off toggle             | [Switch](./Switch.md)                                                |
| Segmented two-or-three way selector | [SegmentedControl](../data-display/SegmentedControl.md)              |

## Usage

```tsx
import { RadioGroup } from "@godxjp/ui";

<RadioGroup
  defaultValue="weekly"
  options={[
    { value: "daily", label: "毎日" },
    { value: "weekly", label: "毎週" },
    { value: "monthly", label: "毎月" },
  ]}
/>;
```

## Props

### `RadioGroup` (root)

Extends `ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>` from Radix (sans `orientation`, which is re-declared with this framework's enum).

| Prop            | Type                              | Default        | Description                                                       |
| --------------- | --------------------------------- | -------------- | ----------------------------------------------------------------- |
| `options`       | `RadioOption[]`                   | —              | Data-driven items — preferred when no per-item layout is needed   |
| `children`      | `ReactNode`                       | —              | Compositional `<Radio>` children when `options` is omitted        |
| `value`         | `string`                          | —              | Controlled selected value                                         |
| `defaultValue`  | `string`                          | —              | Uncontrolled initial value                                        |
| `onValueChange` | `(value: string) => void`         | —              | Fires on selection change                                         |
| `orientation`   | `"horizontal" \| "vertical"`      | `"horizontal"` | Axis of stack                                                     |
| `size`          | `"small" \| "default" \| "large"` | `"default"`    | Per-item dimensional scale (passed to each `<Radio>` via context) |
| `disabled`      | `boolean`                         | `false`        | Disable the whole group                                           |
| `name`          | `string`                          | —              | Native form-field name                                            |
| `className`     | `string`                          | —              | Merged onto the `.radio-group` root                               |

### `Radio` (child)

| Prop        | Type        | Default  | Description                                       |
| ----------- | ----------- | -------- | ------------------------------------------------- |
| `value`     | `string`    | required | Value committed when this radio is selected       |
| `disabled`  | `boolean`   | `false`  | Disable just this radio                           |
| `children`  | `ReactNode` | —        | Label rendered next to the indicator              |
| `id`        | `string`    | —        | DOM id; useful for pairing with an external label |
| `className` | `string`    | —        | Merged onto the `.radio-root` indicator wrapper   |

### `RadioOption`

| Field      | Type        | Description                |
| ---------- | ----------- | -------------------------- |
| `value`    | `string`    | Option value               |
| `label`    | `ReactNode` | Display content            |
| `disabled` | `boolean`   | Non-selectable when `true` |

## Accessibility

- Built on `@radix-ui/react-radio-group` — root has `role="radiogroup"`; each item is a real `<button role="radio">` with `aria-checked` flipping between `"true"` / `"false"`.
- Keyboard: `Tab` enters the group; arrow keys cycle through items; `Space` commits.
- Disabled items skip keyboard navigation per Radix default.
- WCAG 2.1 SC 1.3.1 (Info and Relationships): pair the group with a `<Field.Label>` so the question text is programmatically associated with the radio set.

## Composition

```tsx
// Vertical pricing tier picker
<RadioGroup
  orientation="vertical"
  defaultValue="standard"
  options={[
    { value: "free", label: "Free — ¥0 / 月" },
    { value: "standard", label: "Standard — ¥980 / 月" },
    { value: "pro", label: "Pro — ¥2,900 / 月" },
  ]}
/>

// Compositional children with per-item disable
<RadioGroup defaultValue="a">
  <Radio value="a">通常項目</Radio>
  <Radio value="b" disabled>無効な項目</Radio>
  <Radio value="c">通常項目</Radio>
</RadioGroup>

// Controlled
function Controlled() {
  const [value, setValue] = useState("standard")
  return (
    <RadioGroup
      value={value}
      onValueChange={setValue}
      options={[
        { value: "free", label: "Free" },
        { value: "standard", label: "Standard" },
        { value: "pro", label: "Pro" },
      ]}
    />
  )
}
```

## See also

- [Checkbox](./Checkbox.md) — multi-select alternative.
- [Switch](./Switch.md) — boolean toggle.
- [SegmentedControl](../data-display/SegmentedControl.md) — compact pill-style alternative for 2–3 options.
- Source: [`src/components/data-entry/Radio.tsx`](../../../src/components/data-entry/Radio.tsx)
