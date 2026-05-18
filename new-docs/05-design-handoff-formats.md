# 05 — Design handoff formats

**Status:** Binding. Catalogue of supported design-handoff input
formats + how the framework maps each to its canonical token /
component model. Read before accepting a new handoff bundle,
before authoring a primitive that maps a handoff to code, and
before extending the lint / export tooling.

Per cardinal rule 22 the design canon is the contract. This doc
extends rule 22 by declaring **which canon formats** the framework
accepts. Multiple formats are fine; the contract per primitive
must cite which file (and which lines) it ports verbatim.

The doc draws on
[`google-labs-code/design.md`](https://github.com/google-labs-code/design.md)
specification — the AI-agent-readable design system format —
adapting its dual-layer (tokens + prose) discipline to our
existing handoff bundle workflow.

## §A — Supported input formats

| Format | Where | Use when | Maps to |
|---|---|---|---|
| **Claude Design HTML/CSS prototype** | `design-handoff/ui-system/<bundle>/project/preview/comp-<name>.html` | Default. User mocks on `claude.ai/design`, exports the bundle. | new-godx-design-to-component skill 10-step procedure |
| **`DESIGN.md` (google-labs)** | `design-handoff/<bundle>/DESIGN.md` (planned) | Token-first handoff — YAML front matter + markdown prose | Direct mapping to `theme.css :root` + new-docs/03 §B–§I + per-component story binding |
| **W3C DTCG JSON** | `design-handoff/<bundle>/tokens.dtcg.json` (planned) | Inter-tool exchange (Figma plugins, Penpot, Style Dictionary) | Imported via `scripts/import-tokens-dtcg.mjs` (planned) → `theme.css :root` |
| **Figma JSON export** | `design-handoff/<bundle>/figma.json` (planned) | Designer ships from Figma directly | Importer extracts colors / type / spacing → maps to existing token names |

The **default + current** format is the Claude Design
HTML/CSS prototype. Sections §B–§D below specify how additional
formats integrate without disrupting cardinal rule 22's
"100% design-canon fidelity" invariant.

## §B — Claude Design HTML/CSS prototype (default)

Bundle shape (re-stated for canonical reference):

```
design-handoff/ui-system/<bundle>/
├── README.md                       (CODING AGENTS: READ THIS FIRST)
├── chats/chat[1..N].md             (intent transcripts — read LAST first)
└── project/
    ├── SKILL.md                    (design-system author's binding rules)
    ├── colors_and_type.css         (canonical token values)
    ├── admin-web/                  (Next.js reference implementation)
    ├── preview/comp-<name>.html    (per-component visual contract)
    ├── ui_kits/admin-web/<…>       (per-component component examples)
    └── screenshots/                (rendered references)
```

Workflow: `new-godx-design-to-component` skill, 10-step
procedure ([`./04-prop-vocabulary.md`](./04-prop-vocabulary.md) +
[`./03-token-system.md`](./03-token-system.md) +
[`./01-theme-axes.md`](./01-theme-axes.md)).

## §C — `DESIGN.md` format (planned acceptance)

[`google-labs-code/design.md`](https://github.com/google-labs-code/design.md)
defines a hybrid YAML+Markdown format for AI-agent-readable design
systems. Key shape:

```markdown
---
colors:
  primary:   "#0077C7"
  on-primary: "#FFFFFF"
  surface:   "#FAFAFA"
typography:
  body:
    family: "M PLUS 2"
    size:   14
    weight: 400
spacing:
  - 0
  - 4
  - 8
  - 12
rounded:
  sm: 2
  md: 4
  lg: 6
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.on-primary}"
    rounded:         "{rounded.md}"
---

# Overview
Architectural minimalism meets journalistic gravitas. …

# Colors
Primary is SmartHR-blue (#0077C7) — chosen for trust + neutrality. …

# Typography
14px / 1.7 leading. Three weights only. …
```

### Mapping to @godxjp/ui

| DESIGN.md field | @godxjp/ui surface |
|---|---|
| `colors.<name>` | `--<name>` in `theme.css :root` (e.g. `--primary`, `--success`) |
| `typography.<role>` | `--text-<size>` + `--font-weight-<weight>` + `--leading-<height>` |
| `spacing[i]` | `--spacing-<i>` token |
| `rounded.<size>` | `--radius-<size>` token |
| `components.<name>` | Storybook story under `<Group>/<Name>` (Theme, General, Layout, Data Display, Data Entry, Feedback, Navigation, Shell, Usage Cases — flattened to root; no `new-primitives/` prefix) |
| `{colors.primary}` token reference | `var(--primary)` |
| Markdown prose | `docs/explanation/<topic>.md` or `new-docs/<N>-<topic>.md` |

### Workflow when a `DESIGN.md` lands

1. Place at `design-handoff/<bundle>/DESIGN.md`.
2. Run `scripts/import-design-md.mjs <bundle>/DESIGN.md` (planned).
   The importer:
   - parses YAML front matter
   - cross-references existing tokens in `theme.css`
   - writes new component-scope tokens to `theme.css :root` for
     any unknown name
   - emits a manifest of what changed
3. Reviewer audits the manifest before commit (cardinal rule 22 +
   token-existence check per rule 23 §C).

### Lint guardrails (google-labs DESIGN.md learnings)

Adopted from the google-labs `lint` command + applicable to our
existing token system:

| Rule | What it catches |
|---|---|
| **broken-token-ref** | `var(--non-existent)` in any CSS / `style=` prop |
| **wcag-contrast** | Color pairs (background + foreground) that fail 4.5:1 contrast at AA |
| **orphaned-token** | A token declared in `theme.css` but referenced nowhere |
| **section-ordering** | new-docs files that violate canonical §A → §Z ordering |
| **duplicate-token** | Two tokens with the same value (consolidate) |
| **prop-vocabulary** | A prop name not in `new-docs/04` (cardinal rule 23 §B) |
| **density-axis-coverage** | A primitive that hardcodes a height instead of reading `--density-element` |

These are enforced by `scripts/lint-tokens.mjs` (planned) +
existing CI (`pnpm exec stylelint src/**/*.css` once configured).
Until the lint script lands, reviewers manually check.

## §D — W3C DTCG JSON (planned)

[W3C Design Tokens Community Group format](https://design-tokens.github.io/community-group/format/) —
the industry-standard `.tokens.json` exchange format.

### Schema example

```json
{
  "color": {
    "primary":      { "$type": "color", "$value": "#0077C7" },
    "on-primary":   { "$type": "color", "$value": "#FFFFFF" }
  },
  "spacing": {
    "0": { "$type": "dimension", "$value": "0" },
    "1": { "$type": "dimension", "$value": "0.25rem" },
    "2": { "$type": "dimension", "$value": "0.5rem" }
  },
  "radius": {
    "sm": { "$type": "dimension", "$value": "0.125rem" },
    "md": { "$type": "dimension", "$value": "0.25rem" },
    "lg": { "$type": "dimension", "$value": "0.375rem" }
  }
}
```

### Direction

- **Export**: `scripts/export-tokens-dtcg.mjs` (planned) — reads
  `theme.css :root` + emits `dist/tokens.dtcg.json` for Figma /
  Penpot / Style Dictionary consumers.
- **Import**: `scripts/import-tokens-dtcg.mjs` (planned) — reads
  a `.tokens.json` handoff + maps into `theme.css :root` with the
  same naming convention.

Bidirectional. The framework's `theme.css` remains the source of
truth; DTCG JSON is a snapshot for inter-tool exchange.

## §E — Figma JSON export (planned)

Plugins like Tokens Studio export Figma styles to JSON. The shape
varies by plugin, but the framework's importer normalises to the
DTCG schema first (§D), then maps to `theme.css`.

## §F — Token-reference syntax (cross-format)

Across every handoff format the framework recognises **token
references** as the chain that links a component declaration to
the underlying token:

| Format | Reference syntax | Mapped to |
|---|---|---|
| Claude Design HTML | `var(--primary)` in inline CSS | `var(--primary)` (passthrough) |
| `DESIGN.md` | `{colors.primary}` (curly-brace) | `var(--primary)` |
| W3C DTCG JSON | `{color.primary}` (dot-path) | `var(--primary)` |
| Tailwind v4 `@theme inline` | `--color-primary: var(--primary)` | `var(--primary)` |

Importers normalise to the `var(--primary)` form when writing
into `theme.css` / `shell.css` / primitives. Reverse-direction
exporters emit the format-specific syntax for the target.

## §G — Canonical section ordering (cross-format)

Adopted from google-labs DESIGN.md `section-ordering` rule. Every
design-handoff doc + every `new-docs/` doc + every primitive's
`docs/reference/<group>/<Name>.md` follows:

```
1. Overview          (what it is, who it's for)
2. Tokens / Vocabulary  (the values it references)
3. API / Props        (cardinal rule 23 §B mapping)
4. Variants           (per-axis breakdown)
5. States             (hover / active / disabled / loading / error)
6. Accessibility      (a11y commitments + WCAG mapping)
7. Stories            (Storybook coverage list)
8. Do's / Don'ts      (the rule-23 §B forbidden synonyms applied
                        to this primitive)
9. References         (design-canon source lines, related rules)
```

Files that mix the order are rejected at review (lint catches once
the lint script lands).

## §H — Diff discipline

google-labs DESIGN.md ships a `diff` command — version-to-version
token / component-binding regression detection. We adopt the
discipline:

1. Every token change (addition / rename / removal) lands as a
   PR titled `feat(tokens): <token-name> — <change>`.
2. The PR description cites the design-canon source (Claude Design
   bundle hash + comp-<name>.html line, OR DESIGN.md commit SHA,
   OR DTCG JSON file).
3. The framework's `CHANGELOG.md` records token changes under
   `### Tokens` per release (semver minor for additions, major
   for renames / removals).
4. The `scripts/diff-tokens.mjs` script (planned) compares the
   committed `theme.css` against the previous version and flags
   regressions for review.

## §I — Standards (international)

- **W3C Design Tokens Community Group** —
  <https://design-tokens.github.io/community-group/format/>
- **google-labs-code/design.md** —
  <https://github.com/google-labs-code/design.md>
- **Tokens Studio (Figma plugin)** — `.tokens.json` export
- **Style Dictionary** (Amazon) — token transformation pipeline
- **WCAG 2.1 AA contrast** — 4.5:1 normal text / 3:1 large text /
  3:1 non-text UI

## §J — Connected rules

- Cardinal rule 22 (100% match to design canon) — `./CLAUDE.md` §22.
- Cardinal rule 23 (concept-first API + token existence check) —
  `./CLAUDE.md` §23.
- Token system foundation — [`./03-token-system.md`](./03-token-system.md).
- Prop vocabulary — [`./04-prop-vocabulary.md`](./04-prop-vocabulary.md).
- `new-godx-design-to-component` skill —
  `.claude/skills/new-godx-design-to-component/SKILL.md` /
  `.codex/skills/new-godx-design-to-component/SKILL.md`.
