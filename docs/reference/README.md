---
title: "Reference"
diataxis: index
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer, agent]
lang: en
status: published
---

# Reference

Reference docs are information-oriented. Each file is a complete,
accurate description of one export. Use them to look up a prop
table, a token name, or a type signature.

For BINDING vocabulary (prop names, axes, dist surface), see the
[`new-docs/`](../../new-docs/00-index.md) index — the reference
pages below cite the canonical rule for each surface.

## Primitives

Atomic UI building blocks, grouped per cardinal rule 27 into six
group folders. The barrel `@godxjp/ui/components/primitives`
re-exports every group. Reference pages exist for the surfaces
listed below; missing pages are tracked as TODO follow-on.

| Component | Status | Backing |
|---|---|---|
| [AlertDialog](./primitives/AlertDialog.md) | stable | `@radix-ui/react-alert-dialog` |
| [Avatar](./primitives/Avatar.md) | stable | — |
| [Badge](./primitives/Badge.md) | stable | — |
| [Breadcrumb](./primitives/Breadcrumb.md) | stable | — |
| [Button](./primitives/Button.md) | stable | `@radix-ui/react-slot` |
| [Calendar](./primitives/Calendar.md) | stable | `react-aria-components` + `@internationalized/date` |
| [Card](./primitives/Card.md) | stable | — |
| [Checkbox](./primitives/Checkbox.md) | stable | `@radix-ui/react-checkbox` |
| [Combobox](./primitives/Combobox.md) | stable | `cmdk` + Popover |
| [Dialog](./primitives/Dialog.md) | stable | `@radix-ui/react-dialog` |
| [DropdownMenu](./primitives/DropdownMenu.md) | stable | `@radix-ui/react-dropdown-menu` |
| [Input / Textarea](./primitives/Input.md) | stable | — |
| [Label](./primitives/Label.md) | stable | `@radix-ui/react-label` |
| [Popover](./primitives/Popover.md) | stable | `@radix-ui/react-popover` |
| [Select](./primitives/Select.md) | stable | `@radix-ui/react-select` |
| [Separator](./primitives/Separator.md) | stable | `@radix-ui/react-separator` |
| [Sheet](./primitives/Sheet.md) | stable | `@radix-ui/react-dialog` |
| [Skeleton](./primitives/Skeleton.md) | stable | — |
| [Switch](./primitives/Switch.md) | stable | `@radix-ui/react-switch` |
| [Table](./primitives/Table.md) | stable | — |
| [Tabs](./primitives/Tabs.md) | stable | `@radix-ui/react-tabs` |
| [TimeInput](./primitives/TimeInput.md) | stable | `react-aria-components` |
| [Toaster](./primitives/Toaster.md) | stable | `sonner` |

The framework ships **61 primitives** across the six groups; a
backfill PR will add reference pages for every primitive missing
above (Alert, Anchor, AutoComplete, Carousel, Cascader, CheckboxGroup,
Checklist, Col, Collapse, ColorPicker, DateTimePicker, Descriptions,
Empty, Field, Flex, Form, Grid, IconButton, Image, InputNumber,
InputPassword, InputSearch, List, LocaleTabs, Masonry, Menu,
PageHeader, Pagination, Popconfirm, Progress, QRCode, Radio, Rate,
Result, Row, SegmentedControl, Slider, Space, Spinner, Statistic,
Steps, Tag, Textarea, Timeline, Tooltip, Tour, Transfer, Tree,
TreeSelect, Typography, Watermark — see
[02 — consumer contract §A-2](../../new-docs/02-consumer-contract.md)
for the full per-group catalogue).

## Shell

Organism-level compositions that form the portal chrome (8).

| Component | Description |
|---|---|
| [AppShell](./shell/AppShell.md) | Three-pane grid: sidebar + topbar + main |
| [Sidebar](./shell/Sidebar.md) | Left navigation with product chip + section groups |
| [Topbar](./shell/Topbar.md) | Header bar with breadcrumb chips + search + tweaks |
| [CommandPalette](./shell/CommandPalette.md) | ⌘K command dialog (cmdk-backed) |
| [TweaksPanel](./shell/TweaksPanel.md) | Right-side drawer for theme axes (theme / accent / density / font-size) + locale |
| [ProductSwitcher](./shell/ProductSwitcher.md) | Popover dropdown for switching active product |
| [ProjectSwitcher](./shell/ProjectSwitcher.md) | Cross-product project picker with recent history |
| PageContent | Outer wrapper around the main content region (reference page TODO) |

## Hooks

| Hook | Description |
|---|---|
| [useTweaks](./hooks/useTweaks.md) | Persistent theme axes state (theme / accent / density / font-size + locale) |

Additional hooks (`useBreakpoint`, `useDebouncedValue`,
`usePreferences`) shipped from `@godxjp/ui/hooks` — reference pages
TODO.

## Catalogues

| File | Description |
|---|---|
| [tokens.md](./tokens.md) | Every CSS custom property grouped by semantic family |
| [i18n.md](./i18n.md) | Locale keys, fallback rules, `addResourceBundle` pattern |
| [exports.md](./exports.md) | Every `package.json` `exports` entry (8 runtime entries + CSS + toolchain) |
| [types.md](./types.md) | Every exported TypeScript type and interface |
