# AGENTS.md — godxjp-ui
Repo-wide rules: the godx-admin umbrella's root `CLAUDE.md`. This file = package-specific only.

**Class:** package (submodule) · **Storage:** none · **Standalone deploy:** n/a — consumed as `@godxjp/ui`

## Before you edit
- Unified design system: tokens, i18n, component primitives, app shell. Every GoDX frontend MUST consume it — no alternate UI stacks (see the 12 MUST RULES in `README.md`).
- Stack locked: TypeScript + React 19 + Vite + Tailwind v4 + shadcn / Radix. OKLCH tokens only.
- This is the **only remaining git submodule** of godx-admin (kept separate so the design system stays independently versioned). A change here needs an umbrella pointer bump.
