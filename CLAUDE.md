# @godxjp/ui — agent instructions

This is the `@godxjp/ui` design system (shadcn + Radix + Tailwind v4) and its MCP catalog.

## Two skill families — pick the right one first

Skills are split by audience (see **`.claude/skills/README.md`** for the full map):

- **CORE** (this repo's `src/`/`docs/`/`mcp/`) → the `godxjp-ui-*` skills in `.claude/skills/`.
  Start with **`godxjp-ui-component`** (below), then its follow-map: interaction-feel →
  behavioral-test → example-page → best-ux → **`godxjp-ui-mcp-catalog-sync`** (keep the MCP
  catalog + tests in sync on any public-API change).
- **CONSUMER** (an app importing `@godxjp/ui`) → served by the `godxjp-ui` MCP, never these files:
  `list_consumer_skills` / `route_consumer_task` / `get_consumer_skill` (`design-to-page`,
  `compose-a-screen`, taste family) + `draft_bug_report` for filing library bugs.

## MANDATORY: read the component skill before touching UI

Before creating OR changing **any** component, recipe, doc, or example, you MUST activate and
follow the **`godxjp-ui-component`** skill (`.claude/skills/godxjp-ui-component/SKILL.md`). It is a
hard contract — do not skip a gate. In short:

1. **MCP-first** — consult the `godxjp-ui` MCP (`get_component`, `search_components`, `get_rule`,
   `list_anti_ai_tells`, `get_vocab`, `get_tokens`) before writing; never guess a prop. Check that
   the thing doesn't already exist (no duplication — `Select` covers searchable/async select).
2. **Real primitives only** — no invented/hand-rolled/faked components, no raw HTML controls,
   compose primitives fully (`CardContent` for padding; `Card` + `CardContent flush` + `DataTable`).
3. **International standards on every component** — i18n via `t()` + `Intl`/CLDR (ISO 3166/4217/8601,
   IANA, BCP-47, `Intl.DisplayNames`/`PluralRules`); WAI-ARIA APG + WCAG 2.2 AA (+ a vitest-axe
   test, 0 violations); RTL logical CSS; controlled-vocabulary API (`value`/`defaultValue`/
   `onValueChange`, `size` ∈ xs|sm|md|lg, forward `ref`, register the prop type).
4. **Semantic tokens only** (`pnpm run audit` = 0/0); add an MCP catalog entry + a real-screen docs page.
5. **Verify ALL green** before done: `pnpm typecheck && pnpm lint && pnpm run audit &&
pnpm check:prop-vocabulary && pnpm check:mcp-sync && pnpm check:mcp-orphans &&
pnpm check:token-tiers && pnpm check:control-sizing && pnpm check:example-imports &&
pnpm preview:build && pnpm test`.

See `docs/STANDARDS-vocabulary-tokens.md`, `docs/PROPS-VOCABULARY.md`, and
`docs/roadmap/international-standardization.md` for the full rules and the i18n/a11y/vocab audit.

## Design-knob discipline (cardinal rules #44/#45)

Hard-won from real service consumption — check these BEFORE writing any value into
`src/styles/*.css`:

- **Chrome is a token, default quiet (#44).** Dividers / separator borders / chrome-only padding
  never get hard-coded; they read a token whose default is the quietest state (`none`, balanced
  rhythm). Services opt IN via theme (`--page-header-divider: 1px solid hsl(var(--border))`).
- **Every service-tunable constant gets a knob (#45).** Ask: *"would a service theme.css want to
  change this to match its design grid?"* (label widths, label↔control gaps, header insets…).
  If yes, it MUST be a documented component token — theme sets it once globally, props override
  per instance. If the only route is forking CSS, that's a library gap: fix the library, never
  patch the consumer app.
- **Composition pattern vs framework component — pass the test or compose (#46).** Before adding
  ANYTHING to `src/components/`, run the **Framework-Component Test** (`docs/COMPOSITION-VS-COMPONENT.md`,
  also Gate 0 of `godxjp-ui-component`): all 7 criteria (universal · owns reusable behavior · not
  composable from existing primitives+tokens · single-responsibility controlled API · fully
  token-themeable · earns the i18n/a11y contract · earns its bundle cost). ALL pass → it may be a
  framework component. ANY fails → it is a **composition pattern**: build it from existing primitives
  + token overrides (global / scoped `[data-tenant]` / per-region role scoping) in the app or a
  `docs/` showcase — never in `src/components/`. Marketing Hero/Navbar/Footer/Pricing, page layouts,
  icon medallions all FAIL → compose. When in doubt, compose; if a token is missing, add the token.

### Add-a-token checklist (ALL steps, in order)

1. Declare it in the right tier file — `src/tokens/{foundation.css | semantic/* | components/*}`
   (new `components/<name>.css` files need an `@import` in `src/tokens/base.css`; names must pass
   `check-token-tiers` — `--{component}-{part}-{property}`).
2. Reference it from `src/styles/*.css` via `var(...)` — keep the old value as the default so the
   change is opt-in unless the default itself is the fix.
3. Document it: `mcp/src/data/tokens.ts` entry (+ the component's `howToUse` in
   `mcp/src/data/components.ts` when behaviour changes) → rebuild `mcp/` (`cd mcp && pnpm build`).
4. CHANGELOG entry under `[Unreleased]` (Added for new tokens, Changed for default changes).
5. Guards + build: `node scripts/check-token-tiers.mjs`, the mcp sync checks, then `pnpm build`.

## Local-link development (file:-linked consumer apps)

Consumer apps may link this repo directly (`"@godxjp/ui": "file:.../godxjp-ui"`) to develop the
framework against real screens. Consumers import **`dist/`**, never `src/` — so:

- **Keep `pnpm dev` running** (tsup watch + CSS-tree re-copy). A `src/` edit without a dist
  rebuild ships a stale package; a missing export white-screens the consumer
  (`does not provide an export named …`).
- After a one-off edit without the watcher, run `pnpm build` (TS + CSS) — `tsup` alone skips the
  CSS trees; `node scripts/copy-styles.mjs` covers a CSS-only change.
