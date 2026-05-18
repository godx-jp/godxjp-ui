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
import { Popover, Popover, Popover } from "@godxjp/ui";

<Popover>
  <Popover asChild>
    <Button variant="ghost">Options</Button>
  </Popover>
  <Popover>
    <p>Popover content goes here.</p>
  </Popover>
</Popover>;
```

## Exports

| Export           | Description                                        |
| ---------------- | -------------------------------------------------- |
| `Popover`        | Root — re-export of Radix Popover Root             |
| `Popover` | Trigger button — re-export of Radix Popover |
| `Popover` | Content panel — renders `.popover-content` class   |

## Props — Popover

| Prop         | Type                                                        | Default    | Description                               |
| ------------ | ----------------------------------------------------------- | ---------- | ----------------------------------------- |
| `align`      | `"start" \| "center" \| "end"`                              | `"center"` | Alignment relative to the trigger         |
| `sideOffset` | `number`                                                    | `4`        | Gap in pixels between trigger and popover |
| `...rest`    | `ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>` | —          | All Radix Popover Content props           |

## Accessibility

- Renders `role="dialog"` with `aria-modal="false"` — non-modal, so it does not trap focus.
- Escape closes the popover and returns focus to the trigger.
- `Popover` wires `aria-expanded` and `aria-haspopup="dialog"` automatically.
- Keyboard: Tab moves through focusable elements inside the popover.

## Composition

```tsx
// Popover with form fields
<Popover>
  <Popover asChild>
    <Button variant="secondary">Filter</Button>
  </Popover>
  <Popover style={{ width: "280px" }}>
    <Label htmlFor="status">Status</Label>
    <Select>
      <Select trigger id="status">
        <Select value placeholder="All" />
      </Select trigger>
      <Select content>
        <Select option value="open">Open</Select option>
        <Select option value="closed">Closed</Select option>
      </Select content>
    </Select>
  </Popover>
</Popover>
```

## See also

- [DropdownMenu](../navigation/DropdownMenu.md) — for action lists (not form fields).
- [Dialog](../feedback/Dialog.md) — for modal content that requires focus trap.
- [ProductSwitcher](../shell/ProductSwitcher.md) — uses Popover internally.
