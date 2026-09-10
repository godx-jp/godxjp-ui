# `List` (Ant `Listy`) + `Masonry` — normalized spec

> **Capability reference:** <https://ant.design/components/listy> and
> <https://ant.design/components/masonry>. **Canonical definition:**
> <https://namethatui.com/web/masonry>.
> **Contract:** `.claude/skills/godxjp-ui-component/SKILL.md`.

Measured facts this spec rests on: the library has **no virtualization anywhere**
(no `react-window` / `@tanstack/react-virtual` / any `virtual` code path in `src/`), and **no
masonry** (every `grid-template-columns` in `src/styles/` is a fixed uniform grid; `ResponsiveGrid`
is a uniform-row card grid). Both are genuine holes, not restyling jobs.

---

## 1. `List` — port of Ant Design `Listy` (group: `data-display`)

Ant's old `List` is **deprecated** and `Listy` replaces it. Port `Listy`, not `List`: it is the
narrower, performance-shaped component (virtual scrolling + grouping), which is exactly the part
that cannot be composed here.

### GATE 0 ledger

| # | Criterion | Verdict | Why |
| --- | --- | --- | --- |
| C1 | Universal | **PASS** | Long feeds, activity streams, message lists, pickers, log views. |
| C2 | Reusable behavior | **PASS** | Windowed rendering, measured row heights, sticky group headers, an imperative `scrollTo` that resolves an item key or a group key to an offset. |
| C3 | Not composable | **PASS** | Nothing in the library virtualizes. `ScrollArea` + `.map()` renders every row. |
| C4 | Single responsibility + vocabulary | **PASS** | One job; maps onto `items` / `getRowId` / `size`. |
| C5 | Token-themeable | **PASS** | Row height, group-header surface, divider are `--list-*` tokens. |
| C6 | Earns the contract | **PASS** | A virtual list is where `role`/`aria-setsize`/`aria-posinset` are *mandatory* — the DOM no longer contains the whole set. |
| C7 | Earns bundle cost | **PASS** | Every consumer has at least one long list. |

**ALL PASS → framework component.**

### API — Ant `Listy` → godx `List`

| Ant `Listy` | **godx `List`** | Note |
| --- | --- | --- |
| `items` | `items: T[]` | |
| `itemRender(item, index)` | `itemRender(item, index)` | |
| `rowKey` | **`getRowId: (item: T) => string`** | The house spelling — `DataTable` already uses `getRowId`. Do not introduce `rowKey` as a second dialect. |
| `height` | `height?: number` | Scroll container height; content scrolls past it. |
| `virtual` | `virtual?: boolean` (default `false`) | |
| `group: { key, title }` | `group?: { key: (item) => K; title: (key, items) => ReactNode }` | |
| `sticky` | `sticky?: boolean` (default `false`) | Group headers stick. |
| `onScroll` | `onScroll?: React.UIEventHandler<HTMLElement>` | |
| `classNames` / `styles` | `classNames?: { root?; item?; groupHeader? }` | Keep the semantic-slot shape; skip the `styles` twin (inline style is not how this system themes). |
| ref `scrollTo(config)` | ref `scrollTo(config)` | Accepts a pixel offset, `{ top }`, `{ key, align?, offset? }`, or `{ groupKey, align?, offset? }`. |
| — | `size: 'xs' \| 'sm' \| 'md' \| 'lg'` | House requirement. |
| — | `loading?: boolean`, `empty?: ReactNode` | Compose the real `Skeleton` / `EmptyState`; do not hand-roll either. |

**Deliberately NOT ported** (and say so in the catalog entry, so nobody re-adds them): `bordered`,
`split`, `header`, `footer`, `size: 'large'`, `pagination`, `loadMore`, `itemLayout`. `Listy`
dropped them, and here they are already covered — the frame is `Card` + `CardContent flush`,
dividers are `Separator`, paging is `Pagination`. Re-adding them would rebuild a second `Card`.

### Required semantics
- `role="list"` with `role="listitem"` rows; when `virtual`, every row **must** carry `aria-setsize`
  (the full count) and `aria-posinset` — otherwise a screen reader reports the window, not the list.
  This is the single most-skipped part of a virtual list and it is not optional.
- Grouping renders `role="group"` with the header as its `aria-label`/`aria-labelledby`.
- Keyboard: the scroll container is focusable; `PageUp`/`PageDown`/`Home`/`End` work. Rows are not
  a roving-tabindex widget — interactive controls inside a row keep normal tab order.
- `sticky` headers use `position: sticky` with logical insets and must not cover the focused row
  (`scroll-margin-block-start`).
- Row heights are measured, not assumed; a row whose content grows must not desynchronise the
  window. Reserve image dimensions.
- `prefers-reduced-motion: reduce` disables any smooth-scroll in `scrollTo`.

### Tokens
`src/tokens/components/list.css` (`@import` from `src/tokens/base.css`): `--list-row-min-height`
(from the `--control-height` tier), `--list-divider-color`,
`--list-group-header-background`, `--list-group-header-foreground`, `--list-group-header-height`.

### Spacing — the list does NOT own its inline inset

Read `docs/SPACING.md` before writing a single spacing declaration. A row inside a
`Card` + `CardContent flush` takes its inline inset from the public class **`ui-card-inset-x`**
(which reads `--card-space-inset`), so the row lines up with the card shell and follows the card's
`density`. **Do not invent a `--list-row-padding-inline`** — a parallel spacing knob drifts away
from the Card that contains it, and the block axis is owned by `--list-row-min-height`.

Macro rhythm is never the component's: no Tailwind `p-*` / `m-*` / `gap-*` (the audit rejects them
as `no-utility-spacing`), no hand-rolled `flex`/`grid` (`no-utility-layout`). Vertical rhythm comes
from `Flex gap` on the φ scale (`xs`/`sm` = 4px grid, `md` = φ⁰, `lg` = φ¹, `xl` = φ²) — this repo
does **not** use the 8pt grid.

### i18n
`list.empty`, `list.loading`, `list.group` (group-header accessible name), and any count through
`Intl.NumberFormat` + `Intl.PluralRules`.

---

## 2. `Masonry` (group: `layout`)

**Canonical definition** (NameThatUI): *a layout where each new item joins the shortest column,
creating a staggered bottom edge with no row lines and cards keeping their individual heights.*
The named part is the **packed column** — each column flows straight down, nothing lines up
sideways. Aliases: Pinterest grid, waterfall, brick layout.

### GATE 0 ledger

| # | Criterion | Verdict | Why |
| --- | --- | --- | --- |
| C1 | Universal | **PASS** | Media galleries, card boards, dashboards with variable-height cards. |
| C2 | Reusable behavior | **PASS** | Shortest-column packing, re-packing on resize/content change (`ResizeObserver`), and keeping DOM reading order row-major while the visual flow is column-major. Native `grid-template-rows: masonry` covers the paint but not the ordering or the fallback. |
| C3 | Not composable | **PASS** | `ResponsiveGrid` is a uniform grid; nothing packs by column height. |
| C4 | Single responsibility + vocabulary | **PASS** | One job; `columns`/`gap` reuse `ResponsiveGrid`'s exact spellings. |
| C5 | Token-themeable | **PASS** | Gaps come from the spacing scale. |
| C6 | Earns the contract | **PASS** | Reading order vs visual order is an accessibility decision, not a style one. |
| C7 | Earns bundle cost | **PASS** | Small; broadly useful. |

**ALL PASS → framework component.**

### API — Ant `Masonry` → godx `Masonry`

| Ant Design | **godx `Masonry`** | Note |
| --- | --- | --- |
| `columns: number \| { xs, sm, md }` | `columns: number \| { base?, sm?, md?, lg? }` (default `3`) | **Use `ResponsiveGrid`'s existing breakpoint shape** (`base/sm/md/lg`), not antd's `xs/…/xxl`. One breakpoint dialect in this library. |
| `gutter: Gap \| [Gap, Gap]` | `gap: 'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` (default `'md'`) | Token scale, exactly as `ResponsiveGrid`. A caller-supplied pixel pair is not how this system spaces. |
| `items: MasonryItem[]` | `items: MasonryItemProp[]` — `{ key, children?, data?, column? }` | Drop antd's `height`: heights are measured, never declared. |
| `itemRender(item)` | `itemRender(item, index)` | `item.children` still wins. |
| `fresh` | `observeItems?: boolean` (default `true`) | Keep watching child sizes via `ResizeObserver`; the antd name says nothing. |
| `onLayoutChange` | `onLayoutChange?: (placements: { key: Key; column: number }[]) => void` | |
| `classNames` / `styles` | `classNames?: { root?; item? }` | Skip the `styles` twin. |
| — | `sequential?: boolean` | Fill columns left-to-right in order instead of shortest-first, for a strict reading order. |

### Required semantics
- **Reading order is DOM order.** Whatever the visual packing, the DOM stays in `items` order so
  keyboard and screen-reader traversal match the source sequence. This is the reason the CSS
  `columns` fallback alone is not acceptable — it flows column-major.
- Prefer native `@supports (grid-template-rows: masonry)`; fall back to measured absolute/transform
  packing. Never ship the bare `columns:` fallback as the only path.
- The container is a plain grouping element with no invented role. If the content is a list, the
  **caller** supplies the semantics; `Masonry` must not silently impose `role="list"`.
- Re-pack on container resize and on item resize (`ResizeObserver`), debounced to a frame.
- Reserve media dimensions (`AspectRatio`) so image loads do not cause layout shift — call this out
  in the docs page.
- Logical CSS only; column order flips under `dir="rtl"`.

### Tokens
`src/tokens/components/masonry.css`: `--masonry-gap-inline`, `--masonry-gap-block`,
`--masonry-column-min-inline-size`.

---

## 3. Definition of done (both)

Per component: source + group `index.ts` export · `XProp` (+ `as XProps`) in the group's
`*.prop.ts` **and `src/props/registry.ts`** · tokens file + `@import` in `src/tokens/base.css` ·
i18n keys in **en/vi/ja** · `@testing-library/user-event` behaviour tests + a `*.a11y.test.tsx` at
**0 axe violations** · an `mcp/src/data/components.ts` entry (including the "deliberately not
ported" list for `List`) · a real-screen docs page.

For `List`, the virtual-mode test must assert `aria-setsize`/`aria-posinset` reflect the **full**
item count while only a window is in the DOM. For `Masonry`, a test must assert DOM order equals
`items` order under every `columns` value.

Gates, then only the touched test files. `pnpm test` and a bare `pnpm vitest run` are **forbidden**.
