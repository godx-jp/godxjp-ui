# @godxjp/ui — agent guide

> Professional UI framework for the godx system. React 19 +
> TypeScript strict + Tailwind v4 + shadcn-style + Radix
> primitives. Version 3.0.0.

This file is the **agent-facing service map** for the
`@godxjp/ui` submodule. Read this first whenever you are editing
inside `libs/ts/godxjp-ui/`.

## ⛔ STOP — read these binding rules first

Two layers of binding rules apply. Framework-internal concepts
(theme axes, the consumer contract, …) live in this submodule's
own [`new-docs/`](./new-docs/). Umbrella-platform concerns
(monorepo layout, submodule + CI wiring, service naming, …) live
in the umbrella's [`new-docs/`](../../../new-docs/). Read the
framework's own first; the umbrella's second.

| Trigger | Required reading |
|---------|------------------|
| **Add / rename a `data-*` attribute on `<html>` that re-binds design tokens; add a user preference toggle (theme / accent / density / font-size / new axis)** | [`./new-docs/01-theme-axes.md`](./new-docs/01-theme-axes.md) |
| **Build any feature that consumes the framework (or audit one); change `theme.css`, ESLint / Prettier / TS configs in a consumer; need a primitive that does not exist; add a `className` for visual styling** | [`./new-docs/02-consumer-contract.md`](./new-docs/02-consumer-contract.md) |
| Editing any source file inside this submodule | [`./CLAUDE.md`](./CLAUDE.md) (20 cardinal framework rules) |
| Layout / monorepo position | [`../../../new-docs/05-monorepo-layout.md`](../../../new-docs/05-monorepo-layout.md) |
| README + AGENTS skeleton | [`../../../new-docs/07-service-readme.md`](../../../new-docs/07-service-readme.md) + [`../../../new-docs/08-service-agents-md.md`](../../../new-docs/08-service-agents-md.md) |
| `docs/` Diátaxis tree | [`../../../new-docs/09-service-docs.md`](../../../new-docs/09-service-docs.md) §Library docs |
| Doc deduplication (DRY) | [`../../../new-docs/10-doc-deduplication.md`](../../../new-docs/10-doc-deduplication.md) |
| Branch + PR + CI workflow | [`../../../new-docs/11-workflow-branching.md`](../../../new-docs/11-workflow-branching.md) |
| Monorepo-platform wiring of consumer frontends (pnpm workspace, submodule pin, extraction invariant, Renovate, CI gates) | [`../../../new-docs/12-frontend-architecture.md`](../../../new-docs/12-frontend-architecture.md) — umbrella scope; framework consumer contract lives in [`./new-docs/02-consumer-contract.md`](./new-docs/02-consumer-contract.md) |

There is no "small exception". International-standard means every
change conforms.

## What this package is

`@godxjp/ui` is THE UI framework for godx — services consume its
defaults zero-config; they only write a `theme.css` if they
genuinely need to override tokens. See
[`README.md`](./README.md) for the public-facing intro.

This submodule lives at `libs/ts/godxjp-ui/` in the umbrella;
source-of-truth upstream is `github.com/godx-jp/godxjp-ui` on the
`main` branch. The umbrella tracks a SHA pin via `.gitmodules`.

## Package map

```
libs/ts/godxjp-ui/
├── README.md                       # framework landing page
├── AGENTS.md                       # this file
├── CLAUDE.md                       # cardinal rules for editing this package
├── BRAND.md                        # godx visual language
├── CHANGELOG.md                    # SemVer change log (Keep a Changelog 1.1.0)
├── package.json                    # version 3.0.0; exports surface
├── tsconfig.json
├── tsup.config.ts                  # ESM bundler config
├── vitest.config.ts                # test runner
├── config/                         # zero-config presets for consumers
│   ├── eslint.js                   # @godxjp/ui/eslint-config
│   ├── prettier.cjs                # @godxjp/ui/prettier-config
│   ├── tsconfig.base.json          # @godxjp/ui/tsconfig
│   └── vitest.base.ts              # @godxjp/ui/vitest-config
├── src/
│   ├── index.ts                    # main barrel — primitives + data + i18n
│   ├── components/
│   │   ├── primitives/             # 23 primitives (Button, Dialog, …)
│   │   ├── shell/                  # AppShell, Sidebar, Topbar, …
│   │   └── screens/                # DashboardScreen, PlansScreen, …
│   ├── hooks/                      # useTweaks, …
│   ├── i18n/
│   │   ├── index.ts                # initI18n() — global singleton
│   │   ├── locales/
│   │   │   ├── ja.ts               # canonical
│   │   │   ├── en.ts
│   │   │   ├── vi.ts
│   │   │   └── fil.ts              # added in v3.0.0
│   │   └── __tests__/locales.test.ts  # GDXUI-I-LOCALE-001
│   ├── tokens/                     # CSS source-of-truth
│   │   ├── tokens.css              # design tokens (CSS custom properties)
│   │   ├── tokens-ext.css          # extended tokens (motion, density, surfaces)
│   │   ├── tailwind.css            # consumer's ONE CSS entry
│   │   └── sonner.css              # toast-specific tokens
│   └── data/
│       └── products.ts             # tenant catalog
├── stories/                        # Storybook 8.x — MANDATORY (see below)
│   ├── primitives/                 # one .stories.tsx per primitive
│   ├── shell/                      # one per shell composition
│   └── screens/                    # one per screen recipe
├── docs/                           # Diátaxis tree per new-docs/09 §Library docs
│   ├── README.md                   # 2×2 grid index
│   ├── tutorials/                  # 01-getting-started, 02-theming, …
│   ├── how-to/                     # override-tokens, compose-shell, contribute-primitive, customize-theme, …
│   ├── reference/                  # primitives/, shell/, hooks/, tokens.md, exports.md, …
│   ├── explanation/                # design-philosophy, architecture, accessibility, …
│   └── adr/                        # 0001-radix-as-foundation, …
├── design/                         # design source (Sketch / Figma exports, brand sources)
└── dist/                           # build output — gitignored
```

## Where things live

| What | Path |
|---|---|
| Source-of-truth tokens | `src/styles/theme.css` + `src/styles/shell.css` |
| Tailwind v4 theme map | `src/tokens/tailwind.css` (single consumer entry) |
| Primitives barrel | `src/components/primitives.ts` (single barrel file — group sources under `src/components/<group>/<Name>.tsx` per cardinal rule 27) |
| Shell barrel | `src/components/shell/index.ts` |
| Composites barrel | `src/components/composites/index.ts` |
| Main barrel | `src/index.ts` |
| i18n init | `src/i18n/index.ts::initI18n()` |
| Public exports surface | `package.json::exports` |
| Storybook config | `.storybook/main.ts` + `.storybook/preview.ts` |
| Storybook stories | `src/stories/<group>/<Name>.stories.tsx` |
| Docs (Diátaxis) | `docs/` |
| Changelog | `CHANGELOG.md` |

## Topic homes (no duplication)

Per [umbrella rule 10](../../../new-docs/10-doc-deduplication.md):

| Topic | Home |
|---|---|
| What the package is | [`README.md`](./README.md) |
| **Theme axes** (theme / accent / density / font-size + cascade layering) | [`./new-docs/01-theme-axes.md`](./new-docs/01-theme-axes.md) |
| **Consumer contract** (mandatory consumption, no-className-for-visual, search-first, folder shape, service-layer + TanStack Query, i18n bootstrap, config inheritance, primitive extension) | [`./new-docs/02-consumer-contract.md`](./new-docs/02-consumer-contract.md) |
| Per-primitive API | `docs/reference/primitives/<Name>.md` |
| Per-shell-component API | `docs/reference/shell/<Name>.md` |
| Per-hook API | `docs/reference/hooks/<Name>.md` |
| Every CSS token | `docs/reference/tokens.md` |
| i18n keys + fallback | `docs/reference/i18n.md` |
| Every export entry | `docs/reference/exports.md` |
| Design philosophy | `docs/explanation/design-philosophy.md` |
| WCAG 2.1 AA approach | `docs/explanation/accessibility.md` |
| Versioning policy | `docs/explanation/versioning.md` |
| Brand bible | [`BRAND.md`](./BRAND.md) (referenced from `docs/explanation/brand-bible.md`) |
| Change log | [`CHANGELOG.md`](./CHANGELOG.md) |
| Architecture decisions | `docs/adr/` |

## Storybook is MANDATORY

**Every primitive + shell composition + screen has a story.**
Every create, edit, or delete of a component carries a Storybook
update in the SAME PR. CI fails any PR that lands a component
change without the corresponding `stories/<kind>/<Name>.stories.tsx`
add / edit / delete.

The rule is binding for three reasons:

1. **Visual regression** — stories are the Playwright snapshot
   targets. A primitive without a story has no regression net.
2. **Documentation parity** — `docs/reference/primitives/<Name>.md`
   shows code; the story shows the rendered result. Both must
   exist for a primitive to be considered shipped.
3. **Discoverability** — consumers (operator + agent) browse the
   Storybook deploy at `https://godxjp-ui.<publicDomain>/storybook/`
   (or local at `pnpm run storybook`).

### When you create a primitive

1. Add `src/components/<group>/<Name>.tsx` (group ∈ general /
   layout / data-display / data-entry / feedback / navigation per
   cardinal rule 27).
2. Add the canonical CSS class to `src/styles/theme.css` or
   `src/styles/shell.css` (no per-primitive `.css` files —
   tokens-first per rules 2 + 15).
3. Re-export from `src/components/primitives.ts` (the single
   barrel file).
4. Add `docs/reference/primitives/<Name>.md` (Diátaxis reference
   per [new-docs/09 §Library docs](../../../new-docs/09-service-docs.md)).
5. **Add `src/stories/<group>/<Name>.stories.tsx`** — covers
   every variant + state (default, hover, active, focused,
   disabled, loading, error). Both light and dark theme.
6. Update `CHANGELOG.md` under `## Unreleased / ### Added`.
7. Bump version per SemVer (new primitive = minor bump).

### When you edit a primitive

1. Modify `src/components/<group>/<Name>.tsx`.
2. Update `docs/reference/primitives/<Name>.md` (prop table /
   variants / a11y notes must reflect the change).
3. **Update `src/stories/<group>/<Name>.stories.tsx`** (new
   variant → new story; renamed prop → updated story).
4. Update `CHANGELOG.md`. Bump per SemVer:
   - Breaking change → major.
   - New prop with default → minor.
   - Bug fix → patch.

### When you delete a primitive

1. Mark deprecated in `package.json::exports` for one major
   version (export the legacy name pointing at the new one).
2. Delete `src/components/<group>/<Name>.tsx`.
3. Delete `docs/reference/primitives/<Name>.md`.
4. **Delete `src/stories/<group>/<Name>.stories.tsx`.**
5. Remove the re-export from `src/components/primitives.ts`.
6. Document removal in `CHANGELOG.md / ### Removed`.
7. Bump major version.

### Story template (canonical)

```tsx
// src/stories/<group>/<Name>.stories.tsx
import type { Meta, StoryObj } from "@storybook/react"
import { <Name> } from "../../components/<group>/<Name>"

const meta: Meta<typeof <Name>> = {
  title: "<Group>/<Name>",
  component: <Name>,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "One-sentence purpose — same as docs/reference/primitives/<Name>.md.",
      },
    },
    a11y: { config: { rules: [] } },
  },
  tags: ["autodocs"],
}
export default meta
type Story = StoryObj<typeof <Name>>

export const Default: Story = { args: { …minimal-required-props } }
export const Variants: Story = { args: { …another-variant } }
export const Disabled: Story = { args: { …, disabled: true } }
export const Loading: Story = { args: { …, loading: true } }
export const Dark: Story = {
  args: { …Default.args },
  parameters: { backgrounds: { default: "dark" }, themes: { themeOverride: "dark" } },
}
```

### Storybook config files

- `.storybook/main.ts` — addons (a11y, themes, viewports,
  controls, docs).
- `.storybook/preview.tsx` — global decorators wiring the four
  canonical theme axes ([`new-docs/01-theme-axes.md`](./new-docs/01-theme-axes.md))
  as toolbar globals: **theme** (light/dark), **accent** /
  Color theme (blue/green/violet/amber/rose/slate), **density**
  (compact/default/comfortable), **font-size** (sm/base/lg/xl).
  Calls `initI18n()` at module load so locale switching works
  without re-init. NO tenant toolbar — `data-tenant` was removed
  in favour of `data-accent`.
- `.storybook/manager.ts` — branded sidebar logo + colours.

Storybook runs with:
- `pnpm run storybook` — local dev.
- `pnpm run storybook:build` — static deploy artefact.
- `pnpm run storybook:test` — Playwright snapshot test (CI).

### Storybook gotchas

Lessons captured from real regressions. Skim before authoring a
new primitive root class or adding `play` functions.

#### Tailwind v4 utility class name collisions

Tailwind v4 ships a fixed catalogue of utility class names —
`collapse`, `block`, `flex`, `grid`, `hidden`, `visible`,
`static`, `fixed`, `absolute`, `relative`, `sticky`, `table`,
`contents`, `list-item`, `inline`, `inline-block`, `inline-flex`,
`inline-grid` — that ALL live in `@layer utilities`. Tailwind's
utility layer wins the cascade against `.<name>` rules declared
outside `@layer utilities` (which is where our `shell.css` lives).

If a primitive root class collides, the utility silently
re-binds the property:

- `<div class="collapse">` → `visibility: collapse` →
  the entire subtree becomes invisible via inherited
  `visibility: collapse`.
- `<div class="hidden">` → `display: none`.
- `<div class="static">` → `position: static` (overrides the
  primitive's intended `relative` / `absolute`).

The fix is renaming, not specificity. Use a non-colliding root
class — convention is `<name>-root` (matches the per-region
pattern `<name>-header`, `<name>-body`, …):

```css
/* WRONG — collides with Tailwind utility */
.collapse { display: flex; flex-direction: column; }

/* RIGHT — Tailwind has no `.<thing>-root` utility */
.collapse-root { display: flex; flex-direction: column; }
```

Before naming a new primitive's root class, grep the Tailwind v4
utility catalogue (or just try the class in a JSX `className=""`
and inspect the computed style — if Tailwind owns it, the
computed value won't match your CSS).

#### Storybook 10 `play` function API — easy gotchas

Today's stories don't use `play`. When we add interaction or
assertion checks, get these right or vitest fails in confusing
ways:

- `canvas`, `userEvent`, `canvasElement` come from **play
  arguments**, NOT imports:
  `async ({ canvas, userEvent, canvasElement }) => { … }`. Never
  `import { userEvent } from 'storybook/test'`; never write
  `const canvas = within(canvasElement)` — both are provided.
- `expect`, `waitFor` come from `'storybook/test'` — import
  those.
- `within` is only for portal queries against the OUTER document
  (e.g. `within(canvasElement.ownerDocument.body).findByTestId(…)`).
  Do not use it for content rendered inside the canvas.
- Portal stories: if a primitive renders to `document.body`
  (Dialog, Sheet, AlertDialog, Popover, DropdownMenu, Tooltip),
  query the portaled content through
  `canvasElement.ownerDocument.body`, not `canvas`.

#### `getComputedStyle` smoke check (when a play is justified)

Per cardinal rule 22, design-canon literals are token-pinned.
A `getComputedStyle` assert inside a `play` catches silent token
regressions that `toBeVisible` doesn't notice:

```tsx
export const Default: Story = {
  args: { children: "Order" },
  play: async ({ canvas }) => {
    const btn = canvas.getByRole("button", { name: /order/i });
    // `--primary` at default accent=blue resolves to oklch(56% 0.13 246)
    // — fails if the token chain regressed or the CSS import broke.
    await expect(getComputedStyle(btn).backgroundColor)
      .toBe("oklch(0.56 0.13 246)");
  },
};
```

Use sparingly. One per primitive is enough; chaining `getComputedStyle`
asserts across every variant duplicates the Playwright probe
([`./.claude/skills/new-godx-design-to-component/SKILL.md`](./.claude/skills/new-godx-design-to-component/SKILL.md)
§Step 9) without adding signal.

#### Skip `play` for variant-only stories

A `play` is worth writing only when it asserts something the
render alone doesn't prove. Skip for stories that just swap
`args` (size / variant / color sweeps) — the render itself
already fails if the component throws or doesn't mount.
Naked `await expect(canvas.getByRole('button')).toBeVisible()`
adds zero signal.

## Common tasks

### Add a new primitive
See "When you create a primitive" above. Follow the full
6-step process; CI rejects partial submissions.

### Override or extend a token
1. Edit `src/styles/theme.css` (canonical tokens) or
   `src/styles/shell.css` (shell-extension tokens).
2. Update `docs/reference/tokens.md`.
3. Update the Tailwind theme map in `src/tokens/tailwind.css`
   if a new utility class should resolve the token.
4. Add a story variant that demonstrates the token visually.
5. Changelog + SemVer bump.

### Add a locale
1. Add `src/i18n/locales/<bcp47>.ts`.
2. Update `SUPPORTED_LOCALES` in `src/i18n/index.ts`.
3. Update `src/i18n/__tests__/locales.test.ts` to assert key
   parity.
4. Update `docs/reference/i18n.md`.
5. Update `docs/how-to/add-locale.md` with the new locale's
   metadata (RTL? plural rules?).
6. Changelog + minor SemVer bump.

### Change the public API surface
1. Edit `src/index.ts` (or sub-barrel).
2. Update `package.json::exports`.
3. Update `docs/reference/exports.md`.
4. Update `docs/reference/types.md`.
5. **If breaking, write a migration entry** in `CHANGELOG.md`
   under the major-bump section.
6. Add a `docs/how-to/migrate-from-v<N-1>.md` if not present.
7. SemVer major.

### Bump a major version
1. Update `package.json::version`.
2. Write a substantive `CHANGELOG.md` entry: `### Added`,
   `### Changed`, `### Removed`, with migration steps.
3. Update every `library_version:` front-matter in `docs/` if
   the docs reference is version-specific.
4. Add `docs/how-to/migrate-from-v<N-1>.md`.
5. Open a major-bump PR with the breaking-change rationale.

## What NOT to touch

- **Public API surface** in `package.json::exports` without an
  ADR. Adding an export is fine (minor). Removing or renaming is
  a major.
- **Default token values** in `src/styles/theme.css` without
  visual review. A consumer's existing UI may shift.
- **The Tailwind theme map** in `src/tokens/tailwind.css` —
  break the consumer's utility classes.
- **`i18n` base dictionary** — services extend with
  `addResourceBundle`; the base is shared.
- **Storybook config** — global decorators affect every story.
- **`src/tokens/tailwind.css` block comments** — Tailwind v4
  doesn't support nested `/* ... */` inside `@theme`. Use
  single-line `// ...` (jsdoc-like) outside @theme blocks.

## Verification before commit

```bash
cd libs/ts/godxjp-ui

# Build
pnpm install
pnpm run build           # ESM + DTS, must succeed
pnpm type-check          # 0 errors

# Tests
pnpm test                # Vitest — must pass

# Storybook
pnpm run storybook:build # static build must succeed
pnpm run storybook:test  # Playwright snapshots green

# A11y
pnpm run a11y            # axe-core in every story

# Lint (consumer-facing presets)
pnpm exec eslint --max-warnings 0 src/
pnpm exec prettier --check src/ stories/ docs/

# Lockfile parity (root of umbrella)
cd /home/satoshi/famgia/admin
pnpm install --frozen-lockfile
```

All must be green. The umbrella CI runs the same. `--no-verify`
is forbidden.

## Workflow per umbrella rule 11

1. Branch in submodule: `git checkout -b feat/<scope>` (or
   `fix/<scope>`).
2. Land changes per "Common tasks" above.
3. Commit with conventional-commits format:
   `feat(primitives): add ColorPicker primitive`.
4. Push the submodule branch + open a PR on
   `github.com/godx-jp/godxjp-ui`.
5. CI green (build + test + Storybook + a11y) required.
6. Merge to submodule `main` (squash).
7. Bump the umbrella pin:
   ```bash
   cd /home/satoshi/famgia/admin
   git -C libs/ts/godxjp-ui pull --ff-only origin main
   git add libs/ts/godxjp-ui
   git commit -m "chore(godxjp-ui): bump pointer to <sha> — <what>"
   git push origin dev
   ```

The submodule PR + the umbrella pin bump are TWO separate PRs.
Never push a pin to a SHA that doesn't exist on the submodule
remote.

## Concept-first API recipe (cardinal rule 23)

**Before writing a new primitive's prop signature, run this
checklist.** Cardinal rule 23 (`./CLAUDE.md` §23) carries the
binding form; this section is the practical recipe.

### Step 1 — Deep-research before authoring

Pre-flight grep (must run before writing the first line):

```bash
# Does this concept already exist under a different name?
grep -rln "export (function|const) <CandidateName>" src/components/
grep -rln "export interface <CandidateName>Props" src/components/

# Does a sibling primitive cover the same DOM shape?
ls src/components/{general,layout,data-display,data-entry,feedback,navigation}/  # Read peer .tsx files end-to-end.

# Is the primitive in the design canon?
ls design-handoff/ui-system/<latest>/project/preview/comp-*.html

# Is there a shadcn / Radix / React Aria recipe for this?
# (cardinal rule 14 — locked stack list at `./CLAUDE.md` §14)
```

If the primitive already exists → use it. If a peer covers 80% of
the shape → extend the peer with a variant prop, don't duplicate.
If the design canon doesn't show it → STOP, ask the user to mock
on Claude Design (cardinal rule 22).

### Step 2 — Match the shared prop vocabulary

Locked vocabulary table — match these names verbatim, don't coin
synonyms:

| Prop | Type | Examples |
|---|---|---|
| `size` | `"small" \| "default" \| "large"` (+ optional `"x-small"`/`"x-large"`) | Button, Input, Avatar, Tag, Badge, IconButton |
| `variant` | primitive-specific enum (Button: `"primary" \| "secondary" \| "ghost" \| "outline" \| "link"`; Badge: `"soft" \| "solid" \| "outline"`) | Button, Badge, Tag, Alert |
| `color` | `"primary" \| "success" \| "warning" \| "attention" \| "info" \| "destructive" \| "default"` | Tag, Badge, Alert, Dot |
| `tone` | `"default" \| "muted" \| "outline-only"` | Card |
| `accent` | semantic color enum (+ `"featured"` for full ring) | Card |
| `padding` | `"tight" \| "default" \| "cozy" \| "none"` | Card, Dialog (planned), Sheet (planned) |
| `disabled` / `loading` / `readOnly` / `required` | boolean | Forms |
| `prefix` / `suffix` / `addonBefore` / `addonAfter` | `ReactNode` | Input, Button |

**Forbidden synonyms** (reject at review):

- `scale` / `dimension` / `width` for `size`.
- `kind` / `style` / `look` / `appearance` for `variant`.
- `intent` / `tint` / `theme` / `status` for `color`.
- `compactness` / `spacing` / `dense` for `padding`.

### Step 3 — Separate every concept

A prop carries ONE concept. Forbidden conflations:

| Conflation | Fix |
|---|---|
| `kind="compact-success-soft"` | `size="small" color="success" variant="soft"` |
| `primary={true}` (boolean for variant) | `variant="primary"` |
| `error={true}` (boolean for status color) | `status="error"` / `color="destructive"` (boolean only for true/false state) |
| `large={true}` (boolean for size) | `size="large"` |

Self-check questions:

- "Does this prop encode ONE thing?" If two answers fit, split.
- "If I add a third value, does the name still read?" If not, split.
- "Can a user combine this with other props orthogonally?" If
  setting this prop forces other props, the concept is conflated.

### Step 4 — Check the token catalogue before adding

When the new primitive needs a value:

```bash
# Match against semantic tokens
grep -E "^\s*--(primary|background|foreground|card|border|ring|muted-foreground|success|warning|attention|info|destructive)" src/styles/theme.css

# Match against scale tokens
grep -E "^\s*--(text-|spacing-|density-|radius-|shadow-)" src/styles/theme.css

# Match against existing component-scope tokens
grep -E "^\s*--<component>-" src/styles/theme.css

# The full token catalogue is at:
#   new-docs/03-token-system.md
```

Decision tree:

1. Semantic role match? → use semantic token (`var(--primary)`,
   `var(--muted-foreground)`).
2. Scale value match at default density / base font-size? → use
   scale token (`var(--spacing-4)`, `var(--text-base)`).
3. Component-scope match? → use it.
4. None match AND value is in design canon? → add new
   component-scope token (`--<component>-<aspect>`) in
   `:root` of `src/styles/theme.css`.
5. None match AND value is NOT in design canon? → STOP, ask
   user to mock on Claude Design.

**Forbidden**: declaring `--button-bg-hover: oklch(58% 0.15 246)`
when `color-mix(in oklch, var(--primary) 90%, black)` derives it.
States derive via `color-mix`, not new tokens.

### Step 5 — Read the closest peer end-to-end

Before writing `<Name>.tsx`:

1. Open the most-similar peer primitive (`Button.tsx` for
   interactive, `Card.tsx` for surface containers,
   `Tag.tsx` for semantic-color displays, …).
2. Read its `.tsx` end-to-end. Note:
   - Prop interface shape (Omit\<…\>, defaults in destructure)
   - `forwardRef` pattern
   - `cn(…)` className composition
   - Variant → class lookup tables
   - Default values
3. Mirror the pattern. The new primitive's prop names + shape +
   className composition + ref forwarding must match the peer.

PR description must cite the peer ("modeled prop shape after
`Button.tsx`"); reviewers reject vague "looks reasonable".

### Anti-patterns audited at review

- Duplicate concept primitive (Pill vs Tag; KpiNumber vs
  Statistic; HBox vs Flex direction).
- New prop name that maps to an existing vocabulary entry under a
  different concept.
- New token re-encoding a value an existing token covers.
- Prop missing from the §B vocabulary table without a documented
  divergence in `docs/reference/primitives/<Name>.md`.
- `<Name>.tsx` written without reading the peer primitive
  end-to-end.

## Axes compliance recipe (cardinal rule 21)

**Every component supports all four theme axes** —
[`./new-docs/01-theme-axes.md`](./new-docs/01-theme-axes.md) defines
the axes; cardinal rule 21 binds it; this section is the
step-by-step recipe.

### Before you write a single line of CSS

Open the four axes in your head:

| Axis            | Values                                 | Tokens that flip                                                                                                              |
| --------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `data-theme`    | `light` / `dark`                       | `--background`, `--foreground`, `--card`, `--border`, `--popover`, `--muted-foreground`, `--surface-{1,2,3}`, every semantic color |
| `data-accent`   | `blue` / `green` / `violet` / `amber` / `rose` / `slate` | `--primary`, `--primary-foreground`, `--ring`, `--brand`, `--sidebar-active-bg`, `--sidebar-active-fg` |
| `data-density`  | `compact` / `default` / `comfortable`  | `--density-element`, `--density-card`, `--density-dialog`, `--density-page`, `--density-section`, `--header-height`, `--density-table-head` |
| `data-font-size`| `sm` / `base` / `lg` / `xl`            | `html` font-size (87.5% / 100% / 112.5% / 125%) → every `rem` token rescales                                                  |

### Token rules

1. **No hardcoded color literal in a `.tsx` `style={}` or a `.css`
   rule.** Reach for the semantic token (`var(--primary)`,
   `var(--muted-foreground)`, …) every time. If you need a tint,
   use `color-mix(in oklch, var(--primary) 14%, transparent)` —
   the chroma trail stays consistent across accent values.
2. **No hardcoded height for an interactive element.** Use
   `var(--density-element)` (button / input / picker height),
   `var(--density-card)` (card padding), `var(--header-height)`
   (top bar), etc. A 32px-pinned button breaks `compact` (28px)
   and `comfortable` (44px).
3. **Use rem, not px, for text + spacing the user should be able
   to scale.** Pixel literals freeze the size against the
   `data-font-size` axis. The only legitimate `px` literals:
   - `--touch-target-min: 44px` (WCAG floor — must NOT scale).
   - Hairline borders (`1px` — half-pixel rendering is jarring).
   - SVG `viewBox` / icon size attributes (these are physical
     drawing units, not user-scalable).
4. **`font-weight` from the locked three only**: 400 / 500 / 700.
   No 300 (kana strokes vanish), no 600 (ambiguous between 500
   and 700). Per BRAND.md.
5. **For attention vs danger**, prefer `var(--attention)` (朱 #eb6101)
   over `var(--destructive)` (茜 #b7282e) for non-destructive
   alerts. The "everything's red" pattern is dated.

### Verification before opening a PR

Open the Storybook story for the component you touched (cardinal
rule 1 says it has one). In the Storybook toolbar, sweep every
combination:

```
theme:    light / dark
accent:   blue / green / violet / amber / rose / slate
density:  compact / default / comfortable
fontSize: sm / base / lg / xl
```

That's 2 × 6 × 3 × 4 = 144 combinations. You don't need to
visually inspect all 144 — but you DO need to visually inspect:

- **theme=dark** — every component, both accent=blue and
  accent=rose. Confirm contrast + surface tints flip.
- **accent=rose + theme=light** — confirm brand chain shifts
  (`--primary`, `--ring`, `--brand`, sidebar active state).
- **density=compact** — confirm heights shrink uniformly; no
  text overlap, no pixel-pinned element stays at default.
- **density=comfortable** — confirm heights grow + the layout
  doesn't collide.
- **fontSize=sm** + **fontSize=xl** — confirm rem-based sizes
  rescale; pixel-pinned elements stay frozen (which is wrong
  unless documented exception applies).

If any combination breaks, **fix the token reference, not the
component's instance**. The fix is upstream (token / variable),
not at the call site.

### Automated check (Playwright probe)

The pattern at the bottom of `src/stories/<Name>.stories.tsx`
that the framework uses to verify accent flip (see
`Calendar.stories.tsx`, `DateTimePicker.stories.tsx`) is the
template. Probe `getComputedStyle(document.documentElement)` for
the key tokens; assert they flip across each axis value. Cross-
reference the rendered element's `backgroundColor` /
`borderColor` to confirm the token reached the surface.

### Documentation

If a primitive cannot honour an axis (rare — fixed-aspect media,
chart libraries that emit hardcoded sizes), document the
exception in `docs/reference/primitives/<Name>.md` with the
reason. Silent non-compliance is rejected at review.

## Third-party library policy (cardinal rule 14)

**Every external library consumed by a primitive / shell / hook MUST
be a shadcn / Radix-ecosystem recommendation for the capability it
covers.** Cardinal rule 14 (`./CLAUDE.md` §14) carries the binding
form; this section carries the recipe.

The recommendation pool (in priority order):

1. **shadcn/ui** — primitive structure + ownership model.
2. **Radix UI** — interactive primitives (Dialog, Popover, Tabs,
   Combobox, DropdownMenu, …).
3. **React Aria Components (Adobe)** — accessibility-first
   primitives the shadcn community recommends where Radix doesn't
   cover the capability. Currently used for date input.
4. **@internationalized/date (Adobe)** — date / time math; pairs
   with React Aria.
5. **Tailwind v4 ecosystem** — token system (CSS custom properties +
   `@theme inline`), `class-variance-authority`, `clsx`,
   `tailwind-merge`.
6. **shadcn community-canonical adjuncts** — `cmdk` (palette),
   `sonner` (toast), `lucide-react` (icons), `i18next` +
   `react-i18next` (i18n).

When you need a capability not yet in the locked stack:

1. Check if shadcn/ui ships a recipe for it (their `examples` /
   blocks tree). Use the library they cite.
2. If shadcn doesn't have it, check Radix.
3. If Radix doesn't have it, check React Aria Components.
4. If none of them do, open an ADR at `docs/adr/NNNN-<slug>.md`
   proposing the library, citing the relevant shadcn community
   discussion (Discord / GitHub Discussions / issue) that gives
   the recommendation. Get review approval before installing.

**Forbidden** (rejected at review):

- Picking a library "because it's popular on npm trends" without
  shadcn / Radix backing.
- Picking the FIRST library a web search returns.
- Picking a library because "the team used it before" if the team
  used it BEFORE this rule landed (2026-05-16). Reset to the
  recommendation pool.
- Wrapping multiple libraries that solve the same capability
  (e.g. two date pickers, two icon sets, two animation libs). One
  capability → one library.

Replacement history (preserved here so reasoning is auditable):

- **react-day-picker → react-aria-components + @internationalized/date**
  (2026-05-16). react-day-picker carries an idiosyncratic class
  surface (`.rdp-root` collision with our `.calendar` wrapper) and
  uses native `Date` objects (timezone-fragile). React Aria is
  the shadcn community's modern recommendation: ARIA APG-compliant
  keyboard nav, locale-aware via `react-aria-i18n`, timezone-correct
  via `@internationalized/date`.

## Design system handoff (bundle workflow)

**Every visual or layout change MUST reference the canonical design
system bundle.** Don't invent components, screens, colors,
spacings, or typography. If the bundle does not cover something,
**ask the user** to mock it on Claude Design first — never improvise.

### Bundle location

```
libs/ts/godxjp-ui/design-handoff/
├── README.md                      # workflow notes
├── INTENT.md, GAPS.md, CANONICAL_GAPS.md, LAYOUT_AUDIT.md,
│                                  # working notes from prior cycles
├── godx-admin/                    # legacy bundle (HTML/JSX prototypes)
├── calendar/                      # calendar-specific handoff
└── ui-system/
    └── dxs-kintai-design-system/  # CANONICAL bundle — read this
        ├── README.md              # "CODING AGENTS: READ THIS FIRST"
        ├── chats/chat[1-3].md     # intent transcripts
        └── project/
            ├── SKILL.md           # the design-system rules
            ├── colors_and_type.css# canonical tokens
            ├── admin-web/         # Next.js reference implementation
            ├── ui_kits/admin-web/ # per-component HTML mockups
            ├── preview/           # comp-*.html per-component previews
            └── screenshots/       # rendered references
```

### Fetching / refreshing the bundle

Bundles are exported from Claude Design (`claude.ai/design`) as
URLs of the form `https://api.anthropic.com/v1/design/h/<hash>`.
Content is a gzipped tarball; the WebFetch tool returns the binary.

When the user posts a new design-handoff URL:

1. Use the WebFetch tool against the URL. The response saves a
   `.bin` file under `~/.claude/projects/.../tool-results/`.
2. Extract to `/tmp/<some-name>/`:
   ```bash
   cp <bin-path> /tmp/design-<hash>.tar.gz
   tar -xzf /tmp/design-<hash>.tar.gz -C /tmp/design-<hash>-extracted/
   ```
3. Inspect: `cat /tmp/design-<hash>-extracted/<project-name>/README.md`
   first; the README always says **"CODING AGENTS: READ THIS
   FIRST"**.
4. Read every file in `<project-name>/chats/` to understand intent.
5. Copy the extracted bundle into `design-handoff/ui-system/`
   (replace the existing `<project-name>` directory if any —
   bundles are atomic snapshots, never partially merged):
   ```bash
   rm -rf libs/ts/godxjp-ui/design-handoff/ui-system/<project-name>
   cp -r /tmp/design-<hash>-extracted/<project-name> \
        libs/ts/godxjp-ui/design-handoff/ui-system/
   ```
6. Update `design-handoff/README.md` and `INTENT.md` to point at
   the new bundle hash + date.

### Rules — every design follows the bundle

- **No invention.** A new primitive, screen, color, spacing, or
  type ramp that isn't in the bundle is rejected at review. The
  bundle is the contract.
- **Pixel-perfect intent, not literal DOM.** The bundle is HTML/CSS
  prototypes; recreate the visual exactly in React + tokens.
  Don't copy the prototype's internal DOM structure unless it
  fits the React primitive model.
- **Token-first.** `colors_and_type.css` in the bundle is the
  canonical source for color + type tokens. Anything that does NOT
  resolve to a `var(--token)` is wrong — change the token, don't
  hard-code the value.
- **`SKILL.md` is binding.** The `project/SKILL.md` in each bundle
  carries the design-system author's rules (font weights, density,
  attention-vs-danger preference, table row heights, etc.).
  Re-read it at the start of every design session.
- **Ask before improvising.** If you reach a screen / state / edge
  case the bundle does NOT cover, STOP. Tell the user:
  > "The design bundle at `design-handoff/ui-system/<name>/` does
  > not cover X. Please mock it on Claude Design
  > (`claude.ai/design`) and share the new handoff URL — I'll
  > re-fetch + implement."
  Do NOT improvise the missing piece.
- **Update history.** When a bundle is refreshed, note the
  before/after hash + date in `design-handoff/INTENT.md` so the
  audit trail is preserved.

### Reading order for a new design session

1. `design-handoff/ui-system/<latest-bundle>/README.md`
2. `design-handoff/ui-system/<latest-bundle>/chats/chat[N].md` (last one first —
   that's where the user landed).
3. `design-handoff/ui-system/<latest-bundle>/project/SKILL.md`.
4. `design-handoff/ui-system/<latest-bundle>/project/colors_and_type.css`.
5. The specific `preview/comp-<name>.html` or `ui_kits/admin-web/<name>.tsx`
   for the primitive you're implementing.

## Gotchas (package-specific)

- **`@apply` in primitives** that re-encodes a token value is
  forbidden (per ADR 0003 tokens-not-utilities). Use the CSS
  class from `tokens.css` directly.
- **i18next singleton** — there's ONE instance per page. Don't
  import `i18next` directly in primitives if you need
  translation; use `useTranslation()` from `react-i18next`.
- **Submodule mode** — this directory is a git submodule. When
  you commit in here, you commit to `github.com/godx-jp/godxjp-ui`,
  not to the umbrella. The umbrella sees only the SHA pin.
- **Closed → open type unions** (v3 broadened `ForgeProduct.tenant`
  to `string`). Don't re-narrow without an ADR.
- **Tailwind v4 nested comments** — `/* outer /* inner */ */` is
  a parse error. Use single-line `//` outside @theme.
- **CSS export paths** in `package.json::exports` must list ALL
  sub-paths consumers import (`.css` suffix variants too).
- **`workspace:*` resolution** — only works inside the umbrella
  monorepo. When publishing to npm, the version gets replaced
  with the actual semver.

## Cross-references

- **Framework binding rules** (this submodule): [`./new-docs/`](./new-docs/) — index at [`./new-docs/00-index.md`](./new-docs/00-index.md), theme axes at [`./new-docs/01-theme-axes.md`](./new-docs/01-theme-axes.md), consumer contract at [`./new-docs/02-consumer-contract.md`](./new-docs/02-consumer-contract.md)
- Cardinal rules (this package): [`./CLAUDE.md`](./CLAUDE.md)
- Brand bible: [`./BRAND.md`](./BRAND.md)
- Change log: [`./CHANGELOG.md`](./CHANGELOG.md)
- Diátaxis manual: [`./docs/`](./docs/)
- Storybook (when running): http://localhost:6006 (or
  `https://storybook.<publicDomain>/` for the umbrella's deploy)
- Upstream: https://github.com/godx-jp/godxjp-ui
- Repo-wide hard rules (umbrella): [`../../../CLAUDE.md`](../../../CLAUDE.md)
- Umbrella binding rules: [`../../../new-docs/`](../../../new-docs/)
- Library docs spec (umbrella): [`../../../new-docs/09-service-docs.md`](../../../new-docs/09-service-docs.md) §Library docs
- Frontend monorepo-platform wiring (umbrella): [`../../../new-docs/12-frontend-architecture.md`](../../../new-docs/12-frontend-architecture.md)
