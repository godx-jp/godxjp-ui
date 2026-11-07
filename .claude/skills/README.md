# @godxjp/ui skills — CORE, SHIPPED, CONSUMER

There are **three skill families**. Pick the right family FIRST; they don't mix.

|           | **CORE** (3)                                                                   | **SHIPPED** (2)                                                              | **CONSUMER (MCP)**                                                    |
| --------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Who**   | You maintain `@godxjp/ui` itself (this repo: `src/`, `docs/`, the MCP catalog) | You build an APP that installs `@godxjp/ui`                                  | Same, through any MCP client                                          |
| **Where** | `.claude/skills/` (this folder), local to the repo                             | `skills/` at the repo root, in the npm tarball, installable with `gx skills` | the `godxjp-ui` MCP (`mcp/`), which also serves the SHIPPED skills    |
| **Entry** | Activate the skill that matches the task                                       | `godxjp-ui-design` (app screens) or `godxjp-ui-brand-surface` (sign-in)      | `list_consumer_skills` → `route_consumer_task` → `get_consumer_skill` |

> An app-dev does **not** read the CORE skills (they assume repo internals — `src/props/registry.ts`,
> `docs/`, the verify scripts).

---

## CORE skills (this folder) — building @godxjp/ui itself

| Skill                   | Owns                                                                                                                                                                                                          | Read it when                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **agent-dev-loop**      | the four-phase batch loop (classify → implement → review → batch run) and the bans on the full suite; portable, this repo's numbers in `references/this-repo.md`                                              | Handed more than one issue — **first**                               |
| **godxjp-ui-component** | the hard contract (_real-primitives / no-raw-HTML / MCP-first / no-duplication_), plus `references/`: `interaction-feel.md`, `behavioral-test.md`, `example-page.md`, `mcp-catalog-sync.md`, `performance.md` | Creating/changing ANY component, recipe, doc, example — **first**    |
| **godxjp-ui-best-ux**   | layout hygiene · interaction hygiene · reference-design DNA (渋み/間/簡素), plus `references/`: `premium-craft.md` (+ `motion-probe.mjs`, study reports), `design-handoff.md`                                 | Judging taste/UX, upgrading a flat component, a Claude Design bundle |

**Dedup rule (single owner):** a topic lives in exactly one file; others point to it.

## SHIPPED skills (`skills/`) — in the npm tarball

| Skill                       | Covers                                                                                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **godxjp-ui-design**        | do/don't for app screens; `references/` `forms.md`, `navigation.md` (+ `navigation-principles.md`), `complex-admin.md`, `craft.md`     |
| **godxjp-ui-brand-surface** | an EXPRESSIVE sign-in / onboarding surface on the restrained kit; exemplar pattern `auth-brand-surface` + `references/exemplar-css.md` |

Written in English and consumer-agnostic like `agent/` (no product names). Each folder name equals its
frontmatter `name`. The MCP embeds them (`gen:agent-catalog` → `mcp/src/data/shipped-skills.generated.ts`);
each `references/<file>.md` becomes the section `references-<file>`.

## Merged skills (old name → where it lives now)

| Old skill                        | Now                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `godxjp-ui-form` (shipped)       | `skills/godxjp-ui-design/references/forms.md`                                                                         |
| `godxjp-ui-navigation` (shipped) | `skills/godxjp-ui-design/references/navigation.md`                                                                    |
| `design-complex-admin`           | `skills/godxjp-ui-design/references/complex-admin.md` (was a CONSUMER skill in this folder, hand-copied into the MCP) |
| `godxjp-ui-interaction-feel`     | `godxjp-ui-component/references/interaction-feel.md`                                                                  |
| `godxjp-ui-behavioral-test`      | `godxjp-ui-component/references/behavioral-test.md`                                                                   |
| `godxjp-ui-example-page`         | `godxjp-ui-component/references/example-page.md`                                                                      |
| `godxjp-ui-mcp-catalog-sync`     | `godxjp-ui-component/references/mcp-catalog-sync.md`                                                                  |
| `godxjp-ui-performance`          | `godxjp-ui-component/references/performance.md`                                                                       |
| `godxjp-ui-premium-craft`        | `godxjp-ui-best-ux/references/premium-craft.md`                                                                       |
| `godxjp-ui-design-handoff`       | `godxjp-ui-best-ux/references/design-handoff.md`                                                                      |

The MCP still answers `get_consumer_skill` for the three old consumer ids (`MERGED_SKILLS` in
`mcp/src/data/skills-index.ts`). Code comments in `src/` that name an old CORE skill refer to the file of
the same name in the table above.

---

## CONSUMER skills (via the MCP) — building an app WITH @godxjp/ui

Served by the `godxjp-ui` MCP so any agent (Claude Code, Codex, Cursor, …) can use them without this repo.
Discover with `list_consumer_skills`: `design-to-page`, `compose-a-screen`, the taste family, and the two
SHIPPED skills above.

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
├─ YES → CORE. A batch of issues: agent-dev-loop first. Any component work: godxjp-ui-component.
└─ NO  → SHIPPED / CONSUMER. godxjp-ui-design (or godxjp-ui-brand-surface), or the MCP:
         list_consumer_skills / route_consumer_task.
```
