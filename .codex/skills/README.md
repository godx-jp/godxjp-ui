# `@godxjp/ui` — agent skills

This repo is an **independent npm package** (`@godxjp/ui`) consumed
by every GoDX frontend. The skills below are the binding procedures
for agents working in this repo — self-contained, no external
dependencies.

## Skills

| Skill | Trigger |
|---|---|
| [`new-godx-design-to-component`](./new-godx-design-to-component/SKILL.md) | BEFORE writing or refactoring any primitive / composite / shell to match a Claude Design handoff. 10-step conversion procedure — read mockup → literal manifest → token-pin → DOM verbatim → axes coverage → Playwright probe → port stories. |
| [`godx-ui-doc-writing`](./godx-ui-doc-writing/SKILL.md) | BEFORE editing any `.md` file in this repo — CLAUDE.md, AGENTS.md, new-docs/, docs/, ADRs, SKILL.md, CHANGELOG.md. Frontmatter shape per file type, upstream-spec citation requirement, Diátaxis quadrant discipline, cardinal rules every doc must respect. |

## Mirror discipline

`.claude/skills/` (Claude Code) and `.codex/skills/` (Codex) hold
**byte-identical** copies of every skill. Edit one → run
`scripts/sync-skills.sh` to mirror to the other. Pre-commit hook
enforces the parity gate.

## Binding rules these skills implement

- [`CLAUDE.md`](../../CLAUDE.md) §22 — 100% match to design canon.
- [`CLAUDE.md`](../../CLAUDE.md) §21 — every component honours all four theme axes.
- [`CLAUDE.md`](../../CLAUDE.md) §23 — concept-first API, prop reuse, token existence check, peer-primitive read.
- [`CLAUDE.md`](../../CLAUDE.md) §25 — primitive is the canon; stories are docs.
- [`new-docs/05-design-handoff-formats.md`](../../new-docs/05-design-handoff-formats.md) — multi-format input + lint guardrails.

The skill body cites the rule numbers; the rules cite the skill —
neither half stands alone.
