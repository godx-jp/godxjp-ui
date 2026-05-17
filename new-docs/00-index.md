# @godxjp/ui canonical rules

**Status:** Binding. Every rule in this folder OVERRIDES anything
older in `docs/`, `CLAUDE.md`, `AGENTS.md`, or skill bodies that
contradicts it.

Why this folder exists: `@godxjp/ui` is the visual + interaction
contract for every godx-jp frontend. The 29 cardinal rules in
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
| 02 | [Consumer contract](./02-consumer-contract.md) | Starting a new frontend that consumes `@godxjp/ui`; changing folder shape, theme.css, ESLint / Prettier / TS configs; building a new feature view; needing a primitive that does not exist yet — §A consumer dist surface, §A-2 per-group source taxonomy, §B–§I rules every consumer honours |
| 03 | [Token system foundation](./03-token-system.md) | Adding / renaming / removing a design token; writing any CSS that needs a colour, spacing, padding, radius, shadow, motion, layout, density, or breakpoint value — three-tier architecture (primitives / semantic / variants), every category catalogued, anti-patterns + verification |
| 04 | [Shared prop vocabulary](./04-prop-vocabulary.md) | Adding or renaming a prop on any primitive; authoring a new primitive — locked vocabulary table (size / variant / color / tone / accent / padding / density / shape / status / orientation / placement / current / value / justify / sticky / offset / open / block / hoverable / slot props / Card slots / band) + forbidden synonyms + per-primitive consumption table |
| 05 | [Design handoff formats](./05-design-handoff-formats.md) | Accepting a new handoff bundle (Claude Design HTML/CSS / google-labs DESIGN.md / W3C DTCG JSON / Figma export); adding lint guardrails (broken-ref / WCAG / orphaned tokens / section-ordering); export tokens to inter-tool formats |

## Trigger table (cardinal rule routing)

When the trigger below fires, jump straight to the linked rule.

| Trigger | Cardinal rule | New-docs entry |
|---|---|---|
| Add / rename / remove a design token | 16 + 22 + 23 §C | [03 — token system](./03-token-system.md) |
| Add / rename a `data-*` axis on `<html>` | 21 | [01 — theme axes](./01-theme-axes.md) |
| Add / rename a prop on any primitive | 23 §B | [04 — prop vocabulary](./04-prop-vocabulary.md) |
| Place a primitive `.tsx` file under `src/components/` | 27 | [02 — consumer contract §A-2](./02-consumer-contract.md) |
| Add a top-level `src/<X>/` directory | 28 | [02 — consumer contract §A](./02-consumer-contract.md) |
| Write a Storybook story | 29 | [02 — consumer contract §I](./02-consumer-contract.md) |
| Accept a new design-handoff bundle | 22 | [05 — handoff formats](./05-design-handoff-formats.md) |
| Wire a new consumer SPA | 13 (umbrella) + 26 | [02 — consumer contract §A–§I](./02-consumer-contract.md) |

## Reading order

For a NEW consumer (service frontend / app):
1. 02 §A — what the framework ships + dist surface table.
2. 02 §D — folder shape.
3. 02 §B / §E — props not className; service-layer pattern.

For a feature inside an existing consumer:
1. 02 §E — service-layer pattern (api → hooks → component).
2. 02 §B — no `className` for visual; props on primitives.
3. 02 §H — what to do if a primitive is missing.

For a NEW primitive in the framework:
1. 02 §A-2 — pick the right group folder.
2. 04 — check the vocabulary table; reject forbidden synonyms.
3. 03 — token-pin every literal before writing CSS.
4. cardinal rule 23 §D — deep-research before authoring.

For a NEW theme-axis-like preference:
1. 01 — confirm the new axis meets the orthogonal-global-stable bar
   before adding a fifth.

For a refactor of token cascade layering:
1. 01 — section "cascade layer" — default layer vs `@layer base`
   and when each wins.
1. 03 §A — three-tier token architecture.

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

## Storybook sidebar taxonomy

The Storybook served at `storybook.<publicDomain>` mirrors the
per-group source taxonomy (cardinal rule 27) flattened to root-level
sidebar groups:

| Group | Source folder | Components |
|---|---|---|
| Theme | `src/stories/theme/` | Colors, Typography, Spacing, Radius · Shadow · Motion, Responsive, Prop vocabulary |
| General | `src/components/general/` | Button, Typography (2) |
| Layout | `src/components/layout/` | Row, Col, Flex, Space, Grid, Masonry (6) |
| Data Display | `src/components/data-display/` | Avatar, Badge, Card, Calendar, Carousel, Collapse, Descriptions, Empty, Image, List, Popover, QRCode, SegmentedControl, Statistic, Table, Tag, Timeline, Tooltip, Tour, Tree (20) |
| Data Entry | `src/components/data-entry/` | Input, Textarea, InputPassword, InputSearch, Field, Label, Checkbox, CheckboxGroup, Radio, Switch, Slider, Select, AutoComplete, Cascader, ColorPicker, DateTimePicker, TimeInput, TreeSelect, Rate, InputNumber, Form, Transfer, Checklist, LocaleTabs (24) |
| Feedback | `src/components/feedback/` | Alert, Dialog, AlertDialog, Sheet, Popconfirm, Progress, Result, Skeleton, Spinner, Toaster, Watermark (11) |
| Navigation | `src/components/navigation/` | Anchor, Breadcrumb, DropdownMenu, Menu, Pagination, Steps, Tabs (7) |
| Shell | `src/components/shell/` | AppShell, Sidebar, Topbar, ProductSwitcher, ProjectSwitcher, CommandPalette, TweaksPanel, PageContent (8) |
| Usage Cases | `src/stories/examples/` | Dashboard, IdeasBoard, Issues, IssueDetail, Plans, PlanDetail, ProjectsList, Wiki (illustrative compositions — never shipped) |

Total: **61 React primitives + composites + shell** (plus the
Upload family + MediaUpload + AvatarUploader + LocaleInput composites
under `src/components/composites/`).

The legacy `new-primitives/` Storybook title prefix is removed —
groups appear flat at the sidebar root.

## Relationship to `docs/`

- `new-docs/` = **binding rules** (you MUST conform).
- `docs/explanation/` = **why** (background / philosophy).
- `docs/how-to/` = **task recipes** (do X step by step).
- `docs/reference/` = **API surface** (every primitive / token /
  hook listed exhaustively).
- `docs/tutorials/` = **learning paths** (newcomer onboarding).
- `docs/adr/` = **architectural decision records** (historical
  binding decisions — Radix base, shadcn ownership, tokens-not-
  utilities, i18next singleton).

When a `docs/` page and a `new-docs/` rule conflict, `new-docs/`
wins; the `docs/` page is stale and should be updated.

## Migration status

This folder is **stable** as of 2026-05-17. Architecture has
settled at:

- per-group component folders (cardinal rule 27)
- strict `src/` taxonomy (cardinal rule 28)
- stories-must-consume-primitives (cardinal rule 29)
- 8-entry consumer dist surface (no `data` / `screens` / `clients`)
- Storybook sidebar flattened to root groups + Usage Cases

Future rules append as `06-`, `07-` … chronologically.
