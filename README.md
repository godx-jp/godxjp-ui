# @godxjp/ui

The shared React UI framework for every godx surface (admin, agency portal,
handheld). Built on shadcn + Radix UI + Tailwind CSS v4. **~98 components**, fully catalogued.

- 📦 **npm:** `@godxjp/ui` (published) · MCP server `@godxjp/ui-mcp`
- 🌐 **Live preview / catalog:** **https://godx-jp.github.io/godxjp-ui/** (components · tokens · props)
- 🤖 **Agents:** the `@godxjp/ui-mcp` server exposes the full catalog (`get_component`, `list_primitives`, `search_components`) so coding agents use the real API instead of hand-rolling.

```bash
npm i @godxjp/ui
```

---

## Role & boundary — read this first

This package is **the single source of UI truth**. It is shared, versioned
infrastructure, which means two things are non-negotiable:

- **Editing it requires explicit session permission** (the hard gate — see
  [DEVELOPMENT.md](./docs/DEVELOPMENT.md#0-what-this-package-is--and-the-boundary-it-must-keep)).
  By default the package is off-limits; consumers _compose_ its primitives, they
  don't fork them.
- **It is generic and presentational only.** No app i18n (`useTranslation`), no
  Inertia (`router`/`<Form>`), no Wayfinder routes, no business entities or domain
  logic, no product copy, no raw colors. Those are **consumer-layer** concerns — they
  must never leak into this package. The framework ships **its own theme**, so a
  consumer imports the styles and needs **zero** extra theme configuration.
- **The root export is runtime-neutral.** Importing `@godxjp/ui` (or its primitive
  subpaths) forces **no** foreign runtime — React Router, TanStack Query, react-hook-form
  and the i18n singleton live ONLY on their adapter subpaths (`./form`, `./query`, `./app`).
  A CI guard (`pnpm check:core-isolation`) traces the root dist graph and fails the build if
  an adapter ever leaks into the root barrel.

> Deciding whether a component belongs here vs. app-level? Use the
> **`godx-ui-component-placement`** skill.

Full contributor rules: **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)**.

---

## Architecture (bottom-up)

```
src/tokens/      Design tokens — 3-tier: primitive → semantic → component
  foundation.css   primitive :root + .dark: raw palette, fonts, type scale, spacing, radius, wa-iro
  semantic/        UI-role aliases (--primary, --destructive, --muted, …)
  components/      per-component tokens (--card-*, --badge-*, …) aliasing semantic/primitive
src/styles/      CSS that styles components by [data-slot]; density.css = the one density knob
  index.css        Entry: fontsource → tailwindcss → @theme (token→utility map) → *-layout.css
src/components/  React components by group (data-display, data-entry, layout, feedback, …)
src/props/       Prop type system: vocabulary/ (atomic) + components/ + registry.ts (NORMATIVE, CI-checked)
src/lib/         cn(), control-styles, variants, hooks
examples/        *.preview.tsx — Storybook-style stories (rendered by the preview app + Pages site)
preview/         The preview app (vite, :6008) → also deployed to GitHub Pages
```

A value is defined **once** as a CSS var (`--primary`), mapped to a utility in the
`@theme` block (`--color-primary: hsl(var(--primary))`), and consumed as `bg-primary`.
Components emit `data-slot` / `data-*`; the look lives in `styles/*-layout.css`. See
[DEVELOPMENT.md §1](./docs/DEVELOPMENT.md#1-architecture--the-layers-bottom-up).

---

## Component groups

| Group              | Import                    | Examples                                                                                                  |
| ------------------ | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Layout**         | `@godxjp/ui/layout`       | `Flex` (+ `Stack`/`Inline`), `PageContainer`, `ResponsiveGrid`, `AppShell`, `Sidebar`, `Separator`, `AspectRatio`, `Resizable` |
| **General**        | `@godxjp/ui/general`      | `Button`                                                                                                  |
| **Data Entry**     | `@godxjp/ui/data-entry`   | `Input`, `Select`, `FormField`, `Field`, `DatePicker`, `TimePicker`, `Combobox`, `Switch`, `Toggle`, `Upload`, `Cascader`, `TreeSelect`, `ColorPicker`, `Slider`, `PasswordInput`, `PasswordStrength`, `InputOTP`, `Rating`, `TagInput` |
| **Data Display**   | `@godxjp/ui/data-display` | `Table`, `DataTable`, `Card`, `StatCard`, `Badge`, `Avatar`, `Descriptions`, `Timeline`, `EmptyState`, `Progress`, `Accordion`, `HoverCard`, `Carousel`, `Popover`, `Collapsible` |
| **Feedback**       | `@godxjp/ui/feedback`     | `Dialog`, `AlertDialog`, `Sheet` (side), `Drawer` (bottom-sheet), `Toast`, `Skeleton`, `Alert`, `Tooltip` |
| **Query**          | `@godxjp/ui/query`        | `DataState`, `InfiniteQueryState`, `PrefetchLink` (adapter subpath — pulls TanStack Query)                |
| **Navigation**     | `@godxjp/ui/navigation`   | `Tabs`, `Toolbar` (+ `FilterBar`), `DropdownMenu`, `ContextMenu`, `Menubar`, `NavigationMenu`, `Steps`, `Pagination`, `Breadcrumb`, `LocalePicker` |
| **App**            | `@godxjp/ui/app`          | `AppProvider`, `useDateTime` (adapter — i18n/datetime singleton)                                          |
| **Datetime**       | `@godxjp/ui/datetime`     | `formatDate` (mandatory for display)                                                                      |
| **Form**           | `@godxjp/ui/form`         | `useZodForm`, `FormRoot` (adapter subpath — pulls react-hook-form)                                        |
| **Hooks**          | `@godxjp/ui/hooks`        | `useIsMobile`, `useMediaQuery`                                                                            |
| **shadcn paths**   | `@godxjp/ui/ui`           | Thin re-exports for shadcn-style imports (tree-shakeable)                                                 |
| **Admin (legacy)** | `@godxjp/ui/admin`        | Compound admin exports                                                                                    |

> **Renamed in 8.0** (thin aliases kept): `Stack`/`Inline`→`Flex`, `KeyValueGrid`→`Descriptions`,
> `ProgressMeter`→`Progress`, `CardStat`→`StatCard`, `FilterBar`→`Toolbar`, `ChoiceField`→`Field`,
> `SkeletonCard`→`SkeletonStat`. `StatusBadge`→`Badge` (`status`/`tone`), `DialogConfirm`/`Dialog mode="confirm"`→`AlertDialog`.

---

## Consumer setup — theme is self-contained

The framework ships colors, fonts (M PLUS 2 via `@fontsource`), the type scale, and
the wa-iro palette. A consumer's entire styling surface is **one import + content
sources** — no `:root` overrides, no font `<link>`:

```css
/* resources/css/app.css */
@import "@godxjp/ui/styles";
@source '../js/**/*.{ts,tsx}';
@source '../views';
```

```tsx
import { AppProvider } from "@godxjp/ui/app"; // locale, tz, date/time format
import { PageContainer } from "@godxjp/ui/layout"; // every page wraps in this
```

### Mandatory consumer rules

1. **Every page** uses `<PageContainer title subtitle extra footer>`.
2. **Mobile-first** — verify at 320–390px in preview / browser.
3. **Spacing via `Stack`/`Inline` `gap` + `ResponsiveGrid`** — no Tailwind `p-*` /
   `gap-*` / `space-x|y-*` for app layout (see `docs/SPACING.md`).
4. **Semantic tokens only** — no raw colors / hex / `dark:` overrides.
5. **Dates** display via `formatDate` from `@godxjp/ui/datetime`.
6. **`AppProvider`** wraps the app for locale / timezone / date-time format.
7. **Audit** — `npm run ui:audit` must report 0 errors for touched files.

Full app-developer rules: [ui-standardization.md](../../.claude/skills/frontend-design/rules/ui-standardization.md).

---

## Golden ratio (φ ≈ 1.618)

One token `--phi-unit` drives page/section/card spacing; micro control gaps use the
4px grid. Density (`compact` | `default` | `comfortable`) retunes `--phi-unit` with
control + table heights together.

| App API             | φ level             |
| ------------------- | ------------------- |
| `<Stack gap="md">`  | φ⁰ (default)        |
| `<Stack gap="lg">`  | φ¹                  |
| `<Stack gap="xl">`  | φ²                  |
| Card shell / footer | base × φ / base ÷ φ |

---

## Working on the framework

```bash
pnpm preview          # preview app → http://localhost:6008 (fixed port, kills stale)
pnpm preview:build    # static build — also what deploys to GitHub Pages
pnpm verify           # typecheck · lint · format · the 5 guards · test
pnpm release --ui <patch|minor|major> --mcp <…|skip>   # publish lib + MCP in lockstep
```

**Five CI guards** (wired into `verify` / `verify:release`) keep the library honest:

| Guard | Enforces |
| --- | --- |
| `check:prop-vocabulary` | every public `*Prop` field maps to the registry (no ad-hoc props) |
| `check:token-tiers` | 3-tier tokens; no domain/raw-palette tokens in component CSS |
| `check:mcp-sync` | every MCP catalog entry is a real export (no stale agent guidance) |
| `check:mcp-orphans` | every public component HAS a catalog entry (catalog can't rot) |
| `check:core-isolation` | the root export pulls no foreign runtime (adapters stay on subpaths) |

This repo ships two packages — `@godxjp/ui` (this dir) and `@godxjp/ui-mcp` (`mcp/`). They keep
separate version lines but release together via `pnpm release`; see DEVELOPMENT.md §6.
The **preview app auto-deploys to [GitHub Pages](https://godx-jp.github.io/godxjp-ui/)** on every push to `main`
(`.github/workflows/preview-pages.yml`) — which doubles as the CI gate for `preview:build`.

→ **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** is the contributor guideline (the
boundary, the layers, how to add/extend a component, verification).

## Docs index

- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) — contributor guideline (start here to edit the package)
- [docs/STANDARDS-vocabulary-tokens.md](./docs/STANDARDS-vocabulary-tokens.md) — the 22 vocabulary + token rules (CI-enforced)
- [docs/roadmap/post-7.0.0.md](./docs/roadmap/post-7.0.0.md) — shipped log (7.0→9.2) + key decisions
- [docs/COMPONENTS.md](./docs/COMPONENTS.md) · [docs/TOKENS.md](./docs/TOKENS.md) · [docs/SPACING.md](./docs/SPACING.md)
- [docs/PROPS-VOCABULARY.md](./docs/PROPS-VOCABULARY.md) · [docs/PROPS-REGISTRY.md](./docs/PROPS-REGISTRY.md)
- [docs/DATETIME.md](./docs/DATETIME.md) · [docs/FORMS.md](./docs/FORMS.md) · [docs/TESTING.md](./docs/TESTING.md)
- **Architecture decisions** under `debate/*/04-Decision.md` (ADRs from the design debates)
- MCP: **godxjp-ui-mcp** (`.mcp.json`) — live catalog for agents
