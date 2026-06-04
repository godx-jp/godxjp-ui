# DataTable & Component Gaps — ADR Set

Decision records synthesizing the `@godxjp/ui` component gaps surfaced while researching the **dxs-kintai** design bundle (`.design/research/tables.md` §7) and building the 15 table showcases under `docs/showcase/table-*.tsx`. Each showcase carries an embedded gap note describing where the real `DataTable` API (`src/components/data-display/data-table.tsx`, vocab `src/props/vocabulary/data.prop.ts` + `interaction.prop.ts` + `layout.prop.ts`) was insufficient and the capability had to be hand-composed from lower-level `Table*` primitives.

**This is decision documentation only — no component is changed by this file.**

### Real API baseline (what exists today)

- `DataTableProps<T>`: `data`, `columns: ColumnDefProp<T>[]`, `getRowId`, `selectable`, `selected`/`onSelectChange`, `onRowClick`, `density`/`onDensityChange`, `sort`/`onSortChange`, `loading`, `empty`.
- `ColumnDefProp<T>` (`data.prop.ts:16`): `{ key; header; render?; sortable?; width?; align?: ColumnAlignProp; hiddenOnMobile? }`. No `resizable`, no `sticky`/`pinned`, no `cellClassName`, no `footer`.
- `TableDensityProp = Exclude<DensityProp, "default">` (`layout.prop.ts:19`) → **binary** `compact | comfortable`. The full `DensityProp` (`layout.prop.ts:10`) is `compact | default | comfortable` (3 levels).
- `SortStateProp = { key; direction: SortDirectionProp }` (`interaction.prop.ts:44`) → **single-column** sort.
- Compound slots only: `DataTable.Toolbar`, `.SelectAll`, `.BulkActions`, `.DensityToggle`, `.Content`, `.Pagination` (cursor-only: `cursor`/`hasMore`/`onChange`), `.RowActions`.
- `ToneProp` (`interaction.prop.ts:25`): `default | success | warning | destructive | info | muted | neutral` — **no `attention`**, despite `bg-attention`/`text-attention` CSS tokens existing and being consumed raw in `table-conditional-format.tsx`.

### Decision legend

- **extend-variant** — table-internal feature; extend `DataTable`/`ColumnDefProp` with a prop or compound slot.
- **new-component** — standalone, reusable widget; ship as its own primitive.
- **app-level-composition** — one-off assembly; keep composing in the consumer, document as a recipe; do NOT add API.

### Recommended-first (priority order)

1. **A0 — `attention` tone** (atomic, cross-cutting; unblocks 遅刻/早退/残業/休憩 signalling system-wide). **Do this first.**
2. **A1 — three-level density** (`TableDensityProp` mismatch hit by `table-density.tsx`; smallest table-internal fix with the broadest visual payoff).
3. **A6 — sticky/pinned columns** (`table-sticky-columns.tsx` fully hand-rolled; highest composition cost of any table gap).

---

# A) DataTable extensions

## A1. Three-level density — Decision: extend-variant

**Context.** `table-density.tsx` demonstrates three row heights (compact 28px / 標準 36px / ゆったり 48px) as required by the comp-table reference (③, 3 radios). The real `TableDensityProp = Exclude<DensityProp, "default">` is binary (`compact | comfortable`), and `DataTable.DensityToggle` is a 2-way button. The showcase had to define its own `type DensityKey = "compact" | "default" | "comfortable"` and a local `DENSITY_META` map "where it exists" (see its gap note), because the middle/default level is unreachable through the component.

**Options considered.**
- *Extend* `TableDensityProp` to the full `DensityProp` (3 levels) and make `DensityToggle` a 3-way segmented control.
- *New component* density popover — overkill; density is intrinsic to the table.
- *App-level* — rejected; every kintai list needs the standard 36px default, so this is a systemic mismatch, not a one-off.

**Decision + rationale.** Extend. Density is a table-internal layout axis; the type already exists one level up (`DensityProp`). Aligning `TableDensityProp` to `DensityProp` removes a bespoke local enum from every consumer and lets `default`/標準 be the actual default.

**API sketch.**
```ts
// layout.prop.ts — collapse the Exclude:
export type TableDensityProp = DensityProp; // compact | default | comfortable
```
```tsx
// DataTable.DensityToggle becomes a 3-way SegmentedControl (see B5):
<DataTable.DensityToggle /> // renders compact / 標準 / ゆったり
// row-height tokens keyed: compact→28, default→36, comfortable→48
```

## A2. Multi-sort with visible priority — Decision: extend-variant

**Context.** comp-table ⑤ shows shift-click multi-sort with priority badges (1/2/3) at the header's right edge. The real `sort` prop is a single `SortStateProp = { key; direction }` and `onSortChange` cycles asc→desc→clear for **one** key (`data-table.tsx` `onHeaderClick`). No showcase could express multi-key sort; it was silently dropped to single-sort.

**Options considered.**
- *Extend* `DataTable` to accept an ordered array `SortStateProp[]` and render priority indices.
- *New component* — no; sort lives in the header.
- *App-level* — rejected; sort priority must round-trip through the same header UI the component owns.

**Decision + rationale.** Extend. Multi-sort is header-internal state the component already half-owns. Introduce a `MultiSortStateProp` array; keep the single-`SortStateProp` path for the common case (union-typed prop, back-compatible).

**API sketch.**
```ts
// interaction.prop.ts
export type MultiSortStateProp = SortStateProp[]; // order = priority 1..n
```
```tsx
sort?: SortStateProp | MultiSortStateProp;
onSortChange?: (next: SortStateProp | MultiSortStateProp | undefined) => void;
multiSort?: boolean; // shift-click appends; renders priority number per active column
```

## A3. Column resize + auto-fit — Decision: extend-variant

**Context.** comp-table ⑤ includes a 4px col-resize grip with dbl-click auto-fit. `ColumnDefProp<T>` has only a static `width?: string`; no `resizable` flag and no resize handle anywhere in `DataTable.Content`.

**Options considered.**
- *Extend* `ColumnDefProp` with `resizable?` and add `onColumnResize` to `DataTable`.
- *New component* — no; resize is a header-cell affordance.
- *App-level* — rejected; resize requires the component's own header/cell width plumbing.

**Decision + rationale.** Extend. Per-column resize is intrinsic table behaviour; expose it as an opt-in column flag plus a controlled width-override callback.

**API sketch.**
```ts
// data.prop.ts — ColumnDefProp<T> additions:
resizable?: boolean;
minWidth?: string;
```
```tsx
columnWidths?: Record<string, string>;            // controlled override
onColumnResize?: (key: string, width: string) => void; // dbl-click → "auto"
```

## A4. Expandable detail rows — Decision: extend-variant

**Context.** `table-expandable-rows.tsx` builds an inline detail panel (StatCard grid + 直近3日 mini-table + actions) under each row, with exclusive toggle. Its gap note states the expand mechanism is composed because `DataTable`/`ColumnDef` has no `expandable`/`renderExpanded`. comp-table ⑥ specifies `border-left:3px primary`, exclusive toggle, inline approve/reject.

**Options considered.**
- *Extend* `DataTable` with `renderExpanded(row)` + expansion state props.
- *New component* — no; the panel is bound to a row inside the same `<tbody>`.
- *App-level* — possible but recurring (expand is a staple of kintai approval lists); promote to API.

**Decision + rationale.** Extend. Expansion needs `colSpan`-spanning rows interleaved into the body — only the component can emit those correctly. Provide a render slot + controlled/uncontrolled expansion set.

**API sketch.**
```tsx
renderExpanded?: (row: T) => React.ReactNode;
expandedIds?: Set<string>;
onExpandedChange?: (next: Set<string>) => void;
expandMode?: "single" | "multiple"; // "single" = exclusive (comp-table ⑥)
```

## A5. Grouped rows with subtotals + tree rows — Decision: extend-variant

**Context.** `table-grouped-subtotals.tsx` (gap note: DataTable lacks "グループ行 / 折りたたみグループ / グループ小計 / 総計フッター") and `table-tree-rows.tsx` (14px-per-level indent + twirl) both hand-build group/tree structure from raw `Table*` primitives. comp-table ⑧ specifies full-width `.group-row` (title + 人数 count + right-aligned aggregate, collapsible) and hierarchical indent. A standalone `TreeList` exists but not as a table grouping mode.

**Options considered.**
- *Extend* `DataTable` with a `groupBy` + `renderGroupHeader`/aggregate model, and a tree variant via per-row depth.
- *New component* — a separate `GroupedTable` would fork the cell/sort/selection logic; rejected as duplication.
- *App-level* — rejected; grouping must interleave group-header rows and subtotal rows into the same column grid the component owns.

**Decision + rationale.** Extend. Grouping/tree are row-shaping modes over the same columns; forking a second table component duplicates everything. One `groupBy` model covers V11; a `getSubRows`/`depth` model covers V12.

**API sketch.**
```ts
groupBy?: (row: T) => string;
renderGroupHeader?: (groupKey: string, rows: T[]) => React.ReactNode; // count + aggregate
defaultCollapsedGroups?: string[];
// tree variant:
getSubRows?: (row: T) => T[] | undefined; // 14px indent per depth, twirl on parents only
```

## A6. Sticky / pinned columns + horizontal scroll matrix — Decision: extend-variant

**Context.** `table-sticky-columns.tsx` gap note: "`DataTable` / `ColumnDef` has NO column-pinning capability — it only sticks the HEADER row (top), not LEFT/RIGHT columns." The weekly matrix (left: check + 従業員 pinned; right: 操作 pinned; inset box-shadow separators) is fully composed from `Table*` primitives. `DataTable.Content` only sets `bg-secondary sticky top-0` on the header.

**Options considered.**
- *Extend* `ColumnDefProp` with `sticky?: "left" | "right"` (or `pinned`), letting `DataTable.Content` compute sticky offsets + shadow separators.
- *New component* — no; pinning is per-column metadata on the existing table.
- *App-level* — rejected; correct `left`/`right` offset math depends on sibling column widths the component already knows.

**Decision + rationale.** Extend. Pinning is the single highest-cost table composition (full re-implementation); it belongs on the column definition so offset/shadow logic lives once in `DataTable.Content`.

**API sketch.**
```ts
// data.prop.ts — ColumnDefProp<T> addition:
sticky?: "left" | "right";
```
Implementation: `DataTable.Content` accumulates `left`/`right` offsets across consecutive sticky columns and applies an inset box-shadow on the boundary cell.

## A7. Footer totals / aggregate row — Decision: extend-variant

**Context.** `table-footer-totals.tsx` gap note: "`DataTable` has NO footer slot." comp-table ① footer + V17 require a `表示中 N / 全 M 件 · 合計 16.2 h · 残業 0.2 h` aggregate row with tabular-nums, aligned to the same columns. Built today by appending a manual `<tr>` outside the component.

**Options considered.**
- *Extend* `ColumnDefProp` with a `footer?` cell + a `DataTable.Footer` slot, so totals align to columns.
- *New component* — no; the footer must inherit column widths/alignment.
- *App-level* — rejected; column-aligned totals require the component's `<colgroup>`/cell geometry.

**Decision + rationale.** Extend. A footer aggregate is column-bound; expressing it via `ColumnDefProp.footer` keeps numbers under their columns and inherits `align`/tabular-nums.

**API sketch.**
```ts
// data.prop.ts — ColumnDefProp<T> addition:
footer?: (rows: T[]) => React.ReactNode; // rendered in <tfoot>, inherits align
```
```tsx
<DataTable.Footer /> // emits the <tfoot> row from column.footer; optional summary text slot
```

## A8. Pagination modes (numbered + load-more + period-jump) — Decision: extend-variant

**Context.** `table-pagination.tsx` builds three pagination cards: numbered (`<< < 1..5 … 52 > >>` + page-size select), load-more ("さらに N 件読み込む" + "x/y 表示中"), and cursor/period-jump (month select + ← 前の月 / 次の月 →). The real `DataTable.Pagination` is **cursor-only** (`cursor`/`hasMore`/`onChange`, rendering just first/next buttons). comp-table ⑩ mandates all three, chosen by data shape.

**Options considered.**
- *Extend* `DataTable.Pagination` with a `mode` prop (`cursor | numbered | loadMore`) and the props each mode needs.
- *New component* — a standalone `Pagination` could be reused outside tables; but the existing slot already lives in `DataTable`.
- *App-level* — rejected; pagination is core list infrastructure, not one-off.

**Decision + rationale.** Extend the existing `DataTable.Pagination` slot with a discriminated `mode`. (Period-jump is a thin wrapper over a `Select` + prev/next and can stay app-level, or ship as a `mode: "period"` later.) Keeps one pagination entry point.

**API sketch.**
```tsx
type PaginationProps =
  | { mode?: "cursor"; cursor?: string; hasMore: boolean; onChange: (c?: string) => void }
  | { mode: "numbered"; page: number; pageCount: number; pageSize: number;
      pageSizeOptions?: number[]; onPageChange: (p: number) => void;
      onPageSizeChange?: (n: number) => void }
  | { mode: "loadMore"; loaded: number; total: number; increment: number; onLoadMore: () => void };
```

## A9. Conditional row/cell formatting — Decision: extend-variant (cell) + app-level (row)

**Context.** `table-conditional-format.tsx` gap note: "DataTable の ColumnDef は per-row / per-cell の className フックを持たない (render は ReactNode を返すのみ)." Row-level tint (遅刻≥5 → red row) is composed from real `TableRow` + token class; cell tint (早退>2h → `bg-attention/10 text-attention`) is done inside `ColumnDef.render` (which the note confirms IS expressible). Depends on **A0** for the correct `attention` token instead of the `destructive` fallback.

**Options considered.**
- *Extend* `ColumnDefProp` with `cellClassName?: (row) => string` and `DataTable` with `rowClassName?: (row) => string`.
- *New component* — no.
- *App-level* — cell formatting already works via `render`; only the **row-level** className lacks a hook.

**Decision + rationale.** Add a `rowClassName(row)` hook to `DataTable` (the one genuinely missing primitive); keep cell formatting as a documented `render` recipe (it already works). A `cellClassName` on `ColumnDefProp` is a nice-to-have to avoid wrapper spans but is optional.

**API sketch.**
```tsx
rowClassName?: (row: T) => string | undefined; // e.g. row.late >= 5 → "bg-destructive/5"
```
```ts
// optional ColumnDefProp<T> addition:
cellClassName?: (row: T) => string | undefined;
```

---

# B) New components

## B1. ColumnManager — Decision: new-component

**Context.** comp-table ③ + view-builder require drag-grip (⠿) reorder, lock/必須列 (disabled + 🔒), search, "N / M 表示中", show/hide toggles, reset. No column-visibility/order API exists on `DataTable` and none of the table showcases attempt it. This is a self-contained popover/panel that *configures* a table rather than being part of its row markup.

**Options considered.**
- *Extend* DataTable with column-order/visibility props — but the management **UI** (drag list, search, lock) is large and reusable across non-table surfaces.
- *New component* — a `ColumnManager` panel that emits order/visibility; `DataTable` consumes the resulting `columns`.
- *App-level* — rejected; the drag/lock/reset UX is too involved to re-hand-roll per page.

**Decision + rationale.** New component for the management UI; it pairs with a thin `columnOrder`/`hiddenColumns` controlled surface on `DataTable`. The popover is standalone and reusable; the table just renders the filtered/ordered `columns` it's handed.

**API sketch.**
```tsx
<ColumnManager
  columns={ColumnDescriptor[]}      // { key; label; locked?; hidden? }
  onChange={(next: ColumnDescriptor[]) => void} // reorder + show/hide
  onReset={() => void}
/>
// DataTable side: columnOrder?: string[]; hiddenColumns?: string[]
```

## B2. ViewTabs (saved-view ribbon) — Decision: new-component

**Context.** `table-view-tabs.tsx` builds a saved-view ribbon with `Tabs variant="line"`, per-view count and a colored `.dot` (`DOT_CLASS`), plus a "+ ビューを保存" affordance — composed because no view-ribbon primitive exists. comp-table ① / CRM PageHeader tabs specify horizontal-scroll tabs with `.count` pill + colored dot.

**Options considered.**
- *Extend* `Tabs` — but the count-pill + colored-dot + save affordance is a distinct, named pattern, not a generic tab.
- *New component* `ViewTabs` wrapping `Tabs` with the saved-view affordances.
- *App-level* — workable (it's just styled `Tabs`), but the pattern recurs on every list, so a named component prevents drift in the dot/count styling.

**Decision + rationale.** New component, thin wrapper over the existing `Tabs` primitive, encoding the count pill + colored dot + "save view" slot. Standalone and list-agnostic.

**API sketch.**
```tsx
<ViewTabs
  views={{ id; label; count?; dot?: DotToneProp }[]}
  value={string} onValueChange={(id) => void}
  onSaveView?={() => void}
/>
```

## B3. ImportExportWizard — Decision: new-component

**Context.** comp-table ⑪ (V15): 4-step import stepper (file → mapping → validate → apply), validation-error table, progress bar, SHIFT-JIS detection; export with format radios (UTF-8 BOM / SHIFT-JIS / xlsx / PDF) + range + columns. `tables.md` §7.14 explicitly calls this "entirely absent; would be its own feature, not a DataTable prop." No showcase builds it.

**Options considered.**
- *Extend* DataTable — rejected; import/export is a workflow, not table markup.
- *New component* — a `ImportWizard` / `ExportDialog` pair (stepper + validation table + progress).
- *App-level* — rejected; the SHIFT-JIS/stepper/validation logic is substantial and reusable across every data domain.

**Decision + rationale.** New component(s). This is a standalone feature with its own state machine; it composes `Stepper`/`Progress`/`DataTable` internally but is not a table prop.

**API sketch.**
```tsx
<ImportWizard steps={["file","mapping","validate","apply"]}
  encoding={EncodingProp} onComplete={(rows) => void} />
<ExportDialog formats={["csv-utf8-bom","csv-sjis","xlsx","pdf"]}
  range={RangeProp} columns={string[]} onExport={(opts) => void} />
```

## B4. Spinner — Decision: new-component

**Context.** Inline busy affordances (load-more pending, import progress, toolbar refresh) need a determinate-agnostic spinner. `Progress` exists for bars; there is no standalone `Spinner` primitive, so showcases fall back to text-only loading rows (`DataTable.Content` renders `t("dataTable.loading")` text). `PendingProp` exists in vocab but has no visual primitive.

**Options considered.**
- *Extend* Button only — too narrow; spinners appear outside buttons (cards, rows, inline).
- *New component* `Spinner` atom bound to `PendingProp` + `SizeProp`.
- *App-level* — rejected; a spinner is a foundational atom that everything reuses.

**Decision + rationale.** New atom. Small, ubiquitous, and currently missing; pairs with the existing `PendingProp`.

**API sketch.**
```tsx
<Spinner size?={SizeProp} label?={string} /> // aria-busy, respects prefers-reduced-motion
```

## B5. SegmentedControl — Decision: new-component

**Context.** comp-table ④ density popover and ⑤ AND/OR filter conjunction both use a 2–3 option segmented radio. The 3-level density toggle (A1) needs exactly this control. `Tabs` is semantically wrong (navigation, not single-select form value); no segmented primitive exists, so `table-density.tsx` hand-rolls radio buttons.

**Options considered.**
- *Extend* `Tabs` — wrong semantics (Tabs are for panels, not a form value).
- *New component* `SegmentedControl` — a single-select, button-group radio bound to `OnValueChangeProp`.
- *App-level* — rejected; it's a foundational form control reused by density, AND/OR, and view filters.

**Decision + rationale.** New atom. Distinct ARIA (radiogroup), distinct from `Tabs`; directly powers A1's 3-way density and the filter conjunction toggle.

**API sketch.**
```tsx
<SegmentedControl
  options={{ value; label; icon? }[]}
  value={string} onValueChange={OnValueChangeProp}
  size?={SizeProp}
/>
```

## B6. Advanced filter panel + filter-chip bar — Decision: new-component (panel) + app-level (chip bar)

**Context.** `table-filter-chips.tsx` gap note: "DataTable has no built-in filter-chip bar… composed here from real primitives (Badge + Button + SearchInput + Select)." comp-table ④ adds a multi-condition panel (conj·field·op·value·×, AND/OR segmented, nested OR group, "適用 (推定 N 件)" precount, save-as-view). Vocab has `OnSearchChangeProp`/`OnClearFiltersProp`/`HasActiveFiltersProp` (`data.prop.ts:41-47`) but **no filter-condition model**.

**Options considered.**
- *Extend* DataTable — rejected; filtering happens in the consumer, then filtered `data` is passed in (as the showcase already does).
- *New component* `FilterBuilder` panel (condition rows + AND/OR + nested group + precount) emitting a typed condition model.
- *App-level* — the **chip bar** is trivially `Badge + Button` and varies per page; keep it as a recipe. The **builder panel** is complex and reusable → component.

**Decision + rationale.** Split: ship a `FilterBuilder` component with a `FilterConditionProp` model for the heavy multi-condition/nested-OR panel; keep the lightweight removable-chip bar as an app-level composition (documented recipe). The chip bar's variability per list does not justify an API.

**API sketch.**
```ts
type FilterConditionProp = { field: string; op: string; value: unknown; conj?: "and" | "or" };
type FilterGroupProp = { conj: "and" | "or"; conditions: (FilterConditionProp | FilterGroupProp)[] };
```
```tsx
<FilterBuilder fields={FieldDescriptor[]} value={FilterGroupProp}
  onChange={(g) => void} estimateCount?={number} onSaveView?={() => void} />
```

---

# C) Highest-priority atomic gap

## A0. `attention` tone missing from ToneProp / Badge — Decision: extend-variant (vocabulary atom)

**Context.** The design SSOT mandates a fixed signalling color **朱 (attention)** distinct from **茜 (destructive)**, with an explicit rule (`tables.md` §1, §3, recap line 31): *"Prefer 朱 attention over 茜 destructive for non-destructive alerts (遅刻/早退)."* The CSS tokens already exist and are consumed raw — `table-conditional-format.tsx:122` uses `bg-attention/10 text-attention` directly, and `:76` references `bg-attention/15 border-attention/40`. But `ToneProp` (`interaction.prop.ts:25`) has no `attention` member, and `Badge`'s tone is `Extract<BadgeTone, "success" | "warning" | "destructive" | "info" | "neutral">` (`badge.tsx:31`) — `attention` is **not selectable**. Consequence, visible across showcases: 遅刻/早退/欠勤/残業/休憩 statuses are forced onto the *wrong* tones — gap notes in `table-bulk-actions.tsx:22` ("朱→attention via …"), `table-expandable-rows.tsx:18` ("attention 朱 via destructive tone reserved for…"), `table-filter-chips.tsx:18` ("早退 attention→warning"), and `table-sticky-columns.tsx` (遅刻 rendered as `Badge tone="warning"`). The token exists; the **prop vocabulary cannot name it**, so every consumer either fakes it with `destructive`/`warning` (semantically wrong, violates the SSOT rule) or drops to raw class strings (bypasses the controlled vocabulary).

This is the single highest-leverage gap: it is one atomic enum member, but it affects late/early-leave/overtime/break signalling **across the entire system** — every Badge, every status chip cell, every conditional-format rule, in tables and beyond.

**Options considered.**
- *Extend-variant* — add `"attention"` to `ToneProp` and to `Badge`'s tone `Extract`, wired to the existing `toneAttentionClass` (sibling of the existing `toneWarningClass`/`toneDestructiveClass` in `lib`). One-line vocab change + one class mapping.
- *New component* — rejected; this is a tone value, not a widget. A bespoke `<AttentionBadge>` would fork Badge for one color.
- *App-level* — status quo (raw `bg-attention` classes / `destructive` fallback). Rejected: it violates the controlled-vocabulary API gate and the SSOT's destructive-vs-attention distinction, and it silently mis-signals non-destructive alerts as destructive.

**Decision + rationale.** Extend the vocabulary. `attention` is a first-class semantic tone in this design system (朱, between warning 山吹 and destructive 茜) with tokens already shipped. Naming it in `ToneProp` lets `Badge`, status chips, and conditional-format rules express 遅刻/早退/残業 correctly and removes the raw-class workarounds. This unblocks A9 (conditional cell tint) and the whole status-chip column vocabulary. **Recommended first** of all ADRs.

**API sketch.**
```ts
// interaction.prop.ts — ToneProp:
export type ToneProp =
  | "default" | "success" | "warning"
  | "attention"            // ← 朱: non-destructive alert (遅刻/早退/残業/休憩)
  | "destructive"          //    茜: reserved for true destructive/欠勤・却下
  | "info" | "muted" | "neutral";
```
```ts
// badge.tsx — widen the selectable subset + map the class:
tone: Extract<BadgeTone, "success" | "warning" | "attention" | "destructive" | "info" | "neutral">;
// toneAttentionClass → bg-attention/… text-attention (token already exists)
```

---

## Index

| ID | Gap | Decision | Source showcase / API |
|----|-----|----------|-----------------------|
| **A0** | `attention` tone (朱) | **extend-variant** (vocab) — *do first* | `interaction.prop.ts:25`, `badge.tsx:31`, conditional-format/sticky/filter/bulk/expandable notes |
| A1 | Three-level density | extend-variant — *2nd* | `table-density.tsx`; `layout.prop.ts:19` |
| A2 | Multi-sort + priority | extend-variant | comp-table ⑤; `SortStateProp` |
| A3 | Column resize / auto-fit | extend-variant | comp-table ⑤; `ColumnDefProp.width` |
| A4 | Expandable detail rows | extend-variant | `table-expandable-rows.tsx` |
| A5 | Grouped rows + tree | extend-variant | `table-grouped-subtotals.tsx`, `table-tree-rows.tsx` |
| A6 | Sticky/pinned columns | extend-variant — *3rd* | `table-sticky-columns.tsx` |
| A7 | Footer totals row | extend-variant | `table-footer-totals.tsx` |
| A8 | Pagination modes ×3 | extend-variant | `table-pagination.tsx` |
| A9 | Row/cell conditional format | extend-variant (cell via render) + rowClassName | `table-conditional-format.tsx` |
| B1 | ColumnManager | new-component | comp-table ③ / view-builder |
| B2 | ViewTabs ribbon | new-component | `table-view-tabs.tsx` |
| B3 | Import/Export wizard | new-component | comp-table ⑪ |
| B4 | Spinner | new-component | `DataTable.Content` loading text |
| B5 | SegmentedControl | new-component | `table-density.tsx`, comp-table ④ |
| B6 | FilterBuilder (+ chip bar app-level) | new-component / app-level | `table-filter-chips.tsx`, comp-table ④ |

**Total: 16 ADRs** (10 DataTable extensions incl. A0's downstream A9, 6 new components; A0 is the atomic vocabulary gap; B6 splits into new-component panel + app-level chip bar).
