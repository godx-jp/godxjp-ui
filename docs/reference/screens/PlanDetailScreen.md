---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: PlanDetailScreen
status: stable
audience: [developer, agent]
---

# PlanDetailScreen

> Single PDCA plan detail view with phase tabs, hypothesis, metrics, risks, and linked tasks.

## Usage

```tsx
import { PlanDetailScreen } from "@godxjp/ui/components/screens"

<PlanDetailScreen planId="PDCA-Q2-001" onBack={() => navigate("/plans")} />
```

## Required props / data shape

| Prop | Type | Description |
|---|---|---|
| `planId` | `string` | ID of the plan to display |
| `onBack` | `() => void` | Called when the back button is clicked |

The screen uses fixture data keyed by `planId`. Each plan detail contains:

```ts
interface PlanDetail {
  id: string
  title: string
  phase: "plan" | "do" | "check" | "act"
  health: "ok" | "at-risk" | "off-track"
  owner: string
  due: string
  progress: number
  hypothesis: string
  metrics: string[]
  risks: string[]
  linkedTasks: { id: string; title: string; status: string }[]
}
```

## Layout

```
[page-header: back button + plan ID + title]
[Phase indicator strip: Plan → Do → Check → Act (current highlighted)]
[2-col grid]
  [Left: Hypothesis | Success metrics | Risks]
  [Right: Linked tasks list | Decision log]
```

## See also

- [PlansScreen](./PlansScreen.md) — list view that navigates here.
- [IssueDetailScreen](./IssueDetailScreen.md) — pattern reference for detail screens.
