# Changelog

All notable changes to `@godxjp/ui`. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Tour spotlight cutout** — the target area now uses an SVG mask
  cutout so the active element stays undimmed while the rest of the
  viewport is subdued.
- **Tree React Aria foundation** — `Tree` now delegates ARIA tree
  keyboard navigation, selection, expansion, and disabled state to
  `react-aria-components` while preserving the single public `Tree`
  primitive. Row content customization now goes through `renderItem`;
  local row spacing uses the shared `density` vocabulary, and
  connector lines are rendered from tree structure instead of guessed
  from the flattened React Aria DOM.

### Added

- **Table A5 — sort + resize** — `sort` accepts
  `TableSort | TableSort[] | null`; shift-click on a sortable header
  extends the multi-sort list and the header renders a numbered
  priority badge (1 / 2 / 3) at the right edge. `resizable` enables
  a 4px right-edge grip on each header; double-click auto-fits via
  TanStack `column.resetSize()`.
- **Table A6 — expand row** — `expandable` adds a 32px first cell
  with a ▶ toggle; the detail panel sits in a full-width row with
  the canonical 3px primary left border. Exclusive by default;
  `allowMultiple` keeps prior opens.
- **Table A7 — inline editing** — `editing` carries `rowId` (current
  editing row), `dirtyRowIds` / `dirtyCellIds` (warning-dot
  tracking), `renderEditCell`, `isRowReadOnly`, and a built-in
  footer banner (`.tbl-footer[data-state="dirty"]`) with Save-all /
  Cancel-all when any row is dirty. Confirmed rows are read-only
  via `isRowReadOnly` — double-click is suppressed.
- **Table A8 — grouped + tree rows** — `groupBy` buckets rows by
  key, emits a full-width `.group-row` header with title + count
  badge + right-floated total. `tree.children` walks data
  recursively, emitting 14px / level indent and a twirl button on
  parent rows.
- **Table A9 — column-manager lock toggle** — the column-manager
  Sheet renders a 🔒 / 🔓 button next to each row to pin / unpin
  columns at runtime; changes fire through `onColumnPinningChange`
  (TanStack-canonical `ColumnPinningState`).
- **Table A10 — pagination variants** — `TablePaginationVariantConfig`
  discriminates on `type`: `numbered` (default + back-compat),
  `load-more` (feed lists with `hasMore` + `onLoadMore`), and
  `cursor` (time-series jump-to-month via `value` + `inputType`).
- **Table A11 — Import / Export composite** — new
  `TableImportFlow` (4-step stepper + file card + error preview)
  and `TableExportDialog` (format / range / hidden-column toggles)
  in `@godxjp/ui/components/composites`. Separate from the Table
  primitive per cardinal rule 32 (no redundant props on Table).
- **Table saved views** — `TableViewsConfig` now lets saved-view tabs
  apply `filters`, `sort`, and `columnVisibility` snapshots while
  keeping persistence in consumer state. The Table story opens a
  naming dialog before saving and warns when another view already
  has the same filters and column visibility. Views can opt into
  deletion with `deletable` + `onDeleteView`, while built-in views
  remain protected by default. `getTableViewsStorageKey` provides
  the localStorage namespace next to column visibility.
- **`GodxConfigProvider` + format helpers** — canonical alias of
  `PreferencesProvider` per ADR 0005. The provider now wraps
  children in React Aria's `<I18nProvider>` so every date / time /
  number primitive picks up the locale automatically. Three thin
  helper files (`src/i18n/format.ts`, `src/i18n/relative.ts`,
  `src/hooks/useFormatters.ts`) wrap native `Intl` APIs +
  `@internationalized/date` values; no new runtime dependency. The
  legacy `PreferencesProvider` / `usePreferences` names remain as
  deprecated aliases until v4.0.0.
- **`currency` preference + `setCurrency`** — `Preferences.currency`
  carries an ISO 4217 default for `formatCurrency()`. Persisted to
  the same storage backend as locale / timezone.
- **Timeline `time` accepts temporal values** — `time` now takes
  `Date | CalendarDate | CalendarDateTime | ZonedDateTime` (in
  addition to `ReactNode`). The active provider's locale + timezone
  format it via `useFormatters` per the new `timeFormat` prop
  (`"relative" | "datetime" | "date" | "time"`, default
  `"relative"` for `feed`, `"datetime"` elsewhere).
- **Separator labels** — horizontal `Separator` now accepts
  `children`, `titlePlacement`, `orientationMargin`, and `variant`
  for Ant Design-style labeled dividers, replacing manual Flex +
  two-separator composition. Prop vocabulary docs and the
  Storybook vocabulary catalogue now include those concepts.
- **Descriptions data API** — `Descriptions` now renders from
  `items` and supports `renderItem` for custom rows. The
  `Descriptions.Item` sub-component shape was removed so consumers
  use one component consistently.
- **Table data API** — `Table` is now a single-component TanStack
  Table wrapper. Legacy table subcomponent exports were removed
  from the public surface; use `columns`, `data`, `ColumnDef.cell`,
  and the `toolbar` prop.
- **Statistic loading + animation** — `loading` renders skeleton
  placeholders with `aria-busy`, while `animated` /
  `animationDuration` count finite numeric values from zero /
  previous value and respect `prefers-reduced-motion`.
- **Cardinal rule 32 — no redundant props.** A new top-level prop /
  item field / variant is rejected at review if an existing prop /
  item field / variant already covers the use case. Lifted from the
  Timeline `pending` audit; future PRs must justify every new prop
  against the existing surface.
- **Timeline `connector` prop** — `boolean`, default `true`. Toggles
  the vertical line that joins markers in `list` + `branching`
  variants. `feed` variant has no connector by design.
- **Timeline per-item `animate` field** — `TimelineItem.animate:
boolean` adds a pulsing ring around the marker dot for that single
  item, replacing the previous top-level `animate` Timeline-level
  prop (now removed — animate is a per-item concept). Honours
  `prefers-reduced-motion`.
- **Storybook test gate** — `@storybook/addon-vitest` wired with
  Playwright (browser-mode Chromium) so every `play()` runs as a
  Vitest test. `pnpm test:stories` → 419 tests / 89 files / ~7s.
  Interactive primitives now ship with regression-pinned focus, click,
  hover, type, open/close flows (PR #18 + extended in #19, #20).
- **Code panel default on Story view** — `@storybook/addon-docs`
  `parameters.docs.codePanel: true` so consumers see runnable JSX
  beside Controls / Actions / Interactions without click-through.
- **Actions panel auto-spy** — `parameters.actions.argTypesRegex:
"^on[A-Z].*"` logs every `on*` callback invocation globally.
- **Cardinal rule 30** — story `render` must return JSX directly. No
  `<XyzDemo />` wrapper components, no parameterised helpers. Storybook
  source view stays copy-pasteable.
- **Parity scripts + pre-commit gate** —
  `scripts/check-stories-parity.mjs` (rule 17) +
  `scripts/check-docs-parity.mjs` (rule 18). Husky pre-commit runs
  `lint:tokens` + both parity checks + `sync:skills` + `type-check`
  in ~5s; CI re-runs them on push.
- **DatePicker stories** — `Placeholder`, `Granularity_DateTime`
  (hour / minute via `granularity` + `hourCycle`), `MinMaxConstrained`,
  `Format_Locales` (ja-JP / en-US / de-DE segment order via
  `I18nProvider`).
- **Select + Combobox `options` prop** — Ant / MUI / Mantine canonical
  data-driven API. `<Select options={[{value,label}]} />` or
  `<Combobox options={…} triggerLabel placeholder emptyLabel />`.
  Children API remains for advanced layouts (groups / dividers / custom
  item rendering).
- **Combobox `WithSelection` story** — controlled state + check
  indicator + role meta pattern (the old verbose Default).
- **40 reference doc stubs** — `docs/reference/<group>/<Name>.md`
  draft scaffold for the previously undocumented primitives (Flex,
  Form, Transfer, Field, LocaleTabs, Checklist, Spinner, IconButton,
  PageHeader, SegmentedControl, Statistic, Empty, Tag, Alert, Result,
  Typography, Descriptions, Radio, Slider, Watermark, Popconfirm,
  Anchor, Menu, Pagination, Steps, Progress, DatePicker,
  AutoComplete, Cascader, Tree, ColorPicker, Rate, Carousel, Collapse,
  List, Image, QRCode, Tooltip, Timeline, Tour). `check:docs-parity`
  now exits clean at 63/63.
- **Combobox vs Select decision table** in Select.md + Combobox.md —
  fixed list / search / free-text / hierarchical / tree.

### Fixed

- **Separator vertical styling** — vertical separators now render via
  `.divider-vertical` instead of inline style, so Card divider stories
  can compose the Separator primitive without raw `<hr>` elements.
- **Skeleton default animation** — ported Ant Design's active
  skeleton gradient pattern (`25% / 37% / 63%`, `400% 100%`,
  `1.4s ease`) to godx tokens, with reduced-motion fallback.
- **Skeleton shape atoms** — `.sk-line` / `.sk-block` now have
  explicit full-width defaults and `.sk-circle` keeps its 34px
  width in flex rows, fixing list/table loading stories.
- **Sidebar collapsed labels** — collapsed mode now omits nav label
  and badge nodes from the DOM while preserving `aria-label` /
  `title`, so standalone Sidebar stories cannot leak clipped text
  when the wrapper selector changes.
- **SegmentedControl WAI-ARIA roving-tabindex** — radiogroup now ships
  the APG-compliant keyboard pattern: only the active radio carries
  `tabIndex={0}`; Arrow keys (Left/Right or Up/Down per the new
  `orientation` prop) move focus + selection; Home / End jump to
  first / last enabled item; disabled items are skipped. Root reflects
  `aria-orientation`. Replaces the previous native-Tab-order fallback
  that the docs claimed but didn't implement.
- **IconButton accessible-name warn** — dev-mode `console.warn` when
  none of `aria-label` / `aria-labelledby` / `title` is supplied
  (`process.env.NODE_ENV !== "production"` only — production bundles
  strip the check). Catches the most common a11y regression on
  icon-only controls without forcing a breaking TS signature.
- **Tooltip nested-provider double-wrap** — data-driven `<Tooltip>`
  detects an ancestor `<TooltipProvider>` (via a private React
  marker context the framework's Provider populates) and skips its
  inner Provider so the outer `delayDuration` / other Provider
  config is no longer silently overridden. Falls back to the
  previous double-wrap when the ancestor is Radix's Provider imported
  directly (not the framework's re-export) — documented in the
  Tooltip reference doc.
- **AutoComplete focus closing the dropdown** —
  `onFocusOutside={preventDefault}` on `Combobox` so opening
  on focus survives the focus-leaves-anchor lifecycle.
- **AutoComplete label vs value** — input shows the selected option's
  `label`; `onValueChange` reports the option's `value` (Ant / shadcn
  Combobox convention).
- **Combobox cmdk Command `value` + `defaultValue`** — conditional
  spread so the inner Primitive.input never receives both
  (controlled / uncontrolled warning silenced).
- **`<List>` and `<Menu>` nested `<li>`** — `List` renderItem no
  longer wraps in an extra `<li>`; `Menu` switched from
  `<li role="none">` to `<div role="group">` (ARIA-compliant).
- **`Collapse` Tailwind utility collision** — root class renamed
  `.collapse` → `.collapse-root` so Tailwind v4's
  `.collapse { visibility: collapse }` utility no longer hides the
  subtree.
- **Carousel vertical** — `height: 100%` cascades through `.carousel`
  / `-viewport` / `-track`, clipping to one slide at a time.
- **Card banner double-border + radius** (B3 / C1) — `.ph.striped`
  resets the inherited `.ph` chrome (border / radius / margin-bottom).
- **Card B3 stats footer** — uses `.card-footer-block` primitive class
  instead of inline `borderTop` + manual padding.
- **Card H8 tabs underline rounding** — `<button>` instead of
  `<Button>` for tab elements + `border-radius: 0` explicit on
  `.card-header-tabs .tab` so an accidental `<Button>` doesn't
  contaminate the underline.
- **Card H13 / H14 / H17 stories** — `<div className="card-body-block">` /
  `<Card footer block>` sub-component pattern instead of raw
  `<div className="card-body">` (rule 29).
- **Card H17 sticky-shadow scroll** — `max-height: 140 + overflow-y:
auto` instead of `height: 80 + overflow: hidden` so the story
  actually demonstrates scrolling.
- **Descriptions bordered title overflow** — gap-as-border trick (1px
  body bg) so the outer frame wraps the body only, title sits above.
- **Checkbox + Radio sizing** — 1rem (16px @ base) matching
  shadcn / Ant / Tailwind canon, not the density-element scale
  intended for full-height controls.
- **Checkbox glyph stroke** — `strokeWidth=3` +
  `absoluteStrokeWidth` so the check / minus glyphs read at 12px.
- **Image fallback visible** — fills wrapper 100% with secondary bg
  - border instead of 64×64 inline-flex chip against near-white body.
- **PageHeader `padding` prop** — vocabulary aligned with Card per
  rule 23 §B (`tight` / `default` / `cozy` / `none`). Stacked variant
  releases the fixed `--header-height` so breadcrumb + title get
  vertical room.
- **Slider / InputSearch / Textarea controlled-uncontrolled props** —
  conditional spread so the inner `<input>` never receives both
  `value` and `defaultValue`.
- **TweaksPanel Dialog a11y** — `aria-describedby={undefined}` on
  `Dialog.Content` since the panel doesn't use `Dialog.Description`.
- **Drawer Left story** — added `<DrawerDescription>` for a11y.
- **Sidebar collapsed text overflow** — CSS selectors broadened from
  `.app-root[data-collapsed]` to `[data-collapsed]`, and Sidebar
  wraps children in `<div data-collapsed style="display: contents">`
  so the collapsed-state rules apply in both AppShell and standalone
  contexts.
- **Storybook Docs source chip rendering** — `preview.css` forces
  `.prismjs .token { display: inline; border: 0 }` to defeat
  Storybook 10's per-token-pill style; consumers now see plain
  syntax-highlighted JSX.
- **Storybook Docs canvas height** — `.sb-stage` no longer
  `min-height: 100vh` so each story preview shrinks to content
  instead of 707px frames.
- **Build warnings** — removed broken `banner: { js: '"use client"' }`
  from `tsup.config.ts` (never reached output, only produced 7×
  "module-level directive ignored" warnings per build). Posture now
  matches MUI / Radix / shadcn (consumers mark App Router boundary
  themselves).

### Changed

- **Card story display names** — stripped section-code prefixes
  (`A1·`, `B3·`, `H13·`, etc.) from 50 `name:` fields. URL slug
  (const name) still carries the code for dev reference.
- **Story render demos inlined** — sweep of 14 stories in
  `data-entry/` that wrapped their body in `<XyzDemo />` (DefaultDemo
  / ControlledDemo / ValidatedDemo / PrefectureDemo / etc.) — bodies
  now inline in `render: function StoryName() {…}` so Storybook's
  dynamic source shows real JSX. `<ExampleForm disabled />` exemption
  also removed.
- **`Card.stories.tsx` raw card-body / card-footer divs** —
  ~27 occurrences replaced with `<div className="card-body-block">` / `<Card footer
block>` React sub-components per rule 29.
- **`docs.source.type`** — `"dynamic"` (was `"code"`) so the source
  view renders the JSX, not the wrapping story object.
- **`docs.canvas.sourceState`** — `"hidden"` (was attempted `"shown"`)
  so the Docs view doesn't auto-expand every story's source
  (bloated 5-story pages to thousands of px).

### Removed

- **Dialog legacy compositional API** — removed the multi-part modal
  surface. `Dialog` is now the single public component with `trigger`,
  `title`, `description`, `children`, `footer`, and optional `form`
  props.
- **`Timeline pending` prop** — removed. The trailing "ongoing"
  marker is now expressed as a regular item with
  `{ animate: true, color: "primary", title: "…" }`. Per cardinal
  rule 32 (no redundant props), a separate top-level prop was a
  duplicate of the items-array shape.
- **`Timeline animate` Timeline-level prop** — removed. `animate`
  is a per-item concept: set `items[i].animate = true` on the items
  that should pulse. The previous Timeline-level prop animated only
  the `current` item, which couldn't express trailing-pending
  markers or multi-item indication.
- **`docs/reference/primitives` advisory drift** — 40 stubs landed,
  parity now strict at 63/63.
- **`<Step color>` prop + `StepColor` type** — the prop was declared
  but never read; per-step state is locked to the dxs-kintai canon
  (`done` → `--success`, `cur` → `--primary`, future → `--muted-foreground`)
  and not overridable. Consumers needing per-event colour should use
  `<Timeline>` instead. No release migration needed — the prop had no
  runtime effect.

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
   const KNOWN_TENANTS = ["godx", "kintai", "tempo", "betoya"] as const;
   type KnownTenant = (typeof KNOWN_TENANTS)[number];
   function isKnownTenant(t: string): t is KnownTenant {
     return KNOWN_TENANTS.includes(t as KnownTenant);
   }
   ```

## [2.4.0] — 2026-05-16

### Added

- **Toaster** + **`toast`** — thin wrapper around `sonner` with token
  class names (default `unstyled` so chrome comes from `.toast*` in
  `tokens.css`). Optional **`@godxjp/ui/sonner.css`** import (after
  tokens) pulls in sonner’s stacking / motion stylesheet and resets
  toaster `font-family` to inherit.
- **Combobox** family — `Combobox` / `Combobox` / `Combobox`
  (Popover aliases), `Combobox` (wraps inner `cmdk` `Command`),
  `Combobox`, `Combobox`, `Combobox`, `Combobox`.
  New `.combobox-*` atoms in `tokens.css`.
- Dependency: **`sonner`** (`cmdk` already present).

## [2.3.0] — 2026-05-16

### Added

- **Dialog** family — Radix Dialog + `.dialog-*` in `tokens.css`.
- **Sheet** family (Radix Dialog; `Sheet` with `side` + `.sheet-*`
  animation tokens).
- **AlertDialog** family (`AlertDialog*`, `AlertDialog` / `Cancel`
  use `.btn` / `.btn-primary` / `.btn-secondary`).
- **Select** family (`Select*`, `SelectPortal`, scroll buttons, separator).
- **Switch**, **Checkbox** (Radix) with `.switch-*` / `.checkbox-*`.
- **Table** data display primitive using the `.table` atom.
- Dependencies: `@radix-ui/react-alert-dialog`, `@radix-ui/react-checkbox`.

### Fixed

- Removed invalid `composes:` from `.popover-content` in `tokens.css`
  (plain CSS does not support CSS-modules `composes`).

## [2.1.0] — 2026-05-13

### Added

- **Popover** primitive (`Popover`, `Popover`, `Popover`,
  `Popover`) wrapping `@radix-ui/react-popover`. Visual contract
  in the new `.popover-content` class in `tokens.css` — brand-tokenised
  surface (`--popover`), border, and elevation.
- **DropdownMenu** primitive (`DropdownMenu`, `DropdownMenu`,
  `DropdownMenu`, `DropdownMenu`, `DropdownMenu`,
  `DropdownMenu`, `DropdownMenu`, `DropdownMenu`,
  `DropdownMenu`, `DropdownMenu`, `DropdownMenu`)
  wrapping `@radix-ui/react-dropdown-menu`. `<DropdownMenu>`
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
- **Atomic primitives**: `Badge`, `Button`, `Card` (+ `Card header`,
  `Card title`, `Card subtitle`, `Card content`), `Input`, `Textarea`,
  `Label`, `Tabs` (+ `Tabs`, `Tabs`, `Tabs`),
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
