---
title: "Combobox"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Combobox
status: stable
audience: [developer, agent]
lang: en
---

# Combobox

> Searchable select — a Popover surface wrapping `cmdk` Command for filterable option lists.

## When to use Combobox vs Select

| Need                                       | Use                               |
| ------------------------------------------ | --------------------------------- |
| Fixed list, no search, < ~20 items         | **Select**                        |
| Search / filter input above the list       | **Combobox**                      |
| Allow free-text not in the list            | **AutoComplete** (wraps Combobox) |
| Hierarchical nested options                | **Cascader**                      |
| Tree-shaped options (org chart, file tree) | **TreeSelect**                    |

Combobox is the filter-aware sibling of Select — it renders a search
input above the result list. Use it when the option count is large
enough that a user wants to type to filter (>~20). For a fixed short
list use Select instead.

## Usage — data-driven (preferred)

```tsx
import { Combobox } from "@godxjp/ui";
import { useState } from "react";

function FrameworkPicker() {
  const [value, setValue] = useState("");
  return (
    <Combobox
      options={[
        { value: "react", label: "React" },
        { value: "vue", label: "Vue" },
        { value: "solid", label: "SolidJS" },
      ]}
      triggerLabel="Select framework…"
      placeholder="Search…"
      emptyLabel="No results found."
      value={value}
      onValueChange={setValue}
    />
  );
}
```

## Usage — compositional (advanced)

```tsx
import {
  Combobox,
  Combobox,
  Combobox,
  Combobox,
  Combobox,
  Combobox,
  Combobox,
} from "@godxjp/ui";
import { useState } from "react";

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "solid", label: "SolidJS" },
];

function FrameworkPicker() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <Combobox asChild>
        <Button variant="secondary">
          {value
            ? options.find((o) => o.value === value)?.label
            : "Select framework…"}
        </Button>
      </Combobox>
      <Combobox>
        <Combobox placeholder="Search…" />
        <Combobox>
          <Combobox>No results found.</Combobox>
          {options.map((o) => (
            <Combobox
              key={o.value}
              value={o.value}
              onSelect={() => {
                setValue(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </Combobox>
          ))}
        </Combobox>
      </Combobox>
    </Combobox>
  );
}
```

## Exports

| Export            | Description                                |
| ----------------- | ------------------------------------------ |
| `Combobox`        | Root (re-export of `Popover`)              |
| `Combobox` | Trigger (re-export of `Popover`)    |
| `Combobox`  | Anchor (re-export of `Popover`)      |
| `Combobox` | Popover panel with embedded `cmdk` Command |
| `Combobox`   | Search input inside the panel              |
| `Combobox`    | Scrollable list container                  |
| `Combobox`    | Option row                                 |
| `Combobox`   | Empty state shown when no items match      |

## Props — Combobox

| Prop               | Type                                        | Default   | Description                                 |
| ------------------ | ------------------------------------------- | --------- | ------------------------------------------- |
| `align`            | `"start" \| "center" \| "end"`              | `"start"` | Alignment relative to trigger               |
| `sideOffset`       | `number`                                    | `4`       | Gap in pixels from trigger                  |
| `shouldFilter`     | `boolean`                                   | `true`    | Whether cmdk filters items based on input   |
| `filter`           | `(value: string, search: string) => number` | —         | Custom filter function                      |
| `commandClassName` | `string`                                    | —         | CSS class applied to the inner Command root |

## Accessibility

- `Combobox` (via Popover) sets `aria-expanded` and `aria-haspopup`.
- `cmdk` Command handles ARIA listbox semantics: `role="listbox"`, `role="option"`, `aria-selected`.
- Keyboard: Arrow Down / Up navigate items. Enter selects. Escape closes.
- Type-ahead filtering updates results as the user types in `Combobox`.

## See also

- [Select](./Select.md) — non-searchable dropdown.
- [CommandPalette](../shell/CommandPalette.md) — full-page command palette using cmdk.
- [Popover](../data-display/Popover.md) — underlying popover primitive.
