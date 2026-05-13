# Changelog

All notable changes to `@godxjp/ui`. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
