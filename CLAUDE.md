# @godxjp/ui — cardinal rules

> **Status:** Binding. Read before any edit inside this submodule.
> Mirrors the umbrella `godx-admin/CLAUDE.md` style — short list
> of cardinal rules; the long-form rationale lives in `docs/` and
> the umbrella's `new-docs/`.

## ⛔ STOP — read these first

Before editing any file in `libs/ts/godxjp-ui/`, you **must** read:

| Trigger | Required reading |
|---------|------------------|
| Any edit at all | This file (`CLAUDE.md`) — cardinal rules below |
| Service map + recipes + verification | [`./AGENTS.md`](./AGENTS.md) — agent guide |
| Public API / docs / new feature | [umbrella new-docs/](../../../new-docs/) — rules 07, 08, 09 (Library docs), 10, 11, 12 |
| Visual design / branding | [`./BRAND.md`](./BRAND.md) |
| Breaking changes | [`./CHANGELOG.md`](./CHANGELOG.md) — Keep a Changelog 1.1.0 + SemVer 2.0.0 |

The cardinal rules below are non-negotiable. They override anything
that contradicts in older docs, runbooks, or comments.

## Cardinal rules — checked at review

1. **Storybook is mandatory.** Every primitive, shell composition,
   and screen has a `stories/<kind>/<Name>.stories.tsx`. Creating,
   editing, or deleting a component carries the Storybook update in
   the SAME PR — no exceptions. CI fails any PR that lands a
   component change without the corresponding story add / edit /
   delete. The story covers every variant + state (default, hover,
   active, focused, disabled, loading, error) and renders cleanly
   on light + dark themes. See [`./AGENTS.md`](./AGENTS.md) §Storybook
   for the canonical template.

2. **Tokens, not utilities.** Components read visual values from CSS
   custom properties declared in `src/tokens/tokens.css` or
   `tokens-ext.css`. Tailwind utilities that compose token names
   (`bg-background`, `text-foreground`) are allowed; raw value
   utilities (`bg-blue-500`, `text-zinc-900`) are forbidden. See
   `docs/adr/0003-tokens-not-utilities.md`.

3. **Radix is the foundation for interactive primitives.** Every
   primitive that handles keyboard nav, focus, ARIA, or portal
   rendering wraps the relevant Radix primitive. We do not
   reinvent accessibility. See `docs/adr/0001-radix-as-foundation.md`.

4. **shadcn-style ownership.** Primitives are thin wrappers; the
   consumer can fork any primitive's source without leaving the
   ecosystem. We do NOT take MUI's "framework owns the component"
   stance. See `docs/adr/0002-shadcn-style-not-mui.md`.

5. **One i18next singleton.** `initI18n()` in `src/i18n/index.ts`
   sets up the global instance. Every consumer (and every primitive
   that needs translated text) reads from THE singleton. Services
   extend via `addResourceBundle`; they do not create their own
   instance. See `docs/adr/0004-i18next-singleton-shared.md`.

6. **WCAG 2.1 AA baseline.** Every interactive primitive passes
   axe-core: keyboard nav, ARIA roles + labelling, focus-visible,
   contrast (4.5:1 body text), `prefers-reduced-motion` respect.
   Stories double as a11y test surfaces. See
   `docs/explanation/accessibility.md`.

7. **SemVer 2.0.0 + Keep a Changelog 1.1.0.** Every release-worthy
   change updates `CHANGELOG.md` under `## Unreleased` in the same
   PR. Major / minor / patch criteria per `docs/explanation/versioning.md`.

8. **Inclusive naming.** `allowlist` / `denylist`, `main` /
   `primary`, `replica` / `secondary`, `they/them`. Never
   `whitelist` / `blacklist` / `master` / `slave`. CI lints.

9. **No marketing speak.** "powerful", "robust", "blazing fast",
   "best-in-class", "seamless", "enterprise-grade" are banned in
   prose. State what it does.

10. **English is canonical for docs.** Localised docs live in
    `docs/i18n/<bcp47>/`. Front-matter tracks staleness.

11. **Submodule discipline.** This is a git submodule of the
    `godx-admin` umbrella. Commits in this directory go to
    `github.com/godx-jp/godxjp-ui`; the umbrella sees only the SHA
    pin. Two-PR workflow:
    (1) Submodule PR → merge to `main` here.
    (2) Umbrella PR → bump the pin to the new SHA.
    Never push an umbrella pin to a SHA that doesn't exist on the
    submodule remote — the two histories diverge.

12. **Workflow per umbrella rule 11.** Branch in submodule
    (`feat/<scope>` or `fix/<scope>`), PR to submodule `main`, CI
    green required (build + test + Storybook + a11y), squash-merge,
    then bump the umbrella pin in a separate umbrella PR.
    Direct push to submodule `main` is forbidden.

13. **TypeScript strict.** Every export has explicit types.
    `forwardRef` for components; `ComponentPropsWithoutRef` for
    extension. No `any`. No `// @ts-ignore` without a code-comment
    + issue link.

14. **No new external dependency without an ADR.** The locked stack
    is React 19 + Tailwind v4 + Radix + cmdk + sonner +
    react-day-picker + lucide + i18next. Adding a peer (e.g.
    react-aria) requires a `docs/adr/NNNN-<slug>.md` entry.

15. **`@apply` in primitive `.tsx` files is forbidden** for any
    Tailwind utility that re-encodes a token value. Use the
    canonical CSS class from `tokens.css`. Composite Tailwind
    utilities that ONLY use token names (e.g.
    `bg-background border-border`) are fine.

16. **CSS source-of-truth is `src/tokens/`.** Visual values do NOT
    live anywhere else. A primitive that needs a new color/spacing/
    radius adds it to `tokens.css` (or `tokens-ext.css`) FIRST,
    then references it.

17. **`stories/<kind>/<Name>.stories.tsx` parity.** The set of
    files under `stories/primitives/` MUST match the set of
    primitives exported from `src/components/primitives/index.ts`.
    Same for `stories/shell/` ↔ `src/components/shell/` and
    `stories/screens/` ↔ `src/components/screens/`. CI checks
    this on every PR.

18. **`docs/reference/primitives/<Name>.md` parity.** Same as #17
    for the reference docs. Every primitive has a reference page;
    every reference page maps to an exported primitive.

19. **No service-specific anything.** This is a generic UI
    framework. me-service, forge-service, admin-service, etc., MUST
    NOT appear in source comments, prop names, or default values
    (the `products.ts` tenant catalog is the documented exception —
    it lists known tenants but `tenant` is now typed as `string`
    so consumers can register new tenants).

20. **No "platform-only" exports.** Every primitive ships in the
    public surface (`package.json::exports`) so external godx-jp
    projects can consume it. Internal-only helpers stay
    un-exported and live in source files prefixed with `_` or
    under `src/internal/`.

## Hard rules — code review rejects on sight

- Component change without Storybook update (rule #1).
- Raw color utility (`bg-blue-500`) in a primitive (rule #2).
- Hand-rolled focus/keyboard nav when Radix has a primitive (rule #3).
- New primitive without a `docs/reference/primitives/<Name>.md` (rule #18).
- `any` in an export signature (rule #13).
- `// eslint-disable-line` without a comment + issue link.
- Banned terms (`master`, `whitelist`, `blacklist`, …) anywhere
  (rule #8).
- Marketing speak in README / docs / code comments (rule #9).
- Service-specific reference (`me.profile`, `forge.workspace`) in
  primitive source or comments (rule #19).
- Submodule push that diverges from upstream (rule #11).
- Direct push to submodule `main` (rule #12).

## Verification before every commit

```bash
cd libs/ts/godxjp-ui

# Build
pnpm install
pnpm run build
pnpm type-check

# Tests
pnpm test

# Storybook (mandatory per rule #1)
pnpm run storybook:build
pnpm run storybook:test       # Playwright snapshots
pnpm run a11y                  # axe-core in every story

# Lint
pnpm exec eslint --max-warnings 0 src/ stories/
pnpm exec prettier --check src/ stories/ docs/

# Doc parity (rules #17 + #18)
node scripts/check-stories-parity.mjs   # stories/ ↔ src/components/
node scripts/check-docs-parity.mjs      # docs/reference/ ↔ src/components/
```

All green required before commit. Pre-commit hook enforces this;
`--no-verify` is forbidden.

## Links

- Agent guide (recipes, gotchas, common tasks): [`./AGENTS.md`](./AGENTS.md)
- Public-facing intro: [`./README.md`](./README.md)
- Brand bible: [`./BRAND.md`](./BRAND.md)
- Change log: [`./CHANGELOG.md`](./CHANGELOG.md)
- Diátaxis manual: [`./docs/`](./docs/)
- Umbrella binding rules: [`../../../new-docs/`](../../../new-docs/)
- Repo-wide cardinal rules: [`../../../CLAUDE.md`](../../../CLAUDE.md)
- Upstream: https://github.com/godx-jp/godxjp-ui
