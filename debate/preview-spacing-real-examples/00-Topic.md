# Debate — How to fix the @godxjp/ui preview (overview spacing + sparse examples)

## Question
The preview app (`preview/` + `examples/**/*.preview.tsx`, deployed to GitHub Pages) is the design
system's reference site — it is BOTH user-facing docs AND a library of real usage examples. Two problems
to fix, and a hard rule:
1. **Overview spacing is raw/cramped.** Components in the overview are separated by ad-hoc margins or bare
   line breaks (read `preview/App.tsx`, `preview/demo-block.tsx`, `preview/catalog.ts`). It should use the
   framework's own layout primitives (`Stack`/`Inline`/`ResponsiveGrid`/`Flex` `gap`, `PageContainer`,
   `Card`/`CardContent`) so the docs site itself models correct spacing.
2. **Examples are sparse/superficial.** They don't show realistic, true-to-life usage; the user wants
   examples that look like REAL screens (real-ish data, real images where useful) so consumers can imagine
   using each component.
3. **HARD RULE:** examples + overview may use ONLY components that already exist in `@godxjp/ui`
   (`context/snapshot.md` lists them). NO hand-rolling, NO inventing new components/wrappers ("chế cháo").

What is the right STRATEGY/scope to fix this?

## Discrete OPTIONS
- **Option POLISH — fix in place.** Keep the current preview architecture. Replace the overview's raw
  margins/line-breaks with framework layout primitives (one shared spacing recipe). Enrich each existing
  `*.preview.tsx` with realistic content + real images (via a neutral source). Smallest change; no new files.
- **Option RECIPES — add a "real screens" example layer.** Keep per-component demos but ADD a set of
  full, true-to-life **scenario screens** composed only from existing components (e.g. a sign-in page, a
  settings page, an invoice/orders table, a dashboard, a profile card) as the headline examples, plus fix
  overview spacing. The recipes become the "imagine it real" gallery the user asked for.
- **Option SYSTEMATIZE — shared fixtures + example shell + a guard.** Define realistic scenario FIXTURES
  once (sample users/orders/products with real images) in `examples/fixtures`, render every example from
  them through a shared spacing shell, AND add a CI check that examples import only `@godxjp/ui`
  (no raw HTML controls / no local components) so "chế cháo" can never creep back. Most structural.

## Hard constraints
- Examples/overview use ONLY existing `@godxjp/ui` components — enforce, don't just request.
- `pnpm preview:build` MUST stay green (it's the Pages gate) — examples can't reference removed/renamed parts.
- Real images must come from a neutral, license-safe source (e.g. picsum/unsplash-source or committed neutral
  assets) — NO product/brand/domain content (rule #19).
- Spacing must come from layout primitives + tokens, never raw `p-*`/`gap-*`/`<br>`/margins in examples.

## Scoring rubric (weights sum 100)
- **Fixes the user's two asks (spacing + realistic examples)** — 30
- **Constraint adherence (only existing components; enforceable)** — 20
- **Reference/teaching value (does it make the component obvious to a consumer)** — 20
- **Effort / deliverability** — 15
- **Maintainability (examples don't rot; parity with the component set)** — 15

## Roster
ADV-POLISH, ADV-RECIPES, ADV-SYSTEMATIZE, SKEPTIC (red-team all), JUDGE (scores rubric; writes
04-Decision.md WITH a concrete execution plan — which files, which scenario screens, which spacing recipe,
what guard; records dissent).

## Status
decided
