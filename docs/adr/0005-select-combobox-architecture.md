---
diataxis: adr
library: "@godxjp/ui"
library_version: 3.0.0
adr: "0005"
title: Keep Select and Combobox as separate primitives
status: proposed
date: 2026-05-18
last-updated: 2026-05-18
audience: [developer]
lang: en
---

# ADR 0005 — Keep Select and Combobox as separate primitives

## Status

Proposed.

---

## Context

`@godxjp/ui` ships two adjacent data-entry primitives:

- **`Select`** (`src/components/data-entry/Select.tsx`) — wraps
  `@radix-ui/react-select`. Listbox UX. Has the Ant-style `options`
  prop AND the shadcn-style compositional `Select trigger` /
  `Select content` / `Select option` API.
- **`Combobox`** (`src/components/data-entry/combobox.tsx`) — wraps
  `@radix-ui/react-popover` + `cmdk` `Command`. Command-palette UX
  with an input + filtered list. Same dual `options` / compositional
  API.

Both primitives are exported from `src/components/primitives.ts`,
both have full Storybook coverage, and `AutoComplete` already wraps
`Combobox` to add free-text typing. The industry split:

| Library      | Architecture                                                                     |
| ------------ | -------------------------------------------------------------------------------- |
| Ant Design 5 | Merged — `<Select showSearch />`                                                 |
| Mantine 7    | Merged — `<Select searchable />`                                                 |
| shadcn/ui    | Separate — `Select` + `Combobox` (Combobox is a documented composition pattern)  |
| MUI 5        | Separate — `<Select>` + `<Autocomplete>`                                         |
| Radix UI     | Separate — `Select` (single-base, no search); community uses `cmdk` for combobox |

The question: do we collapse `Combobox` into `Select` via a
`searchable` boolean (Ant / Mantine), or stay with the
shadcn / MUI / Radix split (status quo)?

---

## Decision Drivers

1. **Cardinal rule 23 §A** — every prop carries ONE concept; merging
   means `searchable` would _secretly_ swap the entire ARIA role +
   keyboard contract, not just toggle a feature.
2. **Cardinal rule 14** — every interactive primitive wraps the
   shadcn/Radix-recommended library. `Select` → `@radix-ui/react-select`;
   `Combobox` → `cmdk`. Different libraries, different roles.
3. **WCAG 2.1 / WAI-ARIA APG 1.2** — `role="listbox"` (Radix Select)
   and `role="combobox"` (cmdk Command) are _different_ ARIA
   patterns with different keyboard contracts.
4. **Bundle cost** — `@radix-ui/react-select` and `cmdk` are both
   already in `dependencies`. The current `AutoComplete` consumer
   already pays for both; merging would not reduce the payload.
5. **Migration cost** — internal consumers + story footprint.
6. **Vietnamese developer audience** — `searchable` reads as a
   small toggle; the underlying behaviour change is enormous.
   Hiding that behind a boolean misleads junior developers and
   teaches "Select with search" as a feature flag, not an
   accessibility decision.

---

## Considered Options

- **A. Merge** Combobox → Select with `searchable` prop. `Select`
  delegates internally to either Radix `Select` (default) or
  `cmdk` Command (`searchable={true}`).
- **B. Keep separate** (status quo). Two primitives, two roles,
  two clear use cases. Cross-link them in reference docs.

---

## Decision Outcome

**Chosen option: B — Keep separate.**

Reasons:

1. **Different ARIA patterns, not different features.** Radix
   `Select` renders `role="listbox"` with `aria-activedescendant`
   navigation; `cmdk` renders `role="combobox"` with an input child
   and `aria-controls` to a `role="listbox"`. WAI-ARIA APG 1.2
   treats them as distinct patterns with distinct keyboard
   contracts (Listbox: typeahead; Combobox: free-text input +
   filtered list). Collapsing them under one prop misrepresents
   what the user sees and how the assistive-technology stack
   announces them.
2. **`searchable` would violate cardinal rule 23 §A.** A boolean
   that swaps the primitive's ARIA role, keyboard contract, AND
   underlying library (Radix vs cmdk) is not a "feature toggle" —
   it's two primitives sharing a name. The vocabulary table
   (rule 23 §B) intentionally reserves single-concept props.
3. **Radix `Select` cannot be made filterable without
   substitution.** `@radix-ui/react-select@2.2.6` exposes no
   `shouldFilter` / `filter` / input child surface. A filterable
   `Select` mode would require swapping the _entire_ implementation
   to cmdk when `searchable` is true. That is two implementations
   behind one name, not one merged primitive.
4. **No bundle savings.** Both libraries already ship today
   (`AutoComplete` depends on cmdk; `Select` depends on
   Radix Select; both ~5–8 KB gzipped). Merging changes nothing.
5. **Industry split is real, not accidental.** shadcn, MUI, and
   Radix itself keep them separate. Ant + Mantine merge because
   they treat both as a single conceptual "dropdown that may have
   search"; we have already chosen the shadcn/Radix camp via
   cardinal rule 14.

---

## Pros and Cons of the Options

### A — Merge (`Select` gains `searchable`)

- ✓ Single import surface for consumers; matches Ant / Mantine
  mental model, which a portion of the Vietnamese audience
  already knows.
- ✓ Smaller public API surface (one primitive, not two).
- ✗ Violates cardinal rule 23 §A — `searchable` secretly swaps
  ARIA role + keyboard contract + library base.
- ✗ Radix `Select` has no filter API; implementation must
  branch internally between Radix and cmdk, doubling the
  maintenance surface inside one file.
- ✗ Breaks the 1:1 "primitive wraps one Radix/shadcn library"
  mapping that cardinal rule 14 + ADR 0001 enforce.
- ✗ Existing consumers (`AutoComplete`) would need rewiring to
  the merged primitive, with no behavioural gain.
- ✗ Migration cost: rewrite `Select.tsx`, rewrite or delete
  `combobox.tsx`, update `primitives.ts`, fold `Combobox.stories.tsx`
  (64 Combobox references) into `Select.stories.tsx` (105 Select
  references), rewrite `AutoComplete.tsx` (8 ComboboxX imports).
- ✗ Documentation drift: `docs/reference/data-entry/Combobox.md`
  - `Select.md` collapse into one page that must explain _both_
    ARIA patterns under one heading — confusing for the audience
    the framework targets.

### B — Keep separate (status quo)

- ✓ Respects WAI-ARIA APG 1.2 — listbox vs combobox are
  documented as distinct patterns.
- ✓ Respects cardinal rules 14 + 23 — one library per primitive,
  one concept per prop.
- ✓ Zero migration cost; both primitives already shipped,
  storied, and documented.
- ✓ `AutoComplete`, `Cascader`, `TreeSelect` already extend the
  Combobox pattern — they have a stable base to wrap.
- ✓ Mirrors shadcn/ui, MUI, Radix — the libraries our locked
  stack is aligned with.
- ✗ Two imports, two reference pages. Mitigated by cross-linking
  - a decision table in each page.
- ✗ Consumers migrating from Ant Design must learn that
  `showSearch` → switch from `Select` to `Combobox`. Mitigated
  by a migration note in `docs/reference/data-entry/Select.md`.

---

## Repo footprint (grep summary)

Importers of `Combobox` (full sub-component family):

- `src/components/data-entry/AutoComplete.tsx` — wraps Combobox\*
- `src/components/primitives.ts` — re-exports the family
- `src/stories/data-entry/Combobox.stories.tsx` — 64 references

Importers of `Select`:

- `src/components/primitives.ts` — re-exports the family
- `src/stories/data-entry/Select.stories.tsx` — 105 references
- `src/stories/data-display/Card.stories.tsx` — 4 references
  (Card story uses Select as a form-field example)

No production consumer of either primitive sits outside the
framework repo yet (consumer apps reference via
`@godxjp/ui/components/primitives` but the repo itself doesn't
have an app folder). Migration cost is therefore confined to the
two stories + AutoComplete + Cascader/TreeSelect (which already
build on Combobox, not Select).

---

## Implementation roadmap

Status quo — no source changes. Documentation tightening only:

1. Add a "When to use Select vs Combobox" decision table at the
   top of `docs/reference/data-entry/Select.md` and
   `docs/reference/data-entry/Combobox.md` (cross-linked).
2. Add a migration note for Ant Design users:
   `<Select showSearch />` → `<Combobox options={…} />`.
3. Update the prop-vocabulary doc
   ([`./../../new-docs/04-prop-vocabulary.md`](../../new-docs/04-prop-vocabulary.md))
   to record that `searchable` is NOT a Select prop — searchable
   dropdowns use `Combobox`. Prevents future re-litigation.
4. (Optional, separate PR) Re-export `Combobox` aliases
   (`Autocomplete`, `Searchable`) — REJECTED here; aliases dilute
   the vocabulary (rule 23 §B). Consumers learn the canonical name.

---

## References

- Ant Design Select (showSearch): https://ant.design/components/select#select-demo-search
- Mantine Select (searchable): https://mantine.dev/core/select/
- shadcn/ui Combobox: https://ui.shadcn.com/docs/components/combobox
- shadcn/ui Select: https://ui.shadcn.com/docs/components/select
- MUI Autocomplete: https://mui.com/material-ui/react-autocomplete/
- Radix UI Select: https://www.radix-ui.com/primitives/docs/components/select
- cmdk: https://cmdk.paco.me/
- WAI-ARIA APG — Combobox pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- WAI-ARIA APG — Listbox pattern: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
- [ADR 0001 — Radix as foundation](./0001-radix-as-foundation.md)
- [ADR 0002 — shadcn-style ownership](./0002-shadcn-style-not-mui.md)
- Cardinal rule 14 (locked stack) — [`../../CLAUDE.md`](../../CLAUDE.md)
- Cardinal rule 23 (concept-first API) — [`../../CLAUDE.md`](../../CLAUDE.md)
