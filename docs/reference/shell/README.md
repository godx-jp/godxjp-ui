---
diataxis: index
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer, agent]
---

# Shell reference

Shell components are organism-level compositions that form the portal chrome every GoDX service uses.

Import from `@godxjp/ui/components/shell`.

| Component | Description |
|---|---|
| [AppShell](./AppShell.md) | Three-pane CSS Grid: sidebar + topbar + main content area |
| [Sidebar](./Sidebar.md) | Left navigation with product chip and section groups |
| [Topbar](./Topbar.md) | Header bar with breadcrumb chips, search, and tweaks toggle |
| [CommandPalette](./CommandPalette.md) | ⌘K command dialog backed by cmdk |
| [TweaksPanel](./TweaksPanel.md) | Right-side drawer for density / theme / tenant / locale |
| [ProductSwitcher](./ProductSwitcher.md) | Popover dropdown for switching the active product |
| [ProjectSwitcher](./ProjectSwitcher.md) | Cross-product project picker with recent history |

**Rule:** Every GoDX service MUST use `AppShell` as its chrome layout. Hand-rolled CSS grid shells are rejected at review (CLAUDE.md hard rule #15).
