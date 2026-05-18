---
title: "Accessibility approach"
description: "Accessibility requirements and implementation patterns for @godxjp/ui primitives."
diataxis: explanation
library: "@godxjp/ui"
library_version: 3.0.0
last-updated: 2026-05-18
audience: [developer]
lang: en
status: published
---

# Accessibility approach

`@godxjp/ui` targets WCAG 2.1 Level AA compliance across all interactive
primitives. This document explains the cross-cutting strategies that make that
possible. Per-primitive requirements (role, label, keyboard contract) are in
the relevant reference page.

---

## Foundation: Radix UI primitives

Every interactive primitive — Button, Dialog, Select, Tabs, AlertDialog,
Switch, Checkbox, DropdownMenu, Popover, Sheet, Calendar — wraps the
corresponding Radix UI primitive (ADR-0001). Radix handles:

- ARIA role injection (`role="dialog"`, `role="listbox"`, `role="combobox"`, etc.)
- `aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled` state attributes
- Focus trap inside modals (Dialog, AlertDialog, Sheet)
- Keyboard navigation (Tab, Arrow keys, Home/End, Escape)
- Portal rendering (`Document.body` appended overlays) so z-index stacking never clips

The consequence: an engineer writing `<Dialog>` does not need to author any
ARIA manually. A regression in keyboard nav or roles is a Radix upstream
issue, not a local one — and Radix is axe-core tested on every release.

---

## Contrast

The token system enforces contrast by design rather than by convention.

Foreground/background pairings in `tokens.css`:

| Pair                                          | Minimum ratio | Coverage                        |
| --------------------------------------------- | ------------- | ------------------------------- |
| `--foreground` on `--background`              | 4.5:1         | Body text                       |
| `--foreground` on `--card`                    | 4.5:1         | Card body text                  |
| `--primary-foreground` on `--primary`         | 4.5:1         | Primary button label            |
| `--destructive-foreground` on `--destructive` | 4.5:1         | Danger button label             |
| `--muted-foreground` on `--background`        | 3:1           | Large-text / non-text secondary |
| `--muted-foreground` on `--card`              | 3:1           | Secondary on card               |

Token values are OKLCH. In OKLCH the lightness axis (`L`) maps
perceptually uniformly to human brightness perception, so the L-delta between
foreground and background tokens gives a reliable signal at design time. The
brand cap of chroma ≤ 0.18 keeps saturation below the level where color
alone reads as information — a pattern that would fail WCAG 1.4.1 (use of
color).

Dark mode tokens (`[data-theme="dark"]`) are authored independently rather
than inverted, to preserve the same contrast ratios in both themes. Inverting
light tokens mechanically produces contrast failures when the source token pair
is close to the 4.5:1 floor.

---

## Focus visibility

WCAG 2.4.11 (Level AA in WCAG 2.2) requires a visible focus indicator.
`@godxjp/ui` implements this through a single token:

```css
--ring: oklch(56% 0.15 240); /* primary blue ring */
--ring-offset: 2px;
```

Every interactive primitive that wraps a Radix root applies:

```css
&:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: var(--ring-offset);
}
```

The `:focus-visible` pseudo-class (not `:focus`) means the outline is
suppressed for pointer/touch interactions and shown only for keyboard
interactions, matching user expectations on both input modalities.

Custom outlines (e.g., `outline-none` Tailwind utility on an interactive
element) are rejected at review under the WCAG 2.4.7 / 2.4.11 contract.

---

## Keyboard navigation

Radix covers keyboard contracts for its composites. The full contracts are
defined in the WAI-ARIA Authoring Practices Guide 1.2 (APG) patterns; below
is a summary of primitives in `@godxjp/ui`:

| Primitive            | Key contract                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Button               | Enter / Space activates. Focus received by Tab.                                                    |
| Dialog / AlertDialog | Trap focus inside. Escape closes.                                                                  |
| Select               | Arrow keys move options. Home/End jump. Escape closes. Type-to-focus on character. `searchable` mode swaps the type-to-focus for a cmdk filter input. |
| Tabs                 | Arrow keys move between triggers. Tabs navigate in/out.                                            |
| Checkbox             | Space toggles. Indeterminate is navigable but does not toggle via Space alone (host code decides). |
| Switch               | Space / Enter toggles.                                                                             |
| DropdownMenu         | Arrow keys move items. Escape closes. Enter activates.                                             |
| Calendar             | Arrow keys move days. Page Up/Down move months. Home/End jump to first/last day.                   |

For screen-reader users, ARIA live regions are used by Toaster/sonner to
announce toast messages with `aria-live="polite"`. Destructive toasts use
`aria-live="assertive"`.

---

## Labelling

Unlabelled interactive elements fail WCAG 4.1.2. Patterns in `@godxjp/ui`:

- `Input` and `Textarea` accept any HTML attribute, including `id`, so the
  caller can pair with `<label htmlFor="...">`. The `Label` primitive wraps
  Radix Label and provides the visual and semantic label.
- `Dialog` accepts `title` and `description`, which Radix wires to
  `aria-labelledby` and `aria-describedby` on the dialog element. `title` is
  mandatory; `description` is strongly recommended.
- `AlertDialog` enforces both `AlertDialog` and `AlertDialog`
  because the pattern models a modal interruption that must be comprehensible
  to screen-reader users before the action buttons.
- `TimeInput` sets `aria-invalid="true"` when the entered value fails the
  `HH:mm` format validation.
- `Skeleton` sets `aria-hidden="true"` so it is invisible to assistive
  technology. The loaded state replaces the skeleton; if the loaded state
  carries semantic content (a heading, a list), that content supplies its own
  roles.
- `Breadcrumb` renders `<nav aria-label="Breadcrumb">` and marks the current
  page item with `aria-current="page"`.

---

## Reduced-motion

`@godxjp/ui` respects `prefers-reduced-motion: reduce` at the token level.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This rule is declared in `tailwind.css` and applies globally. Individual
primitives do not need per-component `prefers-reduced-motion` guards.
Skeleton's pulse animation also sets `animation: none` in the reduced-motion
media query explicitly.

---

## RTL and locale readiness

`@godxjp/ui` does not yet set `dir="rtl"` on the document. The locale system
(`useTweaks`, `initI18n`) sets `lang` on the `<html>` element, which allows
browser and AT to apply appropriate text rendering and pronunciation rules
for the four supported locales (ja, en, vi, fil). All four are LTR scripts;
RTL support is deferred to a future major version.

The `4px` spacing grid and `em`/`rem`-based font sizing scale correctly with
user browser font-size preference (WCAG 1.4.4 — resize text).

---

## Testing

Each primitive is tested against axe-core via Storybook's
`@storybook/addon-a11y` (cardinal rule 1 + 6). Every story doubles as the
a11y test surface; CI runs the addon on every story as a gate.

Engineers adding a new primitive must include a story covering every
variant + state on both `[data-theme="light"]` and `[data-theme="dark"]`.

---

## See also

- [Reference: Components](../reference/README.md) — per-component
  ARIA and keyboard contract.
- [Explanation: Design philosophy](./design-philosophy.md) — 渋み / 間 /
  簡素 and why functional elements carry no decoration.
- [ADR 0001: Radix as foundation](../adr/0001-radix-as-foundation.md).
