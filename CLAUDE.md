# @godxjp/ui — cardinal rules

Binding. Read before any edit inside `libs/ts/godxjp-ui/`. The 22
cardinal rules below are non-negotiable; anything older that
contradicts them is wrong.

> **Read [`./AGENTS.md`](./AGENTS.md) first.** This file carries
> the cardinal *rules* (the WHAT — concise, non-negotiable);
> AGENTS.md carries the *recipes* (the HOW — package map, topic
> homes, workflows, verification gates, design-system handoff,
> third-party library policy, gotchas). Per umbrella rule 10
> (one-fact-one-home) the recipe content lives there, not here.
> If you find yourself wanting to expand a rule below into a
> recipe, write it in AGENTS.md and leave the rule short.

For deeper architectural binding rules specific to `@godxjp/ui`
(theme axes, consumer contract, future rules) see
[`./new-docs/`](./new-docs/) — index at
[`./new-docs/00-index.md`](./new-docs/00-index.md). For umbrella-wide
binding rules see [`../../../new-docs/`](../../../new-docs/).

## STOP — framework-specific binding rules

| Trigger | Required reading |
|---|---|
| Add / rename a `data-*` attribute on `<html>` that re-binds design tokens; add a user preference toggle (theme / accent / density / font-size / new axis) | [`./new-docs/01-theme-axes.md`](./new-docs/01-theme-axes.md) |
| Start a new frontend that consumes `@godxjp/ui`; change consumer folder shape, theme.css, ESLint / Prettier / TS configs; build a new feature view; need a primitive that does not exist yet | [`./new-docs/02-consumer-contract.md`](./new-docs/02-consumer-contract.md) |
| Add / rename / remove a design token; write any CSS that needs a colour / spacing / padding / radius / shadow / motion / layout / density value | [`./new-docs/03-token-system.md`](./new-docs/03-token-system.md) |

These rules live next to the framework they govern. The umbrella's
binding table routes work here when the source of truth is a
framework concept; inline duplication is rejected at review.

## Cardinal rules

1. **Storybook is mandatory.** Every primitive, shell composition,
   and screen has `stories/<kind>/<Name>.stories.tsx`. Create / edit
   / delete a component → update the story in the same PR. CI
   rejects component diffs without a paired story diff. Stories
   cover every variant + state (default, hover, active, focused,
   disabled, loading, error) on light + dark. Template in
   [`./AGENTS.md`](./AGENTS.md) §Storybook.

2. **Tokens, not utilities.** Visual values come from CSS custom
   properties in `src/tokens/{tokens,tokens-ext}.css`. Token-named
   Tailwind utilities (`bg-background`, `text-foreground`) are
   fine. Raw value utilities (`bg-blue-500`, `text-zinc-900`) are
   forbidden. ADR-0003.

3. **Radix for interactive primitives.** Anything with keyboard
   nav, focus, ARIA, or portal rendering wraps the relevant Radix
   primitive. We do not reinvent accessibility. ADR-0001.

4. **shadcn-style ownership.** Primitives are thin wrappers;
   consumers can fork any primitive's source without leaving the
   ecosystem. ADR-0002.

5. **One i18next singleton.** `initI18n()` in `src/i18n/index.ts`
   is THE instance. Consumers extend via `addResourceBundle`; they
   do not create their own. ADR-0004.

6. **WCAG 2.1 AA baseline.** Every interactive primitive passes
   axe-core: keyboard nav, ARIA, focus-visible, 4.5:1 contrast,
   `prefers-reduced-motion`. Stories double as a11y test surfaces.

7. **SemVer 2.0.0 + Keep a Changelog 1.1.0.** Every release-worthy
   change updates `CHANGELOG.md` under `## Unreleased` in the same
   PR.

8. **Inclusive naming.** `allowlist` / `denylist`, `main` /
   `primary`, `replica` / `secondary`, `they/them`. Never
   `whitelist` / `blacklist` / `master` / `slave`. Lint-enforced.

9. **No marketing speak.** Banned in prose: "powerful", "robust",
   "blazing fast", "best-in-class", "seamless", "enterprise-grade".
   State what it does.

10. **English is canonical for docs.** Localised docs live in
    `docs/i18n/<bcp47>/`. Front-matter tracks staleness.

11. **Submodule discipline.** Commits go to
    `github.com/godx-jp/godxjp-ui`; the umbrella sees only the SHA
    pin. Two-PR workflow: (1) submodule PR → merge to `main` here,
    (2) umbrella PR → bump the pin. Never push a pin to a SHA that
    isn't on the submodule remote.

12. **Branch + PR workflow.** `feat/<scope>` / `fix/<scope>` →
    submodule `main`. CI green (build + test + Storybook + a11y)
    required. Squash-merge. Direct push to `main` forbidden.
    `--no-verify` forbidden.

13. **TypeScript strict.** Explicit types on every export.
    `forwardRef` for components; `ComponentPropsWithoutRef` for
    extension. No `any`. No `@ts-ignore` without comment + issue
    link.

14. **Every third-party library is shadcn / Radix-recommended.**
    Any new external dependency consumed by a component MUST be one
    that shadcn/ui OR Radix UI (or the React Aria / Adobe React
    Spectrum companion stack — same recommendation pool) ship as
    their official choice for that capability. The goal is one
    cohesive interaction + accessibility surface across every
    primitive; reaching for a library outside the recommendation
    pool fractures behaviour, a11y, and theming.

    Current locked stack:
    - React 19, Tailwind v4 (locked at the framework level).
    - **Radix UI** — interactive primitive base (per cardinal rule 3).
    - **shadcn/ui ownership model** — primitive structure (per rule 4).
    - **cmdk** — command palette (shadcn-canonical).
    - **sonner** — toast (shadcn-canonical).
    - **lucide-react** — icon set (shadcn-canonical).
    - **react-aria-components** + **@internationalized/date** — date
      picker / calendar (shadcn community-recommended replacement
      for react-day-picker; ARIA APG-compliant, timezone-correct).
    - **i18next** + **react-i18next** — i18n singleton (rule 5).
    - **class-variance-authority** + **clsx** + **tailwind-merge** —
      class composition (shadcn-canonical).

    Adding a new peer → write `docs/adr/NNNN-<slug>.md` documenting
    why the chosen library IS the shadcn/Radix recommendation for
    that capability. If shadcn/Radix don't recommend any library for
    the capability, the ADR proposes the library, links the shadcn
    community discussion, and gets review approval. **No silent
    "I picked this because it's popular"** — popularity does not
    substitute for ecosystem cohesion.

15. **`@apply` re-encoding tokens is forbidden.** Inside primitive
    `.tsx`, do not `@apply` a Tailwind utility that re-encodes a
    token value — reference the canonical CSS class from
    `tokens.css` instead. Composite token-named utilities
    (`bg-background border-border`) remain fine.

16. **CSS source-of-truth is `src/tokens/`.** A primitive that
    needs a new color / spacing / radius adds it to `tokens.css`
    (or `tokens-ext.css`) FIRST, then references it.

17. **`stories/` ↔ `src/components/` parity.** The set of files
    under `stories/primitives/` matches the set exported from
    `src/components/primitives/index.ts`. Same for `shell/` and
    `screens/`. CI-checked via `scripts/check-stories-parity.mjs`.

18. **`docs/reference/primitives/` ↔ `src/components/primitives/`
    parity.** Every primitive has a reference page; every
    reference page maps to an exported primitive. CI-checked via
    `scripts/check-docs-parity.mjs`.

19. **No service-specific anything.** This is a generic UI
    framework. `me-service`, `forge-service`, `admin-service`,
    etc., never appear in source comments, prop names, or default
    values. `[data-tenant="<svc>"]` CSS blocks are removed — per-
    deployment brand color lives at `[data-accent="<palette>"]`
    (see [`./new-docs/01-theme-axes.md`](./new-docs/01-theme-axes.md)
    + [`./new-docs/02-consumer-contract.md`](./new-docs/02-consumer-contract.md) §A).
    `src/data/products.ts` stays as a generic product catalog
    consumed by the ProductSwitcher shell primitive; its `tenant`
    field is typed `string` (open union) so downstream apps can
    register their own without modifying the framework, but it
    does NOT drive CSS token bindings.

20. **No "platform-only" exports.** Every primitive ships in
    `package.json::exports` so external godx-jp projects can
    consume it. Internal-only helpers stay un-exported under
    `src/internal/` or `_`-prefixed files.

21. **Every component supports all four theme axes.** A new or
    edited primitive / composite / shell composition MUST honour
    every axis defined in
    [`./new-docs/01-theme-axes.md`](./new-docs/01-theme-axes.md)
    without per-component overrides:

    - **`data-theme`** (light / dark) — every color reads from a
      semantic token (`--background`, `--foreground`, `--card`,
      `--border`, `--muted-foreground`, `--primary`, `--ring`, …).
      No hardcoded hex / OKLCH literals in a component CSS rule.
      Verify: switch `[data-theme="dark"]` on `<html>` and confirm
      the component still has 4.5:1 contrast + sensible surfaces.
    - **`data-accent`** (blue / green / violet / amber / rose /
      slate) — brand color flows through `--primary`, `--ring`,
      `--brand`, `--sidebar-active-*`. A component that renders
      "the brand color" reads `var(--primary)` (or its derivatives
      via `color-mix(in oklch, …)`), never a fixed hue.
    - **`data-density`** (compact / default / comfortable) —
      heights / paddings that scale with density use the density
      tokens (`--density-element`, `--density-card`,
      `--density-page`, `--header-height`, `--density-table-head`).
      A component that hardcodes `height: 32px` breaks compact +
      comfortable. Use `var(--density-element)` or the named
      Tailwind utility (`h-[var(--density-element)]`).
    - **`data-font-size`** (sm / base / lg / xl) — rem-based sizes
      rescale automatically. Pixel literals freeze the size and
      break the axis; use `rem` (or the `--text-*` / `--spacing-*`
      tokens) for anything the user should be able to grow / shrink.
      Exceptions documented at the rule (touch-target-min: 44px,
      hairline borders: 1px).

    **Verification before review**: every PR touching a primitive
    /composite / shell adds (or already has) a Storybook story for
    that surface. The reviewer flips the Storybook toolbar through
    every combination of `theme × accent × density × fontSize` and
    confirms the component reads right at each. AGENTS.md §"Axes
    compliance recipe" carries the step-by-step.

    No component is exempt. If a primitive cannot honour an axis
    (e.g. a fixed-aspect-ratio media element ignoring font-size),
    that's documented in the primitive's reference doc with the
    reason — not silently absorbed.

22. **100% match to the design canon — absolute.** Every visual
    decision (padding, height, gap, font-size, font-weight,
    line-height, border-width, border-color, radius, shadow,
    spacing inside a region, divider presence, region order,
    icon size, dot size, transition timing) MUST come from the
    canonical design bundle at
    `design-handoff/ui-system/<latest-bundle>/`. Implementations
    that ship "close enough" are rejected — close-enough is the
    reason design systems drift.

    Process:

    1. **Read first**: before writing CSS, open the matching
       `project/preview/comp-<name>.html` in the bundle. Read it
       top to bottom. Note every literal value (px, rem, percent,
       color-mix expression, var-token reference) used by the
       primitive's regions.
    2. **Token-pin those literals**: express each literal as a
       token reference (`var(--…)`), in `rem` for user-scalable
       quantities, in `px` for the documented exceptions (44px
       touch target, 1px hairline, SVG viewBox). The token's
       DEFAULT value matches the design literal exactly (at
       `data-density="default"` + `data-font-size="base"`).
    3. **Honour axes via the token chain**: rule 21. Token
       rescales naturally with density / font-size; literal value
       at default density / base font-size matches the design
       pixel-for-pixel.
    4. **Verify with `getComputedStyle`**: a Playwright probe on
       the rendered primitive reads `getComputedStyle(element)` and
       compares to the design literal at default-density / base-
       font-size. Drift in a single px is a bug, not a
       discretionary judgement.
    5. **Missing from the bundle?** STOP. Tell the user:
       > "The design bundle at `design-handoff/ui-system/<latest>/`
       > does not cover X. Please mock it on Claude Design
       > (claude.ai/design) and share the new handoff URL — I'll
       > re-fetch + implement."
       Never improvise. Never "fill in a gap" with your own
       visual judgement. The bundle is the contract.

    Anti-patterns (rejected at review):

    - "Used `--spacing-3` (12px) where the design shows 10px
      because 12 was already in the token system." → Add the
      missing 10px token, or use the closest design-matching
      rem value, or add a per-component variable. Never
      substitute.
    - "Used `--text-base` (14px) where the design shows 13px
      because we already have base." → Same. Add the missing
      token, don't substitute.
    - "Used `border-bottom: 1px solid var(--border)` on the
      header because Tabs has one." → If the design's header in
      this context has NO divider, your header has NO divider.
      No cross-component borrowing.
    - "Switched the order of subtitle + extra because it read
      better." → No. Region order is the design's contract.

    Honest variances are documented:

    - If a design literal cannot map cleanly to the token system
      (e.g. the design says 10px but we have `--spacing-2` = 8px
      and `--spacing-3` = 12px), add a new token in
      `src/styles/theme.css` that pins the exact value, then
      reference it. Document the addition in CHANGELOG.md under
      `### Added` so reviewers see why a new token landed.

    The whole reason `design-handoff/ui-system/` exists is to
    serve as the verifiable contract. Bypassing it is the most
    expensive bug class this framework can ship.

## Hard rules — code review rejects on sight

- Component diff without paired story diff (rule 1).
- Raw color utility (`bg-blue-500`) in a primitive (rule 2).
- Hand-rolled focus / keyboard nav when Radix has it (rule 3).
- New primitive without `docs/reference/primitives/<Name>.md`
  (rule 18).
- `any` in an export signature (rule 13).
- `// eslint-disable-line` without comment + issue link.
- Banned terms (`master`, `whitelist`, `blacklist`, …) anywhere
  (rule 8).
- Marketing speak in README / docs / code comments (rule 9).
- Service-specific reference (`me.profile`, `forge.workspace`) in
  primitive source or comments (rule 19).
- Submodule push that diverges from upstream, or direct push to
  `main` (rules 11, 12).

## Verification

Full pre-commit gate is in [`./AGENTS.md`](./AGENTS.md) §Verification.
Pre-commit hook enforces it; `--no-verify` is forbidden.

## Links

- Framework binding rules (this submodule): [`./new-docs/`](./new-docs/)
  — theme axes, consumer contract, future rules. Index at
  [`./new-docs/00-index.md`](./new-docs/00-index.md).
- Agent recipes + gotchas: [`./AGENTS.md`](./AGENTS.md)
- Brand bible: [`./BRAND.md`](./BRAND.md)
- Change log: [`./CHANGELOG.md`](./CHANGELOG.md)
- Diátaxis manual: [`./docs/`](./docs/)
- Umbrella binding rules: [`../../../new-docs/`](../../../new-docs/)
  — esp. rule 13 (doc authoring) + rule 12 (monorepo-platform
  wiring of consumer frontends).
- Repo-wide cardinal rules: [`../../../CLAUDE.md`](../../../CLAUDE.md)
- Upstream: https://github.com/godx-jp/godxjp-ui
