# @godxjp/ui — agent instructions


## Platform ↔ godx-ui development and acceptance (confirmed 2026-09-07)

- `@godxjp/ui` is the shared UI framework. Platform is its first consumer and the real application used to develop, debug, and validate the framework. Keep business workflows, data, and permissions in Platform; fix reusable presentation and interaction behavior in godx-ui.
- Configure consumer presentation through documented public component APIs and design tokens only. Do not hide framework gaps behind page-specific CSS, private imports, or copied components. Create a linked issue in `godx-jp/godxjp-ui`, fix the authoritative package, and verify the result through Platform.
- Use the latest compatible package baseline and a local package reference during development; publishing and reinstalling a registry release is not required for each iteration. From Platform, run `node scripts/use-local-ui.mjs ../godxjp-ui`. This links built `dist/` while preserving the consumer's React resolution. Never import library `src/` directly.
- Rebuild godx-ui with `pnpm build` in its checkout after source changes (or use its watcher), then run `pnpm build` in Platform. Verify that Platform consumes the rebuilt local output. Keep committed dependency/patch configuration reproducible for other checkouts; do not commit machine-specific absolute links.
- Acceptance is based on passing the required local checks, relevant framework tests, and real Platform browser/E2E verification, including responsive screenshots for UI changes. A build alone is not workflow acceptance. Record exact commands, results, commits, and evidence in the owning issues; preserve existing redesign reviewer and regression-test requirements.
- Once local acceptance passes and the fix is integrated, close the resolved issues. Do not keep an otherwise completed issue open solely because GitHub Actions is queued or running. Do not wait for CI, a registry publication, or a release build to continue development or to close a locally verified issue.
- The user has authorized push and merge for this Platform/godx-ui work. Do not ask again for that same authorization. Let normal GitHub Actions run asynchronously and check them occasionally at meaningful checkpoints while working; do not continuously poll or block on them. Respect branch protection; if it prevents merging, report the pending merge and continue independent work rather than bypassing it.
- Never force-push shared branches or suppress their CI with `[skip ci]`. Local acceptance does not mean CI is green. If a later check reveals a failure caused by this work, fix it forward with priority and reopen/link an issue as needed. Package publication and deployment are separate actions, not prerequisites for this local development loop.
- This decision supersedes older instructions requiring renewed push/merge approval or waiting for CI for this authorized work. A newer explicit user restriction takes precedence.

## Two skill families — pick the right one first

Skills are split by audience (see **`.claude/skills/README.md`** for the full map):

- **CORE** (this repo's `src/`/`docs/`/`mcp/`) → the `godxjp-ui-*` skills in `.claude/skills/`. Start with **`godxjp-ui-component`** (below), then its follow-map: interaction-feel → behavioral-test → example-page → best-ux → **`godxjp-ui-mcp-catalog-sync`** (keep the MCP catalog + tests in sync on any public-API change). - **CONSUMER** (an app importing `@godxjp/ui`) → served by the `godxjp-ui` MCP, never these files: `list_consumer_skills` / `route_consumer_task` / `get_consumer_skill` (`design-to-page`, `compose-a-screen`, taste family) + `draft_bug_report` for filing library bugs.

## MANDATORY: read the component skill before touching UI

Before creating OR changing **any** component, recipe, doc, or example, you MUST activate and follow the **`godxjp-ui-component`** skill (`.claude/skills/godxjp-ui-component/SKILL.md`). It is a hard contract — do not skip a gate. In short:

1. **MCP-first** — consult the `godxjp-ui` MCP (`get_component`, `search_components`, `get_rule`, `list_anti_ai_tells`, `get_vocab`, `get_tokens`) before writing; never guess a prop. Check that the thing doesn't already exist (no duplication — `Select` covers searchable/async select). 2. **Real primitives only** — no invented/hand-rolled/faked components, no raw HTML controls, compose primitives fully (`CardContent` for padding; `Card` + `CardContent flush` + `DataTable`). 3. **International standards on every component** — i18n via `t()` + `Intl`/CLDR (ISO 3166/4217/8601, IANA, BCP-47, `Intl.DisplayNames`/`PluralRules`); WAI-ARIA APG + WCAG 2.2 AA (+ a vitest-axe test, 0 violations); RTL logical CSS; controlled-vocabulary API (`value`/`defaultValue`/ `onValueChange`, `size` ∈ xs|sm|md|lg, forward `ref`, register the prop type). 4. **Semantic tokens only** (`pnpm run audit` = 0/0); add an MCP catalog entry + a real-screen docs page. 5. **Verify ALL green** before done: `pnpm typecheck && pnpm lint && pnpm run audit && pnpm check:prop-vocabulary && pnpm check:mcp-sync && pnpm check:mcp-orphans && pnpm check:token-tiers && pnpm check:control-sizing && pnpm check:example-imports && pnpm preview:build && pnpm test`.

See `docs/STANDARDS-vocabulary-tokens.md`, `docs/PROPS-VOCABULARY.md` for the full rules and the i18n/a11y/vocab audit.

## Design-knob discipline (cardinal rules #44/#45)

If yes, it MUST be a documented component token — theme sets it once globally, props override per instance. ALL pass → it may be a framework component. ANY fails → it is a **composition pattern**: build it from existing primitives - token overrides (global / scoped `[data-tenant]` / per-region role scoping) in the app or a `docs/` showcase — never in `src/components/`.

### Add-a-token checklist (ALL steps, in order)

1. Declare it in the right tier file — `src/tokens/{foundation.css | semantic/* | components/*}` (new `components/<name>.css` files need an `@import` in `src/tokens/base.css`; names must pass `check-token-tiers` — `--{component}-{part}-{property}`). 2. See `docs/TOKENS.md` · "Role-mirror knobs MUST be `initial`". 3.

## Local-link development (file:-linked consumer apps)

Consumer apps may link this repo directly (`"@godxjp/ui": "file:.../godxjp-ui"`) to develop the framework against real screens. Consumers import **`dist/`**, never `src/` — so:

- **Keep `pnpm dev` running** (tsup watch + CSS-tree re-copy). A `src/` edit without a dist rebuild ships a stale package; a missing export white-screens the consumer (`does not provide an export named …`). - After a one-off edit without the watcher, run `pnpm build` (TS + CSS) — `tsup` alone skips the CSS trees; `node scripts/copy-styles.mjs` covers a CSS-only change.
