---
diataxis: index
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer, agent]
---

# Screens reference

Screens are full-page template components ready to render for common GoDX views.
They accept domain data props and render a complete page layout using GoDX primitives.

Import from `@godxjp/ui/components/screens`.

| Screen | Description |
|---|---|
| [DashboardScreen](./DashboardScreen.md) | Product-level KPI dashboard |
| [PlansScreen](./PlansScreen.md) | PDCA plan kanban grid |
| [IssuesScreen](./IssuesScreen.md) | Issue list with status tabs |
| [WikiScreen](./WikiScreen.md) | Document viewer |
| [PlanDetailScreen](./PlanDetailScreen.md) | Single PDCA plan detail |
| [IssueDetailScreen](./IssueDetailScreen.md) | Single issue detail with comments |
| [ProjectsListScreen](./ProjectsListScreen.md) | Project index table |
| [IdeasScreen](./IdeasScreen.md) | Shape Up ideas board |

Screens use fixture data for initial renders. Replace fixture data with live API calls by passing the appropriate props.
