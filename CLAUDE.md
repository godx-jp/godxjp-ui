# @godxjp/ui — cardinal rules

Binding. Read before any edit inside `libs/ts/godxjp-ui/`. The 26
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
| Add / rename a prop on any primitive; author a new primitive's API | [`./new-docs/04-prop-vocabulary.md`](./new-docs/04-prop-vocabulary.md) |
| Accept a new design-handoff bundle (Claude Design / google-labs DESIGN.md / W3C DTCG / Figma); add lint guardrails; export tokens to inter-tool formats | [`./new-docs/05-design-handoff-formats.md`](./new-docs/05-design-handoff-formats.md) |

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

23. **Concept-first component API — separate every concept, reuse
    every shared axis, deep-research before authoring a primitive.**
    Absolute. Bypassing any of the three sub-rules below produces
    duplicated concepts and an incoherent API surface — the most
    expensive long-term debt this framework can ship.

    ### §A — Separate every concept cleanly

    A component prop carries ONE concept. If two concepts overlap
    in a single prop, the API confuses callers and drift becomes
    inevitable. Examples:

    - `size` carries ONE concept (component height / dimensional
      scale). It does NOT also encode density, padding, font-size,
      or visual emphasis. Those are separate props.
    - `color` carries ONE concept (semantic role: `primary`,
      `success`, `warning`, `attention`, `info`, `destructive`,
      `default`). It does NOT also encode appearance (`soft` vs
      `solid` vs `outline`); appearance is a separate prop.
    - `variant` carries the visual treatment (`primary` /
      `secondary` / `ghost` / `outline` / `link` for buttons,
      `soft` / `solid` / `outline` for badges). It does NOT also
      encode the semantic color; combine `variant` + `color` for
      the full surface.
    - `padding` (Card) carries density-of-internal-spacing.
      It does NOT also encode background tone, border accent,
      or shadow — `tone`, `accent`, `hoverable` are separate axes.

    Rejected at review:

    - A single `kind` / `style` / `mode` prop that conflates two
      orthogonal axes ("compact-success-soft" instead of
      `size="small" color="success" variant="soft"`).
    - A boolean prop where a value enum is honest (`primary` bool
      on Button instead of `variant="primary"`).
    - Reusing one prop name for two different concepts in two
      different primitives (e.g. `kind` meaning size in one
      primitive and semantic role in another).

    ### §B — Reuse the shared prop vocabulary

    Before declaring a new prop on a new primitive, **check the
    existing primitive surface** for a matching vocabulary. The
    shared prop axes locked across the framework are:

    | Prop | Type | Used by | Concept |
    |---|---|---|---|
    | `size` | `"small" \| "default" \| "large"` (+ `"x-small"` / `"x-large"` when scale needs) | Button, Input, Avatar, Tag, Badge, IconButton, Spinner, … | Dimensional scale of the primitive itself |
    | `variant` | primitive-specific enum (e.g. `"primary" \| "secondary" \| "ghost" \| "outline" \| "link"` for Button; `"soft" \| "solid" \| "outline"` for Badge) | Button, Badge, Tag, Card?, Alert | Visual treatment (fill / outline / ghost) |
    | `color` | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive" \| "default"` | Tag, Badge, Alert, Dot, Delta, IconSquare | Semantic role |
    | `tone` | `"default" \| "muted" \| "outline-only"` | Card | Surface tint / background treatment |
    | `accent` | semantic color enum (left-edge or full-ring) | Card | Semantic edge indicator |
    | `padding` | `"tight" \| "default" \| "cozy" \| "none"` | Card, Dialog (planned), Sheet (planned) | Internal-spacing density |
    | `density` | `"compact" \| "default" \| "comfortable"` (usually inherited from `[data-density]` axis — only set explicitly when overriding the page-level axis) | (theme axis primarily; explicit prop on Table?) | Page-level spacing scale |
    | `disabled` / `loading` / `readOnly` / `required` | boolean | Forms / inputs | Interaction state |
    | `prefix` / `suffix` / `addonBefore` / `addonAfter` | `ReactNode` | Input, Button (icon slots) | Decorative / functional slots |

    Rules:

    - When designing a new primitive's prop surface, FIRST grep
      the existing primitives for the same concept. Match the
      vocabulary verbatim (`size` not `scale`, `variant` not
      `kind`, `color` not `intent`).
    - When the existing vocabulary is wrong for the new primitive
      AND extending it would force a breaking change, document
      the divergence in `docs/reference/primitives/<Name>.md` with
      the reason. Don't silently coin a new name for the same
      concept.
    - When TWO primitives need the same enum (e.g. semantic color
      values), promote it to a shared type
      (`SemanticColor = "primary" | …`) in
      `src/components/primitives/types.ts` and import. Don't
      redeclare per primitive.

    Forbidden:

    - `size: "sm" | "md" | "lg"` in one primitive while another
      uses `size: "small" | "default" | "large"`. Pick one
      framework-wide.
    - `appearance` / `look` / `style` synonyms for `variant`.
    - `tint` / `intent` / `theme` synonyms for `color`.
    - `compactness` / `spacing` synonyms for `padding` / `density`.

    ### §C — Always check if a token already exists

    Before adding a new design token (`--<name>: <value>`),
    grep the existing token catalogue in
    [`./new-docs/03-token-system.md`](./new-docs/03-token-system.md)
    + `src/styles/theme.css` + `src/tokens/`. Map the value you
    need against:

    1. Semantic tokens (`--primary`, `--background`, `--success`,
       `--card`, `--ring`, `--muted-foreground`, …).
    2. Scale tokens (`--text-*`, `--spacing-*`, `--density-*`,
       `--radius-*`, `--shadow-*`).
    3. Component-scope tokens (`--card-pad-y-*`, `--card-title-size`,
       `--card-band-height`, …).
    4. Layout tokens (`--header-height`, `--sidebar-width`).

    Only if NO existing token covers the literal AND the literal
    cannot be a generic addition (per cardinal rule 22 → must
    match design canon) do you add a NEW component-scope token.
    Naming convention `--<component>-<aspect>-<axis>?`.

    Forbidden:

    - Declaring `--button-padding-y: 8px` when `--spacing-2` is
      already 8px. Use the scale token.
    - Re-coining `--card-divider-color` when `--border` covers it.
    - Creating per-state tokens (`--button-hover-bg`,
      `--button-active-bg`) when `color-mix(in oklch, var(--primary)
      N%, transparent)` derives them. Tokens encode VALUES; states
      derive via `color-mix` or per-state class hooks.

    ### §D — Deep-research before authoring a primitive

    A new primitive is a long-term commitment. Before writing the
    first line of `<Name>.tsx`:

    1. Grep the existing barrels (`src/components/primitives/index.ts`,
       `src/components/shell/index.ts`, `src/components/composites/index.ts`)
       for the same concept. The primitive may already exist under
       a different name.
    2. Check the design handoff bundle. Is this primitive shown in
       `design-handoff/ui-system/<latest>/project/preview/`? If
       yes, follow the
       [`new-godx-design-to-component`](./.claude/skills/new-godx-design-to-component/SKILL.md)
       skill (mirrored at `./.codex/skills/` for Codex sessions —
       both copies kept byte-identical via `scripts/sync-skills.sh`).
       If no, STOP — ask the user to mock it on Claude
       Design first (cardinal rule 22).
    3. Check the shadcn / Radix / React Aria ecosystem (per
       cardinal rule 14). The new primitive MUST wrap one of
       those libraries unless it's purely structural (a div with
       tokens).
    4. Read the closest peer primitive's `.tsx` end-to-end. The
       new primitive's prop shape, forwardRef usage, className
       composition pattern, story shape MUST mirror the peer.

    Forbidden:

    - Writing a `<Pill>` primitive when `<Tag>` covers it — same
      concept, different name. Extend `<Tag>` with a `shape`
      prop instead, or use it directly.
    - Writing a `<Statistic>` primitive AND a `<KpiNumber>`
      primitive that emit identical DOM. Pick one.
    - Creating `<HBox>` / `<VBox>` when `<Flex>` covers row vs
      column via `direction`/`vertical` prop.
    - Skipping the peer-primitive read because "I know what
      buttons look like". The framework's conventions are not
      generic; read the peer.

    ### Verification at review

    Reviewers check:

    1. Every new prop maps to a row in the §B vocabulary table OR
       has a documented divergence in `docs/reference/primitives/<Name>.md`.
    2. Every new token maps to a §M row in
       [`./new-docs/03-token-system.md`](./new-docs/03-token-system.md)
       OR has a citation to the design canon literal it pins.
    3. The PR description cites the peer primitive read in §D.4
       (e.g. "modeled prop shape after `Button.tsx`").
    4. No prop name collides with an existing vocabulary entry
       under a different meaning.

    Rejection is automatic for vocabulary-drift, concept-conflation,
    or duplicate-primitive PRs. The framework's coherence is
    impossible to recover incrementally once it fractures.

24. **Mobile-first design — always.** Every primitive / composite /
    shell / story is designed FIRST for the smallest viewport
    (`xs` — phone portrait ≥0px) and progressively enhanced for
    wider screens via the `sm` / `md` / `lg` / `xl` / `xxl`
    breakpoint tokens (cardinal rule 22 + new-docs/03 §I-2).

    Token vocabulary (single source-of-truth in `theme.css`):

    ```css
    --breakpoint-xs:  0;       /* phone portrait — mobile-first base */
    --breakpoint-sm:  640px;   /* phone landscape / tablet portrait */
    --breakpoint-md:  768px;   /* tablet landscape */
    --breakpoint-lg:  1024px;  /* laptop */
    --breakpoint-xl:  1280px;  /* desktop */
    --breakpoint-xxl: 1536px;  /* wide desktop */
    ```

    ### §A — Mobile-first defaults

    The DEFAULT (no media query, no breakpoint variant) targets
    `xs` (phone portrait). Every `<= xs` style is written as
    base CSS / Tailwind utility without a `<bp>:` prefix.
    Larger-viewport styles are progressive enhancements via
    `sm:` / `md:` / `lg:` / `xl:` / `2xl:` utility variants.

    ```tsx
    /* CORRECT — phone-first, then tablet+ override */
    <div className="grid grid-cols-1 md:grid-cols-3">

    /* WRONG — desktop-first, then narrow override */
    <div className="grid grid-cols-3 sm:grid-cols-1">
    ```

    ### §B — Touch targets

    On mobile every interactive primitive MUST meet the WCAG 2.1 AA
    touch-target floor: **44 × 44 px** (`--touch-target-min`).
    Cardinal rule 21 covers density-axis flow; `--touch-target-min`
    does NOT scale with density.

    ### §C — Responsive primitives reach for tokens

    Components reading viewport state JS-side go through:

    ```ts
    import { useBreakpoint, matchBreakpoint } from "@godxjp/ui/hooks"

    const bp = useBreakpoint()
    if (bp === "xs" || bp === "sm") return <MobileShell />
    ```

    NEVER `window.innerWidth >= 768`. NEVER hardcoded media
    queries with px literals in component CSS. Tailwind utility
    variants (`md:`, `lg:`, …) for compile-time; `useBreakpoint`
    for runtime.

    ### §D — Story coverage

    Every Storybook story renders FIRST at narrow viewport
    (Storybook default for `iframe.html` is ~1280; resize the
    Storybook canvas via the Viewports toolbar to `xs` /
    `mobile1` / etc. and confirm the story still reads).
    Stories that depend on wide-viewport layout (multi-col grids)
    add a docs-block note explaining the breakpoint break.

    ### §E — Mobile-first patterns

    | Surface | Mobile (`xs/sm`) | Tablet+ (`md`+) |
    |---|---|---|
    | Page shell | Sidebar collapses to drawer; topbar full-width | Sidebar pinned `--sidebar-width: 16rem`; topbar inside |
    | Card grid | `grid-cols-1` | `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
    | Filter row | Stacked or sheet | Inline row |
    | Tables | Card-list fallback (1 card per row) | Real `<table>` |
    | Dialogs | Bottom-sheet (`bottom: 0; max-height: 90vh`) | Centred modal |
    | Forms | Single column; full-width inputs | Two-column on `md+` |

    ### Anti-patterns (rejected at review)

    - `window.innerWidth >= 768` — hardcoded literal. Use
      `useBreakpoint` / `matchBreakpoint`.
    - `@media (min-width: 768px)` in a primitive's CSS without
      pinning to a token + comment citing it.
    - `grid-cols-3` at base (no breakpoint prefix) when the
      primitive is consumed at viewport < 768px. Use
      `grid-cols-1 md:grid-cols-3`.
    - Primitive heights that violate `--touch-target-min: 44px`
      on `xs` / `sm` — even when density="compact", the touch
      target floor wins.
    - Stories that only render at desktop width without a docs
      note explaining the breakpoint gate.

25. **Stories are docs; the UI is the primitive — refactor the
    primitive, never paper over with a story tweak.** Absolute.

    Stories under `src/stories/new-primitives/components/<group>/<Name>.stories.tsx`
    catalogue WHAT a primitive does — they show variants, axis
    sweeps, design-canon examples. They are documentation; they
    are NOT the implementation.

    When the design canon shifts, when a vocabulary violation is
    found, when the user reports "this looks wrong" — the fix is
    in the primitive (`src/components/primitives/<Name>.tsx` +
    associated CSS in `src/styles/shell.css` + tokens in
    `src/styles/theme.css`), NOT in the story.

    ### When the story is "wrong"

    Rewriting the story so it renders something different is
    NEVER the right answer. If the story renders the wrong
    visual, one of these is true:

    a) The primitive's PROPS don't expose the right concept →
       extend the primitive's API (per rule 23 §B vocabulary;
       per rule 23 §D deep-research).
    b) The primitive's CSS hardcodes a value or shape that
       drifts from the design canon → fix the CSS (per rule 22
       100% match).
    c) The token chain is wrong → fix the token (per rule 22 +
       new-docs/03 §J component-scope tokens).
    d) The primitive doesn't honour an axis (theme / accent /
       density / font-size) → fix the primitive's token reads
       (per rule 21 axes-aware).

    None of these are fixed by editing the story. The story
    becomes correct AUTOMATICALLY when the primitive becomes
    correct.

    ### What stories ARE for

    - Render the primitive in its intended variants (one story
      per variant family per rule 1 storybook-mandatory).
    - Demonstrate prop-axis sweeps (size × variant × color).
    - Port design-canon section examples (`comp-<name>.html`
      sections A–Z → stories) so reviewers can compare the
      primitive's output to the canon side-by-side.
    - Drive Playwright snapshot tests (cardinal rule 1).
    - Drive a11y axe-core checks (cardinal rule 6).

    ### What stories ARE NOT for

    - Defining "the look" of the primitive — that's the CSS in
      `shell.css` + the tokens in `theme.css`.
    - Containing inline `style={{ … }}` overrides that work
      around a primitive's missing prop — extend the primitive.
    - Containing `className="text-blue-500 px-3 py-2"` Tailwind
      utility stacks that re-shape the primitive — extend the
      primitive's variant enum.
    - Containing per-story `<style>` blocks that override CSS —
      fix the CSS upstream.

    ### Anti-patterns (rejected at review)

    - PR description: "fixed the Card story to match design".
      → Wrong. The Card PRIMITIVE was wrong; the story was
      showing what the primitive did. Fix the primitive.
    - Story diff > 50 lines while primitive diff = 0 — drift is
      being papered over.
    - Story using `style={{ borderLeft: "3px solid var(--primary)" }}`
      when the primitive should expose `accent="primary"`.
    - Adding a CSS file under `src/stories/` — stories don't ship
      CSS; all visual contract lives in `shell.css` / `theme.css`.

    ### The discipline

    When user reports drift on a primitive:
    1. Read the design canon line for that primitive.
    2. Read the primitive's `.tsx` + the matching CSS in
       `shell.css`.
    3. Identify which of (a)/(b)/(c)/(d) above is the gap.
    4. Fix the PRIMITIVE / CSS / TOKEN — never the story.
    5. Re-render the story (no code change to the story) and
       confirm it now renders correctly.
    6. If the story needs cosmetic updates (new variant added,
       new example pattern from design canon) — those are
       additive, not "fixes".

    Story file diffs without a corresponding primitive / CSS /
    token diff are rejected at review.

26. **Library isolation — consumers ship only what they import.**
    Absolute.

    The `dist/` artefact published to npm carries the UI framework
    surface ONLY: primitives + composites + shell + hooks + i18n +
    preferences + data + tokens (CSS). Nothing else — no
    Storybook, no dev tooling, no test helpers, no probe scripts,
    no design-handoff bundle. Consumers who `import "@godxjp/ui"`
    get a tight tree-shakable surface; consumers who use only
    one primitive pull in only that primitive's transitive cost.

    ### §A — What ships in `dist/`

    Every entry in `tsup.config.ts` corresponds to a sub-path in
    `package.json::exports`. Today's set:

    - `index`                   — root barrel
    - `i18n`                    — i18next singleton + initI18n
    - `hooks`                   — useTweaks / useBreakpoint / …
    - `data`                    — products catalogue
    - `components/primitives`   — Button / Input / Card / …
    - `components/shell`        — AppShell / Sidebar / Topbar
    - `components/screens`      — DashboardScreen / PlansScreen
    - `components/composites`   — Upload / LocaleInput / Calendar
    - `preferences`             — PreferencesProvider

    Adding a new entry: append to `tsup.config.ts::entry` AND
    `package.json::exports`. Both mirror.

    ### §B — What MUST NOT ship in `dist/`

    - `src/stories/**`              — Storybook stories (dev docs)
    - `.storybook/**`               — Storybook config
    - `scripts/**`                  — lint-tokens / probes / build helpers
    - `__tests__/**`                — Vitest specs
    - `*.test.{ts,tsx}` / `*.spec.{ts,tsx}` — same
    - `design-handoff/**`           — design canon bundle (operator-only)
    - `card-verify.cjs` / probe-*.cjs — throwaway Playwright probes
    - `design/**`                   — Sketch / Figma exports

    Verification — `pnpm pack` then untar the tarball; only
    `dist/` + `src/tokens/` + `config/` + `BRAND.md` + `CHANGELOG.md`
    + `LICENSE` + `README.md` + `package.json` should appear.

    ### §C — What MUST NOT be bundled into `dist/*.js`

    Every npm `dependencies` entry is `external` in
    `tsup.config.ts`. Tsup config auto-derives the list from
    `package.json::dependencies`:

    ```ts
    const externalDeps = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
    ]
    ```

    Consumer's package manager (pnpm / npm / yarn) resolves them
    once, deduped across the dep tree. Double-bundling = the same
    Radix / Sonner / Lucide code appearing in TWO places in the
    consumer's app, defeating dedup + tree-shake.

    Plus regex matchers for sub-path imports
    (`react/jsx-runtime`, `react-dom/client`, `@radix-ui/*/dist`,
    `@internationalized/date/*`).

    ### §D — `package.json::files` whitelist

    Only the strict consumer surface ships:

    ```json
    "files": [
      "dist",
      "src/tokens",
      "config",
      "BRAND.md",
      "CHANGELOG.md"
    ]
    ```

    `src/components/`, `src/stories/`, `src/hooks/`, `src/styles/`
    DO NOT appear — they're build inputs, not consumer surfaces.
    Consumer imports the BUILT JS at `dist/*` (resolved via
    `package.json::exports`).

    `src/tokens/` ships as RAW CSS for consumers that import
    `@godxjp/ui/tailwind.css` (Tailwind v4 `@import` entry).

    ### §E — Forbidden patterns

    - **Importing a story or design-handoff file from a primitive
      source.** A primitive must not transitively pull a story or
      a design canon file — those are not in `dist/`.
    - **Adding a `devDependency` to `dependencies`.** Storybook,
      Vitest, Playwright, tsup ARE devDependencies. They must
      never become runtime deps.
    - **`import "../../stories/<X>.stories"` from primitive
      code.** Stories import primitives, never the reverse.
    - **`tsup` entry pointing at a story / test / script file.**
      The entry list is the public surface contract.
    - **`package.json::files` listing `src/`.** That ships every
      story + every internal helper to npm — the opposite of
      isolation.

    ### §F — Verification at PR review

    1. `pnpm build` — confirm `dist/` shape matches §A; no story
       files; no test files.
    2. `node -e "console.log(require('./libs/ts/godxjp-ui/dist/components/primitives.cjs') ? 'ok' : 'missing')"`
       — or the ESM equivalent — confirms the consumer-shaped
       module resolves cleanly.
    3. `grep -r "@storybook\|vitest\|playwright" libs/ts/godxjp-ui/dist/` —
       MUST return 0 matches. Any hit = a dev tool leaked into
       the consumer surface; investigate immediately.
    4. `du -sh libs/ts/godxjp-ui/dist/components/primitives.js` —
       track size; sudden 2× growth often signals a bundled lib
       that should be external. Set a rough budget of 100 KB for
       primitives.js / 200 KB for index.js (advisory).

    ### Why this rule exists

    Consumer apps consuming `@godxjp/ui` should pay ONLY for the
    visual layer they use. If a service's frontend bundles 800 KB
    of Storybook addon code because we accidentally shipped it,
    that service's page-load suffers — and the user blames their
    own SPA, not the framework. Isolation is the contract that
    keeps `@godxjp/ui` adoption frictionless.

    The discipline: every PR that adds an entry point (`tsup
    entry` / `package.json::exports`), bumps a dependency, or
    moves a file out of `src/stories/` runs the §F checklist
    BEFORE landing.

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
- In-repo agent skills (works when this repo is cloned standalone
  without the umbrella): [`./.claude/skills/`](./.claude/skills/README.md)
  (Claude Code) and [`./.codex/skills/`](./.codex/skills/README.md)
  (Codex) — byte-identical via `scripts/sync-skills.sh`.
- Brand bible: [`./BRAND.md`](./BRAND.md)
- Change log: [`./CHANGELOG.md`](./CHANGELOG.md)
- Diátaxis manual: [`./docs/`](./docs/)
- Umbrella binding rules: [`../../../new-docs/`](../../../new-docs/)
  — esp. rule 13 (doc authoring) + rule 12 (monorepo-platform
  wiring of consumer frontends).
- Repo-wide cardinal rules: [`../../../CLAUDE.md`](../../../CLAUDE.md)
- Upstream: https://github.com/godx-jp/godxjp-ui
