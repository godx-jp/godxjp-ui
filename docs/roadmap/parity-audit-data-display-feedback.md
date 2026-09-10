# Ant Design parity audit — `data-display` + `feedback`

> Method and ground rules: `docs/roadmap/antd-parity.md` §0/§2. This is a **read-only audit pass**
> (§4.5): no source, token, test, i18n or catalog file was touched. Ant Design reference = **v5**
> (`5.x-stable` `components/<slug>/index.en-US.md`); `ant.design/components/*` now serves v6, and v6
> deltas are cited only where they change the *right* answer for this library (v6 moved `fixed`,
> `gapPosition`, `dotPosition`, `expandIconPosition`, `Timeline.mode` and `Drawer.closable.placement`
> to logical `start`/`end` — the spelling this repo already uses).
>
> Audited: **2026-09-10**. Out of scope by instruction (already specced or being built concurrently):
> `Badge` / `CountBadge` / `Tree` / `TreeList`, `ChatBubble` / `ChatBubbleList`, `List` / `Masonry`,
> `Tabs`, `Steps`, `Segmented`.

---

## 1. Summary

These two groups are **far more Ant-aligned than the "missing features" complaint implies — but the
alignment is extremely uneven.** `DataTable` is the strongest component in the library and already
carries a deliberate, documented antd parity surface (`rowSelection`, `expandable`, `summary`,
`scroll`, `sticky`, `onRow`, `bordered`, `sortDirections`, per-column `fixed`/`ellipsis`/`sorter`/
`filters`/`filteredValue`, plus pagination in three accepted shapes — `src/props/vocabulary/data.prop.ts:16-134`).
`Descriptions` matches antd's `column`/`span`/`layout`/`labelAlign`/`bordered`/`items` including the
responsive object and `span="filled"`. `ErrorSurface` **exceeds** antd's `Result` (request-id,
missing-permission, tenant, maintenance window, shell-mode contract). `Rating` already mirrors `Rate`
(`count`/`allowHalf`/`character`/`tooltips`/`readOnly`). Nothing here needs a rewrite.

The weakness is concentrated in the **small display primitives and the whole toast surface**, and the
five gaps that actually matter are not cosmetic:

1. **`Timeline` ships hardcoded English screen-reader text** (`"Completed: "` / `"Current: "` /
   `"Upcoming: "`, `src/components/data-display/timeline.tsx:31-35`, with a comment calling it
   "localize-agnostic English"). There are **zero `timeline` keys in `src/i18n/messages/en.json`**.
   A Japanese product announces English status words. This is the single worst finding in the audit.
2. **`Toaster` is not a design-system component at all.** The catalog itself tells consumers to
   `import { toast } from "sonner"` (`mcp/src/data/components.ts:7302`), so the entire imperative
   feedback API — the most-used feedback surface in any admin app — sits outside the house
   vocabulary, outside `t()`, and outside the token contract. `position` is sonner's physical
   `"bottom-right"` (`src/components/feedback/sonner.tsx:118`) and never flips under RTL.
3. **`Avatar` has no `size`.** `AvatarProp` exposes only `shape`/`appearance`/`presence`
   (`src/props/components/data-display.prop.ts:172-199`), and the token file *admits* the workaround:
   "a `size-12` call site" (`src/tokens/components/data-display.css:89`). Every consumer hand-writes
   a Tailwind size class — the exact thing cardinal rule #22 / `check:control-sizing` exists to stop.
   There is also **no `Avatar.Group`** (grep for `AvatarGroup|Avatar.Group` across `src/` + the MCP
   catalog: 0 hits), so every assignee stack is hand-rolled.
4. **`StatCard` does no number formatting and parses its own delta sign with a regex.** `value` is a
   bare `ReactNode` and `getDeltaTone` matches `/^[+\-−]/` on a stringified delta
   (`src/components/data-display/card.tsx:233-246`). antd's `Statistic` owns `precision`,
   `groupSeparator`, `decimalSeparator`, `prefix`/`suffix` and `formatter`. Here every KPI tile
   formats its own numbers, which is how a dashboard ends up with `1,234` next to `1 234`.
5. **`Accordion` hardcodes `<h3>`** (`src/components/ui/accordion.tsx:314`) and offers no `extra`
   slot outside the trigger button. A settings accordion whose header carries a `Switch` cannot be
   built without nesting a control inside a `<button>` — invalid HTML and a real keyboard trap.

Everything else is either genuinely `PRESENT`, correctly `COVERED-ELSEWHERE` (antd `Spin` →
`Activity` + `Skeleton` + `DataState`; antd `Empty` → `EmptyState`; antd `Popconfirm` → `AlertDialog`
or `Popover` + `Button`s; antd `Result` → `ErrorSurface`), or a deliberate `WONT-PORT`
(`classNames`/`styles` semantic-DOM maps, `getPopupContainer`, `components`, `filterDropdown`,
`renderCell`, `valueStyle`, `strokeColor` gradients, `imageStyle`).

---

## 2. Ledgers

### 2.1 `DataTable` vs antd `Table`

Sources: `src/props/components/data-display.prop.ts:337-375`, `src/props/vocabulary/data.prop.ts:16-134`,
`src/components/data-display/data-table.tsx`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `dataSource` — rows | `RENAMED` | `data` — `data-display.prop.ts:338` | — |
| `columns` | `PRESENT` | `data-display.prop.ts:339` | — |
| `rowKey` | `RENAMED` | `getRowId` — `data-display.prop.ts:340`, `vocabulary/data.prop.ts` `GetRowIdProp` | — |
| `rowSelection` (`type`, `selectedRowKeys`, `onChange`, `getCheckboxProps`, `preserveSelectedRowKeys`, `selections`, `hideSelectAll`, `columnTitle`) | `PRESENT` | `vocabulary/data.prop.ts:58-71`; `data-table.tsx:545` | — |
| `rowSelection.renderCell` | `WONT-PORT` | not in `TableRowSelectionProp` (`vocabulary/data.prop.ts:58-71`) | Render-prop over the checkbox cell bypasses the a11y contract. |
| `rowSelection.align` / `fixed` / `columnWidth` | `MISSING` | grep `align`/`columnWidth` in `TableRowSelectionProp`: absent | P2 — add `columnWidth`; alignment is a token. |
| `expandable` (`expandedRowRender`, `rowExpandable`, `defaultExpandAllRows`, `expandedRowKeys`, `onExpandedRowsChange`, `expandRowByClick`, `columnTitle`) | `PRESENT` | `vocabulary/data.prop.ts:75-86` | — |
| `expandable.childrenColumnName` — **tree/nested rows** | `MISSING` | `grep -n childrenColumnName src/components/data-display/data-table.tsx src/props/vocabulary/data.prop.ts` → 0 hits | **P1** — add `childrenColumnName` + `indentSize`; nested rows are otherwise impossible. `TableCellIndentProp` already exists (`vocabulary/data.prop.ts`) and is the intended measure. |
| `expandable.expandIcon` / `showExpandColumn` / `columnWidth` | `MISSING` | grep `expandIcon` → 0 hits in `data-table.tsx` | P2 — `showExpandColumn` only; the icon is a token. |
| `summary` (+ `Table.Summary.Cell colSpan/rowSpan`) | `PRESENT` | `vocabulary/data.prop.ts:89`; real `<tfoot>` per `data-display.prop.ts:366` | — |
| `scroll: { x, y }` | `PRESENT` | `vocabulary/data.prop.ts:97` | — |
| `scroll.scrollToFirstRowOnChange` | `MISSING` | `TableScrollProp` has `x`/`y` only | P2 |
| `sticky` (+ `offsetHeader`) | `PRESENT` | `vocabulary/data.prop.ts:103` | — |
| `sticky.offsetScroll` / `getContainer` | `MISSING` | `TableStickyProp` = `boolean \| { offsetHeader }` | P2 |
| `onRow` | `PRESENT` | `vocabulary/data.prop.ts:110`; `data-table.tsx:358` | — |
| `onHeaderRow` | `MISSING` | grep `onHeaderRow` → 0 hits | P2 |
| `column.onCell` / `onHeaderCell` — per-cell props, `colSpan`/`rowSpan` merges | `MISSING` | grep `onCell` / `rowSpan` in `data-table.tsx` → 0 hits | **P1** — merged cells are unreachable from `DataTable`; today the escape is dropping to the raw `Table` primitive, which loses sort/filter/selection. Add `onCell` returning `{ colSpan, rowSpan }` only (not arbitrary DOM). |
| `bordered` | `PRESENT` | `data-display.prop.ts:368` | — |
| `sortDirections` (table + column) | `PRESENT` | `data-display.prop.ts:372`, `vocabulary/data.prop.ts` `sortDirections` | Values are `asc`/`desc`, not antd's `ascend`/`descend` — correct per §0.1. |
| `showSorterTooltip` | `PRESENT` | `data-display.prop.ts:370` | — |
| `column.sorter` incl. `{ compare, multiple }` multi-sort | `PRESENT` | `data-table.tsx:196-212` | — |
| `column.filters` / `filteredValue` / `defaultFilteredValue` / `filterMultiple` / `onFilter` | `PRESENT` | `vocabulary/data.prop.ts` `ColumnDefProp` | — |
| `column.filterSearch` / `filterMode: 'tree'` / `filterResetToDefaultFilteredValue` | `MISSING` | grep `filterSearch` → 0 hits | P2 — `filterSearch` is real for a 40-value status filter. |
| `column.filterDropdown` / `filterIcon` / `sortIcon` | `WONT-PORT` | absent from `ColumnDefProp` | Render-prop escape hatches over the filter menu's ARIA. |
| `column.fixed: 'left'\|'right'` | `RENAMED` | `fixed?: ColumnFixedProp` = `"start" \| "end"` — `vocabulary/data.prop.ts:15` | Logical, matching antd v6. |
| `column.ellipsis` | `PRESENT` | `ColumnDefProp.ellipsis` | — |
| `column.width` / `minWidth` | `PRESENT` (`width`) / `MISSING` (`minWidth`) | `ColumnDefProp.width`; grep `minWidth` → 0 hits | P2 |
| `column.hidden` | `RENAMED` | `enableHiding` + `hiddenOnMobile` + `priority` — `ColumnDefProp` | Richer than antd's boolean. |
| `column.responsive: Breakpoint[]` | `COVERED-ELSEWHERE` | `priority` + `preset="action-collection"` + `collapseBelow` — `data-display.prop.ts:355-361` | Cross-link `preset` ↔ `responsive` in the catalog. |
| `column.rowScope` | `MISSING` | grep `rowScope` → 0 hits | **P1 (a11y)** — a row-header column (`scope="row"`) is how a screen reader names each cell. Add `rowHeader?: boolean` on `ColumnDefProp`. |
| `column.shouldCellUpdate` | `WONT-PORT` | absent | A memoization escape hatch; `React.memo` in `render` is the consumer's tool. |
| `column.colSpan` (header grouping) / `ColumnGroup` | `MISSING` | grep `ColumnGroup` → 0 hits | P2 — grouped header rows. |
| `pagination` (object / `false` / controlled) | `PRESENT` | `data-table.tsx:406-412, 565-620`; `TablePaginationProp` — `vocabulary/data.prop.ts:124-133` | — |
| `pagination.position` | `MISSING` | `TablePaginationProp` has no `position` | P2 — if added, use logical `bottomEnd` (antd v6 spelling), never `bottomRight`. |
| `loading` | `PRESENT` | `data-display.prop.ts:346`; renders `SkeletonTable` | Better than antd's `Spin` overlay. |
| `locale` (empty text, filter labels) | `COVERED-ELSEWHERE` | `empty` / `error` / `denied` props + `useTranslation` | — |
| `title` / `footer` renderers | `COVERED-ELSEWHERE` | `Card` + `CardHeader` / `CardFooter` / `CardBar` — `card.tsx:78, 151, 181` | Cross-link both sides. |
| `showHeader` | `MISSING` | grep `showHeader` → 0 hits | P2 |
| `tableLayout` | `MISSING` | grep `tableLayout` → 0 hits | P2 — antd forces `fixed` when `ellipsis`/`fixed` is used; this library should decide it internally, not expose it. |
| `size: large\|middle\|small` | `RENAMED` | `density?: TableDensityProp` (`compact \| comfortable`) — `data-display.prop.ts:344` | — |
| `virtual` | `MISSING` | grep `virtual` in `data-table.tsx` → 0 hits | **P1** — a 5 000-row grid has no answer today. Same gap `list-masonry.md` records for `List`; solve once. |
| `ref.scrollTo({ index, key, top })` | `MISSING` | no `scrollTo` on the DataTable ref | P2 — pairs with `virtual`. |
| `rowClassName` | `PRESENT` | `data-table.tsx:353, 461` | — |
| `rowHoverable` | `PRESENT` | `data-table.tsx:445` (`Highlight a row on hover even when it is not clickable`) | — |
| `components` / `getPopupContainer` | `WONT-PORT` | absent | Element-substitution + portal-container escape hatches. |
| `onChange(pagination, filters, sorter, extra)` | `RENAMED` | split into `onSortChange` / `onFilterChange` / `onPaginationChange` / `onSelectChange` | Event-specific names per STANDARDS #12. |

### 2.2 `Table` (the primitive) vs antd `Table`

`src/components/data-display/table.tsx:13-63`. `Table` is **not** antd's `Table` — it is the styled
`<table>`/`<thead>`/`<tr>` set that `DataTable` and hand-composed grids build on
(`namethatui.com` classifies this shape as "table primitive", not "data grid").

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| everything data-grid (sort/filter/select/paginate) | `COVERED-ELSEWHERE` | `DataTable` — `data-table.tsx` | Catalog already says so. |
| `bordered` | `PRESENT` | `table.tsx:25` | — |
| horizontal scroll region, keyboard reachable | `PRESENT` | `table.tsx:19, 84-103` (`tabIndex={0}`, WCAG 2.1.1) | Ahead of antd. |
| `caption` | `MISSING` | grep `caption` → only `caption-bottom` utility (`table.tsx:109`) | P2 — a `<caption>` is the cheapest accessible name for a hand-composed table. |

### 2.3 `Descriptions` vs antd `Descriptions`

`src/components/data-display/descriptions.tsx:48-224`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `column` (number **and** responsive object) | `RENAMED` | `columns?: DescriptionsColumnProp` — `descriptions.tsx:54`, `vocabulary/data.prop.ts:141` | — |
| `layout: horizontal\|vertical` | `PRESENT` | `descriptions.tsx:56` | Default is `vertical` here vs antd's `horizontal` — deliberate. |
| `labelAlign` | `PRESENT` | `descriptions.tsx:61`, guarded to horizontal at `:173` | Logical `start`/`end`, not antd's `left`/`right`. Correct. |
| `bordered` | `PRESENT` | `descriptions.tsx:66` | — |
| `items` | `PRESENT` | `descriptions.tsx:71, 125-135` | — |
| `Item.span` incl. `"filled"` + responsive | `PRESENT` | `descriptions.tsx:151, 164-170` | — |
| `Item.key` | `PRESENT` | `DescriptionsItemsProp.key` — `vocabulary/data.prop.ts:151` | — |
| `title` / `extra` (block header) | `COVERED-ELSEWHERE` | `CardHeader` + `CardTitle` + `CardAction` — `card.tsx:78, 102, 307` | Add the `related` cross-link both ways. |
| `size: default\|middle\|small` | `MISSING` | grep `size` in `descriptions.tsx` → 0 hits | P2 — add `size ∈ sm\|md\|lg` (never `"default"`/`"middle"`). |
| `colon` | `WONT-PORT` | absent | A CJK/Latin punctuation decision belongs in the token/CSS layer, not a prop. |
| `labelStyle` / `contentStyle` / `classNames` / `styles` | `WONT-PORT` | absent | §0.4 — inline-style twins. `--descriptions-*` tokens already cover it (`descriptions.tsx:120, 190`). |

### 2.4 `StatCard` vs antd `Statistic` (+ `Statistic.Timer`)

`src/components/data-display/card.tsx:210-304`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `title` | `RENAMED` | `label` — `card.tsx:211` | — |
| `value` | `PRESENT` | `card.tsx:212` (`React.ReactNode`) | — |
| `precision` | `MISSING` | no formatting anywhere in `card.tsx:249-304` | **P1** — every KPI tile formats its own number. |
| `groupSeparator` / `decimalSeparator` | `MISSING` | ditto | **P1** — but do **not** port antd's spelling: the correct fix is `numberFormat?: Intl.NumberFormatOptions`, the vocabulary `CompactBarTrend` already uses (`charts.prop.ts:106`) and the only one that is CLDR-correct. |
| `formatter` | `COVERED-ELSEWHERE` | `value: ReactNode` accepts a pre-formatted node | — |
| `prefix` / `suffix` | `MISSING` | `card.tsx:210-231` has `icon`/`delta`/`hint` only | P2 — a `¥`/`%`/`件` affix currently has to be baked into `value`, which breaks `tabular-nums` alignment across a KPI row. |
| `loading` | `COVERED-ELSEWHERE` | `SkeletonStat` — `src/components/feedback/skeleton.tsx:92-99` | Cross-link. |
| `valueStyle` | `WONT-PORT` | absent | §0.4 — `--stat-card-*` tokens. |
| `Statistic.Timer` (`type: countdown\|countup`, `format`, `onFinish`, `onChange`) | `MISSING` | `grep -rn "Countdown\|Statistic.Timer" src/` → 0 hits | P2 — real for maintenance windows and OTP expiry; `ErrorSurface.maintenance` already formats a window with `Intl` (`layout.prop.ts:801`), so the arithmetic exists. If added, format with `Intl.RelativeTimeFormat`/`Intl.DurationFormat`, never a `dayjs` `"HH:mm:ss"` template. |
| delta sign → tone | `PRESENT` **but defective** | `getDeltaTone` regex `/^[+\-−]/` on a stringified node — `card.tsx:233-246` | **P1 (i18n)** — a delta formatted with `Intl.NumberFormat(locale, { signDisplay: "always" })` in `ar`/`fa` (Arabic-Indic digits, RTL sign placement) or any locale using U+2212 vs U+002D inconsistently is silently untoned. A `delta: number` + `numberFormat` pair removes the parse entirely. |

### 2.5 `Card` / `CardBar` / `CardContent` vs antd `Card`

`src/components/data-display/card.tsx:34-312`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `title` / `extra` | `COVERED-ELSEWHERE` | `CardHeader` + `CardTitle` (+ `level`/`as`) + `CardAction` — `card.tsx:78, 91-110, 307` | Composition beats antd's flat props; `CardTitle.level` is *ahead* of antd (which emits no heading at all). |
| `cover` | `PRESENT` | `CardCover` — `card.tsx:66` | — |
| `actions` (equal-width bottom bar) | `COVERED-ELSEWHERE` | `CardFooter separated`/`flush` — `card.tsx:144-163` | — |
| `bordered` → v5.24 `variant: outlined\|borderless` | `PRESENT` | `variant: "default" \| "muted" \| "outline" \| "featured"` — `card.tsx:21, 41` | Superset. |
| `hoverable` | `MISSING` | grep `hoverable` in `card.tsx` → 0 hits | P2 — but check first whether `ServiceLauncherCard` (`service-launcher-card.tsx`) already owns the interactive-card case; if so this is `COVERED-ELSEWHERE`. |
| `loading` | `COVERED-ELSEWHERE` | `SkeletonDetail` / `SkeletonStat` — `skeleton.tsx:74, 92` | — |
| `size: default\|small` | `RENAMED` | `density: "tight" \| "cozy"` — `card.tsx:23, 42`; the file explicitly records that a `size` prop was removed 2026-08-24 (`card.tsx:29-32`) | Deliberate; do not re-add. |
| `type="inner"` | `COVERED-ELSEWHERE` | `variant="muted"` | — |
| `tabList` / `activeTabKey` / `onTabChange` / `tabBarExtraContent` | `COVERED-ELSEWHERE` | `CardBar` + `Tabs`; `CardBar.extra` is documented as the `tabBarExtraContent` equivalent — `card.tsx:171` | — |
| `Card.Grid` | `COVERED-ELSEWHERE` | `ResponsiveGrid` (layout group) | Cross-link. |
| `Card.Meta` (`avatar`/`title`/`description`) | `COVERED-ELSEWHERE` | `ListRow` (`leading`/`title`/`description`/`trailing`) — `list-row.tsx:22-58` | Cross-link both sides. |
| `classNames` / `styles` / `bodyStyle` / `headStyle` | `WONT-PORT` | absent | §0.4 — `--card-*` tokens. |
| `accent` + `accentPlacement` | *beyond antd* | `card.tsx:9-19, 35-40` | — |

### 2.6 `Avatar` vs antd `Avatar` + `Avatar.Group`

`src/props/components/data-display.prop.ts:172-199`, `src/components/ui/avatar.tsx`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `src` / `srcSet` / `crossOrigin` / image-load fallback | `PRESENT` | `AvatarImage` + `useImageLoadingStatus` — `ui/avatar.tsx:50-95` | Ahead of antd: a broken `<img>` is never mounted (`ui/avatar.tsx:19-23`). |
| `alt` | `PRESENT` | `AvatarImage` spreads `<img>` props | — |
| `icon` / `children` fallback | `PRESENT` | `AvatarFallback` | — |
| `shape: circle\|square` | `PRESENT` | `AvatarProp.shape` — `data-display.prop.ts:173` | — |
| **`size`** | `MISSING` | `AvatarProp` (`data-display.prop.ts:172-199`) has no `size`; `src/tokens/components/data-display.css:89` names "a `size-12` call site" as an existing pattern | **P1** — add `size ∈ xs\|sm\|md\|lg` resolving from `--control-height` (STANDARDS #22). Every consumer currently hand-writes a Tailwind size utility, which is precisely what `check:control-sizing` forbids inside the package and cannot detect outside it. |
| `gap` (initials inset) | `WONT-PORT` | absent | A pixel knob; `--avatar-*` tokens own it. |
| `onError` returning `false` | `MISSING` | no `onError` hook on the status machine | P2 |
| **`Avatar.Group`** (`max.count`, `max.popover`, shared `size`/`shape`) | `MISSING` | `grep -rn "AvatarGroup\|Avatar.Group" src/ mcp/src/data/components.ts` → 0 hits | **P1** — assignee/attendee stacks are hand-rolled today (overlap offset, the `+N` tile, and the accessible name for "3 more" all re-derived per screen). See GATE-0 §4.1. |
| `presence` (4-state, shape-encoded, `sr-only` label) | *beyond antd* | `data-display.prop.ts:200-216` | — |
| `appearance: tinted` (capability medallion) | *beyond antd* | `data-display.prop.ts:218-238` | — |

### 2.7 `Timeline` vs antd `Timeline`

`src/components/data-display/timeline.tsx`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `items` | `PRESENT` | `timeline.tsx:21-28` | — |
| `item.children` (content) | `RENAMED` | `title` + `location` + `time` + `note` — `timeline.tsx:8-19` | Richer, but see `mode` below. |
| `item.dot` / `icon` | `PRESENT` | `item.icon?: LucideIcon` — `timeline.tsx:18` | — |
| `item.label` | `RENAMED` | `time` — `timeline.tsx:11` | — |
| `item.color` (`blue\|red\|green\|gray` or custom) | `MISSING` | only `status: done\|current\|pending` — `timeline.tsx:4, 16` | P2 — add `tone?: ToneProp` (never antd's colour names), plus the `color?: string` data-colour wash `Badge`/`TimelineGrid` already define (`data-display.prop.ts` `BadgeProp.color`). |
| `mode: left\|alternate\|right` (v6: `start\|alternate\|end`) | `MISSING` | single layout; grep `mode`/`alternate` → 0 hits | P2 — add `placement?: "start" \| "end" \| "alternate"`, logical. |
| `item.position` | `MISSING` | ditto | P2 — pairs with `placement`. |
| `pending` / `pendingDot` (trailing ghost node) | `MISSING` | `status: "pending"` is a *per-item* state, not antd's trailing loader — `timeline.tsx:37-46` | P2 — the name collision is a documentation hazard; record it in the catalog. |
| `reverse` | `MISSING` | grep `reverse` → 0 hits | P2 |
| **screen-reader status prefix** | `MISSING`/**defective** | `SR_PREFIX = { done: "Completed: ", current: "Current: ", pending: "Upcoming: " }` — `timeline.tsx:31-35`, injected at `:107`; `grep -n timeline src/i18n/messages/en.json` → **0 hits** | **P0 (i18n/a11y)** — hardcoded English SR text in a ja/vi product, with a source comment declaring it intentional. Move to `t("dataDisplay.timeline.status.*")` across `en`/`ja`/`vi`. |
| stable item identity | `MISSING` | `key={index}` — `timeline.tsx:84` | P2 — add `id` to `TimelineItem`; index keys break on reorder/prepend. |
| `orientation: horizontal` (v6) | `MISSING` | — | P2 — `TimelineGrid` covers the 2-D case; a horizontal single-axis timeline does not exist. |

### 2.8 `Accordion` / `Collapsible` vs antd `Collapse`

`src/components/ui/accordion.tsx`, `src/components/data-display/collapsible.tsx`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `accordion` (one panel open) | `RENAMED` | `type: "single" \| "multiple"` + `collapsible` — `ui/accordion.tsx:92-116` | — |
| `activeKey` / `defaultActiveKey` / `onChange` | `RENAMED` | `value` / `defaultValue` / `onValueChange` — `ui/accordion.tsx:95-113` | Correct controlled triad. |
| `destroyInactivePanel` → v5.25 `destroyOnHidden` | `PRESENT` (inverted) | children unmount by default; `forceMount` opts out — `ui/accordion.tsx:346-349, 382` | — |
| arrow-key roving, `Home`/`End`, wrap, skip-disabled | `PRESENT` | `moveFocus` — `ui/accordion.tsx:169-200` | Ahead of antd (rc-collapse has none). |
| `bordered` / `ghost` | `COVERED-ELSEWHERE` | `.ui-accordion-*` + tokens | — |
| `size: large\|middle\|small` | `MISSING` | grep `size` in `ui/accordion.tsx` → 0 hits | P2 — `size ∈ sm\|md\|lg`. |
| `expandIconPosition` (v6 `expandIconPlacement: start\|end`) | `MISSING` | chevron is appended unconditionally — `ui/accordion.tsx:340` | P2 — a token (`--accordion-chevron-*`) per cardinal rule #44, not a prop. |
| `item.showArrow: false` | `MISSING` | ditto | P2 |
| **`item.extra`** (corner slot outside the trigger) | `MISSING` | `AccordionTrigger` renders `children` + chevron inside one `<button>` — `ui/accordion.tsx:320-341` | **P1 (a11y)** — a header carrying a `Switch`/`Button`/`Badge` action cannot be expressed without nesting an interactive element inside a `<button>`. Add an `extra` slot rendered as a sibling of the trigger inside the header. |
| **`collapsible: 'header'\|'icon'\|'disabled'`** | `PARTIAL` (`disabled` only) | `AccordionItem.disabled` — `ui/accordion.tsx:243`; no `icon` mode | **P1** — the companion to `extra`: `collapsible="icon"` shrinks the trigger to the chevron so the rest of the header can hold real controls. |
| **heading level of the trigger** | `MISSING` | `<h3>` hardcoded — `ui/accordion.tsx:314` | **P1 (a11y)** — WAI-ARIA APG requires the button be wrapped in a heading *of the correct level*. An accordion under an `<h4>` section skips/inverts the outline. `CardTitle.level` (`card.tsx:93`) and `EmptyState.titleLevel` (`data-display.prop.ts:122`) already ship this exact vocabulary; Accordion is the odd one out. |
| `items` (declarative array) | `MISSING` | children-composed only — `ui/accordion.tsx:134-239` | P2 — `Tabs`, `Steps` and `Descriptions` all take `items`; Accordion is inconsistent. |
| `expandIcon` render prop | `WONT-PORT` | absent | Token, not a render prop. |
| `Collapsible` (single disclosure) | `PRESENT` | `collapsible.tsx:60-200`, `open`/`defaultOpen`/`onOpenChange`/`disabled` | antd has no single-disclosure primitive; this is a superset. |

### 2.9 `Carousel` vs antd `Carousel`

`src/components/data-display/carousel.tsx`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `infinite` | `COVERED-ELSEWHERE` | `opts.loop` (embla) — `carousel.tsx:38` | — |
| `dots` | `PRESENT` | `CarouselDots` — `carousel.tsx:238-274` | Opt-in child rather than a boolean. |
| `arrows` | `PRESENT` | `CarouselPrevious` / `CarouselNext` — `carousel.tsx:187-231` | — |
| `goTo` / `next` / `prev` (imperative) | `PRESENT` | `setApi` + `useCarousel()` — `carousel.tsx:40, 27-33` | — |
| `beforeChange` / `afterChange` | `COVERED-ELSEWHERE` | `api.on("select", …)` via `setApi` | P2 — a first-class `onValueChange(index)` would be the house spelling; the raw embla event bus is an escape hatch. |
| `autoplay` / `autoplaySpeed` | `MISSING` | `plugins` passthrough only — `carousel.tsx:39` | P2 — **but** if added it MUST ship a pause control (WCAG 2.2.2 SC "Pause, Stop, Hide") and honour `prefers-reduced-motion`. A consumer bolting `embla-carousel-autoplay` onto `plugins` today gets a silent WCAG failure with no affordance. Record that in the catalog either way. |
| `effect: fade` | `MISSING` | grep `fade` → 0 hits | P2 |
| `adaptiveHeight` | `MISSING` | grep `adaptiveHeight` → 0 hits | P2 |
| `dotPosition` (v6 `dotPlacement: top\|bottom\|start\|end`) | `COVERED-ELSEWHERE` | CSS placement of `CarouselDots` | Composition. |
| `draggable` / `speed` / `easing` / `waitForAnimate` | `COVERED-ELSEWHERE` | `opts` (embla) — `carousel.tsx:38` | Raw-library passthrough; note it in the catalog as the documented escape hatch. |
| **dots ARIA** | *defect* | `role="tablist"` + `role="tab"` + `aria-selected` with **no `aria-controls`** and slides that are `role="group"`, not `tabpanel` — `carousel.tsx:249-269` vs `:178-179` | **P1 (a11y)** — tabs that control nothing. APG's carousel pattern wants either (a) real tabs wired `aria-controls` → `role="tabpanel"` slides, or (b) plain buttons in a `role="group"`. Pick one. |
| **arrow direction under RTL** | *defect* | `ChevronLeft`/`ChevronRight` hardcoded — `carousel.tsx:203, 226`; `grep carousel-arrow src/styles/data-display-layout.css` shows no `[dir="rtl"]`/`scale(-1)` rule | **P1 (RTL)** — "previous" points left in `ar`/`he`, where previous is to the right. |
| slide "N of M" announcement | `PRESENT` | `carousel.tsx:143-156` via `t()` | Ahead of antd. |

### 2.10 `EmptyState` vs antd `Empty`

`src/components/data-display/empty-state.tsx`, `src/props/components/data-display.prop.ts:110-128`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `description` | `PRESENT` | `data-display.prop.ts:113` | — |
| `children` (a CTA under the description) | `RENAMED` | `action?: ActionProp` — `data-display.prop.ts:114` | — |
| `image` (`ReactNode`, a URL string, or `PRESENTED_IMAGE_SIMPLE/DEFAULT`) | `MISSING` | `icon?: IconProp` is a **`LucideIcon` component type** only — `data-display.prop.ts:111`; rendered at `empty-state.tsx:34-42` | P2 — a brand illustration or an `<img>` cannot be passed. Add `media?: ReactNode` beside `icon` (do not widen `icon`, which is a typed Lucide slot everywhere else). |
| `imageStyle` | `WONT-PORT` | absent | §0.4 — `--empty-state-icon-*` tokens. |
| `variant` (page/section/compact), `tone`, `titleLevel`, `titleAs` | *beyond antd* | `data-display.prop.ts:116-127` | — |
| `role="status"` | `PRESENT` | `empty-state.tsx:31` | Ahead of antd. |
| icon dropped in `compact` | *documented* | `empty-state.tsx:34` (`variant !== "compact"`) | Worth stating in the catalog. |

### 2.11 `ErrorSurface` / `DataState` vs antd `Result`

`src/props/components/layout.prop.ts:759-816`, `src/props/vocabulary/layout.prop.ts:49`, `src/props/components/query.prop.ts:15-31`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `status: 404\|403\|500` | `PRESENT` | `ErrorSurfaceStatusProp = 400 \| 403 \| 404 \| 500 \| 503 \| (number & {})` — `vocabulary/layout.prop.ts:49` | Superset (400/503). |
| `status: success\|error\|info\|warning` (non-HTTP outcome pages) | `MISSING` | the union is numeric-only — `vocabulary/layout.prop.ts:49` | P2 — antd's `Result status="success"` is the "submission complete" page. Today that is `EmptyState tone="success"` + `action`, which is a reasonable `COVERED-ELSEWHERE`; cross-link it rather than widening the status union. |
| `title` / `subTitle` | `PRESENT` | `title` / `description` — `layout.prop.ts:765, 767` | — |
| `extra` (actions) | `RENAMED`, narrowed | `action: ActionProp` — exactly one, structurally enforced (`layout.prop.ts:772`) | Deliberate; keep. |
| `icon` | `PRESENT` | `layout.prop.ts:777` | — |
| `children` (content block) | `MISSING` | single `description` slot | P2 |
| `requestId` / `permission` / `organization` / `maintenance` / `mode` / `brand` / `footer` | *beyond antd* | `layout.prop.ts:786-812` | — |
| antd `Table.locale.emptyText` + `Spin` lifecycle | `COVERED-ELSEWHERE` | `DataState` — `query.prop.ts:15-31` (skeleton → prerequisite → empty → error, cause-aware retry) | Cross-link. |

### 2.12 `Skeleton` / `SkeletonTable` vs antd `Skeleton`

`src/components/feedback/skeleton.tsx`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `loading` (render children when false) | `MISSING` | `SkeletonProps = React.HTMLAttributes<HTMLDivElement>` — `skeleton.tsx:8` | `COVERED-ELSEWHERE` by `DataState.skeleton` (`query.prop.ts:16`); no work. |
| `active` (shimmer) | `MISSING` | no props at all — `skeleton.tsx:8-19` | P2 — and it must be inert under `prefers-reduced-motion`. |
| `paragraph: { rows, width }` | `PARTIAL` | `SkeletonRows({ rows, columns })` — `skeleton.tsx:21-46`; widths are baked (`w-1/4`, `w-1/6`, `flex-1` at `:38`) | P2 — per-row width is not reachable. |
| `title: { width }` | `MISSING` | `SkeletonDetail` bakes `w-1/3` — `skeleton.tsx:77` | P2 |
| `avatar: { shape, size }` | `MISSING` | no avatar preset | P2 |
| `round` | `WONT-PORT` | absent | Token (`--radius`). |
| `Skeleton.Button` / `.Input` / `.Image` / `.Node` | `MISSING` | grep → only `Skeleton`, `SkeletonRows`, `SkeletonTable`, `SkeletonDetail`, `SkeletonStat` | P2 — the house presets (`Table`/`Detail`/`Stat`) are a *better* answer than antd's shape primitives for this product; record that as the deliberate design and add only `Skeleton.Node`-equivalent freedom (already available: `Skeleton` takes `className`). |
| `size` | `MISSING` | — | P2 |
| **live-region hygiene** | *defect* | every `Skeleton` block carries `aria-busy="true"` **and** `aria-live="polite"` — `skeleton.tsx:13-14`; `SkeletonTable` renders 40+ of them (`:49-70`) | **P1 (a11y)** — dozens of nested polite live regions on decorative placeholders. Correct shape: **one** `aria-busy` container with a localized `aria-label`, and the blocks themselves `aria-hidden`. There is no shared `common.loading` key today — the nearest is `dataTable.loading` (`src/i18n/messages/en.json:461`), so a `feedback.skeleton.loading` key has to be added in `en`/`ja`/`vi`. `Activity` already documents the right rule ("`aria-busy` + an unconditional live region" is *its* stated anti-pattern — `general.prop.ts:213` docblock). |

### 2.13 `Alert` / `Banner` vs antd `Alert`

`src/components/feedback/alert.tsx`, `src/props/components/feedback.prop.ts:41-93`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `type: success\|info\|warning\|error` | `RENAMED` | `tone?: ToneProp` — `feedback.prop.ts:56` | STANDARDS #9. |
| `message` (v6 `title`) / `description` | `RENAMED` | `Alert.Title` / `Alert.Description` children — `alert.tsx:104-128` | Composition. |
| `showIcon` / `icon` | `PRESENT` | `icon?: IconProp \| false` — `feedback.prop.ts:58`; defaults per tone at `alert.tsx:48-56` | Better default (`showIcon` defaults `false` in antd — an icon-less error). |
| `closable` / `onClose` / `closeIcon` | `RENAMED` | `onDismiss` — `feedback.prop.ts:59`, rendered with a `t()` label at `alert.tsx:82-96` | — |
| `afterClose` | `MISSING` | grep `afterClose` → 0 hits | P2 |
| `banner` | `RENAMED` | `Banner` component with `variant` fixed — `banner.tsx:14-26` | — |
| `action` | `RENAMED` | `Alert.Actions` — `alert.tsx:130-135` | — |
| `variant: outlined\|filled` (v6.4) | `PRESENT` | `AlertVariantProp` — `feedback.prop.ts:55` | — |
| `Alert.ErrorBoundary` | `MISSING` | `grep -rln ErrorBoundary src/` → **0 hits** | P2 — `ErrorSurface` is the *page*-level answer; a component-level boundary that renders an `Alert` has no equivalent. Note: a React error boundary is a class component, which is why antd ships it. |
| assertive vs polite live region derived from tone | `PRESENT` | `ASSERTIVE_TONES` → `role="alert"` else `role="status"` — `alert.tsx:46, 70` | Ahead of antd. |
| `Alert.QueryError` (cause-aware, never leaks backend text) | *beyond antd* | `alert.tsx:181-225` | — |

### 2.14 `Toaster` vs antd `notification` + `message`

`src/components/feedback/sonner.tsx`, `src/components/feedback/use-toast.ts`, catalog entry `mcp/src/data/components.ts:7299-7345`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `message.success/error/info/warning/loading` | `COVERED-ELSEWHERE` | sonner `toast.*` — `use-toast.ts:1-11` | — |
| `message.promise`-style flow | `PRESENT` | `toast.promise` — `use-toast.ts:4` | — |
| `notification` (title + description + actions) | `COVERED-ELSEWHERE` | sonner's `ExternalToast` (`description`, `action`) — re-exported at `use-toast.ts:10` | — |
| `duration`, `pauseOnHover`, `showProgress` | `COVERED-ELSEWHERE` | sonner options | — |
| `maxCount` / `stack` | `COVERED-ELSEWHERE` | sonner `visibleToasts` | — |
| `key` → update a live toast in place | `COVERED-ELSEWHERE` | sonner returns an id accepted by `toast(…, { id })` | — |
| `placement` (`topRight` …) | `MISSING` (house vocabulary) | `position="bottom-right"` — `sonner.tsx:118`; the catalog documents the physical union — `components.ts:7307-7310` | **P1 (RTL)** — physical `left`/`right` corners contradict §0.4 and never flip under `dir="rtl"`. The house spelling is `placement ∈ top-start \| top-center \| top-end \| bottom-*`. |
| `role: 'alert' \| 'status'` (5.6.0) | `MISSING` | not exposed | P2 — a destructive toast should be assertive; `Alert` already derives this from tone (`alert.tsx:46`). |
| close-button label localization | `MISSING` | no `closeButton`/`t()` wiring in `sonner.tsx:84-128`; sonner's own default label is English | **P1 (i18n)** — verify against a live render; if sonner's default label ships untranslated, the toast has an English control in a ja/vi app. |
| **the whole imperative surface is un-owned** | *systemic* | catalog tagline: "trigger toasts via `import { toast } from \"sonner\"` — **NOT** from @godxjp/ui" (`components.ts:7302`); `use-toast.ts` re-exports sonner verbatim | **P1** — consumers call a third-party API directly, so nothing in the vocabulary check, the prop registry, the a11y contract or `t()` covers the most-used feedback path in the product. Wrap it: `toast()` exported from `@godxjp/ui/feedback` with house options (`tone`, `placement`, `duration`, `action`), delegating to sonner. This is the same argument that produced `Alert.QueryError`. |

### 2.15 `Tooltip` / `Popover` / `HoverCard` vs antd `Tooltip` / `Popover` / `Popconfirm`

`src/components/feedback/tooltip.tsx`, `src/components/data-display/popover.tsx`, `src/components/ui/hover-card.tsx`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `title` / `content` shorthand | `RENAMED` | `TooltipContent` / `PopoverContent` children | — |
| `open` / `defaultOpen` / `onOpenChange` | `PRESENT` | `tooltip.tsx:100-111`; `popover.tsx` root | Correct disclosure triad. |
| `placement` (12 values) | `RENAMED` | `side` + `align` → `placement` internally — `tooltip.tsx:51-62`, `popover.tsx:322-325` | Radix vocabulary. |
| `side: 'left' \| 'right'` | *physical* | `type Side = "top" \| "right" \| "bottom" \| "left"` — `tooltip.tsx:51` | P2 — §0.4 argues for logical `inline-start`/`inline-end`. Radix/RAC flip physical sides automatically under `dir`, so this is **not** an RTL bug; it is a vocabulary inconsistency. Document, don't churn. |
| `mouseEnterDelay` / `mouseLeaveDelay` | `PARTIAL` | `delayDuration` (open only) + `TooltipProvider` — `tooltip.tsx:79-98, 108` | P2 — no close delay. |
| **`arrow`** (default `true` in antd) | `MISSING` | `grep -rln "PopoverArrow\|TooltipArrow\|ui-tooltip-arrow\|ui-popover-arrow" src/` → **0 hits** | P2 — with several triggers in a row (a toolbar), a tooltip with no arrow does not say which control it belongs to. Add as an opt-in part + token, not a boolean twin. |
| `trigger: click \| hover \| focus \| contextMenu` | `COVERED-ELSEWHERE` | `Tooltip` = hover/focus (RAC, correct per APG); `Popover` = click; `HoverCard` = hover-rich | Three components, one axis. Cross-link all three. |
| `color` (background preset) | `WONT-PORT` | absent | §0.4 — tokens. |
| `fresh` / `destroyOnHidden` | `MISSING` | `forceMount` is inert on RAC — `tooltip.tsx:177`, `popover.tsx:339` | P2 — the *inert-but-kept* Radix props (`sticky`, `hideWhenDetached`, `forceMount`) are documented dead weight (`tooltip.tsx:172-177`); flag them in the catalog so consumers stop passing them. |
| `getPopupContainer` / `zIndex` / `align` (dom-align) | `WONT-PORT` | absent | Escape hatches / pixel knobs. |
| `Popconfirm` (title + description + OK/Cancel on a trigger) | `COVERED-ELSEWHERE` | `AlertDialog` (`feedback.prop.ts:22-39`, incl. `confirmPhrase`/`challenge`/`stepUp`) for consequential actions; `Popover` + two `Button`s for light ones | No new component. Add the `related` cross-link on both sides — the catalog currently names neither as antd's `Popconfirm`. |

### 2.16 `Dialog` / `AlertDialog` / `Sheet` vs antd `Modal` / `Drawer`

`src/components/feedback/dialog.tsx`, `src/components/feedback/sheet.tsx`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `open` / `onCancel` / `onOk` / `okText` / `cancelText` / `okType` | `PRESENT` | `AlertDialogProp` — `feedback.prop.ts:22-39`; `Dialog.Action` / `Dialog.Cancel` — `dialog.tsx:724-725` | — |
| `confirmLoading` | `RENAMED` | `pending` — `feedback.prop.ts:38`, `dialog.tsx:602` | STANDARDS forbidden-alias table. |
| `closable` / `closeIcon` | `PRESENT` | `showClose` / `showCloseButton` — `dialog.tsx:288-289` | — |
| `maskClosable` (v6 `mask.closable`) | `PRESENT` | `isDismissable` — `dialog.tsx:148`; `false` for `alertdialog` — `dialog.tsx:478` | Correct APG behaviour. |
| `keyboard` (Esc) | `PRESENT` | `dialog.tsx:37-38` (Escape closes alert-dialog too, matching Radix) | — |
| `destroyOnHidden` / `forceRender` | `PRESENT` | `forceMount` — `dialog.tsx:244, 292` | — |
| `focusTriggerAfterClose` | `PRESENT` | `onCloseAutoFocus` + `useOverlayCloseFocus` — `dialog.tsx:294` | — |
| `title` / `footer` / `extra` (Drawer) | `PRESENT` | `SheetHeader({ title, extra })` — `sheet.tsx:362-368`; `SheetFooter` — `sheet.tsx:426` | — |
| `loading` (skeleton body, 5.17/5.18) | `MISSING` | grep `loading` in `dialog.tsx`/`sheet.tsx` → only `pending` on the confirm button | P2 — an async-loaded dialog body has no built-in placeholder. |
| `width` / `size: default\|large` | `MISSING` (Sheet) | `--sheet-width-default` token only — `sheet.tsx:242` | P2 — a token exists, a per-instance `size` does not. |
| `Drawer.placement` (v6 logical) | *physical, deliberate* | `side` with an explicit `/* rtl-ignore: named physical side */` — `sheet.tsx:241-243`; `SheetResponsiveProp` (`auto`/`side`/`bottom`) — `feedback.prop.ts:104` | `WONT-PORT` as written **but record the reason in the catalog** so it is not re-litigated. antd v6 moved to `start`/`end`; the responsive `auto` mode is a better answer than either. |
| `Drawer.push` (nested drawers) / `resizable` / `maxSize` (v6) | `MISSING` | grep → 0 hits | P2 |
| `Modal.confirm()` / `useModal()` returning a promise | `MISSING` | no imperative helper; `grep -rn "useModal\|modal.confirm" src/` → 0 hits | P2 — `AlertDialog` is the declarative answer and is better for a11y (the context-holder problem antd documents does not exist here). Record as a deliberate refusal rather than a gap. |
| `modalRender` / `drawerRender` / `classNames` / `styles` / `getContainer` / `zIndex` | `WONT-PORT` | absent | §0.4. |

### 2.17 `Progress` vs antd `Progress`

`src/components/data-display/progress.tsx`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `percent` | `RENAMED` | `value` — `progress.tsx:36` | — |
| `status: success\|exception\|normal` | `RENAMED` | `tone: "success" \| "warning" \| "destructive"` — `progress.tsx:6, 37` | — |
| `status="active"` (indeterminate stripe) | `COVERED-ELSEWHERE` | `Activity` (`general.prop.ts:213`) / `Skeleton` | Cross-link. |
| `showInfo` / `format(percent)` | `MISSING` | `label` is a caption, not the value — `progress.tsx:31, 108-113`; the percentage exists only in `aria-valuetext` (`:174`) | **P1** — the number is announced but never *shown*. A capacity meter that shows no figure is the commonest complaint against this component. Add `showValue?: boolean` + `numberFormat?: Intl.NumberFormatOptions`. |
| **percentage formatting** | *defect* | `aria-valuetext={`${boundedValue}%`}` — `progress.tsx:174` | **P1 (i18n)** — a hand-built percent string. `Intl.NumberFormat(locale, { style: "percent" })` places the sign correctly for `tr` (`%50`), `fr` (`50 %`) and uses locale digits. Same fix as `showValue`. |
| `type: circle` / `dashboard` | `MISSING` | grep `circle`/`dashboard` in `progress.tsx` → 0 hits | **P1** — a ring gauge is standard on any KPI dashboard; today it is hand-rolled SVG in the consumer. Extend `Progress` with `variant?: "bar" \| "circle" \| "gauge"` (reusing the existing role/ARIA machinery), **not** a new component. |
| `steps` (discrete segments) | `MISSING` | `segments` is a *breakdown partition* (`progress.tsx:66-71`), a different concept | P2 — record the name collision in the catalog. |
| `size` | `MISSING` | grep `size` in `progress.tsx` → 0 hits | P2 — `size ∈ xs\|sm\|md\|lg`. |
| `success: { percent }` (sub-bar) | `COVERED-ELSEWHERE` | `segments` — `progress.tsx:66` | — |
| `strokeColor` (incl. gradients) / `trailColor` / `strokeLinecap` / `gapDegree` | `WONT-PORT` | absent | §0.4 — `--progress-*` tokens. |
| `over` (>100 %, striped over-capacity fill, real ratio in `aria-valuetext`) | *beyond antd* | `progress.tsx:38-45, 160-174` | — |
| breakdown as `role="img"` with every slice spoken, labels required | *beyond antd* | `progress.tsx:48-64, 115-154` | Exemplary; keep. |

### 2.18 `QrCode` vs antd `QRCode`

`src/components/data-display/qr-code.tsx`.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `value` | `PRESENT` | `qr-code.tsx:20` | — |
| `size` | `PARTIAL` | `size?: SizeProp` → `data-size` attribute; the SVG is fixed at 256 (`QR_INTRINSIC_SIZE`, `qr-code.tsx:13, 27`) and scaled by CSS | Correct house design (tier, not px). No work. |
| `type: canvas\|svg` | `WONT-PORT` | SVG only — `qr-code.tsx:22` | SVG is the right choice (scales, prints, no DPR bug). State it in the catalog. |
| `errorLevel: L\|M\|Q\|H` | `MISSING` | hardcoded `level="M"` — `qr-code.tsx:28` | P2 — `H` is needed whenever an `icon` overlays the modules, and for printed codes. |
| `boostLevel` | `PRESENT` (forced on) | `qr-code.tsx:29` | — |
| `icon` / `iconSize` (centre logo) | `MISSING` | grep → 0 hits | P2 — depends on `errorLevel="H"`; ship the pair or neither. |
| `bordered` | `MISSING` | grep → 0 hits | P2 — token, not a prop. |
| `color` / `bgColor` | `WONT-PORT` | `hsl(var(--qr-code-*))` — `qr-code.tsx:31-32` | §0.4 — already tokens. Note: token-driven colours mean a theme *can* produce a sub-threshold contrast ratio and break scanning; a documented contrast floor would be worth a catalog rule. |
| `status: active\|expired\|loading\|scanned` + `onRefresh` + `statusRender` | `MISSING` | grep `status` in `qr-code.tsx` → 0 hits | **P1** — an expired-code overlay with a refresh button is the whole UX of a device-pairing / 2FA-enrolment screen, and `TwoFactorSetup` (`src/components/feedback/two-factor-setup.tsx`) is exactly that screen. Without it every consumer hand-rolls an absolutely-positioned overlay with no live-region announcement of the state change. |
| `marginSize` (quiet zone) | `PRESENT` (fixed) | `marginSize={4}` — `qr-code.tsx:30` | Correct — 4 modules is the spec minimum. |
| accessible name never leaks the encoded value | *beyond antd* | `qr-code.tsx:16-17, 33-34` | — |

### 2.19 `ScrollArea`, `CodeBlock`, `Prose`, `ListRow`, `TimelineGrid`, `RangeTimeline`, `CompactBarTrend`, `Legend`, `CredentialReveal`, `PermissionMatrix`, `ServiceLauncherCard`, `PrefetchLink`, `InfiniteQueryState`, `TwoFactorSetup`

**No antd counterpart exists** for these; they are this library's own vocabulary, and
`namethatui.com/?platform=web` returns no matching web pattern for `RangeTimeline`, `TimelineGrid`,
`PermissionMatrix`, `CredentialReveal` or `ServiceLauncherCard`. Checked and **fully aligned / out of
antd's scope**:

- `ScrollArea` (`data-display.prop.ts:477-503`) — `orientation`, `anchor: "bottom"` for live streams,
  `anchorOffset` from a token, `onAnchoredChange` so "jump to newest" is never motion-only. No antd
  equivalent; ahead of it.
- `CodeBlock` (`code-block.tsx:8-39`) — `wrap`, `maxHeight`, `tabIndex` when it scrolls (WCAG 2.1.1).
  Nearest antd is `Typography.Text code`, which is inline only.
- `Prose` (`prose.tsx:8-23`) — antd's `Typography` has no rendered-HTML container.
- `ListRow` (`list-row.tsx:22-58`, `data-display.prop.ts:374-397`) — see §2.5, covers `Card.Meta` and `List.Item.Meta`.
- `TimelineGrid` / `RangeTimeline` (`data-display.prop.ts:546-570`, `range-timeline.tsx`) — 2-D
  resource timelines; antd has nothing comparable.
- `CompactBarTrend` (`charts.prop.ts:83-121`) — the sparkline. Already takes
  `numberFormat?: Intl.NumberFormatOptions` and requires a `label` for `role="img"`. **This is the
  formatting vocabulary `StatCard` should adopt** (§2.4).
- `Legend`, `CredentialReveal`, `PermissionMatrix`, `ServiceLauncherCard`, `PrefetchLink`,
  `InfiniteQueryState`, `TwoFactorSetup`, `DataState`, `AlertDialogRoot` — house-specific.

### 2.20 Ant Design components with **no** counterpart here

| Ant component | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `Spin` | `COVERED-ELSEWHERE` | `Activity` (`general.prop.ts:213-240`), `Skeleton`, `DataState`, `Button pending` | No work. The `Activity` docblock already draws the three-way distinction correctly. |
| `Empty` | `COVERED-ELSEWHERE` | `EmptyState` — §2.10 | — |
| `Result` | `COVERED-ELSEWHERE` | `ErrorSurface` — §2.11 | — |
| `Popconfirm` | `COVERED-ELSEWHERE` | `AlertDialog` / `Popover` + `Button`s — §2.15 | — |
| `notification` / `message` | `COVERED-ELSEWHERE` | `Toaster` — §2.14 (but the wrapper gap there is P1) | — |
| `Rate` | `COVERED-ELSEWHERE` | `Rating` (data-entry) — `src/components/ui/rating.tsx:11-38`: `count`, `allowHalf`, `character`, `tooltips`, `readOnly`, `disabled` | Full parity, including read-only display. Cross-link from `data-display`. |
| `Statistic.Timer` | `MISSING` | `grep -rn "Countdown\|Statistic.Timer" src/` → 0 hits | P2 — extend `StatCard` (§2.4), not a new component. |
| `Image` (+ `PreviewGroup`) | `MISSING` | `grep -rn "ImagePreview\|Lightbox" src/` → 0 hits; only `upload-crop-dialog.tsx` handles images | P2 — see GATE-0 §4.2. |
| `Watermark` | `MISSING` | `grep -rn Watermark src/` → 0 hits | P2 — see GATE-0 §4.3. |
| `Tour` | `MISSING` | `grep -rn Tour src/` → 0 hits | P2 — see GATE-0 §4.4. |
| `Splitter` | `PARTIAL` | `SplitPane` (layout group) — `src/components/layout/split-pane.tsx:3-31`: `aside`, `asideWidth: sm\|md\|lg`, `asideLabel`, `fill`. **No draggable divider, no `min`/`max`, no collapse, no `onResize`** | **P1**, but it belongs to the `layout` group's audit — flagged here because the brief asked for the comparison. antd's separator is keyboard-operable (`role="separator"` + arrow keys); a fixed three-tier width is not the same component. |

---

## 3. Consolidated priority list

Every `MISSING`/defective row, most severe first. **P0** = breaks a real screen · **P1** = a
workaround exists but is hand-rolled and a11y-risky · **P2** = nice to have.

### P0

| # | Component | Gap | Evidence |
| --- | --- | --- | --- |
| 1 | `Timeline` | Screen-reader status prefixes are **hardcoded English** (`"Completed: "` / `"Current: "` / `"Upcoming: "`) with no i18n keys in any locale file. Every ja/vi screen using `Timeline` announces English. | `src/components/data-display/timeline.tsx:31-35, 107`; `grep -n timeline src/i18n/messages/en.json` → 0 hits |

### P1

| # | Component | Gap | Evidence |
| --- | --- | --- | --- |
| 2 | `Skeleton` | `aria-live="polite"` on **every** placeholder block — a `SkeletonTable` mounts 40+ nested live regions, and none has a localized name. Should be one `aria-busy` container with a localized label and `aria-hidden` blocks; no shared `common.loading` key exists yet (nearest: `dataTable.loading`). | `skeleton.tsx:13-14, 49-70`; `src/i18n/messages/en.json:461` |
| 3 | `Accordion` | Trigger heading level hardcoded to `<h3>`; breaks the document outline wherever the accordion is not a level-3 section. `CardTitle.level` / `EmptyState.titleLevel` already ship the vocabulary. | `src/components/ui/accordion.tsx:314`; cf. `card.tsx:93`, `data-display.prop.ts:122` |
| 4 | `Accordion` | No `extra` slot and no `collapsible="icon"`: a header carrying a `Switch`/`Button` must nest an interactive element inside the trigger `<button>`. | `ui/accordion.tsx:320-341` |
| 5 | `Carousel` | Dots are `role="tab"`/`aria-selected` with **no `aria-controls`**, over slides that are `role="group"` — tabs that control nothing. | `carousel.tsx:249-269` vs `:178-179` |
| 6 | `Carousel` | Prev/next arrows are hardcoded `ChevronLeft`/`ChevronRight` with no RTL flip in the stylesheet. | `carousel.tsx:203, 226`; `src/styles/data-display-layout.css:547-580` (no `[dir="rtl"]` rule) |
| 7 | `Toaster` | The imperative API is un-owned: the catalog instructs consumers to import `toast` from `sonner` directly, so no house vocabulary, no `t()`, no tone→politeness mapping, no prop registry coverage. | `mcp/src/data/components.ts:7302`; `src/components/feedback/use-toast.ts:1-11` |
| 8 | `Toaster` | `position` is sonner's physical `"bottom-right"`; never flips under `dir="rtl"`. Close-button label localization unverified (sonner's default is English). | `sonner.tsx:118, 84-128`; `components.ts:7307-7310` |
| 9 | `Avatar` | No `size` prop — consumers hand-write `size-12` Tailwind classes, which `check:control-sizing` cannot see outside the package. | `data-display.prop.ts:172-199`; `src/tokens/components/data-display.css:89` |
| 10 | `Avatar` | No `Avatar.Group` — every assignee/attendee stack re-derives overlap, the `+N` tile and its accessible name. | `grep -rn "AvatarGroup\|Avatar.Group" src/ mcp/src/data/components.ts` → 0 hits |
| 11 | `Progress` | The percentage is announced but never displayed (no `showValue`/`format`), and `aria-valuetext` builds the percent string by hand instead of `Intl.NumberFormat(style:"percent")`. | `progress.tsx:174, 108-113` |
| 12 | `Progress` | No circular / gauge form; KPI ring gauges are hand-rolled SVG in consumers. | `grep -n "circle\|dashboard" src/components/data-display/progress.tsx` → 0 hits |
| 13 | `StatCard` | No number formatting (`precision`/separators/affixes) and a locale-fragile regex sign parse for the delta tone. | `card.tsx:210-231, 233-246` |
| 14 | `QrCode` | No `status` (`expired`/`scanned`/`loading`) + `onRefresh`; the 2FA-enrolment screen that needs it ships in this very group. | `qr-code.tsx:19-42`; `src/components/feedback/two-factor-setup.tsx` |
| 15 | `DataTable` | No `virtual` list — no answer for a 5 000-row grid. Same gap `docs/roadmap/list-masonry.md` records for `List`; solve once, share the primitive. | `grep -n virtual src/components/data-display/data-table.tsx` → 0 hits |
| 16 | `DataTable` | No `onCell` → no `colSpan`/`rowSpan` merged cells; the only escape is the raw `Table` primitive, which forfeits sort/filter/selection. | `grep -n "onCell\|rowSpan" src/components/data-display/data-table.tsx` → 0 hits |
| 17 | `DataTable` | No `column.rowScope` → no row-header column, so a screen reader cannot name each cell by its row. | `grep -n rowScope src/props/vocabulary/data.prop.ts` → 0 hits |
| 18 | `DataTable` | No `childrenColumnName`/`indentSize` → nested (tree) rows are impossible, although `TableCellIndentProp` already exists for exactly this. | `grep -n childrenColumnName …` → 0 hits; `vocabulary/data.prop.ts` `TableCellIndentProp` |
| 19 | `SplitPane` *(layout group — flagged, not owned)* | No draggable, keyboard-operable separator; `asideWidth` is a fixed three-tier union. | `src/components/layout/split-pane.tsx:3-31` |

### P2

`Descriptions.size` · `Descriptions` `children` block · `Table` `<caption>` · `Card.hoverable`
(check `ServiceLauncherCard` first) · `Avatar.onError` · `Timeline` `tone`/`color`, `placement`
(`start`/`end`/`alternate`), `reverse`, trailing `pending`, stable item `id` · `Accordion` `items`,
`size`, `expandIconPlacement` (token), `showArrow` · `Carousel` `autoplay` (**with** a pause control,
WCAG 2.2.2), `effect="fade"`, `adaptiveHeight`, first-class `onValueChange(index)` · `EmptyState`
`media?: ReactNode` · `ErrorSurface` non-HTTP outcome statuses (or a documented `EmptyState`
cross-link) + `children` · `Skeleton` `active`, per-row widths, `avatar`/`title` presets, `size` ·
`Alert` `afterClose`, an `ErrorBoundary` recipe · `Toaster` `role` (assertive for destructive) ·
`Tooltip`/`Popover` `arrow`, `mouseLeaveDelay`, catalog note on the inert Radix props · `Dialog`/
`Sheet` `loading` body, `Sheet` `size`, `push`, `resizable` · `Progress` `size`, catalog note on the
`steps`↔`segments` name collision · `QrCode` `errorLevel`, `icon`+`iconSize`, `bordered` token ·
`StatCard` `prefix`/`suffix`, `Statistic.Timer` equivalent · `DataTable` `filterSearch`, `showHeader`,
`tableLayout`, `onHeaderRow`, `ColumnGroup`, `column.minWidth`, `pagination.position` (logical
spelling), `scroll.scrollToFirstRowOnChange`, `sticky.offsetScroll`, `ref.scrollTo`,
`rowSelection.columnWidth`, `expandable.showExpandColumn` · new components `Image` preview,
`Watermark`, `Tour` (see §4).

### Catalog-only follow-ups (no code)

`related` cross-links are one-sided or absent for: `Descriptions` ↔ `Card`/`CardHeader`; `Card.Meta`
↔ `ListRow`; `Card.Grid` ↔ `ResponsiveGrid`; `Spin` → `Activity`/`Skeleton`/`DataState`;
`Popconfirm` → `AlertDialog`/`Popover`; `Rate` → `Rating`; `StatCard` ↔ `SkeletonStat`; `Progress`
`segments` vs antd `steps`; `Timeline` per-item `pending` vs antd's trailing `pending`. Per §0's
`COVERED-ELSEWHERE` rule these must be added **on both sides** (the one-sided-claim mistake fixed in
`8365bf05`). Also record the `WONT-PORT` reasons in the entries themselves: `Sheet.side` physical
spelling, `QrCode` SVG-only, `Card` deliberate absence of `size`, the inert Radix overlay props.

---

## 4. GATE-0 ledgers for anything proposed as **new**

Per `docs/COMPOSITION-VS-COMPONENT.md` §2, all seven must PASS. **Every P0/P1 gap above closes by
extending an existing component — none of them proposes a new one.** Four candidates were tested
anyway; three fail.

### 4.1 `Avatar.Group` — **sub-component of `Avatar`, not a new top-level component**

| C1 | C2 | C3 | C4 | C5 | C6 | C7 | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ universal (assignees, attendees, reviewers) | ➖ owns overflow arithmetic + the `+N` accessible name + an optional `Popover` of the remainder; no keyboard model of its own | ❌ **you can build the stack today** from `Avatar` + `Flex` + negative-inset tokens | ✅ `max`, `size`, `shape` | ✅ `--avatar-*` | ➖ | ✅ | **Extend `Avatar`** — ship as `Avatar.Group`, exactly as antd does. C3 fails for a *new component*, which is the correct answer: the value is the shared `size`/`shape` context and the overflow naming, both of which belong to `Avatar`. |

Blocked on the P1 `Avatar.size` gap (#9) — the group's `size` prop has nothing to propagate until
`Avatar` has one. Do #9 first.

### 4.2 `Image` / preview lightbox — **defer; passes on merit, fails on demand**

| C1 | C2 | C3 | C4 | C5 | C6 | C7 | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ➖ | ✅ focus trap, Escape, arrow-key paging, zoom/rotate state, `prefers-reduced-motion` | ✅ not expressible from primitives | ✅ `open`/`onOpenChange`, `value`/`onValueChange` for the group index | ✅ | ✅ (a hand-rolled lightbox is *always* an a11y failure) | ❌ no consumer in this repo asks for it today | **Not now.** Re-run GATE-0 when a real screen needs it. Record in the catalog that a hand-rolled `<div>` lightbox is forbidden, so the gap surfaces as an issue rather than as consumer code. |

### 4.3 `Watermark` — **fails**

| C1 | C2 | C3 | C4 | C5 | C6 | C7 | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ❌ one compliance scenario, not many domains | ➖ canvas tiling + anti-tamper `MutationObserver` | ✅ | ➖ | ➖ (`font.color` is inherently a raw value) | ❌ no interaction, no ARIA — a decorative overlay | ❌ | **Composition.** A tiled `background-image` from a token, applied by the consumer. Do not add. |

### 4.4 `Tour` — **fails today**

| C1 | C2 | C3 | C4 | C5 | C6 | C7 | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ➖ onboarding is common but the *content* is entirely product-specific | ✅ spotlight mask, focus management, step state, `scrollIntoView` | ✅ | ✅ `open`, `current`/`onValueChange`, `steps` | ✅ | ✅ | ❌ nothing consumes it | **Not now.** Same disposition as §4.2 — a real onboarding requirement re-opens the gate. |

### 4.5 Explicitly rejected as new components

- **`Popconfirm`** — `AlertDialog` (consequential) and `Popover` + `Button`s (light) already cover
  it. Adding it would be the third dialect §0.1 warns about. **Instant reject.**
- **`CircularProgress` / `Gauge`** — extend `Progress` with a `variant`; the ARIA, tone and
  over-capacity machinery already exist (`progress.tsx:160-190`).
- **`Statistic` / `Countdown`** — extend `StatCard`.
- **`Notification`** — the gap is a *wrapper* around sonner, not a second toast component.
- **`Empty`**, **`Result`**, **`Spin`**, **`Rate`** — `EmptyState`, `ErrorSurface`,
  `Activity`/`Skeleton`/`DataState`, `Rating`. **Instant reject.**
