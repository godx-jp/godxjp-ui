---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: ProjectsListScreen
status: stable
audience: [developer, agent]
---

# ProjectsListScreen

> Project index table listing all projects under the active product.

## Usage

```tsx
import { ProjectsListScreen } from "@godxjp/ui/components/screens"
import { PRODUCTS } from "@godxjp/ui/data"

<ProjectsListScreen
  product={PRODUCTS[0]!}
  onOpenProject={(id) => navigate(`/projects/${id}`)}
/>
```

## Required props / data shape

| Prop | Type | Description |
|---|---|---|
| `product` | `ForgeProduct` | Active product — its `projects` array is used as the row data |
| `onOpenProject` | `(id: string) => void` | Called when a project row is clicked |

Each row in the table corresponds to a `ForgeProject`:

```ts
interface ForgeProject {
  id: string
  name: string
  stack: string
  kind: ProjectKind    // "service" | "web" | "desktop" | "workstation" | "mobile" | "library" | "infra"
  devs: number
  status: ProjectStatus  // "active" | "review" | "planning" | "archived"
  branch: string
  lastCommit: string
  openIssues: number
  prs: number
  sandbox: boolean
}
```

## Layout

```
[page-header: product name + "Projects" + "+ New project" button]
[Table: Name | Stack | Kind | Status | Branch | Issues | PRs | Sandbox | Last commit]
```

## See also

- [Table](../primitives/Table.md) — the table primitive used in this screen.
- [Badge](../primitives/Badge.md) — status badges in the table.
- [Reference: types — ForgeProject, ForgeProduct](../types.md).
