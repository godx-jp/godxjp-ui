---
title: "Popover"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Popover
status: stable
audience: [developer, agent]
lang: en
---

# Popover

> Non-modal floating content panel backed by `@radix-ui/react-popover`.

## Usage

```tsx
import { Popover, PopoverTrigger, PopoverContent } from "@godxjp/ui"

<Popover>
  <PopoverTrigger asChild>
    <Button variant="ghost">Options</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Popover content goes here.</p>
  </PopoverContent>
</Popover>
```

## Exports

| Export | Description |
|---|---|
| `Popover` | Root — re-export of Radix Popover Root |
| `PopoverTrigger` | Trigger button — re-export of Radix PopoverTrigger |
| `PopoverContent` | Content panel — renders `.popover-content` class |

## Props — PopoverContent

| Prop | Type | Default | Description |
|---|---|---|---|
| `align` | `"start" \| "center" \| "end"` | `"center"` | Alignment relative to the trigger |
| `sideOffset` | `number` | `4` | Gap in pixels between trigger and popover |
| `...rest` | `ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>` | — | All Radix Popover Content props |

## Accessibility

- Renders `role="dialog"` with `aria-modal="false"` — non-modal, so it does not trap focus.
- Escape closes the popover and returns focus to the trigger.
- `PopoverTrigger` wires `aria-expanded` and `aria-haspopup="dialog"` automatically.
- Keyboard: Tab moves through focusable elements inside the popover.

## Composition

```tsx
// Popover with form fields
<Popover>
  <PopoverTrigger asChild>
    <Button variant="secondary">Filter</Button>
  </PopoverTrigger>
  <PopoverContent style={{ width: "280px" }}>
    <Label htmlFor="status">Status</Label>
    <Select>
      <SelectTrigger id="status"><SelectValue placeholder="All" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="open">Open</SelectItem>
        <SelectItem value="closed">Closed</SelectItem>
      </SelectContent>
    </Select>
  </PopoverContent>
</Popover>
```

## See also

- [DropdownMenu](./DropdownMenu.md) — for action lists (not form fields).
- [Dialog](./Dialog.md) — for modal content that requires focus trap.
- [ProductSwitcher](../shell/ProductSwitcher.md) — uses Popover internally.
