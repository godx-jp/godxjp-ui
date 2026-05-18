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
[`docs/specs/`](../specs/README.md) index — the reference
pages below cite the canonical rule for each surface.

## Component Groups

Atomic UI building blocks are documented in the same six groups as
`src/components/<group>/` and `src/stories/<group>/`. The barrel
`@godxjp/ui/components/primitives` re-exports every group.

| Group                           | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| [General](./general/)           | Action and typography primitives                    |
| [Layout](./layout/)             | Layout composition primitives                       |
| [Data display](./data-display/) | Read-only display and data presentation primitives  |
| [Data entry](./data-entry/)     | Input, form, and selection primitives               |
| [Feedback](./feedback/)         | Status, loading, modal, and notification primitives |
| [Navigation](./navigation/)     | Navigation and wayfinding primitives                |

Reference pages exist for the surfaces listed below; missing pages
are tracked as TODO follow-on.

| Component                                    | Status | Backing                                             |
| -------------------------------------------- | ------ | --------------------------------------------------- |
| [AlertDialog](./feedback/AlertDialog.md)     | stable | `@radix-ui/react-alert-dialog`                      |
| [Avatar](./data-display/Avatar.md)           | stable | —                                                   |
| [Badge](./data-display/Badge.md)             | stable | —                                                   |
| [Breadcrumb](./navigation/Breadcrumb.md)     | stable | —                                                   |
| [Button](./general/Button.md)                | stable | `@radix-ui/react-slot`                              |
| [Calendar](./data-display/Calendar.md)       | stable | `react-aria-components` + `@internationalized/date` |
| [Card](./data-display/Card.md)               | stable | —                                                   |
| [Checkbox](./data-entry/Checkbox.md)         | stable | `@radix-ui/react-checkbox`                          |
| [Dialog](./feedback/Dialog.md)               | stable | `@radix-ui/react-dialog`                            |
| [DropdownMenu](./navigation/DropdownMenu.md) | stable | `@radix-ui/react-dropdown-menu`                     |
| [Input / Textarea](./data-entry/Input.md)    | stable | —                                                   |
| [Label](./data-entry/Label.md)               | stable | `@radix-ui/react-label`                             |
| [Popover](./data-display/Popover.md)         | stable | `@radix-ui/react-popover`                           |
| [Select](./data-entry/Select.md)             | stable | `@radix-ui/react-select`                            |
| [Separator](./data-display/Separator.md)     | stable | `@radix-ui/react-separator`                         |
| [Sheet](./feedback/Sheet.md)                 | stable | `@radix-ui/react-dialog`                            |
| [Skeleton](./feedback/Skeleton.md)           | stable | —                                                   |
| [Switch](./data-entry/Switch.md)             | stable | `@radix-ui/react-switch`                            |
| [Table](./data-display/Table.md)             | stable | —                                                   |
| [Tabs](./navigation/Tabs.md)                 | stable | `@radix-ui/react-tabs`                              |
| [TimeInput](./data-entry/TimeInput.md)       | stable | `react-aria-components`                             |
| [Toaster](./feedback/Toaster.md)             | stable | `sonner`                                            |

The framework ships **73 primitives** across the six groups
(general 2 / layout 6 / data-display 23 / data-entry 24 /
feedback 11 / navigation 7); a backfill PR will add reference
pages for every primitive missing
above (Alert, Anchor, AutoComplete, Carousel, Cascader, CheckboxGroup,
Checklist, Col, Collapse, ColorPicker, DateTimePicker, Descriptions,
Empty, Field, Flex, Form, Grid, IconButton, Image, InputNumber,
InputPassword, InputSearch, List, LocaleTabs, Masonry, Menu,
PageHeader, Pagination, Popconfirm, Progress, QRCode, Radio, Rate,
Result, Row, SegmentedControl, Slider, Space, Spinner, Statistic,
Steps, Tag, Textarea, Timeline, Tooltip, Tour, Transfer, Tree,
TreeSelect, Typography, Watermark — see
[02 — consumer contract §A-2](../specs/02-consumer-contract.md)
for the full per-group catalogue).

## Shell

Organism-level compositions that form the portal chrome (8).

| Component                                     | Description                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| [AppShell](./shell/AppShell.md)               | Three-pane grid: sidebar + topbar + main                                         |
| [Sidebar](./shell/Sidebar.md)                 | Left navigation with product chip + section groups                               |
| [Topbar](./shell/Topbar.md)                   | Header bar with breadcrumb chips + search + tweaks                               |
| [CommandPalette](./shell/CommandPalette.md)   | ⌘K command dialog (cmdk-backed)                                                  |
| [TweaksPanel](./shell/TweaksPanel.md)         | Right-side drawer for theme axes (theme / accent / density / font-size) + locale |
| [ProductSwitcher](./shell/ProductSwitcher.md) | Popover dropdown for switching active product                                    |
| [ProjectSwitcher](./shell/ProjectSwitcher.md) | Cross-product project picker with recent history                                 |
| PageContent                                   | Outer wrapper around the main content region (reference page TODO)               |

## Hooks

| Hook                              | Description                                                                 |
| --------------------------------- | --------------------------------------------------------------------------- |
| [useTweaks](./hooks/useTweaks.md) | Persistent theme axes state (theme / accent / density / font-size + locale) |

Additional hooks (`useBreakpoint`, `useDebouncedValue`,
`useGodxConfig`) shipped from `@godxjp/ui/hooks` — reference pages
TODO.

## Catalogues

| File                       | Description                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| [tokens.md](./tokens.md)   | Every CSS custom property grouped by semantic family                       |
| [i18n.md](./i18n.md)       | Locale keys, fallback rules, `addResourceBundle` pattern                   |
| [exports.md](./exports.md) | Every `package.json` `exports` entry (8 runtime entries + CSS + toolchain) |
| [types.md](./types.md)     | Every exported TypeScript type and interface                               |
