---
title: "DropdownMenu"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: DropdownMenu
status: stable
audience: [developer, agent]
lang: en
---

# DropdownMenu

> Keyboard-navigable action menu backed by `@radix-ui/react-dropdown-menu`.

## Usage

```tsx
import {
  DropdownMenu,
  DropdownMenu,
  DropdownMenu,
  DropdownMenu,
  DropdownMenu,
  DropdownMenu,
} from "@godxjp/ui";

<DropdownMenu>
  <DropdownMenu asChild>
    <Button variant="ghost">Actions</Button>
  </DropdownMenu>
  <DropdownMenu align="end">
    <DropdownMenu>Issue</DropdownMenu>
    <DropdownMenu onSelect={() => handleEdit()}>Edit</DropdownMenu>
    <DropdownMenu onSelect={() => handleAssign()}>Assign</DropdownMenu>
    <DropdownMenu />
    <DropdownMenu
      onSelect={() => handleDelete()}
      className="text-destructive"
    >
      Delete
    </DropdownMenu>
  </DropdownMenu>
</DropdownMenu>;
```

## Exports

| Export                     | Description                    |
| -------------------------- | ------------------------------ |
| `DropdownMenu`             | Root                           |
| `DropdownMenu`      | Trigger element                |
| `DropdownMenu`      | Menu panel                     |
| `DropdownMenu`         | Clickable menu row             |
| `DropdownMenu`        | Non-interactive section label  |
| `DropdownMenu`    | Thin divider between groups    |
| `DropdownMenuCheckboxItem` | Checkbox-style menu item       |
| `DropdownMenu`   | Container for radio menu items |
| `DropdownMenuRadioItem`    | Radio-style menu item          |
| `DropdownMenu`          | Nested submenu root            |
| `DropdownMenu`   | Submenu trigger item           |
| `DropdownMenu`   | Submenu panel                  |

## Props — DropdownMenu

| Prop         | Type                           | Default    | Description                   |
| ------------ | ------------------------------ | ---------- | ----------------------------- |
| `align`      | `"start" \| "center" \| "end"` | `"center"` | Alignment relative to trigger |
| `sideOffset` | `number`                       | `4`        | Gap in pixels from trigger    |

## Props — DropdownMenu

| Prop       | Type                     | Default | Description                                          |
| ---------- | ------------------------ | ------- | ---------------------------------------------------- |
| `onSelect` | `(event: Event) => void` | —       | Called when item is selected (also closes the menu)  |
| `disabled` | `boolean`                | `false` | Disables the item                                    |
| `inset`    | `boolean`                | `false` | Adds left padding for icon alignment without an icon |

## Accessibility

- `DropdownMenu` renders `role="menu"`.
- `DropdownMenu` renders `role="menuitem"`.
- Keyboard: Arrow Down / Up moves between items. Enter or Space activates. Escape closes.
- `DropdownMenu` sets `aria-expanded` and `aria-haspopup="menu"`.
- Focus returns to the trigger on close.
- WCAG 2.1 SC 1.4.3: text in menu items meets 4.5:1 contrast.

## Composition

```tsx
// Nested submenu
<DropdownMenu>
  <DropdownMenu>More actions</DropdownMenu>
  <DropdownMenu>
    <DropdownMenu>Export CSV</DropdownMenu>
    <DropdownMenu>Export JSON</DropdownMenu>
  </DropdownMenu>
</DropdownMenu>
```

## See also

- [Button](../general/Button.md) — `asChild` pattern for trigger.
- [Popover](../data-display/Popover.md) — non-action floating panels.
- [Select](../data-entry/Select.md) — single-value form select.
