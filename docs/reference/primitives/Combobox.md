---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Combobox
status: stable
audience: [developer, agent]
---

# Combobox

> Searchable select — a Popover surface wrapping `cmdk` Command for filterable option lists.

## Usage

```tsx
import {
  Combobox, ComboboxTrigger, ComboboxContent,
  ComboboxInput, ComboboxList, ComboboxItem, ComboboxEmpty,
} from "@godxjp/ui"
import { useState } from "react"

const options = [
  { value: "react", label: "React" },
  { value: "vue",   label: "Vue" },
  { value: "solid", label: "SolidJS" },
]

function FrameworkPicker() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger asChild>
        <Button variant="secondary">
          {value ? options.find((o) => o.value === value)?.label : "Select framework…"}
        </Button>
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Search…" />
        <ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          {options.map((o) => (
            <ComboboxItem
              key={o.value}
              value={o.value}
              onSelect={() => {
                setValue(o.value)
                setOpen(false)
              }}
            >
              {o.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
```

## Exports

| Export | Description |
|---|---|
| `Combobox` | Root (re-export of `Popover`) |
| `ComboboxTrigger` | Trigger (re-export of `PopoverTrigger`) |
| `ComboboxAnchor` | Anchor (re-export of `PopoverAnchor`) |
| `ComboboxContent` | Popover panel with embedded `cmdk` Command |
| `ComboboxInput` | Search input inside the panel |
| `ComboboxList` | Scrollable list container |
| `ComboboxItem` | Option row |
| `ComboboxEmpty` | Empty state shown when no items match |

## Props — ComboboxContent

| Prop | Type | Default | Description |
|---|---|---|---|
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alignment relative to trigger |
| `sideOffset` | `number` | `4` | Gap in pixels from trigger |
| `shouldFilter` | `boolean` | `true` | Whether cmdk filters items based on input |
| `filter` | `(value: string, search: string) => number` | — | Custom filter function |
| `commandClassName` | `string` | — | CSS class applied to the inner Command root |

## Accessibility

- `ComboboxTrigger` (via Popover) sets `aria-expanded` and `aria-haspopup`.
- `cmdk` Command handles ARIA listbox semantics: `role="listbox"`, `role="option"`, `aria-selected`.
- Keyboard: Arrow Down / Up navigate items. Enter selects. Escape closes.
- Type-ahead filtering updates results as the user types in `ComboboxInput`.

## See also

- [Select](./Select.md) — non-searchable dropdown.
- [CommandPalette](../shell/CommandPalette.md) — full-page command palette using cmdk.
- [Popover](./Popover.md) — underlying popover primitive.
