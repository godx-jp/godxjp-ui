---
$schema: https://godx-jp.github.io/schemas/doc-frontmatter-v1.json
title: Customize a service theme
description: Recipes for changing accent colour, adding a tenant, supporting dark mode, switching density. Always go through semantic tokens — never edit primitives.
diataxis: how-to
audience:
  - developer
  - ai-agent
  - designer
status: published
last-updated: 2026-05-18
lang: en
---

# Customize a service theme

> Goal: make your service look exactly the way you want WITHOUT
> forking `@godxjp/ui` or duplicating CSS. Every recipe below is a
> one-file change in your service's `theme.css`.

## Prerequisites

Your service follows rule 12 frontend architecture:

```
services/<slug>-service/frontend/
├── src/
│   ├── theme.css                # the ONE service-local CSS file
│   ├── main.tsx                 # imports "./theme.css"
│   └── …
```

`theme.css` always starts with:

```css
@import "@godxjp/ui/tailwind.css";
```

That single import gives you the entire design system + Tailwind v4
utilities. Every recipe below is additional CSS you append to that
file.

---

## Recipe 1 — Change the brand accent globally

Use case: your service has a single brand colour, no tenants.

```css
@import "@godxjp/ui/tailwind.css";

:root {
  --primary:            oklch(58% 0.18 25);   /* Vermilion */
  --primary-foreground: oklch(99% 0.002 60);
  --ring:               oklch(58% 0.18 25);
  --brand:              oklch(58% 0.18 25);
}
```

Tailwind utilities like `bg-primary`, `text-primary-foreground`,
`ring-ring`, `focus-visible:ring-2` update instantly — no JS, no
re-render.

---

## Recipe 2 — Add a per-deployment accent palette

Use case: your service is multi-tenant; each tenant has its own
brand colour.

```css
@import "@godxjp/ui/tailwind.css";

[data-accent="acme"] {
  --primary: oklch(60% 0.15 280);
  --ring:    oklch(60% 0.15 280);
  --brand:   oklch(60% 0.15 280);
}

[data-accent="aurora"] {
  --primary: oklch(72% 0.12 155);
  --ring:    oklch(72% 0.12 155);
  --brand:   oklch(72% 0.12 155);
}
```

Then somewhere at runtime — typically in `applyDesignAttrs()` —
set the attribute on `<html>`:

```ts
document.documentElement.dataset.accent = currentTenant
```

The chrome (sidebar product chip, topbar buttons, focus rings)
flips colour automatically.

---

## Recipe 3 — Tweak dark mode for your accent

Use case: a tenant whose dark-mode accent needs a brighter hue (the
default dark theme dims primary by ~14 lightness).

```css
[data-theme="dark"][data-accent="acme"] {
  --primary: oklch(72% 0.14 280);   /* brighter L for dark */
  --ring:    oklch(72% 0.14 280);
  --brand:   oklch(72% 0.14 280);
}
```

Combined selectors are how `@godxjp/ui` ships its own
dark-mode/accent interplay — search `[data-theme="dark"][data-accent=` in `styles/theme.css` for examples.

---

## Recipe 4 — Override density

Use case: a screen needs comfortable visual density even when the
user prefers compact.

Don't change density tokens globally — instead, scope `[data-density]`
to a sub-tree:

```html
<section data-density="comfortable">
  …
</section>
```

`--density-*` tokens swap inside that section only. The Tailwind
utilities `gap-card`, `p-section` etc. update via `var()` resolution.

If you want a service-wide density default, set the attribute on the
service's root element instead:

```html
<html data-density="comfortable">
```

---

## Recipe 5 — Add a service-local layout class

Use case: a screen-specific grid that has no `@godxjp/ui` equivalent.

```css
@import "@godxjp/ui/tailwind.css";

@layer components {
  .acme-dashboard-grid {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) 2fr;
    gap: var(--density-section);
    align-items: start;
  }
}
```

Rules:
- Wrap in `@layer components` so Tailwind utilities still override per-instance.
- Consume tokens via `var(--…)`. **Never hard-code colours, spacing, font sizes.**
- If the class becomes useful for ≥2 services, propose moving it to `@godxjp/ui` via a submodule PR (rule 12 Clause 3).

---

## Recipe 6 — Replace a single component layer

Use case: you want `@godxjp/ui`'s tokens + base + sonner, but you
ship your own sidebar style.

Skip the bundled `tailwind.css` and compose individually:

```css
@import "tailwindcss";
@import "@godxjp/ui/styles/theme.css";
@import "@godxjp/ui/styles/base.css";
/* skip @godxjp/ui/styles/shell.css — provide your own */
@import "@godxjp/ui/styles/sonner.css";

@theme inline {
  /* You also lose @godxjp/ui's @theme inline mapping if you skip
     tailwind.css. Copy the mapping you need OR import tailwind.css
     and override individual rules with !important — usually simpler. */
}

/* Your own .sidebar { … } */
```

This pattern is rare — most services should import `tailwind.css` and customize via tokens.

---

## What you must NOT do

| Anti-pattern | Why it breaks | Right way |
|---|---|---|
| `:root { --text-base: 16px; }` (override primitive) | Breaks Tailwind utility consistency across services | Use semantic tokens; bump primitive in submodule if a new scale step is needed |
| Hard-coded hex/oklch in a CSS class | Skips theme/tenant/density variants | `var(--token)` |
| Copying `.sb-nav-item` styles into your service CSS | Drifts from the shared chrome; design system breaks | Use `<Sidebar>` from `@godxjp/ui/components/shell` and pass `sections` |
| `@theme inline { … }` in service code | Tailwind sees two `@theme` registrations — undefined behaviour | The package owns `@theme` registration; you only override the `var()` values |
| `<style scoped>` in a `.tsx` component | Inconsistent specificity, no token theming | Tailwind utilities, or — for service-only layout — `@layer components { … }` in `theme.css` |

---

## Where each token lives

For the full inventory of tokens you can override, read the file:

- `libs/ts/godxjp-ui/src/styles/theme.css` — every token, with comments

Or for the architectural reasoning behind the layering:

- [03 — Token system](../specs/03-token-system.md)

For Tailwind v4 utility naming + which tokens drive which utility:

- The `@theme inline { … }` block in `libs/ts/godxjp-ui/src/tokens/tailwind.css`

## Related

- [02 — Consumer contract](../specs/02-consumer-contract.md) — `@godxjp/ui` is mandatory; `theme.css` is the ONE service-local CSS file.
- [03 — Token system](../specs/03-token-system.md) — three-tier architecture (primitives / semantic / variants).
- shadcn/ui Tailwind v4 docs — `https://ui.shadcn.com/docs/tailwind-v4`
