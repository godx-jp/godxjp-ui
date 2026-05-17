---
name: new-godx-design-to-component
description: "Use BEFORE writing or refactoring any @godxjp/ui primitive / composite / shell to match a Claude Design handoff. Combines Anthropic's `frontend-design` skill (aesthetic discipline + avoid AI slop) with the 10-step conversion procedure (read mockup → literal manifest → token-pin → DOM verbatim → axes coverage → Playwright probe → port stories). Failure to follow this procedure is the most common source of drift; bypassing it is rejected at review. Skill prefix `new-` so it survives future refactor sweeps."
---

# new-godx-design-to-component

A binding procedure for converting a Claude Design HTML/CSS mockup
into a 100%-correct `@godxjp/ui` primitive. Mirrors cardinal rule 22
(100% match to design canon) + rule 21 (axes-aware) + rule 14
(shadcn / Radix-ecosystem libraries only).

The procedure is **non-skippable**. If any step is skipped, the
component drifts. Drift is the most expensive bug class this
framework can ship; the user has eaten it across multiple rounds
and is correct to push back hard.

## When to invoke

- BEFORE writing CSS for a new primitive that has a design mockup.
- BEFORE refactoring an existing primitive flagged as drifted.
- BEFORE adding a new story that demonstrates a design pattern.
- WHEN the user posts a new Claude Design handoff URL.
- WHEN the user says "the component doesn't match the design".

If you find yourself reaching for "I think this looks right",
**STOP** and run the procedure.

# Part 1 — Design thinking (from Anthropic's `frontend-design` skill)

Run Part 1 BEFORE the procedure. The procedure is "how to port the
design correctly"; Part 1 is "how the design makes good decisions
in the first place" — relevant when the bundle doesn't cover a small
gap and you must evaluate whether a fill-in choice is sound.

Excerpt from Anthropic's official `frontend-design` skill
(`~/.claude/plugins/marketplaces/claude-plugins-official/plugins/frontend-design/skills/frontend-design/SKILL.md`),
applied to the @godxjp/ui context.

## Design thinking

Before coding, understand the context and commit to a BOLD aesthetic
direction:

- **Purpose**: What problem does this interface solve? Who uses it?
  For @godxjp/ui every primitive serves the JP-density / enterprise /
  multi-tenant context — 14px body, 1.7 leading, three weights
  (400/500/700), restrained chroma (≤0.18 in OKLCH), 渋み (shibumi).
- **Tone**: The dxs-kintai canon picks "restrained enterprise" —
  the opposite of "maximalist chaos", "retro-futuristic", or generic
  Material / shadcn defaults. The brand voice is intentionally calm
  and information-dense.
- **Constraints**: Tailwind v4 + React 19 + Radix + shadcn ownership
  model. Locked stack per cardinal rule 14.
- **Differentiation**: 朱 attention over 茜 destructive for
  non-destructive alerts (the "everything's red" pattern is dated);
  wa-iro decorative palette for charts / tags; tabular-nums for any
  numeric column; one-line empty states with no illustrations.

## Frontend aesthetics guidelines

Apply when filling a gap the bundle doesn't cover.

- **Typography**: Use the dxs-kintai font stack (`--font-sans-jp`
  with M PLUS 2 head + Hiragino fallback). NEVER substitute Inter,
  Roboto, Arial, or system-ui in a component CSS. Pair the
  distinctive body face with `--font-mono` for tabular numeric
  alignment (`font-variant-numeric: tabular-nums`).
- **Color & Theme**: Commit to the token system
  (`new-docs/03-token-system.md`). Wa-iro is decorative —
  charts, tags, tenant branding — NEVER semantic. Semantic role
  colors are fixed and don't substitute (success = 若竹,
  warning = 山吹, info = 群青, attention = 朱, destructive = 茜).
- **Motion**: Use the design system's `--transition-{fast,base,slow}`
  tokens. Honour `prefers-reduced-motion`. One well-orchestrated
  micro-interaction (e.g. `.pulse` ring on a live dot) beats five
  scattered ones. Don't add motion the design canon doesn't show.
- **Spatial Composition**: The dxs-kintai canon uses generous
  negative space (`--spacing-{4..8}` for gaps; cards no shadow at
  rest). Asymmetric layouts only when the design shows them.
- **Backgrounds & Visual Details**: Subtle is the brand voice.
  `color-mix(in oklch, var(--primary) 14%, transparent)` for soft
  tints. No gradient meshes, no noise textures, no grain overlays
  unless the design hero variant (H13/H14) calls for them.

## NEVER

- Generic AI aesthetics: overused fonts (Inter, Roboto), cliched
  color schemes (purple gradients on white), predictable layouts,
  cookie-cutter component patterns.
- Variance per generation: the same primitive must look identical
  across every consumer. Variation belongs in the theme axes, not
  per-component improvisation.

**IMPORTANT**: Match implementation complexity to the design canon.
The dxs-kintai canon is **refined-minimal** — restraint, precision,
careful attention to spacing, typography, subtle details. Elegance
from executing the vision well, not from cramming effects.

# Part 2 — The conversion procedure (10 steps)

This is the binding mechanical procedure. The principles in Part 1
inform Part 2; they do not replace it.

## Step 1 — Locate the canonical mockup

The framework supports multiple handoff input formats — see
`new-docs/05-design-handoff-formats.md` for the
full catalogue. Pick the format the bundle uses:

### Format A — Claude Design HTML/CSS prototype (default)

```
design-handoff/ui-system/<latest-bundle>/project/
```

In that folder:

- `README.md` — read first ("CODING AGENTS: READ THIS FIRST").
- `chats/chat[1..N].md` — read the LAST one first (that's where
  the user landed after iterating); skim earlier ones for context.
- `project/SKILL.md` — the design-system author's rules (font
  weights, density, attention-vs-danger, table row heights, etc.).
  Re-read at the start of every session.
- `project/colors_and_type.css` — canonical token values.
- `project/preview/comp-<name>.html` — the visual contract for the
  component you're building. Open this in a text reader; do NOT
  render it in a browser. Everything you need is in the source.

### Format B — google-labs `DESIGN.md` (token-first)

```
design-handoff/<bundle>/DESIGN.md
```

Hybrid YAML front matter (tokens) + markdown prose (rationale).
The DESIGN.md format draws on
[`google-labs-code/design.md`](https://github.com/google-labs-code/design.md).

When you encounter this format:

- Read the YAML front matter — `colors / typography / spacing /
  rounded / components`. Map each to the corresponding entry in
  `theme.css :root` (see new-docs/05 §C for the mapping table).
- Read the markdown prose AFTER — it carries the "why" rationale
  for the token values + design philosophy.
- Token references in component bindings (`{colors.primary}`)
  normalise to `var(--primary)` in our code.
- Section ordering is canonical (Overview → Colors → Typography →
  Spacing → Components → Do's/Don'ts) — follow when writing
  primitive reference docs.

### Format C — W3C DTCG `.tokens.json` (machine exchange)

```
design-handoff/<bundle>/tokens.dtcg.json
```

Industry-standard machine-readable token format. Importer
(planned: `scripts/import-tokens-dtcg.mjs`) writes into
`theme.css :root` with the framework's naming convention.

### Format D — Figma JSON export

Plugins like Tokens Studio export Figma styles. The framework's
importer normalises to DTCG first (Format C), then maps.

## Step 2 — Read the mockup top-to-bottom

Don't skim. Read every line of CSS in the `<style>` block. Take
notes:

- Every literal value (px, rem, %, color-mix, var-token).
- Every region's class name + DOM nesting.
- Every variant's modifier class.
- Every state's selector (`:hover`, `[data-*]`, `.on`, etc.).

If the mockup has multiple sections (A, B, C, …), note each
section's distinct patterns separately.

## Step 3 — Build a literal manifest

For the primitive you're building, list every literal in a table:

| Region                  | Property              | Design literal    | Mapped to          |
| ----------------------- | --------------------- | ----------------- | ------------------ |
| `.card`                 | padding               | 16px              | `var(--density-card)` |
| `.card .ch`             | padding               | 10px 16px         | `var(--card-pad-y-header) var(--density-card)` |
| `.card .ch`             | border-bottom         | 1px solid var(--border) | (verbatim — already tokenised) |
| `.card .ch .t`          | font-size             | 13px              | `var(--card-title-size)` |
| `.card .ch .sub`        | font-size             | 11px              | `var(--card-meta-size)` |
| `.card .ch .sub`        | color                 | var(--muted-foreground) | (verbatim) |
| `.card .ch .sub`        | margin-left           | auto              | (literal — DOM behaviour) |

Don't paraphrase. Every value goes in the table verbatim.

## Step 4 — Map each literal to a token

For each row in the manifest, decide one of three outcomes:

1. **Existing semantic token covers it** (e.g. `var(--density-card)`
   for 16px horizontal padding in default density). Use that.

2. **Existing component-scope token covers it** (e.g.
   `var(--card-pad-y-header)` for 10px vertical pad). Use that.

3. **No token exists**. Add a new component-scope token in
   `:root` of `src/styles/theme.css`:

   ```css
   /* Component-scope — pinned to the design literal in
    * `comp-<name>.html` line N: `.<region> { property: <literal> }`. */
   --<component>-<aspect>: <rem-or-px>;
   ```

   Naming convention: `--<component>-<aspect>-<axis>?`. Examples:
   - `--card-pad-y-header` (Card region, padding-y axis)
   - `--card-title-size` (Card title, font-size)
   - `--timeline-rail-width` (Timeline rail, width)

**FORBIDDEN substitutions** (cardinal rule 22):

- Using `--spacing-3` (12px) where the design shows 10px because
  12 was already in the system.
- Using `--text-base` (14px) where the design shows 13px because
  base was already in the system.
- Picking the "closest" Tailwind utility (`p-2.5`).
- Saying "close enough" — drift in 1px is a bug.

## Step 5 — Reproduce the DOM structure verbatim

Match the mockup's HTML region-by-region. If the mockup uses
`<div class="ch"><span class="t">…</span></div>`, your component
emits `<div className="card-header-block"><h3 className="card-title">…</h3></div>`
— class names re-namespaced but the DOM shape preserved.

**Don't** borrow structure from a sibling component. If the
mockup's header is `flex + align-items:center + gap:10 + no
divider`, your header MUST be flex + align-items:center + gap:10
+ no divider — even if a peer component does it differently.

If the mockup has TWO patterns for the same primitive (e.g.
padded-card slot vs flush-card `.ch` block), expose BOTH via API
(e.g. `block` prop on `CardHeader`).

## Step 6 — Hook all four theme axes

Per cardinal rule 21 every token reference must flow through:

- `data-theme` — colours via semantic tokens (`--background`,
  `--foreground`, `--card`, `--border`, …).
- `data-accent` — brand chain via `--primary`, `--ring`,
  `--brand`, `--sidebar-active-*`. Tints via `color-mix(in oklch,
  var(--primary) N%, transparent)`.
- `data-density` — heights via `--density-element` / `--density-card`
  / `--header-height`. Horizontal pad via `--density-card`.
- `data-font-size` — every rem-based size rescales automatically
  via the `html` font-size knob. Pixel literals freeze the size
  (use rem unless the value is a touch-target floor or hairline).

No component-private dark-mode override. No component-private
density override. The fix is upstream in the token system, not at
the component.

## Step 7 — Write the React primitive

```tsx
// src/components/primitives/<Name>.tsx
import { cn } from "./cn"

export interface <Name>Props { … }

export function <Name>({ … }: <Name>Props) {
  return (
    <div className={cn("<canonical-class>", className)}>
      {/* DOM shape mirrors the mockup region-by-region */}
    </div>
  )
}
```

Rules:

- One file per primitive (or one file per primitive family —
  e.g. `DateTimePicker.tsx` exports the four date/time picker
  variants because they share React Aria foundation).
- Export the component AND the props interface AND any related
  variant types (per rule 13 — TypeScript strict).
- Default values for props go in the destructuring signature,
  not in the body — easier for the reader.
- `cn(…)` for className composition; never template literals.
- Lucide-react icons (size + strokeWidth=1.5), never inline SVG
  unless the mockup explicitly uses one.
- Forward refs for primitives that wrap interactive elements
  (Button, Input, … — see existing primitives for the pattern).

## Step 8 — Write the CSS

```css
/* src/styles/shell.css */

/* ─── <Name> · pinned to design canon ──────────────────────────────
 * Source: design-handoff/ui-system/<latest>/project/preview/comp-<name>.html
 * Every value is a token reference; no hardcoded literals (cardinal
 * rule 22). Axes (theme/accent/density/fontSize) flow through.
 */

.<canonical-class> {
  /* Region styles using tokens from §M of new-docs/03-token-system.md */
}
```

Rules:

- Token references only. No hex / oklch literals. No bare px
  (except documented exceptions: 44px touch target, 1px hairline,
  SVG viewBox).
- One section header comment citing the design source.
- BEM-ish naming: `.<component>` / `.<component>-<region>` /
  `.<component>-<region>-<variant>`. No double-underscores; no
  loose hyphenation.

## Step 9 — Verify with Playwright + getComputedStyle

```js
// Render the primitive in a Storybook story. Probe key tokens.
const probe = await page.evaluate(() => {
  const el = document.querySelector(".<canonical-class>")
  const cs = getComputedStyle(el)
  return {
    padding: cs.padding,
    fontSize: cs.fontSize,
    borderColor: cs.borderColor,
    backgroundColor: cs.backgroundColor,
  }
})
```

Compare to the design literals from Step 3's manifest. **Drift
in 1px is a bug**, not a rounding judgement. If `getComputedStyle`
reports `14px` and the design says `13px`, fix the token, not the
verification.

Sweep at least these axis combinations:

- `theme=light × accent=blue   × density=default      × fontSize=base` (baseline)
- `theme=dark  × accent=blue   × density=default      × fontSize=base` (dark mode)
- `theme=light × accent=rose   × density=default      × fontSize=base` (accent flip)
- `theme=light × accent=blue   × density=compact      × fontSize=base` (density flip)
- `theme=light × accent=blue   × density=comfortable  × fontSize=base` (density flip)
- `theme=light × accent=blue   × density=default      × fontSize=lg`   (font-size flip)
- `theme=dark  × accent=amber  × density=compact      × fontSize=xl`   (combo)

## Step 10 — Stories cover every mockup section

In `src/stories/<Name>.stories.tsx`, port EVERY pattern from the
mockup's sections into a story. If the mockup has sections A–H
with ~50 patterns total, the stories cover ~50 patterns.

Naming convention: `<SectionLetter>_<patternName>` (e.g.
`A_StatSimple`, `H_Headers`). Each story renders the design's
example HTML using the primitive's props + composition.

Add a "Pattern matrix" story that crams all primitive variants
into one Row/Col grid for axes-sweep verification.

# Part 3 — Anti-patterns

- "I'll use `--spacing-3` instead of adding a `--card-pad-y-header`
  token because 12px is close to 10px." → Cardinal rule 22 hard
  violation. Add the token; don't substitute.
- "I'll skip the `.ch` flush-card pattern and only support the
  padded inline header." → API hides half the design's variants
  from consumers. Expose both.
- "I'll port the layout but tweak the borders to match other
  components." → Cross-component visual borrowing. The design
  canon for THIS component is the contract.
- "I won't add stories for sections E and F because they need
  primitives we don't have yet." → STOP. Build the missing
  primitives FIRST, then port the stories. Don't half-ship.
- "The component looks right at default density / base font, ship
  it." → Sweep the axes. Drift only shows up at compact + xl
  combo for some components.
- "Pretty sure 10px → 0.625rem matches the design." → Don't trust
  arithmetic. Verify with `getComputedStyle` after rendering.
- "I'll use Inter / Roboto because it's what other React systems
  do." → No. Font stack is `--font-sans-jp` (M PLUS 2 + JP
  fallback chain). Generic AI aesthetics violate Part 1.
- "Purple gradient on white looks modern." → No. The brand voice
  is restrained enterprise (渋み). Purple gradients on white are
  the most generic AI aesthetic. Stay in the dxs-kintai canon.

# Part 4 — How long does this take?

- A simple primitive (Tag, Badge): 30 min including stories.
- A medium primitive (Card with 4 prop axes + flush variant): 2 hr.
- A complex primitive (DatePicker, Calendar with React Aria): 3 hr.
- A full design-canon mockup port (Card with all 8 sections A–H):
  4 hr.

If it's taking 2× that long, you're trying to skip the procedure.
Stop, restart at step 1.

# Part 5.5 — Lint guardrails (adopted from google-labs DESIGN.md)

Once the lint script (`scripts/lint-tokens.mjs` — planned) lands,
the design-to-component workflow is CI-gated. Until then,
reviewers manually check.

| Rule | What it catches | Action |
|---|---|---|
| **broken-token-ref** | `var(--non-existent)` in any CSS / `style=` prop | Add the missing token in `theme.css` OR remove the dangling reference |
| **wcag-contrast** | Color pairs that fail 4.5:1 contrast at AA | Pick a higher-contrast token; document if intentional in `docs/explanation/accessibility.md` |
| **orphaned-token** | Token declared but referenced nowhere | Remove (or document why kept) |
| **section-ordering** | new-docs files that violate §A → §Z canonical order | Reorder sections |
| **duplicate-token** | Two tokens with identical value | Consolidate |
| **prop-vocabulary** | Prop name not in `new-docs/04` | Rename to vocabulary entry, or document divergence |
| **density-axis-coverage** | Primitive hardcodes height instead of `var(--density-element)` | Replace with token chain |

Source: [`google-labs-code/design.md`](https://github.com/google-labs-code/design.md)
applied to our existing token system.

# Part 5 — Connected rules

- Cardinal rule 14 (shadcn / Radix-ecosystem libraries only) —
  `CLAUDE.md` §14, recipe in
  `AGENTS.md` §"Third-party library policy".
- Cardinal rule 21 (every component supports all four theme axes)
  — `CLAUDE.md` §21, recipe in
  `AGENTS.md` §"Axes compliance recipe".
- Cardinal rule 22 (100% match to design canon) —
  `CLAUDE.md` §22.
- **Cardinal rule 23 (concept-first API, prop reuse, token
  existence check, deep-research before authoring) —
  `CLAUDE.md` §23, recipe in
  `AGENTS.md` §"Concept-first API recipe".**
  Run the §B vocabulary lookup BEFORE adding any new prop;
  grep the token catalogue BEFORE adding any new token; read
  the closest peer primitive end-to-end BEFORE writing the new
  primitive. Violations rejected automatically at review.
- Token system foundation — `new-docs/03-token-system.md`
  (the full token catalogue).
- Theme axes — `new-docs/01-theme-axes.md` (the
  four canonical axes).
- Consumer contract — `new-docs/02-consumer-contract.md`
  (what consumers must do when depending on `@godxjp/ui`).
- **Design handoff formats — `new-docs/05-design-handoff-formats.md`**
  (multi-format input: Claude Design HTML/CSS + google-labs
  DESIGN.md + W3C DTCG JSON + Figma; lint guardrails;
  cross-format token-reference syntax + canonical section
  ordering + diff discipline).

The skill body is mirrored at
`.codex/skills/new-godx-design-to-component/SKILL.md`. The `new-`
prefix is per user request so the skill survives future refactor
sweeps that might wipe generic `godx-*` skills.
