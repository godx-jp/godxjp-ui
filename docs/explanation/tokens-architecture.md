---
$schema: https://godx-jp.github.io/schemas/doc-frontmatter-v1.json
title: Tokens architecture (shadcn-style + W3C DTCG layered)
description: Why @godxjp/ui ships tokens the way it does — single theme.css file with primitives + semantic + variants in one place, Tailwind v4 @theme inline mapping, three customization surfaces.
diataxis: explanation
audience:
  - developer
  - ai-agent
  - designer
status: published
last-updated: 2026-05-16
lang: en
---

# Tokens architecture (shadcn-style + W3C DTCG layered)

> **TL;DR.** Tokens follow the [shadcn/ui](https://ui.shadcn.com)
> idiom: one `theme.css` with `:root` + `.dark` + `[data-tenant]`,
> mapped to Tailwind v4 utilities via `@theme inline`. The W3C
> Design Tokens Community Group taxonomy (primitives / semantic /
> variants) is preserved inside that single file as commented
> sections. Services customize by overriding semantic tokens in
> their own `theme.css` — no fork of the package needed.

## Why this matters

Every godx frontend imports one file:

```css
@import "@godxjp/ui/tailwind.css";
```

That file gives the consumer:

1. **Tailwind v4 utilities** (`@import "tailwindcss";`)
2. **All design tokens** (primitives + semantic + theme/density/tenant variants)
3. **`@theme inline` mapping** so utilities like `bg-primary`, `text-muted-foreground`, `gap-card` resolve to the tokens
4. **Base layer** — element resets + typography defaults (`@layer base`)
5. **Component CSS** — `.app-*`, `.sb-*`, `.tb-*`, `.page-content*`, etc.
6. **Sonner toast** theme overrides

A service NEVER redeclares any of those. They only add their own
overrides to semantic tokens.

## The three layers (DTCG taxonomy)

The single `theme.css` is internally structured as three layers,
inspired by the [W3C Design Tokens Community Group format spec](https://www.w3.org/community/design-tokens/):

### Layer 1 — Primitives (immutable)

Raw scales that NEVER swap with theme:

- **Typography**: `--font-sans-jp` (M PLUS 2 + JP fallbacks), `--text-2xs`…`--text-4xl`, `--leading-tight`/`--leading-body`, `--heading-h1`…`--heading-h4`
- **Spacing** (4px grid): `--spacing-0`…`--spacing-24`
- **Density steps**: `--density-element-xs`…`--density-element-xl`, `--density-card`, `--density-page`, `--density-section`
- **Layout**: `--header-height`, `--sidebar-width`, `--sidebar-collapsed-width`
- **Radius**: `--radius-sm`/`--radius-md`/`--radius-lg`/`--radius-full`
- **Shadow**: `--shadow-sm`…`--shadow-2xl`
- **Motion**: `--transition-fast`…`--transition-slower`, `--ease-in`/`--ease-out`/`--ease-in-out`
- **Raw colour scales**: `--wa-*` (traditional Japanese hues), `--gray-50`…`--gray-900`, `--blue-*`

> ⚠️ Services NEVER override primitives. If you need a new scale value (e.g. an XXL spacing step), add it to the submodule via a PR, not in service `theme.css`.

### Layer 2 — Semantic (intent aliases)

The DEFAULT light theme. Every component CSS rule consumes these:

- **Surface**: `--background`, `--foreground`, `--card`, `--popover`, `--surface-1`/`--surface-2`/`--surface-3`
- **Accent / brand**: `--primary`, `--primary-foreground`, `--ring`, `--brand`
- **Status**: `--success`, `--warning`, `--error`, `--info`, `--attention`, `--destructive` (+ `-foreground` variants)
- **Form**: `--border`, `--input`, `--input-background`
- **Muted / accent**: `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`
- **Shell**: `--sidebar-bg`, `--sidebar-border`, `--sidebar-fg`, `--sidebar-muted`, `--sidebar-active-bg`, `--sidebar-active-fg`, `--topbar-bg`, `--topbar-border`
- **Status dot**: `--dot-success`, `--dot-warning`, `--dot-error`, `--dot-info`, `--dot-attention`, `--dot-muted`

**This is the customization surface.** Override anything here in your service `theme.css`.

### Layer 3 — Variants (re-bind semantic)

Three orthogonal axes re-bind the semantic layer based on `<html data-*>` attributes:

| Axis | Selector | Effect |
|---|---|---|
| **Theme** | `[data-theme="dark"]` | Re-binds `--background`, `--foreground`, surfaces, `--sidebar-*`, etc. for dark mode. Driven by user preference. |
| **Density** | `[data-density="compact"]` / `[data-density="comfortable"]` | Re-binds `--density-element-*`, `--density-card`, `--density-page`, `--density-section`, `--header-height`. Driven by user preference (Tweaks panel). |
| **Tenant** | `[data-tenant="godx"]` / `[data-tenant="kintai"]` / `[data-tenant="tempo"]` / `[data-tenant="betoya"]` | Re-binds `--primary`, `--ring`, `--brand`. Driven by operator config (per-org accent). |

The combined selector `[data-theme="dark"][data-tenant="kintai"]` brightens accents in dark mode per tenant.

## How Tailwind v4 maps tokens to utilities

In `tailwind.css`:

```css
@theme inline {
  --color-background: var(--background);
  --color-primary:    var(--primary);
  --spacing-page:     var(--density-page);
  /* ... */
}
```

`@theme inline` registers the tokens as Tailwind theme values WITHOUT resolving the `var()` reference at compile time. Result: utilities like `bg-primary`, `text-muted-foreground`, `gap-card`, `text-page-title` compile to `background-color: var(--primary)` etc.

When the user toggles dark mode (`[data-theme="dark"]` set on `<html>`), CSS resolves `var(--primary)` to the dark-mode value — utilities update instantly with zero JS.

## How services customize

Three patterns, in order of how often you'll use them:

### Pattern 1 — Override a semantic token globally

```css
/* services/foo/frontend/src/theme.css */
@import "@godxjp/ui/tailwind.css";

:root {
  --primary: oklch(58% 0.18 25);  /* Service brand */
  --ring:    oklch(58% 0.18 25);
}
```

### Pattern 2 — Per-tenant accent

```css
[data-tenant="acme"] {
  --primary: oklch(60% 0.15 280);
  --ring:    oklch(60% 0.15 280);
}
```

The operator sets `<html data-tenant="acme">` at runtime; CSS picks up automatically.

### Pattern 3 — Service-local layout class (no @godxjp/ui peer)

```css
@layer components {
  .foo-screen-grid {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) 2fr;
    gap: var(--density-section);
  }
}
```

Use the `@layer components` block so Tailwind utilities can still
override per-instance. Always consume tokens via `var(--...)`, never
hard-code values.

## What services do NOT do

- **No `@theme inline { … }` in service code.** That registration is in `@godxjp/ui/tailwind.css`, once.
- **No `:root { --space-4: 12px }`.** Primitives are immutable — bump in the submodule if needed.
- **No `<style>` tags in components for visual styling.** Use Tailwind utilities + token-named utilities.
- **No copy-paste of `.app-root` / `.sb-*` / `.tb-*` styles.** Consume the components from `@godxjp/ui/components/shell` and the chrome lights up for free.

## File map

```
libs/ts/godxjp-ui/src/styles/
├── theme.css      # Layers 1+2+3 — primitives + semantic + variants
├── base.css       # @layer base — html/body/h1-h4/scrollbar
├── shell.css      # All component CSS (.app-*, .sb-*, .tb-*, …)
├── sonner.css     # Toast theme overrides
└── index.css      # Aggregates the above

libs/ts/godxjp-ui/src/tokens/tailwind.css   # Tailwind v4 entry
  → @import "tailwindcss"
  → @import "../styles/index.css"
  → @theme inline { /* token → utility mapping */ }
  → @layer base { /* accent palette swaps via [data-accent] */ }
```

## Standards & references

- [shadcn/ui — "Tailwind v4" theming](https://ui.shadcn.com/docs/tailwind-v4)
- [W3C Design Tokens Community Group — Format spec](https://www.w3.org/community/design-tokens/)
- [Tailwind v4 — `@theme` directive](https://tailwindcss.com/docs/v4-beta#theme)
- [CSS Custom Properties (Cascading Variables) Module Level 1](https://www.w3.org/TR/css-variables-1/)
- [Radix Themes — colour scales](https://www.radix-ui.com/themes/docs/theme/color)
- [OKLCH colour function — CSS Color Module 4](https://www.w3.org/TR/css-color-4/#ok-lab)

## Related

- [How-to: customize a service theme](../how-to/customize-theme.md) — the practical recipe.
- new-docs/12 Clause 1 — `@godxjp/ui` is mandatory.
- new-docs/12 §1 — `theme.css` is the ONE service-local CSS file.
