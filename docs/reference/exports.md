---
title: "Package exports"
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-17
audience: [developer, agent]
lang: en
status: published
---

# Package exports

Every entry in `package.json::exports` for `@godxjp/ui@3.0.0`. The
binding source of truth is
[02 — consumer contract §A](../specs/02-consumer-contract.md).

---

## JavaScript entries (eight runtime entries)

| Import path | Types file | JS file | When to use |
|---|---|---|---|
| `@godxjp/ui` | `dist/index.d.ts` | `dist/index.js` | All primitives + hooks + i18n helpers + preferences (root barrel) |
| `@godxjp/ui/i18n` | `dist/i18n.d.ts` | `dist/i18n.js` | `initI18n`, `SUPPORTED_LOCALES`, `GodxLocale`, storage keys |
| `@godxjp/ui/hooks` | `dist/hooks.d.ts` | `dist/hooks.js` | `useTweaks`, `useBreakpoint`, `useDebouncedValue`, `useGodxConfig`, … |
| `@godxjp/ui/preferences` | `dist/preferences.d.ts` | `dist/preferences.js` | `GodxConfigProvider` — locale + timezone React context |
| `@godxjp/ui/components/primitives` | `dist/components/primitives.d.ts` | `dist/components/primitives.js` | All 73 primitive components, re-exported from the six group folders (`general` / `layout` / `data-display` / `data-entry` / `feedback` / `navigation`) via `src/components/primitives.ts` |
| `@godxjp/ui/primitives` | (alias) | (alias) | Short alias for `@godxjp/ui/components/primitives` |
| `@godxjp/ui/components/shell` | `dist/components/shell.d.ts` | `dist/components/shell.js` | `AppShell`, `Sidebar`, `Topbar`, `TweaksPanel`, `CommandPalette`, `ProductSwitcher`, `ProjectSwitcher`, `PageContent` (8) |
| `@godxjp/ui/components/composites` | `dist/components/composites.d.ts` | `dist/components/composites.js` | Upload family (Upload, ImageUpload, AvatarUploader), MediaUpload (with bundled media-service client), LocaleInput, calendar app |

### Removed entries

| Removed | Replacement |
|---|---|
| `@godxjp/ui/data` | Generic catalogs are consumed via shell primitives directly; consumers register their own catalogs. The standalone `src/data/` folder is removed per cardinal rule 28 §D. |
| `@godxjp/ui/components/screens` | Example screens are Storybook-only under `src/stories/examples/` (rendered as Usage Cases). Consumers copy-paste-and-modify, never `import`. |
| `@godxjp/ui/clients/media` | Folded into the Upload composite — `media-client.ts` travels with `MediaUpload` under `src/components/composites/upload/`. Re-exports via `@godxjp/ui/components/composites`. |

---

## CSS entries

| Import path | File | When to use |
|---|---|---|
| `@godxjp/ui/tailwind.css` (or `@godxjp/ui/tailwind`) | `src/tokens/tailwind.css` | Default consumer entry — tokens + Tailwind v4 layer + shell base |
| `@godxjp/ui/styles` (or `./styles/index.css`) | `src/styles/index.css` | Aggregates `theme.css` + `base.css` + `shell.css` + `sonner.css` |
| `@godxjp/ui/styles/theme.css` (also `@godxjp/ui/tokens` / `./tokens.css`) | `src/styles/theme.css` | Raw token declarations only |
| `@godxjp/ui/styles/base.css` | `src/styles/base.css` | `@layer base` html/body resets |
| `@godxjp/ui/styles/shell.css` (also `@godxjp/ui/tokens-ext.css`) | `src/styles/shell.css` | Shell component class catalogue |
| `@godxjp/ui/styles/sonner.css` (also `@godxjp/ui/sonner.css`) | `src/styles/sonner.css` | Toast slide-in/out animations |

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

All JavaScript entries are marked tree-shakable
(`sideEffects: ["**/*.css"]`). CSS imports have side effects by
definition and are excluded from tree-shaking. Any component not
imported is eliminated from the consumer's bundle.

Per cardinal rule 26 (library isolation) every npm `dependencies`
entry is `external` in `tsup.config.ts` — consumer's package
manager dedupes them. Per-primitive cost paid only on import.

---

## See also

- [02 — Consumer contract §A](../specs/02-consumer-contract.md) — binding source of the dist surface.
- [Reference: Types](./types.md).
- [How-to: Consume from a service](../how-to/consume-from-service.md).
