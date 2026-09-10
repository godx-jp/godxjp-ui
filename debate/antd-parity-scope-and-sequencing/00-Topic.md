# Debate — Ant Design parity for `@godxjp/ui`: scope, sequencing, and agent organisation

**Status:** `decided`
**Opened:** 2026-09-10
**Project:** `/Users/satoshi01/Herd/godxjp-ui`

---

## The question

The user's standing complaint is that **most `@godxjp/ui` components are missing features
compared to Ant Design**, and the explicit requirement is *"không miss"* — do not let capabilities
slip through unnoticed.

Decide the **single best strategy** for reaching Ant Design parity, answering all four of:

1. **Scope** — which Ant Design surface gets ported into `src/components/`, and which does not?
2. **Composition boundary** — how is "this is a framework component" vs "this is a composition
   pattern in the consumer app / a `docs/` showcase" decided, and by whom?
3. **Priority** — what order is the work done in, and what makes something P0 vs P2?
4. **Execution** — how is the work split across parallel coding agents without two agents editing
   one file, and without the machine (and the budget) being destroyed?

The answer must be **actionable this week**, not a philosophy.

---

## Measured context (do not re-derive; verify if you doubt it)

These facts were measured in the repo on 2026-09-10 and are the factual base of the debate.

| Fact | Evidence |
| --- | --- |
| The library has **127 catalogued components** | `mcp/src/data/components.ts` |
| **No virtualization exists anywhere** in `src/` | no `react-window` / `@tanstack/react-virtual` dep; no `virtual` code path |
| **No masonry / column packing exists** | every `grid-template-columns` in `src/styles/` is a uniform grid |
| **No standalone `Tree` exists.** `TreeSelect` embeds one in a dropdown; `TreeList` is a flat `<ul>` where `depth` only drives `margin-inline-start` | `src/components/data-display/tree-list.tsx` (41 lines); `src/components/data-entry/tree-select.tsx` (499 lines) |
| `TreeList` has **no ARIA tree semantics at all** (only `aria-current`), no keyboard, and props are literally `{ items }` | `src/components/data-display/tree-list.tsx` |
| **No count/notification badge exists.** `count`/`overflowCount` live only on `Button`, `Toggle`, `ToggleGroup` | `src/components/general/button.tsx`, `src/components/ui/toggle.tsx` |
| The repo's `Badge` is, by canonical taxonomy, a **Tag/Pill** — non-interactive, unattached, countless | `src/components/data-display/badge.tsx` |
| A **selectable chip already exists** as `Toggle` (`pressed` + `count`); its catalog entry forbids nesting a `Badge` inside it | `mcp/src/data/components.ts:11682` |
| **Nothing chat/AI-related exists** (no Bubble/Sender/Conversations/ThoughtChain equivalents) | 127 catalog entries, none conversational |
| `Tabs`, `Steps`, `Segmented` are **already deliberately Ant-aligned** — their prop types cite antd prop names in comments; remaining gaps are narrow (Tabs overflow "more" dropdown; Steps `responsive`/`initial`; Segmented `shape`) | `src/props/components/navigation.prop.ts:201-345`, `src/components/ui/segmented.tsx` |
| Ant's `List` is **deprecated**, replaced by `Listy` (virtual + grouping only; `bordered`/`split`/`header`/`footer`/`pagination` all dropped) | <https://ant.design/components/listy> |

### Work already in flight (constrains the execution answer)

Six agents are running **in one shared working tree**: three writing code (`ChatBubble`+
`ChatBubbleList`, `ChatComposer`+`ChatSuggestion`, `Tree`) and three running read-only parity
audits (`data-entry`; `data-display`+`feedback`; `layout`+`navigation`+`general`). The tree also
carries ~968 lines of unrelated uncommitted work from another session.

### Existing specs (read them — they encode decisions already taken)

`docs/roadmap/antd-parity.md` · `tree-components.md` · `badge-tag-chip-count.md` ·
`list-masonry.md` · `ai-chat-components.md`

---

## Hard constraints (a proposal violating any of these is disqualified)

1. **GATE 0** (`docs/COMPOSITION-VS-COMPONENT.md`): nothing enters `src/components/` without all
   seven of C1–C7 passing, with the ledger published. "When in doubt, compose."
2. **No duplication.** Re-creating a capability an existing primitive owns is an instant reject
   (8 redundant components were deleted for this reason).
3. **Controlled vocabulary** (`docs/PROPS-VOCABULARY.md`): `value`/`defaultValue`/`onValueChange`,
   `open`/`defaultOpen`/`onOpenChange`, `size ∈ xs|sm|md|lg` (never `"default"`), `tone`, positive
   booleans. Where a house spelling exists (`getRowId`, `gap`, `columns:{base,sm,md,lg}`,
   `count`/`overflowCount`/`showZero`), it wins over Ant's spelling.
4. **International contract on every component**: `t()` for every string and `aria-label`,
   `Intl`/CLDR for all formatting, WAI-ARIA APG + WCAG 2.2 AA with a vitest-axe test at 0
   violations, logical CSS only.
5. **Design-knob discipline** (cardinal rules #44/#45): a per-instance visual knob must be a
   documented **token**, not a new prop.
6. **Every public change** needs an `mcp/src/data/components.ts` entry, a `src/props/registry.ts`
   entry, and a real-screen docs page.
7. **`pnpm test` / bare `pnpm vitest run` are forbidden outside CI** — 506 files / 3700+ tests;
   parallel agents running it took the machine past load 90 and burnt a monthly API budget.
8. Agents share one working tree; two agents must never edit the same file concurrently.

---

## OPTIONS (discrete, mutually exclusive — pick exactly one as the primary strategy)

### Option A — **Ledger-driven capability parity**
Audit every one of the 127 catalogued components against its Ant Design counterpart, producing a
per-component ledger (`PRESENT` / `RENAMED` / `COVERED-ELSEWHERE` / `MISSING` / `WONT-PORT`) with
`file:line` evidence. Fix `MISSING` rows in P0→P1→P2 order, closing gaps by **extending existing
components** wherever possible; add a new component only on a 7/7 GATE-0 pass. Agents are assigned
**one component group each**, serialized so no group has two writers.
*This is the strategy currently in motion.*

### Option B — **Consumer-screen-driven parity**
Reject the Ant surface as the target. Drive from the real consumer (Platform): walk its actual
screens, find every place a developer hand-rolled markup, reached past the public API, or was
blocked, and fix those. Parity with Ant emerges only where it actually matters. Accepts that
capabilities nobody has yet needed stay unbuilt, on the argument that an unused ported prop is a
liability (bundle, API surface, maintenance) rather than an asset.

### Option C — **Wholesale surface port, prune later**
Port the Ant Design component and prop surface systematically and near-completely — including
things GATE 0 would currently send to composition — accepting deliberate bloat as the price of
"không miss". Prune later based on telemetry/usage. Maximises coverage; directly challenges
constraints 1 and 2 and the bundle-cost criterion C7.

### Option D — **Contract-first: parity as an executable, checked artifact**
Before fixing anything, build a machine-readable **antd↔godx capability map** (a data file: each
Ant component/prop → `PRESENT | RENAMED:<name> | COVERED-ELSEWHERE:<component> | MISSING |
WONT-PORT:<reason>`), plus a `pnpm check:antd-parity` gate that fails when the map and the real
prop registry drift apart. The map — not a prose roadmap — becomes the source of truth, so a gap
cannot silently reappear and "không miss" is enforced by CI rather than by diligence. Fixing then
drains the map.

> Advocates: argue your assigned option is best **as the primary strategy**. You may propose that
> another option is folded in as a subordinate tactic, but you must defend a clear primary.

---

## Scoring rubric (Judge scores every option on all five; weights sum to 100)

| # | Criterion | Weight | What a high score means |
| --- | --- | --- | --- |
| 1 | **Coverage / "không miss"** | 25 | Capability gaps cannot silently persist or reappear. Detection is systematic, not dependent on someone noticing. |
| 2 | **Correctness & international integrity** | 25 | What ships is genuinely correct — APG semantics, keyboard, `Intl`, RTL — not a prop that merely exists. A wrong-but-present prop scores **worse than absent**. |
| 3 | **Fit with codebase discipline** | 20 | Honours GATE 0, no-duplication, controlled vocabulary, token-vs-prop discipline. Does not require suspending the repo's own rules. |
| 4 | **Cost, effort & machine load** | 15 | Realistic for parallel agents on one machine and one budget. Respects constraints 7 and 8. |
| 5 | **Reversibility** | 15 | A wrong call is cheap to undo. Adding a public component is near-irreversible (consumers bind to it); a token or a doc is cheap. |

---

## Roster

| Role | Mandate |
| --- | --- |
| **ADV-A** | Strongest case for Option A (ledger-driven capability parity) |
| **ADV-B** | Strongest case for Option B (consumer-screen-driven) |
| **ADV-C** | Strongest case for Option C (wholesale port, prune later) |
| **ADV-D** | Strongest case for Option D (contract-first executable parity map) |
| **SKEPTIC** | Red team. Attacks **all four** options — hidden assumptions, failure modes, cost, correctness risk. May not agree by default. Joins at R1. |
| **JUDGE** | Neutral. Scores against the rubric, never advocates, writes `04-Decision.md`, records dissent. |

## Rounds

- **R0** — blind opening (advocates only, isolated; may read only this file + the repo + the web)
- **R1** — rebuttal with mandatory steelman (advocates + Skeptic)
- **R2** — Judge cross-examination, then advocate answers
- **R3** — Judge writes `04-Decision.md`; status → `decided`
