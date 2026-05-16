# Changelog

All notable changes to `@godxjp/ui`. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] — 2026-05-16

`@godxjp/ui` v3 is a clean-break major that fulfils the **zero-config professional
framework** promise described in `new-docs/12-frontend-architecture.md`. Services
upgrading from 2.x gain a complete toolchain preset and a fourth mandatory locale
(`fil`) with no API removals beyond the deprecated symbol renames below.

### Added

- **Filipino (`fil`) locale** — `src/i18n/locales/fil.ts`. Full key parity with
  `ja`. Mandatory per `new-docs/12-frontend-architecture.md §6` (all four
  locales: `ja`, `en`, `vi`, `fil`).
- **`GodxLocale` type** — replaces the Forge-branded `ForgeLocale`. Both are
  exported; `ForgeLocale` is `@deprecated` but still resolves to the same type so
  existing consumers compile without changes.
- **`GODX_LOCALE_STORAGE_KEY`** — replaces `FORGE_LOCALE_STORAGE_KEY`. Old name
  re-exported as deprecated alias.
- **Zero-config toolchain presets** under `config/` — consumed via sub-path exports:
  - `@godxjp/ui/eslint-config` → ESLint 9 flat config (typescript-eslint strict,
    jsx-a11y, react-hooks rules). Service `eslint.config.js` = one line.
  - `@godxjp/ui/prettier-config` → Prettier 3 config. Service `.prettierrc` = one
    string.
  - `@godxjp/ui/tsconfig` → TypeScript 6 strict base (`exactOptionalPropertyTypes`,
    `noUncheckedIndexedAccess`, `verbatimModuleSyntax`).
  - `@godxjp/ui/vitest-config` → Vitest 4 base with `jsdom` + 75%/70% coverage
    thresholds.
- **Vitest test runner** added to devDependencies. `pnpm test` now works in the
  package itself.
- **Locale parity smoke test** at `src/i18n/__tests__/locales.test.ts` — ensures
  every key in `ja` is present in `en`, `vi`, and `fil` (test ID: GDXUI-I-LOCALE-001).
- **`ForgeProduct.tenant` type broadened** from a closed literal union to `string`
  — makes the framework deployable by operators who define their own tenant slugs
  without forking the package. The four built-in PRODUCTS fixtures remain unchanged.

### Changed

- **package.json `description`** updated from Forge-specific wording to generic
  professional framework copy.
- **`useTweaks` storage key** changed from `"forge.tweaks"` to `"godx.tweaks"`.
  On first load after upgrade, the stored tweaks key is not found and falls back
  to defaults (density/theme/tenant reset to defaults). User-visible tweaks
  (density, theme, tenant) persist again on next save.
- **`initI18n` detection key** changed from `"forge.locale"` to `"godx.locale"`.
  User locale preference is reset to browser/navigator default on first load after
  upgrade. User re-selects locale via TweaksPanel and it persists under new key.
- **README** rewritten as professional framework intro (≥300 words) with import
  surface table, primitives table with a11y column, adoption tracker, zero-config
  quick start, and npm/license/types badges.
- **`sideEffects`** in `package.json` already `["**/*.css"]` — confirmed correct.
  JS entries remain tree-shakable.

### Deprecated

- `ForgeLocale` — use `GodxLocale`. Will be removed in v4.
- `FORGE_LOCALE_STORAGE_KEY` — use `GODX_LOCALE_STORAGE_KEY`. Will be removed in v4.

### Migration guide (2.x → 3.0.0)

1. **Locale storage key reset (non-breaking but visible):** The first page load
   after upgrade will not find the old `"forge.tweaks"` key and will reset tweaks
   to defaults. This is a one-time reset; the user re-selects density/theme/tenant
   once and the new key persists.

2. **`ForgeLocale` → `GodxLocale`:** No compile error — `ForgeLocale` still
   exports. Update to `GodxLocale` at your own pace; it will be removed in v4.
   Search and replace: `ForgeLocale` → `GodxLocale`.

3. **`FORGE_LOCALE_STORAGE_KEY` → `GODX_LOCALE_STORAGE_KEY`:** Same pattern.
   The old name still re-exports the same string constant.

4. **Add `fil` locale to service `addResourceBundle` calls:** If your service
   uses `i18n.addResourceBundle(locale, "my-ns", {…})` for all four locales,
   add `fil`. Missing `addResourceBundle` calls for `fil` produce a silent fallback
   to the base `fil` dictionary; no crash.

5. **Zero-config toolchain (optional, strongly recommended):**
   Adopt the new preset exports to reduce per-service boilerplate:
   ```bash
   # eslint.config.js — replace existing content with:
   # export { default } from "@godxjp/ui/eslint-config"
   #
   # .prettierrc.json — replace with:
   # "@godxjp/ui/prettier-config"
   #
   # tsconfig.json — extend:
   # { "extends": "@godxjp/ui/tsconfig", "compilerOptions": { "paths": {...} } }
   ```

6. **`ForgeProduct.tenant` type:** If you were using the closed literal union
   `"godx" | "kintai" | "tempo" | "betoya" | "restaurant"` for type narrowing,
   the type is now `string`. Add your own type guard if needed:
   ```ts
   const KNOWN_TENANTS = ["godx", "kintai", "tempo", "betoya"] as const
   type KnownTenant = (typeof KNOWN_TENANTS)[number]
   function isKnownTenant(t: string): t is KnownTenant {
     return KNOWN_TENANTS.includes(t as KnownTenant)
   }
   ```

## [2.4.0] — 2026-05-16

### Added
- **Toaster** + **`toast`** — thin wrapper around `sonner` with token
  class names (default `unstyled` so chrome comes from `.toast*` in
  `tokens.css`). Optional **`@godxjp/ui/sonner.css`** import (after
  tokens) pulls in sonner’s stacking / motion stylesheet and resets
  toaster `font-family` to inherit.
- **Combobox** family — `Combobox` / `ComboboxTrigger` / `ComboboxAnchor`
  (Popover aliases), `ComboboxContent` (wraps inner `cmdk` `Command`),
  `ComboboxInput`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty`.
  New `.combobox-*` atoms in `tokens.css`.
- Dependency: **`sonner`** (`cmdk` already present).

## [2.3.0] — 2026-05-16

### Added
- **Dialog** family (`Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`,
  `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`,
  `DialogTitle`, `DialogDescription`) — Radix Dialog + `.dialog-*` in
  `tokens.css`.
- **Sheet** family (Radix Dialog; `SheetContent` with `side` + `.sheet-*`
  animation tokens).
- **AlertDialog** family (`AlertDialog*`, `AlertDialogAction` / `Cancel`
  use `.btn` / `.btn-primary` / `.btn-secondary`).
- **Select** family (`Select*`, `SelectPortal`, scroll buttons, separator).
- **Switch**, **Checkbox** (Radix) with `.switch-*` / `.checkbox-*`.
- **Table** family (`Table` scroll wrapper + `TableHeader` / `Body` /
  `Footer` / `Row` / `Head` / `Cell` / `Caption`) using the `.table` atom.
- Dependencies: `@radix-ui/react-alert-dialog`, `@radix-ui/react-checkbox`.

### Fixed
- Removed invalid `composes:` from `.popover-content` in `tokens.css`
  (plain CSS does not support CSS-modules `composes`).

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
