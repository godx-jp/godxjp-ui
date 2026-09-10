# Ant Design parity — `layout` · `navigation` · `general`

> Audited 2026-09-10, read-only, against Ant Design 6.x docs. Method and ledger format are
> `docs/roadmap/antd-parity.md` §0/§2 — this file follows them, it does not restate them.
> `Tabs`, `Steps`, `Segmented`, `Tree*`, the Badge family, `List`/`Masonry` and the chat surface are
> **out of scope** here (already specced — see antd-parity.md §3).

---

## 1. Summary

These three groups are the **most Ant-aligned part of the library**, and in several places they are
ahead of it: `AppShell` (three navigation scopes, nav rail, mobile drawer), `MobileShell`,
`AuthShell`, `LegalDocumentShell`, `ErrorSurface`, `AppLauncher` and `AppProvider` have no antd
counterpart at all, and `Breadcrumb`, `Separator`, `Toolbar` and `Pagination` are already carrying
explicit antd-parity work in their prop docs. The "missing features vs Ant Design" complaint does
**not** originate here — most of what antd ships in `Space`, `Divider`, `Grid`, `Anchor`, `Affix`,
`FloatButton` and `App` is genuinely a composition or an existing primitive in this system (§4.2).

What is real, ordered by how badly it hurts:

1. **`Dialog` has no `width` and no way to refuse dismissal.** `DialogContentProps`
   (`src/components/feedback/dialog.tsx:287`) has no size axis, so the catalog's own example teaches
   `className="max-w-lg"` — the utility-geometry `ui-audit` forbids everywhere else — and
   `isDismissable` is hardcoded `true` (`src/components/feedback/dialog.tsx:310`), so a dirty form
   cannot survive an outside click. `Sheet` already has `width?: WidthProp`
   (`src/components/feedback/sheet.tsx:264`); the asymmetry between the two overlays IS the defect.
2. **`Pagination` is controlled-only.** `PaginationProp` (`src/props/components/navigation.prop.ts`)
   has `value` and `onValueChange` but no `defaultValue` / `defaultPageSize`, and `pagination.tsx`
   holds no page state. That breaks `STANDARDS-vocabulary-tokens.md` rule 7 (the full triad), not
   just antd's `defaultCurrent`.
3. **The shell's collapse contract is half-built.** `AppShell` takes `sidebarCollapsed`
   (`src/components/layout/app-shell.tsx:30`) with **no** change handler and **no** built-in trigger,
   so every consumer hand-rolls the toggle *and* its `aria-expanded`/`aria-controls`; and the 900px
   collapse step is a hardcoded media query (`src/styles/shell-layout.css:1119`,
   `@media (width <= 56.25rem)`), not a token — while the overlay family's equivalent step *is* a
   token (`--sheet-responsive-breakpoint-width`). antd's `Sider collapsible`/`trigger`/`breakpoint`/
   `onCollapse`/`onBreakpoint` are all on the far side of that line.
4. **Submenu open state is unreachable.** `Sidebar` keeps group expansion in local state
   (`src/components/layout/sidebar.tsx:271`), route-synchronised but not controllable — so
   "which sections the user left open" cannot be persisted. antd `openKeys`/`onOpenChange`.
5. **Horizontal overflow has no affordance, twice.** `NavigationMenu`
   (`src/components/navigation/navigation-menu.tsx`) is a thin 8-export Radix wrapper with no
   overflow handling — antd `Menu overflowedIndicator`. This is the same defect already logged as
   P1 for `Tabs moreIcon`, and it is a WCAG 1.4.10 / 2.4.3 problem, not a cosmetic one.

Honourable mention, because it is an i18n/a11y gap rather than a parity one: **there is no
`copyable` anywhere in the library** (`grep -rn "copyable" src/` → 0 hits), yet `ErrorSurface`
renders `requestId` in monospace explicitly "so it can be read out or copied accurately"
(`src/props/components/layout.prop.ts:787`) with no copy control.

---

## 2. Ledgers

### 2.1 Fully aligned — no non-`PRESENT` rows

- **`VisuallyHidden`** (`src/components/general/visually-hidden.tsx`) — antd has no counterpart.
- **`AspectRatio`** (`src/components/ui/aspect-ratio.tsx`) — antd has no counterpart; `ratio` +
  `asChild` is the whole capability.
- **`Logo`** (`src/components/general/logo.tsx`) — antd has no counterpart.
- **`ContextMenu`** (`src/components/navigation/context-menu.tsx`) — antd expresses this as
  `Dropdown trigger={['contextMenu']}`; the dedicated primitive here IS the coverage.
- **`Menubar`** (`src/components/navigation/menubar.tsx`) — antd has no counterpart.
- **`Topbar` / `TopbarItem`** (`src/props/components/layout.prop.ts:1212`, `:1236`) — antd's
  `Layout.Header` is a bare box; both are ahead of it.
- **`MobileShell`, `AuthShell`, `CenteredShell`, `LegalDocumentShell`, `MasterDetail`,
  `AppLauncher`, `OrgSwitcher`, `AccountChip`, `AuthDivider`, `AuthFooter`, `AuthIdentity`,
  `AuthAccountSummary`, `AuthStack`, `ServiceRolePanel`, `NavList`** — no antd counterpart
  (antd's nearest is ProLayout, which is not antd core). Nothing to diff.
- **`AppProvider`** vs antd `App` — see 2.16.

### 2.2 `Button` vs antd `Button`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `type` — `primary`/`dashed`/`link`/`text`/`default` | `RENAMED` | `ButtonVariantProp`, `src/props/vocabulary/interaction.prop.ts:17` (`default`/`dashed`/`link`/`ghost`/`bare`/…) | antd `text` = `ghost`; antd `default` = `outline` |
| `danger` — destructive styling | `RENAMED` | same line — `variant="destructive"` | — |
| `shape: round` | `RENAMED` | `ShapeProp`, `interaction.prop.ts:24` — `pill` | — |
| `shape: circle` | `COVERED-ELSEWHERE` | `shape="pill"` + `size="icon"`, `src/components/general/button.tsx:38-51` | Two existing axes; no third |
| `size: large\|middle\|small` | `RENAMED` | `ButtonSizeProp`, `interaction.prop.ts:101` | but see next row |
| `size` includes the alias `"default"` | `MISSING` | `ButtonSizeProp = SizeProp \| "default" \| "icon" …`, `interaction.prop.ts:101`; `button.tsx:34-35` maps `default` and `md` to the same class | Deprecate `"default"` → `md` (STANDARDS rule 10: never `"default"`) |
| `block` — full parent width | `RENAMED` | `fullWidth`, `src/props/components/general.prop.ts` (`ButtonProp.fullWidth`) | — |
| `loading` (boolean) | `PRESENT` | `ButtonProp.loading`, `general.prop.ts`; spinner + `aria-busy` + activation block | — |
| `loading: { delay }` — suppress spinner flash | `MISSING` | no `delay` in `ButtonProp`; `grep -n "delay" src/components/general/button.tsx` → nothing | Add `loadingDelay?: number` |
| `loading: { icon }` | `WONT-PORT` | — | Design knob → `--button-*` token (rule #44) |
| `icon` + `iconPlacement` | `COVERED-ELSEWHERE` | icons are children; DOM order IS the placement (`button.tsx` icon sizing rules) | No work |
| `htmlType` | `PRESENT` | `ButtonProp extends React.ButtonHTMLAttributes` → native `type` | — |
| `href` / `target` | `COVERED-ELSEWHERE` | `asChild` + `<a>`/router `Link`, `ButtonProp.asChild` | Catalog already documents this |
| `ghost` — transparent + inverted on a coloured ground | `WONT-PORT` | — | Per-region role scoping (`COMPOSITION-VS-COMPONENT.md` §4.3), not a prop |
| `autoInsertSpace` — CJK two-char spacing | `WONT-PORT` | — | Typographic knob; belongs to `text-spacing-trim` in the token layer |
| `color` × `variant` matrix (v5.21) | `WONT-PORT` | — | `variant` + `tone` already own this; a third dialect is the defect rule #1 names |
| `classNames` / `styles` semantic DOM | `WONT-PORT` | — | Ground rule §0.4 (inline-style twins) |
| **`Button.Group` / `Space.Compact`** — joined controls | `MISSING` | `grep -rn "ButtonGroup\|SplitButton\|Space.Compact" src/ mcp/src/data/components.ts` → 0 hits; `ToggleGroup` (`src/components/ui/toggle-group.tsx`) joins **toggles** only | Add `ButtonGroup` — GATE-0 ledger in §4.1 |
| `count` / `overflowCount` / `showZero` | `PRESENT` | `general.prop.ts` (`ButtonProp.count`…) | Beyond antd Button (antd needs a wrapping Badge) |

### 2.3 `Text` vs antd `Typography.Text` / `.Paragraph` / `.Link`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `type: secondary\|success\|warning\|danger` | `RENAMED` | `TextToneProp`, `src/props/vocabulary/interaction.prop.ts:40` — `tone` | STANDARDS rule 9 |
| `strong` | `RENAMED` | `TextProp.weight` / `as="strong"`, `src/props/components/general.prop.ts` | — |
| `underline` / `delete` | `RENAMED` | `TextProp.decoration` (`underline` \| `line-through`) | — |
| `code` | `RENAMED` | `TextProp.chip` + `as="code"` | — |
| `keyboard` | `COVERED-ELSEWHERE` | `as="kbd"` — the element union in `general.prop.ts` | — |
| `italic` | `COVERED-ELSEWHERE` | `as="em"` | Semantic emphasis beats a visual flag |
| `disabled` | `COVERED-ELSEWHERE` | `tone="muted"` | — |
| `mark` — highlighted run | `MISSING` | no `mark` in `TextProp`, `general.prop.ts:44-120`; no `<mark>` in the `as` union | Add `as="mark"` to the element union (search-result highlighting) |
| `ellipsis` (boolean) | `PRESENT` | `TextProp.truncate`, `general.prop.ts:69` | — |
| `ellipsis.rows` | `RENAMED` | `TextProp.clamp`, `general.prop.ts:72` | — |
| `ellipsis.expandable` / `expanded` / `defaultExpanded` / `symbol` / `onExpand` | `MISSING` | `grep -rn "expandable" src/props/components/general.prop.ts` → nothing | Add `expandable` + the `expanded`/`defaultExpanded`/`onExpandedChange` triad on `clamp` |
| `ellipsis.tooltip` — tooltip only when truncated | `MISSING` | not in `TextProp` | Add `truncateTooltip?: boolean`; a bare `<Tooltip>` wrap fires even when nothing is clipped |
| `ellipsis.suffix` / `onEllipsis` | `MISSING` | not in `TextProp` | P2, add alongside `expandable` |
| **`copyable`** (+ `text`/`format`/`icon`/`tooltips`/`onCopy`) | `MISSING` | `grep -rn "copyable" src/ mcp/src/data/components.ts` → **0 hits**; nearest is `CredentialReveal.onCopy` (`mcp/src/data/components.ts:4026`), a secret-field component, not a text affordance | Add `copyable` on `Text`/`Heading` (see priority list) |
| `editable` (+ `triggerType`/`maxLength`/`autoSize`/`onChange`/`onCancel`) | `MISSING` | `grep -rn "editable" src/props/components/general.prop.ts` → nothing | GATE-0 ledger §4.1 — inline edit owns real behaviour |
| `actions` operation bar (v6.4) | `WONT-PORT` | — | Composition: `Flex` + `Button` |
| `Typography.Paragraph` | `COVERED-ELSEWHERE` | `Text as="p"` | — |
| `Typography.Link` | `COVERED-ELSEWHERE` | `TextProp.link` (`general.prop.ts`, with the underline/focus-mark contract) | Better than antd — it is an affordance, not a colour |
| `classNames` / `styles` | `WONT-PORT` | — | Ground rule §0.4 |

### 2.4 `Heading` vs antd `Typography.Title`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `level: 1..5` | `MISSING` (partial) | `HeadingLevelProp = 1 \| 2 \| 3 \| 4`, `src/props/vocabulary/interaction.prop.ts` | P2 — either add `5` or document the 4-level canon in the catalog entry as deliberate |
| `type` | `RENAMED` | `HeadingProp.tone` | — |
| `ellipsis` (boolean) | `PRESENT` | `HeadingProp.truncate`, `general.prop.ts` | — |
| `ellipsis.rows` / `.expandable` / `.tooltip` | `MISSING` | no `clamp` on `HeadingProp` | P2 — a wrapped two-line page title is common |
| `copyable` / `editable` | `MISSING` | as 2.3 | Same rows as `Text` |
| `code`/`mark`/`underline`/`delete`/`italic` | `COVERED-ELSEWHERE` | wrap the run in `Text` | Headings do not need six inline flags |

### 2.5 `Flex` vs antd `Flex` + `Space`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `vertical` / `orientation` | `RENAMED` | `FlexProp.direction`, `src/props/components/layout.prop.ts:161` — and it takes a responsive object, which antd's does not | — |
| `justify` / `align` | `PRESENT` | `FlexJustifyProp` / `FlexAlignProp`, `layout.prop.ts:142-143` | Closed unions, deliberately |
| `wrap` (boolean) | `PRESENT` | `layout.prop.ts:216` | — |
| `wrap: "wrap-reverse"` | `MISSING` | boolean only, `layout.prop.ts:216` | P2 — negligible demand |
| `gap` presets + numeric | `PRESENT` | `GapProp` + the `gapRaw` escape hatch, `layout.prop.ts:164`,`:193` | Ahead of antd (the escape is counted via `data-gap-raw`) |
| per-axis gap `[row, column]` | `MISSING` | `gap?: GapProp` is a single step, `layout.prop.ts:164` | P2 — `gap={{row,column}}` |
| `flex` (CSS shorthand) | `COVERED-ELSEWHERE` | `fill` / `grow` / `shrink` / `width`, `layout.prop.ts:162-163`,`:242`,`:252` | Named axes beat a CSS passthrough |
| `component` — render as | `RENAMED` | `FlexProp.as`, `layout.prop.ts:154` (closed union) | Narrower on purpose |
| `Space.separator` / `split` — a rule BETWEEN children | `MISSING` | `grep -n "separator" src/components/layout/flex.tsx` → nothing | **Composition** — interleave `<Separator orientation="vertical" />`; document it in the catalog `related` |
| `Space.Compact` | `MISSING` | see 2.2 | `ButtonGroup`, §4.1 |
| `Space.align: baseline` | `PRESENT` | `FlexAlignProp` includes `baseline`, `layout.prop.ts:142` | — |

### 2.6 `ResponsiveGrid` vs antd `Grid` (`Row` / `Col`)

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `Row.gutter` (number/object) | `RENAMED` | `ResponsiveGridProps.gap`, `src/components/layout/responsive-grid.tsx:16` | — |
| `Row.gutter: [horizontal, vertical]` | `MISSING` | single `gap`, `responsive-grid.tsx:16` | P2 |
| `Row.justify` / `Row.align` | `MISSING` | `grep -n "justify\|align" src/components/layout/responsive-grid.tsx` → nothing | P2 — `align` matters for unequal-height cards |
| `Col.span` + responsive `xs..xxl` | `PRESENT` | `ResponsiveGridItem span`, `responsive-grid.tsx:115-135` (takes `{base,sm,md,lg}`) | **Not in the MCP catalog** — sync gap, see §5 |
| breakpoint steps above `lg` | `MISSING` | `ResponsiveGridColumnsProp = number \| {base,sm,md,lg}`, `src/props/components/layout.prop.ts:256`, while `BreakpointProp` has `xl` (`interaction.prop.ts:140`) | P2 — add `xl` for consistency |
| `Col.order` | `MISSING` | not in `ResponsiveGridItem`, `responsive-grid.tsx:115` | P2 — real for mobile reordering |
| `Col.offset` / `push` / `pull` | `WONT-PORT` | — | 12-column raster arithmetic; this system counts columns, it does not index them |
| `Grid.useBreakpoint()` | `WONT-PORT` | — | Container queries + `--responsive-grid-*` are the model; a JS viewport hook re-introduces the thing they replace |
| `Row.wrap` | `PRESENT` | CSS Grid wraps by definition | — |

### 2.7 `Separator` vs antd `Divider`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `orientation` (axis) | `PRESENT` | `SeparatorProp.orientation`, `src/props/components/layout.prop.ts:573` | — |
| `children` / title | `PRESENT` | `SeparatorProp.label`, `layout.prop.ts:579` | Plus a real `role="separator"` when labelled — ahead of antd |
| `titlePlacement: start\|end\|center` | `RENAMED` | `SeparatorProp.labelAlign`, `layout.prop.ts:581` | — |
| `plain` | `COVERED-ELSEWHERE` | `labelSize` + `tone`, `layout.prop.ts:568`,`:586` | — |
| `size: small\|medium` (spacing) | `RENAMED` | `SeparatorProp.space: GapProp`, `layout.prop.ts:569` | — |
| `variant: solid\|dashed\|dotted` / `dashed` | `MISSING` | `grep -n "dashed\|dotted" src/props/components/layout.prop.ts` → nothing in `SeparatorProp` | **Token** — `--separator-rule-style` (rule #44); not a prop |
| `orientationMargin` | `WONT-PORT` | — | Pixel offset (ground rule §0.4) → `--separator-label-inset`, which already exists |
| `classNames` / `styles` | `WONT-PORT` | — | Ground rule §0.4 |

### 2.8 `AppShell` + `Sidebar` vs antd `Layout` / `Layout.Sider`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `Layout.hasSider` (SSR flicker guard) | `COVERED-ELSEWHERE` | the track is derived from `sidebar` presence at render, `src/components/layout/app-shell.tsx:301` | No work |
| `Sider.collapsed` | `PRESENT` | `AppShellProp.sidebarCollapsed`, `src/props/components/layout.prop.ts:328`; `SidebarProp.collapsed`, `:1164` | — |
| **`Sider.onCollapse`** | `MISSING` | `AppShellProp` (`layout.prop.ts:318-421`) has no `onSidebarCollapsedChange`; `grep -n "onCollapse\|CollapsedChange" src/components/layout/app-shell.tsx` → nothing | Add `onSidebarCollapsedChange` — the `open`/`onOpenChange` triad shape the mobile drawer already uses (`layout.prop.ts:418-420`) |
| **`Sider.collapsible` + `Sider.trigger`** (built-in toggle) | `MISSING` | no toggle in `app-shell.tsx`; `mobileNav` gets one, the docked rail does not | Add a library-owned collapse trigger carrying `aria-expanded` + `aria-controls`. Today every consumer re-authors that ARIA pair |
| `Sider.defaultCollapsed` | `MISSING` | `sidebarCollapsed = false` is a plain default, `app-shell.tsx:30` | P2 — comes free with the triad above |
| **`Sider.breakpoint` + `onBreakpoint`** | `MISSING` | the step is a hardcoded query — `src/styles/shell-layout.css:1119` `@media (width <= 56.25rem)`; `grep -n "900\|breakpoint" src/tokens/components/shell.css` returns only prose | Tokenize as `--app-shell-collapse-breakpoint-width`, mirroring `--sheet-responsive-breakpoint-width` (`src/components/feedback/sheet.tsx:46`) |
| `Sider.width` / `collapsedWidth` | `COVERED-ELSEWHERE` | `--app-shell-sidebar-width` / `--app-shell-nav-rail-width`, documented at `layout.prop.ts:333`,`:349` | Component tokens (rule #44) — no prop |
| `Sider.theme: light\|dark` | `WONT-PORT` | — | Theme is a global token axis (`AppProviderProp.theme`), never a per-component prop |
| `Sider.reverseArrow` / `zeroWidthTriggerStyle` | `WONT-PORT` | — | Physical spelling + inline style (ground rule §0.4) |
| `Header` / `Content` / `Footer` slots | `PRESENT` | `AppShellProp.topbar`/`children`/`footer`, `layout.prop.ts:322`,`:321`,`:327` | Plus `navRail`, `navRailPosition`, `mobileNav` — well ahead |

### 2.9 `Sidebar` / `NavList` vs antd `Menu`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `items` config array | `PRESENT` | `SidebarProp.sections` / `NavListProp.items`, `src/props/components/layout.prop.ts:1146`,`:870` | House `items` dialect |
| `mode="inline"` + submenus | `PRESENT` | `SidebarItemProp.children`, `layout.prop.ts:858` | — |
| `inlineCollapsed` + collapsed tooltips/flyout | `PRESENT` | `src/components/layout/sidebar.tsx:436-531`; flyout entries at `:398-409` | Ahead of antd (real `menuitem` roles) |
| `selectedKeys` / `defaultSelectedKeys` | `RENAMED` | `SidebarProp.activeId`, `layout.prop.ts:1144` | Single-selection route rail |
| **`openKeys` / `defaultOpenKeys` / `onOpenChange`** | `MISSING` | expansion is local state — `src/components/layout/sidebar.tsx:271` `const [open, setOpen] = React.useState(active)` | Add `openIds` / `defaultOpenIds` / `onOpenIdsChange` (house triad spelling for a set) |
| `items[].icon` | `PRESENT` (required) | `SidebarItemProp.icon`, `layout.prop.ts:840` | Stricter than antd, deliberately |
| `items[].extra` | `RENAMED` | `SidebarItemProp.badge`, `layout.prop.ts:845` | — |
| `items[].title` (collapsed tooltip) | `PRESENT` | collapsed-rail tooltip via `SidebarLinkProp["aria-label"]`, `layout.prop.ts:901` | — |
| `items[].danger` | `MISSING` | `SidebarBadgeToneProp` tones the **badge**, not the row (`layout.prop.ts:829`) | P2 — a destructive row is rare in a route rail; add as `tone` on the item if a screen asks |
| `items[].disabled` | `PRESENT` | `layout.prop.ts:851` | — |
| `type: "group"` / `"divider"` | `PRESENT` | `SidebarSectionProp.label`, `layout.prop.ts:945` | — |
| `inlineIndent` | `COVERED-ELSEWHERE` | `--sidebar-nav-*` component tokens | Rule #44 |
| `expandIcon` | `MISSING` | fixed `ChevronDown`, `src/components/layout/sidebar.tsx:284`,`:506` | **Token**, not a prop (rule #44) |
| `multiple` / `selectable={false}` | `WONT-PORT` | — | A route rail has one current page |
| `triggerSubMenuAction` / `subMenuOpenDelay` / `subMenuCloseDelay` | `WONT-PORT` | — | APG disclosure is click; hover-only expansion fails keyboard parity |
| `theme` | `WONT-PORT` | — | Global token axis |
| `overflowedIndicator` (horizontal mode) | `COVERED-ELSEWHERE` | that is `NavigationMenu`'s axis — see 2.10 | — |
| `forceSubMenuRender` | `WONT-PORT` | — | Renders hidden content to the a11y tree for no user-visible gain |

### 2.10 `NavigationMenu` vs antd `Menu mode="horizontal"`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `mode="horizontal"` | `PRESENT` | `orientation`, `mcp/src/data/components.ts:12486` entry | — |
| open state control | `PRESENT` | `value` / `defaultValue` / `onValueChange`, catalog entry | Full triad |
| `subMenuOpenDelay` | `RENAMED` | `delayDuration` (default 200), catalog entry | — |
| `subMenuCloseDelay` | `MISSING` | only `delayDuration` exists | P2 |
| **`overflowedIndicator` — a "more" menu when items do not fit** | `MISSING` | `src/components/navigation/navigation-menu.tsx` is 8 thin Radix re-exports (`Root`/`List`/`Item`/`Trigger`/`Content`/`Link`/`Indicator`/`Viewport`); `grep -n "overflow" ` → nothing | **P1** — same class as the recorded `Tabs moreIcon` P1. Unreachable destinations = WCAG 2.4.3 / 1.4.10 |
| `items[].disabled` | `MISSING` | no `disabled` on `NavigationMenuItem`/`Link` in `navigation-menu.tsx` | P2 |
| `items` config array | `WONT-PORT` | — | Compound-part composition is the house style for overlay menus |
| `theme` / `classNames` / `styles` | `WONT-PORT` | — | Ground rule §0.4 |

### 2.11 `DropdownMenu` vs antd `Dropdown` (+ `Dropdown.Button`)

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `open` / `onOpenChange` | `PRESENT` | `mcp/src/data/components.ts:7588` entry | — |
| `placement` (12 anchors) | `PRESENT` (6, logical) | `DropdownMenuPlacementProp`, `src/props/components/navigation.prop.ts` — `bottomStart`/`topEnd`… | antd's inline-side `left*`/`right*` are a documented `WONT-PORT` (physical in RTL) |
| `arrow` | `PRESENT` | `DropdownMenuContentProps.arrow`, `src/components/navigation/dropdown-menu.tsx:353` | Sized from `--dropdown-arrow-*` |
| `autoAdjustOverflow` | `PRESENT` | RAC popover collision handling, `dropdown-menu.tsx:383-404` | Always on |
| `disabled` | `COVERED-ELSEWHERE` | the trigger's own `disabled` (`DropdownMenuTrigger`, `dropdown-menu.tsx:232`) | — |
| `menu.items` config array | `WONT-PORT` | — | Compound parts; the catalog `usage` block mandates the full tree |
| `trigger: ['contextMenu']` | `COVERED-ELSEWHERE` | `ContextMenu` (`mcp/src/data/components.ts:12384`) | Cross-link exists on both sides |
| `trigger: ['hover']` | `WONT-PORT` | — | An APG menu button opens on click; hover-only is a keyboard/AT trap |
| `destroyOnHidden` / `forceRender` | `PRESENT` | `forceMount` kept for contract shape, `dropdown-menu.tsx:364` | — |
| `getPopupContainer` | `WONT-PORT` | — | Portal escape hatch |
| `popupRender` / `dropdownRender` | `WONT-PORT` | — | Render-prop escape past the a11y contract (ground rule) |
| `menu.items[].danger` | `PRESENT` | `DropdownMenuItem variant="destructive"`, catalog `usage` | — |
| **`Dropdown.Button`** — split primary + menu | `MISSING` | `grep -rn "SplitButton\|Dropdown.Button" src/` → 0 hits | **Composition once `ButtonGroup` exists** (§4.1); do not add a third component |
| `Dropdown.Button.loading` | `MISSING` | as above | Same row |

### 2.12 `Breadcrumb` vs antd `Breadcrumb`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `items` | `PRESENT` | `BreadcrumbProp`, `src/props/vocabulary/navigation.prop.ts:43` | — |
| `items[].title` / `href` | `RENAMED` | `label` / `to`, `navigation.prop.ts:34-37` | — |
| `items[].menu` (sibling dropdown) | `PRESENT` | `BreadcrumbItemMenuProp`, `navigation.prop.ts:26-30`; rendered at `src/components/layout/breadcrumb.tsx:88-120` | Trigger is a real `<button>` — ahead of antd |
| `separator` | `PRESENT` | `BreadcrumbSeparatorProp`, `navigation.prop.ts:47`; `breadcrumb.tsx:45-46` | `""` removes it, always `aria-hidden` |
| `itemRender` | `PRESENT` | `BreadcrumbItemRenderProp`, `navigation.prop.ts:57`; `breadcrumb.tsx:75` | — |
| `params` | `WONT-PORT` | — | Router concern; `itemRender` covers it |
| `dropdownIcon` | `MISSING` | fixed `ChevronDown`, `src/components/layout/breadcrumb.tsx:99` | **Token** (`--breadcrumb-menu-icon-*`), not a prop |
| `type: "separator"` item (per-gap separator) | `MISSING` | one `separator` for the whole trail, `breadcrumb.tsx:45` | P2 — rare |
| `items[].onClick` | `COVERED-ELSEWHERE` | `itemRender` | — |
| `<nav aria-label>` + `<ol>` + `aria-current="page"` | `PRESENT` | `breadcrumb.tsx:49-50`,`:128` | Ahead of antd, which emits a bare `<nav>` |

### 2.13 `Pagination` vs antd `Pagination`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `current` | `RENAMED` | `PaginationProp.value`, `src/props/components/navigation.prop.ts` | — |
| **`defaultCurrent` / `defaultPageSize`** | `MISSING` | `PaginationProp` declares `value`/`total`/`pageSize` but no `defaultValue`/`defaultPageSize`; `grep -n "defaultValue\|useState" src/components/navigation/pagination.tsx` → only `jumperDraft` state (`:156`) | Add `defaultValue` / `defaultPageSize` — **STANDARDS rule 7** requires the whole triad, so this is a vocabulary violation, not only a parity gap |
| `total` / `pageSize` / `pageSizeOptions` | `PRESENT` | `PaginationProp`, navigation.prop.ts | Catalog entry omits `total`/`pageSize` — sync gap, §5 |
| `showSizeChanger` / `showTotal` / `showQuickJumper` | `PRESENT` | `PaginationProp` | `showQuickJumper` even takes `{goButton}` |
| `hideOnSinglePage` / `simple` / `disabled` | `PRESENT` | `PaginationProp` | `hideOnSinglePage` defaults `true` (antd defaults `false`) — documented |
| `size: small\|medium` | `RENAMED` | `PaginationSizeProp = "sm" \| "md"`, navigation.prop.ts | — |
| `align` | `PRESENT` | `PaginationAlignProp` — `start`/`center`/`end`, logical | Ahead of antd (RTL-safe) |
| `responsive` | `PRESENT` | `PaginationProp.responsive` | Documented measurement at 390px |
| `onChange` / `onShowSizeChange` | `RENAMED` | `onValueChange(page, pageSize)` | One callback carries both |
| `itemRender` — render pages as real `<a href>` | `MISSING` | `grep -n "itemRender" src/components/navigation/pagination.tsx` → nothing | P2 — needed for crawlable/middle-clickable list pages |
| `showLessItems` | `MISSING` | not in `PaginationProp` | P2 → token or fold into `responsive` |
| `showTitle` (native `title=`) | `WONT-PORT` | — | `title` is not an accessible affordance; every control already has `aria-label` (`pagination.tsx:253`,`:332`) |
| `components` | `WONT-PORT` | — | Render-prop escape hatch |

### 2.14 `Dialog` vs antd `Modal`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `open` / `onCancel` | `PRESENT` | `open`/`onOpenChange`, `src/components/feedback/dialog.tsx:90-94` | — |
| `title` / `footer` | `PRESENT` | `DialogHeaderProps.title`/`subtitle`/`extra`/`tone`, `dialog.tsx:329-333`; `DialogFooter` part | `extra`/`tone` are ahead of antd |
| **`width`** | `MISSING` | `DialogContentProps` (`dialog.tsx:287-294`) has `showClose`/`overlayClassName`/`forceMount`/`onCloseAutoFocus` and no size axis; the catalog's own example is `<DialogContent className="max-w-lg">` (`mcp/src/data/components.ts`, Dialog `example`) | Add `width?: WidthProp` — copy `SheetContentProps.width` verbatim (`src/components/feedback/sheet.tsx:264`) |
| **`maskClosable` / `keyboard`** — refuse dismissal | `MISSING` | `isDismissable` is passed as a hardcoded literal, `dialog.tsx:310` (`<DialogShell isDismissable …>`); `grep -n "onInteractOutside\|onEscapeKeyDown" src/components/feedback/dialog.tsx` → nothing | Add `dismissible?: boolean` (positive boolean, house rule). Today the only escape is switching to `AlertDialog`, which changes the ARIA role |
| `centered` | `PRESENT` | centred by default | — |
| `loading` (skeleton body) | `MISSING` | not in `DialogContentProps`, `dialog.tsx:287` | P2 |
| `afterClose` | `MISSING` | only `onCloseAutoFocus`, `dialog.tsx:294` | P2 — form reset after the exit animation |
| `destroyOnHidden` / `forceRender` | `PRESENT` | `forceMount`, `dialog.tsx:292` | — |
| `zIndex` / `wrapClassName` / `modalRender` / `styles` | `WONT-PORT` | — | Tokens + ground rule §0.4 |
| `mask: { blur }` | `WONT-PORT` | — | `--dialog-overlay-*` token |
| **`Modal.confirm/info/success/error/warning`** | `WONT-PORT` | — | Imperative API bypassing React state. `AlertDialog` (`mcp/src/data/components.ts:6890`) is the declarative answer — record the refusal in its catalog entry so nobody re-adds it |
| `Modal.useModal()` / `Modal.destroyAll()` | `WONT-PORT` | — | Same reason |

### 2.15 `Sheet` vs antd `Drawer`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `open` / `onClose` | `PRESENT` | `src/components/feedback/sheet.tsx:135` | — |
| `placement` | `RENAMED` (physical, deliberate) | `side`, `sheet.tsx:237-249` — carries an explicit `rtl-ignore: named physical side` and a written rationale | Documented exception to the logical-spelling rule; keep, but the reason belongs in the catalog entry too |
| `width` / `size` | `PRESENT` | `SheetContentProps.width: WidthProp`, `sheet.tsx:264` | Caps at the viewport, `sheet.tsx:327` |
| `height` (top/bottom sheets) | `MISSING` | `widthSet` only applies when `horizontal`, `sheet.tsx:297` | P2 |
| `title` / `extra` / `footer` | `PRESENT` | `SheetHeader title/subtitle/extra/tone` + `SheetFooter`, catalog entry | — |
| `closable` / `closeIcon` | `PRESENT` | `showCloseButton` on `SheetContent` | — |
| `keyboard` (esc) | `PRESENT` | RAC `ModalOverlay`, `sheet.tsx` | — |
| `maskClosable` | `MISSING` | same defect as 2.14 | Same `dismissible` fix, applied to both overlays |
| responsive side→bottom swap | `PRESENT` | `responsive="auto"` + `useSheetResponsiveMode`, `sheet.tsx:75-92` | **No antd equivalent** — ahead |
| `loading` (skeleton) | `MISSING` | not in `SheetContentProps`, `sheet.tsx:255-270` | P2 |
| `afterOpenChange` | `MISSING` | not in `SheetProps`, `sheet.tsx:135` | P2 |
| `resizable` / `maxSize` | `MISSING` | not present | P2 — `ResizablePanel` covers the docked case |
| `push` (nested drawers) | `WONT-PORT` | — | The catalog already forbids nesting a Sheet in a Dialog |
| `getContainer` / `rootStyle` / `styles` | `WONT-PORT` | — | Ground rule §0.4 |

### 2.16 `SplitPane` / `ResizablePanel` vs antd `Splitter`; `AppProvider` vs antd `App`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `Splitter.orientation` | `PRESENT` | `ResizablePanelGroup orientation`, `mcp/src/data/components.ts:12545` entry | `SplitPane` is inline-axis-only by design (it is a static two-column layout, not a splitter) |
| `Panel.defaultSize` / `min` / `max` / `collapsible` | `PRESENT` | catalog entry props `defaultSize`, `minSize`, `maxSize`, `collapsible` | — |
| `onResize` | `PRESENT` | catalog entry | — |
| `onResizeStart` / `onResizeEnd` | `MISSING` | catalog lists only `onResize`; `grep -n "onResizeEnd\|onDragging" src/components/layout/resizable.tsx` → nothing | P2 — needed to persist a layout only on drop |
| `lazy` | `MISSING` | not exposed, `src/components/layout/resizable.tsx:6-17` | P2 |
| `onDraggerDoubleClick` (reset to default) | `MISSING` | not exposed | P2 — a real interaction-feel expectation |
| `draggerIcon` | `WONT-PORT` | — | Token (`--resizable-handle-*`) |
| `destroyOnHidden` | `MISSING` | not exposed | P2 |
| handle a11y (`role="separator"`, arrow-key resize) | `PRESENT` | `ResizablePrimitive.Separator`, `resizable.tsx:57`; plus the library's own scroll-region tab stop, `resizable.tsx:26-38` | Ahead of antd |
| antd `App.message` / `.notification` | `COVERED-ELSEWHERE` | `Toaster` (`mcp/src/data/components.ts:7299`) | — |
| antd `App.useApp().modal` | `WONT-PORT` | — | Imperative; `Dialog`/`AlertDialog` are the declarative answer |
| antd `App`/`ConfigProvider` scope | `PRESENT` and beyond | `AppProviderProp`, `src/props/components/app.prop.ts:27-95` — locale, timezone, date/time format, theme, brand, density, fontSize, scaling, per-axis persistence | No antd counterpart for most of it |

### 2.17 `ErrorSurface` vs antd `Result`

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `status: 403\|404\|500` | `PRESENT` | `ErrorSurfaceStatusProp` (400/403/404/500/503), `src/props/components/layout.prop.ts:763` | Wider than antd |
| `title` / `subTitle` / `extra` / `icon` | `PRESENT` | `layout.prop.ts:765`,`:767`,`:773`,`:778` | `extra` is deliberately a single slot |
| `status: success\|error\|info\|warning` (non-HTTP result page) | `COVERED-ELSEWHERE` | `EmptyState` + `tone` (`data-display`) | Add a `related` cross-link on both sides |
| `requestId` / `permission` / `organization` / `maintenance` | `PRESENT` | `layout.prop.ts:790`,`:795`,`:800`,`:802` | No antd equivalent; ISO-8601 + IANA + `Intl.formatRange` |
| copy control for `requestId` | `MISSING` | the doc comment says it is rendered "so it can be read out or copied accurately" (`layout.prop.ts:787`) but there is no copy affordance anywhere | Falls out of the `Text copyable` row (2.3) |

---

## 3. Priority list — every `MISSING` row

### P0 — breaks a real screen

*(none)*. Every gap below has a workaround; the ones that do not are in the other groups
(`Tree`, count badge, `List`/`Masonry`), already specced.

### P1 — a workaround exists but it is hand-rolled and a11y-risky

| # | Gap | Component | Evidence | Fix |
| --- | --- | --- | --- | --- |
| 1 | **No `width` on `Dialog`** — the catalog itself teaches `className="max-w-lg"`, the utility geometry `ui-audit` blocks everywhere else | `Dialog` | `src/components/feedback/dialog.tsx:287-294`; catalog `example` | `width?: WidthProp`, copied from `src/components/feedback/sheet.tsx:264` |
| 2 | **No way to refuse dismissal** on `Dialog`/`Sheet` — a dirty form dies on an outside click; the only escape changes the ARIA role to `alertdialog` | `Dialog`, `Sheet` | `dialog.tsx:310` (`isDismissable` hardcoded); no `onInteractOutside`/`onEscapeKeyDown` | `dismissible?: boolean` on both content parts |
| 3 | **`Pagination` is controlled-only** — violates STANDARDS rule 7 as well as antd `defaultCurrent` | `Pagination` | `src/props/components/navigation.prop.ts` (`PaginationProp`); `src/components/navigation/pagination.tsx` holds no page state | `defaultValue` + `defaultPageSize` |
| 4 | **No shell collapse handler or trigger** — every consumer re-authors the toggle's `aria-expanded`/`aria-controls` | `AppShell` | `src/components/layout/app-shell.tsx:30`, `:301`; `AppShellProp` `layout.prop.ts:318-421` | `onSidebarCollapsedChange` + a library-owned trigger |
| 5 | **Shell collapse breakpoint is a hardcoded media query**, while the overlay family's equivalent is a token | `AppShell` | `src/styles/shell-layout.css:1119` (`@media (width <= 56.25rem)`) vs `--sheet-responsive-breakpoint-width` (`src/components/feedback/sheet.tsx:46`) | Tokenize as `--app-shell-collapse-breakpoint-width` |
| 6 | **Submenu open state is unreachable** — cannot persist which sections are open | `Sidebar`, `NavList` | `src/components/layout/sidebar.tsx:271` | `openIds` / `defaultOpenIds` / `onOpenIdsChange` |
| 7 | **Horizontal nav has no overflow affordance** — destinations become unreachable (WCAG 2.4.3 / 1.4.10) | `NavigationMenu` | `src/components/navigation/navigation-menu.tsx` (8 thin re-exports, no overflow logic) | An overflow "more" menu, same shape as the recorded `Tabs moreIcon` P1 |
| 8 | **No `copyable` anywhere in the library** — an id rendered explicitly *to be copied* has no copy control | `Text`, `Heading`, `ErrorSurface.requestId` | `grep -rn "copyable" src/` → 0 hits; `src/props/components/layout.prop.ts:787` | `copyable` on `Text`/`Heading` (localized "Copy"/"Copied" via `t()`, `navigator.clipboard`, live-region confirmation) |
| 9 | **Clamped text cannot expand** — `clamp` with no "show more" is a content dead end | `Text` | `src/props/components/general.prop.ts:69-77` — `truncate`/`clamp` only | `expandable` + `expanded`/`defaultExpanded`/`onExpandedChange` |
| 10 | **No joined control group / split button** | `Button` | `grep -rn "ButtonGroup\|SplitButton\|Space.Compact" src/ mcp/` → 0 hits | `ButtonGroup` — GATE-0 ledger §4.1 |

### P2 — nice to have

| Gap | Component | Verdict |
| --- | --- | --- |
| `size: "default"` alias should be `md` | `Button` | Deprecate the alias (STANDARDS rule 10) |
| `loading: { delay }` | `Button` | `loadingDelay?: number` |
| `mark` (highlighted run) | `Text` | Add `"mark"` to the `as` union |
| `ellipsis.tooltip` (only when actually clipped) | `Text` | `truncateTooltip?: boolean` |
| `ellipsis.suffix` / `onEllipsis` | `Text` | with `expandable` |
| `editable` (inline edit) | `Text` | GATE-0 §4.1 — a separate spec, not a `Text` prop |
| `level: 5`; `clamp`/`ellipsis.tooltip` on headings | `Heading` | Add `5` or document the 4-level canon |
| `wrap: "wrap-reverse"`; per-axis `gap` | `Flex` | `gap={{row,column}}` |
| `Space.separator` (rule between children) | `Flex` | **Composition** — interleave `Separator orientation="vertical"`; document it |
| `Row.justify` / `Row.align`; `Col.order`; per-axis gutter; `xl` step | `ResponsiveGrid` | — |
| `variant: dashed\|dotted` | `Separator` | **Token** `--separator-rule-style` |
| `items[].danger`; `expandIcon` | `Sidebar` | `expandIcon` → token |
| `subMenuCloseDelay`; item `disabled` | `NavigationMenu` | — |
| `dropdownIcon`; per-gap `type:"separator"` item | `Breadcrumb` | `dropdownIcon` → token |
| `itemRender`; `showLessItems` | `Pagination` | `itemRender` matters for crawlable list pages |
| `loading` (skeleton); `afterClose` | `Dialog` | — |
| `height` for top/bottom sheets; `loading`; `afterOpenChange`; `resizable` | `Sheet` | — |
| `onResizeStart`/`onResizeEnd`; `lazy`; `onDraggerDoubleClick`; `destroyOnHidden` | `ResizablePanel` | double-click-to-reset is an interaction-feel expectation |
| `Dropdown.Button` (split button) | `DropdownMenu` | **Composition** over `ButtonGroup` once it exists |

---

## 4. GATE 0

### 4.1 Proposed as **new** framework components

Only two things in these three groups survive `docs/COMPOSITION-VS-COMPONENT.md` §2.

#### `ButtonGroup` — joined controls (antd `Button.Group` / `Space.Compact`, and the base of `Dropdown.Button`)

| # | Criterion | Verdict | Reasoning |
| --- | --- | --- | --- |
| C1 | Universal, not design-specific | **PASS** | Segmented actions, split buttons and welded input+button rows appear in every admin app; antd, Radix, Fluent and SLDS all ship one. |
| C2 | Encapsulates reusable BEHAVIOR | **PASS** (borderline) | Little state, but a real contract: an `aria-label`led `role="group"`, and for the split-button shape the primary `<button>` + a separately-named menu-trigger `<button>` pair the APG requires. Comparable to `StatCard`, the documented borderline case. |
| C3 | Not expressible from primitives + tokens | **PASS** | Joining requires zeroing the inner corner radii and collapsing the shared border per child — per-child geometry the app would have to write as `[&>*:not(:first-child)]` utilities, which `ui-audit`'s `no-utility-layout` blocks. This is exactly the `Flex fill` situation recorded at `src/props/components/layout.prop.ts:229-241`. |
| C4 | Single responsibility + controlled vocabulary | **PASS** | One job (weld a row of controls). API: `orientation`, `size` (`xs\|sm\|md\|lg`, forwarded to children), `attached`, `label`. No `value`/selection axis — that is `ToggleGroup`/`Segmented`. |
| C5 | Fully token-themeable | **PASS** | Reads `--button-radius`, `--radius-sharp` and the existing control tokens; nothing new baked. |
| C6 | Earns the international contract | **PASS** | Needs `role="group"` + a required accessible name, and its joining must be **logical** (`border-start-start-radius`), which is precisely what an app hand-rolling it with `rounded-l-none` gets wrong in RTL. |
| C7 | Earns its bundle cost | **PASS** | Small (CSS + a thin wrapper), and it unlocks `Dropdown.Button` and welded `Input + Button` rows without a second component. |

**Verdict: framework component.** Note the boundary explicitly in the catalog: `ToggleGroup` and
`Segmented` stay the *selection* controls; `ButtonGroup` is *actions only*.

#### `EditableText` — inline edit (antd `Typography editable`)

| # | Criterion | Verdict | Reasoning |
| --- | --- | --- | --- |
| C1 | Universal | **PASS** | Rename-in-place on a title, a list row, a board card. |
| C2 | Reusable behaviour | **PASS** | Display↔edit swap, Enter commits / Escape cancels / blur commits, focus return to the trigger, `aria-live` confirmation, `maxLength`, autosize. Every one of these is got wrong by a hand-rolled version. |
| C3 | Not composable today | **PASS** | `Text` + `Input` + local state reproduces the look and none of the focus/keyboard contract. |
| C4 | Single responsibility + vocabulary | **PASS** | `value`/`defaultValue`/`onValueChange` + `editing`/`defaultEditing`/`onEditingChange`. |
| C5 | Token-themeable | **PASS** | Reuses `--input-*` and the type scale. |
| C6 | International contract | **PASS** | Needs a localized edit/save/cancel accessible name set and IME-safe commit (a JA/VI composition Enter must not commit). That IME rule alone is why this must not be per-app. |
| C7 | Bundle cost | **PASS** (weaker) | Narrower reach than `ButtonGroup`. |

**Verdict: framework component, but P2** — write it as its own spec, not as a `Text` prop. Attaching
an editing lifecycle to the typographic primitive would make every `<Text>` in the bundle carry it.

### 4.2 These antd components are **compositions** here, not gaps

| antd | Why it is not a gap | Build it with |
| --- | --- | --- |
| `Space` | `gap` already lives on the layout primitive, with a counted escape hatch (`data-gap-raw`). C3 fails outright. | `Flex gap` / `ResponsiveGrid gap` |
| `Divider` | Exists. | `Separator` (`src/props/components/layout.prop.ts:567`) |
| `Grid` / `Row` / `Col` | Exists, in the house `{base,sm,md,lg}` count model rather than a 12-column raster. | `ResponsiveGrid` + `ResponsiveGrid.Item span` (`src/components/layout/responsive-grid.tsx:115`) |
| `Affix` | C1/C2/C3 all fail — it is `position: sticky` with a JS shim, and antd's own docs now recommend the CSS property. Sticky chrome is already a first-class slot here. | `PageContainer toolbar` (`layout.prop.ts:82-88`), `PageContainer stickyFooter`, `Toolbar sticky`, `DataTable sticky` |
| `Anchor` | C1/C7 fail — the one real use (a long document with a contents rail) is already owned end-to-end, including scroll-spy, hash deep-linking, focus handoff and `aria-current="location"`. A second general Anchor would duplicate it. | `LegalDocumentShell` (`layout.prop.ts:1279-1331`) |
| `FloatButton` / `BackTop` | C1/C2 fail — layout + content + colour, positioned by the screen that wants it. `BackTop` additionally competes with the shell's own scroll ownership (`MobileShell` is deliberately the only scroll container, `layout.prop.ts:504-507`). | `Button shape="pill" size="icon-lg"` placed by the page; a token for the inset if one is missing |
| `Layout.Header` / `Content` / `Footer` | Bare boxes in antd; real slots here. | `AppShell topbar` / `children` / `footer`, `Topbar`, `PageContainer` |
| `App` (static-method context) | The context problem it solves does not exist here — nothing is imperative. | `AppProvider` + `Toaster` + declarative `Dialog`/`AlertDialog` |
| `PageHeader` (removed from antd core) | Exists, and is wider. | `PageContainer` (`layout.prop.ts:64-139`) |
| `Result` | Exists for HTTP statuses; the non-HTTP shapes are an empty state with an action. | `ErrorSurface` / `EmptyState` |
| `Menu` `items` config array as the only API | Both dialects exist already: config-array for the route rails, compound parts for the overlay menus. | `Sidebar.sections` / `NavList.items` · `DropdownMenu*` / `Menubar*` / `NavigationMenu*` |
| `Dropdown.Button` | Two existing primitives plus the proposed `ButtonGroup`. | `ButtonGroup` + `Button` + `DropdownMenu` |

---

## 5. Side findings — MCP catalog drift (not parity, but found while measuring)

`pnpm check:mcp-sync` passes on shape, so these are documented-surface omissions rather than
build failures. Each is a prop that exists in `src/` and is invisible to a consumer asking the MCP:

| Component | Props present in `src/` but absent from `mcp/src/data/components.ts` |
| --- | --- |
| `ResponsiveGrid` | `pad`, `preset`, and the whole `ResponsiveGrid.Item` / `span` API (`src/components/layout/responsive-grid.tsx:115`) |
| `Pagination` | `total`, `pageSize` (`src/props/components/navigation.prop.ts`) |
| `Flex` | `grow`, `shrink`, `bleed` (`src/props/components/layout.prop.ts:158`,`:162-163`) |
| `Separator` | `space`, `hideBelow`, `hideFrom` (`layout.prop.ts:569-571`) |
| `AppLauncher` | `error`, `onRetry`, `open` (`layout.prop.ts:1112-1136`) |
| `OrgSwitcher` | `value`, `error`, `onRetry`, `open` (`layout.prop.ts:985-1015`) |
| `AppShell` | `navRailLabel` is listed but the `sidebarCollapsed` change handler gap (P1 #4) means the entry documents a half-contract |
| `Button` | `size` type in the catalog omits `md`, which `src/components/general/button.tsx:33` supports |
| `ResizablePanel` | `onCollapse` / `onExpand` (react-resizable-panels surface) |

These should be folded into whichever fix wave touches each component, per the
`godxjp-ui-mcp-catalog-sync` contract — not as a separate pass.
