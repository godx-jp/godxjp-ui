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
│   ├── how-to/                     # override-tokens, compose-shell, migrate-from-v2, …
│   ├── reference/                  # primitives/, shell/, hooks/, tokens.md, exports.md, …
│   ├── explanation/                # design-philosophy, architecture, accessibility, …
│   └── adr/                        # 0001-radix-as-foundation, …
├── design/                         # design source (Sketch / Figma exports, brand sources)
└── dist/                           # build output — gitignored
```

## Where things live

| What | Path |
|---|---|
| Source-of-truth tokens | `src/tokens/tokens.css` + `tokens-ext.css` |
| Tailwind v4 theme map | `src/tokens/tailwind.css` (single consumer entry) |
| Primitives barrel | `src/components/primitives/index.ts` |
| Shell barrel | `src/components/shell/index.ts` |
| Screens barrel | `src/components/screens/index.ts` |
| Main barrel | `src/index.ts` |
| i18n init | `src/i18n/index.ts::initI18n()` |
| Tenant catalog | `src/data/products.ts` |
| Public exports surface | `package.json::exports` |
| Storybook config | `.storybook/main.ts` + `.storybook/preview.ts` |
| Storybook stories | `stories/<kind>/<Name>.stories.tsx` |
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

1. Add `src/components/primitives/<Name>.tsx`.
2. Add `src/components/primitives/<Name>.css` (if it ships its
   own canonical class) OR add the class to
   `src/tokens/tokens.css`.
3. Export from `src/components/primitives/index.ts`.
4. Add `docs/reference/primitives/<Name>.md` (Diátaxis reference
   per [new-docs/09 §Library docs](../../../new-docs/09-service-docs.md)).
5. **Add `stories/primitives/<Name>.stories.tsx`** — covers
   every variant + state (default, hover, active, focused,
   disabled, loading, error). Both light and dark theme.
6. Update `CHANGELOG.md` under `## Unreleased / ### Added`.
7. Bump version per SemVer (new primitive = minor bump).

### When you edit a primitive

1. Modify `src/components/primitives/<Name>.tsx`.
2. Update `docs/reference/primitives/<Name>.md` (prop table /
   variants / a11y notes must reflect the change).
3. **Update `stories/primitives/<Name>.stories.tsx`** (new
   variant → new story; renamed prop → updated story).
4. Update `CHANGELOG.md`. Bump per SemVer:
   - Breaking change → major.
   - New prop with default → minor.
   - Bug fix → patch.

### When you delete a primitive

1. Mark deprecated in `package.json::exports` for one major
   version (export the legacy name pointing at the new one).
2. Delete `src/components/primitives/<Name>.tsx`.
3. Delete `docs/reference/primitives/<Name>.md`.
4. **Delete `stories/primitives/<Name>.stories.tsx`.**
5. Document removal in `CHANGELOG.md / ### Removed`.
6. Bump major version.

### Story template (canonical)

```tsx
// stories/primitives/<Name>.stories.tsx
import type { Meta, StoryObj } from "@storybook/react"
import { <Name> } from "../../src/components/primitives/<Name>"

const meta: Meta<typeof <Name>> = {
  title: "Primitives/<Name>",
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

## Common tasks

### Add a new primitive
See "When you create a primitive" above. Follow the full
6-step process; CI rejects partial submissions.

### Override or extend a token
1. Edit `src/tokens/tokens.css` (canonical) or `tokens-ext.css`
   (extensions).
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
- **Default token values** in `src/tokens/tokens.css` without
  visual review. A consumer's existing UI may shift.
- **The Tailwind theme map** in `src/tokens/tailwind.css` —
  break the consumer's utility classes.
- **`src/data/products.ts`** without an operator brief. The
  tenant catalog is consumed by the shell.
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
