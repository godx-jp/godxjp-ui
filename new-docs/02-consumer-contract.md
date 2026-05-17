---
title: Consumer contract
status: binding
authority: this-file
applies-to:
  - any consumer of "@godxjp/ui" (service frontends, apps, demos)
last-reviewed: 2026-05-16
---

# 02 — Consumer contract

**Status:** Binding. Read before starting a new frontend that
consumes `@godxjp/ui`, before adding a feature that touches UI in
an existing consumer, and before changing the consumer's folder
shape / config files.

`@godxjp/ui` is THE UI framework for godx-jp. A "consumer" is any
project that depends on it — most commonly a `services/<svc>/frontend/`
SPA, but also `apps/<app>/`, demos, and the framework's own
Storybook. This document specifies the contract every consumer must
honour.

The framework gives consumers a lot for free; in return the
consumer must NOT redo or shadow anything the framework already
ships. Drift in either direction (consumer re-implementing,
consumer escaping the contract) is a tracked bug.

## §A — What the framework ships (and consumers do NOT redo)

The framework owns the entire visual + interaction layer:

| Surface | Lives in | Consumer redoes? |
|---|---|---|
| Design tokens (color, spacing, density, dark, motion, theme axes) | `src/tokens/`, `src/styles/theme.css` | NO — `@import "@godxjp/ui/tailwind.css"` in one file |
| Tailwind v4 entry + `@theme inline` mapping | `src/tokens/tailwind.css` | NO — that single import is enough |
| Visual primitives — grouped by Storybook taxonomy under `src/components/<group>/<Name>.tsx`: `general` (Button, Typography), `layout` (Row, Col, Flex, Space, Grid, Masonry), `data-display` (Avatar, Badge, Card, Calendar, Descriptions, Empty, Popover, Tooltip, SegmentedControl, Statistic, Table, Tag, Carousel, Collapse, Image, List, QRCode, Timeline, Tour, Tree), `data-entry` (Input, Field, Select, Checkbox, Radio, Switch, Slider, AutoComplete, Cascader, ColorPicker, DateTimePicker, TimeInput, TreeSelect, Rate, InputNumber, Form, Transfer, CheckboxGroup, …), `feedback` (Alert, Dialog/Modal, Sheet/Drawer, AlertDialog, Popconfirm, Progress, Result, Skeleton, Spinner, Toaster, Watermark), `navigation` (Anchor, Breadcrumb, DropdownMenu, Menu, Pagination, Steps, Tabs) | NO — import from `@godxjp/ui` |
| Shell primitives (AppShell, Sidebar, Topbar, CommandPalette, TweaksPanel, ProductSwitcher) | `src/components/shell/` | NO — compose, don't reimplement |
| Composite widgets (Upload family, LocaleInput, …) | `src/components/composites/` | NO — extend via PR if missing |
| Calendar atoms + screens (EventBlock, MiniMonth, TimeGrid, MonthView, WeekView, DayView, AgendaView, …) | `src/components/{primitives,composites}/calendar/` | NO |
| i18next singleton + base dictionary | `src/i18n/` | NO — extend with `addResourceBundle` |
| Hooks (`useTweaks`, `useDebouncedValue`, `usePreferences`, …) | `src/hooks/` | NO |
| ESLint + Prettier + TS strict + Vitest configs | `config/` | NO — one-line re-export |

The consumer's only first-class file that touches visual layer is
**`theme.css`**, and it does two things:

```css
/* Mandatory: pulls @godxjp/ui's complete visual layer in one
   import. */
@import "@godxjp/ui/tailwind.css";

/* Optional: per-deployment accent palette ONLY. Omit entirely if
   the consumer inherits all defaults unchanged. Per cardinal
   rule #19 no service-specific names here — register a
   `[data-accent]` palette, never a `[data-tenant]` block. */
[data-accent="acme"] {
  --primary:           oklch(58% 0.17 290);
  --primary-foreground:oklch(98% 0.01 290);
  --ring:              oklch(58% 0.17 290);
  --brand:             oklch(58% 0.17 290);
  --sidebar-active-bg: oklch(95% 0.02 290);
  --sidebar-active-fg: oklch(58% 0.17 290);
}
```

There is no `index.css`, no `globals.css`, no second CSS file.
Re-declaring `:root { --background: … }` in the consumer is a
rejected diff.

If a primitive the consumer needs is missing in `@godxjp/ui`, the
move is **add it upstream**, not "build a local copy". See §H.

## §B — No `className` for visual styling

Visual configuration goes through **props** on the primitive, not
through Tailwind utility classes on the JSX. The framework's
primitives are Ant-Design-shaped:

```tsx
// CORRECT — props carry the visual contract
<Card title="Profile" extra={<Button>Edit</Button>} variant="ghost">…</Card>
<Input prefix={<MailIcon />} suffix={<XIcon />} size="large" status="error" />
<Avatar shape="square" size="xl" name="Alice Nguyen" />
<Statistic prefix="¥" value={123456} precision={2} />
<Tag color="success">Active</Tag>
<Row gutter={16}>
  <Col xs={24} md={8}>…</Col>
  <Col xs={24} md={16}>…</Col>
</Row>
<Flex gap="middle" align="center" justify="between">…</Flex>
<Space size="small" direction="vertical">…</Space>
```

```tsx
// FORBIDDEN — className-based visual decisions
<div className="rounded-lg border border-gray-200 p-4 shadow-sm">…</div>
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">…</button>
<div className="grid grid-cols-12 gap-4">…</div>
```

`className` is an escape hatch for cases where **no primitive
composition fits** — typically a one-off `data-screen-id` selector
or a layout-only wrapper around a feature view (`<section
className="profile-layout">`). Every `className` on a primitive in
consumer code is a code-review smell; review will ask "what prop
on `@godxjp/ui` covers this?". If the answer is "none", **extend
the primitive in the framework first** (§H) — don't paper over with
consumer-side classes.

Concept check — the framework exposes:

- **Layout**: `Row`/`Col` (12-col grid), `Flex` (CSS flex wrapper),
  `Space` (gap-spaced inline group), `Stack` (vertical Flex sugar).
- **Surface**: `Card` (title/extra/footer slots), `Sheet`, `Dialog`,
  `AlertDialog`, `Popover`, `Tooltip`.
- **Data display**: `Table` (density prop), `Tag`, `Badge` (variant
  + appearance props), `Avatar` (shape/size/name props),
  `Statistic`, `Empty`.
- **Forms**: `Input` (prefix/suffix/addon/size/status props),
  `InputPassword`, `InputSearch`, `LocaleInput`, `Select`,
  `Combobox`, `Switch`, `Checkbox`, `Field` (label/help/error slot).
- **Navigation**: `Tabs` (variant prop: line/pills/segmented),
  `Breadcrumb`, `SegmentedControl`, `PageHeader`.

If the consumer reaches for raw Tailwind utilities, check this list
first.

## §C — Search before you create

Before adding a new component to the consumer's
`src/components/` or `features/<domain>/components/`:

```bash
# Step 1 — grep the framework for the primitive name
grep -rln "export.*<Name>" libs/ts/godxjp-ui/src/components/

# Step 2 — read the index barrels
cat libs/ts/godxjp-ui/src/components/primitives/index.ts
cat libs/ts/godxjp-ui/src/components/shell/index.ts
cat libs/ts/godxjp-ui/src/components/composites/index.ts

# Step 3 — if it exists, USE IT.
# Step 4 — if it doesn't, decide:
#   a) Sharable across two or more consumers → extend the framework (§H).
#   b) Truly one-consumer-only feature view → keep local with a comment
#      explaining why it's not framework material.
```

The default answer is "find it in `@godxjp/ui`". The local-only
exception is narrow:

| Belongs in framework | Stays in consumer |
|---|---|
| Button, Card, Dialog, Tabs, Table, Avatar (generic primitives) | A `ProfileForm` that wires `/api/v1/profile` to `<Input>` + `<Button>` |
| AppShell, Sidebar, Topbar (shell compositions) | A `SettingsScreen` that arranges feature widgets in a unique layout |
| `useTweaks`, `useDebouncedValue`, `useMediaQuery` (generic hooks) | `useProfile` — TanStack Query wrapper around a specific endpoint |
| LocaleInput, AvatarUploader (cross-consumer composites) | A consumer-specific footer with the consumer's own links |
| Calendar atoms + screen compositions | A consumer-specific empty-state illustration |

If you find yourself building a "generic-looking" thing locally,
**stop** and follow §H instead.

## §D — Folder shape (consumer SPA)

Every consumer SPA follows this Bulletproof React-strict layout.
Drift between consumers is a tracked bug.

```
<consumer-root>/
├── package.json            # depends on @godxjp/ui (workspace:* in monorepo; ^x.y for extracted)
├── pnpm-lock.yaml          # committed
├── tsconfig.json           # extends @godxjp/ui/tsconfig
├── tsconfig.e2e.json
├── vite.config.ts
├── vitest.config.ts        # explicit if it diverges from vite.config
├── playwright.config.ts
├── eslint.config.js        # one line: export { default } from "@godxjp/ui/eslint-config"
├── .prettierrc.json        # one string: "@godxjp/ui/prettier-config"
├── .env.example
├── index.html              # SPA shell + <div id="root"></div>
├── public/                 # favicon, static assets
└── src/
    ├── main.tsx            # createRoot(...).render(<App />) — nothing else
    ├── theme.css           # @import "@godxjp/ui/tailwind.css" + optional [data-accent] override
    ├── vite-env.d.ts
    ├── app/                # composition root (Bulletproof React Layer 1)
    │   ├── App.tsx
    │   ├── provider.tsx    # QueryClient + i18n + theme stack
    │   ├── router.tsx      # React Router v6 data-router
    │   ├── ShellLayout.tsx # outlet shell using @godxjp/ui shell primitives
    │   └── routes/
    ├── config/             # parsed import.meta.env
    │   └── env.ts
    ├── features/           # vertical feature slices
    │   └── <domain>/
    │       ├── index.ts            # barrel — public surface
    │       ├── types.ts            # shape contracts
    │       ├── api/                # ONE FILE PER RESOURCE
    │       │   ├── <resource>.ts
    │       │   └── index.ts
    │       ├── hooks/              # ONE FILE PER HOOK GROUP
    │       │   ├── use<X>.ts
    │       │   └── index.ts
    │       ├── components/         # ONE FILE PER COMPONENT
    │       │   ├── <X>Screen.tsx
    │       │   └── index.ts
    │       └── __tests__/
    │           ├── api.test.ts
    │           ├── hooks.test.tsx
    │           └── <Component>.test.tsx
    ├── components/         # SHARED consumer-local UI (used by 2+ features) — search @godxjp/ui first
    ├── hooks/              # SHARED consumer-local hooks (used by 2+ features) — search @godxjp/ui first
    ├── i18n/
    │   ├── index.ts        # extend @godxjp/ui/i18n via addResourceBundle
    │   ├── ja.json
    │   ├── en.json
    │   ├── vi.json
    │   └── fil.json
    ├── lib/                # configured 3rd-party libs (axios, react-query)
    │   ├── api.ts
    │   ├── bootstrap.ts
    │   └── design-system.ts
    ├── stores/             # global client state (Zustand / Jotai) — only if needed
    ├── testing/            # test utils, mocks, fixtures (NOT *.test.* files)
    ├── types/              # SHARED domain types
    └── utils/              # pure utility functions (no I/O, no React)
```

**Forbidden** (review-rejected):

- A `pages/` directory (Next.js-style routing). Use Vite + React
  Router v6 data-router with the route tree in `app/router.tsx`.
- A monolithic `components/` folder that mixes feature + shared UI.
- `App.tsx` / `router.tsx` at `src/` root — they live under `src/app/`.
  `src/main.tsx` ONLY does `createRoot(…).render(<App />)`.
- A monolithic `main.test.ts` or single-file mega-suite at `src/`
  root. Co-locate tests with source.
- A `utils/` or `helpers/` folder named that vaguely. Use concept
  names (`lib/api.ts`, `lib/design-system.ts`, `i18n/`, …).

## §E — Service-layer pattern (the four-layer transport rule)

Components NEVER call `axios` or `fetch` directly. Four layers:

```
┌─ src/ ───────────────────────────────────────────────────┐
│                                                          │
│ lib/api.ts                                               │
│   - one axios instance per slug (meApi, adminApi, …)     │
│   - baseURL from VITE_<SLUG>_API_BASE_URL                │
│   - 401 → /login redirect interceptor                    │
│   - withCredentials: true                                │
│   - the ONLY transport surface                           │
│           │                                              │
│           ▼                                              │
│ features/<domain>/api/<resource>.ts                      │
│   - typed methods returning typed payloads               │
│   - import the slug-shaped axios instance from lib/api   │
│   - NO React state, NO TanStack Query here               │
│           │                                              │
│           ▼                                              │
│ features/<domain>/hooks/use<X>.ts                        │
│   - useQuery / useMutation / useInfiniteQuery wrappers   │
│   - query keys exported as `as const` tuples             │
│   - invalidations / setQueryData on mutation success     │
│           │                                              │
│           ▼                                              │
│ features/<domain>/components/<Screen>.tsx                │
│   - reads hook state (isLoading, isError, data)          │
│   - calls mutation triggers                              │
│   - never imports axios, never imports api/* directly    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Canonical example:

```tsx
// features/profile/api/profile.ts
import { meApi } from "../../../lib/api"
export const profileQueryKey = ["me", "profile"] as const
export interface ProfileData { /* … */ }
export async function fetchProfile(): Promise<ProfileData> {
  const { data } = await meApi.get<ProfileData>("/profile")
  return data
}
export async function updateProfile(payload: Partial<ProfileData>): Promise<ProfileData> {
  const { data } = await meApi.patch<ProfileData>("/profile", payload)
  return data
}

// features/profile/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { profileQueryKey, fetchProfile, updateProfile, type ProfileData } from "../api/profile"
export function useProfile() {
  return useQuery({ queryKey: profileQueryKey, queryFn: fetchProfile })
}
export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (next: ProfileData) => { qc.setQueryData(profileQueryKey, next) },
  })
}

// features/profile/components/ProfileForm.tsx
import { Button, Input, Skeleton } from "@godxjp/ui"
import { useProfile, useUpdateProfile } from "../hooks/useProfile"

export function ProfileForm() {
  const { data, isLoading } = useProfile()
  const update = useUpdateProfile()
  if (isLoading) return <Skeleton />
  return <form onSubmit={(e) => { e.preventDefault(); update.mutate(/* … */) }}>{/* … */}</form>
}
```

**Forbidden** (review-rejected):

- `axios.get(...)` / `fetch(...)` inside a `.tsx` file.
- A component importing `features/<domain>/api/*` directly.
- A hook calling `axios` instead of going through the api layer.
- A query key as a string literal scattered across files — always
  an `as const` tuple exported from the api file.
- A mutation that doesn't either `setQueryData` or `invalidateQueries`
  on success. Stale UI is a bug.
- `useState` for server data — TanStack Query's job.
- `useEffect(() => fetch(...))` — same. Use `useQuery`.
- Manual `Authorization: Bearer …` headers — gateway + BFF exchange
  do the token plumbing; the SPA travels with `withCredentials: true`.
- A second axios instance for the same slug. One slug = one instance.
- Hard-coded `/api/<slug>/v1/...` paths in api files — use the
  per-slug `xxxURL(path)` helper or the axios instance's baseURL so
  `VITE_<SLUG>_API_BASE_URL` flips work uniformly.

TanStack Query v5 is locked. Migrating to v6+ requires an ADR.

## §F — i18n bootstrap

The framework ships **one** i18next singleton at `@godxjp/ui/i18n`.
Consumers extend it with `addResourceBundle`; they do not create
their own.

```ts
// src/i18n/index.ts
import i18n from "i18next"
import { initI18n } from "@godxjp/ui/i18n"
import en from "./en.json"
import ja from "./ja.json"
import vi from "./vi.json"
import fil from "./fil.json"

export const supportedLocales = ["ja", "en", "vi", "fil"] as const
export type SupportedLocale = (typeof supportedLocales)[number]

initI18n()

export const i18nReady = (
  i18n.isInitialized
    ? Promise.resolve(i18n)
    : new Promise<typeof i18n>((resolve) => i18n.on("initialized", () => resolve(i18n)))
).then((inst) => {
  const bundles: Record<SupportedLocale, Record<string, unknown>> = { ja, en, vi, fil }
  for (const locale of supportedLocales) {
    inst.addResourceBundle(locale, "translation", bundles[locale], true, true)
  }
  return inst
})
```

`main.tsx` awaits `i18nReady` before mounting `<RouterProvider>`.

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client"
import { App } from "./app/App"
import { i18nReady } from "./i18n"
import "./theme.css"

void i18nReady.then(() => {
  createRoot(document.getElementById("root")!).render(<App />)
})
```

A loader that calls `i18n.changeLanguage()` before init produces the
`toResolveHierarchy is undefined` crash; the framework paid that
bug once (2026-05-16) and won't pay it again.

**Mandatory locales** for any consumer SPA: `ja`, `en`, `vi`, `fil`.
Each `<locale>.json` must cover every key the consumer uses; CI
lints parity. Add more locales freely; never remove these four.

**Forbidden**:

- Hard-coded user-visible strings in `.tsx`. Every visible string
  passes through `t(...)`.
- A consumer-local i18next singleton. Use the shared one.
- Out-of-tree locale files — every locale lives under `src/i18n/`.

## §G — Config inheritance (ESLint / Prettier / TS / Vitest / Playwright)

The framework publishes config presets as sub-path exports.
Consumers consume them as **one-line re-exports** — never re-configured
per consumer.

```js
// eslint.config.js
export { default } from "@godxjp/ui/eslint-config"
```

```json
// package.json
{
  "prettier": "@godxjp/ui/prettier-config"
}
```

```json
// tsconfig.json
{ "extends": "@godxjp/ui/tsconfig", "compilerOptions": { "outDir": "./dist" }, "include": ["src"] }
```

```ts
// vitest.config.ts
import { defineConfig, mergeConfig } from "vitest/config"
import base from "@godxjp/ui/vitest-config"
export default mergeConfig(base, defineConfig({ /* consumer-specific test extras */ }))
```

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test"
import base from "@godxjp/playwright-config"
export default defineConfig({ ...base, /* consumer-specific extras */ })
```

If you find yourself writing more than one line of config in any
of these files, you are doing it wrong. **Open an issue against
`@godxjp/ui`** to fix the upstream default; do NOT carry the
override in the consumer.

The locked stack (do not change without an ADR):

- React 19, React Router v6 data-router
- Vite 8+
- TypeScript 6.x strict
- TanStack Query v5
- react-i18next v15 (aligned with `@godxjp/ui`'s singleton)
- axios 1.x
- Vitest 4.x + React Testing Library
- Playwright 1.x + @axe-core/playwright
- ESLint 9 (flat) + typescript-eslint 8.x + plugin-react 7.x +
  plugin-react-hooks 5.x + plugin-jsx-a11y 6.x + plugin-import 2.x +
  plugin-tanstack
- Prettier 3
- shadcn/ui (via `@godxjp/ui`) + Radix primitives
- Tailwind v4

Pre-commit hook (consumer-side, `.lefthook.yml` / `.husky/`):

```yaml
pre-commit:
  commands:
    eslint:
      glob: "*.{ts,tsx,js,jsx}"
      run: pnpm eslint --max-warnings 0 {staged_files}
    prettier:
      glob: "*.{ts,tsx,js,jsx,md,yaml,yml,json}"
      run: pnpm prettier --check {staged_files}
```

**Forbidden**:

- `// eslint-disable-line` without a code comment citing the rule
  name + issue link.
- `// prettier-ignore` outside legitimate edge cases (hand-formatted
  markdown tables).
- `--no-verify` on `git commit`.

## §H — Extending the framework when a primitive is missing

When a needed primitive does not exist in `@godxjp/ui`, **the clause
is not "build it locally"**. The clause is "extend the framework",
which means:

1. Branch the submodule: `cd libs/ts/godxjp-ui && git checkout -b feat/<primitive>`.
2. Add the primitive under
   `src/components/{primitives|composites|shell}/<Name>.tsx`,
   following Storybook discipline (cardinal rule 1 — story alongside).
3. Tokens it needs go into `src/tokens/` (or `src/styles/theme.css`)
   FIRST per cardinal rule 16.
4. Export from the appropriate barrel
   (`src/components/{primitives|composites|shell}/index.ts`) and
   the package root (`src/index.ts`).
5. tsup build + a11y check + story snapshot all green.
6. Commit + push + PR in the submodule repo. Review + merge.
7. Umbrella bumps the pin: `git -C libs/ts/godxjp-ui pull --ff-only origin <branch>`,
   then `git add libs/ts/godxjp-ui` and commit the umbrella with
   `chore(godxjp-ui): bump pin — <primitive>`.

Never push from inside an umbrella-only PR; the histories diverge.

The bar for "framework-worthy":

- Generic shape (operates on props, no domain coupling).
- Sharable across two or more consumers (or clearly will be).
- Composes existing primitives or wraps a Radix primitive (per
  cardinal rule 3 — Radix for interactive).
- Has a story (cardinal rule 1).
- Has a reference doc at `docs/reference/primitives/<Name>.md`
  (cardinal rule 18).

If the answer is "one-consumer-only feature view that just wires
data into existing primitives", it stays in the consumer's
`features/<domain>/components/`. Don't pollute the framework with
domain shapes.

## §I — Storybook adoption (consumer side)

A consumer that imports `@godxjp/ui` automatically inherits the
framework's tokens, primitives, and shell. The consumer does NOT
ship its own Storybook of framework primitives — those stories live
in the framework and are served at the umbrella's
`storybook.<publicDomain>` (a platform concern, not framework's).

A consumer MAY ship a Storybook of its own **screens** (composed
feature views) for design / QA. That Storybook reuses the
framework's `.storybook/preview.tsx` decorators (theme axes, i18n
init) by importing from `@godxjp/ui/storybook` (when published) or
duplicating the minimal shape in the consumer's
`.storybook/preview.tsx`. If you find yourself copy-pasting the
preview decorator across multiple consumers, file an issue against
the framework — it should ship as an export.

## Standards (international + community)

- **Bulletproof React** (`github.com/alan2207/bulletproof-react`) —
  community-standard layout; this rule prescribes the strict variant.
- **Feature-Sliced Design 2.1** (`feature-sliced.design`) — informs
  the `features/<domain>/` grouping (not used wholesale; flattened
  variant matches our Diátaxis service boundary).
- **Atomic Design** (Brad Frost, 2013) — primitives → composites →
  shell hierarchy.
- **shadcn/ui** — primitive ownership model (per cardinal rule 4).
- **Radix UI** — interactive primitive base (per cardinal rule 3).
- **TanStack Query v5** — server-state cache (`tanstack.com/query/latest`).
- **react-i18next v15** — i18n singleton (`react.i18next.com`).
- **Tailwind CSS v4** — utility surface + `@theme inline`
  (`tailwindcss.com`).
- **WCAG 2.1 AA** — a11y baseline (cardinal rule 6).
- **WAI-ARIA Authoring Practices** — interactive pattern reference.
- **The Twelve-Factor App** §III — config from env, never hardcoded.

## Compliance check (CI-enforced)

Run from the consumer root:

```bash
# Audits the consumer's adoption of this contract.
pnpm dlx @godxjp/ui-audit ./
# OR (umbrella context) use the umbrella's linter:
scripts/lint-godxjp-ui-adoption.sh <consumer-path>
```

Verifies:

- `@godxjp/ui` declared in `package.json`.
- `theme.css` is the single CSS entry; no `index.css` / `globals.css`.
- `theme.css` does ONLY `@import "@godxjp/ui/tailwind.css"` plus
  optional `[data-accent="…"]` overrides.
- ESLint + Prettier + TS configs are one-line re-exports.
- Folder shape matches §D (no `pages/`, no `App.tsx` at `src/` root,
  no `__tests__/` aggregation directory, no mega `utils/`).
- No `axios` / `fetch` import inside `.tsx`.
- No `className="bg-*"` / `text-blue-*` / `text-zinc-*` raw color
  utilities in consumer code (per cardinal rule 2).
- No `<Button className="…">` carrying visual tweaks (per §B).
- Every visible string is wrapped in `t(...)` (i18n coverage).
- All four mandatory locales (`ja`, `en`, `vi`, `fil`) present and
  parity-clean.

CI blocks merge on any violation. `--no-verify` is forbidden per §G.
