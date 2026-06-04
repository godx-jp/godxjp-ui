# ADR-004: Preview spacing + realistic examples strategy (judge decision)

## Status

decided

## Context

- Two asks in `debate/preview-spacing-real-examples/00-Topic.md:14-43` remain: (1) eliminate raw/ad-hoc spacing in overview and demo shells, and (2) replace sparse component-only examples with realistic "real screen" usage.
- The preview examples are explicitly constrained to `@godxjp/ui` components and existing `snapshot` whitelist (`snapshot.md:2-3`) and deployed through `preview:build` (`.github/workflows/preview-pages.yml:28-33` as cited in `01-Bus.md:r1 SKEPTIC`).
- Current spacing/rendering debt is in shared preview chrome, not isolated to one example (`preview/src/App.tsx:256-343`, `preview/src/demo-block.tsx:27-67`, `preview/src/preview.css:331-365`, and `preview/src/preview.css:948-966` from `02-Research` notes).

## Options Considered

- **POLISH**: keep architecture, replace raw margin wrappers in overview/demo shell with primitives, enrich current `*.preview.tsx` in place.
- **RECIPES**: keep existing shell and add dedicated realistic scenario screens composed from existing components.
- **SYSTEMATIZE**: shared fixture layer + shared shell + import guard/CI gate to enforce `@godxjp/ui`-only examples at scale.

## Decision

- **Primary decision: blended winner — RECIPES + minimal SYSTEMATIZE + existing POLISH spacing rhythm.**
- Use RECIPES as the visible output strategy because it maps directly to the user's “real screen” requirement, while borrowing POLISH’s minimal spacing surgery in the existing chrome and adding only a narrow SYSTEMATIZE-style import guard.
- Keep architecture changes small: no preview framework rewrite, no full fixture rewrite, no global enforcement expansion beyond imports and preview shell.

## Rubric & Scoring

Scoring uses the same weighted criteria from `00-Topic.md` (30/20/20/15/15).

| Criterion                    |                                                                                                                        POLISH |                                                                                                  RECIPES |                                                                                                             SYSTEMATIZE |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------: | ----------------------------------------------------------------------------------------------------------------------: |
| Fixes both asks (30)         | 24 — fixes spacing and can enrich current examples, but realism remains incremental and less explicit than dedicated screens. | 28 — directly satisfies both asks by adding scenario galleries and shared spacing migration in one pass. | 26 — spacing and realism are possible, but the proposed shell/fixture shift is less directly user-visible than RECIPES. |
| Constraint adherence (20)    |                                                 12 — does not add explicit enforceability; relies on discipline in all files. |                     13 — keeps whitelist by construction in new scenarios but no hard guard in baseline. |                                                19 — provides strongest enforcement mechanism for anti-`chế cháo` drift. |
| Teaching value (20)          |                                                         14 — useful, but still close to component-level demos in many places. |                                      19 — high, because users immediately see production-like workflows. |                15 — good once fixtures/shell are established, but lower immediate clarity than scenario-first approach. |
| Effort / deliverability (15) |                                                                                              15 — smallest and quickest pass. |                                   12 — moderate, requires additional screens plus existing spacing work. |                                                                           8 — highest refactor/ops cost in first cycle. |
| Maintainability (15)         |                                                           11 — better than status quo but manual consistency likely to drift. |                                             14 — good if backed by light guardrails and shared fixtures. |                                                             14 — strong long-term control if guard is scoped correctly. |
| **Weighted total**           |                                                                                                                  **76 / 100** |                                                                                             **86 / 100** |                                                                                                            **82 / 100** |

Winner: **RECIPES (hybrid blend, +10 over POLISH; +4 over raw SYSTEMATIZE on immediate fit)**.

## Consequences

- Adds new scenario screen surface area for teaching value and realistic consumption paths.
- Keeps risk manageable by not forcing a full framework/fixture migration.
- Maintains compatibility with existing preview architecture and reduces chance of `preview:build` regressions by still retaining existing file discovery and build behavior.

## Dissent

- A stricter SYSTEMATIZE-only path offers stronger anti-rot controls but is heavier than needed for immediate user pain, and creates a higher one-cycle delivery cost.
- A pure POLISH path is fastest but under-delivers the explicit “real screens” ask and remains weak on long-term discipline.

## EXECUTION PLAN

### 1) Exact spacing replacement (primitives over raw margins)

#### `preview/src/App.tsx`

- Replace current fixed overview/story doc wrappers at `App.tsx:256-335`:
  - Replace static `<article className="doc-page">`, `<div className="preview-example-page">`, and fixed header/footer layout wrappers with:
    - `<PageContainer>` as canonical page shell.
    - `<Stack gap="xl">` for section rhythm.
    - `<Card><CardHeader/><CardContent>` blocks around story and metadata sections.
    - `<Inline gap="md">` for compact action rows.
    - `<ResponsiveGrid columns={1|2|3}>` for KPI / card clusters.
  - Remove dependency on ad-hoc margin/padding class names at this call-site.

#### `preview/src/demo-block.tsx`

- Replace shell-level spacing in `demo-block.tsx:27-67`:
  - Replace fixed frame container and footer wrappers driven by bespoke classes/styles with:
    - `<Card>` + `<CardContent>` wrapper.
    - top-level `<Stack gap="lg">` around title row, example body, and footer/action row.
    - `<Inline gap="sm|md">` for button groups.
  - Keep semantics of “source / code / rendered output” tabs if present; only swap container rhythm to primitive spacing.

#### CSS cleanup

- Treat `preview/src/preview.css` spacing rules as progressively retired for overview-level rhythm:
  - Stop using `preview.css` for page-to-page block spacing in the cited blocks (`331-365`, `948-966`) and leave only utility styles not related to layout rhythm.
  - Keep style support for typography and non-layout tokens only.

### 2) Scenario screens to build (existing components only)

Place under `examples/scenarios/`:

- `examples/scenarios/SignIn.preview.tsx`
  - Uses: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Stack`, `Inline`, `Input`, `PasswordInput`, `Checkbox`, `Button`, `Separator`, `Alert`, `PageContainer`.
- `examples/scenarios/SettingsProfile.preview.tsx`
  - Uses: `PageContainer`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `FormField`, `Input`, `Select`, `Switch`, `ToggleGroup`, `Button`, `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Separator`, `Stack`, `Inline`.
- `examples/scenarios/InvoiceOrdersTable.preview.tsx`
  - Uses: `PageContainer`, `FilterBar`, `FilterGroup`, `SearchInput`, `Select`, `Input`, `DataTable`, `DataTable.Toolbar`, `DataTable.Content`, `Badge`, `Button`, `Table`, `Card`, `CardHeader`, `CardContent`, `Timeline`, `Descriptions`, `Pagination`, `Stack`, `Inline`.
- `examples/scenarios/Dashboard.preview.tsx`
  - Uses: `AppShell`, `Sidebar`, `Topbar`, `PageContainer`, `SplitPane`, `ResponsiveGrid`, `StatCard`, `Timeline`, `DataTable`, `Card`, `Progress`, `Badge`, `Button`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Stack`, `Inline`.
- `examples/scenarios/Profile.preview.tsx`
  - Uses: `PageContainer`, `Card`, `CardHeader`, `CardContent`, `Avatar`, `AvatarImage`, `AvatarFallback`, `Descriptions`, `Timeline`, `Badge`, `Stack`, `Inline`, `Button`.

### 3) Real-image strategy (license + offline-safe)

- Source image references to be set in `examples/fixtures/demo-content.ts` as stable seed URLs:
  - Use Unsplash ecosystem / Picsum-derived links with fixed seeds (neutral, non-brand):
    - `https://picsum.photos/seed/godxjp-profile/96/96`
    - `https://picsum.photos/seed/godxjp-profile-banner/1200/420`
    - `https://picsum.photos/seed/godxjp-invoice/960/420`
- For Pages/offline stability: add local fallback assets copied once into `examples/fixtures/assets/` and load through helper `resolveDemoImage(seedKey)` that returns local fallback if remote fetch is unavailable at runtime.
- This preserves neutrality and avoids domain-specific branding while preventing flaky remote-only rendering.

### 4) Import guard decision and scope

- **Add guard** (narrow, explicit, anti-false-positive):
  - Scope: only files matching `examples/**/*.preview.tsx`.
  - Allowed imports:
    - `react`, `react/jsx-runtime`
    - `@godxjp/ui/*`
    - `lucide-react` (explicit icon allow-list)
    - `examples/fixtures/**` and `examples/fixtures/**/*.ts(x)` (data/config).
  - Forbidden imports:
    - Relative imports to local component code outside fixtures (e.g., `../../src/components/...`, `../layout/...`, `../src/...`).
    - Imports from local example helper components that are not in fixtures.
  - Why this avoids false positives:
    - Intrinsic tags like `<section>`, `<a>`, `<img>` are JSX primitives and not import declarations.
    - Icon imports from `lucide-react` are explicitly allowed to prevent existing legitimate usage breakage.
- Keep guard implementation as a targeted AST parse check (or equivalent parser-aware lint task) in a preview-only script; no blanket text regex over JSX.

### 5) `preview:build` in verify gates

- Yes: wire `pnpm preview:build` into both:
  - `verify` and `verify:release`.
- Rationale:
  - Ensures compile/rename breakage is caught in every local CI path, not only Pages deploy.
  - Combined with the import guard, this is the durable fix for SKEPTIC point (c): build breakage from component renames is then caught before release, regardless of option.

### 6) Directory layout for new examples

- Add:
  - `examples/fixtures/` (extend existing `demo-content.ts`, add optional `assets/` fallback images)
  - `examples/scenarios/` (new real-screen galleries listed above)
- Keep existing:
  - `examples/layout/` and `examples/data-display/` files intact and optionally adopt spacing recipe in-place as they evolve.

## SKEPTIC RULINGS (required)

1. **Import guard false-positive on `<section>`/`<a>`/`<img>`/`lucide-react`**
   - `<section>`, `<a>`, `<img>` are JSX intrinsic elements and unaffected if guard inspects imports only.
   - `lucide-react` must be explicitly allow-listed; otherwise current examples in `layout/Sidebar.preview.tsx`, `screens/AgentPortal.preview.tsx`, and `data-display/Card.preview.tsx` (as reported in `01-Bus.md`) will fail incorrectly.
2. **Real images and OFFLINE/flaky risk**
   - Use fixed-seed Picsum/Unsplash-style links for realism and neutrality, but never render exclusively from remote URLs in production docs.
   - Add local fallback assets in fixtures; remote URLs remain canonical seed references.
3. **Scenario rot on rename + verify/verify:release**
   - Real-screen count increases breakage surface; that risk is real.
   - `pnpm preview:build` in both `verify` and `verify:release` is necessary and materially effective.
   - It is not sufficient alone for anti-pattern prevention; import guard + shared fixture references are needed for durability.
