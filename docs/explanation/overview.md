---
title: "Overview"
diataxis: explanation
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer]
lang: en
status: published
---

# Overview

## What @godxjp/ui is

`@godxjp/ui` is the single source of visual truth for the GoDX
platform. Every service frontend that runs on GoDX — admin-platform,
forge-service, console-service, me-service, chat-service,
knowledge-service, agent-service, and any operator-added service —
inherits its design system from this one package. No service
reimplements a button, dialog, sidebar, or design token.

The package delivers four things:

1. **Design tokens** — a CSS custom property system in OKLCH that
   covers color, typography, spacing, radius, motion, density, and
   breakpoints. One CSS import (`@godxjp/ui/tailwind.css`) makes a
   page brand-compliant. Switching theme axes (theme / accent /
   density / font-size) is a single `data-*` attribute change on
   `<html>`.

2. **Primitive components** — 73 React surfaces grouped under
   `src/components/<group>/` (general / layout / data-display /
   data-entry / feedback / navigation per cardinal rule 27), each
   backed by a Radix UI / cmdk / sonner / react-aria-components
   primitive where keyboard navigation, ARIA, or focus management
   is needed (cardinal rule 14), styled exclusively via token CSS
   classes.

3. **Shell compositions** — AppShell, Sidebar, Topbar, CommandPalette,
   TweaksPanel, ProductSwitcher, ProjectSwitcher, PageContent — the
   full GoDX portal chrome. Services compose these in their
   `App.tsx` to get the canonical three-pane layout.

4. **Composites** — Upload, ImageUpload, AvatarUploader, MediaUpload
   (with bundled media-service client), LocaleInput, and the
   Calendar app (MiniMonth / TimeGrid / Month/Week/Day/Agenda views)
   — widgets that wrap multiple primitives for cross-consumer reuse.

Example screens (Dashboard, Issues, Plans, Wiki, etc.) live under
`src/stories/examples/` as Storybook "Usage Cases" — illustrative
compositions only, never imported by consumers. Consumers copy-paste
and modify per app.

Beyond UI components, v3 also ships a zero-config toolchain: ESLint
config, Prettier config, TypeScript base, and Vitest base — so
services can reduce per-service configuration boilerplate to
one-liners.

## Who @godxjp/ui is for

The primary consumers are GoDX platform service frontends. Each
service frontend declares `@godxjp/ui` as a dependency and imports
from its sub-path exports (eight today — see
[02 — consumer contract §A](../specs/02-consumer-contract.md)).
The package is also publishable to npm for external godx-adjacent
projects that want to build with the same visual language.

## What @godxjp/ui is not

`@godxjp/ui` is not a general-purpose UI kit competing with Material
UI, Chakra UI, or Ant Design. It has strong opinions about:

- **Token-first CSS** — visual values live in CSS custom properties;
  Tailwind utilities that re-encode values are forbidden (cardinal
  rules 2 + 15). This makes dark mode, density, and accent theming
  mechanical CSS flips rather than JavaScript recalculation.
- **Japanese enterprise aesthetics** — heading sizes are deliberately
  smaller than Western defaults (h1 = 20 px). The density default is
  32 px (SmartHR / freee density). The primary locale is Japanese.
- **One i18next instance** — every service and every shell primitive
  share the same i18next singleton (cardinal rule 5). A language
  switcher in the TweaksPanel changes the language for the entire
  page, including primitives inside the shell.
- **No service-specific anything** — per cardinal rule 19 the
  framework is generic. Per-deployment brand color flows through
  `[data-accent="<palette>"]`, NOT through `[data-tenant]` blocks
  inside the framework. Consumers register their own palettes in
  their `theme.css`.

An operator who needs none of these constraints should use a
general-purpose library. An operator deploying on GoDX must use
`@godxjp/ui`.

## See also

- [Design philosophy](./design-philosophy.md) — the three founding pillars.
- [Architecture](./architecture.md) — how the atoms, molecules, and organisms relate.
- [Specs index](../specs/README.md) — full binding-rule trigger table.
- [BRAND.md](../../BRAND.md) — the visual language specification.
