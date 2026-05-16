---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Sidebar
status: stable
audience: [developer, agent]
---

# Sidebar

> Left navigation panel with product chip, section groups, and nav items.

## Usage

```tsx
import { Sidebar } from "@godxjp/ui/components/shell"
import { LayoutDashboard, Bug } from "lucide-react"
import type { SidebarSection } from "@godxjp/ui/components/shell"

const SECTIONS: SidebarSection[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "issues",    label: "Issues",    icon: Bug, badge: 12 },
    ],
  },
]

<Sidebar
  activeId="dashboard"
  onSelect={(id) => navigate(id)}
  sections={SECTIONS}
  product={activeProduct}
  collapsed={false}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `activeId` | `string` | required | ID of the currently active nav item |
| `onSelect` | `(id: string) => void` | required | Called when a nav item is clicked |
| `sections` | `SidebarSection[]` | required | Navigation structure |
| `product` | `ForgeProduct` | required | Active product shown in the top product chip |
| `onProductClick` | `() => void` | — | Called when the product chip is clicked — open `ProductSwitcher` |
| `collapsed` | `boolean` | `false` | When `true`, labels are hidden and only icons render |
| `footer` | `ReactNode` | — | Optional content at the bottom of the sidebar |

## Layout slots

- **Top** — product chip button (`sb-product`). Calls `onProductClick`.
- **Middle** — scrollable nav area with `SidebarSection` groups.
- **Bottom** — optional `footer` slot (`sb-footer`).

## Types

### SidebarSection

```ts
interface SidebarSection {
  label?: string       // Section heading — hidden when sidebar is collapsed
  items: SidebarItem[]
}
```

### SidebarItem

```ts
interface SidebarItem {
  id: string
  label: string
  icon: ComponentType<{ size?: number }>   // lucide-react icon or equivalent
  badge?: string | number                   // numeric badge shown after label
  disabled?: boolean                        // dims and disables the item
}
```

## Accessibility

- Nav items render as `<button>` with `aria-current="page"` on the active item.
- Disabled items use `aria-disabled="true"`.
- The nav section renders `role="navigation"`.
- The product chip uses `aria-label={product.name}`.
- In collapsed mode, items show only the icon — add `title` or `aria-label` to items for tooltip / SR support.
- WCAG 2.1 SC 1.4.3: nav item text and active indicator meet contrast requirements.

## See also

- [AppShell](./AppShell.md) — the slot that receives Sidebar.
- [ProductSwitcher](./ProductSwitcher.md) — opened by `onProductClick`.
- [Reference: types — ForgeProduct, SidebarSection, SidebarItem](../types.md)
