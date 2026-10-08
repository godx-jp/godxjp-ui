# @godxjp/ui

A React UI framework built on design tokens: accessible components, a controlled prop vocabulary,
and a machine-readable catalog so coding agents use the real API instead of guessing. It is for any
team; GoDX is one preset on top of it.

- npm: `@godxjp/ui` (published) · MCP server `@godxjp/ui-mcp`
- Live preview / catalog: **https://godx-jp.github.io/godxjp-ui/** (components · tokens · props)
- Agents: the `@godxjp/ui-mcp` server exposes the full catalog (`get_component`, `list_primitives`, `search_components`) so coding agents use the real API instead of hand-rolling.

```bash
npm i @godxjp/ui
```

---

## Using this from an AI agent

<!-- agent-catalog-counts:start -->

The catalog — 185 components, 2188 tokens, 43 cardinal rules — is published in two forms from one
source. **Entry point for either: [`AGENTS.md`](AGENTS.md).**
<!-- agent-catalog-counts:end -->

### If your agent can run a process

Claude Code · Codex CLI · Cursor · any MCP client:

```bash
npx godxjp-ui sync-rules --dry-run   # preview the files it would create or change
npx godxjp-ui sync-rules             # write them
```

Writes `.mcp.json`, `CLAUDE.md` and `.ai/rules/` into the consumer repo and wires
`@godxjp/ui-mcp`. Prefer this: it is searchable, it drills down instead of dumping, and it is
**locked to the version on disk** — the failure it prevents is an agent being told a prop does not
exist because the catalog was two minors behind (gh#789).

**Setup is explicit.** Installing the package writes nothing. Run `npx godxjp-ui sync-rules` once
after installing and again after each upgrade, so the MCP pin moves with the package.

### If your agent can only fetch URLs

ChatGPT on the web, Claude.ai, or any client without a local process. The same data is served as
static files straight from this public repo — no hosting, no deploy step:

<!-- agent-catalog-files:start -->

<!-- prettier-ignore-start -->
| file | size | what it is |
| --- | --- | --- |
| [`agent/START-HERE.md`](https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/START-HERE.md) | 11 KB | **read first** — self-contained: the four rules, the token override model, a page that passes review |
| [`agent/llms.txt`](https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/llms.txt) | 3 KB | the [llms.txt](https://llmstxt.org/) entry point |
| [`agent/index.json`](https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/index.json) | 3 KB | manifest: version, counts, every file's URL |
| [`agent/components-index.json`](https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/components-index.json) | 51 KB | all 185 as name + group + tagline — **fetch this first** |
| [`agent/components/<Name>.json`](https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/components/Select.json) | 1 KB–36 KB | one file per component, each with its `importPath` — **this is the route to take** |
| [`agent/components.json`](https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/components.json) | 1.3 MB | all 185 entries in one file — most URL fetchers truncate this silently; prefer the per-component files |
| [`agent/tokens.json`](https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/tokens.json) | 843 KB | all 2188 design tokens, their values and why they exist |
| [`agent/vocabulary.json`](https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/vocabulary.json) | 7 KB | the controlled prop vocabulary |
| [`agent/rules.json`](https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/rules.json) | 21 KB | the 43 cardinal rules |
<!-- prettier-ignore-end -->
<!-- agent-catalog-files:end -->

Pasteable bootstrap:

> Read https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/START-HERE.md and follow it.
> Then fetch .../agent/components-index.json to choose components, and
> .../agent/components/<Name>.json for the props of each one you chose. Tell me which catalog
> version you read.

**Pin to the version you installed.** Every URL above tracks `main`. Swap `main` for the matching
tag — `https://raw.githubusercontent.com/godx-jp/godxjp-ui/v28.4.0/agent/...` — because a catalog
newer than your package describes props you do not have, an older one hides props you do, and
neither failure announces itself. Pinned URLs only resolve for releases whose tag contains
`agent/`; on a 404 the release predates this catalog, so read `main` and compare
`index.json` → `version` against what you installed.

### Why static files and not a hosted MCP endpoint

GitHub serves files; it does not run servers. MCP over the network needs a process handling POST
requests, which no amount of Pages or raw hosting provides. A hosted HTTP MCP would work and would
need real hosting, ops and an auth decision — so the static lane ships first, carrying the same
data at no operational cost. Regenerate both from the one source with `pnpm gen:agent-catalog`.

---

## Role & boundary — read this first

This package is **the single source of UI truth**. It is shared, versioned infrastructure, which means two things are non-negotiable:

- **Editing it requires explicit session permission** (the hard gate — see [DEVELOPMENT.md](./docs/DEVELOPMENT.md#0-what-this-package-is--and-the-boundary-it-must-keep)). By default the package is off-limits; consumers _compose_ its primitives, they don't fork them. - **It is generic and presentational only.** No app i18n (`useTranslation`), no Inertia (`router`/`<Form>`), no Wayfinder routes, no business entities or domain logic, no product copy, no raw colors. Those are **consumer-layer** concerns — they must never leak into this package.

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
docs/            real-screen example pages (rendered by the preview app + Pages site)
preview/         The preview app (vite, :6008) → also deployed to GitHub Pages
```

A value is defined **once** as a CSS var (`--primary`), mapped to a utility in the `@theme` block (`--color-primary: hsl(var(--primary))`), and consumed as `bg-primary`. Components emit `data-slot` / `data-*`; the look lives in `styles/*-layout.css`. See [DEVELOPMENT.md §1](./docs/DEVELOPMENT.md#1-architecture--the-layers-bottom-up).

---

## Component groups

| Group              | Import                    | Examples                                                                                                                                                                                                                    |
| ------------------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**         | `@godxjp/ui/layout`       | `Flex`, `PageContainer`, `ResponsiveGrid`, `AppShell`, `Sidebar`, `Breadcrumb`, `Separator`, `AspectRatio`, `ResizablePanelGroup`                                                                                           |
| **General**        | `@godxjp/ui/general`      | `Button`                                                                                                                                                                                                                    |
| **Data Entry**     | `@godxjp/ui/data-entry`   | `Input`, `Select`, `FormField`, `Field`, `DatePicker`, `TimePicker`, `Switch`, `Toggle`, `Upload`, `Cascader`, `TreeSelect`, `ColorPicker`, `Slider`, `PasswordInput`, `PasswordStrength`, `InputOTP`, `Rating`, `TagInput` |
| **Data Display**   | `@godxjp/ui/data-display` | `Table`, `DataTable`, `Card`, `StatCard`, `Badge`, `Avatar`, `Descriptions`, `Timeline`, `EmptyState`, `Progress`, `QrCode`, `CredentialReveal`, `Accordion`, `HoverCard`, `Carousel`, `Popover`, `Collapsible`             |
| **Feedback**       | `@godxjp/ui/feedback`     | `Dialog`, `AlertDialog`, `Sheet` (side or bottom), `Toaster` / `toast`, `Skeleton`, `Alert`, `Tooltip`                                                                                                                      |
| **Query**          | `@godxjp/ui/query`        | `DataState`, `InfiniteQueryState` (adapter subpath — pulls TanStack Query; no router)                                                                                                                                       |
| **React Router**   | `@godxjp/ui/react-router` | `PrefetchLink` — imports the optional `react-router-dom` peer, so it is kept out of `/query` (gh#996)                                                                                                                       |
| **Navigation**     | `@godxjp/ui/navigation`   | `Tabs`, `Toolbar`, `DropdownMenu`, `Steps`, `Pagination`, `AppSettingPicker`                                                                                                                                                |
| **App**            | `@godxjp/ui/app`          | `AppProvider`, `useDateTime` (adapter — i18n/datetime singleton)                                                                                                                                                            |
| **Datetime**       | `@godxjp/ui/datetime`     | `formatDate` (mandatory for display)                                                                                                                                                                                        |
| **Form**           | `@godxjp/ui/form`         | `useZodForm`, `FormRoot` (adapter subpath — pulls react-hook-form)                                                                                                                                                          |
| **Hooks**          | `@godxjp/ui/hooks`        | `useIsMobile`, `useMediaQuery`                                                                                                                                                                                              |
| **shadcn paths**   | `@godxjp/ui/ui`           | Thin re-exports for shadcn-style imports (tree-shakeable)                                                                                                                                                                   |
| **Admin (legacy)** | `@godxjp/ui/admin`        | Compound admin exports                                                                                                                                                                                                      |

---

## Migrating 6 → 11

Replace these at the call site:

| Removed / renamed (≤ v8)                  | Replacement (v11)                                   |
| ----------------------------------------- | --------------------------------------------------- |
| `Stack`                                   | `Flex direction="col"`                              |
| `Inline`                                  | `Flex` (default `direction="row"`)                  |
| `Autocomplete`                            | `Select` with `showSearch` + `options`              |
| `CountrySelect`                           | `AppSettingPicker kind="country"`                   |
| `LocalePicker`                            | `AppSettingPicker kind="language"`                  |
| `CountryOptionLabel`                      | `Intl.DisplayNames` (ISO 3166-1 α-2) — no component |
| `SwitchField`                             | `Field` + `Switch`                                  |
| `CardStat`                                | `StatCard`                                          |
| `KeyValueGrid`                            | `Descriptions`                                      |
| `ProgressMeter`                           | `Progress`                                          |
| `FilterBar`                               | `Toolbar`                                           |
| `ChoiceField`                             | `Field`                                             |
| `SkeletonCard`                            | `SkeletonStat`                                      |
| `StatusBadge`                             | `Badge` (`status` / `tone`)                         |
| `DialogConfirm` / `Dialog mode="confirm"` | `AlertDialog`                                       |

The full data-grid feature set (sort / search / column visibility / paging) is now built into the one `DataTable` (`@godxjp/ui/data-display`) — TanStack-powered, with the lean `data` + `columns` API for the common case and the compound parts (`DataTable.Search` / `.ViewOptions` / `.Pagination` …) for the rich chrome. The former separate data-grid subpath is gone: there is one `DataTable`.

---

## Consumer setup — theme is self-contained

The framework ships colors, the type scale, spacing, density and the component layers. Fonts are
opt-in (below). A consumer's entire styling surface is **one import + content sources**, with no
`:root` overrides and no font `<link>`.

### Without Tailwind

```ts
import "@godxjp/ui/styles.css"; // precompiled, no Tailwind needed
```

### With Tailwind v4

```css
/* resources/css/app.css */
@import "@godxjp/ui/styles"; /* unchanged */
@source "../js/**/*.{ts,tsx}";
@source "../views";
```

### Fonts (opt-in since v32)

The styles entry no longer bundles any font. Install the families you want and import the font
sheet after the styles import; the GoDX preset does this for you:

```bash
pnpm add @fontsource/noto-sans-jp @fontsource/m-plus-2
```

```css
@import "@godxjp/ui/styles/fonts"; /* after the styles import */
```

Skip it to use your own face or a system stack: name it with `--font-sans-base` (see
[docs/CUSTOMER-THEMING.md](docs/CUSTOMER-THEMING.md)).

> **Do not cherry-pick `*-layout.css` files.** Layers depend on each other (a Select's rows, a
> menu's surface, a form's rhythm live in shared rules) and a missing layer fails silently: menus
> render with no background, rows with no height. The runtime `visual-audit` flags a page whose
> layers are incomplete (`css-layers-missing`). The one supported way to ship LESS than the full
> styles entry is `prune-css` below: it slices along the dependency graph the package ships, so it
> cannot forget a layer the way a hand-picked list does.

### prune-css — ship only the component layers you use (gh#971)

The styles entry carries every component's layers. If that weight matters, let the package slice it:

```bash
npx godxjp-ui prune-css resources/js --out resources/css/godx-ui.css
```

It scans your sources for `@godxjp/ui` imports, resolves the CSS layer dependency closure from the
graph shipped in `dist/styles/layers.json` (what each component's internals render is part of the
graph — a `DataTable` still gets its dropdown and pagination surfaces), and emits a file that
imports the foundation plus only the needed layers, in `styles/index.css`'s exact order. Import
that file INSTEAD of `@godxjp/ui/styles`. The sonner / react-day-picker vendor sheets come along
only when a used component renders them. **Re-run it whenever the set of components you use
changes and after every upgrade** — the emitted header says so, and the tool refuses to run against
a manifest from a different package version.

## Golden ratio (φ ≈ 1.618)

One token `--phi-unit` drives page/section/card spacing; micro control gaps use the 4px grid. Density (`compact` | `default` | `comfortable`) retunes `--phi-unit` with control + table heights together.

| App API                           | φ level             |
| --------------------------------- | ------------------- |
| `<Flex direction="col" gap="md">` | φ⁰ (default)        |
| `<Flex direction="col" gap="lg">` | φ¹                  |
| `<Flex direction="col" gap="xl">` | φ²                  |
| Card shell / footer               | base × φ / base ÷ φ |

---

## Working on the framework

```bash
pnpm preview          # preview app → http://localhost:6008 (fixed port, kills stale)
pnpm typecheck && pnpm lint && pnpm run audit          # the cheap gates — run these freely
pnpm vitest run src/components/<group>/__tests__ --maxWorkers=2   # ONLY what you touched

# Heavy — CI's job. Run locally AT MOST ONCE, right before opening a PR, and never
# with other agents working on the same machine: `verify` builds the library AND the
# preview site AND runs all 506 test files. Measured with agents in parallel: 70 vitest
# workers, load average 90, an overheating laptop.
pnpm preview:build    # static build — also what deploys to GitHub Pages
pnpm verify           # typecheck · lint · format · the 5 guards · FULL suite
pnpm release --ui <patch|minor|major> --mcp <…|skip>   # publish lib + MCP in lockstep
```

**Five CI guards** (wired into `verify` / `verify:release`) keep the library honest:

| Guard                   | Enforces                                                             |
| ----------------------- | -------------------------------------------------------------------- |
| `check:prop-vocabulary` | every public `*Prop` field maps to the registry (no ad-hoc props)    |
| `check:token-tiers`     | 3-tier tokens; no domain/raw-palette tokens in component CSS         |
| `check:mcp-sync`        | every MCP catalog entry is a real export (no stale agent guidance)   |
| `check:mcp-orphans`     | every public component HAS a catalog entry (catalog can't rot)       |
| `check:core-isolation`  | the root export pulls no foreign runtime (adapters stay on subpaths) |

### Runtime visual audit (Playwright)

`scripts/visual-audit.mjs` drives a **real browser** over a running app and runs computed-style heuristics (target size, OKLCH accent chroma, rendered emoji, mis-laid-out alerts) — catching what the static `pnpm audit` (source regexes) can't see. Playwright + `@axe-core/playwright` are **optional peers**, installed only by apps that run the audit.

```bash
# from a consumer, against its running dev/preview server:
node node_modules/@godxjp/ui/scripts/visual-audit.mjs http://localhost:5173 /invoices /settings
node node_modules/@godxjp/ui/scripts/visual-audit.mjs http://localhost:5173 --format json  # machine-readable
node node_modules/@godxjp/ui/scripts/visual-audit.mjs --strict http://localhost:5173       # CI gate
```

**Tested peer range** (pin one of these): `playwright >=1.55 <2` (tested 1.61.1)

`--format json` **always** emits valid JSON — even on bootstrap failure — with a `status` (`ok` · `partial` · `error`) that separates **infrastructure errors** (missing peers, page won't load, axe won't inject → `errors[]`, `summary: null`/flagged) from **product findings** (`findings[]`). A tool failure can therefore never be misread as "zero violations". `pnpm check:visual-audit` is the CI smoke test: it serves a fixture page tripping all five rule families and asserts each one fires.

This repo ships two packages — `@godxjp/ui` (this dir) and `@godxjp/ui-mcp` (`mcp/`). They keep separate version lines but release together via `pnpm release`; see DEVELOPMENT.md §6. The **preview app auto-deploys to [GitHub Pages](https://godx-jp.github.io/godxjp-ui/)** on every push to `main` (`.github/workflows/preview-pages.yml`) — which doubles as the CI gate for `preview:build`.

→ **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** is the contributor guideline (the boundary, the layers, how to add/extend a component, verification).

## Docs index

- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) — contributor guideline (start here to edit the package)
- [docs/STANDARDS-vocabulary-tokens.md](./docs/STANDARDS-vocabulary-tokens.md) — the 22 vocabulary + token rules (CI-enforced)
- [docs/COMPONENTS.md](./docs/COMPONENTS.md) · [docs/TOKENS.md](./docs/TOKENS.md) · [docs/SPACING.md](./docs/SPACING.md)
- [docs/PROPS-VOCABULARY.md](./docs/PROPS-VOCABULARY.md) · [docs/PROPS-REGISTRY.md](./docs/PROPS-REGISTRY.md)
- [docs/DATETIME.md](./docs/DATETIME.md) · [docs/FORMS.md](./docs/FORMS.md) · [docs/TESTING.md](./docs/TESTING.md)
- MCP: **godxjp-ui-mcp** (`.mcp.json`) — live catalog for agents
