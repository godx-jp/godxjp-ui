---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: ProjectSwitcher
status: stable
audience: [developer, agent]
---

# ProjectSwitcher

> Cross-product project picker with recent project history and search filtering.

## Usage

```tsx
import { ProjectSwitcher } from "@godxjp/ui/components/shell"

<ProjectSwitcher
  trigger={
    <Button variant="ghost">
      {activeProject?.name ?? "Select project…"}
    </Button>
  }
  activeProductId={activeProduct.id}
  activeProjectId={activeProject?.id}
  recent={recentProjects}
  onSelect={(project, product) => {
    setActiveProject(project)
    setTweak("tenant", product.tenant)
  }}
  open={projectOpen}
  onOpenChange={setProjectOpen}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `ReactNode` | required | Trigger element (wrapped with `PopoverTrigger asChild`) |
| `activeProductId` | `string` | — | ID of the currently active product — used for the `✓` marker |
| `activeProjectId` | `string` | — | ID of the currently active project — used for the `✓` marker |
| `recent` | `RecentProject[]` | `[]` | Up to 3 recently visited projects shown before search results |
| `products` | `ForgeProduct[]` | `PRODUCTS` | All available products + their projects |
| `onSelect` | `(project: ForgeProject, product: ForgeProduct) => void` | required | Called when a project row is selected |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state changes |

## Types

### RecentProject

```ts
interface RecentProject {
  productId: string
  projectId: string
}
```

## Default behavior

- Displays up to 3 recent projects at the top (resolved from `products` by `productId` + `projectId`).
- Search filters all products' projects by `name` and `stack`.
- Results are grouped by product so the visual hierarchy is clear.
- Selecting a project in a different product returns both the project and its owning product to `onSelect`.
- Auto-focuses the search input on open.

## Accessibility

- Same Radix Popover semantics as `ProductSwitcher`.
- Project rows are `<button>` elements.
- Recent items show a clock icon (decorative, `aria-hidden`).
- `data-active` marks the active project/product row visually.
- Escape closes the popover.

## See also

- [ProductSwitcher](./ProductSwitcher.md).
- [Topbar](./Topbar.md) — `onProjectOpen` triggers ProjectSwitcher.
- [Reference: types — ForgeProject, ForgeProduct](../types.md).
