---
title: "Menu"
description: "Persistent navigation list (sidebar / nav bar) with selection state — distinct from DropdownMenu (Radix overlay action menu)."
diataxis: reference
audience:
  - developer
status: draft
last-updated: 2026-05-17
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Menu

Navigation list with selection state. Supports horizontal + vertical orientations; selection mirrors Tabs/Select vocabulary (`value` / `defaultValue` / `onValueChange`). Distinct from `<DropdownMenu>` (Radix overlay action menu): Menu is the persistent navigation surface (sidebar / nav bar); DropdownMenu is the trigger-bound popover.

## Import

```ts
import { Menu, MenuItem, MenuGroup, MenuDivider } from "@godxjp/ui/components/primitives"
```

## Props (`Menu`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Axis of stack |
| `value` | `string` | — | Controlled selected item value |
| `defaultValue` | `string` | — | Uncontrolled initial selection |
| `onValueChange` | `(value: string) => void` | — | Called when selection changes |

## Props (`MenuItem`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `value *` | `string` | — | Item key |
| `icon` | `ReactNode` | — | Leading icon |
| `disabled` | `boolean` | `false` | Disable interaction |
| `extra` | `ReactNode` | — | Trailing slot |

## Example

```tsx
<Menu defaultValue="dashboard">
  <MenuItem value="dashboard" icon={<HomeIcon />}>ダッシュボード</MenuItem>
  <MenuItem value="orders">注文管理</MenuItem>
  <MenuDivider />
  <MenuGroup label="管理">
    <MenuItem value="users">ユーザー</MenuItem>
  </MenuGroup>
</Menu>
```

## Related

- Story catalogue: [`Menu` stories](../../../src/stories/navigation/Menu.stories.tsx)
- Source: [`src/components/navigation/Menu.tsx`](../../../src/components/navigation/Menu.tsx)
- Cardinal rule 23 §B prop vocabulary: [`CLAUDE.md` §23.B](../../../CLAUDE.md#23)

## Status

`draft` — auto-generated stub. Detailed prop docs / accessibility notes / design rationale still to be filled in.
