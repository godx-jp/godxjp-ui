# design-sync notes — @godxjp/ui

Repo-specific facts for syncing `@godxjp/ui` to claude.ai/design. Read this before every re-sync.

## STATUS: synced (first import 2026-06-29) — project `edbd03a8-e78b-40a1-a6f5-82f7452191b0`

Target project **"@godxjp/ui Design System"** (https://claude.ai/design/p/edbd03a8-e78b-40a1-a6f5-82f7452191b0),
freshly created for this import (NOT the user's hand-authored "dxs-kintai Design System" project — that
one is left untouched). `projectId` is pinned in config.json. Incremental upload path (empty project).

The earlier headless attempt couldn't run `DesignSync`; this run completed from an interactive
terminal after `/design-login` upgraded the claude.ai login with design-system scopes.

### Architecture decision that drives this sync (IMPORTANT — read before re-sync)
`@godxjp/ui` is a **design _framework_**, not a single locked brand: brand-neutral primitives + a
semantic-token / knob system that consumers re-skin with their OWN design system (theme.css /
`[data-tenant]` scoping). The sync reflects that: ship the neutral framework + default-quiet tokens,
teach the design agent to re-skin via tokens (conventions header), demo previews in the default theme.

### The entry problem (why cfg.entry + the 111-entry componentSrcMap exist)
The package's published `.` entry (`dist/index.js`) is a THIN curated "admin" surface (~37 exports)
and is **missing the core primitives** (Button, Card, Input, Select, Calendar, DataTable, …). The real
public API is **subpath-based** (`@godxjp/ui/general`, `/data-display`, `/data-entry`, …). So:
- **Bundle**: `cfg.entry = ./dist/_ds_all.js` — an aggregate (`.design-sync/gen-aggregate.mjs`,
  regenerated post-`pnpm build` via `cfg.buildCmd`) that `export *`s all 8 category barrels + a few
  extras. `window.GodxjpUi` ends up with 268 exports (92 catalogued + all compound sub-parts) so the
  design agent can compose Card+CardContent, Dialog+DialogContent, etc.
- **Cards**: `cfg.componentSrcMap` (111 entries) defines exactly the **92 catalogued** components
  (matches `mcp/src/data/components.ts`) — 92 src-path ADDs + 19 nulls that exclude the sub-parts the
  thin entry contributes (AlertTitle, DialogContent, TabsList, SkeletonStat, Toolbar…). Discovery's
  types-root is hard-wired to `pkgJson.types` with NO config override, so componentSrcMap is the only
  reproducible lever — do not "simplify" it away.

### Font decision (resolves the would-be [FONT_DANGLING])
Default face is **Noto Sans JP** (`:root`); **Montserrat** is the `vi`-locale face. The compiled
preview CSS references both via absolute `/assets/*.woff2` urls (don't resolve outside Vite).
`.design-sync/gen-css.mjs` (run in `cfg.buildCmd`) emits a STABLE cleaned cssEntry
(`preview/dist/assets/_ds_cssentry.css`) that: (a) fixes the hash-rot risk by globbing the
content-hashed `preview-runtime-*.css`; (b) **keeps Montserrat** (256 KB / 15 files, urls rewritten
relative → shipped to fonts/); (c) **drops the 372 Noto Sans JP @font-face blocks** (8.8 MB of CJK
subsets — disproportionate for a host-font-driven themeable framework). Noto Sans JP is runtime-marked
(`cfg.runtimeFontPrefixes`) so it falls back to the system stack (-apple-system, Hiragino Sans). JP
preview text renders in system JP fonts; consumers serve their own JP webfont in production.

### Known render warns (validate these against on re-sync — NOT new if listed here)
- **[TOKENS_MISSING] `--offset-*` / `--mobile-offset-*` (11 vars)** — set at runtime via inline
  style / JS by positioned components (toasts/popovers/sheets). EXPECTED absent from static
  stylesheets; non-blocking. Do not chase.
- **[RENDER_BLANK]/[RENDER_THIN] on bare interactive primitives** — Button, Input, Checkbox,
  Textarea, TagInput, Progress, AspectRatio (blank) and StatCard, Field, FormField, Rating,
  PageContainer, SplitPane (thin) render small as empty floor cards. These are all in the AUTHORING
  scope (`.design-sync/previews/<Name>.tsx`); the floor card is honest, authoring fixes them.
  After authoring, only PageContainer / SplitPane (+1) remain legitimately `thin` — recorded, not new.

### First-sync result (2026-06-29)
- **92/92 render clean, bad=0**, variantsIdentical=0, thin=3 (layout primitives, recorded above).
- **22 authored previews**, all graded `good` (carried forward at 0 cost on re-sync): Button, Card,
  Input, Badge, Alert, Select, Switch, Checkbox, Textarea, TagInput, Progress, AspectRatio, StatCard,
  Field, FormField, Rating, Tabs, Avatar, Steps, DataTable, Calendar, DatePicker.
- **70 components on the honest floor card** — fully functional, authorable incrementally on any
  re-sync (their `.design-sync/previews/<Name>.tsx` just doesn't exist yet).
- `window.GodxjpUi` = 268 exports (92 catalogued + all compound sub-parts).
- Conventions header authored at `.design-sync/conventions.md` (wired via `readmeHeader`) — every
  token / prop / component it names was grep-verified against the built bundle.

### Re-sync risks / watch-list
- **cssEntry hash rot is SOLVED** by `gen-css.mjs` (globs `preview-runtime-*.css`, re-emits the stable
  `_ds_cssentry.css`). But `cfg.buildCmd` MUST run `pnpm preview:build` before `gen-css.mjs`, else the
  cleaned cssEntry is stale. Full chain: `pnpm build && pnpm preview:build && gen-aggregate && gen-css`.
- **Authored-preview API guesses**: a few previews use props the `.d.ts` extractor flattened to
  `VariantProps` (Select/Switch/Checkbox/Avatar compound APIs, Calendar `mode/selected`, DataTable
  `{key,header,align,render}` columns, Steps `items`). They render correctly today; if upstream
  changes those APIs, re-grade those cells.
- **Noto Sans JP is runtime-marked, not shipped** (see Font decision). If a future brand needs JP
  webfonts in previews, ship a Noto subset via `extraFonts` — don't unmark without a size budget.
- The `:root` role-mirror freeze fix (v16.6.0) is why scoped/dark token overrides reach components;
  purely CSS-internal, doesn't affect the bundle JS/.d.ts.

## Source shape: package (no Storybook)

- No `.storybook/` and no `*.stories.*` anywhere → `shape: "package"`.
- Component list comes from the shipped `.d.ts` exports of `dist/index.js`.
- **~92 public primary components** (matches `pnpm check:mcp-orphans`: "92 catalogued components").
  The converter's discovered `components:` count should match 92 (± intentional internals); a
  shortfall means a `componentSrcMap` pin is needed.

## Build inputs (verified by inspection)

- `pkg`: `@godxjp/ui`; `globalName`: omitted → converter auto-derives from `pkg`. If the derived
  global is awkward, set it explicitly (it becomes `window.<globalName>`).
- **JS entry**: `./dist/index.js` (package `exports['.'].import` / `module` / `main`). Built by
  `pnpm build` (tsup). Pass `--entry ./dist/index.js` to `package-build.mjs`.
- **Types**: `./dist/index.d.ts` (shipped). Prop extraction needs `@types/react` in `.ds-sync` deps.
- **Icons**: `lucide-react` is a normal dependency, bundled into `dist/index.js` — **no separate
  icon package**, so no `extraEntries` for icons.
- `--node-modules`: this repo's own `./node_modules` (single-package repo, React resolves there).
  In this repo `node_modules/@godxjp/ui` does NOT exist (npm won't self-install), hence `--entry`.

## CSS strategy — CRITICAL (Tailwind v4; there is NO shipped compiled stylesheet)

This is the one non-obvious part. Do **not** point `cssEntry` at `dist/styles/index.css`:

- `dist/styles/index.css` is **Tailwind v4 SOURCE**, not compiled CSS — its first lines are
  `@import "tailwindcss";` + `@theme inline { … }`, and components use Tailwind utility classes
  (`flex`, `gap-2`, `bg-primary`, `text-sm` …). Without a Tailwind compile pass those utilities
  don't exist → **every component renders unstyled** (the `[CSS_PLACEHOLDER]` case).
- The component-layer CSS (`dist/styles/*-layout.css`, `control.css`) and the tokens
  (`dist/tokens/**`) ARE plain CSS, but they're only half the styling — the utility classes and the
  `@theme inline` token→utility bridge are missing until Tailwind compiles.
- **The compiled artifact already exists** after `pnpm preview:build`:
  `preview/dist/assets/preview-runtime-*.css` (~512 KB) — full utilities + `@theme` + component
  layers + the `@fontsource` `@font-face` rules. That is the correct `cssEntry`.
  - It's compiled by Vite's `@tailwindcss/vite` plugin (there is no standalone `tailwindcss` CLI in
    devDeps), and the filename is **content-hashed** (rotates per build), so it's not a stable path
    to commit. In the verify loop: run `pnpm preview:build`, then set `cssEntry` to the freshly
    emitted `preview/dist/assets/preview-runtime-<hash>.css` for that run. (A nicer long-term fix:
    add a tiny fixed-name Vite/lib build that compiles `src/styles/index.css` → a stable path, then
    pin `cssEntry` to it. Not done yet.)
- Fonts: `@fontsource/montserrat` + `@fontsource/noto-sans-jp` are `@import`ed by
  `src/styles/index.css`, so their `@font-face` + woff2 are inlined into the compiled CSS above and
  should NOT trip `[FONT_MISSING]` once `cssEntry` points at it. Font files live at
  `node_modules/@fontsource/{montserrat,noto-sans-jp}/files/*.woff2` if `extraFonts` is ever needed.
  - The DS also lets a brand set `--font-family-display` / `--font-family-body` to host-served
    fonts (e.g. Sora, Be Vietnam Pro in the futurelastic showcase). Those are runtime/brand fonts,
    not shipped — if validate flags them, use `runtimeFontPrefixes`, don't ship them.

## Provider — verify in the loop (likely needed for i18n)

- Components call `useTranslation()` (`src/i18n/use-translation`). Check whether it has a safe
  default outside a provider or throws "must be inside <Provider>". If previews render blank with a
  context error, set `cfg.provider` to the i18n/translation provider export. Most Radix-based
  components need no global provider; the i18n context is the one to watch.

## Verify-loop TODO (do these in the authed environment)

1. `pnpm install --frozen-lockfile` (repo uses pnpm; `pnpm-lock.yaml`).
2. `pnpm build` (JS+dts) **and** `pnpm preview:build` (compiled CSS).
3. Stage scripts into `.ds-sync/` and `npm i esbuild ts-morph @types/react` there (per sub-skill §2.7).
4. Set `cssEntry` to the fresh `preview/dist/assets/preview-runtime-<hash>.css`.
5. `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./dist/index.js --out ./ds-bundle`
6. `node .ds-sync/package-validate.mjs ./ds-bundle` — triage tags; expect to resolve: `[CSS_*]`
   (cssEntry above), possibly `[RENDER]` (i18n provider), confirm `components:` ≈ 92.
7. Chromium is pre-installed at `/opt/pw-browsers` in Claude Code web envs (set
   `PLAYWRIGHT_CHROMIUM_EXECUTABLE` or install the matching `playwright` for the render check).
8. Preview scope decision (cost slider): floor cards ship all 92 functional immediately; author rich
   previews for the core primitives first (Button, Badge, Alert, Card, Input, Select, DataTable,
   Steps, Calendar/DatePicker, Tabs, Avatar, StatCard…). The repo has rich composition sources to
   port from: `docs/showcase/*.tsx` (full real screens incl. tiximax-portal/website,
   futurelastic-web) and `docs/**/*.tsx` isolate example pages — excellent authored-preview material.

## Re-sync risks

- `cssEntry` is hash-keyed (see CSS strategy) — a committed absolute path WILL rot; always
  regenerate via `pnpm preview:build` and repoint, or add the stable-compile build first.
- Brand/display fonts (Sora, Be Vietnam Pro) are host-served by design — never ship them; use
  `runtimeFontPrefixes` if `[FONT_MISSING]` flags them.
- The DS just shipped the `:root` role-mirror freeze fix (v16.6.0) — component tokens are now
  `initial` + call-site role fallbacks; this is purely CSS-internal and does not affect the bundle's
  JS exports or `.d.ts`, but it IS why scoped/dark previews now render correctly.
