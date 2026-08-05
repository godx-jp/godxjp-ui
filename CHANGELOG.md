# Changelog

All notable changes to `@godxjp/ui` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

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
