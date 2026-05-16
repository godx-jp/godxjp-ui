---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: IssueDetailScreen
status: stable
audience: [developer, agent]
---

# IssueDetailScreen

> Single issue detail view with conversation, checklist, and metadata sidebar.

## Usage

```tsx
import { IssueDetailScreen } from "@godxjp/ui/components/screens"

<IssueDetailScreen issueId="GK-310" onBack={() => navigate("/issues")} />
```

## Required props / data shape

| Prop | Type | Description |
|---|---|---|
| `issueId` | `string` | ID of the issue to display |
| `onBack` | `() => void` | Called when the back button is clicked |

The screen uses fixture data keyed by `issueId`. Each issue detail has:

```ts
interface IssueDetail {
  id: string
  title: string
  status: string
  priority: string
  assignee: string
  reviewer?: string
  labels: string[]
  milestone?: string
  points: number
  description: string
  comments: { author: string; when: string; body: string }[]
  checklist: { id: string; label: string; done: boolean }[]
}
```

## Layout

```
[page-header: back button + issue ID + title badge strip]
[Tabs: Conversation | Checklist | Code changes | History]
[2-col: content (tab panels)] [sidebar (assignee, reviewer, labels, milestone, points)]
```

## See also

- [IssuesScreen](./IssuesScreen.md) — list view.
- [Tabs](../primitives/Tabs.md).
- [Checkbox](../primitives/Checkbox.md) — used in checklist tab.
