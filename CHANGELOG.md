# Changelog

All notable changes to `@godxjp/ui` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Tooling (monorepo — repo-internal, not shipped to consumers)

- **MCP↔library drift guard** (`pnpm check:mcp-sync`, `scripts/check-mcp-sync.mjs`). Fails CI
  if a component catalogued in `@godxjp/ui-mcp` (`mcp/src/data/components.ts`) names a component
  the library no longer exports (rename/removal → stale agent guidance). Wired into `verify` and
  `verify:release`. The lib and the MCP stay **separate published packages** (browser dep vs Node
  server — merging would force the MCP SDK into every consumer bundle); this keeps them honest.
- **Coordinated release** (`pnpm release`, `scripts/release.mjs`). `pnpm release --ui <bump>
  --mcp <bump>` publishes `@godxjp/ui` and/or `@godxjp/ui-mcp` in lockstep (refuses a dirty tree,
  runs `verify:release`, bumps, publishes, commits) so the two packages are never published out
  of step by hand. Independent version lines (ui 6.x, mcp 0.x); only the *act* is coordinated.

## [6.12.0] - 2026-06-02

### Changed

- **`godxjp-ui-audit` (the `ui:audit` checker) now catches more consumer mistakes:** raw `<input>`
  and `<button>` (were missing — only `<select>`/`<table>`/`<textarea>` were checked), hand-rolled
  `<Card className="p-4">` padding, and — via a new whole-file structural check — a bare `<Card>`
  whose body is not wrapped in `<CardContent>` (renders flush). New rule ids: `no-raw-input`,
  `no-raw-button`, `card-manual-padding`, `card-needs-content`.

## [6.11.0] - 2026-06-01

### Changed

- **One `Select` for every single-select (Ant-style).** `Select` is now polymorphic: keep using
  the compound API (`<Select><SelectTrigger/><SelectContent><SelectItem/></Select>`) for full
  control, OR pass `options` / `loadOptions` for a data-driven select. `showSearch` toggles a
  searchable combobox (the `SearchSelect` engine — async + infinite scroll) vs a plain no-search
  Radix listbox; both support optgroup grouping and `renderOption`. Fully backward-compatible —
  existing compound usage is unchanged.
- **`SearchSelect` is deprecated** in favour of `<Select options showSearch>` (it remains the
  engine behind it and is still exported). `Autocomplete` likewise stays a deprecated wrapper.
  So the family is now: **`Select`** (everything) · `SearchSelect`/`Autocomplete` (deprecated
  aliases).

## [6.10.0] - 2026-06-01

### Changed

- **`SearchSelect` now supersedes `Autocomplete`.** It accepts EITHER a static `options` array
  (client-side filter) OR async `loadOptions`, so it covers both small static lists and remote
  datasets. Added a `renderOption` prop for custom per-option rendering (Ant-Design style).
  Option labels are no longer bold (normal weight); group headings use the standard
  muted-foreground tone (same as command-group headings).
- **`Autocomplete` is deprecated** — reimplemented as a thin wrapper over `SearchSelect` (static
  options) so there is a single combobox implementation. Its API is unchanged.

### Props

- Added `EmptyMessageProp` to the vocabulary (shared by `SearchSelect` + `Autocomplete`).
- De-duplicated the inline `name: string` concept across data-entry props to the vocabulary
  `NameProp`. Registered `SearchSelect*` + `EmptyMessageProp` in the props registry.

## [6.9.0] - 2026-06-01

### Added

- **`SearchSelect`** (`@godxjp/ui/data-entry`) — an async, searchable single-select combobox.
  Unlike `Autocomplete` (static options), it loads options REMOTELY via a `loadOptions({ query,
page })` fetcher with a debounced search box, infinite-scroll pagination, and loading/empty
  states. Options support **optgroup-style grouping** (`option.group` renders a heading) and a
  `sublabel`. Data-agnostic (REST/GraphQL/cached client), form-submittable via `name`,
  e2e-testable via `data-testid` (+ `${data-testid}-option-${value}` per option).

## [6.8.0] - 2026-06-01

### Added

- **`Topbar` `productMenu` / `projectMenu`.** Pass a `DropdownMenuContent` to turn the
  product (or project) chip into a real dropdown switcher — e.g. an active-entity picker —
  instead of just firing `onProductOpen`.

### Changed

- **`Topbar` project chip is hidden when unused.** It now only renders when `project` or
  `projectMenu` is set, so apps that don't use it no longer get a dead "Pick project"
  placeholder.

## [6.7.0] - 2026-06-01

### Added

- **`Tooltip`** (`@godxjp/ui/feedback`) — a portaled, self-contained Radix tooltip
  (`Tooltip` / `TooltipTrigger` / `TooltipContent`, plus an optional `TooltipProvider`).
  No app-level provider required; controllable via `open`/`onOpenChange`.

### Changed

- **Sidebar collapsed rail interaction.** Hovering (or focusing) a collapsed item now shows
  its label as a **tooltip**; **clicking** a group opens its submenu as a portaled menu (a leaf
  navigates). Previously both opened on hover, which conflated the tooltip and the menu.

## [6.6.0] - 2026-06-01

### Fixed

- **Sidebar collapsed flyout no longer clipped.** The hover/focus flyout (label tooltip for
  leaves, submenu for groups) now renders through a portaled Radix `Popover` to the page root,
  so it escapes the sidebar's `overflow:hidden` instead of being cut off. It also opens reliably
  on hover and keyboard focus.
- **Sidebar rows are full width.** `.sb-nav-item` is now `width:100%`, so a collapsible group
  trigger (nested inside the `Collapsible` wrapper) fills the rail and its chevron sits flush at
  the right edge — matching flat rows.

## [6.5.0] - 2026-06-01

### Fixed

- **`DataTable` now renders its empty + loading states.** The `empty` and `loading` props
  were declared but never used, so a table with no rows showed a bare header. An empty
  `data` now renders a built-in `EmptyState` (or the custom `empty` node if provided), and
  `loading` renders a loading row — both spanning all columns. No page-level
  `data.length === 0 ? <EmptyState/> : <DataTable/>` guard is needed anymore.

### Added

- `dataTable.empty` / `dataTable.loading` i18n strings (en/ja/vi).

## [6.4.0] - 2026-06-01

### Added

- **`Sidebar` submenus.** `SidebarItem` now accepts `children` — a nested item renders a
  collapsible group (Radix `Collapsible`) using the existing `sb-nav-group-trigger` /
  `sb-chevron` / `sb-nav-sub` / `sb-nav-item--sub` design. The **parent reads active when any
  descendant is active** and the group auto-opens to reveal the active child.
- **Collapsed-rail flyout tooltips.** When the sidebar is collapsed, hovering (or keyboard-
  focusing) a leaf shows its label as a flyout tooltip, and a group reveals its submenu as a
  flyout menu — so collapsed items are identifiable and reachable. Replaces the native `title`
  attribute; no new dependency.

## [6.3.0] - 2026-06-01

### Changed

- **`DatePicker`, `TimePicker`, `DateRangePicker` are now WAI-ARIA combobox inputs.**
  The value lives on a real, typeable `<input>` (ISO-8601 `yyyy-MM-dd` for the date
  pickers, canonical 24h `HH:mm` for `TimePicker`) instead of a button-only popover.
  This makes the controls **form-submittable**, screen-reader friendly, and natively
  **e2e-testable by filling the input** — no hidden mirror elements. The calendar /
  time-column / range popover remains as the visual affordance and stays in sync with
  typing. Prop APIs are backward-compatible (same `value` / `onChange`); the rendered
  element changes from a `<button>` to an `<input>`, so consumers asserting the old
  button text should target the input value instead.

### Added

- **`name` prop** on `DatePicker`, `TimePicker`, and `DateRangePicker` for native form
  submission. `DateRangePicker` emits `${name}_from` / `${name}_to` ISO fields.
- **`toIsoDate(date)`** in `@godxjp/ui` datetime helpers — formats a calendar `Date` to
  an ISO-8601 `yyyy-MM-dd` string from its local Y/M/D.

## [6.2.0] - 2026-06-01

### Added

- **`ColumnDef.hiddenOnMobile`** — a `DataTable` column can now be hidden below
  the `md` breakpoint (`hidden md:table-cell`), keeping mobile tables readable.
- **`CardStat.inverse`** + **sign-aware delta tone** — a `delta` starting with
  `+` renders in the success tone and `-` / `−` in the destructive tone;
  `inverse` flips that for metrics where lower is better.
- **`DataTable` horizontal scroll-fade** — a subtle gradient affordance appears
  at the scroll edge so it's clear the table scrolls horizontally.

### Changed

- **Empty `DataTable` headers auto-hide.** A column whose `header` is empty
  (an icon / action column) no longer paints the grey header band — its header
  cell is transparent (`[data-slot="table-head"][data-empty]`), so the empty
  header visually disappears instead of showing a blank grey block.
- Internal refinements to `AppProvider` and `ResponsiveGrid`; added regression
  tests for `Card`/`DataTable`.

## [6.1.2] - 2026-05-31

### Fixed

- **`DataTable` cells default to `white-space: nowrap`.** A narrow column could
  collapse CJK cell text to one character per line; cells now stay on one line
  and the existing `overflow-x: auto` scroll container scrolls instead of
  crushing. A column that needs wrapping opts in with a `whitespace-normal`
  class on `col.width`.

## [6.1.1] - 2026-05-31

### Fixed

- **`StatusBadge` / `Badge` never wrap their label** (`white-space: nowrap`),
  especially inside narrow `DataTable` cells (status / scope columns).

## [6.1.0] - 2026-05-31

### Added

- **`StatusBadge` `tone` + `icon` override props** (escape hatch). `tone`
  (`success` | `warning` | `destructive` | `info` | `neutral`) overrides the
  auto-resolved colour for localized labels and categorical tiers that aren't
  in the built-in English lifecycle map; `icon={null}` hides the glyph (for
  tier / category badges). Exports `StatusBadgeTone`. Backward compatible.

[Unreleased]: https://github.com/godx-jp/godxjp-ui/compare/v6.12.0...HEAD
[6.12.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.11.0...v6.12.0
[6.11.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.10.0...v6.11.0
[6.10.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.9.0...v6.10.0
[6.9.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.8.0...v6.9.0
[6.8.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.7.0...v6.8.0
[6.7.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.6.0...v6.7.0
[6.6.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.5.0...v6.6.0
[6.5.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.4.0...v6.5.0
[6.4.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.3.0...v6.4.0
[6.3.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.2.0...v6.3.0
[6.2.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.1.2...v6.2.0
[6.1.2]: https://github.com/godx-jp/godxjp-ui/compare/v6.1.1...v6.1.2
[6.1.1]: https://github.com/godx-jp/godxjp-ui/compare/v6.1.0...v6.1.1
[6.1.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.0.2...v6.1.0
