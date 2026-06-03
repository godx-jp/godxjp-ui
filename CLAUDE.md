# @godxjp/ui — agent instructions

This is the `@godxjp/ui` design system (shadcn + Radix + Tailwind v4) and its MCP catalog.

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
pnpm check:token-tiers && pnpm check:example-imports && pnpm preview:build && pnpm test`.

See `docs/STANDARDS-vocabulary-tokens.md`, `docs/PROPS-VOCABULARY.md`, and
`docs/roadmap/international-standardization.md` for the full rules and the i18n/a11y/vocab audit.
