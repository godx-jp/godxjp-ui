# Changelog

All notable changes to `@godxjp/ui`. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] — 2026-05-13

### Added
- **Popover** primitive (`Popover`, `PopoverTrigger`, `PopoverContent`,
  `PopoverAnchor`) wrapping `@radix-ui/react-popover`. Visual contract
  in the new `.popover-content` class in `tokens.css` — brand-tokenised
  surface (`--popover`), border, and elevation.
- **DropdownMenu** primitive (`DropdownMenu`, `DropdownMenuTrigger`,
  `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`,
  `DropdownMenuLabel`, `DropdownMenuShortcut`, `DropdownMenuGroup`,
  `DropdownMenuPortal`, `DropdownMenuSub`, `DropdownMenuRadioGroup`)
  wrapping `@radix-ui/react-dropdown-menu`. `<DropdownMenuItem>`
  supports `variant="destructive"` + `inset` matching the public v0.2
  surface so call sites migrate by dep bump only.
- **Calendar** primitive — `react-day-picker` themed via the new
  `.calendar` class in `tokens.css` (primary / surface / ring tokens).
- **TimeInput** primitive — narrow `HH:mm` text input with on-blur
  normalisation (accepts `HHmm`, `H:mm`, etc.). Surfaces
  `aria-invalid` when the draft doesn't parse.
- New CSS classes in `tokens.css`: `.popover-content`,
  `.dropdown-menu-content`, `.dropdown-menu-item`,
  `.dropdown-menu-separator`, `.dropdown-menu-label`,
  `.dropdown-menu-shortcut`, `.calendar`, `.time-input`.
- `react-day-picker` added as a dependency.

### Notes
- This release fills the gap that blocked
  `services/forge-service/frontend/` from migrating off the public
  TempoFast `@godxjp/ui@0.2.0`. After 2.1.0 every primitive forge
  imports (`Badge`, `Button`, `Tabs*`, `Popover*`, `DropdownMenu*`,
  `Calendar`, `TimeInput`) is brand-tokenised by default.

## [2.0.0] — 2026-05-13

**Major version bump.** `@godxjp/ui` (the npm package owned by godx-jp / TempoFast) is now the GoDX brand bible. The previous public 0.2.0 — TempoFast's existing component library — stays consumable for legacy callers until TempoFast itself migrates onto 2.0+. SemVer signals the breaking change so dependents pin explicitly.

### Breaking

- Package surface re-anchored on the Claude Design handoff 2026-05-13.
  Color tokens use OKLCH (not hex literals), font scale tightened
  (text-2xs..text-4xl), density modes added, four tenants pinned.
  `<Badge>` / `<Button>` etc. now wrap canonical CSS classes from
  `tokens.css` rather than shadcn-default Tailwind utilities.
- Token files merged: `tokens.css` + `tokens-ext.css` →
  single `tokens.css` (635 lines). Consumers do
  `import "@godxjp/ui/tokens"` once.
- `src/primitives/` moved to `src/components/primitives/` —
  `@godxjp/ui/primitives` alias preserved in the exports map for
  backwards compatibility, but new code should import from
  `@godxjp/ui` (top-level barrel re-exports everything).

### Added

### Added
- **BRAND.md** — the brand bible (locked 2026-05-13 from Claude Design
  handoff bundle). Spells out the 渋み / 間 / 簡素 design philosophy
  and lists the forbidden patterns reviewers reject.
- **`design/source-2026-05-13/`** — full design handoff preserved
  verbatim (README, chat transcripts, every JSX + HTML prototype).
- **`design/godx-admin-2026-05-13.tar.gz`** — original archive from
  `api.anthropic.com/v1/design/h/7Ya1OxEEfiaI2SWojzuP9A`. Kept so the
  brand can be re-extracted on any fresh checkout.
- **Atomic primitives**: `Badge`, `Button`, `Card` (+ `CardHeader`,
  `CardTitle`, `CardSubtitle`, `CardContent`), `Input`, `Textarea`,
  `Label`, `Tabs` (+ `TabsList`, `TabsTrigger`, `TabsContent`),
  `Avatar`, `Separator`. Each maps onto a canonical CSS class from
  `tokens.css` — no Tailwind utility re-encoding.
- **`./components/primitives` export path** for explicit imports.

### Changed
- **`tokens.css` is now the single CSS entry point.** The handoff's
  `tokens.css` + `tokens-ext.css` were merged so consumers do one
  import (`@godxjp/ui/tokens`). The split is preserved verbatim under
  `design/source-2026-05-13/` as an audit trail.
- **`src/primitives/` → `src/components/primitives/`** for consistency
  with international design-system conventions (atomic primitives
  alongside shell + screens under `components/`). Top-level
  `@godxjp/ui` import paths unchanged.
- **`src/index.ts`** now re-exports primitives by default so
  consumers can `import { Badge, Button } from "@godxjp/ui"`.

### Removed
- `src/tokens/tokens-ext.css` (merged into `tokens.css`).
- `src/tokens/index.css` (no longer needed — `tokens.css` is the entry).

## [0.1.0] — 2026-05-10

Initial scaffold: tokens, hooks, i18n, data, shell components, screen
components.
