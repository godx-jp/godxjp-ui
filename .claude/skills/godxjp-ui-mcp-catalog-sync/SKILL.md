---
name: godxjp-ui-mcp-catalog-sync
description: BẮT BUỘC khi thêm/sửa/đổi-tên/deprecate/xoá BẤT KỲ component, prop-vocabulary, token, cardinal rule, hay pattern của @godxjp/ui — phần catalog của MCP (mcp/src/data/*) và bộ test của nó PHẢI được cập nhật cùng lúc, nếu không consumer sẽ nhận API sai. Ép quy trình: cập nhật mcp/src/data, chạy check:mcp-sync + check:mcp-orphans, và chạy/bổ sung test MCP cho mọi thay đổi. Đọc TRƯỚC khi commit một thay đổi chạm tới bề mặt public.
---

# Keeping the MCP catalog (and its tests) in sync

> 🛠️ **AUDIENCE: CORE** — the MCP (`mcp/`) is the **only** surface a consumer agent sees. If the
> library's public API drifts from the catalog, every app-dev gets wrong props, missing components,
> or stale rules — silently. This skill is the forcing function that stops that. CORE↔CONSUMER map:
> `.claude/skills/README.md`.

**Follow-map:** this is the **last** stage of the core chain. After [[godxjp-ui-component]] ships a
new/changed component (and [[godxjp-ui-example-page]] gives it a docs page), come here to mirror it
into the MCP catalog and lock it with tests. The catalog is `mcp/src/data/*`; the tests are
`mcp/src/*.test.ts`.

## When this skill is MANDATORY

Any change to the **public surface** of `@godxjp/ui`:

- a component added / renamed / removed / **deprecated**, or its **props/defaults/union values** changed;
- a shared **prop-vocabulary** type added or its values changed (`src/props/*`);
- a **token** / token tier added or renamed;
- a **cardinal rule** added/renumbered in `CLAUDE.md`;
- a canonical **pattern** changed.

If you touched none of these (an internal refactor with no API change), you can skip — but run
`check:mcp-sync` to be sure.

## The catalog files (one source of truth each)

| Public thing | Catalog file | Helper |
|---|---|---|
| Components | `mcp/src/data/components.ts` (`COMPONENTS`) | `findComponent`, `componentsByGroup` |
| Prop vocabulary | `mcp/src/data/prop-vocabulary.ts` (`PROP_VOCABULARY`) | `findVocab` |
| Tokens | `mcp/src/data/tokens.ts` (`TOKENS`, `TokenCategory`) | `tokensByCategory` |
| Cardinal rules | `mcp/src/data/rules.ts` (`CARDINAL_RULES`) | `findRule` |
| Patterns | `mcp/src/data/patterns.ts` (`PATTERNS`) | `findPattern` |

## DO / DON'T

| ✅ DO | ⛔ DON'T |
|---|---|
| Add/update the `components.ts` entry in the SAME change as the `src/` component | Ship a component with no MCP entry (consumers can't discover it) |
| Fill ALL fields: `props` (real types/defaults), `usage`, `useCases`, `related`, `example`, `rules` | Leave `rules: []` or cite a rule number that doesn't exist in `rules.ts` |
| Keep a removed/renamed component **catalogued as `deprecated: true`** pointing to the replacement | Silently delete an entry — consumers mid-migration lose the steer |
| Use a real import subpath + a copy-paste-able `example` | Invent an import path or a prop that isn't in `src/` |
| Update the **schema enum** when the data's category union changes (e.g. `get_tokens`) | Let a tool's `enum` drift from the data (the `get_tokens` 9-vs-3 bug) |
| Add/extend a test in `mcp/src/*.test.ts` so the new entry is covered | Add catalog data with zero test asserting it round-trips |
| Update counts in `mcp/README.md` (tools / rules) when they change | Leave `README` saying "14 tools" / "34 rules" while code says otherwise |

## Tests are part of the contract

The MCP suite is **data-driven** — most of it grows automatically (every `COMPONENTS` entry is
round-tripped, every rule resolved, every skill section driven). So usually you just **run** it:

```sh
cd mcp && pnpm vitest run && pnpm type-check
```

Add a hand-written test only when you introduce **new behaviour** (a new tool, a new branch, a new
not-found path) — put it in the right file:

- `tools.contract.test.ts` — a new tool must dispatch, tolerate adversarial args, never throw.
- `components.test.ts` / `rules.vocab.tokens.test.ts` / `skills.test.ts` — auto-cover new data.
- `routing.test.ts` — a new `routeTask` / `suggest_primitive` branch needs a representative case.
- `lint.test.ts` — a new `lint_jsx` heuristic must both **fire** and stay silent on clean JSX.
- `sync.test.ts` — a new count/enum guard so docs can never drift again.

## Self-track checklist

- [ ] `src/` change identified as public-surface (component / vocab / token / rule / pattern)
- [ ] Catalog entry added/updated in the matching `mcp/src/data/*` file — every field filled, no invented props
- [ ] Removed/renamed items kept as `deprecated: true` with a pointer to the replacement
- [ ] Any tool `enum` that mirrors a data union updated to match (no schema↔data drift)
- [ ] New behaviour has a hand-written test; existing data-driven tests still pass
- [ ] `cd mcp && pnpm vitest run` green · `pnpm type-check` clean
- [ ] Repo root: `pnpm check:mcp-sync && pnpm check:mcp-orphans` green
- [ ] `mcp/README.md` counts (tools / rules) updated if they changed
