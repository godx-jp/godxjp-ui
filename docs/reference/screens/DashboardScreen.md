---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: DashboardScreen
status: stable
audience: [developer, agent]
---

# DashboardScreen

> Product-level dashboard with KPI strip, recent activity feed, and quick-actions card.

## Usage

```tsx
import { DashboardScreen } from "@godxjp/ui/components/screens"
import { PRODUCTS } from "@godxjp/ui/data"

<DashboardScreen product={PRODUCTS[0]!} />
```

## Required props / data shape

| Prop | Type | Description |
|---|---|---|
| `product` | `ForgeProduct` | The active product — used for KPI calculations and page title |

The screen computes:
- `totalIssues` — sum of `openIssues` across all `product.projects`
- `totalPrs` — sum of `prs` across all `product.projects`

Activity rows and KPI values (deployments, uptime) use built-in fixture data in v3 — replace with live API data in your service.

## Layout

```
[page-header: product name + description]
[KPI strip: 4 columns — Active devs | Open issues | Deployments | Uptime]
[2-col grid]
  [Recent activity: log-line list] [Quick actions: button group]
```

## Data substitution

The screen uses a `ACTIVITY` constant for the activity feed. To use live data, do not use `DashboardScreen` directly — compose the page from `Card`, `Table`, and `Badge` primitives instead, calling your own API hooks.

## See also

- [PlansScreen](./PlansScreen.md)
- [Reference: DashboardScreen source](../../../../src/components/screens/DashboardScreen.tsx)
- [Reference: types — ForgeProduct](../types.md)
