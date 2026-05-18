# @godxjp/ui

**Version 3.0.0** — GoDX professional UI framework

[![npm](https://img.shields.io/npm/v/@godxjp/ui)](https://www.npmjs.com/package/@godxjp/ui)
[![License](https://img.shields.io/github/license/godx-jp/godxjp-ui)](LICENSE)
[![Types included](https://img.shields.io/badge/types-included-blue)](src/)

`@godxjp/ui` is the **single source of visual truth** for the GoDX platform.
Every service frontend (admin-platform, forge-service, console-service, me-service,
chat-service, knowledge-service, …) consumes this package. No service reimplements
a button, dialog, sidebar, or design token.

The framework enforces three Japanese-enterprise design principles:

| Principle | Meaning | What it enforces |
|---|---|---|
| **渋み** (shibumi) | Restrained elegance | OKLCH primary chroma ≤ 0.18. No neon. No gradients on functional UI. |
| **間** (ma) | Vertical breathing room | Body `line-height: 1.7`. Generous spacing. Density toggle for dense tables. |
| **簡素** (kanso) | Simplicity | Three font weights: 400 (body), 500 (heading), 700 (emphasis). No 600 in new code. |

---

## Quick start

A new service needs three lines to be fully brand-compliant:

```tsx
// services/<slug>-service/frontend/src/main.tsx
import "@godxjp/ui/tailwind.css"   // tokens + Tailwind v4 utilities — ONE import
import { initI18n } from "@godxjp/ui/i18n"
import { AppShell, Sidebar, Topbar } from "@godxjp/ui/components/shell"

initI18n()

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppShell sidebar={<Sidebar nav={MY_NAV} />} topbar={<Topbar />}>
      <Routes>{/* service-specific routes */}</Routes>
    </AppShell>
  </BrowserRouter>,
)
```

That is the entire integration surface. No theming step. No per-service token file.

---

## Zero-config toolchain

Per the umbrella's frontend-architecture spec (zero-config principle), services
inherit the full toolchain from this package:

```js
// eslint.config.js — one line
export { default } from "@godxjp/ui/eslint-config"
```

```json
// package.json
"prettier": "@godxjp/ui/prettier-config"
```

```json
// tsconfig.json
{ "extends": "@godxjp/ui/tsconfig" }
```

```ts
// vitest.config.ts
import base from "@godxjp/ui/vitest-config"
import { mergeConfig } from "vitest/config"
export default mergeConfig(base, { test: {} })
```

---

## Import surface

| Import | What you get |
|---|---|
| `@godxjp/ui` | All primitives + hooks + i18n helpers (barrel) |
| `@godxjp/ui/tailwind.css` | Tailwind v4 + design tokens + base styles |
| `@godxjp/ui/tokens.css` | Raw CSS custom properties only (no Tailwind) |
| `@godxjp/ui/tokens-ext.css` | Extended tokens (dark mode, tenants, sidebar vars) |
| `@godxjp/ui/sonner.css` | Sonner toast animations (import after tokens) |
| `@godxjp/ui/components/primitives` | All primitives — see [`src/components/primitives.ts`](src/components/primitives.ts) (single barrel; 73+ surfaces re-exported from six group folders per cardinal rule 27) |
| `@godxjp/ui/components/shell` | `AppShell`, `Sidebar`, `Topbar`, `TweaksPanel`, `CommandPalette`, `ProductSwitcher`, `ProjectSwitcher`, `PageContent` |
| `@godxjp/ui/components/composites` | Upload family, `MediaUpload`, `AvatarUploader`, `LocaleInput`, calendar app composite |
| `@godxjp/ui/i18n` | `initI18n()`, `SUPPORTED_LOCALES`, `GodxLocale` |
| `@godxjp/ui/hooks` | `useTweaks()`, `Tweaks`, `Density`, `Theme` |
| `@godxjp/ui/preferences` | `PreferencesProvider` — locale + timezone React context |
| `@godxjp/ui/eslint-config` | Shared ESLint flat config |
| `@godxjp/ui/prettier-config` | Shared Prettier config |
| `@godxjp/ui/tsconfig` | Strict TypeScript base |
| `@godxjp/ui/vitest-config` | Vitest base with jsdom + coverage thresholds |

---

## Primitives (v3)

| Component | Radix backing | A11y | Status |
|---|---|---|---|
| `Badge` | — | WCAG 2.1 AA | production |
| `Button` | `@radix-ui/react-slot` | focus-visible, keyboard | production |
| `Card` | — | — | production |
| `Input`, `Textarea` | — | aria-invalid, label wire | production |
| `Label` | `@radix-ui/react-label` | for/id | production |
| `Tabs`, `Tabs`, `Tabs`, `Tabs` | `@radix-ui/react-tabs` | roving tabindex | production |
| `Avatar` | — | aria-label | production |
| `Separator` | `@radix-ui/react-separator` | role separator | production |
| `Popover`, `Popover`, `Popover` | `@radix-ui/react-popover` | focus trap | production |
| `DropdownMenu` family | `@radix-ui/react-dropdown-menu` | keyboard nav | production |
| `Calendar` | `react-day-picker` | ARIA grid | production |
| `TimeInput` | — | aria-invalid | production |
| `Dialog` family | `@radix-ui/react-dialog` | focus trap, aria-modal | production |
| `Sheet` family | `@radix-ui/react-dialog` | focus trap, aria-modal | production |
| `AlertDialog` family | `@radix-ui/react-alert-dialog` | focus trap | production |
| `Select` family | `@radix-ui/react-select` | keyboard nav | production |
| `Switch` | `@radix-ui/react-switch` | role switch | production |
| `Checkbox` | `@radix-ui/react-checkbox` | role checkbox | production |
| `Table` family | — | role table | production |
| `Combobox` family | `cmdk` + Popover | keyboard nav | production |
| `Toaster`, `toast` | `sonner` | aria-live | production |
| `Skeleton` | — | aria-hidden | production |
| `Breadcrumb`, `Breadcrumb`, `Breadcrumb` | — | aria-label, aria-current | production |

---

## i18n

Mandatory locales per the umbrella frontend-architecture spec §6:

| Locale | Status |
|---|---|
| `ja` | production (primary) |
| `en` | production |
| `vi` | production |
| `fil` | production (added v3.0.0) |

Services add extra namespaces via `i18n.addResourceBundle(locale, "my-ns", {…})`.

---

## MUST RULES (review-blocking)

See [`README.md § MUST RULES`](README.md) and [`BRAND.md`](BRAND.md) for the full list.
The short version:

1. Import `@godxjp/ui/tailwind.css` (or `/tokens.css`) once at app entry.
2. Never redefine `--primary`, `--foreground`, `--background`, or any base token in app code.
3. Per-deployment brand-color overrides live under `[data-accent="<palette>"]` in a service `theme.css` (per cardinal rule 19 — `[data-tenant]` is removed).
4. No `@mui/material`, `chakra-ui`, `antd`, or any other component library.
5. All primitive needs → add to `@godxjp/ui` first, then consume.
6. Shell (AppShell + Sidebar + Topbar) is one component set — no hand-rolled grids.

---

## Adoption tracker

| Service | Status | Notes |
|---|---|---|
| `calendar-service/frontend` | adopted | Greenfield; compliant from first commit. |
| `forge-service/frontend` | adopting (phase 1) | Reference implementation for migration pattern. |
| `admin-platform/frontend` | partial | Omnify tokens overlap ~90%; full migration pending. |
| `me-service/frontend` | adopting | Plan #31 R6 — active migration. |
| `console-service/frontend` | adopting | Epic #1412; AppShell + tokens wired. |
| `agent-service/frontend` | not started | Plan #21 G17. |
| `knowledge-service/frontend` | not started | Plan #18 K-phase. |
| `chat-service/frontend` | adopting | Plan #30 completion phase. |

---

## Versioning

`@godxjp/ui` follows [Semantic Versioning](https://semver.org/).
Breaking changes require a cross-service audit + major bump.
See [`CHANGELOG.md`](CHANGELOG.md) for the full history.

Source: `github.com/godx-jp/godxjp-ui` (Apache-2.0).
The umbrella repo (`godx-jp/godx-admin`) pins this as a git submodule at `libs/ts/godxjp-ui/`.
