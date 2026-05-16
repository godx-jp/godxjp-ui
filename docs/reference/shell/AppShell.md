---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: AppShell
status: stable
audience: [developer, agent]
---

# AppShell

> Canonical three-pane CSS Grid chrome for every GoDX portal.

## Usage

```tsx
import { AppShell, Sidebar, Topbar } from "@godxjp/ui/components/shell"

<AppShell
  sidebarCollapsed={false}
  sidebar={<Sidebar … />}
  topbar={<Topbar … />}
>
  {/* page content */}
</AppShell>
```

## Layout slots

```
┌───────────────────────────────────────┐
│          app-topbar (header)          │  ← `topbar` prop
├──────────────┬────────────────────────┤
│  app-sidebar │     app-main          │  ← `sidebar` prop / `children`
│  (aside)     │     (scroll area)     │
└──────────────┴────────────────────────┘
```

The grid dimensions use CSS custom properties from tokens:

| CSS variable | Default value | Purpose |
|---|---|---|
| `--sidebar-width` | 256 px | Width when expanded |
| `--sidebar-collapsed-width` | 64 px | Width when collapsed |
| `--header-height` | 48 px | Topbar height |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `sidebar` | `ReactNode` | required | Sidebar content |
| `topbar` | `ReactNode` | required | Topbar content |
| `children` | `ReactNode` | required | Page content area |
| `sidebarCollapsed` | `boolean` | `false` | When `true`, `data-collapsed` is set on the root div and the sidebar shrinks to `--sidebar-collapsed-width` |

## Default behavior

- The root `div` renders with `class="app-root"`.
- The sidebar renders as `<aside class="app-sidebar">`.
- The topbar renders as `<header class="app-topbar">`.
- The main area renders as `<main class="app-main">`.
- CSS grid columns transition between expanded and collapsed state using `--transition-base`.

## Customisation hooks

- Control collapse state via `sidebarCollapsed` prop — typically driven by `useTweaks().tweaks.sidebarCollapsed`.
- Inject per-page breadcrumbs or actions via the `rightSlot` prop of `Topbar` (not via AppShell directly).
- Add a `data-tenant`, `data-theme`, or `data-density` attribute to the `<html>` element (via `useTweaks`) to change the visual layer without touching AppShell.

## Accessibility

- `<aside>` and `<header>` are landmark elements — screen readers provide quick navigation to these regions.
- `<main>` is the main landmark — required by WCAG 2.1 SC 1.3.6 (Identify Purpose).
- Do not nest additional `<main>` elements inside `AppShell`.

## See also

- [Sidebar](./Sidebar.md)
- [Topbar](./Topbar.md)
- [How-to: Compose shell](../../how-to/compose-shell.md)
- [Tutorial 03: Shell composition](../../tutorials/03-shell-composition.md)
