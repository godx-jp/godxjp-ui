# Badge / Tag / Chip / Pill / Count — audit + normalized spec

> **Canonical taxonomy:** <https://namethatui.com/web/badge-chip-pill?part=badge-count>
> **Capability reference:** Ant Design `Badge` + `Tag` (never their prop spellings where they
> conflict with `docs/PROPS-VOCABULARY.md`).
> **Contract:** `.claude/skills/godxjp-ui-component/SKILL.md` is the hard gate.

## 1. The canonical taxonomy — five different things, routinely confused

| Term | Canonical definition | Interactive? |
| --- | --- | --- |
| **Badge** | A tiny count or status marker **attached to another object**. Parts: the *badge anchor* (the icon/avatar it attaches to) and the *badge count* (the number in the bubble). | No |
| **Tag** | Non-interactive **category metadata** on a card or row. | No |
| **Pill** | A **shape**, not a component — a capsule-shaped status label. | No |
| **Chip** | A compact **interactive token** that can be selected, edited or removed. Parts: a *remove button* (a real `<button>` with an `aria-label`) and a *selected state* (`aria-pressed`). | Yes |
| **Label** | The text naming a form field (`<label for>`). | No |

## 2. What the library actually has, mapped onto that taxonomy

| Repo component | What it really is | Verdict |
| --- | --- | --- |
| `Badge` (`src/components/data-display/badge.tsx`) | A **Tag / Pill** — a standalone non-interactive chip with `variant` (structure), `tone` (meaning), `color` (data), `shape`, `status`→tone+icon+i18n. Nothing is attached to an anchor and there is no count. | **Misnamed, but keep the name** — see §5. Capability-wise it is *richer* than Ant's `Tag` (the `color` wash carries a real WCAG argument: 8.52:1 worst case across the sRGB cube). |
| `Toggle` / `ToggleGroupItem` | The **selectable Chip** — `pressed`/`onPressedChange` (= `aria-pressed`) plus the `count`/`overflowCount`/`showZero`/`countLabel` counter-pill vocabulary. Its own catalog entry already says a faceted filter chip ("Open 42") and a reaction chip are this, and explicitly forbids nesting a `Badge` inside it. | **Already correct.** Do **not** build a second selectable chip. |
| `TagInput` | The **chip field** — Ant-aligned (`tagRender`, `status`, `readOnly`, overflow, Backspace-removes-last). Its removable chips are **private markup** (`.ui-tag-input-chip` + a `<button aria-label>`). | Chip rendering is trapped inside it — see §4.2. |
| `Label` | A real `<label>` on `react-aria-components`. | **Correct.** Not part of this family. |
| `Button` | Also carries `count`/`overflowCount`/`showZero`/`countLabel`. | Source of the count vocabulary to reuse. |

## 3. The gap — what Ant Design has and this library does not

Verified: `count` / `overflowCount` appear **only** in `Button`, `Toggle`, `ToggleGroup` and their
props. `Badge` has no `count` at all, and nothing anywhere renders a bubble attached to a child.

| Ant Design | Missing here | Consequence today |
| --- | --- | --- |
| antd `Badge` with `count` wrapping an `Avatar` — the count bubble on an anchor | **Entirely** | No way to put an unread count on an avatar, a nav icon, a Topbar bell or a tab. `Sidebar`/`NavList` take a `badge` prop, but that renders the Tag-style pill *inline*, not an attached marker. |
| antd `Badge` with `dot` — the bare dot marker | **Entirely** | No "there is something new" affordance. |
| `overflowCount` → `99+` on a marker | **Entirely** | (The cap exists on `Button`/`Toggle`; it never reaches a marker.) |
| `<Tag closable onClose>` — the removable chip | **Not public** | Only exists privately inside `TagInput`; a filter-summary row or a recipient list has to hand-roll a ✕ button, which is how `aria-label`-less removers get shipped. |
| `<Badge.Ribbon>` | Entirely | Composition — see §4.4. |
| `<CheckableTag>` | — | **Already covered by `Toggle`.** No action. |

## 4. The fix — one new component, one extension, two documentation fixes

This deliberately adds the **minimum**. Three of the five gaps close by extending what exists;
building a `Chip` component would duplicate `Toggle` and is an instant reject.

### 4.1 NEW — `CountBadge` (group: `data-display`)

The attached count/status marker. Ant's `Badge`; NameThatUI's *badge* proper.

**GATE 0 ledger**

| # | Criterion | Verdict | Why |
| --- | --- | --- | --- |
| C1 | Universal | **PASS** | Unread counts on avatars, nav icons, bells, tabs, inbox rows — every app. |
| C2 | Reusable behavior | **PASS** | Overflow capping, zero suppression, dot mode, anchor-relative placement that survives RTL, and folding the count into the anchor's accessible name / announcing changes politely. |
| C3 | Not composable | **PASS** | Requires an absolutely-positioned marker measured against an arbitrary child plus a live-region contract. A `Badge` in a `<div className="relative">` is exactly the hand-rolled version this replaces. |
| C4 | Single responsibility + vocabulary | **PASS** | One job; reuses the count vocabulary already defined by `Button`. |
| C5 | Token-themeable | **PASS** | Size, offset, surface, ring are `--count-badge-*` tokens. |
| C6 | Earns the i18n/a11y contract | **PASS** | `Intl.NumberFormat` for the number *and* the cap (vi renders `1.000+`), and the count must be announced, not merely drawn. |
| C7 | Earns bundle cost | **PASS** | Used by nav chrome in every consumer. |

**ALL PASS → framework component.**

**API — reuse the EXISTING count vocabulary verbatim.** `Button` and `Toggle` already define
`count` / `overflowCount` / `showZero` / `countLabel`. Do not invent a second spelling; a third
dialect of the same idea is the defect this repo keeps fixing.

| Ant Design | **godx `CountBadge`** |
| --- | --- |
| `count` | `count: number` |
| `overflowCount` | `overflowCount: number` (default `99`) |
| `showZero` | `showZero: boolean` (default `false`) |
| `dot` | `dot: boolean` — a marker with no number |
| `children` | `children` — the **anchor**; omit it for a standalone inline marker |
| `status` + `text` | *dropped* — that is `Badge status=…`, which already exists |
| `color` | `tone` (semantic) — the free-form data colour stays `Badge`'s job |
| `offset` | *dropped* — placement is `placement` + tokens, never a caller-supplied pixel pair |
| `size: 'default' \| 'small'` | `size: 'xs' \| 'sm' \| 'md' \| 'lg'` (never `"default"`) |
| `title` | `countLabel` — same name `Button` uses |
| — | `placement: 'start' \| 'end'` (logical; flips under RTL) |

**Required semantics**
- The number and the cap both go through `Intl.NumberFormat` on the active locale — never
  `String(n)`, never a hand-rolled thousands separator. Above the cap render `{overflowCount}+`.
- `count={0}` renders nothing unless `showZero`.
- The marker is **not** an accessible name of its own floating next to the anchor: fold it into the
  anchor's name via a visually-hidden text node (`t()`-driven, e.g. "Notifications, 5 unread"), or
  expose `countLabel`. A bare "5" read out of context is a bug.
- A changing count updates a single `aria-live="polite"` region — not one per marker.
- `dot` mode still needs a text alternative; **never colour-or-shape-only** (WCAG 1.4.1).
- Placement uses logical offsets (`inset-inline-end`), so it flips under `dir="rtl"`.
- The marker must not clip: it overflows the anchor box deliberately, and the anchor keeps its own
  hit area ≥24×24px (WCAG 2.5.8).

**Tokens** — `src/tokens/components/count-badge.css`, `@import`ed from `src/tokens/base.css`,
names passing `check:token-tiers`: `--count-badge-size`, `--count-badge-dot-size`,
`--count-badge-inset-block`, `--count-badge-inset-inline`, `--count-badge-background`,
`--count-badge-foreground`, `--count-badge-ring-color`, `--count-badge-ring-width`,
`--count-badge-font-size`. No literal heights.

**i18n** — `countBadge.unreadCount` (a CLDR `{one, other}` plural selected by `Intl.PluralRules`,
in en/vi/ja), `countBadge.new` for `dot`.

### 4.2 EXTEND — `Badge` gains `onRemove` (this *is* the removable Chip)

Rather than a new `Chip` component that would collide with `Toggle`:

- Add `onRemove?: () => void` and `removeLabel?: string` to `Badge`. When `onRemove` is present the
  badge renders a trailing `<button type="button">` with a `t()`-driven `aria-label` naming the
  item it removes ("Remove {tag}"), a ≥24×24px target, and `Backspace`/`Delete` support when the
  badge itself is focused. `Badge` renders a `<div>`/`<span>`, so this is **not** a button-in-button.
- Then **fix it upstream, not at the call site**: refactor `TagInput` to render its chips as
  `Badge onRemove=…` instead of the private `.ui-tag-input-chip` markup, so there is exactly one
  removable-chip implementation and one remover `aria-label` in the system. `TagInput`'s public API
  and its existing tests must not change — prove it by running them.
- Selection is **not** added to `Badge`. A selectable chip is `Toggle` (`pressed` + `count`), and
  the catalog must keep saying so.

### 4.3 DOCUMENT — the routing rules, so consumers stop guessing

The real reason this family "doesn't look like Ant Design" is that the map is unwritten. Add to
`mcp/src/data/components.ts`, on **both** sides of each pair (a one-sided claim is the mistake
commit `8365bf05` fixed):

- `Badge` tagline: state that in the canonical taxonomy this is the **Tag / Pill** — non-interactive
  category or status metadata — and that a count marker attached to an anchor is `CountBadge`.
- `Badge.related`: → `CountBadge` (counts on an anchor), `Toggle` (selectable chip),
  `TagInput` (an editable set of chips), `Label` (naming a form field).
- `CountBadge.related`: → `Badge`, `Toggle`, `Sidebar`/`NavList` `badge` props.
- New rules: *DON'T hand-roll a `<span>` counter or an absolutely positioned `Badge` to mark an
  anchor — use `CountBadge`.* *DON'T nest a `Badge` inside a `Toggle` for a count — `Toggle` owns
  `count`.* *DON'T build a selectable chip out of `Badge` + `onClick` — use `Toggle`.*

### 4.4 COMPOSITION — not framework components

- **Ribbon** (Ant `Badge.Ribbon`): C2 and C3 fail — it is a `Card` plus an absolutely positioned
  `Badge` plus a corner token. Ship it as a `docs/` showcase, never in `src/components/`.
- **Status dot + text** (Ant `Badge status text`): already `Badge status=…`, which maps the key to
  tone + icon + an i18n label. No new API.

## 5. Explicitly NOT doing: renaming `Badge`

`Badge` is used across the entire library and every consumer. Renaming it to `Tag` to satisfy the
taxonomy would be a breaking change that buys nothing a catalog tagline cannot. **Keep the name;
document the meaning.** No agent may rename, alias or deprecate `Badge` under this work.

## 6. Definition of done

1. `src/components/data-display/count-badge.tsx`, exported from that group's `index.ts`
2. `CountBadgeProp` (+ `as CountBadgeProps`) in `src/props/components/data-display.prop.ts`,
   **registered in `src/props/registry.ts`**; `Badge`'s `onRemove`/`removeLabel` added to its prop type
3. `src/tokens/components/count-badge.css` + `@import` in `src/tokens/base.css`
4. i18n keys in **all three** of `en.json`, `vi.json`, `ja.json`
5. Tests in `src/components/data-display/__tests__/`: `count-badge.test.tsx` (Intl formatting in
   en/vi/ja, cap → `99+`, `showZero`, `dot`, RTL placement, live-region announcement, accessible
   name folding), `badge-remove.test.tsx` (remove button name, keyboard, ≥24px), and
   `count-badge.a11y.test.tsx` at **0 axe violations**
6. `mcp/src/data/components.ts`: a `CountBadge` entry, `Badge`'s new props, and the §4.3 routing
   rules on both sides
7. A real-screen docs page `docs/data-display/count-badge.tsx`
8. `TagInput` refactored onto `Badge onRemove`, with its existing tests still green

Gates, then only the touched test files:

```
pnpm typecheck && pnpm lint && pnpm run audit \
  && pnpm check:prop-vocabulary && pnpm check:mcp-sync && pnpm check:mcp-orphans \
  && pnpm check:token-tiers && pnpm check:control-sizing && pnpm check:example-imports
```

`pnpm test` and a bare `pnpm vitest run` are **forbidden** — the full suite is CI's job.
