# @godxjp/ui skills — CORE vs CONSUMER

There are **two separate skill families**. Pick the right family FIRST; they don't mix.

| | **CORE** | **CONSUMER** |
|---|---|---|
| **Who** | You maintain `@godxjp/ui` itself (this repo: `src/`, `docs/`, the MCP catalog) | You build an APP that imports `@godxjp/ui` |
| **Where** | `.claude/skills/` (this folder) — local to the repo | The **`godxjp-ui` MCP** (`mcp/`) — served to any agent, no repo checkout |
| **Entry** | Activate the `godxjp-ui-*` skill that matches the task | `list_consumer_skills` → `route_consumer_task` → `get_consumer_skill` |

> An app-dev does **not** read the CORE skills (they assume repo internals — `src/props/registry.ts`,
> `docs/`, the verify scripts). A maintainer building a real screen *can* pull consumer guidance from
> the MCP, but the binding contracts live here.

---

## CORE skills (this folder) — building @godxjp/ui itself

Chain them in this order; each links to the next.

| Skill | Owns | Read it when |
|---|---|---|
| **godxjp-ui-component** | the hard contract · *real-primitives / no-raw-HTML / MCP-first / no-duplication* | Creating/changing ANY component, recipe, doc, example — **FIRST** |
| **godxjp-ui-interaction-feel** | the catalogue of **state-truthful behaviours** | Building/auditing any stateful control (select/tree/cascader/calendar/range/combobox…) |
| **godxjp-ui-behavioral-test** | the **codify** discipline (browser MCP → user-event tests) | Proving an interaction works and locking it as a `pnpm test` regression |
| **godxjp-ui-example-page** | the **Audit Evidence Ledger** + docs-page completeness | Writing/auditing a `docs/**` catalogue page |
| **godxjp-ui-best-ux** | **Layout hygiene · Interaction hygiene · dxs-kintai DNA** (渋み/間/簡素) | Judging taste/UX on any repo surface |
| **godxjp-ui-design-handoff** | implementing a Claude Design bundle as a **showcase in `docs/`** | Turning a `claude.ai/design` export into repo showcases |
| **godxjp-ui-mcp-catalog-sync** | keeping the **MCP catalog + tests** in sync with the public API | Any change to a component/vocab/token/rule/pattern |
| **godxjp-ui-performance** | the **measure-first perf playbook** (longtask/Profiler/bundle probes) + lib per-import budget + proven consumer patterns | Anything feels slow, a `[Violation]` appears, or bundle size is questioned — lib OR app |

**Dedup rule (single owner):** a topic lives in exactly one skill; others point to it with `[[name]]`.
- *Real-primitives / no-raw-HTML* → **component**
- *Refined interaction behaviours* → **interaction-feel**
- *Layout/Interaction hygiene + dxs-kintai DNA* → **best-ux**
- *Audit Evidence Ledger* → **example-page**

Every CORE skill carries: a `🛠️ AUDIENCE: CORE` banner · a DO/DON'T table · a follow-map · a
self-track checklist.

---

## CONSUMER skills (via the MCP) — building an app WITH @godxjp/ui

These are **not files here** — they're served by the `godxjp-ui` MCP so any agent (Claude Code,
Codex, Cursor, …) can use them without this repo. Discover with `list_consumer_skills`.

| Consumer skill | Use when |
|---|---|
| **design-to-page** | You have a Claude Design handoff (bundle/mock/HTML) → build it as a real page in YOUR app |
| **compose-a-screen** | You have a written brief → assemble a new screen from real primitives |
| **taste / redesign / output / soft / minimalist / …** | Design-craft guidance (12 taste-family skills, tagged `consumer`/`both`) |

Shared **data tools** (both audiences): `get_component`, `get_tokens`, `get_rule`, `get_vocab`,
`get_pattern`, `search_components`, `suggest_primitive`, `lint_jsx`.

### Found a @godxjp/ui bug, or a rule you can't follow because the library is wrong?

**Don't hand-roll a fake workaround that hides the bug.** Call the MCP tool **`draft_bug_report`** →
it returns a detailed issue body + a `gh issue create --repo godx-jp/godxjp-ui …` command. File it,
then mark any minimal local workaround with `// TODO(godxui#<n>)`. (See `design-to-page/report-bug`
or `compose-a-screen/report-bug`.) The CORE counterpart for maintainers is fixing the system
directly — see **component-discipline** (`get_consumer_skill` will refuse it; it's core-only).

---

## Quick decision

```
Are you changing files inside this repo (src/ · docs/ · mcp/)?
├─ YES → CORE. Activate godxjp-ui-component first, then follow its chain.
└─ NO  → CONSUMER. Call the MCP: list_consumer_skills / route_consumer_task.
```
