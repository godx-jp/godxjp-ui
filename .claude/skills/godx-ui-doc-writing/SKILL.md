---
name: godx-ui-doc-writing
description: "Binding doc-authoring procedure for @godxjp/ui. Read BEFORE editing any .md file in this repo — CLAUDE.md, AGENTS.md, docs/specs/, docs/, SKILL.md, ADRs, or CHANGELOG.md. Specifies frontmatter shape per file type, upstream-spec re-fetch cadence, Diátaxis quadrant discipline, cross-link patterns, and the cardinal rules every doc must respect (27 per-group folder, 28 src/ taxonomy, 29 stories-use-primitives)."
---

# godx-ui-doc-writing

The binding procedure for writing or editing **any** Markdown file
in this repo (`@godxjp/ui`). **This skill is the authoritative source.**

The procedure is **non-skippable**. Doc drift is the most expensive
class of bug an agent can ship in a documentation-heavy framework
like this one: a single stale path or rule reference teaches
consumers to do the wrong thing for every future PR.

## A note on "umbrella" references

`@godxjp/ui` is consumed by godx-jp's internal monorepo (the
"umbrella") as a git submodule pinned by SHA. The umbrella has its
own `new-docs/` with cross-cutting platform rules (consumer SPA
wiring, monorepo CI, lockfile parity, etc.) that this submodule
does NOT carry.

When this repo is cloned standalone from
`github.com/godx-jp/godxjp-ui`, the umbrella is not present and
its rules are not reachable. **This skill, plus this repo's
`CLAUDE.md` / `AGENTS.md` / `docs/specs/`, is sufficient on its own**
— there is nothing outside this tree an agent needs to consult.

References to "umbrella rule N" elsewhere in this skill are
informational provenance (where the discipline originated), not a
binding source. The rule as written below is what applies.

## When to invoke

- BEFORE editing this repo's `CLAUDE.md`, `AGENTS.md`, or `BRAND.md`.
- BEFORE writing or editing a file under `docs/specs/`, `docs/`,
  `.claude/skills/`, or `.codex/skills/`.
- BEFORE adding a new ADR under `docs/adr/`.
- BEFORE bumping a section header / renaming a key concept
  anywhere — the rename has to ripple through every doc.
- WHEN you find a stale reference (e.g. `src/components/primitives/`
  flat folder, `@godxjp/ui/data`, `new-primitives/` Storybook
  prefix) — pause and fix it instead of working around it.

If you find yourself reaching for "this looks close enough to the
old doc shape", **STOP** and run the procedure.

# Part 1 — Frontmatter shape by file type

Different file types take different frontmatter (or none at all).
The shape is locked by canonical upstream specs. Mismatches are
rejected at review.

| File path pattern | Frontmatter | Canonical spec |
|---|---|---|
| `CLAUDE.md` (root or nested) | **NONE.** Pure markdown. | https://code.claude.com/docs/en/memory.md |
| `AGENTS.md` (root or nested) | **NONE.** Pure markdown. | https://agents.md/ |
| `.claude/skills/<name>/SKILL.md` | YAML — `name`, `description` (≤200 chars, used by RAG) | https://code.claude.com/docs/en/skills.md |
| `.codex/skills/<name>/SKILL.md` | Byte-identical mirror of `.claude/` | (mirror — `scripts/sync-skills.sh`) |
| `docs/specs/*.md` (this repo's binding rules) | **NONE.** Pure markdown — these are agent-binding rule files, not Diátaxis content. | this skill §A |
| `docs/**/*.md` (non-ADR leaves) | YAML — see §A below | https://diataxis.fr + this skill §A |
| `docs/**/README.md` (Diátaxis index) | YAML — `diataxis: index` | this skill §A |
| `docs/adr/*.md` | YAML — MADR 3.0 frontmatter | https://adr.github.io/madr/ |
| `CHANGELOG.md` | **NONE.** | https://keepachangelog.com/en/1.1.0/ |
| `BRAND.md`, `LICENSE` | **NONE.** | n/a |
| `README.md` (repo root) | **NONE.** | https://github.com/RichardLitt/standard-readme |

## §A — Diátaxis frontmatter (docs/**/*.md)

Required keys (every doc/ leaf and every doc/<quadrant>/README.md):

```yaml
---
title: "<string, ≤80 chars>"             # Must match the rendered H1 exactly
description: "<string, ≤200 chars>"      # Used by RAG, search, social
diataxis: tutorial | how-to | reference | explanation | adr | index
audience:                                # Sequence of strings
  - developer | operator | designer | ai-agent | end-user
status: draft | review | published | deprecated
last-updated: 2026-05-17                 # ISO 8601 date (RFC 3339)
lang: en                                 # BCP 47 (en, ja, ja-JP, vi)
---
```

Optional keys: `authors[]`, `reviewers[]`, `tags[]`, `canonical-url`,
`related[]` (repo-relative paths), `deprecated-by`, `ogp.image`,
`ogp.type`. This repo's docs also carry `library: "@godxjp/ui"` +
`library_version: 3.0.0` (consistent across the tree).

**Forbidden keys** (each belongs elsewhere — DRY):

- `service:` — inferred from path
- `version:` — `package.json` is authoritative
- `path:` — the file's own location
- `category:` — use `diataxis:`
- `author:` (singular) — use `authors:` (sequence)
- `created:` — `git log --diff-filter=A` is authoritative
- `permalink:` / `slug:` — use `canonical-url:`
- `updated:` — must be `last-updated:` (rename)

## §B — MADR 3.0 frontmatter (docs/adr/*.md)

```yaml
---
diataxis: adr
library: "@godxjp/ui"
library_version: 3.0.0
adr: "0001"                              # Zero-padded 4-digit string
title: "Use Radix UI as the accessibility foundation"
status: proposed | accepted | superseded | rejected | deprecated
date: 2026-01-14                         # Original decision date
last-updated: 2026-05-17                 # Most recent edit
deciders: [ "@operator", "@designer" ]   # Optional
consulted: [ ]                           # Optional
informed: [ ]                            # Optional
audience: [developer]
lang: en
---
```

## §C — Skill frontmatter (.claude/skills/<name>/SKILL.md)

```yaml
---
name: <kebab-case-slug>                  # Must match folder name
description: "<≤200 chars, used by RAG to decide invocation>"
---
```

That's it — no other frontmatter keys. The body carries the
binding procedure. The `description` is the most important field
because it's what agents search against to decide whether to
invoke the skill.

# Part 2 — Re-fetch upstream specs each session

Binding: before writing or editing any agent-manifest file
(CLAUDE.md, AGENTS.md, SKILL.md, ADR), open the canonical upstream
documentation in your current session and re-read it. Cache is not a
substitute. Cite the URL + last-fetched date in your PR body.

The reason: vendor specs ship new keys, new validation rules, new
defaults without versioned release notes. The drift between "the way
it was in our last PR" and "the way the vendor recommends today" is
the failure mode this rule prevents.

| File kind | Upstream URL | Cadence |
|---|---|---|
| `CLAUDE.md` | https://code.claude.com/docs/en/memory.md | Every authoring session |
| `AGENTS.md` | https://agents.md/ | Every authoring session |
| `.claude/skills/*/SKILL.md` | https://code.claude.com/docs/en/skills.md | Every authoring session |
| MADR ADR | https://adr.github.io/madr/ | Every authoring session |
| Keep a Changelog | https://keepachangelog.com/en/1.1.0/ | Every authoring session |
| Diátaxis | https://diataxis.fr | Every authoring session |

**PR body must include**: `Consulted https://code.claude.com/docs/en/memory.md on YYYY-MM-DD.`

# Part 3 — Diátaxis quadrant discipline

Every file under `docs/` belongs to exactly ONE quadrant. The
`diataxis:` frontmatter key declares it. Picking the wrong quadrant
is the #1 cause of doc drift.

| Quadrant | Purpose | Voice |
|---|---|---|
| **tutorial** | Learning-oriented. Walks a beginner end-to-end through a complete journey. | "We will do X. Now do Y. You have just done Z." |
| **how-to** | Task-oriented. Recipe for someone who already knows what they want. | "To do X: 1. … 2. … 3. …" |
| **reference** | Information-oriented. The authoritative API / catalogue. Dry, exhaustive. | "X accepts a Y. Returns Z. Throws W when …." |
| **explanation** | Understanding-oriented. The WHY. Background, design rationale, trade-offs. | "We chose X because Y. The alternative was Z, but …" |
| **adr** | A single accepted/superseded architectural decision record (MADR 3.0). | Past tense — decisions are historical. |
| **index** | Tree / quadrant README. Lists children, no content. | n/a |

**Forbidden** (rejected at review):

- A how-to with a paragraph of design rationale → split: rationale moves to an explanation, recipe stays in how-to with a `related:` link.
- A reference page with a tutorial-style preamble → drop the preamble.
- A tutorial that references a future step that hasn't been written → write the tutorial as a complete journey or move to how-to.

# Part 4 — Cross-link discipline

Every doc points to the rule it implements (in `docs/specs/`) and the
ADR(s) it builds on (in `docs/adr/`).

```markdown
This page implements [cardinal rule 23 (concept-first API)](../../CLAUDE.md#23)
and the vocabulary specified in
[04 — prop vocabulary](../specs/04-prop-vocabulary.md).
```

Use **repo-relative paths** in markdown links, never absolute URLs
or service-host URLs. The `related:` frontmatter key carries
machine-readable cross-references.

# Part 5 — Content rules

These apply to every doc body:

1. **No marketing speak** (cardinal rule 9 — banned: "powerful",
   "robust", "blazing fast", "best-in-class", "seamless",
   "enterprise-grade"). State what it does.
2. **Inclusive naming** (cardinal rule 8 — `allowlist`/`denylist`,
   `main`/`primary`, never `whitelist`/`blacklist`/`master`).
3. **No service-specific references** in framework docs (cardinal
   rule 19 — `me-service`, `forge-service` etc. are forbidden in
   primitive source AND in primitive docs).
4. **English is canonical** (cardinal rule 10). Localised docs
   live in `docs/i18n/<bcp47>/`.
5. **No `--no-verify` bypassing** (cardinal rule 12). Pre-commit
   gates exist for a reason.
6. **Reference cardinal rules by number** (`cardinal rule 27`,
   `§23.B`, `rule 28 §A`) — not by old names like "MUST RULE #11".

# Part 6 — The 10-step procedure

Before editing any doc:

1. **Pick the right file**. Is this content actually a binding rule
   (→ `docs/specs/` + CLAUDE.md), a reference (→ `docs/reference/`),
   a recipe (→ `docs/how-to/`), or a learning journey (→
   `docs/tutorials/`)? Wrong-quadrant content is the #1 cause of
   doc drift — pick once, commit.

2. **Re-fetch the upstream spec**. Per §3 above, open the vendor
   URL in your session. Don't trust memory.

3. **Read the existing file end-to-end**. Don't paragraph-patch —
   you'll create inconsistencies between sections.

4. **Check frontmatter against §1**. If the file should have
   frontmatter, validate every required key. If it shouldn't,
   strip any stray frontmatter (per §1's "NONE" rows).

5. **Update the `last-updated:` field** to today's ISO date.

6. **Reference cardinal rules by number**. Search for
   `MUST RULE #` and `rule #` (legacy) — replace with
   `cardinal rule N`.

7. **Resolve stale references**. Grep for deleted concepts:
   `src/components/primitives/` (flat — now per-group),
   `src/data/`, `src/clients/`, `src/components/screens/`,
   `@godxjp/ui/data`, `@godxjp/ui/components/screens`,
   `@godxjp/ui/clients/media`, `new-primitives/` (Storybook
   prefix — now flattened). Fix to current state.

8. **Cross-link to the rule(s) implemented**. Per §4.

9. **Spell-check + scan for marketing speak**. Per §5.

10. **Verify locally**: `pnpm build` (no broken imports from doc
    examples), `pnpm lint:tokens` (if the doc touches CSS / token
    syntax), `pnpm sync:skills` (if you touched `.claude/skills/`
    or `.codex/skills/`).

# Part 7 — Anti-patterns (rejected at review)

- Inserting frontmatter into `CLAUDE.md` / `AGENTS.md` / `docs/specs/`
  / `CHANGELOG.md` / `README.md` / `BRAND.md`. These have NO
  frontmatter by spec.
- A doc that doesn't cite the cardinal rule it implements.
- A how-to with a 4-paragraph rationale section (move to
  explanation).
- A reference page that paraphrases the source instead of
  exhaustively documenting it.
- A new ADR that doesn't carry `date:` (the original decision date)
  AND `last-updated:` (most recent edit) AND `status:`.
- Editing a `docs/` file without bumping `last-updated:`.
- A doc using `updated:` instead of `last-updated:` (legacy key
  name — §A specifies `last-updated:` only).
- A doc lacking `title:` / `lang:` / `status:` (required by §B.3).
- A doc referencing `src/components/primitives/<X>.tsx` flat —
  primitives live under `src/components/<group>/<X>.tsx` per
  cardinal rule 27.
- A doc using the old `new-primitives/` Storybook title prefix —
  sidebar was flattened.
- A doc body containing service-specific copy (per cardinal
  rule 19 the framework is service-agnostic).

# Part 8 — Connected rules

- **Cardinal rule 9** — no marketing speak.
- **Cardinal rule 10** — English is canonical.
- **Cardinal rule 27** — per-group folder structure (any doc
  referencing component paths uses the group form).
- **Cardinal rule 28** — strict src/ taxonomy (any doc listing
  dist surface or build inputs).
- **Cardinal rule 29** — stories use primitives (any story-related
  doc).

# Part 9 — Mirror discipline

This skill is mirrored to `.codex/skills/godx-ui-doc-writing/SKILL.md`
byte-identical for Codex sessions. Edit `.claude/`, then run
`pnpm sync:skills:apply` to refresh the Codex copy. The pre-commit
gate (`pnpm sync:skills`) blocks drift.
