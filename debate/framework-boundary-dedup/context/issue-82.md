Add missing core primitives (Avatar, Separator, Progress, Toggle, Accordion, ContextMenu, InputOTP, …)

## Summary

While migrating a production app from a previous shadcn/Radix-based shared UI library to **`@godxjp/ui` v6.12**, we found a number of **low-level primitives that a general UI framework is normally expected to ship** are currently absent, which forced us to vendor them locally.

This issue requests adding the ones that **genuinely belong to a UI framework** (we deliberately left out app-specific things like app layouts, i18n providers, locale switchers and domain widgets such as calendar/RBAC — those rightly live in the app).

All items below are standard Radix/community primitives, so they should fit the existing `components/ui` layer and design tokens with minimal effort.

> Already present in v6 (verified, **not** requested): `Collapsible`, `Tooltip`, `Popover`, `Command`, `Breadcrumb`, `Sheet`, `DialogConfirm`, `ColorPicker`, `Upload`.

## Requested components

### P1 — basic primitives most design systems ship

- [ ] **Avatar** (`Avatar` / `AvatarImage` / `AvatarFallback`) — Radix Avatar
- [ ] **Separator** — Radix Separator
- [ ] **Progress** — Radix Progress
- [ ] **Skeleton** — a generic `<Skeleton>` primitive (v6 only exposes `SkeletonCard` / `SkeletonTable` / `SkeletonRows` / `SkeletonDetail`, but not the underlying block)
- [ ] **Toggle** / **ToggleGroup** — Radix Toggle / Toggle Group
- [ ] **AspectRatio** — Radix Aspect Ratio

### P2 — common overlays & navigation

- [ ] **Accordion** — Radix Accordion
- [ ] **ContextMenu** — Radix Context Menu
- [ ] **HoverCard** — Radix Hover Card
- [ ] **Menubar** — Radix Menubar
- [ ] **NavigationMenu** — Radix Navigation Menu
- [ ] **Drawer** — bottom-sheet (vaul); distinct from the existing side `Sheet`
- [ ] **Resizable** panels (`ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle`) — react-resizable-panels
- [ ] **Carousel** — embla

### P3 — form inputs

- [ ] **InputOTP** — OTP / 2FA code input
- [ ] **Combobox** (single + multi / autocomplete)
- [ ] **PasswordInput** — text input with show/hide toggle
- [ ] **TimeInput** — a time value field (v6 has `TimeFormatPicker` but not a time input)
- [ ] **Rating**
- [ ] **TagInput**

### Hooks

- [ ] **useIsMobile** / **useMediaQuery** — responsive breakpoint hook

### Optional / low priority

- [ ] Composable **AlertDialog** parts. `DialogConfirm` already covers the common destructive-confirm case, but the lower-level composable variant is sometimes useful.

## Context

- Migrating from `@dxs-platform/dxs-pkg-ui` (a broad shadcn kitchen-sink) → `@godxjp/ui` v6.
- v6's higher-level/opinionated direction (DataTable, Transfer, TreeSelect, Steps, FilterBar, φ-based tokens…) is great; this request is only about filling the **primitive** layer back in so consumers don't have to re-vendor standard building blocks.

Happy to send PRs for any of these if that helps — just let us know the preferred conventions.
