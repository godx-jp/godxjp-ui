---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: IdeasScreen
status: stable
audience: [developer, agent]
---

# IdeasScreen

> Shape Up-style ideas board — idea cards with appetite, status, and vote counts.

## Usage

```tsx
import { IdeasScreen } from "@godxjp/ui/components/screens"

<IdeasScreen onOpenIdea={(id) => navigate(`/ideas/${id}`)} />
```

## Required props / data shape

| Prop | Type | Description |
|---|---|---|
| `onOpenIdea` | `(id: string) => void` | Called when an idea card is clicked |

The screen uses built-in fixture ideas. Each idea has:

```ts
interface IdeaCard {
  id: string
  title: string
  status: "raw" | "shaping" | "pitched" | "scheduled" | "building" | "shipped" | "rejected"
  appetite: "small" | "medium" | "big"   // 1 week / 2 weeks / 6 weeks
  author: string
  votes: number
  comments: number
  pitchedAt?: string
}
```

## Layout

```
[page-header: "Ideas (Shape Up)" + "+ New idea" button]
[Kanban columns: Raw | Shaping | Pitched | Scheduled | Building | Shipped]
  [Idea cards: title | appetite chip | votes | comment count | author]
```

The kanban uses the `.kanban` / `.kanban-col` / `.issue-card` CSS classes from `tokens-ext.css`.

## See also

- [PlansScreen](./PlansScreen.md) — promotes ideas to PDCA plans.
- [tokens.md](../tokens.md) — `.kanban` layout tokens.
