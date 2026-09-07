# Design authority — which external standard owns which decision

**Status:** accepted · 2026-09-07

## Why this document exists

Every design question that has no external answer gets answered by us, in a meeting, again.
That is the expensive part — not the code. This file names, per layer, the outside system we
defer to, so the next question is a lookup instead of an invention.

It changes no code by itself. It is the tie-breaker a reviewer points at.

## The layers, and who owns each

| Layer                                                              | Authority                                     | Status in this repo                                                                                                               |
| ------------------------------------------------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Interaction semantics, keyboard, ARIA                              | **WAI-ARIA APG**                              | already followed — 33 references in `src/`                                                                                        |
| Behaviour primitives                                               | **Radix**                                     | already the implementation — 193 references                                                                                       |
| Component composition shape                                        | **shadcn**                                    | already the structural convention — 23 references                                                                                 |
| Component taxonomy / grouping                                      | **Ant Design** groups                         | already the catalog shape: `data-entry`, `data-display`, `layout`, `feedback`, `navigation`, `general`                            |
| Colour foundation                                                  | **SmartHR**                                   | already the palette source — `--primary` = SmartHR MAIN `#0071bd`, `--foreground` = TEXT_BLACK, `--border` = BORDER               |
| **Japanese UI convention — density, JP typography, form patterns** | **SmartHR**                                   | **NEW — this decision.** Extends SmartHR from "where the colours came from" to the authority for how a JP business screen behaves |
| **Japanese accessibility / public-sector convention**              | **デジタル庁 Design System** (Digital Agency) | **NEW — this decision.** The reference when a JP customer asks which standard a screen meets (JIS X 8341-3)                       |
| **Spacing, density, type scale, information architecture**         | **IBM Carbon**                                | **NEW — this decision**                                                                                                           |

The first five were already true and merely unwritten. The last three are the choices being made
here. Carbon fills the one layer that had no outside answer at all: page rhythm, table density, form layout,
when to reach for which container. That gap is why `PageContainer` presets, `MasterDetail`,
`CenteredShell` and the `AuthShell` variants were each designed from scratch.

## Why Carbon for that layer

**It is the closest fit to what this library is for.** Internal SaaS, dense, neutral, legible —
that is Carbon's design brief almost verbatim. Its visual language is deliberately plain, so it
does not fight the SmartHR colour foundation already in `foundation.css`.

**It is the cheapest to adopt, measurably.** The spacing scale here already matches Carbon's on
8 of 9 steps:

| `@godxjp/ui` | px     | Carbon                                   |
| ------------ | ------ | ---------------------------------------- |
| `--space-1`  | 4      | `spacing-02`                             |
| `--space-2`  | 8      | `spacing-03`                             |
| `--space-3`  | 12     | `spacing-04`                             |
| `--space-4`  | 16     | `spacing-05`                             |
| `--space-5`  | **20** | **no equivalent — Carbon steps 16 → 24** |
| `--space-6`  | 24     | `spacing-06`                             |
| `--space-8`  | 32     | `spacing-07`                             |
| `--space-10` | 40     | `spacing-08`                             |
| `--space-12` | 48     | `spacing-09`                             |

Body size agrees too: Carbon's `body-compact-01` is 14px, and `--font-size-base` is 14px.

**It is the most actively maintained of the candidates**, which matters when the point is to follow
someone rather than lead. Measured 2026-09-07 from the GitHub API:

| System                | Last commit | Commits, 90 days |
| --------------------- | ----------- | ---------------- |
| Carbon (IBM)          | 2026-09-04  | **418**          |
| Fluent UI (Microsoft) | 2026-09-06  | 220              |
| Polaris (Shopify)     | 2026-08-05  | —                |
| SLDS (Salesforce)     | 2026-06-02  | **0**            |
| Primer (GitHub)       | 2025-07-01  | 0                |

## Why not the others

**Salesforce Lightning** was the first instinct and is a reasonable one — it is the archetypal
enterprise system. Two things rule it out. Its public repo has not moved since June 2026 (SLDS 2
lives in separate `salesforce-ux/design-system-2` repos on a much slower cadence), and the part of
SLDS with the most value is bound to Salesforce's own object model — record home, related lists,
object pages — which does not transfer to a product that is not Salesforce.

**Fluent UI** is complete (54 component packages) and extremely well maintained. It loses on fit,
not quality: its guidance is written for Microsoft product surfaces and its visual language carries
more Windows/Office flavour than a white-label framework wants.

**Apple HIG** is platform guidance for macOS/iOS. It has close to nothing to say about a dense web
admin table.

**Polaris** has the best content-design guidance of the group, worth borrowing from for microcopy,
but its patterns assume the Shopify admin.

**Atlassian** is a genuine alternative to Carbon and would also work. Carbon wins on being more
visually neutral and on the spacing scale already matching.

## The Japanese market comes first, and it outranks Carbon

The customers are Japanese businesses. Where a Western system and a Japanese one disagree, **the
Japanese one wins for anything the user reads or touches** — typography, line rhythm, density,
form conventions, wording. Carbon keeps geometry (the spacing steps, the 4px grid) because that
layer is culture-neutral.

**SmartHR is the JP authority, not just the palette.** It is a Japanese HR SaaS — the same product
shape as ours, aimed at the same buyers — its library is open source, and it is the most actively
maintained system of any measured here: **561 commits in 90 days**, last commit 2026-09-07 (Carbon:
418). It was already the colour source; this decision extends it to how a JP business screen
behaves.

**デジタル庁 (Digital Agency) is the standards reference.** Its design system is the closest thing
Japan has to a public, government-backed baseline, and it is what a JP enterprise customer or
procurement reviewer will cite. Use it to answer "which standard does this meet" (JIS X 8341-3),
not for visual style.

### Japanese conventions this library already follows — now written down

These were correct decisions with no recorded reason. They are load-bearing; do not "simplify"
them toward a Latin default:

- **`--line-height-body: 1.7`.** Japanese body text needs 1.7–2.0, not the Latin 1.5. Full-width
  kana and kanji fill the em box, so the same 1.5 that reads as airy in English reads as cramped in
  Japanese. `--line-height-normal: 1.5` remains for Latin-only runs.
- **14px body.** The JP business-software norm, and it happens to agree with Carbon's
  `body-compact-01`. Do not raise it to a Western 16px default.
- **A per-language font slot, not one merged stack.** `--font-sans-base` is deliberately a pure
  system stack so the library renders with zero font setup; Japanese arrives through
  `--font-sans-ja`, which `styles/base.css` wires to `[lang="ja"]`. Keep the indirection — merging
  a JP face into the base stack looks like a simplification and quietly removes the hook a consumer
  themes through.
- **Density never touches type size.** `density.css` sets `--scaling` only; `font-size` appears
  **zero** times in it. This is the single most important rule for dense JP screens: Japanese loses
  legibility far faster than Latin when shrunk, because the strokes-per-em of a kanji do not
  survive it. Compress spacing to fit more on screen — never the characters.

## Compact without becoming ugly — the rules that hold both

"Fit more on one screen" and "still looks composed" are not in tension if the compression is
applied to the right axis:

1. **Compress spacing, never type.** See above. `--scaling` is the only density knob.
2. **Keep the ratio, shrink the unit.** The φ macro rhythm (`docs/SPACING.md`) stays intact under
   density because `--phi-unit` is itself a spacing token — the proportions between sections are
   preserved while the absolute gaps shrink. That is why density does not make the page look
   broken, only tighter.
3. **Density is a token axis, not a per-screen decision.** `data-density` on the root, three values.
   A screen that wants to be denser than `compact` is a screen with too much on it.
4. **The information ceiling is the row, not the page.** Dense JP admin screens get their density
   from row height and column count (`--table-cell-padding-y`, `--band-height-*`), not from
   squeezing the page gutter. Take row heights from SmartHR's tables.
5. **Touch targets do not participate in density.** See divergence 5 — this is currently violated.

## What this does NOT mean

**We do not adopt Carbon's components.** There are 127 catalogued components here with 3,480 tests
and a token contract that took #316/#319 to land. Swapping libraries would throw that away to buy
guidance we can simply read. Carbon is the **specification authority**, not a dependency.

**We do not adopt Carbon's colours or brand.** Colour stays SmartHR-anchored. Carbon owns
geometry and rhythm; SmartHR owns hue.

## The open divergences

Recorded rather than silently fixed, because each is a real decision:

1. **`--space-5` (20px) has no Carbon equivalent.** Carbon steps 16 → 24 on purpose: a scale with
   both 20 and 24 lets two authors space the same relationship differently. Either retire it or
   write down what it is for. Pinned by `src/tokens/__tests__/carbon-scale-alignment.test.ts`, which
   fails if a NEW off-scale step appears.
2. **The type scale diverges by construction.** Carbon uses integers — 12, 14, 16, 18, 20, 24, 28,
   32, 36 — while `--font-size-ratio: 1.1227` (φ^¼) produces 11.1, 12.5, 17.6, 19.8, 22.2. Only the
   14px body agrees. Fractional sizes are what make a glyph land off the 4px grid, the same class of
   problem as gh#370. Aligning the scale is a visual change to every screen, so it is a separate
   decision, not a side effect of this one.
3. **The large end is missing.** Carbon has 64/80/96/160px; this scale stops at 48px. Nothing needs
   them yet — add from Carbon's steps when something does, rather than inventing a number.
4. **2px (`spacing-01`) is missing.** Same rule: take Carbon's value if a hairline gap is ever
   needed.
5. **`--scaling` takes the whole scale off the 4px grid, and undercuts the 44px touch floor.**
   `density="compact"` sets `--scaling: 0.92`, so every step becomes fractional — 16px → 14.72px,
   24px → 22.08px — and the grid Carbon's scale is built on only holds at default density. Worse,
   the coarse-pointer override in `tokens/components/control.css` raises controls to
   `--band-height-xl` (44px, "rule #24"), but `--control-height` multiplies it by `--scaling`
   anyway: **44 × 0.92 = 40.48px on a touch device at compact density.** That still clears WCAG 2.2
   AA (24px), but it breaks this library's own rule #24. Carbon's answer to density is discrete
   size variants that stay on the grid, not a continuous multiplier — worth reconsidering. Verify
   on a real touch device before changing anything.
6. **Type scale vs Japanese rendering.** Divergence 2 is sharper for JP than for Latin: fractional
   sizes (12.5px, 17.6px, 19.8px) put full-width glyphs on half-pixel boundaries, where kanji
   strokes blur far more visibly than Latin letterforms. Another reason to prefer Carbon's integer
   steps if the scale is ever revisited.

## How a decision gets made from here

1. Look it up in Carbon's guidance for the layer in question.
2. If Carbon has an answer, take it, and cite it in the token or component comment.
3. If Carbon has no answer, decide — and add the reason here, so it is looked up next time
   instead of re-decided.
4. Encode the decision as a gate wherever a gate can hold it. A standard that is not enforced is a
   standard that has already drifted; `visual-audit-rules.test.ts` and the scale test above are the
   pattern to follow.
