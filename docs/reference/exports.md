---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
updated: 2026-05-16
audience: [developer, agent]
---

# Package exports

Every entry in `package.json::exports` for `@godxjp/ui@3.0.0`.

---

## JavaScript entries

| Import path | Types file | JS file | When to use |
|---|---|---|---|
| `@godxjp/ui` | `dist/index.d.ts` | `dist/index.js` | All primitives + hooks + i18n helpers (barrel) |
| `@godxjp/ui/i18n` | `dist/i18n.d.ts` | `dist/i18n.js` | `initI18n`, `SUPPORTED_LOCALES`, `GodxLocale`, storage keys |
| `@godxjp/ui/hooks` | `dist/hooks.d.ts` | `dist/hooks.js` | `useTweaks`, `Tweaks`, `Density`, `Theme` |
| `@godxjp/ui/data` | `dist/data.d.ts` | `dist/data.js` | `PRODUCTS`, `ForgeProduct`, `ForgeProject`, `findProductByTenant`, `PROJECT_KIND` |
| `@godxjp/ui/primitives` | `dist/components/primitives.d.ts` | `dist/components/primitives.js` | Alias for `@godxjp/ui/components/primitives` |
| `@godxjp/ui/components/primitives` | `dist/components/primitives.d.ts` | `dist/components/primitives.js` | All primitive components (`Button`, `Card`, `Dialog`, etc.) |
| `@godxjp/ui/components/shell` | `dist/components/shell.d.ts` | `dist/components/shell.js` | `AppShell`, `Sidebar`, `Topbar`, `TweaksPanel`, `CommandPalette`, `ProductSwitcher`, `ProjectSwitcher` |
| `@godxjp/ui/components/screens` | `dist/components/screens.d.ts` | `dist/components/screens.js` | `DashboardScreen`, `PlansScreen`, `IssuesScreen`, `WikiScreen`, `PlanDetailScreen`, `IssueDetailScreen`, `ProjectsListScreen`, `IdeasScreen` |

---

## CSS entries

| Import path | File | When to use |
|---|---|---|
| `@godxjp/ui/tailwind.css` | `src/tokens/tailwind.css` | Default import — tokens + Tailwind v4 layer + `tokens-ext.css` |
| `@godxjp/ui/tailwind` | `src/tokens/tailwind.css` | Alias (no `.css`) |
| `@godxjp/ui/tokens.css` | `src/tokens/tokens.css` | Raw CSS custom properties only — no Tailwind layer |
| `@godxjp/ui/tokens` | `src/tokens/tokens.css` | Alias (no `.css`) |
| `@godxjp/ui/tokens-ext.css` | `src/tokens/tokens-ext.css` | Shell classes + dark mode + tenant + density (included in `tailwind.css`) |
| `@godxjp/ui/sonner.css` | `src/tokens/sonner.css` | Toast slide-in/out animations — import after `tailwind.css` |

---

## Toolchain config entries

| Import path | File | When to use |
|---|---|---|
| `@godxjp/ui/eslint-config` | `config/eslint.js` | Service `eslint.config.js` — ESLint 9 flat config (one-liner) |
| `@godxjp/ui/prettier-config` | `config/prettier.cjs` | Service `.prettierrc` — Prettier 3 config |
| `@godxjp/ui/tsconfig` | `config/tsconfig.base.json` | Service `tsconfig.json` — TypeScript 6 strict base |
| `@godxjp/ui/vitest-config` | `config/vitest.base.ts` | Service `vitest.config.ts` — Vitest 4 base with jsdom + coverage |

---

## Tree-shaking

All JavaScript entries are marked tree-shakable (`sideEffects: ["**/*.css"]`). CSS imports have side effects by definition and are excluded from tree-shaking. Any component not imported is eliminated from the consumer's bundle.

---

## See also

- [Reference: Types](./types.md)
- [How-to: Consume from a service](../how-to/consume-from-service.md)
