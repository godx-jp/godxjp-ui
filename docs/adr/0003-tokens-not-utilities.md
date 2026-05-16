---
diataxis: adr
library: "@godxjp/ui"
library_version: 3.0.0
adr: "0003"
title: CSS custom property tokens, not raw Tailwind utilities
status: accepted
date: 2026-01-14
updated: 2026-05-16
audience: [developer]
---

# ADR 0003 — CSS custom property tokens, not raw Tailwind utilities

## Status

Accepted.

---

## Context

Tailwind CSS provides two ways to express a color on an element:

1. **Raw utility** (`bg-blue-500`, `text-zinc-900`) — Tailwind encodes a
   specific value into a compiled CSS class. The class is not configurable at
   runtime; changing the color requires rebuilding the CSS and redeploying.

2. **Custom property token** (`bg-background`, `text-foreground`) — The
   Tailwind utility references a CSS custom property (`var(--background)`).
   The custom property can be redefined on any ancestor selector at runtime,
   with no rebuild.

GoDX is a multi-tenant platform. Operators can configure their own brand
colors via `[data-tenant="<slug>"]` CSS attribute selectors. Users can switch
between light and dark themes via `[data-theme]`. Density can change per user
via `[data-density]`. All three dimensions require runtime-configurable visual
values.

An additional constraint comes from the brand: the GoDX visual language is
defined in OKLCH color space. Tailwind v4 does not ship OKLCH values in its
default scale. `bg-blue-500` encodes an sRGB hex value — not an OKLCH value
and not brand-correct.

The team also considered whether to write all styles as Tailwind utilities
(inline class composition) or to extract repeated patterns to named CSS classes
(`@layer components { .btn { ... } }`).

---

## Decision

All visual values in `@godxjp/ui` come from CSS custom properties defined in
`src/tokens/tokens.css` (and extended by `tokens-ext.css` for the wa-iro
decorative palette). Rules:

1. **Every color, size, spacing, radius, shadow, and motion value is a
   token.** Tokens are named for semantic role, not for visual output:
   `--primary` not `--blue`, `--destructive` not `--red`.

2. **Token-named Tailwind utilities are allowed.** Utilities that reference
   tokens (`bg-background`, `text-foreground`, `border-border`) compose
   token values via the Tailwind CSS-variable integration and remain
   runtime-configurable.

3. **Raw value utilities are forbidden in component source.** `bg-blue-500`,
   `text-zinc-900`, `p-3` (when a spacing token exists), `rounded-lg` (when
   a radius token exists) are all review-rejected inside `src/components/`.

4. **Repeated class patterns are extracted to named CSS component classes.**
   `.btn`, `.btn-primary`, `.tab`, `.badge-success`, etc. live in
   `tokens.css` `@layer components {}` blocks. Primitives apply these class
   names; they do not inline-compose the constituent utilities.

5. **`[data-tenant]`, `[data-theme]`, and `[data-density]` attribute selectors
   are the only runtime override surfaces.** Operator brand customization,
   dark mode, and density scaling all work by redefining tokens under these
   selectors. No JavaScript-driven style mutations.

---

## Consequences

**Positive:**

- A single operator deployment configuration (`[data-tenant="acme"]` in a
  `theme.css` file) can rebrand every surface of the product without touching
  component source or rebuilding the SPA.
- Dark mode and density switching apply with zero JS style mutation — the
  `useTweaks` hook writes `data-theme` and `data-density` attributes to
  `<html>`; CSS does the rest.
- Component source is visually legible. `.btn.btn-primary` communicates intent
  without encoding a specific color.
- Design audits are mechanical: a linter can grep for raw value utilities and
  reject them in CI.
- OKLCH is preserved through the entire pipeline — token → CSS var →
  rendered color — with no value transcoding.

**Negative / constraints:**

- Engineers must learn the token naming convention before contributing a
  primitive. Raw hex or sRGB values in a PR are a review failure, not a
  suggestion.
- Token discovery is documentation-bound. The reference is in
  `docs/reference/tokens.md`; there is no IDE autocomplete for token names
  without a Tailwind VS Code extension configured.
- The `@apply` re-encoding anti-pattern (`@apply bg-blue-500` inside a token
  class) is explicitly forbidden by cardinal rule 15 and requires active
  enforcement at review.

---

## See also

- [Reference: Tokens](../reference/tokens.md) — full token catalogue.
- [Explanation: Brand bible](../explanation/brand-bible.md) — why OKLCH, why
  chroma ≤ 0.18.
- [How-to: Override tokens](../how-to/override-tokens.md) — per-tenant
  `[data-tenant]` customization.
- [How-to: Add a tenant theme](../how-to/add-tenant-theme.md) — step-by-step
  for operators.
