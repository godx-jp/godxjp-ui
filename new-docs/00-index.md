# @godxjp/ui canonical rules

**Status:** Binding. Every rule in this folder OVERRIDES anything
older in `docs/`, `CLAUDE.md`, `AGENTS.md`, or skill bodies that
contradicts it.

Why this folder exists: `@godxjp/ui` is the visual + interaction
contract for every godx-jp frontend. The 20 cardinal rules in
[`../CLAUDE.md`](../CLAUDE.md) keep the day-to-day shape honest;
this `new-docs/` folder holds the **deeper architectural concepts**
that underpin them — the kind of concept where a small drift
silently degrades the whole product.

Mirrors the umbrella convention at
[`../../../new-docs/`](../../../new-docs/). The umbrella covers
repo-wide platform rules; this folder covers `@godxjp/ui`-specific
rules. Each fact has **one home** (per umbrella rule 10); the
umbrella's binding table links here when the source of truth is a
framework concept.

## Contents

| # | File | When to read |
|---|------|--------------|
| 01 | [Theme axes](./01-theme-axes.md) | Adding / renaming any `data-*` attribute on `<html>` that re-binds design tokens; adding a user preference toggle to a Tweaks panel / settings UI — four canonical axes (theme / accent / density / font-size); cascade layering rules |
| 02 | [Consumer contract](./02-consumer-contract.md) | Starting a new frontend that consumes `@godxjp/ui`; changing folder shape, theme.css, ESLint / Prettier / TS configs; building a new feature view; needing a primitive that does not exist yet — the §A-through-§I rules every consumer honours |
| 03 | [Token system foundation](./03-token-system.md) | Adding / renaming / removing a design token; writing any CSS that needs a colour, spacing, padding, radius, shadow, motion, layout, or density value — three-tier architecture (primitives / semantic / variants), every category catalogued, anti-patterns + verification |
| 04 | [Shared prop vocabulary](./04-prop-vocabulary.md) | Adding or renaming a prop on any primitive; authoring a new primitive — locked vocabulary table (size / variant / color / tone / accent / padding / density / shape / status / block / hoverable / boolean state / slot props / Card slots / band) + forbidden synonyms + cross-primitive consistency check |
| 05 | [Design handoff formats](./05-design-handoff-formats.md) | Accepting a new handoff bundle (Claude Design HTML/CSS / google-labs DESIGN.md / W3C DTCG JSON / Figma export); adding lint guardrails (broken-ref / WCAG / orphaned tokens / section-ordering); export tokens to inter-tool formats |

## Reading order

For a NEW consumer (service frontend / app):
1. 02 — §A through §I in order; the consumer's whole shape is
   specified there.

For a feature inside an existing consumer:
1. 02 §E — service-layer pattern (api → hooks → component).
2. 02 §B — no `className` for visual; props on primitives.
3. 02 §H — what to do if a primitive is missing.

For a NEW theme-axis-like preference:
1. 01 — confirm the new axis meets the orthogonal-global-stable bar
   before adding a fifth.

For a refactor of token cascade layering:
1. 01 — section "cascade layer" — default layer vs `@layer base`
   and when each wins.

## How to update

Rules in this folder ship with the submodule and are versioned at
the submodule SHA. Material changes go through a regular submodule
PR + umbrella pin bump. Don't edit a rule to accommodate a one-off
— fix the call site instead.

When you add a new rule, append it as `02-`, `03-`, … (chronological,
never reorganised). Update this index. Update the binding pointer at
the top of [`../CLAUDE.md`](../CLAUDE.md) that lists every numbered
rule by title. If the umbrella needs to route work into the new
rule, add a row to the umbrella binding table in
[`../../../CLAUDE.md`](../../../CLAUDE.md) that links here.

## Relationship to `docs/`

- `new-docs/` = **binding rules** (you MUST conform).
- `docs/explanation/` = **why** (background / philosophy).
- `docs/how-to/` = **task recipes** (do X step by step).
- `docs/reference/` = **API surface** (every primitive / token /
  hook listed exhaustively).
- `docs/tutorials/` = **learning paths** (newcomer onboarding).

When a `docs/` page and a `new-docs/` rule conflict, `new-docs/`
wins; the `docs/` page is stale and should be updated.

## Migration status

This folder is **new** as of 2026-05-16. Existing content under
`docs/explanation/` and `docs/how-to/` that overlaps with a future
binding rule should be refactored:

- the binding extract moves to `new-docs/NN-…md`;
- the `docs/` page is rewritten as the "why" or "how" companion
  pointing at the binding rule.

Refactor incrementally — don't bulk-rewrite. Each new binding rule
authored here triggers a once-over of related `docs/` pages.
