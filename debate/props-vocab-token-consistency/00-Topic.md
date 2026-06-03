# Debate — Prop-vocabulary + design-token consistency standard for @godxjp/ui

## Question

A professional UI framework must have a SYNCHRONIZED prop vocabulary and a STANDARDIZED token system.
Evaluate the current state (`context/snapshot.md` + the real source under `src/props/vocabulary/`,
`src/props/registry.ts`, `src/tokens/`, `src/styles/`) and decide the governing STANDARD, against:

1. **Vocabulary completeness** — are all props that components use registered in the shared vocabulary? What's missing?
2. **Concept clarity** — is each prop one clear concept? Any vaguely-named props?
3. **Duplication** — duplicate prop NAMES for one concept (GapProp/InlineGapProp/StackGapProp), and duplicate
   CONCEPTS (tone vs variant; Title vs PageTitle; Density vs PageDensity vs TableDensity)?
4. **Token standardization** — is the token set normalized like a pro framework (W3C Design Tokens / Style
   Dictionary / Tailwind / Radix Themes)? Domain leaks (`--tracking-yamato/seller/internal`)? Raw palette vs semantic layering?

The deliverable is a STANDARD expressed as concrete, enforceable RULES + a cleanup list.

## Discrete OPTIONS

- **STRICT-CANON.** One canonical vocabulary: collapse every duplicate to a single concept (one `GapProp`,
  one `VariantProp`, one `DensityProp`, one `TitleProp`); adopt the full controlled-input vocabulary
  (`value`/`defaultValue`/`onValueChange`, `open`/`defaultOpen`/`onOpenChange`), generic `SizeProp`/`ToneProp`;
  every component prop MUST come from the registry. Tokens: W3C-DTCG-style 3-tier (primitive palette → semantic →
  component), semantic-only public surface, remove ALL domain tokens; enforce via the registry + an audit/lint check.
- **PRAGMATIC-SHARED.** Shared vocabulary for cross-cutting concepts (gap, value/onValueChange, open, disabled,
  size, tone), but allow genuinely component-specific enums (ButtonVariant ≠ AlertVariant semantically) to stay
  named per-component; tokens normalized into semantic + component layers with documented escape hatches; remove
  domain tokens + dedup obvious names, but don't force a single global enum where concepts truly differ.
- **STATUS-QUO+.** Keep the current vocabulary/tokens; fix only the clear defects (remove domain `--tracking-*`
  tokens, merge the 3 gap props); no broad vocabulary unification.

## Hard constraints

- Library rules in force: #19 domain-neutral, #23 concept-first prop API (one concept per prop; reuse shared
  vocabulary), #32 no redundant props, #2/#15/#16 tokens are the source of truth. A `props/registry.ts` already exists.
- Real comparison required: how do Radix, MUI, Chakra, Ant, Tailwind, Radix Themes, and the W3C Design Tokens
  Community Group format actually structure prop vocabularies + token tiers.
- Some unification is breaking (prop renames). Migration cost is real but secondary to a coherent standard.

## Scoring rubric (weights sum 100)

- **Consistency & predictability of the API** — 30
- **Completeness (no gaps in vocabulary/tokens)** — 20
- **Standards alignment (peer frameworks + W3C-DTCG)** — 20
- **Enforceability & maintainability (can a check guarantee it)** — 15
- **Migration cost** — 15

## Roster

ADV-STRICT, ADV-PRAGMATIC, ADV-SQ, SKEPTIC (red-team all), JUDGE (scores; writes 04-Decision.md WITH a concrete
"## RULES" section + cleanup list; records dissent).

## Status

decided
