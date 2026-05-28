# @godxjp/ui

The shared React UI framework for every godx surface (admin, agency portal,
handheld). Built on shadcn + Radix UI + Tailwind CSS v4.

Location: `packages/godx-ui/` (linked into the app as a `file:` dependency at
`@godxjp/ui`).

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

> Deciding whether a component belongs here vs. app-level? Use the
> **`godx-ui-component-placement`** skill.

Full contributor rules: **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)**.

---

## Architecture (bottom-up)

```
src/tokens/      Design tokens — the single source of values
  foundation.css   :root + .dark: colors, fonts, type scale, spacing, radius, wa-iro
  primitives/      Per-domain primitive tokens (card, table, control, badge, …)
src/styles/      CSS that styles components by [data-slot]; density.css = the one density knob
  index.css        Entry: fontsource → tailwindcss → @theme (token→utility map) → *-layout.css
src/components/  React components by group (data-display, data-entry, layout, feedback, …)
src/props/       Prop type system: vocabulary/ (atomic) + components/ + registry.ts
src/lib/         cn(), control-styles, variants
examples/        *.preview.tsx — Storybook-style stories
docs/primitives/ <component>/index.tsx demo + examples/ + generated .md
preview/         The preview app (vite, :6008) rendering examples + docs
```

A value is defined **once** as a CSS var (`--primary`), mapped to a utility in the
`@theme` block (`--color-primary: hsl(var(--primary))`), and consumed as `bg-primary`.
Components emit `data-slot` / `data-*`; the look lives in `styles/*-layout.css`. See
[DEVELOPMENT.md §1](./docs/DEVELOPMENT.md#1-architecture--the-layers-bottom-up).

---

## Component groups

| Group              | Import                    | Examples                                                                        |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------- |
| **Layout**         | `@godxjp/ui/layout`       | `PageContainer`, `Stack`, `Inline`, `ResponsiveGrid`                            |
| **General**        | `@godxjp/ui/general`      | `Button`                                                                        |
| **Data Entry**     | `@godxjp/ui/data-entry`   | `Input`, `Select`, `FormField`, `DatePicker`, `Switch`                          |
| **Data Display**   | `@godxjp/ui/data-display` | `Table`, `DataTable`, `Card`, `Badge`, `KeyValueGrid`, `Timeline`, `EmptyState` |
| **Feedback**       | `@godxjp/ui/feedback`     | `Dialog`, `Sheet`, `Toast`, `Skeleton`, `Alert`                                 |
| **Query**          | `@godxjp/ui/query`        | `DataState`, `InfiniteQueryState`, `PrefetchLink`, `MutationFeedback`           |
| **Navigation**     | `@godxjp/ui/navigation`   | `Tabs`, `FilterBar`, `DropdownMenu`, `Steps`, `Pagination`, `LocalePicker`      |
| **App**            | `@godxjp/ui/app`          | `AppProvider`, `useDateTime`                                                    |
| **Datetime**       | `@godxjp/ui/datetime`     | `formatDate` (mandatory for display)                                            |
| **shadcn paths**   | `@godxjp/ui/ui`           | Thin re-exports for shadcn-style imports                                        |
| **Admin (legacy)** | `@godxjp/ui/admin`        | Compound admin exports                                                          |

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
pnpm preview:build    # static build — the integration test for examples + docs
pnpm docs:sync-primitives   # regenerate docs/primitives/**/*.md from source
pnpm typecheck && pnpm audit && pnpm test
```

→ **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** is the contributor guideline (the
boundary, the layers, how to add/extend a component, verification).

## Docs index

- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) — contributor guideline (start here to edit the package)
- [docs/COMPONENTS.md](./docs/COMPONENTS.md) · [docs/TOKENS.md](./docs/TOKENS.md) · [docs/SPACING.md](./docs/SPACING.md)
- [docs/PROPS-VOCABULARY.md](./docs/PROPS-VOCABULARY.md) · [docs/PROPS-REGISTRY.md](./docs/PROPS-REGISTRY.md)
- [docs/DATETIME.md](./docs/DATETIME.md) · [docs/FORMS.md](./docs/FORMS.md) · [docs/TESTING.md](./docs/TESTING.md)
- MCP: **godxjp-ui-mcp** (`.mcp.json`)
