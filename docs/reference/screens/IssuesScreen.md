---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: IssuesScreen
status: stable
audience: [developer, agent]
---

# IssuesScreen

> Issue list with status tabs (Open / In Review / Done) and per-issue summary rows.

## Usage

```tsx
import { IssuesScreen } from "@godxjp/ui/components/screens"

<IssuesScreen onOpenIssue={(id) => navigate(`/issues/${id}`)} />
```

## Required props / data shape

| Prop | Type | Description |
|---|---|---|
| `onOpenIssue` | `(id: string) => void` | Called when an issue row is clicked |

The screen uses built-in fixture issues. Each issue has:

```ts
interface IssueRow {
  id: string
  title: string
  status: "open" | "in-review" | "done"
  priority: "critical" | "high" | "medium" | "low"
  assignee: string
  points: number
  labels: string[]
}
```

## Layout

```
[page-header: "Issues" + "+ New" button]
[Tabs: Open | In Review | Done]
[Issue rows: priority badge + title + labels + assignee + points]
```

## See also

- [IssueDetailScreen](./IssueDetailScreen.md) — destination when a row is clicked.
- [Tabs](../primitives/Tabs.md) — status tabs.
- [Badge](../primitives/Badge.md) — priority indicators.
