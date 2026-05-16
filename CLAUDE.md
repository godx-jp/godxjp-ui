# @godxjp/ui — cardinal rules

Binding. Read before any edit inside `libs/ts/godxjp-ui/`. The 20
cardinal rules below are non-negotiable; anything older that
contradicts them is wrong.

For agent recipes (build, test, recipes, gotchas) see
[`./AGENTS.md`](./AGENTS.md). For deeper architectural binding
rules specific to `@godxjp/ui` (theme axes, cascade layering, …)
see [`./new-docs/`](./new-docs/) — index at
[`./new-docs/00-index.md`](./new-docs/00-index.md). For umbrella-wide
binding rules see [`../../../new-docs/`](../../../new-docs/).

## STOP — framework-specific binding rules

Before adding a new `data-*` attribute on `<html>` that re-binds
tokens, or adding a user preference toggle (theme / accent / density /
font-size / new axis), read
[`./new-docs/01-theme-axes.md`](./new-docs/01-theme-axes.md).
The four canonical theme axes + cascade layering rules live there;
inline duplication is rejected at review.

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

14. **No new external dependency without an ADR.** Locked stack:
    React 19 + Tailwind v4 + Radix + cmdk + sonner +
    react-day-picker + lucide + i18next. New peer →
    `docs/adr/NNNN-<slug>.md`.

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
    values. `products.ts` is the documented exception — `tenant`
    is typed as `string` so consumers register new tenants.

20. **No "platform-only" exports.** Every primitive ships in
    `package.json::exports` so external godx-jp projects can
    consume it. Internal-only helpers stay un-exported under
    `src/internal/` or `_`-prefixed files.

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

- Agent recipes + gotchas: [`./AGENTS.md`](./AGENTS.md)
- Brand bible: [`./BRAND.md`](./BRAND.md)
- Change log: [`./CHANGELOG.md`](./CHANGELOG.md)
- Diátaxis manual: [`./docs/`](./docs/)
- Umbrella binding rules: [`../../../new-docs/`](../../../new-docs/)
  — esp. rule 13 (doc authoring)
- Repo-wide cardinal rules: [`../../../CLAUDE.md`](../../../CLAUDE.md)
- Upstream: https://github.com/godx-jp/godxjp-ui
