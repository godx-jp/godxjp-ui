# Tree components — audit + normalized spec

> **Status:** audit complete 2026-09-10. `Tree` is NOT implemented. Read this before touching
> anything under `src/components/**/tree-*`.
> **Contract:** `.claude/skills/godxjp-ui-component/SKILL.md` is the hard gate. This document only
> normalizes *what* to build; the skill owns *how*.

## 1. What exists today (measured, not eyeballed)

| Thing | File | What it actually is |
| --- | --- | --- |
| `TreeSelect` | `src/components/data-entry/tree-select.tsx` (499 L) | A real tree, but only **inside a dropdown**. Ant-aligned API. |
| `TreeList` | `src/components/data-display/tree-list.tsx` (41 L) | **Not a tree.** A flat `<ul>` where `depth` is a number that only drives `margin-inline-start`. |
| `tree-utils` | `src/components/data-entry/tree-utils.ts` (216 L) | Normalize / flatten / filter / descendants. Sound, reusable. Currently private to `data-entry`. |
| `Tree` | — | **Does not exist.** |

### 1a. `TreeSelect` is fine — leave it alone

It is genuinely modeled on Ant Design: `treeData`, `fieldNames`, `treeCheckable`, `treeCheckStrictly`,
`showCheckedStrategy` (`SHOW_PARENT` / `SHOW_CHILD` / `SHOW_ALL`), `loadData`, `treeTitleRender`,
`maxTagCount`, `notFoundContent`. Markup carries `role="tree"` / `role="treeitem"` with
`aria-expanded` / `aria-selected` / `aria-multiselectable`. It is not the problem.

### 1b. `TreeList` is the problem — it promises a tree and delivers indentation

Verified against the source, the CSS (`src/styles/data-display-layout.css:282-334`) and its tests:

| Gap | Evidence |
| --- | --- |
| No nested data model | `items: TreeListItem[]` only — the caller must pre-flatten; there is no `children`. |
| No expand / collapse | No disclosure control anywhere in the component. NameThatUI calls this the **disclosure triangle**; an indented tree that expands is an **Outline View**. `TreeList` has neither. |
| No ARIA tree semantics | Only `aria-current`. No `role="tree"` / `role="treeitem"` / `aria-expanded` / `aria-level` / `aria-setsize` / `aria-posinset` / `aria-selected`. **Violates the mandatory WAI-ARIA APG gate.** |
| No keyboard | No arrows, Home/End, `*`, type-ahead. Rows are not focusable at all. |
| No selection contract | No `value` / `defaultValue` / `onValueChange`. **Violates the controlled-vocabulary rule (§2d).** |
| No `size`, no `ref`, no `className`/`...props` | Props are literally `{ items }`. **Violates §2d.** |
| Depth is uncapped but unstyled past 2 | Its own docs page says "Indentation is defined for depth 0-2, so flatten deeper branches". `tree-list-depth.test.tsx` asserts depth `5` sets the CSS var — which then renders at an indent nobody designed. |
| Missing every Ant affordance | no icons, no `showLine`, no drag & drop, no virtual scroll, no async `loadData`, no search/filter highlight, no `blockNode`, no DirectoryTree. |

**Conclusion:** the "tree components don't look like Ant Design" complaint is correct, and it is
localized: `TreeSelect` is fine, `TreeList` is a cosmetic indented list, and the standalone `Tree`
that every Ant-shaped app reaches for was never built.

## 2. GATE 0 ledger — `Tree` (required before any `src/components/**` addition)

| # | Criterion | Verdict | Why |
| --- | --- | --- | --- |
| C1 | Universal, not design-specific | **PASS** | File explorers, org charts, category pickers, permission trees, nav outlines. |
| C2 | Encapsulates reusable behavior | **PASS** | Roving tabindex, arrow/Home/End/`*` navigation, type-ahead, expand state, tri-state check propagation, async load. |
| C3 | Not composable from existing primitives | **PASS** | `Accordion` is single-level disclosure; `Timeline`/`NavList`/`ListRow` are flat. No primitive owns tree keyboard navigation on a page. |
| C4 | Single responsibility + controlled-vocabulary API | **PASS** | One job (render + navigate a hierarchy); maps cleanly onto the triads in §3. |
| C5 | Fully token-themeable | **PASS** | Indent, rail, glyph, row height all become `--tree-*` component tokens. |
| C6 | Earns the international contract | **PASS** | Needs correct APG semantics and RTL indentation; used everywhere. |
| C7 | Earns its bundle cost | **PASS** | Broad; also lets `TreeSelect` and `Tree` share one node renderer. |

**ALL PASS → `Tree` is a framework component.**

## 3. Normalized API — Ant Design name → godx controlled vocabulary

`Tree` mirrors Ant Design's *capabilities*, never its *prop names* where they conflict with
`docs/PROPS-VOCABULARY.md`. This mapping is the contract; do not invent a third spelling.

| Capability | Ant Design | **godx `Tree`** |
| --- | --- | --- |
| Data | `treeData` | `treeData: TreeOptionProp[]` (reuse the existing `TreeOptionProp` + `TreeFieldNamesProp`) |
| Field remap | `fieldNames` | `fieldNames` (unchanged — already in the registry) |
| Selection | `selectedKeys` / `defaultSelectedKeys` / `onSelect` | `value` / `defaultValue` / `onValueChange` |
| Multi-select | `multiple` | `multiple` |
| Checkboxes | `checkedKeys` / `onCheck` | `checkedValues` / `defaultCheckedValues` / `onCheckedValuesChange` |
| Checkbox mode | `checkable` | `checkable` |
| Independent checks | `checkStrictly` | `checkStrictly` |
| Expansion | `expandedKeys` / `onExpand` | `expandedValues` / `defaultExpandedValues` / `onExpandedValuesChange` |
| Expand all | `defaultExpandAll` | `defaultExpandAll` |
| Async children | `loadData` | `loadData` (same signature as `TreeSelect`'s) |
| Node label render | `titleRender` | `titleRender` |
| Connector lines | `showLine` | `showLine` |
| Node icons | `showIcon` / `icon` | `showIcon`, per-node `icon` |
| Full-width row | `blockNode` | *dropped* — always full-width row; that is the only correct hit area under WCAG 2.5.8 |
| Disclosure glyph | `switcherIcon` | *dropped* — the glyph is a token (`--tree-switcher-*`), not a prop |
| Density | — | `size: xs \| sm \| lg` (`md` is the default, never `"default"`) |
| Directory variant | `<DirectoryTree>` | `variant="directory"` |
| Drag & drop | `draggable` | **out of scope for v1** — file a follow-up issue |
| Virtual scroll | `virtual` / `height` | **out of scope for v1** — cap with `ScrollArea`; file a follow-up issue |

Plus the house rules: forward `ref`, spread `...props`, accept `className` + `id`, export
`TreeProp` and `TreeProp as TreeProps` from `src/props/components/data-display.prop.ts`, and
**register it in `src/props/registry.ts`**.

## 4. Required semantics (WAI-ARIA APG "Tree View")

- Container `role="tree"`, `aria-multiselectable` when `multiple` or `checkable`.
- Each node `role="treeitem"` with `aria-level` (1-based), `aria-setsize`, `aria-posinset`,
  `aria-selected`, and `aria-expanded` **only on nodes that have children**.
- Grouping wrapper `role="group"`.
- **Roving tabindex** — exactly one node has `tabIndex={0}`; all others `-1`.
- Keyboard: `↓`/`↑` next/previous *visible* node · `→` expand, then move to first child ·
  `←` collapse, then move to parent · `Home`/`End` first/last visible · `Enter`/`Space` select
  (or toggle the checkbox when `checkable`) · `*` expand all siblings at the current level ·
  type-ahead jumps to the next node whose label starts with the typed characters.
- Under `dir="rtl"`, `→`/`←` swap meaning and indentation flips — logical CSS only
  (`margin-inline-start`, `padding-inline-start`), never `ml-`/`pl-`/`left-`.
- Tri-state parent checkbox: checked / unchecked / **indeterminate** when only some descendants
  are checked (skip propagation entirely when `checkStrictly`).
- Ships `tree.a11y.test.tsx` with `expectNoA11yViolations` — 0 violations.

## 5. Tokens (tier: `src/tokens/components/tree.css`, `@import`ed from `src/tokens/base.css`)

Names must pass `pnpm check:token-tiers` (`--{component}-{part}-{property}`):
`--tree-node-height` (from the `--control-height` tier — never a literal), `--tree-indent-width`,
`--tree-switcher-size`, `--tree-switcher-color`, `--tree-line-color`, `--tree-node-selected-background`,
`--tree-node-hover-background`, `--tree-icon-size`. Row hit area ≥ 24×24px (WCAG 2.5.8).

## 6. i18n keys (`src/i18n/messages/{en,vi,ja}.json`)

`tree.expand`, `tree.collapse`, `tree.loading`, `tree.empty`, `tree.selected` (sr-only status —
selection must never be colour-only, WCAG 1.4.1). Every `aria-label` goes through `t()`.

## 7. `TreeList` — what happens to it

`TreeList` stays exported (it has consumers) but is **superseded**. Once `Tree` lands:

1. Mark it deprecated in `mcp/src/data/components.ts` with a replacement claim pointing at `Tree`.
2. The claim must be recorded on **both** sides of the catalog — see commit `8365bf05`
   ("a replacement claim only one side knew about taught the mistake it forbids").
3. Its docs page gains a banner: *use `Tree` when nodes expand; `TreeList` is a flat indented list.*
4. Do **not** delete it, do **not** change its API in this work.

## 8. Shared code

Move `src/components/data-entry/tree-utils.ts` to a location both groups can import
(`src/lib/tree.ts`), re-export from the old path so `TreeSelect` keeps working, and have `Tree`
consume the same `normalizeTreeOptions` / `flattenVisibleTree` / `getDescendantValues`.
**One tree model, two surfaces** — do not fork the traversal logic.

## 9. Definition of done

Cheap gates, then this component's tests only:

```
pnpm typecheck && pnpm lint && pnpm run audit \
  && pnpm check:prop-vocabulary && pnpm check:mcp-sync && pnpm check:mcp-orphans \
  && pnpm check:token-tiers && pnpm check:control-sizing && pnpm check:example-imports
pnpm vitest run src/components/data-display/__tests__ --maxWorkers=2
```

`pnpm test` / bare `pnpm vitest run` are **forbidden** — the full suite is CI's job.
