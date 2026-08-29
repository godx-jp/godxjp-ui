# Changelog

All notable changes to `@godxjp/ui` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed (BREAKING)

- **Focus-ring knob dùng đuôi `-alpha`, không phải `-opacity`.** Bốn component token ra mắt ở
  18.15.x đặt tên lệch khỏi vocabulary của chính repo (`--alert-bg-alpha`,
  `--card-header-background-alpha`…) và không qua được `check:token-tiers` — gate này đã đỏ âm
  thầm trên `main` kể từ đó vì release đi tắt qua `pnpm verify`. Đổi tên cho khớp thay vì nới
  guard: thêm một từ đồng nghĩa thứ hai đúng là thứ cardinal rule #44/#45 muốn tránh.
  `--toggle-focus-ring-opacity` → `--toggle-focus-ring-alpha`,
  `--time-input-focus-ring-opacity` → `--time-input-focus-ring-alpha`,
  `--sidebar-user-focus-ring-opacity` → `--sidebar-user-focus-ring-alpha`,
  `--topbar-icon-focus-ring-opacity` → `--topbar-icon-focus-ring-alpha`.
  Theme nào đang set bốn tên cũ phải đổi; giá trị mặc định giữ nguyên nên không đổi hình ảnh.
  `--focus-ring-opacity` ở `foundation.css` là token nền tier khác và **không** đổi.

### Added

- **Steps is token-themeable (#319) — 25 literals → 0.** `--steps-inline-*` already covered the
  compact inline form; the main variant's marker, connector and text rhythm were still literal,
  so a service could not resize the dot, retighten the vertical run, or move the horizontal
  connector onto its own grid: `--steps-dot-*` · `--steps-marker-*` · `--steps-title-*` ·
  `--steps-vertical-*` · `--steps-horizontal-*` · `--steps-connector-*`. Step status, direction
  and title placement now drive the styling through data attributes rather than conditional
  class strings, so both ends of the horizontal connector move together when
  `--steps-connector-inset` is retuned instead of needing two hand-matched `calc()` literals.
- **TreeSelect is token-themeable (#319) — 25 literals → 0, and its depth indent is finally
  reachable.** The indent was a magic expression inline in JSX (`depth * 1.25 + 0.5` rem), so no
  theme could touch it at any price — the guard never even saw it, because it is not a Tailwind
  class. Depth now flows through `--tree-select-depth` on the row and the indent resolves as
  `--tree-select-depth-space-base + depth × --tree-select-depth-space-step`, so a dense service
  can tighten or flatten the tree without forking. Also `--tree-select-row-*` ·
  `--tree-select-toggle-*` · `--tree-select-list-max-height` · `--tree-select-empty-space-block`.
  Its clear control is centred against the whole field rather than laid out in a flex overlay, so
  it keeps its own rule while reading the shared `--control-affix-*` knobs.
- **TimePicker is token-themeable (#319) — 25 literals → 0.** Column height, panel width, row
  rhythm and the inline affix pair were all literal on the component, so a service could not
  shorten the scroll column or widen the panel for its own type scale without forking:
  `--time-picker-column-height` · `--time-picker-panel-width` (+ `-12h`, since a 12-hour layout
  adds an AM/PM column) · `--time-picker-heading-*` · `--time-picker-option-*` ·
  `--time-picker-footer-space-inset` · `--time-picker-affix-*`. Unlike Select and SearchSelect,
  TimePicker's affix sits INSIDE the field rather than overlaying it and carries two controls
  (clear + clock), so it keeps its own reserve and resting alpha instead of the shared overlay
  values — shared vocabulary where it fits, separate where it genuinely differs.
- **Select is token-themeable (#319) — 27 literals → 0, mostly by reusing what already existed.**
  Select's popup is the same surface ContextMenu/Menubar/DropdownMenu use, so its rows, label and
  separator join those shared rules rather than getting a fourth private copy; its trailing clear
  affix matched SearchSelect's calibration exactly, so it reads `--control-affix-*` with no
  scoping. Only three knobs are genuinely Select's own: `--select-content-max-height` ·
  `--select-scroll-button-space-block` · `--select-item-space-inline` (a listbox row has no
  leading icon column, so it takes a slightly wider inline inset to read level with a menu row
  that does). The popup also stops hard-coding `z-index: 50` and reads `--overlay-z-index`.
- **DropdownMenu joins the menu family (#319) — 29 literals → 0.** ContextMenu and Menubar were
  already converted and share one row-rhythm rule; DropdownMenu was the only Radix menu surface
  still carrying its whole box as Tailwind literals, so the three drifted apart silently. It now
  uses the same `.ui-*-item / -label / -separator / -shortcut` groups, and the row rhythm they
  share became knobs instead of a literal `2rem` in the stylesheet: `--menu-item-height` ·
  `--menu-item-radius` · `--menu-item-space-inline` · `--menu-item-space-gap` ·
  `--menu-item-font-size` · `--menu-item-inset-space-inline-start` · `--menu-indicator-*` ·
  `--menu-content-*` · `--menu-separator-*`. A service tunes menu density once for all three.
  DropdownMenu opens off a small trigger so it stays narrower — it scopes
  `--dropdown-content-min-width` (8rem) over the shared 10rem rather than forcing one width.
  The menu surfaces also stop hard-coding `z-index: 50` and read `--overlay-z-index`.
- **Cascader is token-themeable (#319) — 30 literals → 0.** Column widths, panel heights and both
  row rhythms were literals, so a service could not widen a column to fit longer JA labels or
  tighten the row without forking: `--cascader-column-min-width` ·
  `--cascader-columns-max-height` · `--cascader-list-max-height` · `--cascader-option-*` ·
  `--cascader-result-*` · `--cascader-empty-space-block`. Cascader parks a smaller affix closer
  to the edge than SearchSelect, so it scopes the shared `--control-affix-*` knobs rather than
  forcing one calibration on both — shared vocabulary, per-component values.
- **Purely visual checkboxes now pick up the shared disabled styling.** `.ui-checkbox:disabled`
  only matches form elements, so a checkbox rendered as a `<span>` (Cascader's `CheckboxVisual`)
  never matched it and repeated `cursor-not-allowed opacity-50` on the component instead. The
  rule now also matches `[data-disabled]`, and its alpha is `--disabled-opacity` rather than a
  hard-coded `0.5`.
- **SearchSelect is token-themeable, and the select-family trailing affix is now shared (#319).**
  37 literals → 0. Panel geometry was baked on as arbitrary values
  (`max-w-[min(32rem,calc(100vw-1.5rem))]`), so a service could not widen the panel or change its
  viewport inset without forking: `--search-select-panel-max-width` ·
  `--search-select-panel-viewport-inset` · `--search-select-list-space-inset` ·
  `--search-select-option-*` · `--search-select-status-*` · `--search-select-placeholder-space-block`.
  Select, SearchSelect and TagInput each repeated the same `end-2 size-6 rounded-sm opacity-50`
  affix stack, so that moved to ONE control-level set — `--control-affix-inset-inline-end` ·
  `--control-affix-action-size` · `--control-affix-action-radius` · `--control-affix-icon-size` ·
  `--control-affix-rest-alpha` · `--control-trigger-space-inline-end` — which Select and TagInput
  will adopt as they are converted.
- **Upload is token-themeable (#319) — 66 literals → 0, the worst file in the library.** All five
  variants (dropzone · button · picture · picture-card · avatar) baked their entire box onto the
  component, so a service could not resize the avatar, dial back the dropzone's 40px inset, or
  align the file row to its own grid without forking. 47 new knobs across six regions:
  `--upload-dropzone-*` · `--upload-tile-*` · `--upload-remove-*` · `--upload-picture-*` ·
  `--upload-avatar-*` · `--upload-draft-*` · `--upload-row-*`. Markup now carries semantic
  `.ui-upload-*` classes; state moved to data attributes (`data-drag-active`,
  `data-pending-delete`, `data-disabled`) so it is themeable and assertable.
  Radius defaults were verified against the built CSS (`rounded-lg` = `--radius`,
  `rounded-md` = `--radius / --radius-ratio`), so the look is unchanged — with **one deliberate
  normalization**: the "pending replace" chip used a bare `rounded`, which resolves to a flat
  `.25rem` and ignored the radius scale entirely (itself a rule #44 miss). It now follows the
  tile radius, a ~0.3px difference.
- **Tooltip + Popover are token-themeable (#316 Phase 1).** Both shipped their entire box as
  Tailwind literals on the component (`z-50 max-w-xs px-2 py-1 rounded-md text-xs shadow-md`,
  `w-72 p-4`), so a service theme could not retune tooltip density, popover width, or overlay
  stacking without forking the component — the gap cardinal rule #45 exists to close. New knobs:
  `--tooltip-max-width` · `--tooltip-space-inline` · `--tooltip-space-block` · `--tooltip-radius`
  · `--tooltip-font-size` · `--tooltip-shadow` · `--tooltip-background` ·
  `--tooltip-foreground` · `--tooltip-border-color` · `--popover-width` ·
  `--popover-space-inset` · `--popover-radius` · `--popover-shadow` ·
  `--popover-header-space-gap` · `--popover-header-font-size` ·
  `--popover-surface-{background,foreground,border-color}`. Colour knobs are declared `initial`
  with the role default at the call site, so a scoped `[data-tenant]`/`.dark` override still
  reaches the portaled node. **Defaults reproduce the previous look exactly** — nothing changes
  until a theme opts in.
- **`--overlay-z-index`** (semantic tier) — the ONE stacking layer for every portaled overlay.
  Tooltip, Popover, Select, DropdownMenu and Sheet each hard-coded `z-50`, so an app mounting the
  library under its own stacking context had to fight five literals. Stacking is a system
  decision, not a per-primitive one. Default `50`.
- **`scripts/audit-shadcn-overlap.mjs`** — đo giá trị thật của 47 component trùng tên shadcn/ui.
  Đếm hằng số hình học/chrome hard-code (thứ khiến service theme không chỉnh được), bỏ qua role
  utility vì chúng đã token-backed qua Tailwind v4 `@theme`. Kết quả khởi điểm: 45/47 đáng giữ,
  272 hằng số cần tokenize trên 23 component — xem `docs/AUDIT-shadcn-overlap.md` và #316.
- **`time-input` vào `componentPrefixes.control`** của `check-token-tiers` — thiếu sót thuần khiến
  `--time-input-focus-ring-*` không qua được guard.

### Removed

- **`Card` / `StatCard` `size` — a prop that never did anything.** It shipped in the v6 snapshot
  with EMPTY cva variants (`md: ""`, `compact: ""`) and emitted `data-size`, but no rule in
  `card-layout.css` ever matched that attribute, so `size="compact"` was inert at every density
  for its whole life — measured by a consumer as byte-identical geometry with and without it
  (none 54px/16px · tight 46px/12px · cozy 62px/20px). Meanwhile the props table listed it and
  the StatCard guidance told people to write it. Card sizing is `density` (tight 12px · base
  16px · cozy 20px), which is implemented and measured; a second sizing axis would only
  duplicate it, so the prop is gone rather than implemented. Consumers passing `size` get a type
  error and should drop it (or use `density="tight"` for the compact look it implied). Two tests
  that pinned the dead ATTRIBUTE — and so stayed green while the prop did nothing — were
  rewritten to pin the real axis.

### Added

- **`check:doc-prop-existence`** — a guard for the class of bug above, wired into `verify` and
  `verify:static`. `check:mcp-prop-sync` only checked that every declared prop is documented;
  nothing checked that every documented prop is declared, which is why examples could hand readers
  a prop that does not exist and stay green. Examples in `mcp/src/data/*.ts` are string literals
  and those in `docs/**/*.md` are fenced code, so no compiler can ever see them — the check is
  textual, reads `component-api-manifest.json` as the source of truth, and skips the 140
  components whose real surface comes from a third-party primitive (Radix, react-day-picker,
  embla) that the manifest lists only a lower bound for. That limit is printed on every run rather
  than left implicit. Verified by mutation: re-introducing `Button tone`, `Topbar product`, and
  `Form loading` each turns it red on its own.

### Changed

- **Frame-coverage ledger: `Card.sizes` / `StatCard.sizes` reclassified** from
  `covered:prop-evidence:size` to `not-applicable:api-manifest`, and the issue #163 ratchet floor
  moved 65 → 63 covered cells. This is the one case where the floor going down is not a violation:
  those two cells recorded coverage of a prop that no longer exists. No untested cell was
  reclassified, and the reason is recorded in the ledger's own baseline note.

### Fixed

- **Documentation examples that used props the components do not have.** `patterns.ts` showed
  `<Button tone="destructive">` (Button has `variant`, not `tone` — `tone` exists only on
  `Text`/`Heading`), and three Topbar examples passed `product` / `productMenu` / `collapsed`
  when `Topbar` only accepts `start` / `center` / `end` / `children`. Copy-pasting any of them
  produced a type error. Rewritten against the real APIs.
- **Documentation examples that invented props outright.** `<Carousel autoplay={false}>` was
  described as "the default in the framework" — Carousel has no `autoplay` prop and never rotates
  on its own — and `<Form loading={{ kind: "skeleton" }}>` appeared twice, including as the whole
  basis of the "Skeleton for INIT, Spinner for ACTIVE" rule, though `Form` has never had a
  `loading` prop. Both rewritten to say what the components actually do.
- **`DescriptionsProp` had drifted from the component**: it described a long-gone `items` array
  API and was missing `layout` / `labelAlign` entirely (both of which the generated manifest
  already listed, and both of which the component has honoured for a long time). Synced to the
  real props, and `DescriptionsLayoutProp` is now re-exported from the vocabulary barrel.

### Fixed

- **Checkbox, Radio, Switch, Input and Select had NO visible focus ring** — the
  `:focus-visible` rule lived in the `components` layer while the controls also
  carry a Tailwind `shadow-xs` utility, and utilities outrank components: the
  composite `box-shadow` won and the ring slot resolved to `rgba(0,0,0,0) 0 0 0 0`.
  Measured in Chrome on the built stylesheet — before: ring slot transparent at
  0px; after: `rgb(0,119,199) 0 0 0 2px`. A WCAG 2.4.7 failure that had been
  invisible because the rule looked correct in the file. The ring now also feeds
  `--tw-ring-shadow`, so the utility's own composite paints it.

### Changed

- **Focus ring is now one global API instead of nine hand-written rules.** The
  ring had drifted into four incompatible shapes across six stylesheets — the
  token pair, the token pair with an ad-hoc `/ 0.45`, and two that hardcoded
  `3px` with `/ 0.35` and `/ 0.3`, bypassing `--focus-ring-width` entirely — plus
  Tailwind `ring-*` utilities written directly into eight components. Same state,
  four thicknesses, no single knob a service could retune, and any component that
  forgot the rule fell back to the browser's own blue (`rgb(0,95,204)`).

  Now: `src/styles/focus-ring.css` is the ONE definition, reading four tokens —
  `--focus-ring-width` / `-color` / `-opacity` / `-offset`. Override globally at
  `:root`, per component via a published knob (`--toggle-focus-ring-opacity`,
  `--rating-focus-ring-offset`, …), or per instance via inline style. Set
  `--focus-ring-width: 0` at any level to turn rings off — shipped ON, since
  removing the indicator fails WCAG 2.4.7. New components opt in with the
  `ui-focus-ring` / `ui-focus-ring-outline` class instead of writing CSS.

  Every existing ring keeps its measured appearance (Button 2px, Toggle 3px/0.35,
  TimeInput 3px/0.3, sidebar & topbar 2px/0.45, rating & accordion outline 2px
  with a 2px gap). Two tests hold the line: one fails if any stylesheet paints a
  `:focus-visible` ring outside the single source, one runs the shipped selector
  with `.matches()` against rendered DOM so a rule that selects nothing is caught.

### Fixed

- **`Pagination` page buttons clipped their own number, wore the browser's focus ring, and
  collapsed the strip near the edges** — three defects reported together from a consumer list of
  21,185 rows (1,060 pages), all measured in Chrome against the shipped stylesheet.
  1. `.ui-pagination-link` was a rigid square (`width: var(--control-height)`, no padding), so a
     label wider than one control-height was cropped by its own box: `12345678` needed 59.3px of
     text inside a 30px content box, and `1043` cleared a 32px box by 0.3px — clipped outright at
     the consumer's 29px density. The button now sizes the way Ant Design, MUI and shadcn do — a
     `min-width` floor for the rhythm plus `padding-inline` for the overflow (new
     `--pagination-page-padding-x`, deliberately `--space-1`: at `--space-2` a two-digit label came
     to 32.8px and pushed the common 1–2 digit buttons off square). One- and two-digit buttons stay
     exactly 32×32; `1043` → 39.7×32, `12345678` → 69.3×32. Height and the 4px item gap unchanged.
  2. No `:focus-visible` rule existed, so the browser painted its own — measured
     `outline: rgb(0, 95, 204) auto 1px`, a blue belonging to no theme and reading as a defect next
     to a teal brand. Page buttons now use the same ring as `.ui-button`
     (`box-shadow: 0 0 0 var(--focus-ring-width) hsl(var(--focus-ring-color, var(--ring)))`).
  3. `buildPageRange` derived its window straight from `current ± siblingCount` and let it collapse
     against the edges, so a 1,060-page list opened as `1 2 … 1060` — four controls with a wide dead
     gap, poor target size and no sense of scale. The window is now CLAMPED rather than shrunk
     (Ant Design / MUI behaviour), so the control count is constant wherever the current page sits:
     `1 2 3 4 5 … 1060` at the start, `1 … 499 500 501 … 1060` in the middle,
     `1 … 1056 1057 1058 1059 1060` at the end — 7 controls each. `buildPageRange` also gained a
     `boundaryCount` parameter (default 1) alongside the existing `siblingCount`; the public
     `Pagination` props are unchanged.

- **A filled picker lost its calendar/clock icon (gh#308)** — `Input`'s `allowClear` REPLACES the
  configured `trailingIcon` with the ✕ (one trailing icon, never two). That is right for a plain
  text field, but for a picker the calendar/clock icon is the ONLY visual sign that the field
  opens a picker at all: a consumer measured a filled `DatePicker` rendering just the clear
  button, so a filled date looked like an ordinary text box (clicking the field still opened the
  calendar — the affordance was invisible, not gone). `DatePicker`, `MonthPicker`,
  `DateRangePicker`, `MonthRangePicker` and `TimePicker` now render their own trailing cluster
  with the ✕ **beside** the trigger (input padding grows `pe-9` → `pe-14` only while both show).
  `Input` itself is untouched, so every other consumer keeps the one-icon rule — pinned by a test
  that asserts a plain `Input` still swaps its `trailingIcon` for the ✕.

### Fixed

- **The restored describedBody rule overrode flush content's zero padding (gh#307)** — the
  nested-`:has()` rewrite made the description half apply to `[data-flush]` content too,
  floating a flush table 18px off its header (measured: a described 関連ファイル section at
  content padding-top 18.4px vs its 備考 sibling at 0). Both halves of the pair now carry
  `:not([data-flush])`; a counter-case test pins that the selector skips flush content.

### Fixed

- **Two card-layout rules had never applied: nested `:has()` is spec-invalid (structural-selector
  sweep)** — Selectors 4 forbids `:has()` inside `:has()`, and Chrome drops the whole rule
  (`CSS.supports` = false, measured on Chrome 151) while the file looks correct — the same
  failure class as the headerAlign selector. Rewritten as valid rule pairs, so two documented
  behaviors now actually happen: a toolbar header (action, no description) removes the body's
  top padding (16px → 0), and a plain header over a tight body becomes symmetric (24/0 → 16/16).
  Consumers using those two card shapes shift by those pixels — that is the documented intent
  finally applying. The sweep added 34 tests that extract every structural selector from the
  shipped CSS and run `.matches()` on rendered DOM (`src/test/css-selector.ts`); the other 37
  rules all select what they claim.

- **gh#305's frame removal also erased the flush table's TOP divider (gh#306)** — the top edge
  meets the CardHeader area, not the card border, so dropping all four edges left the header
  band floating with no separating line (a rental detail's 出荷伝票一覧 section). The rule now
  keeps `border-block-start` and drops only the three edges that coincide with the card frame.

### Fixed

- **`Table bordered` flush inside a Card doubled the frame (gh#305)** — the card already frames
  its flush content, so the table's own outer border rendered two nested rounded frames
  (measured on a consumer detail section). `[data-slot="card-content"][data-flush]
.ui-table-bordered` now drops only the outer frame; the vertical column rules (the point of
  `bordered`, gh#274) and row rules are unchanged, and a bordered table outside a flush card
  keeps its frame. Tested by running the shipped selector with `.matches()` against rendered
  DOM (the 505f0e6 lesson).

### Fixed

- **`DataTable` `headerAlign="center"` selected nothing** (`505f0e6`) — the sort-indicator rule
  used `:not(:first-child)`, but a string header renders as a TEXT node, so the svg chevron IS
  the first element child and the negation excluded the exact node it targeted: the box was
  centered while the text inside stayed 8px off. Now `> :last-child`, correct for both
  `[text, svg]` and `[element, svg]` label shapes. The old CSS-string-reading tests stayed green
  through the breakage; the new test runs `.matches()` against a really rendered DOM.

### Added

- **`Upload` gains `triggerSize`** (`b52106c`) — the self-rendered trigger button could not be
  sized from the consumer, so it could not sit in a toolbar next to icon buttons. Accepts the
  Button size scale; icon sizes move the label to `aria-label` and render icon-only. Default
  unchanged.
- **`DataTable` columns gain `headerAlign`** (`6d7d210`) — align a header cell independently of
  its body cells (a numeric column whose heading should stay start-aligned, and the reverse).
  `align` alone keeps applying to both.

- **`SplitPane` gains `asideWidth="lg"` (30rem)** (`bffaf58`) — measured against the real
  Backlog reference: its fixed rail is 475px on project home/files, and the existing `md`
  (22rem = 352px) falls 123px short. `lg`'s container-query threshold is 64rem (not the 48rem
  of `sm`/`md`) so the main pane never ends up narrower than the rail. `sm`/`md` values are
  intentionally untouched.

### Fixed

- **`Form columns={n}`: the field-to-field row rhythm leaked into the grid (gh#304)** — the
  gh#295 rhythm rule (`.ui-form-field + .ui-form-field { margin-block-start }`) matches adjacent
  siblings ANYWHERE, including ResponsiveGrid items, where the grid's own `gap` already owns the
  rhythm. The margin double-spaced every row (track 29.4 → 40.5px at density tight) and broke
  column alignment: the FIRST field has no preceding sibling and no margin, so row 1's columns
  sat 11px apart — measured on every one of the consumer's 57 two-column search cards. Grid
  ITEMS now zero the margin (`.ui-responsive-grid > .ui-form-field + .ui-form-field`); fields
  merely stacked INSIDE one grid cell are not direct children and keep the rhythm. Measured
  after: both columns share one top per row (203/203, 247/247, …), pitch 55 → 44px.

## [18.14.0] - 2026-08-23

### Added

- **`FormErrors` + `Form errors` + `FormField name` — the server error bag gets a home for every
  message** — an Inertia app has endpoints whose Laravel validation errors attach to
  hidden/derived fields (`action_mode`, `page`, `source_slip_cd`…) that no visible field displays,
  so the user pressed save and saw NOTHING. `Form` now accepts the whole bag
  (`errors={form.errors}`); a `FormField name="…"` resolves its own message from the bag (an
  explicit `error` prop wins, arrays surface their first message — Laravel `$errors->first()`
  semantics) and CLAIMS its key in a reference-counted registry; `<FormErrors />` renders only the
  unclaimed remainder as an `Alert tone="destructive"` (role="alert", localized default title
  `dataEntry.formErrors.title`), and renders nothing while every entry is claimed. The consumer
  never maintains a per-page except-list — that is the point. `FormFieldControl` forwards its
  `name` on both paths, so `FormRoot`-driven fields claim their keys too. New vocabulary type
  `ErrorBagProp` (`Partial<Record<string, string | string[]>>`).

- **`FormErrorsProvider` — one bag over sibling Forms** — the standard consumer edit screen
  splits into several sibling Card+Form sections sharing ONE server bag, and a registry private
  to each `Form` would make `<FormErrors />` in section A repeat every message section B already
  claims. `Form` therefore provides the claim registry only when it carries its own `errors`; a
  Form WITHOUT the prop joins a surrounding `FormErrorsProvider` (new public export) so every
  section's `FormField name="…"` claims into the same registry and one `<FormErrors />` covers
  the whole screen. A nested Form WITH its own `errors` still starts a shadowing registry.
  New prop type `FormErrorsProviderProp`.

## [18.13.1] - 2026-08-23

### Fixed

- **`FormField`'s label now reaches every control NESTED under a composite wrapper (gh#303)** —
  `cloneElement` wires the field-a11y contract onto the single direct child only, so when that
  child was a layout wrapper (a `Flex` holding a range from/to pair, a 年/月 input+select combo)
  every control inside was left with no accessible name at all: an axe sweep of 92 real app
  screens measured `label` (critical, 46 nodes — the from/to `<input>`s) and `button-name`
  (critical — nameless Radix Select / SearchSelect `role=combobox` triggers). FormField now also
  publishes its label through `FieldNameContext` (`src/lib/field-a11y.ts`), and each control's
  semantic focus target — `Input`'s `<input>` (hence NumberInput, DatePicker and everything
  composed on it), `SelectTrigger`, `SearchSelect`'s trigger — adopts it as a LAST-RESORT
  accessible name. A control that already has a name (its own `aria-label`/`aria-labelledby`, or
  the one FormField cloned onto it as the direct child) keeps it untouched, so set a per-control
  `aria-label` when the halves should announce distinct names (開始日/終了日).

- **A named `Flex` renders `role="group"` instead of an invalid named bare div (gh#303)** — a
  role-less `<div>` may not carry naming attributes, and FormField legitimately lands
  `aria-label`/`aria-labelledby`/`aria-required` on a Flex that wraps a composite field (axe
  `aria-allowed-attr`, critical, 5 nodes on 4 real app screens). A Flex carrying a naming
  attribute with no explicit `role` now defaults to `role="group"` and keeps only the aria the
  group role allows — `aria-errormessage` folds into `aria-describedby`, widget-only
  `aria-required`/`aria-invalid` are dropped (the `pickGroupFieldA11y` policy). An explicit
  `role` prop opts out entirely (e.g. `DataTable.BulkActions`' `role="region"` is untouched).

## [18.13.0] - 2026-08-22

### Added

- **`Form` gains `asChild` (from the in-flight work committed as `Form: asChild, and a
label-column type token`)** — Inertia's `<Form action method>` and TanStack Form render their own
  `<form>`, and two form elements cannot nest, so a consumer had to choose between the router's
  submission handling and the design system's field layout: `FormField` reads its layout from
  `Form`'s context, and the only way to provide that context was to render a second form element.
  `asChild` keeps the context and hands the element back
  (`<Form asChild layout="horizontal" labelWidth={174}><InertiaForm …/></Form>`). Also adds
  `--form-label-font-size`, applied through `Label`'s own className because `Label` sets `text-sm`
  on the element itself, so a font-size inherited from an ancestor never reaches the text.

- **`ErrorSurface` accepts `400` (gh#301)** — the status union was `403 | 404 | 500 | 503`, so a
  Bad Request page (a CakePHP `BadRequestException` port, for instance: the launch parameters are
  invalid) could only be expressed by casting the status at the call site and hand-supplying
  `icon`/`tone`, since `STATUS_META` had no entry to derive them from. `400` now carries
  `TriangleAlert` + `tone="warning"` — this system's warning glyph, the same mark `Alert
tone="warning"` and the warning toast already use — because a malformed request is neither a
  miss (404), a refusal (403) nor a failure (500).

### Fixed

- **`PageContainer`'s header `extra` could not wrap, and starved the `<h1>` instead (gh#300)** —
  at `>=640px` the action slot was `width: auto` + `flex-shrink: 0`, i.e. frozen at the action
  group's max-content width, which is unbounded: an admin list header with 10–13 buttons asks for
  more room than the content column has. Because the box could not shrink, the `flex-wrap: wrap`
  it already declared never had a narrower width to wrap into, so the entire deficit was charged
  to `.ui-page-header-heading` (`min-w-0`) — the title collapsed to 0px and wrapped one CJK
  character per line while action buttons still overflowed the page. The `<=720px` escape hatch
  (`.ui-page-header-extra > .ui-flex { max-width: 100% }`) could not help either: a percentage
  resolved against a `fit-content` parent is circular. `extra` is now `flex-shrink: 1` +
  `min-inline-size: 0`, keeping its max-content base size — a header that already fits is
  byte-identical (measured: 1 and 4 button headers unchanged at 768/1024/1280/1456, and the whole
  `<640px` arrangement unchanged) — while a crowded one wraps its buttons and leaves the title a
  readable measure (768px/13 buttons: `<h1>` 0px · 21 lines with 2 buttons off-screen → 233px ·
  2 lines with none off-screen). Rejected alternative: pinning the heading with `flex: 0 0 auto`,
  which would have made a long title unable to yield space — the mirror image of the same bug.

## [18.12.20] - 2026-08-21

### Changed

- **Noto Sans JP is now the primary bundled face; M PLUS 2 is the fallback (product override,
  direct instruction)** — reverses the primary/fallback order the v18.12.0 bundle change set. Every
  locale's font stack (`--font-sans-base`, `--font-sans-vi`, and the email-safe
  `--email-font-family-sans`) now names Noto Sans JP first, M PLUS 2 second; both faces stay
  bundled, only the order flips. Before flipping, re-measured the historical #254 clipping
  guard (a tight line-height that sheared Vietnamese tone marks and Latin descenders) against
  real Chromium canvas ink extents for both faces at the sidebar nav's 0.8125rem — Noto Sans JP's
  worst-case ink (14.65px) stays under M PLUS 2's own worst case (15.38px) that the existing
  `--sidebar-nav-item-line-height: 1.5` token was validated against, so no regression there.

## [18.12.19] - 2026-08-21

### Changed

- **`AppSettingPicker`'s icon-only trigger drops its resting border/bg/shadow (gh#297)** — it
  reused `controlTriggerClass`'s form-input chrome (`border border-input bg-background shadow-sm`),
  meant for labeled Select triggers. In a shell topbar (`kind="locale"`, `appearance="icon"`, the
  canonical locale switcher — see `ShellFrame`) it sits beside ghost icon buttons (sidebar toggle,
  notifications, account menu) with no border at rest, so the bordered box read as an inconsistent
  outlier. Now `border-transparent bg-transparent shadow-none` at rest with a `hover:bg-accent`
  ghost hover, matching its siblings; the open-state ring (`data-[state=open]:border-ring`, from
  `controlTriggerClass`) and the focus-visible ring are untouched. Scoped to the icon appearance
  only — labeled/inline Select triggers (forms, settings rows) keep their input-like chrome.

## [18.12.18] - 2026-08-21

### Changed

- **Topbar search trigger fills the center slot by default (gh#296)** — product override, direct
  instruction. `.tb-search` was a fixed ~420px box (`--topbar-search-max-width: 26.25rem`),
  centered regardless of available room, leaving visible dead space before whatever sits in `end`
  (locale picker, notification bell, account menu) at normal desktop widths. `--topbar-search-max-width`
  now defaults to `none`; `.tb-search` is `width: 100%; max-width: var(--topbar-search-max-width)` —
  it fills the slot flush to `end` by default. A consumer wanting the old capped, centered look sets
  the token explicitly (e.g. back to `26.25rem`).

## [18.12.17] - 2026-08-21

### Fixed

- **Form's field-to-field row rhythm was structurally dead once a FormField nested through
  CardContent (gh#295)** — `.ui-form`'s rhythm was a flexbox `gap`, which only reaches DIRECT
  children. The real composition every Save-button form needs (`Form` wrapping `CardContent` +
  `CardFooter`, so the submit button stays inside the `<form>`) puts `FormField`s one level deeper
  as grandchildren, past `gap`'s reach — consecutive fields rendered with zero intentional
  spacing. Replaced with margin-based sibling spacing at two specificity tiers: `--form-block-gap`
  (unchanged `--space-4`) for a Form's own top-level blocks, and the new, more-specific
  `--form-field-row-gap` (`--space-3`, mirrors `--descriptions-row-gap` from gh#294) for
  field-to-field rhythm — this wins by CSS specificity whenever two `FormField`s are adjacent, at
  any DOM depth relative to `Form`. No more page-local `<Flex gap="md">` workaround needed around
  a FormField group.

## [18.12.16] - 2026-08-21

### Fixed

- **`.ui-data-table-surface` uses `overflow: clip`, not `hidden` — `stickyHeader` was a no-op
  (gh#291 family)** — `hidden` made the surface a scroll container between the real scroll region
  (`.ui-data-table-scroll`) and the table, so `stickyHeader`'s (default `true`) sticky context, and
  the pinned column's, anchored to a box that never scrolls — the header scrolled away with the
  body. `clip` preserves the same rounded-border clipping without becoming a scroll container, so
  sticky binds to the real scroll region (measured: `hidden` → thead moved 300px per 300px
  scrolled; `clip` → 1px).

### Added

- **`Descriptions` gains `labelAlign` + a themeable row-gap token (gh#294)** — mirrors `Form`'s own
  `labelAlign` contract exactly (same prop, same `text-align: end` mechanism, same vertical-only
  guard), so a `Descriptions` block can be told to align like a `Form`/`FormField` composed beside
  it. The row-to-row gap moves from a hardcoded `gap-y-3` utility to `--descriptions-row-gap`
  (default `var(--space-3)` — visually identical to the historical value); a consumer placing
  `Descriptions` next to a `Form` on one card retunes it to `var(--space-4)` to share the same
  rhythm. Both default to today's exact rendering — no existing consumer's output changes.
- **`FormField` gains `staticText` — a read-only VALUE row on the same `Form` (gh#294)** — for a
  field genuinely mixed into an otherwise-editable form (an immutable name/email row above an
  editable role `Select` on the same card), `<FormField label="…" staticText="…" />` renders plain
  text matching `Descriptions.Item`'s value typography byte-for-byte, skipping FormField's control
  a11y wiring entirely (there is no control to label). Because it's the same `FormField` reading
  the same `Form` context, it inherits `layout`/`labelAlign`/row-gap automatically — nothing to
  reconcile between two different components by hand. Mutually exclusive with `children`.

## [18.12.15] - 2026-08-21

### Fixed

- **`.app-sidebar` joins the ring-headroom contract (gh#291)** — same defect as the topbar in the
  other half of the shell: `overflow: hidden` with nav rows flush against the rail's inline edges
  clipped a focused row's ring on three sides. Now `overflow: clip` + `var(--focus-ring-clip-margin)`,
  joining the `@supports` Safari fallback.

### Added

- **`Table preset="stacked-record-collection"` restored (gh#293 — SCR-215)** — the canonical WIDE,
  heterogeneous record collection: a table whose columns/content cannot be squeezed into any fixed
  narrow-frame measure at all (an admin detail row with many disparate, free-text fields), as
  distinct from `action-collection`'s dense five/six-column queue. Below `collapseBelow` the
  `<thead>` hides and every `<tr>` becomes a bordered key-value card; each `TableCell`'s own new
  `label` prop renders inline above its value, taking over the accessible-name role the hidden
  `<th>` would otherwise carry. Above the step it renders as a byte-for-byte ordinary table. This
  preset previously shipped to npm (≤18.12.11) but was never committed to this repository's
  tracked history, so a later direct-local-publish from a checkout without it silently dropped the
  capability with no deprecation notice — restored here with the same container-query architecture
  as `action-collection` (measured against the table's own container, one step per canonical
  sm/md/lg/xl breakpoint) plus its own themeable card/label tokens
  (`--table-stacked-collection-*`).

## [18.12.14] - 2026-08-21

### Fixed

- **Topbar ring headroom actually applies — Chromium rejects calc() in overflow-clip-margin
  (gh#291 follow-up)** — 18.12.13 set the margin to `calc(2 * var(--focus-ring-width))`, which
  Chromium drops at parse time (even a literal `calc(2 * 2px)` is refused), silently degrading
  the headroom to 0 and clipping flush-edge rings harder than before. The value now lives in a
  dedicated plain-length token `--focus-ring-clip-margin: 4px` consumed as a bare `var()`,
  which Chromium honours (verified live: computed 4px, ring fully painted on all four edges).

## [18.12.13] - 2026-08-21

### Fixed

- **Topbar flush-edge focus ring no longer shaved on the clipped axis (gh#291 follow-up)** —
  the rails' `overflow-clip-margin` was `var(--focus-ring-width)` (2px) while focus/open rings
  paint up to 3px, so a control flush against a rail edge (the locale picker is the first child
  of `end`) lost 1px of ring on the left. Bar and rails now reserve
  `calc(2 * var(--focus-ring-width))`, and `.ui-topbar` itself gained the same margin so the
  last control's outer edge survives the bar-level clip too.

## [18.12.12] - 2026-08-21

### Fixed

- **Topbar no longer clips its controls' focus ring (gh#291)** — `.ui-topbar` used
  `overflow: hidden`, whose box hugs `--control-height` exactly, so the 2–3px outward
  focus ring of slot controls (AppSettingPicker, icon buttons, the user menu) was cut
  flat at top and bottom; the rails' `overflow-clip-margin` could not help because the
  parent had already swallowed the ring (and Safari does not implement clip-margin).
  Bar and rails now clip the horizontal axis only (`overflow-x: clip` +
  `overflow-y: visible` — a `hidden`/`visible` pair would compute to `auto` and still
  clip), keeping the shrink/truncation contract while the ring paints fully.

- **Page-size TRIGGER uses the shortest per-locale form (gh#290)** — the long unit on the
  control itself (「50 件/ページ」) took disproportionate space; the trigger now renders the new
  `pageSizeTrigger` string (ja 「50件」 / en "50 / page" / vi "50 / trang", the kintone
  treatment) while the menu keeps bare numbers (gh#289) and the ページサイズ aria-label stays.

- **Page-size menu is compact (gh#289)** — repeating the full localized unit on every dropdown
  row (「15 件/ページ」×4) was long and redundant; the menu now lists bare numbers while the
  TRIGGER keeps the localized unit (「20 件/ページ」), the MUI/kintone treatment.

- **ja: size-changer reads 「15 件/ページ」 (gh#288)** — the ja `pageSizeOption` was a literal of
  the EN "15 / page"; natural Japanese (and antd's ja_JP convention) uses the 件 counter.

- **Pagination size-changer no longer clips localized labels (gh#286)** — the trigger was a
  fixed `--pagination-size-width` (5.5rem, sized for the EN label) and the ja locale rendered
  「20 / ペ…」truncated. The trigger now sizes to its content (`w-max`); the token is demoted to
  a MIN width so short labels keep the control rhythm.

- **Horizontal Form defaults to a fixed, aligned label column (gh#284)** — the old
  `--form-label-width: max-content` sized each field's label column to its own label, so
  multi-column horizontal forms had controls starting at ragged x positions. The default is now
  `8rem`, mirroring `--descriptions-label-width` so edit forms and show pages share one optical
  grid; the `labelWidth` prop and the token still override per form/tenant.

- **Alert's default radius is now the Card radius (gh#282, gh#268 follow-up)** — an Alert almost
  always sits in the same page column as Cards, and the old `--radius-md` default (2 φ-steps
  smaller than `--card-radius`) read as mismatched corners that every tenant re-aligned by hand.
  `--alert-radius` now defaults to `var(--card-radius)`; override the token for a smaller radius.

- **Plain (non-searchable) Select honors `clearable` (gh#280)** — the plain branch dropped the
  prop entirely, so no clear affordance ever rendered despite the documented default-true
  contract. It now mirrors SearchSelect: while a CONTROLLED value is selected (and not
  disabled/readOnly) the chevron swaps for an X overlay that emits `onValueChange("", undefined)`;
  `clearable={false}` and uncontrolled selects keep the previous DOM byte-identical.

### Added

- **`check:mcp-catalog-coverage` release gate (gh#278)** — consumer audit found the published
  18.11.x MCP catalog denying components the package actually ships (`rbac-service-roles` said
  ServiceRolePanel / BranchScopePicker / PermissionMatrix "do not exist" while all three are real
  exports, and `get_component PageHeader` documented a standalone export that never shipped). The
  catalog entries were already fixed on main; this gate keeps them fixed: every public export in
  `component-api-manifest.json` must be discoverable somewhere in `mcp/src/data/*.ts`, and catalog
  prose may not carry existence-denial claims ("NO <Export>", "<Export> does not exist") for a
  shipped export. Wired into `verify` and `verify:static`.

- **Region focus ring is token-gated and OFF by default (gh#276)** — gh#271 gave
  `.app-main:focus-visible` the control-strength DS ring, but a 2px brand frame around the whole
  content region reads as a glitch to mouse-first users (`:focus-visible` promotes on any keypress
  after a click-focus). New tokens: `--region-focus-ring-width` (default `0` — no ring; a
  deliberate product tradeoff against WCAG 2.4.7 keyboard-scroll visibility) and
  `--region-focus-ring-color` (`initial` → resolves to the live focus-ring hue at the call site).
  Opt back in with one line: `--region-focus-ring-width: var(--focus-ring-width);`.

- **`Table bordered` prop (gh#274)** — draws the full cell grid: a 1px outer frame plus vertical
  rules between columns (horizontal row rules already come from TableRow). For tables carrying
  rowSpan/colSpan merged cells (permission matrices, 帳票-style grids) — without column rules the
  merge relationships are unreadable. Colour via the new `--table-border-color` component token
  (declared `initial`, resolving to the live `--border` role at the call site). Default `false`
  keeps the plain table byte-identical.

### Fixed

- **DataTable scroll-hint fade rendered unconditionally (gh#267)** — `.ui-data-table-scroll::after`
  was pure CSS with no overflow detection, so every table WITHOUT a `pin:'end'` column showed a
  permanent inline-end fade washing out its last column even when nothing scrolls. The component
  now measures the scroll box (scroll + ResizeObserver, RTL-safe) and stamps
  `.ui-data-table-has-overflow-end`; the fade only shows while the region overflows and is not
  scrolled to the inline-end.

### Added

- **`--alert-radius` component token (gh#268 — rule #45)** — Alert's corner radius was a
  hard-coded `--radius-md`; a full-width Alert sitting above a Card (`--card-radius`, 2 φ-steps
  larger) read as unsynchronized corners with no knob to align them. Default unchanged.

- **`AuthShell preset="registration"` (gh#256)** — the canonical SCR-002 sign-up measure: a
  22.5rem/360px form measure with a 15px inline gutter at 390 (card x=15, width=360, the same page
  rhythm as `preset="login"` so sign-in → sign-up never jumps on a phone). START-aligned like
  login — a registration card is the tallest surface in the hosted-identity set and a vertically
  centred tall card overflows ABOVE the scroll origin on a short viewport, putting its first field
  out of reach; start-aligned, a long form simply scrolls. The only preset with a
  footer-clearance knob of its own (`--auth-shell-registration-main-padding-block-end{,-mobile}`,
  3rem/2rem) so the legal/consent footer never sits flush against the submit button. The
  block-start offset is DERIVED from the canonical artboard (card y=284 at 1440x900, y=274 at
  390x844 = padding-block-start + 112px identity track + 20px stack gap), and the fixed identity
  track absorbs absent / one-line / wrapped two-line identity copy without moving the card anchor.
  Carries the full password registration form AND the pending-email confirmation state with no
  consumer geometry CSS. New tokens: `--auth-shell-registration-{card-max-width,
main-padding-block-start, main-padding-block-start-mobile, main-padding-inline,
main-padding-inline-mobile, main-padding-block-end, main-padding-block-end-mobile,
card-stack-gap, identity-slot-block-size}`. Worked screen:
  `docs/layout/auth-shell-registration.tsx`; visual contract:
  `scripts/auth-shell-registration-visual.mjs` (`pnpm test:visual:auth-registration`).
- **`SocialLinks` and `OrganizationChoiceList` are formally documented COMPOSITIONS (gh#256), not
  components.** Both fail the Framework-Component Test: the social/provider action row is
  `<AuthDivider label="…"/>` + a `Flex direction="col" gap="sm"` of real
  `Button variant="outline"` (which providers a product offers, in what order, and what consent
  they imply are product decisions the package must not invent; `disabled`/`loading` are the
  Button's own props). The organization choice list is `Card` > `CardContent flush` > a `<ul>` of
  `ListRow as="li"`, with its loading / empty / error / denied / disabled states drawn from
  existing exports (Skeleton rows, `EmptyState`, `Alert tone="destructive"` /
  `tone="warning"`, the Button's own `disabled`) — never bespoke markup. Both are catalogued in
  the MCP AuthShell entry and demonstrated with every state in
  `docs/layout/auth-shell-registration.tsx`.
- **`PermissionMatrix`, `BranchScopePicker`, `ServiceRolePanel` — the three canonical DXS RBAC
  composites are now REAL public exports** (gh#257, unblocking DXS platform#311). The decision
  followed the gh#251 ErrorSurface precedent: the permission-matrix showcase already proved the
  composition, but a consumer cannot import a docs page, so each canonical contract now has an
  importable home while staying a THIN formalized composition over existing primitives — no new
  interaction machinery, no new tokens, and NO platform domain data (roles, permissions, branches
  and grants all arrive via props).
  - `PermissionMatrix` (`@godxjp/ui/data-display`) — sticky-permission-column role × permission
    grid over the Table family + the tested `lib/permission-grid` helpers. Read-only ✓/— cells by
    default (shape + `sr-only`, never colour-only); `onGrantChange` switches to real `Checkbox`
    cells with `locked` roles and `readOnly` staying read-only; `compare`/`diffOnly` reuse the
    helper logic; lifecycle states use the DataTable #216 vocabulary and precedence
    (`loading` → `denied` → `error` → `empty`, with `onRetry` on the built-in error only).
  - `BranchScopePicker` (`@godxjp/ui/data-entry`) — the all-branches-vs-subset scope control as
    ONE controlled `{ mode, branchIds }` value (mode flips preserve `branchIds`), composed from
    `RadioGroup` + `CheckboxGroup` + `SearchInput` so keyboard and field-a11y come from the
    primitives. `error` stays FIELD VALIDATION (wired `aria-invalid`/`aria-errormessage`);
    collection reads use `listError`/`denied`/`loading`/`empty`; `readOnly` renders a static
    badge summary.
  - `ServiceRolePanel` (`@godxjp/ui/layout`) — role-collection ⇄ detail over `MasterDetail`
    (`rail="master"`; geometry stays token-owned: two tracks at 1440/1024, stacked at 390).
    Controlled selection triad with `aria-current` role rows, CLDR-pluralized member counts,
    `locked` system roles, and a built-in destructive `AlertDialog` — `onDeleteRole` fires only
    AFTER the user confirms; `readOnly` hides every mutating affordance; #216 lifecycle states.
  - The `docs/showcase/permission-matrix` header no longer teaches "not a framework component"
    (the exact wrong-guidance propagation gh#251 documented); it now points at the export and
    remains as the composed variant. New docs pages: `docs/data-display/permission-matrix.tsx`,
    `docs/data-entry/branch-scope-picker.tsx`, `docs/layout/service-role-panel.tsx`. Contract
    pinned by `src/components/__tests__/rbac-composites.test.tsx` (exports, state precedence,
    read-only/locked/editable semantics, destructive confirmation, basic keyboard, vi/ja/en keys).

### Fixed

- **DataTable no longer silently caps a plain table at 10 rows (gh#270)** — the internal
  TanStack pagination default (pageSize 10) sliced every `data`+`columns` table even when no
  `<DataTable.Pagination>` was composed and no pagination props were passed: rows 11+ were
  unreachable with no pager UI and no warning. Client pagination now engages ONLY when
  something drives it — a numbered `<DataTable.Pagination>` child (cursor mode is server
  paging and is never client-sliced), or controlled `pagination`/`onPaginationChange` state.
  A plain table renders every row.

- **AppShell content region no longer shows the browser default blue focus ring (gh#271)** —
  `.app-main` carries `tabindex="0"` (axe `scrollable-region-focusable`, dbad118) but had no
  `:focus-visible` style, so tabbing into the region drew the user-agent outline (blue in
  Chrome) around the entire content area. It now uses the design-system ring
  (`--focus-ring-width` / `--focus-ring-color`→`--ring`), INSET because `.app-main` is the
  shell's `contain: paint` clip boundary. The indicator stays visible — the region is
  keyboard-focusable and WCAG 2.4.7 requires focus to be shown.

- **Release staging dist-tags no longer accumulate on the registry.** Every release staged both
  packages under a per-version `godx-staging-${version}` dist-tag and planned a final
  `npm dist-tag rm` pair — but deleting a dist-tag needs npm DELETE rights the CI automation token
  does not have (and a human login is still OTP-gated), so the removal steps aborted every release
  and the tags piled up forever (`godx-staging-18.{7,8,9}.0` on both `@godxjp/ui` and
  `@godxjp/ui-mcp`). `scripts/release-core.mjs` now stages under the single constant, OVERWRITABLE
  `godx-staging` tag: each release overwrites the previous pointer, nothing accumulates, and no
  delete permission is ever needed. After a successful release `godx-staging` deliberately equals
  `latest` until the next release moves both. Pre-#266 recovery-state files (schemaVersion 2, with
  the versioned stageTag and the removal-progress flags) remain loadable and are normalised on
  validation. **One-time manual cleanup**: the six legacy tags already on the registry must be
  removed by a human with 2FA/OTP (command in godx-jp/godxjp-ui#266) — the script never creates
  versioned staging tags again.
- **`Table` / `DataTable` `preset="action-collection"` — a compact-tier legibility floor:
  `--table-action-collection-min-inline-size-compact` (dxs-platform/platform#680).** The preset's
  percentage budget is sized for ONE column per priority tier plus one free-text column: 24%
  primary + 22% secondary + 20% meta + a 2.75rem action measure. A queue that REPEATS a tier — two
  `secondary` columns, three `meta` columns, or a second unmarked column — asks for more than 100%,
  and under `table-layout: fixed` the surplus comes out of the COLUMNS rather than out of the
  table. Measured on a consumer's seven-column Japanese admin queue at 390: 名前 59 · 種別 54 ·
  支店 54 · シリアル番号 49 · 最終接続 49 · 状態 49 · 操作 44 in a 356px table, with シリアル番号
  and 最終接続 wrapping at TWO characters per line and a six-column sibling reaching ONE character
  per line in a 14px box. That is a WCAG 2.2 SC 1.4.10 Reflow (AA) failure — the content is present
  and unreadable — and the preset had no seam through which a consumer could say so.

  The new token is the measure below which the preset stops fitting the table to its container.
  Above the floor nothing changes. Below it the `overflow-x: auto` region the table already owns
  takes the overflow instead of the cells, which is the conformant outcome rather than a
  concession: SC 1.4.10 exempts "parts of the content which require two-dimensional layout for
  usage or meaning", and its own note names data tables as the example. A queue that scrolls
  horizontally inside its card conforms; a queue whose cells are one character wide does not.

  **Default `0`, so this is inert for every existing consumer** — a queue that fits its priority
  budget keeps fitting, at the same measures, with no scroll introduced. Nothing is hidden, no
  breakpoint is invented, and the table is byte-identical at 1440. Applies at all four collapse
  steps (`sm` / `md` / `lg` / `xl`).

- **`CommandPalette` — a real query accessor: `search` / `defaultSearch` / `onSearchChange`, plus
  `shouldFilter` (gh#412).** A server-backed result group could not learn what the user had typed:
  the palette exposed the open state and the groups, and nothing in between. The only route left was
  reaching into the internal `cmdk-input` element, which a consumer built, proved, and then reverted
  rather than ship — driving the palette through its own internals destabilised their empty-state
  contract test, because cmdk decides that node from a SCHEDULED count of the items that have
  registered in the DOM, so an async group populating a frame late flips it on and off. That was the
  right call, and this is the seam that makes it unnecessary. The pair follows the `SearchSelect`
  idiom (`search` + `onSearchChange`) and adds the uncontrolled half `SearchSelect` lacks: pass
  `search` to control the query, `defaultSearch` to seed it, or neither. `onSearchChange` fires on
  every keystroke either way, and once more with `defaultSearch` when the palette closes — the query
  has never survived a close (it used to fall out of the dialog unmounting cmdk), and now that it is
  a prop the palette says so out loud, so a controlled consumer can drop the result set it fetched
  for the abandoned query. `shouldFilter={false}` hands filtering to the consumer, which is what
  server-side search needs: without it every row the server already matched is scored a second time
  against the same string.
- **`CommandPalette` — a stated empty-state contract, and `shouldFilter={false}` changes who owns
  it (gh#412).** With `shouldFilter` (the default) nothing moves: cmdk owns the empty node, and it
  means "this palette holds items and the query matches none of them". With `shouldFilter={false}`
  the PALETTE owns it, derived synchronously from props — `labels.empty` renders when `groups`
  carries no items, and never while `loading` or `error` is set. cmdk's node cannot be trusted in
  that mode, because it counts DOM registrations on a scheduler rather than reading what the
  consumer knows; reading `groups` instead makes "did we render the empty state?" a pure function
  of that render's props, which is the thing a contract test can assert without racing. The
  practical rule, now documented on the component and in the MCP catalog: hold `loading` for the
  whole in-flight window — a request that has not answered yet is not an empty result. No new prop
  was needed to say it.

### Fixed

- **Controls that narrow viewports were hiding (WCAG 2.2 SC 2.1.1 / 2.4.7 / 1.4.10).** Found by the
  frame-geometry sweep across 154 frames × 8 widths, which now reports zero.
  - `Rating` laid its stars in a non-wrapping row. A 10-star scale needs ~276px of hit area; a
    320px viewport offers ~212 inside a card, so the last stars were painted outside the surface
    with nothing to scroll them into view — unclickable and invisible. The row now wraps, which is
    a no-op wherever it already fits.
  - `DataTable` on a **flush** `PageContainer` gave the whole page 16px of horizontal scroll at
    320/375/390. The scroll region bleeds by `-var(--space-page-active-x)` to cancel the page
    gutter and reach the page edges, but `.ui-page-container--flush .ui-page-body` zeroes that
    gutter — so the bleed escaped the page with nothing to clip it. Reset for a table sitting
    directly on a flush page, exactly as it already was inside a flush `CardContent`. A table
    inside a `Card` keeps its bleed: the card supplies the padding it compensates.
  - `Tabs`: the strip is a centred flex box that also scrolls, and plain `justify-content: center`
    splits the overflow across BOTH edges while `scrollLeft` only ever covers the trailing one —
    so at 320px the leading tab sat permanently outside the scrollport, reachable by no gesture.
    Now `safe center`, which falls back to start alignment exactly when it overflows and still
    centres whenever the tabs fit.

- **A compound `Select` under `FormField` had NO accessible name (WCAG 2.2 SC 4.1.2, critical).**
  `FormField` hands its label/helper/error wiring to a single child with `cloneElement`. In the
  compound API that child is `SelectPrimitive.Root` — a context-only component that renders no DOM
  — so `id` and every `aria-*` were silently dropped and never reached the trigger button. The
  visible value was not a fallback: the trigger is `role="combobox"`, which takes no accessible
  name from its content, so `<FormField label="担当拠点"><Select><SelectTrigger>…` shipped an
  anonymous combobox to assistive tech. axe reported `button-name` (critical) on every such
  trigger; the data-driven `<Select options>` API was unaffected because it forwards `aria-*` to
  the trigger explicitly. `Select` now routes the field-a11y contract — plus `id`, so
  label-click-to-focus resolves — through context to `SelectTrigger`, which also fixes a bare
  `<Select aria-label="…">` in compound form. Props set directly on `SelectTrigger` still win, and
  a trigger that states its own name (`aria-label`/`aria-labelledby`) keeps it whole rather than
  inheriting a competing `aria-labelledby`.

- **A `ResizablePanel` or fully disabled `Pagination` could scroll but not be reached by keyboard
  (WCAG 2.2 SC 2.1.1).** `react-resizable-panels` hardcodes `overflow: auto` on the nested div it
  applies our class to, and the pagination strip scrolls horizontally instead of wrapping. Tabbing
  to a focusable child normally scrolls such a region — but a panel holding only text, or a
  pagination bar whose every button is disabled, offers no focusable child, so the clipped content
  was unreachable without a pointer. Both now measure at runtime (size and content, kept in sync as
  either changes) and take `tabindex="0"` only in that case, so no redundant tab stop appears where
  the content is already reachable.

- **`--table-action-collection-font-size-compact` was dead at every width (gh#412).** Reported
  independently by two consumers. `Table` emits its type as a Tailwind utility
  (`<table class="… text-sm">`), and `utilities` outranks `@layer components` by LAYER ORDER — so
  the compact tier's `font-size:` re-point could never apply, however specific it was written. The
  documented token had no effect, and the measured consequence only ever showed up in Japanese: in
  the 390px frame the `action-collection` table is 356px, `primary` takes 24% ≈ 69px of content,
  and `タイムゾーン` at the effective 14px needs 84px — so the compact tier could not hold a 5–6
  character Japanese label and broke it toward one character per line (WCAG 2.2 SC 1.4.10). The
  whole compact tier — type AND the four column measures — now lives in `@layer
godxjp-ui-responsive`, declared after Tailwind in `styles/base.css` and therefore the LAST layer,
  so it outranks `utilities` and cannot be half-collapsed by a consumer utility on the table
  either. At `--font-size-xs` the same label needs ~62px and fits. No markup changed and no default
  moved; the token simply does what it always said it did.
- **`DataTable`'s default cell renderer no longer emits a bare text node into the `<td>`
  (gh#412).** Scalar values (and the `—` placeholder) render inside
  `<span data-slot="table-cell-text">`. A bare text node leaves the padded cell BOX as the only
  geometry anything can measure, and the cell's block padding inflates it — so a single unwrapped
  line reads as wrapped, which is exactly how a CJK one-character-per-line reflow check
  false-positives on a healthy cell (a consumer hit this and correctly fixed their side rather than
  weaken their detector). A column with a custom `render` is untouched.

### Changed

- **New cascade layer `godxjp-ui-responsive`, and the layer contract is now written down
  (cardinal rule #47, `docs/TOKENS.md`).** Declared immediately after `@import "tailwindcss"` in
  `styles/base.css`, so it is the last layer and outranks `utilities`. It is reserved for
  responsive re-points — `@container`/`@media` blocks that must beat a component's own static
  utility — and holds nothing else. The consumer half of the contract matters just as much and had
  never been stated: UNLAYERED app CSS outranks every layer, including this one, so an app must
  theme this package through TOKENS on a wrapper and must not write its own selectors against
  `[data-slot]` / `[data-priority]` internals. One that did killed the package's `@container`
  re-point at every width and rendered a column at 0px, wrapping one character per line. If an app
  genuinely must write such a rule, it belongs in `@layer components { … }`.

- **`Card accentPlacement="perimeter"` — a full attention border in a SEMANTIC tone (gh#12).**
  `accent` was documented and implemented as a leading-edge stripe (`border-inline-start` only), and
  the system's one perimeter — `variant="featured"` — hard-coded `--primary`. So a card that had to
  read as "action required" or "this failed" around its whole edge had exactly one route left: page
  CSS. The tone and its PLACEMENT are now two orthogonal props, and `perimeter` carries the same
  optical weight `featured` has (`--card-accent-perimeter-width` + `--card-accent-perimeter-ring-width`,
  1px + 1px) in the card's own accent colour. It also undoes the rail's slot-padding compensation,
  so switching placement never shifts the body text off the shell column — the failure mode of every
  hand-rolled `border-2` workaround. `edge` is the default and emits no attribute, so every existing
  accented Card keeps byte-identical DOM. `StatCard` forwards the prop for a KPI that needs the same
  treatment.
- **`Avatar appearance="tinted"` — the capability medallion (gh#12).** Canonical capability icons sit
  in a tinted rounded-square medallion. `EmptyState`'s icon plate is centred, `StatCard`'s is
  KPI-semantic, and `Avatar shape="square"` is a SOLID entity mark — so a left-aligned capability
  card had no equivalent and consumers rendered bare glyphs. The medallion is a _composition_
  (`Avatar` + a Lucide glyph, exactly as `docs/COMPOSITION-VS-COMPONENT.md` prescribes) and stays
  one: what the library owed it was the TINT, which had no token, forcing `hsl(var(--primary) / 0.1)`
  to be re-derived in page CSS. `appearance` is orthogonal to `shape`, so
  `shape="square" appearance="tinted"` is the canonical rounded square and a tinted circle costs the
  same one word. Retune with `--avatar-tinted-{background,foreground,glyph-size}`; the glyph rule is
  scoped to this appearance on purpose, since a global `.ui-avatar svg` would outrank the per-call-site
  icon classes existing avatars already carry.
- **`InputOTP align` + `--otp-container-align` (gh#12).** `.ui-otp-container` had no alignment of its
  own, and the container element belongs to `input-otp` — so the only thing a consumer could reach
  was a wrapping flex div, and every one of them wrote it. `align="center"` (the canonical auth
  challenge) is now a prop; the attribute lands on the hidden input and the container reads it back
  through `:has()`, the same mechanism this stylesheet already uses for the invalid and disabled
  states. `start` is the default and emits nothing.
- **`--otp-slot-inline-size` / `--otp-slot-block-size` — a per-AXIS code-field measure (gh#12).**
  `--otp-slot-size` stayed the square shorthand; the two new knobs win over it and fall back to it,
  so the chain (axis → square → `--control-height`) still resolves at the call site. A code field
  that is taller than it is wide was previously inexpressible from a token.
- **`AuthShell preset="device-authorization"` now owns its CODE FIELD (gh#12).** The preset owned the
  page measure but not its own subject: left on the generic square knob, two 4-slot
  `appearance="grouped"` boxes rendered **146×38** against a **112×54** artboard (4 × the canonical
  36px control tier + the 1px group border). The preset now hands the per-axis knobs
  `--auth-shell-device-otp-slot-{inline,block}-size` (27.5×52 per slot ⇒ 112×54 per group), as literal
  artboard lengths like every other measure in that file. Nothing else moves, and the generic
  `--otp-slot-size` default is untouched everywhere else.
- **`Steps separator="arrow"` + inline-emphasis tokens (gh#12).** The inline step row separated steps
  with a chevron (`›`) and marked the number with bold, where the canonical hosted-identity row uses
  an arrow (`→`) and an accent tint. A chevron reads "drill into"; an arrow reads "then", which is
  what a step row means — so the glyph is a prop, and the emphasis is two knobs
  (`--steps-inline-index-font-weight`, `--steps-inline-index-color`, plus
  `--steps-inline-separator-color`). Both glyphs flip under `dir="rtl"`. Defaults reproduce the
  existing row byte for byte.

- **`PageHeader` is now a real export (gh#255).** The page title band — breadcrumbs, `<h1>`,
  subtitle, a new `meta` status slot, `extra` actions, the `layout` arrangement and a `loading`
  pending state — was only reachable through `PageContainer`, so a surface that is NOT a whole page
  (a Sheet detail, a `MasterDetail` pane, a tab body) had to re-author `.ui-page-header` locally.
  Following the gh#251 post-mortem, the deciding question was not the Gate 0 verdict alone but
  whether the consumer can reach the geometry through PUBLIC routes: they could hand-build a header
  from `Breadcrumb` + `Heading` + `Flex`, but they could NOT get the token-owned row gaps, `extra`
  alignment, responsive arrangement or the `--page-header-divider` opt-in without copying package
  CSS — so it is exported. There is exactly ONE implementation: `PageContainer` now renders this
  component, and `page-header.test.tsx` pins the pre-gh#255 header DOM byte-for-byte so the
  extraction cannot have moved an existing page. `denied`/`error` are deliberately NOT states of the
  band — a title band for a resource the user may not see leaks its name, which is `ErrorSurface`'s
  whole-surface contract. `loading` keeps the `<h1>` in the heading outline wearing the library's own
  `ui-skeleton-block` skin (nesting Skeleton's `<div>` inside an `<h1>` is invalid HTML) with an
  sr-only accessible name, because a heading rendered as a bare decorative box is an EMPTY heading
  (axe `empty-heading`, WCAG 1.3.1); breadcrumbs and `extra` are not skeletonised, since they come
  from the route rather than the record.
- **`Banner` — the canonical page-level status strip (gh#255).** `Alert` locked to the new
  `variant="banner"`: square, edge-to-edge, ruled on the block-end edge only, measured by the new
  `--banner-*` tokens. Deliberately an ALIAS, not a second implementation — a banner and an inline
  alert are one object at two measures, so re-deriving the tone→role mapping, icon defaults, actions
  grid and dismiss control would be exactly the duplication this system forbids (the same reasoning
  that makes `FilterBar` an alias of `Toolbar`). `Banner.Title` IS `AlertTitle`, asserted by
  identity in `banner.test.tsx`, so a consumer can never mix two families in one strip.
- **`AuthShell preset="registration"` (gh#256)** — the 360px sign-up measure with a 15px inline
  gutter at 390px, matching `preset="login"` exactly so sign-in → sign-up never jumps on a phone.
  Two things make it structurally distinct rather than a re-skin of `login`, and both are pinned by
  tests: it is the ONLY start-aligned preset, because a sign-up card is the tallest surface in the
  hosted-identity set and a vertically CENTRED tall card overflows ABOVE the scroll origin on a
  short viewport, putting its first field permanently out of reach; and it is the only preset with
  its own footer-clearance knob, so the legal/consent footer never sits flush against the submit
  button at the end of a long scroll. Carries the full password form AND the pending-email state
  with no consumer geometry CSS.
- **A typed search/filter/chip/action/reset/result-count model on `FilterBar` (gh#258).** New
  `search`, `chips`, `onChipRemove`, `resultCount` and `actions` props, plus the `FilterBarChipProp`
  type. ORDER IS THE CONTRACT: DOM order is tab order, and the bar now decides it —
  search → filter groups → applied chips → result count → reset → actions, with reset before
  `actions` so "clear filters" never lands beside an unrelated primary action. `search` is a SLOT,
  so the control finally gets one token-owned measure (`--filter-bar-search-width`) across every
  list page instead of whatever width each page gave it. `chips` owns the chip lifecycle: a labelled
  group, a remove control named after THAT specific filter (a row of buttons all called "Remove" is
  unusable from a screen-reader's control list), no row at all when the array is empty, and NO
  remove control — rather than a disabled one, which is a dead tab stop — for a chip the user may
  not lift. `resultCount` renders in a polite live region formatted via `Intl.NumberFormat` + CLDR
  plurals, which is the accessibility point of the whole prop: a sighted user SEES the table change,
  and this is what tells everyone else. The bar still owns no filter state. Every region is opt-in
  and emits nothing when its prop is absent, so a bar built the old way is geometrically unchanged
  (pinned by a backwards-compatibility test).
- **Packed-consumer coverage for the new surface.** `check:packed-public-contract` now extracts
  `PageHeader`/`PageHeaderProp(s)` and `Banner`/`BannerProp(s)` from the real tarball, and gains a
  `./navigation` contract (`FilterBar`, `FilterBarGroup`, `Toolbar`, `ToolbarGroup`,
  `FilterBarChipProp`) that did not exist before — the navigation subpath had nothing pinning the
  names a list page imports. This is the gh#251 lesson applied preventively: the guard immediately
  caught that `FilterBarChipProp` was exported from `filter-bar.tsx` but never re-exported from the
  navigation barrel, so it would have been invisible to a consumer despite passing every
  source-level check.
- **`docs/CANONICAL-CONTRACTS.md`** — the formal per-name record of what the package ships for
  `PageHeader`, `Banner`, `SocialLinks`, `OrganizationChoiceList`, `ServiceRolePanel`,
  `BranchScopePicker`, `PermissionMatrix` and `FilterBar`, with the Gate 0 verdict, the
  "can the consumer reach it publicly?" follow-up that gh#251 taught us to ask, and — for a
  composition — the exact primitives, token knobs and state table.
- **New tokens.** `--page-header-meta-gap`, `--page-title-placeholder-{measure,block-size}`,
  `--page-subtitle-placeholder-{measure,block-size}` (gh#255 header band);
  `--banner-{radius,border-width,border-block-end-width,space-block,space-inline,space-inline-compact,dismiss-space-offset}`
  (gh#255 banner); `--auth-shell-registration-*` (gh#256);
  `--filter-bar-search-width`, `--filter-bar-chip-*`, `--filter-bar-count-*` (gh#258). The chip and
  count colour knobs are role-mirror knobs, declared `initial` at `:root` with the role default at
  the CALL SITE, so a scoped `[data-tenant]`/`.dark` override of `--muted`/`--muted-foreground`
  actually reaches them.

### Changed

- **⚠ VISIBLE IN EVERY TRANSACTIONAL EMAIL: the primary CTA grows 36px → 44px
  (`--email-cta-height`, dxs-platform/platform#559).** The email CTA mirrored `--control-height-lg`,
  and 36px clears WCAG 2.2 **SC 2.5.8** Target Size (Minimum, AA, 24×24) — which is why nothing
  downstream could see the problem. It does NOT clear **SC 2.5.5** Target Size (Enhanced, AAA,
  44×44), Apple HIG 44pt or Material 48dp. Email is a mobile-first, **touch-only** medium: no hover
  state, no precise pointer, and mail clients do not reliably offer zoom or a focus affordance, so
  the web's AA floor is the wrong bar. `--email-cta-height` and `--email-cta-line-height` (which
  must stay equal — an Outlook-safe button centres by line-height, not flexbox) are now **44px**,
  and the mirror to `--control-height-lg` is **deliberately broken**; the token comment says so, so
  the next reader does not "restore" it. The 44px floor is now asserted as a CONTRACT
  (`expect(EMAIL_CTA.heightPx).toBeGreaterThanOrEqual(44)`), not as a restatement of the current
  value — the previous test only checked `heightPx === EMAIL_CSS["--email-cta-height"]`, which is
  green for any number and is exactly how a consumer spec asserting the 44px floor got pinned to
  `EMAIL_CTA.heightPx` and silently lost it. The artboard test that pinned 36 was updated
  deliberately. **Kept in a MINOR** on purpose: no public name, prop or export changes, nothing is
  removed, the change only enlarges a touch target toward an accessibility floor, and the escape
  hatch is one public line — a service that must keep the old box sets `--email-cta-height` and
  `--email-cta-line-height` to `36px` in its own theme. Templates with a tightly measured CTA row
  will reflow by 8px.
- **⚠ 18.6.0 silently removed the Topbar CENTRE SLOT at 1100px and below — including on every phone.**
  The gh#244 collision fix introduced `@media (width <= 68.75rem) { .ui-topbar-center { display:
var(--topbar-center-compact-display) } }` with a default of `none`. Consumers whose global search
  trigger lives in `Topbar center` lost it at 901–1100px and downward **without changing a line of
  their own code** — a lockfile bump deleted a slot they depended on. **The default stays `none`**:
  the overlap it prevents (a full search trigger covering the start breadcrumb/title or the end
  utilities with a 16rem sidebar docked) is a real defect, and flipping a shipped default a second
  time would be worse than documenting it once. It is now stated as a decision instead of a
  side effect — the token comment, the MCP catalog's `center` prop description and a new Topbar usage
  rule all carry the warning and the opt-in:

  ```css
  :root {
    --topbar-center-compact-display: flex;
  } /* restore the slot at every width */
  ```

  Opt back in only once the centre content has a compact presentation of its own (an icon-only search
  trigger); otherwise move the trigger into `end` for compact widths. A page-local media query is the
  anti-pattern the knob replaces.

- **`variant="featured"` no longer hard-codes `--primary`.** Its edge and ring are now
  `--card-featured-border-color` (role-mirror `initial`, so the `--primary` default resolves at the
  call site and a scoped `[data-tenant]`/`.dark` override reaches it) and `--card-featured-ring-width`.
  Rendered output is unchanged. `featured` is now simply the brand-toned member of the same family as
  `accentPlacement="perimeter"`.
- **The Card accent colour is resolved once per tone into `--card-accent-color`**, consumed by both
  placements, so a rail and a perimeter can never drift apart. It is set on the element and is
  therefore NOT a service knob — retint the role (`--attention`, `--success`, …).
- **The `registration` preset's vertical geometry was invented, and is now derived and measured.**
  The first pass shipped `3rem` / `1.5rem` block-start offsets that were chosen rather than taken
  from the canonical artboard — the one thing every other preset in that file does carefully, citing
  exact artboard pixels. Measured in headless Chromium, the card landed **133px / 147px above** the
  canonical SCR-002 anchor. The offsets are now derived from the artboard quoted in the SCR-002
  acceptance review (card `y=284` at 1440x900, `y=274` at 390x844) through the column's own
  arithmetic — `card y = padding-block-start + identity slot + stack gap` — giving `9.5rem` /
  `8.875rem`; re-measured delta is **0.00px at both viewports**. The horizontal measure chosen in
  the first pass was already correct and is unchanged (360px card, 15px mobile gutter, centred at
  1440 — measured delta 0.00px).
- **`registration` gains the fixed identity track `login` already proved (`--auth-shell-registration-identity-slot-block-size`, 112px).**
  Without it the card rides on the identity block's own height — measured at 82.69px for one wrapped
  requester — so the canonical anchor above would have held for exactly one copy length and drifted
  for every other. With it, headless Chromium measures card `y=274` identically for absent, short
  and wrapped two-line requester copy. Applied to the identity element rather than through a grid
  row, so the preset does not constrain how many sections a page stacks.
- **The registration docs frame no longer passes a `brand` bar.** The canonical hosted-identity
  screens put the mark INSIDE the column as `AuthIdentity` and pass no top bar — the real DXS
  `Login.tsx` and `Register.tsx` both do exactly this. The frame passed one, which pushed the whole
  column down by the bar's measured 72px and made every offset read off that page wrong. This was
  what first looked like a 72px defect in the shipped `login` preset; `login` is correct, and the
  frame was lying. NOTE: `docs/layout/auth-shell.tsx` still demonstrates `preset="login"` WITH a
  brand bar and so mis-states that preset's anchor by the same 72px — left unchanged here because it
  is pre-existing and touching it would move visual baselines outside this issue's scope.

- **The banner's inline inset now steps down with the page gutter at 720px.** `--banner-space-inline`
  reads `--space-page-active-x` so a strip's text lines up with the page title, but that token steps
  down to the compact gutter on `.ui-page-container` ONLY. Custom properties inherit, so a banner
  rendered inside the container picked the compact value up for free — while the normal case, a
  banner mounted ABOVE the container or in `AppShell`, kept the 24px desktop gutter and sat 8px
  outside the page title at 390px. The new `--banner-space-inline-compact` knob applies the same
  step to the banner itself, so the alignment the token was introduced for actually holds on mobile.

- **`ServiceRolePanel`, `BranchScopePicker` and `PermissionMatrix` are formally documented as
  COMPOSITIONS, not components (gh#257).** All three fail the Framework-Component Test, and
  `BranchScopePicker` fails it twice over: a hierarchical multi-select with parent/child aggregation
  IS `TreeSelect`, so adding it would duplicate a primitive. The follow-up question is a clean
  "yes" — each is reachable from public primitives + tokens with no package CSS — and the one
  genuinely reusable part, the grant/diff data logic, already ships as the pure
  `@godxjp/ui/lib/permission-grid` util. Documented with every state gh#257 listed
  (read-only/locked, loading, empty, validation, error, permission-denied, destructive-confirmation)
  in the new `docs/showcase/service-role-scope.tsx`, plus a new MCP `rbac-service-roles` pattern so
  an agent asking for these names is taught the composition instead of inventing an API. Read-only
  is a `Badge` STATING the fact, never a disabled `Select` — a disabled control is a dead tab stop
  that implies "editable later".
- **`SocialLinks` and `OrganizationChoiceList` formally documented as compositions (gh#256)**, with
  their loading/empty/error/denied/disabled states, in `docs/layout/auth-shell-registration.tsx` and
  two new `AuthShell` MCP usage rules. The package deliberately does not own the provider row:
  which providers a product offers, in what order, and what consent they imply are product
  decisions.
- **MCP catalog corrections.** `Alert`'s `variant` was catalogued as
  `"default" | "destructive" | "warning" | "success"` — it has never been the colour axis (that is
  `tone`), and two `useCases` repeated the error. Both are fixed, and `variant` now documents the
  MEASURE axis it really is. The `PageContainer` usage rule that told agents about "the old
  PageHeader's prop names" was rewritten: there is now a real `PageHeader`, and leaving that string
  in place would have taught agents the exact kind of wrong thing gh#251 was filed about.

### Fixed

- **The AppShell drawer breakpoint was documented as `lg` (1024px) but has always fired at 900px
  (gh#259).** `shell-layout.css` said the docked sidebar "collapses out below `lg`", and the MCP
  catalog's `mobileNav` description and its AppShell usage rule said the same — while the shipped
  rule is `@media (width <= 56.25rem)` and the hamburger is `max-[900px]:inline-flex`. Between 900
  and 1024 an agent reading the catalog therefore built against a breakpoint that does not exist.
  `layout.prop.ts` was already correct. All three now name 900px / 56.25rem and point at the block
  comment that explains why it is the one canonical value. No behaviour change — this was always a
  documentation defect, but agents read the catalog, so it shipped wrong numbers into consumers.
- **The boxed `<Logo tone="success">` glyph inked its TEXT with the identity KNOCKOUT colour, failing
  WCAG 2.2 AA at 3.67:1.** `.ui-logo[data-tone="success"]` fell back to `--brand-foreground` for
  `color`, but `--brand-foreground` is not an ink — it tracks `--background` in both themes
  (light `60 33% 99%`, dark `48 9% 9%`) because `mark="godx"` punches its inner bar as an evenodd
  **hole** and the email mark has to paint that hole solid to match. As negative space it only owes
  SC 1.4.11's 3:1 (non-text) and clears it; as the ink under caller-supplied TEXT it owes SC 1.4.3's
  **4.5:1** — 14px bold is not "large text" (that needs 18.66px bold / 24px). Measured in headless
  Chromium across every branch of `docs/general/logo.tsx`: light `tone="success"` glyph
  `#fdfdfc` on `#009766` = **3.67:1 FAIL** (both the `md` and `lg` nodes), while light
  `tone="primary"` was 4.62:1, dark `tone="success"` 6.89:1 and dark `tone="primary"` 7.05:1 — all
  passing. The `tone="success"` boxed glyph now inks from the new
  **`--logo-identity-foreground`** (`48 9% 9%`, `#191815`), so light rises **3.67 → 4.74:1**. The ink
  is theme-INVARIANT — it is the same near-black spine the dark theme already resolved to — so
  **dark renders byte-identically at 6.89:1**, and the default untoned `tone="primary"` rendering is
  untouched. `--brand` / `--brand-foreground` are unchanged, so the canonical emerald, the `godx`
  vector mark and the email brand capsule (whose light inner bar must stay light to match the web
  mark's knockout hole) all keep their exact colours. This was NOT treated as a logotype exemption:
  `mark="glyph"` renders CALLER-supplied text in a tinted box — a generic boxed badge, not the GoDX
  identity artwork — so the `data-logotype` route the wordmark uses does not apply. Guarded by
  `src/tokens/__tests__/logo-identity-contrast.test.ts`, which resolves the real `var()` fallback
  chains out of the shipped CSS and asserts the measured ratio per tone per theme.

### Added

- **`Text` gains a public multi-line clamp: `clamp?: number`** (gh#261). `<Text as="p" size="sm"
tone="muted" clamp={2}>` limits a description to N lines with a trailing ellipsis — the
  token-owned form of the banned page-local `line-clamp-N` utility (rule #2), needed verbatim by
  the DXS service-catalog card ruling (dxs-platform/platform#427: description "clamped to 2
  lines" at 390px). The component emits `data-clamp` + an inline `--text-clamp` var; all styling
  lives in `text-layout.css` (`display: -webkit-box` + `-webkit-line-clamp`/`line-clamp:
var(--text-clamp)`), with the same `min-width: 0` flex-shrink contract as `truncate` (issue
  #114). Clamping is visual-only — the full text stays in the DOM and the accessible name.
  `clamp` and `truncate` are mutually exclusive: when both are set `clamp` wins and dev builds
  warn; an invalid `clamp` (< 1 / non-finite) is ignored with a dev warning and a fractional
  value is floored. Docs: `docs/general/typography.tsx` now renders a long Japanese description
  at `clamp={2}`.
- **FilterBar typed model (gh#258)** — `FilterBarProps` gains an optional, domain-neutral,
  consumer-controlled model: `search` (canonical SearchInput slot with the token-owned
  `--filter-bar-search-width`), `filters` (labelled Select filters whose visible caption is the
  control's REAL `<label htmlFor>` — `FilterBarFilterProp`), `chips` + `onChipRemove`
  (applied-filter chips as pure data: add = include, remove = `onChipRemove(value)`, clear-all =
  `onClear` — `FilterBarChipProp`), `actions` (trailing slot at the inline end), `resultCount`
  (localized CLDR-pluralized `role="status"` line; `0` is the visible empty state), `loading`
  (`aria-busy` strip), `disabled` (reaches every model-rendered control) and `error`
  (`role="alert"` line replacing the count). Canonical DOM = keyboard order:
  search → filters → children → reset → actions → chip removes. Presence of ANY model prop
  activates the model layout; **without one the legacy children-composition markup renders
  byte-identically** (children is now optional — a pure model usage needs none). New geometry
  knobs (rule #45): `--filter-bar-{search-width,filter-width,chip-gap,section-gap}`; under
  `overflow="scroll"` the reset+actions cluster stays pinned at the inline end exactly like the
  legacy clear button. i18n: `navigation.filterBar.{appliedFilters,removeFilter,resultCount}`
  in vi/en/ja. Guarded by
  `src/components/navigation/__tests__/filter-bar-typed-model.test.tsx` (slots + order, chip
  lifecycle, reset, localized plural count, keyboard order, loading/disabled/error, legacy
  path unchanged, vitest-axe 0 violations, compile-time `@ts-expect-error` contract).
- **`Banner` / `BannerProps` — the canonical DXS full-bleed attention strip** (gh#255,
  dxs-platform#311): exported from `@godxjp/ui/feedback` and pinned in the packed-artifact
  contract. It IS the Alert primitive with the structural axis fixed to the new
  `variant="banner"` (`AlertVariantProp` widened `"default" | "banner"`), so ONE implementation
  owns tone semantics + live-region politeness, the default per-tone icon (`icon`/`icon={false}`),
  `Banner.Title/Description/Content/Actions` slots, the built-in localized dismiss
  (`onDismiss`, last in DOM/focus order) and the ≥640px trailing-actions / <640px full-width
  wrapping behaviour. Strip geometry is token-owned via the new
  **`--banner-{radius,border-width,space-inset-block,space-inset-inline}`** component tokens
  (`src/tokens/components/banner.css`): square corners, a single tone-coloured hairline on the
  block-end edge, and an inline inset defaulting to the page gutter (`--space-page-active-x`).
  No DXS business behaviour — the app decides WHEN a banner shows; the package owns only
  presentation.
- **`PageContainer status` — the status/meta band of the canonical page-header contract**
  (gh#255): PageContainer's embedded header is formally the DXS `PageHeader` (deliberately NO
  separate export — a standalone header renderer is what produced the nested-header defect the
  platform audit flagged). `status` renders StatusBadge/meta content beside the `<h1>` on one
  wrapping row at the new semantic token **`--page-header-status-gap`** (default
  `--space-inline-sm`); on compact viewports or under a long JA/VI title the band wraps UNDER
  the title instead of clipping. A page that omits `status` keeps the exact historical DOM and
  geometry. Loading/error/denied stay compositions of existing exports (Skeleton in the slots;
  `ErrorSurface` replacing the page for 403/404/5xx; `Alert.QueryError`/`DataState` in-body) —
  documented on the MCP `PageContainer` entry.

- **`--logo-identity-foreground`** (`48 9% 9%`) — the ink the boxed `mark="glyph"` sets its TEXT in
  when it sits on the `--brand` identity fill. Deliberately NOT a role-mirror knob: its default is a
  real value rather than a role token, so there is no role to freeze and it is declared at `:root`
  instead of `initial` (the four existing role-mirror knobs — `--logo-success-background`,
  `--logo-success-foreground`, `--logo-godx-color`, `--logo-wordmark-color` — stay `initial` with
  their role defaults at the call site, unchanged). A service re-theming `--brand` to a DARK fill
  re-inverts the ink through the existing public knob `--logo-success-foreground`.

- **`EmptyState` `tone` never coloured the icon GLYPH — only the medallion tint varied.**
  `.ui-empty-state-icon` correctly reads `color: var(--empty-state-icon-foreground, hsl(var(--muted-foreground)))`
  and every `[data-tone]` rule re-points that token, but the component rendered the icon with a
  hard-coded utility `className="text-muted-foreground size-6"`. The utility out-specified the
  inherited colour, so the token was half-dead: measured in headless Chromium, the medallion tracked
  the tone (`success` `rgb(105,191,142)` · `warning` `rgb(250,183,0)` · `destructive` `rgb(184,40,48)`
  · `info` `rgb(77,109,179)`) while the svg stayed `rgb(112,110,102)` for **all five** tones. Dropping
  the colour utility (keeping `size-6`) lets the glyph inherit `currentColor`; after the fix the glyph
  equals the medallion token exactly for every tone, and the default `tone="muted"` still resolves to
  `rgb(112,110,102)` — the untoned rendering is **byte-identical**. No token changed: the knobs were
  already role-mirror `initial` at `:root` with the role default at the call site. The glyph stays
  `aria-hidden` and matches the shipped `Alert` tone-icon convention (raw role for the decorative
  glyph, contrast-tuned `--text-*` reserved for text), so SC 1.4.11 does not apply — measured
  `EmptyState` success 2.00:1 / warning 1.62:1 vs the existing `Alert` icons' 2.11:1 / 1.69:1 on the
  same ~12% tint. Guarded by `src/components/data-display/__tests__/empty-state-tone-glyph.test.tsx`.
- **`<ToggleGroup variant size>` never reached its items, and the default was off-union.**
  The group stamped `data-variant`/`data-size` on the ROOT only; `ToggleGroupItem` read just its own
  props and `.ui-toggle-group` consumed neither attribute, so `<ToggleGroup size="lg">` alone painted
  **nothing** — measured in headless Chromium, a group-only `data-size` of `sm`/`md`/`lg` all rendered
  the same unstyled **25.8px** item against real tiers of **28/32/36px**, forcing consumers to repeat
  the prop on every single item. Worse, the destructuring default was the literal `"default"`, which
  is **not** a member of the declared `sm | md | lg` union, so an unset group emitted
  `data-size="default"` — an invalid value for its own type. Fixed with the upstream shadcn React
  **context** pattern: the group provides `variant`/`size`, each item falls back to the context only
  where its own prop is unset, and the destructuring defaults were removed so an unset group emits no
  `data-size`/`data-variant` at all (the real default still comes from `toggleVariants`, applied per
  item). Measured after the fix, group-only sizing produces the correct real heights on **every**
  item — `sm` 28px · `md` 32px · `lg` 36px — and an explicit item prop still wins (a `size="lg"` item
  inside a `size="sm"` group measures 36px between two 28px siblings). Repeating the prop on every
  item — the only thing that worked before, and what the docs frames did — renders **identically**:
  group-only, item-only, and both-repeated all emit the same class string and the same 36px box.
  Guarded by `src/components/data-entry/__tests__/toggle-group-propagation.test.tsx`.
- **`size` was a silent no-op on `<Logo mark="godx" />` — the identity mark now honours every tier.**
  `.ui-logo[data-mark="godx"]` pinned `width`/`height` to `--logo-godx-size` at the SAME specificity
  as the `.ui-logo[data-size="…"]` rules (both 0,2,0) and sat later in `logo-layout.css`, so source
  order won: measured in headless Chromium, `xs` · `sm` · `md` · `lg` all rendered **32×32px**. The
  prop is public and did nothing — and the godx LOCKUP already scaled its wordmark per tier
  (12.47px → 17.65px from `xs` to `lg`), so a frozen mark visibly broke the mark↔wordmark proportion
  at `size="lg"`. A half-applied prop cannot honestly be documented as "inapplicable", so `size` was
  made real rather than typed away. The identity mark gets its own ramp,
  **`--logo-godx-size-{xs,sm,md,lg}` = 1.5 / 1.75 / 2 / 2.5rem** — one step above the `--logo-size-*`
  glyph box, because the artwork is a horizontal capsule inside a square viewBox and needs the extra
  box to read at the same optical weight. The per-tier rules are `[data-mark][data-size]` (0,3,0), so
  they out-rank both neighbours regardless of source order and the ordering bug cannot recur.
  Measured after the fix: **24 / 28 / 32 / 40px**, with `md` byte-identical to the old fixed 32px, so
  every existing default-size identity surface (`AuthIdentity`, the AuthShell brand bars,
  `CenteredShell` topbars) is unchanged. The **`--brand` colour contract is untouched**: the mark
  still resolves `hsl(var(--logo-godx-color, var(--brand)))` at the call site — `rgb(0,151,102)`
  `#009766` light, `rgb(0,184,124)` `#00b87c` dark, verified at every tier and in both themes.
  `src/components/general/__tests__/logo-size-cascade.test.ts` resolves the real cascade
  (specificity, then source order) over the shipped stylesheet and asserts a distinct winning box per
  tier — it reproduces the old one-value-for-all-tiers result on the pre-fix CSS, so a `toContain`-style
  guard could not have caught this.

- **The `/isolate/**` preview harness stopped wrapping shell stories in a SECOND `<main>`.**
  `preview/src/isolate-main.tsx` decided whether a story already owned the document landmarks from a
  HARDCODED story-id list (`ownsDocumentLandmarks`), while `preview/src/frame-main.tsx` had long since
  DETECTED an own `<main>` at runtime. The list drifted behind the catalog, so every shell story
  authored after it was written (the `AuthShell` presets, `CenteredShell`, `LegalDocumentShell`,
  `ErrorSurface` and the `AppShell` recipes under `docs/**/examples/`) rendered its own `<main>`
  INSIDE the harness's `<main>`. Measured in headless Chromium across all **152** isolate routes:
  **26 routes had two `<main>` landmarks and 25 of them carried real axe violations — 50
  `landmark-main-is-top-level` / `landmark-no-duplicate-main` nodes**, including
  `/isolate/layout-auth-shell-context`, `/isolate/layout-auth-shell-device`,
  `/isolate/layout-auth-recovery-index`, all four `layout-error-surface` routes and all five
  `layout-legal-document-shell` routes. A duplicated heuristic is how it drifted, so the duplicate is
  gone: both entry points now import ONE detector, **`preview/src/landmark-root.tsx`
  (`<LandmarkRoot>`)**, which probes its own subtree for a `main` / `role="main"` in a
  `useLayoutEffect` — synchronous after commit and BEFORE the browser paints, so the landmark is
  already correct on the first paint (no flash, no window for axe or a screenshot to observe the wrong
  tree) — and renders the real `<main>` TAG, never a `role="main"` div, only when the story does not
  own one. Re-measured after the fix: **152/152 isolate routes have exactly one `<main>`, 0 landmark
  violation nodes, 0 regressions** — the bare component showcases that legitimately rely on the
  harness supplying `<main>` are untouched. `/frame/**` is unaffected by construction and verified
  identical (`check:frame-axe` before and after: 0 preview-chrome violations, the same 19 component
  nodes across the same 6 frames), so `scripts/frame-axe.baseline.json` is deliberately left
  unchanged — this clears `/isolate` debt, not `/frame` debt.

### Changed

- **`--logo-godx-size` is now the identity mark's PIN, not its base.** It is declared `initial`
  (guaranteed-invalid) at `:root` with the per-tier default at the CALL SITE
  (`var(--logo-godx-size, var(--logo-godx-size-md))`), so it is inert by default and the `size` tiers
  apply. A service theme that sets it once still freezes the mark at that box on **every** tier —
  verified in-browser (`--logo-godx-size: 3rem` → 48px at `xs`/`sm`/`md`/`lg`) — while a single step
  is retuned through `--logo-godx-size-lg` and friends (`4rem` → 64px). Consumers that only _set_ the
  token are unaffected; a theme that _read_ `var(--logo-godx-size)` expecting `2rem` must read
  `--logo-godx-size-md` instead.

### Added

- **`AlertDialogRoot` — the compound alert-dialog was unassemblable from the public API; now it
  isn't.** `@godxjp/ui/feedback` shipped every compound PART (`AlertDialogTrigger`, `Portal`,
  `Overlay`, `Content`, `Header`, `Footer`, `Title`, `Description`, `Action`, `Cancel`) but no Root:
  the name `AlertDialog` is taken by the flat destructive-confirm preset, which internally composes
  `DialogHeader`, not `AlertDialogHeader`. Every one of those parts needs a Radix AlertDialog Root
  ancestor for context, so `AlertDialogHeader` could not be rendered anywhere by a consumer — the
  only working composition in the repo imported `@radix-ui/react-alert-dialog` directly, which a
  consumer must not do and a docs frame cannot do (`check:example-imports` allows only react /
  lucide-react / `@godxjp/ui`). `AlertDialogRoot` is the exact mirror of `DialogRoot`: a
  pass-through over `AlertDialogPrimitive.Root` stamped `data-slot="dialog"`, so focus trap, focus
  restoration and `role="alertdialog"` stay Radix-owned. Purely additive — the flat `AlertDialog`
  preset is untouched. `AlertDialogRoot > AlertDialogTrigger + AlertDialogPortal > AlertDialogOverlay
  - AlertDialogContent > AlertDialogHeader > AlertDialogTitle`now composes from the public API
alone, which also makes`AlertDialogHeader`'s seven-branch `tone`band reachable for the first
time; both are demonstrated in`docs/feedback/alert-dialog.tsx`and recorded in`component-case-evidence.json`. Catalogued in the MCP as its own entry (with the "prefer the flat
    preset" steer), and covered by trigger-open / cancel-and-Escape focus-restoration tests plus a
    vitest-axe sweep of both header forms.
- **Frame coverage (#163) — the `tone` and `size` contracts of the general + charts exports are now
  demonstrated, not assumed.** `docs/general/typography.tsx` gains a `Heading tone` card that
  renders all seven semantic tones on a real section heading; `docs/general/logo.tsx` gains a
  `tone` card that separates the two branches against the new `--brand` identity role
  (`tone="primary"` fills the boxed glyph from the action colour `--primary`, `tone="success"` from
  `--brand`) and records that `mark="godx"` is always drawn in `--brand` and always at
  `--logo-godx-size`, regardless of `tone`/`size`; a new `docs/charts/size-tiers.tsx` frame renders
  `LineChart` / `BarChart` / `AreaChart` / `PieChart` at every `size` tier (xs · sm · md · lg).
  `component-case-evidence.json` records the branches, so `Heading.tone`, `Text.tone`, `Text.size`,
  `Logo.tone`, `Logo.size`, `AreaChart.size`, `BarChart.size`, `LineChart.size`, `PieChart.size` and
  `CompactBarTrend.size` promote to `covered:prop-evidence` in the frame-coverage ledger.

- **Frame coverage (#163) — the data-display `variant` / `tone` / `size` / `density` / `shape`
  contracts are demonstrated at rest, not behind a toggle.** `docs/data-display/badge.tsx` gains a
  `StatusBadge` card that renders its four structural variants (on the tone-neutral `incomplete`
  key, so the variant is what changes), its three shapes and all eight tones; `empty-state.tsx`
  gains the remaining `tone` steps (warning · destructive · info · muted) and states `variant="page"`
  explicitly; `credential-reveal.tsx` splits Tone and Size into two cards and now renders
  `tone="warning"` plus every `size` tier (xs · sm · md · lg); `data-table/index.tsx` renders
  `density` compact / default / comfortable as three STATIC tables (the DensityToggle only proved
  them after a click); `list-row.tsx` gains a default-vs-compact contrast row; `stat-card.tsx`
  states `size="compact"` explicitly next to `size="md"`; `timeline.tsx` states `variant="icon"`
  explicitly. `component-case-evidence.json` records the branches, so `Badge`, `StatusBadge`,
  `Card`, `EmptyState`, `Timeline`, `Upload`, `CredentialReveal`, `Progress`, `StatCard`,
  `DataTable`, `ListRow` and `Avatar` promote 20 prop-shaped cells to `covered:prop-evidence`, and
  the `card` / `empty-state` / `progress` / `data-table` known gaps record the resolving evidence.

- **Frame coverage (#163) — the layout `variant` / `tone` / `density` contracts are demonstrated.**
  New `docs/layout/auth-shell-variants.tsx` frame renders `AuthShell` on its two orthogonal axes:
  `variant` (default · canonical) and `density` (comfortable · compact) are switched from one shell,
  because two stacked `AuthShell`s would duplicate the `banner` / `main` / `contentinfo` landmarks
  and fail axe by construction. `docs/layout/page-container.tsx` promotes its density comparison to
  a three-up row so `density="default"` is stated explicitly next to compact and comfortable.
  `docs/layout/error-surface/index.tsx` gains a `tone` card rendering all five semantic steps
  (muted · info · warning · destructive · success) on the statuses each one truthfully belongs to.
  `component-case-evidence.json` records the branches, so `AuthShell.variant`, `AuthShell.density`,
  `PageContainer.variant`, `PageContainer.density` and `ErrorSurface.tone` promote to
  `covered:prop-evidence` in the frame-coverage ledger.

- **`CenteredShell preset="public-landing"` + `Flex hideBelow` / `hideFrom` — the public landing
  page is now buildable from public exports and public tokens alone (#252).** SCR-007 was applying
  consumer CSS for shared shell decisions: a 67.5rem card measure, the shell main alignment, a
  global card-shadow kill inside the landing surface, a chromeless centred hero, a separate
  max-width header/footer wrapper, and media queries that hide public navigation below the tablet
  step and the wordmark + secondary action at mobile. Per `docs/COMPOSITION-VS-COMPONENT.md` a
  landing header / hero / section grid / legal footer FAILS the Framework-Component Test (it owns
  no behaviour and composes from `Card`/`Button`/`Text`/`Heading`/`Flex`/`ResponsiveGrid`), so
  there is deliberately **no `PublicLandingShell`** — instead the package now owns every piece of
  geometry that forced the page-local CSS. `preset="public-landing"` shares ONE measure
  (`--centered-shell-landing-max-width`, 67.5rem) between the header bar, the centred column and
  the footer — the bar/footer inline padding is `max(gutter, (100% - measure) / 2)`, so header
  content starts on exactly the column edge with no consumer wrapper — and owns the section rhythm
  between plain `<section>` elements, the flat public-surface card chrome
  (`--centered-shell-landing-card-shadow: none`, rule #44), the hero `h1` tier (it re-points
  `--heading-h1`, so a hero title stays a real `Heading level={1}`) and the 40rem compact step.
  `Flex hideBelow`/`hideFrom` replace the consumer's own media queries at the package's canonical
  breakpoint scale (sm 40rem · md 48rem · lg 64rem · xl 80rem, the `--master-detail-collapse-below`
  steps). Both defaults are provably inert: `preset="default"` and an unset `hideBelow` emit no
  attribute at all, and the stylesheets contain no `[data-preset="default"]` / bare
  `[data-hide-below]` selector (asserted in tests, the gh#231 contract). Measured in headless
  Chromium on `/showcase/public-landing`, LTR and RTL: **1440×900** column x=180 w=1080, bar 1440×48,
  h1 54px; **1024×900** column x=24 w=976; **390×844** column x=16 w=358, h1 33px, nav
  `display:none`, wordmark `display:none`; `documentElement.scrollWidth === clientWidth` (overflow 0)
  at all three widths in both directions, card `box-shadow: none`, zero console errors.

- **`Table preset="action-collection"` + `TableHead`/`TableCell` `priority` — a canonical
  responsive approval queue that fits 390px (#253).** The public Table kept its desktop intrinsic
  column widths, so a five-column approval queue (申請者 · 対象 · 理由 · 申請日時 · 操作) rendered
  1511px wide inside a 1182px card and scrolled horizontally — at 390 only the first two columns
  were in the initial frame. The preset replaces the SIZING model, not the markup: `table-layout:
fixed` plus token-owned column-PRIORITY measures (`--table-action-collection-*`, percentages so
  the ratio holds at any card width, with an absolute measure reserved for the row-action
  affordance so it can never be squeezed below its touch target), and cells wrap instead of forcing
  a scroll. There is **no display change, no role rewriting and no card transformation**, so
  `<table>/<thead>/<th scope>/<tr>/<td>` semantics, header association, `aria-sort` and
  screen-reader table navigation are byte-identical at 390 and at 1440. `collapseBelow` is measured
  against the table's OWN container (a container query), not the viewport, so a queue inside a
  master rail collapses before the page does. Measured in headless Chromium on
  `/showcase/table-approval-queue`, LTR and RTL: the table now fits its card exactly at every width
  (`scrollWidth === clientWidth`) — **1440** 1182px wide, columns 213/260/511/142/56; **1024** 766px
  wide, columns 138/169/312/92/56; **390** 388px wide, columns 93/85/88/78/44 with all five headers
  inside 1…389 — page overflow 0 everywhere, RTL mirrored, zero console errors. Defaults stay
  inert: `preset="default"` emits neither the attribute nor the container class, and the stylesheet
  has no `[data-preset="default"]` selector.

- **`DataTable preset="action-collection"` / `collapseBelow` + `ColumnDef.priority` — the same
  responsive approval-queue contract on the TanStack-driven table, and `--table-surface-min-inline-size`
  (#253, residual gap).** The `Table` half of #253 shipped without `DataTable`, so a queue driven
  through TanStack still scrolled sideways at 390: `.ui-data-table-surface` carried a hard-coded
  `min-w-[640px] sm:min-w-0` utility pair — the literal that forced the scroll, and exactly the kind
  of service-tunable constant rule #45 says must be a knob — and `ColumnDef` had no way to express a
  column priority. `DataTable` now forwards `preset`/`collapseBelow` to the table it renders and
  stamps `ColumnDef.priority` onto the column's `<th>` **and** every `<td>` (`meta.lean` is already
  this component's declared home for custom column options, so priority needed no second TanStack
  channel). It **reuses** the `Table` contract end to end — the same `--table-action-collection-*`
  tokens, the same `.ui-table-collection` container query, the same four priority steps; there is
  deliberately no parallel `--data-table-action-collection-*` family. The width floor is now
  `--table-surface-min-inline-size` (default `640px`, byte-identical to the old utility and
  deliberately px so it releases at exactly the px-based `sm` media query that clears it); the
  preset opts out of it entirely, because there the priority measures own the width. Measured in
  headless Chromium against `pnpm preview:build` on
  `/isolate/data-display-data-table-examples-approval-queue`, LTR and RTL: the table fits its card
  exactly at every width — **1440** 1182px, columns 212.8/260/511.4/141.8/56; **1024** 766px,
  columns 137.9/168.5/311.7/91.9/56; **390** 388px, columns 93.1/85.4/87.9/77.6/44 with all five
  headers inside 1…389 — `documentElement.scrollWidth === clientWidth` and
  `.ui-data-table-scroll` overflow 0 at all three widths in both directions, zero console errors.
  The default is provably inert: `preset="default"` emits no `data-preset` on the surface or the
  table, an unmarked column emits no `data-priority`, the surface's class list is exactly
  `ui-data-table-surface`, and the stylesheet contains neither `[data-preset="default"]` nor a bare
  `.ui-data-table-surface[data-preset]` selector (asserted in tests — the gh#231 contract). The same
  page with `preset` omitted still measures `min-inline-size: 640px` at 390 and `0` at 1024/1440.

- **`ErrorSurface` — the 403 / 404 / 500 / 503 exception surface is now a real, importable component
  (gh#251, reversing the gh#221 outcome).** #221 shipped this surface as a documentation-only
  composition pattern; #251 proved that wrong the only way that matters — a clean install of
  18.5.0 exposed no `ErrorSurface`, so DXS Platform was still composing `AuthShell` + a generic
  `Card` behind a consumer-local `.canonical-auth-card`. **A consumer cannot `import` a docs page.**
  `import { ErrorSurface } from "@godxjp/ui/layout"` now ships the whole contract:
  `mode` is the SHELL CONTRACT, not a skin — `"application"` (403/404) renders ONLY the surface
  block, i.e. what you put in the children of the `AppShell` the route already provides, so the
  sidebar/topbar/breadcrumb are PRESERVED and never reconstructed (a component cannot manufacture
  chrome from consumer-owned nav data — the one conclusion #221 got right, kept verbatim); and
  `"system"` (500/503) owns the whole page via `CenteredShell align="center"`, so package-owned
  geometry at 1440 / 1024 / 390 replaces every consumer `min-h-dvh` / flex-centring class / media
  query. `status` is the input that derives the icon (`ShieldAlert` · `SearchX` · `ServerCrash` ·
  `Wrench`) and tone (`warning` · `muted` · `destructive` · `warning`), both overridable.
  **Exactly one** recovery action stays structural: a single `action` slot, with extras dropped and
  a development-time error (never a throw — an exception on the exception page is how a 500 becomes
  a blank screen). `requestId`, `permission`, `organization` and
  `maintenance{start,end,timeZone,progress}` are semantic `<dt>`/`<dd>` metadata slots rather than
  prose, so the label↔value relation survives for a screen reader; the maintenance window is
  formatted by `Intl.DateTimeFormat(locale).formatRange()` from ISO-8601 instants + an IANA zone
  with the ISO value kept in `<time dateTime>`, and `progress` renders a labelled `Progress` meter
  named through `Intl.NumberFormat` percent style. The status code is announced as a phrase
  ("HTTP status 403"), never the cardinal number; `titleLevel` defaults per mode (`h2` under a
  `PageContainer` `h1`, `h1` on a system page). No state, no effects, no portals and no provider
  requirement, so it renders fully server-side (Inertia/SSR). Verified at **0 axe violations** for
  all four statuses in both shells, with metadata, and under `dir="rtl"`.

- **Packed-tarball consumer contract for `ErrorSurface` (gh#251).** Source-only checks are exactly
  what let the regression through, so `scripts/check-packed-public-contract.mjs` now pins
  `ErrorSurface` (+ `ErrorSurfaceProp`/`Props`/`MaintenanceProp`/`ModeProp`/`StatusProp` and
  `dist/components/layout/error-surface.{js,d.ts}`) in the `./layout` packed contract, and adds a
  fresh-consumer fixture that extracts the REAL tarball into an empty `node_modules`, runs a
  production Vite build importing `ErrorSurface` from `@godxjp/ui/layout`, then server-renders it
  with `react-dom/server` in BOTH modes and asserts the shipped contract from the packed runtime:
  the status code and its accessible phrase, exactly one action, the semantic metadata rows, the
  ISO-8601 `<time>`, the progress meter, and that `application` mode builds no page shell while
  `system` mode emits the centred column. It renders with no provider on purpose — an exception
  page must work when the app around it is already broken.

- **`--error-surface-*` component tokens.** `--error-surface-max-width` (32rem surface measure, both
  modes), `--error-surface-gap`, `--error-surface-padding-block` / `-padding-block-compact` (the
  desktop steps vs the 390 step), `--error-surface-brand-gap`, `--error-surface-meta-gap` /
  `-meta-row-gap` / `-meta-padding-block` and `--error-surface-progress-max-width`. Chrome is quiet
  by default (rule #44): `--error-surface-meta-border` is `none`, and a service opts in with
  `1px solid hsl(var(--border))`. The narrow step is a CONTAINER query at 30rem on the surface's own
  width (the SplitPane precedent, gh#165), so it compacts identically whether the squeeze came from
  a phone or from an expanded application sidebar. Catalogued in `mcp/src/data/tokens.ts`.

- **`@godxjp/ui/email` publishes the canonical M PLUS 2 stack, a mono face and the header lockup
  (gh#250).** `EMAIL_TYPOGRAPHY.fontFamily` now names the DXS canonical face first and documents its
  whole degradation path (`M PLUS 2` → Hiragino → Yu Gothic → Noto Sans JP → Meiryo → system UI →
  Arial → `sans-serif`); no email client honours `@font-face`, so the stack IS the fallback
  contract. New `EMAIL_TYPOGRAPHY.monoFontFamily` (`--email-font-family-mono`, mirrors
  `--font-family-mono`) sets invoice ids, masked card numbers, ISO-8601 dates and amounts, which the
  canonical card sets in mono and a template previously had to hand-type. Family names export
  SINGLE-quoted so the value drops into a double-quoted `style="…"` attribute unescaped, and
  `emailInlineStyle` now throws on a value containing `"` (it would close the attribute mid-tag)
  alongside the existing `var()`/`calc()` guards. New `--email-mark-gap` (8px) and
  `--email-wordmark-{font-size,font-weight}` (13px/700) publish the canonical header LOCKUP through
  `EMAIL_BRAND_MARK.gap` / `.wordmarkFontSize` / `.wordmarkFontWeight`, so a template stops guessing
  the mark-to-wordmark rhythm; in that pairing the mark is decorative (`label: ""`) and the wordmark
  carries the accessible name. Everything still derives from `src/tokens/`: no hex literal exists
  anywhere in `src/email/`, and the mark artwork remains byte-identical to
  `<Logo mark="godx" />`.

- **`Avatar shape="circle" | "square"` — a token-owned entity-header brand mark (gh#249).** The
  public API exposed only Avatar/AvatarImage/AvatarFallback, so an organization/service header could
  only render the round muted person avatar and a consumer had to reach for a forbidden
  `className="rounded-md bg-primary"` override. `shape="square"` is the semantic entity mark:
  compact rounded square on the brand surface, driven entirely by four new knobs —
  `--avatar-square-radius` (`--radius-lg`), `--avatar-square-size` (`--control-height`, so swapping
  shape never reflows a header) and the role-mirror pair `--avatar-square-background` /
  `--avatar-square-foreground`, declared `initial` with `hsl(var(--primary))` /
  `hsl(var(--primary-foreground))` resolved at the call site so a scoped `[data-tenant]`/`.dark`
  role override still reaches the mark. The brand fill is handed down through `--avatar-background`,
  so `AvatarFallback` picks it up with no extra rule and a service that wants a neutral square sets
  `--avatar-square-background` alone. Measured in Chromium at 1440 / 1024 / 390: square = 6px radius,
  32×32 box, `rgb(0,119,199)` on `rgb(253,253,252)` (**4.65:1**, WCAG AA); every circle avatar on the
  same page stayed 9999px / `rgb(244,243,240)` / `rgb(112,110,102)`. The default is inert — `circle`
  emits no attribute at all, so existing avatars keep their exact DOM and geometry. `shape` is
  registered as the `AvatarShapeProp` vocabulary (`AvatarProp` in `src/props`); the control
  `ShapeProp` (`default|pill|sharp`) is deliberately NOT reused — its `sharp` is `--radius-sharp: 0`
  and cannot express a rounded rect.

- **`ListRow density="compact"` — a token-owned compact inline-actions geometry (gh#246).** After
  the #224 overflow fix the row and its trailing cluster wrap, which removed the page-root overflow
  but left the canonical compact invitation composition unrepresentable through the public API: the
  12rem `--list-row-body-min-width` forced the trailing Buttons (and a history Badge + date) onto a
  second line inside the canonical 358px card. `density="compact"` lowers the geometry through four
  new knobs — `--list-row-compact-{padding-y,padding-x,gap,body-min-width}` (block `--space-2`,
  inline `--list-row-padding-x`, gap `--space-2`, threshold `6rem`); the three spacing knobs are
  `initial` with the density-scaled default at the call site, so a `.ui-density-*` subtree
  re-resolves them. Measured in Chromium on the preview: at 390px an invitation row goes from 126px
  tall with the actions wrapped to **62px with the Avatar, title and both Buttons inline**, and a
  history row (status Badge + ISO-8601 date in `trailing`) from 114px to **41px**, against the
  canonical 42px. At 1024 / 1440 the same rows are 62px / 40–41px. It only LOWERS thresholds: the
  row and the trailing cluster still wrap and the body is still clamped with `min(…, 100%)`, so a
  cluster that genuinely cannot fit (a 186px pair of bilingual labels in a 324px column) drops to
  its own line and `documentElement.scrollWidth === clientWidth` holds at 390 / 1024 / 1440 with
  long JA/EN/VI titles. Keyboard order and focus are unchanged.

- **Data-entry + query frames now demonstrate every `variant` / `size` / `shape` branch of
  `Upload`, `NumberInput`, `Switch` and `ButtonRefetch` (#163).** `docs/data-entry/switch.tsx`
  gained a `size · sm / md` card (the previous page only ever rendered the default row height), and
  `docs/query/button-refetch.tsx` gained `variant` (7), `size` (5 text tiers + 4 square icon tiers,
  each with its own `aria-label` since the icon-only form drops `label`) and `shape` (3) matrices,
  each card owning its own `useQuery` so the matrices never refetch in lockstep. `Upload`'s six
  variants and `NumberInput`'s four size tiers were already rendered and are now recorded.
  `component-case-evidence.json` records the branches, which promotes six previously `untested`
  cells of `preview/frame-coverage.ledger.json` to `covered:prop-evidence`. Verified headless at
  390 / 768 / 1280: no horizontal overflow, zero console errors/warnings, and
  `check:data-entry-frame-runtime` green across all eight widths.

- **Navigation + toggle frames now demonstrate every `variant` / `size` branch of `TabsList`,
  `ContextMenuItem`, `DropdownMenuItem`, `MenubarItem`, `Steps`, `Toggle`, `ToggleGroup`,
  `ToggleGroupItem` and `SelectTrigger` (#163).** The menu frames only ever rendered
  `variant="destructive"` implicitly against unnamed defaults (`docs/navigation/menubar.tsx` had no
  destructive item at all), so the two-branch item union was never drawn side by side; each menu now
  ends on an explicit `variant="default"` archive action next to the destructive delete.
  `docs/navigation/tabs.tsx` gained a hand-composed `TabsList variant` card (the `default` pill list
  and the `line` underline list) since the compound path previously only ever named `line`, and
  `docs/navigation/steps.tsx` gained a `size · md / sm` card (`size` drives the step title and
  description type scale; only `sm` had ever been rendered, inside the dot-style card).
  `docs/data-entry/toggle-group.tsx` gained `variant` (2) and `size` (3) cards, set on the group and
  its items together because `ToggleGroup` only stamps `data-variant` / `data-size` and each
  `ToggleGroupItem` carries its own visual variant; `docs/data-entry/select.tsx` now renders the
  default `SelectTrigger size="md"` next to the existing `sm` trigger. `Toggle` already rendered
  both unions and is now recorded. `component-case-evidence.json` records the branches, promoting
  twelve previously `untested` cells of `preview/frame-coverage.ledger.json` to
  `covered:prop-evidence`. Driven headless in Chromium: each menu opened and its
  `[role="menuitem"] data-variant` read back (`default` × 4-5, `destructive` × 1 per menu), no
  horizontal overflow and zero axe violations on all six touched frames at 320-1920, zero console
  errors, and `check:layout-nav-frames` still green (tabs keyboard, RTL ArrowLeft and axe).

- **Feedback / overlay frames now demonstrate every `tone` / `variant` branch of `Alert`,
  `AlertDialog`, `DialogHeader` and `SheetHeader` (#163).** `docs/feedback/alert.tsx` rendered only
  four of the seven `tone` branches, so `info`, `muted` and `neutral` were claimed by the copy and
  never drawn; the page now renders all seven in vocabulary order and spells out the single
  `variant="default"` branch. `docs/feedback/alert-dialog.tsx` only ever opened
  `variant="destructive"` dialogs and gained a neutral confirm card for the `default` branch (no
  header band, primary confirm button). `docs/feedback/dialog.tsx` and `docs/feedback/sheet.tsx`
  gained a header-tone card that re-opens ONE overlay per branch through the prop-driven
  `title`/`subtitle`/`extra` form, so all seven bands of the shared `overlayHeaderToneClass`
  contract are reachable without ever mounting two focus traps at once.
  `component-case-evidence.json` records the branches, promoting five previously `untested` cells
  of `preview/frame-coverage.ledger.json` to `covered:prop-evidence`. Driven headless in Chromium:
  every branch verified by its rendered `data-tone` and computed band colour (title colour constant
  at `rgb(36,35,30)` in all seven, confirming the band tints only the background), no horizontal
  overflow at 320–1920, and `check:provider-feedback-query-runtime` green with zero axe violations
  on `feedback-dialog`, `feedback-sheet` and `feedback-alert-dialog`. `AlertDialogHeader.tone`
  stays **UNTESTED**: `@godxjp/ui` exports the alert-dialog header/content/footer parts but no
  alert-dialog Root, so the compound form cannot be composed from the public API in a docs frame.

### Changed

- **⚠ DELIBERATE BRAND-COLOUR CORRECTION — the GoDX identity mark is now the canonical emerald,
  not the wakatake status green. New `--brand` / `--brand-foreground` semantic role (gh#250,
  finishing gh#214).** This IS a visible colour change on every surface that renders the identity
  mark; it is a correction, not a regression, and it should not be reverted as one. #214 shipped a
  brand mark "independent of `--primary`" — true, but it was bound to `--success`, the 若竹
  wakatake STATUS green (`#68be8d`). The canonical design system defines TWO distinct greens: the
  wakatake `--success` (which this package already matched almost exactly, and which is correct for
  status) and a separate identity green documented as "kept distinct from SmartHR primary". The
  package therefore rendered the mark at **`#69bf8e`** where canonical is **`#009766`** —
  **ΔE76 ≈ 17.5**, an obviously wrong brand colour rather than a subtle drift.
  `--brand` is now a first-class semantic role in `src/tokens/foundation.css`, declared in both
  `:root` and `.dark` exactly like the other roles: light **`160.5 100% 29.6%` = `#009766`**
  (`oklch(0.595 0.137 162.94)`; carried at one decimal because an integer `160 100% 30%` would drift
  to `#009966`), dark **`160.5 100% 36%` = `#00b87c`** — the SAME hue and chroma, lifted only in
  lightness so the mark reads off the warm near-black spine (6.9:1 on `--background`, 6.3:1 on
  `--card`). `--brand-foreground` is the on-fill pair (off-white light, near-black dark, mirroring
  `--success-foreground`). Verified in headless Chromium against a real preview build: the computed
  fill of `<Logo mark="godx" />` is `#009766` in light and `#00b87c` in dark, for the vector mark,
  the boxed `tone="success"` fill and the wordmark alike.
  **What visibly changes:** `<Logo mark="godx" />`, `<Logo tone="success" />` and the GoDX wordmark
  lockup (so `AuthIdentity`, the AuthShell brand bar and any `CenteredShell` topbar that renders
  them), plus `EMAIL_COLORS.brand` / `.brandForeground` and therefore `EMAIL_BRAND_MARK` in
  `@godxjp/ui/email`. **What does NOT change:** every status surface. `--success` is untouched in
  both themes — badges, alerts, progress fills, timeline done dots, password-strength segments, the
  sidebar presence dot and `tone="success"` text all keep the wakatake green. Nothing else in the
  library was using `--success` for identity.
  Mechanically, `--logo-godx-color`, `--logo-wordmark-color` and `--logo-success-{background,
foreground}` stay **role-mirror knobs**: still `initial` at `:root`, with the role default moved at
  the CALL SITE to `hsl(var(--logo-godx-color, var(--brand)))`, so a scoped `.dark` /
  `[data-tenant]` override of `--brand` still reaches the mark instead of freezing at `:root`.
  On the email side only the ROLE MAP moved (`EMAIL_COLOR_ROLES.brand → --brand`); the invariant
  that **no hex literal exists anywhere in `src/email/`** holds — the palette is still generated
  from `src/tokens/foundation.css` and converted HSL→hex at module load.
  Note the three same-sounding tokens are now explicitly disambiguated in the catalog: `--brand`
  (identity), `--brand-glow-*` (the decorative radial halo) and `--text-brand` / the Tailwind
  `text-brand` utility (the BLUE brand-numeral text slot). There is intentionally no `bg-brand`
  utility, because `--color-brand` is already taken by `--text-brand`; identity surfaces read
  `hsl(var(--brand))` directly in component CSS. The `Logo` wordmark also now carries
  `data-logotype`, the attribute `check:contrast` reads for the WCAG 2.2 SC 1.4.3 logotype
  exemption — brand-name artwork has no contrast minimum, and the library must not darken a
  brand's own colour to satisfy one. (Contrast improved regardless: the wordmark went from
  ~2.2:1 to 3.67:1 on the light surface, and the dark mark sits at 6.3:1.)
  Pinned by `src/tokens/__tests__/brand-identity-role.test.ts`, which asserts the identity reads
  `--brand` and never `--success`/`--primary`, that the status owners still read `--success`, and
  that the two greens stay visibly distinct.

- **Email base tokens reconciled with the SCR-302 canonical reference (gh#250).** Measured from
  `.design/DXS Email Templates.dc.html` and confirmed pixel-for-pixel against the 1440 reference
  raster, the email ramp was carrying the WEB scale rather than the canonical email one. Typography:
  title `20px/1.25` weight 700 → **`17px/1.7` weight 500** (a transactional title is calm, not
  bold), body line-height `1.7` → **`1.9`**, legal band `12px/1.5` → **`11px/1.8`**, mobile title
  `18px` → **`16px`** (it must never exceed the desktop title). Primary CTA: `44px` tall with `24px`
  inline padding and a `700` label → **`36px` (mirrors `--control-height-lg`), `16px` padding
  (`--space-4`), `500` label** — still clearing WCAG 2.2 SC 2.5.8 (24×24), and the mobile reflow
  still takes it full-bleed. Brand mark: the ARTWORK was already correct — byte-identical to
  `<Logo mark="godx" />` and to the canonical raster, contrary to the report of a differing glyph —
  but the rendered box was the 32px web box; it is now the canonical **22px** header box. The CTA
  colour pair is CONFIRMED, not changed: `EMAIL_COLORS.primary` / `primaryForeground` keep deriving
  from `--primary` / `--primary-foreground`, because pasting the canonical console's hex would break
  the no-drift guarantee that is the whole point of this export. The `--email-*` tokens, the
  `@godxjp/ui/email` export, the MCP catalog and the `foundation/email-tokens` specimen all move
  together; templates pinned to the old geometry should re-render against the specimen.

- **Restore the checked-in DXS hi-fi baseline across every shell and data surface** — AppShell and
  CenteredShell chrome now use the 48px reference height, flat card topbars, a warm muted main
  surface and the 1280px page boundary instead of the 52px translucent/blurred gradient treatment.
  Sidebar brand/navigation geometry now follows the compact 22px/13px reference rhythm and switches
  to its drawer at 900px. Cards return to the documented 10px radius with `shadow-sm`, compact page
  insets begin at 720px, and AuthShell/CenteredShell use the flat muted canvas. The bundled product
  face is now M PLUS 2 for ja/en/vi with Noto Sans JP as its CJK fallback. All new geometry remains
  exposed through component tokens so service themes can retune it without consumer CSS forks.

- **The `table-master-detail` showcase now composes `MasterDetail` instead of hand-rolled tracks
  (#223).** The "未選択の状態" card built its split from page-local geometry —
  `lg:flex-row lg:items-start` on a `Flex`, a `lg:w-56 lg:shrink-0` master column, `flex-1` on the
  detail panel and a pair of orientation-swapped `Separator`s — which is exactly the consumer-local
  track authoring #223 exists to delete, in the library's own copy-pasteable showcase. It is now a
  single `<MasterDetail rail="master" railWidth="compact" collapseBelow="md">`: `rail="master"`
  because the 一覧 is the LEADING fixed track and the detail surface is the fluid one (the inverse
  of the default `rail="detail"`), and `collapseBelow="md"` because the threshold is measured
  against the composition's own inline size rather than the viewport — inside a `Card` body at the
  1280px page boundary the old viewport-based `lg:` corresponds to a ~940px container, and `md`
  (48rem) is the tokenized step that keeps 1440 and 1024 side-by-side while 390 stacks. Measured in
  Chromium: the rail holds 300px at both 1440 (detail 1042px) and 1024 (detail 626px), the regions
  stack between 860 and 840 viewport px (container 778 → 758, i.e. the 768px token), and RTL mirrors
  the rail to the inline-end edge. The 224px rail also silently clipped the master table's 275px
  intrinsic width; the tokenized 300px `compact` track is the first one it fits in. The remaining
  two regions are deliberately NOT migrated: the Gmail-style split is user-draggable and belongs to
  `ResizablePanelGroup`, and the 狭幅レイアウト card is an always-stacked single-surface demo (flush
  table, hairline, padded detail) that `MasterDetail`, whose stacking is width-driven, should not
  impersonate.

### Fixed

- **`Tabs variant="line"` no longer keeps a ring around the SELECTED trigger — and the keyboard
  focus ring is finally its own state (gh#248).** `TabsTrigger` painted the selected state with
  `data-[state=active]:ring-1 ring-primary/25` for every variant, so the underline-only line variant
  still drew a card-like border no consumer could remove without a page-local override. Worse, both
  states used the same Tailwind `ring-*` utilities at equal specificity, so the 1px selected ring
  simply swallowed the 3px `focus-visible:ring-[3px]` keyboard ring. The selected ring is now scoped
  to the default/card lists (`group-data-[variant=default]/tabs-list:`), and the line indicator moved
  out of the `after:*` utilities into a token-owned rule reading
  `--tabs-indicator-{background,size,offset}` (`initial` → `hsl(var(--primary))`, 2px, offset 0).
  Measured in Chromium at 1440 / 1024 / 390 on `/frame/navigation-tabs`: a mouse-selected line tab
  now computes a **fully transparent box-shadow** plus a 2px `rgb(0,119,199)` bar, while a genuinely
  keyboard-focused one (Tab, then ArrowRight) computes `oklab(… / 0.5) 0 0 0 **3px**` plus
  `outline: solid 1px` — before the fix BOTH states computed the same `oklab(… / 0.25) 0 0 0 1px`.
  Default/card triggers are unchanged (1px ring + `shadow-sm`), the strips still scroll their own
  overflow at 390, and the console stayed clean. Two side fixes fall out: the `items` API now
  actually forwards `variant="line"` to its `TabsList` (previously it styled the list through
  `className`, leaving `data-variant="default"` so no line rule ever matched, and the underline was a
  duplicate hand-rolled `border-b-2 border-primary`), and the vertical rail uses logical
  `inset-inline-end` instead of the physical `after:-right-1`, so it flips under `dir="rtl"`
  (verified: `right:0` in LTR → `left:0` in RTL).

- **`DataTable.Pagination` now owns its own inset instead of declaring `padding-top` only
  (gh#236).** The footer ships as a self-contained slot and is usually dropped straight into the
  documented flush container (`<Card><CardContent flush><DataTable/>`), where no ancestor supplies
  padding — so the "rows per page" label and the page-size `Select` sat flush against the container
  edge and its closing border. Measured in Chromium on the preview at 1440 / 1024 / 390: computed
  padding was `7.36px 0 0 0` (numbered) / `8.64px 0 0 0` (cursor) and the label started at the
  container's own inline edge, 13px inside of the first column's text axis. It now declares
  `padding-block` + `padding-inline` from two new knobs, giving `7.36px 12px 7.36px 12px` /
  `8.64px 12px 8.64px 12px`, with the label at 36px against the first column's text at 37px (the
  1px table border) — on the same optical axis, with the block-end breathing room restored. The
  block value still differs per density scope, which is the point: both knobs are declared
  `initial` with their density-scaled defaults resolved at the call site, so a `.ui-density-*`
  subtree re-resolves them instead of freezing at `:root`. Consumer apps can drop their local
  `.ui-data-table-pagination` overrides.

- **`Sidebar` no longer shears descenders and Vietnamese tone marks off every nav label (gh#254).**
  `.sb-label` clips with `overflow: hidden` but declared no line-height, so it inherited
  `line-height: 1` from `.sb-nav-item` — and on a clipping element the line box IS the clip box, so
  a 1em box shorter than the font's ascent+descent destroyed everything below the baseline.
  Measured in Chromium against the bundled M PLUS 2 at the row's 0.8125rem, comparing canvas ink
  extents with the element's own clip box: **1.6–1.9px of glyph gone at `line-height: 1`**, fits
  from 1.2, 1.4px of headroom at 1.5. Downstream (DXS console) this silently misspelled the
  Japanese-first product's Vietnamese locale — "Dịch vụ" lost both tone marks and rendered as
  "Dich vu", "Phê duyệt truy cập" lost three — while the DOM text stayed correct, so no a11y or
  reflow gate could see it. The label now reads a new `--sidebar-nav-item-line-height` knob
  (default `1.5`) instead of inheriting: the row is a fixed `--sidebar-nav-item-height` with
  `align-items: center`, so 19.5px inside the 32px row grows only the centred text box — row
  height, icon alignment and gap are byte-identical. `.tb-chip-label` carried the same latent trap
  (clips, no own line-height, safe only because `.tb-chip` uses `font: inherit`) and is fixed in
  the same pass, and a guard now fails the build if ANY single-line clipping box in the shell
  inherits its line box.
- **Topbar now prevents center-slot collisions at compact desktop and mobile widths (#244).** At
  1100px and below, the optional center slot follows the public
  `--topbar-center-compact-display` contract (default `none`) before a full search trigger can
  cover the start breadcrumb/title or end utilities. The final start-slot item now owns a real
  shrink + ellipsis boundary. The interactive Topbar preview exercises long JA/EN/VI labels, and a
  Chromium gate records 1440/1024/390 geometry, focus, overflow and screenshots.

- **`CompactBarTrend` now has a Recharts-free public entry (#243).** Consumers that do not install
  the optional `recharts` peer can import from `@godxjp/ui/charts/compact-bar-trend` without Vite
  eagerly linking the peer-backed exports in `@godxjp/ui/charts`. The packed-public-contract gate
  now extracts the real tarball into a fresh consumer and runs a production Vite build with no
  `recharts` package present, so this regression cannot pass on source-only or text-only checks.

- **`check:frame-geometry` no longer reports a deliberately scrollable surface as a clipped
  control.** The sweep counted every focusable whose box sticks out of the frame, which is true of
  ALL content inside a scroll region — so a `DataTable` at 320px (`.ui-data-table-scroll`,
  scrollWidth 640 / clientWidth 244) and a `FilterBar overflow="scroll"` strip at 768px
  (`.ui-toolbar`, scrollWidth 768 / clientWidth 652) were flagged even though `overflowX` was
  false and every flagged control was focusable, scrollable into view and hit-tested clean —
  focusing the DataTable's sort button scrolls its region from scrollLeft 0 to 344 and lands it
  fully inside, and the one `FilterBar` trigger that stays put is 63% visible with its focus ring
  on screen because Chromium's `CenterIfNeeded` focus alignment never moves a partially visible
  target (reproduced on a synthetic scroller — browser behaviour, not a component defect; it
  clears 2.4.7 and 2.4.11 AA, which only forbids a fully obscured focus). Four such false
  positives (`layout-master-detail` @320/375/390, `navigation-filter-bar` @768) failed the
  gate. `clipped` now means what it says — _a control the user cannot bring into the frame_: an
  out-of-frame focusable is re-probed by scrolling ONLY its user-scrollable ancestors (computed
  `overflow: auto|scroll|overlay` with real scroll room — never `hidden`/`clip`) and counts as
  reachable when it lands fully inside, or when it is content wider than its own scroll viewport
  (a full table row) whose leading edge is inside. Scroll offsets are restored after each probe.
  Genuinely clipped controls still fail: verified that `data-entry-rating` @320,
  `foundation-density` @320/375 and the form examples keep every one of their counts because those
  controls have no scrollable ancestor at all, and `layout-page-container` keeps its real document
  overflow. The baseline was NOT regenerated — it is recorded on the canonical CI runner and may
  only shrink there.

- **`check:layout-nav-frames` is deterministic again — the roving-focus assertions now await the
  focus move instead of racing it.** The gate failed intermittently (and on `origin/main`
  reproducibly) with `LTR Tabs ArrowRight focus failed`. The product was never wrong: Radix
  `RovingFocusGroup` deliberately defers the arrow-key focus move out of the `keydown` handler
  (`setTimeout(() => focusFirst(candidateNodes))`), so the next trigger becomes
  `document.activeElement` ~10-25ms after `keyboard.press()` resolves — measured 8/8 in Chromium,
  always landing on the correct trigger, just later than the very next CDP round-trip. The harness
  read `document.activeElement` synchronously, so the gate passed or failed on scheduling luck. Both
  the LTR ArrowRight and the RTL ArrowLeft checks now poll the same assertion with a bounded wait
  and report the index that was actually focused on failure, and each tablist is first awaited until
  Radix has registered its focusable items (`[role="tablist"][tabindex="0"]`) so the key never lands
  on a not-yet-interactive strip. No assertion was weakened, retried away or removed.

### Added

- **`PageContainer` bounded page `measure` — one shared header+body measure, orthogonal to
  `variant` (#245, #247).** The new `measure="default" | "narrow" | "medium"` prop caps the page
  HEADER and the page BODY to a single token-owned measure, so a header `extra` action ends flush
  with the body surface instead of stranded at the page edge. This is the gap both consumer issues
  hit: `variant="narrow"` caps only `.ui-page-body` (header action left at x≈1416 at 1440), and
  because chrome and measure were the SAME variant axis, the quiet `variant="ghost"` rhythm a
  notification feed wants could not be combined with a bounded measure at all. `measure` is a third
  independent axis, so `variant="ghost" measure="medium" headerLayout="responsive-inline"` composes
  as the canonical quiet feed. New semantic tokens `--page-measure-narrow` (42rem) and
  `--page-measure-medium` (48rem) are OUTER measures — the package-owned page gutters sit inside the
  cap — so a service theme retunes both presets in one place and no consumer writes a page-local
  `max-width`. Measured in headless Chromium against the built stylesheet, emulating the AppShell
  main region (256px rail + the 80rem page boundary): `measure="medium"` renders a **720px** visible
  surface at **x=280..1000 at both 1440 and 1024**, with the header action's end edge landing on
  **x=1000**, exactly on the card edge; `measure="narrow"` renders 624px (x=280..904); at 390 nothing
  binds and the surface stays fluid at **358px** with the 16px compact gutter, while
  `headerLayout="responsive-inline"` still holds the action on the title row (x=198..374, 176px).
  RTL mirrors the whole measure to the inline-end edge (1440: body x=672..1440, card 696..1416).
  The cap is `max-inline-size`, never a width, and the footer is deliberately left uncapped because
  its border/background is page chrome when `stickyFooter` pins it. No new "quiet header" token was
  needed: `--page-header-divider` already defaults to `none` (cardinal rule #44) and `ghost` already
  drops the header's bottom pad. `measure="default"` is inert by construction — it emits
  `data-measure="default"`, which matches NO selector in the stylesheet (the gh#231
  `data-layout="stack"` precedent, asserted by a test), and every existing page measured
  `max-inline-size: none` on both bands in the browser.

- **PageContainer canonical Admin collection preset (#242).**
  `preset="admin-collection"` now owns the collection header-to-toolbar rhythm, 320px search
  measure, 32px control tier, compact table row/cell density and horizontal containment through
  service-themeable semantic tokens. Consumers set one page-level API instead of repeating field,
  row or breakpoint overrides. The responsive preview covers JA/EN/VI labels, keyboard focus and
  narrow horizontal table containment.

- **AppShell opt-in docked navigation below 900px (#242).** The new
  `responsiveNavigation="drawer" | "docked"` contract keeps the accessible drawer as the default,
  while approved narrow layouts can retain the same sidebar, footer/account region and active
  navigation in the token-sized shell grid. Docked mode suppresses the redundant drawer trigger;
  consumers no longer need page-local media queries to keep a canonical rail visible.

- **Device-authorization public primitives (#238).** `Steps type="inline"` renders the compact
  numbered auth progress row with localized process/finish/error/wait semantics;
  `InputOTPGroup appearance="grouped"` renders one outline per code group without replacing the
  real `input-otp` hidden input, paste, caret or keyboard behavior; and `AuthAccountSummary` owns
  the compact avatar/email/switch-action row with long-email truncation and responsive wrapping.
  All geometry is token-backed and the package adds no route, permission or mutation behavior.

- **`AuthShell preset="account-recovery"` — the token-owned SCR-008 password-recovery / sign-in-MFA
  panel measure (#233).** DXS Platform could only reach the canonical 432px recovery and MFA
  challenge panels through page-local geometry, because `variant="canonical"` owns a single 360px
  measure. A third named flow preset now owns both — the two canonical desktop panels share one
  width, so they share one preset: `--auth-shell-recovery-card-max-width` (27rem/432px),
  `--auth-shell-recovery-main-padding` (16px) and `--auth-shell-recovery-main-padding-mobile` (15px
  inline, so the panel renders `x=15, width=360` at 390). Measured in Chromium: panel `x=504, w=432`
  at 1440 and `x=296, w=432` at 1024 with a 382px content column; `x=15, w=360` with a 310px column
  at 390; no horizontal overflow at any of the three, and axe (wcag2a/2aa/21a/21aa/22aa) reports 0
  violations on all five docs pages at both 1440 and 390. Everything that existed before is
  untouched — the canonical 22.5rem Login measure, the 24rem un-preset shell, and the
  `device-authorization` / `context-selection` presets — and `preset` remains optional.
  **The panels themselves are deliberately NOT components.** Both failed Gate 0 of
  `docs/COMPOSITION-VS-COMPONENT.md` on C2/C3/C4/C7: the only real behaviour in the surface (paste,
  arrow keys, backspace, caret across six slots) already belongs to `InputOTP`, focus order is DOM
  order, and a `state="request | sent | new-password | expired"` prop would be the same
  screen-shaped grab-bag that `ErrorSurface`'s `mode` was rejected for — one prop swapping five
  incompatible bodies. So the package ships the measure and the tokens, and
  `docs/layout/auth-recovery/` pins the canonical body — a `Card` whose `CardHeader` holds the
  `CardTitle` and `CardDescription` INSIDE the bordered surface, over a `CardContent` > `AuthStack`
  carrying the notice (`Alert`), the fields, the `Button fullWidth` primary and a
  `Flex justify="between" wrap` fallback row — across all seven states
  (recovery request/sent/new-password/expired, MFA otp/recovery-code/passkey-failure) plus the
  error, loading and disabled paths. The surface is presentation-only: no route, no reset semantics,
  no OTP verification, no recovery-code consumption, no passkey authentication, no permissions.
  `AuthIdentity` is explicitly not used there (it always renders the hosted mark above the card) and
  `TwoFactorSetup` remains the enrollment dialog, never a sign-in challenge.
  **The 390 responsive contract is decided here, not traced.** The canonical 390 reference supplied
  with the issue is a desktop 2×2 composite that overflows and crops horizontally; it shows no
  mobile route and was not used. The documented contract instead reuses the canonical Login mobile
  gutter so Login → Recovery never makes the surface jump, keeps the OTP row at one 216px line
  inside the 310px column, keeps the primary action full-width, and lets the fallback row reflow to
  a stack purely on content — measured: the vi labels (222.4+206.4px) wrap at 432px while ja and en
  do not, and all three wrap at 360px, with no media query and no locale branch.

- **`--otp-slot-size` — the InputOTP slot box as its own knob (#233).** An auth panel can now widen
  the 6-slot challenge row without re-scoping `--control-height` on the card, which would also
  resize the submit button and every other input in it. It is declared `initial` with the tier as a
  call-site fallback (`var(--otp-slot-size, var(--control-height))`) — the tier-mirror form of the
  role-mirror rule in `docs/TOKENS.md`. That detail is not academic: the first implementation bound
  the knob to the tier at `:root` and headless Chromium caught the canonical auth shell's 36px slots
  silently collapsing to the frozen 32px `:root` tier. Default output is byte-identical and still
  density-aware; a service opts in with a named tier, never an ad-hoc `calc()` offset.

- **`QrCode` local-only SVG renderer (#205)** — adds a scanner-safe data-display primitive for
  TOTP enrollment, device pairing and other QR payloads that must never be sent to a third-party
  image service. The required localized `label` names the image without exposing its encoded value;
  `size` uses the shared `xs | sm | md | lg` vocabulary; a fixed four-module quiet zone, local SVG
  encoding, medium-or-better error correction and dark-on-light component tokens remain private
  reliability invariants. The API deliberately omits remote image/logo settings, raw colours,
  numeric sizing and inline style. Consumers compose it with `CredentialReveal` for a manual-key
  fallback inside one outer Card. Includes unit, SSR, secrecy and axe coverage plus a complete docs
  frame and MCP catalog entry.

- **`AlertDialog` gains typed-`challenge` + `stepUp` re-auth for the DangerConfirm recipe (#193)** —
  the destructive-confirm preset now covers high-stakes deletion end-to-end WITHOUT a new component
  (it already owned type-to-confirm + destructive tone + `pending`). New `challenge` prop is the
  semantic alias of `confirmPhrase` — the exact token to type (e.g. an org slug `acme-inc`) before
  the confirm button arms; a typed challenge forces the destructive tone and a soft danger header
  band. New `stepUp?: () => Promise<boolean> | boolean` runs an async passkey / 2FA re-auth gate
  BEFORE `onConfirm` fires: the confirm button shows a "Verifying…" state while it runs, a resolved
  `false` (or a throw) keeps the dialog open and announces the failure via a `role="alert"` region,
  and `onConfirm` only runs after step-up resolves truthy. Mirrors DXS SCR-203 (org delete by slug)
  and SCR-209 (refund with step-up); showcased in `docs/feedback/danger-confirm.tsx`. i18n keys
  `feedback.alert.verifying` / `feedback.alert.stepUpFailed` added for en/vi/ja.
- **Permission-matrix composition + `@godxjp/ui/lib/permission-grid` util (#194)** — a role ×
  permission RBAC grid (sticky first column, ✓/— cells, two-role COMPARE mode, 差分のみ / diff-only
  filter) requested by the DXS Platform Redesign. Per Gate 0 (`docs/COMPOSITION-VS-COMPONENT.md`) a
  permission matrix is a **composition pattern**, not a framework component (it fails C2/C3/C7 — the
  `Table` family + `Badge` + tokens already express it, and no consumer beyond RBAC admins pays its
  bundle cost), so it ships as the real-screen showcase `docs/showcase/permission-matrix.tsx` built
  from real primitives (sticky-column via the `Table` family exactly like `table-sticky-columns`;
  role pickers = `Select`; diff toggle = `Switch`; cells = `Badge` with shape-encoded ✓/— + sr-only
  state, never colour-only). The only genuinely reusable part — the grant/diff DATA logic — is added
  to the library as the pure, render-neutral, tested util **`@godxjp/ui/lib/permission-grid`**
  (`grantKey` / `hasGrant` / `rolesDifferOnPermission` / `visibleRows` / `countDifferences` /
  `countGrants`) so every consumer shares one source of truth. No new `src/components/` entry.
- **`CredentialReveal` — one-time secret display (#195)** — the GitHub/Stripe token-reveal pattern
  as a real `@godxjp/ui/data-display` primitive so consumers stop hand-rolling it. Shows an issued
  secret masked by default with a show/hide toggle (controlled boolean triad
  `revealed`/`defaultRevealed`/`onRevealedChange`), a copy button that writes to the clipboard and
  confirms via a `Check` swap + an `aria-live` announcement, an optional download-as-file button
  (`downloadable`/`downloadFileName`), a localized caution banner (`tone` warning/destructive/info,
  suppressible with `warning={null}`), and an optional `onAcknowledge` action to gate a paired
  Dialog's close. Re-blurs automatically when the `secret` prop changes; masks with a fixed-length
  dot string so the secret's real length never leaks. Composed only from real primitives
  (`Alert` · `Button` · `Text`); every string + `aria-label` is routed through `t()`
  (en/vi/ja). `size ∈ xs|sm|md|lg`. Ships a unit test and a `*.a11y.test.tsx` (0 axe violations).
- **OrgSwitcher recipe — sidebar organization/tenant switcher (#196)** — the Slack/Linear
  workspace-switcher requested by dxs-platform ships as a **composition pattern**, not a new
  framework component (GATE 0 Framework-Component Test: FAILs C2/C3/C4/C6/C7 — it owns no new
  behaviour, is fully expressible from existing primitives, and `Sidebar` already exposes the
  `brand`/`product` + `onProductClick` slot to host it). The current-org card at the top of the
  `Sidebar` opens a `Popover` containing a searchable `Command` list of organizations plus
  "create organization" / "join by invite code" footer actions — built entirely from real
  `@godxjp/ui` primitives (`Popover` · `Command` · `Button` · `Avatar` · `Text`). Added as a
  copy-pasteable showcase page (`docs/showcase/org-switcher.tsx`, registered in the showcase
  catalog) with behavioural (`org-switcher.test.tsx`) and axe (`org-switcher.a11y.test.tsx`)
  tests. The active org carries a visible Check **and** an sr-only status word (never
  colour-only); the trigger announces the current org; spacing is logical (RTL-safe).

- **`Toolbar` (the FilterBar) gains an opt-in `sticky` list-filter strip + is now catalogued
  (#197)** — the framework filter strip (`Toolbar` / `ToolbarGroup`, in
  `src/components/navigation/filter-bar.tsx`) takes a new positive-boolean `sticky` prop that pins
  the strip to the top of its scroll container while the list scrolls beneath it, closing the last
  gap that pushed consumers to hand-roll their own bar (DXS list screens SCR-107/202/208). Following
  Gate 0 (`docs/COMPOSITION-VS-COMPONENT.md`), a bespoke `<FilterBar filters=[…] chips …>` grab-bag
  component was rejected — it is composable today (C3 fail) from `Toolbar` + `SearchInput` + `Select`
  - `Badge` chips, so the pattern is documented as a real-screen recipe rather than a new component.
    New quiet-by-default theme knobs `--filter-bar-sticky-offset` (park below a topbar) and the
    role-mirror `--filter-bar-sticky-background` (`initial`, resolves to `--background`) let a service
    retune the pinned strip without forking CSS. The previously-uncatalogued `Toolbar` now has a
    `@godxjp/ui-mcp` entry (with the active-filter-chip recipe: a `Badge` label + a **sibling** icon
    `Button`, never nested) so agents stop re-implementing it. New `StickyProp` vocabulary type,
    registered.
- **Framework-agnostic form-state adapter + first-class Inertia binding (#190)** — `FormRoot` and
  `FormFieldControl` are no longer hard-coupled to react-hook-form. `FormRoot` now accepts EITHER
  `form` (the built-in RHF + Zod client path, unchanged) OR `adapter` — a small `FormStateAdapter`
  (`getValue`/`setValue`/`getError`/`isSubmitting`/optional `onBlur`/`getValues`) — so a
  server-driven form library plugs into the SAME auto-binding. `FormFieldControl` binds each field by
  `name` (value/onChange/error, with `aria-invalid` wired from the error slot) on either path, and a
  new `useFormSubmitting()` hook reads `isSubmitting` from whichever path is active (drives
  submit-button `loading`). New optional subpath **`@godxjp/ui/inertia`** ships `inertiaAdapter(form)`
  (wrap Inertia's `useForm`) and a lighter `useInertiaField(form, name)` helper. The core keeps
  **zero** dependency on `@inertiajs` — the Inertia shape is duck-typed — so formik / TanStack Form
  can implement the same contract. An Inertia page now binds a labelled, validated field with no
  manual `value`/`onChange`/`error`/`aria-invalid` wiring; server (FormRequest) errors surface on the
  right field and clear on edit.
- **`CenteredShell` — authenticated, no-sidebar, centred-column page shell (#189)** — the third
  layout shell, filling the gap between `AppShell` (which REQUIRES a sidebar — its padded topbar
  chrome is a grid area beside the nav rail) and `AuthShell` (the UNAUTHENTICATED root, a narrow
  ~24rem card centred vertically with no actions slot). CenteredShell gives a **padded top bar with
  real actions** (banner) reusing the same `.app-topbar` chrome (inline padding · border · backdrop)
  WITHOUT a sidebar, a scrollable `main` holding a **width-tiered centred column** (`width` =
  sm ~32rem · md ~46rem default · lg ~64rem, all wider than the auth card) that is top-aligned so
  sections flow + scroll, and an optional footer (contentinfo). A hosted "My Page" / account /
  standalone-settings page now needs **zero custom CSS** and never hand-rolls a bar (the bare
  `Topbar` ships no inset — the `.ui-topbar` zero-padding footgun). New tokens
  `--centered-shell-bar-height`, `--centered-shell-bar-padding-x`, `--centered-shell-main-padding`,
  `--centered-shell-footer-padding`, `--centered-shell-width-{sm,md,lg}` let a service retune the
  bar inset, block padding and each width tier without forking CSS.
- **Per-frame axe a11y gate real fixes (#157)** — the frame-axe baseline shrank from 101 allowlisted
  frames toward near-zero by fixing ROOT CAUSES, not re-baselining:
  - Every docs demo's top-level `CardTitle` now declares `level={2}` (was the library default
    `h3`), fixing the pervasive `h1 → h3` heading-order skip under `PageContainer`'s `<h1>` (91
    frames) — an AST codemod, nested Card-in-Card titles correctly kept the `h3` default.
  - `Pagination`, `Breadcrumb` (standalone + `PageContainer`'s built-in breadcrumb slot via new
    `breadcrumbAriaLabel`), and `Sidebar` gained an `aria-label` override prop so more than one
    instance on a page/view gets a distinguishable landmark name (`landmark-unique`, WCAG 2.4.1);
    `PageContainer`'s breadcrumb `aria-label` now routes through `t()` instead of a hardcoded
    English literal.
  - `FormField` now ALSO injects a redundant `aria-label` (mirroring the visible `label`, when it's
    plain text) alongside its `aria-labelledby` wiring — a belt-and-suspenders accessible-name path
    for every control it wraps.
  - Scrollable regions are now keyboard-reachable (`tabIndex={0}`, WCAG 2.1.1 / axe
    `scrollable-region-focusable`) without becoming landmarks: the `Table` primitive's overflow
    wrapper, the `DataTable` horizontal scroll region, and the `ScrollArea` viewport.
  - `Calendar` selected day now keeps `text-primary-foreground` on its ghost `<button>` through
    hover/focus, fixing dark-label-on-blue insufficient contrast on the selected date
    (`color-contrast`).
  - `DataTable`'s built-in empty state renders its message as plain text (`titleAs="p"`) instead of
    an `<h3>`, so a "no rows" status never injects a stray heading into the page outline
    (`heading-order`).
- **`Select`/`DataSelect`** (searchable mode — `showSearch`/`loadOptions`) now forwards controlled
  `open`/`onOpenChange`, controlled `search`/`onSearchChange`, `readOnly`, `size`, a `filterOption`
  override for the default client-side filter, and custom `renderError`/`renderLoadMore` slots to
  the underlying `SearchSelect` engine — previously silently dropped. `readOnly` mirrors the
  Input/NumberInput contract (value shown + submittable, no new pick, clear affordance hidden).
  (#175)
- **`SelectTrigger`** accepts `showIndicator` (default `true`) — set `false` to omit the built-in
  chevron disclosure indicator from the DOM entirely (not a CSS hide), for specialized triggers
  (icon-only, etc.) that render their own affordance, without reaching for consumer descendant CSS.
  (#175)
- `AppShell` now OWNS an accessible mobile navigation drawer below `lg`: a hamburger trigger in the
  topbar opens a focus-trapped `Sheet` (Esc + overlay close, focus returns to the trigger). New
  props `mobileNav` (defaults to the `sidebar` node — pass a tailored menu, or `null` to opt out),
  `mobileNavLabel`, `mobileNavOpen` and `onMobileNavOpenChange`. Hiding the sidebar without a
  reachable alternative is no longer the shell's behavior (#165).
- `Sidebar` items support real links without a nested interactive element: `SidebarItemProp.href`
  renders the row as an `<a>`, and `renderItem` now merges its returned element as the row via Slot
  (return a router `<Link>`) — no more `<button>`-wrapped custom content (#165).
- `Pagination` gains `hideOnSinglePage` (default `true`): the bar is hidden for zero items and for a
  single page; set `false` to opt in on one page (e.g. to keep `showTotal` visible). `total === 0`
  is always hidden (#153).
- **`CardTitle`** accepts a semantic heading `level` (`1`–`4`, default `3` — unchanged) and an
  `as` override (`h1`–`h4`/`p`/`div`) so consumers keep a valid document outline
  (`h1 → h2 → h3`, no skipped levels) without changing the title's token-driven size. Use `as="p"`
  when the card title is a styled label rather than a section heading. (#154)
- **`EmptyState`** accepts `titleLevel` (`1`–`4`, default `3` — unchanged) and `titleAs`
  (`h1`–`h4`/`p`/`div`) for the same reason: pick the level for outline position, not size, and use
  `titleAs="p"` for a compact/section empty state inside a section that already owns its heading.
  Coordinated with the existing `variant` (`page`/`section`/`compact`) and `tone` API. (#154, #144)
- **`DataTable` `ColumnDef.ariaLabel`** — a visually-empty action/selection column keeps a
  screen-reader header (e.g. "Actions"/"Select") rendered as an `sr-only` label inside its `<th>`,
  clearing the axe `empty-table-header` violation. DataTable now **dev-warns** when a rendered
  `<th>` has neither visible nor accessible text. Official DataTable examples set `ariaLabel` on
  their action columns. (#155)
- Shared forwarding contract `src/lib/field-a11y.ts` (`FieldA11yProps`, `pickFieldA11y`,
  `pickGroupFieldA11y`, `resolveFieldA11y`, `mergeAriaIds`) so the FormField relationship is wired
  consistently, not reinvented per control.
- FormField integration test asserting the **computed** accessible name / description / error for
  every custom control (`form-field-contract.a11y.test.tsx`), plus a `docs/data-entry/form-field`
  example demonstrating the contract, error timing and async server-validation + recovery.
- **`Table` `scrollable` prop (default `true`).** A standalone `Table` keeps owning its
  keyboard-reachable horizontal-scroll wrapper; pass `scrollable={false}` when an ancestor already
  provides the scroll region so the table does not add a redundant NESTED scroll container + a
  duplicate keyboard tab stop. `DataTable` now sets this (its `.ui-data-table-scroll` owns the
  overflow + tab stop).
- **`LegalDocumentShell` — the long-form legal/policy document surface (#222).** Terms of service,
  privacy policy, DPA, cookie policy, SLA and EULA screens were hand-rolled per app on consumer-only
  `.legal-*` CSS; the shell now owns that behaviour and renders semantic `article` / `nav` /
  `section` landmarks with REAL `<a href="#…">` anchors. It ships a readable measure and
  top-aligned document geometry; a **sticky contents rail** at ≥`56rem` of the shell's OWN width
  (a container query, not a viewport media query — the `SplitPane` precedent, #165), degrading below
  that to a static compact block between the header and the first section; an `IntersectionObserver`
  **scroll spy** marking the section at the reading line with `aria-current="location"` plus a
  leading marker and a heavier weight (never colour-only, WCAG 1.4.1); **hash deep links**
  (`#section-id` on arrival selects that section, and activating an entry rewrites the hash with
  `history.replaceState`, so the Back button is never hijacked); a scroll offset via
  `scroll-margin-block-start: var(--legal-document-scroll-offset)` instead of JS arithmetic; focus
  handoff to the target `<section tabIndex={-1}>` (`preventScroll`) with a visible ring; and an
  instant jump under `prefers-reduced-motion: reduce`. API: `title` · `sections: { id, title,
content }[]` · `version` · `effectiveDate` (**ISO 8601** in, `Intl.DateTimeFormat` out, inside
  `<time dateTime>`) · `summary` · `contentsLabel` · `activeSection` / `defaultActiveSection` /
  `onActiveSectionChange` · `documentNavigation` · `footerAction` · `id` · `className`, with `ref`
  forwarded to the container-query scope root. ALL legal text stays consumer-owned. Exported from
  `@godxjp/ui/layout`, with a complete `--legal-document-*` tier
  (`src/tokens/components/legal-document.css`) for measure, column gap, contents-rail
  geometry/typography, header/meta/section rhythm, body line height, scroll offset and footer gap —
  chrome quiet by default per rule #44 (`--legal-document-toc-border` /
  `--legal-document-header-border` / `--legal-document-footer-border` default to `none`) and every
  colour knob a role mirror declared `initial` with its role default at the call site (contents →
  `--muted-foreground`, active → `--foreground` on `--accent`, marker → `--primary`, meta/summary →
  `--muted-foreground`). i18n `layout.legalDocumentShell.{contents,version,effectiveDate}` in
  en/vi/ja, docs fixtures at true 1440×900 / 1024×900 / 390×844 plus a long JA/EN/VI wrapping
  fixture, and MCP catalog + token entries.
- **`CompactBarTrend` — a DEPENDENCY-FREE compact bar trend for dashboard summary cards (#218).**
  `@godxjp/ui/charts` previously offered only the recharts-backed `BarChart`, so a consumer whose
  policy forbids screen implementers from adding dependencies (the DXS Platform SCR-201 admin
  dashboard) had no framework option and fell back to a page-local grid with inline height
  calculations. `CompactBarTrend` closes that gap: N category/value pairs rendered as token-sized
  CSS marks with **no `recharts` peer at all**, muted bars plus ONE emphasized "current" bar
  (`emphasizedIndex`, negative counts from the end), an `xs|sm|md|lg` plot-height tier (`xs` =
  dashboard summary-card density), an optional `footer` activity slot rendered outside the
  `role="img"` graphic, a built-in empty state and locale-aware `Intl.NumberFormat` values.
  Accessibility reuses the shared chart frame — a `<figure>` + visible `<figcaption>`, a
  `role="img"` plot named by a localized one-line summary, and a visually-hidden per-category value
  list wired through `aria-describedby` (WCAG 1.1.1) in which the emphasized bar is annotated, so
  the highlight is never colour-only (WCAG 1.4.1). The graphic holds no focusable element, so there
  is no dead tab stop and no keyboard trap. Exported from `@godxjp/ui/charts`;
  `CompactBarTrendProp`/`CompactBarTrendProps` registered in the prop registry; i18n keys
  `chart.summaryTrend` and `chart.trendCurrent` (en/vi/ja).
- **`--chart-trend-*` component tokens (#218)** — new tier file `src/tokens/components/chart.css`.
  Every dimension and every fill of `CompactBarTrend` is a public knob so a service theme matches
  its own design grid without page-local CSS (rule #45):
  `--chart-trend-plot-height{,-xs,-sm,-md,-lg}` (3.5 / 5 / 7.5 / 10rem),
  `--chart-trend-bar-{gap,radius,max-width,min-height}`, `--chart-trend-bar-background` +
  `--chart-trend-bar-background-alpha` (role mirror, default `hsl(var(--muted-foreground) / .75)` —
  clears the 3:1 non-text contrast floor), `--chart-trend-bar-emphasis-background` (default
  `hsl(var(--primary))`), `--chart-trend-baseline-border` (QUIET by default per rule #44 — a service
  opts INTO a baseline rule) and `--chart-trend-{tick-gap,tick-font-size,footer-gap}`. The
  colour/border knobs are declared `initial` with the role default at the call site, so a scoped
  `[data-tenant]` / `.dark` override of the role reaches them.
- **`@godxjp/ui/email` — email-safe design-token contract for transactional templates (#227).** A
  new framework-neutral, React-free, dependency-free subpath export that gives Blade/Twig/MJML
  templates the values HTML email actually needs: literal `#rrggbb` and `px`. Exports
  `EMAIL_COLORS` / `EMAIL_COLORS_DARK` (surface · background · foreground · muted · mutedForeground
  · border · primary · primaryForeground · focus · brand · brandForeground), `EMAIL_SHELL` (the
  480px card geometry, its content column, insets, radius and the 480×407 canonical-invitation
  reference height), `EMAIL_TYPOGRAPHY`, `EMAIL_CTA`, `EMAIL_FOOTER`, `EMAIL_FOCUS`,
  `EMAIL_MOBILE`, the aggregate `EMAIL_TOKENS` / `EMAIL_TOKENS_JSON`, plus the helpers `hslToHex()`
  and `emailInlineStyle()` (which refuses `var()`/`calc()` — neither survives an email client).
- **Canonical GoDX brand mark as email-safe markup (#227).** `EMAIL_BRAND_MARK` and
  `emailBrandMarkSvg()` / `emailBrandMarkDataUri()` / `emailBrandMarkTableHtml()` render the emerald
  capsule PLUS its internal glyph — the same artwork `<Logo mark="godx" />` paints, at the same
  32×32 viewBox and with byte-identical path data (locked by a test). Three deliveries, none with an
  external or relative asset dependency: inline `<svg>`, a `data:` URL for `<img src>`, and a
  bulletproof `<table>` fallback. The pill-only mark is now a test failure. Ships with `--email-*`
  component tokens (`src/tokens/components/email.css`) for the 480px shell geometry, the email type
  ramp, the primary-CTA dimensions/radius/typography, the legal-footer typography and link spacing,
  the focus width and the mobile padding/reflow values — all literal px (email clients resolve
  neither `var()` nor `rem`), each naming the web token it mirrors — plus `pnpm gen:email-tokens` /
  `pnpm check:email-token-sync` (`scripts/gen-email-tokens.mjs`), which generate
  `src/email/tokens.generated.ts` from `src/tokens/foundation.css` and
  `src/tokens/components/email.css` and fail if it goes stale. The HSL→hex conversion runs at module
  load, so there is no hex literal anywhere in `src/email/` and the email palette cannot drift from
  the web palette. Docs page `docs/foundation/email-tokens.tsx`
  (`/isolate/foundation-email-tokens`) renders the real specimen document in an iframe at 480px and
  at a narrow mobile width; MCP gains four `--email-*` token entries and a `transactional-email`
  pattern (aliases `email-template`, `email-tokens`, `blade-email`, `html-email`).
- **`Sidebar linkComponent` — the framework-router row contract (#213).** Pass only the link ELEMENT
  TYPE; the library keeps composing every row (16px icon slot · label · badge ·
  `data-active`/`aria-current` · the icon-only collapsed rail and its tooltip name) and hands it to
  the link as `SidebarLinkProp.children`. It threads through all four row shapes — top-level leaves,
  submenu children, collapsed-rail leaves and the collapsed flyout's `menuitem` entries. A group
  TRIGGER stays a `<button>` (WAI-ARIA APG disclosure: it owns `aria-expanded`), but its row
  composition is now library-owned too, so a group with a `badge` finally renders one. Rows without
  an `href` keep the `<button>` + `onSelect(id)` shape. Companions:
  **`createSidebarLink(Link, hrefProp?)`** (`@godxjp/ui/layout`), a dependency-free adapter for any
  router link (`createSidebarLink(Link, "to")` for React Router / TanStack Router,
  `createSidebarLink(Link)` for Next.js) that falls back to an inert
  `<a role="link" aria-disabled="true">` for a row with no destination — the explicit `role` is
  required because an `<a>` without `href` has no implicit role, which would make the collapsed
  rail's `aria-label` a prohibited attribute and leave the row unnamed; **`inertiaSidebarLink(Link)`**
  (`@godxjp/ui/inertia`), the same adapter pre-bound to Inertia's `<Link href>` with still zero
  dependency on `@inertiajs/react` (duck-typed `InertiaLinkLike`); and **`SidebarItem asChild`**, a
  Radix-style element swap for hand-composed rows
  (`<SidebarItem item={item} asChild><Link to="/x" /></SidebarItem>` — write NO children, the
  library injects the composed icon, label and badge). New public types `SidebarLinkProp` /
  `SidebarLinkComponentProp`, registered in `src/props/registry.ts`.
- **`Sidebar` nav icon and label foregrounds are separately themeable (#228)** — the rail used to
  paint one `hsl(var(--muted-foreground))` on `.sb-nav-item`, so the Lucide SVG and the label shared
  the same low-contrast colour and a service could only match the canonical shell's darker 16px nav
  icons with page-local CSS or by re-tinting every muted text globally. New component tokens in
  `src/tokens/components/sidebar.css`, all declared `initial` with the role default at the call
  site: `--sidebar-nav-item-foreground`, `--sidebar-nav-item-hover-foreground` and
  `--sidebar-nav-item-disabled-foreground` for the row/label (top-level **and** sub rows), and
  `--sidebar-nav-icon-foreground` plus `--sidebar-nav-icon-hover-foreground` /
  `--sidebar-nav-icon-active-foreground` / `--sidebar-nav-icon-disabled-foreground` for `.sb-icon`
  (expanded rows, group triggers and the collapsed rail). Every default is byte-identical to the
  previous rendering (icons fall back to `currentColor` = the row colour; each state falls back to
  the base icon knob), so setting `--sidebar-nav-icon-foreground: hsl(var(--foreground))` alone is
  enough to get canonical icons beside muted labels. Colour only — icon size stays
  `--sidebar-nav-icon-size` (16px) and row geometry stays `--sidebar-nav-item-height` (32px) /
  `--sidebar-nav-item-gap` (10px) / `--sidebar-nav-item-padding-x`; the active row keeps
  `--sidebar-item-active-background` / `--sidebar-item-active-foreground`.
- **`Sheet` — responsive drawer / detail-panel contract (#215).** `SheetContent` gains
  `responsive?: "auto" | "side" | "bottom"`. `"auto"` renders the desktop side panel above
  `--sheet-responsive-breakpoint-width` and the mobile bottom sheet at/below it, so ONE `<Sheet>`
  serves both viewports with no page-local `useMediaQuery`; the resolved presentation is published
  as `data-side` (and the requested mode as `data-responsive`) on the panel. Focus trap, Escape and
  focus restoration are unchanged — it is the same Radix Dialog in both presentations. New
  **`useSheetResponsiveMode(responsive?)`** (`@godxjp/ui/feedback`) exposes the same decision to a
  composite that must swap a desktop surface for a mobile sheet, returning `"side" | "bottom"` off
  the one themeable breakpoint. New tokens **`--sheet-responsive-breakpoint-width`** (default
  `48rem` / 768px — the library's canonical mobile line, matching `useIsMobile`; read off `:root` at
  runtime because a CSS `@media` cannot resolve a custom property, accepting `px`/`rem`/`em`) and
  **`--sheet-bottom-max-height`** (default `85dvh`, capping the responsive BOTTOM presentation only
  — a plain `side="bottom"` sheet keeps its content-sized height), in the new tier file
  `src/tokens/components/sheet.css`. New public types `SheetResponsiveProp` and `SheetPresentation`.
- **`OrgSwitcherOrganization.badge` + `.badgeLabel` (#213)** — a status/plan slot rendered
  end-aligned in the expanded trigger and in each menu row, hidden in the collapsed rail. Because
  the trigger's accessible name comes from `labels.trigger`, a supplied `badgeLabel` is announced as
  an `aria-describedby` description and the badge node itself is marked presentational (WCAG 1.1.1 /
  1.4.1); `badgeLabel` is also a search keyword in the menu. Exposed as
  `[data-slot="org-switcher-badge"]` for theming.
- **AppShell rail-width, top-bar and mobile-nav knobs (#213, #211).** The docked rail and the
  icon-only collapsed rail were hard-coded `grid-template-columns` literals, so a service designing
  on a different grid (the recurring 255px request) had to fork `.app-root`; they are now
  `--app-shell-sidebar-width` (default `16rem`) and `--app-shell-rail-width` (default `4rem`). The
  bar's inline padding and slot gap were raw `--space-*` values and are now `--app-shell-bar-inset`
  (`var(--space-4)`), `--app-shell-bar-inset-compact` (`var(--space-3)`, applied below the 900px
  breakpoint) and `--app-shell-bar-gap` (`var(--space-3)`). `--app-shell-mobile-nav-inset` (default
  `var(--space-1)`) owns the inline inset of the mobile drawer's scrollable nav body — a service
  rendering a custom `mobileNav` node that wants the full sheet chrome inset sets
  `--app-shell-mobile-nav-inset: var(--space-6)` once in its theme instead of patching
  `[data-slot="sheet-body"]:has(.sb-root)` in app CSS. Rendering is unchanged.
- **Standalone `<Topbar>` box knobs (#213)** — `--topbar-height` (`auto`), `--topbar-inset` (`0px`)
  and `--topbar-gap` (`var(--space-2)`). The defaults are the quiet ones, so rendering is
  byte-identical to before they existed (inside AppShell the `.app-topbar` grid row still owns the
  height and inset). A service that mounts `Topbar` directly on a page now sizes it from the theme
  instead of an app-local class. `--topbar-gap` is both the gap BETWEEN the start/center/end
  clusters and the gap INSIDE each, so one knob re-rhythms the whole bar; the #226 shrink contract
  (`start` clips, `center` yields first, `end` stays anchored inline-end) is untouched.
- **Per-overlay scrim share knobs (#215)** — `--dialog-overlay-alpha` (60%),
  `--sheet-overlay-alpha` (40%) and `--app-shell-mobile-nav-alpha` (40%): the share of the shared
  `--overlay-background` each surface's backdrop uses, so a slide-in drawer keeps washing the page
  more lightly than a modal dialog while a single token retints them all.
- **AuthShell `preset` — a named flow MEASURE (#217, #220).** `"default" | "device-authorization" |
"context-selection"` (default `"default"`) owns the auth card's max-width plus the desktop and
  mobile page gutters through component tokens, so a consumer never overrides
  `--auth-shell-card-max-width` (or forks an `.auth-shell--wide` class) to hit a canonical artboard.
  `"device-authorization"` is a 380px card at 1440/1024 with a 5px inline page gutter at 390 (card
  x=5px, width=380px) (#220); `"context-selection"` is a 25rem card on desktop/tablet, edge-to-edge
  on mobile, plus a tokenized rhythm between the intro, the choice card and the trailing "remember"
  row (#217). It is orthogonal to `variant` — presets are applied AFTER it, so
  `variant="canonical" preset="device-authorization"` keeps the canonical control density and
  heading size and only re-measures the page. Adds the public vocabulary type
  **`AuthShellPresetProp`** (exported from `@godxjp/ui/layout`, registered in
  `src/props/registry.ts` and the MCP prop-vocabulary catalog), the preset tokens
  `--auth-shell-device-{card-max-width,main-padding,main-padding-mobile}` and
  `--auth-shell-context-{card-max-width,main-padding,main-padding-mobile,card-stack-gap}`, and two
  column knobs per rule #45: `--auth-shell-main-align` (block alignment of the auth column, default
  `center`) and `--auth-shell-card-stack-gap` (gap between the card slot's direct sections, default
  `0px` — quiet by default per rule #44; presets opt in). Evidence frames
  `docs/layout/auth-shell-device.tsx` and `docs/layout/auth-shell-context.tsx` (the latter including
  the `Card` + `CardContent flush` + `ListRow as="li"` organisation-choice composition) cover
  1440×900 · 1024×900 · 390×844.
- **`AppSettingPicker compact` (#217)** — boolean, default `false`. Re-tiers the trigger box to the
  official `--control-height-sm` tier and drops the picker's owned per-kind width, so a LABELLED
  trigger hugs its value. This is the supported auth/legal-footer locale switch
  (`<AppSettingPicker kind="locale" appearance="labeled" compact />`) for when the square icon-only
  default reads as a stray button and the full labelled trigger is too tall; no effect on
  `appearance="inline"` (already chrome-less). Adds
  `--app-setting-picker-compact-{control-height,padding-x,gap,font-size}`.
- **`Logo wordmark` — the mark + wordmark LOCKUP in one element (#214).** Replaces the hand-rolled
  `<span className="inline-flex items-center gap-2"><Logo/><Text/></span>` that every shell header
  and auth brand bar was repeating (rules #45/#46). The lockup root takes `ref` / `className` /
  `...props`; the mark becomes decorative and the wordmark text carries the accessible name, so the
  pair is announced once (`label` overrides the lockup name when needed). Omitting `wordmark`
  renders exactly the previous bare-mark markup — byte-identical, fully backward compatible. The
  package still ships **no wordmark ARTWORK**: the wordmark is typeset in the design-system display
  face, and a real logotype drops in later as an inline `<svg>` passed to `wordmark` with no API
  change. New tokens
  `--logo-wordmark-{gap,font-size-xs,font-size-sm,font-size-md,font-size-lg,font-weight,letter-spacing,font-family,color}`;
  `--logo-wordmark-font-family` defaults at the call site to `--font-family-display` and
  `--logo-wordmark-color` to `hsl(var(--foreground))`, or to the `--success` identity role on the
  `mark="godx"` / `tone="success"` lockup — **never `--primary`**, so an action-colour re-theme can
  never recolour the brand and a consumer needs zero page CSS for logo colour.
- **`brand="dxs"` — THE canonical DXS preset (#214).** A new `AppBrand` / `APP_BRANDS` value
  (`<AppProvider brand="dxs">` → `<html data-brand="dxs">`) that, unlike the per-vertical brand
  tints, binds both the palette AND the canonical hosted-identity SURFACE contract, so every surface
  matches the canonical artboards with no page CSS:
  `--auth-shell-{control-height,heading-size,card-max-width,main-padding}` are re-pointed at the
  `--auth-shell-canonical-*` measures (36px controls, 22.5rem card, 16px page inset, 15px below
  30rem). It invents no colour and no geometry — the palette is the shipped GodX Navy ramp
  (identical to `data-brand="brand"`) and every auth value is a `var()` reference to tokens already
  declared in `tokens/components/shell.css`. Ships alongside **`src/theme/dxs.canonical.css`** for
  stylesheet-only apps with no provider (`@import "@godxjp/ui/theme/dxs.canonical.css";` instead of
  `@godxjp/ui/styles`), which mirrors the `data-brand="dxs"` block at `:root` and is pinned against
  drift by `src/tokens/__tests__/dxs-canonical-theme.test.ts`. The `src/theme/` CSS tree was already
  copied into `dist/` by `copy-styles.mjs` but had no entry in the export map, so no consumer could
  import it — a **`"./theme/*": "./dist/theme/*"`** package export is now declared.
- **`AuthFooterProp` / `AuthIdentityProp` are registered public types (#214)** — both moved out of
  local `interface`s in the component files into the prop registry
  (`src/props/components/layout.prop.ts` + `src/props/registry.ts`) and are exported from
  `@godxjp/ui/layout` and `@godxjp/ui/props/components` (the `*Props` aliases are kept for
  back-compat). Both now accept **`className`**.
- **`DataTable` `error` / `denied` / `onRetry` (#216)** — the two lifecycle states the list-page
  contract was missing. `error={isError}` renders a built-in localized destructive `EmptyState`
  inside the table grid announced with `role="alert"` (plus a Retry button when `onRetry` is given);
  `denied={status === 403}` renders a localized warning state announced politely with **no** retry,
  because repeating a 403 cannot succeed. Either prop also accepts a node that replaces the built-in
  copy. Precedence is `loading` > `denied` > `error` > `empty` > rows, so exactly one state shows
  and a page never needs its own alert/forbidden block around the table.
- **FilterBar / Toolbar `overflow="wrap" | "scroll"` (#216)** — the responsive overflow strategy.
  `wrap` (default, unchanged) stacks below 640px then wraps onto extra rows; `scroll` keeps one
  bounded row at ≥640px that scrolls inline with the clear-all action sticky at the inline end, so a
  filter-heavy list page with long JA/EN/VI labels never grows a three-row strip that pushes the
  table below the fold. Below 640px `scroll` still stacks — a 390px viewport never hides a filter
  behind an invisible horizontal scroll. New token `--filter-bar-scroll-padding-y`
  (`src/tokens/components/navigation.css`, default `var(--space-1)`) reserves the scrollbar gutter
  so the inline scrollbar never overlaps the controls (rule #45; set `0` on overlay-scrollbar
  platforms), and the new `FilterBarOverflowProp` vocabulary type is registered.
- **FilterBarGroup / ToolbarGroup `controlId` (#216)** — when the group wraps a single control, its
  visible caption is rendered as that control's real `<label htmlFor>`, so the filter is named by
  the text the user can see (WCAG 2.5.3 label-in-name / 1.3.1). Without it the caption named only
  the group wrapper and a bare `Select` under it was nameless to a screen reader (axe
  `select-name`).
- **Canonical settings-section composition (#216)** — `docs/showcase/settings-account-sections.tsx`
  (identity · preference rows · billing handoff · danger zone), registered in the preview showcase
  gallery and built entirely from existing primitives with **zero new components**, plus the MCP
  pattern `settings-section-rows` (aliases `settings-section`, `settings-row`, `danger-zone`,
  `billing-handoff`, `preferences-rows`, `account-identity`). Gate 0 verdict: COMPOSITION PATTERN
  (fails C2/C3/C4/C7) — a danger zone is `Card accent="destructive"` + `ListRow` +
  `AlertDialog challenge`, needing no new component and no new token.
- **#216 browser verification at 1440 / 1024 / 390, and the demos it was missing.** The acceptance
  matrix was driven in headless Chromium against the built preview, and three gaps it exposed are
  now closed. `docs/data-display/badge.tsx` gains a **Billing lifecycle** card rendering
  `trialing` / `past_due` / `incomplete` / `canceled` (filled + outline) — the keys whose missing
  translations shipped as raw `status.*` text were previously demoed by nothing, so the regression
  was invisible in the preview. `docs/data-display/data-table/index.tsx` gains the
  `error` **without** `onRetry` case, so "Retry appears only when the consumer supplies it" is a
  visible state and not just a prop note. `docs/showcase/settings-account-sections.tsx` label-language
  Select now also drives the app locale (`useAppLocale().setLocale`), so the library's own `t()`
  chrome — the canonical `StatusBadge` above all — follows the page instead of leaving an English
  page wearing a Vietnamese status pill. New tests codify the measured behaviour so the next run
  needs no browser: `badge-status-billing.test.tsx` (localized label + canonical tone for all four
  billing keys in en/ja/vi, and a raw-`status.`-prefix guard), a `role="alert"`-is-an-inner-wrapper
  assertion in `data-table-states.test.tsx`, and `filter-bar-overflow-geometry.test.ts` pinning the
  CSS rules behind the scroll strip (nowrap + `overflow-x: auto` + non-shrinking groups + the
  sticky inline-end clear-all, all gated at `min-width: 640px`).
- **`ServiceLauncherCard` unavailable-state token hooks (#219)** — supplying `disabledReason` now
  marks the tile `data-unavailable`, and the medallion reads two new role-mirror knobs,
  `--card-service-launcher-unavailable-icon-background` and
  `--card-service-launcher-unavailable-icon-foreground` (both declared `initial`, defaulting at the
  call site to `--muted` / `--muted-foreground`). A service that must not launch no longer renders a
  brand-live medallion, and a consumer never needs page-local CSS to dim one. `disabledReason`
  remains purely descriptive — it never disables the action, which stays the consumer's `Button`
  prop, so the component still infers no access state. Backed by
  `service-launcher-card-responsive.test.tsx`, which pins the canonical 3 → 2 → 1 ladder to
  `ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}` and its 40/48/64rem container breakpoints (so
  the package, not the page, owns the grid tracks), the overflow contract for long JA/EN/VI titles
  and unbreakable hostname runs, the dashed catalog-CTA surface, the 36px medallion's
  `--control-height-lg` derivation, the role-mirror `initial` rule and tab order across a disabled
  tile — plus `service-launcher-card.types.test.ts`, which pins the public export surface and
  asserts the props carry no `href`/`entitlement`/`available`-style access field.
- **Error surface (403 / 404 / 500 / 503) as a composition pattern (#221)** — the requested
  `ErrorSurface` component FAILS the Framework-Component Test (C2/C3/C4), so `@godxjp/ui` ships the
  missing geometry plus the canonical recipe instead of a page-shaped component: see
  `docs/layout/error-surface/` (overview + `index.md` contract + four real screens —
  `examples/application-403`, `application-404`, `system-500`, `system-503`) and the MCP
  `error-pages` pattern (aliases `error-surface`, `403`, `404`, `500`, `503`, `exception-page`,
  incl. the Inertia/SSR exception pages), which the `CenteredShell` and `EmptyState` catalog entries
  now point at. The missing geometry is **`CenteredShell` `align`** (`"start" | "center"`, default
  `"start"`): `align="center"` centres the content column in the `100dvh` shell, giving a
  SYSTEM-level standalone surface (500 / 503 error page, maintenance notice) package-owned
  viewport-centred geometry at 1440 / 1024 / 390 with no consumer `min-h-dvh`, flex CSS, media query
  or `className`, while overflowing content still scrolls from the top so a long localized message
  is never clipped. New tokens `--centered-shell-column-offset-block` (default `0`; `align="center"`
  flips it to `auto` — quiet default per rule #44, so the top-aligned flowing page shape is
  unchanged for every existing consumer) and `--empty-state-description-max-width` (default `28rem`,
  previously hard-coded, so a service or locale retunes the JA/EN/VI copy measure without forking
  `.ui-empty-state-description`), plus the `CenteredShellAlignProp` vocabulary type exported from
  `@godxjp/ui/layout` and `@godxjp/ui/props`. Tests:
  `src/components/layout/__tests__/error-surface-pattern.test.tsx` (shell preservation,
  exactly-one-action, request-ID + `Intl` maintenance window in en/ja/vi, heading order, focus) and
  `error-surface-pattern.a11y.test.tsx` (0 axe violations for all four statuses in both shells).
- **`MasterDetail` `collapseBelow` / `detailId` and a tokenized stacking threshold (#223)** —
  `collapseBelow` (`"sm" | "md" | "lg" | "xl" | false`) is the per-instance stacking threshold,
  reusing the shared `BreakpointProp` vocabulary (`sm` 40rem · `md` 48rem · `lg` 64rem · `xl` 80rem;
  `false` never stacks); omit it to inherit the theme token
  **`--master-detail-collapse-below`** (default `40rem`), measured against the composition's own
  inline size, so a service theme retunes the breakpoint once globally instead of forking the layout
  CSS (rule #45). `detailId` names the detail region so master controls can point at it with
  `aria-controls` and the app can move focus to the new detail after a selection. The MCP catalog
  now documents `--master-detail-rail-{compact,standard}`, `--master-detail-gap` and
  `--master-detail-collapse-below` (all previously missing) plus `rail` / `collapseBelow` /
  `detailId` and the measured 1440 / 1024 / 390 geometry.
- **`ListRow` `overflow` and `unread` (#224, #225).** `overflow` (`"truncate" | "wrap"`, default
  `"truncate"`) is semantic control over how a title/description longer than the row resolves;
  `wrap` renders multi-line text and applies `overflow-wrap: anywhere`, so an unbroken JA/EN/VI
  token can no longer widen the row (#224). `unread` (boolean, optional) is semantic read/unread
  state for notification rows, rendering a compact indicator dot in its own gutter with localized
  `sr-only` text ("Unread"/"Read", never colour alone — WCAG 1.4.1) plus the tokenized unread
  surface; omit the prop entirely for rows with no read state, and pass `false` for a read row so
  its title keeps the same optical axis (#225). New i18n keys `dataDisplay.listRow.unread` /
  `dataDisplay.listRow.read` in en/ja/vi, and new component tokens in
  `src/tokens/components/list-row.css`:
  `--list-row-body-min-width` (default `12rem` — the inline size the content column keeps before the
  trailing actions wrap to their own line, clamped `min(…, 100%)` at the call site so a narrow
  container is never widened by the knob), `--list-row-trailing-gap` (default `var(--space-2)`),
  `--list-row-read-background` (`initial`; documented default `transparent`),
  `--list-row-unread-background` (`initial`; documented default `hsl(var(--muted))` — `--muted`
  rather than `--accent` keeps the xs muted description line at WCAG AA on the emphasized surface,
  4.63:1 light / 5.47:1 dark vs 4.23:1 for `--accent`), `--list-row-indicator-color` (`initial`;
  documented default `hsl(var(--primary))`) and `--list-row-indicator-size` (default
  `var(--space-2)`). The three colour knobs are role mirrors: `initial` at `:root`, role default at
  the call site.
- **Preview contract ledger + CI gate (#163).** `preview/frame-coverage.ledger.json` now links every
  public export and compound subcomponent (273) to its `/frame` route and declares 14 contract
  dimensions per export — variants · tones · sizes · shapes · density · controlled/uncontrolled
  ownership · disabled/read-only/loading/empty/error/success · async retry/cancel/offline ·
  responsive · RTL · long/localized content · keyboard/focus · accessible name/description/error ·
  reduced motion/forced colors/200% zoom/coarse touch. Every cell is exactly one of `covered` (an
  executed case proves it), `untested` (**not a pass**) or `not-applicable` with a written reason;
  the schema is `frame-coverage.ledger.schema.json`. `pnpm gen:frame-coverage-ledger`
  (`scripts/gen-frame-coverage-ledger.mjs`) generates the ledger from the real public surface —
  component barrels, `component-api-manifest.json` and `component-case-evidence.json` — never a
  hand-list, with `--reset-baseline` re-minting the ratchet floor.
  `pnpm check:frame-coverage-ledger` (`scripts/check-frame-coverage-ledger.mjs`, wired into
  `check:frame-contracts`) fails for a public export with no frame, an unclassified dimension, a
  hand-written verdict no evidence supports, a deleted or unwired frame-runtime gate, and a growing
  geometry-overflow or axe baseline; strictness is **ratchet-based**, so the pre-existing UNTESTED
  backlog is recorded as a baseline and only regression fails the build.
  `mcp/src/data/frame-coverage.generated.ts` and the `get_frame_coverage` MCP tool expose it, and
  every `get_component` response now ends with a coverage block naming the UNTESTED dimensions, so a
  consuming agent can never mistake a happy-path example for a support claim.
  `docs/FRAME-COVERAGE-LEDGER.md` documents the ledger, the two promotion routes and the ratchet.
  The honest state at authoring time is 273 exports × 14 dimensions = 3822 cells: 6 covered · 2141
  UNTESTED · 1675 reasoned N/A (0.2%) — authoring the frame cases remains an epic; this change only
  makes the true state visible and non-regressible.
- **Screen-reader evidence infrastructure (#171)** — evidence record schema v3 for real
  VoiceOver/NVDA runs. `screen-reader-evidence.json` now encodes the seven owner cohorts named in
  #171 (`landmarks-page-structure`, `native-form-controls`, `selection-composites`, `overlays`,
  `navigation-composites`, `data-structures`, `live-async-feedback`), mapping 87 owners to exactly
  one cohort each, plus the per-cohort `requiredPhases` an announcement transcript must cover. A
  **reviewed not-applicable registry** (`policy.notApplicable`) records the attributed, reasoned
  waiver (`reason` ≥ 40 chars, `reviewedBy`, `reviewedIn`, `reviewedAt`) required before a
  static/decorative export may leave `screenReader: untested` as `not-applicable`.
  `audit-evidence/screen-reader/` is the drop directory for human-recorded AT speech artifacts, and
  `src/screen-reader-evidence.test.ts` pins the gate with 16 tests — including that the committed
  ledger still reports `screenReader.pass === 0`. No export was promoted: producing the transcripts
  requires a person driving VoiceOver on macOS and NVDA on Windows in `ja-JP` and `vi-VN`, and
  nothing here fabricates or infers one.
- **Font-bundle cascade regression test (#210)** — `src/styles/__tests__/font-bundle-cascade.test.ts`
  flattens the real `@import` graph in source order and asserts the **winning** `:root`
  `--font-sans-base` / `--font-sans-vi` declaration is the bundled M PLUS 2 stack (plus: `fonts.css`
  is imported after `base.css`, both declarations stay unlayered, the `@fontsource` imports match
  the documented faces, and `dist/styles/index.css` keeps the same order when a build is present).
- **`pnpm check:release-plan` — no-network release-transition guard (#230).**
  `scripts/check-release-command-plan.mjs` plans the next patch/minor/major release, asserts no
  publish precedes any gate, and packs the **post-bump** manifests to prove both artifacts carry the
  target version and compatibility fields. Wired into `.github/workflows/release-integrity.yml`,
  whose existing packed-artifact check only ever saw the pre-bump manifests. `node
scripts/release.mjs --metadata-plan` now also prints the ordered `commands` array alongside the
  packed metadata.

### Changed

- `Pagination` is now ONE horizontal row on desktop and never wraps — `.ui-pagination` drops
  `flex-wrap: wrap`; the page-number strip scrolls horizontally on overflow and the total label
  truncates. Use `simple` for the intentional compact mobile form (#153).
- `ResponsiveGrid` and `SplitPane` now OWN their query container (`container-type: inline-size`) and
  use container queries, so they respond to the width available to the component instead of the
  viewport or an undeclared ancestor `container-type`. `SplitPane`'s split threshold moved from a
  `1080px` viewport media query to a `48rem` container query; `ResponsiveGrid` thresholds are
  `40rem / 48rem / 64rem` container widths (#165).
- `Sidebar` group expansion is route-synchronized: a group opens whenever `activeId` moves to one of
  its children, revealing the newly-active child after navigation (was a mount-only `defaultOpen`)
  (#165).
- `AppSettingPicker` `appearance="labeled"` no longer forces `w-full` below `640px` — it hugs its
  content (`w-auto max-w-full`) on narrow screens and takes its per-kind fixed width from `sm` up, so
  it fits a topbar. Pass `className="w-full"` for a full-width form field (#165).
- **BEHAVIOUR CHANGE — `MasterDetail` now ships the canonical fluid-list + fixed-detail-rail
  composition (#223).** The first cut inverted the tracks: it pinned the MASTER to 300/320px and let
  the detail run fluid, which cannot express the 1fr/320px composition the Teams screen (SCR-110)
  asks for. A new controlled-vocabulary prop **`rail` (`"master" | "detail"`, default `"detail"`)**
  picks which region keeps the fixed track, so the DEFAULT track order is inverted relative to the
  previous behaviour; `rail="master"` restores the leading navigator rail. `master` stays first in
  DOM order either way, so the stacked (mobile) order is always list-then-detail. Changing the
  default is safe: `MasterDetail` has never been published (the `18.4.0` tarball predates it, see
  #229).
- **`MasterDetail`'s collapse breakpoint is a real token instead of a hard-coded `40rem` (#223).** A
  media/container query CONDITION cannot read a `var()`, so the responsive decision moved off
  `@container master-detail (min-width: 40rem)` and onto a flex-basis threshold
  (`calc((var(--master-detail-collapse-below) - 100%) * 999)`), where a `var()` DOES resolve. The
  semantics are unchanged — the threshold is measured against the composition's OWN inline size,
  never the viewport — but rule #45 now holds: a theme retunes it once globally and `collapseBelow`
  overrides it per instance. The component no longer wraps itself in a `container-type: inline-size`
  scope element, and the block is physical-property free (RTL flips with the writing direction).
  `MasterDetail` also wires the selection semantics it can honestly own: selection and keyboard
  behaviour stay with the caller's controls (only the caller knows whether the master is a listbox,
  a tablist or toggle buttons), but the detail region now takes `detailId` and carries
  `tabIndex={-1}`.
- **BEHAVIOUR CHANGE — `OrgSwitcher responsive="auto"` now flips popover → bottom Sheet at
  `--sheet-responsive-breakpoint-width` (768px default) instead of a hard-coded
  `(max-width: 390px)` (#215, #213).** Behaviour is unchanged at the acceptance viewports (1440/1024
  = popover, 390 = sheet), but between 391px and 768px the switcher now prefers the focus-trapped
  bottom sheet over a 16rem popover. The threshold is themeable for the first time;
  `--org-switcher-sheet-max-height` remains authoritative for that surface. `SheetContent` itself
  defaults to `responsive="side"`, so existing usage — including the AppShell mobile nav drawer,
  which must stay a leading-edge drawer at 390px — is byte-for-byte unaffected.
- **`Sidebar.renderItem` is deprecated in favour of `linkComponent` / `asChild` (#213).**
  `renderItem` handed the consumer a className plus active state and left the row CONTENT to them,
  so a `<Link>{item.label}</Link>` legitimately dropped every icon and badge — the reported
  production regression. It is still fully supported and still takes precedence over
  `linkComponent`, so upgrading is never a surprise. `SidebarRenderItemProp` now carries
  **`children`** (the library-composed row content), so an existing consumer that spreads `rowProps`
  onto its element gets the canonical row (icon + label + badge) back with no code change. The
  internal class names `sb-icon` / `sb-label` / `sb-badge` are NOT a public contract and no longer
  appear in any library doc or test as consumer-authored markup. Collapsed-flyout entries now render
  through the shared row composition too, so a submenu child's `badge` appears in the flyout and
  disabled children expose `aria-disabled`.
- **`ServiceLauncherCard` renders `disabledReason` above the action, as prose (#219).** The reason
  previously sat AFTER the launch button and inherited the mono metadata treatment. A disabled
  control announces nothing about _why_, so the explanation must precede it in DOM order (WCAG 2.2 ·
  1.3.2), and a localized JA/VI sentence must not be set in monospace. `metadata` (hostname · plan)
  remains the only mono line, driven by `--card-service-launcher-metadata-*`; the reason now uses
  the description prose knobs. The MCP catalog is corrected alongside it: every
  `--card-service-launcher-*` token was being documented with StatCard's medallion comment (the
  generator attributes the nearest preceding CSS comment), so the block is now commented per knob,
  and the entry documents that `ResponsiveGrid` owns the 3 → 2 → 1 layout, that `metadata` is
  machine identifiers only, and that the component exposes no entitlement/URL prop.
- **`Topbar` slots clip with `overflow: clip`, not `hidden` (#226).** `.ui-topbar-start` /
  `.ui-topbar-center` / `.ui-topbar-end` each clip their own overflow, so an over-long label is cut
  inside its cluster instead of spilling over a sibling. `clip` is deliberate: an `overflow: hidden`
  box is still a scroll container, so focusing a clipped control would scroll the slot and shove its
  leading content out of view. `overflow-clip-margin: var(--focus-ring-width)` keeps the focus ring
  of an edge control paintable (WCAG 2.4.11 / 2.4.13) — no new token, it reads the existing knob.
- **`ChartFrame` (the internal chart chrome) gained `size`, `footer` and an optional `height`
  (#218).** `height` is now optional so a CSS-drawn chart can size its plot from a token tier
  (`size` → `data-size` → `--*-plot-height`) instead of an inline pixel box, and `footer` renders
  below the plot but OUTSIDE the `role="img"` canvas so interactive footer content stays reachable.
  A `ref` is forwarded to the `<figure>`. The recharts-backed `LineChart` / `BarChart` / `AreaChart`
  / `PieChart` still pass a measured `height` and are unchanged.
- **`AuthFooter` keys its items by slot name instead of the array index (#214)** — toggling the
  optional `locale` slot no longer re-keys the following items and remounts the consumer's real link
  or locale control. Each item also carries
  `data-slot="auth-legal-footer-{product|terms|privacy|locale}"`.
- **Role-mirror fix for the identity mark (#214)** — `--logo-success-background`,
  `--logo-success-foreground` and `--logo-godx-color` are now declared `initial` at `:root` with the
  role default at the CALL SITE (`hsl(var(--logo-godx-color, var(--success)))`), per docs/TOKENS.md
  · "Role-mirror knobs MUST be `initial`". Same rendered default; a scoped `.dark` / `[data-tenant]`
  override of `--success` now actually reaches the identity mark instead of freezing at the `:root`
  value.
- `AuthShell`'s `main` now reads `justify-content: var(--auth-shell-main-align)` instead of a
  literal `center` (same rendered default), and `scripts/check-token-tiers.mjs` accepts `align` as a
  component-token property suffix and registers the `app-setting-picker` prefix under the
  `navigation` token file (#217, #220).
- **MCP catalog accuracy across the shell surfaces (#214, #217, #220).** `AuthShell` now documents
  `variant`, `preset`, `density` and `className` (previously only its three slots); `Logo` documents
  `wordmark` plus the already-shipping `mark` (`"glyph" | "godx"`, the canonical GoDX identity mark)
  and `tone` — their absence from the catalog is why consumers believed the identity mark was not
  exposed; `AppSettingPicker`'s `appearance` union is corrected to include `"inline"` and its
  kind-dependent default is spelled out; `AuthFooter` and `AuthIdentity` document `className`, their
  registered public types and their token knobs; `AppProvider.brand` documents the `"dxs"` value and
  the theme-file entry point. `mcp/src/data/tokens.ts` gains the `--logo-godx-*` /
  `--logo-wordmark-*` entries and a `data-brand="dxs"` preset entry; `src/test/theme-globals.ts`
  mirrors the new `dxs` palette for the story/preview toolbar; `docs/general/logo.tsx` gains a
  "Wordmark lockup" card (GoDX lockup, sized lockup, boxed-glyph lockup, `label` override).
- `.ui-centered-shell-column` reads `--centered-shell-column-offset-block` and
  `.ui-empty-state-description` reads `--empty-state-description-max-width`; both defaults preserve
  the previous rendering byte-for-byte (#221).
- **Documented the load-bearing CSS import order (#210).** `styles/fonts` MUST come **after**
  `styles/base` on the per-layer setup (same specificity → later import wins). Stated in
  `src/styles/index.css`, `src/styles/fonts.css`, `src/styles/base.css`, `src/tokens/foundation.css`,
  `README.md` and `docs/CUSTOMER-THEMING.md`, and shown in the per-layer import examples.
- **Corrected the bundled-face docs to match the code (#210).** The token docs claimed the opt-in
  `@godxjp/ui/styles/fonts` fills `--font-sans-base` with bundled **Noto Sans JP**; it actually sets
  **M PLUS 2** as the primary face (including the Vietnamese coverage) with **Noto Sans JP** as the
  CJK fallback. Fixed in `mcp/src/data/tokens.ts` (`--font-sans-base` and
  `--font-sans-{ja,ko,vi,zh-hans,zh-hant}`), `README.md` and `docs/CUSTOMER-THEMING.md`, which also
  now note the **v16 → v18 bundle change** (v16: Noto Sans JP + Montserrat; v18: M PLUS 2 + Noto
  Sans JP) so a consumer whose spec named the v16 faces can notice.
- `scripts/check-frame-coverage.mjs` accepts `--allow-missing-frames` (the default behaviour and its
  stdout contract are unchanged, so the #171 screen-reader gate is unaffected) and now reports
  `hasFrame` / `missingFrames`; `scripts/frame-coverage.mjs` reads the v2 ledger, rolling the 14
  dimensions up to the nine FRAME-COVERAGE-STANDARD axes, so `docs/FRAME-COVERAGE-REPORT.md` shows
  reasoned N/A instead of a uniform blank (#163).
- **The screen-reader evidence gate got materially stricter (#171).**
  `scripts/check-screen-reader-evidence.mjs` now additionally rejects: a `screenReader: pass` whose
  owner is not cohort-mapped; a record without `entryCommand` or a structured `steps[]` transcript
  (`phase` + `command` + `announced`); a passing record whose phases do not cover its cohort's
  `requiredPhases` (this is what makes error/help/required/invalid mandatory for form owners and
  loading/success/error/recovery mandatory for live/async owners); an unknown journey phase; a
  ledger `not-applicable` without a reviewed waiver; an orphan or pre-approved waiver; and any
  attempt to waive an interactive cohort owner. Baseline cohorts and their phases are hard-coded so
  policy can be extended but never weakened. `screen-reader-evidence.schema.json` is bumped to
  `schemaVersion: 3` with `policy.cohorts`, `policy.notApplicable`, `records[].entryCommand`,
  `records[].steps[]` and a shared `$defs.journeyPhase` enum, and
  `docs/SCREEN-READER-EVIDENCE.md` adds the cohort registry table, the reviewed-N/A rules, the v3
  record example and a "where the human contributor puts the run" checklist.

### Fixed

- **Destructive `Button` now clears WCAG AA contrast with margin, on every surface (#199).** The dark
  default sat at **4.54:1** — right on the AA floor — and its hover/active states drifted _lighter_
  (52%→58%→64% L), cutting contrast against the light label further; downstream (`gino-cloud`) axe
  measured a destructive action at 4.12:1. Two root causes fixed:
  - **Hover/active were an alpha fill** (`hsl(var(--destructive) / 0.9)`), which composites with
    whatever surface sits behind the button — a lighter `Card`/`AlertDialog` vs the page — so the
    effective colour and its contrast drifted per context. They now read the **solid**
    `--destructive-hover` / `--destructive-active` tokens (backdrop-independent), wired once in
    `control.css` (the duplicate Tailwind `hover:bg-destructive/90` was removed from `Button`).
  - **Dark fill palette retuned**: base 52%→48% L, on-fill text lifted to pure white, states now go
    _darker_ (48%→43%→38%) — default is now **5.52:1**, hover/active higher, both themes ≥5.5:1.
    Error TEXT on dark surfaces already uses `--text-error`, so this fill change does not touch it.
  - Guarded by a deterministic token test (`destructive-contrast.test.ts`, both themes ×
    default/hover/active) and `check:contrast` now audits the destructive Button + AlertDialog
    actions in **dark** theme too (it previously only covered default-theme text — the gap that let
    this slip).
- **`DataTable` no longer nests a redundant horizontal-scroll region (narrow-width geometry).**
  `DataTable` already owns a keyboard-reachable horizontal scroller (`.ui-data-table-scroll`), but
  the inner `Table` primitive was wrapping the `<table>` in a SECOND `overflow-auto` +
  `tabIndex={0}` box — a double scroll container and a duplicate keyboard tab stop for one table. At
  narrow widths (< `sm`, where the surface keeps its `min-w-[640px]`) that inner focusable extended
  past the viewport and was flagged as a clipped control by the frame-geometry sweep. `DataTable`
  now renders `<Table scrollable={false}>`, so a single scroll region owns the overflow. Fixes the
  `query-button-refetch` and `query-data-state` geometry regressions at 320/375/390.
- **AppShell demo topbar no longer overflows a narrow (mobile) viewport.** The `docs/layout`
  AppShell example composed a topbar whose entity switcher and search control could not shrink,
  forcing horizontal page scroll at 320/375/390. The example now demonstrates the correct
  responsive composition: the entity switcher collapses to an icon-only control (label truncates
  from `sm` up), the search control collapses to an icon-only trigger below `sm`, and the
  decorative brand mark is hidden on the narrowest widths — each keeping its accessible name via
  `aria-label`. Fixes the `layout-app-shell` geometry regression at 320/375/390.
- **`Tabs` fallback selection no longer targets a disabled first item (#175).** When Tabs owns the
  initial selection — no `value`, and no `defaultValue` naming an existing ENABLED item (missing,
  unknown, or itself disabled) — it now resolves to the first item that is NOT `disabled`, instead
  of blindly picking `items[0]`. Selects nothing when every item is disabled. Covered for both the
  uncontrolled (`defaultValue`) and controlled (`value`/`onValueChange` starting unset) shapes.
- **Horizontal `TabsList` no longer clips/overflows long localized labels in a narrow container
  (#175).** The list is now width-bounded (`min-w-0 max-w-full`) and scrolls its own horizontal
  overflow (hidden scrollbar, still swipeable/keyboard-reachable) instead of forcing its container
  wider or hiding overflow content. Orientation-gated (`data-[orientation=horizontal]:…`) so the
  vertical side-rail layout is unaffected.
- **`Tabs` / `TabsList` — the active tab can no longer be scrolled out of view by a responsive
  resize (#204).** The horizontal tab strip owns its overflow scroll (#175) but used to keep (or
  shift) its internal scroll offset across a 1440 → 1024 → 390 resize or route re-render, stranding
  the ACTIVE — typically FIRST — trigger completely outside the visible strip while it still
  reported `data-state="active"` / `aria-selected="true"`. `TabsList` now observes its own size
  (`ResizeObserver`) and its triggers' `data-state` (`MutationObserver`) and re-pins the trigger
  that must stay reachable with `scrollIntoView({ block: "nearest", inline: "nearest" })`. The
  correction only runs when the target is not already fully inside the scrollport, so it never
  fights a deliberate manual/touch scroll, a click, or arrow-key roving focus; under
  `activationMode="manual"` the FOCUSED trigger wins over the selected one so keyboard users are
  never stranded. Resize corrections are instant and `prefers-reduced-motion: reduce` downgrades
  selection-change corrections to an instant jump. Works for the first and last trigger, in RTL, and
  on the vertical rail — `inline: "nearest"` plus physical-rect geometry means there is no direction
  branch. A forwarded `ref` on `TabsList` is composed (not replaced), so object and callback refs
  keep receiving the tablist node.
- **FormField a11y contract no longer silently dropped by custom controls (#164).** Every
  data-entry control now accepts and FORWARDS the injected accessible name (`aria-labelledby`),
  description (`aria-describedby`) and validation (`aria-errormessage` / `aria-invalid` /
  `aria-required`) onto its real semantic focus target instead of ignoring them:
  - Focus-target controls forward the full contract onto the input/combobox trigger — `NumberInput`,
    `SearchInput`, `ColorPicker`, `DatePicker`, `MonthPicker`, `TimePicker`, `Cascader`,
    `TreeSelect` (Select/SearchSelect already did).
  - Popup controls expose the complete APG combobox relationship: `MonthPicker` is now a
    `role="combobox"` (matching Date/TimePicker); `Cascader` / `TreeSelect` / the pickers add
    `aria-haspopup` + `aria-controls` pointing at their popup.
  - Group controls expose group-level semantics: `RadioGroup` (`role="radiogroup"`) forwards the
    full validation set; `CheckboxGroup`, `DateRangePicker` / `MonthRangePicker` (two inputs) and
    `Transfer` are `role="group"` named by the FormField label, with the error folded into
    `aria-describedby` (widget-only `aria-invalid`/`aria-errormessage` are invalid on a group per
    ARIA 1.2). `Upload` forwards the label/description onto its native `<input type="file">`.
- **BEHAVIOUR CHANGE — the all-in-one `@godxjp/ui/styles` entry now actually applies the bundled
  fonts (#210).** The entry imported `styles/fonts.css` **before** `styles/base.css` →
  `tokens/base.css` → `tokens/foundation.css`. Both declare `--font-sans-base` on `:root` unlayered
  at identical specificity (0,1,0), so foundation's font-agnostic system stack always won and the
  bundled-font opt-in was permanently dead — every all-in-one consumer downloaded ~800 KB of
  `@font-face` (74% of the dev stylesheet, 85% of the production gzip) that could never render.
  `fonts.css` is now imported **after** the token layers, so an all-in-one consumer's type will
  visibly change to the bundled M PLUS 2 face. This is the unfinished half of #130.
- **AppShell's mobile drawer no longer double-pads the Sidebar (#211).** Below `lg` the drawer's
  `SheetBody` applied the generic 24px sheet chrome inset (`--sheet-pad-x`) on top of the `Sidebar`'s
  own 8px `--sidebar-nav-scroll-padding`, so every nav row sat ~32px from the drawer edge — on a
  ~293px drawer that crams the nav into a ~228px column. AppShell now renders `mobileNav` in a Sheet
  body whose inline inset is the new `--app-shell-mobile-nav-inset` token (default `var(--space-1)`
  = 4px), so the nav owns its own inset and stays edge-to-edge. The body's full-bleed
  `-mx-[var(--sheet-pad-x)]` pull-out and its vertical scroll padding are unchanged.
- **BEHAVIOUR CHANGE — one AppShell breakpoint, and the footer survives on mobile (#213).** A
  duplicate `@media (max-width: 768px)` block restructured `.app-root` a second time, disagreeing
  with the canonical 900px rule: between 768 and 900 the sidebar was hidden while the grid still
  reserved a sidebar track. It also dropped the `"footer"` grid area and set
  `.app-footer { display: none }` — silently deleting whatever a consumer passed to `AppShell`'s
  `footer` slot on a phone — and re-declared the grid rows with a `3rem` literal that overrode
  `--app-shell-bar-height` below 768px only. The shell now restructures at exactly one breakpoint
  (900px / 56.25rem, matching `max-[900px]:inline-flex` on the drawer trigger in `app-shell.tsx`),
  and the footer row and the bar-height token hold at every width — so a consumer-supplied footer is
  now VISIBLE on mobile where it previously vanished. The remaining 768px rule is topbar chip/search
  density only and no longer touches `.app-root`.
- **`--overlay-background` actually works now (#215).** It was documented (and released in v17) as
  "the single backdrop colour shared by EVERY overlay", but nothing consumed it — Dialog, Sheet and
  the AppShell mobile drawer each carried a private literal, and `TwoFactorSetup` re-stated
  `rgb(0 0 0 / .3)` at a higher specificity, so setting the token had **zero effect anywhere**. The
  three per-overlay knobs (`--dialog-overlay-background`, `--sheet-overlay-background`,
  `--app-shell-mobile-nav-background`) are now declared `initial` at `:root` with the default
  resolved at the CALL SITE as a share of `--overlay-background`, per the role-mirror rule in
  `docs/TOKENS.md` — so a scoped `[data-tenant]` / `.dark` override reaches the portaled overlay
  instead of freezing at `:root`. Every default is byte-identical (dialog `0.3`, sheet + drawer
  `0.2` black), and setting a `*-overlay-background` knob directly still wins outright. (Reaching a
  _portaled_ overlay under a `[data-tenant]` scope still requires the tenant attribute on the portal
  container, as documented in `docs/CUSTOMER-THEMING.md`.)
- **Overlay animations honour `prefers-reduced-motion` (#215, WCAG 2.3.3 / 2.2.2).** Dialog,
  AlertDialog, CommandPalette, Sheet and Popover enter/exit animations (fade + zoom + slide) were
  ungated. They are now killed under `prefers-reduced-motion: reduce` — the overlay still appears
  and disappears instantly, so the open/closed state stays unambiguous; only the motion is removed.
  The gate is deliberately **unlayered**: Tailwind v4 emits `animate-in` / `slide-in-from-*` into
  `@layer utilities`, which beats any rule inside `@layer components` regardless of specificity, so
  a gate written in the components layer is dead code. The pre-existing AppShell mobile-drawer gate
  had exactly that bug and is fixed the same way.
- **`Sidebar`'s collapsed rail and submenu group children never received `renderItem` at all
  (#213)** — a consumer's router `<Link>` silently reverted to a `<button>` + `onSelect` there. Both
  now take the router link via `linkComponent`.
- **`Sidebar` no longer crashes on an icon-less nav item (#228).** `SidebarItem` rendered `item.icon`
  unguarded, so untyped/API-driven data without an `icon` threw
  `Element type is invalid… got: undefined` and took down the whole shell (all four row shapes: leaf
  button, `href` anchor, group trigger, collapsed rail). The icon slot is now always rendered and
  only fills in when an icon is supplied, so the row keeps its 32px height, 10px icon↔label gap and
  label column. `icon` remains **required** in `SidebarItemProp` — this is a runtime safety net, not
  an API loosening.
- **`Topbar` — explicit shrink contract, no horizontal document overflow (#226).** Intrinsic-width
  slot content (a long tenant/brand string in `start`, a fixed-width search trigger in `center`) no
  longer pushes the `end` cluster past the bar and out of the viewport, and no longer leaks a
  horizontal document scroll. `.ui-topbar` gains `max-width: 100%` so the bar never exceeds its
  `AppShell` grid/flex allocation; `.ui-topbar-start` is pinned to `flex: 0 1 auto` and absorbs the
  overflow while `.ui-topbar-center` (`flex-basis: 0`) yields its whole box first; `.ui-topbar-end`
  is now `flex: 0 0 auto` so the locale picker / user menu keep their natural width anchored
  inline-end. Verified in a headless browser at 390 / 1024 / 1440 px (LTR + RTL):
  `document.documentElement.scrollWidth === clientWidth` and the last `end` control stays fully
  inside the bar at every width; the 1440 px desktop composition and the 390 px drawer composition
  are unchanged.
- **`ListRow` no longer forces page-root overflow (#224)** with a long title plus two trailing
  Buttons at responsive viewports. The row is now `min-inline-size: 0` + `flex-wrap: wrap`, the
  content column shrinks to `min(var(--list-row-body-min-width), 100%)` (logical `min-inline-size`,
  replacing the physical `min-width: 0`), and the trailing slot wraps (`flex-wrap: wrap`,
  `max-inline-size: 100%`, `gap: var(--list-row-trailing-gap)`) instead of pushing the row wider
  than its container. Keyboard order and visible focus are unchanged (DOM order, no tabindex).
  Consumers must no longer add one-off `min-width`/wrapping CSS.
- **`StatusBadge` billing statuses had no localized label (#216).** `trialing`, `past_due`,
  `incomplete` and `canceled` are in the shared `STATUS_MAP` but were missing from `en`/`ja`/`vi`,
  so `<StatusBadge status="trialing" />` rendered the raw i18n key. Labels added in all three
  locales.
- **Release: no publish can outrun the coordinated bump or an MCP gate (#230).**
  `scripts/release.mjs` is now a thin executor — the entire side-effecting command sequence is
  produced by pure, exportable planners in `scripts/release-core.mjs` (`planReleaseCommands` /
  `releaseCommandForStep` / `assertReleaseCommandPlan` / `assertPreflightOrder`), and the step
  machine itself runs through `createReleaseRuntime`, whose only effects are two injected primitives
  (`run` / `capture`). The coordinated target version plus **both** compatibility fields
  (`godxUiMcp`, `godxUiCompatibility`) are written first, then `verify:release`, MCP
  install/build/test, lockstep and the packed manifests of **both** tarballs are verified at that
  target version — every one of them before the first `npm publish`. A publish descriptor is refused
  outright unless it names a tarball produced by the preflight pack, and `npm version` can no longer
  appear in a plan at all.
- **`AuthShell`'s compact block-padding knob now actually reaches `CardContent` (#232).**
  `--auth-shell-card-padding-block-compact` was documented as the public knob for the canonical
  Login card's height, but it was wired only to `--card-space-body-y` — the header↔body gap — while
  the rendered body took BOTH of its block edges (and its inline column) from the single
  `--card-space-inset`. Setting the knob therefore made the card marginally _taller_ instead of
  shorter, and a headerless (`solo`) body ignored it entirely: measured on the official build,
  `--auth-shell-card-padding-block-compact: 14px` left `[data-slot="card-content"]` computing
  `padding: 24px`. Platform had to bridge it with a consumer selector on `[data-slot="card-content"]`
  — precisely the fork rules #44/#45 exist to prevent. The two card axes are now separate knobs:
  `--card-space-inset` is inline-only, and the new **`--card-space-shell-y`** owns every block shell
  edge (a plain header's top, a `solo` body's top, the terminal slot's bottom). It is declared
  `initial`, so its default re-resolves at the CALL SITE to `--card-space-inset` — every existing
  card, including `density="tight|cozy"` (which re-declares it `initial` so an explicit per-instance
  density still beats an ambient shell override), renders byte-identically. On the compact auth card
  the three axes are now bound one-to-one: `--auth-shell-compact-card-inset` → inline column,
  `--auth-shell-card-padding-block-compact` → `--card-space-shell-y`, and the new
  `--auth-shell-card-body-gap-compact` → `--card-space-body-y` (the header↔body gap the block knob
  used to be mis-wired to, kept at its 12px rhythm). Measured in headless Chromium at 1440×900 and
  390×844, identical at both: default `12px 24px 24px` before and after (card 279.5px); with the
  knob at 14px `12px 24px 24px` → `12px 24px 14px` (card 281.5px → 259.5px); with the knob at 14px
  and the inset at 20px `14px 20px 20px` → `12px 20px 14px`; a `solo` body with the knob at 14px
  `24px` → `14px 24px`. Consumers can drop the bridge selector.

- **Token-owned bounded `MasterDetail` rail + a 390px inline `PageContainer` header (#231)** — two
  responsive contracts a consumer could previously only reach with local CSS. `MasterDetail` gains
  `masterViewport?: "auto" | "compact" | "standard"` (default `"auto"`, i.e. today's unbounded
  behaviour, and `auto` deliberately matches NO selector in the stylesheet). The presets cap the
  master region's block size from the new semantic tokens
  `--master-detail-master-viewport-compact` (20rem/320px) and `-standard` (28rem/448px) and scroll
  the collection INSIDE the region; `--master-detail-master-viewport-inset` (default `--space-1`)
  reserves focus-ring room, because an overflow container clips both axes, and doubles as the
  region's `scroll-padding-block`. The bounded region carries `tabIndex={0}` so it is reachable and
  scrollable by keyboard alone (WCAG 2.1.1 / axe `scrollable-region-focusable`) while staying an
  ordinary tab stop — Tab and Shift+Tab walk straight through it. `PageContainer` gains
  `headerLayout?: "stack" | "responsive-inline"` (default `"stack"` — the historical arrangement,
  which likewise matches no selector). Below the 640px step `responsive-inline` keeps `extra`
  beside the title band at the new `--page-header-extra-measure` (11rem/176px) and lets the
  title/subtitle wrap into what is left; at ≥640px both arrangements resolve to the identical row,
  so nothing changes on desktop. No raw pixel props exist by design — a service theme retunes the
  tokens. Measured in headless Chromium against the built preview: with a 60-row collection at
  390px the master is 2,156px tall and the detail lands at y=3,244 on `auto`, versus a 320px master
  (scrollHeight 2,164, `overflow-y: auto`) and the detail at y=1,408 on `compact` — 1,836px higher —
  and 448px/y=1,536 on `standard`; at 1440 and 1024 the master is 2,156px on `auto` and 320/448px
  bounded, with the 320px detail rail unmoved at x=1096/x=680. Focusing the bounded region and
  pressing PageDown then ArrowDown scrolled it 0 → 273 → 313px, and Tab moved focus out to the
  first row. For the header at 390px, `stack` puts the search at x=16/y=header+81 (a full-width
  358px line under the subtitle) while `responsive-inline` puts it at x=198/y=header, 176px wide;
  RTL mirrors it to x=16 with the title band at x=204, and both frames report 0 axe violations at
  1440/1024/390.

## [17.0.0] - 2026-07-12

> **BREAKING (major):** `Flex` now defaults to `direction="row"` (was `col`). Any `<Flex>` that
> relied on the implicit vertical stack must add `direction="col"`. See the migration note below.
> This release also ships as one train with `@godxjp/ui-mcp@17.0.0` (release-lockstep, #140).

### Changed

- **BREAKING:** `Flex` now defaults to the CSS-standard `row`. Existing implicit vertical uses must
  migrate to `direction="col"`; omit `direction` only when a row is intended.
- `DataState` distinguishes disabled/unstarted queries from active loading through `fetchStatus`,
  adds a `prerequisite` slot, and no longer enables generic Retry by default.
- `DataState` / `Alert.QueryError` now classify errors by cause (`classifyQueryError`): Retry is
  offered only for transient/network/5xx failures; a 401/expired token routes to session renewal
  via the new `DataState` `onAuthError` prop (and `Alert.QueryError` `onAuthAction`); 403/404/422
  present a cause-aware message with no blind retry. The user-facing detail is now a localized,
  cause-specific message — the raw backend/token/stack text is no longer shown by default (pass a
  custom `errorRenderer` for a domain-specific message).
- `DataState` preserves existing content during a background refetch (with a polite `sr-only` busy
  status) instead of flashing the skeleton over resolved data.
- Static data-driven `Select` disables itself when it has no options, preventing blank popovers.
- Async data-driven `Select` (`loadOptions`) now treats loading / no-options / error as distinct
  states: a rejected loader no longer leaks an unhandled promise rejection nor masquerades as
  "no results" — it shows its own error affordance, and the empty/error rows render as a disabled
  option row (never a blank surface). The open panel carries `aria-busy` while fetching (gh#138).

  **Migration:** consumers that relied on `DataState`/`Alert.QueryError` always showing a Retry
  button or the raw error message must opt in per cause — set `showRetry` (transient still retries
  automatically), pass `onAuthError` for 401 recovery, or supply `errorRenderer` to render a
  bespoke message. Disabled queries (`enabled:false`) should be given a `prerequisite` slot.

### Added

- **`check:no-consumer-coupling` CI gate** — enforces that `@godxjp/ui` stays an international,
  consumer-agnostic library: it fails when library source (`src/`, `mcp/`, `docs/`, stories,
  examples) names a specific downstream consumer/product (`kintai`, `tempo`, `tiximax`,
  `umbrella`, `chat-prod`, …) or consumer infra domain (`id.godx.jp`, `apigw.godx.jp`,
  `<slug>-prod.godx.jp`, …), and when component source bakes in a locale/currency/timezone
  literal (`'¥'`, `'JPY'`, `'ja-JP'`, `'Asia/Tokyo'`) that should go through Intl/CLDR. The
  library's OWN identity (`@godxjp/ui`, `godxjp-ui`) is never flagged. Pre-existing references
  (origin-design lineage comments + customer-theming showcases) are recorded in a per-file
  baseline (`scripts/no-consumer-coupling.baseline.json`) so the gate only fails on NEW coupling;
  the baseline may only shrink. Wired into `verify` / `verify:release`.
- **`Reveal`** (general) — the official entrance-motion primitive (staggered fade-up). Reads the DS
  motion tokens (`--duration-slow`, `--ease-emphasized`, `--reveal-distance`, the new
  `--reveal-stagger-step`), staggers via a controlled ordinal `delay` (`0..6`, an index into the
  motion ladder — never a raw ms), supports `asChild`, and honours `prefers-reduced-motion` (no
  animation, content stays visible, no layout shift). Replaces consumers' hand-rolled
  `@keyframes` + `.app-reveal`/`.d1..d6`.
- **`AuthShell`** (layout) — centred auth/login page shell: `brand` bar (top) + centred `main`
  (card) + `footer`, over `min-h-dvh`, scoping the comfortable control tier (44px, WCAG touch floor)
  and a larger auth heading via `--auth-shell-*` tokens. Replaces consumers' `.auth-shell-*` /
  `.ui-auth-scope` classes.
- `--reveal-stagger-step` (60ms) primitive motion token — one step of the `Reveal` stagger ladder.
- `EmptyState` `tone` prop (`muted` | `success` | `warning` | `destructive` | `info`, default
  `muted`) — tints the icon medallion from the matching role token, so a consumer never hand-rolls a
  `.ui-success-state` class to scope `--empty-state-icon-*`.
- `classifyQueryError` / `isRetryableQueryError` (exported from `@godxjp/ui/query`) — cause
  classification (`auth` | `forbidden` | `notFound` | `validation` | `transient` | `unknown`) for
  branching custom error UIs and structured logging.
- `AppSettingPicker` `appearance` prop (`"labeled" | "icon"`, default `"labeled"`). `appearance="icon"`
  is a supported, first-class icon-only topbar trigger (e.g. a globe locale switcher): it structurally
  drops the value text and the picker's owned trigger width, hides the chevron, and squares the box to
  the density-aware `--control-height` tap target — no descendant-selector CSS overrides. The localized
  `aria-label` is always applied, so an icon-only trigger can never ship without an accessible name;
  menu options keep their localized names (gh#148).
- `EmptyState` `page`, `section`, and `compact` variants for context-appropriate visual weight.
- `Select` / `SearchSelect` `errorMessage` prop — overrides the localized default shown when an
  async `loadOptions` rejects. Paired with a new `dataEntry.searchSelect.error` i18n key (en/vi/ja).
- MCP patterns for responsive settings, async/table state, organization membership/invitations,
  and signed-in account recovery, plus lockstep UI compatibility metadata.
- **Release lockstep (#140):** `@godxjp/ui` and `@godxjp/ui-mcp` now carry mutual compatibility
  metadata (`godxUiMcp` ↔ `godxUiCompatibility`) enforced by `check:mcp-lockstep` (wired into
  `verify` / `verify:release` and a new `release-integrity` CI workflow that also re-checks the
  packed tarball manifests). `scripts/release.mjs` refuses a ui-only bump, refreshes the compat
  fields, and fail-closes on the lockstep check before committing. New `check_compatibility` MCP
  tool returns an actionable match/mismatch verdict for a consumer's installed `@godxjp/ui` version.

### Fixed

- Runtime visual audit (`scripts/visual-audit.mjs`) is now compatible with the current Playwright +
  `@axe-core/playwright` (gh#139). It creates an explicit `browser.newContext()` → `context.newPage()`
  (older `browser.newPage()` threw _"Please use browser.newContext()"_), guarantees page/context/browser
  cleanup on both success and failure, and `--format json` **always** emits valid JSON — even on
  bootstrap failure (missing peers, no URL, browser won't launch) — with a `status` (`ok`·`partial`·
  `error`) that separates infrastructure `errors[]` from product `findings[]`, so a tool failure can
  never be misread as "zero violations". The tested peer range is documented in the README and the MCP
  `list_visual_checks` command (`playwright >=1.55 <2`, `@axe-core/playwright >=4.10 <5`,
  `axe-core >=4.10 <5`). Adds `pnpm check:visual-audit` — a CI smoke test that serves a fixture page
  tripping all five runtime rule families and asserts each executes (Chromium launch, context, Axe
  injection) — wired into `verify:release`.

## [16.7.2] - 2026-06-30

### Fixed

- **Components now work in Next.js App Router Server Components** (gh#128). The compiled `dist`
  shipped no `"use client"` directive, so importing a client component into the RSC server graph
  (e.g. an SSG page that also exports `generateMetadata` and therefore can't be `"use client"`
  itself) failed `next build` with `TypeError: createContext is not a function` — `i18n/use-translation`
  runs `createContext` at module top-level and `Button` calls the `useTranslation` hook. The build
  now stamps `"use client"` onto every client module in `dist` (the `tsup` build is `bundle: false`,
  so dist mirrors src 1:1; a new `scripts/add-use-client.mjs` post-build step detects client modules
  from source — `createContext` / hook calls / client-only deps, plus `.tsx` wrappers that render a
  client child — and prepends the directive). `import { Button } from "@godxjp/ui/..."` now works
  directly inside a Server Component, like shadcn/MUI/Radix; no consumer `'use client'` boundary
  shim needed. Pure modules (`lib/utils`'s `cn`, `lib/datetime`, `props/**`, tokens) and `.ts`
  re-export barrels stay SERVER, so their non-component exports remain usable from an RSC. Guarded by
  `check:use-client` in `verify:release`.

## [16.7.1] - 2026-06-30

### Added

- **`--button-radius` control token** (gh#124). The button corner radius was locked to the shared
  `--control-radius` (`shape="default"`), so a brand theme could not give inputs and buttons
  different radii. `--button-radius` (default `var(--radius-md)`, preserving the historical look)
  makes the button radius themeable INDEPENDENTLY of inputs/controls.
- **`.ui-control` / `.ui-control-multiline` surface tokens** — `--control-font-size`
  (default `var(--font-size-base)`), `--control-border-width` (default `1px`), `--control-shadow`
  (default `var(--shadow-xs)`). Font size, border width and resting shadow of every control surface
  are now themeable in one place instead of each component hard-coding Tailwind utilities.

### Changed

- **Form controls honor `--control-radius`.** `Input`/`PasswordInput`, the Select/Cascader/TreeSelect
  trigger (`controlTriggerClass`), `Textarea` (`controlMultilineClass`), `controlFieldClass`, and the
  Date/Month range pickers used hard-coded `rounded-md` / `rounded-lg` and so ignored the
  `--control-radius` knob. They now use `rounded-[var(--control-radius)]`. Defaults are unchanged
  (`--radius-lg === var(--radius) === --control-radius`); `Input` shifts from `--radius-md` to
  `--control-radius` so all bordered controls share one themeable radius.
- `.ui-control` now drives border width + resting shadow from the new tokens; the redundant inline
  `border` / `shadow-xs` / `px-3` / `py-1` / `text-sm` utilities were dropped from `Input`.

## [16.7.0] - 2026-06-29

### Added

- **`Input` / `PasswordInput` `leadingIcon` (prefix slot)** (gh#119). Only a `trailingIcon` slot
  existed, and `PasswordInput`'s trailing slot is the built-in reveal toggle — so a leading mail /
  lock affordance (the common auth pattern) was impossible. `leadingIcon` adds a decorative
  (`aria-hidden`, `pointer-events-none`) start slot with `ps-9` padding that coexists with
  `trailingIcon` and `allowClear`; `PasswordInput` inherits it (lock leading + eye trailing).
- **`Badge` brand `primary` tone** (gh#120). A SOFT brand pill (`border-primary/30 bg-primary/10`
  with the new AA-strong `text-primary-strong`), the dashboard "role pill". Scoped to `BadgeTone`
  so the shared status-only `ToneProp` (Alert/Dialog/Sheet) is unchanged; a SOLID brand fill stays
  on `variant="default"`.
- **`Heading` `weight` prop** (gh#121). Render a semantic, emphasised `<h1..h4>` at `bold` without
  dropping to `Text weight="bold"`. Defaults to `medium` (no visual regression); the heading-scoped
  weight selectors outrank the base heading rule.
- **Brand spotlight — `.ui-brand-glow` utility + `--brand-glow*` tokens** (gh#122). A token-driven
  radial brand halo for hero / auth backdrops, replacing a hand-authored `radial-gradient`. Apply to
  an `aria-hidden` layer; decorative (`pointer-events:none`); retint (`--brand-glow-color`), soften
  (`--brand-glow-alpha`), resize (`--brand-glow-size`) or reposition (`--brand-glow-position`) with
  no markup change.
- **AA-strong brand text token `--text-primary` → `text-primary-strong`** (`--color-primary-strong`),
  completing the `text-*-strong` family. Plain `text-primary` on the soft primary tint is only
  4.04:1 in light; the strong token clears WCAG AA (6.06:1 light · 6.08:1 dark).

## [16.6.0] - 2026-06-29

### Fixed

- **Scoped role overrides now reach EVERY component token (the `:root` freeze bug).** A component
  token that pre-resolved a role at `:root` — e.g. `--card-background: var(--card)`,
  `--table-header-background: hsl(var(--muted))`, `--checkbox-checked-background: hsl(var(--primary))`,
  `--avatar-background`, `--sidebar-item-active-*`, the timeline/tree/progress/slider/switch fills,
  the stat-card medallion, `--focus-ring-color: var(--ring)` … — **froze at the `:root` value**: CSS
  substitutes the `var()` at the declaring element, so a scoped `[data-tenant]`/`.dark` override of
  the _role_ (`--card`, `--muted`, `--primary`, `--ring`) never reached the component token. This
  silently broke token-only re-theming for every component; it only became _visible_ under a DARK
  scoped theme (a frozen light card under white text → invisible), which is why earlier light
  re-themes never caught it. Each such token is now a **quiet opt-in knob** declared `initial`, with
  the role default moved to the call site as `var(--knob, <role>)` — so the default re-resolves live
  under any scope while an explicit theme override of the knob still wins. ~33 tokens across card /
  table / control / data-display / feedback / list-row / navigation / shell / foundation. All
  default-theme output is byte-identical (verified); scoped dark/brand themes now recolour correctly.
  The new `check:contrast` route `/showcase/futurelastic-web` (a fully DARK token-only brand) is the
  regression guard.

### Added

- **FUTURELASTIC dark-website showcase** (`/showcase/futurelastic-web`) — a token-only rebuild of a
  second Claude Design handoff, deliberately the opposite of the admin/light work: dark-mode default,
  gold-on-Urushi (Kiniro), Sora display 80px + Be Vietnam Pro body, hero/CTA gold glow, 6-col bento,
  stats band, footer. Built from real primitives + a `[data-tenant="futurelastic"]` token block only —
  **zero new framework components** (every marketing section fails the Framework-Component Test → it is
  composition). Exists to prove the token model reproduces a wholly different DARK brand from
  configuration alone, and it surfaced the `:root` freeze bug above.

## [16.5.0] - 2026-06-29

### Fixed

- **Coloured status TEXT now clears WCAG AA on white.** The light wa-iro semantics (若竹 success,
  山吹 warning, 群青 info) failed AA 4.5:1 as small coloured text (a `StatCard` delta, an outline
  `Badge` label, an `Alert` title). New darker `--text-{success,warning,info,error}` tokens (light
  on the dark theme) drive a `text-{success,warning,info,error}-strong` utility; the status TEXT now
  reads those while the badge/bar/icon FILLS keep the brighter role colour. Gated by `check:contrast`
  on the default-theme pages too.
- **Outline/ghost `Button` text could vanish on a dark scoped region.** `.ui-button--outline` /
  `--ghost` never set their own text colour, so they inherited `body`'s computed dark colour and went
  near-invisible on an on-navy hero/region (contrast ~1.1:1). They now set
  `color: hsl(var(--foreground))` explicitly, so the label always reads the scoped foreground.
- **Table header text could go invisible when a brand set a dark `--secondary`.** The header band was
  `background: --secondary` + `color: --muted-foreground` (independent), so a navy-secondary brand got
  dark text on a dark band. The band is now decoupled into `--table-header-background` /
  `--table-header-foreground` (defaults `--muted` / `--muted-foreground` — `--secondary` == `--muted`
  in the default theme, so byte-identical), themed together to keep contrast.

### Added

- **`check:contrast` — a browser-rendered WCAG 2.2 AA text-contrast gate** (`scripts/check-contrast.mjs`,
  wired into `verify:release`). jsdom/axe-in-vitest can't see colour, so dark-on-dark scoped-region
  bugs slipped every static check; this renders pages in Chromium, computes the effective background
  behind every text node, and fails below 4.5:1 (3:1 for large text). Logotypes (`[data-logotype]`)
  and disabled text are exempt (WCAG). Skips gracefully where no browser is available. (Surfaced — and
  these now pass — the outline-button and table-header bugs above.)
- **Composition pattern vs framework component — a hard decision gate.** New
  `docs/COMPOSITION-VS-COMPONENT.md` defines the two concepts and the **Framework-Component Test**
  (7 criteria, all must pass) that now gates every `src/components/` addition: it is **Gate 0** of the
  `godxjp-ui-component` skill and **cardinal rule #46** in CLAUDE.md. Marketing Hero/Navbar/Footer,
  page layouts and icon medallions FAIL the test → they are compositions built from existing
  primitives + tokens, never framework components.
- **Marketing display-type + dual-font tier (opt-in, enterprise defaults unchanged).** `--font-size-3xl/
-4xl/-5xl` (wired to `text-3xl/-4xl/-5xl` utilities via `--font-size-display` + a bolder ramp),
  `--font-weight-black` (800), and a dual-font split — `--font-family-display` (headings) +
  `--font-family-body` (prose), both defaulting to `--font-family-sans`. Lets a marketing surface
  reach a bold landing-page look from tokens; the dxs-kintai admin scale stays small by design.
- **`Sidebar` main nav-item active is themeable** — `--sidebar-item-active-background` /
  `--sidebar-item-active-foreground` (defaults = the hover look), so a service brands the selected
  row (e.g. a gold tint + gold text on a navy sidebar) without forking CSS.
- **`StatCard` gains an optional `icon` medallion** (see its own entry above).
- **Two TIXIMAX showcases proving 100% token-fidelity from a Claude Design** — `tiximax-portal`
  (admin portal: navy sidebar via role-scoping, gold CTA + glow, stat medallions) and
  `tiximax-website` (marketing landing: navy hero + gold glow, services/steps/routes, CTA, footer) —
  both rebuilt from token configuration + real primitives only, no new framework components.

- **Component colour-extensibility slots — every component is now token-themeable, no new colour
  codes.** A repo-wide audit found surfaces whose colour was baked or only role-default; each now
  reads a token so a service retints/glows/tints/gradients it from the token layer alone (opt-in,
  quiet by default, reads existing semantic roles). All defaults are byte-identical — verified in a
  browser. Highlights:
  - **Opt-in depth slots** (default invisible): `--card-glow` + `--card-tint`, `--dialog-content-glow`
    (raised dialog/sheet panel), `--avatar-tint`, brand glow layered on floating menus
    (context-menu / menubar / navigation-menu content), and `--sidebar-gradient` / `--topbar-gradient`
    brand-chrome washes.
  - **Tokenised role-colours** (default = the previous value, so appearance is unchanged): the
    checked/on fills (`--checkbox-checked-background`, `--switch-checked-background`,
    `--toggle-on-background`, `--slider-track-background`, `--slider-range-background`); table row
    states (`--table-row-striped/hover/selected-background`); `--progress-track-background` /
    `--progress-fill-background`; timeline accents (`--timeline-dot-done/current-background`,
    `--timeline-line-completed-background`); `--tree-item-active-border/-background`;
    `--avatar-background`; `--skeleton-background`; `--empty-state-icon-foreground/-tint`;
    `--menubar-item-hover-background/-foreground`; `--sidebar-item-active-color/-tint`.
  - The token-tier guard now accepts `glow` / `tint` / `gradient` as component-token property
    suffixes. See `docs/roadmap/color-extensibility.md` for the full map (implemented slots +
    the prop-tier roadmap for states still set via a fixed `tone`/`variant` vocabulary).

### Changed

- **Scoped / multi-tenant theming now works for colours and radius.** The `@theme` block in
  `styles/index.css` is now `@theme inline`, so Tailwind inlines each expression (e.g.
  `hsl(var(--primary))`) directly into every colour/radius utility instead of freezing it as
  `var(--color-primary)` computed once at `:root`. A scoped `[data-tenant]{ --primary: … }` override
  now re-resolves at the element, so `bg-primary` and friends retint inside the subtree. Single-brand
  `:root` theming is unchanged, and the `--color-*` / `--radius-*` vars are still emitted for any
  code reading them directly. (See `docs/CUSTOMER-THEMING.md` for the scoped caveats.)
- **Every focus ring is now token-driven.** All `:focus-visible` / `:focus-within` rings across
  controls, the shell, data-entry and data-display read `--focus-ring-color` (and
  `--focus-ring-width`) directly, so one override retints/resizes them all — even scoped under
  `[data-tenant]`. Default appearance is unchanged.
- **The modal scrim is now a single token.** Dialog, AlertDialog, Sheet and Drawer backdrops read
  the shared `--overlay-background` (was a baked `rgb(0 0 0 / .5)` / `bg-black/50`).

### Added

- **Global brand-depth tokens — all opt-in, all quiet by default** (cardinal rules #44/#45), so a
  service configures them from the token layer with no component change:
  - `--shadow-glow` — a coloured glow halo layered on the primary CTA's resting shadow (default
    invisible).
  - `--focus-ring-color` / `--focus-ring-width` — the hue and thickness of every keyboard-focus
    ring.
  - `--gradient-hero` / `--gradient-glow` / `--gradient-brand` — opt-in decorative fills (default
    `none`); `--gradient-hero` paints the `PageContainer` header, `--gradient-glow` the `AppShell`
    content area.
  - `--card-shadow` — resting elevation for every `Card` (default `none`; set to e.g.
    `var(--shadow-sm)` to lift all cards).
  - `--overlay-background` — the shared scrim colour for all overlays.

## [16.4.0] - 2026-06-28

### Changed

- **Default sans font is now Noto Sans JP; the Vietnamese locale uses Montserrat.** The bundled
  `@fontsource/m-plus-2` is replaced by `@fontsource/noto-sans-jp` (default, JA + Latin) and
  `@fontsource/montserrat` (incl. its `vietnamese` subset). `--font-family-sans` leads with Noto
  Sans JP; a `:root:lang(vi)` rule in `styles/index.css` swaps it to Montserrat. AppProvider now
  reflects the locale on `<html lang>` (previously only `dir`), which drives the swap — so a
  `vi` app renders Montserrat (with Noto Sans JP retained as the JP fallback), every other locale
  renders Noto Sans JP. The browser only downloads the subset files the rendered text needs.

### Added

- **`Descriptions` gains a `layout` prop** (`"vertical" | "horizontal"`, default `vertical` — no
  change to existing usages). `horizontal` places the label BESIDE the value in a token-aligned
  label column (the detail-row look, mirroring `<Form layout>`), tunable via the new
  `--descriptions-label-width` token. `dt`/`dd` semantics are preserved in both layouts.

## [16.2.2] - 2026-06-27

### Added

- **`<Table>` now sets `data-slot="table"`** on its root (its `<th>`/`<td>` already had
  `table-head`/`table-cell` slots — the root was the lone slotless element). The card
  header-above-flush-table rule now targets `[data-slot="table"]` instead of the raw `table`
  element, matching the data-slot convention used everywhere else.
- **Detailed Card spacing-token docs** — each `--card-space-*` token now carries an individual,
  themeable description (surfaced via the MCP `get_tokens`), plus a "Border-aware vertical padding"
  section in `docs/TOKENS.md` and token guidance in the Card MCP entry explaining the
  divided-band (`--card-space-divided-y`) vs plain-flow padding model and `--card-accent-rail-width`.

### Fixed

- **A header above a flush full-bleed table had no bottom gap.** A non-banded `CardHeader` zeroes
  its own bottom padding and leans on the body's top padding for the gap — but a `CardContent flush`
  with a `<table>` zeroes that too, so the title/subtitle butted directly against the table header
  row (a big inset above the title, ~0 below the subtitle). The header now supplies its own bottom
  gap (`--card-space-body-y`) in that case, matching the top inset for a balanced header block.

### Added

- **`--card-space-divided-y` token** — one border-aware knob for the vertical padding of a Card
  section that carries a divider border (a `banded` header, a `separated` footer). A divided band
  reads as its own region, so it pads SYMMETRICALLY top+bottom — distinct from a plain header that
  flows into the body (top inset, no bottom). The banded header and separated footer now share this
  token, so a theme tunes the band rhythm in one place instead of forking per-slot CSS.

### Fixed

- **A `banded` header below a `CardCover` lost its symmetric padding.** The cover rule forced
  `padding-top: --card-space-body-y` on any header under the media, which combined with the banded
  band's `--card-space-divided-y` bottom to give an uneven 16/8 band. The cover top-gap now applies
  only to NON-banded headers, so a banded header stays a symmetric divider band wherever it sits.

### Fixed

- **Card accent stripe was a 1px hairline instead of the 6px token.** The Card applied a Tailwind
  `border` utility (utilities layer) whose `border-left-width:1px` beat the components-layer
  `[data-accent]` rail-width rule, so only the accent COLOUR showed (a thin blue line). The base
  border width now lives in the components-layer CSS, so the `--card-accent-rail-width` (6px)
  override wins — while a consumer `className="border-2"` still overrides it as before.
- **In-panel search boxes double-bordered.** `Cascader`/`TreeSelect` wrapped `CommandInput` (which
  already draws one bottom separator + inline padding) in an extra `border-b p-2` box, and
  `SearchSelect` used a fully-bordered `Input` inside the dropdown. All three now render the search
  field FLUSH — one bottom separator, no nested box, tighter padding.

### Added

- **`Input` gains a `trailingIcon` prop** that encapsulates the "one trailing icon at a time"
  rule: pass a trailing affordance (e.g. a calendar/clock popover trigger) and, when `allowClear`
  is on and the field holds a value, the clear ✕ REPLACES that icon — never both. This is now the
  shared mechanism `DatePicker`/`TimePicker` use for their open trigger.

### Changed

- **Every clearable picker/combobox now shows ONE trailing icon, not two.** Previously a filled
  `DatePicker`/`TimePicker`/`DateRangePicker`/`MonthPicker`/`MonthRangePicker`/`Cascader`/
  `SearchSelect` rendered the clear ✕ AND the calendar/clock/chevron side by side. Now the clear ✕
  replaces the trigger icon while a value is set; the field itself (click / ArrowDown) still opens
  the panel, and the trigger icon returns when the field is empty. `DatePicker`/`TimePicker` were
  refactored onto the new `Input.trailingIcon`; the others apply the same rule inline.

### Removed

- **BREAKING — removed `TimeInput`** (and the `TimeInputProps` type + the `@godxjp/ui/data-entry`
  export). It duplicated `TimePicker`, which already wraps the same typeable canonical `HH:mm`
  `<input>` and adds the scroll-column popover. Migrate
  `<TimeInput value … onValueChange … step={15} />` →
  `<TimePicker value … onValueChange … minuteStep={15} />` (the `step` prop becomes `minuteStep`).

### Fixed

- **`TimePicker` showed two trailing icons at once.** When a value was set it rendered BOTH a clear
  (×) and the clock trigger side by side (`pe-16`). Now a single trailing slot: the clear replaces
  the clock when there is a value (the field itself / ArrowDown still opens the panel), and the
  clock returns when empty (`pe-10`). The popover anchors to the field via `PopoverAnchor`.
- **Menu separators rendered as tall gray blocks.** `.ui-context-menu-content > div` (specificity
  0,1,1) was bundled into the item-sizing rule, so it overrode the `.ui-context-menu-separator`
  (0,1,0) `height:1px` — the separator filled its 2rem item box with the border colour. The same
  catch-all also squashed `ContextMenuRadioGroup`. Removed the `> div` selector (every menu part
  already carries its own class). DropdownMenu/Select use the `h-px` utility and were unaffected.
- **`SkeletonTable` double-bordered inside a flush `CardContent`.** It kept its own border + radius
  while its real-data counterpart `DataTable` (`.ui-data-table-surface`) is stripped to borderless
  in `[data-flush]`. Added the matching flush rule for `.ui-skeleton-table` so the loading
  placeholder and the table it swaps for sit identically (the Card supplies the single border).

## [15.0.1] - 2026-06-27

### Fixed

- **`.ui-stack-xs` was a row, not a column.** Unlike `.ui-stack-sm/md/lg`, the xs size only set
  `display:flex` + `gap` and never `flex-direction:column`, so every `gap="xs"` stack (`Stack`,
  `ToolbarGroup`) laid out horizontally. CJK `ToolbarGroup` labels (ステータス, 会計期間…) got
  squeezed and wrapped vertically. Added the missing `flex-direction:column`. (`Flex` was
  unaffected — it uses `.ui-flex-gap-*`, gap-only.)
- **ResizablePanel docs/examples passed numeric sizes that render as PIXELS.** In
  react-resizable-panels v4 a bare `number` is pixels and a `string` is the unit, so
  `defaultSize={35}` produced a 35px sliver instead of 35%. Switched the example pages
  (`docs/layout/resizable-panel`, `docs/showcase/table-master-detail`) to percentage strings
  (`defaultSize="35%"`) and corrected the MCP catalog prop types/usage (`string | number`,
  number = px) so consumers are told the v4 rule.
- **Pagination page-size `Select` rendered full-width.** `SelectTrigger`'s baked `w-full`
  (utilities layer) beat the `.ui-pagination-size-trigger` width (components layer); the trigger
  now also carries `w-[var(--pagination-size-width)]` so tailwind-merge drops `w-full`.
- **Dead CSS removed:** the orphaned `.ui-filter-bar/.ui-filter-group/.ui-filter-label/
.ui-filter-clear` aliases left over from the FilterBar→Toolbar rename (no references remained).

## [15.0.0]

### Removed

- **BREAKING — removed `DataGrid` and the `@godxjp/ui/data-grid` subpath.** Its full TanStack
  feature set has been merged into the one `DataTable` (see Changed). Migrate
  `import { DataGrid } from "@godxjp/ui/data-grid"` → `import { DataTable } from "@godxjp/ui/data-display"`
  and rewrite the compound parts (`DataGrid.Toolbar/.Search/.ViewOptions/.DensityToggle/.BulkActions/.Content/.Pagination`)
  to `DataTable.*`. Columns move from TanStack `ColumnDef` (`accessorKey`/`cell`/`meta.label`) to the
  lean `ColumnDef` (`key`/`header`/`render`/`sortable`/`enableHiding`).
- **BREAKING — removed `DataTable` (+ `ColumnDef`/`Density`) from the `@godxjp/ui/admin` barrel.**
  `DataTable` is now TanStack-powered, so re-exporting it from the runtime-neutral root/admin barrel
  would leak `@tanstack/react-table` into the core (check-core-isolation). Import it from
  `@godxjp/ui/data-display` instead.
- **BREAKING — removed `Logo`.** It overlapped `Avatar` (both render a glyph in a box); use `Avatar` for entity/brand marks.

### Changed

- **BREAKING — `DataTable` is now the one TanStack-powered table** (the former `DataGrid` merged in).
  It keeps the lean `data` + `columns` (lean `ColumnDef`) API for the common case — the existing
  `<DataTable data columns … />` usages are unchanged — and adds the full grid chrome as compound
  parts: `DataTable.Search` (global filter), `DataTable.ViewOptions` (column show/hide), and a
  numbered page-size form of `DataTable.Pagination` (`pageSizeOptions`, distinct from the existing
  cursor `cursor`/`hasMore`/`onChange` form), alongside the existing
  `Toolbar/SelectAll/BulkActions/DensityToggle/Content`. Sorting/filtering/visibility/pagination/
  selection are now driven by `@tanstack/react-table` internally — client-side by default, or
  server-side via the `sort`/`globalFilter`/`pagination`/`columnVisibility` state + `manual*` flags.
  `DataTable.BulkActions` now also accepts a `(count) => node` render-prop (the former `DataGrid`
  form) in addition to ReactNode children. Two minor behaviour changes: a `sortable` column with NO
  controlled `sort`/`onSortChange` now sorts CLIENT-SIDE (was a no-op); the default `density` step is
  unchanged (compact) for the lean path. `@tanstack/react-table` moved from an optional peer to a
  direct dependency.
- **BREAKING — `Topbar` is now a PURE SLOT bar; the baked chrome is gone.** The library was
  dictating header CONTENT (a product-switcher chip with an always-on dropdown caret, a search box,
  a notification bell, a sidebar toggle, a tweaks button) — which is the consumer's job, and the
  source of the "dead dropdown with nothing to choose" and every app's header looking different.
  `Topbar` now exposes only `start` / `center` / `end` (+ `children` escape hatch) and owns ONLY the
  bar layout. Compose the brand (`Avatar`), sidebar toggle, search trigger, settings pickers
  (`AppSettingPicker`), notifications and user menu yourself and drop them into a slot — a control
  exists ONLY because you placed it. Removed props: `product`, `project`, `productMenu`, `projectMenu`,
  `projectPlaceholder`, `onProductOpen`, `onProjectOpen`, `onSearchOpen`, `onTweaksOpen`, `collapsed`,
  `onToggleCollapsed`, `rightSlot`, `unread`, `searchPlaceholder`, `onNotificationsOpen`, `user`; and
  the `TopbarProduct`/`TopbarProject` types. `AppShell` (already slot-based) is unchanged; `Sidebar`'s
  brand header now renders its dropdown caret ONLY when `onProductClick` is wired (use the `brand`
  slot for a fully custom header).

### Added

- **`DataTable.Search` / `DataTable.ViewOptions` and numbered `DataTable.Pagination`** — the merged
  former-`DataGrid` chrome, now on the one `DataTable`. New optional column field `enableHiding`
  (default true) lists a column in the `ViewOptions` "set view" menu; set false to keep a key/actions
  column always visible. New optional props `globalFilter`/`onGlobalFilterChange`,
  `pagination`/`onPaginationChange`/`rowCount`, `columnVisibility`/`onColumnVisibilityChange`, and
  `manualSorting`/`manualFiltering`/`manualPagination` for server-driven grids.
- **`ListRow` — single-line entity-row surface for short lists inside a Card** (#113). Leading
  (icon/Avatar) · title/description · trailing action, with tokenized border/radius/padding
  (`--list-row-*`) and a quiet auto divider between stacked rows (last row leaves the Card border).
  Replaces the `flex items-center justify-between border-b py-3` hand-roll repeated across account
  pages (sessions / API tokens / linked accounts / passkeys / MFA / invitations) — DataTable is too
  heavy for a 2–8 item list and a Card-per-row would be card-in-card. Use in `<CardContent flush>`.
- **Motion token tier** (#112) — `--duration-{fast,base,slow}` (150/250/500ms),
  `--ease-{standard,emphasized,decelerate,accelerate}`, and `--reveal-distance` (10px) in the
  foundation tier, so enter/transition animations read a token instead of a hard-coded `0.5s` /
  `cubic-bezier(0.32,0.72,0,1)` / `translateY(10px)` (cardinal rule #2 — tokens, not literals).
  A service retunes motion globally by overriding these; consumers honour `prefers-reduced-motion`
  at the call site.
- **`Button` `fullWidth` prop** (#111) — spans the container (`width:100%`) instead of sizing to
  content, so stacked auth / dialog-footer actions use the prop form instead of `className="w-full"`
  (cardinal rule #42: props before utilities). Sets `data-full-width` for styling hooks.
- **Agent forcing-kit — the godxjp-ui workflow is now enforced by the harness, not the agent's goodwill.**
  Installing `@godxjp/ui` auto-registers the `godx-ui` MCP in the consumer's `.mcp.json`
  (`scripts/postinstall.mjs`, non-destructive, skipped in CI / the library's own repo). `npx
@godxjp/ui init-agent` scaffolds the full kit: a Claude Code **PostToolUse hook**
  (`scripts/audit-hook.mjs`) that runs the static audit on every `.tsx` Write/Edit and feeds the
  findings straight back to the agent (it cannot skip the audit), a **SessionStart** hook that
  injects the workflow mandate (`.claude/godxjp-ui-workflow.md`), and the optional pre-commit/CI
  snippets. New \`bin\` (\`godxjp-ui\`) exposes \`init-agent\` / \`audit\` / \`visual-audit\`. The static
  audit now accepts file paths (incl. absolute) so the per-edit hook can target one file.
- **New audit rule \`bare-control-needs-formfield\`** (warn) — catches a bare \`<Label>\`/\`<label>\`
  paired with a text control that skipped \`<FormField>\` (the cramped-login-form failure mode that
  previously passed the audit when it used capitalized \`<Input>\` instead of raw \`<input>\`). Cites
  WCAG 1.3.1 / 3.3.2 + cardinal rule 227.
- **Runtime VISUAL audit (\`scripts/visual-audit.mjs\`) — Playwright + axe-core over the running app.**
  The counterpart to the static source audit: drives a real browser and catches what regex can't —
  axe-core WCAG/ARIA violations (incl. colour contrast), target size < 24×24 (WCAG 2.5.8), the OKLCH
  chroma of a rendered accent (dxs-kintai 渋み ≤ 0.18), emoji that reached the DOM (Unicode UTS #51),
  and a mis-laid-out notification banner (Alert anatomy). Warnings by default; `--strict` for a CI
  gate. `playwright` + `@axe-core/playwright` are OPTIONAL peer deps (the static audit and the library
  stay browser-free). Decision logic is a pure, unit-tested module (`scripts/visual-audit-rules.mjs`).
  Surfaced by the new MCP **`list_visual_checks`** tool (kept separate from the static
  `list_audit_rules` so neither tool — nor the dependency footprint — gets heavy).
- **Local UI-audit now enforces international a11y/i18n/RTL standards (warnings, non-blocking).**
  `scripts/ui-audit.mjs` gained 10 standards-cited rules so a consumer agent can self-correct
  BEFORE a visual review: `no-emoji-in-ui` / `no-emoji-flag` (Unicode UTS #51, ISO 3166-1,
  `Intl.DisplayNames`), `no-physical-direction` (W3C CSS Logical Properties — use `ms-/me-/ps-/pe-`,
  `start-/end-`, `text-start/end`), `icon-button-needs-name` / `img-needs-alt` / `no-positive-tabindex`
  / `hand-rolled-close-glyph` (WCAG 2.2 + WAI-ARIA APG), `hardcoded-currency` (ISO 4217,
  `Intl.NumberFormat`), `raw-intl-date` (ISO 8601 + IANA tz, `Intl.DateTimeFormat`), and
  `no-em-dash-in-copy` (dxs-kintai typography). Each finding prints the `standard:` it enforces;
  a new `--rules` flag prints the rule catalog as JSON (the single source of truth).
- **MCP `list_audit_rules` tool** surfaces the audit catalog (id · severity · category · standard ·
  fix + the run command) so an agent knows what the local audit checks and that it should run it
  before any visual pass. Backed by `mcp/src/data/audit-rules.ts`, kept in sync with the CLI by the
  new `scripts/check-audit-sync.mjs` guard (`pnpm check:audit-sync`, wired into `verify`).
- **Anti-AI-tells**: added `Emoji in product UI`, `Oversaturated brand accent`, and
  `Stacked notification banner (misplaced alert controls)`; the `Alert` catalog entry now states its
  fixed anatomy (single leading tone icon · `Alert.Actions` trailing-right · `onDismiss` × top-right
  · one horizontal row, never a vertical stack).

### Fixed

- **`Text`/`Heading` `truncate` now ellipsises inside a flex row without the consumer adding
  `min-w-0`** (#114) — the truncate rule was missing `min-width: 0`, so a `<Text truncate>` flex
  child still pushed past its track. The documented flex-truncate idiom now works from the prop alone.
- **FormField collapsed to its content width inside a flex column (short inputs).**
  `.ui-form-field` carried `align-self: start` (to keep fields top-aligned across a
  `ResponsiveGrid` row) but no explicit inline size. In a grid parent that only affects the
  block axis, so width filled via the column. But the `<Form>` container itself is a flex
  column (`.ui-form`), and any `<Flex direction="col">` is too — there `align-self` governs the
  **inline** axis, so a field shrank to its widest content (a helper-less `Input` collapsed to
  its ~20ch default, e.g. login forms rendering "ngắn tũn" half-width inputs). Fixed by giving
  `.ui-form-field` `inline-size: 100%`, mirroring Ant Design's Form.Item (vertical → width:100%):
  a field now fills its container in **any** parent — `<Form>`, a `ResponsiveGrid` cell, a bare
  flex column, or a plain block — while `layout="inline"` stays content-width (compact,
  side-by-side). `align-self: start` is retained for block-axis row top-alignment.

- **Alert: bare `AlertTitle` + `AlertDescription` split into side-by-side columns at ≥sm.**
  `alert-body` unconditionally switched to `flex-direction: row; justify-content: space-between`
  at the sm breakpoint — a layout meant only for pushing `AlertActions` to the end — so the
  canonical catalog example, `AlertQueryError`, and the docs page all rendered the title in a
  narrow left column with the description floating right. The row (now a `text | actions` grid)
  only activates via `:has(> [data-slot="alert-actions"])`; without actions the body always
  stacks. Catalog usage notes updated to match. (#106)
- **npm package: component utility classes were never emitted in consumers.** `styles/index.css`
  declared `@source "../**/*.{tsx,ts}"`, but the published package ships compiled JS only — the
  glob matched nothing, so Tailwind dropped every utility referenced solely inside library
  components (unstyled/transparent popovers and selects; an opened `Select` froze the whole page
  because the Radix scroll-lock's `pointer-events-auto` escape hatch was missing). The glob now
  also scans `.js`, which resolves to the package's own `dist` when installed from npm. Consumers
  no longer need the `@source ".../node_modules/@godxjp/ui/dist"` workaround.

### Changed

- `PageContainer` header no longer draws a bottom divider by default. The rule was hard-coded
  (`border-bottom: 1px solid`) with no off switch short of `variant="ghost"`. It is now driven
  by the new semantic token `--page-header-divider` (default `none`); a service theme opts back
  in with `--page-header-divider: 1px solid hsl(var(--border));`. `variant="ghost"` still forces
  it off regardless of the token.
- `PageContainer` header vertical rhythm is now balanced: the header's bottom pad is the new
  semantic token `--page-header-pad-bottom`, defaulting to
  `calc(--space-page-active-y − --space-section-active)` so the title→body distance equals the
  page's top padding (24/24 instead of the old 24 above / 32 below when there is no subtitle).
- Horizontal `Form` label geometry is theme-tunable: new component tokens `--form-label-width`
  (default `max-content`; previously only reachable via the `labelWidth` prop) and
  `--form-label-gap` (default 16px; previously hard-coded `--space-4`). A service theme sets them
  once to match its design grid; the `labelWidth` prop still wins per form/field.
- Two new cardinal rules distilled from real service consumption: **#44 Chrome is a token,
  default quiet** (no hard-coded dividers/chrome in `src/styles/*.css`; quietest default, theme
  opt-in) and **#45 Every service-tunable constant gets a knob** (design-grid geometry like label
  widths/gaps must be a documented component token, not prop-only or hard-coded). `CLAUDE.md`
  gains the matching add-a-token checklist and the local-link (`file:`) dev workflow.

### Added

- `SearchSelect` / data-driven `Select` options gain an `icon` field (avatar / flag / lucide node).
  It renders before the label in the option rows AND on the trigger once selected — so a picked
  account/person/country shows its icon at rest, not just plain label text. No `renderOption` needed
  for the common icon-with-label case.
- `SearchSelect` / `Select` also gain a `selectedIcon` prop — the trigger counterpart of
  `selectedLabel`: it shows a leading icon for an async preset value whose option page hasn't loaded
  yet (e.g. an edit form pre-filled from the server), so the avatar/flag shows at rest.
- `Button` `count` gains Ant-Badge-parity `overflowCount` (default 99 → renders `99+`) and `showZero`
  (default `true`; pass `false` to hide the pill when the count is 0).
- `SearchSelect` / `Select` gain a `labelRender` prop (Ant Design) — fully customize the SELECTED
  value shown on the trigger (avatar + name + role badge, etc.); the placeholder still shows when
  empty. Receives `{ value, label, option }` (option is undefined for an unloaded async preset).

### Fixed

- `Toaster` (sonner) rendered fully transparent: it forwarded the color tokens unwrapped
  (`--normal-bg: var(--popover)`), but the framework tokens are raw HSL triplets consumed as
  `hsl(var(--token))` — sonner used the bare triplet as a CSS color, which is invalid, so the
  toast had no background/text/border. The bridge vars now wrap with `hsl()`.

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
