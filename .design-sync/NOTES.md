# design-sync notes — @godxjp/ui

Repo-specific facts for syncing `@godxjp/ui` to claude.ai/design. Read this before every re-sync.

## STATUS: not yet synced — blocked on design auth in the environment where it was started

The first `/design-sync` was attempted from a headless claude.ai/code web session that has **no
design-system authorization** and **no interactive terminal**, so `DesignSync` (and therefore
`create_project` / `finalize_plan` / upload) could not run. The tool's own guidance:

> DesignSync needs design-system authorization, but `/design-login` requires an interactive
> terminal. If this is claude.ai/code, use Claude Design's "Send to Claude Code Web" (seeds the
> project into the workspace) or provide the project files directly.

**To complete the sync:** run `/design-sync` again from either (a) an interactive terminal where
`/design-login` works, or (b) a session started via Claude Design's "Send to Claude Code Web". This
config + these notes are committed so that run starts already scoped — see the verify-loop TODO below.

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
