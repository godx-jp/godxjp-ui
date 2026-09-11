# Consolidated parity backlog — all three audits merged

Sources: `parity-audit-data-entry.md` · `parity-audit-data-display-feedback.md` ·
`parity-audit-layout-navigation-general.md`. Sequencing strategy is decided in
`debate/antd-parity-scope-and-sequencing/04-Decision.md`.

## The headline the audits actually produced

All three groups came back **more Ant-aligned than the complaint implied**, and all three agents
independently proposed **zero new components** for their P0/P1 rows — every one closes by widening
an existing API. The real damage is not missing antd props. It is:

1. **Two data-corruption / i18n defects that are live in shipped locales** (P0 below).
2. **A toast surface with no owner** — the catalog tells consumers to import from `sonner` directly.
3. **MCP catalog drift** — props that ship in `src/` but are invisible to consumers, in at least
   10 components. This is the same failure class as commit `8365bf05`.

A reference-version note that changes how future audits must run: ant.design now serves **v6**, and
v6 has moved `fixed`, `gapPosition`, `dotPosition`, `expandIconPosition` and `Timeline.mode` to
logical `start`/`end` — **toward the spelling this repo already uses**. Part of "doesn't look like
Ant Design" is this library being ahead, not behind. Any future audit must pin the antd version it
compared against, or successive waves will silently measure against different targets.

## P0 — fix first, regardless of which strategy wins

| #   | Defect                                                                                 | Evidence                                                                                                                                                                                                                                                  | Why P0                                                                                                |
| --- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | **`NumberInput` corrupts values 10× in comma-decimal locales, including shipped `vi`** | formats via `Intl.NumberFormat` (`number-input.tsx:100`), parses via hardcoded `replace(/,/g,"")` (`:41`), `handleBlur` re-parses the displayed draft (`:220`). `Intl.NumberFormat("vi",{useGrouping:false}).format(1.5)` → `"1,5"` → parses back as `15` | Silent money/quantity corruption. Focus-then-blur is enough. Keep the NFKC 全角 fold — it is correct. |
| 2   | **`Timeline` hardcodes English screen-reader status text**                             | `SR_PREFIX = {done:"Completed: ",…}` `timeline.tsx:31-35`, injected `:107`; `grep timeline src/i18n/messages/en.json` → 0 hits                                                                                                                            | A ja/vi product announces English. Violates the mandatory i18n gate.                                  |
| 3   | **`PasswordStrength` is hardcoded English end-to-end**                                 | `password-strength.tsx:4-8,75,106,113,119-133`; never imports `useTranslation`; `labels` overrides only 3 of ~10 strings                                                                                                                                  | Same gate; and consumers cannot work around it.                                                       |

## P1 — grouped by owning file, so one agent owns one group

**`data-entry`** — `SearchInput` Enter does
not commit (no `onKeyDown` in the file; `:59-63`) · `ColorPicker` has no `size`/`status`/`variant`
and no `presets` (`data-entry.prop.ts:893-908`) · `PasswordStrength` uses `role="img"` instead of
`role="meter"` (`:74-76`) · `Upload showUploadList` boolean-only (`:1196`) ·
`Transfer` has no `status` (`:1413-1459`) · `Cascader` search uncapped (`cascader.tsx:389-393`) ·
`Select` lacks `fieldNames` although `Cascader` and `TreeSelect` both have it · `NumberInput` has
no `stringMode`.

**`data-display` + `feedback`** — `Toaster` has no house API at all (`components.ts:7302` sends
consumers to `sonner`; `position` is physical and never flips under RTL) · `Skeleton` puts
`aria-live="polite"` on every block (`skeleton.tsx:13-14`); `SkeletonTable` mounts 40+ nested,
unnamed live regions · `Accordion` hardcodes `<h3>` (`ui/accordion.tsx:314`) and has no `extra`
slot · `Carousel` dots lack `aria-controls` and the arrows do not flip under RTL
(`carousel.tsx:249-269`, `data-display-layout.css:547-580`) · `Avatar` has no `size` · `Progress`
never displays its percentage and hand-builds `aria-valuetext` (`progress.tsx:174`) · `StatCard`
derives delta tone from a regex on a stringified node (`card.tsx:233-246`) · `QrCode` has no
`status`/`onRefresh` · `DataTable` lacks `virtual`, `onCell`, `column.rowScope`,
`childrenColumnName`/`indentSize`.

**`layout` + `navigation` + `general`** — `Dialog` has no `width` while `Sheet` does
(`dialog.tsx:287-294` vs `sheet.tsx:264`), so the catalog's own example teaches the utility geometry
`ui-audit` blocks · no `dismissible` on `Dialog`/`Sheet` (`dialog.tsx:310` hardcodes
`isDismissable`) · `Pagination` is controlled-only, breaking the full-triad rule · `AppShell` has no
`onSidebarCollapsedChange` and no built-in trigger (`app-shell.tsx:30`) · shell collapse breakpoint
hardcoded (`shell-layout.css:1119`) while the overlay family's equivalent is a token · `Sidebar`
submenu open state is unreachable local state (`sidebar.tsx:271`) · `NavigationMenu` has no overflow
affordance (WCAG 2.4.3 / 1.4.10) · no `copyable` anywhere despite `ErrorSurface` rendering a
`requestId` "so it can be read out or copied accurately" (`layout.prop.ts:787`) · clamped text
cannot expand.

## Cross-cutting: MCP catalog drift

Props that ship but are invisible to consumers — `Select`'s `onSelect`/`onDeselect`/
`maxTagPlaceholder` (`data-entry.prop.ts:1093,1112-1114,1124` vs `components.ts:5572-5987`), the
entire `ResponsiveGrid.Item`/`span` API, `Pagination`'s `total`/`pageSize`, and six more. Treat as
one work item, not ten: whatever fixes it must be a **check**, not a sweep, or it returns.

## New components proposed by the audits (all deferred pending the ruling)

`ButtonGroup` (GATE 0 7/7; `Dropdown.Button` then becomes a composition over it) ·
`EditableText` (GATE 0 passes; deliberately not a `Text` prop, so IME-safe commit does not ride
along on every `<Text>`) · `Avatar.Group` (blocked on `Avatar.size`). Rejected outright:
`Watermark`, `Popconfirm`, `CircularProgress`, `Notification`, `Empty`, `Result`, `Spin`, `Rate`,
`ColorSwatchPicker`, `CascaderPanel`, `Input.Search`. `Image` preview and `Tour` pass on merit but
fail C7 (bundle cost) and are deferred with a catalog note forbidding hand-rolled lightboxes.
