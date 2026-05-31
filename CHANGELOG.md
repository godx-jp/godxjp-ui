# Changelog

All notable changes to `@godxjp/ui` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/godx-jp/godxjp-ui/compare/v6.2.0...HEAD
[6.2.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.1.2...v6.2.0
[6.1.2]: https://github.com/godx-jp/godxjp-ui/compare/v6.1.1...v6.1.2
[6.1.1]: https://github.com/godx-jp/godxjp-ui/compare/v6.1.0...v6.1.1
[6.1.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.0.2...v6.1.0
