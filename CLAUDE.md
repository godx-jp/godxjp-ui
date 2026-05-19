# @godxjp/ui — agent quick reference

This file is loaded into every conversation context. Keep it terse.
Detailed recipes live in [`AGENTS.md`](./AGENTS.md); deep binding
specs live in [`docs/specs/`](./docs/specs/README.md).

## Repo at a glance

- React 19 + Tailwind v4 component library. Submodule of the
  godx-jp umbrella; commits to `github.com/godx-jp/godxjp-ui`.
- Source: `src/components/<group>/<Name>.tsx` — six groups
  (`general`, `layout`, `data-display`, `data-entry`, `feedback`,
  `navigation`) + `shell/` + `composites/`.
- Stories mirror source 1:1 at `src/stories/<group>/<Name>.stories.tsx`.
- Reference docs at `docs/reference/<group>/<Name>.md`.
- Tokens live in `src/tokens/` (`tailwind.css`) +
  `src/styles/theme.css`; per-component CSS in
  `src/styles/shell/NN-*.css`.

## Common commands

```sh
pnpm type-check                         # tsc --noEmit
pnpm test:stories                       # vitest browser mode (play tests)
pnpm lint:tokens                        # token / vocabulary lints
pnpm build                              # tsup ESM + DTS
node scripts/check-stories-parity.mjs   # rule 17
node scripts/check-docs-parity.mjs      # rule 18
pnpm exec storybook dev -p 6006         # local Storybook
pnpm exec vite --config dev-probe/vite.config.ts   # standalone sandbox (dev-only)
```

Pre-commit hook (Husky) runs lint:tokens + parity + sync:skills +
type-check (~5s). `--no-verify` is forbidden.

## Triggers — when to open a deep doc

| You are about to… | Read |
|---|---|
| Add / rename `data-*` axis on `<html>`; add a user preference toggle | [`docs/specs/01-theme-axes.md`](./docs/specs/01-theme-axes.md) |
| Start a new consumer; change consumer folder shape; add a primitive | [`docs/specs/02-consumer-contract.md`](./docs/specs/02-consumer-contract.md) |
| Add / rename / remove a design token; write CSS needing a value | [`docs/specs/03-token-system.md`](./docs/specs/03-token-system.md) |
| Add / rename a prop; author a new primitive's API | [`docs/specs/04-prop-vocabulary.md`](./docs/specs/04-prop-vocabulary.md) |
| Accept a new design handoff bundle; add lint guardrails | [`docs/specs/05-design-handoff-formats.md`](./docs/specs/05-design-handoff-formats.md) |

For workflows (per-PR gates, design-canon port procedure, ADR
authoring) read [`AGENTS.md`](./AGENTS.md).

## Cardinal rules

Absolute. CI / pre-commit / review reject anything that violates.

1. **Storybook is mandatory.** Every primitive / shell / composite has
   a paired story under `src/stories/<group>/<Name>.stories.tsx`
   covering every variant + state on light + dark.
2. **Tokens, not utilities.** Visual values come from CSS custom
   properties in `src/tokens/` + `src/styles/theme.css`. Token-named
   Tailwind utilities (`bg-background`) are fine; raw value utilities
   (`bg-blue-500`) are forbidden. (ADR-0003)
3. **Radix for interactive primitives.** Anything with keyboard /
   ARIA / portal wraps the relevant Radix primitive. (ADR-0001)
4. **shadcn-style ownership.** Primitives are thin wrappers;
   consumers can fork the source in place. (ADR-0002)
5. **One i18next singleton.** `initI18n()` in `src/i18n/index.ts` is
   THE instance; consumers extend via `addResourceBundle`. (ADR-0004)
6. **WCAG 2.1 AA baseline.** Every interactive primitive passes
   axe-core (keyboard nav, ARIA, focus-visible, 4.5:1 contrast,
   `prefers-reduced-motion`). Stories double as a11y test surfaces.
7. **SemVer 2.0 + Keep a Changelog 1.1.** Every release-worthy change
   updates `CHANGELOG.md` under `## Unreleased` in the same PR.
8. **Inclusive naming.** `allowlist` / `denylist`, `main` /
   `primary` / `replica` / `secondary`, `they/them`. Never
   `whitelist` / `blacklist` / `master` / `slave`. Lint-enforced.
9. **No marketing speak.** Banned: "powerful", "robust", "blazing
   fast", "best-in-class", "seamless", "enterprise-grade". State
   what it does.
10. **English is canonical for docs.** Localised docs at
    `docs/i18n/<bcp47>/`; front-matter tracks staleness.
11. **Submodule discipline.** Two-PR workflow: (1) submodule PR →
    `main`, (2) umbrella PR → bump pin. Never push a pin to a SHA
    not on the submodule remote.
12. **Branch + PR workflow.** `feat/<scope>` / `fix/<scope>` →
    submodule `main`. CI green + squash-merge. No direct push to
    `main`. `--no-verify` forbidden.
13. **TypeScript strict.** Explicit types on every export.
    `forwardRef` for components; `ComponentPropsWithoutRef` for
    extension. No `any`. No `@ts-ignore` without comment + issue link.
14. **Every third-party library is shadcn / Radix-recommended.**
    Locked stack: Radix UI, cmdk, sonner, lucide-react,
    react-aria-components + `@internationalized/date`, i18next +
    react-i18next, class-variance-authority + clsx + tailwind-merge.
    New peer → ADR documenting why it's the canonical choice.
15. **No `@apply` re-encoding tokens.** Inside a primitive `.tsx`,
    don't `@apply` a Tailwind utility that re-encodes a token —
    reference the canonical CSS class from `tokens.css` instead.
    Composite token-named utilities remain fine.
16. **CSS source-of-truth is `src/tokens/` + `src/styles/theme.css`.**
    A primitive that needs a new color / spacing / radius adds it
    there FIRST, then references it.
17. **`src/stories/` ↔ `src/components/` parity.** Story set matches
    primitive set under each group. CI-checked via
    `scripts/check-stories-parity.mjs`.
18. **`docs/reference/<group>/` ↔ `src/components/<group>/` parity.**
    Every primitive has a reference page; every page maps to a
    primitive. CI-checked via `scripts/check-docs-parity.mjs`.
19. **No service-specific anything.** `me-service`, `forge-service`,
    `admin-service` never appear in source / comments / prop names.
    Per-deployment brand color lives at `[data-accent="<palette>"]`.
20. **No "platform-only" exports.** Every primitive ships via
    `package.json::exports`. Internal-only helpers stay un-exported.
21. **Every component honours every theme axis.** `data-theme`
    (light / dark), `data-accent` (6 palettes), `data-density`
    (compact / default / comfortable), `data-font-size` (sm / base /
    lg / xl). Read from tokens, never hardcode values. Verify every
    PR via the Storybook toolbar sweep. Details:
    [`docs/specs/01-theme-axes.md`](./docs/specs/01-theme-axes.md).
22. **100% match to the design canon.** Every visual literal comes
    from `design-handoff/ui-system/<latest-bundle>/`. Token-pin
    canon literals; never substitute "close enough". If the bundle
    doesn't cover a case — STOP, ask the user to mock it. Recipe in
    [`AGENTS.md`](./AGENTS.md) §Design-canon port.
23. **Concept-first prop API.** One concept per prop. Reuse shared
    vocabulary (`size`, `variant`, `color`, `tone`, `accent`,
    `padding`, `density`, `orientation`, `placement`, `current`,
    `value` / `defaultValue` / `onValueChange`,
    `open` / `defaultOpen` / `onOpenChange`, `justify`, `sticky`,
    `offset`). Full table:
    [`docs/specs/04-prop-vocabulary.md`](./docs/specs/04-prop-vocabulary.md).
    Before adding a new prop or token: grep for an existing one.
    Before authoring a primitive: grep the barrels + read the peer
    primitive end-to-end.
24. **Mobile-first.** Defaults target `xs` (≥0px); progressive
    enhancement via `sm:` / `md:` / `lg:` / `xl:` / `2xl:`. Touch
    targets ≥ 44 × 44 px (`--touch-target-min`, does NOT scale with
    density). Runtime viewport via `useBreakpoint`, never
    `window.innerWidth`. Stories render at narrow viewport first.
25. **Stories are docs; UI is the primitive.** When a story looks
    wrong, fix the primitive / CSS / token. Never paper over with a
    story tweak. Story-only diff without a paired primitive / CSS /
    token diff is rejected.
26. **Library isolation.** `dist/` ships only the consumer surface.
    Storybook, tests, scripts, design-handoff, `dev-probe/` stay
    out of npm. Every `dependencies` entry is `external` in `tsup`.
    Verification via `pnpm pack` + grep of `dist/`.
27. **Per-group folder structure.** Primitives at
    `src/components/<group>/<Name>.tsx`; six canonical groups
    (general, layout, data-display, data-entry, feedback, navigation).
    Barrel = `src/components/primitives.ts` (single file). Stories
    + reference docs mirror the same group hierarchy.
28. **`src/` folder taxonomy.** Three classes: consumer surface
    (matched by `tsup` entry + `package.json::exports`),
    Storybook-only (`src/stories/`), build-input-only (`cn.ts`,
    per-group sources consumed via the barrel). No `src/lib/`,
    `src/utils/`, `src/internal/`, `src/clients/`, `src/screens/`.
    Service clients live with the composite that uses them.
29. **Stories consume framework primitives only.** No raw
    `<button>` / `<input>` / hand-rolled chips when a primitive
    exists. HTML semantics (`<section>`, `<article>`, …) for
    structure are fine. Inline `style={{}}` limited to layout /
    positioning; no colour / radius / typography overrides.
30. **Story `render` returns JSX directly.** No opaque
    `<XyzDemo />` wrapper components, no zero-arg `Demo` helpers.
    Use `render: function StoryName() { … }` so Storybook's source
    panel shows runnable JSX, not `<XyzDemo />`.
31. **No nested wrapper / convenience primitives.** One Radix base
    = one framework primitive. `<SimpleX>` over `<X>` is forbidden;
    add a prop to `<X>` instead. Composites under
    `src/components/composites/` that combine multiple primitives
    are NOT wrappers.
32. **No redundant props.** Before adding a prop / item field /
    variant, grep the existing surface; if a field already covers
    the concept, use it. Top-level prop that re-expresses an item
    field (Timeline `pending` ↔ `items[i].animate`) is rejected.
33. **Stories / source / docs name-synchronized.** No two names for
    the same export across the framework surface; no legacy aliases
    in stories / docs (source may keep an alias for a deprecation
    cycle, but the marketing surfaces use the canonical name only).
    Rename PR runs `grep -rn '<oldName>' src docs` and clears it.
34. **Storybook source panel = real, copy-paste-ready code.**
    Storybook's react-docgen serializer strips every function value
    (`cell: ({row}) => <JSX/>`, `render: ({field}) => <Input/>`,
    `rowClassName`, `renderItem`, …) to `() => {}`. Any story whose
    `render` passes a function-valued prop, references a module-level
    helper (`StatusBadge`, `EMPLOYEE_COLUMNS`, etc.), or uses a
    render-prop pattern MUST override
    `parameters.docs.source.code` with the literal copy-paste-ready
    snippet — type aliases, helper functions spelled out, column
    definitions with cell JSX visible, inline data array. The
    `render()` callback stays as-is (module-level constants are fine
    for runtime performance); `source.code` is the marketing
    surface. Skip ONLY for stories whose JSX is purely static
    primitives Storybook can serialize verbatim
    (`<Button variant="primary">Click</Button>`). The exemplar is
    `Table.Default` in `src/stories/data-display/Table.stories.tsx`.

## Links

- Recipes / workflows / gotchas: [`AGENTS.md`](./AGENTS.md)
- Framework binding rules: [`docs/specs/`](./docs/specs/README.md)
- ADRs: [`docs/adr/`](./docs/adr/README.md)
- Diátaxis manual: [`docs/`](./docs/)
- Brand bible: [`BRAND.md`](./BRAND.md)
- Changelog: [`CHANGELOG.md`](./CHANGELOG.md)
- **MCP server for consumer agents**: [`mcp/`](./mcp/README.md) — `@godxjp/ui-mcp`
  exposes the catalog + 12 taste skills + anti-AI-tells + redesign audit to
  Claude Code / Codex CLI / Cursor / Cline / any MCP-aware agent. Token-
  efficient: agents call `route_task` → `get_skill_section` for ~3 KB total
  instead of dumping 50+ KB. Consumer install: `npx @godxjp/ui-mcp` +
  [config snippet](./mcp/README.md#configure-your-agent).
- Upstream: <https://github.com/godx-jp/godxjp-ui>
