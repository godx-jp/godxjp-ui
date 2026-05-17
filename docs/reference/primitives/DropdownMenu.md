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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@godxjp/ui"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Issue</DropdownMenuLabel>
    <DropdownMenuItem onSelect={() => handleEdit()}>Edit</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => handleAssign()}>Assign</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onSelect={() => handleDelete()} className="text-destructive">
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Exports

| Export | Description |
|---|---|
| `DropdownMenu` | Root |
| `DropdownMenuTrigger` | Trigger element |
| `DropdownMenuContent` | Menu panel |
| `DropdownMenuItem` | Clickable menu row |
| `DropdownMenuLabel` | Non-interactive section label |
| `DropdownMenuSeparator` | Thin divider between groups |
| `DropdownMenuCheckboxItem` | Checkbox-style menu item |
| `DropdownMenuRadioGroup` | Container for radio menu items |
| `DropdownMenuRadioItem` | Radio-style menu item |
| `DropdownMenuSub` | Nested submenu root |
| `DropdownMenuSubTrigger` | Submenu trigger item |
| `DropdownMenuSubContent` | Submenu panel |

## Props — DropdownMenuContent

| Prop | Type | Default | Description |
|---|---|---|---|
| `align` | `"start" \| "center" \| "end"` | `"center"` | Alignment relative to trigger |
| `sideOffset` | `number` | `4` | Gap in pixels from trigger |

## Props — DropdownMenuItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `onSelect` | `(event: Event) => void` | — | Called when item is selected (also closes the menu) |
| `disabled` | `boolean` | `false` | Disables the item |
| `inset` | `boolean` | `false` | Adds left padding for icon alignment without an icon |

## Accessibility

- `DropdownMenuContent` renders `role="menu"`.
- `DropdownMenuItem` renders `role="menuitem"`.
- Keyboard: Arrow Down / Up moves between items. Enter or Space activates. Escape closes.
- `DropdownMenuTrigger` sets `aria-expanded` and `aria-haspopup="menu"`.
- Focus returns to the trigger on close.
- WCAG 2.1 SC 1.4.3: text in menu items meets 4.5:1 contrast.

## Composition

```tsx
// Nested submenu
<DropdownMenuSub>
  <DropdownMenuSubTrigger>More actions</DropdownMenuSubTrigger>
  <DropdownMenuSubContent>
    <DropdownMenuItem>Export CSV</DropdownMenuItem>
    <DropdownMenuItem>Export JSON</DropdownMenuItem>
  </DropdownMenuSubContent>
</DropdownMenuSub>
```

## See also

- [Button](./Button.md) — `asChild` pattern for trigger.
- [Popover](./Popover.md) — non-action floating panels.
- [Select](./Select.md) — single-value form select.
