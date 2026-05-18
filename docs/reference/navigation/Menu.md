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

| Need                                             | Use              |
| ------------------------------------------------ | ---------------- |
| Always-visible sidebar / nav bar with selection  | **Menu**         |
| Trigger-bound popover with one-shot action items | **DropdownMenu** |

Menu is the persistent navigation surface; DropdownMenu is the Radix overlay action menu. Vocabulary per cardinal rule 23 §B: `orientation`, `value` / `defaultValue` / `onValueChange` (Radix-style selection mirroring Tabs / Select).

## Usage

```tsx
import { Menu, Menu, Menu, Menu } from "@godxjp/ui";

<Menu defaultValue="dashboard">
  <Menu value="dashboard" icon={<HomeIcon />}>
    ダッシュボード
  </Menu>
  <Menu value="employees" icon={<UsersIcon />} extra="38">
    従業員
  </Menu>
  <Menu value="reports" icon={<ChartIcon />}>
    レポート
  </Menu>
  <Menu />
  <Menu label="管理">
    <Menu value="stores">店舗管理</Menu>
    <Menu value="permissions">権限</Menu>
    <Menu value="settings" icon={<SettingsIcon />}>
      設定
    </Menu>
  </Menu>
</Menu>;
```

## Props

### `Menu`

| Prop            | Type                                     | Default      | Description                    |
| --------------- | ---------------------------------------- | ------------ | ------------------------------ |
| `orientation`   | `"horizontal" \| "vertical"`             | `"vertical"` | Axis of stack                  |
| `value`         | `string`                                 | —            | Controlled selected item value |
| `defaultValue`  | `string`                                 | —            | Uncontrolled initial selection |
| `onValueChange` | `(value: string) => void`                | —            | Called when selection changes  |
| `...rest`       | `Omit<ComponentProps<"ul">, "onChange">` | —            | Standard `<ul>` props          |

### `Menu`

| Prop       | Type                                      | Default  | Description                                     |
| ---------- | ----------------------------------------- | -------- | ----------------------------------------------- |
| `value`    | `string`                                  | required | Item key — matched against the Menu's `value`   |
| `disabled` | `boolean`                                 | `false`  | Disable interaction                             |
| `icon`     | `ReactNode`                               | —        | Leading icon slot                               |
| `extra`    | `ReactNode`                               | —        | Trailing slot (badge count, kbd hint, …)        |
| `...rest`  | `Omit<ComponentProps<"button">, "value">` | —        | Standard `<button>` props (including `onClick`) |

### `Menu`

| Prop      | Type                    | Default | Description            |
| --------- | ----------------------- | ------- | ---------------------- |
| `label`   | `ReactNode`             | —       | Group title            |
| `...rest` | `ComponentProps<"div">` | —       | Standard `<div>` props |

### `Menu`

A horizontal separator. Accepts `ComponentProps<"hr">`.

## Accessibility

- Root renders `<ul role="menu">` with `aria-orientation`. Each item is `<button role="menuitem">` inside `<li role="none" style={{ display: "contents" }}>`.
- Selection state binds to `data-state="selected"` on the active item — pair with CSS that also adjusts contrast, never colour alone, per WCAG SC 1.4.1.
- `Menu` renders `<div role="group">` with `aria-label={label}` when `label` is a string. The wrapper is intentionally not an `<li>` to avoid invalid `<li>` → `<li>` nesting.
- Keyboard: native Tab order through `<button>` items; Enter / Space activate. For full WAI-ARIA APG menu keyboard semantics (Arrow keys, Home / End) pair with custom roving-tab-index logic.
- For collapsible navigation patterns, manage `aria-expanded` on the trigger that opens / closes the Menu so screen readers know the state.

## Composition

```tsx
// Sidebar nav inside an AppShell
<div style={{ width: 240, border: "1px solid var(--border)", borderRadius: 6 }}>
  <Menu defaultValue="dashboard">
    <Menu value="dashboard" icon={<HomeIcon />}>
      ダッシュボード
    </Menu>
    <Menu value="orders">注文管理</Menu>
    <Menu />
    <Menu label="管理">
      <Menu value="users">ユーザー</Menu>
      <Menu value="legacy" disabled>
        旧バージョン（廃止予定）
      </Menu>
    </Menu>
  </Menu>
</div>;

// Controlled — wire to router
function NavMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Menu value={location.pathname} onValueChange={(v) => navigate(v)}>
      <Menu value="/">ダッシュボード</Menu>
      <Menu value="/orders">注文管理</Menu>
    </Menu>
  );
}
```

## See also

- [DropdownMenu](./DropdownMenu.md) — trigger-bound action menu.
- [Tabs](./Tabs.md) — shares the `value` / `onValueChange` vocabulary for selection.
- [Sidebar](../shell/Sidebar.md) — typical host for a vertical Menu.
- Source: [`src/components/navigation/Menu.tsx`](../../../src/components/navigation/Menu.tsx)
