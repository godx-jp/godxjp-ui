---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Select
status: stable
audience: [developer, agent]
---

# Select

> Keyboard-navigable dropdown select backed by `@radix-ui/react-select`.

## Usage

```tsx
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@godxjp/ui"

<Select value={status} onValueChange={setStatus}>
  <SelectTrigger aria-label="Status">
    <SelectValue placeholder="Select status…" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="open">Open</SelectItem>
    <SelectItem value="in-progress">In progress</SelectItem>
    <SelectItem value="done">Done</SelectItem>
  </SelectContent>
</Select>
```

## Exports

| Export | Description |
|---|---|
| `Select` | Root |
| `SelectTrigger` | Button that opens the dropdown |
| `SelectValue` | Displays the selected value or placeholder |
| `SelectContent` | Dropdown panel |
| `SelectItem` | Option row |
| `SelectLabel` | Non-selectable group label |
| `SelectSeparator` | Divider between groups |
| `SelectGroup` | Groups related items |
| `SelectIcon` | Icon area inside the trigger |
| `SelectPortal` | Portal |
| `SelectScrollUpButton` | Scroll indicator (top) |
| `SelectScrollDownButton` | Scroll indicator (bottom) |

## Props — Select (root)

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Controlled value |
| `onValueChange` | `(value: string) => void` | — | Called when selection changes |
| `defaultValue` | `string` | — | Uncontrolled default value |
| `disabled` | `boolean` | `false` | Disables the entire select |
| `name` | `string` | — | Form field name |

## Props — SelectItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | The option's value |
| `disabled` | `boolean` | `false` | Disables this option |

## Accessibility

- Trigger renders `role="combobox"` with `aria-expanded` and `aria-haspopup="listbox"`.
- Content renders `role="listbox"`.
- Each item renders `role="option"` with `aria-selected`.
- Keyboard: Arrow Down / Up navigates options. Enter selects. Escape closes.
- Type-ahead: typing a character jumps to the first matching item.
- WCAG 2.1 SC 1.3.1: always pair `SelectTrigger` with a `<Label htmlFor>` or provide `aria-label`.

## Composition

```tsx
// With label and grouped options
<div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
  <Label htmlFor="priority">Priority</Label>
  <Select value={priority} onValueChange={setPriority}>
    <SelectTrigger id="priority">
      <SelectValue placeholder="Select priority…" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>High priority</SelectLabel>
        <SelectItem value="critical">Critical</SelectItem>
        <SelectItem value="high">High</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Normal</SelectLabel>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="low">Low</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</div>
```

## See also

- [Combobox](./Combobox.md) — searchable select.
- [Label](./Label.md) — required pairing for accessibility.
- [Input](./Input.md) — text input alternative.
