---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: PlansScreen
status: stable
audience: [developer, agent]
---

# PlansScreen

> PDCA plan kanban grid — list of plan cards grouped by phase with health badges.

## Usage

```tsx
import { PlansScreen } from "@godxjp/ui/components/screens"

<PlansScreen onOpenPlan={(id) => navigate(`/plans/${id}`)} />
```

## Required props / data shape

| Prop | Type | Description |
|---|---|---|
| `onOpenPlan` | `(id: string) => void` | Called when a plan card is clicked — navigate to plan detail |

The screen uses built-in `PLANS` fixture data for v3 rendering. Each plan has:

```ts
interface PlanCardData {
  id: string       // e.g. "PDCA-Q2-001"
  number: number
  title: string
  phase: "plan" | "do" | "check" | "act"
  health: "ok" | "at-risk" | "off-track"
  owner: string
  due: string      // ISO date string
  progress: number // 0–100 percentage
}
```

## Layout

```
[page-header: "PDCA Plans" title + "+ New" button]
[2-col grid of plan cards]
  [card: id badge + health badge | phase pill | title | owner + due + progress bar]
```

## See also

- [PlanDetailScreen](./PlanDetailScreen.md) — destination when a card is clicked.
- [Badge](../primitives/Badge.md) — health indicators.
