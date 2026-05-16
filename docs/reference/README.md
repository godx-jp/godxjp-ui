---
diataxis: index
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer, agent]
---

# Reference

Reference docs are information-oriented. Each file is a complete, accurate description
of one export. Use them to look up a prop table, a token name, or a type signature.

## Primitives

Atomic UI building blocks, each backed by a Radix UI primitive or a semantic HTML element.

| Component | Status | Radix backing |
|---|---|---|
| [Badge](./primitives/Badge.md) | stable | — |
| [Button](./primitives/Button.md) | stable | `@radix-ui/react-slot` |
| [Card](./primitives/Card.md) | stable | — |
| [Input / Textarea](./primitives/Input.md) | stable | — |
| [Label](./primitives/Label.md) | stable | `@radix-ui/react-label` |
| [Tabs](./primitives/Tabs.md) | stable | `@radix-ui/react-tabs` |
| [Avatar](./primitives/Avatar.md) | stable | — |
| [Separator](./primitives/Separator.md) | stable | `@radix-ui/react-separator` |
| [Popover](./primitives/Popover.md) | stable | `@radix-ui/react-popover` |
| [DropdownMenu](./primitives/DropdownMenu.md) | stable | `@radix-ui/react-dropdown-menu` |
| [Calendar](./primitives/Calendar.md) | stable | `react-day-picker` |
| [TimeInput](./primitives/TimeInput.md) | stable | — |
| [Dialog](./primitives/Dialog.md) | stable | `@radix-ui/react-dialog` |
| [Sheet](./primitives/Sheet.md) | stable | `@radix-ui/react-dialog` |
| [AlertDialog](./primitives/AlertDialog.md) | stable | `@radix-ui/react-alert-dialog` |
| [Select](./primitives/Select.md) | stable | `@radix-ui/react-select` |
| [Switch](./primitives/Switch.md) | stable | `@radix-ui/react-switch` |
| [Checkbox](./primitives/Checkbox.md) | stable | `@radix-ui/react-checkbox` |
| [Table](./primitives/Table.md) | stable | — |
| [Combobox](./primitives/Combobox.md) | stable | `cmdk` + Popover |
| [Toaster](./primitives/Toaster.md) | stable | `sonner` |
| [Skeleton](./primitives/Skeleton.md) | stable | — |
| [Breadcrumb](./primitives/Breadcrumb.md) | stable | — |

## Shell

Organism-level compositions that form the portal chrome.

| Component | Description |
|---|---|
| [AppShell](./shell/AppShell.md) | Three-pane grid: sidebar + topbar + main |
| [Sidebar](./shell/Sidebar.md) | Left navigation with product chip + section groups |
| [Topbar](./shell/Topbar.md) | Header bar with breadcrumb chips + search + tweaks |
| [CommandPalette](./shell/CommandPalette.md) | ⌘K command dialog (cmdk-backed) |
| [TweaksPanel](./shell/TweaksPanel.md) | Right-side drawer for density / theme / tenant / locale |
| [ProductSwitcher](./shell/ProductSwitcher.md) | Popover dropdown for switching active product |
| [ProjectSwitcher](./shell/ProjectSwitcher.md) | Cross-product project picker with recent history |

## Screens

Full-page templates ready to render for common GoDX views.

| Screen | Description |
|---|---|
| [DashboardScreen](./screens/DashboardScreen.md) | KPI strip + activity feed + quick actions |
| [PlansScreen](./screens/PlansScreen.md) | PDCA plan kanban / list |
| [IssuesScreen](./screens/IssuesScreen.md) | Issue board with filters |
| [WikiScreen](./screens/WikiScreen.md) | Documentation viewer |
| [PlanDetailScreen](./screens/PlanDetailScreen.md) | Single PDCA plan detail |
| [IssueDetailScreen](./screens/IssueDetailScreen.md) | Single issue detail |
| [ProjectsListScreen](./screens/ProjectsListScreen.md) | Project index table |
| [IdeasScreen](./screens/IdeasScreen.md) | Shape Up ideas board |

## Hooks

| Hook | Description |
|---|---|
| [useTweaks](./hooks/useTweaks.md) | Persistent density / theme / tenant / locale state |

## Catalogues

| File | Description |
|---|---|
| [tokens.md](./tokens.md) | Every CSS custom property grouped by semantic family |
| [i18n.md](./i18n.md) | Locale keys, fallback rules, `addResourceBundle` pattern |
| [exports.md](./exports.md) | Every `package.json` `exports` entry |
| [types.md](./types.md) | Every exported TypeScript type and interface |
