---
diataxis: explanation
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer]
---

# Overview

## What @godxjp/ui is

`@godxjp/ui` is the single source of visual truth for the GoDX platform. Every
service frontend that runs on GoDX — admin-platform, forge-service, console-service,
me-service, chat-service, knowledge-service, agent-service, and any operator-added
service — inherits its design system from this one package. No service reimplements
a button, dialog, sidebar, or design token.

The package delivers four things:

1. **Design tokens** — a CSS custom property system in OKLCH that covers color,
   typography, spacing, radius, motion, and density. One CSS import makes a page
   brand-compliant. Switching to dark mode or a tenant accent is a single attribute
   change on `<html>`.

2. **Primitive components** — ~23 React components (Button, Dialog, Table, Select, etc.),
   each backed by a Radix UI primitive for keyboard navigation and ARIA, and styled
   exclusively via token CSS classes.

3. **Shell compositions** — AppShell, Sidebar, Topbar, CommandPalette, TweaksPanel,
   ProductSwitcher, ProjectSwitcher — the full GoDX portal chrome. Services compose
   these in their `App.tsx` to get the canonical three-pane layout.

4. **Pre-built screens** — DashboardScreen, PlansScreen, IssuesScreen, WikiScreen,
   PlanDetailScreen, IssueDetailScreen, ProjectsListScreen, IdeasScreen — full-page
   templates for common GoDX views.

Beyond UI components, v3 also ships a zero-config toolchain: ESLint config, Prettier
config, TypeScript base, and Vitest base — so services can reduce per-service
configuration boilerplate to one-liners.

## Who @godxjp/ui is for

The primary consumers are GoDX platform service frontends. Each service frontend
declares `@godxjp/ui` as a dependency and imports from its sub-path exports. The
package is also publishable to npm for external godx-adjacent projects that want
to build with the same visual language.

## What @godxjp/ui is not

`@godxjp/ui` is not a general-purpose UI kit competing with Material UI, Chakra UI,
or Ant Design. It has strong opinions about:

- **Token-first CSS** — visual values live in CSS custom properties; Tailwind utilities
  that re-encode values are forbidden. This makes dark mode, density, and per-tenant
  theming mechanical CSS flips rather than JavaScript recalculation.
- **Japanese enterprise aesthetics** — heading sizes are deliberately smaller than
  Western defaults (h1 = 20 px). The density default is 32 px (SmartHR / freee
  density). The primary locale is Japanese.
- **One i18next instance** — every service and every shell primitive share the same
  i18next singleton. A language switcher in the TweaksPanel changes the language
  for the entire page, including primitives inside the shell.
- **One product per project** — the visual layer is designed for multi-tenant SaaS
  (one product per `[data-tenant]` attribute) rather than multi-brand per page.

An operator who needs none of these constraints should use a general-purpose library.
An operator deploying on GoDX must use `@godxjp/ui`.

## See also

- [Design philosophy](./design-philosophy.md) — the three founding pillars.
- [Architecture](./architecture.md) — how the atoms, molecules, and organisms relate.
- [BRAND.md](../../BRAND.md) — the visual language specification.
