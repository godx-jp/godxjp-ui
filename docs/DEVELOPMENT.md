# Development Guideline — `@godxjp/ui`

How to work **on** the design system (not just with it). If you only consume the
framework from the app, read [the app-developer rules](../../../.claude/skills/frontend-design/rules/ui-standardization.md)
instead — this file is for people **editing `packages/godx-ui/`**.

---

## 0. What this package IS — and the boundary it must keep

`@godxjp/ui` is **the** UI framework for every godx surface (admin, agency
portal, handheld). It is shared, versioned infrastructure: one change here ripples
to every screen and every consumer. Two consequences:

1. **Editing it needs explicit session permission** — the hard gate in
   [ui-standardization §0](../../../.claude/skills/frontend-design/rules/ui-standardization.md#0-changing-packagesgodx-ui-requires-explicit-permission-hard-gate).
   Treat the package as off-limits by default.
2. **It is generic and presentational only.** The framework knows about _tokens,
   layout, accessibility, and interaction_ — never about the app's data, routes,
   language files, or business rules.

### The hard boundary — consumer-layer concerns MUST NOT leak in

A component in this package may **not** import or assume any of the following. These
belong to the **consumer** (the app), which composes framework primitives around them:

| ❌ Never inside `packages/godx-ui/`                              | ✅ Where it belongs                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| App i18n — `useTranslation`, `t()`, `resources/js/i18n`          | App passes already-translated strings in as props                   |
| Inertia — `router`, `usePage`, `<Form>`, `@inertiajs/*`          | App wires navigation/submit; pass `onClick`/`href`/`onSubmit` props |
| Wayfinder routes — `@/routes`, `@/actions`, `.url()`             | App resolves the URL, passes a plain string                         |
| Business entities / domain logic (Item, Packing, shipment rules) | App-level component in `resources/js/components/**`                 |
| App copy / labels / placeholder text baked into the component    | Comes in via props; framework ships no product wording              |
| Raw colors / hex / `hsl(...)` literals, `dark:` overrides        | Semantic tokens (`var(--…)`, `bg-primary`, …) — see §3              |
| A consumer's theme values redefined inside a component           | Theme lives in `src/tokens/` (the framework default ships it)       |

> **Litmus test:** if a component can't render in a Storybook-style preview with
> plain props and zero app context, it does **not** belong in this package. Keep it
> app-level (`resources/js/components/admin/…`) and have it _compose_ framework
> primitives. See the **`godx-ui-component-placement`** skill for the full decision.

The framework ships its **own theme** (colors, fonts, type scale, wa-iro palette) in
`src/tokens/foundation.css`, so consumers import `@godxjp/ui/styles` and need
**zero** extra theme config. Do not push theme decisions back onto the consumer.

---

## 1. Architecture — the layers, bottom-up

```
src/tokens/        Design tokens (the single source of values)
  foundation.css   :root + .dark — colors, fonts, type scale, spacing, radius, wa-iro
  primitives/*.css Per-domain primitive tokens (card, table, control, badge, …)
  base.css         Coordinates the token layer
src/styles/        CSS that styles components by [data-slot] + density.css (the density knob)
  index.css        Entry: @import fontsource → tailwindcss → @theme (token→utility map) → layout css
src/components/    React components, grouped (data-display, data-entry, layout, …)
src/props/         Prop type system — vocabulary/ (atomic) + components/ + registry.ts
src/lib/           cn(), control-styles, variants — shared helpers
examples/          *.preview.tsx — Storybook-style stories (preview app)
docs/primitives/   <component>/index.tsx demo + examples/ + generated .md
preview/           The preview app (vite) on :6008 that renders examples + docs
```

**Token → utility flow:** a value is defined once as a CSS var in
`tokens/foundation.css` (e.g. `--primary`), mapped to a Tailwind utility in the
`@theme` block of `styles/index.css` (`--color-primary: hsl(var(--primary))`), and
consumed as `bg-primary` / `hsl(var(--primary))`. Never skip a layer with a literal.

### The component pattern — markup emits slots, CSS owns styling

Components render semantic structure and `data-slot` / `data-*` flags; **the spacing,
padding, and chrome live in `src/styles/*-layout.css`**, keyed on those slots. This
keeps density and theming centralized.

```tsx
// component: emits slots + flags only
<div data-slot="card" data-variant={variant} data-density={density} />
```

```css
/* styles/card-layout.css: owns the look */
[data-slot="card"] {
  border: 1px solid hsl(var(--card-border-token));
  border-radius: var(--card-radius);
}
[data-slot="card"][data-density="tight"] {
  --card-space-inset: var(--space-3);
}
```

Prefer this over hardcoding Tailwind padding inside the component. Use Tailwind
utility classes for **one-off layout** (flex/grid/gap), not for re-theming.

### Density

One knob — `.ui-density-{compact,default,comfortable}` in `styles/density.css` —
retunes `--phi-unit`, control heights, and table row heights together. Components
read the resulting tokens; never branch on density in component JS.

### The `ui/` layer

`src/components/ui/*` are thin **re-exports** of the canonical implementation
(`export * from "../data-display/card"`). They exist for shadcn-style import paths.
Edit the canonical file under its group; the `ui/` path follows automatically.

---

## 2. Adding or changing a component (after you have §0 permission)

Work in this order; only advance when the previous step genuinely can't express the need:

1. **Use** an existing primitive.
2. **Compose** primitives (Card + Field + Stack…).
3. **Extend** an existing component — add a prop/slot (e.g. `labelAddon`, `accent`).
   Prefer this: one more prop beats one more component.
4. **Create** a new component — last resort. State _why_ 1–3 fail before writing it,
   then run the **`godx-ui-component-placement`** decision to confirm it belongs here
   at all (vs. app-level).

Document the decision (which promotion criteria it met) so review can check it —
see [ui-standardization §2a](../../../.claude/skills/frontend-design/rules/ui-standardization.md#2a-creating-a-new-component--last-resort-then-decide-its-home).

---

## 3. Rules for framework code

- **Semantic tokens only.** No raw hex / `rgb()` / `hsl()` literals, no palette
  utilities (`bg-blue-500`), no `dark:` overrides — tokens adapt automatically.
  Structural literals (a `3px` accent stripe, `1px` borders) are fine; _color/size
  scale_ values come from tokens.
- **No app coupling** (the §0 boundary table above).
- **Props live in `src/props/`** — atomic concepts in `vocabulary/`, per-component
  interfaces in `components/`. Check `registry.ts` + `PROP_ALIASES_FORBIDDEN` before
  inventing a prop name. Never inline a prop interface in a `.tsx`.
- **Accessibility built-in** — label/control wiring, `aria-*`, focus rings, roles.
  The component sizes its own icons; consumers don't pass icon sizing.
- **Mobile-first** — base styles are the phone; `sm:`/`md:`/`lg:` only scale up.
- **i18n is the consumer's job** — strings arrive as props. The framework's own
  `src/i18n` is for built-in control affordances only, with en/ja/vi parity.

---

## 4. Every component change ships its story + docs

A change isn't done until its documentation reflects it:

1. **Preview story** — `examples/<group>/<Component>.preview.tsx` (Storybook-style).
   New props get a story (see `examples/data-display/Card.preview.tsx`:
   Surfaces / Density / AccentEdges).
2. **Docs demo** — `docs/primitives/<group>/<component>/index.tsx` shows the new
   capability; `examples/` holds focused per-feature demos.
3. **Regenerate props docs** — `pnpm docs:sync-primitives` regenerates the `.md`
   from source. Run it after prop changes so the tables stay accurate.

> Docs are mid-migration to the `<component>/index.tsx (+ examples/)` shape. Do **not**
> resurrect flat `docs/primitives/<component>.tsx` demos — they were dead orphans and
> were removed.

---

## 5. Verify before finishing

```bash
pnpm lint                 # eslint — self-contained flat config
pnpm typecheck            # tsc --noEmit
pnpm test                 # vitest per component
pnpm preview:build        # integration test: examples + docs must build
pnpm audit                # godxjp-ui-audit — 0 errors for touched files
pnpm check:mcp-sync       # MCP registry ↔ library export drift guard
```

`pnpm verify` and `pnpm verify:release` run these together (verify:release also builds).

All gates are **self-contained** — no internal/external tooling package required.
The eslint, prettier, and vitest setup live in the package (`eslint.config.js`,
`prettier.config.mjs`, `vitest.config.ts`, `src/test/`), so a fresh checkout can
lint/type-check/test without anything beyond the declared devDependencies.

The app side additionally runs **`npm run ui:audit`** (the design-system linter) and
must report 0 errors for touched files.

---

## 6. Releasing — the lib and its MCP, in lockstep

This repo publishes **two packages** that must agree: `@godxjp/ui` (the browser component
library, root `package.json`, 6.x) and `@godxjp/ui-mcp` (the Node MCP server that tells agents
how to use it, `mcp/`, 0.x). They stay **separate** on purpose — the MCP pulls the MCP SDK,
which has no business in a consumer's browser bundle. Two guards keep them honest:

- **Drift guard** (`pnpm check:mcp-sync`) — every component the MCP catalogs must still be a real
  library export. Runs inside `verify` / `verify:release`, so a rename that forgets the MCP fails
  before publish, not after agents start citing a component that no longer exists.
- **Coordinated release** (`pnpm release`):

  ```bash
  pnpm release --ui minor --mcp patch   # bump + verify:release + build + publish + commit, both
  pnpm release --ui patch               # ui only (mcp skipped)
  pnpm release --mcp minor              # mcp only
  ```

  It refuses a dirty tree, runs the full `verify:release` gate (incl. the drift guard) before
  publishing the lib, bumps each package's own version line, `npm publish`es each, and commits the
  version bumps. Push the commit when ready. Never hand-publish one package and forget the other.

---

## See also

- [README](../README.md) — overview, component groups, consumer setup.
- [ui-standardization.md](../../../.claude/skills/frontend-design/rules/ui-standardization.md) — the app-developer rules (§0 gate, §2a placement, token rules).
- [ui-code-review.md](../../../docs/contributing/ui-code-review.md) — the review checklist.
- `docs/TOKENS.md`, `docs/SPACING.md`, `docs/PROPS-VOCABULARY.md`, `docs/PROPS-REGISTRY.md`.
- **`godx-ui-component-placement`** skill — decide whether a component belongs here.
