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
| Component taxonomy / grouping                                      | **Ant Design** groups                         | already the catalog shape: `data-entry`, `data-display`, `layout`, `feedback`, `navigation`, `general` — a naming precedent, nothing is installed |
| Colour foundation                                                  | **SmartHR**                                   | already the palette source — `--primary` = SmartHR MAIN `#0071bd`, `--foreground` = TEXT_BLACK, `--border` = BORDER               |
| **Derived colour — the interaction states hanging off each seed**    | **Measured contrast (WCAG 2.2 / JIS X 8341-3)** | Authored in `src/tokens/derived.css`; no algorithm derives them. Four contrast suites read that file and hold every value to a threshold — see below |
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
   14px body agrees. Fractional sizes do cost something measurable — they snap a line box half a
   pixel either way, which is ±0.5px of the residual in gh#370 — but they are not what that issue
   is. gh#370 is that `place-items: center` centres a LINE BOX and a line box is not a letterform;
   re-measured from the painted ink, the glyph classes' optical centres lie 0.21em apart (`g` 3.69px
   low in the 28px `md` box where `神`, `G` and `GX` are within 0.94px), so no glyph-blind rule
   centres them all — the best glyph-blind rule, `text-box: trim-both ex alphabetic`, still leaves
   2.25px. So the correction moved up a layer: `Logo` classifies the glyph string it is handed into
   the ink band it occupies and CSS applies that band's offset, which measures 1.38px worst case and
   needs no `text-box` at all (`src/styles/logo-layout.css` carries the full matrix). Aligning the
   scale is a visual change to every screen, so it is a separate decision, not a side effect of this
   one.
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

## The PROP SURFACE of a component is antd's too, not just its group name

antd was already the authority for which components exist and which group they live in. That
answered "is there a Table" and never answered "what does a Table take". So every prop was decided
here, one at a time, and the answer drifted per component: `DataTable` grew `pin: "end"` where antd
has `fixed`, `sortable: true` where antd has `sorter`, and no answer at all for filters, expandable
rows or a totals row — which is how a consumer ends up hand-rolling a `<tfoot>` and a sticky column
in page CSS.

**The rule: where antd names a capability, this library takes antd's name and antd's semantics.**
The gap is read out of the INSTALLED types (`antd/es/table/interface.d.ts`,
`antd/es/table/InternalTable.d.ts` and the `@rc-component/table` interface they extend) — never
from memory, because antd's own names move between majors (`fixed: 'left'` is deprecated in favour
of `start` inside rc-table itself).

> Đọc sau 20.0.0: bản major ấy đã **gỡ `antd` khỏi devDependencies** cùng máy sinh màu của nó, và
> `check:no-antd-runtime` canh cho nó không quay lại. Câu trên mô tả cách bề mặt prop này ĐƯỢC ĐỌC
> lúc antd còn cài, không phải một lời mời cài lại. Lần sau muốn đối chiếu, đọc type ở một checkout
> riêng rồi ghi số hiệu bản vào đây — đừng thêm dependency.

**Three things override antd's spelling, each for a stated reason:**

- **Logical over physical.** antd's `fixed: 'left' | 'right'` cannot mirror for an RTL locale, so
  only `start` / `end` are published. Same rule that makes `check:rtl` a gate.
- **This library's controlled vocabulary wins on values.** antd's `SortOrder` is
  `'ascend' | 'descend'`; here it stays `SortDirectionProp` (`asc` / `desc`), because that type
  already exists and a second spelling of the same axis is exactly what `check:prop-vocabulary`
  exists to prevent.
- **A capability this library already has keeps its own name.** antd's `size`
  (`small | middle | large`) IS `density` (`compact | default | comfortable`); antd's `locale` IS
  the `t()` layer. Adding the antd spelling as an alias would be duplication, not parity.

**A knob that only a fork could reach is not parity either.** antd's `components`,
`filterDropdown`, `classNames`/`styles` semantic maps and `prefixCls` all exist to let a consumer
replace the rendered markup. This library answers that layer with tokens (cardinal rule #45), so
those are deliberately NOT adopted — adopting them would re-open the hole the token tiers close.

## Derived colour is AUTHORED, and MEASUREMENT is what makes it authoritative

**Twenty values, in `src/tokens/derived.css`:** `--primary-hover`, `--primary-active`,
`--primary-border`, `--destructive-hover`, `--destructive-active`, `--control-outline` and its
alpha, `--control-outline-error` and its alpha, and `--ring` — each in both themes. They are the
interaction states that hang off the five authored seeds per theme (SmartHR MAIN plus four 和色,
and the lifted dark ramp), which stay in `src/tokens/foundation.css`.

**These twenty were once generated.** A colour algorithm ran at build time, took the seeds and
emitted the derived map; the authority behind each value was "the algorithm said so". That
generator has been removed and its dependency with it. The values did not change — but the reason
to trust them had to.

**The authority is now the measurement, not the derivation.** Four suites read `derived.css`
directly and hold every value in it to a threshold this repo has already committed to:

| suite                                                   | what it holds                                                                                                                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/tokens/__tests__/focus-ring-contrast.test.ts`       | the focus mark in both switch positions — ≥3:1 (WCAG 2.2 SC 1.4.11) on every surface a control sits on, and the halo proven to be decoration rather than the indicator |
| `src/tokens/__tests__/interactive-fill-contrast.test.ts` | an interactive fill must clear **4.5:1** against the label sitting on it                                                                                              |
| `src/tokens/__tests__/destructive-contrast.test.ts`      | `--destructive-hover` / `--destructive-active` against the same bar                                                                                                  |
| `src/lib/__tests__/theme-tokens-css.test.ts`             | the tier is actually loaded, and complete in both themes                                                                                                             |

The first three also pin each value as a literal, so an edit to `derived.css` alone turns CI red
rather than quietly retinting the library. **That is a stronger claim than the generator made, not
a weaker one.** An algorithm guarantees a value is _consistent_; this repo had to override it four
times (below) precisely because consistent is not the same as _accessible_. A threshold guarantees
the property actually being sold.

**To change a derived value:** change it, run `pnpm test`, and if a threshold breaks the value is
wrong. Do not relax the threshold.

**The four overrides that existed even while a generator did** — the clearest evidence the
algorithm was never the real authority. Stepping an interactive fill towards the label sitting on
it lands under 4.5:1, so those four states take the same ramp at the same step size in the
opposite direction:

| token                    | conventional step | shipped           |
| ------------------------ | ----------------- | ----------------- |
| light `--primary-hover`  | #208bc9 · 3.69:1  | #005596 · 7.53:1  |
| light `--primary-active` | #005596 · 7.53:1  | #003c70 · 10.97:1 |
| dark `--primary-hover`   | #61b6e8 · 7.92:1  | #61b6e8 · 7.92:1  |
| dark `--primary-active`  | #2f76a6 · 3.60:1  | #8bd0f3 · 10.50:1 |

**What was deliberately never derived, and why — each a measurement, not a preference:**

- **The neutral spine.** Colour foundation stays SmartHR's (see the table above); the neutrals are
  not derived from the brand seed. The one derived role on offer for a control boundary measures
  **1.43:1** on the page, where `--input` is held to 3:1 by SC 1.4.11 and by
  `input-boundary-contrast.test.ts`.
- **The text ramp.** The derived one is alpha-based (`rgba(0,0,0,0.88)`), which cannot enter this
  library's opaque `H S% L%` triple without choosing a surface to composite against — lossy by
  construction.
- **The dark `--primary` itself.** A mechanical dark derivation MOVES the seed. Deriving from this
  library's light seed gives `#0363a4` at **2.81:1** on the dark spine, which
  `primary-text-contrast.test.ts` rejects outright; deriving from the committed dark seed gives
  `#3794d3` at 5.36:1, where the seed itself measures 7.07:1. The dark theme therefore keeps its
  own seed — recorded, with the measurement, in `focus-ring-contrast.test.ts`.

**The focus geometry was already on the named scale.** Border 1, halo width 2, heavy outline 3,
radius 6, control height 32 and font size 14 all match scales this library already ships
(`--stroke-*`, `--radius`, `--band-height-md`, `--font-size-base`), so the focus tokens bind to
those steps instead of restating a second copy of the number.

**antd itself is gone from this repository**, and `pnpm check:no-antd-runtime` is what keeps it
gone: it fails if antd or any `@ant-design/*` package appears in any manifest field, is imported
anywhere in `src/`, or leaves a trace in `dist/`. Deleting that gate re-opens the door it closes.

## Focus appearance — a two-form convention, and the indicator SHIPS OFF

### The two forms

**SmartHR** (`smarthr-ui@99.6.0`) draws focus as an opaque ring held off the control by a white
spacer. This library takes a different, two-form convention instead — widely used in enterprise
component libraries, and surveyed across several before it was adopted here:

- **Field** — the boundary RECOLOURS to the primary at its unchanged hairline width, plus
  `box-shadow: 0 0 0 var(--control-outline-width) var(--control-outline)`. A Select emits the same
  declarations as an Input, which is why the two focus identically.
- **Non-field** — an outline outside the box model:
  `outline: var(--focus-outline-weight) solid var(--primary-border); outline-offset: 1px`.

**Why this shape wins.** The library previously shipped an opaque brand ring drawn immediately
outside an untouched grey border — two outlines of different colours claiming the same edge — and a
Select that could not be told to agree with an Input. Recolouring the existing boundary rather than
adding a second one resolves both. SmartHR still owns the hue: the focus colour is `--ring`, which
the derived tier declares as `var(--primary)`, because a focused field takes the primary rather than
a focus colour of its own.

### The indicator ships OFF. That forfeits WCAG 2.4.7 and a JIS X 8341-3 AA claim.

`--focus-outline: 0` in `foundation.css`. Nothing paints a focus indicator by default.

**This is a product decision, made with the cost stated.** The indicator was reported as intrusive —
a thick blue outline appearing on shift-tab, stacked on an already-shaded selected nav row. The
owner chose to ship it off and let whoever needs it turn it on. What that costs, plainly:

- **WCAG 2.2 SC 2.4.7 Focus Visible is an AA criterion**, and with the switch off it is not met.
- **JIS X 8341-3:2016 tracks WCAG 2.0 AA**, so a Japanese enterprise procurement asking for that
  conformance statement cannot be answered while the switch is off. Japanese public-sector and
  large-enterprise buyers ask for it routinely, and デジタル庁 is this document's standards
  reference for exactly that reason.

**Turning it back on is one attribute, on the root element, with no code change:**

```html
<html data-focus-outline="on"></html>
```

**The switch is a single multiplier, not a scatter of overrides.** `--focus-outline` is one flag,
and every painted focus length multiplies by it:

```css
--focus-ring-width: calc(var(--focus-ring-weight) * var(--focus-outline));
```

Setting it to `0` zeroes every focus length at once, so no component rebind can bring the mark back
while it is off — which is the property a scatter of per-component overrides could never give. The two paints
that are not lengths — the halo and a field's recoloured boundary — are scoped to the same attribute
in `styles/focus-ring.css`. **Every `:focus-visible` selector stays exactly where it is**; only the
painted result disappears.

### The ON state is the LIGHT one

The complaint was weight, not existence, so the on-position is not the old mark restored. It paints
the **field** indicator on every control — one hairline (1px) in the focus hue, plus the
`--control-outline` halo — rather than the heavy 3px outline form. Measured, in Chromium, on
`ql.test` after the transition settles:

| control                    | switch off                                           | switch on                                                             |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| Input / Select trigger     | border `1px rgb(144,135,127)`, resting shadow intact | border `1px rgb(0,113,189)` + `rgba(0,182,228,0.11) 0 0 0 2px`        |
| Button (primary)           | outline `0px`, resting shadow intact                 | `outline: 1px solid rgb(0,113,189)` @ `0px` + same halo               |
| Sidebar nav row / list row | outline `0px`                                        | `outline: 1px solid rgb(0,113,189)` @ **`-1px`** (inset into the row) |

The field pair is the recoloured boundary plus the halo, exactly as the convention specifies for
this seed. The nav row insets its mark into its own shape rather than wrapping an already-shaded surface,
which is the specific stacking that read as heavy.

**No control's box moves when it is focused**, measured with `getBoundingClientRect()` before and
after: the field form only recolours a border and an `outline` is painted outside the box model.
Input, Save and Delete all stay at 32.00px.

**Two criteria, and only one is met by thickness alone.** SC 1.4.11 (AA, non-text contrast) is about
COLOUR — the 1px mark measures 5.05:1 light and 7.07:1 dark on every surface a control sits on, so
the light weight costs nothing there. `--primary-border` (#6dc0e3) measures **2.00:1 light /
1.66:1 dark** and could not have satisfied it at any thickness, which is why the on-state takes the
focus hue instead — the single place it departs from the outline form. SC 2.4.13 Focus Appearance
(AAA) additionally wants a 2px perimeter; the on-state does not target it, and
`--focus-outline-weight: var(--stroke-lg)` restores the 3px weight if a customer needs the area
clause.

Both positions of the switch are gated in `src/tokens/__tests__/focus-ring-contrast.test.ts`: with
it off nothing paints and no rebind can route around it, with it on the geometry and the ≥3:1
contrast hold on every surface. Per rule 4 below: a standard that is not enforced is a standard that
has already drifted.

### The indicator is for CONTROLS, not containers

Buttons, fields, links, nav and menu rows carry it. A div, a content region, a scroll wrapper and
`body` do not. `.ui-legal-document-section` was removed from the list: it is a slab of prose that
carries `tabIndex={-1}` only so a table-of-contents link can move focus into it, so it is never in
the tab order and a keyboard user cannot arrive there unannounced. Its `tabIndex={-1}` stays,
because removing it would break the contents anchor.

**Every other focusable non-interactive element in this library is a genuinely scrollable region**
— `.app-main`, `.ui-mobile-shell-main`, `.ui-timeline-grid`, `.ui-code-block` when it overflows,
MasterDetail's bounded master, the DataTable and Table scroll containers, ScrollArea, and the
BranchScopePicker list. Each carries `tabIndex={0}` for axe `scrollable-region-focusable` and must
stay reachable, so each keeps BOTH halves rather than becoming focusable-but-unpainted. The region
ring (`--region-focus-ring-width`, off by default) now also multiplies by `--focus-outline`, so a
service that opts it in still cannot paint while the library-wide switch is off.

## How a decision gets made from here

1. Look it up in Carbon's guidance for the layer in question.
2. If Carbon has an answer, take it, and cite it in the token or component comment.
3. If Carbon has no answer, decide — and add the reason here, so it is looked up next time
   instead of re-decided.
4. Encode the decision as a gate wherever a gate can hold it. A standard that is not enforced is a
   standard that has already drifted; `visual-audit-rules.test.ts` and the scale test above are the
   pattern to follow.
