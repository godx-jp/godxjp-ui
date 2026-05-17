---
title: "Topbar"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Topbar
status: stable
audience: [developer, agent]
lang: en
---

# Topbar

> Header bar with sidebar collapse toggle, product/project breadcrumb chips, search button, and tweaks trigger.

## Usage

```tsx
import { Topbar } from "@godxjp/ui/components/shell"

<Topbar
  product={activeProduct}
  project={activeProject}
  collapsed={tweaks.sidebarCollapsed}
  onToggleCollapsed={() => setTweak("sidebarCollapsed", !tweaks.sidebarCollapsed)}
  onProductOpen={() => setProductOpen(true)}
  onProjectOpen={() => setProjectOpen(true)}
  onSearchOpen={() => setSearchOpen(true)}
  onTweaksOpen={() => setTweaksOpen(true)}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `product` | `ForgeProduct` | required | Active product — shown in the product chip |
| `project` | `ForgeProject \| null` | — | Active project — shown in the project chip. `null` renders an empty dashed chip |
| `collapsed` | `boolean` | `false` | Current sidebar collapsed state — controls the icon on the toggle button |
| `onToggleCollapsed` | `() => void` | — | Called when the sidebar toggle button is clicked |
| `onProductOpen` | `() => void` | — | Called when the product chip is clicked |
| `onProjectOpen` | `() => void` | — | Called when the project chip is clicked |
| `onSearchOpen` | `() => void` | — | Called when the search button is clicked (also triggered by ⌘K via CommandPalette) |
| `onTweaksOpen` | `() => void` | — | Called when the tweaks button is clicked |
| `rightSlot` | `ReactNode` | — | Optional content rendered between the search button and tweaks button |

## Layout slots

```
[collapse toggle] [product chip] / [project chip]  ··· [search]  [rightSlot?]  [tweaks]
```

- **Collapse toggle** — `PanelLeftClose` or `PanelLeftOpen` icon button. Only renders when `onToggleCollapsed` is provided.
- **Product chip** — `tb-chip` with product color mark + name + caret.
- **Separator** — `/` glyph.
- **Project chip** — `tb-chip` with project name + caret. Renders as an "empty" dashed chip when `project` is `null`.
- **Search** — `tb-search` button that shows `⌘K` hint.
- **rightSlot** — optional injectable slot.
- **Tweaks** — `SlidersHorizontal` icon button. Only renders when `onTweaksOpen` is provided.

## Accessibility

- The collapse toggle uses `aria-pressed={collapsed}` and `aria-label` from `t("shell.sidebarCollapse")`.
- Product and project chips use `aria-label` with the product/project name.
- The search button's `⌘K` hint is inside a `<kbd>` element.
- Topbar renders as `<header class="app-topbar">` inside `AppShell` — a landmark region.
- WCAG 2.1 SC 2.4.6 (Headings and Labels): chips clearly identify the current context.

## See also

- [AppShell](./AppShell.md) — receives Topbar as the `topbar` prop.
- [ProductSwitcher](./ProductSwitcher.md) — opened by `onProductOpen`.
- [ProjectSwitcher](./ProjectSwitcher.md) — opened by `onProjectOpen`.
- [CommandPalette](./CommandPalette.md) — handles the search shortcut independently.
- [TweaksPanel](./TweaksPanel.md) — opened by `onTweaksOpen`.
