# Ant Design parity — the audit programme

> The complaint is systemic: *"hầu hết các component thiếu tính năng so với Ant Design."*
> This document is the **method**, so that 127 catalog entries can be audited by different agents
> and still produce comparable, reviewable results. Per-component specs live in sibling files.

## 0. Ground rules (a parity gap is not a licence to copy Ant Design)

1. **Capabilities are the target; prop names are not.** Map every antd prop onto
   `docs/PROPS-VOCABULARY.md` — controlled triad `value`/`defaultValue`/`onValueChange`,
   overlays `open`/`defaultOpen`/`onOpenChange`, `size ∈ xs|sm|md|lg` (never `"default"`),
   `tone` for status, positive booleans. Where the library already has a spelling
   (`getRowId`, `gap`, `columns: {base,sm,md,lg}`, `count`/`overflowCount`/`showZero`), **reuse it**.
   A third dialect of the same idea is the defect this repo keeps paying to fix.
2. **GATE 0 still applies.** A missing antd component is not automatically a framework component.
   Run the C1–C7 test in `docs/COMPOSITION-VS-COMPONENT.md` and publish the ledger. Ant ships
   things that are compositions here (`Badge.Ribbon`, `Welcome`, `Prompts`).
3. **Do not duplicate what exists.** Ant's `CheckableTag` is this library's `Toggle`. Ant's
   searchable select is `Select showSearch`. Check the MCP catalog before proposing anything.
4. **Do not port antd's mistakes.** Skip `styles={{…}}` inline-style twins (this system themes with
   tokens), pixel `offset` pairs, and physical `left/right` spellings.
5. **A gap is only real once measured.** Cite the file and line, or the absence of a grep hit.
   "Looks less capable than antd" is not a finding.

## 1. Spacing, geometry and token names — the rules already exist, so use them

This library is instrumented with ~60 checkers. Anything you write — **a spec document included** —
is machine-checkable, so check it before you hand it to anyone.

**Spacing is not free-form.** `docs/SPACING.md` is binding:

- Macro layout uses a **φ modular scale (≈1.618)**, *not* the 8pt grid. `xs`/`sm` = 4px grid,
  `md` = φ⁰, `lg` = φ¹, `xl` = φ². Applying Material's 8pt grid here is wrong, not "standard".
- Tailwind `p-*` / `m-*` / `gap-*` are rejected by `no-utility-spacing`; hand-rolled `flex`/`grid`
  by `no-utility-layout`. Rows are `<Flex>`, stacks `<Flex direction="col" gap>`, grids
  `<ResponsiveGrid>`, page sections spaced by `<PageContainer>` itself.
- **Card padding has a single owner**: `src/styles/card-layout.css`. Anything else that must sit on
  the same rhythm uses `ui-card-inset-x` / `ui-card-inset-y` / `ui-card-inset` — and those three do
  **not** share one value. Never invent a per-component inline-padding token where the Card already
  owns the inset.

**Component token names must match this exact shape** — `check:token-tiers` enforces it:

```
--{component}-{part}-{property}
```

where `{property}` is one of: `space color background foreground border radius height width padding
gap size font line letter shadow glow tint gradient alpha align inset offset translate max overflow
display`.

`surface`, `bg`, `fg`, `spacing` are **not** accepted words. Control boxes come from the
`--control-height` tier — never a literal height, never `calc(var(--control-height) ± …)`
(`check:control-sizing`), never a Tailwind scale literal (`check:no-hardcoded-geometry` —
even `min-w-0` fails).

**Before handing over any doc or spec, run at minimum:**

```
pnpm check:doc-prop-existence   # a prop named in an example must exist on that component —
                                # including a prop you only meant as an Ant Design illustration
pnpm check:token-tiers && pnpm check:no-hardcoded-geometry && pnpm run audit
```

This section exists because it was violated: a comparison table in
`badge-tag-chip-count.md` wrote an antd `Badge` + `count` example to illustrate *Ant's* API and
`check:doc-prop-existence` correctly read it as a claim about *ours*; and three specs named tokens
`--…-surface` / `--…-bg`, which the shape above forbids. Both were caught by gates that already
existed and simply had not been run.

## 2. The ledger format — every audit produces exactly this table

One row per antd capability. No prose findings.

| Ant Design prop / behaviour | Status | Evidence | Verdict |
| --- | --- | --- | --- |
| `<prop>` — one-line meaning | `PRESENT` / `RENAMED` / `COVERED-ELSEWHERE` / `MISSING` / `WONT-PORT` | `src/…:line`, or the grep that found nothing | for `MISSING`: the godx prop name to add, or "composition" |

- `RENAMED` — present under the house spelling. Record both names; no work.
- `COVERED-ELSEWHERE` — another primitive owns it. Name it. No work, but add a `related` cross-link
  in the catalog **on both sides** (a one-sided claim is the mistake commit `8365bf05` fixed).
- `WONT-PORT` — a deliberate refusal. State the reason in the catalog entry so nobody re-adds it.

Close every audit with a **priority call**: `P0` (breaks a real screen), `P1` (a workaround exists
but it is hand-rolled and a11y-risky), `P2` (nice to have).

## 3. Findings so far

### 3.1 Already specced — see the sibling documents

| Area | Verdict | Spec |
| --- | --- | --- |
| `Tree` / `TreeList` / `TreeSelect` | `TreeSelect` fine; `TreeList` is not a tree; **`Tree` missing entirely** | `tree-components.md` |
| Badge / Tag / Chip / Pill / Count | Count marker missing entirely; removable chip trapped inside `TagInput`; selectable chip already is `Toggle` | `badge-tag-chip-count.md` |
| `List` (Ant `Listy`) / `Masonry` | Both missing entirely — no virtualization and no column packing anywhere in `src/` | `list-masonry.md` |
| AI / chat surface | Nothing exists; 4 components + 6 compositions decided | `ai-chat-components.md` |

### 3.2 `Tabs`, `Steps`, `Segmented` — audited 2026-09-10

These three are **already deliberately Ant-aligned** — the prop types cite antd by name. The
remaining gaps are narrow, and none of them is P0.

**`Tabs`** (`src/props/components/navigation.prop.ts:301`, `src/components/navigation/tabs.tsx`).
Present: `items` (incl. `closable`/`closeIcon`/`icon`), `value`/`defaultValue`/`onValueChange`,
`variant` (`line`/`card`/`editable-card`), `tabPlacement`, `centered`, `extra`
(= antd `tabBarExtraContent`), `destroyOnHidden`, `onEdit`, `addIcon`, `hideAdd`. Overflow already
scrolls and keeps the active tab visible (`src/components/navigation/tabs-scroll.ts`).

| Gap | Priority | Verdict |
| --- | --- | --- |
| `moreIcon` + an overflow **"more" dropdown** when the strip cannot scroll (narrow viewports) | **P1** | Add. Scrolling alone hides tabs from a touch user with no affordance. |
| `indicator: { size, align }` | P2 | Add as tokens (`--tabs-indicator-*`), not props — it is a design knob (cardinal rule #44). |
| `tabBarGutter` | P2 | Token, not a prop. |
| `animated` | P2 | `WONT-PORT` as a prop — motion is a system decision and must follow `prefers-reduced-motion`. |
| `renderTabBar` | P2 | `WONT-PORT` — an escape hatch that lets a consumer bypass the a11y contract. |
| `size` lacks `xs` | P2 | Add `xs` for the full `xs\|sm\|md\|lg` tier. |

**`Steps`** (`src/props/components/navigation.prop.ts:201-240`).
Present: `items` (`title`/`subtitle`/`description`/`icon`/`status`/`disabled`),
`value`/`defaultValue`/`onValueChange`, `orientation`, `status`, `type`
(`default`/`dot`/`inline`/`navigation` — `dot` **is** antd's deprecated `progressDot`), `percent`,
`titlePlacement`, `separator`.

| Gap | Priority | Verdict |
| --- | --- | --- |
| `initial` — start the visible numbering at N | P2 | Add. Trivial, and real for resumed wizards. |
| `responsive` — auto-switch to vertical on a narrow container | **P1** | Add. Today a horizontal 5-step bar on a phone is the caller's problem. |
| `size` is `md\|sm` only | P2 | Extend to `xs\|sm\|md\|lg`. |

**`Segmented`** (`src/components/ui/segmented.tsx`). Built on Radix `RadioGroup` — the correct APG
choice, and the comment explaining why it is not a `ToggleGroup` should be preserved verbatim.
Present: `options` (`value`/`label`/`icon`/`disabled`), `value`/`defaultValue`/`onValueChange`,
`block`, `vertical`, `size`, `disabled`, `name`.

| Gap | Priority | Verdict |
| --- | --- | --- |
| `shape: 'default' \| 'round'` | P2 | Add as `shape` — the existing `ShapeProp` vocabulary already has `pill`; reuse it rather than antd's `round`. |
| Option as a bare `string \| number` | P2 | Add. Ant accepts it; it removes ceremony for the common case. |
| Per-option `title` (a tooltip / hover hint) | P2 | `COVERED-ELSEWHERE` — wrap the option in `Tooltip`. Do not add a second tooltip API. |
| `size` lacks `xs` | P2 | Add. |

**None of these three is the source of the "doesn't look like Ant Design" impression** — that is
`TreeList`, the missing count badge, and the missing `List`/`Masonry`/`Tree`.

## 4. How to run an audit (per component group)

1. Read the group's catalog entries in `mcp/src/data/components.ts` and the prop types in
   `src/props/components/<group>.prop.ts`.
2. Fetch the matching Ant Design docs page for each. Where a component's *identity* is unclear,
   settle it at <https://namethatui.com/?platform=web> before writing anything.
3. Produce the §2 ledger per component. Cite file:line.
4. Publish a GATE-0 C1–C7 ledger for anything proposed as a **new** component.
5. Do **not** write source in an audit pass. An audit is read-only; fixes are a separate wave with
   their own spec, so the diff stays reviewable and two agents never edit one file at once.
