# Changelog

All notable changes to `@godxjp/ui` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `SearchSelect` / data-driven `Select` options gain an `icon` field (avatar / flag / lucide node).
  It renders before the label in the option rows AND on the trigger once selected — so a picked
  account/person/country shows its icon at rest, not just plain label text. No `renderOption` needed
  for the common icon-with-label case.

## [13.6.0]

### Added

- `Button` gains a `count` prop — a trailing borderless counter pill for filter tabs / segmented
  toggles (e.g. "Chờ bay 18"). Formatted with `Intl.NumberFormat` in the active locale and styled per
  variant (translucent foreground on filled, muted fill on light), so you never nest a bordered
  `Badge` inside a bordered `Button` (which double-borders). Renders `0`; ignored under `asChild`.
- Inline clear (✕) for value-holding pickers: `DatePicker`, `DateRangePicker` and `TimePicker` gain
  an `allowClear` prop (default `true`) rendering an inline ✕ on the trigger that resets the value —
  consistent with the existing `Cascader` / `TreeSelect` affordance.
- `Input` and `Textarea` gain an opt-in `allowClear` prop (+ `onClear`) — an inline ✕ that clears the
  field while it holds text, working for both controlled and uncontrolled usage. Off by default, so
  existing inputs are unchanged.
- `SearchSelect` now exposes its clear control as an inline ✕ on the trigger (replacing the in-dropdown
  "clear" row), so a selection can be cleared without opening the list.

### Changed

- `TagInput` chips now sit on an 8px (`--space-2`) flex rhythm instead of relying on collapsed inline
  whitespace, fixing chips that rendered too close together.

## [12.1.0]

### Changed

- `SheetFooter` is now a pinned, full-bleed-bordered action bar with RIGHT-aligned actions (Ant Design
  Drawer footer) instead of stacked full-width buttons; `DialogFooter`/`AlertDialogFooter` right-align
  their actions too. Put a destructive / clear / reset action far-left with `className="mr-auto"`.
  New cardinal rule #41 "Drawer & dialog footer layout".

## [12.0.3]

### Fixed

- `SelectTrigger` is now full-width by default (`w-full`, matching the shadcn standard) instead of
  `w-fit`, so a `Select` inside a form / `FormField` fills the field like `Input`/`Textarea` (it was
  content-width, leaving ragged, misaligned forms). Inline/toolbar selects stay compact because their
  container constrains the width.

## [12.0.2]

### Fixed

- Interactive controls (input / select / button / date-picker, and DataTable rows) now keep a ≥44px
  tap target on touch devices via `@media (pointer: coarse)` — honouring the ≥44px touch-target rule
  (#24) regardless of density. Desktop (fine pointer) keeps the compact heights.

## [12.0.1]

### Fixed

- `Toolbar` / `ToolbarGroup` label is now vertically centered against its control â `.ui-toolbar-label`
  was a top-aligned block stretched to the control height, so filter labels sat above the input's
  vertical center.
- `CardContent flush` now zeroes vertical padding (not only `padding-bottom`) when it contains a
  `DataTable`, so a full-bleed table sits flush to the card's top edge (removes the empty band above
  the header row).

## [11.0.1]

### Changed

- `ui-audit` is now comment/doc-aware: it strips comments before scanning (so a JSDoc that says
  "Never a raw <input>" is not flagged), scopes the status-vs-variant rule to `Badge`/`Tag`/`StatCard`
  (Button/Alert/DropdownMenuItem use `variant` legitimately), and supports
  `ui-audit-disable-line|next-line <rule>` suppression directives â eliminating false positives while
  still catching real violations.

## [11.0.0]

International-standardization release: i18n (Intl/CLDR), accessibility (WAI-ARIA APG + WCAG 2.2 AA),
RTL, and a consolidated controlled-vocabulary API. See `docs/roadmap/international-standardization.md`.

### BREAKING

- Removed `Combobox`; use `Select` with `showSearch` (client filter) â same capability.
- Removed `SearchSelect` from the public API; it is now `Select`'s internal engine. Use
  `Select` with `showSearch` / `loadOptions`. Public option/load types are exported as
  `SelectOption` / `SelectLoadParams` / `SelectLoadResult`.
- Removed `CountrySelect`; build a country picker from `Select` + `Intl.DisplayNames` (see the
  `docs/data-entry/country-picker-recipe`).
- Removed `ChoiceField`; use `Field` (it was only an alias).
- Removed `LocalePicker`, `TimezonePicker`, `DateFormatPicker`, `TimeFormatPicker`; use the single
  `AppSettingPicker kind="locale" | "timezone" | "dateFormat" | "timeFormat"`.
- `Steps`: `current` â `value`, `initial` â `defaultValue`, `onChange` â `onValueChange`;
  `StepItem.subTitle` â `subtitle`, `StepItem.content` â `description`.
- `Pagination`: `current` â `value`, `onChange` â `onValueChange` (handler signature unchanged).
- `size` value `"default"` â `"md"` on `Switch`, `Steps`, `Select` (trigger), `Toggle`, `Card`
  (`Button` is unchanged â its `ButtonSizeProp` documents `"default"`).
- `SearchInput`: prop `onDebouncedChange` â `onSearchChange`.
- `Tabs`: `onValueChange` callback parameter renamed `key` â `value` (type-only).

### Added

- `AppSettingPicker` â one provider-bound `Select` for any single `AppProvider` setting (`kind`).
- Full internationalization: locale-correct number/currency/bytes via `Intl.NumberFormat`, CLDR
  plurals via `Intl.PluralRules`, country/language names via `Intl.DisplayNames`, `<html dir>` from
  the active locale (RTL-ready logical CSS), 12h hour-cycle in `TimePicker`.
- Accessibility pass across every composite (roles, keyboard, focus, labels, â¥24px targets) plus
  `vitest-axe` coverage; `DatePicker` / `DateRangePicker` gain uncontrolled `defaultValue`;
  `AppSettingPicker` forwards `ref` + accepts `name`.
- A mandatory `godxjp-ui-component` discipline skill; the prop-vocabulary guard now scans
  `src/components/**` so no public prop type escapes governance.

## [7.0.0]

### BREAKING

- Removed `ScanPanel`; migrate scan/upload placeholders to `EmptyState`, `Skeleton`, or a product-specific upload surface.
- Removed `CodeBadge`; migrate typed code chips to `Badge` with consumer-owned prefix/icon content.
- Removed `ShellApp`; compose production shells with `AppShell`, `Sidebar`, `Topbar`, and `Breadcrumb`.
- Removed `Menu`; use `Sidebar` directly for persistent left-rail navigation.
- Removed `MobileFrame`; use app/page layout primitives instead of the phone-frame wrapper.
- Renamed `KeyValueGrid` to `Descriptions`; migrate `KeyValueGrid.Item` to `Descriptions.Item`.
- Renamed `ProgressMeter` to `Progress`; import `Progress` from `@godxjp/ui/data-display`.
- Renamed `CardStat` to `StatCard`; keep rendering it directly in grids, not wrapped in `Card`.
- Merged `StatusBadge` into `Badge`; migrate `tone` to `variant`, use `status` for lifecycle mapping, and pass `icon={null}` for tier/category chips.
- Merged `TabsItems` into `Tabs`; pass `items={[{ value, label, content }]}` to `Tabs`.
- Merged `SwitchField` into `ChoiceField` + `Switch`; wrap `<Switch name="..." />` in `<ChoiceField id label description>`.
- `Sheet` is unchanged; a future `Drawer` will be a distinct bottom-sheet primitive.

### Added

- Added `Avatar`, `Separator`, base `Skeleton`, `Toggle`, `ToggleGroup`, `AspectRatio`, and `Progress`.

### Tooling (monorepo â repo-internal, not shipped to consumers)

- **Reverse drift guard** (`pnpm check:mcp-orphans`, `scripts/check-mcp-orphans.mjs`). The complement
  of the sync guard: every PUBLIC primary component must HAVE a `@godxjp/ui-mcp` catalog entry, else
  CI fails â so the catalog can't silently rot as new components ship (an uncatalogued component is
  one an agent searches for, doesn't find, and hand-rolls). Wired into `verify` + `verify:release`.
  Filling the 36 components it caught brought `@godxjp/ui-mcp` to **0.7.0**; **0.8.0** then enriched
  the remaining 44 core entries, so all **85 entries** now carry usage (DO/DON'T) / use-cases /
  related guidance â `get_component` fully teaches every component, not just lists its props.
- **MCPâlibrary drift guard** (`pnpm check:mcp-sync`, `scripts/check-mcp-sync.mjs`). Fails CI
  if a component catalogued in `@godxjp/ui-mcp` (`mcp/src/data/components.ts`) names a component
  the library no longer exports (rename/removal â stale agent guidance). Wired into `verify` and
  `verify:release`. The lib and the MCP stay **separate published packages** (browser dep vs Node
  server â merging would force the MCP SDK into every consumer bundle); this keeps them honest.
- **Coordinated release** (`pnpm release`, `scripts/release.mjs`). `pnpm release --ui <bump>
--mcp <bump>` publishes `@godxjp/ui` and/or `@godxjp/ui-mcp` in lockstep (refuses a dirty tree,
  runs `verify:release`, bumps, publishes, commits) so the two packages are never published out
  of step by hand. Independent version lines (ui 6.x, mcp 0.x); only the _act_ is coordinated.

## [6.12.0] - 2026-06-02

### Changed

- **`godxjp-ui-audit` (the `ui:audit` checker) now catches more consumer mistakes:** raw `<input>`
  and `<button>` (were missing â only `<select>`/`<table>`/`<textarea>` were checked), hand-rolled
  `<Card className="p-4">` padding, and â via a new whole-file structural check â a bare `<Card>`
  whose body is not wrapped in `<CardContent>` (renders flush). New rule ids: `no-raw-input`,
  `no-raw-button`, `card-manual-padding`, `card-needs-content`.

## [6.11.0] - 2026-06-01

### Changed

- **One `Select` for every single-select (Ant-style).** `Select` is now polymorphic: keep using
  the compound API (`<Select><SelectTrigger/><SelectContent><SelectItem/></Select>`) for full
  control, OR pass `options` / `loadOptions` for a data-driven select. `showSearch` toggles a
  searchable combobox (the `SearchSelect` engine â async + infinite scroll) vs a plain no-search
  Radix listbox; both support optgroup grouping and `renderOption`. Fully backward-compatible â
  existing compound usage is unchanged.
- **`SearchSelect` is deprecated** in favour of `<Select options showSearch>` (it remains the
  engine behind it and is still exported). `Autocomplete` likewise stays a deprecated wrapper.
  So the family is now: **`Select`** (everything) Â· `SearchSelect`/`Autocomplete` (deprecated
  aliases).

## [6.10.0] - 2026-06-01

### Changed

- **`SearchSelect` now supersedes `Autocomplete`.** It accepts EITHER a static `options` array
  (client-side filter) OR async `loadOptions`, so it covers both small static lists and remote
  datasets. Added a `renderOption` prop for custom per-option rendering (Ant-Design style).
  Option labels are no longer bold (normal weight); group headings use the standard
  muted-foreground tone (same as command-group headings).
- **`Autocomplete` is deprecated** â reimplemented as a thin wrapper over `SearchSelect` (static
  options) so there is a single combobox implementation. Its API is unchanged.

### Props

- Added `EmptyMessageProp` to the vocabulary (shared by `SearchSelect` + `Autocomplete`).
- De-duplicated the inline `name: string` concept across data-entry props to the vocabulary
  `NameProp`. Registered `SearchSelect*` + `EmptyMessageProp` in the props registry.

## [6.9.0] - 2026-06-01

### Added

- **`SearchSelect`** (`@godxjp/ui/data-entry`) â an async, searchable single-select combobox.
  Unlike `Autocomplete` (static options), it loads options REMOTELY via a `loadOptions({ query,
page })` fetcher with a debounced search box, infinite-scroll pagination, and loading/empty
  states. Options support **optgroup-style grouping** (`option.group` renders a heading) and a
  `sublabel`. Data-agnostic (REST/GraphQL/cached client), form-submittable via `name`,
  e2e-testable via `data-testid` (+ `${data-testid}-option-${value}` per option).

## [6.8.0] - 2026-06-01

### Added

- **`Topbar` `productMenu` / `projectMenu`.** Pass a `DropdownMenuContent` to turn the
  product (or project) chip into a real dropdown switcher â e.g. an active-entity picker â
  instead of just firing `onProductOpen`.

### Changed

- **`Topbar` project chip is hidden when unused.** It now only renders when `project` or
  `projectMenu` is set, so apps that don't use it no longer get a dead "Pick project"
  placeholder.

## [6.7.0] - 2026-06-01

### Added

- **`Tooltip`** (`@godxjp/ui/feedback`) â a portaled, self-contained Radix tooltip
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
  the right edge â matching flat rows.

## [6.5.0] - 2026-06-01

### Fixed

- **`DataTable` now renders its empty + loading states.** The `empty` and `loading` props
  were declared but never used, so a table with no rows showed a bare header. An empty
  `data` now renders a built-in `EmptyState` (or the custom `empty` node if provided), and
  `loading` renders a loading row â both spanning all columns. No page-level
  `data.length === 0 ? <EmptyState/> : <DataTable/>` guard is needed anymore.

### Added

- `dataTable.empty` / `dataTable.loading` i18n strings (en/ja/vi).

## [6.4.0] - 2026-06-01

### Added

- **`Sidebar` submenus.** `SidebarItem` now accepts `children` â a nested item renders a
  collapsible group (Radix `Collapsible`) using the existing `sb-nav-group-trigger` /
  `sb-chevron` / `sb-nav-sub` / `sb-nav-item--sub` design. The **parent reads active when any
  descendant is active** and the group auto-opens to reveal the active child.
- **Collapsed-rail flyout tooltips.** When the sidebar is collapsed, hovering (or keyboard-
  focusing) a leaf shows its label as a flyout tooltip, and a group reveals its submenu as a
  flyout menu â so collapsed items are identifiable and reachable. Replaces the native `title`
  attribute; no new dependency.

## [6.3.0] - 2026-06-01

### Changed

- **`DatePicker`, `TimePicker`, `DateRangePicker` are now WAI-ARIA combobox inputs.**
  The value lives on a real, typeable `<input>` (ISO-8601 `yyyy-MM-dd` for the date
  pickers, canonical 24h `HH:mm` for `TimePicker`) instead of a button-only popover.
  This makes the controls **form-submittable**, screen-reader friendly, and natively
  **e2e-testable by filling the input** â no hidden mirror elements. The calendar /
  time-column / range popover remains as the visual affordance and stays in sync with
  typing. Prop APIs are backward-compatible (same `value` / `onChange`); the rendered
  element changes from a `<button>` to an `<input>`, so consumers asserting the old
  button text should target the input value instead.

### Added

- **`name` prop** on `DatePicker`, `TimePicker`, and `DateRangePicker` for native form
  submission. `DateRangePicker` emits `${name}_from` / `${name}_to` ISO fields.
- **`toIsoDate(date)`** in `@godxjp/ui` datetime helpers â formats a calendar `Date` to
  an ISO-8601 `yyyy-MM-dd` string from its local Y/M/D.

## [6.2.0] - 2026-06-01

### Added

- **`ColumnDef.hiddenOnMobile`** â a `DataTable` column can now be hidden below
  the `md` breakpoint (`hidden md:table-cell`), keeping mobile tables readable.
- **`StatCard.inverse`** + **sign-aware delta tone** â a `delta` starting with
  `+` renders in the success tone and `-` / `â` in the destructive tone;
  `inverse` flips that for metrics where lower is better.
- **`DataTable` horizontal scroll-fade** â a subtle gradient affordance appears
  at the scroll edge so it's clear the table scrolls horizontally.

### Changed

- **Empty `DataTable` headers auto-hide.** A column whose `header` is empty
  (an icon / action column) no longer paints the grey header band â its header
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
