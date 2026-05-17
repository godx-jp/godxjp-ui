---
title: "Menu"
description: "Persistent navigation list (sidebar / nav bar) with selection state — distinct from DropdownMenu (Radix overlay action menu)."
diataxis: reference
audience: [developer]
status: stable
last-updated: 2026-05-18
lang: en
library: "@godxjp/ui"
library_version: 3.0.0
---

# Menu

> Persistent navigation list — for sidebars and top-bar navigation, with selection state.

## When to use Menu vs DropdownMenu

| Need | Use |
|---|---|
| Always-visible sidebar / nav bar with selection | **Menu** |
| Trigger-bound popover with one-shot action items | **DropdownMenu** |

Menu is the persistent navigation surface; DropdownMenu is the Radix overlay action menu. Vocabulary per cardinal rule 23 §B: `orientation`, `value` / `defaultValue` / `onValueChange` (Radix-style selection mirroring Tabs / Select).

## Usage

```tsx
import { Menu, MenuItem, MenuGroup, MenuDivider } from "@godxjp/ui"

<Menu defaultValue="dashboard">
  <MenuItem value="dashboard" icon={<HomeIcon />}>ダッシュボード</MenuItem>
  <MenuItem value="employees" icon={<UsersIcon />} extra="38">従業員</MenuItem>
  <MenuItem value="reports" icon={<ChartIcon />}>レポート</MenuItem>
  <MenuDivider />
  <MenuGroup label="管理">
    <MenuItem value="stores">店舗管理</MenuItem>
    <MenuItem value="permissions">権限</MenuItem>
    <MenuItem value="settings" icon={<SettingsIcon />}>設定</MenuItem>
  </MenuGroup>
</Menu>
```

## Props

### `Menu`

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Axis of stack |
| `value` | `string` | — | Controlled selected item value |
| `defaultValue` | `string` | — | Uncontrolled initial selection |
| `onValueChange` | `(value: string) => void` | — | Called when selection changes |
| `...rest` | `Omit<ComponentProps<"ul">, "onChange">` | — | Standard `<ul>` props |

### `MenuItem`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | Item key — matched against the Menu's `value` |
| `disabled` | `boolean` | `false` | Disable interaction |
| `icon` | `ReactNode` | — | Leading icon slot |
| `extra` | `ReactNode` | — | Trailing slot (badge count, kbd hint, …) |
| `...rest` | `Omit<ComponentProps<"button">, "value">` | — | Standard `<button>` props (including `onClick`) |

### `MenuGroup`

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | Group title |
| `...rest` | `ComponentProps<"div">` | — | Standard `<div>` props |

### `MenuDivider`

A horizontal separator. Accepts `ComponentProps<"hr">`.

## Accessibility

- Root renders `<ul role="menu">` with `aria-orientation`. Each item is `<button role="menuitem">` inside `<li role="none" style={{ display: "contents" }}>`.
- Selection state binds to `data-state="selected"` on the active item — pair with CSS that also adjusts contrast, never colour alone, per WCAG SC 1.4.1.
- `MenuGroup` renders `<div role="group">` with `aria-label={label}` when `label` is a string. The wrapper is intentionally not an `<li>` to avoid invalid `<li>` → `<li>` nesting.
- Keyboard: native Tab order through `<button>` items; Enter / Space activate. For full WAI-ARIA APG menu keyboard semantics (Arrow keys, Home / End) pair with custom roving-tab-index logic.
- For collapsible navigation patterns, manage `aria-expanded` on the trigger that opens / closes the Menu so screen readers know the state.

## Composition

```tsx
// Sidebar nav inside an AppShell
<div style={{ width: 240, border: "1px solid var(--border)", borderRadius: 6 }}>
  <Menu defaultValue="dashboard">
    <MenuItem value="dashboard" icon={<HomeIcon />}>ダッシュボード</MenuItem>
    <MenuItem value="orders">注文管理</MenuItem>
    <MenuDivider />
    <MenuGroup label="管理">
      <MenuItem value="users">ユーザー</MenuItem>
      <MenuItem value="legacy" disabled>旧バージョン（廃止予定）</MenuItem>
    </MenuGroup>
  </Menu>
</div>

// Controlled — wire to router
function NavMenu() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <Menu
      value={location.pathname}
      onValueChange={(v) => navigate(v)}
    >
      <MenuItem value="/">ダッシュボード</MenuItem>
      <MenuItem value="/orders">注文管理</MenuItem>
    </Menu>
  )
}
```

## See also

- [DropdownMenu](./DropdownMenu.md) — trigger-bound action menu.
- [Tabs](./Tabs.md) — shares the `value` / `onValueChange` vocabulary for selection.
- [Sidebar](../shell/Sidebar.md) — typical host for a vertical Menu.
- Source: [`src/components/navigation/Menu.tsx`](../../../src/components/navigation/Menu.tsx)
