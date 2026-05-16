---
title: Theme axes
status: binding
authority: this-file
applies-to:
  - src/tokens/**
  - src/styles/**
  - .storybook/preview.tsx
  - src/hooks/useTweaks.ts
last-reviewed: 2026-05-16
---

# 01 — Theme axes

**Status:** Binding. Read before adding, renaming, or deleting any
`data-*` attribute on `<html>` that re-binds design tokens. Read
before adding a new "preference" surface to a user-tweakable panel
(theme toggle, density toggle, font-size toggle, …).

## What this rule is about

A **theme axis** is an orthogonal global preference dimension,
materialised as a `data-*` attribute on the `<html>` element, whose
value re-binds one or more design tokens via CSS custom properties.

Each axis answers one question and one only:

| Axis | Question |
|---|---|
| `data-theme`     | Light or dark color scheme? |
| `data-accent`    | Which brand-color theme? (blue/green/violet/amber/rose/slate) |
| `data-density`   | How tightly should controls pack? (compact/default/comfortable) |
| `data-font-size` | What root font-size? (sm 14px / base 16px / lg 18px / xl 20px) |

Axes are **orthogonal** — every combination is valid (dark + rose +
compact + lg is a legitimate preference), and the cascade composes
cleanly because each axis touches a disjoint subset of tokens (with
`data-theme` × `data-accent` being a deliberate intersection — see
"Light + dark variants for accent" below).

Axes are **global** — set once on `<html>`, every component inherits.
No per-component `theme=` prop, no React Context for theme, no
JavaScript run-time work to propagate. CSS custom properties cascade
naturally through the DOM.

Axes are **declarative** — the value of an axis is the only state.
You read `document.documentElement.dataset.theme` to query and
write `document.documentElement.dataset.theme = "dark"` to set.
The visual change is automatic on the next paint frame.

## Why "theme axes" and not "theme"

In casual prose people say "the theme" — but our codebase has FOUR
orthogonal theme dimensions, not one. Saying "switch the theme"
without naming the axis is ambiguous. The umbrella term **theme
axes** (plural) makes the multi-dimensionality explicit. The
singular instances are then specific: **color scheme**, **color
theme**, **density**, **font size**.

International-standard references for the concept:

- **W3C Design Tokens Community Group** — calls these "modes" or
  "theme dimensions". Each token may have multiple values, selected
  by mode. <https://design-tokens.github.io/community-group/format/>
- **Tailwind CSS v4 `@theme`** — multi-value via `@variant` +
  `data-*` selectors. <https://tailwindcss.com/docs/theme>
- **shadcn/ui** — established the `[data-theme="dark"]` convention
  we extend here. <https://ui.shadcn.com/docs/dark-mode>
- **Material Design 3** — "color scheme" (light/dark) × "color
  scheme variant" (tonal palette) × "typography scale" × "shape
  scale". Four orthogonal axes, mirrors our four.
  <https://m3.material.io/styles/color/system>
- **IBM Carbon** — "themes" with `[data-carbon-theme="..."]`.

The `@godxjp/ui` framework adopts the W3C DTCG vocabulary and
combines it with the shadcn `data-*` switching mechanism.

## The four canonical axes

### 1 — `data-theme` — color scheme (light / dark)

`light` (default) or `dark`. Inverts foreground/background and
re-tints every surface. Defined in `src/styles/theme.css`
under `:root { ... }` (light) and `[data-theme="dark"] { ... }`.

CSS shape:

```css
:root             { --background: oklch(99% .002 60);  --foreground: oklch(20% .006 60); /* … */ }
[data-theme="dark"] { --background: oklch(18% .005 60); --foreground: oklch(95% .005 60); /* … */ }
```

Shadcn-compatible: `[data-theme="dark"]` is the standard selector.

### 2 — `data-accent` — color theme (brand hue)

`blue` (default) | `green` | `violet` | `amber` | `rose` | `slate`.
Re-binds the entire brand color chain: `--primary`,
`--primary-foreground`, `--ring`, `--brand`, `--sidebar-active-bg`,
`--sidebar-active-fg`. Defined in
`src/tokens/tailwind.css` in the **default layer**
(NOT `@layer base`) so it wins the cascade over `:root { --primary }`.

CSS shape:

```css
[data-accent="rose"] {
  --primary:            oklch(58% .12 18);
  --primary-foreground: oklch(98% .01 18);
  --ring:               oklch(64% .1 18);
  --brand:              oklch(58% .12 18);
  --sidebar-active-bg:  oklch(95% .02 18);
  --sidebar-active-fg:  oklch(58% .12 18);
}

[data-theme="dark"][data-accent="rose"] {
  /* lifted lightness for dark surfaces */
  --primary: oklch(72% .13 18); /* … */
}
```

**Why "color theme" not "accent"** in the user-facing label: the
UI no longer treats this as a single-token swatch — it propagates
through brand stripes, sidebar active state, focus ring, primary
surface. It IS a theme variant. The DOM attribute keeps the short
name `data-accent` for back-compat; toolbar / settings labels say
"Color theme" or "Brand color".

**No service-specific accent rules in `@godxjp/ui`.** Per cardinal
rule #19, `[data-tenant="kintai|tempo|betoya|godx"]` blocks do not
live here. Downstream apps register their own `[data-accent]`
palettes if they need additional ones; the framework ships six
neutral base palettes.

### 3 — `data-density` — spacing density

`compact` | `default` | `comfortable`. Re-binds `--density-element`
(control height), `--density-card`, `--density-dialog`,
`--density-page`, `--density-section`, `--header-height`,
`--density-table-head`. Defined in
`src/styles/theme.css`.

CSS shape:

```css
:root                       { --density-element: 2rem; --density-card: 1rem; /* … */ }
[data-density="compact"]    { --density-element: 1.75rem; --density-card: 0.75rem; /* … */ }
[data-density="comfortable"]{ --density-element: 2.75rem; --density-card: 1.5rem; /* … */ }
```

Components reference `var(--density-element)` for their height,
`var(--density-card)` for card inner padding, etc. The `@theme inline`
block in `tailwind.css` re-exports these as Tailwind utility classes
(`p-page`, `gap-section`).

**`--touch-target-min: 44px`** (Digital Agency hard rule) is set in
`:root` and is NOT overridden by `data-density`. Touch-target
minimum is a WCAG floor, not a preference.

### 4 — `data-font-size` — root font-size

`sm` (87.5% = 14px rem) | `base` (100% = 16px rem, default) | `lg`
(112.5% = 18px rem) | `xl` (125% = 20px rem). Setting `font-size`
on `html` (the `:root` element) rescales **every rem-based token in
the system** — spacing, density, type scale, radii — so this is the
broadest of the axes. Defined in
`src/tokens/tailwind.css` in the **default layer**
on `html[data-font-size="..."]` (using `html` instead of `:root` so
selector specificity beats user-agent `html { font-size: 100% }`).

CSS shape:

```css
html[data-font-size="sm"]   { font-size: 87.5%; }
html[data-font-size="base"] { font-size: 100%; }
html[data-font-size="lg"]   { font-size: 112.5%; }
html[data-font-size="xl"]   { font-size: 125%; }
```

**Tokens that DON'T rescale**: hardcoded `px` values
(`--touch-target-min: 44px`, `--density-spacing: 4px`, raw `1px`
borders). This is intentional — touch targets and hairline borders
should NOT scale with user font preference.

## How to add a new axis

**Default: don't.** Four is plenty; resist adding axes for one-off
preferences. Per cardinal rule #12 a new concept needs a clear
binding shape; for theme axes that bar is high because every
component implicitly inherits.

Acceptable reasons to add an axis:

- The preference is genuinely **global** (not a per-screen or
  per-component setting).
- The preference is **orthogonal** to the existing four (does not
  shadow `--primary`, `--density-*`, `--background`, or root
  `font-size`).
- The preference has **≥3 valid values** (binary on/off is usually
  better as a single boolean class or a media-query feature).
- The preference is **stable** — likely to live for years, not
  weeks.

If you decide to add one, follow the recipe:

1. **Pick the DOM attribute name.** Use `data-<short-kebab>` (no
   `godx-` prefix). The name describes the question, not the value
   (`data-motion`, not `data-reduced-motion`).
2. **Decide on the cascade layer.**
   - If the axis sets values on tokens that are ALSO set in `:root`
     of `theme.css`, put the axis rules in the **default layer**
     (not `@layer base`) so they win source-order at equal
     specificity, OR raise specificity with `html[data-…]`.
   - If the axis only sets new tokens that no `:root` rule touches,
     `@layer base` is fine.
3. **Document the token surface.** List every token the axis
   re-binds, in this file. Audit that the listed tokens are
   referenced by primitives, not just declared in vain.
4. **Wire into the user surface.** Add to the Storybook
   `.storybook/preview.tsx` toolbar globals AND to the
   `src/hooks/useTweaks.ts` Tweaks panel so dev
   tooling and downstream apps both see it.
5. **Light + dark variants if applicable.** If the axis interacts
   with `[data-theme]`, ship both light and dark variant rules.
6. **Verify with a Playwright probe.** Confirm `getComputedStyle`
   actually shows the re-bound values for every axis value, in
   every relevant theme combo (e.g. `accent × theme = 12` combos).
   The probe at `scripts/probe-theme-axes.cjs`
   is the template — add your axis to its sweep.

## How to consume axes in app code

**Don't read them from JavaScript** — let CSS do the work. Bad:

```tsx
// BAD — re-implements cascade in JS
const accent = document.documentElement.dataset.accent;
const bg = accent === "rose" ? "oklch(58% .12 18)" : "var(--primary)";
```

Good:

```tsx
// GOOD — token does the work; component is theme-axis agnostic
<button style={{ background: "var(--primary)" }}>…</button>
```

The only legitimate JS read of an axis is for **persisting the
user preference** (write to `localStorage`, read it back on next
load to restore the axis). The `useTweaks` hook does this for the
canonical four axes; reuse it instead of rolling your own.

## Storage layer

User preferences for the four canonical axes persist in
`localStorage` under these keys (set + read by `useTweaks`):

| Axis | Storage key |
|---|---|
| `data-theme`     | `godx:theme`     |
| `data-accent`    | `godx:accent`    |
| `data-density`   | `godx:density`   |
| `data-font-size` | `godx:font-size` |

System preferences (`prefers-color-scheme`, `prefers-reduced-motion`,
`prefers-contrast`) are detected with media queries and respected
as the **initial** value when no localStorage entry exists. The
user's explicit choice always wins after that.

## What is NOT a theme axis

Several `data-*` attributes in the codebase look superficially
similar but are NOT theme axes — they are per-component state. Keep
the distinction sharp:

| Pattern | Kind | Lives on | Set by |
|---|---|---|---|
| `data-theme`, `data-accent`, `data-density`, `data-font-size` | **theme axis** | `<html>` | User preference (Tweaks / settings) |
| `data-state`, `data-open`, `data-active`, `data-disabled`, `data-focused`, `data-selected` | **component state** | per-component | Radix / aria |
| `data-side`, `data-align`, `data-placement` | **positioning** | per-component | Radix |
| `data-variant`, `data-size`, `data-padding` | **prop reflection** | per-component | Component author |
| `data-today`, `data-weekend`, `data-past`, `data-collapsed` | **local UI state** | per-component | Component logic |

If a `data-*` attribute is set on anything other than `<html>` AND
is set by anything other than a user preference flow, it is NOT a
theme axis. Don't extend this rule to cover it.

## Removed: `data-tenant`

`[data-tenant="godx|kintai|tempo|betoya"]` was previously a fifth
axis but is now removed from `@godxjp/ui` for two reasons:

1. **Cardinal rule #19** — no service-specific names live in the
   framework. `kintai`, `tempo`, `betoya`, `godx` are specific
   product slugs, not generic preferences.
2. **Conceptual overlap with `data-accent`** — both shifted
   `--primary` / `--ring` / `--brand`. Two axes touching the same
   tokens means cascade conflicts; the user had no clear mental
   model for which one "won". Collapsed into `data-accent` as the
   single brand-color axis.

Downstream apps that need per-tenant brand still set their own
attribute (e.g. `data-tenant` on `<html>` and an app-local CSS
block) — but `@godxjp/ui` does not ship rules for it. Per cardinal
rule #15 the visual layer (color, type, density, dark mode,
locale, sidebar/topbar shape, buttons/badges/kanban/KPI) is one
shared source; per-tenant deviation flows through
`[data-accent="<palette>"]`, not through a parallel axis.

## When in doubt

Ask: "is this a user-toggleable, orthogonal, global preference
that touches design tokens?" If yes — it's a theme axis. If no —
it's component state or a prop. Don't bend the meaning.

For per-tenant deployment branding, register a custom
`[data-accent="<your-palette>"]` block in the consuming app's
`theme.css`. Don't add `[data-tenant]` rules back; the
overlap was the bug.
